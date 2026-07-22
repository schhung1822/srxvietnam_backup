'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);

const STORAGE_KEY = 'srx-cart';

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setItems(JSON.parse(raw));
      }
    } catch {
      setItems([]);
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, isReady]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen((current) => !current);

  const addItem = ({ product, variant, quantity = 1 }) => {
    const lineId = `${product.slug}:${variant.id}`;
    const variantOptions = product.variants?.map((productVariant) => ({
      id: productVariant.id,
      label: productVariant.label,
      price: productVariant.price,
      originalPrice: productVariant.originalPrice ?? productVariant.price,
      sku: productVariant.sku ?? null,
    })) ?? [];

    setItems((current) => {
      const existingItem = current.find((item) => item.lineId === lineId);

      if (existingItem) {
        return current.map((item) =>
          item.lineId === lineId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [
        ...current,
        {
          lineId,
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
        },
      ];
    });

    openCart();
  };

  const updateQuantity = (lineId, quantity) => {
    if (quantity <= 0) {
      setItems((current) => current.filter((item) => item.lineId !== lineId));
      return;
    }

    setItems((current) =>
      current.map((item) => (item.lineId === lineId ? { ...item, quantity } : item))
    );
  };

  const updateVariant = (lineId, nextVariantId) => {
    setItems((current) => {
      const targetItem = current.find((item) => item.lineId === lineId);
      const nextVariant = targetItem?.variantOptions?.find(
        (variant) => String(variant.id) === String(nextVariantId),
      );

      if (!targetItem || !nextVariant) {
        return current;
      }

      const nextLineId = `${targetItem.slug}:${nextVariant.id}`;
      const existingItem = current.find(
        (item) => item.lineId === nextLineId && item.lineId !== lineId,
      );

      if (existingItem) {
        return current
          .filter((item) => item.lineId !== lineId)
          .map((item) =>
            item.lineId === nextLineId
              ? { ...item, quantity: item.quantity + targetItem.quantity }
              : item,
          );
      }

      return current.map((item) =>
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
    });
  };

  const removeItem = (lineId) => {
    setItems((current) => current.filter((item) => item.lineId !== lineId));
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
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
