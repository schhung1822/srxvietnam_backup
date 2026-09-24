import assert from 'node:assert/strict';
import test from 'node:test';

test('Ladipage callback sends the persisted registration ID to CRM with server authorization', async () => {
  const previousUrl = process.env.SRX_META_EVENTS_WEB_API_URL;
  const previousToken = process.env.SRX_META_EVENTS_WEB_API_TOKEN;
  const previousFetch = globalThis.fetch;
  process.env.SRX_META_EVENTS_WEB_API_URL = 'https://crm.example.test/api/srx/meta-events-web';
  process.env.SRX_META_EVENTS_WEB_API_TOKEN = 'shared-secret';

  try {
    globalThis.fetch = async (url, options) => {
      assert.equal(url, process.env.SRX_META_EVENTS_WEB_API_URL);
      assert.equal(options.method, 'POST');
      assert.equal(options.headers.Authorization, 'Bearer shared-secret');
      assert.deepEqual(JSON.parse(options.body), { registrationId: 42 });

      return new Response(null, { status: 202 });
    };

    const { deliverMetaEventToCrm } = await import(
      `../src/lib/server/crm-web-notifications.js?meta-event-test=${Date.now()}`
    );
    await deliverMetaEventToCrm({ registrationId: 42 });
  } finally {
    globalThis.fetch = previousFetch;

    if (previousUrl === undefined) delete process.env.SRX_META_EVENTS_WEB_API_URL;
    else process.env.SRX_META_EVENTS_WEB_API_URL = previousUrl;

    if (previousToken === undefined) delete process.env.SRX_META_EVENTS_WEB_API_TOKEN;
    else process.env.SRX_META_EVENTS_WEB_API_TOKEN = previousToken;
  }
});
