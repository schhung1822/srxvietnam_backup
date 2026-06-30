import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import {
  getCheckoutTotals,
  getSepayPaymentDetails,
  isSupportedPaymentMethod,
  paymentMethodOptions,
} from '../../../src/lib/commerce/checkout.js';
import { getAuthenticatedUserRow } from '../../../src/lib/server/account.js';
import {
  AFFILIATE_REFERRAL_COOKIE_NAME,
  AFFILIATE_VISITOR_COOKIE_NAME,
  normalizeAffiliateCode,
  normalizeAffiliateVisitorToken,
} from '../../../src/lib/server/affiliate.js';
import { getDbPool } from '../../../src/lib/server/db.js';
import { formatErrorDetails } from '../../../src/lib/server/error-details.js';
import { createRequestTimeoutSignal } from '../../../src/lib/server/request-timeout.js';
import { getOrderTrackingContext } from '../../../src/lib/server/tracking.js';
import { ensureServerEnvLoaded } from '../../../src/lib/server/env.js';
import { decrementGiftRuleLimits, getEligibleGifts } from '../../../src/lib/server/gift-rules.js';

export const runtime = 'nodejs';

ensureServerEnvLoaded();

const ORDERS_WEB_API_URL =
  process.env.SRX_ORDERS_WEB_API_URL?.trim() || 'https://crm.srx.vn/api/srx/orders_web';
const ORDERS_WEB_API_TOKEN = process.env.SRX_ORDERS_WEB_API_TOKEN?.trim() || '';

function normalizeString(value) {
  return String(value ?? '').trim();
}

function normalizeInteger(value) {
  const normalized = Number(value);
  return Number.isInteger(normalized) && normalized > 0 ? normalized : null;
}

function normalizePrice(value) {
  const normalized = Number(value);
  return Number.isFinite(normalized) && normalized >= 0 ? normalized : 0;
}

function normalizeCheckoutItem(item) {
  return {
    productId: normalizeInteger(item?.productId),
    variantId: normalizeInteger(item?.variantId),
    sku: normalizeString(item?.sku) || null,
    name: normalizeString(item?.name),
    variantLabel: normalizeString(item?.variantLabel) || null,
    price: normalizePrice(item?.price),
    quantity: normalizeInteger(item?.quantity),
  };
}

function normalizeCustomer(body) {
  return {
    fullName: normalizeString(body?.fullName),
    phone: normalizeString(body?.phone),
    email: normalizeString(body?.email).toLowerCase(),
    province: normalizeString(body?.province),
    ward: normalizeString(body?.ward),
    addressLine: normalizeString(body?.addressLine),
  };
}

function validateCheckoutItems(items) {
  if (!Array.isArray(items) || !items.length) {
    throw new Error('Giỏ hàng đang trống.');
  }

  if (items.length > 50) {
    throw new Error('Số lượng sản phẩm trong đơn hàng vượt giới hạn cho phép.');
  }

  items.forEach((item) => {
    if (!item.name || item.name.length < 2) {
      throw new Error('Có sản phẩm trong giỏ hàng không hợp lệ.');
    }

    if (!item.quantity || item.quantity > 99) {
      throw new Error('Số lượng sản phẩm không hợp lệ.');
    }

    if (!Number.isFinite(item.price) || item.price < 0) {
      throw new Error('Giá sản phẩm không hợp lệ.');
    }
  });
}

function validateCustomer(customer) {
  if (customer.fullName.length < 2) {
    throw new Error('Vui lòng nhập họ tên hợp lệ.');
  }

  if (customer.phone.length < 8) {
    throw new Error('Vui lòng nhập số điện thoại hợp lệ.');
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
    throw new Error('Vui lòng nhập email hợp lệ.');
  }

  if (customer.province.length < 2) {
    throw new Error('Vui lòng nhập tỉnh/thành phố.');
  }

  if (customer.ward.length < 2) {
    throw new Error('Vui lòng nhập phường/xã.');
  }

  if (customer.addressLine.length < 6) {
    throw new Error('Vui lòng nhập địa chỉ chi tiết đầy đủ hơn.');
  }
}

