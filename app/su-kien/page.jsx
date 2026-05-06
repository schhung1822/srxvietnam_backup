import EventsPage from '../../src/views/news/EventsPage.jsx';
import { getPublishedNews } from '../../src/lib/server/news.js';
import { buildMetadata } from '../../src/lib/seo.js';

export const dynamic = 'force-dynamic';

export const metadata = buildMetadata({
  title: 'Sự kiện',
  description: 'Danh sách sự kiện, hoạt động và chương trình nổi bật của SRX Việt Nam.',
  path: '/su-kien',
});

export default async function EventsRoutePage() {
  const articles = await getPublishedNews({ limit: 60, categorySlug: 'su-kien' });

  return <EventsPage initialEvents={articles} />;
}
