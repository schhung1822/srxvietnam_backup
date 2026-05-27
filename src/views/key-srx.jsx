'use client';

import Link from 'next/link';
import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpRight, ChevronDown, Search, SlidersHorizontal, Star, X } from 'lucide-react';
import SRXLogo from '../components/home/SrxLogo.jsx';
import AboutContactSection from '../components/aboutus/AboutContactSection.jsx';

const UI_TEXT = {
  pageTitle: 'Từ điển thành phần',
  heroEyebrow: 'Key SRX',
  heroTitle: 'Từ điển thành phần',
  heroDescription:
    'Mỗi thành phần hoạt động hài hòa để nuôi dưỡng, bảo vệ và phục hồi sự cân bằng tự nhiên của làn da. Khám phá những thành phần chính làm nên sự khác biệt thực sự của sản phẩm chúng tôi.',
  searchPlaceholder: 'Tìm kiếm tên thành phần',
  filterTitle: 'Lọc theo',
  stars: 'Đánh giá',
  benefits: 'Lợi ích',
  classes: 'Phân loại',
  sort: 'Sắp xếp theo:',
  clearFilters: 'Xóa bộ lọc',
  mobileFilters: 'Bộ lọc',
  closeFilters: 'Đóng bộ lọc',
  emptyTitle: 'Không tìm thấy thành phần phù hợp',
  emptyBody:
    'Hãy thử đổi từ khóa hoặc bỏ bớt bộ lọc để xem thêm thành phần khác.',
  viewMore: 'xem thêm',
  viewLess: 'thu gọn',
  readMore: 'Xem thêm',
  resultCount: 'thành phần',
  unrated: 'Chưa xếp hạng',
  linkedProducts: 'Sản phẩm chứa thành phần này',
  heroStatIngredients: 'Thành phần',
  heroStatProducts: 'Sản phẩm liên kết',
  heroStatTopRated: 'Đánh giá cao nhất',
  previousPage: 'Trang trước',
  nextPage: 'Trang sau',
};

const SORT_OPTIONS = [
  { id: 'name-asc', label: 'Tên A-Z' },
  { id: 'name-desc', label: 'Tên Z-A' },
  { id: 'stars-asc', label: 'Đánh giá từ thấp đến cao' },
  { id: 'stars-desc', label: 'Đánh giá từ cao đến thấp' },
];

const ITEMS_PER_PAGE = 10;

