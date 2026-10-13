import crypto from 'node:crypto';
import { SESSION_COOKIE_NAME, normalizePhone } from './auth.js';
import { getDbPool, hasDatabaseConfig, query } from './db.js';
import { ensureDiscountCodeStackColumn } from './discount-codes.js';

/**
 * Vòng quay may mắn. CRM quản lý ở /srx/lucky-wheel:
 *   - website_settings (khóa lucky_wheel): bật/tắt, tiêu đề, luật giới thiệu.
 *   - lucky_wheel_prizes: phần thưởng và trọng số trúng (trọng số không bao giờ ra khỏi server).
 *
 * Điều kiện quay: đăng nhập (mỗi tài khoản được 1 lượt). Lượt quay = tổng
 * lucky_wheel_spin_grants - số dòng lucky_wheel_spins; việc cộng lượt (tài khoản, giới thiệu)
 * được làm "lười" mỗi khi khách mở vòng quay nên không cần móc vào từng luồng tạo tài khoản
 * (email, Google, Zalo QR, Mini App).
 */

const SETTING_KEY = 'lucky_wheel';

export const WHEEL_REFERRAL_COOKIE_NAME = 'srx_wheel_ref';
export const WHEEL_REFERRAL_PARAM = 'wheel_ref';
export const WHEEL_REFERRAL_COOKIE_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

const REFERRAL_CODE_LENGTH = 8;
// Bỏ các ký tự dễ nhầm (0/O, 1/I) vì khách có thể phải gõ lại mã.
const REFERRAL_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const PRIZE_TYPES = new Set(['voucher', 'gift', 'no_prize']);
const RECENT_WINS_LIMIT = 5;
const CRM_MEDIA_ORIGIN = (process.env.SRX_CRM_MEDIA_ORIGIN?.trim() || 'https://crm.srx.vn').replace(/\/+$/, '');

const DEFAULT_SETTINGS = {
  enabled: false,
  title: 'Vòng quay may mắn',
  description: '',
  referralEnabled: true,
  referralSpins: 1,
  referralMaxSpins: 0,
  referralRequiresActivation: false,
  terms: '',
  zbsEnabled: true,
};

export class LuckyWheelError extends Error {
  constructor(code, message, status = 400) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

function clampInteger(value, min, max, fallback) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, Math.round(numericValue)));
}

function readText(value, fallback = '') {
  return typeof value === 'string' ? value.trim() : fallback;
}

function readJsonValue(rawValue) {
  // MySQL trả JSON dạng object, MariaDB trả chuỗi.
  if (typeof rawValue !== 'string') {
    return rawValue && typeof rawValue === 'object' ? rawValue : {};
  }

  try {
    const parsedValue = JSON.parse(rawValue);
    return parsedValue && typeof parsedValue === 'object' ? parsedValue : {};
  } catch {
    return {};
  }
}

function normalizeSettings(rawValue) {
  const value = readJsonValue(rawValue);

  return {
    enabled: value.enabled === true,
    title: readText(value.title) || DEFAULT_SETTINGS.title,
    description: readText(value.description),
    referralEnabled: value.referral_enabled !== false,
    referralSpins: clampInteger(value.referral_spins, 1, 10, DEFAULT_SETTINGS.referralSpins),
    referralMaxSpins: clampInteger(value.referral_max_spins, 0, 1000, DEFAULT_SETTINGS.referralMaxSpins),
    referralRequiresActivation: value.referral_requires_activation === true,
    terms: readText(value.terms),
    // Gửi mã voucher trúng thưởng qua tin ZBS (crm-eac gửi); mặc định bật.
    zbsEnabled: value.zbs_enabled !== false,
  };
}

function isMissingTable(error) {
  return error?.code === 'ER_NO_SUCH_TABLE';
}

export function normalizeLuckyWheelImageUrl(value = '') {
  const normalizedValue = String(value ?? '').trim();

  if (!normalizedValue || /^https?:\/\//i.test(normalizedValue)) {
    return normalizedValue;
  }

  const imagePath = normalizedValue.startsWith('/') ? normalizedValue : `/${normalizedValue}`;

  return imagePath.startsWith('/upload/') ? `${CRM_MEDIA_ORIGIN}${imagePath}` : imagePath;
}

