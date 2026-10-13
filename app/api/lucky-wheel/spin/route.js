import { NextResponse } from 'next/server';
import { getClientIp } from '../../../../src/lib/server/auth.js';
import { queueLuckyWheelZbsToCrm } from '../../../../src/lib/server/crm-web-notifications.js';
import {
  LuckyWheelError,
  getLuckyWheelSettings,
  getWheelUserFromRequest,
  spinLuckyWheel,
} from '../../../../src/lib/server/lucky-wheel.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Quay một lượt. Kết quả do server bốc; trình duyệt chỉ quay vòng tới đúng ô được trả về. */
export async function POST(request) {
  try {
    const settings = await getLuckyWheelSettings();

    if (!settings.enabled) {
      return NextResponse.json({ code: 'disabled', message: 'Vòng quay hiện đang tạm dừng.' }, { status: 403 });
    }

    const user = await getWheelUserFromRequest(request);

    if (!user) {
      return NextResponse.json({ code: 'login_required', message: 'Vui lòng đăng nhập để quay.' }, { status: 401 });
    }

    const { result, spinsLeft, sendZbs } = await spinLuckyWheel(user, {
      ipAddress: getClientIp(request),
      settings,
    });

    // Gửi mã voucher qua ZBS do crm-eac làm (token Zalo OA nằm ở CRM); không chờ để khách thấy kết quả ngay.
    if (sendZbs) {
      queueLuckyWheelZbsToCrm(result.id);
    }

    return NextResponse.json({ result, spinsLeft });
  } catch (error) {
    if (error instanceof LuckyWheelError) {
      return NextResponse.json({ code: error.code, message: error.message }, { status: error.status });
    }

    console.error('Lucky wheel spin error:', error);
    return NextResponse.json({ message: 'Không thể quay lúc này. Vui lòng thử lại.' }, { status: 500 });
  }
}
