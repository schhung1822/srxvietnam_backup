import KeySRXPage from '../../src/views/key-srx.jsx';
import { getProductTagDictionaryEntries } from '../../src/lib/server/products.js';
import { buildMetadata } from '../../src/lib/seo.js';

export const dynamic = 'force-dynamic';

export const metadata = buildMetadata({
  title: 'Từ điển thành phần mỹ phẩm - Hoạt chất trong SRX',
  description:
    'Tra cứu thành phần, hoạt chất, công dụng, phân loại và mức đánh giá nổi bật trong hệ sản phẩm chăm sóc da của SRX Việt Nam.',
  path: '/key-srx',
  keywords: ['thành phần SRX', 'từ điển thành phần mỹ phẩm', 'hoạt chất chăm sóc da', 'ingredient skincare', 'công dụng hoạt chất', 'Retinol', 'Copper Peptide', 'Panthenol', 'Ceramide'],
});

export default async function KeySRXRoute() {
  const entries = await getProductTagDictionaryEntries();

  return <KeySRXPage entries={entries} />;
}
