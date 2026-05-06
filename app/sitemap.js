import {
  getCatalogProducts,
  getProductTagDictionaryEntries,
} from '../src/lib/server/products.js';
import { getPublishedLadipageEventEntries } from '../src/lib/server/ladipage-events.js';
import { getPublishedNews } from '../src/lib/server/news.js';
import { absoluteUrl } from '../src/lib/seo.js';

export const revalidate = 3600;

const staticRoutes = [
  { path: '/', changeFrequency: 'daily', priority: 1 },
  { path: '/about', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/products', changeFrequency: 'daily', priority: 0.9 },
  { path: '/key-srx', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/follow-srx', changeFrequency: 'daily', priority: 0.8 },
  { path: '/tin-tuc', changeFrequency: 'daily', priority: 0.8 },
  { path: '/su-kien', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/chu-de-khoa-hoc', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/affiliate', changeFrequency: 'weekly', priority: 0.6 },
  { path: '/chinh-sach-affiliate', changeFrequency: 'monthly', priority: 0.4 },
  { path: '/contact', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/faqs', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/chinh-sach-bao-mat', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/chinh-sach-giao-hang', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/chinh-sach-hoan-tra', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/dieu-khoan', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/quy-dinh-thanh-toan', changeFrequency: 'yearly', priority: 0.3 },
];

function toDate(value) {
  if (!value) {
    return new Date();
  }

  const parsedDate = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
}

export default async function sitemap() {
  const [products, productTags, articles, eventEntries] = await Promise.all([
    getCatalogProducts(),
    getProductTagDictionaryEntries(),
    getPublishedNews({ limit: 500 }),
    getPublishedLadipageEventEntries(),
  ]);

  return [
    ...staticRoutes.map((route) => ({
      url: absoluteUrl(route.path),
      lastModified: new Date(),
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...products.map((product) => ({
      url: absoluteUrl(`/products/${product.slug}`),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    })),
    ...productTags.map((tag) => ({
      url: absoluteUrl(`/products/${tag.slug}`),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    })),
    ...articles.map((article) => ({
      url: absoluteUrl(`/follow-srx/${article.slug}`),
      lastModified: toDate(article.publishedAt),
      changeFrequency: 'monthly',
      priority: 0.7,
    })),
    ...eventEntries.map((eventEntry) => ({
      url: absoluteUrl(`/events/${eventEntry.slug}`),
      lastModified: toDate(eventEntry.updatedAt ?? eventEntry.publishedAt),
      changeFrequency: 'weekly',
      priority: 0.7,
    })),
  ];
}
