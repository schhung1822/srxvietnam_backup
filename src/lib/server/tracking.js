import {
  FBC_COOKIE_NAME,
  FBP_COOKIE_NAME,
  normalizeIpValue,
  normalizeMetaCookieValue,
  normalizeUserAgentValue,
  USER_IP_COOKIE_NAME,
} from '../tracking.js';

const IP_HEADER_NAMES = [
  'cf-connecting-ip',
  'x-forwarded-for',
  'x-real-ip',
  'x-vercel-forwarded-for',
  'true-client-ip',
  'fastly-client-ip',
];

function getRequestHeader(request, headerName) {
  const value = request.headers.get(headerName);

  if (!value) {
    return null;
  }

  if (headerName === 'x-forwarded-for') {
    return value.split(',')[0]?.trim() || null;
  }

  return value.trim();
}

export function getTrackingUserIp(request) {
  const cookieIp = normalizeIpValue(request.cookies.get(USER_IP_COOKIE_NAME)?.value);

  if (cookieIp) {
    return cookieIp;
  }

  for (const headerName of IP_HEADER_NAMES) {
    const value = getRequestHeader(request, headerName);

    if (value) {
      return normalizeIpValue(value);
    }
  }

  return null;
}

export function getTrackingUserAgent(request) {
  return normalizeUserAgentValue(request.headers.get('user-agent'));
}

export function getOrderTrackingContext(request) {
  return {
    fbp: normalizeMetaCookieValue(request.cookies.get(FBP_COOKIE_NAME)?.value),
    fbc: normalizeMetaCookieValue(request.cookies.get(FBC_COOKIE_NAME)?.value),
    userAgent: getTrackingUserAgent(request),
    userIp: getTrackingUserIp(request),
  };
}
