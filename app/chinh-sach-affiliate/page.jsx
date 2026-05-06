import AffiliatePolicyPage from '../../src/views/affiliate/AffiliattePolicy.jsx';
import { buildMetadata } from '../../src/lib/seo.js';

export const metadata = buildMetadata({
  title: 'Chính sách Affiliate',
  description:
    'Chính sách tham gia affiliate, quyền lợi, điều kiện ghi nhận và quy định vận hành tại SRX Việt Nam.',
  path: '/chinh-sach-affiliate',
});

export default function AffiliatePolicyRoute() {
  return <AffiliatePolicyPage />;
}
