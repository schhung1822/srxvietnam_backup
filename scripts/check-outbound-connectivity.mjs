import dns from 'node:dns/promises';
import fs from 'node:fs';
import https from 'node:https';
import path from 'node:path';

import { formatErrorDetails } from '../src/lib/server/error-details.js';

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const envText = fs.readFileSync(filePath, 'utf8');

  envText.split(/\r?\n/).forEach((line) => {
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith('#')) {
      return;
    }

    const separatorIndex = trimmedLine.indexOf('=');

    if (separatorIndex === -1) {
      return;
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();
    const rawValue = trimmedLine.slice(separatorIndex + 1).trim();

    if (!key || process.env[key]) {
      return;
    }

    process.env[key] = rawValue.replace(/^['"]|['"]$/g, '');
  });
}

function loadLocalEnv() {
  const candidateDirectories = [];
  let currentDirectory = process.cwd();

  for (let depth = 0; depth < 4; depth += 1) {
    candidateDirectories.push(currentDirectory);

    const parentDirectory = path.dirname(currentDirectory);

    if (parentDirectory === currentDirectory) {
      break;
    }

    currentDirectory = parentDirectory;
  }

  candidateDirectories.forEach((directoryPath) => {
    loadEnvFile(path.join(directoryPath, '.env.local'));
    loadEnvFile(path.join(directoryPath, '.env'));
  });
}

function maskUrl(rawUrl) {
  const url = new URL(rawUrl);

  if (url.hostname === 'open.larksuite.com') {
    const segments = url.pathname.split('/');
    const hookToken = segments.at(-1) || '';

    if (hookToken) {
      segments[segments.length - 1] = `${hookToken.slice(0, 8)}...${hookToken.slice(-4)}`;
      url.pathname = segments.join('/');
    }
  }

  return url.toString();
}

function requestUrl(url, { method = 'GET', body = '', headers = {}, timeoutMs = 8000 } = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const requestBody = typeof body === 'string' ? body : JSON.stringify(body);

    const request = https.request(
      parsedUrl,
      {
        method,
        headers: {
          ...(requestBody ? { 'Content-Length': Buffer.byteLength(requestBody) } : {}),
          ...headers,
        },
      },
      (response) => {
        let responseBody = '';

        response.setEncoding('utf8');
        response.on('data', (chunk) => {
          if (responseBody.length < 500) {
            responseBody += chunk;
          }
        });
        response.on('end', () => {
          resolve({
            statusCode: response.statusCode ?? 0,
            body: responseBody.trim(),
          });
        });
      },
    );

    request.on('error', reject);
    request.setTimeout(timeoutMs, () => {
      request.destroy(new Error(`Request timed out after ${timeoutMs}ms.`));
    });

    if (requestBody) {
      request.write(requestBody);
    }

    request.end();
  });
}

async function checkTarget({ label, url, method, body, headers }) {
  const parsedUrl = new URL(url);

  console.log(`\n[${label}]`);
  console.log(`URL: ${maskUrl(url)}`);

  try {
    const dnsResults = await dns.lookup(parsedUrl.hostname, { all: true });
    console.log(`DNS: ${dnsResults.map((entry) => `${entry.address}${entry.family ? ` (IPv${entry.family})` : ''}`).join(', ')}`);
  } catch (error) {
    console.log(`DNS error:\n${formatErrorDetails(error)}`);
    throw error;
  }

  try {
    const response = await requestUrl(url, {
      method,
      body,
      headers,
    });

    console.log(`HTTP: ${response.statusCode}`);

    if (response.body) {
      console.log(`Body: ${response.body.slice(0, 300)}`);
    }
  } catch (error) {
    console.log(`Request error:\n${formatErrorDetails(error)}`);
    throw error;
  }
}

loadLocalEnv();

const targets = [
  {
    label: 'CRM lead-forms-web',
    url: process.env.SRX_LEAD_FORMS_WEB_API_URL?.trim() || 'https://crm.srx.vn/api/srx/lead-forms-web',
    method: 'POST',
    body: '{}',
    headers: {
      'Content-Type': 'application/json',
      ...(process.env.SRX_LEAD_FORMS_WEB_API_TOKEN?.trim()
        ? { Authorization: `Bearer ${process.env.SRX_LEAD_FORMS_WEB_API_TOKEN.trim()}` }
        : {}),
    },
  },
  {
    label: 'CRM orders_web',
    url: process.env.SRX_ORDERS_WEB_API_URL?.trim() || 'https://crm.srx.vn/api/srx/orders_web',
    method: 'POST',
    body: '{}',
    headers: {
      'Content-Type': 'application/json',
      ...(process.env.SRX_ORDERS_WEB_API_TOKEN?.trim()
        ? { Authorization: `Bearer ${process.env.SRX_ORDERS_WEB_API_TOKEN.trim()}` }
        : {}),
    },
  },
  {
    label: 'CRM affiliate-applications-web',
    url:
      process.env.SRX_AFFILIATE_APPLICATIONS_WEB_API_URL?.trim() ||
      'https://crm.srx.vn/api/srx/affiliate-applications-web',
    method: 'POST',
    body: '{}',
    headers: {
      'Content-Type': 'application/json',
      ...(process.env.SRX_AFFILIATE_APPLICATIONS_WEB_API_TOKEN?.trim()
        ? { Authorization: `Bearer ${process.env.SRX_AFFILIATE_APPLICATIONS_WEB_API_TOKEN.trim()}` }
        : {}),
    },
  },
  {
    label: 'Lark webhook',
    url:
      process.env.LARK_WEBHOOK_URL?.trim() ||
      'https://open.larksuite.com/open-apis/bot/v2/hook/4e741a32-ca82-4381-8b37-5825c7d91f37',
    method: 'POST',
    body: '{}',
    headers: {
      'Content-Type': 'application/json',
    },
  },
];

console.log(`Node: ${process.version}`);
console.log(`CWD: ${process.cwd()}`);

let hasFailure = false;

for (const target of targets) {
  try {
    await checkTarget(target);
  } catch {
    hasFailure = true;
  }
}

if (hasFailure) {
  process.exitCode = 1;
  console.log('\nOne or more outbound checks failed.');
} else {
  console.log('\nAll outbound checks completed without transport errors.');
}
