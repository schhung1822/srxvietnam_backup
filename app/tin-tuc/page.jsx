import NewsListMinimalPage from '../../src/views/news/NewsListMinimalPage.jsx';
import { getPublishedNews } from '../../src/lib/server/news.js';
import { buildMetadata } from '../../src/lib/seo.js';

export const dynamic = 'force-dynamic';

export const metadata = buildMetadata({
  title: 'Tin tức',
  description:
    'Tin tức và cập nhật mới nhất từ SRX Việt Nam về thương hiệu, sản phẩm và hoạt động nổi bật.',
  path: '/tin-tuc',
});

export default async function NewsCategoryPage() {
  const articles = await getPublishedNews({ limit: 24, categorySlug: 'tin-tuc' });

  return (
    <NewsListMinimalPage
      initialArticles={articles}
      pageTitle="Tin tức"
      showCategoryFilters={false}
      enableHydration={false}
      searchPlaceholder="Tìm theo tiêu đề hoặc nội dung bài viết"
      showTopFeatureSection
    />
  );
}
