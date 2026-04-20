import { demoNews, sortNewsByDate } from '../../data/demoNews.js';
import { getMissingDatabaseEnvNames, hasDatabaseConfig, query } from './db.js';

const fallbackArticles = sortNewsByDate(demoNews);
let hasWarnedAboutMissingDbConfig = false;

const categoryDisplayNames = {
  'tin-tuc': 'Tin tức',
  'su-kien': 'Sự kiện',
  'kien-thuc': 'Kiến thức',
  'phac-do': 'Phác đồ',
  routine: 'Routine',
};

const categoryFallbackImages = {
  'tin-tuc': '/assets/images/home/sl2.webp',
  'su-kien': '/assets/images/home/slider2.webp',
  'kien-thuc': '/assets/images/home/blue.webp',
  'phac-do': '/assets/images/home/purble.webp',
  routine: '/assets/images/home/sl4.webp',
};

function stripHtml(value = '') {
  return String(value)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncateText(value = '', maxLength = 180) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

function toDateString(value) {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function estimateReadTime(value = '') {
  const wordCount = stripHtml(value).split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(wordCount / 180));

  return `${minutes} phút đọc`;
}

function getFallbackArticle(slug) {
  return fallbackArticles.find((article) => article.slug === slug) ?? null;
}

function getFallbackArticles(limit) {
  return fallbackArticles.slice(0, limit);
}

function normalizeCategory({ categorySlug, categoryName }) {
  if (categorySlug && categoryDisplayNames[categorySlug]) {
    return categoryDisplayNames[categorySlug];
  }

  return categoryName ?? 'Tin tức';
}

function normalizeTags(tagNames, fallbackArticle) {
  if (typeof tagNames === 'string' && tagNames.trim()) {
    return tagNames
      .split('||')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return fallbackArticle?.tags ?? [];
}

function normalizeCoverImage({ coverImage, categorySlug, fallbackArticle }) {
  if (coverImage) {
    return coverImage;
  }

  if (fallbackArticle?.coverImage) {
    return fallbackArticle.coverImage;
  }

  if (categorySlug && categoryFallbackImages[categorySlug]) {
    return categoryFallbackImages[categorySlug];
  }

  return '/assets/images/home/sl2.webp';
}

function normalizeNewsArticle(row) {
  const fallbackArticle = getFallbackArticle(row.slug);
  const content = row.content?.trim() || fallbackArticle?.content || '';
  const plainTextContent = stripHtml(content);
  const excerpt =
    row.excerpt?.trim() ||
    fallbackArticle?.excerpt ||
    truncateText(plainTextContent, 180);

  return {
    id: Number(row.id ?? fallbackArticle?.id ?? 0),
    slug: row.slug,
    title: row.title?.trim() || fallbackArticle?.title || '',
    category: normalizeCategory({
      categorySlug: row.category_slug,
      categoryName: row.category_name,
    }),
    excerpt,
    content: content || excerpt,
    publishedAt:
      toDateString(row.published_at ?? row.publishedAt) ||
      fallbackArticle?.publishedAt ||
      null,
    readTime:
      row.read_time?.trim() ||
      fallbackArticle?.readTime ||
      estimateReadTime(content || excerpt),
    tags: normalizeTags(row.tag_names, fallbackArticle),
    coverImage: normalizeCoverImage({
      coverImage: row.featured_image_url ?? row.coverImage,
      categorySlug: row.category_slug,
      fallbackArticle,
    }),
    coverAlt:
      row.cover_alt_text?.trim() ||
      fallbackArticle?.coverAlt ||
      row.title?.trim() ||
      'Tin tức SRX',
    featured: Boolean(row.is_featured ?? fallbackArticle?.featured),
  };
}

const baseNewsSelect = `
  SELECT
    p.id,
    p.title,
    p.slug,
    p.excerpt,
    p.content,
    p.featured_image_url,
    p.is_featured,
    p.published_at,
    ac.name AS category_name,
    ac.slug AS category_slug,
    GROUP_CONCAT(DISTINCT pt.name ORDER BY pt.name SEPARATOR '||') AS tag_names
  FROM posts p
  INNER JOIN article_categories ac ON ac.id = p.category_id
  LEFT JOIN post_tag_links ptl ON ptl.post_id = p.id
  LEFT JOIN post_tags pt ON pt.id = ptl.tag_id
  WHERE p.status = 'published'
    AND p.published_at IS NOT NULL
`;

const baseNewsGroupBy = `
  GROUP BY
    p.id,
    p.title,
    p.slug,
    p.excerpt,
    p.content,
    p.featured_image_url,
    p.is_featured,
    p.published_at,
    ac.name,
    ac.slug
`;

const baseNewsOrder = 'ORDER BY p.published_at DESC, p.id DESC';

function shouldUseFallbackArticles() {
  if (hasDatabaseConfig()) {
    return false;
  }

  if (!hasWarnedAboutMissingDbConfig) {
    hasWarnedAboutMissingDbConfig = true;
    console.warn(
      `Database env is missing (${getMissingDatabaseEnvNames().join(', ')}). Falling back to demo news data.`,
    );
  }

  return true;
}

export async function getPublishedNews({ limit = 12 } = {}) {
  const safeLimit = Math.max(1, Number(limit) || 12);

  if (shouldUseFallbackArticles()) {
    return getFallbackArticles(safeLimit);
  }

  try {
    const rows = await query(
      `
        ${baseNewsSelect}
        ${baseNewsGroupBy}
        ${baseNewsOrder}
        LIMIT ?
      `,
      [safeLimit],
    );

    if (!rows.length) {
      return getFallbackArticles(safeLimit);
    }

    return rows.map(normalizeNewsArticle);
  } catch (error) {
    console.error('Failed to load published news from database:', error);
    return getFallbackArticles(safeLimit);
  }
}

export async function getNewsArticleBySlug(slug) {
  if (!slug) {
    return null;
  }

  if (shouldUseFallbackArticles()) {
    return getFallbackArticle(slug);
  }

  try {
    const rows = await query(
      `
        ${baseNewsSelect}
          AND p.slug = ?
        ${baseNewsGroupBy}
        LIMIT 1
      `,
      [slug],
    );

    if (rows.length) {
      return normalizeNewsArticle(rows[0]);
    }
  } catch (error) {
    console.error(`Failed to load article "${slug}" from database:`, error);
  }

  return getFallbackArticle(slug);
}
