import { ensureServerEnvLoaded } from './env.js';

/**
 * Cấu hình phía website cho luồng đăng nhập bằng mã QR qua Zalo Mini App.
 *
 * Website chỉ lo: tạo ticket, dựng mã QR trỏ tới Mini App, poll trạng thái và đổi lấy
 * cookie phiên. Việc xác thực tài khoản Zalo và ghi nhận xác nhận do Mini App gọi sang
 * dự án crm-eac (`/api/srx/zalo-login/scan` và `/confirm`) đảm nhiệm — hai dự án dùng
 * chung database nên gặp nhau ở bảng `zalo_login_tickets`.
 */

export function getZaloMiniAppConfig() {
  ensureServerEnvLoaded();

  const appId = String(process.env.ZALO_MINIAPP_ID ?? '').trim();
  const deepLinkTemplate = String(process.env.ZALO_MINIAPP_DEEP_LINK_TEMPLATE ?? '').trim();

  return {
    appId,
    deepLinkTemplate,
    // Chỉ cần một trong hai là dựng được mã QR: template đầy đủ, hoặc app id để tự ghép link.
    isConfigured: Boolean(appId || deepLinkTemplate),
  };
}

export function isZaloQrLoginEnabled() {
  ensureServerEnvLoaded();

  if (String(process.env.ZALO_QR_LOGIN_ENABLED ?? '').trim().toLowerCase() === 'false') {
    return false;
  }

  return getZaloMiniAppConfig().isConfigured;
}

/**
 * Deep link mở Mini App kèm ticket.
 *
 * Zalo quy ước link dạng https://zalo.me/s/<app_id>/<path>?<query>. Khi chạy thử ở chế độ
 * developer, link có thêm tham số env/version nên phải khai báo nguyên link qua
 * ZALO_MINIAPP_DEEP_LINK_TEMPLATE (hỗ trợ {ticket} và {appId}).
 */
export function buildZaloMiniAppDeepLink(ticket) {
  const { appId, deepLinkTemplate } = getZaloMiniAppConfig();

  if (deepLinkTemplate) {
    return deepLinkTemplate
      .replace(/\{ticket\}/g, encodeURIComponent(ticket))
      .replace(/\{appId\}/g, encodeURIComponent(appId));
  }

  if (!appId) {
    return '';
  }

  const entryPath = String(process.env.ZALO_MINIAPP_ENTRY_PATH ?? '').trim().replace(/^\/+/, '');
  const deepLink = new URL(`https://zalo.me/s/${encodeURIComponent(appId)}/${entryPath}`);

  deepLink.searchParams.set('ticket', ticket);

  return deepLink.toString();
}
