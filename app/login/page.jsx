/* eslint-disable react-refresh/only-export-components */
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Đăng nhập | SRX Beauty',
  description: 'Đăng nhập tài khoản SRX Beauty.',
};

export default function LoginRoute() {
  redirect('/account');
}