function normalizeValue(value = '') {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
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

function normalizeStarsValue(value) {
  const parsedValue = Number.parseInt(value, 10);

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return 0;
  }

  return Math.min(5, Math.max(1, parsedValue));
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

function parseClassLabels(value) {
  return uniqueInOrder(
    String(value ?? '')
      .split(/\s*\|\|\s*|\s*,\s*|\s*;\s*/)
      .map((item) => item.trim())
      .filter(Boolean),
  );
}

function uniqueInOrder(values) {
  const seen = new Set();

  return values.filter((value) => {
    const normalized = String(value ?? '').trim();

    if (!normalized || seen.has(normalized)) {
      return false;
    }

    seen.add(normalized);
    return true;
  });
}

function buildPreparedEntries(entries = []) {
  return entries
    .filter((entry) => entry?.name && entry?.slug)
    .map((entry) => {
      const tags = parseTagLabels(entry.tags);
      const ingredientClass = String(entry.ingredientClass ?? entry.class ?? '').trim();
      const classLabels = parseClassLabels(ingredientClass);
      const description = String(entry.description ?? '').trim();
      const longDescription = String(entry.longDescription ?? '').trim();
      const stars = normalizeStarsValue(entry.stars);

      return {
        ...entry,
        description,
        longDescription,
        image: normalizeImagePath(entry.image),
        tags,
        stars,
        ingredientClass,
        classLabels,
        linkedProductCount: Number(entry.linkedProductCount ?? 0),
        searchIndex: normalizeValue(
          [
            entry.name,
            entry.slug,
            description,
            longDescription,
            ingredientClass,
            classLabels.join(' '),
            tags.join(' '),
            stars ? `${stars} sao` : '',
          ].join(' '),
        ),
      };
    })
    .sort((firstEntry, secondEntry) => firstEntry.name.localeCompare(secondEntry.name, 'vi'));
}

function sortEntries(entries, sortBy) {
  const nextEntries = [...entries];

  if (sortBy === 'name-desc') {
    return nextEntries.sort((firstEntry, secondEntry) =>
      secondEntry.name.localeCompare(firstEntry.name, 'vi'),
    );
  }

  if (sortBy === 'stars-asc') {
    return nextEntries.sort((firstEntry, secondEntry) => {
      if (firstEntry.stars !== secondEntry.stars) {
        return firstEntry.stars - secondEntry.stars;
      }

      return firstEntry.name.localeCompare(secondEntry.name, 'vi');
    });
  }

  if (sortBy === 'stars-desc') {
    return nextEntries.sort((firstEntry, secondEntry) => {
      if (secondEntry.stars !== firstEntry.stars) {
        return secondEntry.stars - firstEntry.stars;
      }

      return firstEntry.name.localeCompare(secondEntry.name, 'vi');
    });
  }

  return nextEntries.sort((firstEntry, secondEntry) =>
    firstEntry.name.localeCompare(secondEntry.name, 'vi'),
  );
}

function buildSidebarOptions(entries) {
  const starValues = [1, 2, 3, 4, 5];
  const benefitValues = uniqueInOrder(entries.flatMap((entry) => entry.tags));
  const classValues = uniqueInOrder(entries.flatMap((entry) => entry.classLabels ?? []));

  return {
    starOptions: starValues.map((starsValue) => ({
      id: String(starsValue),
      label: `${starsValue} sao`,
      count: entries.filter((entry) => entry.stars === starsValue).length,
    })),
    benefitOptions: benefitValues.map((benefit) => ({
      id: benefit,
      label: benefit,
      count: entries.filter((entry) => entry.tags.includes(benefit)).length,
    })),
    classOptions: classValues.map((ingredientClass) => ({
      id: ingredientClass,
      label: ingredientClass,
      count: entries.filter((entry) => (entry.classLabels ?? []).includes(ingredientClass)).length,
    })),
  };
}

function StarsDisplay({ value, size = 'sm' }) {
  if (!value) {
    return <span className="text-[12px] text-[#8e8e8e]">{UI_TEXT.unrated}</span>;
  }

  const iconSize = size === 'lg' ? 'h-[15px] w-[15px]' : 'h-[13px] w-[13px]';

  return (
    <div className="flex items-center gap-1 text-[#7C93F1]">
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={`stars-${value}-${index + 1}`}
          className={`${iconSize} ${index < value ? 'fill-current' : 'text-[#d3d3d3]'}`}
          strokeWidth={1.8}
        />
      ))}
    </div>
  );
}

