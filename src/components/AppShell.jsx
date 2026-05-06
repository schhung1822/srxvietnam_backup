'use client';

import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import PageTransition from './PageTransition';
import CartDrawer from './cart/CartDrawer';
import AffiliateReferralTracker from './affiliate/AffiliateReferralTracker';
import FloatingCallToAction from './FloatingCallToAction';
import { AuthProvider } from '../contexts/AuthContext';
import { CartProvider } from '../contexts/CartContext';
import { usePageTransition } from '../hooks/usePageTransition';
import { useSEO } from '../hooks/useSEO';

export default function AppShell({ children }) {
  const pathname = usePathname() ?? '/';
  const { transitionPhase } = usePageTransition();

  useSEO();

  const isVerificationPage = pathname === '/tiktok-verification';
  const isEventLandingPage = pathname.startsWith('/events/');
  const hideSiteChrome = isVerificationPage || isEventLandingPage;

  return (
    <AuthProvider>
      <CartProvider>
        <div className="App min-h-screen flex flex-col">
          {!isEventLandingPage ? (
            <Suspense fallback={null}>
              <AffiliateReferralTracker />
            </Suspense>
          ) : null}
          {!hideSiteChrome && <Header />}

          <main className={hideSiteChrome ? 'flex-1' : 'page-content flex-1 pt-[70px] lg:pt-[85px]'}>
            {children}
          </main>

          {!hideSiteChrome && <Footer />}
          {!hideSiteChrome && <CartDrawer />}
          {!hideSiteChrome && <FloatingCallToAction />}

          {!hideSiteChrome ? (
            <PageTransition
              logoSrc="/assets/images/header/logo_primary.webp"
              transitionPhase={transitionPhase}
            />
          ) : null}
        </div>
      </CartProvider>
    </AuthProvider>
  );
}
