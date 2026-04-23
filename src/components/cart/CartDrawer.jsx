'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Minus, Plus, ShoppingBag, TicketPercent, Trash2, X } from 'lucide-react';
import ProductArtwork from '../shop/ProductArtwork';
import { useCart } from '../../contexts/CartContext';
import { getCheckoutTotals } from '../../lib/commerce/checkout';

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
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');

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

  const applyCoupon = () => {
    const totals = getCheckoutTotals({
      subtotal,
      couponCode,
    });

    setDiscountAmount(totals.discountTotal);
    setCouponMessage(totals.coupon.message);
  };

  const total = Math.max(subtotal - discountAmount, 0);

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
        <div className="flex items-center justify-between border-b border-[#e9e3da] px-5 py-5">
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
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ddd3c6] text-[#15110d] transition hover:border-[#15110d]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {items.length ? (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.lineId} className="rounded-[24px] border border-[#ece4da] bg-[#fcfaf8] p-4">
                  <div className="flex gap-4">
                    <div className="h-[96px] w-[82px] shrink-0 overflow-hidden rounded-[18px] bg-[#f3ede5]">
                      <ProductArtwork scene={item.scene} badge={item.badge} mode="thumbnail" />
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
                      <div className="mt-2 text-[15px] font-semibold text-[#15110d]">
                        {moneyFormatter.format(item.price)}đ
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="inline-flex items-center rounded-full border border-[#ddd3c6] bg-white p-1">
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
                      className="inline-flex items-center gap-2 text-[13px] font-medium text-[#7e7165] transition hover:text-[#15110d]"
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
                className="text-[13px] font-medium text-[#7e7165] transition hover:text-[#15110d]"
              >
                Xóa toàn bộ giỏ hàng
              </button>
            </div>
          ) : (
            <div className="flex h-full min-h-[320px] flex-col items-center justify-center rounded-[28px] border border-dashed border-[#ddd3c6] bg-[#fcfaf8] px-6 text-center">
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

        <div className="border-t border-[#e9e3da] px-5 py-5">
          <div className="rounded-[24px] border border-[#ece4da] bg-[#fcfaf8] p-4">
            <div className="mb-3 flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.16em] text-[#8d7f72]">
              <TicketPercent className="h-4 w-4" />
              Mã giảm giá
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(event) => setCouponCode(event.target.value)}
                placeholder="Ví dụ: SRX10"
                className="min-w-0 flex-1 rounded-full border border-[#ddd3c6] bg-white px-4 py-3 text-[14px] text-[#15110d] outline-none transition focus:border-[#15110d]"
              />
              <button
                type="button"
                onClick={applyCoupon}
                className="rounded-full bg-[#15110d] px-4 py-3 text-[13px] font-semibold text-white"
              >
                Áp dụng
              </button>
            </div>

            {couponMessage ? (
              <div className="mt-3 text-[13px] text-[#75695d]">{couponMessage}</div>
            ) : null}
          </div>

          <div className="mt-4 space-y-2 text-[14px] text-[#6d6053]">
            <div className="flex items-center justify-between">
              <span>Tạm tính</span>
              <span className="font-medium text-[#15110d]">{moneyFormatter.format(subtotal)}đ</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Giảm giá</span>
              <span className="font-medium text-[#15110d]">-{moneyFormatter.format(discountAmount)}đ</span>
            </div>
            <div className="flex items-center justify-between pt-2 text-[18px] font-semibold text-[#15110d]">
              <span>Tổng cộng</span>
              <span>{moneyFormatter.format(total)}đ</span>
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
              className="mt-5 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-full bg-[#cfc5bb] px-6 py-4 text-[15px] font-semibold text-white"
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
