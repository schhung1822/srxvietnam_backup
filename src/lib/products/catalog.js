export const priceOptions = [
  { id: 'all', label: 'Tất cả mức giá' },
  { id: 'under-300', label: 'Dưới 300.000đ' },
  { id: '300-400', label: '300.000đ - 400.000đ' },
  { id: '400-500', label: '400.000đ - 500.000đ' },
  { id: 'over-500', label: 'Trên 500.000đ' },
];

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

export function matchesPrice(product, priceId) {
  if (priceId === 'all') {
    return true;
  }

  if (priceId === 'under-300') {
    return product.price < 300000;
  }

  if (priceId === '300-400') {
    return product.price >= 300000 && product.price <= 400000;
  }

  if (priceId === '400-500') {
    return product.price > 400000 && product.price <= 500000;
  }

  return product.price > 500000;
}

export function sortProducts(products, sortBy) {
  const next = [...products];

  if (sortBy === 'price-asc') {
    next.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-desc') {
    next.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'rating') {
    next.sort((a, b) => b.rating - a.rating);
  } else if (sortBy === 'sold') {
    next.sort((a, b) => b.soldCount - a.soldCount);
  } else {
    next.sort((a, b) => b.id - a.id);
  }

  return next;
}

export function buildProductFilterOptions(products) {
  return {
    productCategories: ['Tất cả', ...uniqueInOrder(products.map((product) => product.category))],
    concernOptions: [
      'Tất cả',
      ...uniqueInOrder(products.flatMap((product) => product.concerns ?? [])),
    ],
    skinTypeOptions: [
      'Tất cả',
      ...uniqueInOrder(products.flatMap((product) => product.skinTypes ?? [])),
    ],
  };
}

export function getRelatedProducts(products, product, limit = 3) {
  const sameCategory = products.filter(
    (item) => item.slug !== product.slug && item.category === product.category,
  );

  if (sameCategory.length >= limit) {
    return sameCategory.slice(0, limit);
  }

  const fallback = products.filter(
    (item) =>
      item.slug !== product.slug &&
      !sameCategory.some((relatedProduct) => relatedProduct.slug === item.slug),
  );

  return [...sameCategory, ...fallback].slice(0, limit);
}
