import NewsListMinimalPage from '../../src/views/news/NewsListMinimalPage.jsx';
import { getPublishedNews } from '../../src/lib/server/news.js';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Chủ đề khoa học | SRX Beauty',
  description: 'Các bài viết chuyên sâu về khoa học làn da và thành phần từ SRX.',
};

export default async function ScientificTopicsPage() {
  const articles = await getPublishedNews({ limit: 24, categorySlug: 'kien-thuc' });

  return (
    <NewsListMinimalPage
      initialArticles={articles}
      pageTitle="Khám phá những kiến ​​thức chuyên sâu, hướng dẫn và bài viết của chúng tôi."
      showCategoryFilters={false}
      enableHydration={false}
      searchPlaceholder="Tìm theo tiêu đề hoặc chủ đề khoa học"
    />
  );
}
