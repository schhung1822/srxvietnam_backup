import { notFound } from 'next/navigation';
import ProductListPage from '../../../src/views/shop/ProductListMinimalPage.jsx';
import ProductDetailPage from '../../../src/views/shop/ProductDetailMinimalPage.jsx';
import { getRelatedProducts } from '../../../src/lib/products/catalog.js';
import {
  getCatalogProductBySlug,
  getCatalogProducts,
  getProductTagDictionaryEntries,
} from '../../../src/lib/server/products.js';

export const dynamic = 'force-dynamic';

function findTagEntryBySlug(entries, slug) {
  const normalizedSlug = String(slug ?? '').trim();

  if (!normalizedSlug) {
    return null;
  }

  return entries.find((entry) => String(entry?.slug ?? '').trim() === normalizedSlug) ?? null;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const [product, dictionaryEntries] = await Promise.all([
    getCatalogProductBySlug(slug),
    getProductTagDictionaryEntries(),
  ]);

  if (product) {
    return {
      title: `${product.name} | SRX Beauty`,
      description: product.shortDescription,
    };
  }

  const tagEntry = findTagEntryBySlug(dictionaryEntries, slug);

  if (tagEntry) {
    return {
      title: `${tagEntry.name} | SRX Beauty`,
      description:
        String(tagEntry.description ?? '').trim() ||
        `Khám phá các sản phẩm chứa thành phần ${tagEntry.name}.`,
    };
  }

  return {
    title: 'Không tìm thấy sản phẩm | SRX Beauty',
  };
}

export default async function ProductDetailRoute({ params }) {
  const { slug } = await params;
  const [product, products, dictionaryEntries] = await Promise.all([
    getCatalogProductBySlug(slug),
    getCatalogProducts(),
    getProductTagDictionaryEntries(),
  ]);

  if (product) {
    const relatedProducts = getRelatedProducts(products, product, 4);

    return <ProductDetailPage product={product} relatedProducts={relatedProducts} />;
  }

  const tagEntry = findTagEntryBySlug(dictionaryEntries, slug);

  if (tagEntry) {
    return (
      <ProductListPage
        products={products}
        dictionaryEntries={dictionaryEntries}
        initialTagSlug={tagEntry.slug}
      />
    );
  }

  notFound();
}
