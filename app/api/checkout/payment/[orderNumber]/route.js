import { NextResponse } from 'next/server';
import { getSepayPaymentDetails } from '../../../../../src/lib/commerce/checkout.js';
import { query } from '../../../../../src/lib/server/db.js';

export const runtime = 'nodejs';

function normalizeOrderNumber(value) {
  return String(value ?? '').trim().toUpperCase();
}

export async function GET(_request, { params }) {
  try {
    const { orderNumber } = await params;
    const normalizedOrderNumber = normalizeOrderNumber(orderNumber);

    if (!normalizedOrderNumber) {
      return NextResponse.json({ message: 'Mã đơn hàng không hợp lệ.' }, { status: 400 });
    }

    const rows = await query(
      `
        SELECT
          order_number,
          order_status,
          payment_status,
          payment_method,
          grand_total,
          placed_at,
          paid_at
        FROM orders
        WHERE order_number = ?
        LIMIT 1
      `,
      [normalizedOrderNumber],
    );

    const order = rows[0] ?? null;

    if (!order) {
      return NextResponse.json({ message: 'Không tìm thấy đơn hàng.' }, { status: 404 });
    }

    if (order.payment_method !== 'bank_transfer') {
      return NextResponse.json({ message: 'Đơn hàng này không dùng SePay.' }, { status: 400 });
    }

    const grandTotal = Number(order.grand_total ?? 0);

    return NextResponse.json(
      {
        order: {
          orderNumber: order.order_number,
          orderStatus: order.order_status,
          paymentStatus: order.payment_status,
          paymentMethod: order.payment_method,
          grandTotal,
          placedAt: order.placed_at,
          paidAt: order.paid_at,
        },
        payment: getSepayPaymentDetails({
          amount: grandTotal,
          orderNumber: order.order_number,
        }),
      },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      },
    );
  } catch (error) {
    console.error('Checkout payment lookup error:', error);
    return NextResponse.json({ message: 'Không thể tải trạng thái thanh toán.' }, { status: 500 });
  }
}
