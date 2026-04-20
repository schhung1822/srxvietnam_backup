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
  hashPassword,
  normalizeEmail,
  validateName,
  validatePassword,
} from '../../../../src/lib/server/auth.js';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const body = await request.json();
    const fullName = String(body.fullName ?? '').trim();
    const email = normalizeEmail(body.email);
    const phone = String(body.phone ?? '').trim() || null;
    const password = String(body.password ?? '');

    if (!validateName(fullName)) {
      return NextResponse.json({ message: 'Họ tên chưa hợp lệ.' }, { status: 400 });
    }

    if (!email) {
      return NextResponse.json({ message: 'Email là bắt buộc.' }, { status: 400 });
    }

    if (!validatePassword(password)) {
      return NextResponse.json(
        { message: 'Mật khẩu phải có ít nhất 8 ký tự.' },
        { status: 400 }
      );
    }

    const existingUsers = await query(
      `
        SELECT id, email, phone
        FROM users
        WHERE deleted_at IS NULL
          AND (email = ? OR (? IS NOT NULL AND phone = ?))
        LIMIT 1
      `,
      [email, phone, phone]
    );

    if (existingUsers.length) {
      return NextResponse.json(
        { message: 'Email hoặc số điện thoại đã được sử dụng.' },
        { status: 409 }
      );
    }

    const passwordHash = hashPassword(password);

    const insertResult = await query(
      `
        INSERT INTO users (
          email,
          phone,
          password_hash,
          full_name,
          display_name,
          status,
          last_login_at
        )
        VALUES (?, ?, ?, ?, ?, 'active', NOW())
      `,
      [email, phone, passwordHash, fullName, fullName]
    );

    const userId = insertResult.insertId;
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
      [userId, sessionToken, 'Web Browser', getClientIp(request), getUserAgent(request), expiresAt]
    );

    const users = await query(
      `
        SELECT id, email, phone, full_name, display_name, status, avatar_url, created_at
        FROM users
        WHERE id = ?
        LIMIT 1
      `,
      [userId]
    );

    const response = NextResponse.json({ user: formatUser(users[0]) }, { status: 201 });
    response.cookies.set(SESSION_COOKIE_NAME, sessionToken, getSessionCookieOptions(expiresAt));
    return response;
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ message: 'Không thể đăng ký tài khoản.' }, { status: 500 });
  }
}
