import { NextResponse } from 'next/server';
import { getDbPool, query } from '../../../../src/lib/server/db.js';
import {
  hashPassword,
  hashPasswordResetToken,
  normalizePasswordResetToken,
  validatePassword,
  verifyPassword,
} from '../../../../src/lib/server/auth.js';

export const runtime = 'nodejs';

async function findValidResetTokenRow(tokenHash) {
  const rows = await query(
    `
      SELECT
        prt.id,
        prt.user_id
      FROM password_reset_tokens prt
      INNER JOIN users u ON u.id = prt.user_id
      WHERE prt.token = ?
        AND prt.used_at IS NULL
        AND prt.expires_at > NOW()
        AND u.deleted_at IS NULL
      LIMIT 1
    `,
    [tokenHash],
  );

  return rows[0] ?? null;
}

export async function GET(request) {
  try {
    const token = normalizePasswordResetToken(request.nextUrl.searchParams.get('token'));

    if (!token) {
      return NextResponse.json({ valid: false, message: 'Link đặt lại mật khẩu không hợp lệ.' }, { status: 400 });
    }

    const tokenRow = await findValidResetTokenRow(hashPasswordResetToken(token));

    if (!tokenRow) {
      return NextResponse.json(
        { valid: false, message: 'Link đặt lại mật khẩu đã hết hạn hoặc không còn hiệu lực.' },
        { status: 404 },
      );
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error('Reset password validation error:', error);
    return NextResponse.json(
      { valid: false, message: 'Không thể kiểm tra link đặt lại mật khẩu.' },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  const pool = getDbPool();
  const connection = await pool.getConnection();

  try {
    const body = await request.json();
    const token = normalizePasswordResetToken(body?.token);
    const newPassword = String(body?.newPassword ?? '');

    if (!token) {
      return NextResponse.json({ message: 'Link đặt lại mật khẩu không hợp lệ.' }, { status: 400 });
    }

    if (!validatePassword(newPassword)) {
      return NextResponse.json(
        { message: 'Mật khẩu mới phải có ít nhất 8 ký tự.' },
        { status: 400 },
      );
    }

    await connection.beginTransaction();

    const [rows] = await connection.execute(
      `
        SELECT
          prt.id,
          prt.user_id,
          u.password_hash
        FROM password_reset_tokens prt
        INNER JOIN users u ON u.id = prt.user_id
        WHERE prt.token = ?
          AND prt.used_at IS NULL
          AND prt.expires_at > NOW()
          AND u.deleted_at IS NULL
        LIMIT 1
      `,
      [hashPasswordResetToken(token)],
    );

    const tokenRow = rows[0] ?? null;

    if (!tokenRow) {
      await connection.rollback();
      return NextResponse.json(
        { message: 'Link đặt lại mật khẩu đã hết hạn hoặc không còn hiệu lực.' },
        { status: 400 },
      );
    }

    if (verifyPassword(newPassword, tokenRow.password_hash)) {
      await connection.rollback();
      return NextResponse.json(
        { message: 'Mật khẩu mới cần khác mật khẩu hiện tại.' },
        { status: 400 },
      );
    }

    await connection.execute(
      `
        UPDATE users
        SET password_hash = ?, updated_at = NOW()
        WHERE id = ?
      `,
      [hashPassword(newPassword), tokenRow.user_id],
    );

    await connection.execute(
      `
        UPDATE password_reset_tokens
        SET used_at = NOW()
        WHERE user_id = ?
          AND used_at IS NULL
      `,
      [tokenRow.user_id],
    );

    await connection.execute(`DELETE FROM user_sessions WHERE user_id = ?`, [tokenRow.user_id]);
    await connection.commit();

    return NextResponse.json({
      message: 'Mật khẩu đã được đặt lại thành công. Bạn có thể đăng nhập bằng mật khẩu mới.',
    });
  } catch (error) {
    await connection.rollback();
    console.error('Reset password error:', error);
    return NextResponse.json(
      { message: 'Không thể đặt lại mật khẩu lúc này.' },
      { status: 500 },
    );
  } finally {
    connection.release();
  }
}
