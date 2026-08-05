import { Suspense } from 'react';
import CheckOrderPage from '../../src/views/shop/CheckOrderPage.jsx';
import { buildMetadata } from '../../src/lib/seo.js';

export const metadata = buildMetadata({
  title: 'Kiểm tra đơn hàng',
  description: 'Tra cứu trạng thái và chi tiết đơn hàng SRX Việt Nam bằng mã đơn, không cần đăng nhập.',
  path: '/check-order',
  noIndex: true,
});

export default function CheckOrderRoute() {
  return (
    <Suspense
      fallback={
        <section className="bg-white py-12 md:py-20">
          <div className="mx-auto max-w-[1100px] px-3 text-[15px] text-[#666] sm:px-6">Đang tải trang tra cứu...</div>
        </section>
      }
    >
      <CheckOrderPage />
    </Suspense>
  );
}
