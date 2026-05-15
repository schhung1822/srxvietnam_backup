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

const DEFAULT_SEPAY_BANK_CODE = 'ACB';
const DEFAULT_SEPAY_ACCOUNT_NUMBER = '93956886';
const SEPAY_QR_IMAGE_URL_BASE = 'https://qr.sepay.vn/img';

function normalizeSepayText(value) {
  return String(value ?? '').trim();
}

function buildSepayQrImageUrlFromTemplate(template, { amount, orderNumber }) {
  const normalizedTemplate = normalizeSepayText(template);

  if (!normalizedTemplate) {
    return '';
  }

  const encodedAmount = encodeURIComponent(String(amount));
  const encodedOrderNumber = encodeURIComponent(orderNumber);

  return normalizedTemplate
    .replace(/{{\s*\$json\.total_payment\s*}}/gi, encodedAmount)
    .replace(/{{\s*\$json\.order_id\s*}}/gi, encodedOrderNumber)
    .replace(/{{\s*amount\s*}}/gi, encodedAmount)
    .replace(/{{\s*orderNumber\s*}}/gi, encodedOrderNumber)
    .replace(/{{\s*order_id\s*}}/gi, encodedOrderNumber);
}

function buildSepayQrImageUrl({ accountNumber, bankCode, amount, orderNumber, template = '' }) {
  if (!accountNumber || !bankCode || !orderNumber || amount <= 0) {
    return '';
  }

  const templateUrl = buildSepayQrImageUrlFromTemplate(template, {
    amount,
    orderNumber,
  });

  if (templateUrl) {
    return templateUrl;
  }

  const searchParams = new URLSearchParams({
    acc: accountNumber,
    bank: bankCode,
    amount: String(amount),
    des: orderNumber,
  });

  return `${SEPAY_QR_IMAGE_URL_BASE}?${searchParams.toString()}`;
}

export function getSepayPaymentDetails({ amount = 0, orderNumber = '' } = {}) {
  const bankCode =
    process.env.NEXT_PUBLIC_SEPAY_BANK_CODE?.trim() ||
    process.env.NEXT_PUBLIC_SEPAY_BANK_NAME?.trim() ||
    DEFAULT_SEPAY_BANK_CODE;
  const bankName = process.env.NEXT_PUBLIC_SEPAY_BANK_NAME?.trim() || bankCode;
  const accountName = process.env.NEXT_PUBLIC_SEPAY_ACCOUNT_NAME?.trim() || 'SRX Beauty';
  const accountNumber =
    process.env.NEXT_PUBLIC_SEPAY_ACCOUNT_NUMBER?.trim() || DEFAULT_SEPAY_ACCOUNT_NUMBER;
  const qrImageUrlTemplate =
    process.env.NEXT_PUBLIC_SEPAY_QR_IMAGE_URL_TEMPLATE?.trim() ||
    (process.env.NEXT_PUBLIC_SEPAY_QR_IMAGE_URL?.includes('{{')
      ? process.env.NEXT_PUBLIC_SEPAY_QR_IMAGE_URL.trim()
      : '');
  const normalizedAmount = Math.max(Number(amount) || 0, 0);
  const qrAmount = Math.round(normalizedAmount);
  const normalizedOrderNumber = String(orderNumber ?? '').trim().toUpperCase();
  const transferContent = normalizedOrderNumber;
  const qrImageUrl = buildSepayQrImageUrl({
    accountNumber,
    bankCode,
    amount: qrAmount,
    orderNumber: normalizedOrderNumber,
    template: qrImageUrlTemplate,
  });

  return {
    bankName,
    bankCode,
    accountName,
    accountNumber,
    qrImageUrl,
    transferContent,
    amount: normalizedAmount,
    isConfigured: Boolean(accountNumber && bankCode),
    canGenerateQr: Boolean(qrImageUrl),
  };
}
