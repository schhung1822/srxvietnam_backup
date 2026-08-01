/**
 * Tiện ích dùng chung cho cả client và server, không import gì từ tầng server.
 */

/**
 * Địa chỉ không bao giờ nhận được thư thật.
 * `.local` là TLD dành riêng cho mạng nội bộ (RFC 6762) nên thư gửi tới đó chắc chắn hỏng.
 * Tài khoản tạo qua đăng nhập Zalo dùng email placeholder dạng
 * `zalo.<id>@zalo.srx.local` (vì cột users.email là NOT NULL), phải coi như "chưa có email".
 */
export function isPlaceholderEmail(value) {
  const email = String(value ?? '').trim().toLowerCase();
  const atIndex = email.lastIndexOf('@');

  if (atIndex === -1) {
    return false;
  }

  const domain = email.slice(atIndex + 1);

  return domain === 'localhost' || domain.endsWith('.local');
}

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value) {
  return EMAIL_PATTERN.test(String(value ?? '').trim());
}

/**
 * Email dùng để liên hệ: bỏ qua chuỗi rỗng và các địa chỉ placeholder.
 * Trả về chuỗi rỗng nghĩa là "khách không cung cấp email" — hợp lệ, chỉ là không gửi thư.
 */
export function toContactEmail(value) {
  const email = String(value ?? '').trim().toLowerCase();

  return !email || isPlaceholderEmail(email) ? '' : email;
}
