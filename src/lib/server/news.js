import { getMissingDatabaseEnvNames, hasDatabaseConfig, query } from './db.js';

import { readdir } from 'node:fs/promises';
import path from 'node:path';

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

const postGalleryDirectory = path.join(process.cwd(), 'public', 'assets', 'images', 'post');
const postGalleryExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif']);

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

function formatPostGalleryAlt(fileName, index) {
  const label = fileName
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!label) {
    return `Hình ảnh bài viết ${index + 1}`;
  }

  return label
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
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
    categorySlug: row.category_slug ?? null,
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

function getArticleDateKey(article) {
  return article?.publishedAt || '0000-00-00';
}

function normalizeTagValue(value) {
  return String(value ?? '').trim().toLowerCase();
}

function getSharedTagCount(currentTags = [], candidateTags = []) {
  const currentTagSet = new Set(currentTags.map(normalizeTagValue).filter(Boolean));

  if (!currentTagSet.size) {
    return 0;
  }

  return candidateTags.reduce((count, tag) => {
    return count + (currentTagSet.has(normalizeTagValue(tag)) ? 1 : 0);
  }, 0);
}

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

export async function getPublishedNews({ limit = 12, categorySlug, categorySlugs } = {}) {
  const safeLimit = Math.max(1, Number(limit) || 12);
  const selectedCategorySlugs = [];

  if (Array.isArray(categorySlugs)) {
    selectedCategorySlugs.push(...categorySlugs.filter(Boolean));
  } else if (categorySlug) {
    selectedCategorySlugs.push(categorySlug);
  }

  if (shouldUseFallbackArticles()) {
    return [];
  }

  try {
    const categoryConditions = selectedCategorySlugs.length
      ? ` AND ac.slug IN (${selectedCategorySlugs.map(() => '?').join(', ')})`
      : '';
    const rows = await query(
      `
        ${baseNewsSelect}
        ${categoryConditions}
        ${baseNewsGroupBy}
        ${baseNewsOrder}
        LIMIT ?
      `,
      [...selectedCategorySlugs, safeLimit],
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

export async function getPostGalleryImages() {
  try {
    const entries = await readdir(postGalleryDirectory, { withFileTypes: true });

    return entries
      .filter((entry) => entry.isFile() && postGalleryExtensions.has(path.extname(entry.name).toLowerCase()))
      .sort((left, right) => left.name.localeCompare(right.name, 'en', { numeric: true }))
      .map((entry, index) => ({
        src: `/assets/images/post/${entry.name}`,
        alt: formatPostGalleryAlt(entry.name, index),
      }));
  } catch (error) {
    console.error('Failed to load post gallery images:', error);
    return [];
  }
}

export async function getRelatedNewsArticles(currentArticle, { limit = 3 } = {}) {
  if (!currentArticle?.slug) {
    return [];
  }

  const safeLimit = Math.max(1, Number(limit) || 3);
  const collectedArticles = new Map();

  const categoryCandidates = currentArticle.categorySlug
    ? await getPublishedNews({ limit: 24, categorySlug: currentArticle.categorySlug })
    : [];

  categoryCandidates.forEach((article) => {
    collectedArticles.set(article.slug, article);
  });

  if (collectedArticles.size < safeLimit + 1) {
    const supplementalCandidates = await getPublishedNews({ limit: 24 });

    supplementalCandidates.forEach((article) => {
      if (!collectedArticles.has(article.slug)) {
        collectedArticles.set(article.slug, article);
      }
    });
  }

  return [...collectedArticles.values()]
    .filter((article) => article.slug !== currentArticle.slug && article.id !== currentArticle.id)
    .map((article) => ({
      ...article,
      _sameCategory: article.categorySlug && article.categorySlug === currentArticle.categorySlug ? 1 : 0,
      _sharedTagCount: getSharedTagCount(currentArticle.tags, article.tags),
    }))
    .sort((left, right) => {
      if (right._sameCategory !== left._sameCategory) {
        return right._sameCategory - left._sameCategory;
      }

      if (right._sharedTagCount !== left._sharedTagCount) {
        return right._sharedTagCount - left._sharedTagCount;
      }

      if (Number(right.featured) !== Number(left.featured)) {
        return Number(right.featured) - Number(left.featured);
      }

      const dateComparison = getArticleDateKey(right).localeCompare(getArticleDateKey(left));

      if (dateComparison !== 0) {
        return dateComparison;
      }

      return Number(right.id ?? 0) - Number(left.id ?? 0);
    })
    .slice(0, safeLimit)
    .map((article) => {
      const sanitizedArticle = { ...article };
      delete sanitizedArticle._sameCategory;
      delete sanitizedArticle._sharedTagCount;
      return sanitizedArticle;
    });
}
