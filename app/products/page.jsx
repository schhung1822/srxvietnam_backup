import ProductListPage from '../../src/views/shop/ProductListMinimalPage.jsx';
import {
  getCatalogProducts,
  getProductTagDictionaryEntries,
} from '../../src/lib/server/products.js';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Sản phẩm | SRX Beauty',
  description: 'Hành trình đưa công nghệ sinh học đến gần hơn với làn da Việt.',
};

function readSearchParam(value) {
  if (Array.isArray(value)) {
    return String(value[0] ?? '').trim();
  }

  return String(value ?? '').trim();
}

export default async function ProductsPage({ searchParams }) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const initialTagSlug = readSearchParam(resolvedSearchParams.tag);
  const [products, dictionaryEntries] = await Promise.all([
    getCatalogProducts(),
    getProductTagDictionaryEntries(),
  ]);

  return (
    <ProductListPage
      products={products}
      dictionaryEntries={dictionaryEntries}
      initialTagSlug={initialTagSlug}
    />
  );
}
