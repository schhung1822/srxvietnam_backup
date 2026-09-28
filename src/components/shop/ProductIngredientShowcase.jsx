'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function buildPreparedEntries(entries = []) {
  return entries.filter((entry) => entry?.name);
}

export default function ProductIngredientShowcase({ productName, entries = [] }) {
  const preparedEntries = useMemo(() => buildPreparedEntries(entries), [entries]);
  const [activeIndex, setActiveIndex] = useState(0);
  const introRef = useRef(null);
  const imageCardRef = useRef(null);
  const [listMaxHeight, setListMaxHeight] = useState(null);

  useEffect(() => {
    setActiveIndex(0);
  }, [productName, preparedEntries.length]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1280px)');

    const updateListHeight = () => {
      if (!mediaQuery.matches) {
        setListMaxHeight(null);
        return;
      }

      const imageHeight = imageCardRef.current?.getBoundingClientRect().height ?? 0;
      const introHeight = introRef.current?.getBoundingClientRect().height ?? 0;
      const listTopGap = 32;
      const nextMaxHeight = Math.max(260, Math.floor(imageHeight - introHeight - listTopGap));

      setListMaxHeight(nextMaxHeight);
    };

    updateListHeight();

    const resizeObserver = new ResizeObserver(updateListHeight);

    if (introRef.current) {
      resizeObserver.observe(introRef.current);
    }

    if (imageCardRef.current) {
      resizeObserver.observe(imageCardRef.current);
    }

    window.addEventListener('resize', updateListHeight);
    mediaQuery.addEventListener('change', updateListHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateListHeight);
      mediaQuery.removeEventListener('change', updateListHeight);
    };
  }, [preparedEntries.length]);

  if (!preparedEntries.length) {
    return null;
  }

  const goToSlide = (nextIndex) => {
    if (!preparedEntries.length) {
      return;
    }

    const normalizedIndex = (nextIndex + preparedEntries.length) % preparedEntries.length;
    setActiveIndex(normalizedIndex);
  };

  return (
    <>
      <CompactIngredientShowcase
        productName={productName}
        entries={preparedEntries}
        activeIndex={activeIndex}
        onSelect={goToSlide}
      />
      <DesktopIngredientShowcase
        productName={productName}
        entries={preparedEntries}
        activeIndex={activeIndex}
        onSelect={goToSlide}
        introRef={introRef}
        imageCardRef={imageCardRef}
        listMaxHeight={listMaxHeight}
      />
    </>
  );
}

const SWIPE_THRESHOLD = 40;

