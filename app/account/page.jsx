import { Suspense } from 'react';
import AccountPage from '../../src/views/auth/AccountPage.jsx';
import { buildMetadata } from '../../src/lib/seo.js';
import { isGoogleAuthEnabled } from '../../src/lib/server/google-oauth.js';

export const metadata = buildMetadata({
  title: 'Tài khoản',
  description: 'Đăng nhập, đăng ký và quản lý tài khoản SRX Việt Nam.',
  path: '/account',
  noIndex: true,
});

// Đọc cấu hình Google theo từng request để chỉ cần thêm biến môi trường là nút Google bật lên.
export const dynamic = 'force-dynamic';

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
      <AccountPage isGoogleAuthEnabled={isGoogleAuthEnabled()} />
    </Suspense>
  );
}
