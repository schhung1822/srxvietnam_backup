export const SITE_NAME = 'SRX Việt Nam';
export const SITE_URL = 'https://srxvietnam.com';
export const DEFAULT_DESCRIPTION =
  'SRX Việt Nam mang công nghệ sinh học tiên tiến đến gần hơn với làn da Việt bằng hệ sản phẩm chăm sóc da chính hãng, an toàn và chuyên sâu.';
export const DEFAULT_KEYWORDS = [
  'SRX Việt Nam',
  'SRX',
  'mỹ phẩm SRX',
  'chăm sóc da',
  'skincare',
  'dược mỹ phẩm',
  'sản phẩm SRX',
  'thành phần SRX',
];
export const DEFAULT_OG_IMAGE = '/assets/images/seo.webp';
export const CONTACT_PHONE = '+84903010692';
export const CONTACT_EMAIL = 'eacgroup.vn@gmail.com';
export const COMPANY_LEGAL_NAME = 'Công ty TNHH Xuất Nhập Khẩu Toàn Diện EAC';
export const COMPANY_ADDRESS = {
  streetAddress: '58 Phước Hưng, Phường 8',
  addressLocality: 'Quận 5',
  addressRegion: 'TP. Hồ Chí Minh',
  addressCountry: 'VN',
};
export const SOCIAL_LINKS = [
  'https://www.facebook.com/srxvnofficial',
  'https://www.tiktok.com/@srxvietnam',
  'https://zalo.me/4112137101220932811',
  'https://shopee.vn/srxvietnam',
];

function stripHtml(value = '') {
  return String(value ?? '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildTitle(title) {
  const normalizedTitle = String(title ?? '').trim();

  if (!normalizedTitle || normalizedTitle === SITE_NAME) {
    return SITE_NAME;
  }

  return `${normalizedTitle} | ${SITE_NAME}`;
}

function toKeywordList(keywords) {
  if (Array.isArray(keywords)) {
    return keywords.map((keyword) => String(keyword ?? '').trim()).filter(Boolean);
  }

  return String(keywords ?? '')
    .split(',')
    .map((keyword) => keyword.trim())
    .filter(Boolean);
}

function uniqueValues(values) {
  return [...new Set(values.filter(Boolean))];
}

function toIsoDate(value) {
  if (!value) {
    return undefined;
  }

  const parsedDate = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return undefined;
  }

  return parsedDate.toISOString();
}

function compactObject(object) {
  return Object.fromEntries(
    Object.entries(object).filter(([, value]) => {
      if (value === undefined || value === null) {
        return false;
      }

      if (Array.isArray(value)) {
        return value.length > 0;
      }

      return true;
    }),
  );
}

