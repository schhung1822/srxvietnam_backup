import { notFound } from 'next/navigation';
import ProductListPage from '../../../src/views/shop/ProductListMinimalPage.jsx';
import ProductDetailPage from '../../../src/views/shop/ProductDetailMinimalPage.jsx';
import JsonLd from '../../../src/components/SEO/JsonLd.jsx';
import { getRelatedProducts } from '../../../src/lib/products/catalog.js';
import {
  getCatalogProductBySlug,
  getCatalogProducts,
  getProductTagDictionaryEntries,
} from '../../../src/lib/server/products.js';
import {
  buildMetadata,
  createBreadcrumbSchema,
  createProductSchema,
} from '../../../src/lib/seo.js';

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
    return buildMetadata({
      title: product.name,
      description: product.shortDescription || product.description,
      path: `/products/${slug}`,
      image: product.gallery?.[0]?.image || product.infoImage,
      keywords: [product.name, product.brand, product.category, ...(product.ingredients ?? [])],
    });
  }

  const tagEntry = findTagEntryBySlug(dictionaryEntries, slug);

  if (tagEntry) {
    return buildMetadata({
      title: tagEntry.name,
      description:
        String(tagEntry.description ?? '').trim() ||
        `Khám phá các sản phẩm chứa thành phần ${tagEntry.name} tại SRX Việt Nam.`,
      path: `/products/${slug}`,
      image: tagEntry.image || undefined,
      keywords: [tagEntry.name, 'thành phần SRX', 'sản phẩm SRX'],
    });
  }

  return buildMetadata({
    title: 'Không tìm thấy sản phẩm',
    path: `/products/${slug}`,
    noIndex: true,
  });
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

    return (
      <>
        <JsonLd
          data={[
            createBreadcrumbSchema([
              { name: 'Trang chủ', path: '/' },
              { name: 'Sản phẩm', path: '/products' },
              { name: product.name, path: `/products/${product.slug}` },
            ]),
            createProductSchema(product),
          ]}
          idPrefix="product-seo"
        />
        <ProductDetailPage product={product} relatedProducts={relatedProducts} />
      </>
    );
  }

  const tagEntry = findTagEntryBySlug(dictionaryEntries, slug);

  if (tagEntry) {
    return (
      <>
        <JsonLd
          data={createBreadcrumbSchema([
            { name: 'Trang chủ', path: '/' },
            { name: 'Sản phẩm', path: '/products' },
            { name: tagEntry.name, path: `/products/${tagEntry.slug}` },
          ])}
          idPrefix="product-tag-seo"
        />
        <ProductListPage
          products={products}
          dictionaryEntries={dictionaryEntries}
          initialTagSlug={tagEntry.slug}
        />
      </>
    );
  }

  notFound();
}
