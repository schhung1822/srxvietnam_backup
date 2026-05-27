'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, CalendarDays, ChevronLeft, ChevronRight, Tag } from 'lucide-react';
import AboutContactSection from '../../components/aboutus/AboutContactSection.jsx';
import SRXLogo from '../../components/home/SrxLogo.jsx';

const INITIAL_VISIBLE = 6;
const HERO_SLIDE_BACKGROUNDS = [
  'linear-gradient(135deg, #edf5ff 0%, #ffd4ea 100%)',
  'linear-gradient(135deg, #fff2e8 0%, #edd9ff 100%)',
  'linear-gradient(135deg, #e6f5ff 0%, #f3e2ff 100%)',
  'linear-gradient(135deg, #eef9ea 0%, #fff3d1 100%)',
];

const CATEGORY_BADGE_STYLES = {
  'tin-tuc': 'border-white/55 bg-white/18 text-white',
  'su-kien': 'border-white/55 bg-black/20 text-white',
};

function getPublishedKey(article) {
  return article?.publishedAt || '0000-00-00';
}

function sortArticlesByDateDesc(articles = []) {
  return [...articles].sort((left, right) => getPublishedKey(right).localeCompare(getPublishedKey(left)));
}

function formatSectionDateLabel(value) {
  if (!value) {
    return 'Đang cập nhật';
  }

  const [year, month, day] = String(value).split('-');

  if (!year || !month || !day) {
    return 'Đang cập nhật';
  }

  return `${Number(day)} tháng ${Number(month)}, ${year}`;
}

function formatHeroDateLabel(value) {
  if (!value) {
    return 'Ngày đang cập nhật';
  }

  const [year, month, day] = String(value).split('-');

  if (!year || !month || !day) {
    return 'Ngày đang cập nhật';
  }

  return `Ngày ${Number(day)} tháng ${Number(month)} năm ${year}`;
}

function getCategoryLabel(article) {
  return article?.category?.trim() || (article?.categorySlug === 'su-kien' ? 'Sự kiện' : 'Tin tức');
}

function getBadgeStyle(article) {
  return CATEGORY_BADGE_STYLES[article?.categorySlug] ?? 'border-white/55 bg-white/18 text-white';
}

