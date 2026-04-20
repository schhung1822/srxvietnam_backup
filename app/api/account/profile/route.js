import { NextResponse } from 'next/server';
import { formatUser, normalizeEmail, validateName } from '../../../../src/lib/server/auth.js';
import { getAuthenticatedUserRow } from '../../../../src/lib/server/account.js';
import { query } from '../../../../src/lib/server/db.js';

export const runtime = 'nodejs';

function normalizeOptionalString(value) {
  const nextValue = String(value ?? '').trim();
  return nextValue || null;
}

export async function PATCH(request) {
  try {
    const user = await getAuthenticatedUserRow(request);

    if (!user) {
      return NextResponse.json({ message: 'Vui lòng đăng nhập để tiếp tục.' }, { status: 401 });
    }

    const body = await request.json();
    const fullName = String(body.fullName ?? '').trim();
    const displayName = normalizeOptionalString(body.displayName);
    const email = normalizeEmail(body.email);
    const phone = normalizeOptionalString(body.phone);

    if (!validateName(fullName)) {
      return NextResponse.json({ message: 'Họ và tên chưa hợp lệ.' }, { status: 400 });
    }

    if (!email) {
      return NextResponse.json({ message: 'Email là bắt buộc.' }, { status: 400 });
    }

    const duplicatedUsers = await query(
      `
        SELECT id
        FROM users
        WHERE deleted_at IS NULL
          AND id <> ?
          AND (email = ? OR (? IS NOT NULL AND phone = ?))
        LIMIT 1
      `,
      [user.id, email, phone, phone],
    );

    if (duplicatedUsers.length) {
      return NextResponse.json(
        { message: 'Email hoặc số điện thoại đã được sử dụng.' },
        { status: 409 },
      );
    }

    await query(
      `
        UPDATE users
        SET
          full_name = ?,
          display_name = ?,
          email = ?,
          phone = ?,
          updated_at = NOW()
        WHERE id = ?
      `,
      [fullName, displayName, email, phone, user.id],
    );

    const updatedUsers = await query(
      `
        SELECT
          id,
          email,
          phone,
          full_name,
          display_name,
          status,
          avatar_url,
          created_at
        FROM users
        WHERE id = ?
        LIMIT 1
      `,
      [user.id],
    );

    return NextResponse.json({
      message: 'Thông tin tài khoản đã được cập nhật.',
      user: formatUser(updatedUsers[0]),
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { message: 'Không thể cập nhật thông tin tài khoản.' },
      { status: 500 },
    );
  }
}
