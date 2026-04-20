'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
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
    <section className="bg-white py-12 md:py-20">
      <div className="mx-auto max-w-[1180px] px-4 md:px-6">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="border-b border-[#e9e3da] pb-8 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-10">
            <div className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#8d7f72]">
              Tạo tài khoản
            </div>
            <h1 className="mt-4 text-[42px] font-semibold leading-tight tracking-[-0.04em] text-[#15110d]">
              Đăng ký tài khoản để mua hàng và tham gia affiliate.
            </h1>
            <p className="mt-5 max-w-[480px] text-[16px] leading-8 text-[#665a4e]">
              Form đăng ký này ghi trực tiếp xuống bảng `users`, sau đó tạo session trong `user_sessions` để người dùng đăng nhập ngay sau khi tạo tài khoản.
            </p>

            <div className="mt-8 space-y-3 text-[15px] text-[#665a4e]">
              <div>Mật khẩu được hash bằng PBKDF2 trước khi lưu vào MySQL.</div>
              <div>Email và số điện thoại được kiểm tra trùng trước khi tạo tài khoản.</div>
              <div>Có thể nối thêm xác thực email sau khi chốt luồng hiện tại.</div>
            </div>
          </div>

          <div className="max-w-[560px]">
            <form onSubmit={onSubmit} className="rounded-[28px] border border-[#ece4da] bg-[#fcfaf8] p-6 md:p-8">
              <div className="text-[28px] font-semibold tracking-[-0.04em] text-[#15110d]">
                Đăng ký
              </div>

              <div className="mt-6 space-y-5">
                <div>
                  <label className="mb-2 block text-[14px] font-medium text-[#3e342b]">Họ và tên</label>
                  <input
                    type="text"
                    {...register('fullName', {
                      required: 'Vui lòng nhập họ tên.',
                      minLength: { value: 2, message: 'Họ tên quá ngắn.' },
                    })}
                    className="w-full rounded-[18px] border border-[#ddd3c6] bg-white px-4 py-3.5 text-[15px] outline-none transition focus:border-[#15110d]"
                    placeholder="Nguyễn Văn A"
                  />
                  {errors.fullName ? (
                    <div className="mt-2 text-[13px] text-red-600">{errors.fullName.message}</div>
                  ) : null}
                </div>

                <div className="grid gap-5 md:grid-cols-2">
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
                    <label className="mb-2 block text-[14px] font-medium text-[#3e342b]">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      {...register('phone')}
                      className="w-full rounded-[18px] border border-[#ddd3c6] bg-white px-4 py-3.5 text-[15px] outline-none transition focus:border-[#15110d]"
                      placeholder="0903 010 692"
                    />
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-[14px] font-medium text-[#3e342b]">Mật khẩu</label>
                    <input
                      type="password"
                      {...register('password', {
                        required: 'Vui lòng nhập mật khẩu.',
                        minLength: { value: 8, message: 'Mật khẩu phải từ 8 ký tự.' },
                      })}
                      className="w-full rounded-[18px] border border-[#ddd3c6] bg-white px-4 py-3.5 text-[15px] outline-none transition focus:border-[#15110d]"
                      placeholder="••••••••"
                    />
                    {errors.password ? (
                      <div className="mt-2 text-[13px] text-red-600">{errors.password.message}</div>
                    ) : null}
                  </div>

                  <div>
                    <label className="mb-2 block text-[14px] font-medium text-[#3e342b]">
                      Xác nhận mật khẩu
                    </label>
                    <input
                      type="password"
                      {...register('confirmPassword', {
                        required: 'Vui lòng xác nhận mật khẩu.',
                        validate: (value) => value === password || 'Mật khẩu xác nhận không khớp.',
                      })}
                      className="w-full rounded-[18px] border border-[#ddd3c6] bg-white px-4 py-3.5 text-[15px] outline-none transition focus:border-[#15110d]"
                      placeholder="••••••••"
                    />
                    {errors.confirmPassword ? (
                      <div className="mt-2 text-[13px] text-red-600">
                        {errors.confirmPassword.message}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              {submitError ? <div className="mt-4 text-[14px] text-red-600">{submitError}</div> : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-6 w-full rounded-full bg-[#15110d] px-6 py-4 text-[15px] font-semibold text-white transition hover:bg-[#2b2520] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
              </button>

              <div className="mt-5 text-[14px] text-[#665a4e]">
                Đã có tài khoản?{' '}
                <Link href="/login" className="font-semibold text-[#15110d]">
                  Đăng nhập
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
