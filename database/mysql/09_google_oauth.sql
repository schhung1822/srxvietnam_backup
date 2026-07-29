USE srx_beauty_shop;

-- Đăng nhập bằng Google.
-- File này không bắt buộc: nếu chưa chạy, hệ thống vẫn khớp tài khoản Google theo email
-- đã được Google xác thực. Chạy file này để lưu thêm google_id và nguồn đăng ký.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS google_id VARCHAR(64) NULL AFTER email,
  ADD COLUMN IF NOT EXISTS auth_provider ENUM('local', 'google') NOT NULL DEFAULT 'local' AFTER google_id;

ALTER TABLE users
  ADD UNIQUE KEY IF NOT EXISTS uq_users_google_id (google_id);
