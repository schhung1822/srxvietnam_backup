'use client';

import { useEffect, useMemo, useState } from 'react';

async function parseJson(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

function createPreviewItems(items) {
  return items.map((item) => ({
    productId: item.productId,
    variantId: item.variantId,
    price: item.price,
    quantity: item.quantity,
  }));
}

export function useEligibleGifts(items, couponCode = '') {
  const [gifts, setGifts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const previewItems = useMemo(() => createPreviewItems(items), [items]);

  useEffect(() => {
    if (!previewItems.length) {
      setGifts([]);
      setIsLoading(false);
      return undefined;
    }

    const controller = new AbortController();

    const loadGifts = async () => {
      try {
        setIsLoading(true);

        const response = await fetch('/api/gift-rules/eligible', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            couponCode,
            items: previewItems,
          }),
          cache: 'no-store',
          signal: controller.signal,
        });
        const data = await parseJson(response);

        if (!controller.signal.aborted) {
          setGifts(Array.isArray(data.gifts) ? data.gifts : []);
        }
      } catch {
        if (!controller.signal.aborted) {
          setGifts([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void loadGifts();

    return () => {
      controller.abort();
    };
  }, [couponCode, previewItems]);

  return {
    gifts,
    isLoading,
  };
}
