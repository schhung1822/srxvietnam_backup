import { NextResponse } from 'next/server';
import { searchCatalogProducts } from '../../../../../src/lib/server/products.js';

export const runtime = 'nodejs';

function normalizeLimit(value) {
  const parsedValue = Number.parseInt(value ?? '5', 10);

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return 5;
  }

  return Math.min(parsedValue, 12);
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') ?? '';
    const limit = normalizeLimit(searchParams.get('limit'));
    const products = await searchCatalogProducts(query, limit);

    return NextResponse.json({
      products: products.map((product) => ({
        id: product.id,
        slug: product.slug,
        name: product.name,
        brand: product.brand,
        category: product.category,
        price: product.price,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error.message ?? 'Không thể tải danh sách sản phẩm.',
        products: [],
      },
      { status: 500 },
    );
  }
}
