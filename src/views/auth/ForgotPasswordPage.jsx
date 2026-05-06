'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

async function parseJson(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

export default function ForgotPasswordPage() {
  const [submitState, setSubmitState] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      setIsSubmitting(true);
      setSubmitState({ type: '', text: '' });

      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await parseJson(response);

      if (!response.ok) {
        throw new Error(data.message ?? 'Không thể gửi email đặt lại mật khẩu.');
      }

      setSubmitState({
        type: 'success',
        text:
          data.message ??
          'Nếu email tồn tại trong hệ thống, SRX Việt Nam sẽ gửi link đặt lại mật khẩu về hộp thư của bạn.',
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
          <div className="border-b border-[#e9e3da] pb-8 lg:border-b-0 lg:pb-0 lg:pr-10">
            <div className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#8d7f72]">
              Hỗ trợ tài khoản
            </div>
            <h1 className="mt-4 text-[42px] font-semibold leading-tight tracking-[-0.04em] text-[#15110d]">
              Quên mật khẩu?
            </h1>
            <p className="mt-5 max-w-[480px] text-[16px] leading-8 text-[#665a4e]">
              Nhập email bạn đã đăng ký. Nếu tài khoản tồn tại, SRX Việt Nam sẽ gửi mail đặt lại mật khẩu tới email của bạn.
            </p>

            <div className="mt-8 space-y-3 text-[15px] text-[#665a4e]">
              <div>Link đặt lại mật khẩu chỉ dùng được một lần.</div>
              <div>Vui lòng kiểm tra cả hộp thư rác nếu chưa thấy email trong vài phút.</div>
              <div>Sau khi đặt lại mật khẩu, các phiên đăng nhập cũ sẽ tự động bị đăng xuất.</div>
            </div>
          </div>

          <div className="max-w-[520px]">
            <form onSubmit={onSubmit} className="rounded-[28px] border border-[#ece4da] bg-[#fcfaf8] p-6 md:p-8">
              <div className="text-[28px] font-semibold tracking-[-0.04em] text-[#15110d]">
                Gửi email đặt lại mật khẩu
              </div>

              <div className="mt-6">
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
                disabled={isSubmitting}
                className="mt-6 w-full rounded-full bg-[#15110d] px-6 py-4 text-[15px] font-semibold text-white transition hover:bg-[#2b2520] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Đang gửi email...' : 'Gửi link đặt lại mật khẩu'}
              </button>

              <div className="mt-5 text-[14px] text-[#665a4e]">
                Nhớ mật khẩu rồi?{' '}
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
