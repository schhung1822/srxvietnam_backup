import CheckoutPaymentPage from '../../../../src/views/shop/CheckoutPaymentPage.jsx';
import { buildMetadata } from '../../../../src/lib/seo.js';

export const metadata = buildMetadata({
  title: 'Chờ thanh toán',
  description: 'Quét mã QR SePay và theo dõi trạng thái thanh toán đơn hàng của bạn tại SRX Việt Nam.',
  path: '/checkout/payment',
  noIndex: true,
});

export default async function CheckoutPaymentRoute({ params }) {
  const { orderNumber } = await params;

  return <CheckoutPaymentPage orderNumber={orderNumber} />;
}
