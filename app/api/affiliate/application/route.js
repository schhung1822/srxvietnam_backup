import { NextResponse } from 'next/server';
import {
  formatAffiliateUser,
  getAffiliateSnapshotForUser,
  getAuthenticatedUserFromRequest,
  upsertAffiliateApplicationForUser,
} from '../../../../src/lib/server/affiliate.js';
import { sendAffiliateApplicationSubmittedNotification } from '../../../../src/lib/server/lark.js';
import { sendAffiliateApplicationReceivedEmail } from '../../../../src/lib/server/mail.js';

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

    if (normalizedPayload.shouldNotifyPendingReview) {
      try {
        await sendAffiliateApplicationSubmittedNotification({
          user: updatedUser,
          application: snapshot?.application ?? {
            legalFullName: normalizedPayload.legalFullName,
            permanentAddress: normalizedPayload.permanentAddress,
            nationalIdNumber: normalizedPayload.nationalIdNumber,
            contactPhone: normalizedPayload.contactPhone,
            contactEmail: normalizedPayload.contactEmail,
            gender: normalizedPayload.gender,
            facebookUrl: normalizedPayload.facebookUrl,
            tiktokUrl: normalizedPayload.tiktokUrl,
            status: normalizedPayload.currentStatus,
          },
          source: 'Website SRX Viet Nam',
          resubmitted: normalizedPayload.isResubmission,
        });
        console.log('Affiliate application Lark notification sent:', normalizedPayload.contactEmail);
      } catch (notificationError) {
        console.error('Affiliate application Lark notification error:', notificationError);
      }

      try {
        await sendAffiliateApplicationReceivedEmail({
          to: normalizedPayload.contactEmail,
          application: snapshot?.application ?? {
            legalFullName: normalizedPayload.legalFullName,
            permanentAddress: normalizedPayload.permanentAddress,
            nationalIdNumber: normalizedPayload.nationalIdNumber,
            contactPhone: normalizedPayload.contactPhone,
            contactEmail: normalizedPayload.contactEmail,
            gender: normalizedPayload.gender,
            facebookUrl: normalizedPayload.facebookUrl,
            tiktokUrl: normalizedPayload.tiktokUrl,
          },
          resubmitted: normalizedPayload.isResubmission,
          siteOrigin: request.nextUrl.origin,
        });
      } catch (mailError) {
        console.error('Affiliate application email error:', mailError);
      }
    }

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
