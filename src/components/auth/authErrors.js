export const AUTH_ERROR_MESSAGES = {
  google_not_configured:
    'Đăng nhập Google chưa được cấu hình. Cần thêm GOOGLE_CLIENT_ID và GOOGLE_CLIENT_SECRET vào biến môi trường.',
  google_cancelled: 'Bạn đã hủy đăng nhập bằng Google.',
  google_state_mismatch: 'Phiên đăng nhập Google đã hết hạn hoặc không hợp lệ. Vui lòng thử lại.',
  google_email_unverified: 'Email Google này chưa được xác thực nên chưa thể dùng để đăng nhập.',
  account_disabled: 'Tài khoản hiện không thể đăng nhập. Vui lòng liên hệ đội ngũ SRX.',
  google_failed: 'Không thể đăng nhập bằng Google. Vui lòng thử lại sau ít phút.',
};

export function getAuthErrorMessage(code) {
  if (!code) {
    return '';
  }

  return AUTH_ERROR_MESSAGES[code] ?? AUTH_ERROR_MESSAGES.google_failed;
}