export async function getLuckyWheelSettings() {
  if (!hasDatabaseConfig()) {
    return DEFAULT_SETTINGS;
  }

  try {
    const rows = await query('SELECT setting_value FROM website_settings WHERE setting_key = ? LIMIT 1', [SETTING_KEY]);

    return rows[0] ? normalizeSettings(rows[0].setting_value) : DEFAULT_SETTINGS;
  } catch (error) {
    // CRM chưa lưu lần nào thì bảng có thể chưa tồn tại: coi như đang tắt.
    if (!isMissingTable(error)) {
      console.error('Failed to load lucky wheel settings:', error);
    }

    return DEFAULT_SETTINGS;
  }
}

/** Phần thưởng hiển thị trên vòng quay. Không trả trọng số, tồn kho hay mã thưởng. */
export async function getPublicPrizes() {
  try {
    const rows = await query(
      `SELECT id, name, description, image_url, prize_type
        FROM lucky_wheel_prizes
        WHERE is_active = 1
        ORDER BY sort_order ASC, id ASC`,
    );

    return rows
      .map((row) => ({
        id: Number(row.id),
        name: readText(row.name),
        description: readText(row.description),
        imageUrl: normalizeLuckyWheelImageUrl(row.image_url),
        type: PRIZE_TYPES.has(row.prize_type) ? row.prize_type : 'gift',
      }))
      .filter((prize) => prize.imageUrl);
  } catch (error) {
    if (!isMissingTable(error)) {
      console.error('Failed to load lucky wheel prizes:', error);
    }

    return [];
  }
}

let zaloIdColumnPromise;

/** Cột users.zalo_id có từ 10_zalo_qr_login.sql; chỉ dùng khi CRM bắt bạn được mời phải dùng Zalo. */
function hasZaloIdColumn() {
  zaloIdColumnPromise ??= query(`SHOW COLUMNS FROM users LIKE 'zalo_id'`)
    .then((rows) => rows.length > 0)
    .catch((error) => {
      zaloIdColumnPromise = undefined;
      console.error('Failed to inspect users.zalo_id:', error);
      return false;
    });

  return zaloIdColumnPromise;
}

export async function getWheelUserFromRequest(request) {
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return null;
  }

  const rows = await query(
    `SELECT u.id, u.phone
      FROM user_sessions s
      INNER JOIN users u ON u.id = s.user_id
      WHERE s.session_token = ?
        AND s.expires_at > NOW()
        AND u.deleted_at IS NULL
        AND u.status NOT IN ('inactive', 'banned')
      LIMIT 1`,
    [sessionToken],
  );

  if (!rows.length) {
    return null;
  }

  const phone = normalizePhone(rows[0].phone);

  // Chỉ giữ số di động Việt Nam hợp lệ: số này nhận tin ZBS kèm mã voucher.
  return { id: Number(rows[0].id), phone: /^0[35789]\d{8}$/u.test(phone) ? phone : '' };
}

async function readSpinsLeft(runQuery, userId) {
  const result = await runQuery(
    `SELECT
        (SELECT COALESCE(SUM(spins), 0) FROM lucky_wheel_spin_grants WHERE user_id = ?)
        - (SELECT COUNT(*) FROM lucky_wheel_spins WHERE user_id = ?) AS spins_left`,
    [userId, userId],
  );
  // query() trả rows, connection.query() trả [rows, fields].
  const rows = Array.isArray(result[0]) ? result[0] : result;

  return Math.max(0, Number(rows[0]?.spins_left ?? 0));
}

/** Mỗi tài khoản đăng nhập được đúng 1 lượt (grant_key signup:<id> chặn cộng lần hai). */
async function grantSignupSpin(user) {
  await query(
    `INSERT IGNORE INTO lucky_wheel_spin_grants (user_id, source, grant_key, spins)
      VALUES (?, 'signup', ?, 1)`,
    [user.id, `signup:${user.id}`],
  );
}

/**
 * Ghép tài khoản đang đăng nhập với lượt mở link giới thiệu trên cùng trình duyệt. Chỉ tính
 * khi tài khoản được tạo SAU lượt mở link, để khách cũ bấm link của bạn bè không bị tính
 * là khách mới. referred_user_id UNIQUE nên mỗi tài khoản chỉ ghép được một lần.
 */
async function attributeReferral(user, visitorToken) {
  if (!/^[a-f0-9]{48}$/u.test(String(visitorToken ?? ''))) {
    return;
  }

  try {
    await query(
      `UPDATE lucky_wheel_referrals r
        INNER JOIN users u ON u.id = ?
        SET r.referred_user_id = u.id, r.status = 'signed_up', r.signed_up_at = NOW()
        WHERE r.visitor_token = ?
          AND r.status = 'visited'
          AND r.referrer_user_id <> u.id
          AND u.created_at >= r.visited_at`,
      [user.id, visitorToken],
    );
  } catch (error) {
    if (error?.code !== 'ER_DUP_ENTRY') {
      throw error;
    }
  }
}

