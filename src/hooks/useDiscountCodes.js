'use client';

import { useCallback, useEffect, useState } from 'react';

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

  /**
   * Mã khách tự nhập không có trong danh sách công khai (vd. mã vòng quay may mắn gửi qua Zalo):
   * hỏi server, còn hiệu lực thì thêm vào danh sách để tính giảm giá như mọi mã khác.
   * Trả về danh sách mới (hoặc danh sách cũ nếu không tìm thấy).
   */
  const lookupDiscountCode = useCallback(
    async (code) => {
      const normalizedCode = String(code ?? '')
        .trim()
        .toUpperCase();

      if (!normalizedCode || discountCodes.some((discountCode) => discountCode.code === normalizedCode)) {
        return discountCodes;
      }

      try {
        const response = await fetch(`/api/discount-codes?code=${encodeURIComponent(normalizedCode)}`, {
          cache: 'no-store',
        });
        const data = await response.json().catch(() => ({}));
        const found = Array.isArray(data?.discountCodes) ? data.discountCodes : [];

        if (!found.length) {
          return discountCodes;
        }

        const nextDiscountCodes = [...discountCodes, ...found];
        setDiscountCodes(nextDiscountCodes);
        return nextDiscountCodes;
      } catch {
        return discountCodes;
      }
    },
    [discountCodes],
  );

  return { discountCodes, isLoading, lookupDiscountCode };
}

export default useDiscountCodes;
