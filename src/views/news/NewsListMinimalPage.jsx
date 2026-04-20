"use client";

import { startTransition, useDeferredValue, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Search, SlidersHorizontal, X } from "lucide-react";
import {
  ALL_NEWS_CATEGORY,
  demoNews,
  filterNews,
  formatNewsDate,
  newsCategories,
  sortNewsByDate,
} from "../../data/demoNews";

function NewsCard({ article }) {
  return (
    <Link href={`/follow-srx/${article.slug}`} className="group block">
      <article className="flex h-full flex-col">
        <div className="relative overflow-hidden rounded-[12px] bg-[#edf0ff] shadow-[0_18px_40px_rgba(57,72,122,0.08)]">
          <div className="aspect-[4/5] overflow-hidden">
            <img
              src={article.coverImage}
              alt={article.coverAlt}
              className="h-full w-full object-cover transition duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
            />
          </div>
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(10,12,18,0.12)_100%)] opacity-80 transition duration-500 group-hover:opacity-100" />
          <div className="pointer-events-none absolute inset-0 bg-[#111624]/0 transition-colors duration-500 group-hover:bg-[#111624]/24" />
          <div className="absolute left-4 top-4 rounded-full border border-white/70 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#4f5875] backdrop-blur-md">
            {article.category}
          </div>
          <div className="absolute right-4 top-4 rounded-full border border-white/60 bg-black/20 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-md">
            {article.readTime}
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-20 w-20 translate-y-2 items-center justify-center rounded-full bg-white/96 text-[#222837] opacity-0 shadow-[0_18px_40px_rgba(0,0,0,0.12)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 group-hover:opacity-100">
              <ArrowUpRight className="h-8 w-8" strokeWidth={1.8} />
            </div>
          </div>
        </div>

        <div className="px-2 pb-2 pt-5">
          <div className="text-[12px] font-medium tracking-[0.01em] text-[#7f8495]">
            {formatNewsDate(article.publishedAt)}
          </div>
          <h2 className="mt-4 text-[18px] font-medium leading-[1.14] tracking-[-0.05em] text-[#2b3140] sm:text-[24px]">
            {article.title}
          </h2>
          <p className="mt-3 line-clamp-2 max-w-[40ch] text-[14px] leading-7 text-[#616777]">
            {article.excerpt}
          </p>
          <div className="mt-5 h-[3px] w-9 rounded-full bg-[#2d3444] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-[100%]" />
        </div>
      </article>
    </Link>
  );
}