function HeroNavButton({ className = '', children, ...props }) {
  return (
    <button
      type="button"
      className={`flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-black/24 text-white backdrop-blur-md transition hover:bg-black/40 sm:h-10 sm:w-10 ${className}`}
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
    }, 6000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [articles.length]);

  useEffect(() => {
    if (activeIndex < articles.length) {
      return;
    }

    setActiveIndex(0);
  }, [activeIndex, articles.length]);

  if (!articles.length) {
    return null;
  }

  const activeArticle = articles[activeIndex];
  const activeBackground = HERO_SLIDE_BACKGROUNDS[activeIndex % HERO_SLIDE_BACKGROUNDS.length];

  const showPrevious = () => {
    setActiveIndex((current) => (current - 1 + articles.length) % articles.length);
  };

  const showNext = () => {
    setActiveIndex((current) => (current + 1) % articles.length);
  };

  return (
    <section className="w-full overflow-hidden bg-white">
      <div className="relative h-[520px] overflow-hidden lg:hidden">
        {articles.map((article, index) => {
          const isActive = index === activeIndex;

          return (
            <div
              key={`hero-mobile-image-${article.slug}`}
              className={`absolute inset-0 transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isActive ? 'opacity-100 scale-100' : 'pointer-events-none opacity-0 scale-[1.03]'
              }`}
              aria-hidden={!isActive}
            >
              <img src={article.coverImage} alt={article.coverAlt} className="h-full w-full object-cover" />
            </div>
          );
        })}

        <div className="absolute inset-0 z-[1] opacity-65" style={{ background: activeBackground }} />
        <div className="absolute inset-0 z-[2] bg-[rgba(4,6,12,0.52)]" />

        <div className="absolute inset-x-0 bottom-0 z-20 px-5 pb-7 pt-24">
          <div className="max-w-[92%]">
            <div className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] backdrop-blur-md ${getBadgeStyle(activeArticle)}`}>
              {getCategoryLabel(activeArticle)}
            </div>
            <div className="mt-4 font-['Inter',_sans-serif] text-[13px] font-medium text-white">
              {formatHeroDateLabel(activeArticle.publishedAt)}
            </div>
            <h1 className="mt-4 text-[24px] font-semibold leading-[1.08] tracking-[-0.05em] text-white sm:text-[28px]">
              {activeArticle.title}
            </h1>
            <p className="mt-5 line-clamp-3 max-w-[36ch] text-[15px] leading-8 text-white/90">
              {activeArticle.excerpt}
            </p>
          </div>

          <div className="mt-8 flex items-end justify-between gap-4">
            <Link
              href={`/follow-srx/${activeArticle.slug}`}
              className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-black px-8 text-[13px] font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#1a1a1a]"
            >
              Xem bài viết
            </Link>

            {articles.length > 1 ? (
              <div className="flex shrink-0 items-center gap-2">
                <HeroNavButton
                  onClick={showPrevious}
                  className="border-white/45 bg-black/48 text-white hover:bg-black/62"
                  aria-label="Bài viết trước"
                >
                  <ChevronLeft className="h-4 w-4" />
                </HeroNavButton>

                <HeroNavButton
                  onClick={showNext}
                  className="border-white/45 bg-black/48 text-white hover:bg-black/62"
                  aria-label="Bài viết tiếp theo"
                >
                  <ChevronRight className="h-4 w-4" />
                </HeroNavButton>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="hidden lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
        <div className="relative h-[540px] overflow-hidden">
          {articles.map((article, index) => {
            const isActive = index === activeIndex;

            return (
              <div
                key={`hero-image-${article.slug}`}
                className={`absolute inset-0 transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  isActive ? 'opacity-100 scale-100' : 'pointer-events-none opacity-0 scale-[1.03]'
                }`}
                aria-hidden={!isActive}
              >
                <img src={article.coverImage} alt={article.coverAlt} className="h-full w-full object-cover" />
              </div>
            );
          })}

          {articles.length > 1 ? (
            <HeroNavButton
              onClick={showPrevious}
              className="absolute left-4 top-1/2 z-20 -translate-y-1/2"
              aria-label="Bài viết trước"
            >
              <ChevronLeft className="h-4 w-4" />
            </HeroNavButton>
          ) : null}
        </div>

        <div
          className="relative flex min-h-[540px] items-center px-14 xl:px-20"
          style={{ background: activeBackground }}
        >
          <div className="relative z-10 max-w-full">
            <div className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${activeArticle.categorySlug === 'su-kien' ? 'border-[#2c3350]/14 bg-white/55 text-[#3a4262]' : 'border-[#2c3350]/14 bg-white/55 text-[#3a4262]'}`}>
              {getCategoryLabel(activeArticle)}
            </div>
            <div className="mt-4 font-['Inter',_sans-serif] text-[13px] font-medium text-[#7c7890]">
              {formatHeroDateLabel(activeArticle.publishedAt)}
            </div>
            <h1 className="mt-4 max-w-full text-[24px] font-semibold leading-[1.12] tracking-[-0.05em] text-[#171b25] md:text-[30px] xl:text-[36px]">
              {activeArticle.title}
            </h1>
            <p className="mt-6 max-w-[90%] text-[14px] leading-7 text-[#555d70] md:text-[16px]">
              {activeArticle.excerpt}
            </p>

            <Link
              href={`/follow-srx/${activeArticle.slug}`}
              className="mt-8 inline-flex min-h-[48px] items-center justify-center rounded-full bg-black px-8 text-[13px] font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#1a1a1a]"
            >
              Xem bài viết
            </Link>
          </div>

          {articles.length > 1 ? (
            <HeroNavButton
              onClick={showNext}
              className="absolute right-5 top-1/2 z-20 -translate-y-1/2"
              aria-label="Bài viết tiếp theo"
            >
              <ChevronRight className="h-4 w-4" />
            </HeroNavButton>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function StoryCard({ article }) {
  return (
    <article className="flex h-full flex-col">
      <Link
        href={`/follow-srx/${article.slug}`}
        className="group block overflow-hidden rounded-[12px] bg-[#edf0fb] shadow-[0_12px_32px_rgba(70,80,128,0.08)]"
      >
        <div className="aspect-[1.48/1] overflow-hidden">
          <img
            src={article.coverImage}
            alt={article.coverAlt}
            className="h-full w-full object-cover transition duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
          />
        </div>
      </Link>

      <div className="flex flex-1 flex-col px-2 pb-1 pt-4">
        <div className="flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-[#74798a]">
          <span className="font-['Inter',_sans-serif]">{formatSectionDateLabel(article.publishedAt)}</span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#d9def6] bg-white px-2.5 py-1 text-[10px] text-[#525b76]">
            <Tag className="h-3 w-3 shrink-0" />
            {getCategoryLabel(article)}
          </span>
        </div>

        <Link
          href={`/follow-srx/${article.slug}`}
          className="mt-4 line-clamp-3 text-[18px] font-medium uppercase leading-[1.16] tracking-[-0.04em] text-[#171b25] transition hover:text-[#4d5cd3]"
        >
          {article.title}
        </Link>

        <p className="mt-4 line-clamp-3 text-[14px] leading-7 text-[#697186]">
          {article.excerpt}
        </p>

        <div className="mt-5 inline-flex items-center gap-2 text-[12px] font-medium text-[#4d5cd3]">
          <CalendarDays className="h-3.5 w-3.5 shrink-0" />
          <span>Đọc bài viết</span>
          <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
        </div>
      </div>
    </article>
  );
}

function SectionEmptyState({ message }) {
  return (
    <div className="mt-8 rounded-[24px] border border-dashed border-[#d9def6] bg-white px-6 py-14 text-center text-[15px] text-[#697186]">
      {message}
    </div>
  );
}

function SectionBlock({
  eyebrow,
  title,
  description,
  articles,
  visibleArticles,
  showAll,
  onShowAll,
  emptyMessage,
}) {
  return (
    <section className="mx-auto max-w-[1560px] px-4 pt-8 md:px-6 xl:px-8">
      <div className="max-w-[760px]">
        <div className="text-[12px] font-semibold uppercase tracking-[0.24em] text-[#858aa2]">{eyebrow}</div>
        <h2 className="mt-4 text-[34px] font-semibold uppercase tracking-[-0.05em] text-[#161b26] md:text-[42px]">
          {title}
        </h2>
        <p className="mt-4 max-w-[640px] text-[15px] leading-8 text-[#697186]">
          {description}
        </p>
      </div>

      {visibleArticles.length ? (
        <>
          <div className="mt-8 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {visibleArticles.map((article, index) => (
              <StoryCard key={`${article.slug}-${index + 1}`} article={article} />
            ))}
          </div>

          {!showAll && articles.length > INITIAL_VISIBLE ? (
            <div className="mt-14 flex justify-center">
              <button
                type="button"
                onClick={onShowAll}
                className="inline-flex min-h-[40px] items-center justify-center rounded-[6px] bg-[#6f87ea] px-8 text-[11px] font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-[#5c77e2]"
              >
                Hiện tất cả
              </button>
            </div>
          ) : null}
        </>
      ) : (
        <SectionEmptyState message={emptyMessage} />
      )}
    </section>
  );
}

