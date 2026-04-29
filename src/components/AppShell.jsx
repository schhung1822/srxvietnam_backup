'use client';

import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import PageTransition from './PageTransition';
import CartDrawer from './cart/CartDrawer';
import AffiliateReferralTracker from './affiliate/AffiliateReferralTracker';
import { AuthProvider } from '../contexts/AuthContext';
import { CartProvider } from '../contexts/CartContext';
import { usePageTransition } from '../hooks/usePageTransition';
import { useSEO } from '../hooks/useSEO';

export default function AppShell({ children }) {
  const pathname = usePathname() ?? '/';
  const { transitionPhase } = usePageTransition();

  useSEO();

  const isVerificationPage = pathname === '/tiktok-verification';

  return (
    <AuthProvider>
      <CartProvider>
        <div className="App min-h-screen flex flex-col">
          <Suspense fallback={null}>
            <AffiliateReferralTracker />
          </Suspense>
          {!isVerificationPage && <Header />}

          <main className={isVerificationPage ? 'flex-1' : 'page-content flex-1 pt-[70px] lg:pt-[85px]'}>
            {children}
          </main>

          {!isVerificationPage && <Footer />}
          {!isVerificationPage && <CartDrawer />}

          <PageTransition
            logoSrc="/assets/images/header/logo_primary.webp"
            transitionPhase={transitionPhase}
          />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}
