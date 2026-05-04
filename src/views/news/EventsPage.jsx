'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CalendarDays, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import AboutContactSection from '../../components/aboutus/AboutContactSection.jsx';
import SRXLogo from '../../components/home/SrxLogo.jsx';

const INITIAL_PAST_VISIBLE = 6;
const HERO_SLIDE_BACKGROUNDS = [
  'linear-gradient(135deg, #edf5ff 0%, #ffd4ea 100%)',
  'linear-gradient(135deg, #fff2e8 0%, #edd9ff 100%)',
  'linear-gradient(135deg, #e6f5ff 0%, #f3e2ff 100%)',
  'linear-gradient(135deg, #eef9ea 0%, #fff3d1 100%)',
];

function getLocalTodayKey() {
  const today = new Date();
  const year = today.getFullYear();
  const month = `${today.getMonth() + 1}`.padStart(2, '0');
  const day = `${today.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getPublishedKey(article) {
  return article.publishedAt || '0000-00-00';
}

function sortEventsByDateDesc(events) {
  return [...events].sort((left, right) => getPublishedKey(right).localeCompare(getPublishedKey(left)));
}

function sortEventsByDateAsc(events) {
  return [...events].sort((left, right) => getPublishedKey(left).localeCompare(getPublishedKey(right)));
}

function formatEventDateLabel(value) {
  if (!value) {
    return 'ĐANG CẬP NHẬT';
  }

  const [year, month, day] = String(value).split('-');

  if (!year || !month || !day) {
    return 'ĐANG CẬP NHẬT';
  }

  return `${Number(day)} THÁNG ${Number(month)}, ${year}`;
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

function getEventLocation(article) {
  if (typeof article.location === 'string' && article.location.trim()) {
    return article.location.trim();
  }

  return 'Hồ Chí Minh';
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

function HeroEventsSlider({ events = [] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (events.length <= 1) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % events.length);
    }, 6000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [events.length]);

  useEffect(() => {
    if (activeIndex < events.length) {
      return;
    }

    setActiveIndex(0);
  }, [activeIndex, events.length]);

  if (!events.length) {
    return null;
  }

  const activeEvent = events[activeIndex];
  const activeBackground = HERO_SLIDE_BACKGROUNDS[activeIndex % HERO_SLIDE_BACKGROUNDS.length];

  const showPrevious = () => {
    setActiveIndex((current) => (current - 1 + events.length) % events.length);
  };

  const showNext = () => {
    setActiveIndex((current) => (current + 1) % events.length);
  };

  return (
    <section className="w-full overflow-hidden bg-white">
      <div className="relative h-[520px] overflow-hidden lg:hidden">
        {events.map((event, index) => {
          const isActive = index === activeIndex;

          return (
            <div
              key={`hero-mobile-image-${event.slug}`}
              className={`absolute inset-0 transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isActive ? 'opacity-100 scale-100' : 'pointer-events-none opacity-0 scale-[1.03]'
              }`}
              aria-hidden={!isActive}
            >
              <img src={event.coverImage} alt={event.coverAlt} className="h-full w-full object-cover" />
            </div>
          );
        })}

        <div className="absolute inset-0 z-[1] opacity-65" style={{ background: activeBackground }} />
        <div className="absolute inset-0 z-[2] bg-[rgba(4,6,12,0.5)]" />

        <div className="absolute inset-x-0 bottom-0 z-20 px-5 pb-7 pt-24">
          <div className="max-w-[92%]">
            <div className="font-['Inter',_sans-serif] text-[13px] font-medium text-white">{formatHeroDateLabel(activeEvent.publishedAt)}</div>
            <h1 className="mt-4 text-[24px] font-semibold leading-[1.08] tracking-[-0.05em] text-white sm:text-[28px]">
              {activeEvent.title}
            </h1>
            <p className="mt-5 line-clamp-3 max-w-[36ch] text-[15px] leading-8 text-white/90">
              {activeEvent.excerpt}
            </p>
          </div>

          <div className="mt-8 flex items-end justify-between gap-4">
            <Link
              href={`/follow-srx/${activeEvent.slug}`}
              className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-black px-8 text-[13px] font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#1a1a1a]"
            >
              Xem thêm
            </Link>

            {events.length > 1 ? (
              <div className="flex shrink-0 items-center gap-2">
                <HeroNavButton
                  onClick={showPrevious}
                  className="border-white/45 bg-black/48 text-white hover:bg-black/62"
                  aria-label="Sự kiện trước"
                >
                  <ChevronLeft className="h-4 w-4" />
                </HeroNavButton>

                <HeroNavButton
                  onClick={showNext}
                  className="border-white/45 bg-black/48 text-white hover:bg-black/62"
                  aria-label="Sự kiện tiếp theo"
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
          {events.map((event, index) => {
            const isActive = index === activeIndex;

            return (
              <div
                key={`hero-image-${event.slug}`}
                className={`absolute inset-0 transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  isActive ? 'opacity-100 scale-100' : 'pointer-events-none opacity-0 scale-[1.03]'
                }`}
                aria-hidden={!isActive}
              >
                <img src={event.coverImage} alt={event.coverAlt} className="h-full w-full object-cover" />
              </div>
            );
          })}

          {events.length > 1 ? (
            <HeroNavButton
              onClick={showPrevious}
              className="absolute left-4 top-1/2 z-20 -translate-y-1/2"
              aria-label="Sự kiện trước"
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
            <div className="font-['Inter',_sans-serif] text-[13px] font-medium text-[#7c7890]">{formatHeroDateLabel(activeEvent.publishedAt)}</div>
            <h1 className="mt-4 max-w-full text-[24px] font-semibold leading-[1.12] tracking-[-0.05em] text-[#171b25] md:text-[30px] xl:text-[36px]">
              {activeEvent.title}
            </h1>
            <p className="mt-6 max-w-[90%] text-[14px] leading-7 text-[#555d70] md:text-[16px]">
              {activeEvent.excerpt}
            </p>

            <Link
              href={`/follow-srx/${activeEvent.slug}`}
              className="mt-8 inline-flex min-h-[48px] items-center justify-center rounded-full bg-black px-8 text-[13px] font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#1a1a1a]"
            >
              Xem thêm
            </Link>
          </div>

          {events.length > 1 ? (
            <HeroNavButton
              onClick={showNext}
              className="absolute right-5 top-1/2 z-20 -translate-y-1/2"
              aria-label="Sự kiện tiếp theo"
            >
              <ChevronRight className="h-4 w-4" />
            </HeroNavButton>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function EventCard({ article }) {
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
        <div className="flex items-center justify-between gap-3 text-[10px] uppercase tracking-[0.18em] text-[#74798a]">
          <span className="font-['Inter',_sans-serif]">{formatEventDateLabel(article.publishedAt)}</span>
          <CalendarDays className="h-3.5 w-3.5 shrink-0" />
        </div>

        <Link
          href={`/follow-srx/${article.slug}`}
          className="mt-4 line-clamp-3 text-[18px] font-medium uppercase leading-[1.16] tracking-[-0.04em] text-[#171b25] transition hover:text-[#4d5cd3]"
        >
          {article.title}
        </Link>

        <div className="mt-4 inline-flex items-center gap-1.5 text-[12px] text-[#777d8f]">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span>{getEventLocation(article)}</span>
        </div>
      </div>
    </article>
  );
}

function EmptyEventsState() {
  return (
    <div className="rounded-[28px] border border-dashed border-[#d9def6] bg-white px-6 py-16 text-center shadow-[0_18px_50px_rgba(79,94,147,0.05)]">
      <div className="text-[12px] font-semibold uppercase tracking-[0.24em] text-[#858aa2]">Sự kiện</div>
      <h1 className="mt-4 text-[30px] font-medium tracking-[-0.05em] text-[#252c3d]">Chưa có bài viết sự kiện.</h1>
      <p className="mx-auto mt-4 max-w-[520px] text-[15px] leading-7 text-[#697186]">
        Khi có các bài viết thuộc danh mục sự kiện trong bảng posts, trang này sẽ tự động hiển thị.
      </p>
    </div>
  );
}

export default function EventsPage({ initialEvents = [] }) {
  const [showAllPast, setShowAllPast] = useState(false);
  const todayKey = useMemo(() => getLocalTodayKey(), []);
  const sortedEvents = useMemo(() => sortEventsByDateDesc(initialEvents), [initialEvents]);

  const upcomingEvents = useMemo(() => {
    const nextEvents = sortedEvents.filter((article) => article.publishedAt && article.publishedAt >= todayKey);
    return sortEventsByDateAsc(nextEvents);
  }, [sortedEvents, todayKey]);

  const featuredUpcomingEvents = useMemo(
    () => (upcomingEvents.length ? upcomingEvents.slice(0, 3) : sortedEvents.slice(0, 3)),
    [sortedEvents, upcomingEvents],
  );

  const pastEvents = useMemo(() => {
    if (!upcomingEvents.length) {
      return sortedEvents;
    }

    return sortedEvents.filter((article) => !article.publishedAt || article.publishedAt < todayKey);
  }, [sortedEvents, todayKey, upcomingEvents.length]);

  const heroEvents = useMemo(() => {
    const sourceEvents = upcomingEvents.length ? upcomingEvents : sortedEvents;
    return sourceEvents.slice(0, 4);
  }, [sortedEvents, upcomingEvents]);

  const visiblePastEvents = showAllPast ? pastEvents : pastEvents.slice(0, INITIAL_PAST_VISIBLE);
  const hasMorePastEvents = pastEvents.length > INITIAL_PAST_VISIBLE;

  return (
    <section className="w-full">
      {sortedEvents.length ? <HeroEventsSlider events={heroEvents} /> : null}

      <div className="w-full">
        {sortedEvents.length ? (
          <div className="space-y-14 md:space-y-20 w-full">
            <div className='bg-[#F3F5FF] py-20 '>
              <section className='mx-auto max-w-[1560px] px-4 pt-8 md:px-6 xl:px-8'>
                <h1 className="text-[34px] font-semibold uppercase tracking-[-0.05em] text-[#161b26] md:text-[42px]">
                  Sự kiện sắp diễn ra
                </h1>

                <div className="mt-8 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                  {featuredUpcomingEvents.map((article, index) => (
                    <EventCard key={`upcoming-${article.slug}-${index}`} article={article} />
                  ))}
                </div>
              </section>
            </div>

            <div className='w-full'>
              <section className="mx-auto max-w-[1560px] px-4 pt-8 md:px-6 xl:px-8">
                  <h2 className="text-[34px] font-semibold uppercase tracking-[-0.05em] text-[#161b26] md:text-[42px]">
                    Sự kiện đã diễn ra
                  </h2>

                  {visiblePastEvents.length ? (
                    <>
                      <div className="mt-8 grid gap-10 md:grid-cols-2 xl:grid-cols-3">
                        {visiblePastEvents.map((article, index) => (
                          <EventCard key={`past-${article.slug}-${index}`} article={article} />
                        ))}
                      </div>

                      {hasMorePastEvents && !showAllPast ? (
                        <div className="mt-14 flex justify-center">
                          <button
                            type="button"
                            onClick={() => setShowAllPast(true)}
                            className="inline-flex min-h-[40px] items-center justify-center rounded-[6px] bg-[#6f87ea] px-8 text-[11px] font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-[#5c77e2]"
                          >
                            Hiện tất cả
                          </button>
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <div className="mt-8 rounded-[24px] border border-dashed border-[#d9def6] bg-white px-6 py-14 text-center text-[15px] text-[#697186]">
                      Chua co bai viet su kien trong nhom nay.
                    </div>
                  )}
                </section>
            </div>
          </div>
        ) : (
          <EmptyEventsState />
        )}
      </div>

      <AboutContactSection />
      <SRXLogo />
    </section>
  );
}
