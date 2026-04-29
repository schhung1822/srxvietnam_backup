USE srx_beauty_shop;

INSERT INTO brands (name, slug, description, is_active)
VALUES
  ('SRX Lab', 'srx-lab', 'Clinical skincare solutions for sensitive skin.', 1),
  ('BioVerse', 'bioverse', 'Barrier-first skincare and daily essentials.', 1),
  ('Fleurique', 'fleurique', 'Beauty color cosmetics for daily makeup.', 1),
  ('Lumiere Skin', 'lumiere-skin', 'Bodycare and haircare with premium textures.', 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  is_active = VALUES(is_active),
  updated_at = CURRENT_TIMESTAMP;

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
  published_at
)
VALUES
  (
    (SELECT id FROM product_categories WHERE slug = 'skincare' LIMIT 1),
    (SELECT id FROM brands WHERE slug = 'srx-lab' LIMIT 1),
    'Serum Peptide B5 phục hồi hàng rào da',
    'serum-peptide-b5-phuc-hoi-da',
    'SRX-PB5',
    'Serum phục hồi cho da nhạy cảm, cấp ẩm sâu và giảm đỏ sau treatment.',
    'Công thức peptide đa tầng kết hợp panthenol giúp làm dịu, củng cố hàng rào da và cải thiện độ đàn hồi chỉ sau vài tuần sử dụng đều đặn.',
    'Dùng sau toner, lấy 2 đến 3 giọt cho toàn mặt. Khóa ẩm bằng kem dưỡng và dùng chống nắng ban ngày.',
    'Peptide complex, Panthenol 5%, Ceramide NP, Beta-glucan, Allantoin',
    'active',
    1,
    1,
    429000,
    399000,
    NOW()
  ),
  (
    (SELECT id FROM product_categories WHERE slug = 'skincare' LIMIT 1),
    (SELECT id FROM brands WHERE slug = 'srx-lab' LIMIT 1),
    'Kem chống nắng Bio Shield SPF50+ PA++++',
    'kem-chong-nang-bio-shield-spf50',
    'SRX-SUN',
    'Màng lọc quang phổ rộng, hoàn thiện ráo mịn và không để lại vệt trắng.',
    'Kem chống nắng lai dưỡng ẩm với màng lọc ổn định, phù hợp môi trường thành thị, giúp bảo vệ da trước UVA, UVB và ánh sáng xanh.',
    'Dùng ở bước cuối routine buổi sáng. Thoa lượng tương đương hai ngón tay cho mặt và cổ, lặp lại khi cần.',
    'Uvinul A Plus, Uvinul T 150, Niacinamide, Vitamin E, Madecassoside',
    'active',
    1,
    1,
    389000,
    359000,
    NOW()
  ),
  (
    (SELECT id FROM product_categories WHERE slug = 'skincare' LIMIT 1),
    (SELECT id FROM brands WHERE slug = 'bioverse' LIMIT 1),
    'Kem dưỡng Ceramide Cloud khóa ẩm 72h',
    'kem-duong-ceramide-cloud',
    'BIO-CC',
    'Chất kem mịn như mây, khóa ẩm bền và giảm khô căng suốt cả ngày.',
    'Kem dưỡng giàu ceramide, cholesterol và squalane cho làn da mềm mịn, ít bong tróc và phục hồi độ căng bóng khỏe mạnh.',
    'Dùng sau serum, lấy lượng vừa đủ cho mặt và cổ. Có thể dùng như sleeping mask cho vùng da rất khô.',
    'Ceramide complex, Squalane, Cholesterol, Shea butter, Oat extract',
    'active',
    1,
    1,
    449000,
    419000,
    NOW()
  ),
  (
    (SELECT id FROM product_categories WHERE slug = 'skincare' LIMIT 1),
    (SELECT id FROM brands WHERE slug = 'bioverse' LIMIT 1),
    'Toner BHA Clarifying Botanical 2%',
    'toner-bha-clarifying-botanical',
    'BIO-BHA',
    'Toner làm sạch sâu lỗ chân lông, giảm bí tắc và bề mặt sần.',
    'Công thức BHA 2% kết hợp chiết xuất thực vật giúp cân bằng dầu thừa, giảm mụn đầu đen và hỗ trợ da mịn hơn sau từng tuần.',
    'Dùng sau bước rửa mặt vào buổi tối 3 đến 4 lần mỗi tuần. Luôn dùng kem chống nắng vào sáng hôm sau.',
    'Salicylic Acid 2%, Green tea water, Centella, Zinc PCA, Panthenol',
    'active',
    1,
    0,
    319000,
    289000,
    NOW()
  ),
  (
    (SELECT id FROM product_categories WHERE slug = 'makeup' LIMIT 1),
    (SELECT id FROM brands WHERE slug = 'fleurique' LIMIT 1),
    'Son tint Rose Veil bóng nhẹ',
    'son-tint-rose-veil',
    'FLR-RV',
    'Màu son trong trẻo, bám vừa phải và giữ môi căng mọng suốt ngày.',
    'Son tint có độ bóng mỏng, lên màu đẹp ngay từ lớp đầu tiên, phù hợp trang điểm hằng ngày và dễ dặm lại.',
    'Tán một lớp mỏng giữa lòng môi để có hiệu ứng blur hoặc layer toàn môi để tăng độ bóng.',
    'Jojoba oil, Vitamin E, Film former nhẹ, Berry pigment',
    'active',
    1,
    0,
    279000,
    259000,
    NOW()
  ),
  (
    (SELECT id FROM product_categories WHERE slug = 'skincare' LIMIT 1),
    (SELECT id FROM brands WHERE slug = 'srx-lab' LIMIT 1),
    'Gel rửa mặt Enzyme Matcha dịu nhẹ',
    'gel-rua-mat-enzyme-matcha',
    'SRX-CLN',
    'Làm sạch lớp dầu thừa nhẹ nhàng, không kéo căng hay châm chích sau khi rửa.',
    'Gel rửa mặt pH cân bằng với enzyme và matcha giúp da sạch dịu, hạn chế bí tắc trong khi vẫn giữ cảm giác mềm mượt.',
    'Làm ướt mặt, lấy lượng gel vừa đủ rồi tạo bọt nhẹ. Massage 30 đến 45 giây rồi rửa sạch.',
    'Protease enzyme, Matcha extract, Glycerin, Panthenol, Betaine',
    'active',
    1,
    0,
    259000,
    239000,
    NOW()
  ),
  (
    (SELECT id FROM product_categories WHERE slug = 'bodycare' LIMIT 1),
    (SELECT id FROM brands WHERE slug = 'lumiere-skin' LIMIT 1),
    'Sữa tắm Niacinamide Body Glow',
    'sua-tam-niacinamide-body-glow',
    'LUM-BG',
    'Làm sạch dịu và hỗ trợ da cơ thể sáng hơn, mềm hơn sau khi tắm.',
    'Sữa tắm có niacinamide và lactic acid nồng độ thấp giúp bề mặt da đều màu, giảm sần nhẹ và cho cảm giác mềm mượt.',
    'Làm ướt da, massage với bông tắm hoặc lòng bàn tay từ 1 đến 2 phút rồi xả sạch.',
    'Niacinamide, Lactic Acid, Glycerin, Shea extract, White musk accord',
    'active',
    1,
    0,
    329000,
    299000,
    NOW()
  ),
  (
    (SELECT id FROM product_categories WHERE slug = 'haircare' LIMIT 1),
    (SELECT id FROM brands WHERE slug = 'lumiere-skin' LIMIT 1),
    'Dầu gội Biotin Volume Repair',
    'dau-goi-biotin-volume-repair',
    'LUM-BIO',
    'Làm sạch da đầu nhẹ nhàng, cho tóc mềm hơn và có độ phồng tự nhiên.',
    'Dầu gội biotin và protein thực vật giúp củng cố sợi tóc, giảm xơ rối và hỗ trợ mái tóc trông dày khỏe hơn sau mỗi lần gội.',
    'Massage trên tóc ướt và da đầu trong 1 phút rồi xả sạch. Lặp lại lần hai nếu cần.',
    'Biotin, Hydrolyzed wheat protein, Amino acid blend, Panthenol, Rosemary water',
    'active',
    1,
    0,
    359000,
    329000,
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
  ((SELECT id FROM products WHERE slug = 'serum-peptide-b5-phuc-hoi-da' LIMIT 1), 'SRX-PB5-30', '30ml', 429000, 399000, 24, 1, 'active'),
  ((SELECT id FROM products WHERE slug = 'serum-peptide-b5-phuc-hoi-da' LIMIT 1), 'SRX-PB5-50', '50ml', 589000, 549000, 13, 0, 'active'),
  ((SELECT id FROM products WHERE slug = 'kem-chong-nang-bio-shield-spf50' LIMIT 1), 'SRX-SUN-50', '50ml', 389000, 359000, 31, 1, 'active'),
  ((SELECT id FROM products WHERE slug = 'kem-chong-nang-bio-shield-spf50' LIMIT 1), 'SRX-SUN-80', '80ml', 529000, 489000, 15, 0, 'active'),
  ((SELECT id FROM products WHERE slug = 'kem-duong-ceramide-cloud' LIMIT 1), 'BIO-CC-50', '50g', 449000, 419000, 20, 1, 'active'),
  ((SELECT id FROM products WHERE slug = 'kem-duong-ceramide-cloud' LIMIT 1), 'BIO-CC-80', '80g', 629000, 589000, 9, 0, 'active'),
  ((SELECT id FROM products WHERE slug = 'toner-bha-clarifying-botanical' LIMIT 1), 'BIO-BHA-150', '150ml', 319000, 289000, 19, 1, 'active'),
  ((SELECT id FROM products WHERE slug = 'toner-bha-clarifying-botanical' LIMIT 1), 'BIO-BHA-250', '250ml', 459000, 419000, 11, 0, 'active'),
  ((SELECT id FROM products WHERE slug = 'son-tint-rose-veil' LIMIT 1), 'FLR-RV-PN', 'Petal Nude', 279000, 259000, 16, 1, 'active'),
  ((SELECT id FROM products WHERE slug = 'son-tint-rose-veil' LIMIT 1), 'FLR-RV-AR', 'Amber Rose', 279000, 259000, 8, 0, 'active'),
  ((SELECT id FROM products WHERE slug = 'son-tint-rose-veil' LIMIT 1), 'FLR-RV-SB', 'Soft Brick', 279000, 259000, 12, 0, 'active'),
  ((SELECT id FROM products WHERE slug = 'gel-rua-mat-enzyme-matcha' LIMIT 1), 'SRX-CLN-120', '120ml', 259000, 239000, 25, 1, 'active'),
  ((SELECT id FROM products WHERE slug = 'gel-rua-mat-enzyme-matcha' LIMIT 1), 'SRX-CLN-200', '200ml', 349000, 319000, 18, 0, 'active'),
  ((SELECT id FROM products WHERE slug = 'sua-tam-niacinamide-body-glow' LIMIT 1), 'LUM-BG-300', '300ml', 329000, 299000, 21, 1, 'active'),
  ((SELECT id FROM products WHERE slug = 'sua-tam-niacinamide-body-glow' LIMIT 1), 'LUM-BG-500', '500ml', 459000, 419000, 10, 0, 'active'),
  ((SELECT id FROM products WHERE slug = 'dau-goi-biotin-volume-repair' LIMIT 1), 'LUM-BIO-350', '350ml', 359000, 329000, 17, 1, 'active'),
  ((SELECT id FROM products WHERE slug = 'dau-goi-biotin-volume-repair' LIMIT 1), 'LUM-BIO-600', '600ml', 529000, 489000, 7, 0, 'active')
ON DUPLICATE KEY UPDATE
  variant_name = VALUES(variant_name),
  price = VALUES(price),
  sale_price = VALUES(sale_price),
  stock_quantity = VALUES(stock_quantity),
  is_default = VALUES(is_default),
  status = VALUES(status),
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO product_attribute_values (product_id, attribute_id, attribute_value_id)
SELECT p.id, a.id, av.id
FROM (
  SELECT 'serum-peptide-b5-phuc-hoi-da' AS product_slug, 'skin_type' AS attribute_code, 'sensitive' AS value_slug
  UNION ALL SELECT 'serum-peptide-b5-phuc-hoi-da', 'skin_type', 'dry'
  UNION ALL SELECT 'serum-peptide-b5-phuc-hoi-da', 'skin_type', 'combination'
  UNION ALL SELECT 'serum-peptide-b5-phuc-hoi-da', 'concern', 'hydration'
  UNION ALL SELECT 'serum-peptide-b5-phuc-hoi-da', 'concern', 'barrier-repair'
  UNION ALL SELECT 'serum-peptide-b5-phuc-hoi-da', 'concern', 'anti-aging'
  UNION ALL SELECT 'kem-chong-nang-bio-shield-spf50', 'skin_type', 'oily'
  UNION ALL SELECT 'kem-chong-nang-bio-shield-spf50', 'skin_type', 'combination'
  UNION ALL SELECT 'kem-duong-ceramide-cloud', 'skin_type', 'dry'
  UNION ALL SELECT 'kem-duong-ceramide-cloud', 'skin_type', 'sensitive'
  UNION ALL SELECT 'kem-duong-ceramide-cloud', 'concern', 'hydration'
  UNION ALL SELECT 'kem-duong-ceramide-cloud', 'concern', 'barrier-repair'
  UNION ALL SELECT 'toner-bha-clarifying-botanical', 'skin_type', 'oily'
  UNION ALL SELECT 'toner-bha-clarifying-botanical', 'skin_type', 'combination'
  UNION ALL SELECT 'toner-bha-clarifying-botanical', 'concern', 'acne'
  UNION ALL SELECT 'toner-bha-clarifying-botanical', 'concern', 'brightening'
  UNION ALL SELECT 'gel-rua-mat-enzyme-matcha', 'skin_type', 'oily'
  UNION ALL SELECT 'gel-rua-mat-enzyme-matcha', 'skin_type', 'sensitive'
) seed
JOIN products p
  ON p.slug = seed.product_slug
JOIN attributes a
  ON a.code = seed.attribute_code
JOIN attribute_values av
  ON av.attribute_id = a.id
 AND av.slug = seed.value_slug
LEFT JOIN product_attribute_values pav
  ON pav.product_id = p.id
 AND pav.attribute_id = a.id
 AND pav.attribute_value_id = av.id
WHERE pav.id IS NULL;