/**
 * Cộng lượt cho người giới thiệu khi người được giới thiệu đủ điều kiện. Chạy cho cả hai
 * phía (ai mở vòng quay trước cũng được), grant_key đảm bảo không cộng trùng.
 */
async function creditReferrals(userId, settings) {
  if (!settings.referralEnabled) {
    return;
  }

  let activationFilter = '';

  if (settings.referralRequiresActivation) {
    activationFilter = (await hasZaloIdColumn()) ? 'AND u.zalo_id IS NOT NULL' : 'AND 0 = 1';
  }

  const rows = await query(
    `SELECT r.id, r.referrer_user_id, r.referred_user_id
      FROM lucky_wheel_referrals r
      INNER JOIN users u ON u.id = r.referred_user_id AND u.deleted_at IS NULL
      WHERE r.status = 'signed_up'
        AND (r.referrer_user_id = ? OR r.referred_user_id = ?)
        ${activationFilter}`,
    [userId, userId],
  );

  for (const row of rows) {
    let spins = settings.referralSpins;

    if (settings.referralMaxSpins > 0) {
      const earnedRows = await query(
        `SELECT COALESCE(SUM(spins), 0) AS total
          FROM lucky_wheel_spin_grants
          WHERE user_id = ? AND source = 'referral'`,
        [row.referrer_user_id],
      );
      const remaining = settings.referralMaxSpins - Number(earnedRows[0]?.total ?? 0);

      // Đã chạm trần: để nguyên signed_up, CRM nâng trần thì lần sau sẽ được cộng tiếp.
      if (remaining <= 0) {
        continue;
      }

      spins = Math.min(spins, remaining);
    }

    await query(
      `INSERT IGNORE INTO lucky_wheel_spin_grants (user_id, source, grant_key, spins)
        VALUES (?, 'referral', ?, ?)`,
      [row.referrer_user_id, `referral:${row.referred_user_id}`, spins],
    );
    await query(
      `UPDATE lucky_wheel_referrals SET status = 'credited', credited_at = NOW() WHERE id = ? AND status = 'signed_up'`,
      [row.id],
    );
  }
}

function createReferralCode() {
  return Array.from(
    { length: REFERRAL_CODE_LENGTH },
    () => REFERRAL_CODE_ALPHABET[crypto.randomInt(REFERRAL_CODE_ALPHABET.length)],
  ).join('');
}

export function normalizeReferralCode(value) {
  const code = String(value ?? '')
    .trim()
    .toUpperCase();

  return /^[A-Z0-9]{4,16}$/u.test(code) ? code : '';
}

async function ensureReferralCode(userId) {
  const existing = await query('SELECT code FROM lucky_wheel_referral_codes WHERE user_id = ? LIMIT 1', [userId]);

  if (existing.length) {
    return existing[0].code;
  }

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = createReferralCode();

    try {
      await query('INSERT INTO lucky_wheel_referral_codes (user_id, code) VALUES (?, ?)', [userId, code]);
      return code;
    } catch (error) {
      if (error?.code !== 'ER_DUP_ENTRY') {
        throw error;
      }

      // Trùng user_id (hai request song song) thì dùng mã vừa được tạo; trùng mã thì thử mã khác.
      const raced = await query('SELECT code FROM lucky_wheel_referral_codes WHERE user_id = ? LIMIT 1', [userId]);

      if (raced.length) {
        return raced[0].code;
      }
    }
  }

  throw new Error('Không thể tạo mã giới thiệu.');
}

async function getReferralStats(userId) {
  const rows = await query(
    `SELECT status, COUNT(*) AS total
      FROM lucky_wheel_referrals
      WHERE referrer_user_id = ? AND status IN ('signed_up', 'credited')
      GROUP BY status`,
    [userId],
  );
  const totals = Object.fromEntries(rows.map((row) => [row.status, Number(row.total)]));

  return {
    signedUp: (totals.signed_up ?? 0) + (totals.credited ?? 0),
    credited: totals.credited ?? 0,
  };
}

