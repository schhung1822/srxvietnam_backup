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

function normalizeDiscountCodeRecord(record) {
  if (!record) {
    return null;
  }

  const code = normalizeCouponCode(record.code);

  if (!code) {
    return null;
  }

  const maxDiscountAmountValue = record.maxDiscountAmount ?? record.max_discount_amount;
  const stackValue = record.stackWithPublic ?? record.stack_with_public;

  return {
    id: record.id ?? code,
    code,
    name: String(record.name ?? code).trim() || code,
    description: String(record.description ?? '').trim(),
    discountType: String(record.discountType ?? record.discount_type ?? '').trim(),
    discountValue: Number(record.discountValue ?? record.discount_value ?? 0) || 0,
    maxDiscountAmount: maxDiscountAmountValue == null ? null : Number(maxDiscountAmountValue),
    minOrderAmount: Number(record.minOrderAmount ?? record.min_order_amount ?? 0) || 0,
    endsAt: record.endsAt ?? record.ends_at ?? null,
    // Mã chung (public) hiện trong danh sách; mã riêng (private) chỉ người được gửi mới biết, vd. mã vòng quay.
    codeClass: (record.codeClass ?? record.class) === 'private' ? 'private' : 'public',
    // Chỉ có nghĩa với mã riêng: được dùng cùng một mã chung trong cùng đơn hàng.
    stackWithPublic: stackValue === true || Number(stackValue) === 1,
  };
}

function getDiscountCodeAmount(discountCode, subtotal) {
  if (!discountCode || subtotal < discountCode.minOrderAmount) {
    return 0;
  }

  if (discountCode.discountType === 'percentage') {
    const rawAmount = Math.round((subtotal * discountCode.discountValue) / 100);
    return discountCode.maxDiscountAmount
      ? Math.min(rawAmount, discountCode.maxDiscountAmount)
      : rawAmount;
  }

  if (discountCode.discountType === 'fixed_amount') {
    return discountCode.discountValue;
  }

  return 0;
}

