import AffiliatePage from '../../src/views/affiliate/AffiliatePage.jsx';
import { buildMetadata } from '../../src/lib/seo.js';

export const metadata = buildMetadata({
  title: 'Affiliate',
  description:
    'Đăng ký affiliate SRX Việt Nam, chờ xét duyệt và quản lý link giới thiệu, hoa hồng cùng thông tin ngân hàng thụ hưởng.',
  path: '/affiliate',
});

export default function AffiliateRoute() {
  return <AffiliatePage />;
}
