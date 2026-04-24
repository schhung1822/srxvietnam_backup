'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function buildPreparedEntries(entries = []) {
  return entries.filter((entry) => entry?.name);
}

export default function ProductIngredientShowcase({ productName, entries = [] }) {
  const preparedEntries = useMemo(() => buildPreparedEntries(entries), [entries]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [productName, preparedEntries.length]);

  if (!preparedEntries.length) {
    return null;
  }

  const activeEntry = preparedEntries[activeIndex] ?? preparedEntries[0];

  const goToSlide = (nextIndex) => {
    if (!preparedEntries.length) {
      return;
    }

    const normalizedIndex = (nextIndex + preparedEntries.length) % preparedEntries.length;
    setActiveIndex(normalizedIndex);
  };

  return (
    <section className="grid gap-8 xl:grid-cols-[minmax(0,0.95fr)_minmax(420px,1fr)] xl:items-start">
      <div className="order-2 xl:order-1">
        <div className="max-w-[560px]">
          <div className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#8d7f72]">
            Bảng thành phần
          </div>
          <p className="mt-4 text-[15px] leading-7 text-[#5f5449]">
            Sự kết hợp của các hoạt chất sinh học trong {productName} mang lại hiệu quả nuôi dưỡng,
            phục hồi và tái tạo da theo từng vai trò riêng biệt.
          </p>
        </div>

        <div className="mt-8">
          {preparedEntries.map((entry, index) => {
            const isActive = index === activeIndex;

            return (
              <button
                key={entry.id || entry.slug || entry.name}
                type="button"
                onClick={() => goToSlide(index)}
                className="block w-full border-b border-[#ebe4da] py-5 text-left transition first:pt-0 last:border-b-0 last:pb-0"
              >
                <div
                  className={`transition ${
                    isActive
                      ? 'text-[22px] font-semibold tracking-[-0.04em] text-[#15110d]'
                      : 'text-[18px] font-semibold tracking-[-0.03em] text-[#9a938a]'
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
        <div className="relative overflow-hidden rounded-[28px] bg-[#f4f3f1]">
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

            <div className="absolute inset-x-0 bottom-0 z-[2] px-5 py-5 backdrop-blur md:px-7 md:py-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="mt-2 text-[24px] font-semibold tracking-[-0.04em] text-[#15110d]">
                    {activeEntry.name}
                  </div>
                </div>

                {preparedEntries.length > 1 ? (
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => goToSlide(activeIndex - 1)}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#d7d0c7] bg-white/85 text-[#15110d] transition hover:border-[#15110d] hover:bg-[#15110d] hover:text-white"
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
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#d7d0c7] bg-white/85 text-[#15110d] transition hover:border-[#15110d] hover:bg-[#15110d] hover:text-white"
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
