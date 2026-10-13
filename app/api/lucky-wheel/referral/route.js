import { NextResponse } from 'next/server';
import {
  WHEEL_REFERRAL_COOKIE_MAX_AGE_SECONDS,
  WHEEL_REFERRAL_COOKIE_NAME,
  getLuckyWheelSettings,
  getWheelUserFromRequest,
  recordReferralVisit,
} from '../../../../src/lib/server/lucky-wheel.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Khách mở link ?wheel_ref=<mã>: ghi nhận lượt mở và nhớ vào cookie để ghép khi họ tạo tài khoản. */
export async function POST(request) {
  try {
    const settings = await getLuckyWheelSettings();

    if (!settings.enabled || !settings.referralEnabled) {
      return NextResponse.json({ tracked: false, reason: 'disabled' });
    }

    // Đang đăng nhập tức là đã có tài khoản, không còn là khách mới để tính giới thiệu.
    if (await getWheelUserFromRequest(request)) {
      return NextResponse.json({ tracked: false, reason: 'signed_in' });
    }

    const payload = await request.json().catch(() => ({}));
    const visitorToken = await recordReferralVisit({
      code: payload?.code,
      existingToken: request.cookies.get(WHEEL_REFERRAL_COOKIE_NAME)?.value,
    });

    if (!visitorToken) {
      return NextResponse.json({ tracked: false, reason: 'unknown_code' }, { status: 404 });
    }

    const response = NextResponse.json({ tracked: true });

    response.cookies.set(WHEEL_REFERRAL_COOKIE_NAME, visitorToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: WHEEL_REFERRAL_COOKIE_MAX_AGE_SECONDS,
    });

    return response;
  } catch (error) {
    if (error?.code !== 'ER_NO_SUCH_TABLE') {
      console.error('Lucky wheel referral error:', error);
    }

    return NextResponse.json({ tracked: false }, { status: 500 });
  }
}