function CompactIngredientShowcase({ productName, entries, activeIndex, onSelect }) {
  const chipsRef = useRef(null);
  const touchStartXRef = useRef(null);
  const activeEntry = entries[activeIndex] ?? entries[0];

  useEffect(() => {
    const container = chipsRef.current;
    const activeChip = container?.children[activeIndex];

    if (!container || !activeChip || container.clientWidth === 0) {
      return;
    }

    container.scrollTo({
      left: activeChip.offsetLeft - (container.clientWidth - activeChip.clientWidth) / 2,
      behavior: 'smooth',
    });
  }, [activeIndex]);

  const handleTouchStart = (event) => {
    touchStartXRef.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event) => {
    const startX = touchStartXRef.current;
    const endX = event.changedTouches[0]?.clientX;
    touchStartXRef.current = null;

    if (startX === null || endX === undefined || Math.abs(endX - startX) < SWIPE_THRESHOLD) {
      return;
    }

    onSelect(activeIndex + (endX < startX ? 1 : -1));
  };

  return (
    <section className="xl:hidden">
      <div className="text-[13px] font-semibold uppercase tracking-[0.22em] text-[#000000]">
        Bảng thành phần
      </div>
      <p className="mt-2 text-[13px] leading-6 text-[#5f5449]">
        Các hoạt chất sinh học nổi bật trong {productName}.
      </p>

      {entries.length > 1 ? (
        <div
          ref={chipsRef}
          className="relative -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:-mx-6 md:px-6 [&::-webkit-scrollbar]:hidden"
        >
          {entries.map((entry, index) => (
            <button
              key={entry.id || entry.slug || entry.name}
              type="button"
              onClick={() => onSelect(index)}
              className={`shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition ${
                index === activeIndex
                  ? 'border-[#15110d] bg-[#15110d] text-white'
                  : 'border-[#e2dcd4] bg-white text-[#5f5449]'
              }`}
            >
              {entry.name}
            </button>
          ))}
        </div>
      ) : null}

      <div
        className="mt-3 flex gap-3 rounded-[20px] bg-[#f4f3f1] p-3"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="h-[104px] w-[104px] shrink-0 overflow-hidden rounded-[14px] bg-white sm:h-[140px] sm:w-[140px]">
          {activeEntry.image ? (
            <img
              src={activeEntry.image}
              alt={activeEntry.name}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center px-2 text-center text-[12px] text-[#8d857d]">
              {activeEntry.name}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 py-0.5">
          <div className="flex items-start justify-between gap-2">
            <div className="text-[16px] font-semibold leading-5 tracking-[-0.03em] text-[#111111]">
              {activeEntry.name}
            </div>
            {entries.length > 1 ? (
              <span className="shrink-0 pt-0.5 text-[11px] text-[#9f988f]">
                {activeIndex + 1}/{entries.length}
              </span>
            ) : null}
          </div>
          {activeEntry.description ? (
            <p className="mt-1.5 line-clamp-4 text-[13px] leading-5 text-[#5f5449]">
              {activeEntry.description}
            </p>
          ) : null}
          {activeEntry.slug ? (
            <Link
              href={`/key-srx/${activeEntry.slug}`}
              className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#15110d]"
            >
              Xem chi tiết
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function DesktopIngredientShowcase({
  productName,
  entries: preparedEntries,
  activeIndex,
  onSelect: goToSlide,
  introRef,
  imageCardRef,
  listMaxHeight,
}) {
  const activeEntry = preparedEntries[activeIndex] ?? preparedEntries[0];

  return (
    <section className="hidden gap-8 xl:grid xl:grid-cols-[minmax(0,0.95fr)_minmax(420px,1fr)] xl:items-center">
      <div className="order-2 xl:order-1">
        <div ref={introRef} className="mb-10 max-w-[560px] xl:mb-12">
          <div className="text-[14px] font-semibold uppercase tracking-[0.22em] text-[#000000] font-weight-700">
            Bảng thành phần
          </div>
          <p className="mt-4 text-[15px] sm:text-[16px]  leading-7 text-[#000000] font-weight-700">
            Sự kết hợp của các hoạt chất sinh học trong {productName} mang lại hiệu quả nuôi dưỡng,
            phục hồi và tái tạo da theo từng vai trò riêng biệt.
          </p>
        </div>

        <div
          className="mt-8 xl:overflow-y-auto xl:pr-4 xl:[scrollbar-gutter:stable]"
          style={listMaxHeight ? { maxHeight: `${listMaxHeight}px` } : undefined}
        >
          {preparedEntries.map((entry, index) => {
            const isActive = index === activeIndex;

            return (
              <button
                key={entry.id || entry.slug || entry.name}
                type="button"
                onClick={() => goToSlide(index)}
                className="block w-full border-b border-[#E6E6E6] py-5 text-left transition first:pt-0 last:border-b-0 last:pb-0"
              >
                <div
                  className={`transition ${
                    isActive
                      ? 'text-[22px] font-semibold tracking-[-0.04em] text-[#111111]'
                      : 'text-[18px] font-semibold tracking-[-0.03em] text-[#787878]'
                  }`}
                >
                  {entry.name}
                </div>
                {entry.description ? (
                  <p
                    className={`mt-2 max-w-[560px] text-[14px] leading-7 transition ${
                      isActive ? 'text-[#5f5449]' : 'text-[#9f988f]'
                    }`}
                  >
                    {entry.description}
                  </p>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <div className="order-1 xl:order-2">
        <div ref={imageCardRef} className="relative overflow-hidden rounded-[28px] bg-[#f4f3f1]">
          <div className="aspect-[0.92/1] min-h-[420px] pb-[110px] md:min-h-[560px] md:pb-[126px]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.86),transparent_54%)]" />

            {preparedEntries.map((entry, index) => {
              const isActive = index === activeIndex;

              return (
                <div
                  key={entry.id || entry.slug || entry.name}
                  className={`absolute inset-0 transition-all duration-500 ease-out ${
                    isActive
                      ? 'translate-x-0 opacity-100'
                      : 'pointer-events-none translate-x-8 opacity-0'
                  }`}
                  aria-hidden={!isActive}
                >
                  {entry.image ? (
                    <img
                      src={entry.image}
                      alt={entry.name}
                      className="absolute inset-0 h-full w-full object-cover"
                      loading={isActive ? 'eager' : 'lazy'}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center px-8 text-center text-[16px] text-[#8d857d]">
                      {entry.name}
                    </div>
                  )}
                </div>
              );
            })}

            <div className="absolute inset-x-0 bottom-0 z-[2] px-4 py-4 backdrop-blur md:px-7 md:py-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <Link href={`/key-srx/${activeEntry.slug}`} className="mt-2 text-[18px] sm:text-[24px] font-semibold tracking-[-0.04em] text-[#15110d]">
                    {activeEntry.name}
                  </Link> <br></br>
                  {activeEntry.slug ? (
                    <Link
                      href={`/key-srx/${activeEntry.slug}`}
                      className="mt-3 inline-flex text-[10px] sm:text-[12px] font-medium uppercase tracking-[0.18em] text-[#15110d] transition hover:text-[#788ce6]"
                    >
                      Xem chi tiết thành phần
                    </Link>
                  ) : null}
                </div>

                {preparedEntries.length > 1 ? (
                  <div className="flex items-center gap-2 self-start sm:self-auto mx-auto sm:mx-0">
                    <button
                      type="button"
                      onClick={() => goToSlide(activeIndex - 1)}
                      className="inline-flex h-8 w-8 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-[#d7d0c7] bg-white/85 text-[#15110d] transition hover:border-[#15110d] hover:bg-[#15110d] hover:text-white"
                      aria-label="Thành phần trước"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>

                    <div className="flex items-center gap-2">
                      {preparedEntries.map((entry, index) => (
                        <button
                          key={`dot-${entry.id || entry.slug || entry.name}`}
                          type="button"
                          onClick={() => goToSlide(index)}
                          className={`h-2.5 rounded-full transition ${
                            index === activeIndex ? 'w-8 bg-[#15110d]' : 'w-2.5 bg-[#d6cec4]'
                          }`}
                          aria-label={`Xem thành phần ${entry.name}`}
                        />
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => goToSlide(activeIndex + 1)}
                      className="inline-flex h-8 w-8 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-[#d7d0c7] bg-white/85 text-[#15110d] transition hover:border-[#15110d] hover:bg-[#15110d] hover:text-white"
                      aria-label="Thành phần tiếp theo"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
