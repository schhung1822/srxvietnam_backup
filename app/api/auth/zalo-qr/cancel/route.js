import { NextResponse } from 'next/server';
import {
  QR_LOGIN_COOKIE_NAME,
  cancelTicket,
  findTicket,
  isSameSecret,
  normalizeTicket,
  unpackQrLoginCookie,
} from '../../../../../src/lib/server/qr-login.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Người dùng đóng popup: vô hiệu hóa mã QR ngay thay vì để nó sống hết 5 phút.
 */
export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const requestedTicket = normalizeTicket(body.ticket);
    const cookie = unpackQrLoginCookie(request.cookies.get(QR_LOGIN_COOKIE_NAME)?.value);

    if (!cookie) {
      return NextResponse.json({ ok: true });
    }

    // Yêu cầu hủy mã cũ đến muộn hơn lúc mã mới đã được tạo: bỏ qua, nếu không sẽ
    // hủy nhầm mã đang hiển thị và xóa mất cookie của nó.
    if (requestedTicket && requestedTicket !== cookie.ticket) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const response = NextResponse.json({ ok: true });

    response.cookies.delete(QR_LOGIN_COOKIE_NAME);

    const row = await findTicket(cookie.ticket);

    if (row && isSameSecret(cookie.secret, row.browser_secret_hash)) {
      await cancelTicket(row.id);
    }

    return response;
  } catch (error) {
    console.error('Zalo QR cancel error:', error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
