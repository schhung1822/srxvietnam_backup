'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login, user, isLoading } = useAuth();
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

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
    <section className="bg-white py-12 md:py-20">
      <div className="mx-auto max-w-[1180px] px-4 md:px-6">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="border-b border-[#e9e3da] pb-8 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-10">
            <div className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#8d7f72]">
              Tài khoản SRX
            </div>
            <h1 className="mt-4 text-[42px] font-semibold leading-tight tracking-[-0.04em] text-[#15110d]">
              Đăng nhập để quản lý đơn hàng và affiliate.
            </h1>
            <p className="mt-5 max-w-[480px] text-[16px] leading-8 text-[#665a4e]">
              Sau khi đăng nhập, người dùng có thể theo dõi đơn hàng, lưu địa chỉ, đăng ký affiliate và nhận hoa hồng từ các đơn mua qua link giới thiệu.
            </p>

            <div className="mt-8 space-y-3 text-[15px] text-[#665a4e]">
              <div>Đăng nhập bằng email và mật khẩu đã đăng ký.</div>
              <div>Session được lưu bằng cookie bảo mật trên website.</div>
              <div>Bạn có thể yêu cầu email đặt lại mật khẩu nếu không còn nhớ thông tin đăng nhập.</div>
            </div>
          </div>

          <div className="max-w-[520px]">
            <form onSubmit={onSubmit} className="rounded-[28px] border border-[#ece4da] bg-[#fcfaf8] p-6 md:p-8">
              <div className="text-[28px] font-semibold tracking-[-0.04em] text-[#15110d]">
                Đăng nhập
              </div>

              <div className="mt-6 space-y-5">
                <div>
                  <label className="mb-2 block text-[14px] font-medium text-[#3e342b]">Email</label>
                  <input
                    type="email"
                    {...register('email', { required: 'Vui lòng nhập email.' })}
                    className="w-full rounded-[18px] border border-[#ddd3c6] bg-white px-4 py-3.5 text-[15px] outline-none transition focus:border-[#15110d]"
                    placeholder="you@example.com"
                  />
                  {errors.email ? (
                    <div className="mt-2 text-[13px] text-red-600">{errors.email.message}</div>
                  ) : null}
                </div>

                <div>
                  <label className="mb-2 block text-[14px] font-medium text-[#3e342b]">Mật khẩu</label>
                  <input
                    type="password"
                    {...register('password', { required: 'Vui lòng nhập mật khẩu.' })}
                    className="w-full rounded-[18px] border border-[#ddd3c6] bg-white px-4 py-3.5 text-[15px] outline-none transition focus:border-[#15110d]"
                    placeholder="••••••••"
                  />
                  {errors.password ? (
                    <div className="mt-2 text-[13px] text-red-600">{errors.password.message}</div>
                  ) : null}

                  <div className="mt-3 text-right text-[14px]">
                    <Link href="/forgot-password" className="font-semibold text-[#15110d]">
                      Quên mật khẩu?
                    </Link>
                  </div>
                </div>
              </div>

              {submitError ? <div className="mt-4 text-[14px] text-red-600">{submitError}</div> : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-6 w-full rounded-full bg-[#15110d] px-6 py-4 text-[15px] font-semibold text-white transition hover:bg-[#2b2520] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>

              <div className="mt-5 text-[14px] text-[#665a4e]">
                Chưa có tài khoản?{' '}
                <Link href="/register" className="font-semibold text-[#15110d]">
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
