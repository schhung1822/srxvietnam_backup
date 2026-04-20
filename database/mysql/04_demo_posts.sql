USE srx_beauty_shop;

INSERT INTO article_categories (name, slug, description, sort_order)
VALUES
  ('Phac do', 'phac-do', 'Clinical routines and treatment pairings.', 4),
  ('Routine', 'routine', 'Step-by-step routines and usage rhythm.', 5)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  sort_order = VALUES(sort_order),
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO post_tags (name, slug)
VALUES
  ('Peptide', 'peptide'),
  ('Retinol', 'retinol'),
  ('Phuc hoi', 'phuc-hoi'),
  ('Treatment', 'treatment'),
  ('Repair Ampoule', 'repair-ampoule'),
  ('Routine', 'routine'),
  ('Cong nghe', 'cong-nghe'),
  ('Barrier', 'barrier')
ON DUPLICATE KEY UPDATE
  name = VALUES(name);

INSERT INTO posts (
  category_id,
  author_user_id,
  title,
  slug,
  excerpt,
  content,
  featured_image_url,
  status,
  is_featured,
  view_count,
  published_at
)
VALUES
  (
    (SELECT id FROM article_categories WHERE slug = 'kien-thuc' LIMIT 1),
    NULL,
    'Phức hợp 30 loại Peptides trong Retinol A Cream có tác dụng gì?',
    'phuc-hop-30-loai-peptides-trong-retinol-a-cream-co-tac-dung-gi',
    'Peptide đa tầng giúp tăng độ săn chắc, hỗ trợ tái tạo bề mặt da và giảm cảm giác khô rát khi kết hợp treatment kéo dài.',
    'Phức hợp 30 loại peptide trong Retinol A Cream được xây dựng theo hướng hỗ trợ tái tạo nhưng vẫn giữ nhịp phục hồi cho da. Điểm mạnh của công thức nằm ở việc nhiều phân tử peptide đảm nhiệm các vai trò khác nhau: hỗ trợ tín hiệu tăng sinh collagen, cải thiện đàn hồi và giúp bề mặt da trông mịn, ổn định hơn. Trong routine treatment, tổ hợp này đặc biệt hữu ích khi da bắt đầu có dấu hiệu mệt, xỉn hoặc kém săn chắc. Khi dùng đều với tần suất hợp lý, peptide góp phần giảm cảm giác khô rít kéo dài và giữ cho quá trình treatment diễn ra êm hơn.',
    '/assets/images/home/sl2.webp',
    'published',
    1,
    0,
    '2026-07-06 08:00:00'
  ),
  (
    (SELECT id FROM article_categories WHERE slug = 'kien-thuc' LIMIT 1),
    NULL,
    'Phức hợp Retinol 8% của SRX có gì đặc biệt?',
    'phuc-hop-retinol-8-cua-srx-co-gi-dac-biet',
    'Cấu trúc retinol cải tiến hướng tới hiệu quả tái tạo rõ hơn nhưng vẫn kiểm soát cảm giác châm chích và bong tróc quá mức.',
    'Retinol 8% của SRX không chỉ là câu chuyện về nồng độ, mà là cách toàn bộ hệ công thức được phối hợp để tối ưu nhịp tái tạo. Bên cạnh retinoid, nền công thức còn bổ sung các thành phần làm dịu và phục hồi nhằm kiểm soát nguy cơ kích ứng tích lũy. Vì vậy, sản phẩm phù hợp với người dùng muốn nâng treatment lên một mức mạnh hơn nhưng vẫn cần bề mặt da đủ ổn định để theo được liệu trình. Đây là kiểu công thức ưu tiên tính đều đặn thay vì tạo cảm giác quá tải ngay từ giai đoạn đầu.',
    '/assets/images/home/blue.webp',
    'published',
    1,
    0,
    '2026-07-03 08:00:00'
  ),
  (
    (SELECT id FROM article_categories WHERE slug = 'phac-do' LIMIT 1),
    NULL,
    'Phác đồ kết hợp Retinol & Repair Ampoule của SRX.',
    'phac-do-ket-hop-retinol-va-repair-ampoule-cua-srx',
    'Kết hợp retinol với ampoule phục hồi theo nhịp phù hợp giúp da tiếp nhận treatment tốt hơn mà không đánh đổi độ ổn định hàng rào da.',
    'Với làn da đang bắt đầu treatment hoặc dễ phản ứng, cách kết hợp retinol cùng Repair Ampoule nên đi theo nhịp chậm và có chủ đích. Ở những tối dùng retinol, ampoule phục hồi nên được đặt trước hoặc sau tùy tình trạng da để giảm cảm giác châm chích và hỗ trợ bề mặt da đỡ khô căng. Điểm quan trọng nhất là duy trì được tính đều đặn. Một phác đồ bền vững luôn tốt hơn việc tăng tốc quá nhanh rồi phải ngắt quãng do kích ứng.',
    '/assets/images/home/purble.webp',
    'published',
    1,
    0,
    '2026-07-03 09:00:00'
  ),
  (
    (SELECT id FROM article_categories WHERE slug = 'kien-thuc' LIMIT 1),
    NULL,
    'SRX Nourishing Ampoule phù hợp dùng ở giai đoạn nào?',
    'srx-nourishing-ampoule-phu-hop-dung-o-giai-doan-nao',
    'Đây là lựa chọn phù hợp khi da bắt đầu mỏng, thiếu ẩm, dễ đỏ hoặc cần một bước đệm trước và sau các hoạt chất mạnh.',
    'Nourishing Ampoule phát huy tốt nhất ở những giai đoạn da cần nạp lại độ ẩm và độ êm. Đây có thể là thời điểm trước khi bước vào treatment, giữa liệu trình khi da có dấu hiệu mỏng yếu hoặc sau những ngày bong tróc kéo dài. Nếu dùng đúng vai trò, ampoule sẽ không chỉ làm dịu tức thì mà còn giúp da duy trì cảm giác đủ nước, mềm và bớt nhạy trước các tác nhân từ môi trường.',
    '/assets/images/home/yellow.webp',
    'published',
    0,
    0,
    '2026-06-28 08:00:00'
  ),
  (
    (SELECT id FROM article_categories WHERE slug = 'kien-thuc' LIMIT 1),
    NULL,
    'Hệ thống phục hồi sinh học chuyên sâu của SRX hoạt động ra sao?',
    'he-thong-phuc-hoi-sinh-hoc-chuyen-sau-cua-srx-hoat-dong-ra-sao',
    'Cơ chế này tập trung vào làm dịu viêm vi điểm, củng cố hàng rào và hỗ trợ mô da phục hồi theo nhịp ổn định hơn.',
    'Hệ thống phục hồi sinh học chuyên sâu của SRX được xây dựng quanh ba mục tiêu: giảm viêm vi điểm, phục hồi hàng rào da và hỗ trợ tái tạo mô bề mặt. Thay vì chỉ xử lý một triệu chứng đơn lẻ, công thức hướng đến giữ cho môi trường trên da đủ ổn định để da tự phục hồi hiệu quả hơn. Cách tiếp cận này đặc biệt phù hợp với làn da đang treatment, da nhạy cảm hoặc da vừa trải qua giai đoạn mất cân bằng kéo dài.',
    '/assets/images/home/slider2.webp',
    'published',
    0,
    0,
    '2026-06-24 08:00:00'
  ),
  (
    (SELECT id FROM article_categories WHERE slug = 'routine' LIMIT 1),
    NULL,
    'Cách layer treatment với serum phục hồi để giảm kích ứng',
    'cach-layer-treatment-voi-serum-phuc-hoi-de-giam-kich-ung',
    'Một routine thông minh không chỉ là dùng đúng hoạt chất, mà còn là biết đặt bước phục hồi vào đúng thời điểm trong chuỗi layer.',
    'Khi da bắt đầu treatment, thứ quyết định trải nghiệm thực tế thường không nằm ở một sản phẩm đơn lẻ mà ở cách bạn layer toàn bộ routine. Serum phục hồi có thể được dùng như bước đệm trước treatment hoặc bước khóa ẩm dịu nhẹ sau treatment, tùy vào mức chịu đựng của da. Nguyên tắc cốt lõi là không xếp quá nhiều tầng có hoạt tính cao trong cùng một tối.',
    '/assets/images/home/sl4.webp',
    'published',
    0,
    0,
    '2026-06-18 08:00:00'
  )