export function getCouponApplication(code, subtotal, discountCodes = []) {
  const normalizedCode = normalizeCouponCode(code);
  const normalizedSubtotal = Math.max(Number(subtotal) || 0, 0);
  const normalizedDiscountCodes = Array.isArray(discountCodes)
    ? discountCodes.map(normalizeDiscountCodeRecord).filter(Boolean)
    : [];

  if (!normalizedCode) {
    return {
      code: '',
      discountAmount: 0,
      isValid: false,
      message: 'Nhập mã giảm giá để áp dụng.',
    };
  }

  const matchedDiscountCode = normalizedDiscountCodes.find((discountCode) => discountCode.code === normalizedCode);

  if (matchedDiscountCode) {
    if (normalizedSubtotal < matchedDiscountCode.minOrderAmount) {
      return {
        code: normalizedCode,
        discountAmount: 0,
        isValid: false,
        message: `Đơn hàng cần tối thiểu ${matchedDiscountCode.minOrderAmount.toLocaleString('vi-VN')}đ để áp dụng mã ${normalizedCode}.`,
      };
    }

    const discountAmount = Math.min(getDiscountCodeAmount(matchedDiscountCode, normalizedSubtotal), normalizedSubtotal);

    if (!discountAmount && matchedDiscountCode.discountType !== 'free_shipping') {
      return {
        code: normalizedCode,
        discountAmount: 0,
        isValid: false,
        message: `Mã ${normalizedCode} chưa có giá trị giảm hợp lệ.`,
      };
    }

    return {
      code: normalizedCode,
      discountAmount,
      isValid: true,
      message: `Đã áp dụng mã ${normalizedCode}.`,
      discountCode: matchedDiscountCode,
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

// Một đơn dùng tối đa 1 mã chung + 1 mã riêng (khi mã riêng cho phép dùng chung).
const MAX_COUPONS_PER_ORDER = 2;

/** Danh sách mã đang áp dụng: nhận mảng hoặc chuỗi "A,B" (bản cũ gửi một mã), bỏ trùng. */
export function normalizeCouponCodes(value) {
  const rawCodes = Array.isArray(value) ? value : String(value ?? '').split(',');
  const codes = rawCodes.map(normalizeCouponCode).filter(Boolean);

  return [...new Set(codes)].slice(0, MAX_COUPONS_PER_ORDER);
}

function buildRecordLookup(discountCodes) {
  const records = Array.isArray(discountCodes) ? discountCodes.map(normalizeDiscountCodeRecord).filter(Boolean) : [];

  return new Map(records.map((record) => [record.code, record]));
}

/**
 * Thêm một mã vào các mã đang dùng theo luật kết hợp, trả về danh sách mới:
 *   - Cùng loại (chung/chung, riêng/riêng) thì mã mới thay mã cũ.
 *   - Mã riêng không cho dùng chung thì đứng một mình; mã chung chỉ giữ lại mã riêng cho dùng chung.
 * Mã không có trong danh sách (SRX10, SAVE50...) coi là mã chung.
 */
export function mergeCouponCode(currentCodes, newCode, discountCodes = []) {
  const code = normalizeCouponCode(newCode);
  const records = buildRecordLookup(discountCodes);
  const classOf = (value) => records.get(value)?.codeClass ?? 'public';
  const canStack = (value) => Boolean(records.get(value)?.stackWithPublic);

  if (!code) {
    return normalizeCouponCodes(currentCodes);
  }

  const newClass = classOf(code);
  let keptCodes = normalizeCouponCodes(currentCodes).filter((value) => value !== code && classOf(value) !== newClass);

  if (newClass === 'private') {
    keptCodes = canStack(code) ? keptCodes : [];
  } else {
    keptCodes = keptCodes.filter(canStack);
  }

  // Mã chung đứng trước cho dễ đọc ở giỏ hàng và ghi chú đơn.
  return [...keptCodes, code].sort((left, right) => Number(classOf(left) === 'private') - Number(classOf(right) === 'private'));
}

/**
 * Kiểm tra cả bộ mã và chia tiền giảm cho từng mã (tổng không vượt tạm tính: mã sau chỉ giảm
 * phần còn lại). isValid = false nếu có mã không hợp lệ hoặc bộ mã vi phạm luật kết hợp.
 */
export function getCouponCombination(couponCodes, subtotal, discountCodes = []) {
  const codes = normalizeCouponCodes(couponCodes);
  const normalizedSubtotal = Math.max(Number(subtotal) || 0, 0);
  const applications = codes.map((code) => getCouponApplication(code, normalizedSubtotal, discountCodes));
  const invalidApplication = applications.find((application) => !application.isValid);

  if (invalidApplication) {
    return { codes, coupons: [], discountTotal: 0, isValid: false, message: invalidApplication.message };
  }

  if (applications.length > 1) {
    const privateApplications = applications.filter((application) => application.discountCode?.codeClass === 'private');

    if (privateApplications.length !== 1) {
      return {
        codes,
        coupons: [],
        discountTotal: 0,
        isValid: false,
        message: 'Mỗi đơn chỉ dùng được 1 mã chung và 1 mã riêng.',
      };
    }

    if (!privateApplications[0].discountCode.stackWithPublic) {
      return {
        codes,
        coupons: [],
        discountTotal: 0,
        isValid: false,
        message: `Mã ${privateApplications[0].code} không dùng chung được với mã khác.`,
      };
    }
  }

  let remaining = normalizedSubtotal;
  const coupons = applications.map((application) => {
    const discountAmount = Math.min(application.discountAmount, remaining);
    remaining -= discountAmount;

    return { ...application, discountAmount };
  });
  const discountTotal = normalizedSubtotal - remaining;

  return {
    codes,
    coupons,
    discountTotal,
    isValid: coupons.length > 0,
    message: coupons.length ? `Đã áp dụng ${coupons.map((coupon) => coupon.code).join(', ')}.` : '',
  };
}

/**
 * couponCodes: các mã đang áp dụng (mảng); couponCode: một mã hoặc "A,B" cho chỗ gọi cũ.
 * totals.coupon tóm tắt cả bộ mã (code = "A, B"), totals.coupons là từng mã kèm tiền giảm.
 */
export function getCheckoutTotals({ subtotal = 0, couponCode = '', couponCodes, discountCodes = [] } = {}) {
  const normalizedSubtotal = Math.max(Number(subtotal) || 0, 0);
  const combination = getCouponCombination(couponCodes ?? couponCode, normalizedSubtotal, discountCodes);
  const discountTotal = Math.min(combination.discountTotal, normalizedSubtotal);
  const grandTotal = Math.max(normalizedSubtotal - discountTotal, 0);

  return {
    subtotal: normalizedSubtotal,
    discountTotal,
    grandTotal,
    coupon: {
      code: combination.codes.join(', '),
      codes: combination.codes,
      discountAmount: discountTotal,
      isValid: combination.isValid,
      message: combination.message,
    },
    coupons: combination.coupons,
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
