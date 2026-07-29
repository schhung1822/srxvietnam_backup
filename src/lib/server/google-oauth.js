import crypto from 'node:crypto';
import { ensureServerEnvLoaded } from './env.js';
import { query } from './db.js';
import { hashPassword, normalizeEmail } from './auth.js';

export const GOOGLE_OAUTH_STATE_COOKIE = 'srx_google_oauth';
export const GOOGLE_OAUTH_STATE_MAX_AGE_SECONDS = 10 * 60;

const GOOGLE_AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const GOOGLE_ISSUERS = ['accounts.google.com', 'https://accounts.google.com'];

let googleColumnsPromise = null;

export function getGoogleOAuthConfig() {
  ensureServerEnvLoaded();

  const clientId = String(process.env.GOOGLE_CLIENT_ID ?? '').trim();
  const clientSecret = String(process.env.GOOGLE_CLIENT_SECRET ?? '').trim();

  return {
    clientId,
    clientSecret,
    isConfigured: Boolean(clientId && clientSecret),
  };
}

export function isGoogleAuthEnabled() {
  return getGoogleOAuthConfig().isConfigured;
}

export function resolveGoogleRedirectUri(request) {
  ensureServerEnvLoaded();

  const configuredRedirectUri = String(process.env.GOOGLE_REDIRECT_URI ?? '').trim();

  if (configuredRedirectUri) {
    return configuredRedirectUri;
  }

  return new URL('/api/auth/google/callback', new URL(request.url).origin).toString();
}

export function sanitizeNextPath(value) {
  const nextPath = String(value ?? '').trim();

  if (!nextPath.startsWith('/') || nextPath.startsWith('//')) {
    return '/account';
  }

  return nextPath;
}

export function createOAuthState() {
  return crypto.randomBytes(24).toString('hex');
}

export function packStateCookie(state, nextPath) {
  return `${state}.${Buffer.from(nextPath, 'utf8').toString('base64url')}`;
}

export function unpackStateCookie(cookieValue) {
  const [state, encodedNextPath = ''] = String(cookieValue ?? '').split('.');

  if (!state) {
    return null;
  }

  let nextPath = '/account';

  try {
    nextPath = sanitizeNextPath(Buffer.from(encodedNextPath, 'base64url').toString('utf8'));
  } catch {
    nextPath = '/account';
  }

  return { state, nextPath };
}

export function isSameState(received, expected) {
  const receivedBuffer = Buffer.from(String(received ?? ''), 'utf8');
  const expectedBuffer = Buffer.from(String(expected ?? ''), 'utf8');

  if (!receivedBuffer.length || receivedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(receivedBuffer, expectedBuffer);
}

export function buildGoogleAuthUrl({ state, redirectUri }) {
  const { clientId } = getGoogleOAuthConfig();
  const authUrl = new URL(GOOGLE_AUTH_ENDPOINT);

  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'openid email profile');
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('access_type', 'online');
  authUrl.searchParams.set('include_granted_scopes', 'true');
  authUrl.searchParams.set('prompt', 'select_account');

  return authUrl.toString();
}

export async function exchangeGoogleCode({ code, redirectUri }) {
  const { clientId, clientSecret } = getGoogleOAuthConfig();

  const response = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok || !payload.id_token) {
    throw new Error(payload.error_description ?? payload.error ?? 'Google token exchange failed.');
  }

  return payload;
}

/**
 * id_token đến trực tiếp từ endpoint token của Google qua TLS nên không cần verify
 * chữ ký lần nữa (theo hướng dẫn OpenID Connect của Google), chỉ cần kiểm tra iss/aud.
 */
export function readGoogleProfileFromIdToken(idToken) {
  const [, payloadSegment] = String(idToken ?? '').split('.');

  if (!payloadSegment) {
    throw new Error('Google id_token không hợp lệ.');
  }

  const payload = JSON.parse(Buffer.from(payloadSegment, 'base64url').toString('utf8'));
  const { clientId } = getGoogleOAuthConfig();

  if (!GOOGLE_ISSUERS.includes(payload.iss)) {
    throw new Error('Google id_token có issuer không hợp lệ.');
  }

  if (payload.aud !== clientId) {
    throw new Error('Google id_token không khớp client id.');
  }

  return {
    googleId: String(payload.sub ?? ''),
    email: normalizeEmail(payload.email),
    emailVerified: payload.email_verified === true || payload.email_verified === 'true',
    fullName: String(payload.name ?? '').trim(),
    avatarUrl: String(payload.picture ?? '').trim() || null,
  };
}

