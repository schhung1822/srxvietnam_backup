import { notFound } from 'next/navigation';
import NewsDetailMinimalPage from '../../../src/views/news/NewsDetailMinimalPage.jsx';
import JsonLd from '../../../src/components/SEO/JsonLd.jsx';
import { getNewsArticleBySlug } from '../../../src/lib/server/news.js';
import {
  buildMetadata,
  createArticleSchema,
  createBreadcrumbSchema,
} from '../../../src/lib/seo.js';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = await getNewsArticleBySlug(slug);

  if (!article) {
    return buildMetadata({
      title: 'Không tìm thấy bài viết',
      path: `/follow-srx/${slug}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: article.title,
    description: article.excerpt,
    path: `/follow-srx/${slug}`,
    image: article.coverImage,
    type: 'article',
    publishedTime: article.publishedAt,
    section: article.category,
    keywords: article.tags ?? [],
  });
}

export default async function FollowSrxDetailPage({ params }) {
  const { slug } = await params;
  const article = await getNewsArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const isMergedNewsEventCategory =
    article.categorySlug === 'tin-tuc' || article.categorySlug === 'su-kien';
  const listPath = isMergedNewsEventCategory ? '/tin-tuc' : '/follow-srx';
  const listLabel = isMergedNewsEventCategory ? 'Tin tức & Sự kiện' : 'Theo dòng SRX';

  return (
    <>
      <JsonLd
        data={[
          createBreadcrumbSchema([
            { name: 'Trang chủ', path: '/' },
            { name: listLabel, path: listPath },
            { name: article.title, path: `/follow-srx/${article.slug}` },
          ]),
          createArticleSchema(article),
        ]}
        idPrefix="article-seo"
      />
      <NewsDetailMinimalPage article={article} />
    </>
  );
}
