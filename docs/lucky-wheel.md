# Vòng quay may mắn

Nút quà ở góc phải dưới (ngay trên nút liên hệ, cùng kiểu nút) mở popup vòng quay. Vòng quay
dùng Circular Carousel của React Bits, tự trôi để khách xem phần thưởng; rê chuột vào một phần
thưởng thì vòng dừng và hiện thông tin bên cạnh (trên điện thoại: chạm vào phần thưởng). Bấm
"Quay ngay" thì vòng quay nhanh dần rồi chậm dần, dừng ở phần thưởng máy chủ đã bốc.

Trên desktop popup chia hai cột (vòng quay bên trái, thông tin và nút bên phải); trên điện
thoại là bottom sheet một cột.

Quản lý ở CRM: **Website SRX → Shop → Vòng quay may mắn** (`/srx/lucky-wheel`, chỉ admin).

## 1. Cài đặt

```bash
mysql -u <user> -p srx_beauty_shop < database/mysql/12_lucky_wheel.sql
```

Các bảng `lucky_wheel_*` cũng được CRM tự tạo (và tự nâng cấp từ bản đầu) ở lần mở trang đầu
tiên, nên chạy file SQL là tùy chọn.

Sau đó vào CRM: thêm phần thưởng → bật "Bật vòng quay may mắn" → Lưu. Website chỉ hiện nút
khi đang bật **và** có ít nhất một phần thưởng đang hiện.

## 2. Ai được quay

| Điều kiện | Lượt |
| --- | --- |
| Đăng nhập (bằng email/SĐT, Google hay Zalo đều được) | +1, một lần cho mỗi tài khoản |
| Mỗi người tạo tài khoản qua link giới thiệu | + "Cộng cho người giới thiệu" (mặc định 1), tối đa theo "Tối đa từ giới thiệu" |

Khách chưa đăng nhập thấy hai nút trong popup: **Đăng nhập** (sang trang `/login`, đăng nhập
xong popup tự mở lại) và **Đăng nhập bằng Zalo** (quét mã QR ngay trong popup).

Lượt còn lại = tổng `lucky_wheel_spin_grants.spins` − số dòng `lucky_wheel_spins`. Mỗi lần
cộng có `grant_key` duy nhất (`signup:<user>`, `referral:<người được mời>`) nên không bao giờ
cộng trùng. Việc cộng diễn ra khi khách mở vòng quay (GET `/api/lucky-wheel`), nên không phụ
thuộc khách tạo tài khoản bằng cách nào.

### Giới thiệu bạn bè

1. Mỗi khách có link `https://<site>/?wheel_ref=<MÃ>` trong popup.
2. Người khác mở link (chưa đăng nhập) → ghi một dòng `lucky_wheel_referrals` (visited) và
   cookie httpOnly `srx_wheel_ref` 30 ngày.
3. Họ tạo tài khoản trên cùng trình duyệt → lần đầu mở vòng quay sau khi đăng nhập, tài khoản
   được ghép (signed_up) **nếu được tạo sau lượt mở link**: khách cũ bấm link không được tính.
4. Người giới thiệu được cộng lượt (credited). Nếu CRM bật "Bạn được giới thiệu phải đăng nhập
   bằng Zalo" thì chỉ cộng khi bạn đó đã từng đăng nhập bằng Zalo (có `users.zalo_id`).

Vì chỉ cần đăng nhập là có lượt, một người có thể tạo nhiều tài khoản email để lấy thêm lượt.
Nếu phần thưởng có giá trị cao, nên giới hạn "Số lượng phát" và bật yêu cầu Zalo cho giới thiệu.

## 3. Tỷ lệ trúng

- Mỗi phần thưởng có **trọng số**; tỷ lệ = trọng số / tổng trọng số các phần thưởng còn trúng
  được. CRM hiển thị tỷ lệ % tính sẵn.
- Trọng số 0 = chỉ trưng bày. Hết "Số lượng phát" = vẫn hiện nhưng không trúng nữa.
- Ô "Chúc may mắn lần sau" là một phần thưởng loại `no_prize`.
- Trọng số, số lượng và mã thưởng **không bao giờ** gửi ra trình duyệt; kết quả do
  `POST /api/lucky-wheel/spin` bốc trong transaction (khóa dòng `users` để không tiêu trùng
  lượt khi bấm liên tục, khóa phần thưởng để không phát quá số lượng).

Ảnh phần thưởng tỷ lệ **4:5** (vd. 800×1000px), nằm ở `/upload/gift/...` (thư mục upload của
CRM). Chạy website ở máy local mà không trỏ `/upload` sang thư mục của CRM thì ảnh sẽ không hiện –
giống ảnh banner.

## 4. Voucher tự sinh + gửi Zalo (ZBS)

