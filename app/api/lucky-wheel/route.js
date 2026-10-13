import { NextResponse } from 'next/server';
import {
  WHEEL_REFERRAL_COOKIE_NAME,
  getLuckyWheelSettings,
  getLuckyWheelUserState,
  getPublicPrizes,
  getWheelUserFromRequest,
} from '../../../src/lib/server/lucky-wheel.js';
import { resolveRequestOrigin } from '../../../src/lib/server/request-origin.js';
import { isZaloQrLoginEnabled } from '../../../src/lib/server/zalo-miniapp.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Dữ liệu cho nút + popup vòng quay. Khách chưa đăng nhập vẫn xem được phần thưởng;
 * đã đăng nhập thì kèm số lượt, link giới thiệu và phần thưởng đã trúng.
 */
export async function GET(request) {
  try {
    const settings = await getLuckyWheelSettings();

    if (!settings.enabled) {
      return NextResponse.json({ enabled: false });
    }

    const prizes = await getPublicPrizes();

    // Chưa có phần thưởng nào thì vòng quay không có gì để hiển thị: ẩn luôn nút.
    if (!prizes.length) {
      return NextResponse.json({ enabled: false });
    }

    const user = await getWheelUserFromRequest(request);
    const referralVisitorToken = request.cookies.get(WHEEL_REFERRAL_COOKIE_NAME)?.value;
    const userState = user
      ? await getLuckyWheelUserState(user, {
          settings,
          origin: resolveRequestOrigin(request),
          referralVisitorToken,
        })
      : null;

    const response = NextResponse.json({
      enabled: true,
      title: settings.title,
      description: settings.description,
      terms: settings.terms,
      referral: settings.referralEnabled
        ? {
            spins: settings.referralSpins,
            requiresActivation: settings.referralRequiresActivation,
          }
        : null,
      canLoginWithZalo: isZaloQrLoginEnabled(),
      prizes,
      user: userState,
    });

    // Cookie giới thiệu chỉ dùng một lần: đã đăng nhập là đã thử ghép xong.
    if (user && referralVisitorToken) {
      response.cookies.delete(WHEEL_REFERRAL_COOKIE_NAME);
    }

    return response;
  } catch (error) {
    console.error('Lucky wheel state error:', error);
    return NextResponse.json({ enabled: false }, { status: 500 });
  }
}
