import crypto from 'node:crypto';
import QRCode from 'qrcode';
import { query } from './db.js';

export const QR_LOGIN_COOKIE_NAME = 'srx_qr_login';
export const QR_LOGIN_TTL_SECONDS = 5 * 60;
// Cookie sống lâu hơn ticket một chút để trình duyệt còn đọc được trạng thái "hết hạn".
export const QR_LOGIN_COOKIE_MAX_AGE_SECONDS = QR_LOGIN_TTL_SECONDS + 60;

const ACTIVE_STATUSES = ['pending', 'scanned', 'confirmed'];

export function createTicketCode() {
  return crypto.randomBytes(24).toString('hex');
}

export function createBrowserSecret() {
  return crypto.randomBytes(32).toString('hex');
}

export function hashBrowserSecret(secret) {
  return crypto.createHash('sha256').update(String(secret ?? '')).digest('hex');
}

export function normalizeTicket(value) {
  const ticket = String(value ?? '').trim().toLowerCase();

  return /^[a-f0-9]{48}$/u.test(ticket) ? ticket : '';
}

/**
 * Hạn của ticket luôn được tính bằng đồng hồ của MySQL (`NOW() + INTERVAL`), không bao
 * giờ gửi kiểu Date của JS xuống DB: mysql2 quy đổi Date theo múi giờ của tiến trình
 * Node, nên nếu Node chạy giờ Việt Nam còn MySQL chạy UTC thì mã "5 phút" sẽ sống
 * thành 7 giờ 5 phút. Mọi chỗ đọc hạn cũng lấy số giây còn lại do DB tính sẵn.
 */
export function toExpiresAtIso(expiresInSeconds) {
  return new Date(Date.now() + Math.max(0, Number(expiresInSeconds ?? 0)) * 1000).toISOString();
}

export function packQrLoginCookie(ticket, secret) {
  return `${ticket}.${secret}`;
}

export function unpackQrLoginCookie(cookieValue) {
  const [ticket, secret = ''] = String(cookieValue ?? '').split('.');
  const normalizedTicket = normalizeTicket(ticket);

  if (!normalizedTicket || !secret) {
    return null;
  }

  return { ticket: normalizedTicket, secret };
}

export function getQrLoginCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: QR_LOGIN_COOKIE_MAX_AGE_SECONDS,
  };
}

export function isSameSecret(received, expectedHash) {
  const receivedBuffer = Buffer.from(hashBrowserSecret(received), 'utf8');
  const expectedBuffer = Buffer.from(String(expectedHash ?? ''), 'utf8');

  if (!expectedBuffer.length || receivedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(receivedBuffer, expectedBuffer);
}

export function sanitizeNextPath(value) {
  const nextPath = String(value ?? '').trim();

  if (!nextPath.startsWith('/') || nextPath.startsWith('//')) {
    return '/account';
  }

  return nextPath.slice(0, 255);
}

export async function renderQrDataUrl(text) {
  return QRCode.toDataURL(text, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 512,
    color: { dark: '#15110d', light: '#ffffff' },
  });
}

/**
 * Dọn ticket cũ. Gọi kèm lúc tạo ticket mới nên không cần cron riêng.
 */
async function purgeStaleTickets() {
  try {
    // Người dùng xác nhận trên Zalo rồi đóng popup trước khi trình duyệt kịp nhận:
    // phiên đã tạo không ai giữ được nữa nên xóa luôn thay vì để sống 30 ngày.
    await query(
      `DELETE s FROM user_sessions s
        INNER JOIN zalo_login_tickets t ON t.session_token = s.session_token
        WHERE t.status = 'confirmed'
          AND t.expires_at <= NOW()`,
    );
    await query(
      `UPDATE zalo_login_tickets
        SET status = 'expired', session_token = NULL
        WHERE status IN ('pending', 'scanned', 'confirmed')
          AND expires_at <= NOW()`,
    );
    await query(`DELETE FROM zalo_login_tickets WHERE created_at < NOW() - INTERVAL 1 DAY`);
  } catch (error) {
    console.error('QR login cleanup error:', error);
  }
}

/**
 * Chặn việc spam tạo ticket từ một IP (mỗi ticket là một mã QR chờ quét).
 */
async function countRecentTicketsByIp(ipAddress) {
  if (!ipAddress) {
    return 0;
  }

  const rows = await query(
    `SELECT COUNT(*) AS total
      FROM zalo_login_tickets
      WHERE ip_address = ?
        AND created_at > NOW() - INTERVAL 10 MINUTE`,
    [ipAddress],
  );

  return Number(rows[0]?.total ?? 0);
}

export const MAX_TICKETS_PER_IP_PER_10_MINUTES = 30;

/**
 * Thiếu bảng ticket là lỗi cấu hình hay gặp nhất (quên chạy migration), và nếu để nguyên
 * thì nó rơi vào catch chung với thông báo "Không thể tạo mã QR" chẳng nói lên điều gì.
 */