// Cột thêm cho voucher tự sinh + gửi ZBS. Bảng do bản trước tạo thì thiếu: tự thêm (CRM cũng
// làm việc này) để website deploy trước CRM vẫn chạy.
const VOUCHER_COLUMNS = [
  ['lucky_wheel_prizes', 'voucher_config', 'JSON NULL'],
  ['lucky_wheel_spins', 'discount_code_id', 'BIGINT UNSIGNED NULL'],
  ['lucky_wheel_spins', 'zbs_status', "ENUM('none', 'pending', 'sending', 'sent', 'failed') NOT NULL DEFAULT 'none'"],
  ['lucky_wheel_spins', 'zbs_msg_id', 'VARCHAR(100) NULL'],
  ['lucky_wheel_spins', 'zbs_error', 'VARCHAR(500) NULL'],
  ['lucky_wheel_spins', 'zbs_sent_at', 'DATETIME NULL'],
];

let voucherColumnsPromise;

function ensureVoucherColumns() {
  voucherColumnsPromise ??= (async () => {
    for (const [table, column, definition] of VOUCHER_COLUMNS) {
      const rows = await query(`SHOW COLUMNS FROM ${table} LIKE ?`, [column]);

      if (!rows.length) {
        await query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
      }
    }
  })().catch((error) => {
    voucherColumnsPromise = undefined;
    throw error;
  });

  return voucherColumnsPromise;
}

function mapWin(row) {
  return {
    id: Number(row.id),
    prizeId: row.prize_id == null ? null : Number(row.prize_id),
    name: row.prize_name,
    type: row.prize_type,
    rewardCode: readText(row.reward_code),
    claimInstructions: readText(row.claim_instructions),
    voucherEndsOn: readText(row.voucher_ends_on),
    status: row.status,
    createdAt: row.created_at,
  };
}

async function getRecentWins(userId) {
  await ensureVoucherColumns();

  const rows = await query(
    `SELECT s.id, s.prize_id, s.prize_name, s.prize_type, s.reward_code, s.claim_instructions, s.status, s.created_at,
            DATE_FORMAT(dc.ends_at, '${SQL_DATE_FORMAT}') AS voucher_ends_on
      FROM lucky_wheel_spins s
      LEFT JOIN discount_codes dc ON dc.id = s.discount_code_id
      WHERE s.user_id = ? AND s.prize_type <> 'no_prize'
      ORDER BY s.id DESC
      LIMIT ?`,
    [userId, RECENT_WINS_LIMIT],
  );

  return rows.map(mapWin);
}

/**
 * Trạng thái vòng quay của khách đang đăng nhập; đồng thời cộng các lượt đang chờ
 * (lượt của tài khoản, giới thiệu) và ghép link giới thiệu nếu trình duyệt có cookie.
 */
export async function getLuckyWheelUserState(user, { settings, origin, referralVisitorToken }) {
  if (referralVisitorToken && settings.referralEnabled) {
    await attributeReferral(user, referralVisitorToken);
  }

  await grantSignupSpin(user);
  await creditReferrals(user.id, settings);

  const [spinsLeft, recentWins, referral] = await Promise.all([
    readSpinsLeft(query, user.id),
    getRecentWins(user.id),
    settings.referralEnabled
      ? Promise.all([ensureReferralCode(user.id), getReferralStats(user.id)]).then(([code, stats]) => ({
          code,
          link: `${origin}/?${WHEEL_REFERRAL_PARAM}=${code}`,
          ...stats,
        }))
      : null,
  ]);

  return { spinsLeft, recentWins, referral };
}

/**
 * Ghi nhận một lượt mở link giới thiệu. Trả về token để lưu vào cookie, hoặc null nếu mã
 * không tồn tại. Khách đã đăng nhập (đã có tài khoản) thì không tính.
 */
export async function recordReferralVisit({ code, existingToken }) {
  const normalizedCode = normalizeReferralCode(code);

  if (!normalizedCode) {
    return null;
  }

  const owners = await query('SELECT user_id FROM lucky_wheel_referral_codes WHERE code = ? LIMIT 1', [normalizedCode]);

  if (!owners.length) {
    return null;
  }

  const referrerUserId = Number(owners[0].user_id);

  // Mở lại cùng link thì giữ lượt mở cũ, để mốc "tạo tài khoản sau lượt mở" không bị đẩy lùi.
  if (/^[a-f0-9]{48}$/u.test(String(existingToken ?? ''))) {
    const existing = await query(
      `SELECT referrer_user_id FROM lucky_wheel_referrals WHERE visitor_token = ? AND status = 'visited' LIMIT 1`,
      [existingToken],
    );

    if (existing.length && Number(existing[0].referrer_user_id) === referrerUserId) {
      return existingToken;
    }
  }

  const visitorToken = crypto.randomBytes(24).toString('hex');

  await query('INSERT INTO lucky_wheel_referrals (visitor_token, referrer_user_id) VALUES (?, ?)', [
    visitorToken,
    referrerUserId,
  ]);

  return visitorToken;
}

