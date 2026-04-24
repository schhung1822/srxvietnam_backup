USE srx_beauty_shop;

START TRANSACTION;

SET @target_email := 'hungdk53@gmail.com';
SET @legal_full_name := 'Dương Hùng';
SET @contact_phone := '0379834107';
SET @contact_email := 'hungdk53@gmail.com';
SET @gender := 'male';
SET @permanent_address := 'Số 18 Kim Hoa, Quốc Tử Giám, Hà Nội';
SET @national_id_number := '027203002441';
SET @facebook_url := 'https://www.facebook.com/';
SET @tiktok_url := 'https://www.tiktok.com/';

SET @user_id := (
  SELECT id
  FROM users
  WHERE email = @target_email
  LIMIT 1
);

SET @generated_affiliate_code := CONCAT('SRXAFF', LPAD(COALESCE(@user_id, 0), 6, '0'));

UPDATE users
SET
  full_name = COALESCE(NULLIF(full_name, ''), @legal_full_name),
  phone = COALESCE(NULLIF(phone, ''), @contact_phone),
  gender = COALESCE(NULLIF(gender, ''), @gender),
  updated_at = NOW()
WHERE id = @user_id;

INSERT INTO affiliate_applications (
  user_id,
  legal_full_name,
  permanent_address,
  national_id_number,
  contact_email,
  contact_phone,
  gender,
  facebook_url,
  tiktok_url,
  status,
  reviewed_at
)
SELECT
  @user_id,
  @legal_full_name,
  @permanent_address,
  @national_id_number,
  @contact_email,
  @contact_phone,
  @gender,
  @facebook_url,
  @tiktok_url,
  'approved',
  NOW()
FROM DUAL
WHERE @user_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM affiliate_applications
    WHERE user_id = @user_id
  );

UPDATE affiliate_applications
SET
  legal_full_name = @legal_full_name,
  permanent_address = @permanent_address,
  national_id_number = @national_id_number,
  contact_email = @contact_email,
  contact_phone = @contact_phone,
  gender = @gender,
  facebook_url = @facebook_url,
  tiktok_url = @tiktok_url,
  status = 'approved',
  review_note = NULL,
  reviewed_by_user_id = NULL,
  reviewed_at = COALESCE(reviewed_at, NOW()),
  updated_at = NOW()
WHERE user_id = @user_id;

SET @user_id := (
  SELECT id
  FROM users
  WHERE email = @target_email COLLATE utf8mb4_unicode_ci
  LIMIT 1
);

INSERT INTO affiliate_accounts (
  user_id,
  application_id,
  affiliate_code,
  status,
  commission_type,
  commission_rate,
  cookie_duration_days,
  total_clicks,
  total_orders,
  approved_at
)
SELECT
  @user_id,
  @application_id,
  @generated_affiliate_code,
  'active',
  'percent',
  5.00,
  30,
  0,
  0,
  NOW()
FROM DUAL
WHERE @user_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM affiliate_accounts
    WHERE user_id = @user_id
  );

UPDATE affiliate_accounts
SET
  application_id = COALESCE(application_id, @application_id),
  status = 'active',
  commission_type = 'percent',
  commission_rate = COALESCE(commission_rate, 5.00),
  cookie_duration_days = COALESCE(cookie_duration_days, 30),
  approved_at = COALESCE(approved_at, NOW()),
  updated_at = NOW()
WHERE user_id = @user_id;

COMMIT;

SELECT
  CASE
    WHEN @user_id IS NULL THEN 'Khong tim thay user theo email hungdk53@gmail.com'
    ELSE 'Da kich hoat affiliate cho user hungdk53@gmail.com'
  END AS result;

SELECT
  u.id AS user_id,
  u.email,
  u.full_name,
  aa.id AS affiliate_account_id,
  aa.affiliate_code,
  aa.status AS affiliate_status,
  aa.commission_type,
  aa.commission_rate,
  aa.cookie_duration_days,
  app.status AS application_status,
  app.reviewed_at,
  aa.approved_at
FROM users u
LEFT JOIN affiliate_applications app ON app.user_id = u.id
LEFT JOIN affiliate_accounts aa ON aa.user_id = u.id
WHERE u.email = @target_email;
