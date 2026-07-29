import { ensureServerEnvLoaded } from './env.js';

/**
 * Sau reverse proxy (nginx, Cloudflare...), `request.url` của Next luôn là địa chỉ nội bộ
 * dạng http://localhost:3000 nên không dùng được để dựng link gửi ra ngoài (redirect OAuth,
 * link đặt lại mật khẩu, link giới thiệu affiliate). Helper này lấy domain public thật sự.
 */

function normalizeHeaderValue(value) {
  return String(value ?? '')
    .split(',')[0]
    .trim();
}

function isLocalHost(host) {
  const hostname = host.split(':')[0].toLowerCase();

  return ['localhost', '127.0.0.1', '0.0.0.0', '::1'].includes(hostname);
}

export function getConfiguredSiteOrigin() {
  ensureServerEnvLoaded();

  const configured = String(process.env.PUBLIC_SITE_ORIGIN ?? process.env.NEXT_PUBLIC_SITE_URL ?? '').trim();

  if (!configured) {
    return '';
  }

  try {
    return new URL(configured).origin;
  } catch {
    return '';
  }
}

export function resolveRequestOrigin(request) {
  const forwardedHost = normalizeHeaderValue(request.headers.get('x-forwarded-host'));
  const host = forwardedHost || normalizeHeaderValue(request.headers.get('host'));
  const forwardedProto = normalizeHeaderValue(request.headers.get('x-forwarded-proto'));

  if (host && !isLocalHost(host)) {
    return `${forwardedProto || 'https'}://${host}`;
  }

  // Proxy cấu hình thiếu `proxy_set_header Host $host` sẽ để nguyên localhost:3000.
  // Khi đó ưu tiên domain public đã khai báo thay vì trả localhost về cho trình duyệt.
  const configuredOrigin = getConfiguredSiteOrigin();

  if (configuredOrigin && process.env.NODE_ENV === 'production') {
    return configuredOrigin;
  }

  if (host) {
    return `${forwardedProto || 'http'}://${host}`;
  }

  return new URL(request.url).origin;
}
