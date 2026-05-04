'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { FileText, Search, ShoppingBag, X } from 'lucide-react';

const moneyFormatter = new Intl.NumberFormat('vi-VN');

async function parseJson(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

export default function HeaderSearchOverlay({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [productResults, setProductResults] = useState([]);
  const [newsResults, setNewsResults] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const timer = window.setTimeout(() => inputRef.current?.focus(), 30);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setProductResults([]);
      setNewsResults([]);
    }
  }, [isOpen]);

  const trimmedQuery = query.trim();

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      try {
        setIsLoadingProducts(true);
        setIsLoadingNews(true);

        const params = new URLSearchParams({
          limit: trimmedQuery ? '5' : '4',
        });

        if (trimmedQuery) {
          params.set('q', trimmedQuery);
        }

        const [productResponse, newsResponse] = await Promise.all([
          fetch(`/api/products/search?${params.toString()}`, {
            cache: 'no-store',
            signal: controller.signal,
          }),
          fetch(`/api/news/search?${params.toString()}`, {
            cache: 'no-store',
            signal: controller.signal,
          }),
        ]);
        const [productData, newsData] = await Promise.all([
          parseJson(productResponse),
          parseJson(newsResponse),
        ]);

        if (!productResponse.ok) {
          throw new Error(productData.message ?? 'Không thể tải danh sách sản phẩm.');
        }

        if (!newsResponse.ok) {
          throw new Error(newsData.message ?? 'Không thể tải danh sách tin tức.');
        }

        setProductResults(Array.isArray(productData.products) ? productData.products : []);
        setNewsResults(Array.isArray(newsData.articles) ? newsData.articles : []);
      } catch (error) {
        if (error.name === 'AbortError') {
          return;
        }

        setProductResults([]);
        setNewsResults([]);
      } finally {
        setIsLoadingProducts(false);
        setIsLoadingNews(false);
      }
    }, trimmedQuery ? 180 : 0);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [isOpen, trimmedQuery]);

  return (
    <>
      <div
        className={`fixed inset-0 z-[88] bg-black/25 transition ${
          isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed inset-x-0 top-0 z-[90] transition-transform duration-300 ${
          isOpen ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="border-b border-black bg-white shadow-[0_24px_70px_rgba(15,23,42,0.12)]">
          <div className="mx-auto max-w-[1920px] px-4 md:px-6 lg:px-8">
            <div className="flex min-h-[76px] items-center gap-3 py-4 md:min-h-[86px]">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-black text-black">
                <Search className="h-5 w-5" />
              </div>

              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm kiếm sản phẩm hoặc tin tức"
                className="min-w-0 flex-1 border-0 bg-transparent text-[16px] text-[#15110d] outline-none placeholder:text-[#978a7f] md:text-[18px]"
              />

              <button
                type="button"
                onClick={onClose}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-black text-black transition hover:bg-black hover:text-white"
                aria-label="Đóng tìm kiếm"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-6 border-t border-[#ece4da] py-6 md:grid-cols-2">
              <div className="min-w-0">
                <div className="mb-4 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#8d7f72]">
                  <ShoppingBag className="h-4 w-4" />
                  Sản phẩm
                </div>

                <div className="space-y-3">
                  {productResults.length ? (
                    productResults.map((product) => (
                      <Link
                        key={product.slug}
                        href={`/products/${product.slug}`}
                        onClick={onClose}
                        className="block rounded-[20px] border border-[#ece4da] bg-[#fcfaf8] px-4 py-4 transition hover:border-[#cdbfae]"
                      >
                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8d7f72]">
                          {product.brand}
                        </div>
                        <div className="mt-1 line-clamp-2 text-[16px] font-semibold leading-6 text-[#15110d]">
                          {product.name}
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-4 text-[14px] text-[#6f6357]">
                          <span>{product.category}</span>
                          <span className="font-['Inter',_sans-serif] font-semibold text-[#15110d]">
                            {moneyFormatter.format(product.price)}đ
                          </span>
                        </div>
                      </Link>
                    ))
                  ) : isLoadingProducts ? (
                    <div className="rounded-[20px] border border-dashed border-[#ddd3c6] px-4 py-6 text-[14px] text-[#75695d]">
                      Đang tải sản phẩm...
                    </div>
                  ) : (
                    <div className="rounded-[20px] border border-dashed border-[#ddd3c6] px-4 py-6 text-[14px] text-[#75695d]">
                      Không tìm thấy sản phẩm phù hợp.
                    </div>
                  )}
                </div>
              </div>

              <div className="min-w-0">
                <div className="mb-4 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#8d7f72]">
                  <FileText className="h-4 w-4" />
                  Tin tức
                </div>

                <div className="space-y-3">
                  {newsResults.length ? (
                    newsResults.map((article) => (
                      <Link
                        key={article.slug}
                        href={`/follow-srx/${article.slug}`}
                        onClick={onClose}
                        className="block rounded-[20px] border border-[#ece4da] bg-[#fcfaf8] px-4 py-4 transition hover:border-[#cdbfae]"
                      >
                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8d7f72]">
                          {article.category}
                        </div>
                        <div className="mt-1 line-clamp-2 text-[16px] font-semibold leading-6 text-[#15110d]">
                          {article.title}
                        </div>
                        <div className="mt-2 line-clamp-2 text-[14px] leading-6 text-[#6f6357]">
                          {article.excerpt}
                        </div>
                      </Link>
                    ))
                  ) : isLoadingNews ? (
                    <div className="rounded-[20px] border border-dashed border-[#ddd3c6] px-4 py-6 text-[14px] text-[#75695d]">
                      Đang tải tin tức...
                    </div>
                  ) : (
                    <div className="rounded-[20px] border border-dashed border-[#ddd3c6] px-4 py-6 text-[14px] text-[#75695d]">
                      Không tìm thấy tin tức phù hợp.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
