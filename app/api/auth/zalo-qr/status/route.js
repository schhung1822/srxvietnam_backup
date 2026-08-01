import { NextResponse } from 'next/server';
import {
  QR_LOGIN_COOKIE_NAME,
  findTicket,
  isSameSecret,
  isTicketExpired,
  expireTicket,
  resolveTicketStatus,
  toExpiresAtIso,
  unpackQrLoginCookie,
} from '../../../../../src/lib/server/qr-login.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const cookie = unpackQrLoginCookie(request.cookies.get(QR_LOGIN_COOKIE_NAME)?.value);

    if (!cookie) {
      return NextResponse.json({ status: 'expired', code: 'no_ticket' });
    }

    const row = await findTicket(cookie.ticket);

    // Secret sai nghĩa là cookie không thuộc ticket này -> không tiết lộ trạng thái thật.
    if (!row || !isSameSecret(cookie.secret, row.browser_secret_hash)) {
      return NextResponse.json({ status: 'expired', code: 'no_ticket' });
    }

    const status = resolveTicketStatus(row);

    if (status === 'expired' && isTicketExpired(row)) {
      await expireTicket(row.id);
    }

    return NextResponse.json({
      status,
      ticket: row.ticket,
      expiresAt: toExpiresAtIso(row.expires_in_seconds),
      scannedAt: row.scanned_at ? new Date(row.scanned_at).toISOString() : null,
    });
  } catch (error) {
    console.error('Zalo QR status error:', error);
    return NextResponse.json({ message: 'Không thể kiểm tra trạng thái mã QR.' }, { status: 500 });
  }
}
