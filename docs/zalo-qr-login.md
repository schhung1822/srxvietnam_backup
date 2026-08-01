# Đăng nhập bằng mã QR qua Zalo Mini App

Người dùng bấm "Đăng nhập bằng mã QR Zalo" trên trang `/account` → popup hiện mã QR có
hiệu lực **5 phút** → quét bằng Zalo → mini app hỏi xác nhận → website tự động đăng nhập.

Website và mini app dùng chung bảng `users` / `user_sessions`, nên tài khoản đăng nhập
bằng Zalo và bằng email là cùng một tài khoản.

## 1. Chạy migration

```bash
mysql -u <user> -p srx_beauty_shop < database/mysql/10_zalo_qr_login.sql
```

File này tạo bảng `zalo_login_tickets` và thêm cột `users.zalo_id`, `users.auth_provider='zalo'`.

> Cú pháp `ADD COLUMN IF NOT EXISTS` giống file `09_google_oauth.sql` (MariaDB). Nếu server
> là MySQL 8 thuần thì bỏ `IF NOT EXISTS` khi chạy.

Phần `ALTER TABLE users` không bắt buộc: thiếu cột `zalo_id` thì luồng vẫn chạy, chỉ là
chỉ ghép được tài khoản theo số điện thoại chứ không nhớ liên kết Zalo.

## 2. Biến môi trường của website (SRX_web)

Chỉ cần **một trong hai** biến dưới đây là nút đăng nhập QR hiện lên:

```env
ZALO_MINIAPP_ID=996742609129547965
# Khi chạy thử Mini App ở chế độ developer, link mở app có thêm env/version
# nên phải khai nguyên link (ghi đè hoàn toàn, {ticket} được thay tự động):
ZALO_MINIAPP_DEEP_LINK_TEMPLATE=https://zalo.me/s/996742609129547965/?env=DEVELOPMENT&version=zdev-xxxxx&ticket={ticket}
```

Các biến tùy chọn:

| Biến | Mặc định | Ý nghĩa |
| --- | --- | --- |
| `ZALO_QR_LOGIN_ENABLED` | `true` | Đặt `false` để ẩn nút đăng nhập QR |
| `ZALO_MINIAPP_ENTRY_PATH` | *(rỗng)* | Route trong Mini App xử lý màn xác nhận, chỉ dùng khi tự dựng link từ app id |

Website **không cần** `ZALO_APP_SECRET` — việc xác thực với Zalo do crm-eac đảm nhiệm.

## 3. Biến môi trường của crm-eac

```env
ZALO_MINIAPP_ID=996742609129547965
# Chỉ cần khi muốn lấy số điện thoại để ghép Zalo với tài khoản đã có trên web:
ZALO_APP_SECRET=<app secret của Zalo App>
```

Tùy chọn: `ZALO_MINIAPP_ALLOWED_ORIGINS` (mặc định `*`) và `ZALO_PLACEHOLDER_EMAIL_DOMAIN`
(mặc định `zalo.srx.local`). Xem đầy đủ trong `.env.example` của crm-eac.

## 4. Cách chạy thử

1. Chạy Mini App ở chế độ developer, lấy link mở app rồi đặt vào
   `ZALO_MINIAPP_DEEP_LINK_TEMPLATE` (nhớ thêm `&ticket={ticket}` ở cuối).
2. Chạy crm-eac (backend của Mini App) và SRX_web, cả hai trỏ về cùng một database.
3. Mở `/account` trên website, bấm **"Quét mã QR Zalo"**.
4. Quét mã bằng ứng dụng Zalo trên điện thoại → Mini App mở màn xác nhận → bấm
   **"Xác nhận đăng nhập"** → website tự đăng nhập trong khoảng 2 giây.

Nếu Mini App chạy trên điện thoại mà gọi crm-eac ở máy local, nhớ dùng địa chỉ mà điện
thoại truy cập được (IP LAN hoặc ngrok) trong `VITE_API_BASE_URL` của Mini App.

## 5. Luồng và các endpoint

```
Trình duyệt                          Server                        Mini app Zalo
    │                                  │                                 │
    ├─ POST /api/auth/zalo-qr/start ──►│  tạo ticket (5 phút)
    │◄── qrImage + expiresAt ──────────┤  set cookie srx_qr_login (httpOnly)
    │                                  │
    │  (quét mã QR) ─────────────────────────────────────────────────────►│
    │                                  │◄── POST /api/auth/zalo-qr/scan ──┤
    ├─ GET  /status (poll 2s) ────────►│    → status = scanned
    │                                  │
    │                                  │◄─ POST /api/auth/zalo-qr/confirm ┤ (người dùng bấm xác nhận)
    │                                  │    tạo user_sessions, gắn vào ticket
    ├─ GET  /status ─────────────────►│    → status = confirmed
    ├─ POST /api/auth/zalo-qr/claim ──►│    → set cookie srx_session
    │◄── user ─────────────────────────┤
```

