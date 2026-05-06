import ProductListPage from '../../src/views/shop/ProductListMinimalPage.jsx';
import {
  getCatalogProducts,
  getProductTagDictionaryEntries,
} from '../../src/lib/server/products.js';
import { buildMetadata } from '../../src/lib/seo.js';

export const dynamic = 'force-dynamic';

export const metadata = buildMetadata({
  title: 'Sản phẩm',
  description:
    'Khám phá danh mục sản phẩm chăm sóc da chính hãng của SRX Việt Nam dành cho nhiều nhu cầu làn da.',
  path: '/products',
});

function readSearchParam(value) {
  if (Array.isArray(value)) {
    return String(value[0] ?? '').trim();
  }

  return String(value ?? '').trim();
}

export default async function ProductsPage({ searchParams }) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const initialTagSlug = readSearchParam(resolvedSearchParams.tag);
  const initialCategory = readSearchParam(resolvedSearchParams.category);
  const [products, dictionaryEntries] = await Promise.all([
    getCatalogProducts(),
    getProductTagDictionaryEntries(),
  ]);

  return (
    <ProductListPage
      products={products}
      dictionaryEntries={dictionaryEntries}
      initialTagSlug={initialTagSlug}
      initialCategory={initialCategory}
    />
  );
}
