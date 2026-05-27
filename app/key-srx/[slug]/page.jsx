import { notFound } from 'next/navigation';
import JsonLd from '../../../src/components/SEO/JsonLd.jsx';
import KeySrxDetailPage from '../../../src/views/KeySrxDetailPage.jsx';
import {
  getCatalogProductsByTagSlug,
  getProductTagDictionaryEntryBySlug,
} from '../../../src/lib/server/products.js';
import {
  absoluteUrl,
  buildMetadata,
  createBreadcrumbSchema,
} from '../../../src/lib/seo.js';

export const dynamic = 'force-dynamic';

function stripHtml(value = '') {
  return String(value ?? '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseTagLabels(value) {
  const rawValue = String(value ?? '').trim();

  if (!rawValue) {
    return [];
  }

  return rawValue
    .replace(/^\[|\]$/g, '')
    .split(/","|',\s*'|",\s*"|\s*\|\|\s*|\s*,\s*|\s*;\s*/)
    .map((item) => item.replace(/^['"]|['"]$/g, '').trim())
    .filter(Boolean);
}

function createIngredientSchema(entry) {
  return {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    '@id': `${absoluteUrl(`/key-srx/${entry.slug}`)}#ingredient`,
    name: entry.name,
    description: stripHtml(entry.description || entry.longDescription || ''),
    url: absoluteUrl(`/key-srx/${entry.slug}`),
    termCode: entry.slug,
    inDefinedTermSet: absoluteUrl('/key-srx'),
    image: entry.image ? absoluteUrl(entry.image) : undefined,
  };
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const entry = await getProductTagDictionaryEntryBySlug(slug);

  if (!entry) {
    return buildMetadata({
      title: 'Không tìm thấy thành phần',
      path: `/key-srx/${slug}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: entry.name,
    description:
      stripHtml(entry.description || entry.longDescription) ||
      `Khám phá chi tiết thành phần ${entry.name} trong hệ sản phẩm SRX Việt Nam.`,
    path: `/key-srx/${slug}`,
    image: entry.image || undefined,
    keywords: [
      entry.name,
      entry.ingredientClass,
      'thành phần SRX',
      ...parseTagLabels(entry.tags),
    ],
  });
}

export default async function KeySrxDetailRoute({ params }) {
  const { slug } = await params;
  const [entry, relatedProducts] = await Promise.all([
    getProductTagDictionaryEntryBySlug(slug),
    getCatalogProductsByTagSlug(slug),
  ]);

  if (!entry) {
    notFound();
  }

  return (
    <>
      <JsonLd
        data={[
          createBreadcrumbSchema([
            { name: 'Trang chủ', path: '/' },
            { name: 'Key SRX', path: '/key-srx' },
            { name: entry.name, path: `/key-srx/${entry.slug}` },
          ]),
          createIngredientSchema(entry),
        ]}
        idPrefix="ingredient-seo"
      />
      <KeySrxDetailPage entry={entry} relatedProducts={relatedProducts} />
    </>
  );
}
