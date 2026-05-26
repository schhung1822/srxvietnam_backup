import { cache } from 'react';
import { getMissingDatabaseEnvNames, hasDatabaseConfig, query } from './db.js';

let hasWarnedAboutMissingDbConfig = false;

const HOMEPAGE_HERO_POSITION = 'homepage_hero';
const PRODUCT_PAGE_POSITION = 'banner_product';

function shouldUseFallbackBanners() {
  if (hasDatabaseConfig()) {
    return false;
  }

  if (!hasWarnedAboutMissingDbConfig) {
    hasWarnedAboutMissingDbConfig = true;
    console.warn(
      `Database env is missing (${getMissingDatabaseEnvNames().join(', ')}). Homepage banners will fall back to static assets until DB is configured.`,
    );
  }

  return true;
}

function normalizeImagePath(value = '') {
  const normalizedValue = String(value ?? '').trim();

  if (!normalizedValue) {
    return '';
  }

  if (/^https?:\/\//i.test(normalizedValue)) {
    return normalizedValue;
  }

  return normalizedValue.startsWith('/') ? normalizedValue : `/${normalizedValue}`;
}

function getFirstStringValue(row, keys) {
  for (const key of keys) {
    const value = row?.[key];

    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return '';
}

function getSortValue(row) {
  const candidateKeys = ['sort_order', 'display_order', 'order_no', 'order'];

  for (const key of candidateKeys) {
    const rawValue = row?.[key];
    const numericValue = Number(rawValue);

    if (Number.isFinite(numericValue)) {
      return numericValue;
    }
  }

  return Number.MAX_SAFE_INTEGER;
}

function isBannerActive(row) {
  if (typeof row?.is_active !== 'undefined') {
    return Boolean(Number(row.is_active));
  }

  if (typeof row?.active !== 'undefined') {
    return Boolean(Number(row.active));
  }

  if (typeof row?.enabled !== 'undefined') {
    return Boolean(Number(row.enabled));
  }

  if (typeof row?.status === 'string') {
    return ['active', 'published', 'enabled'].includes(row.status.trim().toLowerCase());
  }

  return true;
}

function mapBanner(row, index) {
  const image = normalizeImagePath(
    getFirstStringValue(row, [
      'image_url',
      'image',
      'banner_url',
      'banner_image',
      'desktop_image_url',
      'desktop_image',
      'thumbnail_url',
      'img',
      'photo',
    ]),
  );

  if (!image) {
    return null;
  }

  return {
    id: row?.id != null ? `banner-${row.id}` : `banner-${index + 1}`,
    src: image,
    alt:
      getFirstStringValue(row, ['alt_text', 'alt', 'title', 'name', 'heading']) ||
      `Banner SRX ${index + 1}`,
    href: getFirstStringValue(row, ['link_target', 'url', 'target_url', 'link']),
  };
}

async function fetchBannerRows(position) {
  const tableCandidates = ['banners', 'banner'];
  let lastError = null;

  for (const tableName of tableCandidates) {
    try {
      return await query(
        `
          SELECT *
          FROM ${tableName}
          WHERE position = ?
        `,
        [position],
      );
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

const getBannersByPosition = cache(async (position) => {
  if (shouldUseFallbackBanners()) {
    return [];
  }

  try {
    const rows = await fetchBannerRows(position);

    return rows
      .filter(isBannerActive)
      .sort((left, right) => {
        const sortDifference = getSortValue(left) - getSortValue(right);

        if (sortDifference !== 0) {
          return sortDifference;
        }

        return Number(right?.id ?? 0) - Number(left?.id ?? 0);
      })
      .map(mapBanner)
      .filter(Boolean);
  } catch (error) {
    console.error(`Failed to load banners for position "${position}" from database:`, error);
    return [];
  }
});

export const getHomepageHeroBanners = cache(async () => getBannersByPosition(HOMEPAGE_HERO_POSITION));

export const getProductPageBanners = cache(async () => getBannersByPosition(PRODUCT_PAGE_POSITION));
