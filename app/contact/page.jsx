import ContactPage from '../../src/views/Contact.jsx';
import { buildMetadata } from '../../src/lib/seo.js';

export const metadata = buildMetadata({
  title: 'Liên hệ',
  description:
    'Liên hệ SRX Việt Nam để được tư vấn sản phẩm, hỗ trợ khách hàng và trao đổi hợp tác nhanh chóng.',
  path: '/contact',
});

export default function ContactRoute() {
  return <ContactPage />;
}
