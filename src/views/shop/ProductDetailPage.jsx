'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BadgeCheck,
  Copy,
  HeartHandshake,
  Minus,
  Plus,
  ShieldCheck,
  Star,
  Truck,
} from 'lucide-react';
import ProductArtwork from '../../components/shop/ProductArtwork';
import ProductCard from '../../components/shop/ProductCard';

const moneyFormatter = new Intl.NumberFormat('vi-VN');

const serviceHighlights = [
  {
    title: 'Giao nhanh toàn quốc',
    description: 'Miễn phí vận chuyển với đơn từ 699.000đ.',
    icon: Truck,
  },
  {
    title: 'Cam kết chính hãng',
    description: 'Theo dõi theo SKU và tồn kho từ hệ thống.',
    icon: ShieldCheck,
  },
  {
    title: 'Hỗ trợ routine',
    description: 'Gợi ý routine và sản phẩm liên quan theo nhu cầu da.',
    icon: HeartHandshake,
  },
  {
    title: 'Affiliate ready',
    description: 'Có thể sao chép link sản phẩm để chạy chiến dịch giới thiệu.',
    icon: BadgeCheck,
  },
];

export default function ProductDetailPage({ product, relatedProducts = [] }) {
  const [selectedSceneId, setSelectedSceneId] = useState(product.gallery[0].id);
  const [selectedVariantId, setSelectedVariantId] = useState(product.variants[0].id);
  const [quantity, setQuantity] = useState(1);
  const [copyState, setCopyState] = useState('Sao chép link');

  useEffect(() => {
    setSelectedSceneId(product.gallery[0].id);
    setSelectedVariantId(product.variants[0].id);
    setQuantity(1);
    setCopyState('Sao chép link');
  }, [product.slug, product.gallery, product.variants]);

  const selectedScene = product.gallery.find((scene) => scene.id === selectedSceneId) ?? product.gallery[0];
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
    <section className="bg-[#f7f1e8] pb-24 pt-8">
      <div className="mx-auto max-w-[1360px] px-4 md:px-6">
        <div className="mb-6 text-[14px] text-[#746352]">
          <Link href="/" className="hover:text-[#171311]">
            Trang chủ
          </Link>
          <span className="mx-2">/</span>
          <Link href="/products" className="hover:text-[#171311]">
            Sản phẩm
          </Link>
          <span className="mx-2">/</span>
          <span className="text-[#171311]">{product.name}</span>
        </div>

        <div className="rounded-[36px] border border-[#eadfce] bg-white p-4 shadow-[0_30px_90px_rgba(71,45,17,0.08)] md:p-6 xl:p-8">
          <div className="grid gap-8 xl:grid-cols-[88px_minmax(0,1fr)_460px]">
            <div className="order-2 flex gap-3 overflow-x-auto xl:order-1 xl:flex-col">
              {product.gallery.map((scene) => (
                <button
                  key={scene.id}
                  type="button"
                  onClick={() => setSelectedSceneId(scene.id)}
                  className={`min-w-[78px] rounded-[22px] border p-1 transition ${
                    selectedSceneId === scene.id
                      ? 'border-[#2540dd] bg-[#eef2ff]'
                      : 'border-[#eadfce] bg-[#faf7f2] hover:border-[#d6c5b0]'
                  }`}
                >
                  <ProductArtwork scene={scene} mode="thumbnail" />
                </button>
              ))}
            </div>

            <div className="order-1 xl:order-2">
              <ProductArtwork
                scene={selectedScene}
                badge={product.badge}
                promoLabel={product.promoLabel}
                mode="detail"
              />
            </div>

            <div className="order-3 rounded-[32px] border border-[#eadfce] bg-[#fcfaf7] p-6">
              <div className="inline-flex rounded-full border border-[#d8cab7] bg-white px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.24em] text-[#8c7c68]">
                {product.brand}
              </div>

              <h1 className="mt-4 text-[30px] font-semibold leading-tight tracking-[-0.04em] text-[#171311]">
                {product.name}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-[14px] text-[#6f5f4e]">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#fff3de] px-3 py-1.5 font-medium text-[#7e5a18]">
                  <Star className="h-4 w-4 fill-current" />
                  {product.rating.toFixed(1)} / 5
                </span>
                <span>{product.reviewCount} đánh giá</span>
                <span>{product.soldCount}+ đã bán</span>
              </div>

              <div className="mt-5 flex items-end gap-3">
                <div className="text-[34px] font-bold text-[#171311]">
                  {moneyFormatter.format(selectedVariant.price)}đ
                </div>
                <div className="pb-1 text-[17px] text-[#9b8a78] line-through">
                  {moneyFormatter.format(selectedVariant.originalPrice)}đ
                </div>
              </div>

              <p className="mt-5 text-[15px] leading-7 text-[#6d5c4b]">{product.description}</p>

              <div className="mt-6 rounded-[24px] bg-white p-4">
                <div className="mb-3 text-[13px] font-semibold uppercase tracking-[0.2em] text-[#8b7a68]">
                  Biến thể
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.variants.map((variant) => {
                    const active = selectedVariantId === variant.id;

                    return (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => setSelectedVariantId(variant.id)}
                        className={`rounded-[18px] border px-4 py-3 text-left transition ${
                          active
                            ? 'border-[#2540dd] bg-[#2540dd] text-white shadow-[0_16px_34px_rgba(37,64,221,0.16)]'
                            : 'border-[#e4d9ca] bg-[#faf7f2] text-[#352d26] hover:border-[#cab79f]'
                        }`}
                      >
                        <div className="text-[15px] font-semibold">{variant.label}</div>
                        <div className={`mt-1 text-[13px] ${active ? 'text-white/80' : 'text-[#756553]'}`}>
                          SKU: {variant.sku}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5 rounded-[24px] bg-white p-4">
                <div className="mb-3 text-[13px] font-semibold uppercase tracking-[0.2em] text-[#8b7a68]">
                  Tone nhận diện
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.swatches.map((swatch) => (
                    <span
                      key={swatch}
                      className="h-9 w-9 rounded-full border border-[#d7cab8] shadow-sm"
                      style={{ backgroundColor: swatch }}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-4">
                <div className="inline-flex items-center rounded-full border border-[#e1d5c5] bg-white p-1">
                  <button
                    type="button"
                    onClick={decreaseQuantity}
                    className="flex h-10 w-10 items-center justify-center rounded-full text-[#171311] transition hover:bg-[#f3ece2]"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="min-w-[44px] text-center text-[16px] font-semibold text-[#171311]">{quantity}</span>
                  <button
                    type="button"
                    onClick={increaseQuantity}
                    className="flex h-10 w-10 items-center justify-center rounded-full text-[#171311] transition hover:bg-[#f3ece2]"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <div className="text-[14px] text-[#6e5e4d]">
                  Tồn kho khả dụng: <span className="font-semibold text-[#171311]">{selectedVariant.stock}</span>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  className="flex-1 rounded-full bg-[#171311] px-6 py-4 text-[15px] font-semibold text-white transition hover:bg-[#2540dd]"
                >
                  Thêm vào giỏ
                </button>
                <button
                  type="button"
                  onClick={copyProductLink}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#d9ccb9] bg-white px-5 py-4 text-[15px] font-semibold text-[#171311] transition hover:border-[#2540dd] hover:text-[#2540dd]"
                >
                  <Copy className="h-4 w-4" />
                  {copyState}
                </button>
              </div>

              <div className="mt-6 grid gap-3">
                {serviceHighlights.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="rounded-[22px] border border-[#eadfce] bg-white px-4 py-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-full bg-[#eef2ff] text-[#2540dd]">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="text-[15px] font-semibold text-[#171311]">{item.title}</div>
                          <div className="mt-1 text-[14px] leading-6 text-[#6d5c4b]">{item.description}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-12 rounded-[34px] border border-[#eadfce] bg-[#fcfaf7] p-6 md:p-8">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="text-[12px] font-semibold uppercase tracking-[0.24em] text-[#8d7b68]">
                  Mô tả sản phẩm
                </div>
                <h2 className="mt-3 text-[34px] font-semibold tracking-[-0.04em] text-[#171311]">
                  Thiết kế phần nội dung chi tiết để kể câu chuyện sản phẩm rõ ràng hơn.
                </h2>
              </div>
              <p className="max-w-[420px] text-[15px] leading-7 text-[#6d5c4b]">
                Khu vực này phù hợp để render từ CMS hoặc MySQL, gồm nội dung mô tả, thông số, điểm nổi bật và block media như giao diện mẫu bạn gửi.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {serviceHighlights.map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.title} className="rounded-[24px] border border-[#e8dccd] bg-white p-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f1f4ff] text-[#2540dd]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="mt-4 text-[18px] font-semibold text-[#171311]">{item.title}</div>
                    <p className="mt-2 text-[14px] leading-6 text-[#6d5c4b]">{item.description}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
              <div className="rounded-[28px] border border-[#eadfce] bg-white p-6">
                <div className="text-[12px] font-semibold uppercase tracking-[0.24em] text-[#8d7b68]">
                  Thông số nhanh
                </div>
                <div className="mt-5 divide-y divide-[#eee3d4]">
                  {product.specs.map((spec) => (
                    <div key={spec.label} className="flex items-start justify-between gap-4 py-4">
                      <span className="text-[14px] font-medium text-[#7a6a58]">{spec.label}</span>
                      <span className="max-w-[190px] text-right text-[15px] font-semibold text-[#171311]">
                        {spec.value}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-[24px] bg-[#faf5ee] p-4">
                  <div className="text-[13px] font-semibold uppercase tracking-[0.2em] text-[#8b7a68]">
                    Thành phần chính
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {product.ingredients.map((ingredient) => (
                      <span
                        key={ingredient}
                        className="rounded-full border border-[#e4d8c9] bg-white px-3 py-2 text-[13px] font-medium text-[#4f4338]"
                      >
                        {ingredient}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <ProductArtwork scene={selectedScene} mode="detail" />
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {product.highlights.map((highlight, index) => (
                <div key={highlight.title} className="overflow-hidden rounded-[28px] border border-[#eadfce] bg-white">
                  <div className="p-4">
                    <ProductArtwork scene={product.gallery[index + 1] ?? product.gallery[0]} mode="card" />
                  </div>
                  <div className="px-5 pb-5">
                    <div className="text-[20px] font-semibold text-[#171311]">{highlight.title}</div>
                    <p className="mt-2 text-[14px] leading-6 text-[#6d5c4b]">{highlight.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-2">
              <div className="rounded-[28px] border border-[#eadfce] bg-white p-6">
                <div className="text-[12px] font-semibold uppercase tracking-[0.24em] text-[#8d7b68]">
                  Cách sử dụng
                </div>
                <div className="mt-4 space-y-4">
                  {product.howToUse.map((step, index) => (
                    <div key={step} className="flex gap-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#171311] text-[13px] font-semibold text-white">
                        {index + 1}
                      </div>
                      <p className="pt-1 text-[15px] leading-7 text-[#6d5c4b]">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[28px] border border-[#eadfce] bg-[#171311] p-6 text-white">
                <div className="text-[12px] font-semibold uppercase tracking-[0.24em] text-white/60">
                  Note cho backend
                </div>
                <div className="mt-4 text-[24px] font-semibold leading-9">
                  Layout này đã tách rõ phần gallery, variant, nội dung và recommendation để map thẳng từ schema `products`, `product_variants`, `product_images`.
                </div>
                <p className="mt-4 text-[15px] leading-7 text-white/72">
                  Khi nối backend, mỗi scene gallery có thể lấy từ bảng hình ảnh, biến thể lấy từ SKU và tồn kho, còn phần copy link có thể gắn thêm tham số affiliate code.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <div className="text-[12px] font-semibold uppercase tracking-[0.24em] text-[#8d7b68]">
                  Gợi ý sản phẩm
                </div>
                <h2 className="mt-2 text-[32px] font-semibold tracking-[-0.04em] text-[#171311]">
                  Các sản phẩm liên quan
                </h2>
              </div>

              <Link
                href="/products"
                className="rounded-full border border-[#d9ccb9] px-5 py-3 text-[14px] font-semibold text-[#171311] transition hover:border-[#2540dd] hover:text-[#2540dd]"
              >
                Xem toàn bộ catalog
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.slug} product={relatedProduct} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
