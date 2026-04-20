'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { demoNews, formatNewsDate, sortNewsByDate } from '../../data/demoNews.js';
import ScrollRevealHeading from './ScrollRevealHeading.jsx';
import {
  homeButtonHighlightClass,
  homeButtonSheenClass,
  homePrimaryButtonClass,
  homeSecondaryButtonClass,
} from './homeCtaStyles.js';

const fallbackArticles = sortNewsByDate(demoNews).slice(0, 3);

function ScientificTopicCard({ article }) {
  return (
    <Link href={`/follow-srx/${article.slug}`} className="group block">
      <article className="flex h-full flex-col">
        <div className="relative overflow-hidden rounded-[18px] bg-[#eef2ff] shadow-[0_24px_70px_rgba(79,94,147,0.12)]">
          <div className="aspect-[4/5] overflow-hidden">
            <img
              src={article.coverImage}
              alt={article.coverAlt}
              className="h-full w-full object-cover transition duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
              loading="lazy"
            />
          </div>
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02)_0%,rgba(16,19,28,0.08)_100%)] transition duration-500 group-hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.2)_0%,rgba(7,10,18,0.6)_100%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[#0b0f19]/0 transition-colors duration-500 group-hover:bg-[#0b0f19]/24" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-16 w-16 translate-y-2 items-center justify-center rounded-full bg-white text-[#1d2230] opacity-0 shadow-[0_18px_40px_rgba(0,0,0,0.14)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 group-hover:opacity-100 sm:h-20 sm:w-20">
              <ArrowUpRight className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={1.9} />
            </div>
          </div>
        </div>

        <div className="px-2 pb-2 pt-5">
          <div className="text-[12px] font-medium tracking-[0.01em] text-[#7f8495]">
            {formatNewsDate(article.publishedAt)}
          </div>
          <h3
            className="mt-4 max-w-[80%] text-[18px] font-medium leading-[1.12] tracking-[-0.05em] text-[#2b3140] sm:text-[24px]"
            style={{ fontFamily: '"Manrope", "Hubot Sans", sans-serif' }}
          >
            {article.title}
          </h3>
          <div className="mt-5 h-[3px] w-9 rounded-full bg-[#2d3444] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-full" />
        </div>
      </article>
    </Link>
  );
}

export default function HomeScientificTopicsSection() {
  const [articles, setArticles] = useState(fallbackArticles);

  useEffect(() => {
    const controller = new AbortController();

    async function loadLatestArticles() {
      try {
        const response = await fetch('/api/news/latest?limit=3', {
          signal: controller.signal,
          cache: 'no-store',
        });

        if (!response.ok) {
          return;
        }

        const payload = await response.json();

        if (Array.isArray(payload.articles) && payload.articles.length) {
          setArticles(payload.articles.slice(0, 3));
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Failed to hydrate homepage news section:', error);
        }
      }
    }

    loadLatestArticles();

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <section className="bg-white py-16 sm:py-[72px] lg:py-32">
      <div className="mx-auto max-w-[1800px] px-4 sm:px-6 lg:px-8">
        <div className="mb-20 grid gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
          <div>
            <ScrollRevealHeading
              as="h2"
              className="text-[38px] font-medium leading-[1.2] tracking-[-0.07em] sm:text-[56px] lg:text-[72px]"
              revealedClassName="text-black"
              baseStyle={{ color: 'rgba(0,0,0,0.14)' }}
              style={{ fontFamily: '"Manrope", "Hubot Sans", sans-serif' }}
            >
              Chủ đề khoa học
            </ScrollRevealHeading>
          </div>

          <Link
            href="/follow-srx"
            className="group inline-flex items-start justify-start gap-3 text-[18px] font-medium tracking-[-0.03em] text-[#222837] transition hover:text-black md:justify-self-end"
          >
            <span className="flex flex-col gap-2">
              <span className="flex items-center gap-3">
                <span>Xem tất cả</span>
                <ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </span>
              <span className="h-[3px] w-8 rounded-full bg-[#2d3444] transition-all duration-300 group-hover:w-full" />
            </span>
          </Link>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {articles.map((article) => (
            <ScientificTopicCard key={article.slug} article={article} />
          ))}
        </div>

        <div data-tech-cta className="mt-20 flex w-full justify-center">
          <div className="flex justify-center w-full max-w-[460px] gap-3 sm:w-auto sm:max-w-none sm:gap-[18px]">
            <Link
              href="/products"
              className={`${homePrimaryButtonClass} justify-center shrink-0 sm:w-auto min-w-[118px]`}
              style={{ fontFamily: '"Manrope", "Hubot Sans", sans-serif' }}
            >
              <span className={homeButtonHighlightClass} />
              <span className={homeButtonSheenClass} />
              <span className="relative z-[1]">Khám phá ngay</span>
            </Link>

            <Link
              href="/contact"
              className={`${homeSecondaryButtonClass} justify-center shrink-0 px-6 sm:w-auto min-w-[210px] sm:px-7`}
              style={{ fontFamily: '"Manrope", "Hubot Sans", sans-serif' }}
            >
              <span className={homeButtonHighlightClass} />
              <span className={homeButtonSheenClass} />
              <span className="relative z-[1]">Nâng cấp làn da của bạn</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
