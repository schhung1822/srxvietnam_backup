import { NextResponse } from 'next/server';
import { query } from '../../../../src/lib/server/db.js';
import {
  PASSWORD_RESET_DURATION_MINUTES,
  createPasswordResetToken,
  getPasswordResetExpiryDate,
  hashPasswordResetToken,
  normalizeEmail,
} from '../../../../src/lib/server/auth.js';
import { sendPasswordResetEmail } from '../../../../src/lib/server/mail.js';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const body = await request.json();
    const email = normalizeEmail(body?.email);

    if (!email || !email.includes('@')) {
      return NextResponse.json({ message: 'Vui lòng nhập email hợp lệ.' }, { status: 400 });
    }

    const users = await query(
      `
        SELECT id, email, full_name, display_name
        FROM users
        WHERE email = ?
          AND deleted_at IS NULL
        LIMIT 1
      `,
      [email],
    );

    if (users.length) {
      const user = users[0];
      const rawToken = createPasswordResetToken();
      const storedToken = hashPasswordResetToken(rawToken);
      const expiresAt = getPasswordResetExpiryDate();
      const resetLink = `${request.nextUrl.origin}/reset-password?token=${rawToken}`;

      await query(`DELETE FROM password_reset_tokens WHERE user_id = ?`, [user.id]);
      await query(`DELETE FROM password_reset_tokens WHERE used_at IS NOT NULL OR expires_at <= NOW()`);

      const insertResult = await query(
        `
          INSERT INTO password_reset_tokens (
            user_id,
            token,
            expires_at
          )
          VALUES (?, ?, ?)
        `,
        [user.id, storedToken, expiresAt],
      );

      try {
        await sendPasswordResetEmail({
          to: user.email,
          fullName: user.full_name || user.display_name || user.email,
          resetLink,
          expiresInMinutes: PASSWORD_RESET_DURATION_MINUTES,
          siteOrigin: request.nextUrl.origin,
        });
      } catch (mailError) {
        if (insertResult?.insertId) {
          await query(`DELETE FROM password_reset_tokens WHERE id = ?`, [insertResult.insertId]);
        }

        throw mailError;
      }
    }

    return NextResponse.json({
      message:
        'Nếu email tồn tại trong hệ thống, SRX Việt Nam sẽ gửi link đặt lại mật khẩu về hộp thư của bạn.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { message: 'Không thể gửi email đặt lại mật khẩu lúc này.' },
      { status: 500 },
    );
  }
}
