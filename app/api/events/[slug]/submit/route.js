import http from 'node:http';
import https from 'node:https';
import { NextResponse } from 'next/server';
import { getPublishedLadipageEventBySlug } from '../../../../../src/lib/server/ladipage-events.js';

export const runtime = 'nodejs';

const VN_PHONE = /^(?:\+?84|0)(3|5|7|8|9)\d{8}$/;

function normalizeText(value, fallback = '') {
  const normalized = String(value ?? '').trim();
  return normalized || fallback;
}

function normalizeFormValues(values) {
  if (!values || typeof values !== 'object' || Array.isArray(values)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(values).map(([key, value]) => [key, normalizeText(value)]),
  );
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validateSubmission(event, values) {
  const visibleFieldConfigs = [
    ['full_name', event.config.fields.full_name],
    ['phone', event.config.fields.phone],
    ['email', event.config.fields.email],
  ];

  for (const [fieldKey, config] of visibleFieldConfigs) {
    if (!config?.enabled) {
      continue;
    }

    const fieldValue = normalizeText(values[fieldKey]);

    if (config.required && !fieldValue) {
      throw new Error(`Vui lòng nhập ${normalizeText(config.label).toLowerCase()}.`);
    }

    if (fieldKey === 'full_name' && fieldValue && fieldValue.length < 2) {
      throw new Error('Vui lòng nhập họ và tên hợp lệ.');
    }

    if (fieldKey === 'phone' && fieldValue && !VN_PHONE.test(fieldValue)) {
      throw new Error('Vui lòng nhập số điện thoại hợp lệ.');
    }

    if (fieldKey === 'email' && fieldValue && !isValidEmail(fieldValue)) {
      throw new Error('Vui lòng nhập email hợp lệ.');
    }
  }

  Object.entries(event.config.fields.hidden).forEach(([fieldKey, config]) => {
    if (config?.enabled && config?.required && !normalizeText(values[fieldKey])) {
      throw new Error(`Vui lòng nhập ${normalizeText(config.label).toLowerCase()}.`);
    }
  });

  event.config.questions.forEach((question) => {
    if (question?.enabled && question?.required && !normalizeText(values[question.id])) {
      throw new Error(`Vui lòng nhập ${normalizeText(question.label).toLowerCase()}.`);
    }
  });
}

function getWebhookTransport(targetUrl) {
  return targetUrl.protocol === 'http:' ? http : https;
}

function isWebhookFailure(responseBody) {
  if (!responseBody || typeof responseBody !== 'object' || Array.isArray(responseBody)) {
    return false;
  }

  if (typeof responseBody.ok === 'boolean') {
    return !responseBody.ok;
  }

  if (typeof responseBody.success === 'boolean') {
    return !responseBody.success;
  }

  if (typeof responseBody.status === 'string') {
    return responseBody.status.toLowerCase() === 'error';
  }

  return false;
}

function postWebhookPayload(webhookUrl, payload) {
  const requestBody = JSON.stringify(payload);
  const targetUrl = new URL(webhookUrl);
  const transport = getWebhookTransport(targetUrl);

  return new Promise((resolve, reject) => {
    const request = transport.request(
      targetUrl,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Content-Length': Buffer.byteLength(requestBody),
        },
      },
      (response) => {
        let responseText = '';

        response.setEncoding('utf8');
        response.on('data', (chunk) => {
          responseText += chunk;
        });
        response.on('end', () => {
          if ((response.statusCode ?? 500) >= 400) {
            reject(new Error(`Webhook rejected request (${response.statusCode}).`));
            return;
          }

          if (!responseText) {
            resolve({});
            return;
          }

          try {
            resolve(JSON.parse(responseText));
          } catch {
            resolve({ raw: responseText });
          }
        });
      },
    );

    request.on('error', reject);
    request.setTimeout(10000, () => {
      request.destroy(new Error('Webhook request timed out.'));
    });
    request.write(requestBody);
    request.end();
  });
}

function buildWebhookPayload(event, values, request, pageUrl) {
  const visibleQuestionValues = Object.fromEntries(
    event.config.questions
      .filter((question) => question.enabled)
      .map((question) => [question.id, normalizeText(values[question.id])]),
  );
  const customFieldValues = Object.fromEntries(
    Object.entries(event.config.fields.hidden)
      .filter(([, config]) => config.enabled)
      .map(([fieldKey]) => [fieldKey, normalizeText(values[fieldKey])]),
  );

  return {
    full_name: normalizeText(values.full_name),
    phone: normalizeText(values.phone),
    email: normalizeText(values.email).toLowerCase(),
    ...customFieldValues,
    ...visibleQuestionValues,
    source: normalizeText(event.config.behavior.source, 'event-landing-page'),
    event_name: normalizeText(
      event.config.behavior.eventName,
      normalizeText(event.eventName, event.name),
    ),
    event_slug: event.slug,
    template_style: event.templateStyle,
    site_key: event.siteKey,
    page_url: normalizeText(pageUrl),
    ua: normalizeText(request.headers.get('user-agent')),
    submitted_at: new Date().toISOString(),
  };
}

export async function POST(request, { params }) {
  try {
    const { slug } = await params;
    const event = await getPublishedLadipageEventBySlug(slug);

    if (!event) {
      return NextResponse.json({ message: 'Không tìm thấy landing page sự kiện.' }, { status: 404 });
    }

    if (!event.config.webhookUrl) {
      return NextResponse.json(
        { message: 'Landing page chưa được cấu hình webhook nhận dữ liệu.' },
        { status: 500 },
      );
    }

    const body = await request.json();
    const values = normalizeFormValues(body?.values);

    validateSubmission(event, values);

    const webhookPayload = buildWebhookPayload(event, values, request, body?.pageUrl);
    const webhookResponse = await postWebhookPayload(event.config.webhookUrl, webhookPayload);

    if (isWebhookFailure(webhookResponse)) {
      throw new Error(normalizeText(webhookResponse.message, 'Webhook xử lý thất bại.'));
    }

    return NextResponse.json(
      {
        message: `SRX Việt Nam đã nhận đăng ký cho ${event.eventName}.`,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Event landing submission error:', error);

    if (error instanceof Error && error.message.startsWith('Vui lòng')) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { message: 'Không thể gửi thông tin đăng ký lúc này. Vui lòng thử lại sau.' },
      { status: 500 },
    );
  }
}