ON DUPLICATE KEY UPDATE
  category_id = VALUES(category_id),
  title = VALUES(title),
  excerpt = VALUES(excerpt),
  content = VALUES(content),
  featured_image_url = VALUES(featured_image_url),
  status = VALUES(status),
  is_featured = VALUES(is_featured),
  view_count = VALUES(view_count),
  published_at = VALUES(published_at),
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO post_tag_links (post_id, tag_id)
VALUES
  ((SELECT id FROM posts WHERE slug = 'phuc-hop-30-loai-peptides-trong-retinol-a-cream-co-tac-dung-gi' LIMIT 1), (SELECT id FROM post_tags WHERE slug = 'peptide' LIMIT 1)),
  ((SELECT id FROM posts WHERE slug = 'phuc-hop-30-loai-peptides-trong-retinol-a-cream-co-tac-dung-gi' LIMIT 1), (SELECT id FROM post_tags WHERE slug = 'retinol' LIMIT 1)),
  ((SELECT id FROM posts WHERE slug = 'phuc-hop-30-loai-peptides-trong-retinol-a-cream-co-tac-dung-gi' LIMIT 1), (SELECT id FROM post_tags WHERE slug = 'treatment' LIMIT 1)),
  ((SELECT id FROM posts WHERE slug = 'phuc-hop-retinol-8-cua-srx-co-gi-dac-biet' LIMIT 1), (SELECT id FROM post_tags WHERE slug = 'retinol' LIMIT 1)),
  ((SELECT id FROM posts WHERE slug = 'phuc-hop-retinol-8-cua-srx-co-gi-dac-biet' LIMIT 1), (SELECT id FROM post_tags WHERE slug = 'cong-nghe' LIMIT 1)),
  ((SELECT id FROM posts WHERE slug = 'phac-do-ket-hop-retinol-va-repair-ampoule-cua-srx' LIMIT 1), (SELECT id FROM post_tags WHERE slug = 'retinol' LIMIT 1)),
  ((SELECT id FROM posts WHERE slug = 'phac-do-ket-hop-retinol-va-repair-ampoule-cua-srx' LIMIT 1), (SELECT id FROM post_tags WHERE slug = 'repair-ampoule' LIMIT 1)),
  ((SELECT id FROM posts WHERE slug = 'phac-do-ket-hop-retinol-va-repair-ampoule-cua-srx' LIMIT 1), (SELECT id FROM post_tags WHERE slug = 'phuc-hoi' LIMIT 1)),
  ((SELECT id FROM posts WHERE slug = 'he-thong-phuc-hoi-sinh-hoc-chuyen-sau-cua-srx-hoat-dong-ra-sao' LIMIT 1), (SELECT id FROM post_tags WHERE slug = 'cong-nghe' LIMIT 1)),
  ((SELECT id FROM posts WHERE slug = 'he-thong-phuc-hoi-sinh-hoc-chuyen-sau-cua-srx-hoat-dong-ra-sao' LIMIT 1), (SELECT id FROM post_tags WHERE slug = 'barrier' LIMIT 1)),
  ((SELECT id FROM posts WHERE slug = 'cach-layer-treatment-voi-serum-phuc-hoi-de-giam-kich-ung' LIMIT 1), (SELECT id FROM post_tags WHERE slug = 'routine' LIMIT 1)),
  ((SELECT id FROM posts WHERE slug = 'cach-layer-treatment-voi-serum-phuc-hoi-de-giam-kich-ung' LIMIT 1), (SELECT id FROM post_tags WHERE slug = 'phuc-hoi' LIMIT 1))
ON DUPLICATE KEY UPDATE
  created_at = created_at;
