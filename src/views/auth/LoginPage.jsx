'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { LockKeyhole, MapPin, PackageSearch } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import useBrowserSearchParams from '../../hooks/useBrowserSearchParams.js';
import { AuthField, AuthPasswordField } from '../../components/auth/AuthField.jsx';
import { AuthAlert, AuthDivider, AuthSubmitButton } from '../../components/auth/AuthPrimitives.jsx';
import GoogleAuthButton from '../../components/auth/GoogleAuthButton.jsx';
import ZaloQrLoginButton from '../../components/auth/ZaloQrLoginButton.jsx';
import { getAuthErrorMessage } from '../../components/auth/authErrors.js';

const highlights = [
  { icon: PackageSearch, text: 'Theo dõi đơn hàng và trạng thái xử lý theo thời gian thực.' },
  { icon: MapPin, text: 'Lưu sẵn địa chỉ giao hàng để đặt hàng nhanh hơn.' },
  { icon: LockKeyhole, text: 'Session được lưu bằng cookie bảo mật trên website.' },
];

export default function LoginPage({ isGoogleAuthEnabled = false, isZaloQrLoginEnabled = false }) {
  const router = useRouter();
  const searchParams = useBrowserSearchParams();
  const { login, user, isLoading } = useAuth();
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  const authErrorMessage = getAuthErrorMessage(searchParams.get('authError'));

  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/');
    }
  }, [isLoading, router, user]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      setIsSubmitting(true);
      setSubmitError('');
      await login(values);
      router.push('/');
      router.refresh();
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <section className="bg-[#f9f9f9] py-12 md:py-20">
      <div className="mx-auto max-w-[1180px] px-4 md:px-6">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div className="hidden lg:block rounded-[24px] border border-[#D9D9D9] bg-white p-7 md:p-9">
            <div className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#5E6266]">
              Tài khoản SRX
            </div>
            <h1 className="mt-4 text-[34px] font-semibold leading-tight tracking-[-0.04em] text-[#15110d]">
              Đăng nhập để quản lý đơn hàng và affiliate.
            </h1>
            <p className="mt-4 max-w-[480px] text-[15px] leading-7 text-[#5E6266]">
              Sau khi đăng nhập, bạn có thể theo dõi đơn hàng, lưu địa chỉ, đăng ký affiliate và nhận hoa hồng từ các
              đơn mua qua link giới thiệu.
            </p>

            <div className="mt-8 space-y-3">
              {highlights.map((item) => {
                const ItemIcon = item.icon;

                return (
                  <div
                    key={item.text}
                    className="flex items-center gap-3.5 rounded-[16px] border border-[#D9D9D9] bg-[#F6F6F6] px-4 py-3.5"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-white text-[#15110d]">
                      <ItemIcon className="h-4 w-4" />
                    </span>
                    <span className="text-[14.5px] leading-6 text-[#5E6266]">{item.text}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mx-auto w-full max-w-[520px]">
            <form onSubmit={onSubmit} className="rounded-[24px] border border-[#D9D9D9] bg-white p-6 md:p-8">
              <h2 className="text-[26px] font-semibold tracking-[-0.03em] text-[#15110d] md:text-[28px]">
                Đăng nhập
              </h2>
              <p className="mt-2 text-[14.5px] leading-7 text-[#5E6266]">
                Nhập email hoặc số điện thoại đã đăng ký cùng mật khẩu để truy cập tài khoản.
              </p>

              <AuthAlert className="mt-5">{authErrorMessage}</AuthAlert>

              {isGoogleAuthEnabled || isZaloQrLoginEnabled ? (
                <div className="mt-6 space-y-5">
                  <div className="flex flex-col gap-3 sm:flex-row">
                    {isGoogleAuthEnabled ? <GoogleAuthButton className="sm:min-w-0 sm:flex-1" nextPath="/login" /> : null}
                    {isZaloQrLoginEnabled ? <ZaloQrLoginButton className="sm:min-w-0 sm:flex-1" nextPath="/" /> : null}
                  </div>
                  <AuthDivider label="hoặc dùng email / sđt" />
                </div>
              ) : null}

              <div className="mt-5 space-y-4">
                <AuthField
                  label="Email hoặc số điện thoại"
                  type="text"
                  inputMode="email"
                  autoComplete="username"
                  placeholder="you@example.com hoặc 09xxxxxxxx"
                  error={errors.identifier?.message}
                  {...register('identifier', { required: 'Vui lòng nhập email hoặc số điện thoại.' })}
                />

                <AuthPasswordField
                  label="Mật khẩu"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  error={errors.password?.message}
                  trailing={
                    <Link
                      href="/forgot-password"
                      className="text-[13px] font-semibold text-[#15110d] underline-offset-4 hover:underline"
                    >
                      Quên mật khẩu?
                    </Link>
                  }
                  {...register('password', { required: 'Vui lòng nhập mật khẩu.' })}
                />
              </div>

              <AuthAlert className="mt-4">{submitError}</AuthAlert>

              <AuthSubmitButton className="mt-6" isLoading={isSubmitting} loadingLabel="Đang đăng nhập...">
                Đăng nhập
              </AuthSubmitButton>

              <div className="mt-5 text-center text-[14px] text-[#5E6266]">
                Chưa có tài khoản?{' '}
                <Link href="/register" className="font-semibold text-[#15110d] underline-offset-4 hover:underline">
                  Đăng ký ngay
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
