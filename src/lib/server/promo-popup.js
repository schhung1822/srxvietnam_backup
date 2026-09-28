import { cache } from 'react';
import { hasDatabaseConfig, query } from './db.js';
import { getPostGalleryImages } from './news.js';

// Nội dung popup là banner có position = 'popup'; cách hiển thị ở trang chủ lưu trong
// website_settings (khóa promo_popup). Cả hai đều do CRM quản lý ở trang /srx/popup.
const POPUP_POSITION = 'popup';
const POPUP_SETTING_KEY = 'promo_popup';

const TRIGGERS = new Set(['delay', 'scroll', 'exit_intent']);
const FREQUENCIES = new Set(['every_visit', 'once_per_session', 'once_per_days']);

const DEFAULT_SETTINGS = {
  homepageEnabled: false,
  trigger: 'delay',
  delaySeconds: 5,
  scrollPercent: 40,
  frequency: 'once_per_session',
  frequencyDays: 1,
  autoSlideSeconds: 0,
};

function clampInteger(value, min, max, fallback) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, Math.round(numericValue)));
}

function readJsonValue(rawValue) {
  // MySQL trả JSON dạng object, MariaDB trả chuỗi.
  if (typeof rawValue !== 'string') {
    return rawValue && typeof rawValue === 'object' ? rawValue : {};
  }

  try {
    return JSON.parse(rawValue);
  } catch {
    return {};
  }
}

function normalizeSettings(rawValue) {
  const value = readJsonValue(rawValue);

  return {
    homepageEnabled: value.homepage_enabled === true,
    trigger: TRIGGERS.has(value.trigger) ? value.trigger : DEFAULT_SETTINGS.trigger,
    delaySeconds: clampInteger(value.delay_seconds, 0, 600, DEFAULT_SETTINGS.delaySeconds),
    scrollPercent: clampInteger(value.scroll_percent, 1, 100, DEFAULT_SETTINGS.scrollPercent),
    frequency: FREQUENCIES.has(value.frequency) ? value.frequency : DEFAULT_SETTINGS.frequency,
    frequencyDays: clampInteger(value.frequency_days, 1, 365, DEFAULT_SETTINGS.frequencyDays),
    autoSlideSeconds: clampInteger(value.auto_slide_seconds, 0, 60, DEFAULT_SETTINGS.autoSlideSeconds),
  };
}

function normalizeImagePath(value = '') {
  const normalizedValue = String(value ?? '').trim();

  if (!normalizedValue || /^https?:\/\//i.test(normalizedValue)) {
    return normalizedValue;
  }

  return normalizedValue.startsWith('/') ? normalizedValue : `/${normalizedValue}`;
}

function readText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function mapPopupSlide(row) {
  const src = normalizeImagePath(row.image_url);

  if (!src) {
    return null;
  }

  const title = readText(row.title);

  return {
    id: `popup-${row.id}`,
    src,
    mobileSrc: normalizeImagePath(readText(row.mobile_image_url) || readText(row.image_url_mb)),
    alt: readText(row.alt_text) || title || 'Chương trình ưu đãi SRX',
    title,
    ctaLabel: readText(row.button_label) || 'Xem ngay',
    href: readText(row.link_target),
    openInNewTab: Boolean(Number(row.open_in_new_tab)),
  };
}

export const getPromoPopupSlides = cache(async () => {
  if (!hasDatabaseConfig()) {
    return [];
  }

  try {
    const rows = await query(
      `
        SELECT *
        FROM banners
        WHERE position = ?
          AND is_active = 1
          AND (starts_at IS NULL OR starts_at <= NOW())
          AND (ends_at IS NULL OR ends_at >= NOW())
        ORDER BY sort_order ASC, created_at DESC
      `,
      [POPUP_POSITION],
    );

    return rows.map(mapPopupSlide).filter(Boolean);
  } catch (error) {
    console.error('Failed to load promo popup slides:', error);
    return [];
  }
});

export const getPromoPopupSettings = cache(async () => {
  if (!hasDatabaseConfig()) {
    return { settings: DEFAULT_SETTINGS, version: '0' };
  }

  try {
    const rows = await query(
      'SELECT setting_value, updated_at FROM website_settings WHERE setting_key = ? LIMIT 1',
      [POPUP_SETTING_KEY],
    );
    const row = rows[0];

    if (!row) {
      return { settings: DEFAULT_SETTINGS, version: '0' };
    }

    const updatedAt = row.updated_at ? new Date(row.updated_at).getTime() : 0;

    return {
      settings: normalizeSettings(row.setting_value),
      // Đổi mỗi lần CRM lưu cấu hình, để khách đã đóng popup được xem lại chiến dịch mới.
      version: String(Number.isFinite(updatedAt) ? updatedAt : 0),
    };
  } catch (error) {
    // Bảng website_settings chưa có (CRM chưa lưu lần nào) thì dùng mặc định: tắt ở trang chủ.
    if (error?.code !== 'ER_NO_SUCH_TABLE') {
      console.error('Failed to load promo popup settings:', error);
    }

    return { settings: DEFAULT_SETTINGS, version: '0' };
  }
});

/** Popup tự bật ở trang chủ; null khi bị tắt hoặc chưa có nội dung đang chạy. */
export async function getHomepagePromoPopup() {
  const [{ settings, version }, slides] = await Promise.all([getPromoPopupSettings(), getPromoPopupSlides()]);

  if (!settings.homepageEnabled || !slides.length) {
    return null;
  }

  return { settings, version, slides };
}

/** Popup ở trang chi tiết tin tức: luôn hiển thị, chưa có nội dung trong CRM thì dùng bộ ảnh mặc định. */
export async function getNewsPromoPopup() {
  const [{ settings }, slides] = await Promise.all([getPromoPopupSettings(), getPromoPopupSlides()]);

  if (slides.length) {
    return { slides, autoSlideSeconds: settings.autoSlideSeconds };
  }

  const fallbackImages = await getPostGalleryImages();

  return {
    slides: fallbackImages.map((image) => ({
      id: image.src,
      src: image.src,
      mobileSrc: '',
      alt: image.alt,
      title: '',
      ctaLabel: image.productName ? `Xem ${image.productName}` : 'Xem sản phẩm',
      href: image.href,
      openInNewTab: false,
    })),
    autoSlideSeconds: settings.autoSlideSeconds,
  };
}
