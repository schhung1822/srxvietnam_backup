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
          COUNT(oi.id) AS total_items,
          COALESCE(SUM(oi.quantity), 0) AS total_quantity
        FROM orders o
        LEFT JOIN order_items oi ON oi.order_id = o.id
        WHERE o.user_id = ?
        GROUP BY
          o.id,
          o.order_number,
          o.order_status,
          o.payment_status,
          o.payment_method,
          o.grand_total,
          o.placed_at
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
          quantity
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
