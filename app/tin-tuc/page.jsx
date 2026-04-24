import NewsListMinimalPage from '../../src/views/news/NewsListMinimalPage.jsx';
import { getPublishedNews } from '../../src/lib/server/news.js';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Tin tức | SRX Beauty',
  description: 'Tin tức và cập nhật mới nhất từ SRX.',
};

export default async function NewsCategoryPage() {
  const articles = await getPublishedNews({ limit: 24, categorySlug: 'tin-tuc' });

  return (
    <NewsListMinimalPage
      initialArticles={articles}
      pageTitle="Tin tức"
      showCategoryFilters={false}
      enableHydration={false}
      searchPlaceholder="Tìm theo tiêu đề hoặc nội dung bài viết"
    />
  );
}
