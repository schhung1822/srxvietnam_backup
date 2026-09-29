import NewsListMinimalPage from '../../src/views/news/NewsListMinimalPage.jsx';
import { getPublishedNews } from '../../src/lib/server/news.js';
import { buildMetadata } from '../../src/lib/seo.js';

export const dynamic = 'force-dynamic';

export const metadata = buildMetadata({
  title: 'Theo dòng SRX - Kiến thức chăm sóc da & tin tức',
  description:
    'Khám phá tin tức, kiến thức làm đẹp và cập nhật mới nhất từ SRX Việt Nam.',
  path: '/follow-srx',
  keywords: ['kiến thức chăm sóc da', 'blog skincare', 'routine chăm sóc da', 'tin tức SRX'],
});

export default async function FollowSrxPage() {
  const articles = await getPublishedNews({ limit: 24 });

  return <NewsListMinimalPage initialArticles={articles} />;
}
