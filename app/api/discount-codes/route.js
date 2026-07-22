import { NextResponse } from 'next/server';
import { query } from '../../../src/lib/server/db.js';

export const runtime = 'nodejs';

function formatDiscountCode(row) {
  return {
    id: Number(row.id),
    code: String(row.code ?? '').trim().toUpperCase(),
    name: String(row.name ?? '').trim(),
    description: String(row.description ?? '').trim(),
    discountType: String(row.discount_type ?? '').trim(),
    discountValue: Number(row.discount_value ?? 0),
    maxDiscountAmount: row.max_discount_amount == null ? null : Number(row.max_discount_amount),
    minOrderAmount: Number(row.min_order_amount ?? 0),
    totalUsageLimit: row.total_usage_limit == null ? null : Number(row.total_usage_limit),
    perUserLimit: row.per_user_limit == null ? null : Number(row.per_user_limit),
    scopeType: String(row.scope_type ?? '').trim(),
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    usedCount: Number(row.used_count ?? 0),
  };
}

export async function GET() {
  try {
    const rows = await query(`
      SELECT
        dc.id,
        dc.code,
        dc.name,
        dc.description,
        dc.discount_type,
        dc.discount_value,
        dc.max_discount_amount,
        dc.min_order_amount,
        dc.total_usage_limit,
        dc.per_user_limit,
        dc.scope_type,
        dc.starts_at,
        dc.ends_at,
        COUNT(dcr.id) AS used_count
      FROM discount_codes dc
      LEFT JOIN discount_code_redemptions dcr
        ON dcr.discount_code_id = dc.id
        AND dcr.status = 'applied'
      WHERE dc.is_active = 1
        AND (dc.starts_at IS NULL OR dc.starts_at <= NOW())
        AND (dc.ends_at IS NULL OR dc.ends_at >= NOW())
      GROUP BY
        dc.id,
        dc.code,
        dc.name,
        dc.description,
        dc.discount_type,
        dc.discount_value,
        dc.max_discount_amount,
        dc.min_order_amount,
        dc.total_usage_limit,
        dc.per_user_limit,
        dc.scope_type,
        dc.starts_at,
        dc.ends_at
      HAVING dc.total_usage_limit IS NULL OR used_count < dc.total_usage_limit
      ORDER BY dc.created_at DESC, dc.id DESC
      LIMIT 12
    `);

    return NextResponse.json({ discountCodes: rows.map(formatDiscountCode) });
  } catch (error) {
    console.error('List discount codes error:', error);
    return NextResponse.json({ discountCodes: [] }, { status: 200 });
  }
}
