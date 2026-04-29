'use client';

import Link from 'next/link';
import { useDeferredValue, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import SRXLogo from '../components/home/SrxLogo.jsx';
import AboutContactSection from '../components/aboutus/AboutContactSection.jsx';

const UI_TEXT = {
  heroEyebrow: 'Key SRX',
  heroTitle: 'T\u1eeb \u0111i\u1ec3n th\u00e0nh ph\u1ea7n',
  heroDescription:
    'Mỗi thành phần hoạt động hài hòa để nuôi dưỡng, bảo vệ và phục hồi sự cân bằng tự nhiên của làn da. Khám phá những thành phần chính làm nên sự khác biệt thực sự của sản phẩm chúng tôi.',
  all: 'T\u1ea5t c\u1ea3',
  searchPlaceholder: 'T\u00ecm ki\u1ebfm',
  emptyTitle: 'Không tìm thấy thành phần phù hợp',
  emptyBody:
    'Hãy thử đổi từ khóa tìm kiếm hoặc chọn nhóm thành phần khác.',
  previousTags: 'Cu\u1ed9n nh\u00f3m tr\u01b0\u1edbc',
  nextTags: 'Cu\u1ed9n nh\u00f3m ti\u1ebfp theo',
};

function normalizeValue(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function parseTagLabels(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  const rawValue = String(value ?? '').trim();

  if (!rawValue) {
    return [];
  }

  if (rawValue.startsWith('[') && rawValue.endsWith(']')) {
    try {
      const parsedValue = JSON.parse(rawValue);
      if (Array.isArray(parsedValue)) {
        return parsedValue.map((item) => String(item).trim()).filter(Boolean);
      }
    } catch {
      return rawValue
        .replace(/^\[|\]$/g, '')
        .split(/","|',\s*'|",\s*"|,\s*/)
        .map((item) => item.replace(/^['"]|['"]$/g, '').trim())
        .filter(Boolean);
    }
  }

  return rawValue
    .split(/\s*\|\|\s*|\s*,\s*|\s*;\s*/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeImagePath(path = '') {
  const normalizedPath = String(path ?? '').trim();

  if (!normalizedPath) {
    return '';
  }

  if (/^https?:\/\//i.test(normalizedPath)) {
    return normalizedPath;
  }

  return normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`;
}

function buildPreparedEntries(entries = []) {
  return entries
    .filter((entry) => entry?.name && entry?.slug)
    .map((entry) => {
      const tags = parseTagLabels(entry.tags);

      return {
        ...entry,
        description: String(entry.description ?? '').trim(),
        image: normalizeImagePath(entry.image),
        tags,
        searchIndex: normalizeValue(
          `${entry.name} ${entry.slug} ${entry.description ?? ''} ${tags.join(' ')}`,
        ),
      };
    })
    .sort((firstEntry, secondEntry) => firstEntry.name.localeCompare(secondEntry.name, 'vi'));
}

function IngredientCard({ entry }) {
  return (
    <Link href={`/products/${encodeURIComponent(entry.slug)}`} className="group block">
      <article>
        <div className="relative aspect-[0.96/1.06] overflow-hidden rounded-[12px] bg-[#f4f3f1]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.9),transparent_55%)]" />
          {entry.image ? (
            <img
              src={entry.image}
              alt={entry.name}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center p-8 text-center text-[14px] text-[#8a8379]">
              {entry.name}
            </div>
          )}
        </div>

        <div className="mt-4">
          <h2 className="text-[20px] font-semibold tracking-[-0.03em] text-[#15110d] transition-colors group-hover:text-[#7C93F1]">
            {entry.name}
          </h2>
          <p className="mt-2 text-[14px] leading-6 text-[#6f685f]">
            {entry.description}
          </p>
        </div>
      </article>
    </Link>
  );
}

export default function KeySRXPage({ entries = [] }) {
  const chipsRef = useRef(null);
  const preparedEntries = useMemo(() => buildPreparedEntries(entries), [entries]);
  const tagFilters = useMemo(() => {
    const seen = new Set();
    const labels = [];

    preparedEntries.forEach((entry) => {
      entry.tags.forEach((tag) => {
        if (!seen.has(tag)) {
          seen.add(tag);
          labels.push(tag);
        }
      });
    });

    return [UI_TEXT.all, ...labels];
  }, [preparedEntries]);
  const [selectedFilter, setSelectedFilter] = useState(UI_TEXT.all);
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearch = useDeferredValue(searchQuery);
  const normalizedSearch = useMemo(() => normalizeValue(deferredSearch), [deferredSearch]);

  const visibleEntries = useMemo(
    () =>
      preparedEntries.filter((entry) => {
        const matchesFilter =
          selectedFilter === UI_TEXT.all || entry.tags.includes(selectedFilter);
        const matchesSearch =
          !normalizedSearch || entry.searchIndex.includes(normalizedSearch);

        return matchesFilter && matchesSearch;
      }),
    [normalizedSearch, preparedEntries, selectedFilter],
  );

  const scrollChips = (direction) => {
    if (!chipsRef.current) {
      return;
    }

    chipsRef.current.scrollBy({
      left: direction === 'next' ? 320 : -320,
      behavior: 'smooth',
    });
  };

  return (
    <section className="bg-white">
      <div className="mx-auto w-full">
        <section
          className="relative min-h-[480px] overflow-hidden md:min-h-[720px]"
          style={{
            backgroundImage: "url('/assets/images/key-srx/bg-key-srx.webp')",
            backgroundPosition: 'center',
            backgroundSize: 'cover',
          }}
        >
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))]" />

          <div className="relative flex w-full min-h-[480px] items-end px-8 pb-8 pt-16 md:min-h-[720px] md:px-12 md:pb-12 xl:px-12">
            <div className="flex w-full flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="text-[15px] font-medium uppercase tracking-[0.24em] text-white/80">
                  {UI_TEXT.heroEyebrow}
                </div>
                <h1 className="mt-4 text-[34px] font-semibold tracking-[-0.05em] text-white md:text-[52px]">
                  {UI_TEXT.heroTitle}
                </h1>
              </div>

              <p className="max-w-[480px] text-[14px] leading-6 text-white md:text-[16px]">
                {UI_TEXT.heroDescription}
              </p>
            </div>
          </div>
        </section>

        <section className="max-w-[1840px] mx-auto px-4 sm:px-8 pt-8 md:pt-32 pb-12">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div ref={chipsRef} className="flex min-w-0 gap-3 overflow-x-auto pb-2">
                {tagFilters.map((filterLabel) => {
                  const isActive = selectedFilter === filterLabel;

                  return (
                    <button
                      key={filterLabel}
                      type="button"
                      onClick={() => setSelectedFilter(filterLabel)}
                      className={`whitespace-nowrap rounded-full border px-4 py-2 text-[13px] transition ${
                        isActive
                          ? 'border-transparent bg-[linear-gradient(90deg,#8e9bff,#f4a7d5)] text-white shadow-[0_12px_30px_rgba(163,153,255,0.24)]'
                          : 'border-[#d9d5cf] bg-white text-[#6d665f] hover:border-[#15110d] hover:text-[#15110d]'
                      }`}
                    >
                      {filterLabel}
                    </button>
                  );
                })}
              </div>

              <div className="hidden items-center gap-2 md:flex">
                <button
                  type="button"
                  onClick={() => scrollChips('prev')}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d7d3cd] text-[#6b645d] transition hover:border-[#15110d] hover:text-[#15110d]"
                  aria-label={UI_TEXT.previousTags}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollChips('next')}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d7d3cd] text-[#6b645d] transition hover:border-[#15110d] hover:text-[#15110d]"
                  aria-label={UI_TEXT.nextTags}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <label className="flex h-[48px] w-full items-center gap-3 border-b border-[#d8d2ca] text-[#8b847c] xl:max-w-[260px]">
              <Search className="h-4 w-4 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={UI_TEXT.searchPlaceholder}
                className="w-full bg-transparent text-[14px] text-[#15110d] outline-none placeholder:text-[#aaa39b]"
              />
            </label>
          </div>

          {visibleEntries.length ? (
            <div className="mt-8 grid gap-x-6 gap-y-10 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visibleEntries.map((entry) => (
                <IngredientCard key={entry.id} entry={entry} />
              ))}
            </div>
          ) : (
            <div className="mt-10 px-6 py-16 text-center">
              <div className="text-[28px] font-semibold tracking-[-0.04em] text-[#15110d]">
                {UI_TEXT.emptyTitle}
              </div>
              <p className="mt-3 text-[15px] leading-7 text-[#756d63]">
                {UI_TEXT.emptyBody}
              </p>
            </div>
          )}
        </section>
      </div>

      <AboutContactSection />
      <SRXLogo />
    </section>
  );
}

