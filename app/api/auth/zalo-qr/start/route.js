import { NextResponse } from 'next/server';
import { getClientIp, getUserAgent } from '../../../../../src/lib/server/auth.js';
import {
  QR_LOGIN_COOKIE_NAME,
  createLoginTicket,
  getQrLoginCookieOptions,
  packQrLoginCookie,
  renderQrDataUrl,
  toExpiresAtIso,
} from '../../../../../src/lib/server/qr-login.js';
import { buildZaloMiniAppDeepLink, isZaloQrLoginEnabled } from '../../../../../src/lib/server/zalo-miniapp.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const NOT_CONFIGURED_MESSAGE =
  'Đăng nhập bằng QR Zalo chưa được cấu hình. Cần đặt ZALO_MINIAPP_ID hoặc ZALO_MINIAPP_DEEP_LINK_TEMPLATE.';

export async function POST(request) {
  try {
    if (!isZaloQrLoginEnabled()) {
      return NextResponse.json({ message: NOT_CONFIGURED_MESSAGE, code: 'zalo_not_configured' }, { status: 503 });
    }

    const body = await request.json().catch(() => ({}));

    const { ticket, secret, expiresInSeconds } = await createLoginTicket({
      nextPath: body.nextPath,
      ipAddress: getClientIp(request),
      userAgent: getUserAgent(request),
    });

    // Mã QR chỉ chứa deep link mở Mini App kèm ticket; không có gì bí mật trong đó.
    const scanUrl = buildZaloMiniAppDeepLink(ticket);

    if (!scanUrl) {
      return NextResponse.json({ message: NOT_CONFIGURED_MESSAGE, code: 'zalo_not_configured' }, { status: 503 });
    }

    const response = NextResponse.json({
      ticket,
      scanUrl,
      qrImage: await renderQrDataUrl(scanUrl),
      expiresAt: toExpiresAtIso(expiresInSeconds),
      expiresInSeconds,
      status: 'pending',
    });

    response.cookies.set(QR_LOGIN_COOKIE_NAME, packQrLoginCookie(ticket, secret), getQrLoginCookieOptions());
    return response;
  } catch (error) {
    if (error.code === 'rate_limited') {
      return NextResponse.json({ message: error.message, code: 'rate_limited' }, { status: 429 });
    }

    if (error.code === 'missing_migration') {
      console.error('Zalo QR start error:', error.message);
      return NextResponse.json({ message: error.message, code: 'missing_migration' }, { status: 503 });
    }

    console.error('Zalo QR start error:', error);
    return NextResponse.json({ message: 'Không thể tạo mã QR đăng nhập.' }, { status: 500 });
  }
}
