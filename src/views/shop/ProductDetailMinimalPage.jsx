'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Copy, Minus, Plus, Star } from 'lucide-react';
import ProductArtwork from '../../components/shop/ProductArtwork';
import ProductCard from '../../components/shop/ProductCard';
import { useCart } from '../../contexts/CartContext';

const moneyFormatter = new Intl.NumberFormat('vi-VN');

const purchaseNotes = [
  'Giao nhanh toàn quốc',
  'Đổi trả trong 7 ngày',
  'Sản phẩm chính hãng',
];

export default function ProductDetailMinimalPage({ product, relatedProducts = [] }) {
  const { addItem } = useCart();
  const [selectedSceneId, setSelectedSceneId] = useState(product.gallery[0]?.id ?? null);
  const [selectedVariantId, setSelectedVariantId] = useState(product.variants[0].id);
  const [quantity, setQuantity] = useState(1);
  const [copyState, setCopyState] = useState('Sao chép link');

  useEffect(() => {
    setSelectedSceneId(product.gallery[0]?.id ?? null);
    setSelectedVariantId(product.variants[0].id);
    setQuantity(1);
    setCopyState('Sao chép link');
  }, [product.slug, product.gallery, product.variants]);

  const selectedScene =
    product.gallery.find((scene) => scene.id === selectedSceneId) ?? product.gallery[0] ?? null;
  const selectedVariant = product.variants.find((variant) => variant.id === selectedVariantId) ?? product.variants[0];

  const increaseQuantity = () => setQuantity((current) => current + 1);
  const decreaseQuantity = () => setQuantity((current) => (current > 1 ? current - 1 : 1));

  const copyProductLink = async () => {
    const targetUrl =
      typeof window !== 'undefined' ? window.location.href : `https://srx.vn/products/${product.slug}`;

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(targetUrl);
      }

      setCopyState('Đã sao chép');
      window.setTimeout(() => setCopyState('Sao chép link'), 1800);
    } catch {
      setCopyState('Không thể sao chép');
      window.setTimeout(() => setCopyState('Sao chép link'), 1800);
    }
  };

  return (
    <section className="bg-white pb-20 pt-8 md:pb-24">
      <div className="mx-auto max-w-[1440px] px-4 md:px-6 xl:px-8">
        <div className="border-b border-[#e9e3da] pb-4 text-[14px] text-[#7e7165]">
          <Link href="/" className="transition hover:text-[#15110d]">
            Trang chủ
          </Link>
          <span className="mx-2">/</span>
          <Link href="/products" className="transition hover:text-[#15110d]">
            Sản phẩm
          </Link>
          <span className="mx-2">/</span>
          <span className="text-[#15110d]">{product.name}</span>
        </div>

        <div className="grid gap-8 py-8 xl:grid-cols-[88px_minmax(0,1fr)_420px]">
          <div className="order-2 flex gap-3 overflow-x-auto xl:order-1 xl:flex-col">
            {product.gallery.map((scene) => (
              <button
                key={scene.id}
                type="button"
                onClick={() => setSelectedSceneId(scene.id)}
                className={`min-w-[76px] rounded-[12px] border transition ${
                  selectedSceneId === scene.id
                    ? 'border-[#7C93F1] '
                    : 'border-[#F6BFDF] hover:border-[#7C93F1]'
                }`}
              >
                <ProductArtwork scene={scene} mode="thumbnail" />
              </button>
            ))}
          </div>

          <div className="order-1 xl:order-2">
            <div className="overflow-hidden rounded-[24px] bg-[#f6f3ee]">
              <ProductArtwork scene={selectedScene} badge={product.badge} mode="detail" />
            </div>
          </div>

          <div className="order-3">
            <div className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#8d7f72]">
              {product.brand}
            </div>

            <h1 className="mt-3 text-[34px] font-semibold leading-tight tracking-[-0.04em] text-[#15110d]">
              {product.name}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-[14px] text-[#6b5f53]">
              <span className="inline-flex items-center gap-2">
                <Star className="h-4 w-4 fill-current text-[#15110d]" />
                <span className="font-medium text-[#15110d]">{product.rating.toFixed(1)}</span>
              </span>
              <span>{product.reviewCount} đánh giá</span>
              <span>{product.soldCount}+ đã bán</span>
            </div>

            <div className="mt-6 flex items-end gap-3">
              <div className="text-[36px] font-bold text-[#15110d]">
                {moneyFormatter.format(selectedVariant.price)}đ
              </div>
              <div className="pb-1 text-[17px] text-[#9a8c7f] line-through">
                {moneyFormatter.format(selectedVariant.originalPrice)}đ
              </div>
            </div>

            <p className="mt-6 text-[15px] leading-7 text-[#6f6357]">{product.shortDescription}</p>

            <div className="mt-8 border-t border-[#ebe4da] pt-6">
              <div className="mb-3 text-[13px] font-semibold uppercase tracking-[0.18em] text-[#8d7f72]">
                Dung tích / phiên bản
              </div>
              <div className="flex flex-wrap gap-3">
                {product.variants.map((variant) => {
                  const active = selectedVariantId === variant.id;

                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => setSelectedVariantId(variant.id)}
                      className={`rounded-full border px-4 py-2.5 text-[14px] font-medium transition ${
                        active
                          ? 'border-[#15110d] bg-[#15110d] text-white'
                          : 'border-[#ddd3c6] bg-white text-[#2b251f] hover:border-[#15110d]'
                      }`}
                    >
                      {variant.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 border-t border-[#ebe4da] pt-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className="inline-flex items-center rounded-full border border-[#ddd3c6] bg-white p-1">
                  <button
                    type="button"
                    onClick={decreaseQuantity}
                    className="flex h-10 w-10 items-center justify-center rounded-full text-[#15110d] transition hover:bg-[#f3ede5]"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="min-w-[44px] text-center text-[16px] font-semibold text-[#15110d]">{quantity}</span>
                  <button
                    type="button"
                    onClick={increaseQuantity}
                    className="flex h-10 w-10 items-center justify-center rounded-full text-[#15110d] transition hover:bg-[#f3ede5]"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => addItem({ product, variant: selectedVariant, quantity })}
                  className="flex-1 rounded-full bg-[#15110d] px-6 py-4 text-[15px] font-semibold text-white transition hover:bg-[#2b2520]"
                >
                  Thêm vào giỏ
                </button>
              </div>
            </div>

            <div className="mt-6 border-t border-[#ebe4da] pt-6">
              <div className="space-y-2 text-[14px] text-[#6f6357]">
                {purchaseNotes.map((note) => (
                  <div key={note} className="flex items-center gap-3">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#15110d]" />
                    <span>{note}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 border-t border-[#e9e3da] py-10 xl:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#8d7f72]">
              Mô tả
            </div>
            <div className="mt-4 max-w-[760px] text-[16px] leading-8 text-[#5f5449]">
              {product.description}
            </div>

            <div className="mt-8 space-y-4">
              {product.highlights.map((highlight) => (
                <div key={highlight.title} className="border-b border-[#ece4da] pb-4">
                  <div className="text-[18px] font-semibold text-[#15110d]">{highlight.title}</div>
                  <div className="mt-2 text-[15px] leading-7 text-[#6f6357]">{highlight.description}</div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <div className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#8d7f72]">
                Cách sử dụng
              </div>
              <div className="mt-4 space-y-3">
                {product.howToUse.map((step, index) => (
                  <div key={step} className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#d9cec1] text-[13px] font-semibold text-[#15110d]">
                      {index + 1}
                    </div>
                    <div className="pt-0.5 text-[15px] leading-7 text-[#6f6357]">{step}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#8d7f72]">
              Thông tin sản phẩm
            </div>
            <div className="mt-4 divide-y divide-[#ebe4da] border-t border-[#ebe4da]">
              {product.specs.map((spec) => (
                <div key={spec.label} className="flex items-start justify-between gap-6 py-4">
                  <div className="text-[14px] text-[#7f7265]">{spec.label}</div>
                  <div className="max-w-[260px] text-right text-[15px] font-medium text-[#15110d]">
                    {spec.value}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <div className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#8d7f72]">
                Thành phần chính
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {product.ingredients.map((ingredient) => (
                  <span
                    key={ingredient}
                    className="rounded-full border border-[#ddd3c6] px-3 py-2 text-[13px] font-medium text-[#4a4036]"
                  >
                    {ingredient}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#e9e3da] py-10">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <div className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#8d7f72]">
                Sản phẩm liên quan
              </div>
              <h2 className="mt-2 text-[28px] font-semibold tracking-[-0.04em] text-[#15110d]">
                Gợi ý thêm cho routine
              </h2>
            </div>

            <Link
              href="/products"
              className="text-[14px] font-semibold text-[#15110d] transition hover:text-[#6f6357]"
            >
              Xem tất cả
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.slug} product={relatedProduct} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

