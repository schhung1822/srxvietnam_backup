import FaqsPage from '../../src/views/FaqsPage.jsx';
import { buildMetadata } from '../../src/lib/seo.js';

export const metadata = buildMetadata({
  title: 'Câu hỏi thường gặp về sản phẩm SRX',
  description:
    'Tổng hợp câu hỏi thường gặp về mua hàng, đơn hàng, đổi trả và hỗ trợ khách hàng tại SRX Việt Nam.',
  path: '/faqs',
  keywords: ['SRX có tốt không', 'cách dùng SRX', 'mua SRX chính hãng', 'đổi trả SRX'],
});

export default function FaqsRoute() {
  return <FaqsPage />;
}
