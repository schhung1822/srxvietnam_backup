import { NextResponse } from 'next/server';
import { searchPublishedNews } from '../../../../src/lib/server/news.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function normalizeLimit(value) {
  const parsedValue = Number.parseInt(value ?? '5', 10);

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return 5;
  }

  return Math.min(parsedValue, 12);
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') ?? '';
    const limit = normalizeLimit(searchParams.get('limit'));
    const articles = await searchPublishedNews(query, limit);

    return NextResponse.json({
      articles: articles.map((article) => ({
        id: article.id,
        slug: article.slug,
        title: article.title,
        category: article.category,
        excerpt: article.excerpt,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error.message ?? 'Không thể tải danh sách tin tức.',
        articles: [],
      },
      { status: 500 },
    );
  }
}
