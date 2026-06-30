import NewsEventsHubPage from '../../src/views/news/NewsEventsHubPage.jsx';
import { getPublishedNews } from '../../src/lib/server/news.js';
import { buildMetadata } from '../../src/lib/seo.js';

export const dynamic = 'force-dynamic';

export const metadata = buildMetadata({
  title: 'Tin tức và sự kiện SRX',
  description:
    'Cập nhật tin tức, sự kiện, hoạt động thương hiệu và kiến thức chăm sóc da từ SRX Việt Nam.',
  path: '/tin-tuc',
  keywords: ['tin tức SRX', 'sự kiện SRX', 'SRX Việt Nam', 'kiến thức chăm sóc da','SRX'],
});

export default async function NewsCategoryPage() {
  const articles = await getPublishedNews({
    limit: 120,
    categorySlugs: ['tin-tuc', 'su-kien'],
  });

  return <NewsEventsHubPage initialArticles={articles} />;
}
