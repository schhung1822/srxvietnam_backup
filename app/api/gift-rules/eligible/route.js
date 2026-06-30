import { NextResponse } from 'next/server';
import { getCheckoutTotals } from '../../../../src/lib/commerce/checkout.js';
import { getDbPool } from '../../../../src/lib/server/db.js';
import { getEligibleGifts } from '../../../../src/lib/server/gift-rules.js';

export const runtime = 'nodejs';

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
    price: normalizePrice(item?.price),
    quantity: normalizeInteger(item?.quantity) ?? 0,
  };
}

export async function POST(request) {
  const pool = getDbPool();
  const connection = await pool.getConnection();

  try {
    const body = await request.json();
    const items = Array.isArray(body?.items) ? body.items.map(normalizeCheckoutItem) : [];
    const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
    const totals = getCheckoutTotals({
      subtotal,
      couponCode: body?.couponCode,
    });
    const gifts = await getEligibleGifts(connection, {
      items,
      subtotal: totals.subtotal,
    });

    return NextResponse.json(
      {
        gifts,
      },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      },
    );
  } catch (error) {
    console.error('Gift rules preview error:', error);
    return NextResponse.json({ gifts: [] }, { status: 200 });
  } finally {
    connection.release();
  }
}
