import { query } from './db.js';

const CREATE_VISITS_TABLE = `
  CREATE TABLE IF NOT EXISTS ladipage_visit_sessions (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    event_id BIGINT UNSIGNED NOT NULL,
    event_slug VARCHAR(180) NOT NULL,
    session_id CHAR(36) NOT NULL,
    device_type ENUM('desktop', 'mobile', 'tablet', 'unknown') NOT NULL DEFAULT 'unknown',
    os_family VARCHAR(32) NOT NULL DEFAULT 'unknown',
    browser_family VARCHAR(32) NOT NULL DEFAULT 'unknown',
    page_views INT UNSIGNED NOT NULL DEFAULT 1,
    first_seen_at DATETIME(3) NOT NULL,
    last_seen_at DATETIME(3) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_ladipage_visit_event_session (event_id, session_id),
    KEY idx_ladipage_visit_event_time (event_id, first_seen_at),
    KEY idx_ladipage_visit_time (first_seen_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
`;

const SESSION_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const BOT_USER_AGENT_PATTERN = /bot|crawl|spider|slurp|facebookexternalhit|headless|lighthouse|preview/i;
const REPORT_TIMEZONE_OFFSET_MS = 7 * 60 * 60 * 1000;
let ensureVisitsTablePromise;

export function isValidVisitSessionId(value) {
  return typeof value === 'string' && SESSION_ID_PATTERN.test(value);
}

export function classifyVisitorDevice(userAgent) {
  const ua = String(userAgent ?? '').slice(0, 500);

  if (!ua) {
    return { deviceType: 'unknown', osFamily: 'unknown', browserFamily: 'unknown', isBot: false };
  }

  const isBot = BOT_USER_AGENT_PATTERN.test(ua);
  const deviceType = /iPad|Tablet|Android(?!.*Mobile)/i.test(ua)
    ? 'tablet'
    : /iPhone|iPod|Android|Mobile|Windows Phone/i.test(ua)
      ? 'mobile'
      : 'desktop';
  const osFamily = /iPhone|iPad|iPod/i.test(ua)
    ? 'iOS'
    : /Android/i.test(ua)
      ? 'Android'
      : /Windows/i.test(ua)
        ? 'Windows'
        : /Mac OS X|Macintosh/i.test(ua)
          ? 'macOS'
          : /Linux/i.test(ua)
            ? 'Linux'
            : 'unknown';
  const browserFamily = /Edg\/|EdgiOS|EdgA/i.test(ua)
    ? 'Edge'
    : /SamsungBrowser/i.test(ua)
      ? 'Samsung Internet'
      : /FxiOS|Firefox/i.test(ua)
        ? 'Firefox'
        : /CriOS|Chrome/i.test(ua)
          ? 'Chrome'
          : /Safari/i.test(ua)
            ? 'Safari'
            : 'unknown';

  return { deviceType, osFamily, browserFamily, isBot };
}

async function ensureVisitsTable() {
  if (!ensureVisitsTablePromise) {
    ensureVisitsTablePromise = (async () => {
      await query(CREATE_VISITS_TABLE);
      const columns = await query("SHOW COLUMNS FROM ladipage_visit_sessions LIKE 'page_views'");
      if (!columns.length) {
        try {
          await query('ALTER TABLE ladipage_visit_sessions ADD COLUMN page_views INT UNSIGNED NOT NULL DEFAULT 1');
        } catch (error) {
          if (error.code !== 'ER_DUP_FIELDNAME') throw error;
        }
      }
    })().catch((error) => {
      ensureVisitsTablePromise = undefined;
      throw error;
    });
  }

  await ensureVisitsTablePromise;
}

export async function recordLadipageVisit({ event, sessionId, userAgent }) {
  if (!isValidVisitSessionId(sessionId)) {
    throw new Error('Invalid visit session ID.');
  }

  const device = classifyVisitorDevice(userAgent);

  if (device.isBot) {
    return false;
  }

  await ensureVisitsTable();
  await query(
    `INSERT INTO ladipage_visit_sessions
      (event_id, event_slug, session_id, device_type, os_family, browser_family, first_seen_at, last_seen_at)
     VALUES (?, ?, ?, ?, ?, ?, UTC_TIMESTAMP(3), UTC_TIMESTAMP(3))
     ON DUPLICATE KEY UPDATE last_seen_at = UTC_TIMESTAMP(3), event_slug = VALUES(event_slug), page_views = page_views + 1`,
    [event.id, event.slug, sessionId, device.deviceType, device.osFamily, device.browserFamily],
  );

  return true;
}

export function getUtcDateBoundary(localDate, nextDay = false) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(localDate)) {
    throw new Error('Report date must use YYYY-MM-DD.');
  }

  const localMidnight = new Date(`${localDate}T00:00:00Z`);

  if (Number.isNaN(localMidnight.getTime()) || localMidnight.toISOString().slice(0, 10) !== localDate) {
    throw new Error('Invalid report date.');
  }

  const utcDate = new Date(localMidnight.getTime() - REPORT_TIMEZONE_OFFSET_MS + (nextDay ? 86400000 : 0));
  return utcDate.toISOString().slice(0, 19).replace('T', ' ');
}

export function summarizeLadipageVisitRows({ eventId, fromDate, toDate, rows }) {
  const report = { eventId, fromDate, toDate, totalViews: 0, totalSessions: 0, byDevice: {}, byOs: {}, byBrowser: {}, daily: {} };

  for (const row of rows) {
    const count = Number(row.sessions);
    report.totalViews += Number(row.views);
    report.totalSessions += count;
    report.byDevice[row.device_type] = (report.byDevice[row.device_type] || 0) + count;
    report.byOs[row.os_family] = (report.byOs[row.os_family] || 0) + count;
    report.byBrowser[row.browser_family] = (report.byBrowser[row.browser_family] || 0) + count;
    report.daily[row.visit_date] = (report.daily[row.visit_date] || 0) + count;
  }

  return report;
}

export async function getLadipageVisitReport({ eventId, fromDate, toDate }) {
  const fromUtc = getUtcDateBoundary(fromDate);
  const untilUtc = getUtcDateBoundary(toDate, true);

  if (fromUtc >= untilUtc) {
    throw new Error('Report date range is invalid.');
  }

  await ensureVisitsTable();
  const rows = await query(
    `SELECT DATE_FORMAT(DATE_ADD(first_seen_at, INTERVAL 7 HOUR), '%Y-%m-%d') AS visit_date,
            device_type, os_family, browser_family, COUNT(*) AS sessions, SUM(page_views) AS views
     FROM ladipage_visit_sessions
     WHERE event_id = ? AND first_seen_at >= ? AND first_seen_at < ?
     GROUP BY visit_date, device_type, os_family, browser_family
     ORDER BY visit_date, device_type, os_family, browser_family`,
    [eventId, fromUtc, untilUtc],
  );

  return summarizeLadipageVisitRows({ eventId, fromDate, toDate, rows });
}
