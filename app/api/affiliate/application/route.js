import { NextResponse } from 'next/server';
import {
  formatAffiliateUser,
  getAffiliateSnapshotForUser,
  getAuthenticatedUserFromRequest,
  upsertAffiliateApplicationForUser,
} from '../../../../src/lib/server/affiliate.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function handleUpsert(request) {
  try {
    const user = await getAuthenticatedUserFromRequest(request);

    if (!user) {
      return NextResponse.json({ message: 'Vui lòng đăng nhập để đăng ký affiliate.' }, { status: 401 });
    }

    const payload = await request.json();
    const normalizedPayload = await upsertAffiliateApplicationForUser(user, payload);
    const snapshot = await getAffiliateSnapshotForUser(user.id, request.nextUrl.origin);
    const updatedUser = {
      ...user,
      full_name: normalizedPayload.legalFullName,
      phone: normalizedPayload.contactPhone,
      gender: normalizedPayload.gender,
    };

    return NextResponse.json({
      message: 'Đã lưu hồ sơ affiliate.',
      user: formatAffiliateUser(updatedUser),
      snapshot,
    });
  } catch (error) {
    console.error('Affiliate application error:', error);
    const status = typeof error?.code === 'string' ? 500 : 400;

    return NextResponse.json(
      { message: error.message || 'Không thể lưu hồ sơ affiliate.' },
      { status },
    );
  }
}

export async function POST(request) {
  return handleUpsert(request);
}

export async function PATCH(request) {
  return handleUpsert(request);
}
