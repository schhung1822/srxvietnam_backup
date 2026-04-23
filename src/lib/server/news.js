import { getMissingDatabaseEnvNames, hasDatabaseConfig, query } from './db.js';

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

function normalizeCategory({ categorySlug, categoryName }) {
  if (categorySlug && categoryDisplayNames[categorySlug]) {
    return categoryDisplayNames[categorySlug];
  }

  return categoryName ?? 'Tin tức';
}

function normalizeTags(tagNames) {
  if (typeof tagNames === 'string' && tagNames.trim()) {
    return tagNames
      .split('||')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeCoverImage({ coverImage, categorySlug }) {
  if (coverImage) {
    return coverImage;
  }

  if (categorySlug && categoryFallbackImages[categorySlug]) {
    return categoryFallbackImages[categorySlug];
  }

  return '/assets/images/home/sl2.webp';
}

function normalizeNewsArticle(row) {
  const content = row.content?.trim() || '';
  const plainTextContent = stripHtml(content);
  const excerpt = row.excerpt?.trim() || truncateText(plainTextContent, 180);

  return {
    id: Number(row.id ?? 0),
    slug: row.slug,
    title: row.title?.trim() || '',
    category: normalizeCategory({
      categorySlug: row.category_slug,
      categoryName: row.category_name,
    }),
    excerpt,
    content: content || excerpt,
    publishedAt: toDateString(row.published_at ?? row.publishedAt) || null,
    readTime: row.read_time?.trim() || estimateReadTime(content || excerpt),
    tags: normalizeTags(row.tag_names),
    coverImage: normalizeCoverImage({
      coverImage: row.featured_image_url ?? row.coverImage,
      categorySlug: row.category_slug,
    }),
    coverAlt: row.cover_alt_text?.trim() || row.title?.trim() || 'Tin tức SRX',
    featured: Boolean(row.is_featured),
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
      `Database env is missing (${getMissingDatabaseEnvNames().join(', ')}). News data will be empty until DB is configured.`,
    );
  }

  return true;
}

export async function getPublishedNews({ limit = 12 } = {}) {
  const safeLimit = Math.max(1, Number(limit) || 12);

  if (shouldUseFallbackArticles()) {
    return [];
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

    return rows.map(normalizeNewsArticle);
  } catch (error) {
    console.error('Failed to load published news from database:', error);
    return [];
  }
}

export async function getNewsArticleBySlug(slug) {
  if (!slug) {
    return null;
  }

  if (shouldUseFallbackArticles()) {
    return null;
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

  return null;
}

export async function searchPublishedNews(term = '', limit = 5) {
  const safeLimit = Math.max(1, Number(limit) || 5);
  const trimmedTerm = String(term ?? '').trim();

  if (!trimmedTerm) {
    return getPublishedNews({ limit: safeLimit });
  }

  if (shouldUseFallbackArticles()) {
    return [];
  }

  const likeTerm = `%${trimmedTerm.toLowerCase()}%`;

  try {
    const rows = await query(
      `
        ${baseNewsSelect}
          AND (
            LOWER(p.title) LIKE ?
            OR LOWER(COALESCE(p.excerpt, '')) LIKE ?
            OR LOWER(COALESCE(p.content, '')) LIKE ?
            OR LOWER(COALESCE(ac.name, '')) LIKE ?
            OR EXISTS (
              SELECT 1
              FROM post_tag_links ptl2
              INNER JOIN post_tags pt2
                ON pt2.id = ptl2.tag_id
              WHERE ptl2.post_id = p.id
                AND LOWER(pt2.name) LIKE ?
            )
          )
        ${baseNewsGroupBy}
        ${baseNewsOrder}
        LIMIT ?
      `,
      [likeTerm, likeTerm, likeTerm, likeTerm, likeTerm, safeLimit],
    );

    return rows.map(normalizeNewsArticle);
  } catch (error) {
    console.error('Failed to search news from database:', error);
    return [];
  }
}
