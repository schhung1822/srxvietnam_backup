import KeySRXPage from '../../src/views/key-srx.jsx';
import { getProductTagDictionaryEntries } from '../../src/lib/server/products.js';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Từ điển thành phần | SRX Beauty',
  description:
    'Kh\u00e1m ph\u00e1 nh\u1eefng th\u00e0nh ph\u1ea7n ho\u1ea1t \u0111\u1ed9ng l\u00e0m n\u00ean s\u1ef1 kh\u00e1c bi\u1ec7t trong h\u1ec7 s\u1ea3n ph\u1ea9m SRX.',
};

export default async function KeySRXRoute() {
  const entries = await getProductTagDictionaryEntries();

  return <KeySRXPage entries={entries} />;
}
