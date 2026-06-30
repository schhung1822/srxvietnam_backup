import { NextResponse } from 'next/server';
import { getAuthenticatedUserRow } from '../../../../src/lib/server/account.js';
import { query } from '../../../../src/lib/server/db.js';

export const runtime = 'nodejs';

function formatOrder(order, items) {
  return {
    id: order.id,
    orderNumber: order.order_number,
    orderStatus: order.order_status,
    paymentStatus: order.payment_status,
    paymentMethod: order.payment_method,
    grandTotal: Number(order.grand_total ?? 0),
    placedAt: order.placed_at,
    totalItems: Number(order.total_items ?? 0),
    totalQuantity: Number(order.total_quantity ?? 0),
    customer: {
      name: order.customer_name ?? '',
      email: order.customer_email ?? '',
      phone: order.customer_phone ?? '',
    },
    shippingAddress: {
      recipientName: order.shipping_recipient_name ?? '',
      recipientPhone: order.shipping_recipient_phone ?? '',
      province: order.shipping_province ?? '',
      district: order.shipping_district ?? '',
      ward: order.shipping_ward ?? '',
      addressLine: order.shipping_address_line ?? '',
      postalCode: order.shipping_postal_code ?? '',
      countryCode: order.shipping_country_code ?? 'VN',
    },
    items,
  };
}

export async function GET(request) {
  try {
    const user = await getAuthenticatedUserRow(request);

    if (!user) {
      return NextResponse.json({ message: 'Vui lòng đăng nhập để tiếp tục.' }, { status: 401 });
    }

    const orderRows = await query(
      `
        SELECT
          o.id,
          o.order_number,
          o.order_status,
          o.payment_status,
          o.payment_method,
          o.grand_total,
          o.placed_at,
          o.customer_name,
          o.customer_email,
          o.customer_phone,
          MAX(oa.recipient_name) AS shipping_recipient_name,
          MAX(oa.recipient_phone) AS shipping_recipient_phone,
          MAX(oa.country_code) AS shipping_country_code,
          MAX(oa.province) AS shipping_province,
          MAX(oa.district) AS shipping_district,
          MAX(oa.ward) AS shipping_ward,
          MAX(oa.address_line) AS shipping_address_line,
          MAX(oa.postal_code) AS shipping_postal_code,
          COUNT(CASE WHEN COALESCE(oi.is_gift, 0) = 0 THEN oi.id END) AS total_items,
          COALESCE(SUM(CASE WHEN COALESCE(oi.is_gift, 0) = 0 THEN oi.quantity ELSE 0 END), 0) AS total_quantity
        FROM orders o
        LEFT JOIN order_items oi ON oi.order_id = o.id
        LEFT JOIN order_addresses oa
          ON oa.order_id = o.id
          AND oa.address_type = 'shipping'
        WHERE o.user_id = ?
        GROUP BY
          o.id,
          o.order_number,
          o.order_status,
          o.payment_status,
          o.payment_method,
          o.grand_total,
          o.placed_at,
          o.customer_name,
          o.customer_email,
          o.customer_phone
        ORDER BY o.placed_at DESC, o.id DESC
        LIMIT 20
      `,
      [user.id],
    );

    if (!orderRows.length) {
      return NextResponse.json({ orders: [] });
    }

    const orderIds = orderRows.map((order) => order.id);
    const placeholders = orderIds.map(() => '?').join(', ');
    const itemRows = await query(
      `
        SELECT
          order_id,
          product_name,
          variant_name,
          quantity,
          is_gift
        FROM order_items
        WHERE order_id IN (${placeholders})
        ORDER BY order_id DESC, id ASC
      `,
      orderIds,
    );

    const itemsByOrderId = itemRows.reduce((accumulator, item) => {
      const formattedItem = {
        productName: item.product_name,
        variantName: item.variant_name,
        quantity: Number(item.quantity ?? 0),
        isGift: Boolean(Number(item.is_gift ?? 0)),
      };

      if (!accumulator[item.order_id]) {
        accumulator[item.order_id] = [];
      }

      accumulator[item.order_id].push(formattedItem);
      return accumulator;
    }, {});

    return NextResponse.json({
      orders: orderRows.map((order) => formatOrder(order, itemsByOrderId[order.id] ?? [])),
    });
  } catch (error) {
    console.error('Account orders error:', error);
    return NextResponse.json({ message: 'Không thể tải danh sách đơn hàng.' }, { status: 500 });
  }
}
