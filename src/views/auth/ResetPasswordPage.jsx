'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

async function parseJson(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [isCheckingToken, setIsCheckingToken] = useState(true);
  const [tokenError, setTokenError] = useState('');
  const [submitState, setSubmitState] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  const newPassword = watch('newPassword');

  useEffect(() => {
    let isCancelled = false;

    const validateToken = async () => {
      if (!token) {
        setTokenError('Link đặt lại mật khẩu không hợp lệ.');
        setIsCheckingToken(false);
        return;
      }

      try {
        setIsCheckingToken(true);
        setTokenError('');

        const response = await fetch(`/api/auth/reset-password?token=${encodeURIComponent(token)}`, {
          method: 'GET',
          cache: 'no-store',
        });
        const data = await parseJson(response);

        if (!response.ok) {
          throw new Error(data.message ?? 'Không thể kiểm tra link đặt lại mật khẩu.');
        }

        if (!isCancelled) {
          setTokenError('');
        }
      } catch (error) {
        if (!isCancelled) {
          setTokenError(error.message);
        }
      } finally {
        if (!isCancelled) {
          setIsCheckingToken(false);
        }
      }
    };

    validateToken();

    return () => {
      isCancelled = true;
    };
  }, [token]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      setIsSubmitting(true);
      setSubmitState({ type: '', text: '' });

      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          newPassword: values.newPassword,
        }),
      });
      const data = await parseJson(response);

      if (!response.ok) {
        throw new Error(data.message ?? 'Không thể đặt lại mật khẩu.');
      }

      setSubmitState({
        type: 'success',
        text: data.message ?? 'Mật khẩu đã được đặt lại thành công.',
      });
    } catch (error) {
      setSubmitState({
        type: 'error',
        text: error.message,
      });
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
              Bảo mật tài khoản
            </div>
            <h1 className="mt-4 text-[42px] font-semibold leading-tight tracking-[-0.04em] text-[#15110d]">
              Đặt lại mật khẩu
            </h1>
            <p className="mt-5 max-w-[480px] text-[16px] leading-8 text-[#665a4e]">
              Tạo mật khẩu mới cho tài khoản SRX Việt Nam của bạn. Sau khi hoàn tất, bạn có thể đăng nhập lại bằng mật khẩu mới ngay lập tức.
            </p>

            <div className="mt-8 space-y-3 text-[15px] text-[#665a4e]">
              <div>Mật khẩu mới cần có tối thiểu 8 ký tự.</div>
              <div>Link đặt lại mật khẩu chỉ dùng được một lần và sẽ hết hạn sau một khoảng thời gian ngắn.</div>
              <div>Nếu link không còn hiệu lực, bạn có thể yêu cầu gửi lại email mới.</div>
            </div>
          </div>

          <div className="max-w-[520px]">
            <form onSubmit={onSubmit} className="rounded-[28px] border border-[#ece4da] bg-[#fcfaf8] p-6 md:p-8">
              <div className="text-[28px] font-semibold tracking-[-0.04em] text-[#15110d]">
                Tạo mật khẩu mới
              </div>

              {isCheckingToken ? (
                <div className="mt-6 rounded-[18px] border border-[#e8dfd3] bg-white px-4 py-3 text-[14px] text-[#665a4e]">
                  Đang kiểm tra link đặt lại mật khẩu...
                </div>
              ) : tokenError ? (
                <div className="mt-6 rounded-[18px] border border-[#efd3d3] bg-[#fff1f1] px-4 py-3 text-[14px] text-[#ad4040]">
                  {tokenError}
                </div>
              ) : null}

              {!isCheckingToken && !tokenError ? (
                <>
                  <div className="mt-6 space-y-5">
                    <div>
                      <label className="mb-2 block text-[14px] font-medium text-[#3e342b]">
                        Mật khẩu mới
                      </label>
                      <input
                        type="password"
                        {...register('newPassword', {
                          required: 'Vui lòng nhập mật khẩu mới.',
                          minLength: { value: 8, message: 'Mật khẩu phải từ 8 ký tự.' },
                        })}
                        className="w-full rounded-[18px] border border-[#ddd3c6] bg-white px-4 py-3.5 text-[15px] outline-none transition focus:border-[#15110d]"
                        placeholder="••••••••"
                      />
                      {errors.newPassword ? (
                        <div className="mt-2 text-[13px] text-red-600">{errors.newPassword.message}</div>
                      ) : null}
                    </div>

                    <div>
                      <label className="mb-2 block text-[14px] font-medium text-[#3e342b]">
                        Xác nhận mật khẩu mới
                      </label>
                      <input
                        type="password"
                        {...register('confirmPassword', {
                          required: 'Vui lòng xác nhận mật khẩu mới.',
                          validate: (value) =>
                            value === newPassword || 'Mật khẩu xác nhận không khớp.',
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

                  {submitState.text ? (
                    <div
                      className={`mt-4 rounded-[18px] border px-4 py-3 text-[14px] ${
                        submitState.type === 'success'
                          ? 'border-[#d6e9da] bg-[#eef8f0] text-[#296d3b]'
                          : 'border-[#efd3d3] bg-[#fff1f1] text-[#ad4040]'
                      }`}
                    >
                      {submitState.text}
                    </div>
                  ) : null}

                  <button
                    type="submit"
                    disabled={isSubmitting || submitState.type === 'success'}
                    className="mt-6 w-full rounded-full bg-[#15110d] px-6 py-4 text-[15px] font-semibold text-white transition hover:bg-[#2b2520] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? 'Đang cập nhật mật khẩu...' : 'Đặt lại mật khẩu'}
                  </button>
                </>
              ) : null}

              <div className="mt-5 text-[14px] text-[#665a4e]">
                <Link href="/forgot-password" className="font-semibold text-[#15110d]">
                  Gửi lại link mới
                </Link>
                {' · '}
                <Link href="/account" className="font-semibold text-[#15110d]">
                  Quay lại đăng nhập
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
