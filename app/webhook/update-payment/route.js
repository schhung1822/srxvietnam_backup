import { NextResponse } from 'next/server';
import { getDbPool } from '../../../src/lib/server/db.js';

export const runtime = 'nodejs';

function normalizeString(value) {
  return String(value ?? '').trim();
}

function normalizeOrderNumber(value) {
  return normalizeString(value).toUpperCase();
}

function normalizeAmount(value) {
  const normalizedValue = Number(value);
  return Number.isFinite(normalizedValue) && normalizedValue > 0 ? Math.round(normalizedValue) : 0;
}

function normalizeMysqlDateTime(value) {
  const normalizedValue = normalizeString(value);
  return /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(normalizedValue) ? normalizedValue : null;
}

function getWebhookBody(payload) {
  if (Array.isArray(payload)) {
    return getWebhookBody(payload[0]);
  }

  if (!payload || typeof payload !== 'object') {
    return null;
  }

  if (payload.body && typeof payload.body === 'object') {
    return payload.body;
  }

  return payload;
}

function extractOrderNumber(webhookBody) {
  const directCode = normalizeOrderNumber(webhookBody?.code);

  if (directCode) {
    return directCode;
  }

  const candidateSources = [webhookBody?.content, webhookBody?.description];

  for (const source of candidateSources) {
    const normalizedSource = normalizeOrderNumber(source);
    const matchedOrderNumber = normalizedSource.match(/\bSRX[A-Z0-9]+\b/);

    if (matchedOrderNumber?.[0]) {
      return matchedOrderNumber[0];
    }
  }

  return '';
}

async function execute(connection, sql, params = []) {
  const [rows] = await connection.execute(sql, params);
  return rows;
}

function ignoredWebhookResponse(reason, details = {}) {
  return NextResponse.json({
    received: true,
    ignored: true,
    reason,
    ...details,
  });
}

export async function POST(request) {
  let payload;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: 'Webhook payload không hợp lệ.' }, { status: 400 });
  }

  const webhookBody = getWebhookBody(payload);

  if (!webhookBody) {
    return NextResponse.json({ message: 'Không đọc được dữ liệu webhook.' }, { status: 400 });
  }

  const transferType = normalizeString(webhookBody.transferType).toLowerCase();

  if (transferType && transferType !== 'in') {
    return ignoredWebhookResponse('unsupported_transfer_type');
  }

  const orderNumber = extractOrderNumber(webhookBody);
  const transferAmount = normalizeAmount(webhookBody.transferAmount);
  const webhookAccountNumber = normalizeString(webhookBody.accountNumber);
  const expectedAccountNumber = normalizeString(
    process.env.SEPAY_WEBHOOK_EXPECTED_ACCOUNT_NUMBER ||
      process.env.NEXT_PUBLIC_SEPAY_ACCOUNT_NUMBER ||
      '93956886',
  );

  if (!orderNumber || !transferAmount) {
    return ignoredWebhookResponse('missing_order_number_or_amount');
  }

  if (expectedAccountNumber && webhookAccountNumber && webhookAccountNumber !== expectedAccountNumber) {
    return ignoredWebhookResponse('account_number_mismatch', {
      orderNumber,
      accountNumber: webhookAccountNumber,
    });
  }

  const pool = getDbPool();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const orderRows = await execute(
      connection,
      `
        SELECT
          id,
          order_number,
          order_status,
          payment_status,
          payment_method,
          grand_total
        FROM orders
        WHERE order_number = ?
        LIMIT 1
        FOR UPDATE
      `,
      [orderNumber],
    );

    const order = orderRows[0] ?? null;

    if (!order) {
      await connection.rollback();
      return ignoredWebhookResponse('order_not_found', { orderNumber });
    }

    if (order.payment_method !== 'bank_transfer') {
      await connection.rollback();
      return ignoredWebhookResponse('unsupported_payment_method', { orderNumber });
    }

    const expectedAmount = normalizeAmount(order.grand_total);

    if (expectedAmount !== transferAmount) {
      await connection.rollback();
      return ignoredWebhookResponse('amount_mismatch', {
        orderNumber,
        expectedAmount,
        transferAmount,
      });
    }

    if (order.payment_status === 'paid') {
      await connection.commit();
      return NextResponse.json({
        received: true,
        orderNumber,
        status: 'already_paid',
      });
    }

    const paidAt = normalizeMysqlDateTime(webhookBody.transactionDate);
    const nextOrderStatus = order.order_status === 'pending' ? 'confirmed' : order.order_status;
    const paymentNote = `SePay webhook confirmed payment. Ref ${normalizeString(webhookBody.referenceCode) || '-'}. Tx ${normalizeString(webhookBody.id) || '-'}.`;

    await execute(
      connection,
      `
        UPDATE orders
        SET
          payment_status = 'paid',
          order_status = ?,
          paid_at = COALESCE(paid_at, ?, NOW())
        WHERE id = ?
      `,
      [nextOrderStatus, paidAt, order.id],
    );

    await execute(
      connection,
      `
        INSERT INTO order_status_histories (
          order_id,
          status,
          note,
          changed_by_user_id
        )
        VALUES (?, ?, ?, NULL)
      `,
      [order.id, nextOrderStatus, paymentNote],
    );

    await connection.commit();

    return NextResponse.json({
      received: true,
      orderNumber,
      status: 'paid',
    });
  } catch (error) {
    await connection.rollback();
    console.error('SePay webhook error:', error);
    return NextResponse.json({ message: 'Không thể cập nhật thanh toán.' }, { status: 500 });
  } finally {
    connection.release();
  }
}
