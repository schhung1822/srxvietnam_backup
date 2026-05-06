import RefundPolicyPage from '../../src/views/RefundPolicy.jsx';
import { buildMetadata } from '../../src/lib/seo.js';

export const metadata = buildMetadata({
  title: 'Chính sách đổi trả',
  description:
    'Quy định đổi trả, hoàn tiền và điều kiện xử lý khi sản phẩm phát sinh lỗi tại SRX Việt Nam.',
  path: '/chinh-sach-hoan-tra',
});

export default function RefundPolicyRoute() {
  return <RefundPolicyPage />;
}
