import crypto from 'node:crypto';
import { formatUser, normalizeEmail, SESSION_COOKIE_NAME, validateName } from './auth.js';
import { query } from './db.js';

const allowedGenders = new Set(['male', 'female', 'other', 'prefer_not_to_say']);
export const AFFILIATE_REFERRAL_COOKIE_NAME = 'srx_affiliate_ref';
export const AFFILIATE_VISITOR_COOKIE_NAME = 'srx_affiliate_visitor';
const MAX_AFFILIATE_COOKIE_DAYS = 90;

function safeString(value) {
  return String(value ?? '').trim();
}

function truncateString(value, maxLength) {
  const normalized = safeString(value);
  return normalized ? normalized.slice(0, maxLength) : null;
}

function safeNullableString(value) {
  const nextValue = safeString(value);
  return nextValue || null;
}

function normalizeGender(value) {
  const nextValue = safeString(value);
  return allowedGenders.has(nextValue) ? nextValue : 'prefer_not_to_say';
}

function normalizeUrl(value) {
  const nextValue = safeString(value);

  if (!nextValue) {
    return null;
  }

  if (/^https?:\/\//i.test(nextValue)) {
    return nextValue;
  }

  return `https://${nextValue}`;
}

function normalizeNationalId(value) {
  const nextValue = safeString(value).replace(/\s+/g, '');
  return nextValue || null;
}

export function normalizeAffiliateCode(value) {
  return safeString(value).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40).toUpperCase();
}

export function normalizeAffiliateVisitorToken(value) {
  const normalized = safeString(value).toLowerCase();
  return /^[a-f0-9]{64}$/u.test(normalized) ? normalized : null;
}

function getAffiliateCookieDurationDays(value) {
  const normalized = Number(value);

  if (!Number.isFinite(normalized) || normalized <= 0) {
    return 30;
  }

  return Math.min(Math.round(normalized), MAX_AFFILIATE_COOKIE_DAYS);
}

export function getAffiliateCookieMaxAgeSeconds(days) {
  return getAffiliateCookieDurationDays(days) * 24 * 60 * 60;
}

function createAffiliateVisitorToken() {
  return crypto.randomBytes(32).toString('hex');
}

function getRequestIpAddress(request) {
  const forwardedFor = request.headers.get('x-forwarded-for');

  if (forwardedFor) {
    const firstIp = forwardedFor.split(',')[0]?.trim();

    if (firstIp) {
      return firstIp.slice(0, 45);
    }
  }

  return truncateString(request.headers.get('x-real-ip'), 45);
}

export async function resolveAffiliateAccountByCode(affiliateCode) {
  const normalizedAffiliateCode = normalizeAffiliateCode(affiliateCode);

  if (!normalizedAffiliateCode) {
    return null;
  }

  const rows = await query(
    `
      SELECT
        id,
        user_id,
        affiliate_code,
        status,
        commission_type,
        commission_rate,
        cookie_duration_days
      FROM affiliate_accounts
      WHERE affiliate_code = ?
        AND status = 'active'
      LIMIT 1
    `,
    [normalizedAffiliateCode],
  );

  return rows[0] ?? null;
}

export async function registerAffiliateClickFromRequest({
  request,
  affiliateCode,
  customerUserId = null,
  visitorToken = null,
  landingUrl = null,
  referrerUrl = null,
}) {
  const account = await resolveAffiliateAccountByCode(affiliateCode);

  if (!account) {
    return null;
  }

  if (customerUserId && Number(account.user_id) === Number(customerUserId)) {
    return {
      status: 'ignored',
      reason: 'self_referral',
      account,
      visitorToken: normalizeAffiliateVisitorToken(visitorToken) ?? createAffiliateVisitorToken(),
      cookieDurationDays: getAffiliateCookieDurationDays(account.cookie_duration_days),
    };
  }

  const nextVisitorToken = normalizeAffiliateVisitorToken(visitorToken) ?? createAffiliateVisitorToken();
  const userAgent = truncateString(request.headers.get('user-agent'), 500);
  const ipAddress = getRequestIpAddress(request);
  const normalizedLandingUrl = truncateString(landingUrl, 500);
  const normalizedReferrerUrl = truncateString(referrerUrl, 500);

  const clickResult = await query(
    `
      INSERT INTO affiliate_clicks (
        affiliate_account_id,
        affiliate_link_id,
        visitor_token,
        customer_user_id,
        ip_address,
        user_agent,
        referrer_url,
        landing_url
      )
      VALUES (?, NULL, ?, ?, ?, ?, ?, ?)
    `,
    [
      account.id,
      nextVisitorToken,
      customerUserId,
      ipAddress,
      userAgent,
      normalizedReferrerUrl,
      normalizedLandingUrl,
    ],
  );

  await query(`UPDATE affiliate_accounts SET total_clicks = total_clicks + 1 WHERE id = ?`, [account.id]);

  return {
    status: 'tracked',
    account,
    clickId: clickResult.insertId ?? null,
    visitorToken: nextVisitorToken,
    cookieDurationDays: getAffiliateCookieDurationDays(account.cookie_duration_days),
  };
}

