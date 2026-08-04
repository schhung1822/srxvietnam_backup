'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, Clock3, Sparkles } from 'lucide-react';
import AboutContactSection from '../../components/aboutus/AboutContactSection.jsx';
import SRXLogo from '../../components/home/SrxLogo.jsx';

const PAGE_SIZE = 9;
const HERO_INTERVAL = 6000;

const SECTION_EYEBROW = 'Newsroom SRX';
const SECTION_TITLE = 'Tin tức & sự kiện';
const SECTION_DESCRIPTION =
  'Toàn bộ cập nhật mới nhất từ SRX: câu chuyện thương hiệu, sản phẩm, hoạt động cộng đồng và các sự kiện nổi bật.';
const SECTION_EMPTY_MESSAGE = 'Chưa có bài viết nào để hiển thị.';

function getPublishedKey(article) {
  return article?.publishedAt || '0000-00-00';
}

function sortArticlesByDateDesc(articles = []) {
  return [...articles].sort((left, right) => getPublishedKey(right).localeCompare(getPublishedKey(left)));
}

function splitDateParts(value) {
  const [year, month, day] = String(value ?? '').split('-');

  if (!year || !month || !day) {
    return null;
  }

  return { year, month: Number(month), day: Number(day) };
}

function formatSectionDateLabel(value) {
  const parts = splitDateParts(value);

  if (!parts) {
    return 'Đang cập nhật';
  }

  return `${parts.day} tháng ${parts.month}, ${parts.year}`;
}

function formatHeroDateLabel(value) {
  const parts = splitDateParts(value);

  if (!parts) {
    return 'Ngày đang cập nhật';
  }

  return `Ngày ${parts.day} tháng ${parts.month} năm ${parts.year}`;
}

function getCategoryLabel(article) {
  return article?.category?.trim() || (article?.categorySlug === 'su-kien' ? 'Sự kiện' : 'Tin tức');
}

function CategoryChip({ article, tone = 'light' }) {
  const toneClassName =
    tone === 'dark'
      ? 'border-white/30 bg-white/15 text-white backdrop-blur-md'
      : 'border-[#dfe4f8] bg-white/90 text-[#4a5375] backdrop-blur-md';

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] ${toneClassName}`}
    >
      {getCategoryLabel(article)}
    </span>
  );
}

function MetaLine({ article, tone = 'light' }) {
  const baseClassName = tone === 'dark' ? 'text-white/70' : 'text-[#858ba5]';

  return (
    <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] font-medium ${baseClassName}`}>
      <span className="font-['Inter',_sans-serif]">{formatSectionDateLabel(article.publishedAt)}</span>
      {article.readTime ? (
        <>
          <span className="h-1 w-1 rounded-full bg-current opacity-50" />
          <span className="inline-flex items-center gap-1.5">
            <Clock3 className="h-3.5 w-3.5 shrink-0" />
            {article.readTime}
          </span>
        </>
      ) : null}
    </div>
  );
}