| Endpoint | Dự án | Ai gọi | Việc |
| --- | --- | --- | --- |
| `POST /api/auth/zalo-qr/start` | SRX_web | Trình duyệt | Tạo ticket + ảnh QR, set cookie `srx_qr_login` |
| `GET /api/auth/zalo-qr/status` | SRX_web | Trình duyệt | Poll trạng thái ticket |
| `POST /api/auth/zalo-qr/claim` | SRX_web | Trình duyệt | Đổi ticket đã xác nhận lấy cookie phiên |
| `POST /api/auth/zalo-qr/cancel` | SRX_web | Trình duyệt | Hủy mã khi đóng popup |
| `POST /api/srx/zalo-login/scan` | **crm-eac** | Mini App | Báo "đã quét" |
| `POST /api/srx/zalo-login/confirm` | **crm-eac** | Mini App | Xác nhận / từ chối đăng nhập |

Mini App thật gọi **crm-eac** (`VITE_API_BASE_URL`), không gọi SRX_web. Hai dự án dùng
chung database nên bảng `zalo_login_tickets` là điểm gặp nhau: crm-eac ghi trạng thái,
SRX_web đọc trạng thái đó khi poll.

## 5. Điểm bảo mật

- **Mã QR không chứa gì bí mật.** Nó chỉ chứa `ticket`. Người khác chụp lại màn hình mã QR
  và quét cũng chỉ đăng nhập được vào *tài khoản Zalo của chính họ*, và phiên tạo ra chỉ
  giao cho trình duyệt giữ `browser_secret` — tức trình duyệt đã tạo ra mã đó.
- `browser_secret` nằm trong cookie `httpOnly`, DB chỉ lưu SHA-256 của nó. `/status` và
  `/claim` đều so khớp secret trước khi trả lời.
- Session token **không bao giờ** đi qua mini app; mini app chỉ ghi nó vào ticket, trình
  duyệt lấy về ở bước `claim` và ticket bị xóa token ngay sau đó (dùng một lần).
- Ticket sống 5 phút; hết hạn/bị hủy thì `confirm` trả 409/410 và không tạo phiên.
- Giới hạn 30 mã QR / IP / 10 phút.
- Ticket cũ được dọn tự động mỗi lần tạo mã mới, không cần cron. Phiên đã tạo nhưng
  trình duyệt chưa kịp nhận (người dùng đóng popup ngay sau khi xác nhận) cũng bị xóa
  cùng lúc, không để lại phiên "mồ côi" sống 30 ngày.
- **Hạn 5 phút được tính bằng `NOW() + INTERVAL` của MySQL**, không truyền `Date` của JS
  xuống DB. Lý do: `mysql2` quy đổi `Date` theo múi giờ của tiến trình Node, nên nếu app
  chạy giờ Việt Nam (UTC+7) còn MySQL chạy UTC thì mã "5 phút" sẽ sống thật 7 giờ 5 phút
  trong khi đồng hồ đếm ngược trên web vẫn hiển thị 5 phút.

## 6. Tham chiếu: Mini App gọi gì

Mini App đã được hiện thực ở dự án `miniapp` — màn `/login-confirm`
([LoginConfirmPage.tsx](../../miniapp/src/pages/LoginConfirmPage.tsx), logic gọi API ở
`src/features/auth/`). App tự chuyển sang màn này khi được mở kèm `?ticket=…`.

Phần dưới chỉ để tham chiếu khi cần sửa Mini App:

```js
import { getAccessToken, getPhoneNumber } from 'zmp-sdk/apis';

// crm-eac, khai trong VITE_API_BASE_URL của Mini App.
const API = 'https://crm.srx.vn/api/srx/zalo-login';

// 1. Ngay khi mở từ QR
await fetch(`${API}/scan`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ ticket }),
});

// 2. Khi người dùng bấm "Xác nhận đăng nhập"
const accessToken = await getAccessToken();
const { token: phoneToken } = await getPhoneNumber();   // tùy chọn, để ghép tài khoản theo SĐT

await fetch(`${API}/confirm`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ ticket, decision: 'approve', accessToken, phoneToken }),
});

// Người dùng bấm "Từ chối": gửi { ticket, decision: 'reject' }
```

crm-eac sẽ tự gọi `graph.zalo.me/v2.0/me` để xác minh `accessToken` và
`graph.zalo.me/v2.0/me/info` (kèm `ZALO_APP_SECRET`) để lấy số điện thoại — Mini App không
cần và không nên tự gửi zalo id hay số điện thoại lên.

Nhớ khai báo domain `crm.srx.vn` trong danh sách domain được phép gọi API của Mini App trên
Zalo Mini App Developer Portal.