function assertTicketTableExists(error) {
  if (error?.code === 'ER_NO_SUCH_TABLE') {
    const configError = new Error(
      'Chưa có bảng zalo_login_tickets. Hãy chạy database/mysql/10_zalo_qr_login.sql trên database đang dùng.',
    );
    configError.code = 'missing_migration';
    throw configError;
  }

  throw error;
}

export async function createLoginTicket({ nextPath, ipAddress, userAgent }) {
  await purgeStaleTickets();

  if ((await countRecentTicketsByIp(ipAddress).catch(assertTicketTableExists)) >= MAX_TICKETS_PER_IP_PER_10_MINUTES) {
    const error = new Error('Bạn đã tạo quá nhiều mã QR. Vui lòng thử lại sau ít phút.');
    error.code = 'rate_limited';
    throw error;
  }

  const ticket = createTicketCode();
  const secret = createBrowserSecret();

  await query(
    `INSERT INTO zalo_login_tickets (
      ticket, browser_secret_hash, status, next_path, ip_address, user_agent, expires_at
    ) VALUES (?, ?, 'pending', ?, ?, ?, NOW() + INTERVAL ? SECOND)`,
    [
      ticket,
      hashBrowserSecret(secret),
      sanitizeNextPath(nextPath),
      ipAddress,
      userAgent,
      QR_LOGIN_TTL_SECONDS,
    ],
  ).catch(assertTicketTableExists);

  return { ticket, secret, expiresInSeconds: QR_LOGIN_TTL_SECONDS };
}

export async function findTicket(ticket) {
  const normalizedTicket = normalizeTicket(ticket);

  if (!normalizedTicket) {
    return null;
  }

  const rows = await query(
    `SELECT id, ticket, browser_secret_hash, status, user_id, session_token, next_path,
            ip_address, user_agent, scanned_at, confirmed_at, claimed_at,
            -- Để MySQL tự so hạn bằng đồng hồ của chính nó, tránh lệch múi giờ với Node.
            (expires_at <= NOW()) AS is_expired,
            TIMESTAMPDIFF(SECOND, NOW(), expires_at) AS expires_in_seconds
      FROM zalo_login_tickets
      WHERE ticket = ?
      LIMIT 1`,
    [normalizedTicket],
  );

  return rows[0] ?? null;
}

export function isTicketExpired(row) {
  return Number(row.is_expired) === 1;
}

/**
 * Trạng thái hiển thị cho trình duyệt: ticket còn `pending/scanned/confirmed` trong DB
 * nhưng đã quá hạn thì coi như `expired`.
 */
export function resolveTicketStatus(row) {
  if (ACTIVE_STATUSES.includes(row.status) && isTicketExpired(row)) {
    return 'expired';
  }

  return row.status;
}

export async function expireTicket(ticketId) {
  await query(`UPDATE zalo_login_tickets SET status = 'expired' WHERE id = ? AND status IN ('pending', 'scanned', 'confirmed')`, [
    ticketId,
  ]);
}

export async function cancelTicket(ticketId) {
  await query(
    `UPDATE zalo_login_tickets SET status = 'cancelled' WHERE id = ? AND status IN ('pending', 'scanned')`,
    [ticketId],
  );
}

export async function markTicketScanned(ticketId) {
  const result = await query(
    `UPDATE zalo_login_tickets
      SET status = 'scanned', scanned_at = COALESCE(scanned_at, NOW())
      WHERE id = ? AND status = 'pending' AND expires_at > NOW()`,
    [ticketId],
  );

  return result.affectedRows > 0;
}

/**
 * Ghi kết quả xác nhận. Điều kiện `status IN ('pending','scanned')` đảm bảo một ticket
 * chỉ tạo được đúng một phiên đăng nhập dù mini app gọi lại nhiều lần.
 */
export async function markTicketConfirmed({ ticketId, userId, sessionToken }) {
  const result = await query(
    `UPDATE zalo_login_tickets
      SET status = 'confirmed', user_id = ?, session_token = ?, confirmed_at = NOW()
      WHERE id = ? AND status IN ('pending', 'scanned') AND expires_at > NOW()`,
    [userId, sessionToken, ticketId],
  );

  return result.affectedRows > 0;
}

/**
 * Trả session_token về đúng một lần rồi xóa khỏi bảng ticket.
 */
export async function claimTicketSession(ticketId) {
  const result = await query(
    `UPDATE zalo_login_tickets
      SET status = 'claimed', claimed_at = NOW()
      WHERE id = ? AND status = 'confirmed'`,
    [ticketId],
  );

  if (!result.affectedRows) {
    return null;
  }

  const rows = await query(`SELECT user_id, session_token, next_path FROM zalo_login_tickets WHERE id = ? LIMIT 1`, [
    ticketId,
  ]);

  await query(`UPDATE zalo_login_tickets SET session_token = NULL WHERE id = ?`, [ticketId]);

  return rows[0] ?? null;
}