Phần thưởng loại **Mã giảm giá** cấu hình kiểu giảm (% hoặc số tiền), giá trị, giảm tối đa (với %)
và đơn tối thiểu. Mỗi lần trúng, trong cùng transaction của lượt quay:

1. Sinh mã **8 chữ số** ngẫu nhiên, ghi vào `discount_codes` (khóa `uq_discount_codes_code` bảo đảm
   không trùng mã có sẵn; trùng thì bốc số khác). `total_usage_limit = 1`, `class = 'private'`,
   hiệu lực từ lúc trúng tới **23:59:59 của ngày sau 3 tháng**.
2. Lượt quay lưu `discount_code_id` và `zbs_status = 'pending'` (tài khoản không có số di động
   hợp lệ thì `failed`, mã vẫn hiện trên website).
3. Website gọi `POST {SRX_LUCKY_WHEEL_WEB_API_URL}` (crm-eac `/api/srx/lucky-wheel-web`, Bearer
   `SRX_LUCKY_WHEEL_WEB_API_TOKEN`, phải khớp hai bên). CRM gửi tin theo mẫu ZBS cấu hình ở trang
   vòng quay (mặc định `618787` "SRX | Tri ân khách hàng", token OA `zalo_srx`) và ghi kết quả.
   Lỗi gửi thì bấm **Gửi lại** ở bảng khách trúng thưởng; có nút **Gửi thử** với mã mẫu.

Tham số mẫu: `customer_name`, `customer_id` (KH + id tài khoản, vd. KH000123), `voucher_code`,
`voucher` (100.000đ / 10%), `voucher_name` (Giảm 100.000đ), `dieukien` (đơn hàng từ 300.000đ /
mọi đơn hàng), `start_date`, `expire` (HH:mm:ss dd/MM/yyyy).

### Mã chung và mã riêng

CRM **Mã giảm giá** (`/srx/voucher`) chia 2 tab:

| Tab | `discount_codes.class` | Hiện ở giỏ hàng | Ghi chú |
| --- | --- | --- | --- |
| Mã chung | `public` | Có, khách nào cũng chọn được | |
| Mã riêng | `private` | Không, khách phải nhập tay | Mã vòng quay nằm ở đây, cột **Nguồn** ghi khách trúng thưởng |

Một đơn hàng dùng **tối đa 1 mã chung + 1 mã riêng**, và chỉ khi mã riêng bật **"Cho phép dùng chung
với mã chung"** (cột `discount_codes.stack_with_public`). Mã riêng không bật thì phải dùng một mình:
chọn mã chung sẽ bỏ mã riêng đó và ngược lại. Tổng giảm không vượt tạm tính (mã sau chỉ giảm phần
còn lại).

- Với mã vòng quay, bật/tắt ở form phần thưởng (Vòng quay may mắn → phần thưởng loại Mã giảm giá →
  "Cho phép dùng chung với mã chung"); mỗi mã sinh ra mang theo cấu hình đó.
- Với mã riêng tạo tay, bật ở form mã trong tab Mã riêng.
- Cột `stack_with_public` được website và CRM tự thêm ở lần dùng đầu tiên (đọc/ghi bằng SQL thô, không
  có trong `prisma/schema2.prisma`).

Liên quan tới mã giảm giá nói chung:

- Checkout giờ **ghi lượt dùng** cho từng mã vào `discount_code_redemptions` và khóa dòng mã khi đặt
  hàng, nên `total_usage_limit` có hiệu lực với mọi mã (trước đây lượt dùng không được ghi). Mã hết hạn /
  hết lượt lúc đặt hàng thì báo lỗi thay vì tính đủ tiền.
- Danh sách mã ở giỏ hàng không hiện mã riêng; khách nhập tay mã riêng thì website tra qua
  `GET /api/discount-codes?code=...`.
- `POST /api/checkout` nhận `couponCodes` (mảng); `couponCode` (một mã) vẫn được chấp nhận.

## 5. Endpoint

| Endpoint | Việc |
| --- | --- |
| `GET /api/lucky-wheel` | Cấu hình + phần thưởng công khai; nếu đăng nhập: lượt còn lại, link giới thiệu, phần thưởng đã trúng |
| `POST /api/lucky-wheel/spin` | Quay một lượt (cần đăng nhập); trúng voucher thì sinh mã và nhờ CRM gửi ZBS |
| `POST /api/lucky-wheel/referral` | Ghi nhận lượt mở link giới thiệu |
| crm-eac `POST /api/srx/lucky-wheel-web` | Website báo lượt trúng voucher để CRM gửi ZBS |
| crm-eac `POST /api/srx/lucky-wheel/spins/:id/zbs` | Admin gửi lại tin ZBS |
| crm-eac `POST /api/srx/lucky-wheel/zbs-test` | Admin gửi thử tin ZBS với mã mẫu |