function buildOrderNumber() {
  const timestamp = Date.now().toString().slice(-10);
  const suffix = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `SRX${timestamp}${suffix}`;
}

async function queueOrdersWebNotifications(payload) {
  if (!ORDERS_WEB_API_URL) {
    return;
  }

  try {
    const { signal, cleanup } = createRequestTimeoutSignal(5000);

    try {
      const response = await fetch(ORDERS_WEB_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(ORDERS_WEB_API_TOKEN ? { Authorization: `Bearer ${ORDERS_WEB_API_TOKEN}` } : {}),
        },
        body: JSON.stringify(payload),
        cache: 'no-store',
        signal,
      });

      if (!response.ok) {
        const responseBody = (await response.text().catch(() => '')).trim();
        throw new Error(
          `orders_web returned ${response.status}${responseBody ? `: ${responseBody.slice(0, 300)}` : ''}`,
        );
      }
    } catch (error) {
      throw new Error(
        `Failed to send orders_web notification to ${ORDERS_WEB_API_URL}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { cause: error },
      );
    } finally {
      cleanup();
    }
  } catch (error) {
    console.error(`Orders_web notification dispatch error:\n${formatErrorDetails(error)}`);
  }
}

async function execute(connection, sql, params = []) {
  const [rows] = await connection.execute(sql, params);
  return rows;
}

async function getExistingIds(connection, tableName, ids) {
  if (!ids.length) {
    return new Set();
  }

  const placeholders = ids.map(() => '?').join(', ');
  const rows = await execute(connection, `SELECT id FROM ${tableName} WHERE id IN (${placeholders})`, ids);
  return new Set(rows.map((row) => Number(row.id)));
}

async function getOwnedAddress(connection, userId, addressId) {
  const rows = await execute(
    connection,
    `
      SELECT
        id,
        label,
        recipient_name,
        recipient_phone,
        country_code,
        province,
        district,
        ward,
        address_line,
        postal_code,
        is_default
      FROM user_addresses
      WHERE id = ?
        AND user_id = ?
      LIMIT 1
    `,
    [addressId, userId],
  );

  return rows[0] ?? null;
}

function buildLineItems(items, discountTotal, subtotal) {
  if (!subtotal || !discountTotal) {
    return items.map((item) => ({
      ...item,
      discountAmount: 0,
      lineTotal: Math.max(item.price * item.quantity, 0),
    }));
  }

  let remainingDiscount = discountTotal;

  return items.map((item, index) => {
    const lineSubtotal = item.price * item.quantity;
    const isLastItem = index === items.length - 1;
    const lineDiscount = isLastItem
      ? remainingDiscount
      : Math.min(Math.round((lineSubtotal / subtotal) * discountTotal), remainingDiscount);

    remainingDiscount -= lineDiscount;

    return {
      ...item,
      discountAmount: Math.max(lineDiscount, 0),
      lineTotal: Math.max(lineSubtotal - Math.max(lineDiscount, 0), 0),
    };
  });
}

function buildCustomerFromSavedAddress(user, address) {
  return {
    fullName: address.recipient_name,
    phone: address.recipient_phone,
    email: normalizeString(user?.email).toLowerCase(),
    province: address.province,
    ward: address.ward || address.district || '',
    addressLine: address.address_line,
    countryCode: address.country_code || 'VN',
    district: address.district || address.ward || '',
    postalCode: address.postal_code ?? null,
  };
}

function buildCustomerFromForm(customer) {
  return {
    fullName: customer.fullName,
    phone: customer.phone,
    email: customer.email,
    province: customer.province,
    ward: customer.ward,
    addressLine: customer.addressLine,
    countryCode: 'VN',
    district: customer.ward,
    postalCode: null,
  };
}

function calculateAffiliateCommissionAmount(baseAmount, commissionType, commissionRate) {
  const normalizedBaseAmount = normalizePrice(baseAmount);
  const normalizedCommissionRate = Number(commissionRate ?? 0);

  if (!normalizedBaseAmount || !Number.isFinite(normalizedCommissionRate) || normalizedCommissionRate <= 0) {
    return 0;
  }

  if (commissionType === 'fixed') {
    return normalizedCommissionRate;
  }

  return Number(((normalizedBaseAmount * normalizedCommissionRate) / 100).toFixed(2));
}

async function getAffiliateAttributionForCheckout(connection, request, purchasingUserId) {
  const affiliateCode = normalizeAffiliateCode(
    request.cookies.get(AFFILIATE_REFERRAL_COOKIE_NAME)?.value,
  );

  if (!affiliateCode) {
    return null;
  }

  const affiliateRows = await execute(
    connection,
    `
      SELECT
        id,
        user_id,
        affiliate_code,
        commission_type,
        commission_rate
      FROM affiliate_accounts
      WHERE affiliate_code = ?
        AND status = 'active'
      LIMIT 1
    `,
    [affiliateCode],
  );

  const affiliateAccount = affiliateRows[0] ?? null;

  if (!affiliateAccount) {
    return null;
  }

  if (purchasingUserId && Number(affiliateAccount.user_id) === Number(purchasingUserId)) {
    return null;
  }

  const visitorToken = normalizeAffiliateVisitorToken(
    request.cookies.get(AFFILIATE_VISITOR_COOKIE_NAME)?.value,
  );

  let clickId = null;

  if (visitorToken || purchasingUserId) {
    const clickQuerySegments = [
      `
        SELECT id
        FROM affiliate_clicks
        WHERE affiliate_account_id = ?
          AND converted_order_id IS NULL
      `,
    ];
    const clickParams = [affiliateAccount.id];

    if (visitorToken && purchasingUserId) {
      clickQuerySegments.push('AND (visitor_token = ? OR customer_user_id = ?)');
      clickParams.push(visitorToken, purchasingUserId);
    } else if (visitorToken) {
      clickQuerySegments.push('AND visitor_token = ?');
      clickParams.push(visitorToken);
    } else {
      clickQuerySegments.push('AND customer_user_id = ?');
      clickParams.push(purchasingUserId);
    }

    clickQuerySegments.push('ORDER BY clicked_at DESC LIMIT 1');

    const clickRows = await execute(connection, clickQuerySegments.join('\n'), clickParams);
    clickId = clickRows[0]?.id ?? null;
  }

  return {
    accountId: affiliateAccount.id,
    affiliateLinkId: null,
    clickId,
    commissionType: affiliateAccount.commission_type,
    commissionRate: Number(affiliateAccount.commission_rate ?? 0),
  };
}

export async function POST(request) {
  const pool = getDbPool();
  const connection = await pool.getConnection();

  try {
    const user = await getAuthenticatedUserRow(request);
    const body = await request.json();
    const paymentMethod = normalizeString(body?.paymentMethod).toLowerCase();
    const couponCode = normalizeString(body?.couponCode);
    const addressId = normalizeInteger(body?.addressId);
    const customerInput = normalizeCustomer(body?.customer);
    const items = Array.isArray(body?.items) ? body.items.map(normalizeCheckoutItem) : [];
    const tracking = getOrderTrackingContext(request);

    if (!isSupportedPaymentMethod(paymentMethod)) {
      return NextResponse.json({ message: 'Phương thức thanh toán không hợp lệ.' }, { status: 400 });
    }

    validateCheckoutItems(items);

    const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
    const totals = getCheckoutTotals({
      subtotal,
      couponCode,
    });
    const lineItems = buildLineItems(items, totals.discountTotal, totals.subtotal);

    await connection.beginTransaction();

    const giftItems = await getEligibleGifts(connection, {
      items,
      subtotal: totals.subtotal,
      lockForUpdate: true,
    });

    const affiliateAttribution = await getAffiliateAttributionForCheckout(connection, request, user?.id ?? null);

    let customer;

    if (user && addressId) {
      const savedAddress = await getOwnedAddress(connection, user.id, addressId);

      if (!savedAddress) {
        await connection.rollback();
        return NextResponse.json({ message: 'Không tìm thấy địa chỉ giao hàng đã chọn.' }, { status: 404 });
      }

      customer = buildCustomerFromSavedAddress(user, savedAddress);
    } else {
      validateCustomer(customerInput);
      customer = buildCustomerFromForm(customerInput);
    }

    const existingProductIds = await getExistingIds(
      connection,
      'products',
      [...new Set([...items, ...giftItems].map((item) => item.productId).filter(Boolean))],
    );
    const existingVariantIds = await getExistingIds(
      connection,
      'product_variants',
      [...new Set([...items, ...giftItems].map((item) => item.variantId).filter(Boolean))],
    );

    const orderNumber = buildOrderNumber();
    const noteSegments = [
      totals.coupon.isValid ? `Coupon: ${totals.coupon.code}` : '',
      giftItems.length ? `Gifts: ${giftItems.map((gift) => `${gift.name} x${gift.quantity}`).join(', ')}` : '',
    ].filter(Boolean);
    const notes = noteSegments.length ? noteSegments.join('\n') : null;

    const orderResult = await execute(
      connection,
      `
        INSERT INTO orders (
          order_number,
          user_id,
          affiliate_account_id,
          affiliate_link_id,
          customer_name,
          customer_email,
          customer_phone,
          user_ip,
          user_agent,
          fbp,
          fbc,
          order_status,
          payment_status,
          payment_method,
          subtotal,
          discount_total,
          shipping_total,
          tax_total,
          grand_total,
          notes
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending', ?, ?, ?, 0, 0, ?, ?)
      `,
      [
        orderNumber,
        user?.id ?? null,
        affiliateAttribution?.accountId ?? null,
        affiliateAttribution?.affiliateLinkId ?? null,
        customer.fullName,
        customer.email || null,
        customer.phone,
        tracking.userIp,
        tracking.userAgent,
        tracking.fbp,
        tracking.fbc,
        paymentMethod,
        totals.subtotal,
        totals.discountTotal,
        totals.grandTotal,
        notes,
      ],
    );

    const orderId = orderResult.insertId;

    await execute(
      connection,
      `
        INSERT INTO order_addresses (
          order_id,
          address_type,
          recipient_name,
          recipient_phone,
          country_code,
          province,
          district,
          ward,
          address_line,
          postal_code
        )
        VALUES (?, 'shipping', ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        orderId,
        customer.fullName,
        customer.phone,
        customer.countryCode,
        customer.province,
        customer.district,
        customer.ward || null,
        customer.addressLine,
        customer.postalCode,
      ],
    );

    for (const item of [...lineItems, ...giftItems]) {
      await execute(
        connection,
        `
          INSERT INTO order_items (
            order_id,
            product_id,
            variant_id,
            sku,
            product_name,
            variant_name,
            unit_price,
            quantity,
            discount_amount,
            line_total,
            is_gift,
            gift_rule_id
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          orderId,
          item.productId && existingProductIds.has(item.productId) ? item.productId : null,
          item.variantId && existingVariantIds.has(item.variantId) ? item.variantId : null,
          item.sku,
          item.name,
          item.variantLabel,
          item.price,
          item.quantity,
          item.discountAmount,
          item.lineTotal,
          item.isGift ? 1 : 0,
          item.giftRuleId ?? null,
        ],
      );
    }

    await decrementGiftRuleLimits(connection, giftItems);

    await execute(
      connection,
      `
        INSERT INTO order_status_histories (
          order_id,
          status,
          note,
          changed_by_user_id
        )
        VALUES (?, 'pending', ?, ?)
      `,
      [orderId, 'Created from website checkout.', user?.id ?? null],
    );

    if (affiliateAttribution?.accountId) {
      const commissionBaseAmount = totals.grandTotal;
      const commissionAmount = calculateAffiliateCommissionAmount(
        commissionBaseAmount,
        affiliateAttribution.commissionType,
        affiliateAttribution.commissionRate,
      );

      await execute(
        connection,
        `
          INSERT INTO affiliate_referrals (
            affiliate_account_id,
            affiliate_link_id,
            affiliate_click_id,
            order_id,
            customer_user_id,
            commission_type,
            commission_rate,
            commission_base_amount,
            commission_amount,
            status,
            notes
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
        `,
        [
          affiliateAttribution.accountId,
          affiliateAttribution.affiliateLinkId,
          affiliateAttribution.clickId,
          orderId,
          user?.id ?? null,
          affiliateAttribution.commissionType,
          affiliateAttribution.commissionRate,
          commissionBaseAmount,
          commissionAmount,
          'Auto-generated from website checkout.',
        ],
      );

      await execute(
        connection,
        `UPDATE affiliate_accounts SET total_orders = total_orders + 1 WHERE id = ?`,
        [affiliateAttribution.accountId],
      );

      if (affiliateAttribution.clickId) {
        await execute(
          connection,
          `
            UPDATE affiliate_clicks
            SET converted_order_id = ?
            WHERE id = ?
              AND converted_order_id IS NULL
          `,
          [orderId, affiliateAttribution.clickId],
        );
      }
    }

    await connection.commit();
    const paymentMethodLabel =
      paymentMethodOptions.find((method) => method.id === paymentMethod)?.label || paymentMethod;
    const paymentDetails =
      paymentMethod === 'bank_transfer'
        ? getSepayPaymentDetails({
            amount: totals.grandTotal,
            orderNumber,
          })
        : null;
    const orderSummary = {
      id: orderId,
      orderNumber,
      orderStatus: 'pending',
      paymentMethod,
      paymentStatus: 'pending',
      grandTotal: totals.grandTotal,
      discountTotal: totals.discountTotal,
      subtotal: totals.subtotal,
      totalItems: items.length,
      totalQuantity: items.reduce((total, item) => total + item.quantity, 0),
      gifts: giftItems,
      placedAt: new Date().toISOString(),
    };

    void queueOrdersWebNotifications({
      orderNumber,
      customer,
      items: [...lineItems, ...giftItems],
      notes,
      payment: {
        details: paymentDetails
          ? {
              accountName: paymentDetails.accountName,
              accountNumber: paymentDetails.accountNumber,
              amount: paymentDetails.amount,
              bankName: paymentDetails.bankName,
              transferContent: paymentDetails.transferContent,
            }
          : null,
        method: paymentMethod,
        methodLabel: paymentMethodLabel,
        status: orderSummary.paymentStatus,
      },
      placedAt: new Date().toISOString(),
      siteOrigin: request.nextUrl.origin,
      source: 'Website SRX Việt Nam',
      totals: {
        discountTotal: totals.discountTotal,
        grandTotal: totals.grandTotal,
        subtotal: totals.subtotal,
      },
    });

    return NextResponse.json(
      {
        message:
          paymentMethod === 'bank_transfer'
            ? 'Đơn hàng đã được tạo. Vui lòng thanh toán bằng QR để hoàn tất.'
            : 'Đơn hàng đã được ghi nhận thành công.',
        order: orderSummary,
        payment: paymentDetails,
      },
      { status: 201 },
    );
  } catch (error) {
    await connection.rollback();
    console.error('Checkout error:', error);

    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'Không thể tạo đơn hàng.' }, { status: 500 });
  } finally {
    connection.release();
  }
}
