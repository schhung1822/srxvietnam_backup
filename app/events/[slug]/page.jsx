import { notFound } from 'next/navigation';
import JsonLd from '../../../src/components/SEO/JsonLd.jsx';
import EventLandingRenderer from '../../../src/components/ladipage/EventLandingRenderer.jsx';
import { getPublishedLadipageEventBySlug } from '../../../src/lib/server/ladipage-events.js';
import { SITE_NAME, absoluteUrl, buildMetadata, createBreadcrumbSchema } from '../../../src/lib/seo.js';

export const dynamic = 'force-dynamic';

function normalizeText(value) {
  return String(value ?? '').trim();
}

function buildEventDescription(event) {
  const contentParts = [
    event.config.header.descText,
    event.config.header.subtitleText,
    event.config.infoEvent.headline,
    event.config.infoEvent.motto,
    event.config.infoEvent.organizerText,
  ].filter(Boolean);

  if (!contentParts.length) {
    return `${event.eventName} từ ${SITE_NAME}. Đăng ký tham gia sự kiện tại SRX Việt Nam.`;
  }

  return contentParts.join(' - ');
}

function buildEventStartDate(event) {
  const day = normalizeText(event.config.footer.dateDay).padStart(2, '0');
  const month = normalizeText(event.config.footer.dateMonth).padStart(2, '0');
  const year = normalizeText(event.config.footer.dateYear);

  if (!day || !month || !year) {
    return undefined;
  }

  const isoDate = `${year}-${month}-${day}T00:00:00+07:00`;
  const parsedDate = new Date(isoDate);

  if (Number.isNaN(parsedDate.getTime())) {
    return undefined;
  }

  return parsedDate.toISOString();
}

function compactObject(value) {
  return Object.fromEntries(
    Object.entries(value).filter(([, entryValue]) => {
      if (entryValue === undefined || entryValue === null || entryValue === '') {
        return false;
      }

      if (Array.isArray(entryValue)) {
        return entryValue.length > 0;
      }

      return true;
    }),
  );
}

function createEventStructuredData(event) {
  const locationAddress = [event.config.footer.placeLine1, event.config.footer.placeLine2]
    .filter(Boolean)
    .join(', ');
  const imageUrl =
    normalizeText(event.config.header.headingImageUrl) ||
    normalizeText(event.config.infoEvent.logo1Url) ||
    undefined;

  return compactObject({
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.config.header.titleText || event.eventName,
    description: buildEventDescription(event),
    url: absoluteUrl(event.path),
    image: imageUrl ? [imageUrl] : undefined,
    startDate: buildEventStartDate(event),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location:
      event.config.footer.placeName || locationAddress
        ? compactObject({
            '@type': 'Place',
            name: event.config.footer.placeName || event.eventName,
            address: locationAddress || undefined,
          })
        : undefined,
    organizer: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: absoluteUrl('/'),
    },
  });
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const event = await getPublishedLadipageEventBySlug(slug);

  if (!event) {
    return buildMetadata({
      title: 'Không tìm thấy sự kiện',
      path: `/events/${slug}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: event.config.header.titleText || event.eventName,
    description: buildEventDescription(event),
    path: event.path,
    image: event.config.header.headingImageUrl || undefined,
    keywords: [event.eventName, event.name, 'sự kiện SRX Việt Nam', 'landing page sự kiện'],
  });
}

export default async function EventLandingPage({ params }) {
  const { slug } = await params;
  const event = await getPublishedLadipageEventBySlug(slug);

  if (!event) {
    notFound();
  }

  return (
    <>
      <JsonLd
        data={[
          createBreadcrumbSchema([
            { name: 'Trang chủ', path: '/' },
            { name: 'Sự kiện', path: '/su-kien' },
            { name: event.config.header.titleText || event.eventName, path: event.path },
          ]),
          createEventStructuredData(event),
        ]}
        idPrefix="event-landing-seo"
      />
      <EventLandingRenderer event={event} />
    </>
  );
}