function HeroBanner() {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="relative overflow-hidden bg-[#bfc3ff]">
        <div
          className="absolute inset-0 hidden bg-center bg-no-repeat lg:block"
          style={{
            backgroundImage: "url('/assets/images/key-srx/bg_keysrx.webp')",
            backgroundSize: 'cover',
          }}
        />
        <div
          className="absolute inset-0 bg-center bg-cover bg-no-repeat lg:hidden"
          style={{ backgroundImage: "url('/assets/images/key-srx/bg_keysrx.webp')" }}
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(137,148,246,0.04),rgba(119,134,238,0.08))]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(0deg,rgba(88,101,212,0.34)_0%,rgba(88,101,212,0.12)_18%,rgba(255,255,255,0)_42%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.55),rgba(255,255,255,0)_24%)]" />

        <div className="relative z-[2] aspect-square lg:min-h-[500px] lg:aspect-[21/9]">
          <div className="mx-auto flex h-full max-w-[1440px] px-6 pb-6 pt-28 sm:px-8 sm:pb-8 sm:pt-32 lg:flex-col justify-end lg:px-8 lg:pb-8">
            <div className="max-w-[560px]">
              <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white">
                {UI_TEXT.heroEyebrow}
              </div>
              <h1 className="mt-3 text-[32px] font-medium leading-[0.98] tracking-[-0.06em] text-white sm:text-[40px] lg:text-[56px]">
                {UI_TEXT.heroTitle}
              </h1>
              <p className="mt-4 max-w-[560px] text-[13px] leading-6 text-white sm:text-[14px] sm:leading-7 lg:max-w-[520px]">
                {UI_TEXT.heroDescription}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FilterChecklistSection({
  title,
  options,
  selectedValue,
  onSelect,
  formatOptionLabel,
  defaultVisibleCount = 5,
}) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setExpanded(false);
  }, [options]);

  if (!options.length) {
    return null;
  }

  const visibleOptions = expanded ? options : options.slice(0, defaultVisibleCount);

  return (
    <div className="border-t border-[#e4ded6] pt-5 first:border-t-0 first:pt-0">
      <h3 className="text-[13px] font-semibold uppercase tracking-[0.04em] text-[#171717]">
        {title}
      </h3>

      <div className="mt-3 space-y-2">
        {visibleOptions.map((option) => {
          const isChecked = selectedValue === option.id;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(isChecked ? '' : option.id)}
              className="flex w-full items-start gap-2.5 text-left text-[13px] leading-5 text-[#4c4c4c] transition hover:text-[#111111]"
            >
              <span
                className={`mt-[3px] flex h-[14px] w-[14px] shrink-0 items-center justify-center rounded-full border transition ${
                  isChecked ? 'border-[#4646FA] bg-white' : 'border-[#bcbcbc] bg-white'
                }`}
              >
                <span
                  className={`h-[6px] w-[6px] rounded-full transition ${
                    isChecked ? 'bg-[#7C93F1]' : 'bg-transparent'
                  }`}
                />
              </span>
              <span>{formatOptionLabel ? formatOptionLabel(option) : `${option.label} (${option.count})`}</span>
            </button>
          );
        })}
      </div>

      {options.length > defaultVisibleCount ? (
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="mt-2 text-[12px] capitalize text-[#7C93F1] transition hover:text-[#F6BFDF]"
        >
          {expanded ? UI_TEXT.viewLess : UI_TEXT.viewMore}
        </button>
      ) : null}
    </div>
  );
}

function SidebarFilters({
  searchQuery,
  setSearchQuery,
  selectedStars,
  setSelectedStars,
  selectedBenefit,
  setSelectedBenefit,
  selectedClass,
  setSelectedClass,
  starOptions,
  benefitOptions,
  classOptions,
  resetFilters,
  className = '',
}) {
  return (
    <div
      className={`rounded-[20px] border border-[#ebe4db] bg-[#fff] p-5 shadow-[0_24px_70px_rgba(17,17,17,0.06)] sm:p-6 ${className}`}
    >
      <label className="flex h-[44px] items-center gap-3 rounded-full border border-[#d9d3cb] bg-white px-4 text-[#777777] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
        <input
          type="text"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder={UI_TEXT.searchPlaceholder}
          className="w-full bg-transparent text-[13px] text-[#111111] outline-none placeholder:text-[#9d9d9d]"
        />
        <Search className="h-4 w-4 shrink-0 text-[#111111]" />
      </label>

      <div className="mt-7">
        <div className="text-[28px] font-semibold uppercase leading-none tracking-[-0.02em] text-[#111111]">
          {UI_TEXT.filterTitle}
        </div>
        <div className="mt-4 h-px w-full bg-[#1d1d1d]" />
      </div>

      <div className="mt-6 space-y-5">
        <FilterChecklistSection
          title={UI_TEXT.stars}
          options={starOptions}
          selectedValue={selectedStars}
          onSelect={setSelectedStars}
          formatOptionLabel={(option) => (
            <span className="inline-flex items-center gap-2">
              <StarsDisplay value={Number(option.id)} size="lg" />
              <span className="text-[12px] text-[#5d5d5d]">({option.count})</span>
            </span>
          )}
        />

        <FilterChecklistSection
          title={UI_TEXT.benefits}
          options={benefitOptions}
          selectedValue={selectedBenefit}
          onSelect={setSelectedBenefit}
        />

        <FilterChecklistSection
          title={UI_TEXT.classes}
          options={classOptions}
          selectedValue={selectedClass}
          onSelect={setSelectedClass}
        />
      </div>

      <button
        type="button"
        onClick={resetFilters}
        className="mt-7 text-[12px] font-medium uppercase tracking-[0.04em] text-[#111111] transition hover:text-[#3451e6]"
      >
        {UI_TEXT.clearFilters}
      </button>
    </div>
  );
}

