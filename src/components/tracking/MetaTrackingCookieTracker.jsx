'use client';

import { useEffect } from 'react';
import useBrowserSearchParams from '../../hooks/useBrowserSearchParams.js';
import {
  buildFbcCookieValue,
  buildFbpCookieValue,
  FBC_COOKIE_NAME,
  FBP_COOKIE_NAME,
  IPIFY_API_URL,
  META_TRACKING_COOKIE_MAX_AGE_SECONDS,
  normalizeMetaCookieValue,
  normalizeIpValue,
  USER_IP_COOKIE_NAME,
} from '../../lib/tracking.js';

function getCookie(name) {
  const encodedName = `${encodeURIComponent(name)}=`;
  const cookies = document.cookie ? document.cookie.split('; ') : [];

  for (const cookie of cookies) {
    if (cookie.startsWith(encodedName)) {
      return decodeURIComponent(cookie.slice(encodedName.length));
    }
  }

  return null;
}

function setCookie(name, value) {
  const secureSuffix = window.location.protocol === 'https:' ? '; Secure' : '';

  document.cookie =
    `${encodeURIComponent(name)}=${encodeURIComponent(value)}` +
    `; Path=/; Max-Age=${META_TRACKING_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax${secureSuffix}`;
}

export default function MetaTrackingCookieTracker() {
  const searchParams = useBrowserSearchParams();

  useEffect(() => {
    const existingFbp = normalizeMetaCookieValue(getCookie(FBP_COOKIE_NAME));

    if (!existingFbp) {
      setCookie(FBP_COOKIE_NAME, buildFbpCookieValue());
    }

    const fbclid = String(searchParams?.get('fbclid') ?? '').trim();

    if (!fbclid) {
      return;
    }

    const nextFbc = buildFbcCookieValue(fbclid);

    if (!nextFbc) {
      return;
    }

    if (normalizeMetaCookieValue(getCookie(FBC_COOKIE_NAME)) !== nextFbc) {
      setCookie(FBC_COOKIE_NAME, nextFbc);
    }
  }, [searchParams]);

  useEffect(() => {
    const existingIp = normalizeIpValue(getCookie(USER_IP_COOKIE_NAME));

    if (existingIp) {
      return;
    }

    const controller = new AbortController();

    async function persistUserIp() {
      try {
        const response = await fetch(IPIFY_API_URL, {
          cache: 'no-store',
          signal: controller.signal,
        });

        if (!response.ok) {
          return;
        }

        const payload = await response.json();
        const nextIp = normalizeIpValue(payload?.ip);

        if (nextIp) {
          setCookie(USER_IP_COOKIE_NAME, nextIp);
        }
      } catch {
        return;
      }
    }

    void persistUserIp();

    return () => {
      controller.abort();
    };
  }, []);

  return null;
}
