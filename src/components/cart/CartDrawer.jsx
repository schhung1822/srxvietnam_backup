'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Gift, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import ProductArtwork from '../shop/ProductArtwork';
import VoucherField from './VoucherField';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { getCheckoutTotals } from '../../lib/commerce/checkout';
import { useDiscountCodes } from '../../hooks/useDiscountCodes';
import { useEligibleGifts } from '../../hooks/useEligibleGifts';

const moneyFormatter = new Intl.NumberFormat('vi-VN');

export default function CartDrawer() {
  const {
    items,
    isCartOpen,
    subtotal,
    closeCart,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();
  const { user } = useAuth();
  const { discountCodes, isLoading: isLoadingDiscountCodes } = useDiscountCodes();
  const [couponCode, setCouponCode] = useState('');
  const { gifts } = useEligibleGifts(items, couponCode);

  const totals = useMemo(
    () => getCheckoutTotals({ subtotal, couponCode, discountCodes }),
    [couponCode, discountCodes, subtotal],
  );

  useEffect(() => {
    if (couponCode && !totals.coupon.isValid) {
      setCouponCode('');
    }
  }, [couponCode, totals.coupon.isValid]);

  useEffect(() => {
    if (!isCartOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isCartOpen]);

  return (
    <>
      <div
        className={`fixed inset-0 z-[70] bg-black/30 transition ${
          isCartOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={closeCart}
      />

      <aside
        className={`fixed inset-y-0 right-0 z-[80] flex h-[100dvh] w-full max-w-[480px] flex-col overflow-hidden bg-white shadow-[-20px_0_60px_rgba(15,23,42,0.12)] transition-transform duration-300 ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[#D7D7D7] px-4 py-3 sm:px-5 sm:py-5">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#15110d] text-white sm:h-11 sm:w-11">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[17px] font-semibold text-[#15110d] sm:text-[18px]">Giỏ hàng</div>
              <div className="text-[12px] text-[#7e7165] sm:text-[13px]">{items.length} dòng sản phẩm</div>
            </div>
          </div>

          <button
            type="button"
            onClick={closeCart}
            aria-label="Đóng giỏ hàng"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d7d7d7] text-[#15110d] transition hover:border-[#15110d] sm:h-10 sm:w-10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overscroll-y-contain overflow-y-auto px-4 py-4 [-webkit-overflow-scrolling:touch] sm:px-5 sm:py-5">
          {items.length ? (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.lineId} className="border-b border-[#d7d7d7] pb-3 sm:pb-4">
                  <div className="grid grid-cols-[72px_minmax(0,1fr)_auto] items-start gap-3 sm:grid-cols-[96px_minmax(0,1fr)_auto] sm:gap-4">
                    <div className="h-[72px] w-[72px] shrink-0 sm:h-[96px] sm:w-[96px]">
                      <ProductArtwork scene={item.scene} badge={item.badge} mode="cart-thumbnail" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#777] sm:text-[11px]">
                        {item.brand}
                      </div>
                      <Link
                        href={`/products/${item.slug}`}
                        onClick={closeCart}
                        className="mt-0.5 line-clamp-2 block text-[13px] font-semibold leading-[18px] text-[#15110d] sm:mt-1 sm:text-[15px] sm:leading-6"
                      >
                        {item.name}
                      </Link>
                      <div className="mt-0.5 text-[12px] text-[#777] sm:mt-1 sm:text-[13px]">{item.variantLabel}</div>
                      <div className="font-['Inter',_sans-serif] mt-1 text-[13px] font-semibold text-[#15110d] sm:mt-2 sm:text-[15px]">
                        {moneyFormatter.format(item.price)}đ
                      </div>
                    </div>

                    <div className="flex h-[72px] flex-col items-end justify-between sm:h-[96px]">
                      <button
                        type="button"
                        onClick={() => removeItem(item.lineId)}
                        aria-label={`Xóa ${item.name} khỏi giỏ hàng`}
                        title="Xóa sản phẩm"
                        className="flex h-7 w-7 items-center justify-center rounded-full text-[#777] transition hover:bg-[#f1f1f1] hover:text-[#15110d]"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>

                      <div className="inline-flex items-center rounded-full border border-[#d7d7d7] bg-white p-0.5">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.lineId, item.quantity - 1)}
                          aria-label={`Giảm số lượng ${item.name}`}
                          className="flex h-6 w-6 items-center justify-center rounded-full text-[#15110d] transition hover:bg-[#f1f1f1]"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="min-w-[24px] text-center text-[12px] font-semibold text-[#15110d]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.lineId, item.quantity + 1)}
                          aria-label={`Tăng số lượng ${item.name}`}
                          className="flex h-6 w-6 items-center justify-center rounded-full text-[#15110d] transition hover:bg-[#f1f1f1]"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={clearCart}
                className="text-[13px] font-medium text-[#666] transition hover:text-[#15110d]"
              >
                Xóa toàn bộ giỏ hàng
              </button>

              {gifts.length ? (
                <div className="rounded-[12px] border border-[#dedede] bg-[#fafafa] p-4">
                  <div className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.16em] text-[#444]">
                    <Gift className="h-4 w-4" />
                    Quà tặng kèm
                  </div>
                  <div className="mt-3 space-y-2">
                    {gifts.map((gift) => (
                      <div
                        key={`${gift.giftRuleId}-${gift.name}`}
                        className="flex items-center justify-between gap-3 text-[14px] text-[#15110d]"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          {gift.giftImg ? (
                            <img
                              src={gift.giftImg}
                              alt={gift.name}
                              className="h-12 w-12 flex-shrink-0 rounded-[4px] border border-[#dedede] object-cover"
                            />
                          ) : null}
                          <span className="min-w-0 font-medium">{gift.name}</span>
                        </div>
                        <span className="flex-shrink-0 text-[#665a4e]">x{gift.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="flex h-full min-h-[320px] flex-col items-center justify-center px-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#15110d] text-white">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <div className="mt-5 text-[22px] font-semibold text-[#15110d]">Giỏ hàng đang trống</div>
              <p className="mt-2 text-[14px] leading-6 text-[#75695d]">
                Hãy thêm một vài sản phẩm để bắt đầu quá trình thanh toán.
              </p>
              <Link
                href="/products"
                onClick={closeCart}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#15110d] px-5 py-3 text-[14px] font-semibold text-white"
              >
                Xem sản phẩm
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-[#d7d7d7] px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 sm:px-5 sm:py-5">
          <VoucherField
            subtotal={subtotal}
            discountCodes={discountCodes}
            isLoading={isLoadingDiscountCodes}
            appliedCode={totals.coupon.isValid ? totals.coupon.code : ''}
            discountTotal={totals.discountTotal}
            onApply={setCouponCode}
            onRemove={() => setCouponCode('')}
            isLoggedIn={Boolean(user)}
            loginHref="/login?next=/checkout"
            compact
            onNavigate={closeCart}
          />

          <div className="mt-3 space-y-1 border-t border-[#B7B7B7] pt-3 text-[13px] text-[#6d6053] sm:mt-5 sm:space-y-2 sm:pt-4 sm:text-[14px]">
            <div className="flex items-center justify-between">
              <span>Tạm tính</span>
              <span className="font-['Inter',_sans-serif] font-medium text-[#15110d]">{moneyFormatter.format(totals.subtotal)}đ</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Giảm giá</span>
              <span className={`font-['Inter',_sans-serif] font-medium ${totals.discountTotal > 0 ? 'text-[#3f6b39]' : 'text-[#15110d]'}`}>
                -{moneyFormatter.format(totals.discountTotal)}đ
              </span>
            </div>
            <div className="flex items-center justify-between pt-1 text-[17px] font-semibold text-[#15110d] sm:pt-2 sm:text-[18px]">
              <span>Tổng cộng</span>
              <span className="font-['Inter',_sans-serif]">{moneyFormatter.format(totals.grandTotal)}đ</span>
            </div>
          </div>

          {items.length ? (
            <Link
              href="/checkout"
              onClick={closeCart}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-[#15110d] px-6 py-3.5 text-[14px] font-semibold text-white transition hover:bg-[#2b2520] sm:mt-5 sm:py-4 sm:text-[15px]"
            >
              Thanh toán
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="mt-3 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-full bg-[#c9bbcf] px-6 py-3.5 text-[14px] font-semibold text-white sm:mt-5 sm:py-4 sm:text-[15px]"
            >
              Thanh toán
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
