import { Suspense } from 'react';
import ResetPasswordPage from '../../src/views/auth/ResetPasswordPage.jsx';
import { buildMetadata } from '../../src/lib/seo.js';

export const metadata = buildMetadata({
  title: 'Đặt lại mật khẩu',
  description: 'Tạo mật khẩu mới cho tài khoản SRX Việt Nam.',
  path: '/reset-password',
  noIndex: true,
});

export default function ResetPasswordRoute() {
  return (
    <Suspense
      fallback={
        <section className="bg-white py-12 md:py-20">
          <div className="mx-auto max-w-[1180px] px-4 text-[15px] text-[#665a4e] md:px-6">
            Đang tải trang đặt lại mật khẩu...
          </div>
        </section>
      }
    >
      <ResetPasswordPage />
    </Suspense>
  );
}
