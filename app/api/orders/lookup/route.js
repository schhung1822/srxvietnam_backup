import { NextResponse } from 'next/server';
import { query } from '../../../../src/lib/server/db.js';

export const runtime = 'nodejs';

// Mã đơn do checkout sinh ra luôn viết hoa (SRX + timestamp + hex).
function normalizeOrderCode(value) {
  return String(value ?? '').trim().toUpperCase();
}

function normalizeImagePath(value = '') {
  const normalizedValue = String(value ?? '').trim();

  if (!normalizedValue) {
    return '';
  }

  if (/^https?:\/\//i.test(normalizedValue)) {
    return normalizedValue;
  }

  return normalizedValue.startsWith('/') ? normalizedValue : `/${normalizedValue}`;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderCode = normalizeOrderCode(searchParams.get('ordercode') ?? searchParams.get('orderCode'));

    if (!orderCode) {
      return NextResponse.json({ message: 'Vui lòng nhập mã đơn hàng.' }, { status: 400 });
    }

    // Cột order_number chỉ dài 30 ký tự nên mã dài hơn chắc chắn không tồn tại.
    if (orderCode.length > 30) {
      return NextResponse.json({ message: 'Mã đơn hàng không hợp lệ.' }, { status: 400 });
    }

    const orderRows = await query(
      `
        SELECT
          o.id,
          o.order_number,
          o.order_status,
          o.payment_status,
          o.payment_method,
          o.subtotal,
          o.discount_total,
          o.shipping_total,
          o.grand_total,
          o.placed_at,
          o.paid_at,
          o.completed_at,
          o.cancelled_at,
          o.customer_name,
          o.customer_email,
          o.customer_phone,
          oa.recipient_name AS shipping_recipient_name,
          oa.recipient_phone AS shipping_recipient_phone,
          oa.country_code AS shipping_country_code,
          oa.province AS shipping_province,
          oa.district AS shipping_district,
          oa.ward AS shipping_ward,
          oa.address_line AS shipping_address_line,
          oa.postal_code AS shipping_postal_code
        FROM orders o
        LEFT JOIN order_addresses oa
          ON oa.order_id = o.id
          AND oa.address_type = 'shipping'
        WHERE o.order_number = ?
        LIMIT 1
      `,
      [orderCode],
    );

    const order = orderRows[0] ?? null;

    if (!order) {
      return NextResponse.json(
        { message: 'Không tìm thấy đơn hàng với mã này. Vui lòng kiểm tra lại.' },
        { status: 404 },
      );
    }

    const itemRows = await query(
      `
        SELECT
          oi.product_name,
          oi.variant_name,
          oi.quantity,
          oi.unit_price,
          oi.line_total,
          oi.is_gift,
          p.slug AS product_slug,
          COALESCE(
            (
              SELECT vi.image_url
              FROM product_images vi
              WHERE vi.variant_id = oi.variant_id
              ORDER BY vi.is_primary DESC, vi.sort_order ASC, vi.id ASC
              LIMIT 1
            ),
            (
              SELECT pi.image_url
              FROM product_images pi
              WHERE pi.product_id = oi.product_id
              ORDER BY pi.is_primary DESC, pi.sort_order ASC, pi.id ASC
              LIMIT 1
            ),
            p.thumbnail_url,
            gr.gift_img
          ) AS image_url
        FROM order_items oi
        LEFT JOIN products p ON p.id = oi.product_id
        LEFT JOIN gift_rules gr ON gr.id = oi.gift_rule_id
        WHERE oi.order_id = ?
        ORDER BY oi.id ASC
      `,
      [order.id],
    );

    const items = itemRows.map((item) => ({
      productName: item.product_name,
      productSlug: item.product_slug ?? '',
      variantName: item.variant_name,
      quantity: Number(item.quantity ?? 0),
      unitPrice: Number(item.unit_price ?? 0),
      lineTotal: Number(item.line_total ?? 0),
      isGift: Boolean(Number(item.is_gift ?? 0)),
      imageUrl: normalizeImagePath(item.image_url),
    }));

    return NextResponse.json(
      {
        order: {
          orderNumber: order.order_number,
          orderStatus: order.order_status,
          paymentStatus: order.payment_status,
          paymentMethod: order.payment_method,
          subtotal: Number(order.subtotal ?? 0),
          discountTotal: Number(order.discount_total ?? 0),
          shippingTotal: Number(order.shipping_total ?? 0),
          grandTotal: Number(order.grand_total ?? 0),
          placedAt: order.placed_at,
          paidAt: order.paid_at,
          completedAt: order.completed_at,
          cancelledAt: order.cancelled_at,
          totalQuantity: items
            .filter((item) => !item.isGift)
            .reduce((total, item) => total + item.quantity, 0),
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
        },
      },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      },
    );
  } catch (error) {
    console.error('Order lookup error:', error);
    return NextResponse.json({ message: 'Không thể tra cứu đơn hàng.' }, { status: 500 });
  }
}
