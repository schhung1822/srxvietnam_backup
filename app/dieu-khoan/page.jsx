import ClausePage from '../../src/views/Clause.jsx';
import { buildMetadata } from '../../src/lib/seo.js';

export const metadata = buildMetadata({
  title: 'Điều khoản sử dụng',
  description:
    'Điều khoản sử dụng website và các quy định giao dịch áp dụng tại SRX Việt Nam.',
  path: '/dieu-khoan',
});

export default function ClauseRoute() {
  return <ClausePage />;
}
