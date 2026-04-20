import { NextResponse } from 'next/server';
import {
  hashPassword,
  validatePassword,
  verifyPassword,
} from '../../../../src/lib/server/auth.js';
import { getAuthenticatedUserRow } from '../../../../src/lib/server/account.js';
import { query } from '../../../../src/lib/server/db.js';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const user = await getAuthenticatedUserRow(request, { includePasswordHash: true });

    if (!user) {
      return NextResponse.json({ message: 'Vui lòng đăng nhập để tiếp tục.' }, { status: 401 });
    }

    const body = await request.json();
    const currentPassword = String(body.currentPassword ?? '');
    const newPassword = String(body.newPassword ?? '');

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: 'Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới.' },
        { status: 400 },
      );
    }

    if (!verifyPassword(currentPassword, user.password_hash)) {
      return NextResponse.json({ message: 'Mật khẩu hiện tại không chính xác.' }, { status: 400 });
    }

    if (!validatePassword(newPassword)) {
      return NextResponse.json(
        { message: 'Mật khẩu mới phải có ít nhất 8 ký tự.' },
        { status: 400 },
      );
    }

    if (verifyPassword(newPassword, user.password_hash)) {
      return NextResponse.json(
        { message: 'Mật khẩu mới cần khác mật khẩu hiện tại.' },
        { status: 400 },
      );
    }

    await query(
      `
        UPDATE users
        SET password_hash = ?, updated_at = NOW()
        WHERE id = ?
      `,
      [hashPassword(newPassword), user.id],
    );

    return NextResponse.json({ message: 'Mật khẩu đã được cập nhật thành công.' });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json({ message: 'Không thể đổi mật khẩu.' }, { status: 500 });
  }
}
