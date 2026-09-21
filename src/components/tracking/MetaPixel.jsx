'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';

const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim();

export default function MetaPixel() {
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);
  const lastTrackedPath = useRef(null);

  useEffect(() => {
    if (!isReady || !pathname || lastTrackedPath.current === pathname) {
      return;
    }

    window.fbq('track', 'PageView');
    lastTrackedPath.current = pathname;
  }, [isReady, pathname]);

  if (!pixelId || !/^\d+$/.test(pixelId)) {
    return null;
  }

  return (
    <Script id="meta-pixel" strategy="afterInteractive" onReady={() => setIsReady(true)}>
      {`
        !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
        n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
        (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${pixelId}');
      `}
    </Script>
  );
}
