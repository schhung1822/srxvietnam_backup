'use client';

import { useEffect, useState } from 'react';

export default function NewsReadingProgress({ contentId = 'news-article-content' }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frameId = 0;

    const measure = () => {
      frameId = 0;

      const content = document.getElementById(contentId);

      if (!content) {
        setProgress(0);
        return;
      }

      const start = content.offsetTop;
      const total = content.offsetHeight;
      const passed = window.scrollY + window.innerHeight * 0.5 - start;

      setProgress(Math.min(1, Math.max(0, passed / Math.max(1, total))));
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
  }, [contentId]);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-[70px] z-40 h-[3px] lg:top-[85px]"
      aria-hidden="true"
    >
      <div
        className="h-full rounded-r-full bg-[linear-gradient(90deg,#6f87ea_0%,#4f67e8_100%)] transition-[width] duration-150 ease-out"
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  );
}
