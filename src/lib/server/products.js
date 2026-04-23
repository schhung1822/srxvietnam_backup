import { cache } from 'react';
import { getMissingDatabaseEnvNames, hasDatabaseConfig, query } from './db.js';

let hasWarnedAboutMissingDbConfig = false;

const SKIN_TYPE_LABELS = {
  normal: 'Da thường',
  dry: 'Da khô',
  oily: 'Da dầu',
  combination: 'Da hỗn hợp',
  sensitive: 'Da nhạy cảm',
};

const CONCERN_LABELS = {
  hydration: 'Cấp ẩm',
  'barrier-repair': 'Phục hồi',
  soothing: 'Làm dịu',
  'after-treatment': 'Sau treatment',
  regeneration: 'Tái tạo da',
  'anti-aging': 'Chống lão hóa',
  brightening: 'Làm sáng da',
  'oil-control': 'Kiểm soát dầu',
  'uv-protection': 'Bảo vệ UV',
  acne: 'Mụn',
};

function createPlaceholders(values) {
  return values.map(() => '?').join(', ');
}

function shouldUseFallbackProducts() {
  if (hasDatabaseConfig()) {
    return false;
  }

  if (!hasWarnedAboutMissingDbConfig) {
    hasWarnedAboutMissingDbConfig = true;
    console.warn(
      `Database env is missing (${getMissingDatabaseEnvNames().join(', ')}). Catalog data will be empty until DB is configured.`,
    );
  }

  return true;
}

