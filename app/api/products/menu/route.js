import { NextResponse } from 'next/server';
import { getCatalogProducts } from '../../../../src/lib/server/products.js';

export const runtime = 'nodejs';

function uniqueInOrder(values) {
  const seen = new Set();

  return values.filter((value) => {
    const normalized = String(value ?? '').trim().toLowerCase();

    if (!normalized || seen.has(normalized)) {
      return false;
    }

    seen.add(normalized);
    return true;
  });
}

function shuffle(values) {
  const next = [...values];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[randomIndex]] = [next[randomIndex], next[index]];
  }

  return next;
}

function buildMenuProduct(product) {
  return {
    name: product.name,
    slug: product.slug,
    path: `/products/${product.slug}`,
    category: product.category,
    image: product.gallery?.[0]?.image || product.infoImage || '',
  };
}

export async function GET() {
  try {
    const products = await getCatalogProducts();

    return NextResponse.json({
      shopPath: '/products',
      categories: uniqueInOrder(products.map((product) => product.category)),
      featuredProducts: shuffle(products).slice(0, 2).map(buildMenuProduct),
    });
  } catch (error) {
    console.error('Product menu API error:', error);

    return NextResponse.json({
      shopPath: '/products',
      categories: [],
      featuredProducts: [],
    });
  }
}
