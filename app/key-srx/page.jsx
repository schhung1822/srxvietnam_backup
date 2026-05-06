import KeySRXPage from '../../src/views/key-srx.jsx';
import { getProductTagDictionaryEntries } from '../../src/lib/server/products.js';
import { buildMetadata } from '../../src/lib/seo.js';

export const dynamic = 'force-dynamic';

export const metadata = buildMetadata({
  title: 'Từ điển thành phần',
  description:
    'Tra cứu thành phần, hoạt chất và công dụng nổi bật trong hệ sản phẩm của SRX Việt Nam.',
  path: '/key-srx',
});

export default async function KeySRXRoute() {
  const entries = await getProductTagDictionaryEntries();

  return <KeySRXPage entries={entries} />;
}