const VOUCHER_CODE_ATTEMPTS = 10;
// Ngày giờ dạng Zalo dùng cho tham số kiểu date của mẫu ZBS; lấy thẳng từ SQL để không lệch múi giờ.
const SQL_DATE_FORMAT = '%d/%m/%Y';

/** Cấu hình voucher của phần thưởng (CRM nhập); null nếu thiếu hoặc không hợp lệ. */
function readVoucherConfig(rawValue) {
  const value = readJsonValue(rawValue);
  const discountType = ['percentage', 'fixed_amount'].includes(value.discount_type) ? value.discount_type : '';
  const discountValue = Number(value.discount_value);

  if (!discountType || !(discountValue > 0) || (discountType === 'percentage' && discountValue > 100)) {
    return null;
  }

  const maxDiscountAmount = Number(value.max_discount_amount);
  const minOrderAmount = Number(value.min_order_amount);

  return {
    discountType,
    discountValue,
    maxDiscountAmount: discountType === 'percentage' && maxDiscountAmount > 0 ? maxDiscountAmount : null,
    minOrderAmount: minOrderAmount > 0 ? minOrderAmount : null,
    // Mã riêng sinh ra được dùng cùng 1 mã chung trong cùng đơn hàng (CRM bật/tắt theo phần thưởng).
    stackWithPublic: value.stack_with_public === true,
  };
}

function formatVnd(amount) {
  return `${Math.round(amount).toLocaleString('vi-VN')}đ`;
}

function describeVoucher(config) {
  const amount = config.discountType === 'percentage' ? `${config.discountValue}%` : formatVnd(config.discountValue);
  const cap = config.maxDiscountAmount ? `, tối đa ${formatVnd(config.maxDiscountAmount)}` : '';
  const condition = config.minOrderAmount ? `đơn hàng từ ${formatVnd(config.minOrderAmount)}` : 'mọi đơn hàng';
  const stacking = config.stackWithPublic ? ', dùng chung được với 1 mã chung' : '';

  return `Giảm ${amount}${cap} cho ${condition}${stacking}`;
}

/**
 * Sinh mã giảm giá 8 chữ số dùng 1 lần cho lượt trúng voucher, hiệu lực từ lúc trúng tới
 * 23:59:59 của ngày sau 3 tháng. class = 'private' để mã không hiện trong danh sách mã công
 * khai. uq_discount_codes_code bảo đảm không trùng mã có sẵn: trùng thì bốc số khác.
 */
async function createSpinVoucher(connection, { user, prize, config }) {
  const description = describeVoucher(config);

  for (let attempt = 0; attempt < VOUCHER_CODE_ATTEMPTS; attempt += 1) {
    const code = String(crypto.randomInt(10_000_000, 100_000_000));

    try {
      const [result] = await connection.query(
        `INSERT INTO discount_codes (
            code, name, description, discount_type, discount_value, max_discount_amount, min_order_amount,
            total_usage_limit, per_user_limit, scope_type, class, stack_with_public, starts_at, ends_at, is_active
          ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, 1, 'all_orders', 'private', ?, NOW(),
            TIMESTAMP(DATE(NOW() + INTERVAL 3 MONTH), '23:59:59'), 1)`,
        [
          code,
          `Vòng quay may mắn - ${prize.name}`.slice(0, 150),
          `${description}. Mã trúng thưởng của khách #${user.id}.`,
          config.discountType,
          config.discountValue,
          config.maxDiscountAmount,
          config.minOrderAmount,
          config.stackWithPublic ? 1 : 0,
        ],
      );
      const [rows] = await connection.query(
        `SELECT DATE_FORMAT(ends_at, '${SQL_DATE_FORMAT}') AS ends_on FROM discount_codes WHERE id = ?`,
        [result.insertId],
      );

      return { id: Number(result.insertId), code, description, endsOn: rows[0]?.ends_on ?? '' };
    } catch (error) {
      if (error?.code !== 'ER_DUP_ENTRY') {
        throw error;
      }
    }
  }

  throw new Error('Không tạo được mã voucher không trùng sau nhiều lần thử.');
}

