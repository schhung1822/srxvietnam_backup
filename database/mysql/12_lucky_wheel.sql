USE srx_beauty_shop;

-- Vòng quay may mắn.
--
-- Cấu hình chung (bật/tắt, tiêu đề, luật giới thiệu) lưu ở website_settings, khóa
-- `lucky_wheel`. Phần thưởng, tỷ lệ trúng và lịch sử quay do CRM quản lý ở /srx/lucky-wheel.
-- CRM tự tạo các bảng lucky_wheel_* ở lần mở trang đầu tiên; file này để chạy tay khi cần.
--
-- Lượt quay không lưu thành một con số mà tính bằng: tổng lượt được cộng
-- (lucky_wheel_spin_grants) trừ số lần đã quay (lucky_wheel_spins). Mỗi lần cộng có
-- grant_key duy nhất nên cùng một sự kiện không bao giờ được cộng hai lần.

CREATE TABLE IF NOT EXISTS website_settings (
  setting_key VARCHAR(100) NOT NULL,
  setting_value JSON NOT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS lucky_wheel_prizes (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  description VARCHAR(500) NULL,
  image_url VARCHAR(500) NOT NULL,
  -- no_prize: ô "Chúc bạn may mắn lần sau".
  prize_type ENUM('voucher', 'gift', 'no_prize') NOT NULL DEFAULT 'gift',
  -- Chỉ hiện cho người trúng (vd. mã voucher), không bao giờ gửi ra vòng quay công khai.
  reward_code VARCHAR(100) NULL,
  claim_instructions VARCHAR(500) NULL,
  -- Chỉ với prize_type = 'voucher': mỗi lần trúng sinh một mã giảm giá 8 chữ số dùng 1 lần.
  -- { discount_type: 'percentage' | 'fixed_amount', discount_value, max_discount_amount, min_order_amount }
  voucher_config JSON NULL,
  -- Trọng số trúng tương đối, chỉ CRM thấy. 0 = hiện trên vòng quay nhưng không bao giờ trúng.
  weight INT UNSIGNED NOT NULL DEFAULT 0,
  -- NULL = không giới hạn số lượng.
  stock_total INT UNSIGNED NULL,
  stock_used INT UNSIGNED NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_lucky_wheel_prizes_active (is_active, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS lucky_wheel_spin_grants (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  source ENUM('signup', 'referral') NOT NULL,
  -- signup:<user_id> (1 lượt cho mỗi tài khoản) hoặc referral:<id người được giới thiệu>.
  grant_key VARCHAR(100) NOT NULL,
  spins INT UNSIGNED NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_lucky_wheel_spin_grants_key (grant_key),
  KEY idx_lucky_wheel_spin_grants_user (user_id, source),
  CONSTRAINT fk_lucky_wheel_spin_grants_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS lucky_wheel_spins (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  prize_id BIGINT UNSIGNED NULL,
  -- Chụp lại phần thưởng lúc trúng, để CRM sửa/xóa phần thưởng cũng không làm đổi lịch sử.
  prize_name VARCHAR(150) NOT NULL,
  prize_type ENUM('voucher', 'gift', 'no_prize') NOT NULL,
  reward_code VARCHAR(100) NULL,
  claim_instructions VARCHAR(500) NULL,
  status ENUM('won', 'fulfilled') NOT NULL DEFAULT 'won',
  fulfilled_at DATETIME NULL,
  -- Mã giảm giá sinh riêng cho lượt trúng voucher (discount_codes.class = 'private').
  discount_code_id BIGINT UNSIGNED NULL,
  -- Gửi mã qua tin ZBS (crm-eac gửi): none = không cần gửi.
  zbs_status ENUM('none', 'pending', 'sending', 'sent', 'failed') NOT NULL DEFAULT 'none',
  zbs_msg_id VARCHAR(100) NULL,
  zbs_error VARCHAR(500) NULL,
  zbs_sent_at DATETIME NULL,
  ip_address VARCHAR(45) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_lucky_wheel_spins_user (user_id, created_at),
  KEY idx_lucky_wheel_spins_discount_code (discount_code_id),
  KEY idx_lucky_wheel_spins_created_at (created_at),
  CONSTRAINT fk_lucky_wheel_spins_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_lucky_wheel_spins_prize
    FOREIGN KEY (prize_id) REFERENCES lucky_wheel_prizes (id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Mã giới thiệu của từng người, sinh khi họ mở vòng quay lần đầu.
CREATE TABLE IF NOT EXISTS lucky_wheel_referral_codes (
  user_id BIGINT UNSIGNED NOT NULL,
  code VARCHAR(16) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  UNIQUE KEY uq_lucky_wheel_referral_codes_code (code),
  CONSTRAINT fk_lucky_wheel_referral_codes_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Mỗi lượt mở link giới thiệu là một dòng (visited). Tài khoản tạo SAU lượt mở đó trên
-- cùng trình duyệt được ghép vào (signed_up); khi người đó đủ điều kiện thì người giới
-- thiệu được cộng lượt (credited). referred_user_id UNIQUE: mỗi tài khoản chỉ được tính
-- cho đúng một người giới thiệu.
CREATE TABLE IF NOT EXISTS lucky_wheel_referrals (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  visitor_token CHAR(48) NOT NULL,
  referrer_user_id BIGINT UNSIGNED NOT NULL,
  referred_user_id BIGINT UNSIGNED NULL,
  status ENUM('visited', 'signed_up', 'credited') NOT NULL DEFAULT 'visited',
  visited_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  signed_up_at DATETIME NULL,
  credited_at DATETIME NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_lucky_wheel_referrals_token (visitor_token),
  UNIQUE KEY uq_lucky_wheel_referrals_referred (referred_user_id),
  KEY idx_lucky_wheel_referrals_referrer (referrer_user_id, status),
  CONSTRAINT fk_lucky_wheel_referrals_referrer
    FOREIGN KEY (referrer_user_id) REFERENCES users (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_lucky_wheel_referrals_referred
    FOREIGN KEY (referred_user_id) REFERENCES users (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bản đầu của tính năng cộng lượt khi kích hoạt Zalo (source 'zalo_activation'); nay chỉ cần
-- đăng nhập (source 'signup'). Bảng đã tạo theo bản cũ thì đổi các lượt cũ sang 'signup'
-- (giữ nguyên số lượt, không cộng trùng) rồi bỏ giá trị cũ. Bảng mới tạo thì 3 lệnh này
-- không thay đổi gì. CRM cũng tự làm bước này khi mở trang /srx/lucky-wheel.
ALTER TABLE lucky_wheel_spin_grants
  MODIFY COLUMN source ENUM('zalo_activation', 'signup', 'referral') NOT NULL;

UPDATE lucky_wheel_spin_grants
  SET source = 'signup', grant_key = CONCAT('signup:', user_id)
  WHERE source = 'zalo_activation';

ALTER TABLE lucky_wheel_spin_grants
  MODIFY COLUMN source ENUM('signup', 'referral') NOT NULL;

-- Voucher tự sinh + gửi ZBS. Bảng tạo theo bản trước thì thêm cột còn thiếu (cú pháp
-- IF NOT EXISTS của MariaDB; MySQL 8 thuần thì bỏ IF NOT EXISTS khi chạy). CRM cũng tự thêm.
ALTER TABLE lucky_wheel_prizes
  ADD COLUMN IF NOT EXISTS voucher_config JSON NULL AFTER claim_instructions;

ALTER TABLE lucky_wheel_spins
  ADD COLUMN IF NOT EXISTS discount_code_id BIGINT UNSIGNED NULL AFTER fulfilled_at,
  ADD COLUMN IF NOT EXISTS zbs_status ENUM('none', 'pending', 'sending', 'sent', 'failed') NOT NULL DEFAULT 'none' AFTER discount_code_id,
  ADD COLUMN IF NOT EXISTS zbs_msg_id VARCHAR(100) NULL AFTER zbs_status,
  ADD COLUMN IF NOT EXISTS zbs_error VARCHAR(500) NULL AFTER zbs_msg_id,
  ADD COLUMN IF NOT EXISTS zbs_sent_at DATETIME NULL AFTER zbs_error;

-- Mã riêng (class = 'private', vd. mã vòng quay) được phép dùng cùng 1 mã chung trong một đơn.
-- Website và CRM cũng tự thêm cột này ở lần dùng đầu tiên.
ALTER TABLE discount_codes
  ADD COLUMN IF NOT EXISTS stack_with_public TINYINT(1) NOT NULL DEFAULT 0 AFTER class;
