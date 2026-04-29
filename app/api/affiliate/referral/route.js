import { NextResponse } from 'next/server';
import {
  AFFILIATE_REFERRAL_COOKIE_NAME,
  AFFILIATE_VISITOR_COOKIE_NAME,
  getAffiliateCookieMaxAgeSeconds,
  getAuthenticatedUserFromRequest,
  normalizeAffiliateCode,
  normalizeAffiliateVisitorToken,
  registerAffiliateClickFromRequest,
} from '../../../../src/lib/server/affiliate.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function buildCookieOptions(request, maxAge) {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: request.nextUrl.protocol === 'https:',
    path: '/',
    maxAge,
  };
}

export async function POST(request) {
  try {
    const payload = await request.json();
    const affiliateCode = normalizeAffiliateCode(payload?.code);

    if (!affiliateCode) {
      return NextResponse.json({ message: 'Mã affiliate không hợp lệ.' }, { status: 400 });
    }

    const user = await getAuthenticatedUserFromRequest(request);
    const existingVisitorToken = normalizeAffiliateVisitorToken(
      request.cookies.get(AFFILIATE_VISITOR_COOKIE_NAME)?.value,
    );
    const trackingResult = await registerAffiliateClickFromRequest({
      request,
      affiliateCode,
      customerUserId: user?.id ?? null,
      visitorToken: existingVisitorToken,
      landingUrl: payload?.landingUrl,
      referrerUrl: payload?.referrerUrl,
    });

    if (!trackingResult) {
      return NextResponse.json({ message: 'Không tìm thấy mã affiliate.' }, { status: 404 });
    }

    if (trackingResult.status === 'ignored' && trackingResult.reason === 'self_referral') {
      return NextResponse.json({
        message: 'Bỏ qua self-referral.',
        ignored: true,
        reason: 'self_referral',
      });
    }

    const maxAge = getAffiliateCookieMaxAgeSeconds(trackingResult.cookieDurationDays);
    const response = NextResponse.json({
      message: 'Đã ghi nhận lượt truy cập affiliate.',
      tracked: true,
    });

    response.cookies.set(
      AFFILIATE_REFERRAL_COOKIE_NAME,
      trackingResult.account.affiliate_code,
      buildCookieOptions(request, maxAge),
    );
    response.cookies.set(
      AFFILIATE_VISITOR_COOKIE_NAME,
      trackingResult.visitorToken,
      buildCookieOptions(request, maxAge),
    );

    return response;
  } catch (error) {
    console.error('Affiliate referral tracking error:', error);
    return NextResponse.json({ message: 'Không thể ghi nhận affiliate lúc này.' }, { status: 500 });
  }
}
