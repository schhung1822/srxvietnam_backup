import { NextResponse } from 'next/server';
import {
  formatAffiliateUser,
  getAffiliateSnapshotForUser,
  getAuthenticatedUserFromRequest,
  upsertAffiliateBankAccountForUser,
} from '../../../../src/lib/server/affiliate.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PUT(request) {
  try {
    const user = await getAuthenticatedUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        { message: 'Vui lòng đăng nhập để cập nhật ngân hàng thụ hưởng.' },
        { status: 401 },
      );
    }

    const payload = await request.json();
    await upsertAffiliateBankAccountForUser(user.id, payload);
    const snapshot = await getAffiliateSnapshotForUser(user.id, request.nextUrl.origin);

    return NextResponse.json({
      message: 'Đã cập nhật thông tin ngân hàng.',
      user: formatAffiliateUser(user),
      snapshot,
    });
  } catch (error) {
    console.error('Affiliate bank account error:', error);
    const status = typeof error?.code === 'string' ? 500 : 400;

    return NextResponse.json(
      { message: error.message || 'Không thể cập nhật thông tin ngân hàng.' },
      { status },
    );
  }
}
