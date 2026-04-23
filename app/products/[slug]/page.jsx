import { notFound } from 'next/navigation';
import ProductDetailPage from '../../../src/views/shop/ProductDetailMinimalPage.jsx';
import { getRelatedProducts } from '../../../src/lib/products/catalog.js';
import {
  getCatalogProductBySlug,
  getCatalogProducts,
} from '../../../src/lib/server/products.js';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const product = await getCatalogProductBySlug(params.slug);

  if (!product) {
    return {
      title: 'Không tìm thấy sản phẩm | SRX Beauty',
    };
  }

  return {
    title: `${product.name} | SRX Beauty`,
    description: product.shortDescription,
  };
}

export default async function ProductDetailRoute({ params }) {
  const [product, products] = await Promise.all([
    getCatalogProductBySlug(params.slug),
    getCatalogProducts(),
  ]);

  if (!product) {
    notFound();
  }

  const relatedProducts = getRelatedProducts(products, product);

  return <ProductDetailPage product={product} relatedProducts={relatedProducts} />;
}
