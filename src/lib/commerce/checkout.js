/* eslint-disable no-undef */
export const paymentMethodOptions = [
  {
    id: 'cod',
    label: 'Thanh toán khi nhận hàng',
    description: 'Thanh toán trực tiếp với nhân viên giao hàng khi đơn tới nơi.',
  },
  {
    id: 'bank_transfer',
    label: 'Thanh toán QR code (SePay)',
    description: 'Quét mã QR để chuyển khoản nhanh, nội dung chuyển khoản theo mã đơn.',
  },
];

export function isSupportedPaymentMethod(value) {
  return paymentMethodOptions.some((method) => method.id === value);
}

export function normalizeCouponCode(value) {
  return String(value ?? '')
    .trim()
    .toUpperCase();
}

export function getCouponApplication(code, subtotal) {
  const normalizedCode = normalizeCouponCode(code);
  const normalizedSubtotal = Math.max(Number(subtotal) || 0, 0);

  if (!normalizedCode) {
    return {
      code: '',
      discountAmount: 0,
      isValid: false,
      message: 'Nhập mã giảm giá để áp dụng.',
    };
  }

  if (normalizedCode === 'SRX10') {
    return {
      code: normalizedCode,
      discountAmount: Math.round(normalizedSubtotal * 0.1),
      isValid: true,
      message: 'Đã áp dụng mã SRX10 giảm 10%.',
    };
  }

  if (normalizedCode === 'SAVE50') {
    return {
      code: normalizedCode,
      discountAmount: Math.min(50000, normalizedSubtotal),
      isValid: true,
      message: 'Đã áp dụng mã SAVE50 giảm 50.000đ.',
    };
  }

  return {
    code: normalizedCode,
    discountAmount: 0,
    isValid: false,
    message: 'Mã giảm giá không hợp lệ.',
  };
}

export function getCheckoutTotals({ subtotal = 0, couponCode = '' } = {}) {
  const normalizedSubtotal = Math.max(Number(subtotal) || 0, 0);
  const coupon = getCouponApplication(couponCode, normalizedSubtotal);
  const discountTotal = Math.min(coupon.discountAmount, normalizedSubtotal);
  const grandTotal = Math.max(normalizedSubtotal - discountTotal, 0);

  return {
    subtotal: normalizedSubtotal,
    discountTotal,
    grandTotal,
    coupon,
  };
}

export function getSepayPaymentDetails({ amount = 0, orderNumber = '' } = {}) {
  const bankName = process.env.NEXT_PUBLIC_SEPAY_BANK_NAME?.trim() || 'SePay';
  const accountName = process.env.NEXT_PUBLIC_SEPAY_ACCOUNT_NAME?.trim() || 'SRX Beauty';
  const accountNumber = process.env.NEXT_PUBLIC_SEPAY_ACCOUNT_NUMBER?.trim() || 'Dang cap nhat';
  const qrImageUrl = process.env.NEXT_PUBLIC_SEPAY_QR_IMAGE_URL?.trim() || '';
  const transferPrefix = process.env.NEXT_PUBLIC_SEPAY_TRANSFER_PREFIX?.trim() || 'SRX';
  const normalizedOrderNumber = String(orderNumber ?? '').trim();
  const transferContent = normalizedOrderNumber
    ? `${transferPrefix} ${normalizedOrderNumber}`
    : transferPrefix;

  return {
    bankName,
    accountName,
    accountNumber,
    qrImageUrl,
    transferContent,
    amount: Math.max(Number(amount) || 0, 0),
    isConfigured: Boolean(qrImageUrl),
  };
}
