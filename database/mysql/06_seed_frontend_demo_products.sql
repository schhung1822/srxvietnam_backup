USE srx_beauty_shop;

INSERT INTO brands (name, slug, description, is_active)
VALUES
  ('SRX', 'srx', 'SRX clinical beauty products.', 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  is_active = VALUES(is_active),
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO product_categories (parent_id, name, slug, description, sort_order)
VALUES
  (NULL, 'Skincare', 'skincare', 'Core skincare catalog.', 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  sort_order = VALUES(sort_order),
  updated_at = CURRENT_TIMESTAMP;

-- Sử dụng biến tạm để tránh lỗi 1093 khi Insert/Update bảng product_categories
SET @skincare_id = (SELECT id FROM product_categories WHERE slug = 'skincare' LIMIT 1);

INSERT INTO product_categories (parent_id, name, slug, description, sort_order)
VALUES
  (@skincare_id, 'Phục hồi da', 'phuc-hoi-da', 'Nhóm sản phẩm phục hồi và làm dịu da.', 10),
  (@skincare_id, 'Tái tạo da', 'tai-tao-da', 'Nhóm sản phẩm tái tạo và cải thiện bề mặt da.', 20),
  (@skincare_id, 'Bảo vệ da', 'bao-ve-da', 'Nhóm sản phẩm bảo vệ da và chống nắng.', 30)
ON DUPLICATE KEY UPDATE
  parent_id = VALUES(parent_id),
  name = VALUES(name),
  description = VALUES(description),
  sort_order = VALUES(sort_order),
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO attributes (code, name, input_type, is_filterable, is_variant_axis, sort_order)
VALUES
  ('skin_type', 'Skin Type', 'multi_select', 1, 0, 1),
  ('concern', 'Concern', 'multi_select', 1, 0, 2)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  input_type = VALUES(input_type),
  is_filterable = VALUES(is_filterable),
  is_variant_axis = VALUES(is_variant_axis),
  sort_order = VALUES(sort_order),
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO attribute_values (attribute_id, value, slug, sort_order)
SELECT a.id, seed.value, seed.slug, seed.sort_order
FROM attributes a
JOIN (
  SELECT 'skin_type' AS attribute_code, 'Sensitive' AS value, 'sensitive' AS slug, 10 AS sort_order
  UNION ALL SELECT 'skin_type', 'Dry', 'dry', 20
  UNION ALL SELECT 'skin_type', 'Oily', 'oily', 30
  UNION ALL SELECT 'skin_type', 'Combination', 'combination', 40
  UNION ALL SELECT 'concern', 'Hydration', 'hydration', 10
  UNION ALL SELECT 'concern', 'Barrier Repair', 'barrier-repair', 20
  UNION ALL SELECT 'concern', 'Soothing', 'soothing', 30
  UNION ALL SELECT 'concern', 'After Treatment', 'after-treatment', 40
  UNION ALL SELECT 'concern', 'Regeneration', 'regeneration', 50
  UNION ALL SELECT 'concern', 'Anti Aging', 'anti-aging', 60
  UNION ALL SELECT 'concern', 'Brightening', 'brightening', 70
  UNION ALL SELECT 'concern', 'Oil Control', 'oil-control', 80
  UNION ALL SELECT 'concern', 'UV Protection', 'uv-protection', 90
) seed
  ON seed.attribute_code = a.code
LEFT JOIN attribute_values av
  ON av.attribute_id = a.id
 AND av.slug = seed.slug
WHERE av.id IS NULL;

DELETE FROM products
WHERE slug IN (
  'serum-peptide-b5-phuc-hoi-da',
  'kem-chong-nang-bio-shield-spf50',
  'kem-duong-ceramide-cloud',
  'toner-bha-clarifying-botanical',
  'son-tint-rose-veil',
  'gel-rua-mat-enzyme-matcha',
  'sua-tam-niacinamide-body-glow',
  'dau-goi-biotin-volume-repair'
);

INSERT INTO products (
  category_id,
  brand_id,
  name,
  slug,
  product_code,
  short_description,
  description,
  usage_instructions,
  ingredient_list,
  status,
  has_variants,
  is_featured,
  base_price,
  sale_price,
  thumbnail_url,
  rating_average,
  rating_count,
  sold_count,
  published_at
)
VALUES
  (
    (SELECT id FROM product_categories WHERE slug = 'phuc-hoi-da' LIMIT 1),
    (SELECT id FROM brands WHERE slug = 'srx' LIMIT 1),
    'Tinh chất SRX Repair Ampoule 50ml',
    'srx-repair-ampoule-50ml',
    'SRX-RA',
    'Giải pháp tái sinh và chữa lành tổn thương trên da nhạy cảm, hỗ trợ làm dịu nhanh nền da mỏng yếu sau treatment.',
    'SRX Repair Ampoule là tinh chất cấp ẩm phục hồi cho làn da khô ráp, thiếu nước, dễ kích ứng hoặc vừa trải qua các liệu trình xâm lấn như laser, lăn kim và peel da. Kết cấu serum thẩm thấu nhanh, thoáng nhẹ, phù hợp cho routine phục hồi mỗi ngày.',
    'Làm sạch da với sản phẩm tẩy trang và sữa rửa mặt dịu nhẹ.\nLấy 2 đến 3 giọt tinh chất, chấm lên trán, má và cằm rồi thoa đều từ trong ra ngoài.\nDùng đều đặn mỗi ngày để duy trì nền da khỏe và phục hồi nhanh hơn sau treatment.',
    'Copper Tripeptide-1, Panthenol, Ceramide, Betaine, Sodium Hyaluronate',
    'active',
    1,
    1,
    790000,
    740000,
    '/assets/images/products/DxlGqif6SjoxKpaOGNxHTFuNek.webp',
    4.90,
    128,
    640,
    NOW()
  ),
  (
    (SELECT id FROM product_categories WHERE slug = 'phuc-hoi-da' LIMIT 1),
    (SELECT id FROM brands WHERE slug = 'srx' LIMIT 1),
    'SRX Recovery Booster 50ml',
    'srx-recovery-booster-50ml',
    'SRX-RB',
    'Gel tăng cường phục hồi da thế hệ mới giúp cấp nước nhanh, hỗ trợ rút ngắn thời gian tái tạo và làm dịu kích ứng.',
    'SRX Recovery Booster là gel phục hồi chuyên sâu dành cho làn da thiếu nước, nhạy cảm, sau xâm lấn hoặc đang treatment mạnh. Sản phẩm tập trung vào cấp ẩm tức thì, phục hồi hàng rào bảo vệ tự nhiên và giảm thiểu các tác nhân gây hại từ môi trường.',
    'Làm sạch da và cân bằng với toner dịu nhẹ trước khi dùng booster.\nCó thể dùng sau lớp tinh chất lỏng như Repair Ampoule, sau đó lấy 1 đến 2 hạt đậu gel thoa đều toàn mặt.\nBan ngày luôn kết thúc routine bằng kem chống nắng để bảo vệ nền da đang phục hồi.',
    'Copper Tripeptides-1, Ceramides, Panthenol, Hydroxydecyl Ubiquinone',
    'active',
    1,
    1,
    920000,
    850000,
    '/assets/images/products/qp31eL87RIERDgBJ6THoWtlgO5Y.avif',
    4.90,
    94,
    420,
    NOW()
  ),
  (
    (SELECT id FROM product_categories WHERE slug = 'tai-tao-da' LIMIT 1),
    (SELECT id FROM brands WHERE slug = 'srx' LIMIT 1),
    'SRX Retinol A Cream 50ml',
    'srx-retinol-a-cream-50ml',
    'SRX-RET',
    'Kem tái tạo và trẻ hóa da thế hệ mới với Retinol Complex 8%, tập trung chống lão hóa, làm sáng da và cải thiện bề mặt da.',
    'SRX Retinol A Cream là dòng kem tái tạo chuyên sâu dành cho làn da cần xử lý lão hóa, xỉn màu, bít tắc và bề mặt thô ráp. Công thức kết hợp Retinol Complex 8%, 30 loại peptides, Glycolic Acid 5%, Glutathione và Niacinamide để tăng tốc độ thay sừng nhưng vẫn hỗ trợ nền da ổn định hơn.',
    'Làm sạch da, dùng toner dịu nhẹ và lớp serum phục hồi trước khi bôi kem.\nLấy lượng kem cỡ 1 hạt đậu xanh, thoa một lớp mỏng lên toàn mặt và tránh vùng mắt, khóe mũi, mép môi.\nBắt đầu với tần suất 2 đến 3 lần mỗi tuần nếu da nhạy cảm, sau đó tăng dần; ban ngày bắt buộc dùng kem chống nắng.',
    'Retinol Complex 8%, 30 loại Peptides, Glycolic Acid 5%, Glutathione, Niacinamide',
    'active',
    1,
    1,
    1150000,
    1050000,
    '/assets/images/products/8YqNMp1LLntVSTG9iHzSmb4kI.avif',
    5.00,
    173,
    980,
    NOW()
  ),
  (
    (SELECT id FROM product_categories WHERE slug = 'bao-ve-da' LIMIT 1),
    (SELECT id FROM brands WHERE slug = 'srx' LIMIT 1),
    'SRX Rosy Veil Tone Up Glow Sun SPF50 PA+++ 50ml',
    'srx-rosy-veil-tone-up-glow-sun-50ml',
    'SRX-RV',
    'Kem chống nắng nâng tông 3 trong 1 giúp bảo vệ da, làm sáng tức thì và tạo hiệu ứng căng bóng nhẹ cho nền da mệt mỏi.',
    'SRX Rosy Veil Tone Up Glow Sun là giải pháp bảo vệ da ban ngày kết hợp chống nắng quang phổ rộng, hiệu ứng tone up hồng nhẹ và lớp finish glow mướt. Công thức tập trung vào làm dịu, dưỡng sáng và cấp nước để phù hợp với cả làn da nhạy cảm hoặc da sau treatment.',
    'Dùng trên lớp dưỡng ẩm; với da dầu có thể dùng trực tiếp như bước dưỡng ẩm kiêm chống nắng 2 trong 1.\nLấy lượng kem theo quy tắc 2 ngón tay, chấm lên mặt rồi vỗ nhẹ để kem dàn đều và tiệp vào da.\nThoa lại sau mỗi 2 đến 3 giờ nếu hoạt động liên tục ngoài trời hoặc đổ nhiều mồ hôi.',
    'Niacinamide, Centella Asiatica, Panthenol, Glutathione, Hyaluronic Acid',
    'active',
    1,
    1,
    429000,
    389000,
    '/assets/images/products/0J73ScfckdOF2U3ruS0VR6nI2Xw.avif',
    4.80,
    76,
    388,
    NOW()
  )
ON DUPLICATE KEY UPDATE
  category_id = VALUES(category_id),
  brand_id = VALUES(brand_id),
  name = VALUES(name),
  short_description = VALUES(short_description),
  description = VALUES(description),
  usage_instructions = VALUES(usage_instructions),
  ingredient_list = VALUES(ingredient_list),
  status = VALUES(status),
  has_variants = VALUES(has_variants),
  is_featured = VALUES(is_featured),
  base_price = VALUES(base_price),
  sale_price = VALUES(sale_price),
  thumbnail_url = VALUES(thumbnail_url),
  rating_average = VALUES(rating_average),
  rating_count = VALUES(rating_count),
  sold_count = VALUES(sold_count),
  published_at = VALUES(published_at),
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO product_variants (
  product_id,
  sku,
  variant_name,
  price,
  sale_price,
  stock_quantity,
  is_default,
  status
)
VALUES
  ((SELECT id FROM products WHERE slug = 'srx-repair-ampoule-50ml' LIMIT 1), 'SRX-RA-50', '50ml', 790000, 740000, 18, 1, 'active'),
  ((SELECT id FROM products WHERE slug = 'srx-recovery-booster-50ml' LIMIT 1), 'SRX-RB-50', '50ml', 920000, 850000, 14, 1, 'active'),
  ((SELECT id FROM products WHERE slug = 'srx-retinol-a-cream-50ml' LIMIT 1), 'SRX-RET-50', '50ml', 1150000, 1050000, 11, 1, 'active'),
  ((SELECT id FROM products WHERE slug = 'srx-rosy-veil-tone-up-glow-sun-50ml' LIMIT 1), 'SRX-RV-50', '50ml', 429000, 389000, 20, 1, 'active')
ON DUPLICATE KEY UPDATE
  product_id = VALUES(product_id),
  variant_name = VALUES(variant_name),
  price = VALUES(price),
  sale_price = VALUES(sale_price),
  stock_quantity = VALUES(stock_quantity),
  is_default = VALUES(is_default),
  status = VALUES(status),
  updated_at = CURRENT_TIMESTAMP;

DELETE pi
FROM product_images pi
INNER JOIN products p
  ON p.id = pi.product_id
WHERE p.slug IN (
  'srx-repair-ampoule-50ml',
  'srx-recovery-booster-50ml',
  'srx-retinol-a-cream-50ml',
  'srx-rosy-veil-tone-up-glow-sun-50ml'
);

INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
VALUES
  ((SELECT id FROM products WHERE slug = 'srx-repair-ampoule-50ml' LIMIT 1), '/assets/images/products/DxlGqif6SjoxKpaOGNxHTFuNek.webp', 'SRX Repair Ampoule - Bao bì', 1, 1),
  ((SELECT id FROM products WHERE slug = 'srx-repair-ampoule-50ml' LIMIT 1), '/assets/images/products/yM3Ek7WKUdnGwqMkfDTCELyX7E.avif', 'SRX Repair Ampoule - Kết cấu', 2, 0),
  ((SELECT id FROM products WHERE slug = 'srx-repair-ampoule-50ml' LIMIT 1), '/assets/images/products/8YqNMp1LLntVSTG9iHzSmb4kI.avif', 'SRX Repair Ampoule - Routine', 3, 0),
  ((SELECT id FROM products WHERE slug = 'srx-recovery-booster-50ml' LIMIT 1), '/assets/images/products/qp31eL87RIERDgBJ6THoWtlgO5Y.avif', 'SRX Recovery Booster - Bao bì', 1, 1),
  ((SELECT id FROM products WHERE slug = 'srx-recovery-booster-50ml' LIMIT 1), '/assets/images/products/mE7jC3367liaeyEtElFGpmhCW0.avif', 'SRX Recovery Booster - Kết cấu', 2, 0),
  ((SELECT id FROM products WHERE slug = 'srx-recovery-booster-50ml' LIMIT 1), '/assets/images/products/yM3Ek7WKUdnGwqMkfDTCELyX7E.avif', 'SRX Recovery Booster - Routine', 3, 0),
  ((SELECT id FROM products WHERE slug = 'srx-retinol-a-cream-50ml' LIMIT 1), '/assets/images/products/8YqNMp1LLntVSTG9iHzSmb4kI.avif', 'SRX Retinol A Cream - Bao bì', 1, 1),
  ((SELECT id FROM products WHERE slug = 'srx-retinol-a-cream-50ml' LIMIT 1), '/assets/images/products/zyl98xm7YqGvQBgtrBs7iHEv94.avif', 'SRX Retinol A Cream - Kết cấu', 2, 0),
  ((SELECT id FROM products WHERE slug = 'srx-retinol-a-cream-50ml' LIMIT 1), '/assets/images/products/0J73ScfckdOF2U3ruS0VR6nI2Xw.avif', 'SRX Retinol A Cream - Routine', 3, 0),
  ((SELECT id FROM products WHERE slug = 'srx-rosy-veil-tone-up-glow-sun-50ml' LIMIT 1), '/assets/images/products/0J73ScfckdOF2U3ruS0VR6nI2Xw.avif', 'SRX Rosy Veil Glow Sun - Bao bì', 1, 1),
  ((SELECT id FROM products WHERE slug = 'srx-rosy-veil-tone-up-glow-sun-50ml' LIMIT 1), '/assets/images/products/qp31eL87RIERDgBJ6THoWtlgO5Y.avif', 'SRX Rosy Veil Glow Sun - Kết cấu', 2, 0),
  ((SELECT id FROM products WHERE slug = 'srx-rosy-veil-tone-up-glow-sun-50ml' LIMIT 1), '/assets/images/products/DxlGqif6SjoxKpaOGNxHTFuNek.webp', 'SRX Rosy Veil Glow Sun - Routine', 3, 0);

DELETE pav
FROM product_attribute_values pav
INNER JOIN products p
  ON p.id = pav.product_id
INNER JOIN attributes a
  ON a.id = pav.attribute_id
WHERE p.slug IN (
  'srx-repair-ampoule-50ml',
  'srx-recovery-booster-50ml',
  'srx-retinol-a-cream-50ml',
  'srx-rosy-veil-tone-up-glow-sun-50ml'
)
AND a.code IN ('skin_type', 'concern');

INSERT INTO product_attribute_values (product_id, attribute_id, attribute_value_id)
SELECT p.id, a.id, av.id
FROM (
  SELECT 'srx-repair-ampoule-50ml' AS product_slug, 'skin_type' AS attribute_code, 'sensitive' AS value_slug
  UNION ALL SELECT 'srx-repair-ampoule-50ml', 'skin_type', 'dry'
  UNION ALL SELECT 'srx-repair-ampoule-50ml', 'skin_type', 'combination'
  UNION ALL SELECT 'srx-repair-ampoule-50ml', 'concern', 'barrier-repair'
  UNION ALL SELECT 'srx-repair-ampoule-50ml', 'concern', 'hydration'
  UNION ALL SELECT 'srx-repair-ampoule-50ml', 'concern', 'soothing'
  UNION ALL SELECT 'srx-repair-ampoule-50ml', 'concern', 'after-treatment'
  UNION ALL SELECT 'srx-recovery-booster-50ml', 'skin_type', 'sensitive'
  UNION ALL SELECT 'srx-recovery-booster-50ml', 'skin_type', 'dry'
  UNION ALL SELECT 'srx-recovery-booster-50ml', 'skin_type', 'oily'
  UNION ALL SELECT 'srx-recovery-booster-50ml', 'skin_type', 'combination'
  UNION ALL SELECT 'srx-recovery-booster-50ml', 'concern', 'barrier-repair'
  UNION ALL SELECT 'srx-recovery-booster-50ml', 'concern', 'hydration'
  UNION ALL SELECT 'srx-recovery-booster-50ml', 'concern', 'soothing'
  UNION ALL SELECT 'srx-recovery-booster-50ml', 'concern', 'after-treatment'
  UNION ALL SELECT 'srx-retinol-a-cream-50ml', 'skin_type', 'dry'
  UNION ALL SELECT 'srx-retinol-a-cream-50ml', 'skin_type', 'oily'
  UNION ALL SELECT 'srx-retinol-a-cream-50ml', 'skin_type', 'combination'
  UNION ALL SELECT 'srx-retinol-a-cream-50ml', 'skin_type', 'sensitive'
  UNION ALL SELECT 'srx-retinol-a-cream-50ml', 'concern', 'regeneration'
  UNION ALL SELECT 'srx-retinol-a-cream-50ml', 'concern', 'anti-aging'
  UNION ALL SELECT 'srx-retinol-a-cream-50ml', 'concern', 'brightening'
  UNION ALL SELECT 'srx-retinol-a-cream-50ml', 'concern', 'oil-control'
  UNION ALL SELECT 'srx-rosy-veil-tone-up-glow-sun-50ml', 'skin_type', 'sensitive'
  UNION ALL SELECT 'srx-rosy-veil-tone-up-glow-sun-50ml', 'skin_type', 'dry'
  UNION ALL SELECT 'srx-rosy-veil-tone-up-glow-sun-50ml', 'skin_type', 'oily'
  UNION ALL SELECT 'srx-rosy-veil-tone-up-glow-sun-50ml', 'skin_type', 'combination'
  UNION ALL SELECT 'srx-rosy-veil-tone-up-glow-sun-50ml', 'concern', 'uv-protection'
  UNION ALL SELECT 'srx-rosy-veil-tone-up-glow-sun-50ml', 'concern', 'brightening'
  UNION ALL SELECT 'srx-rosy-veil-tone-up-glow-sun-50ml', 'concern', 'hydration'
  UNION ALL SELECT 'srx-rosy-veil-tone-up-glow-sun-50ml', 'concern', 'oil-control'
) seed
INNER JOIN products p
  ON p.slug = seed.product_slug
INNER JOIN attributes a
  ON a.code = seed.attribute_code
INNER JOIN attribute_values av
  ON av.attribute_id = a.id
 AND av.slug = seed.value_slug;