function validateAffiliatePayload(payload) {
  const legalFullName = safeString(payload.legalFullName);
  const permanentAddress = safeString(payload.permanentAddress);
  const nationalIdNumber = normalizeNationalId(payload.nationalIdNumber);
  const contactPhone = safeString(payload.contactPhone);
  const contactEmail = normalizeEmail(payload.contactEmail);
  const gender = normalizeGender(payload.gender);
  const facebookUrl = normalizeUrl(payload.facebookUrl);
  const tiktokUrl = normalizeUrl(payload.tiktokUrl);

  if (!validateName(legalFullName)) {
    throw new Error('Vui lòng nhập họ tên hợp lệ.');
  }

  if (permanentAddress.length < 10) {
    throw new Error('Vui lòng nhập địa chỉ thường trú đầy đủ hơn.');
  }

  if (!nationalIdNumber || nationalIdNumber.length < 9) {
    throw new Error('Vui lòng nhập số CCCD hợp lệ.');
  }

  if (contactPhone.length < 9) {
    throw new Error('Vui lòng nhập số điện thoại hợp lệ.');
  }

  if (!contactEmail || !contactEmail.includes('@')) {
    throw new Error('Vui lòng nhập email hợp lệ.');
  }

  if (!facebookUrl) {
    throw new Error('Vui lòng nhập link Facebook.');
  }

  if (!tiktokUrl) {
    throw new Error('Vui lòng nhập link TikTok.');
  }

  return {
    legalFullName,
    permanentAddress,
    nationalIdNumber,
    contactPhone,
    contactEmail,
    gender,
    facebookUrl,
    tiktokUrl,
  };
}

function validateBankPayload(payload) {
  const accountHolderName = safeString(payload.accountHolderName);
  const bankName = safeString(payload.bankName);
  const bankBranch = safeNullableString(payload.bankBranch);
  const accountNumber = safeString(payload.accountNumber).replace(/\s+/g, '');

  if (!validateName(accountHolderName)) {
    throw new Error('Vui lòng nhập tên chủ tài khoản.');
  }

  if (bankName.length < 2) {
    throw new Error('Vui lòng nhập tên ngân hàng.');
  }

  if (accountNumber.length < 6) {
    throw new Error('Vui lòng nhập số tài khoản hợp lệ.');
  }

  return {
    accountHolderName,
    bankName,
    bankBranch,
    accountNumber,
  };
}

function formatCurrencyValue(value) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatAffiliateApplication(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    legalFullName: row.legal_full_name,
    permanentAddress: row.permanent_address,
    nationalIdNumber: row.national_id_number,
    contactPhone: row.contact_phone,
    contactEmail: row.contact_email,
    gender: row.gender,
    facebookUrl: row.facebook_url,
    tiktokUrl: row.tiktok_url,
    status: row.status,
    reviewNote: row.review_note,
    reviewedAt: row.reviewed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function buildReferralLink(origin, affiliateCode) {
  const baseOrigin = String(origin ?? '').replace(/\/$/, '');
  return affiliateCode ? `${baseOrigin}/?ref=${affiliateCode}` : null;
}

function formatAffiliateAccount(row, origin) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    affiliateCode: row.affiliate_code,
    status: row.status,
    commissionType: row.commission_type,
    commissionRate: Number(row.commission_rate ?? 0),
    cookieDurationDays: Number(row.cookie_duration_days ?? 30),
    totalClicks: Number(row.total_clicks ?? 0),
    totalOrders: Number(row.total_orders ?? 0),
    approvedAt: row.approved_at,
    referralLink: buildReferralLink(origin, row.affiliate_code),
    pendingCommission: formatCurrencyValue(row.pending_commission),
    approvedCommission: formatCurrencyValue(row.approved_commission),
    paidCommission: formatCurrencyValue(row.paid_commission),
  };
}

