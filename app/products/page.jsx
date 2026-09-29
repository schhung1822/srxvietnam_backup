import ProductListPage from '../../src/views/shop/ProductListMinimalPage.jsx';
import { getProductPageBanners } from '../../src/lib/server/banners.js';
import {
  getCatalogProducts,
  getProductTagDictionaryEntries,
} from '../../src/lib/server/products.js';
import { buildMetadata } from '../../src/lib/seo.js';

export const dynamic = 'force-dynamic';

export const metadata = buildMetadata({
  title: 'Sản phẩm SRX chính hãng - Serum, kem dưỡng phục hồi da',
  description:
    'Mua sản phẩm SRX chính hãng: serum, gel phục hồi da, kem Retinol, peel sinh học, chống nắng, mặt nạ cho da mụn, da nhạy cảm. Giao hàng toàn quốc.',
  path: '/products',
  keywords: [
    'sản phẩm SRX',
    'mua SRX chính hãng',
    'mỹ phẩm phục hồi da',
    'sản phẩm trị mụn SRX',
    'dược mỹ phẩm SRX Việt Nam',
    'SRX',
    'serum phục hồi da',
    'kem Retinol',
    'peel da sinh học',
    'kem chống nắng nâng tông',
    'mặt nạ phục hồi da',
    'mỹ phẩm cho da nhạy cảm',
  ],
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
  const [products, dictionaryEntries, heroBanners] = await Promise.all([
    getCatalogProducts(),
    getProductTagDictionaryEntries(),
    getProductPageBanners(),
  ]);

  return (
    <ProductListPage
      products={products}
      dictionaryEntries={dictionaryEntries}
      initialTagSlug={initialTagSlug}
      initialCategory={initialCategory}
      heroBanners={heroBanners}
    />
  );
}
