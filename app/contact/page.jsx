import ContactPage from '../../src/views/Contact.jsx';
import { buildMetadata } from '../../src/lib/seo.js';

export const metadata = buildMetadata({
  title: 'Liên hệ - Địa chỉ mua SRX chính hãng',
  description:
    'Liên hệ SRX Việt Nam: hotline, Zalo, địa chỉ 58 Phước Hưng, Quận 5, TP.HCM. Tư vấn chăm sóc da, mua SRX chính hãng và hợp tác phân phối.',
  path: '/contact',
  keywords: ['mua SRX ở đâu', 'địa chỉ mua SRX chính hãng', 'hotline SRX', 'đại lý SRX', 'nhà phân phối SRX'],
});

export default function ContactRoute() {
  return <ContactPage />;
}