function formatBankAccount(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    accountHolderName: row.account_holder_name,
    bankName: row.bank_name,
    bankBranch: row.bank_branch,
    accountNumber: row.account_number,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getAuthenticatedUserFromRequest(request) {
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return null;
  }

  const users = await query(
    `
      SELECT
        u.id,
        u.email,
        u.phone,
        u.full_name,
        u.display_name,
        u.gender,
        u.status,
        u.avatar_url,
        u.created_at
      FROM user_sessions s
      INNER JOIN users u ON u.id = s.user_id
      WHERE s.session_token = ?
        AND s.expires_at > NOW()
        AND u.deleted_at IS NULL
      LIMIT 1
    `,
    [sessionToken],
  );

  if (!users.length) {
    return null;
  }

  await query(`UPDATE user_sessions SET last_activity_at = NOW() WHERE session_token = ?`, [sessionToken]);
  return users[0];
}

export async function getAffiliateSnapshotForUser(userId, origin) {
  let schemaNeedsUpdate = false;
  let application = null;
  let account = null;
  let bankAccount = null;

  try {
    const applicationRows = await query(
      `
        SELECT
          id,
          legal_full_name,
          permanent_address,
          national_id_number,
          contact_phone,
          contact_email,
          gender,
          facebook_url,
          tiktok_url,
          status,
          review_note,
          reviewed_at,
          created_at,
          updated_at
        FROM affiliate_applications
        WHERE user_id = ?
        LIMIT 1
      `,
      [userId],
    );

    application = formatAffiliateApplication(applicationRows[0]);
  } catch (error) {
    schemaNeedsUpdate = true;
    console.error('Failed to load affiliate application snapshot:', error);
  }

  try {
    const accountRows = await query(
      `
        SELECT
          aa.id,
          aa.affiliate_code,
          aa.status,
          aa.commission_type,
          aa.commission_rate,
          aa.cookie_duration_days,
          aa.total_clicks,
          aa.total_orders,
          aa.approved_at,
          COALESCE(SUM(CASE WHEN ar.status = 'pending' THEN ar.commission_amount ELSE 0 END), 0) AS pending_commission,
          COALESCE(SUM(CASE WHEN ar.status = 'approved' THEN ar.commission_amount ELSE 0 END), 0) AS approved_commission,
          COALESCE(SUM(CASE WHEN ar.status = 'paid' THEN ar.commission_amount ELSE 0 END), 0) AS paid_commission
        FROM affiliate_accounts aa
        LEFT JOIN affiliate_referrals ar ON ar.affiliate_account_id = aa.id
        WHERE aa.user_id = ?
        GROUP BY
          aa.id,
          aa.affiliate_code,
          aa.status,
          aa.commission_type,
          aa.commission_rate,
          aa.cookie_duration_days,
          aa.total_clicks,
          aa.total_orders,
          aa.approved_at
        LIMIT 1
      `,
      [userId],
    );

    account = formatAffiliateAccount(accountRows[0], origin);

    if (account?.id) {
      const bankRows = await query(
        `
          SELECT
            id,
            account_holder_name,
            bank_name,
            bank_branch,
            account_number,
            created_at,
            updated_at
          FROM affiliate_bank_accounts
          WHERE affiliate_account_id = ?
          LIMIT 1
        `,
        [account.id],
      );

      bankAccount = formatBankAccount(bankRows[0]);
    }
  } catch (error) {
    schemaNeedsUpdate = true;
    console.error('Failed to load affiliate account snapshot:', error);
  }

  return {
    userId,
    application,
    account,
    bankAccount,
    schemaNeedsUpdate,
  };
}