/**
 * Cột google_id/auth_provider chỉ có sau khi chạy database/mysql/09_google_oauth.sql.
 * Nếu chưa chạy, luồng vẫn hoạt động và chỉ khớp người dùng theo email đã xác thực.
 */
async function getGoogleColumns() {
  if (!googleColumnsPromise) {
    googleColumnsPromise = (async () => {
      try {
        const rows = await query(`SHOW COLUMNS FROM users WHERE Field IN ('google_id', 'auth_provider')`);
        const columnNames = rows.map((row) => row.Field);

        return {
          hasGoogleId: columnNames.includes('google_id'),
          hasAuthProvider: columnNames.includes('auth_provider'),
        };
      } catch (error) {
        console.error('Failed to inspect google auth columns:', error);
        return { hasGoogleId: false, hasAuthProvider: false };
      }
    })();
  }

  return googleColumnsPromise;
}

const USER_SELECT_FIELDS = `
  id, email, phone, full_name, display_name, status, avatar_url, created_at
`;

async function findUserById(userId) {
  const rows = await query(
    `SELECT ${USER_SELECT_FIELDS} FROM users WHERE id = ? LIMIT 1`,
    [userId],
  );

  return rows[0] ?? null;
}

export async function findOrCreateGoogleUser(profile) {
  const { hasGoogleId, hasAuthProvider } = await getGoogleColumns();

  if (hasGoogleId && profile.googleId) {
    const rows = await query(
      `SELECT ${USER_SELECT_FIELDS} FROM users WHERE google_id = ? AND deleted_at IS NULL LIMIT 1`,
      [profile.googleId],
    );

    if (rows.length) {
      await query(
        `UPDATE users SET last_login_at = NOW(), avatar_url = COALESCE(avatar_url, ?) WHERE id = ?`,
        [profile.avatarUrl, rows[0].id],
      );

      return { user: await findUserById(rows[0].id), isNew: false };
    }
  }

  const existingRows = await query(
    `SELECT ${USER_SELECT_FIELDS} FROM users WHERE email = ? AND deleted_at IS NULL LIMIT 1`,
    [profile.email],
  );

  if (existingRows.length) {
    const existingUser = existingRows[0];
    const updates = ['last_login_at = NOW()', 'email_verified_at = COALESCE(email_verified_at, NOW())'];
    const params = [];

    if (profile.avatarUrl) {
      updates.push('avatar_url = COALESCE(avatar_url, ?)');
      params.push(profile.avatarUrl);
    }

    if (hasGoogleId && profile.googleId) {
      updates.push('google_id = ?');
      params.push(profile.googleId);
    }

    await query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, [...params, existingUser.id]);

    return { user: await findUserById(existingUser.id), isNew: false };
  }

  // Tài khoản tạo qua Google không có mật khẩu do người dùng đặt: sinh chuỗi ngẫu nhiên
  // không thể đoán được để cột password_hash luôn hợp lệ.
  const placeholderPasswordHash = hashPassword(crypto.randomBytes(48).toString('hex'));
  const fullName = profile.fullName || profile.email.split('@')[0];
  const columns = [
    'email',
    'password_hash',
    'full_name',
    'display_name',
    'avatar_url',
    'status',
    'email_verified_at',
    'last_login_at',
  ];
  const values = [profile.email, placeholderPasswordHash, fullName, fullName, profile.avatarUrl];
  const placeholders = ['?', '?', '?', '?', '?', "'active'", 'NOW()', 'NOW()'];

  if (hasGoogleId && profile.googleId) {
    columns.push('google_id');
    placeholders.push('?');
    values.push(profile.googleId);
  }

  if (hasAuthProvider) {
    columns.push('auth_provider');
    placeholders.push("'google'");
  }

  const insertResult = await query(
    `INSERT INTO users (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`,
    values,
  );

  return { user: await findUserById(insertResult.insertId), isNew: true };
}
