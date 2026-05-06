import { Suspense } from 'react';
import AccountPage from '../../src/views/auth/AccountPage.jsx';
import { buildMetadata } from '../../src/lib/seo.js';

export const metadata = buildMetadata({
  title: 'Tài khoản',
  description: 'Đăng nhập, đăng ký và quản lý tài khoản SRX Việt Nam.',
  path: '/account',
  noIndex: true,
});

export default function AccountRoute() {
  return (
    <Suspense
      fallback={
        <section className="bg-[#fcfaf8] py-12 md:py-20">
          <div className="mx-auto max-w-[1280px] px-4 text-[15px] text-[#665a4e] md:px-6">
            Đang tải tài khoản...
          </div>
        </section>
      }
    >
      <AccountPage />
    </Suspense>
  );
}