function splitCommaList(value) {
  return String(value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitTextSteps(value) {
  const rawValue = String(value ?? '').trim();

  if (!rawValue) {
    return [];
  }

  if (rawValue.includes('\n')) {
    return rawValue
      .split(/\r?\n+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return rawValue
    .split(/(?:\.\s+|•\s*)/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function uniqueInOrder(values) {
  const seen = new Set();

  return values.filter((value) => {
    if (!value || seen.has(value)) {
      return false;
    }

    seen.add(value);
    return true;
  });
}

function formatAttributeLabel(attributeCode, attributeSlug, attributeValue) {
  if (attributeCode === 'skin_type') {
    return SKIN_TYPE_LABELS[attributeSlug] ?? attributeValue;
  }

  if (attributeCode === 'concern') {
    return CONCERN_LABELS[attributeSlug] ?? attributeValue;
  }

  return attributeValue;
}

function buildGallery({ productRow, imageRows }) {
  const sourceImages = imageRows.length
    ? imageRows
    : productRow.thumbnail_url
      ? [
          {
            image_url: productRow.thumbnail_url,
            alt_text: productRow.name,
          },
        ]
      : [];

  return sourceImages.slice(0, 6).map((imageRow, index) => ({
    id: `image-${index + 1}`,
    title: imageRow.alt_text ?? `Ảnh ${index + 1}`,
    image: imageRow.image_url,
    alt: imageRow.alt_text ?? `${productRow.name} - Ảnh ${index + 1}`,
    eyebrow: index === 0 ? productRow.short_description ?? productRow.name : productRow.name,
    isPrimary: Boolean(imageRow.is_primary),
  }));
}

function buildHighlights({ productRow, ingredients, howToUse, variantLabels }) {
  const highlights = [
    {
      title: 'Điểm nổi bật',
      description: productRow.short_description ?? productRow.description ?? '',
    },
    {
      title: 'Thành phần chính',
      description: ingredients.length
        ? `Các thành phần nổi bật: ${ingredients.slice(0, 5).join(', ')}.`
        : '',
    },
    {
      title: 'Phiên bản & cách dùng',
      description: [
        variantLabels.length ? `Phiên bản: ${variantLabels.join(', ')}.` : '',
        howToUse[0] ? `Gợi ý sử dụng: ${howToUse[0]}.` : '',
      ]
        .filter(Boolean)
        .join(' '),
    },
  ];

  return highlights.filter((highlight) => highlight.description.trim().length > 0);
}

function buildSpecs({ productRow, defaultVariant, variantLabels, totalStock }) {
  return [
    {
      label: 'Danh mục',
      value: productRow.category_name ?? 'Sản phẩm',
    },
    {
      label: 'Thương hiệu',
      value: productRow.brand_name ?? 'SRX',
    },
    {
      label: 'Phiên bản',
      value: variantLabels.join(', ') || 'Tiêu chuẩn',
    },
    {
      label: 'SKU mặc định',
      value: defaultVariant?.sku ?? productRow.product_code,
    },
    {
      label: 'Tồn kho',
      value: `${totalStock} sản phẩm`,
    },
  ];
}

function mapVariant(variantRow, fallbackPrice, fallbackOriginalPrice) {
  const originalPrice = Number(variantRow.price ?? fallbackOriginalPrice ?? fallbackPrice ?? 0);
  const salePrice = Number(variantRow.sale_price ?? variantRow.price ?? fallbackPrice ?? 0);

  return {
    id: variantRow.id,
    label: variantRow.variant_name ?? variantRow.sku ?? 'Mặc định',
    price: salePrice,
    originalPrice,
    stock: Number(variantRow.stock_quantity ?? 0),
    sku: variantRow.sku ?? null,
    isDefault: Boolean(variantRow.is_default),
  };
}

function mapProduct(productRow, variantRows, imageRows, attributeRows) {
  const basePrice = Number(productRow.base_price ?? 0);
  const salePrice = Number(productRow.sale_price ?? productRow.base_price ?? 0);
  const variants = variantRows.length
    ? variantRows.map((variantRow) => mapVariant(variantRow, salePrice, basePrice))
    : [
        {
          id: `${productRow.slug}-default`,
          label: 'Tiêu chuẩn',
          price: salePrice,
          originalPrice: basePrice,
          stock: 0,
          sku: productRow.product_code,
          isDefault: true,
        },
      ];
  const defaultVariant =
    variants.find((variant) => variant.isDefault) ??
    variants[0];
  const variantLabels = uniqueInOrder(variants.map((variant) => variant.label));
  const ingredients = splitCommaList(productRow.ingredient_list);
  const howToUse = splitTextSteps(productRow.usage_instructions);
  const skinTypes = uniqueInOrder(
    attributeRows
      .filter((row) => row.attribute_code === 'skin_type')
      .map((row) => formatAttributeLabel(row.attribute_code, row.attribute_slug, row.attribute_value)),
  );
  const concerns = uniqueInOrder(
    attributeRows
      .filter((row) => row.attribute_code === 'concern')
      .map((row) => formatAttributeLabel(row.attribute_code, row.attribute_slug, row.attribute_value)),
  );
  const totalStock = variants.reduce((sum, variant) => sum + Number(variant.stock ?? 0), 0);
  const gallery = buildGallery({ productRow, imageRows });

  return {
    id: Number(productRow.id),
    slug: productRow.slug,
    name: productRow.name,
    brand: productRow.brand_name ?? 'SRX',
    category: productRow.category_name ?? 'Sản phẩm',
    subcategory: productRow.category_name ?? 'Sản phẩm',
    price: Number(defaultVariant.price ?? salePrice),
    originalPrice: Number(defaultVariant.originalPrice ?? basePrice),
    rating: Number(productRow.rating_average ?? 0),
    reviewCount: Number(productRow.rating_count ?? 0),
    soldCount: Number(productRow.sold_count ?? 0),
    badge: productRow.is_featured ? 'Nổi bật' : '',
    promoLabel: defaultVariant.label,
    shortDescription: productRow.short_description ?? '',
    description: productRow.description ?? productRow.short_description ?? '',
    searchKeywords: uniqueInOrder([
      productRow.product_code,
      productRow.brand_name,
      productRow.category_name,
      ...ingredients,
      ...concerns,
      ...skinTypes,
      ...variantLabels,
    ]),
    skinTypes,
    concerns,
    swatches: [],
    variants,
    specs: buildSpecs({
      productRow,
      defaultVariant,
      variantLabels,
      totalStock,
    }),
    highlights: buildHighlights({
      productRow,
      ingredients,
      howToUse,
      variantLabels,
    }),
    ingredients,
    howToUse: howToUse.length
      ? howToUse
      : productRow.short_description
        ? [productRow.short_description]
        : [],
    gallery,
  };
}

async function fetchProductResources(productIds) {
  if (!productIds.length) {
    return {
      variantsByProductId: new Map(),
      imagesByProductId: new Map(),
      attributesByProductId: new Map(),
    };
  }

  const placeholders = createPlaceholders(productIds);

  const [variantRows, imageRows, attributeRows] = await Promise.all([
    query(
      `
        SELECT
          id,
          product_id,
          sku,
          variant_name,
          price,
          sale_price,
          stock_quantity,
          is_default
        FROM product_variants
        WHERE product_id IN (${placeholders})
          AND status = 'active'
        ORDER BY product_id ASC, is_default DESC, id ASC
      `,
      productIds,
    ),
    query(
      `
        SELECT
          product_id,
          image_url,
          alt_text,
          sort_order,
          is_primary
        FROM product_images
        WHERE product_id IN (${placeholders})
        ORDER BY product_id ASC, is_primary DESC, sort_order ASC, id ASC
      `,
      productIds,
    ),
    query(
      `
        SELECT
          pav.product_id,
          a.code AS attribute_code,
          av.slug AS attribute_slug,
          av.value AS attribute_value
        FROM product_attribute_values pav
        INNER JOIN attributes a
          ON a.id = pav.attribute_id
        LEFT JOIN attribute_values av
          ON av.id = pav.attribute_value_id
        WHERE pav.product_id IN (${placeholders})
        ORDER BY pav.product_id ASC, a.sort_order ASC, av.sort_order ASC, pav.id ASC
      `,
      productIds,
    ),
  ]);

  const variantsByProductId = new Map();
  const imagesByProductId = new Map();
  const attributesByProductId = new Map();

  variantRows.forEach((row) => {
    const productId = Number(row.product_id);
    const currentRows = variantsByProductId.get(productId) ?? [];
    currentRows.push(row);
    variantsByProductId.set(productId, currentRows);
  });

  imageRows.forEach((row) => {
    const productId = Number(row.product_id);
    const currentRows = imagesByProductId.get(productId) ?? [];
    currentRows.push(row);
    imagesByProductId.set(productId, currentRows);
  });

  attributeRows.forEach((row) => {
    const productId = Number(row.product_id);
    const currentRows = attributesByProductId.get(productId) ?? [];
    currentRows.push(row);
    attributesByProductId.set(productId, currentRows);
  });

  return {
    variantsByProductId,
    imagesByProductId,
    attributesByProductId,
  };
}

export const getCatalogProducts = cache(async () => {
  if (shouldUseFallbackProducts()) {
    return [];
  }

  try {
    const productRows = await query(`
      SELECT
        p.id,
        p.name,
        p.slug,
        p.product_code,
        p.short_description,
        p.description,
        p.usage_instructions,
        p.ingredient_list,
        p.base_price,
        p.sale_price,
        p.thumbnail_url,
        p.rating_average,
        p.rating_count,
        p.sold_count,
        p.is_featured,
        c.slug AS category_slug,
        c.name AS category_name,
        b.slug AS brand_slug,
        b.name AS brand_name
      FROM products p
      LEFT JOIN product_categories c
        ON c.id = p.category_id
      LEFT JOIN brands b
        ON b.id = p.brand_id
      WHERE p.status = 'active'
        AND p.deleted_at IS NULL
      ORDER BY p.is_featured DESC, COALESCE(p.published_at, p.created_at) DESC, p.id DESC
    `);

    const productIds = productRows.map((row) => Number(row.id));
    const { variantsByProductId, imagesByProductId, attributesByProductId } =
      await fetchProductResources(productIds);

    return productRows.map((productRow) =>
      mapProduct(
        productRow,
        variantsByProductId.get(Number(productRow.id)) ?? [],
        imagesByProductId.get(Number(productRow.id)) ?? [],
        attributesByProductId.get(Number(productRow.id)) ?? [],
      ),
    );
  } catch (error) {
    console.error('Failed to load catalog products from database:', error);
    return [];
  }
});

export async function getCatalogProductBySlug(slug) {
  if (!slug) {
    return null;
  }

  if (shouldUseFallbackProducts()) {
    return null;
  }

  const products = await getCatalogProducts();
  return products.find((product) => product.slug === slug) ?? null;
}

export async function searchCatalogProducts(term = '', limit = 5) {
  const loweredTerm = term.trim().toLowerCase();
  const products = await getCatalogProducts();
  const filteredProducts = loweredTerm
    ? products.filter((product) =>
        [
          product.name,
          product.brand,
          product.category,
          ...product.searchKeywords,
        ].some((field) => String(field ?? '').toLowerCase().includes(loweredTerm)),
      )
    : products;

  return filteredProducts.slice(0, Math.max(1, limit));
}




