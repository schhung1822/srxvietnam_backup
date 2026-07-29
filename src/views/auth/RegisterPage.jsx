'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { BadgeCheck, ShieldCheck, ShoppingBag } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import useBrowserSearchParams from '../../hooks/useBrowserSearchParams.js';
import { AuthField, AuthPasswordField } from '../../components/auth/AuthField.jsx';
import { AuthAlert, AuthDivider, AuthSubmitButton } from '../../components/auth/AuthPrimitives.jsx';
import GoogleAuthButton from '../../components/auth/GoogleAuthButton.jsx';
import { getAuthErrorMessage } from '../../components/auth/authErrors.js';

const highlights = [
  { icon: ShoppingBag, text: 'Mua hàng nhanh hơn với địa chỉ và thông tin đã lưu sẵn.' },
  { icon: BadgeCheck, text: 'Đăng ký affiliate và theo dõi hoa hồng ngay trong tài khoản.' },
  { icon: ShieldCheck, text: 'Mật khẩu được hash bằng PBKDF2 trước khi lưu vào cơ sở dữ liệu.' },
];

export default function RegisterPage({ isGoogleAuthEnabled = false }) {
  const router = useRouter();
  const searchParams = useBrowserSearchParams();
  const { register: registerAccount, user, isLoading } = useAuth();
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');
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
      await registerAccount({
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        password: values.password,
      });
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
              Tạo tài khoản
            </div>
            <h1 className="mt-4 text-[34px] font-semibold leading-tight tracking-[-0.04em] text-[#15110d]">
              Đăng ký tài khoản để mua hàng và tham gia affiliate.
            </h1>
            <p className="mt-4 max-w-[480px] text-[15px] leading-7 text-[#5E6266]">
              Chỉ mất chưa tới một phút. Sau khi tạo xong, bạn được đăng nhập ngay và có thể bắt đầu mua sắm hoặc gửi
              hồ sơ affiliate.
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

          <div className="mx-auto w-full max-w-[560px]">
            <form onSubmit={onSubmit} className="rounded-[24px] border border-[#D9D9D9] bg-white p-6 md:p-8">
              <h2 className="text-[26px] font-semibold tracking-[-0.03em] text-[#15110d] md:text-[28px]">
                Đăng ký
              </h2>
              <p className="mt-2 text-[14.5px] leading-7 text-[#5E6266]">
                Điền thông tin cơ bản để tạo tài khoản và đăng nhập ngay sau đó.
              </p>

              <AuthAlert className="mt-5">{authErrorMessage}</AuthAlert>

              {isGoogleAuthEnabled ? (
                <div className="mt-6 space-y-5">
                  <GoogleAuthButton label="Đăng ký với Google" nextPath="/register" />
                  <AuthDivider />
                </div>
              ) : null}

              <div className="mt-5 space-y-4">
                <AuthField
                  label="Họ và tên"
                  type="text"
                  autoComplete="name"
                  placeholder="Nguyễn Văn A"
                  error={errors.fullName?.message}
                  {...register('fullName', {
                    required: 'Vui lòng nhập họ tên.',
                    minLength: { value: 2, message: 'Họ tên quá ngắn.' },
                  })}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <AuthField
                    label="Email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    error={errors.email?.message}
                    {...register('email', { required: 'Vui lòng nhập email.' })}
                  />

                  <AuthField
                    label="Số điện thoại"
                    type="tel"
                    autoComplete="tel"
                    placeholder="0903 010 692"
                    {...register('phone')}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <AuthPasswordField
                    label="Mật khẩu"
                    autoComplete="new-password"
                    placeholder="••••••••"
                    hint="Tối thiểu 8 ký tự."
                    error={errors.password?.message}
                    {...register('password', {
                      required: 'Vui lòng nhập mật khẩu.',
                      minLength: { value: 8, message: 'Mật khẩu phải từ 8 ký tự.' },
                    })}
                  />

                  <AuthPasswordField
                    label="Xác nhận mật khẩu"
                    autoComplete="new-password"
                    placeholder="••••••••"
                    error={errors.confirmPassword?.message}
                    {...register('confirmPassword', {
                      required: 'Vui lòng xác nhận mật khẩu.',
                      validate: (value) => value === password || 'Mật khẩu xác nhận không khớp.',
                    })}
                  />
                </div>
              </div>

              <AuthAlert className="mt-4">{submitError}</AuthAlert>

              <AuthSubmitButton className="mt-6" isLoading={isSubmitting} loadingLabel="Đang tạo tài khoản...">
                Tạo tài khoản
              </AuthSubmitButton>

              <p className="mt-4 text-center text-[12.5px] leading-6 text-[#5E6266]">
                Khi tạo tài khoản, bạn đồng ý với{' '}
                <Link href="/dieu-khoan" className="font-semibold text-[#15110d] underline-offset-4 hover:underline">
                  điều khoản sử dụng
                </Link>{' '}
                và{' '}
                <Link
                  href="/chinh-sach-bao-mat"
                  className="font-semibold text-[#15110d] underline-offset-4 hover:underline"
                >
                  chính sách bảo mật
                </Link>{' '}
                của SRX.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
