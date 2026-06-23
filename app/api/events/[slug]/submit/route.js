import http from 'node:http';
import https from 'node:https';
import { NextResponse } from 'next/server';
import { getPublishedLadipageEventBySlug } from '../../../../../src/lib/server/ladipage-events.js';
import { query } from '../../../../../src/lib/server/db.js';

export const runtime = 'nodejs';

const VN_PHONE = /^(?:\+?84|0)(3|5|7|8|9)\d{8}$/;
const CHECKIN_OPTIONAL_COLUMNS = [
  { name: 'event_slug', ddl: 'ALTER TABLE checkin ADD COLUMN event_slug VARCHAR(180) NULL AFTER event_name' },
  { name: 'template_style', ddl: 'ALTER TABLE checkin ADD COLUMN template_style VARCHAR(50) NULL AFTER event_slug' },
  { name: 'site_key', ddl: 'ALTER TABLE checkin ADD COLUMN site_key VARCHAR(80) NULL AFTER template_style' },
  { name: 'page_url', ddl: 'ALTER TABLE checkin ADD COLUMN page_url TEXT NULL AFTER site_key' },
  { name: 'custom_fields_json', ddl: 'ALTER TABLE checkin ADD COLUMN custom_fields_json LONGTEXT NULL AFTER voucher' },
];

let ensureCheckinColumnsPromise = null;

function normalizeText(value, fallback = '') {
  const normalized = String(value ?? '').trim();
  return normalized || fallback;
}

