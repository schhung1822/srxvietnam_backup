USE srx_beauty_shop;

ALTER TABLE affiliate_applications
  ADD COLUMN IF NOT EXISTS legal_full_name VARCHAR(150) NULL AFTER user_id,
  ADD COLUMN IF NOT EXISTS permanent_address VARCHAR(255) NULL AFTER legal_full_name,
  ADD COLUMN IF NOT EXISTS national_id_number VARCHAR(30) NULL AFTER permanent_address,
  ADD COLUMN IF NOT EXISTS gender ENUM('male', 'female', 'other', 'prefer_not_to_say') NOT NULL DEFAULT 'prefer_not_to_say' AFTER contact_email,
  ADD COLUMN IF NOT EXISTS facebook_url VARCHAR(500) NULL AFTER gender,
  ADD COLUMN IF NOT EXISTS tiktok_url VARCHAR(500) NULL AFTER facebook_url;

CREATE TABLE IF NOT EXISTS affiliate_bank_accounts (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  affiliate_account_id BIGINT UNSIGNED NOT NULL,
  account_holder_name VARCHAR(150) NOT NULL,
  bank_name VARCHAR(150) NOT NULL,
  bank_branch VARCHAR(150) NULL,
  account_number VARCHAR(50) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_affiliate_bank_accounts_account_id (affiliate_account_id),
  KEY idx_affiliate_bank_accounts_bank_name (bank_name),
  CONSTRAINT fk_affiliate_bank_accounts_account
    FOREIGN KEY (affiliate_account_id) REFERENCES affiliate_accounts (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
