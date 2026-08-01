import { NextResponse } from 'next/server';
import { query } from '../../../../src/lib/server/db.js';
import {
  PHONE_MATCH_KEY_SQL,
  SESSION_COOKIE_NAME,
  createSessionToken,
  formatUser,
  getClientIp,
  getPhoneMatchKey,
  getSessionCookieOptions,
  getSessionExpiryDate,
  getUserAgent,
  isEmailIdentifier,
  normalizeEmail,
  verifyPassword,
} from '../../../../src/lib/server/auth.js';

export const runtime = 'nodejs';

const USER_LOGIN_FIELDS = `
  id, email, phone, password_hash, full_name, display_name, status, avatar_url, created_at
`;

const INVALID_CREDENTIALS_MESSAGE = 'Email/số điện thoại hoặc mật khẩu không chính xác.';

/**
 * Tìm tài khoản theo email hoặc số điện thoại.
 * Với số điện thoại có thể ra nhiều dòng (cùng một số nhưng lưu khác định dạng, ví dụ
 * "0903010692" và "+84903010692"), nên trả về danh sách để thử mật khẩu lần lượt.
 */
async function findLoginCandidates(identifier) {
  if (isEmailIdentifier(identifier)) {
    return query(
      `
        SELECT ${USER_LOGIN_FIELDS}
        FROM users
        WHERE email = ?
          AND deleted_at IS NULL
        LIMIT 1
      `,
      [normalizeEmail(identifier)]
    );
  }

  const phoneMatchKey = getPhoneMatchKey(identifier);

  if (!phoneMatchKey) {
    return [];
  }

  return query(
    `
      SELECT ${USER_LOGIN_FIELDS}
      FROM users
      WHERE deleted_at IS NULL
        AND phone IS NOT NULL
        AND ${PHONE_MATCH_KEY_SQL} = ?
      ORDER BY id
      LIMIT 5
    `,
    [phoneMatchKey]
  );
}

export async function POST(request) {
  try {
    const body = await request.json();
    // Giữ `email` để không phá các client cũ vẫn gửi trường này.
    const identifier = String(body.identifier ?? body.email ?? '').trim();
    const password = String(body.password ?? '');

    if (!identifier || !password) {
      return NextResponse.json(
        { message: 'Vui lòng nhập đầy đủ email/số điện thoại và mật khẩu.' },
        { status: 400 }
      );
    }

    const candidates = await findLoginCandidates(identifier);
    const matchedUser = candidates.find((candidate) =>
      verifyPassword(password, candidate.password_hash)
    );

    if (!matchedUser) {
      return NextResponse.json({ message: INVALID_CREDENTIALS_MESSAGE }, { status: 401 });
    }

    if (['inactive', 'banned'].includes(matchedUser.status)) {
      return NextResponse.json(
        { message: 'Tài khoản hiện không thể đăng nhập.' },
        { status: 403 }
      );
    }

    const sessionToken = createSessionToken();
    const expiresAt = getSessionExpiryDate();

    await query(
      `
        INSERT INTO user_sessions (
          user_id,
          session_token,
          device_name,
          ip_address,
          user_agent,
          last_activity_at,
          expires_at
        )
        VALUES (?, ?, ?, ?, ?, NOW(), ?)
      `,
      [
        matchedUser.id,
        sessionToken,
        'Web Browser',
        getClientIp(request),
        getUserAgent(request),
        expiresAt,
      ]
    );

    await query(`UPDATE users SET last_login_at = NOW() WHERE id = ?`, [matchedUser.id]);

    const response = NextResponse.json({ user: formatUser(matchedUser) });
    response.cookies.set(SESSION_COOKIE_NAME, sessionToken, getSessionCookieOptions(expiresAt));
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Không thể đăng nhập.' }, { status: 500 });
  }
}
