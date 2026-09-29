import AffiliatePage from '../../src/views/affiliate/AffiliatePage.jsx';
import { buildMetadata } from '../../src/lib/seo.js';

export const metadata = buildMetadata({
  title: 'Affiliate SRX - Tiếp thị liên kết mỹ phẩm nhận hoa hồng',
  description:
    'Đăng ký affiliate SRX Việt Nam, chờ xét duyệt và quản lý link giới thiệu, hoa hồng cùng thông tin ngân hàng thụ hưởng.',
  path: '/affiliate',
  keywords: ['affiliate mỹ phẩm', 'tiếp thị liên kết mỹ phẩm', 'cộng tác viên bán mỹ phẩm', 'affiliate SRX'],
});

export default function AffiliateRoute() {
  return <AffiliatePage />;
}
