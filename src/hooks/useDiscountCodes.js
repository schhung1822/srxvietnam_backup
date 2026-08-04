'use client';

import { useEffect, useState } from 'react';

export function useDiscountCodes() {
  const [discountCodes, setDiscountCodes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    const loadDiscountCodes = async () => {
      try {
        setIsLoading(true);

        const response = await fetch('/api/discount-codes', { method: 'GET', cache: 'no-store' });
        const data = await response.json().catch(() => ({}));

        if (!isCancelled) {
          setDiscountCodes(Array.isArray(data?.discountCodes) ? data.discountCodes : []);
        }
      } catch {
        if (!isCancelled) {
          setDiscountCodes([]);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadDiscountCodes();

    return () => {
      isCancelled = true;
    };
  }, []);

  return { discountCodes, isLoading };
}

export default useDiscountCodes;
