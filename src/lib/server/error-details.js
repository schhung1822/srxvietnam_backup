function appendDetail(parts, label, value) {
  if (value === undefined || value === null || value === '') {
    return;
  }

  parts.push(`${label}=${value}`);
}

function normalizeErrorEntry(error) {
  if (!(error instanceof Error)) {
    return {
      name: 'Error',
      message: String(error ?? 'Unknown error'),
    };
  }

  const entry = {
    name: error.name || 'Error',
    message: error.message || 'Unknown error',
  };

  appendDetail(entry.details ??= [], 'code', error.code);
  appendDetail(entry.details, 'errno', error.errno);
  appendDetail(entry.details, 'syscall', error.syscall);
  appendDetail(entry.details, 'hostname', error.hostname);
  appendDetail(entry.details, 'host', error.host);
  appendDetail(entry.details, 'address', error.address);
  appendDetail(entry.details, 'port', error.port);
  appendDetail(entry.details, 'statusCode', error.statusCode);
  appendDetail(entry.details, 'type', error.type);

  return entry;
}

export function getErrorChain(error) {
  const chain = [];
  const seen = new Set();
  let current = error;

  while (current && typeof current === 'object' && !seen.has(current)) {
    seen.add(current);
    chain.push(normalizeErrorEntry(current));
    current = current.cause;
  }

  if (!chain.length) {
    chain.push(normalizeErrorEntry(error));
  }

  return chain;
}

export function formatErrorDetails(error) {
  return getErrorChain(error)
    .map((entry, index) => {
      const prefix = index === 0 ? '' : 'caused by ';
      const details = Array.isArray(entry.details) && entry.details.length ? ` | ${entry.details.join(' | ')}` : '';
      return `${prefix}${entry.name}: ${entry.message}${details}`;
    })
    .join('\n');
}
