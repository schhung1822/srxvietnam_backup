'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, List } from 'lucide-react';

const ACTIVE_OFFSET = 160;

function useActiveHeading(headings) {
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    if (!headings.length) {
      return undefined;
    }

    let frameId = 0;

    const measure = () => {
      frameId = 0;

      let nextActiveId = headings[0].id;

      for (const heading of headings) {
        const element = document.getElementById(heading.id);

        if (!element) {
          continue;
        }

        if (element.getBoundingClientRect().top > ACTIVE_OFFSET) {
          break;
        }

        nextActiveId = heading.id;
      }

      setActiveId(nextActiveId);
    };

    const requestMeasure = () => {
      if (frameId) {
        return;
      }

      frameId = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('scroll', requestMeasure, { passive: true });
    window.addEventListener('resize', requestMeasure);

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }

      window.removeEventListener('scroll', requestMeasure);
      window.removeEventListener('resize', requestMeasure);
    };
  }, [headings]);

  return activeId;
}

function TocLink({ heading, isActive }) {
  return (
    <a
      href={`#${heading.id}`}
      className={`block py-2.5 pl-5 pr-2 text-[14px] leading-6 transition-colors duration-300 ${
        isActive ? 'font-semibold text-[#4f67e8]' : 'text-[#6b7288] hover:text-[#4f67e8]'
      }`}
      aria-current={isActive ? 'true' : undefined}
    >
      {heading.text}
    </a>
  );
}

export default function NewsArticleToc({ headings = [], variant = 'desktop' }) {
  const activeId = useActiveHeading(headings);

  if (!headings.length) {
    return null;
  }

  if (variant === 'mobile') {
    return (
      <details className="group mb-10 overflow-hidden rounded-[18px] border border-[#e4e8f6] bg-white shadow-[0_16px_38px_-30px_rgba(43,54,110,0.65)] lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-6 py-[18px] [&::-webkit-details-marker]:hidden">
          <span className="inline-flex items-center gap-2.5 text-[12px] font-semibold uppercase tracking-[0.2em] text-[#4a5375]">
            <List className="h-4 w-4 shrink-0 text-[#4f67e8]" />
            Mục lục
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-[#8a90ab] transition-transform duration-300 group-open:rotate-180" />
        </summary>

        <div className="border-t border-[#eef0f9] px-6 py-4">
          <nav className="border-l border-[#e6eaf7] pl-1">
            {headings.map((heading) => (
              <TocLink key={heading.id} heading={heading} isActive={heading.id === activeId} />
            ))}
          </nav>
        </div>
      </details>
    );
  }

  return (
    <div className="rounded-[20px] border border-[#e4e8f6] bg-white p-6 shadow-[0_20px_48px_-34px_rgba(43,54,110,0.7)]">
      <span className="inline-flex items-center gap-2.5 text-[12px] font-semibold uppercase tracking-[0.2em] text-[#4a5375]">
        <List className="h-4 w-4 shrink-0 text-[#4f67e8]" />
        Mục lục
      </span>

      <div className="mt-4 border-t border-[#eef0f9] pt-4">
        <nav className="max-h-[calc(100vh-280px)] overflow-y-auto">
          {headings.map((heading) => (
            <TocLink key={heading.id} heading={heading} isActive={heading.id === activeId} />
          ))}
        </nav>
      </div>
    </div>
  );
}
