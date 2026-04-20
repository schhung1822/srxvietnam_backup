'use client';

import { useMemo, useState } from 'react';
import { ArrowRight, RotateCcw, Search, SlidersHorizontal, Sparkles } from 'lucide-react';
import ProductCard from '../../components/shop/ProductCard';
import {
  buildProductFilterOptions,
  matchesPrice,
  priceOptions,
  sortProducts,
} from '../../lib/products/catalog.js';

const moneyFormatter = new Intl.NumberFormat('vi-VN');

function FilterGroup({ title, options, selectedValue, onChange }) {
  return (
    <div className="rounded-[24px] border border-[#ede2d2] bg-[#fcfaf7] p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[15px] font-semibold text-[#1b1713]">{title}</h3>
        <span className="text-[12px] uppercase tracking-[0.24em] text-[#9c8c79]">Filter</span>
      </div>

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
              className={`flex w-full items-center justify-between rounded-full border px-4 py-3 text-left text-[14px] transition ${
                active
                  ? 'border-[#2540dd] bg-[#2540dd] text-white shadow-[0_14px_34px_rgba(37,64,221,0.18)]'
                  : 'border-[#e7dccb] bg-white text-[#524435] hover:border-[#cab79f]'
              }`}
            >
              <span>{label}</span>
              <span
                className={`h-3.5 w-3.5 rounded-full border ${
                  active ? 'border-white bg-white' : 'border-[#c9b7a4]'
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function ProductListPage({ products = [] }) {
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

  const priceValues = products.map((product) => Number(product.price)).filter((value) => value > 0);
  const minPrice = priceValues.length ? Math.min(...priceValues) : 0;
  const maxPrice = priceValues.length ? Math.max(...priceValues) : 0;

  const resetFilters = () => {
    setSearchQuery('');
    setCategory('Tất cả');
    setConcern('Tất cả');
    setSkinType('Tất cả');
    setPrice('all');
    setSortBy('featured');
  };

  return (
    <section className="bg-[#f7f1e8] pb-20 pt-8 md:pb-24">
      <div className="mx-auto max-w-[1840px] px-4 md:px-6 xl:px-10">
        <div className="overflow-hidden rounded-[36px] border border-[#eadfce] bg-white shadow-[0_30px_90px_rgba(71,45,17,0.08)]">
          <div className="grid gap-8 border-b border-[#f0e5d7] bg-[linear-gradient(135deg,#fff9f2_0%,#f9f0e5_56%,#eef2ff_100%)] px-6 py-8 md:px-8 xl:grid-cols-[minmax(0,1.1fr)_380px] xl:px-10">
            <div>
              <div className="inline-flex rounded-full border border-[#d9cab6] bg-white/80 px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.24em] text-[#8a7967]">
                SRX Beauty Commerce
              </div>
              <h1 className="mt-5 max-w-[920px] text-[34px] font-semibold leading-tight tracking-[-0.04em] text-[#191410] md:text-[48px]">
                Trang sản phẩm mỹ phẩm với bộ lọc, tìm kiếm và giao diện mua sắm theo bố cục e-commerce hiện đại.
              </h1>
              <p className="mt-4 max-w-[780px] text-[16px] leading-8 text-[#6d5c4b]">
                Catalog hiện được đọc trực tiếp từ MySQL, sẵn để nối tồn kho, biến thể, đơn hàng và checkout thật.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                {['Bộ lọc nhiều lớp', 'Tìm kiếm tức thì', 'Sắp xếp linh hoạt', 'Responsive desktop/mobile'].map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-[#dfd1c0] bg-white px-4 py-2 text-[14px] font-medium text-[#3b322b]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] border border-[#e6d9c7] bg-white/80 p-6 backdrop-blur">
              <div className="flex items-center gap-3 text-[#2540dd]">
                <Sparkles className="h-5 w-5" />
                <span className="text-[13px] font-semibold uppercase tracking-[0.22em]">Tổng quan catalog</span>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-[24px] bg-[#faf6f0] p-4">
                  <div className="text-[13px] text-[#8f7d6a]">Sản phẩm</div>
                  <div className="mt-2 text-[34px] font-semibold text-[#171311]">{products.length}</div>
                </div>
                <div className="rounded-[24px] bg-[#eef2ff] p-4">
                  <div className="text-[13px] text-[#4d5fc4]">Khoảng giá</div>
                  <div className="mt-2 text-[22px] font-semibold text-[#1f2f8f]">
                    {minPrice && maxPrice
                      ? `${moneyFormatter.format(minPrice)}đ - ${moneyFormatter.format(maxPrice)}đ`
                      : 'Chưa có dữ liệu'}
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-[24px] bg-[#171311] p-5 text-white">
                <div className="text-[13px] uppercase tracking-[0.2em] text-white/60">MySQL powered</div>
                <div className="mt-2 text-[18px] font-semibold leading-7">
                  Card sản phẩm và trang chi tiết đã đọc trực tiếp từ bảng `products`, `product_variants`, `product_images`.
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-8 px-4 py-6 md:px-6 xl:grid-cols-[300px_minmax(0,1fr)] xl:px-8 xl:py-8">
            <aside className="space-y-5 xl:sticky xl:top-[110px] xl:self-start">
              <div className="rounded-[28px] border border-[#eadfce] bg-white p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <SlidersHorizontal className="h-5 w-5 text-[#2540dd]" />
                    <h2 className="text-[22px] font-semibold text-[#171311]">Bộ lọc</h2>
                  </div>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="inline-flex items-center gap-2 rounded-full border border-[#e5d9ca] px-4 py-2 text-[13px] font-medium text-[#5b4d3d] transition hover:border-[#171311] hover:text-[#171311]"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </button>
                </div>

                <div className="mt-4 rounded-[20px] bg-[#faf6f0] px-4 py-3 text-[14px] text-[#6b5a49]">
                  Hiển thị <span className="font-semibold text-[#171311]">{filteredProducts.length}</span> sản phẩm phù hợp.
                </div>
              </div>

              <FilterGroup title="Danh mục" options={productCategories} selectedValue={category} onChange={setCategory} />
              <FilterGroup title="Nhu cầu" options={concernOptions} selectedValue={concern} onChange={setConcern} />
              <FilterGroup title="Loại da" options={skinTypeOptions} selectedValue={skinType} onChange={setSkinType} />
              <FilterGroup title="Mức giá" options={priceOptions} selectedValue={price} onChange={setPrice} />
            </aside>

            <div className="min-w-0">
              <div className="mb-6 flex flex-col gap-4 rounded-[28px] border border-[#eadfce] bg-[#fcfaf7] p-5 md:flex-row md:items-center md:justify-between">
                <div className="relative w-full md:max-w-[520px]">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9a8b79]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Tìm theo tên sản phẩm, brand hoặc hoạt chất..."
                    className="w-full rounded-full border border-[#e4d9ca] bg-white py-3.5 pl-12 pr-4 text-[15px] text-[#171311] outline-none transition focus:border-[#2540dd]"
                  />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="text-[14px] text-[#7c6c5a]">
                    <span className="font-semibold text-[#171311]">{filteredProducts.length}</span> kết quả
                  </div>

                  <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value)}
                    className="rounded-full border border-[#e4d9ca] bg-white px-4 py-3 text-[14px] font-medium text-[#171311] outline-none transition focus:border-[#2540dd]"
                  >
                    <option value="featured">Ưu tiên hiển thị</option>
                    <option value="price-asc">Giá tăng dần</option>
                    <option value="price-desc">Giá giảm dần</option>
                    <option value="rating">Đánh giá cao nhất</option>
                    <option value="sold">Bán chạy nhất</option>
                  </select>
                </div>
              </div>

              {filteredProducts.length ? (
                <div className="grid gap-6 md:grid-cols-2 2xl:grid-cols-4">
                  {filteredProducts.map((product, index) => (
                    <ProductCard key={product.slug} product={product} priority={index < 4} />
                  ))}
                </div>
              ) : (
                <div className="rounded-[32px] border border-dashed border-[#d8c8b6] bg-[#fcfaf7] px-6 py-14 text-center">
                  <div className="mx-auto max-w-[540px]">
                    <h3 className="text-[28px] font-semibold text-[#171311]">Không tìm thấy sản phẩm phù hợp</h3>
                    <p className="mt-3 text-[16px] leading-7 text-[#6d5c4b]">
                      Hãy thử đổi từ khóa, nới bộ lọc hoặc quay về toàn bộ catalog để xem thêm sản phẩm.
                    </p>
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#171311] px-6 py-3 text-[14px] font-semibold text-white transition hover:bg-[#2540dd]"
                    >
                      Xem lại toàn bộ
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
