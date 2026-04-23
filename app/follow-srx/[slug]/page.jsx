import { notFound } from 'next/navigation';
import NewsDetailMinimalPage from '../../../src/views/news/NewsDetailMinimalPage.jsx';
import { getNewsArticleBySlug } from '../../../src/lib/server/news.js';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = await getNewsArticleBySlug(slug);

  if (!article) {
    return {
      title: 'Không tìm thấy bài viết | SRX Beauty',
    };
  }

  return {
    title: `${article.title} | SRX Beauty`,
    description: article.excerpt,
  };
}

export default async function FollowSrxDetailPage({ params }) {
  const { slug } = await params;
  const article = await getNewsArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  return <NewsDetailMinimalPage article={article} />;
}
