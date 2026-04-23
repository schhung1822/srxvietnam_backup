/* eslint-disable react-refresh/only-export-components */
import NewsListMinimalPage from '../../src/views/news/NewsListMinimalPage.jsx';
import { getPublishedNews } from '../../src/lib/server/news.js';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Theo dòng SRX | SRX Beauty',
  description: 'Tin tức, sự kiện và kiến thức làm đẹp từ SRX.',
};

export default async function FollowSrxPage() {
  const articles = await getPublishedNews({ limit: 24 });

  return <NewsListMinimalPage initialArticles={articles} />;
}
