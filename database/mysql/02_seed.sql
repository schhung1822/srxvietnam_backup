USE srx_beauty_shop;

INSERT INTO article_categories (name, slug, description, sort_order)
VALUES
  ('Tin tuc', 'tin-tuc', 'News articles and announcements.', 1),
  ('Su kien', 'su-kien', 'Events, launches and campaigns.', 2),
  ('Kien thuc', 'kien-thuc', 'Educational beauty and skincare knowledge.', 3)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  sort_order = VALUES(sort_order),
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO product_categories (parent_id, name, slug, description, sort_order)
VALUES
  (NULL, 'Skincare', 'skincare', 'Core skincare catalog.', 1),
  (NULL, 'Makeup', 'makeup', 'Face, lip and eye makeup.', 2),
  (NULL, 'Bodycare', 'bodycare', 'Body care and bath products.', 3),
  (NULL, 'Haircare', 'haircare', 'Hair treatment and styling products.', 4),
  (NULL, 'Fragrance', 'fragrance', 'Perfume and scented products.', 5)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  sort_order = VALUES(sort_order),
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO attributes (code, name, input_type, is_filterable, is_variant_axis, sort_order)
VALUES
  ('skin_type', 'Skin Type', 'multi_select', 1, 0, 1),
  ('concern', 'Concern', 'multi_select', 1, 0, 2),
  ('texture', 'Texture', 'select', 1, 0, 3),
  ('volume_ml', 'Volume (ml)', 'number', 1, 1, 4),
  ('shade', 'Shade', 'select', 1, 1, 5)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  input_type = VALUES(input_type),
  is_filterable = VALUES(is_filterable),
  is_variant_axis = VALUES(is_variant_axis),
  sort_order = VALUES(sort_order),
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO attribute_values (attribute_id, value, slug, sort_order)
SELECT a.id, v.value, v.slug, v.sort_order
FROM attributes a
JOIN (
  SELECT 'skin_type' AS attribute_code, 'Normal' AS value, 'normal' AS slug, 1 AS sort_order
  UNION ALL SELECT 'skin_type', 'Dry', 'dry', 2
  UNION ALL SELECT 'skin_type', 'Oily', 'oily', 3
  UNION ALL SELECT 'skin_type', 'Combination', 'combination', 4
  UNION ALL SELECT 'skin_type', 'Sensitive', 'sensitive', 5
  UNION ALL SELECT 'concern', 'Acne', 'acne', 1
  UNION ALL SELECT 'concern', 'Brightening', 'brightening', 2
  UNION ALL SELECT 'concern', 'Anti Aging', 'anti-aging', 3
  UNION ALL SELECT 'concern', 'Hydration', 'hydration', 4
  UNION ALL SELECT 'concern', 'Barrier Repair', 'barrier-repair', 5
  UNION ALL SELECT 'texture', 'Gel', 'gel', 1
  UNION ALL SELECT 'texture', 'Cream', 'cream', 2
  UNION ALL SELECT 'texture', 'Serum', 'serum', 3
  UNION ALL SELECT 'texture', 'Foam', 'foam', 4
  UNION ALL SELECT 'shade', 'Light', 'light', 1
  UNION ALL SELECT 'shade', 'Natural', 'natural', 2
  UNION ALL SELECT 'shade', 'Medium', 'medium', 3
  UNION ALL SELECT 'shade', 'Deep', 'deep', 4
) v
  ON v.attribute_code = a.code
LEFT JOIN attribute_values av
  ON av.attribute_id = a.id
 AND av.slug = v.slug
WHERE av.id IS NULL;
