import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Đăng ký | SRX Beauty',
  description: 'Tạo tài khoản SRX Beauty.',
};

export default function RegisterRoute() {
  redirect('/account?tab=register');
}
