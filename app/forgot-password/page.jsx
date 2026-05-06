import ForgotPasswordPage from '../../src/views/auth/ForgotPasswordPage.jsx';
import { buildMetadata } from '../../src/lib/seo.js';

export const metadata = buildMetadata({
  title: 'Quên mật khẩu',
  description: 'Yêu cầu email đặt lại mật khẩu tài khoản SRX Việt Nam.',
  path: '/forgot-password',
  noIndex: true,
});

export default function ForgotPasswordRoute() {
  return <ForgotPasswordPage />;
}
