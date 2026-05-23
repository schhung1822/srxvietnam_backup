'use client';

import { useEffect } from 'react';

const TRACKED_VIEW_STORAGE_PREFIX = 'srx:post-view:';

function markTracked(slug) {
  try {
    window.sessionStorage.setItem(`${TRACKED_VIEW_STORAGE_PREFIX}${slug}`, '1');
    return true;
  } catch {
    return false;
  }
}

function hasTracked(slug) {
  try {
    return window.sessionStorage.getItem(`${TRACKED_VIEW_STORAGE_PREFIX}${slug}`) === '1';
  } catch {
    return false;
  }
}

export default function NewsArticleViewTracker({ slug }) {
  useEffect(() => {
    const normalizedSlug = String(slug ?? '').trim();

    if (!normalizedSlug || hasTracked(normalizedSlug)) {
      return;
    }

    markTracked(normalizedSlug);

    const controller = new AbortController();

    fetch(`/api/news/${encodeURIComponent(normalizedSlug)}/view`, {
      method: 'POST',
      cache: 'no-store',
      keepalive: true,
      signal: controller.signal,
    }).catch(() => {});

    return () => {
      controller.abort();
    };
  }, [slug]);

  return null;
}
