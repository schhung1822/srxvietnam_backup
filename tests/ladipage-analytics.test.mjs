import assert from 'node:assert/strict';
import test from 'node:test';
import {
  classifyVisitorDevice,
  getUtcDateBoundary,
  isValidVisitSessionId,
  summarizeLadipageVisitRows,
} from '../src/lib/server/ladipage-analytics.js';

test('recognizes session tokens and common device categories', () => {
  assert.equal(isValidVisitSessionId('123e4567-e89b-42d3-a456-426614174000'), true);
  assert.equal(isValidVisitSessionId('not-a-session'), false);
  assert.equal(classifyVisitorDevice('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1').deviceType, 'mobile');
  assert.equal(classifyVisitorDevice('Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1').deviceType, 'tablet');
  assert.equal(classifyVisitorDevice('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36').deviceType, 'desktop');
  assert.equal(classifyVisitorDevice('Googlebot/2.1').isBot, true);
});

test('daily report uses UTC+7 boundaries and sums sessions per landing page', () => {
  assert.equal(getUtcDateBoundary('2026-09-21'), '2026-09-20 17:00:00');
  assert.equal(getUtcDateBoundary('2026-09-21', true), '2026-09-21 17:00:00');
  assert.throws(() => getUtcDateBoundary('2026-02-30'), /Invalid report date/);

  const report = summarizeLadipageVisitRows({
    eventId: 12,
    fromDate: '2026-09-21',
    toDate: '2026-09-22',
    rows: [
      { visit_date: '2026-09-21', device_type: 'mobile', os_family: 'Android', browser_family: 'Chrome', sessions: 3, views: 7 },
      { visit_date: '2026-09-21', device_type: 'desktop', os_family: 'Windows', browser_family: 'Edge', sessions: 2, views: 2 },
      { visit_date: '2026-09-22', device_type: 'mobile', os_family: 'iOS', browser_family: 'Safari', sessions: 1, views: 3 },
    ],
  });

  assert.equal(report.totalSessions, 6);
  assert.equal(report.totalViews, 12);
  assert.deepEqual(report.byDevice, { mobile: 4, desktop: 2 });
  assert.deepEqual(report.daily, { '2026-09-21': 5, '2026-09-22': 1 });
  assert.equal(report.eventId, 12);
});
