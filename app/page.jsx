import Home from '../src/views/Home.jsx';
import { getHomepageHeroBanners } from '../src/lib/server/banners.js';
import { getCatalogProducts } from '../src/lib/server/products.js';
import { getPublishedNews } from '../src/lib/server/news.js';
import { buildMetadata } from '../src/lib/seo.js';

export const dynamic = 'force-dynamic';

export const metadata = buildMetadata({
  title: 'SRX Việt Nam',
  description:
    'SRX Việt Nam mang công nghệ sinh học tiên tiến đến gần hơn với làn da Việt bằng hệ sản phẩm chăm sóc da chuyên sâu và chính hãng.',
  path: '/',
});

function pickRandomProducts(products, limit = 4) {
  const shuffled = [...products];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled.slice(0, Math.max(0, limit));
}

function normalizeProductReference(value = '') {
  const normalized = String(value ?? '').trim().toLowerCase();

  if (!normalized) {
    return '';
  }

  const withoutQuery = normalized.split(/[?#]/)[0];
  const segments = withoutQuery.split('/').filter(Boolean);
  return segments[segments.length - 1] ?? '';
}

function resolveSuggestedProducts(products, refs = [], limit = 2) {
  const normalizedRefs = refs
    .map((ref) => normalizeProductReference(ref))
    .filter(Boolean);

  if (!normalizedRefs.length) {
    return [];
  }

  const usedIds = new Set();
  const matchedProducts = [];

  normalizedRefs.forEach((ref) => {
    const product = products.find((item) => {
      return (
        normalizeProductReference(item.productCode) === ref ||
        String(item.id) === ref ||
        (item.variantSkus ?? []).some((sku) => normalizeProductReference(sku) === ref) ||
        normalizeProductReference(item.slug) === ref
      );
    });

    if (!product || usedIds.has(product.id)) {
      return;
    }

    usedIds.add(product.id);
    matchedProducts.push(product);
  });

  return matchedProducts.slice(0, Math.max(0, limit));
}

function pickFeaturedScientificTopic(articles = []) {
  return (
    articles.find(
      (article) => article.featured && Array.isArray(article.productSuggestedRefs) && article.productSuggestedRefs.length,
    ) ??
    articles.find((article) => Array.isArray(article.productSuggestedRefs) && article.productSuggestedRefs.length) ??
    articles.find((article) => article.featured) ??
    articles[0] ??
    null
  );
}

export default async function HomePage() {
  const [products, heroBanners, scientificArticles] = await Promise.all([
    getCatalogProducts(),
    getHomepageHeroBanners(),
    getPublishedNews({ limit: 12, categorySlug: 'kien-thuc' }),
  ]);
  const featuredProducts = pickRandomProducts(
    products.filter((product) => product.featured),
    4,
  );
  const scientificTopicArticle = pickFeaturedScientificTopic(scientificArticles);
  const scientificTopic = scientificTopicArticle
    ? {
        ...scientificTopicArticle,
        suggestedProducts: resolveSuggestedProducts(
          products,
          scientificTopicArticle.productSuggestedRefs,
          2,
        ),
      }
    : null;

  return (
    <Home
      featuredProducts={featuredProducts}
      heroBanners={heroBanners}
      scientificTopic={scientificTopic}
    />
  );
}
