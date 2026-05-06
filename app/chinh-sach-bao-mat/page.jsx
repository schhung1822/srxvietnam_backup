import PrivacyPolicyPage from '../../src/views/PrivacyPolicyPage.jsx';
import { buildMetadata } from '../../src/lib/seo.js';

export const metadata = buildMetadata({
  title: 'Chính sách bảo mật',
  description:
    'Thông tin về cách SRX Việt Nam thu thập, sử dụng và bảo vệ dữ liệu cá nhân của khách hàng.',
  path: '/chinh-sach-bao-mat',
});

export default function PrivacyPolicyRoute() {
  return <PrivacyPolicyPage />;
}
