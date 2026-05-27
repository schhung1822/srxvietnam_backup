'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { formatNewsDate } from '../../lib/news/articles.js';
import ScrollRevealHeading from './ScrollRevealHeading.jsx';

function resolveProductImage(product) {
  return (
    product?.thumbnail ||
    product?.gallery?.[0]?.image ||
    product?.infoImage ||
    '/assets/images/home/blue.webp'
  );
}

function ScientificSuggestedProductCard({ product }) {
  const productImage = resolveProductImage(product);

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <article className="relative overflow-hidden rounded-[16px] sm:rounded-[26px] bg-[#eef3ff] shadow-[0_20px_60px_rgba(42,62,140,0.12)]">
        <div className="aspect-[0.92] overflow-hidden">
          <img
            src={productImage}
            alt={product.name}
            className="h-full w-full object-cover transition duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
            loading="lazy"
          />
        </div>

        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(4,10,30,0)_18%,rgba(4,10,30,0.16)_54%,rgba(4,10,30,0.82)_100%)]" />

        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
          <div className="inline-flex rounded-full border border-white/35 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-md">
            {product.category}
          </div>
          <div
            className="mt-3 line-clamp-2 text-[15px] sm:text-[18px] font-semibold leading-[1.08] tracking-[-0.05em] text-white sm:text-[20px]"
            style={{ fontFamily: '"Manrope", "Hubot Sans", sans-serif' }}
          >
            {product.name}
          </div>
        </div>

        <div className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-[#1b2333] opacity-0 shadow-[0_18px_40px_rgba(0,0,0,0.16)] transition-all duration-500 group-hover:opacity-100">
          <ArrowUpRight className="h-5 w-5" strokeWidth={1.9} />
        </div>
      </article>
    </Link>
  );
}

export default function HomeScientificTopicsSection({ topic = null }) {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const suggestedProducts = Array.isArray(topic?.suggestedProducts)
    ? topic.suggestedProducts.slice(0, 2)
    : [];

  useEffect(() => {
    if (!sectionRef.current) {
      return undefined;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return;
        }

        setIsVisible(true);
        observer.disconnect();
      },
      {
        threshold: 0.18,
        rootMargin: '0px 0px -8% 0px',
      },
    );

    observer.observe(sectionRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section className="bg-white py-16 sm:py-[72px] lg:py-32">
      <div ref={sectionRef} className="mx-auto max-w-[1800px] px-4 sm:px-6 lg:px-8">
        <div
          className={`mb-12 grid gap-6 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] md:grid-cols-[minmax(0,1fr)_auto] md:items-end ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <div>
            <ScrollRevealHeading
              as="h2"
              className="mt-3 text-[36px] font-medium leading-[1.35] tracking-[-0.07em] sm:text-[52px] lg:text-[68px]"
              revealedClassName="text-black"
              baseStyle={{ color: 'rgba(0,0,0,0.14)' }}
              style={{ fontFamily: '"Manrope", "Hubot Sans", sans-serif' }}
            >
              Chủ đề khoa học
            </ScrollRevealHeading>
          </div>

          <Link
            href="/chu-de-khoa-hoc"
            className="group inline-flex items-start justify-start gap-3 text-[18px] font-medium tracking-[-0.03em] text-[#222837] transition hover:text-black md:justify-self-end"
          >
            <span className="flex flex-col gap-2">
              <span className="flex items-center gap-3">
                <span>Xem tất cả</span>
                <ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </span>
              <span className="h-[3px] w-8 rounded-full bg-[#2d3444] transition-all duration-300 group-hover:w-full" />
            </span>
          </Link>
        </div>

        {topic ? (
          <div
            className={`grid gap-8 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] delay-150 lg:grid-cols-[minmax(0,1fr)_minmax(380px,0.95fr)] lg:items-stretch xl:gap-10 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
            }`}
          >
            <Link
              href={`/follow-srx/${topic.slug}`}
              className="group relative block overflow-hidden rounded-[30px] bg-[#edf4ff] shadow-[0_28px_80px_rgba(73,98,170,0.14)]"
            >
              <div className="aspect-[0.85] min-h-[360px] sm:min-h-[460px] lg:min-h-[760px]">
                <img
                  src={topic.coverImage}
                  alt={topic.coverAlt}
                  className="h-full w-full object-cover transition duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                  loading="lazy"
                />
              </div>

              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02)_16%,rgba(0,19,64,0.08)_48%,rgba(0,14,38,0.34)_100%)]" />

              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
                <div className="inline-flex rounded-full border border-white/45 bg-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-md">
                  {topic.category}
                </div>
                <div className="mt-3 font-['Inter',_sans-serif] text-[12px] font-medium text-white">
                  {formatNewsDate(topic.publishedAt)}
                </div>
              </div>
            </Link>

            <div className="flex min-w-0 flex-col justify-between">
              <div>
                <div className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#8890aa]">
                  Chủ đề nổi bật
                </div>
                <Link href={`/follow-srx/${topic.slug}`} className="group inline-block">
                  <h3
                    className="mt-4 text-[30px] font-semibold uppercase leading-[1.2] tracking-[-0.06em] text-[#111111] transition group-hover:text-[#3656dc] sm:text-[42px] xl:text-[56px]"
                    style={{ fontFamily: '"Manrope", "Hubot Sans", sans-serif' }}
                  >
                    {topic.title}
                  </h3>
                </Link>
                <p className="mt-6 max-w-[680px] text-[14px] sm:text-[16px] leading-8 text-[#303645] sm:text-[18px]">
                  {topic.excerpt}
                </p>

                <div className="mt-8">
                  <Link
                    href={`/follow-srx/${topic.slug}`}
                    className="inline-flex min-h-[48px] items-center justify-center rounded-[14px] border border-[#111111] px-8 text-[15px] font-medium uppercase tracking-[0.08em] text-[#111111] transition hover:bg-[#7C93F1] hover:border-[#7C93F1] hover:text-white"
                    style={{ fontFamily: '"Inter", "Hubot Sans", sans-serif' }}
                  >
                    Xem chi tiết
                  </Link>
                </div>
              </div>

              {suggestedProducts.length ? (
                <div className="mt-10">
                  <div className="mb-5 text-[12px] font-semibold uppercase tracking-[0.22em] text-[#8890aa]">
                    Sản phẩm gợi ý
                  </div>
                  <div className="grid grid-cols-2 gap-4 sm:gap-5">
                    {suggestedProducts.map((product) => (
                      <ScientificSuggestedProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <div
            className={`rounded-[28px] border border-dashed border-[#d8deef] bg-[#fbfcff] px-6 py-14 text-center text-[#667086] transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] delay-150 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
            }`}
          >
            Chưa có chủ đề khoa học nào được publish trên database.
          </div>
        )}
      </div>
    </section>
  );
}