function normalizeFormValues(values) {
  if (!values || typeof values !== 'object' || Array.isArray(values)) {
    return {};
  }

  return Object.fromEntries(Object.entries(values).map(([key, value]) => [key, normalizeText(value)]));
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

  Object.entries(event.config.fields.hidden ?? {}).forEach(([fieldKey, config]) => {
    if (config?.enabled && config?.required && !normalizeText(values[fieldKey])) {
      throw new Error(`Vui lòng nhập ${normalizeText(config.label || fieldKey).toLowerCase()}.`);
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
    const outboundRequest = transport.request(
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

    outboundRequest.on('error', reject);
    outboundRequest.setTimeout(10000, () => {
      outboundRequest.destroy(new Error('Webhook request timed out.'));
    });
    outboundRequest.write(requestBody);
    outboundRequest.end();
  });
}

async function ensureCheckinSubmissionColumns() {
  if (!ensureCheckinColumnsPromise) {
    ensureCheckinColumnsPromise = (async () => {
      const rows = await query(
        `SELECT COLUMN_NAME AS column_name
         FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = 'checkin'
           AND COLUMN_NAME IN (${CHECKIN_OPTIONAL_COLUMNS.map(() => '?').join(',')})`,
        CHECKIN_OPTIONAL_COLUMNS.map((column) => column.name),
      );
      const existingColumns = new Set(rows.map((row) => String(row.column_name)));

      for (const column of CHECKIN_OPTIONAL_COLUMNS) {
        if (!existingColumns.has(column.name)) {
          await query(column.ddl);
        }
      }
    })().finally(() => {
      ensureCheckinColumnsPromise = null;
    });
  }

  await ensureCheckinColumnsPromise;
}

function getCookieValue(request, cookieName) {
  const cookieHeader = request.headers.get('cookie') || '';
  const cookiePrefix = `${cookieName}=`;
  const match = cookieHeader
    .split(';')
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(cookiePrefix));

  return match ? decodeURIComponent(match.slice(cookiePrefix.length)) : '';
}

function getRequestIp(request) {
  const forwardedFor = request.headers.get('x-forwarded-for');

  if (forwardedFor) {
    return normalizeText(forwardedFor.split(',')[0]);
  }

  return normalizeText(request.headers.get('x-real-ip'));
}

function buildQuestionColumns(event, values) {
  const enabledQuestions = (event.config.questions ?? []).filter((question) => question?.enabled).slice(0, 5);
  const questionColumns = {};

  for (let index = 0; index < 5; index += 1) {
    const question = enabledQuestions[index];
    const number = index + 1;
    questionColumns[`title_q${number}`] = question ? normalizeText(question.label) : '';
    questionColumns[`q${number}`] = question ? normalizeText(values[question.id]) : '';
  }

  return questionColumns;
}

function buildCustomFields(event, values) {
  const hiddenFields = Object.fromEntries(
    Object.entries(event.config.fields.hidden ?? {})
      .filter(([, config]) => config?.enabled)
      .map(([fieldKey, config]) => [fieldKey, { label: normalizeText(config.label, fieldKey), value: normalizeText(values[fieldKey]) }]),
  );
  const questions = Object.fromEntries(
    (event.config.questions ?? [])
      .filter((question) => question?.enabled)
      .map((question) => [question.id, { label: normalizeText(question.label, question.id), value: normalizeText(values[question.id]) }]),
  );
  const extraValues = Object.fromEntries(
    Object.entries(values).filter(
      ([fieldKey]) =>
        !['full_name', 'phone', 'email'].includes(fieldKey) &&
        !(fieldKey in hiddenFields) &&
        !(fieldKey in questions),
    ),
  );

  return { hiddenFields, questions, extraValues };
}

function buildSubmissionPayload(event, values, request, pageUrl) {
  return {
    full_name: normalizeText(values.full_name),
    phone: normalizeText(values.phone),
    email: normalizeText(values.email).toLowerCase(),
    source: normalizeText(event.config.behavior.source, 'event-landing-page'),
    event_name: normalizeText(event.config.behavior.eventName, normalizeText(event.eventName, event.name)),
    event_slug: event.slug,
    template_style: event.templateStyle,
    site_key: event.siteKey,
    page_url: normalizeText(pageUrl),
    ua: normalizeText(request.headers.get('user-agent')),
    submitted_at: new Date().toISOString(),
    ...Object.fromEntries(
      Object.entries(event.config.fields.hidden ?? {})
        .filter(([, config]) => config?.enabled)
        .map(([fieldKey]) => [fieldKey, normalizeText(values[fieldKey])]),
    ),
    ...Object.fromEntries(
      (event.config.questions ?? [])
        .filter((question) => question?.enabled)
        .map((question) => [question.id, normalizeText(values[question.id])]),
    ),
  };
}

async function insertCheckinSubmission(event, values, request, pageUrl) {
  await ensureCheckinSubmissionColumns();

  const now = new Date();
  const row = {
    created_at: now,
    updated_at: now,
    phone: normalizeText(values.phone),
    event_name: normalizeText(event.config.behavior.eventName, normalizeText(event.eventName, event.name)),
    event_slug: event.slug,
    template_style: event.templateStyle,
    site_key: event.siteKey,
    page_url: normalizeText(pageUrl),
    name: normalizeText(values.full_name),
    email: normalizeText(values.email).toLowerCase(),
    ...buildQuestionColumns(event, values),
    user_id: normalizeText(values.user_id),
    user_ip: getRequestIp(request),
    user_agent: normalizeText(request.headers.get('user-agent')),
    fbp: normalizeText(values.fbp, getCookieValue(request, '_fbp')),
    fbc: normalizeText(values.fbc, getCookieValue(request, '_fbc')),
    submit_time: now,
    voucher: normalizeText(values.voucher),
    custom_fields_json: JSON.stringify(buildCustomFields(event, values)),
  };
  const columns = Object.keys(row);

  await query(
    `INSERT INTO checkin (${columns.map((column) => `\`${column}\``).join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`,
    columns.map((column) => row[column]),
  );
}

export async function POST(request, { params }) {
  try {
    const { slug } = await params;
    const event = await getPublishedLadipageEventBySlug(slug);

    if (!event) {
      return NextResponse.json({ message: 'Không tìm thấy landing page sự kiện.' }, { status: 404 });
    }

    const body = await request.json();
    const values = normalizeFormValues(body?.values);

    validateSubmission(event, values);
    await insertCheckinSubmission(event, values, request, body?.pageUrl);

    if (event.config.webhookUrl) {
      try {
        const webhookResponse = await postWebhookPayload(
          event.config.webhookUrl,
          buildSubmissionPayload(event, values, request, body?.pageUrl),
        );

        if (isWebhookFailure(webhookResponse)) {
          console.warn('Event landing webhook reported failure:', webhookResponse);
        }
      } catch (webhookError) {
        console.warn('Event landing webhook failed after DB insert:', webhookError);
      }
    }

    return NextResponse.json({ message: `SRX Việt Nam đã nhận đăng ký cho ${event.eventName}.` }, { status: 201 });
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