function HeroNavButton({ className = '', children, ...props }) {
  return (
    <button
      type="button"
      className={`flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-md transition duration-300 hover:border-white/60 hover:bg-white hover:text-[#171b25] ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function HeroStoriesSlider({ articles = [] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (articles.length <= 1) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % articles.length);
    }, HERO_INTERVAL);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [articles.length, activeIndex]);

  useEffect(() => {
    if (activeIndex < articles.length) {
      return;
    }

    setActiveIndex(0);
  }, [activeIndex, articles.length]);

  if (!articles.length) {
    return null;
  }

  const activeArticle = articles[Math.min(activeIndex, articles.length - 1)];

  const showPrevious = () => {
    setActiveIndex((current) => (current - 1 + articles.length) % articles.length);
  };

  const showNext = () => {
    setActiveIndex((current) => (current + 1) % articles.length);
  };

  return (
    <section className="relative isolate w-full overflow-hidden bg-[#080a13]">
      <div className="relative h-[580px] sm:h-[640px] lg:h-[calc(100vh-85px)] lg:max-h-[760px] lg:min-h-[620px]">
        {articles.map((article, index) => {
          const isActive = index === activeIndex;

          return (
            <div
              key={`hero-slide-${article.slug}`}
              className={`absolute inset-0 transition-opacity duration-1000 ease-out ${
                isActive ? 'opacity-100' : 'pointer-events-none opacity-0'
              }`}
              aria-hidden={!isActive}
            >
              <img
                src={article.coverImage}
                alt={article.coverAlt}
                className={`h-full w-full object-cover transition-transform duration-[7000ms] ease-out ${
                  isActive ? 'scale-[1.08]' : 'scale-100'
                }`}
              />
            </div>
          );
        })}

        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(8,10,19,0.55)_0%,rgba(8,10,19,0.08)_30%,rgba(8,10,19,0.68)_72%,rgba(8,10,19,0.95)_100%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(96deg,rgba(8,10,19,0.72)_0%,rgba(8,10,19,0.2)_52%,rgba(8,10,19,0)_100%)]" />

        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-[1560px] px-5 pb-9 md:px-8 lg:pb-14 xl:px-10">
            <div key={activeArticle.slug} className="max-w-[780px] animate-news-rise">
              <div className="flex flex-wrap items-center gap-3">
                <CategoryChip article={activeArticle} tone="dark" />
                {activeArticle.featured ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-md">
                    <Sparkles className="h-3 w-3 shrink-0" />
                    Nổi bật
                  </span>
                ) : null}
                <span className="font-['Inter',_sans-serif] text-[12px] font-medium text-white/70">
                  {formatHeroDateLabel(activeArticle.publishedAt)}
                </span>
              </div>

              <h1 className="mt-5 text-[27px] font-semibold leading-[1.1] tracking-[-0.045em] text-white sm:text-[34px] lg:text-[44px] xl:text-[52px]">
                {activeArticle.title}
              </h1>

              <p className="mt-4 line-clamp-3 max-w-[62ch] text-[14px] leading-7 text-white/75 sm:text-[16px] sm:leading-8">
                {activeArticle.excerpt}
              </p>

              <Link
                href={`/follow-srx/${activeArticle.slug}`}
                className="group mt-7 inline-flex min-h-[50px] items-center gap-3 rounded-full bg-white px-7 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#171b25] transition duration-300 hover:bg-[#6f87ea] hover:text-white"
              >
                Xem bài viết
                <ArrowRight className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>

            {articles.length > 1 ? (
              <div className="mt-9 flex flex-col gap-5 border-t border-white/15 pt-5 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
                <div className="flex flex-1 items-start gap-3 sm:gap-4">
                  {articles.map((article, index) => {
                    const isActive = index === activeIndex;

                    return (
                      <button
                        key={`hero-indicator-${article.slug}`}
                        type="button"
                        onClick={() => setActiveIndex(index)}
                        className="group max-w-[150px] flex-1 text-left"
                        aria-label={`Chuyển tới bài viết ${index + 1}`}
                        aria-current={isActive}
                      >
                        <span className="block h-[3px] w-full overflow-hidden rounded-full bg-white/25">
                          {isActive ? (
                            <span
                              key={`hero-progress-${activeIndex}`}
                              className="block h-full rounded-full bg-white animate-news-progress"
                            />
                          ) : null}
                        </span>
                        <span
                          className={`mt-2.5 block truncate font-['Inter',_sans-serif] text-[11px] font-semibold tracking-[0.16em] transition ${
                            isActive ? 'text-white' : 'text-white/45 group-hover:text-white/75'
                          }`}
                        >
                          {`0${index + 1}`.slice(-2)}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex shrink-0 items-center gap-2.5">
                  <HeroNavButton onClick={showPrevious} aria-label="Bài viết trước">
                    <ChevronLeft className="h-4 w-4" />
                  </HeroNavButton>
                  <HeroNavButton onClick={showNext} aria-label="Bài viết tiếp theo">
                    <ChevronRight className="h-4 w-4" />
                  </HeroNavButton>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function StoryCard({ article }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[22px] border border-[#e6eaf8] bg-white shadow-[0_18px_44px_-32px_rgba(43,54,110,0.55)] transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:border-[#c8d2f7] hover:shadow-[0_34px_66px_-34px_rgba(43,54,110,0.5)]">
      <Link href={`/follow-srx/${article.slug}`} className="relative block aspect-[16/10] overflow-hidden">
        <img
          src={article.coverImage}
          alt={article.coverAlt}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
        />
        <span className="absolute left-4 top-4">
          <CategoryChip article={article} />
        </span>
      </Link>

      <div className="flex flex-1 flex-col gap-4 p-6 sm:p-7">
        <MetaLine article={article} />

        <Link
          href={`/follow-srx/${article.slug}`}
          className="line-clamp-3 text-[18px] font-semibold leading-[1.24] tracking-[-0.035em] text-[#141822] transition duration-300 hover:text-[#4d5cd3]"
        >
          {article.title}
        </Link>

        <p className="line-clamp-3 text-[14px] leading-7 text-[#6b7288]">{article.excerpt}</p>

        <Link
          href={`/follow-srx/${article.slug}`}
          className="mt-auto inline-flex items-center gap-2 pt-1 text-[12px] font-semibold uppercase tracking-[0.16em] text-[#4d5cd3]"
        >
          Đọc bài viết
          <ArrowUpRight className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
    </article>
  );
}

function SectionEmptyState({ message }) {
  return (
    <div className="rounded-[26px] border border-dashed border-[#d7ddf5] bg-white px-6 py-20 text-center text-[15px] text-[#6b7288]">
      {message}
    </div>
  );
}

function EmptyHubState() {
  return (
    <div className="rounded-[28px] border border-dashed border-[#d7ddf5] bg-white px-6 py-16 text-center shadow-[0_18px_50px_rgba(79,94,147,0.05)]">
      <div className="text-[12px] font-semibold uppercase tracking-[0.24em] text-[#858aa2]">Tin tức & Sự kiện</div>
      <h1 className="mt-4 text-[30px] font-medium tracking-[-0.05em] text-[#252c3d]">Chưa có bài viết để hiển thị.</h1>
      <p className="mx-auto mt-4 max-w-[520px] text-[15px] leading-7 text-[#6b7288]">
        Khi có bài viết thuộc nhóm tin tức hoặc sự kiện trong bảng posts, trang này sẽ tự động hiển thị.
      </p>
    </div>
  );
}

export default function NewsEventsHubPage({ initialArticles = [] }) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const sortedArticles = useMemo(() => sortArticlesByDateDesc(initialArticles), [initialArticles]);

  const heroArticles = useMemo(() => {
    const featuredArticles = sortedArticles.filter((article) => article.featured);
    const sourceArticles = featuredArticles.length >= 4 ? featuredArticles : sortedArticles;
    return sourceArticles.slice(0, 4);
  }, [sortedArticles]);

  const visibleArticles = sortedArticles.slice(0, visibleCount);
  const remainingCount = sortedArticles.length - visibleArticles.length;

  return (
    <section className="w-full bg-white">
      {sortedArticles.length ? <HeroStoriesSlider articles={heroArticles} /> : null}

      {sortedArticles.length ? (
        <div className="bg-[#f6f7fd]">
          <div className="mx-auto max-w-[1560px] px-4 py-16 md:px-8 md:py-20 xl:px-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="max-w-[760px]">
                <div className="text-[12px] font-semibold uppercase tracking-[0.24em] text-[#858aa2]">
                  {SECTION_EYEBROW}
                </div>
                <h2 className="mt-4 text-[32px] font-semibold uppercase leading-[1.06] tracking-[-0.045em] text-[#141822] md:text-[44px]">
                  {SECTION_TITLE}
                </h2>
                <p className="mt-5 max-w-[640px] text-[15px] leading-8 text-[#6b7288]">{SECTION_DESCRIPTION}</p>
              </div>

              <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9aa1bd] md:pb-2">
                {sortedArticles.length} bài viết
              </span>
            </div>

            {visibleArticles.length ? (
              <div className="mt-10 md:mt-12">
                <div className="grid gap-7 sm:grid-cols-2 xl:grid-cols-3">
                  {visibleArticles.map((article) => (
                    <StoryCard key={article.slug} article={article} />
                  ))}
                </div>

                {remainingCount > 0 ? (
                  <div className="mt-14 flex justify-center">
                    <button
                      type="button"
                      onClick={() => setVisibleCount((current) => current + PAGE_SIZE)}
                      className="group inline-flex min-h-[52px] items-center gap-3 rounded-full border border-[#d5dcf7] bg-white px-9 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#141822] transition duration-300 hover:border-[#6f87ea] hover:bg-[#6f87ea] hover:text-white"
                    >
                      {`Xem thêm (${remainingCount})`}
                      <ArrowRight className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="mt-10">
                <SectionEmptyState message={SECTION_EMPTY_MESSAGE} />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-[1560px] px-4 py-16 md:px-6 xl:px-8">
          <EmptyHubState />
        </div>
      )}

      <AboutContactSection />
      <SRXLogo />
    </section>
  );
}
