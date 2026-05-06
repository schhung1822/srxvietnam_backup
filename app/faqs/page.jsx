import FaqsPage from '../../src/views/FaqsPage.jsx';
import { buildMetadata } from '../../src/lib/seo.js';

export const metadata = buildMetadata({
  title: 'Câu hỏi thường gặp',
  description:
    'Tổng hợp câu hỏi thường gặp về mua hàng, đơn hàng, đổi trả và hỗ trợ khách hàng tại SRX Việt Nam.',
  path: '/faqs',
});

export default function FaqsRoute() {
  return <FaqsPage />;
}
