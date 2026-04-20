import { NextResponse } from 'next/server';
import { getAuthenticatedUserRow } from '../../../../../src/lib/server/account.js';
import { query } from '../../../../../src/lib/server/db.js';

export const runtime = 'nodejs';

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

async function getOwnedAddress(userId, addressId) {
  const rows = await query(
    `
      SELECT
        id,
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
        is_default,
        created_at,
        updated_at
      FROM user_addresses
      WHERE id = ?
        AND user_id = ?
      LIMIT 1
    `,
    [addressId, userId],
  );

  return rows[0] ?? null;
}

function parseAddressId(params) {
  const addressId = Number(params?.addressId);
  return Number.isInteger(addressId) && addressId > 0 ? addressId : null;
}

export async function PATCH(request, { params }) {
  try {
    const user = await getAuthenticatedUserRow(request);

    if (!user) {
      return NextResponse.json({ message: 'Vui long dang nhap de tiep tuc.' }, { status: 401 });
    }

    const addressId = parseAddressId(params);

    if (!addressId) {
      return NextResponse.json({ message: 'Dia chi khong hop le.' }, { status: 400 });
    }

    const existingAddress = await getOwnedAddress(user.id, addressId);

    if (!existingAddress) {
      return NextResponse.json({ message: 'Khong tim thay dia chi can cap nhat.' }, { status: 404 });
    }

    const body = await request.json();
    const address = normalizeAddressPayload(body);
    validateAddressPayload(address);

    if (address.isDefault) {
      await query(`UPDATE user_addresses SET is_default = 0 WHERE user_id = ?`, [user.id]);
    }

    await query(
      `
        UPDATE user_addresses
        SET
          label = ?,
          recipient_name = ?,
          recipient_phone = ?,
          province = ?,
          district = ?,
          ward = ?,
          address_line = ?,
          postal_code = ?,
          is_default = ?,
          updated_at = NOW()
        WHERE id = ?
          AND user_id = ?
      `,
      [
        address.label,
        address.recipientName,
        address.recipientPhone,
        address.province,
        address.district,
        address.ward,
        address.addressLine,
        address.postalCode,
        address.isDefault || !existingAddress.is_default ? (address.isDefault ? 1 : 0) : 1,
        addressId,
        user.id,
      ],
    );

    const updatedAddress = await getOwnedAddress(user.id, addressId);

    return NextResponse.json({
      message: 'Da cap nhat dia chi giao hang.',
      address: formatAddress(updatedAddress),
      addresses: await fetchAddressesByUserId(user.id),
    });
  } catch (error) {
    console.error('Update address error:', error);

    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'Khong the cap nhat dia chi giao hang.' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await getAuthenticatedUserRow(request);

    if (!user) {
      return NextResponse.json({ message: 'Vui long dang nhap de tiep tuc.' }, { status: 401 });
    }

    const addressId = parseAddressId(params);

    if (!addressId) {
      return NextResponse.json({ message: 'Dia chi khong hop le.' }, { status: 400 });
    }

    const existingAddress = await getOwnedAddress(user.id, addressId);

    if (!existingAddress) {
      return NextResponse.json({ message: 'Khong tim thay dia chi can xoa.' }, { status: 404 });
    }

    await query(`DELETE FROM user_addresses WHERE id = ? AND user_id = ?`, [addressId, user.id]);

    if (existingAddress.is_default) {
      const remainingRows = await query(
        `
          SELECT id
          FROM user_addresses
          WHERE user_id = ?
          ORDER BY updated_at DESC, id DESC
          LIMIT 1
        `,
        [user.id],
      );

      if (remainingRows.length) {
        await query(`UPDATE user_addresses SET is_default = 1 WHERE id = ?`, [remainingRows[0].id]);
      }
    }

    return NextResponse.json({
      message: 'Da xoa dia chi giao hang.',
      addresses: await fetchAddressesByUserId(user.id),
    });
  } catch (error) {
    console.error('Delete address error:', error);
    return NextResponse.json({ message: 'Khong the xoa dia chi giao hang.' }, { status: 500 });
  }
}