function ActiveFilterPills({
  selectedStars,
  selectedBenefit,
  selectedClass,
  setSelectedStars,
  setSelectedBenefit,
  setSelectedClass,
  searchQuery,
}) {
  const pills = [
    ...(selectedStars
      ? [
          {
            id: `stars-${selectedStars}`,
            label: `${selectedStars} sao`,
            onRemove: () => setSelectedStars(''),
          },
        ]
      : []),
    ...(selectedBenefit
      ? [
          {
            id: `benefit-${selectedBenefit}`,
            label: selectedBenefit,
            onRemove: () => setSelectedBenefit(''),
          },
        ]
      : []),
    ...(selectedClass
      ? [
          {
            id: `class-${selectedClass}`,
            label: selectedClass,
            onRemove: () => setSelectedClass(''),
          },
        ]
      : []),
  ];

  if (!pills.length && !searchQuery) {
    return null;
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      {pills.map((pill) => (
        <button
          key={pill.id}
          type="button"
          onClick={pill.onRemove}
          className="inline-flex items-center gap-2 rounded-full bg-[#D2D1F3] px-3 py-1.5 text-[12px] text-[#111] transition hover:bg-[#969DEE]"
        >
          <span>{pill.label}</span>
          <span className="text-[11px]">x</span>
        </button>
      ))}
    </div>
  );
}

