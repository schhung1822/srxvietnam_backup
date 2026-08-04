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
        className={`fixed right-0 top-0 z-[80] flex h-screen w-full max-w-[480px] flex-col bg-white shadow-[-20px_0_60px_rgba(15,23,42,0.12)] transition-transform duration-300 ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-[#D7D7D7] px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#15110d] text-white">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[18px] font-semibold text-[#15110d]">Giỏ hàng</div>
              <div className="text-[13px] text-[#7e7165]">{items.length} dòng sản phẩm</div>
            </div>
          </div>

          <button
            type="button"
            onClick={closeCart}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d7d7d7] text-[#15110d] transition hover:border-[#15110d]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {items.length ? (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.lineId} className="border-b border-[#d7d7d7] pb-4">
                  <div className="flex gap-4">
                    <div className="h-[96px] w-[96px] shrink-0">
                      <ProductArtwork scene={item.scene} badge={item.badge} mode="cart-thumbnail" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8d7f72]">
                        {item.brand}
                      </div>
                      <Link
                        href={`/products/${item.slug}`}
                        onClick={closeCart}
                        className="mt-1 line-clamp-2 block text-[15px] font-semibold leading-6 text-[#15110d]"
                      >
                        {item.name}
                      </Link>
                      <div className="mt-1 text-[13px] text-[#75695d]">{item.variantLabel}</div>
                      <div className="font-['Inter',_sans-serif] mt-2 text-[15px] font-semibold text-[#15110d]">
                        {moneyFormatter.format(item.price)}đ
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="inline-flex items-center rounded-full border border-[#d7d7d7] bg-white p-1">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.lineId, item.quantity - 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-[#15110d] transition hover:bg-[#f3ede5]"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="min-w-[34px] text-center text-[14px] font-semibold text-[#15110d]">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.lineId, item.quantity + 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-[#15110d] transition hover:bg-[#f3ede5]"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.lineId)}
                      className="inline-flex items-center gap-2 text-[13px] font-medium text-[#666] transition hover:text-[#15110d]"
                    >
                      <Trash2 className="h-4 w-4" />
                      Xóa
                    </button>
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

        <div className="border-t border-[#d7d7d7] px-5 py-5">
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
          />

          <div className="mt-5 space-y-2 border-t border-[#B7B7B7] pt-4 text-[14px] text-[#6d6053]">
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
            <div className="flex items-center justify-between pt-2 text-[18px] font-semibold text-[#15110d]">
              <span>Tổng cộng</span>
              <span className="font-['Inter',_sans-serif]">{moneyFormatter.format(totals.grandTotal)}đ</span>
            </div>
          </div>

          {items.length ? (
            <Link
              href="/checkout"
              onClick={closeCart}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#15110d] px-6 py-4 text-[15px] font-semibold text-white transition hover:bg-[#2b2520]"
            >
              Thanh toán
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="mt-5 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-full bg-[#c9bbcf] px-6 py-4 text-[15px] font-semibold text-white"
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
