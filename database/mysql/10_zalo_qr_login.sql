USE srx_beauty_shop;

-- Đăng nhập bằng cách quét mã QR trên Zalo Mini App.
--
-- Luồng: website tạo một "ticket" (mã hiệu lực 5 phút) -> hiển thị QR chứa deep link
-- mini app -> người dùng quét bằng Zalo -> mini app gọi API scan/confirm -> website
-- poll thấy trạng thái confirmed thì đổi lấy cookie phiên đăng nhập.
--
-- Cột zalo_id/auth_provider='zalo' chỉ dùng để nhận diện lại tài khoản ở lần sau.
-- Nếu chưa chạy phần ALTER TABLE users, luồng vẫn hoạt động và khớp tài khoản theo
-- số điện thoại Zalo trả về.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS zalo_id VARCHAR(64) NULL AFTER email;

ALTER TABLE users
  ADD UNIQUE KEY IF NOT EXISTS uq_users_zalo_id (zalo_id);

-- 09_google_oauth.sql tạo cột auth_provider dạng ENUM('local','google'). Bổ sung 'zalo'.
-- Nếu chưa chạy 09 thì câu lệnh dưới tạo mới cột với đủ 3 giá trị.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS auth_provider ENUM('local', 'google', 'zalo') NOT NULL DEFAULT 'local' AFTER zalo_id;

ALTER TABLE users
  MODIFY COLUMN auth_provider ENUM('local', 'google', 'zalo') NOT NULL DEFAULT 'local';

CREATE TABLE IF NOT EXISTS zalo_login_tickets (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  ticket CHAR(48) NOT NULL,
  -- Chỉ trình duyệt tạo ra ticket mới có secret này (lưu trong cookie httpOnly),
  -- nên người khác nhìn thấy mã QR cũng không đọc/nhận được phiên đăng nhập.
  browser_secret_hash CHAR(64) NOT NULL,
  status ENUM('pending', 'scanned', 'confirmed', 'claimed', 'cancelled', 'expired')
    NOT NULL DEFAULT 'pending',
  user_id BIGINT UNSIGNED NULL,
  -- session_token của user_sessions, chỉ được trả về đúng một lần cho trình duyệt.
  session_token CHAR(64) NULL,
  next_path VARCHAR(255) NOT NULL DEFAULT '/account',
  ip_address VARCHAR(45) NULL,
  user_agent VARCHAR(500) NULL,
  scanned_at DATETIME NULL,
  confirmed_at DATETIME NULL,
  claimed_at DATETIME NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_zalo_login_tickets_ticket (ticket),
  KEY idx_zalo_login_tickets_status (status),
  KEY idx_zalo_login_tickets_expires_at (expires_at),
  KEY idx_zalo_login_tickets_user_id (user_id),
  CONSTRAINT fk_zalo_login_tickets_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
