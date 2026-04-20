import { NextResponse } from 'next/server';
import { query } from '../../../../src/lib/server/db.js';
import {
  SESSION_COOKIE_NAME,
  createSessionToken,
  formatUser,
  getClientIp,
  getSessionCookieOptions,
  getSessionExpiryDate,
  getUserAgent,
  normalizeEmail,
  verifyPassword,
} from '../../../../src/lib/server/auth.js';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const body = await request.json();
    const email = normalizeEmail(body.email);
    const password = String(body.password ?? '');

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Vui lòng nhập đầy đủ email và mật khẩu.' },
        { status: 400 }
      );
    }

    const users = await query(
      `
        SELECT id, email, phone, password_hash, full_name, display_name, status, avatar_url, created_at
        FROM users
        WHERE email = ?
          AND deleted_at IS NULL
        LIMIT 1
      `,
      [email]
    );

    if (!users.length || !verifyPassword(password, users[0].password_hash)) {
      return NextResponse.json(
        { message: 'Email hoặc mật khẩu không chính xác.' },
        { status: 401 }
      );
    }

    if (['inactive', 'banned'].includes(users[0].status)) {
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
        users[0].id,
        sessionToken,
        'Web Browser',
        getClientIp(request),
        getUserAgent(request),
        expiresAt,
      ]
    );

    await query(`UPDATE users SET last_login_at = NOW() WHERE id = ?`, [users[0].id]);

    const response = NextResponse.json({ user: formatUser(users[0]) });
    response.cookies.set(SESSION_COOKIE_NAME, sessionToken, getSessionCookieOptions(expiresAt));
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Không thể đăng nhập.' }, { status: 500 });
  }
}
