'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, RotateCcw, SlidersHorizontal, X } from 'lucide-react';
import ProductCard from '../../components/shop/ProductCard';
import AboutContactSection from '../../components/aboutus/AboutContactSection.jsx';
import SRXLogo from '../../components/home/SrxLogo.jsx';
import {
  buildProductFilterOptions,
  matchesPrice,
  priceOptions,
  sortProducts,
} from '../../lib/products/catalog.js';

const UI_TEXT = {
  all: 'T\u1ea5t c\u1ea3',
  productTitle: 'S\u1ea3n ph\u1ea9m',
  intro:
    'SRX l\u00e0 th\u01b0\u01a1ng hi\u1ec7u to\u00e0n c\u1ea7u nh\u01b0ng ch\u00fa tr\u1ecdng b\u1ea3n \u0111\u1ecba h\u00f3a. Sau th\u1eddi gian nghi\u00ean c\u1ee9u k\u1ef9 th\u1ecb tr\u01b0\u1eddng Vi\u1ec7t Nam, h\u00e3ng ph\u00e1t tri\u1ec3n s\u1ea3n ph\u1ea9m ph\u00f9 h\u1ee3p kh\u00ed h\u1eadu v\u00e0 c\u01a1 \u0111\u1ecba ng\u01b0\u1eddi Vi\u1ec7t, \u0111\u1ea3m b\u1ea3o hi\u1ec7u qu\u1ea3, an to\u00e0n cho l\u00e0n da Vi\u1ec7t v\u00e0 ch\u00e2u \u00c1.',
  filters: 'B\u1ed9 l\u1ecdc',
  results: 'k\u1ebft qu\u1ea3',
  resetFilters: '\u0110\u1eb7t l\u1ea1i b\u1ed9 l\u1ecdc',
  category: 'Danh m\u1ee5c',
  concern: 'Nhu c\u1ea7u',
  skinType: 'Lo\u1ea1i da',
  price: 'Gi\u00e1',
  productList: 'Danh s\u00e1ch s\u1ea3n ph\u1ea9m',
  visibleProducts: 's\u1ea3n ph\u1ea9m \u0111ang hi\u1ec3n th\u1ecb',
  sortDefault: 'M\u1eb7c \u0111\u1ecbnh',
  sortPriceAsc: 'Gi\u00e1 t\u0103ng d\u1ea7n',
  sortPriceDesc: 'Gi\u00e1 gi\u1ea3m d\u1ea7n',
  sortRating: '\u0110\u00e1nh gi\u00e1 cao',
  sortSold: 'B\u00e1n ch\u1ea1y',
  emptyTitle: 'Kh\u00f4ng c\u00f3 s\u1ea3n ph\u1ea9m ph\u00f9 h\u1ee3p',
  emptyBody:
    'H\u00e3y th\u1eed \u0111\u1ed5i ho\u1eb7c b\u1edbt b\u1ed9 l\u1ecdc \u0111\u1ec3 xem th\u00eam s\u1ea3n ph\u1ea9m.',
  closeFilters: '\u0110\u00f3ng b\u1ed9 l\u1ecdc',
};

const SORT_OPTIONS = [
  { id: 'featured', label: UI_TEXT.sortDefault },
  { id: 'price-asc', label: UI_TEXT.sortPriceAsc },
  { id: 'price-desc', label: UI_TEXT.sortPriceDesc },
  { id: 'rating', label: UI_TEXT.sortRating },
  { id: 'sold', label: UI_TEXT.sortSold },
];

