'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { MessageCircleMore, Minus, Plus, ShoppingBag } from 'lucide-react';
import ProductArtwork from './ProductArtwork';
import { BottomSheet, ContactBottomSheet } from './MobileBottomSheet';
import { useHideFloatingCta } from '../FloatingCallToAction';

const moneyFormatter = new Intl.NumberFormat('vi-VN');

const SHEET_ACTION_LABELS = {
  cart: 'Thêm vào giỏ hàng',
  buy: 'Mua ngay',
};

export default function ProductMobileActionBar({
  product,
  selectedVariant,
  onSelectVariant,
  quantity,
  onQuantityChange,
  onAddToCart,
  onBuyNow,
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [sheetMode, setSheetMode] = useState(null);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const hasVariantChoices = product.variants.length > 1;
  const hasDiscount = Number(selectedVariant.originalPrice) > Number(selectedVariant.price);

  useHideFloatingCta('mobile');

  useEffect(() => {
    setIsMounted(true);
    // Reserves room at the bottom of the page so the fixed bar never covers the footer.
    document.body.dataset.productActionBar = 'true';

    return () => {
      delete document.body.dataset.productActionBar;
    };
  }, []);

  useEffect(() => {
    setSheetMode(null);
    setIsContactOpen(false);
  }, [product.slug]);

  const closeSheet = () => setSheetMode(null);
  const closeContact = () => setIsContactOpen(false);

  const runAction = (mode) => {
    if (mode === 'buy') {
      onBuyNow();
      return;
    }

    onAddToCart();
  };

  const handleActionClick = (mode) => {
    if (hasVariantChoices) {
      setSheetMode(mode);
      return;
    }

    runAction(mode);
  };

  const handleConfirm = () => {
    const mode = sheetMode;
    setSheetMode(null);
    runAction(mode);
  };

  if (!isMounted) {
    return null;
  }

  // Portalled to body: the page section is transformed, which would anchor `fixed` to it.
  return createPortal(
    <>
      <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-[#ece6de] bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_30px_rgba(21,17,13,0.08)] backdrop-blur lg:hidden">
        <div className="flex h-[72px] items-center gap-2 px-3">
          <button
            type="button"
            onClick={() => setIsContactOpen(true)}
            className="flex h-full w-[58px] shrink-0 flex-col items-center justify-center gap-1 text-[#15110d]"
          >
            <MessageCircleMore className="h-5 w-5" strokeWidth={1.9} />
            <span className="text-[11px] font-medium">Liên hệ</span>
          </button>

          <button
            type="button"
            onClick={() => handleActionClick('cart')}
            className="flex h-12 flex-1 items-center justify-center gap-1.5 rounded-[12px] border border-[#d7d7d7] px-2 text-[13px] font-semibold text-[#15110d] transition active:scale-[0.98]"
          >
            <ShoppingBag className="h-4 w-4 shrink-0" />
            <span className="truncate">Thêm vào giỏ</span>
          </button>

          <button
            type="button"
            onClick={() => handleActionClick('buy')}
            className="flex h-12 flex-1 items-center justify-center rounded-[12px] bg-[linear-gradient(90deg,#7d91eb_0%,#efb6df_100%)] px-2 text-[13px] font-semibold uppercase tracking-[0.08em] text-white transition active:scale-[0.98]"
          >
            Mua ngay
          </button>
        </div>
      </div>

      {hasVariantChoices ? (
        <BottomSheet
          isOpen={Boolean(sheetMode)}
          onClose={closeSheet}
          title={SHEET_ACTION_LABELS[sheetMode] ?? 'Chọn phân loại'}
        >
          <div className="flex gap-3 border-b border-[#f0ebe4] px-4 pb-4 pt-3 pr-14">
            <div className="h-[88px] w-[88px] shrink-0 overflow-hidden rounded-[14px] border border-[#ece6de] bg-white">
              <ProductArtwork scene={product.gallery[0]} mode="cart-thumbnail" />
            </div>
            <div className="min-w-0 self-end">
              <div className="line-clamp-2 text-[14px] font-medium leading-5 text-[#15110d]">{product.name}</div>
              <div className="mt-1.5 flex items-end gap-2">
                <span className="font-['Inter',_sans-serif] text-[20px] font-semibold tracking-[-0.04em] text-[#15110d]">
                  {moneyFormatter.format(selectedVariant.price)}đ
                </span>
                {hasDiscount ? (
                  <span className="font-['Inter',_sans-serif] pb-0.5 text-[13px] text-[#9a8c7f] line-through">
                    {moneyFormatter.format(selectedVariant.originalPrice)}đ
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="overflow-y-auto px-4 py-4">
            <div className="text-[14px] font-medium text-[#15110d]">Size</div>
            <div className="mt-3 flex flex-wrap gap-2.5">
              {product.variants.map((variant) => {
                const active = selectedVariant.id === variant.id;

                return (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => onSelectVariant(variant.id)}
                    className={`min-w-[72px] rounded-[10px] border px-4 py-2.5 text-[13px] font-medium uppercase transition ${
                      active
                        ? 'border-[#15110d] bg-[#15110d] text-white'
                        : 'border-[#ddd3c6] bg-white text-[#2b251f]'
                    }`}
                  >
                    {variant.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="text-[14px] font-medium text-[#15110d]">Số lượng</div>
              <div className="grid h-10 w-[120px] grid-cols-[40px_1fr_40px] items-center rounded-[10px] bg-[#edf0ff]">
                <button
                  type="button"
                  onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                  className="flex h-full items-center justify-center text-[#15110d]"
                  aria-label="Giảm số lượng"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="text-center text-[15px] font-semibold text-[#15110d]">{quantity}</span>
                <button
                  type="button"
                  onClick={() => onQuantityChange(quantity + 1)}
                  className="flex h-full items-center justify-center text-[#15110d]"
                  aria-label="Tăng số lượng"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-[#f0ebe4] px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3">
            <button
              type="button"
              onClick={handleConfirm}
              className="h-12 w-full rounded-[12px] bg-[linear-gradient(90deg,#7d91eb_0%,#efb6df_100%)] text-[13px] font-semibold uppercase tracking-[0.16em] text-white transition active:scale-[0.99]"
            >
              {SHEET_ACTION_LABELS[sheetMode] ?? 'Xác nhận'}
            </button>
          </div>
        </BottomSheet>
      ) : null}

      <ContactBottomSheet isOpen={isContactOpen} onClose={closeContact} />
    </>,
    document.body,
  );
}
