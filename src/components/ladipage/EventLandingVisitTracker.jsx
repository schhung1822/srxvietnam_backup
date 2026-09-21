'use client';

import { useEffect, useRef } from 'react';

export default function EventLandingVisitTracker({ eventId, slug }) {
  const lastTrackedEvent = useRef(null);

  useEffect(() => {
    if (lastTrackedEvent.current === eventId) {
      return;
    }

    lastTrackedEvent.current = eventId;
    fetch(`/api/events/${encodeURIComponent(slug)}/visit`, {
      method: 'POST',
      keepalive: true,
    }).catch(() => {});
  }, [eventId, slug]);

  return null;
}
