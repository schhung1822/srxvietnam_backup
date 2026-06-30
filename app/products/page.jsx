import ProductListPage from '../../src/views/shop/ProductListMinimalPage.jsx';
import { getProductPageBanners } from '../../src/lib/server/banners.js';
import {
  getCatalogProducts,
  getProductTagDictionaryEntries,
} from '../../src/lib/server/products.js';
import { buildMetadata } from '../../src/lib/seo.js';

export const dynamic = 'force-dynamic';

export const metadata = buildMetadata({
  title: 'Sản phẩm SRX chính hãng',
  description:
    'Khám phá danh mục sản phẩm SRX chính hãng cho phục hồi da, hỗ trợ xử lý mụn, làm sáng da và chăm sóc da chuyên sâu tại SRX Việt Nam.',
  path: '/products',
  keywords: [
    'sản phẩm SRX',
    'mua SRX chính hãng',
    'mỹ phẩm phục hồi da',
    'sản phẩm trị mụn SRX',
    'dược mỹ phẩm SRX Việt Nam',
    'SRX',
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
