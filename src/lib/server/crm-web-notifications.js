import { ensureServerEnvLoaded } from './env.js';
import { formatErrorDetails } from './error-details.js';
import { createRequestTimeoutSignal } from './request-timeout.js';

ensureServerEnvLoaded();

const AFFILIATE_APPLICATIONS_WEB_API_URL =
  process.env.SRX_AFFILIATE_APPLICATIONS_WEB_API_URL?.trim() ||
  'https://crm.srx.vn/api/srx/affiliate-applications-web';
const AFFILIATE_APPLICATIONS_WEB_API_TOKEN =
  process.env.SRX_AFFILIATE_APPLICATIONS_WEB_API_TOKEN?.trim() || '';
const LEAD_FORMS_WEB_API_URL =
  process.env.SRX_LEAD_FORMS_WEB_API_URL?.trim() || 'https://crm.srx.vn/api/srx/lead-forms-web';
const LEAD_FORMS_WEB_API_TOKEN = process.env.SRX_LEAD_FORMS_WEB_API_TOKEN?.trim() || '';

async function postCrmNotification({ url, token, payload, label, timeoutMs = 5000 }) {
  const { signal, cleanup } = createRequestTimeoutSignal(timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
      signal,
    });

    if (!response.ok) {
      const responseBody = (await response.text().catch(() => '')).trim();
      throw new Error(
        `${label} returned ${response.status}${responseBody ? `: ${responseBody.slice(0, 300)}` : ''}`,
      );
    }
  } catch (error) {
    throw new Error(
      `Failed to send CRM notification to ${label} (${url}): ${error instanceof Error ? error.message : 'Unknown error'}`,
      { cause: error },
    );
  } finally {
    cleanup();
  }
}

export function queueAffiliateApplicationNotificationToCrm(payload) {
  void postCrmNotification({
    url: AFFILIATE_APPLICATIONS_WEB_API_URL,
    token: AFFILIATE_APPLICATIONS_WEB_API_TOKEN,
    payload,
    label: 'affiliate-applications-web',
  }).catch((error) => {
    console.error(`Affiliate application CRM notification error:\n${formatErrorDetails(error)}`);
  });
}

export async function deliverLeadFormNotificationToCrm(payload) {
  await postCrmNotification({
    url: LEAD_FORMS_WEB_API_URL,
    token: LEAD_FORMS_WEB_API_TOKEN,
    payload,
    label: 'lead-forms-web',
  });
}
