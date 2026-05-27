import NewsEventsHubPage from '../../src/views/news/NewsEventsHubPage.jsx';
import { getPublishedNews } from '../../src/lib/server/news.js';
import { buildMetadata } from '../../src/lib/seo.js';

export const dynamic = 'force-dynamic';

export const metadata = buildMetadata({
  title: 'Tin tức & Sự kiện',
  description:
    'Trang tổng hợp tin tức và sự kiện của SRX Việt Nam, hiển thị trên cùng một giao diện thống nhất theo bố cục trang sự kiện.',
  path: '/tin-tuc',
});

export default async function NewsCategoryPage() {
  const articles = await getPublishedNews({
    limit: 120,
    categorySlugs: ['tin-tuc', 'su-kien'],
  });

  return <NewsEventsHubPage initialArticles={articles} />;
}