export async function upsertAffiliateApplicationForUser(user, payload) {
  const normalizedPayload = validateAffiliatePayload(payload);
  const existingRows = await query(
    `SELECT id, status FROM affiliate_applications WHERE user_id = ? LIMIT 1`,
    [user.id],
  );
  const existingApplication = existingRows[0] ?? null;
  const previousStatus = existingApplication?.status ?? null;
  const keepApprovedStatus = existingApplication?.status === 'approved';
  const nextStatus = keepApprovedStatus ? 'approved' : 'pending';
  const shouldNotifyPendingReview = nextStatus === 'pending' && previousStatus !== 'pending';
  const isNewSubmission = !existingApplication;
  const isResubmission = previousStatus === 'rejected';
  let applicationId = existingApplication?.id ?? null;

  await query(
    `
      UPDATE users
      SET full_name = ?, phone = ?, gender = ?, updated_at = NOW()
      WHERE id = ?
    `,
    [normalizedPayload.legalFullName, normalizedPayload.contactPhone, normalizedPayload.gender, user.id],
  );

  if (existingApplication) {
    if (keepApprovedStatus) {
      await query(
        `
          UPDATE affiliate_applications
          SET
            legal_full_name = ?,
            permanent_address = ?,
            national_id_number = ?,
            contact_phone = ?,
            contact_email = ?,
            gender = ?,
            facebook_url = ?,
            tiktok_url = ?,
            updated_at = NOW()
          WHERE id = ?
        `,
        [
          normalizedPayload.legalFullName,
          normalizedPayload.permanentAddress,
          normalizedPayload.nationalIdNumber,
          normalizedPayload.contactPhone,
          normalizedPayload.contactEmail,
          normalizedPayload.gender,
          normalizedPayload.facebookUrl,
          normalizedPayload.tiktokUrl,
          existingApplication.id,
        ],
      );
    } else {
      await query(
        `
          UPDATE affiliate_applications
          SET
            legal_full_name = ?,
            permanent_address = ?,
            national_id_number = ?,
            contact_phone = ?,
            contact_email = ?,
            gender = ?,
            facebook_url = ?,
            tiktok_url = ?,
            status = 'pending',
            review_note = NULL,
            reviewed_by_user_id = NULL,
            reviewed_at = NULL,
            updated_at = NOW()
          WHERE id = ?
        `,
        [
          normalizedPayload.legalFullName,
          normalizedPayload.permanentAddress,
          normalizedPayload.nationalIdNumber,
          normalizedPayload.contactPhone,
          normalizedPayload.contactEmail,
          normalizedPayload.gender,
          normalizedPayload.facebookUrl,
          normalizedPayload.tiktokUrl,
          existingApplication.id,
        ],
      );
    }
  } else {
    const insertResult = await query(
      `
        INSERT INTO affiliate_applications (
          user_id,
          legal_full_name,
          permanent_address,
          national_id_number,
          contact_email,
          contact_phone,
          gender,
          facebook_url,
          tiktok_url,
          status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
      `,
      [
        user.id,
        normalizedPayload.legalFullName,
        normalizedPayload.permanentAddress,
        normalizedPayload.nationalIdNumber,
        normalizedPayload.contactEmail,
        normalizedPayload.contactPhone,
        normalizedPayload.gender,
        normalizedPayload.facebookUrl,
        normalizedPayload.tiktokUrl,
      ],
    );

    applicationId = insertResult.insertId ?? null;
  }

  return {
    ...normalizedPayload,
    applicationId,
    previousStatus,
    currentStatus: nextStatus,
    shouldNotifyPendingReview,
    isNewSubmission,
    isResubmission,
  };
}

export async function upsertAffiliateBankAccountForUser(userId, payload) {
  const normalizedPayload = validateBankPayload(payload);
  const accountRows = await query(
    `
      SELECT id
      FROM affiliate_accounts
      WHERE user_id = ?
      LIMIT 1
    `,
    [userId],
  );

  if (!accountRows.length) {
    throw new Error('Tài khoản affiliate chưa được kích hoạt.');
  }

  const affiliateAccountId = accountRows[0].id;
  const existingRows = await query(
    `
      SELECT id
      FROM affiliate_bank_accounts
      WHERE affiliate_account_id = ?
      LIMIT 1
    `,
    [affiliateAccountId],
  );

  if (existingRows.length) {
    await query(
      `
        UPDATE affiliate_bank_accounts
        SET
          account_holder_name = ?,
          bank_name = ?,
          bank_branch = ?,
          account_number = ?,
          updated_at = NOW()
        WHERE affiliate_account_id = ?
      `,
      [
        normalizedPayload.accountHolderName,
        normalizedPayload.bankName,
        normalizedPayload.bankBranch,
        normalizedPayload.accountNumber,
        affiliateAccountId,
      ],
    );
  } else {
    await query(
      `
        INSERT INTO affiliate_bank_accounts (
          affiliate_account_id,
          account_holder_name,
          bank_name,
          bank_branch,
          account_number
        )
        VALUES (?, ?, ?, ?, ?)
      `,
      [
        affiliateAccountId,
        normalizedPayload.accountHolderName,
        normalizedPayload.bankName,
        normalizedPayload.bankBranch,
        normalizedPayload.accountNumber,
      ],
    );
  }

  return normalizedPayload;
}

export function formatAffiliateUser(user) {
  return {
    ...formatUser(user),
    gender: user.gender ?? 'prefer_not_to_say',
  };
}
