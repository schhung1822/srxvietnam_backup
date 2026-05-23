export const FBP_COOKIE_NAME = '_fbp';
export const FBC_COOKIE_NAME = '_fbc';
export const USER_IP_COOKIE_NAME = 'srx_user_ip';
export const META_TRACKING_COOKIE_MAX_AGE_SECONDS = 90 * 24 * 60 * 60;
export const IPIFY_API_URL = 'https://api.ipify.org?format=json';

const MAX_META_COOKIE_VALUE_LENGTH = 255;
const MAX_IP_VALUE_LENGTH = 45;
const MAX_USER_AGENT_LENGTH = 500;

function normalizeString(value) {
  return String(value ?? '').trim();
}

export function normalizeMetaCookieValue(value) {
  const normalized = normalizeString(value);
  return normalized ? normalized.slice(0, MAX_META_COOKIE_VALUE_LENGTH) : null;
}

export function normalizeUserAgentValue(value) {
  const normalized = normalizeString(value);
  return normalized ? normalized.slice(0, MAX_USER_AGENT_LENGTH) : null;
}

export function normalizeIpValue(value) {
  const normalized = normalizeString(value);
  return normalized ? normalized.slice(0, MAX_IP_VALUE_LENGTH) : null;
}

export function buildFbpCookieValue() {
  const timestamp = Math.floor(Date.now() / 1000);
  const randomPart = `${Date.now()}${Math.floor(Math.random() * 1_000_000_000)}`.slice(-10);
  return `fb.1.${timestamp}.${randomPart}`;
}

export function buildFbcCookieValue(fbclid) {
  const normalizedFbclid = normalizeString(fbclid);

  if (!normalizedFbclid) {
    return null;
  }

  const timestamp = Math.floor(Date.now() / 1000);
  return normalizeMetaCookieValue(`fb.1.${timestamp}.${normalizedFbclid}`);
}
