'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';

export default function AffiliateReferralTracker() {
  const searchParams = useSearchParams();
  const lastTrackedKeyRef = useRef('');

  useEffect(() => {
    const affiliateCode = String(searchParams?.get('ref') ?? '').trim();

    if (!affiliateCode) {
      return;
    }

    const trackingKey = `${window.location.pathname}?${searchParams.toString()}`;

    if (lastTrackedKeyRef.current === trackingKey) {
      return;
    }

    lastTrackedKeyRef.current = trackingKey;

    fetch('/api/affiliate/referral', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: affiliateCode,
        landingUrl: window.location.href,
        referrerUrl: document.referrer || '',
      }),
    }).catch(() => {});
  }, [searchParams]);

  return null;
}
