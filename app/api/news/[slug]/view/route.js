import { NextResponse } from 'next/server';
import { incrementPublishedNewsViewCountBySlug } from '../../../../../src/lib/server/news.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(_request, { params }) {
  try {
    const { slug } = await params;
    const didIncrement = await incrementPublishedNewsViewCountBySlug(slug);

    if (!didIncrement) {
      return NextResponse.json({ message: 'Không tìm thấy bài viết.' }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        message: error.message ?? 'Không thể cập nhật lượt xem bài viết.',
      },
      { status: 500 },
    );
  }
}
