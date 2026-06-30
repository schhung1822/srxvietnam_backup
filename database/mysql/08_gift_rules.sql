USE srx_beauty_shop;

CREATE TABLE IF NOT EXISTS gift_rules (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  description VARCHAR(500) NULL,
  rule_type ENUM('product_quantity', 'order_subtotal') NOT NULL,
  product_id BIGINT UNSIGNED NULL,
  variant_id BIGINT UNSIGNED NULL,
  min_quantity INT UNSIGNED NOT NULL DEFAULT 1,
  min_subtotal DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  gift_product_id BIGINT UNSIGNED NULL,
  gift_variant_id BIGINT UNSIGNED NULL,
  gift_sku VARCHAR(100) NULL,
  gift_name VARCHAR(200) NOT NULL,
  gift_variant_name VARCHAR(200) NULL,
  gift_img VARCHAR(500) NULL,
  gift_quantity INT UNSIGNED NOT NULL DEFAULT 1,
  limit_quantity INT UNSIGNED NULL,
  multiply_by_matched_quantity TINYINT(1) NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  starts_at DATETIME NULL,
  ends_at DATETIME NULL,
  priority INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_gift_rules_name (name),
  KEY idx_gift_rules_active_dates (is_active, starts_at, ends_at),
  KEY idx_gift_rules_rule_type (rule_type),
  KEY idx_gift_rules_product_id (product_id),
  KEY idx_gift_rules_variant_id (variant_id),
  KEY idx_gift_rules_gift_product_id (gift_product_id),
  KEY idx_gift_rules_gift_variant_id (gift_variant_id),
  KEY idx_gift_rules_limit_quantity (limit_quantity),
  CONSTRAINT fk_gift_rules_product
    FOREIGN KEY (product_id) REFERENCES products (id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT fk_gift_rules_variant
    FOREIGN KEY (variant_id) REFERENCES product_variants (id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT fk_gift_rules_gift_product
    FOREIGN KEY (gift_product_id) REFERENCES products (id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT fk_gift_rules_gift_variant
    FOREIGN KEY (gift_variant_id) REFERENCES product_variants (id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET @gift_rules_gift_img_exists = (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'gift_rules'
    AND column_name = 'gift_img'
);
SET @sql = IF(
  @gift_rules_gift_img_exists = 0,
  'ALTER TABLE gift_rules ADD COLUMN gift_img VARCHAR(500) NULL AFTER gift_variant_name',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @gift_rules_limit_quantity_exists = (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'gift_rules'
    AND column_name = 'limit_quantity'
);
SET @sql = IF(
  @gift_rules_limit_quantity_exists = 0,
  'ALTER TABLE gift_rules ADD COLUMN limit_quantity INT UNSIGNED NULL AFTER gift_quantity',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_gift_rules_limit_quantity_exists = (
  SELECT COUNT(*)
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'gift_rules'
    AND index_name = 'idx_gift_rules_limit_quantity'
);
SET @sql = IF(
  @idx_gift_rules_limit_quantity_exists = 0,
  'ALTER TABLE gift_rules ADD KEY idx_gift_rules_limit_quantity (limit_quantity)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @order_items_is_gift_exists = (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'order_items'
    AND column_name = 'is_gift'
);
SET @sql = IF(
  @order_items_is_gift_exists = 0,
  'ALTER TABLE order_items ADD COLUMN is_gift TINYINT(1) NOT NULL DEFAULT 0 AFTER line_total',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @order_items_gift_rule_id_exists = (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'order_items'
    AND column_name = 'gift_rule_id'
);
SET @sql = IF(
  @order_items_gift_rule_id_exists = 0,
  'ALTER TABLE order_items ADD COLUMN gift_rule_id BIGINT UNSIGNED NULL AFTER is_gift',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_order_items_is_gift_exists = (
  SELECT COUNT(*)
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'order_items'
    AND index_name = 'idx_order_items_is_gift'
);
SET @sql = IF(
  @idx_order_items_is_gift_exists = 0,
  'ALTER TABLE order_items ADD KEY idx_order_items_is_gift (is_gift)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_order_items_gift_rule_id_exists = (
  SELECT COUNT(*)
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'order_items'
    AND index_name = 'idx_order_items_gift_rule_id'
);
SET @sql = IF(
  @idx_order_items_gift_rule_id_exists = 0,
  'ALTER TABLE order_items ADD KEY idx_order_items_gift_rule_id (gift_rule_id)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @fk_order_items_gift_rule_exists = (
  SELECT COUNT(*)
  FROM information_schema.table_constraints
  WHERE table_schema = DATABASE()
    AND table_name = 'order_items'
    AND constraint_name = 'fk_order_items_gift_rule'
);
SET @sql = IF(
  @fk_order_items_gift_rule_exists = 0,
  'ALTER TABLE order_items ADD CONSTRAINT fk_order_items_gift_rule FOREIGN KEY (gift_rule_id) REFERENCES gift_rules (id) ON DELETE SET NULL ON UPDATE CASCADE',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

UPDATE gift_rules
SET is_active = 0
WHERE name = 'Don hang tu 2 trieu tang tui'
   OR (rule_type = 'order_subtotal' AND gift_sku = 'GIFT-TUI');

UPDATE gift_rules
SET
  description = 'Ap dung khi tam tinh don hang tu 2.000.000 VND.',
  rule_type = 'order_subtotal',
  product_id = NULL,
  variant_id = NULL,
  min_quantity = 1,
  min_subtotal = 2000000.00,
  gift_sku = 'GIFT-GUONG',
  gift_name = 'Guong SRX',
  gift_variant_name = NULL,
  gift_quantity = 1,
  multiply_by_matched_quantity = 0,
  is_active = 1,
  priority = 10
WHERE name = 'Don hang tu 2 trieu tang guong';

INSERT INTO gift_rules (
  name,
  description,
  rule_type,
  min_subtotal,
  gift_sku,
  gift_name,
  gift_quantity,
  priority
)
SELECT
  'Don hang tu 2 trieu tang guong',
  'Ap dung khi tam tinh don hang tu 2.000.000 VND.',
  'order_subtotal',
  2000000.00,
  'GIFT-GUONG',
  'Guong SRX',
  1,
  10
WHERE NOT EXISTS (
  SELECT 1 FROM gift_rules WHERE name = 'Don hang tu 2 trieu tang guong'
);

-- Mau cau hinh gioi han so luong qua va anh qua tang:
-- UPDATE gift_rules
-- SET gift_img = '/assets/images/gifts/guong-srx.webp', limit_quantity = 100
-- WHERE name = 'Don hang tu 2 trieu tang guong';

-- Mau cau hinh mua san pham tang guong khi don chua dat 2 trieu:
-- INSERT INTO gift_rules (
--   name,
--   rule_type,
--   product_id,
--   min_quantity,
--   gift_sku,
--   gift_name,
--   gift_img,
--   gift_quantity,
--   limit_quantity,
--   multiply_by_matched_quantity,
--   priority
-- )
-- VALUES (
--   'Mua 1 san pham tang guong',
--   'product_quantity',
--   1,
--   1,
--   'GIFT-GUONG',
--   'Guong SRX',
--   '/assets/images/gifts/guong-srx.webp',
--   1,
--   100,
--   0,
--   20
-- );