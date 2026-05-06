import PaymentRegulationsPage from '../../src/views/PaymentRegulations.jsx';
import { buildMetadata } from '../../src/lib/seo.js';

export const metadata = buildMetadata({
  title: 'Quy định thanh toán',
  description:
    'Các phương thức thanh toán và quy trình xác nhận đơn hàng áp dụng trên website SRX Việt Nam.',
  path: '/quy-dinh-thanh-toan',
});

export default function PaymentRegulationsRoute() {
  return <PaymentRegulationsPage />;
}
