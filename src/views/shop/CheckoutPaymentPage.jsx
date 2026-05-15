'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Clock3,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import SepayPaymentPanel from '../../components/shop/SepayPaymentPanel.jsx';

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
});

const paymentStatusMeta = {
  pending: {
    label: 'Chờ thanh toán',
    tone: 'border-[#edd2a3] bg-[#fff6e5] text-[#9a6b19]',
  },
  paid: {
    label: 'Đã thanh toán',
    tone: 'border-[#cfe7d4] bg-[#f2fff5] text-[#256944]',
  },
  failed: {
    label: 'Thanh toán thất bại',
    tone: 'border-[#efc4c4] bg-[#fff4f4] text-[#a33a3a]',
  },
  refunded: {
    label: 'Đã hoàn tiền',
    tone: 'border-[#d8d9eb] bg-[#f7f8ff] text-[#52577d]',
  },
  partially_refunded: {
    label: 'Hoàn tiền một phần',
    tone: 'border-[#d8d9eb] bg-[#f7f8ff] text-[#52577d]',
  },
};

async function parseJson(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

async function fetchPaymentOrder(orderNumber) {
  const response = await fetch(`/api/checkout/payment/${encodeURIComponent(orderNumber)}`, {
    method: 'GET',
    cache: 'no-store',
  });
  const data = await parseJson(response);

  if (!response.ok) {
    throw new Error(data.message ?? 'Không thể tải trạng thái thanh toán.');
  }

  return data;
}

function formatDateTime(value) {
  if (!value) {
    return 'Chưa cập nhật';
  }

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function WaitingDots() {
  return (
    <span className="payment-waiting-dots" aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  );
}

function SummaryCard({ label, value, hint }) {
  return (
    <div className="rounded-[24px] border border-[#eadfce] bg-[linear-gradient(180deg,#fffdfa_0%,#fff8f1_100%)] p-5 shadow-[0_18px_50px_rgba(70,52,34,0.05)]">
      <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#9a826b]">{label}</div>
      <div className="mt-3 text-[22px] font-semibold tracking-[-0.03em] text-[#15110d]">{value}</div>
      {hint ? <div className="mt-2 text-[13px] leading-6 text-[#786757]">{hint}</div> : null}
    </div>
  );
}

function WaitingStatusCard() {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-[#efd9b6] bg-[linear-gradient(135deg,#fff9ef_0%,#fff2df_100%)] p-5 shadow-[0_24px_60px_rgba(121,88,28,0.08)]">
      <div className="pointer-events-none absolute inset-y-0 right-0 w-40 bg-[radial-gradient(circle_at_right,rgba(255,255,255,0.85),transparent_70%)]" />

      <div className="relative flex items-start gap-4">
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-[20px] bg-[#15110d] text-white shadow-[0_18px_30px_rgba(21,17,13,0.18)]">
          <Clock3 className="h-6 w-6" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <div className="text-[15px] sm:text-[18px] font-semibold text-[#15110d]">Hệ thống đang chờ SePay xác nhận</div>
            <WaitingDots />
          </div>
          <p className='text-[14px] sm:text-[16px]'>
            Vui lòng quét QR để thanh toán chính xác số tiền và nội dung giao dịch
          </p>
        </div>
      </div>
    </div>
  );
}

function LoadingState({ orderNumber }) {
  return (
    <section className="bg-[linear-gradient(180deg,#fcfaf8_0%,#f8f2ea_100%)] py-12 md:py-20">
      <div className="mx-auto max-w-[1080px] px-4 md:px-6">
        <div className="relative overflow-hidden rounded-[38px] border border-[#eadfce] bg-[radial-gradient(circle_at_top,rgba(255,244,225,0.95),rgba(255,255,255,0.98)_55%,#fffaf4_100%)] px-6 py-16 text-center shadow-[0_28px_80px_rgba(70,52,34,0.08)] md:px-10">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,rgba(237,202,161,0.35),transparent_72%)]" />

          <div className="relative mx-auto max-w-[560px]">
            <div className="relative mx-auto flex h-28 w-28 items-center justify-center">
              <div className="payment-orbit absolute inset-0 rounded-full border border-[#e7cfad]" />
              <div className="absolute inset-[12px] rounded-full border border-[#f0dcc0] opacity-80" />
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#15110d] text-white shadow-[0_18px_38px_rgba(21,17,13,0.18)]">
                <LoaderCircle className="h-7 w-7 animate-spin" />
              </div>
            </div>

            <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-[#eadcc9] bg-white/80 px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.22em] text-[#8f735b] backdrop-blur">
              <Sparkles className="h-4 w-4" />
              Đang chuẩn bị trang thanh toán
            </div>

            <h1 className="mt-6 text-[34px] font-semibold tracking-[-0.05em] text-[#15110d] md:text-[42px]">
              Đang tải thông tin chờ thanh toán
            </h1>
            <p className="mt-4 text-[16px] leading-8 text-[#6c5f54]">
              Hệ thống đang lấy QR và kiểm tra trạng thái giao dịch cho đơn <span className="font-semibold text-[#15110d]">#{orderNumber}</span>.
            </p>

            <div className="mt-8 flex justify-center">
              <WaitingDots />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function CheckoutPaymentPage({ orderNumber }) {
  const [order, setOrder] = useState(null);
  const [payment, setPayment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  const paymentStatus = order?.paymentStatus ?? '';

  useEffect(() => {
    let isCancelled = false;

    const loadOrder = async () => {
      try {
        setIsLoading(true);
        setError('');

        const data = await fetchPaymentOrder(orderNumber);

        if (!isCancelled) {
          setOrder(data.order ?? null);
          setPayment(data.payment ?? null);
        }
      } catch (loadError) {
        if (!isCancelled) {
          setError(loadError.message);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadOrder();

    return () => {
      isCancelled = true;
    };
  }, [orderNumber]);

  useEffect(() => {
    if (paymentStatus !== 'pending') {
      return undefined;
    }

    let isCancelled = false;
    const intervalId = window.setInterval(async () => {
      try {
        const data = await fetchPaymentOrder(orderNumber);

        if (!isCancelled) {
          setOrder(data.order ?? null);
          setPayment(data.payment ?? null);
          setError('');
        }
      } catch (refreshError) {
        if (!isCancelled) {
          setError(refreshError.message);
        }
      }
    }, 5000);

    return () => {
      isCancelled = true;
      window.clearInterval(intervalId);
    };
  }, [paymentStatus, orderNumber]);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      setError('');

      const data = await fetchPaymentOrder(orderNumber);
      setOrder(data.order ?? null);
      setPayment(data.payment ?? null);
    } catch (refreshError) {
      setError(refreshError.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return <LoadingState orderNumber={orderNumber} />;
  }

  if (!order || !payment) {
    return (
      <section className="bg-[linear-gradient(180deg,#fcfaf8_0%,#f8f2ea_100%)] py-12 md:py-20">
        <div className="mx-auto max-w-[960px] px-4 md:px-6">
          <div className="rounded-[36px] border border-[#efc4c4] bg-white px-6 py-14 text-center shadow-[0_24px_70px_rgba(70,52,34,0.06)] md:px-10">
            <h1 className="text-[32px] font-semibold tracking-[-0.04em] text-[#15110d]">
              Không tìm thấy đơn cần thanh toán
            </h1>
            <p className="mt-4 text-[15px] leading-7 text-[#665a4e]">
              {error || 'Mã đơn không hợp lệ hoặc không còn sẵn sàng để thanh toán qua SePay.'}
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleRefresh}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#15110d] px-6 py-3.5 text-[15px] font-semibold text-white transition hover:bg-[#2b2520]"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Tải lại
              </button>
              <Link
                href="/checkout"
                className="inline-flex items-center justify-center rounded-full border border-[#15110d] px-6 py-3.5 text-[15px] font-semibold text-[#15110d] transition hover:bg-[#15110d] hover:text-white"
              >
                Quay lại checkout
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const currentPaymentStatus = paymentStatusMeta[paymentStatus] ?? paymentStatusMeta.pending;
  const isPaid = paymentStatus === 'paid';

  return (
    <section className="bg-[#f9f9f9] py-12 md:py-20">
      <div className="mx-auto max-w-[1440px] px-4 md:px-6">
        <div className="grid items-start gap-8 lg:grid-cols-[0.98fr_1.02fr]">
          <div className="order-2 relative overflow-hidden rounded-[36px] border border-[#eadfce] bg-white p-4 sm:p-7 shadow-[0_30px_80px_rgba(70,52,34,0.07)] md:p-9 lg:order-1">
            <div className="relative mt-6  flex-wrap items-center gap-3 hidden sm:flex">
              <div className="inline-flex rounded-full border border-[#e5d7c6] bg-[#fcfaf8] px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.2em] text-[#8f735b]">
                Thanh toán SePay
              </div>
              <span
                className={`inline-flex rounded-full border px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.18em] ${currentPaymentStatus.tone}`}
              >
                {currentPaymentStatus.label}
              </span>
            </div>

            <h1 className="relative mt-5 text-[24px] sm:text-[34px] font-semibold leading-tight tracking-[-0.05em] text-[#15110d] md:text-[42px]">
              {isPaid ? `Đơn #${order.orderNumber} đã thanh toán thành công` : `Đơn #${order.orderNumber} đang chờ thanh toán`}
            </h1>

            <p className="relative mt-4 max-w-[620px] text-[16px] leading-8 text-[#665a4e]">
              {isPaid
                ? 'Hệ thống đã ghi nhận giao dịch từ SePay. Đơn hàng của bạn sẽ được chuyển sang bước xử lý tiếp theo.'
                : ''}
            </p>

            {!isPaid ? <div className="relative mt-8"><WaitingStatusCard /></div> : null}

            <div className="relative mt-8 grid gap-4 md:grid-cols-2">
              <SummaryCard
                label="Tổng thanh toán"
                value={currencyFormatter.format(order.grandTotal)}
                className="hidden sm:block"
              />
              <SummaryCard
                label={isPaid ? 'Đã ghi nhận lúc' : 'Tạo đơn lúc'}
                value={formatDateTime(isPaid ? order.paidAt : order.placedAt)}
              />
            </div>

            <div className="relative mt-6 rounded-[26px] border border-[#eadfce] bg-[linear-gradient(180deg,#fffdfa_0%,#fff8f1_100%)] p-5 shadow-[0_18px_40px_rgba(70,52,34,0.05)]">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-1 h-5 w-5 flex-shrink-0 text-[#15110d]" />
                <div className="text-[14px] leading-7 text-[#665a4e]">
                  {isPaid
                    ? `Thời điểm ghi nhận thanh toán: ${formatDateTime(order.paidAt)}.`
                    : 'Nếu bạn đã chuyển khoản nhưng trạng thái chưa đổi ngay, hãy chờ vài giây hoặc bấm kiểm tra lại. Hệ thống có thể đến chậm hơn giao dịch thực tế một chút.'}
                </div>
              </div>
            </div>

            {error ? (
              <div className="relative mt-6 rounded-[20px] border border-[#efc4c4] bg-[#fff4f4] px-4 py-3 text-[14px] text-[#a33a3a]">
                {error}
              </div>
            ) : null}

            <div className="relative mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#15110d] px-6 py-3.5 text-[15px] font-semibold text-white transition hover:bg-[#2b2520] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isRefreshing ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                Kiểm tra trạng thái
              </button>
              <Link
                href="/products"
                className="inline-flex items-center justify-center rounded-full border border-[#15110d] px-6 py-3.5 text-[15px] font-semibold text-[#15110d] transition hover:bg-[#15110d] hover:text-white"
              >
                Tiếp tục mua sắm
              </Link>
            </div>
          </div>

          <div className="order-1 space-y-6 lg:order-2">
            <SepayPaymentPanel payment={payment} paymentStatus={paymentStatus} />
          </div>
        </div>
      </div>
    </section>
  );
}
