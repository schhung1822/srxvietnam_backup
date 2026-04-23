/* eslint-disable react-refresh/only-export-components */
import ProductListPage from '../../src/views/shop/ProductListMinimalPage.jsx';
import { getCatalogProducts } from '../../src/lib/server/products.js';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Sản phẩm | SRX Beauty',
  description: 'Hành trình đưa công nghệ sinh học đến gần hơn với làn da Việt.',
};

export default async function ProductsPage() {
  const products = await getCatalogProducts();

  return <ProductListPage products={products} />;
}