export function absoluteUrl(path = '/') {
  const normalizedPath = String(path ?? '').trim();

  if (!normalizedPath) {
    return SITE_URL;
  }

  if (/^https?:\/\//i.test(normalizedPath)) {
    return normalizedPath;
  }

  const pathname = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`;
  return new URL(pathname, SITE_URL).toString();
}

export function buildRobots(noIndex = false) {
  if (noIndex) {
    return {
      index: false,
      follow: false,
      nocache: true,
      googleBot: {
        index: false,
        follow: false,
        noimageindex: true,
        'max-snippet': 0,
        'max-image-preview': 'none',
        'max-video-preview': 0,
      },
    };
  }

  return {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  };
}

export function buildMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path = '/',
  keywords = [],
  image = DEFAULT_OG_IMAGE,
  imageAlt,
  type = 'website',
  noIndex = false,
  publishedTime,
  modifiedTime,
  section,
} = {}) {
  const fullTitle = buildTitle(title);
  const finalDescription = String(description ?? DEFAULT_DESCRIPTION).trim() || DEFAULT_DESCRIPTION;
  const finalPath = String(path ?? '/').trim() || '/';
  const finalImage = absoluteUrl(image || DEFAULT_OG_IMAGE);
  const mergedKeywords = uniqueValues([...DEFAULT_KEYWORDS, ...toKeywordList(keywords)]);
  const openGraph = compactObject({
    title: fullTitle,
    description: finalDescription,
    url: absoluteUrl(finalPath),
    siteName: SITE_NAME,
    locale: 'vi_VN',
    type,
    images: [
      {
        url: finalImage,
        alt: imageAlt || fullTitle,
      },
    ],
    publishedTime: type === 'article' ? toIsoDate(publishedTime) : undefined,
    modifiedTime: type === 'article' ? toIsoDate(modifiedTime ?? publishedTime) : undefined,
    section,
  });

  return {
    title: fullTitle,
    description: finalDescription,
    keywords: mergedKeywords,
    alternates: {
      canonical: finalPath,
    },
    openGraph,
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: finalDescription,
      images: [finalImage],
    },
    robots: buildRobots(noIndex),
    category: 'beauty',
  };
}

export function createOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': absoluteUrl('/#organization'),
    name: SITE_NAME,
    legalName: COMPANY_LEGAL_NAME,
    url: SITE_URL,
    logo: absoluteUrl('/assets/images/header/logo_primary.webp'),
    image: absoluteUrl(DEFAULT_OG_IMAGE),
    description: DEFAULT_DESCRIPTION,
    email: CONTACT_EMAIL,
    telephone: CONTACT_PHONE,
    address: {
      '@type': 'PostalAddress',
      ...COMPANY_ADDRESS,
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        telephone: CONTACT_PHONE,
        email: CONTACT_EMAIL,
        areaServed: 'VN',
        availableLanguage: ['vi'],
      },
    ],
    sameAs: SOCIAL_LINKS,
  };
}

export function createWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': absoluteUrl('/#website'),
    url: SITE_URL,
    name: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    inLanguage: 'vi-VN',
    publisher: {
      '@id': absoluteUrl('/#organization'),
    },
  };
}

export function createBreadcrumbSchema(items = []) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path ?? item.url ?? '/'),
    })),
  };
}

export function createProductSchema(product) {
  const productUrl = absoluteUrl(`/products/${product.slug}`);
  const images = uniqueValues([
    ...(product.gallery ?? []).map((entry) => absoluteUrl(entry.image)),
    product.infoImage ? absoluteUrl(product.infoImage) : null,
  ]);
  const offers = (product.variants ?? []).map((variant) =>
    compactObject({
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'VND',
      price: Number(variant.price ?? product.price ?? 0).toString(),
      availability:
        Number(variant.stock ?? 0) > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      sku: variant.sku ?? undefined,
    }),
  );
  const additionalProperty = [
    ...(product.skinTypes ?? []).map((value) => ({
      '@type': 'PropertyValue',
      name: 'Loại da',
      value,
    })),
    ...(product.concerns ?? []).map((value) => ({
      '@type': 'PropertyValue',
      name: 'Nhu cầu',
      value,
    })),
  ];

  return compactObject({
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${productUrl}#product`,
    name: product.name,
    description: stripHtml(product.shortDescription || product.description || DEFAULT_DESCRIPTION),
    image: images.length ? images : [absoluteUrl(DEFAULT_OG_IMAGE)],
    url: productUrl,
    sku: product.variants?.find((variant) => variant.isDefault)?.sku ?? product.variants?.[0]?.sku,
    brand: {
      '@type': 'Brand',
      name: product.brand || SITE_NAME,
    },
    category: product.category || undefined,
    aggregateRating:
      Number(product.rating ?? 0) > 0 && Number(product.reviewCount ?? 0) > 0
        ? {
            '@type': 'AggregateRating',
            ratingValue: Number(product.rating).toFixed(1),
            reviewCount: Number(product.reviewCount).toString(),
          }
        : undefined,
    offers: offers.length === 1 ? offers[0] : offers,
    additionalProperty,
  });
}

export function createArticleSchema(article) {
  const articleUrl = absoluteUrl(`/follow-srx/${article.slug}`);

  return compactObject({
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${articleUrl}#article`,
    headline: article.title,
    description: article.excerpt || DEFAULT_DESCRIPTION,
    image: [absoluteUrl(article.coverImage || DEFAULT_OG_IMAGE)],
    url: articleUrl,
    mainEntityOfPage: articleUrl,
    datePublished: toIsoDate(article.publishedAt),
    dateModified: toIsoDate(article.publishedAt),
    articleSection: article.category || undefined,
    keywords: (article.tags ?? []).join(', ') || undefined,
    inLanguage: 'vi-VN',
    author: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      '@id': absoluteUrl('/#organization'),
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: absoluteUrl('/assets/images/header/logo_primary.webp'),
      },
    },
  });
}
