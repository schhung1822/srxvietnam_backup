import CheckoutPage from '../../src/views/shop/CheckoutPage.jsx';
import { buildMetadata } from '../../src/lib/seo.js';

export const metadata = buildMetadata({
  title: 'Thanh toán',
  description:
    'Xác nhận địa chỉ giao hàng, phương thức thanh toán và hoàn tất đơn hàng tại SRX Việt Nam.',
  path: '/checkout',
  noIndex: true,
});

export default function CheckoutRoute() {
  return <CheckoutPage />;
}
