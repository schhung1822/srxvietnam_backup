import crypto from 'node:crypto';

export const SESSION_COOKIE_NAME = 'srx_session';
export const SESSION_DURATION_DAYS = 30;
export const PASSWORD_RESET_DURATION_MINUTES = 60;

export function normalizeEmail(email) {
  return String(email ?? '')
    .trim()
    .toLowerCase();
}

/**
 * Đưa số điện thoại về dạng nội địa 0xxxxxxxxx (bỏ mọi khoảng trắng, dấu, tiền tố +84).
 */
export function normalizePhone(value) {
  const digits = String(value ?? '').replace(/\D/gu, '');

  if (!digits) {
    return '';
  }

  if (digits.startsWith('84') && digits.length >= 11) {
    return `0${digits.slice(2)}`;
  }

  if (digits.startsWith('0')) {
    return digits;
  }

  return digits.length === 9 ? `0${digits}` : digits;
}

/**
 * 9 chữ số cuối là phần định danh duy nhất của một số di động Việt Nam, không phụ thuộc
 * người dùng nhập 0903..., +84903... hay 0903 010 692. Dùng để so khớp khi đăng nhập vì
 * cột users.phone lưu đúng chuỗi người dùng đã gõ lúc đăng ký nên định dạng không đồng nhất.
 */
export function getPhoneMatchKey(value) {
  const digits = String(value ?? '').replace(/\D/gu, '');

  return digits.length >= 9 ? digits.slice(-9) : '';
}

/**
 * Người dùng có thể đăng nhập bằng email hoặc số điện thoại; dấu @ là dấu hiệu phân biệt.
 */
export function isEmailIdentifier(value) {
  return String(value ?? '').includes('@');
}

/**
 * Biểu thức SQL bỏ các ký tự phân tách thường gặp trong cột phone rồi lấy 9 số cuối,
 * để so với getPhoneMatchKey().
 */
export const PHONE_MATCH_KEY_SQL = `
  RIGHT(
    REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '.', ''), '(', ''), ')', ''), '+', ''),
    9
  )
`;

export function hashPassword(password) {
  const iterations = 120000;
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha512').toString('hex');
  return `pbkdf2_sha512$${iterations}$${salt}$${hash}`;
}

export function verifyPassword(password, storedHash) {
  if (!storedHash) {
    return false;
  }

  const [algorithm, iterationsRaw, salt, expectedHash] = storedHash.split('$');

  if (algorithm !== 'pbkdf2_sha512' || !iterationsRaw || !salt || !expectedHash) {
    return false;
  }

  const iterations = Number(iterationsRaw);
  const calculatedHash = crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha512').toString('hex');

  return crypto.timingSafeEqual(Buffer.from(calculatedHash, 'hex'), Buffer.from(expectedHash, 'hex'));
}

export function createSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

export function createPasswordResetToken() {
  return crypto.randomBytes(32).toString('hex');
}

export function hashPasswordResetToken(token) {
  return crypto.createHash('sha256').update(String(token ?? '').trim()).digest('hex');
}

export function normalizePasswordResetToken(token) {
  const normalized = String(token ?? '').trim().toLowerCase();
  return /^[a-f0-9]{64}$/u.test(normalized) ? normalized : '';
}

export function getPasswordResetExpiryDate() {
  return new Date(Date.now() + PASSWORD_RESET_DURATION_MINUTES * 60 * 1000);
}

export function getSessionExpiryDate() {
  return new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000);
}

export function getSessionCookieOptions(expires) {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires,
  };
}

export function getClientIp(request) {
  const forwardedFor = request.headers.get('x-forwarded-for');

  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  return request.headers.get('x-real-ip') ?? null;
}

export function getUserAgent(request) {
  return request.headers.get('user-agent') ?? null;
}

export function formatUser(user) {
  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    fullName: user.full_name,
    displayName: user.display_name,
    status: user.status,
    avatarUrl: user.avatar_url,
    createdAt: user.created_at,
  };
}

export function validatePassword(password) {
  return typeof password === 'string' && password.length >= 8;
}

export function validateName(name) {
  return typeof name === 'string' && name.trim().length >= 2;
}
