import { NextResponse } from 'next/server';
import { getPublishedNews } from '../../../../src/lib/server/news.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(12, Math.max(1, Number(searchParams.get('limit')) || 3));
  const articles = await getPublishedNews({ limit });

  return NextResponse.json({
    articles,
  });
}
