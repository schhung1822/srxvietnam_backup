import { redirect } from 'next/navigation';
import { buildMetadata } from '../../src/lib/seo.js';

export const metadata = buildMetadata({
  title: 'Đăng nhập',
  description: 'Đăng nhập tài khoản SRX Việt Nam.',
  path: '/login',
  noIndex: true,
});

export default function LoginRoute() {
  redirect('/account');
}