function pickWeightedPrize(prizes) {
  const totalWeight = prizes.reduce((sum, prize) => sum + Number(prize.weight), 0);
  let ticket = crypto.randomInt(totalWeight);

  for (const prize of prizes) {
    ticket -= Number(prize.weight);

    if (ticket < 0) {
      return prize;
    }
  }

  return prizes[prizes.length - 1];
}

/**
 * Quay một lượt. Chạy trong transaction: khóa dòng users để hai lần bấm cùng lúc không tiêu
 * cùng một lượt, khóa các phần thưởng để không phát quá số lượng.
 */
export async function spinLuckyWheel(user, { ipAddress, settings }) {
  // ALTER TABLE tự commit nên phải xong trước khi mở transaction.
  await Promise.all([ensureVoucherColumns(), ensureDiscountCodeStackColumn()]);

  const connection = await getDbPool().getConnection();

  try {
    await connection.beginTransaction();
    await connection.query('SELECT id FROM users WHERE id = ? FOR UPDATE', [user.id]);

    const spinsLeft = await readSpinsLeft((sql, params) => connection.query(sql, params), user.id);

    if (spinsLeft <= 0) {
      throw new LuckyWheelError('no_spins', 'Bạn đã hết lượt quay.', 409);
    }

    const [prizes] = await connection.query(
      `SELECT id, name, description, image_url, prize_type, reward_code, claim_instructions, voucher_config, weight
        FROM lucky_wheel_prizes
        WHERE is_active = 1
          AND weight > 0
          AND (stock_total IS NULL OR stock_used < stock_total)
        FOR UPDATE`,
    );

    if (!prizes.length) {
      throw new LuckyWheelError('no_prizes', 'Vòng quay đang tạm hết phần thưởng. Vui lòng quay lại sau.', 409);
    }

    const prize = pickWeightedPrize(prizes);
    const prizeType = PRIZE_TYPES.has(prize.prize_type) ? prize.prize_type : 'gift';

    await connection.query('UPDATE lucky_wheel_prizes SET stock_used = stock_used + 1 WHERE id = ?', [prize.id]);

    const voucherConfig = prizeType === 'voucher' ? readVoucherConfig(prize.voucher_config) : null;
    const voucher = voucherConfig ? await createSpinVoucher(connection, { user, prize, config: voucherConfig }) : null;
    let rewardCode = readText(prize.reward_code);
    let claimInstructions = readText(prize.claim_instructions);
    let zbsStatus = 'none';
    let zbsError = null;

    if (voucher) {
      rewardCode = voucher.code;
      // Hạn dùng hiển thị riêng (lấy từ discount_codes) nên không lặp lại ở đây.
      claimInstructions ||= 'Nhập mã ở bước thanh toán trên website. Mỗi mã chỉ dùng được 1 lần.';

      // Mã được gửi kèm tin ZBS tới số điện thoại của tài khoản (crm-eac gửi sau khi transaction xong).
      if (settings.zbsEnabled) {
        zbsStatus = user.phone ? 'pending' : 'failed';
        zbsError = user.phone ? null : 'Tài khoản chưa có số điện thoại di động hợp lệ';
      }
    }

    const [insertResult] = await connection.query(
      `INSERT INTO lucky_wheel_spins (
          user_id, prize_id, prize_name, prize_type, reward_code, claim_instructions,
          discount_code_id, zbs_status, zbs_error, ip_address
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user.id,
        prize.id,
        prize.name,
        prizeType,
        rewardCode || null,
        claimInstructions || null,
        voucher?.id ?? null,
        zbsStatus,
        zbsError,
        ipAddress ? String(ipAddress).slice(0, 45) : null,
      ],
    );

    await connection.commit();

    return {
      spinsLeft: spinsLeft - 1,
      sendZbs: zbsStatus === 'pending',
      result: {
        id: Number(insertResult.insertId),
        prizeId: Number(prize.id),
        name: prize.name,
        description: readText(prize.description),
        imageUrl: normalizeLuckyWheelImageUrl(prize.image_url),
        type: prizeType,
        rewardCode,
        claimInstructions,
        voucher: voucher ? { description: voucher.description, endsOn: voucher.endsOn } : null,
        sentToZalo: zbsStatus === 'pending',
      },
    };
  } catch (error) {
    await connection.rollback().catch(() => {});
    throw error;
  } finally {
    connection.release();
  }
}
