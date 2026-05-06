import AboutPage from '../../src/views/About.jsx';
import { buildMetadata } from '../../src/lib/seo.js';

export const metadata = buildMetadata({
  title: 'Về SRX',
  description:
    'Tìm hiểu câu chuyện thương hiệu, định hướng nghiên cứu và hành trình phát triển của SRX Việt Nam.',
  path: '/about',
});

export default function AboutRoute() {
  return <AboutPage />;
}