function EmptyHubState() {
  return (
    <div className="rounded-[28px] border border-dashed border-[#d9def6] bg-white px-6 py-16 text-center shadow-[0_18px_50px_rgba(79,94,147,0.05)]">
      <div className="text-[12px] font-semibold uppercase tracking-[0.24em] text-[#858aa2]">
        Tin tức & Sự kiện
      </div>
      <h1 className="mt-4 text-[30px] font-medium tracking-[-0.05em] text-[#252c3d]">
        Chưa có bài viết để hiển thị.
      </h1>
      <p className="mx-auto mt-4 max-w-[520px] text-[15px] leading-7 text-[#697186]">
        Khi có bài viết thuộc nhóm tin tức hoặc sự kiện trong bảng posts, trang này sẽ tự động hiển thị.
      </p>
    </div>
  );
}

export default function NewsEventsHubPage({ initialArticles = [] }) {
  const [showAllNews, setShowAllNews] = useState(false);
  const [showAllEvents, setShowAllEvents] = useState(false);

  const sortedArticles = useMemo(() => sortArticlesByDateDesc(initialArticles), [initialArticles]);
  const newsArticles = useMemo(
    () => sortedArticles.filter((article) => article.categorySlug === 'tin-tuc'),
    [sortedArticles],
  );
  const eventArticles = useMemo(
    () => sortedArticles.filter((article) => article.categorySlug === 'su-kien'),
    [sortedArticles],
  );
  const heroArticles = useMemo(() => {
    const featuredArticles = sortedArticles.filter((article) => article.featured);
    const sourceArticles = featuredArticles.length >= 4 ? featuredArticles : sortedArticles;
    return sourceArticles.slice(0, 4);
  }, [sortedArticles]);
  const visibleNewsArticles = showAllNews ? newsArticles : newsArticles.slice(0, INITIAL_VISIBLE);
  const visibleEventArticles = showAllEvents
    ? eventArticles
    : eventArticles.slice(0, INITIAL_VISIBLE);

  return (
    <section className="w-full bg-white">
      {sortedArticles.length ? <HeroStoriesSlider articles={heroArticles} /> : null}

      <div className="w-full">
        {sortedArticles.length ? (
          <div className="space-y-14 md:space-y-20">
            <div className="bg-[#F3F5FF] py-20">
              <SectionBlock
                eyebrow="Tin tức & Sự kiện"
                title="Tin tức mới nhất"
                description="Những cập nhật mới nhất từ SRX về thương hiệu, sản phẩm và các hoạt động nổi bật được tập hợp trên cùng một trang để theo dõi thuận tiện hơn."
                articles={newsArticles}
                visibleArticles={visibleNewsArticles}
                showAll={showAllNews}
                onShowAll={() => setShowAllNews(true)}
                emptyMessage="Chưa có bài viết thuộc nhóm tin tức."
              />
            </div>

            <div className="pb-2">
              <SectionBlock
                eyebrow="Sự kiện"
                title="Sự kiện mới nhất"
                description="Toàn bộ bài viết sự kiện được hiển thị trong cùng trải nghiệm với tin tức, nhưng vẫn giữ bố cục và nhịp trình bày của trang sự kiện làm giao diện chính."
                articles={eventArticles}
                visibleArticles={visibleEventArticles}
                showAll={showAllEvents}
                onShowAll={() => setShowAllEvents(true)}
                emptyMessage="Chưa có bài viết thuộc nhóm sự kiện."
              />
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-[1560px] px-4 py-16 md:px-6 xl:px-8">
            <EmptyHubState />
          </div>
        )}
      </div>

      <AboutContactSection />
      <SRXLogo />
    </section>
  );
}
