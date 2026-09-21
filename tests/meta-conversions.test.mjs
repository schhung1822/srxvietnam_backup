import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import {
  buildCompleteRegistrationEvent,
  sendCompleteRegistrationToMeta,
} from '../src/lib/server/meta-conversions.js';

const request = {
  headers: new Headers({ 'user-agent': 'Test Browser' }),
  cookies: {
    get(name) {
      return { _fbp: { value: 'fb.1.123.456' }, _fbc: { value: 'fb.1.123.click' } }[name];
    },
  },
};

const details = {
  registrationId: 42,
  eventName: 'Sự kiện SRX',
  eventUrl: 'https://srxvietnam.vn/events/srx',
  request,
  email: ' Person@Example.COM ',
  phone: '+84 912 345 678',
  ip: '203.0.113.10',
};

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

test('registration payload hashes normalized contact data and keeps browser match data', () => {
  const event = buildCompleteRegistrationEvent(details);

  assert.equal(event.event_name, 'CompleteRegistration');
  assert.equal(event.event_id, 'event-registration-42');
  assert.equal(event.action_source, 'website');
  assert.equal(event.event_source_url, details.eventUrl);
  assert.deepEqual(event.user_data.em, [sha256('person@example.com')]);
  assert.deepEqual(event.user_data.ph, [sha256('84912345678')]);
  assert.equal(event.user_data.fbp, 'fb.1.123.456');
  assert.equal(event.user_data.fbc, 'fb.1.123.click');
  assert.equal(event.user_data.client_ip_address, details.ip);
  assert.equal(event.user_data.client_user_agent, 'Test Browser');
  assert.doesNotMatch(JSON.stringify(event), /Person@Example.COM|\+84 912 345 678/);
});

test('server sends one event without exposing the access token in the request URL or body', async () => {
  const previousId = process.env.META_DATASET_ID;
  const previousToken = process.env.META_CONVERSIONS_ACCESS_TOKEN;
  process.env.META_DATASET_ID = '123456789';
  process.env.META_CONVERSIONS_ACCESS_TOKEN = 'test-secret';

  try {
    const sent = await sendCompleteRegistrationToMeta(details, {
      fetchImpl: async (url, options) => {
        assert.equal(url, 'https://graph.facebook.com/v26.0/123456789/events');
        assert.equal(options.headers.Authorization, 'Bearer test-secret');
        assert.doesNotMatch(url + options.body, /test-secret/);
        assert.equal(JSON.parse(options.body).data.length, 1);
        return { ok: true, status: 200, json: async () => ({ events_received: 1 }) };
      },
    });

    assert.equal(sent, true);
  } finally {
    if (previousId === undefined) delete process.env.META_DATASET_ID;
    else process.env.META_DATASET_ID = previousId;
    if (previousToken === undefined) delete process.env.META_CONVERSIONS_ACCESS_TOKEN;
    else process.env.META_CONVERSIONS_ACCESS_TOKEN = previousToken;
  }
});
