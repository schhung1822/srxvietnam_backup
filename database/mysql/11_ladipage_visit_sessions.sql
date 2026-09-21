USE srx_beauty_shop;

-- One row per landing page and 30-minute anonymous browser session.
-- Timestamps are stored in UTC; reporting groups them by UTC+7.
CREATE TABLE IF NOT EXISTS ladipage_visit_sessions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  event_id BIGINT UNSIGNED NOT NULL,
  event_slug VARCHAR(180) NOT NULL,
  session_id CHAR(36) NOT NULL,
  device_type ENUM('desktop', 'mobile', 'tablet', 'unknown') NOT NULL DEFAULT 'unknown',
  os_family VARCHAR(32) NOT NULL DEFAULT 'unknown',
  browser_family VARCHAR(32) NOT NULL DEFAULT 'unknown',
  first_seen_at DATETIME(3) NOT NULL,
  last_seen_at DATETIME(3) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_ladipage_visit_event_session (event_id, session_id),
  KEY idx_ladipage_visit_event_time (event_id, first_seen_at),
  KEY idx_ladipage_visit_time (first_seen_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
