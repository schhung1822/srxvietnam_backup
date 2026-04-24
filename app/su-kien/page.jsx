import EventsPage from '../../src/views/news/EventsPage.jsx';
import { getPublishedNews } from '../../src/lib/server/news.js';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Sự kiện | SRX Beauty',
  description: 'Danh sách các bài viết và hoạt động thuộc danh mục sự kiện của SRX.',
};

export default async function EventsRoutePage() {
  const articles = await getPublishedNews({ limit: 60, categorySlug: 'su-kien' });

  return <EventsPage initialEvents={articles} />;
}
