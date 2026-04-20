'use client';

import { useMemo, useState } from 'react';
import { RotateCcw, Search } from 'lucide-react';
import ProductCard from '../../components/shop/ProductCard';
import {
  buildProductFilterOptions,
  matchesPrice,
  priceOptions,
  sortProducts,
} from '../../lib/products/catalog.js';

function FilterGroup({ title, options, selectedValue, onChange }) {
  return (
    <div className="border-b border-[#e9e3da] pb-6">
      <div className="mb-4 text-[15px] font-semibold text-[#15110d]">{title}</div>

      <div className="space-y-3">
        {options.map((option) => {
          const value = typeof option === 'string' ? option : option.id;
          const label = typeof option === 'string' ? option : option.label;
          const active = selectedValue === value;

          return (
            <button
              key={value}
              type="button"
              onClick={() => onChange(value)}
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
  );
}

export default function ProductListMinimalPage({ products = [] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('Tất cả');
  const [concern, setConcern] = useState('Tất cả');
  const [skinType, setSkinType] = useState('Tất cả');
  const [price, setPrice] = useState('all');
  const [sortBy, setSortBy] = useState('featured');

  const loweredQuery = searchQuery.trim().toLowerCase();
  const { productCategories, concernOptions, skinTypeOptions } = useMemo(
    () => buildProductFilterOptions(products),
    [products],
  );

  const filteredProducts = useMemo(
    () =>
      sortProducts(
        products.filter((product) => {
          const matchesSearch =
            !loweredQuery ||
            product.name.toLowerCase().includes(loweredQuery) ||
            product.brand.toLowerCase().includes(loweredQuery) ||
            (product.searchKeywords ?? []).some((keyword) =>
              keyword.toLowerCase().includes(loweredQuery),
            );

          const matchesCategory = category === 'Tất cả' || product.category === category;
          const matchesConcern = concern === 'Tất cả' || product.concerns.includes(concern);
          const matchesSkinType = skinType === 'Tất cả' || product.skinTypes.includes(skinType);

          return (
            matchesSearch &&
            matchesCategory &&
            matchesConcern &&
            matchesSkinType &&
            matchesPrice(product, price)
          );
        }),
        sortBy,
      ),
    [category, concern, loweredQuery, price, products, skinType, sortBy],
  );

  const resetFilters = () => {
    setSearchQuery('');
    setCategory('Tất cả');
    setConcern('Tất cả');
    setSkinType('Tất cả');
    setPrice('all');
    setSortBy('featured');
  };

  return (
    <section className="bg-white pb-20 pt-8 md:pb-24">
      <div className="mx-auto max-w-[1840px] px-4 md:px-6 xl:px-10">
        <div className="grid gap-10 xl:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="xl:sticky xl:top-[110px] xl:self-start">
            <div className="border-b border-[#e9e3da] pb-6">
              <div className="text-[28px] font-semibold tracking-[-0.04em] text-[#15110d]">
                Bộ lọc
              </div>
              <div className="mt-3 text-[14px] text-[#8b7c6d]">
                <span className="font-semibold text-[#15110d]">{filteredProducts.length}</span>{' '}
                kết quả
              </div>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-5 inline-flex items-center gap-2 text-[13px] font-medium text-[#6a5b4c] transition hover:text-[#15110d]"
              >
                <RotateCcw className="h-4 w-4" />
                Đặt lại bộ lọc
              </button>
            </div>

            <div className="space-y-6 pt-6">
              <FilterGroup
                title="Danh mục"
                options={productCategories}
                selectedValue={category}
                onChange={setCategory}
              />
              <FilterGroup
                title="Nhu cầu"
                options={concernOptions}
                selectedValue={concern}
                onChange={setConcern}
              />
              <FilterGroup
                title="Loại da"
                options={skinTypeOptions}
                selectedValue={skinType}
                onChange={setSkinType}
              />
              <FilterGroup title="Giá" options={priceOptions} selectedValue={price} onChange={setPrice} />
            </div>
          </aside>

          <div className="min-w-0">
            <div className="mb-8 flex flex-col gap-4 border-b border-[#e9e3da] pb-5 md:flex-row md:items-center md:justify-between">
              <div className="relative w-full md:max-w-[420px]">
                <Search className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8d7f72]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Tìm kiếm sản phẩm"
                  className="w-full border-0 border-b border-[#d8cec1] bg-transparent py-3 pl-7 pr-0 text-[15px] text-[#15110d] outline-none placeholder:text-[#9b8e81] focus:border-[#15110d]"
                />
              </div>

              <div className="flex items-center gap-4">
                <div className="text-[14px] text-[#8b7c6d]">{filteredProducts.length} sản phẩm</div>
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="rounded-full border border-[#ddd3c6] bg-white px-4 py-2.5 text-[14px] font-medium text-[#15110d] outline-none"
                >
                  <option value="featured">Mặc định</option>
                  <option value="price-asc">Giá tăng dần</option>
                  <option value="price-desc">Giá giảm dần</option>
                  <option value="rating">Đánh giá cao</option>
                  <option value="sold">Bán chạy</option>
                </select>
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
                <div className="text-[26px] font-semibold text-[#15110d]">
                  Không có sản phẩm phù hợp
                </div>
                <p className="mt-3 text-[15px] leading-7 text-[#756858]">
                  Hãy thử đổi từ khóa hoặc bớt bộ lọc để xem thêm sản phẩm.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
