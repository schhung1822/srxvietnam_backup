import NewsListMinimalPage from '../../src/views/news/NewsListMinimalPage.jsx';
import { getPublishedNews } from '../../src/lib/server/news.js';
import { buildMetadata } from '../../src/lib/seo.js';

export const dynamic = 'force-dynamic';

export const metadata = buildMetadata({
  title: 'Chủ đề khoa học về chăm sóc da',
  description:
    'Các bài viết chuyên sâu về khoa học làn da, hoạt chất mỹ phẩm, thành phần chăm sóc da và hướng dẫn sử dụng sản phẩm từ SRX Việt Nam.',
  path: '/chu-de-khoa-hoc',
  keywords: ['khoa học làn da', 'thành phần mỹ phẩm', 'hoạt chất chăm sóc da', 'kiến thức skincare SRX', 'SRX'],
});

export default async function ScientificTopicsPage() {
  const articles = await getPublishedNews({ limit: 120, categorySlug: 'kien-thuc' });

  return (
    <NewsListMinimalPage
      initialArticles={articles}
      pageTitle="Khám phá những kiến thức chuyên sâu, hướng dẫn và bài viết của chúng tôi."
      showCategoryFilters={false}
      enableHydration={false}
      searchPlaceholder="Tìm theo tiêu đề hoặc chủ đề khoa học"
      separateFeaturedArticles={false}
    />
  );
}