function IngredientListItem({ entry }) {
  return (
    <article className="group border-b border-[#ece6de] py-8 first:pt-0 last:border-b-0">
      <div className="grid grid-cols-[108px_minmax(0,1fr)] gap-4 sm:grid-cols-[126px_minmax(0,1fr)] sm:gap-5 lg:grid-cols-[208px_minmax(0,1fr)] lg:items-start lg:gap-8">
        <Link href={`/key-srx/${encodeURIComponent(entry.slug)}`} className="block">
          <div className="relative aspect-square overflow-hidden rounded-[16px] shadow-[0_18px_44px_rgba(18,18,18,0.06)] transition duration-500 group-hover:-translate-y-1 group-hover:shadow-[0_24px_60px_rgba(18,18,18,0.1)] lg:rounded-[18px]">
            <div className="absolute inset-0" />
            {entry.image ? (
              <img
                src={entry.image}
                alt={entry.name}
                className="relative z-[1] h-full w-full object-cover transition duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
                loading="lazy"
              />
            ) : (
              <div className="relative z-[1] flex h-full items-center justify-center px-6 text-center text-[14px] text-[#7a7a7a]">
                {entry.name}
              </div>
            )}
          </div>
        </Link>

        <div className="min-w-0 pt-1">
          <div className="flex flex-wrap items-center gap-2.5 text-[12px] text-[#656565]">
            <StarsDisplay value={entry.stars} />
          </div>

          <h2 className="mt-2 text-[20px] font-semibold leading-[1.05] tracking-[-0.04em] text-[#111111] sm:text-[22px] lg:mt-3 lg:text-[28px]">
            <Link href={`/key-srx/${encodeURIComponent(entry.slug)}`} className="transition hover:text-[#3451e6]">
              {entry.name}
            </Link>
          </h2>

          <p className="mt-2 max-w-[620px] text-[13px] leading-5 text-[#4f4f4f] sm:text-[14px] sm:leading-6 lg:mt-3 lg:text-[15px] lg:leading-7">
            {entry.description || entry.longDescription || 'Chua co mo ta chi tiet cho thanh phan nay.'}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 lg:mt-5 lg:pt-4">
            <span className="text-[11px] text-[#6c645b] sm:text-[12px]">
              {entry.linkedProductCount} {UI_TEXT.linkedProducts}
            </span>

            <Link
              href={`/key-srx/${encodeURIComponent(entry.slug)}`}
              className="inline-flex items-center gap-2 text-[13px] font-medium text-[#7C93F1] transition hover:text-[#d3a0be] lg:text-[14px]"
            >
              <span>{UI_TEXT.readMore}</span>
              <ArrowUpRight className="h-4 w-4" strokeWidth={1.9} />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

function SortDropdown({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const activeOption = SORT_OPTIONS.find((option) => option.id === value) ?? SORT_OPTIONS[0];

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!dropdownRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="inline-flex h-[38px] min-w-[180px] items-center justify-between gap-3 rounded-[12px] border border-[#d9d3cb] bg-[#fbfaf8] px-3.5 text-[13px] text-[#111111] shadow-[0_12px_24px_rgba(17,17,17,0.04)] transition hover:border-[#c5beb5]"
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <span>{activeOption.label}</span>
        <ChevronDown className={`h-4 w-4 transition ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <div
        className={`absolute right-0 top-full z-20 mt-2 w-[240px] rounded-[18px] border border-[#e6dfd6] bg-white p-2 shadow-[0_24px_60px_rgba(17,17,17,0.12)] transition-all duration-200 ${
          isOpen ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-1 opacity-0'
        }`}
      >
        {SORT_OPTIONS.map((option) => {
          const isActive = option.id === value;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                onChange(option.id);
                setIsOpen(false);
              }}
              className={`flex w-full items-center rounded-[12px] px-3 py-2.5 text-left text-[13px] transition ${
                isActive
                  ? 'bg-[#7C93F1] text-white'
                  : 'text-[#2f2f2f] hover:bg-[#D2D1F3]'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Pagination({ currentPage, totalPages, onChange }) {
  if (totalPages <= 1) {
    return null;
  }

  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, startPage + 4);
  const pageNumbers = [];

  for (let page = startPage; page <= endPage; page += 1) {
    pageNumbers.push(page);
  }

  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-2 pt-6">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="rounded-full border border-[#d9d3cb] px-4 py-2 text-[13px] text-[#111111] transition disabled:cursor-not-allowed disabled:opacity-40 hover:border-[#111111]"
      >
        {UI_TEXT.previousPage}
      </button>

      {pageNumbers.map((pageNumber) => {
        const isActive = pageNumber === currentPage;

        return (
          <button
            key={`page-${pageNumber}`}
            type="button"
            onClick={() => onChange(pageNumber)}
            className={`h-10 min-w-10 rounded-full px-3 text-[13px] transition ${
              isActive
                ? 'bg-[#111827] text-white'
                : 'border border-[#d9d3cb] text-[#111111] hover:border-[#111111]'
            }`}
          >
            {pageNumber}
          </button>
        );
      })}

      <button
        type="button"
        onClick={() => onChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="rounded-full border border-[#d9d3cb] px-4 py-2 text-[13px] text-[#111111] transition disabled:cursor-not-allowed disabled:opacity-40 hover:border-[#111111]"
      >
        {UI_TEXT.nextPage}
      </button>
    </div>
  );
}

function MobileFilterDrawer({ isOpen, onClose, children }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[10000] xl:hidden">
      <button
        type="button"
        aria-label={UI_TEXT.closeFilters}
        className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      <div className="fixed bottom-0 left-0 top-0 flex h-[100dvh] w-[88vw] max-w-[360px] flex-col border-r border-[#e9e3da] bg-white px-5 py-5 shadow-[0_24px_60px_rgba(17,17,17,0.12)] animate-slide-in-left">
        <div className="shrink-0">
          <div className="flex items-center justify-between border-b border-[#e9e3da] pb-4">
            <div className="text-[22px] font-semibold tracking-[-0.04em] text-[#15110d]">
              {UI_TEXT.mobileFilters}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-[#15110d] transition hover:bg-[#f5efe7]"
              aria-label={UI_TEXT.closeFilters}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function KeySRXPage({ entries = [] }) {
  const resultsSectionRef = useRef(null);
  const hasMountedScrollRef = useRef(false);
  const preparedEntries = useMemo(() => buildPreparedEntries(entries), [entries]);
  const { starOptions, benefitOptions, classOptions } = useMemo(
    () => buildSidebarOptions(preparedEntries),
    [preparedEntries],
  );
  const [selectedStars, setSelectedStars] = useState('');
  const [selectedBenefit, setSelectedBenefit] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [sortBy, setSortBy] = useState('name-asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const deferredSearch = useDeferredValue(searchQuery);
  const normalizedSearch = useMemo(() => normalizeValue(deferredSearch), [deferredSearch]);

  const filteredEntries = useMemo(() => {
    const nextEntries = preparedEntries.filter((entry) => {
      const matchesStars = !selectedStars || selectedStars === String(entry.stars);
      const matchesBenefits = !selectedBenefit || entry.tags.includes(selectedBenefit);
      const matchesClasses = !selectedClass || (entry.classLabels ?? []).includes(selectedClass);
      const matchesSearch =
        !normalizedSearch || entry.searchIndex.includes(normalizedSearch);

      return matchesStars && matchesBenefits && matchesClasses && matchesSearch;
    });

    return sortEntries(nextEntries, sortBy);
  }, [
    normalizedSearch,
    preparedEntries,
    selectedBenefit,
    selectedClass,
    selectedStars,
    sortBy,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / ITEMS_PER_PAGE));
  const paginatedEntries = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredEntries.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [currentPage, filteredEntries]);

  useEffect(() => {
    if (!isMobileFiltersOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsMobileFiltersOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileFiltersOpen]);

  useEffect(() => {
    if (!hasMountedScrollRef.current) {
      hasMountedScrollRef.current = true;
      return;
    }

    if (!resultsSectionRef.current || typeof window === 'undefined') {
      return;
    }

    const topOffset = 96;
    const nextTop =
      resultsSectionRef.current.getBoundingClientRect().top + window.scrollY - topOffset;

    window.scrollTo({
      top: Math.max(0, nextTop),
      behavior: 'smooth',
    });
  }, [currentPage, selectedStars, selectedBenefit, selectedClass, sortBy]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStars, selectedBenefit, selectedClass, sortBy]);

  const resetFilters = () => {
    setSelectedStars('');
    setSelectedBenefit('');
    setSelectedClass('');
    setSortBy('name-asc');
    setSearchQuery('');
    setCurrentPage(1);
  };

  return (
    <>
      <section className="bg-[#fff]">
        <h1 className="sr-only">{UI_TEXT.pageTitle}</h1>

        <HeroBanner />

        <div className="mx-auto max-w-[1440px] pt-10 pb-12 px-4 sm:pb-20 sm:pt-16 sm:px-6 lg:px-8">
          <div className="grid gap-10 xl:grid-cols-[360px_minmax(0,1fr)] xl:gap-12">
            <aside className="hidden xl:block">
              <div className="sticky top-[100px]">
                <SidebarFilters
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  selectedStars={selectedStars}
                  setSelectedStars={setSelectedStars}
                  selectedBenefit={selectedBenefit}
                  setSelectedBenefit={setSelectedBenefit}
                  selectedClass={selectedClass}
                  setSelectedClass={setSelectedClass}
                  starOptions={starOptions}
                  benefitOptions={benefitOptions}
                  classOptions={classOptions}
                  resetFilters={resetFilters}
                />
              </div>
            </aside>

            <div className="min-w-0">
              <div
                ref={resultsSectionRef}
                className="rounded-[20px] border border-[#ebe4db] bg-white p-5 shadow-[0_24px_70px_rgba(17,17,17,0.05)] sm:p-7"
              >
                <div className="flex flex-col gap-4 pb-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center justify-center gap-3 xl:hidden">
                    <button
                      type="button"
                      onClick={() => setIsMobileFiltersOpen(true)}
                      className="inline-flex h-10 items-center gap-2 rounded-full border border-[#d8d2ca] px-4 text-[13px] font-medium text-[#111111]"
                    >
                      <SlidersHorizontal className="h-4 w-4" />
                      <span>{UI_TEXT.mobileFilters}</span>
                    </button>

                    <span className="text-[13px] text-[#6e6e6e]">
                      <span className="font-semibold text-[#111111]">{filteredEntries.length}</span>{' '}
                      {UI_TEXT.resultCount}
                    </span>
                  </div>

                  <div className="hidden xl:block text-[13px] text-[#6e6e6e]">
                    <span className="font-semibold text-[#111111]">{filteredEntries.length}</span>{' '}
                    {UI_TEXT.resultCount}
                  </div>

                  <label className="sm:ml-auto justify-center flex items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.04em] text-[#111111]">
                    <span>{UI_TEXT.sort}</span>
                    <SortDropdown value={sortBy} onChange={setSortBy} />
                  </label>
                </div>

                <ActiveFilterPills
                  selectedStars={selectedStars}
                  selectedBenefit={selectedBenefit}
                  selectedClass={selectedClass}
                  setSelectedStars={setSelectedStars}
                  setSelectedBenefit={setSelectedBenefit}
                  setSelectedClass={setSelectedClass}
                  searchQuery={searchQuery}
                />

                {filteredEntries.length ? (
                  <div className="pt-6">
                    {paginatedEntries.map((entry) => (
                      <IngredientListItem key={entry.id} entry={entry} />
                    ))}

                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onChange={setCurrentPage}
                    />
                  </div>
                ) : (
                  <div className="py-16 text-center">
                    <div className="text-[28px] font-medium tracking-[-0.04em] text-[#111111]">
                      {UI_TEXT.emptyTitle}
                    </div>
                    <p className="mx-auto mt-3 max-w-[520px] text-[15px] leading-7 text-[#575757]">
                      {UI_TEXT.emptyBody}
                    </p>
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="mt-6 inline-flex rounded-full border border-[#111111] px-5 py-2.5 text-[13px] font-medium text-[#111111] transition hover:bg-[#111111] hover:text-white"
                    >
                      {UI_TEXT.clearFilters}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <AboutContactSection />
        <SRXLogo />
      </section>

      <MobileFilterDrawer isOpen={isMobileFiltersOpen} onClose={() => setIsMobileFiltersOpen(false)}>
        <SidebarFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedStars={selectedStars}
          setSelectedStars={setSelectedStars}
          selectedBenefit={selectedBenefit}
          setSelectedBenefit={setSelectedBenefit}
          selectedClass={selectedClass}
          setSelectedClass={setSelectedClass}
          starOptions={starOptions}
          benefitOptions={benefitOptions}
          classOptions={classOptions}
          resetFilters={resetFilters}
          className="rounded-none border-0 bg-transparent p-0 pt-5 shadow-none sm:p-0 sm:pt-5"
        />
      </MobileFilterDrawer>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-in-left {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.25s ease-out;
        }

        .animate-slide-in-left {
          animation: slide-in-left 0.35s cubic-bezier(0.22, 1, 0.36, 1);
        }
      `}</style>
    </>
  );
}
