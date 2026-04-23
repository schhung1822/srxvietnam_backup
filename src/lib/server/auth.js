import crypto from 'node:crypto';

export const SESSION_COOKIE_NAME = 'srx_session';
export const SESSION_DURATION_DAYS = 30;

export function normalizeEmail(email) {
  return String(email ?? '')
    .trim()
    .toLowerCase();
}

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
