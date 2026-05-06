import { redirect } from 'next/navigation';
import { buildMetadata } from '../../src/lib/seo.js';

export const metadata = buildMetadata({
  title: 'Đăng ký',
  description: 'Tạo tài khoản SRX Việt Nam.',
  path: '/register',
  noIndex: true,
});

export default function RegisterRoute() {
  redirect('/account?tab=register');
}
