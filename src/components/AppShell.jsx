'use client';

import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import PageTransition from './PageTransition';
import CartDrawer from './cart/CartDrawer';
import AffiliateReferralTracker from './affiliate/AffiliateReferralTracker';
import MetaTrackingCookieTracker from './tracking/MetaTrackingCookieTracker';
import FloatingCallToAction from './FloatingCallToAction';
import { AuthProvider } from '../contexts/AuthContext';
import { CartProvider, useCart } from '../contexts/CartContext';
import { usePageTransition } from '../hooks/usePageTransition';
import { useSEO } from '../hooks/useSEO';

function AppShellContent({ children }) {
  const pathname = usePathname() ?? '/';
  const { transitionPhase } = usePageTransition();

  useSEO();

  const isVerificationPage = pathname === '/tiktok-verification';
  const isEventLandingPage = pathname.startsWith('/events/');
  const hideSiteChrome = isVerificationPage || isEventLandingPage;
  const { items, isCartOpen } = useCart();
  const hideFooter = hideSiteChrome || (pathname === '/checkout' && items.length > 0);

  return (
        <div className="App min-h-screen flex flex-col">
          {!isEventLandingPage ? (
            <Suspense fallback={null}>
              <AffiliateReferralTracker />
            </Suspense>
          ) : null}
          {!isEventLandingPage ? (
            <Suspense fallback={null}>
              <MetaTrackingCookieTracker />
            </Suspense>
          ) : null}
          {!hideSiteChrome ? (
            <Suspense fallback={null}>
              <Header />
            </Suspense>
          ) : null}

          <main className={hideSiteChrome ? 'flex-1' : 'page-content flex-1 pt-[70px] lg:pt-[85px]'}>
            {children}
          </main>

          {!hideFooter && <Footer />}
          {!hideSiteChrome && <CartDrawer />}
          {!hideSiteChrome && !isCartOpen && <FloatingCallToAction />}

          {!hideSiteChrome ? (
            <PageTransition
              logoSrc="/assets/images/header/logo_primary.webp"
              transitionPhase={transitionPhase}
            />
          ) : null}
        </div>
  );
}

export default function AppShell({ children }) {
  return (
    <AuthProvider>
      <CartProvider>
        <AppShellContent>{children}</AppShellContent>
      </CartProvider>
    </AuthProvider>
  );
}
