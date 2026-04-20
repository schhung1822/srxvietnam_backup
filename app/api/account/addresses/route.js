import { NextResponse } from 'next/server';
import { getAuthenticatedUserRow } from '../../../../src/lib/server/account.js';
import { query } from '../../../../src/lib/server/db.js';

export const runtime = 'nodejs';

const ADDRESS_LIMIT = 5;

function normalizeString(value) {
  return String(value ?? '').trim();
}

function normalizeOptionalString(value) {
  const nextValue = normalizeString(value);
  return nextValue || null;
}

function normalizeAddressPayload(body) {
  const province = normalizeString(body.province);
  const ward = normalizeOptionalString(body.ward);

  return {
    label: normalizeOptionalString(body.label),
    recipientName: normalizeString(body.recipientName),
    recipientPhone: normalizeString(body.recipientPhone),
    province,
    district: normalizeString(body.district || ward || province),
    ward,
    addressLine: normalizeString(body.addressLine),
    postalCode: null,
    isDefault: Boolean(body.isDefault),
  };
}

function validateAddressPayload(address) {
  if (address.recipientName.length < 2) {
    throw new Error('Vui long nhap ten nguoi nhan hop le.');
  }

  if (address.recipientPhone.length < 8) {
    throw new Error('Vui long nhap so dien thoai hop le.');
  }

  if (address.province.length < 2) {
    throw new Error('Vui long nhap tinh/thanh pho.');
  }

  if (address.addressLine.length < 6) {
    throw new Error('Vui long nhap dia chi cu the day du hon.');
  }
}

function formatAddress(row) {
  return {
    id: row.id,
    label: row.label,
    recipientName: row.recipient_name,
    recipientPhone: row.recipient_phone,
    countryCode: row.country_code,
    province: row.province,
    district: row.district,
    ward: row.ward,
    addressLine: row.address_line,
    postalCode: row.postal_code,
    isDefault: Boolean(row.is_default),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function fetchAddressesByUserId(userId) {
  const rows = await query(
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
        is_default,
        created_at,
        updated_at
      FROM user_addresses
      WHERE user_id = ?
      ORDER BY is_default DESC, updated_at DESC, id DESC
    `,
    [userId],
  );

  return rows.map(formatAddress);
}

export async function GET(request) {
  try {
    const user = await getAuthenticatedUserRow(request);

    if (!user) {
      return NextResponse.json({ message: 'Vui long dang nhap de tiep tuc.' }, { status: 401 });
    }

    return NextResponse.json({
      limit: ADDRESS_LIMIT,
      addresses: await fetchAddressesByUserId(user.id),
    });
  } catch (error) {
    console.error('List addresses error:', error);
    return NextResponse.json(
      { message: 'Khong the tai danh sach dia chi giao hang.' },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const user = await getAuthenticatedUserRow(request);

    if (!user) {
      return NextResponse.json({ message: 'Vui long dang nhap de tiep tuc.' }, { status: 401 });
    }

    const body = await request.json();
    const address = normalizeAddressPayload(body);
    validateAddressPayload(address);

    const countRows = await query(
      `
        SELECT COUNT(*) AS total
        FROM user_addresses
        WHERE user_id = ?
      `,
      [user.id],
    );
    const currentCount = Number(countRows[0]?.total ?? 0);

    if (currentCount >= ADDRESS_LIMIT) {
      return NextResponse.json(
        { message: `Ban chi co the luu toi da ${ADDRESS_LIMIT} dia chi giao hang.` },
        { status: 400 },
      );
    }

    const shouldSetDefault = address.isDefault || currentCount === 0;

    if (shouldSetDefault) {
      await query(`UPDATE user_addresses SET is_default = 0 WHERE user_id = ?`, [user.id]);
    }

    const insertResult = await query(
      `
        INSERT INTO user_addresses (
          user_id,
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
        )
        VALUES (?, ?, ?, ?, 'VN', ?, ?, ?, ?, ?, ?)
      `,
      [
        user.id,
        address.label,
        address.recipientName,
        address.recipientPhone,
        address.province,
        address.district,
        address.ward,
        address.addressLine,
        address.postalCode,
        shouldSetDefault ? 1 : 0,
      ],
    );

    const createdRows = await query(
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
          is_default,
          created_at,
          updated_at
        FROM user_addresses
        WHERE id = ?
        LIMIT 1
      `,
      [insertResult.insertId],
    );

    return NextResponse.json(
      {
        message: 'Da them dia chi giao hang.',
        limit: ADDRESS_LIMIT,
        address: formatAddress(createdRows[0]),
        addresses: await fetchAddressesByUserId(user.id),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Create address error:', error);

    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'Khong the them dia chi giao hang.' }, { status: 500 });
  }
}
