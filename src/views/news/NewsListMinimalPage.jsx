"use client";

import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Search, X } from "lucide-react";
import AboutContactSection from "../../components/aboutus/AboutContactSection.jsx";
import SRXLogo from "../../components/home/SrxLogo.jsx";
import NewsTopFeatureSection from "../../components/news/NewsTopFeatureSection.jsx";
import {
  ALL_NEWS_CATEGORY,
  filterNews,
  formatNewsDate,
  getNewsCategories,
  sortNewsByDate,
} from "../../lib/news/articles.js";

function NewsCard({ article }) {
  return (
    <Link href={`/follow-srx/${article.slug}`} className="group block">
      <article className="flex h-full flex-col">
        <div className="relative overflow-hidden rounded-[12px] bg-[#fff] shadow-[0_18px_40px_rgba(57,72,122,0.08)]">
          <div className="aspect-[1/1] overflow-hidden">
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
            <div className="flex h-20 w-20 translate-y-2 items-center justify-center rounded-full bg-white text-[#222837] opacity-0 shadow-[0_18px_40px_rgba(0,0,0,0.12)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 group-hover:opacity-100">
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

export default function NewsListMinimalPage({
  initialArticles = [],
  pageTitle = "Theo dòng SRX",
  showCategoryFilters = true,
  enableHydration = true,
  searchPlaceholder = "Tìm theo tiêu đề, chủ đề hoặc hoạt chất",
  showTopFeatureSection = false,
}) {
  const [activeCategory, setActiveCategory] = useState(ALL_NEWS_CATEGORY);
  const [searchValue, setSearchValue] = useState("");
  const [articles, setArticles] = useState(initialArticles);
  const deferredSearchValue = useDeferredValue(searchValue);
  const trimmedSearch = deferredSearchValue.trim();

  useEffect(() => {
    setArticles(initialArticles);
  }, [initialArticles]);

  useEffect(() => {
    if (!enableHydration || initialArticles.length) {
      return undefined;
    }

    const controller = new AbortController();

    async function loadArticles() {
      try {
        const response = await fetch("/api/news/latest?limit=24", {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          return;
        }

        const payload = await response.json();

        if (Array.isArray(payload.articles) && payload.articles.length) {
          setArticles(payload.articles);
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Failed to hydrate news list:", error);
        }
      }
    }

    loadArticles();

    return () => {
      controller.abort();
    };
  }, [enableHydration, initialArticles]);

  const allArticles = useMemo(() => sortNewsByDate(articles), [articles]);
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
  const topFeatureArticle =
    showTopFeatureSection && !isFilteredView && allArticles.length ? allArticles[0] : null;
  const defaultArticles = topFeatureArticle
    ? allArticles.filter((article) => article.slug !== topFeatureArticle.slug)
    : allArticles;
  const defaultFeaturedArticles = defaultArticles.filter((article) => article.featured).slice(0, 3);
  const featuredArticles = isFilteredView
    ? filteredArticles.slice(0, 3)
    : defaultFeaturedArticles.length
      ? defaultFeaturedArticles
      : defaultArticles.slice(0, 3);
  const featuredArticleSlugs = new Set(featuredArticles.map((article) => article.slug));
  const archiveArticles = isFilteredView
    ? filteredArticles.slice(3)
    : defaultArticles.filter((article) => !featuredArticleSlugs.has(article.slug));
  const availableCategories = [ALL_NEWS_CATEGORY, ...getNewsCategories(allArticles)];
  const resetLabel = showCategoryFilters ? "Xóa bộ lọc" : "Xóa tìm kiếm";

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
    <section className="overflow-hidden bg-[#fff] pb-10 md:pb-16">
      <div className="mx-auto max-w-[1640px] px-4 md:px-6 xl:px-8">
        {filteredArticles.length ? (
          <div className="mt-12 space-y-16">
            {topFeatureArticle ? (
              <NewsTopFeatureSection article={topFeatureArticle} />
            ) : null}

            <div>
              <div className="mb-6 flex items-end justify-between gap-4">
                <div>
                  <h1 className="mt-2 max-w-[720px] text-[30px] font-medium leading-none tracking-[-0.05em] text-[#252c3d] sm:text-[40px]">
                    {pageTitle}
                  </h1>
                </div>
              </div>

              <div
                className={`my-8 grid gap-4 ${
                  showCategoryFilters
                    ? "xl:grid-cols-[minmax(0,420px)_1fr] xl:items-center"
                    : "xl:grid-cols-[minmax(0,420px)]"
                }`}
              >
                <label className="relative block">
                  <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7f879c]" />
                  <input
                    type="text"
                    value={searchValue}
                    onChange={handleSearchChange}
                    placeholder={searchPlaceholder}
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

                {showCategoryFilters ? (
                  <div className="flex flex-wrap items-center justify-end gap-3">
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
                        {resetLabel}
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </div>

              {featuredArticles.length ? (
                <div className="grid gap-6 gap-y-10 md:grid-cols-2 xl:grid-cols-3">
                  {featuredArticles.map((article) => (
                    <NewsCard key={article.slug} article={article} />
                  ))}
                </div>
              ) : null}
            </div>

            {archiveArticles.length ? (
              <div>
                <div className="mb-6 text-[12px] font-semibold uppercase tracking-[0.2em] text-[#858aa2]">
                  {isFilteredView ? "Các bài viết khác" : "Mới cập nhật"}
                </div>
                <div className="grid gap-6 gap-y-10 md:grid-cols-2 xl:grid-cols-3">
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
              Hãy thử đổi từ khóa tìm kiếm để xem lại danh sách bài viết phù hợp hơn.
            </p>
            {trimmedSearch ? (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-8 rounded-full bg-[#252c3d] px-6 py-3 text-[14px] font-medium text-white transition hover:bg-[#1d2330]"
              >
                {resetLabel}
              </button>
            ) : null}
          </div>
        )}
      </div>
      <AboutContactSection />
      <SRXLogo />
    </section>
  );
}
