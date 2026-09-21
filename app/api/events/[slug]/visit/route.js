import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { getPublishedLadipageEventBySlug } from '../../../../../src/lib/server/ladipage-events.js';
import { isValidVisitSessionId, recordLadipageVisit } from '../../../../../src/lib/server/ladipage-analytics.js';
import { resolveRequestOrigin } from '../../../../../src/lib/server/request-origin.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SESSION_COOKIE_NAME = 'srx_ladipage_visit_session';
const SESSION_MAX_AGE_SECONDS = 30 * 60;

export async function POST(request, { params }) {
  const requestOrigin = resolveRequestOrigin(request);
  const origin = request.headers.get('origin');

  if (request.headers.get('sec-fetch-site') === 'cross-site' || (origin && origin !== requestOrigin)) {
    return NextResponse.json({ message: 'Nguồn truy cập không hợp lệ.' }, { status: 403 });
  }

  try {
    const { slug } = await params;
    const event = await getPublishedLadipageEventBySlug(slug);

    if (!event) {
      return NextResponse.json({ message: 'Không tìm thấy landing page sự kiện.' }, { status: 404 });
    }

    const cookieSessionId = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const sessionId = isValidVisitSessionId(cookieSessionId) ? cookieSessionId : randomUUID();
    const recorded = await recordLadipageVisit({
      event,
      sessionId,
      userAgent: request.headers.get('user-agent'),
    });

    const response = NextResponse.json({ recorded });

    if (recorded) {
      response.cookies.set(SESSION_COOKIE_NAME, sessionId, {
        httpOnly: true,
        sameSite: 'lax',
        secure: new URL(requestOrigin).protocol === 'https:',
        path: '/api/events',
        maxAge: SESSION_MAX_AGE_SECONDS,
      });
    }

    return response;
  } catch (error) {
    console.error('Event landing visit tracking error:', error);
    return NextResponse.json({ message: 'Không thể ghi nhận lượt truy cập.' }, { status: 500 });
  }
}
