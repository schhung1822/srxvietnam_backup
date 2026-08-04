const moneyFormatter = new Intl.NumberFormat('vi-VN');

export function formatVoucherMoney(value) {
  return `${moneyFormatter.format(Math.max(Number(value) || 0, 0))}đ`;
}

export function isFreeShippingVoucher(voucher) {
  return voucher?.discountType === 'free_shipping';
}

/**
 * Khách chưa đăng nhập chỉ dùng được mã freeship, các mã còn lại là đặc quyền thành viên.
 */
export function isMemberOnlyVoucher(voucher) {
  return !isFreeShippingVoucher(voucher);
}

export function canUseVoucher(voucher, isLoggedIn) {
  return Boolean(isLoggedIn) || !isMemberOnlyVoucher(voucher);
}

export function getVoucherValueLabel(voucher) {
  if (isFreeShippingVoucher(voucher)) {
    return 'Miễn phí vận chuyển';
  }

  if (voucher?.discountType === 'percentage') {
    return `Giảm ${Number(voucher.discountValue) || 0}%`;
  }

  if (voucher?.discountType === 'fixed_amount') {
    return `Giảm ${formatVoucherMoney(voucher.discountValue)}`;
  }

  return String(voucher?.name ?? '').trim() || 'Mã giảm giá';
}

export function getVoucherTitle(voucher) {
  return String(voucher?.name ?? '').trim() || getVoucherValueLabel(voucher);
}

export function getVoucherDescription(voucher) {
  const description = String(voucher?.description ?? '').trim();

  if (description) {
    return description;
  }

  const minOrderAmount = Number(voucher?.minOrderAmount) || 0;

  if (minOrderAmount > 0) {
    return `Áp dụng cho đơn từ ${formatVoucherMoney(minOrderAmount)}`;
  }

  return isFreeShippingVoucher(voucher)
    ? 'Freeship toàn quốc, mọi đơn hàng'
    : 'Áp dụng cho mọi đơn hàng';
}

/**
 * Nhãn ngắn hiển thị trong ô vuông bên trái thẻ voucher.
 */
export function getVoucherStubLabel(voucher) {
  if (voucher?.discountType === 'percentage') {
    return `−${Number(voucher.discountValue) || 0}%`;
  }

  if (voucher?.discountType === 'fixed_amount') {
    const value = Number(voucher.discountValue) || 0;

    return value >= 1000 ? `−${Math.round(value / 1000)}K` : `−${moneyFormatter.format(value)}`;
  }

  return '';
}

export function isVoucherEligible(voucher, subtotal) {
  return Number(subtotal) >= (Number(voucher?.minOrderAmount) || 0);
}

export function maskVoucherCode(code) {
  const normalizedCode = String(code ?? '').trim();

  if (normalizedCode.length <= 3) {
    return '•••••';
  }

  return `${normalizedCode.slice(0, 3)}${'•'.repeat(Math.min(normalizedCode.length - 3, 6))}`;
}

export function formatVoucherDate(value) {
  if (!value) {
    return '';
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/**
 * Freeship lên đầu, sau đó tới mã đang dùng được, cuối cùng là mã chưa đủ điều kiện.
 */
export function sortVouchers(vouchers = [], { subtotal = 0, isLoggedIn = false } = {}) {
  return [...vouchers].sort((left, right) => {
    const freeShippingDelta = Number(isFreeShippingVoucher(right)) - Number(isFreeShippingVoucher(left));

    if (freeShippingDelta !== 0) {
      return freeShippingDelta;
    }

    const usableDelta =
      Number(canUseVoucher(right, isLoggedIn)) - Number(canUseVoucher(left, isLoggedIn));

    if (usableDelta !== 0) {
      return usableDelta;
    }

    return Number(isVoucherEligible(right, subtotal)) - Number(isVoucherEligible(left, subtotal));
  });
}
