import { createHash } from 'node:crypto';
import { FBC_COOKIE_NAME, FBP_COOKIE_NAME, normalizeMetaCookieValue } from '../tracking.js';

const GRAPH_API_VERSION = 'v26.0';

function hashUserData(value) {
  return createHash('sha256').update(value).digest('hex');
}

export function buildCompleteRegistrationEvent({ registrationId, eventName, eventUrl, request, email, phone, ip }) {
  const normalizedEmail = String(email ?? '').trim().toLowerCase();
  const normalizedPhone = String(phone ?? '').replace(/\D/g, '');
  const fbp = normalizeMetaCookieValue(request.cookies.get(FBP_COOKIE_NAME)?.value);
  const fbc = normalizeMetaCookieValue(request.cookies.get(FBC_COOKIE_NAME)?.value);
  const userData = {
    ...(normalizedEmail ? { em: [hashUserData(normalizedEmail)] } : {}),
    ...(normalizedPhone ? { ph: [hashUserData(normalizedPhone)] } : {}),
    ...(ip ? { client_ip_address: ip } : {}),
    client_user_agent: request.headers.get('user-agent') || '',
    ...(fbp ? { fbp } : {}),
    ...(fbc ? { fbc } : {}),
  };

  return {
    event_name: 'CompleteRegistration',
    event_time: Math.floor(Date.now() / 1000),
    event_id: `event-registration-${registrationId}`,
    action_source: 'website',
    event_source_url: eventUrl,
    user_data: userData,
    custom_data: { content_name: eventName },
  };
}

export async function sendCompleteRegistrationToMeta(details, { fetchImpl = fetch } = {}) {
  const datasetId = String(process.env.META_DATASET_ID || process.env.NEXT_PUBLIC_META_PIXEL_ID || '').trim();
  const accessToken = String(process.env.META_CONVERSIONS_ACCESS_TOKEN || '').trim();

  if (!datasetId || !accessToken) {
    return false;
  }

  if (!/^\d+$/.test(datasetId)) {
    throw new Error('Invalid META_DATASET_ID.');
  }

  const response = await fetchImpl(`https://graph.facebook.com/${GRAPH_API_VERSION}/${datasetId}/events`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data: [buildCompleteRegistrationEvent(details)] }),
    signal: AbortSignal.timeout(5000),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok || result.events_received !== 1) {
    const errorCode = Number(result.error?.code);
    const codeSuffix = Number.isFinite(errorCode) && errorCode > 0 ? `, code ${errorCode}` : '';
    throw new Error(`Meta Conversions API rejected registration (HTTP ${response.status}${codeSuffix}).`);
  }

  return true;
}
