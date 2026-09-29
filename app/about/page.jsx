import AboutPage from '../../src/views/About.jsx';
import { buildMetadata } from '../../src/lib/seo.js';

export const metadata = buildMetadata({
  title: 'Về SRX - Thương hiệu dược mỹ phẩm Hàn Quốc',
  description:
    'SRX là thương hiệu dược mỹ phẩm cao cấp Hàn Quốc ra đời năm 2005, chuyên phục hồi và tái tạo da. Câu chuyện, công nghệ và hành trình của SRX Việt Nam.',
  path: '/about',
  keywords: ['SRX là gì', 'thương hiệu SRX', 'SRX của nước nào', 'câu chuyện thương hiệu SRX', 'công nghệ tế bào gốc'],
});

export default function AboutRoute() {
  return <AboutPage />;
}
