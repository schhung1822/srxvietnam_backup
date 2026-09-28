'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);

const STORAGE_KEY = 'srx-cart';
// "Mua ngay" checks out a single product without touching the cart, so it lives apart from it.
const BUY_NOW_STORAGE_KEY = 'srx-buy-now';

function buildLineItem({ product, variant, quantity }) {
  const variantOptions = product.variants?.map((productVariant) => ({
    id: productVariant.id,
    label: productVariant.label,
    price: productVariant.price,
    originalPrice: productVariant.originalPrice ?? productVariant.price,
    sku: productVariant.sku ?? null,
  })) ?? [];

  return {
    lineId: `${product.slug}:${variant.id}`,
    productId: product.id,
    slug: product.slug,
    name: product.name,
    brand: product.brand,
    price: variant.price,
    originalPrice: variant.originalPrice ?? product.originalPrice ?? variant.price,
    quantity,
    variantId: variant.id,
    variantLabel: variant.label,
    sku: variant.sku ?? null,
    variantOptions,
    badge: product.badge ?? '',
    scene: product.gallery?.[0] ?? null,
  };
}

function withQuantity(lines, lineId, quantity) {
  if (quantity <= 0) {
    return lines.filter((item) => item.lineId !== lineId);
  }

  return lines.map((item) => (item.lineId === lineId ? { ...item, quantity } : item));
}

function withVariant(lines, lineId, nextVariantId) {
  const targetItem = lines.find((item) => item.lineId === lineId);
  const nextVariant = targetItem?.variantOptions?.find(
    (variant) => String(variant.id) === String(nextVariantId),
  );

  if (!targetItem || !nextVariant) {
    return lines;
  }

  const nextLineId = `${targetItem.slug}:${nextVariant.id}`;
  const existingItem = lines.find(
    (item) => item.lineId === nextLineId && item.lineId !== lineId,
  );

  if (existingItem) {
    return lines
      .filter((item) => item.lineId !== lineId)
      .map((item) =>
        item.lineId === nextLineId
          ? { ...item, quantity: item.quantity + targetItem.quantity }
          : item,
      );
  }

  return lines.map((item) =>
    item.lineId === lineId
      ? {
          ...item,
          lineId: nextLineId,
          variantId: nextVariant.id,
          variantLabel: nextVariant.label,
          price: nextVariant.price,
          originalPrice: nextVariant.originalPrice ?? nextVariant.price,
          sku: nextVariant.sku ?? null,
        }
      : item,
  );
}

function readStoredLines(storage, key) {
  try {
    const raw = storage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [buyNowItems, setBuyNowItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setItems(readStoredLines(window.localStorage, STORAGE_KEY));
    setBuyNowItems(readStoredLines(window.sessionStorage, BUY_NOW_STORAGE_KEY));
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, isReady]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    window.sessionStorage.setItem(BUY_NOW_STORAGE_KEY, JSON.stringify(buyNowItems));
  }, [buyNowItems, isReady]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen((current) => !current);

  const addItem = ({ product, variant, quantity = 1 }) => {
    const nextItem = buildLineItem({ product, variant, quantity });

    setItems((current) => {
      const existingItem = current.find((item) => item.lineId === nextItem.lineId);

      if (existingItem) {
        return withQuantity(current, nextItem.lineId, existingItem.quantity + quantity);
      }

      return [...current, nextItem];
    });

    openCart();
  };

  const updateQuantity = (lineId, quantity) => {
    setItems((current) => withQuantity(current, lineId, quantity));
  };

  const updateVariant = (lineId, nextVariantId) => {
    setItems((current) => withVariant(current, lineId, nextVariantId));
  };

  const removeItem = (lineId) => {
    setItems((current) => current.filter((item) => item.lineId !== lineId));
  };

  const clearCart = () => setItems([]);

  const startBuyNow = ({ product, variant, quantity = 1 }) => {
    setBuyNowItems([buildLineItem({ product, variant, quantity })]);
  };

  const updateBuyNowQuantity = (lineId, quantity) => {
    setBuyNowItems((current) => withQuantity(current, lineId, quantity));
  };

  const updateBuyNowVariant = (lineId, nextVariantId) => {
    setBuyNowItems((current) => withVariant(current, lineId, nextVariantId));
  };

  const removeBuyNowItem = (lineId) => {
    setBuyNowItems((current) => current.filter((item) => item.lineId !== lineId));
  };

  const clearBuyNow = () => setBuyNowItems([]);

  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        buyNowItems,
        isCartOpen,
        isReady,
        totalItems,
        subtotal,
        openCart,
        closeCart,
        toggleCart,
        addItem,
        updateQuantity,
        updateVariant,
        removeItem,
        clearCart,
        startBuyNow,
        updateBuyNowQuantity,
        updateBuyNowVariant,
        removeBuyNowItem,
        clearBuyNow,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }

  return context;
}
