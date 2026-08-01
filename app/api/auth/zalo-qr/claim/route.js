import { NextResponse } from 'next/server';
import { query } from '../../../../../src/lib/server/db.js';
import { SESSION_COOKIE_NAME, formatUser, getSessionCookieOptions } from '../../../../../src/lib/server/auth.js';
import {
  QR_LOGIN_COOKIE_NAME,
  claimTicketSession,
  findTicket,
  isSameSecret,
  resolveTicketStatus,
  toExpiresAtIso,
  unpackQrLoginCookie,
} from '../../../../../src/lib/server/qr-login.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Bước cuối: trình duyệt đổi ticket đã được mini app xác nhận lấy cookie phiên đăng nhập.
 * Phải làm ở đây (thay vì trong endpoint confirm của mini app) vì cookie chỉ set được
 * trên response gửi về đúng trình duyệt đó.
 */
export async function POST(request) {
  try {
    const cookie = unpackQrLoginCookie(request.cookies.get(QR_LOGIN_COOKIE_NAME)?.value);

    if (!cookie) {
      return NextResponse.json({ message: 'Phiên quét mã đã kết thúc.', code: 'no_ticket' }, { status: 400 });
    }

    const row = await findTicket(cookie.ticket);

    if (!row || !isSameSecret(cookie.secret, row.browser_secret_hash)) {
      return NextResponse.json({ message: 'Phiên quét mã không hợp lệ.', code: 'no_ticket' }, { status: 400 });
    }

    const status = resolveTicketStatus(row);

    if (status !== 'confirmed') {
      return NextResponse.json({ message: 'Mã QR chưa được xác nhận.', code: status }, { status: 409 });
    }

    const claimed = await claimTicketSession(row.id);

    if (!claimed?.session_token) {
      return NextResponse.json({ message: 'Mã QR đã được sử dụng.', code: 'already_claimed' }, { status: 409 });
    }

    // Lấy số giây còn lại do MySQL tính, không đọc thẳng cột DATETIME: Node và MySQL
    // có thể khác múi giờ nên hạn của cookie sẽ lệch nếu tự quy đổi ở tầng JS.
    const sessions = await query(
      `SELECT TIMESTAMPDIFF(SECOND, NOW(), expires_at) AS expires_in_seconds
        FROM user_sessions
        WHERE session_token = ? AND expires_at > NOW()
        LIMIT 1`,
      [claimed.session_token],
    );

    if (!sessions.length) {
      return NextResponse.json({ message: 'Phiên đăng nhập đã hết hạn.', code: 'session_expired' }, { status: 409 });
    }

    const users = await query(
      `SELECT id, email, phone, full_name, display_name, status, avatar_url, created_at
        FROM users
        WHERE id = ? AND deleted_at IS NULL
        LIMIT 1`,
      [claimed.user_id],
    );

    if (!users.length) {
      return NextResponse.json({ message: 'Không tìm thấy tài khoản.', code: 'user_not_found' }, { status: 404 });
    }

    const response = NextResponse.json({ user: formatUser(users[0]), nextPath: claimed.next_path ?? '/account' });

    response.cookies.set(
      SESSION_COOKIE_NAME,
      claimed.session_token,
      getSessionCookieOptions(new Date(toExpiresAtIso(sessions[0].expires_in_seconds))),
    );
    response.cookies.delete(QR_LOGIN_COOKIE_NAME);
    return response;
  } catch (error) {
    console.error('Zalo QR claim error:', error);
    return NextResponse.json({ message: 'Không thể hoàn tất đăng nhập bằng QR.' }, { status: 500 });
  }
}
