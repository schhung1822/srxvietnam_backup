import DeliveryPolicyPage from '../../src/views/DeliveryPolicy.jsx';
import { buildMetadata } from '../../src/lib/seo.js';

export const metadata = buildMetadata({
  title: 'Chính sách giao hàng',
  description:
    'Chính sách giao hàng, thời gian vận chuyển và phạm vi phục vụ của SRX Việt Nam trên toàn quốc.',
  path: '/chinh-sach-giao-hang',
});

export default function DeliveryPolicyRoute() {
  return <DeliveryPolicyPage />;
}