export default function NewsListMinimalPage({ initialArticles = demoNews }) {
  const [activeCategory, setActiveCategory] = useState(ALL_NEWS_CATEGORY);
  const [searchValue, setSearchValue] = useState("");
  const deferredSearchValue = useDeferredValue(searchValue);
  const trimmedSearch = deferredSearchValue.trim();

  const allArticles = useMemo(() => {
    const sourceArticles = initialArticles.length ? initialArticles : demoNews;
    return sortNewsByDate(sourceArticles);
  }, [initialArticles]);
  const filteredArticles = useMemo(
    () =>
      filterNews({
        items: allArticles,
        query: trimmedSearch,
        category: activeCategory,
      }),
    [activeCategory, allArticles, trimmedSearch],
  );

  const isFilteredView = activeCategory !== ALL_NEWS_CATEGORY || Boolean(trimmedSearch);
  const featuredArticles = isFilteredView
    ? filteredArticles.slice(0, 3)
    : allArticles.filter((article) => article.featured).slice(0, 3);
  const archiveArticles = isFilteredView
    ? filteredArticles.slice(3)
    : allArticles.filter((article) => !article.featured);
  const availableCategories = [ALL_NEWS_CATEGORY, ...newsCategories];

  const handleSearchChange = (event) => {
    const nextValue = event.target.value;
    startTransition(() => {
      setSearchValue(nextValue);
    });
  };

  const clearFilters = () => {
    setActiveCategory(ALL_NEWS_CATEGORY);
    startTransition(() => {
      setSearchValue("");
    });
  };

  return (
    <section className="overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#f7f8ff_24%,#ffffff_100%)] pb-20 pt-8 md:pb-24 md:pt-12">
      <div className="mx-auto max-w-[1440px] px-4 md:px-6 xl:px-8">
        <div className="relative overflow-hidden rounded-[36px] border border-[#e8ecff] bg-white px-5 py-6 shadow-[0_30px_90px_rgba(79,94,147,0.1)] sm:px-8 sm:py-8 lg:px-12 lg:py-10">
          <div className="pointer-events-none absolute inset-y-0 right-[-10%] w-[42%] rounded-full bg-[radial-gradient(circle,rgba(197,158,254,0.18)_0%,rgba(197,158,254,0)_70%)] blur-2xl" />
          <div className="pointer-events-none absolute left-[-8%] top-[-20%] h-[280px] w-[280px] rounded-full bg-[radial-gradient(circle,rgba(124,150,255,0.18)_0%,rgba(124,150,255,0)_72%)] blur-3xl" />

          <div className="relative">
            <div className="text-[12px] font-semibold uppercase tracking-[0.24em] text-[#7d82a0]">
              Theo dòng SRX
            </div>
            <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px] lg:items-end">
              <div>
                <h1
                  className="text-[32px] font-medium leading-[0.96] tracking-[-0.07em] text-[#232836] sm:text-[48px] lg:text-[60px]"
                  style={{ fontFamily: '"Manrope", "Hubot Sans", sans-serif' }}
                >
                  Tin tức, sự kiện và kiến thức làm đẹp.
                </h1>
                <p className="mt-5 max-w-[760px] text-[16px] leading-8 text-[#687085] sm:text-[17px]">
                  Nơi cập nhật những thông tin mới nhất về các sản phẩm, sự kiện và hoạt động của SRX, cùng những kiến thức làm đẹp chuẩn y khoa được chia sẻ bởi các chuyên gia da liễu hàng đầu.
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 xl:grid-cols-[minmax(0,420px)_1fr] xl:items-start">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7f879c]" />
                <input
                  type="text"
                  value={searchValue}
                  onChange={handleSearchChange}
                  placeholder="Tìm theo tiêu đề, chủ đề hoặc hoạt chất"
                  className="h-14 w-full rounded-full border border-[#e1e6fb] bg-white pl-14 pr-14 text-[15px] text-[#232836] outline-none transition focus:border-[#adb8ff] focus:ring-4 focus:ring-[#dfe4ff]"
                />
                {searchValue ? (
                  <button
                    type="button"
                    onClick={() => setSearchValue("")}
                    className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[#677086] transition hover:bg-[#eef1ff] hover:text-[#232836]"
                    aria-label="Xóa từ khóa tìm kiếm"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
              </label>

              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#e1e6fb] bg-white px-4 py-3 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#7e86a1]">
                  <SlidersHorizontal className="h-4 w-4" />
                  Bộ lọc
                </div>
                {availableCategories.map((category) => {
                  const isActive = category === activeCategory;

                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setActiveCategory(category)}
                      className={`rounded-full px-5 py-3 text-[14px] font-medium transition ${
                        isActive
                          ? "bg-[#252c3d] text-white shadow-[0_12px_24px_rgba(37,44,61,0.18)]"
                          : "border border-[#e1e6fb] bg-white text-[#60697d] hover:border-[#cad3ff] hover:text-[#252c3d]"
                      }`}
                    >
                      {category}
                    </button>
                  );
                })}
                {isFilteredView ? (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="rounded-full border border-transparent bg-[#eef1ff] px-5 py-3 text-[14px] font-medium text-[#49526a] transition hover:bg-[#e2e7ff] hover:text-[#222837]"
                  >
                    Xóa bộ lọc
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {filteredArticles.length ? (
          <div className="mt-12 space-y-16">
            <div>
              <div className="mb-6 flex items-end justify-between gap-4">
                <div>
                  <div className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#858aa2]">
                    {isFilteredView ? "Kết quả" : "Nổi bật"}
                  </div>
                  <h2 className="mt-2 text-[30px] font-medium tracking-[-0.05em] text-[#252c3d] sm:text-[38px]">
                    {isFilteredView ? "Bài viết phù hợp" : "Các bài viết nổi bật"}
                  </h2>
                </div>
                <div className="hidden text-[14px] text-[#737b91] md:block">
                  {trimmedSearch
                    ? `Từ khóa: "${trimmedSearch}"`
                    : activeCategory !== ALL_NEWS_CATEGORY
                      ? `Danh mục: ${activeCategory}`
                      : "Cập nhật mới nhất từ SRX."}
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {featuredArticles.map((article) => (
                  <NewsCard key={article.slug} article={article} />
                ))}
              </div>
            </div>

            {archiveArticles.length ? (
              <div>
                <div className="mb-6 text-[12px] font-semibold uppercase tracking-[0.2em] text-[#858aa2]">
                  {isFilteredView ? "Các bài viết khác" : "Mới cập nhật"}
                </div>
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {archiveArticles.map((article) => (
                    <NewsCard key={article.slug} article={article} />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="mt-12 rounded-[32px] border border-dashed border-[#d9def6] bg-[#fbfbff] px-6 py-14 text-center">
            <div className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#8a90ab]">
              Không có kết quả
            </div>
            <h2 className="mt-4 text-[30px] font-medium tracking-[-0.05em] text-[#252c3d]">
              Không tìm thấy bài viết phù hợp.
            </h2>
            <p className="mx-auto mt-4 max-w-[520px] text-[15px] leading-7 text-[#697186]">
              Thử đổi từ khóa tìm kiếm, chọn lại danh mục hoặc xóa toàn bộ bộ lọc để xem lại danh sách bài viết mới nhất.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-8 rounded-full bg-[#252c3d] px-6 py-3 text-[14px] font-medium text-white transition hover:bg-[#1d2330]"
            >
              Xóa bộ lọc
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
