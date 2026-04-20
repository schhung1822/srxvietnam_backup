import { NextResponse } from 'next/server';
import {
  formatAffiliateUser,
  getAffiliateSnapshotForUser,
  getAuthenticatedUserFromRequest,
} from '../../../../src/lib/server/affiliate.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const user = await getAuthenticatedUserFromRequest(request);

    if (!user) {
      return NextResponse.json({ message: 'Vui lòng đăng nhập để truy cập khu vực affiliate.' }, { status: 401 });
    }

    const snapshot = await getAffiliateSnapshotForUser(user.id, request.nextUrl.origin);

    return NextResponse.json({
      user: formatAffiliateUser(user),
      snapshot,
    });
  } catch (error) {
    console.error('Affiliate me error:', error);
    return NextResponse.json(
      { message: 'Không thể tải thông tin affiliate lúc này.' },
      { status: 500 },
    );
  }
}