function FilterGroup({ title, options, selectedValue, onChange, isOpen, onToggle }) {
  return (
    <div className="border-b border-[#e9e3da] pb-5">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 py-1 text-left"
        aria-expanded={isOpen}
      >
        <span className="text-[15px] font-semibold text-[#15110d]">{title}</span>
        <ChevronDown
          className={`h-4 w-4 text-[#6f6357] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      <div
        className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'pointer-events-none grid-rows-[0fr] opacity-0'
        }`}
        aria-hidden={!isOpen}
      >
        <div className="min-h-0">
          <div
            className={`space-y-3 transition-[transform,padding] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isOpen ? 'translate-y-0 pt-4' : '-translate-y-2 pt-0'
            }`}
          >
            {options.map((option) => {
              const value = typeof option === 'string' ? option : option.id;
              const label = typeof option === 'string' ? option : option.label;
              const active = selectedValue === value;

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => onChange(value)}
                  tabIndex={isOpen ? 0 : -1}
                  className="flex w-full items-center gap-3 text-left text-[14px] text-[#5e5246] transition hover:text-[#15110d]"
                >
                  <span
                    className={`h-[18px] w-[18px] rounded-full border transition ${
                      active ? 'border-[#15110d] bg-[#15110d]' : 'border-[#cfc2b2] bg-white'
                    }`}
                  />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterPanelContent({
  filteredCount,
  resetFilters,
  productCategories,
  concernOptions,
  skinTypeOptions,
  category,
  concern,
  skinType,
  price,
  setCategory,
  setConcern,
  setSkinType,
  setPrice,
  openGroups,
  toggleGroup,
  className = '',
  compact = false,
}) {
  return (
    <div className={className}>
      <div className={`border-b border-[#e9e3da] ${compact ? 'pb-5 pt-5' : 'pb-6 pt-8'}`}>
        {!compact ? (
          <div className="text-[28px] font-semibold tracking-[-0.04em] text-[#15110d]">
            {UI_TEXT.filters}
          </div>
        ) : null}
        <div className={`${compact ? '' : 'mt-3'} text-[14px] text-[#8b7c6d]`}>
          <span className="font-semibold text-[#15110d]">{filteredCount}</span> {UI_TEXT.results}
        </div>
        <button
          type="button"
          onClick={resetFilters}
          className="mt-5 inline-flex items-center gap-2 text-[13px] font-medium text-[#6a5b4c] transition hover:text-[#15110d]"
        >
          <RotateCcw className="h-4 w-4" />
          {UI_TEXT.resetFilters}
        </button>
      </div>

      <div className="space-y-6 pt-6">
        <FilterGroup
          title={UI_TEXT.category}
          options={productCategories}
          selectedValue={category}
          onChange={setCategory}
          isOpen={openGroups.category}
          onToggle={() => toggleGroup('category')}
        />
        <FilterGroup
          title={UI_TEXT.concern}
          options={concernOptions}
          selectedValue={concern}
          onChange={setConcern}
          isOpen={openGroups.concern}
          onToggle={() => toggleGroup('concern')}
        />
        <FilterGroup
          title={UI_TEXT.skinType}
          options={skinTypeOptions}
          selectedValue={skinType}
          onChange={setSkinType}
          isOpen={openGroups.skinType}
          onToggle={() => toggleGroup('skinType')}
        />
        <FilterGroup
          title={UI_TEXT.price}
          options={priceOptions}
          selectedValue={price}
          onChange={setPrice}
          isOpen={openGroups.price}
          onToggle={() => toggleGroup('price')}
        />
      </div>
    </div>
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
        className="group relative inline-flex h-[50px] min-w-[142px] items-center justify-center gap-2.5 rounded-full border border-[#ddd3c6] bg-white px-4 py-2 text-[15px] font-medium text-black shadow-[0_10px_25px_rgba(17,17,17,0.04)] transition-all duration-300 hover:border-[#15110d]"
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <span
          className={`transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isOpen ? '-translate-y-0.5' : 'group-hover:-translate-y-0.5'
          }`}
        >
          {activeOption.label}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isOpen ? 'rotate-180 -translate-y-0.5' : 'group-hover:-translate-y-0.5'
          }`}
        />
      </button>

      <div
        className={`absolute right-0 top-full z-20 mt-3 w-[240px] rounded-3xl border border-[#ece4da] bg-white p-2.5 shadow-[0_24px_60px_rgba(17,17,17,0.12)] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isOpen ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-2 opacity-0'
        }`}
      >
        <div className="space-y-2">
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
                className={`flex w-full items-center gap-2 rounded-3xl border-[1.5px] px-3 py-2.5 text-left text-[14px] transition-colors duration-200 ${
                  isActive
                    ? 'border-[#111111] bg-[#111111] text-white'
                    : 'border-[#111111] text-black hover:bg-[#111111] hover:text-white'
                }`}
              >
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MobileFilterDrawer({
  isOpen,
  onClose,
  filteredCount,
  resetFilters,
  productCategories,
  concernOptions,
  skinTypeOptions,
  category,
  concern,
  skinType,
  price,
  setCategory,
  setConcern,
  setSkinType,
  setPrice,
  openGroups,
  toggleGroup,
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 xl:hidden">
      <button
        type="button"
        aria-label={UI_TEXT.closeFilters}
        className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 left-0 flex h-full w-[88vw] max-w-[360px] flex-col border-r border-[#e9e3da] bg-white px-5 py-5 shadow-[0_24px_60px_rgba(17,17,17,0.12)] animate-slide-in-left">
        <div className="flex items-center justify-between border-b border-[#e9e3da] pb-4">
          <div className="text-[22px] font-semibold tracking-[-0.04em] text-[#15110d]">
            {UI_TEXT.filters}
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

        <div className="flex-1 overflow-y-auto">
          <FilterPanelContent
            filteredCount={filteredCount}
            resetFilters={resetFilters}
            productCategories={productCategories}
            concernOptions={concernOptions}
            skinTypeOptions={skinTypeOptions}
            category={category}
            concern={concern}
            skinType={skinType}
            price={price}
            setCategory={setCategory}
            setConcern={setConcern}
            setSkinType={setSkinType}
            setPrice={setPrice}
            openGroups={openGroups}
            toggleGroup={toggleGroup}
            compact
          />
        </div>
      </div>
    </div>
  );
}

export default function ProductListMinimalPage({ products = [] }) {
  const [category, setCategory] = useState(UI_TEXT.all);
  const [concern, setConcern] = useState(UI_TEXT.all);
  const [skinType, setSkinType] = useState(UI_TEXT.all);
  const [price, setPrice] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState({
    category: true,
    concern: true,
    skinType: true,
    price: true,
  });

  const { productCategories, concernOptions, skinTypeOptions } = useMemo(
    () => buildProductFilterOptions(products),
    [products],
  );

  const filteredProducts = useMemo(
    () =>
      sortProducts(
        products.filter((product) => {
          const matchesCategory = category === UI_TEXT.all || product.category === category;
          const matchesConcern = concern === UI_TEXT.all || product.concerns.includes(concern);
          const matchesSkinType = skinType === UI_TEXT.all || product.skinTypes.includes(skinType);

          return (
            matchesCategory && matchesConcern && matchesSkinType && matchesPrice(product, price)
          );
        }),
        sortBy,
      ),
    [category, concern, price, products, skinType, sortBy],
  );

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

  const resetFilters = () => {
    setCategory(UI_TEXT.all);
    setConcern(UI_TEXT.all);
    setSkinType(UI_TEXT.all);
    setPrice('all');
    setSortBy('featured');
    setOpenGroups({
      category: true,
      concern: true,
      skinType: true,
      price: true,
    });
  };

  const toggleGroup = (group) => {
    setOpenGroups((current) => ({
      ...current,
      [group]: !current[group],
    }));
  };

  return (
    <>
      <section className="bg-[#fff] pb-10 pt-0 sm:pt-4 md:pb-12">
        <div className="mx-auto max-w-[1840px] px-4 md:px-6 xl:px-10">
          <div className="overflow-hidden">
            <div className="grid gap-4 py-0 sm:py-8 md:grid-cols-2 md:py-10 xl:grid-cols-[0.95fr_1.02fr_0.68fr] xl:gap-6">
              <div className="flex min-h-[280px] items-center py-0 sm:py-10 md:col-span-2 md:min-h-[400px] xl:col-span-1">
                <div className="max-w-[400px]">
                  <h1 className="text-[42px] font-semibold tracking-[-0.05em] text-[#15110d] md:text-[52px]">
                    {UI_TEXT.productTitle}
                  </h1>
                  <p className="mt-5 max-w-[400px] text-[14px] leading-7 text-[#474747] sm:text-[15px]">
                    {UI_TEXT.intro}
                  </p>
                </div>
              </div>

              <div className="hidden overflow-hidden rounded-[16px] bg-[#eef4ff] sm:block">
                <img
                  src="/assets/images/products/banner_product2.webp"
                  alt="SRX product campaign"
                  className="h-full w-full object-cover"
                  loading="eager"
                />
              </div>

              <div className="hidden overflow-hidden rounded-[16px] bg-[#eef4ff] sm:block">
                <img
                  src="/assets/images/products/banner_product.webp"
                  alt="SRX skincare routine"
                  className="h-full w-full object-cover"
                  loading="eager"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-10 xl:grid-cols-[240px_minmax(0,1fr)]">
            <aside className="hidden xl:sticky xl:top-[110px] xl:block xl:self-start">
              <FilterPanelContent
                filteredCount={filteredProducts.length}
                resetFilters={resetFilters}
                productCategories={productCategories}
                concernOptions={concernOptions}
                skinTypeOptions={skinTypeOptions}
                category={category}
                concern={concern}
                skinType={skinType}
                price={price}
                setCategory={setCategory}
                setConcern={setConcern}
                setSkinType={setSkinType}
                setPrice={setPrice}
                openGroups={openGroups}
                toggleGroup={toggleGroup}
              />
            </aside>

            <div className="min-w-0">
              <div className="mb-8 flex flex-col gap-4 pb-5 pt-0 sm:pt-8 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="mt-2 text-[14px] text-[#8b7c6d]">
                    {filteredProducts.length} {UI_TEXT.visibleProducts}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsMobileFiltersOpen(true)}
                    className="inline-flex h-[50px] items-center justify-center gap-2.5 rounded-full border border-[#ddd3c6] bg-white px-4 py-2 text-[15px] font-medium text-black shadow-[0_10px_25px_rgba(17,17,17,0.04)] transition-all duration-300 hover:border-[#15110d] xl:hidden"
                  >
                    <SlidersHorizontal className="h-4 w-4 shrink-0" />
                    <span>{UI_TEXT.filters}</span>
                  </button>

                  <SortDropdown value={sortBy} onChange={setSortBy} />
                </div>
              </div>

              {filteredProducts.length ? (
                <div className="grid gap-x-6 gap-y-10 md:grid-cols-2 xl:grid-cols-4">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.slug} product={product} />
                  ))}
                </div>
              ) : (
                <div className="border border-dashed border-[#d9cec1] px-6 py-16 text-center">
                  <div className="text-[26px] font-semibold text-[#15110d]">{UI_TEXT.emptyTitle}</div>
                  <p className="mt-3 text-[15px] leading-7 text-[#756858]">{UI_TEXT.emptyBody}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <AboutContactSection />
        <SRXLogo />
      </section>

      <MobileFilterDrawer
        isOpen={isMobileFiltersOpen}
        onClose={() => setIsMobileFiltersOpen(false)}
        filteredCount={filteredProducts.length}
        resetFilters={resetFilters}
        productCategories={productCategories}
        concernOptions={concernOptions}
        skinTypeOptions={skinTypeOptions}
        category={category}
        concern={concern}
        skinType={skinType}
        price={price}
        setCategory={setCategory}
        setConcern={setConcern}
        setSkinType={setSkinType}
        setPrice={setPrice}
        openGroups={openGroups}
        toggleGroup={toggleGroup}
      />

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
