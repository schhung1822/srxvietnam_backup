'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  ClipboardList,
  CreditCard,
  LoaderCircle,
  PackageSearch,
  Search,
  ShoppingBag,
  Truck,
  XCircle,
} from 'lucide-react';
import useBrowserSearchParams from '../../hooks/useBrowserSearchParams.js';

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
});

const orderDateFormatter = new Intl.DateTimeFormat('vi-VN', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

const orderStatusLabels = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  processing: 'Đang xử lý',
  shipping: 'Đang giao',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
  refunded: 'Hoàn tiền',
};

const paymentStatusLabels = {
  pending: 'Chờ thanh toán',
  paid: 'Đã thanh toán',
  failed: 'Thanh toán lỗi',
  refunded: 'Đã hoàn tiền',
  partially_refunded: 'Hoàn tiền một phần',
};

const paymentMethodLabels = {
  cod: 'Thanh toán khi nhận hàng',
  bank_transfer: 'Chuyển khoản / QR code',
  card: 'Thẻ ngân hàng',
  e_wallet: 'Ví điện tử',
};

const orderSteps = [
  { id: 'pending', label: 'Chờ xác nhận', icon: ClipboardList },
  { id: 'confirmed', label: 'Đã xác nhận', icon: BadgeCheck },
  { id: 'processing', label: 'Đang xử lý', icon: PackageSearch },
  { id: 'shipping', label: 'Đang giao', icon: Truck },
  { id: 'completed', label: 'Hoàn thành', icon: ShoppingBag },
];

const closedStatuses = ['cancelled', 'refunded'];

async function parseJson(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

function formatOrderDate(value) {
  if (!value) {
    return 'Chưa cập nhật';
  }

  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? 'Chưa cập nhật' : orderDateFormatter.format(parsedDate);
}

function formatValue(value) {
  return String(value ?? '').trim() || 'Chưa cập nhật';
}

function formatShippingAddress(address) {
  if (!address) {
    return '';
  }

  return [address.addressLine, address.ward, address.district, address.province]
    .map((part) => String(part ?? '').trim())
    .filter(Boolean)
    .join(', ');
}

function getOrderStatusClass(status) {
  switch (status) {
    case 'completed':
      return 'border-[#cfe9d9] bg-[#eef8f2] text-[#1f7a44]';
    case 'shipping':
    case 'processing':
    case 'confirmed':
      return 'border-[#c7cfff] bg-[#eef1ff] text-[#2540dd]';
    case 'cancelled':
    case 'refunded':
      return 'border-[#f0d3d3] bg-[#fff0f0] text-[#b14040]';
    default:
      return 'border-[#e5e5e5] bg-[#f3f3f3] text-[#555]';
  }
}

function InfoCard({ title, children }) {
  return (
    <div className="rounded-[14px] border border-[#e5e5e5] bg-white p-5 sm:p-6">
      <h2 className="text-[16px] font-semibold tracking-[-0.02em] text-[#050505] sm:text-[17px]">{title}</h2>
      <dl className="mt-4 divide-y divide-[#f0f0f0]">{children}</dl>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
      <dt className="shrink-0 text-[13px] text-[#777] sm:text-[13.5px]">{label}</dt>
      <dd className="min-w-0 break-words text-[14px] font-semibold leading-6 text-[#15110d] sm:text-right">{value}</dd>
    </div>
  );
}

function OrderStepper({ status }) {
  const currentIndex = Math.max(
    orderSteps.findIndex((step) => step.id === status),
    0,
  );

  return (
    <div className="flex items-start">
      {orderSteps.map((step, index) => {
        const StepIcon = step.icon;
        const isDone = index <= currentIndex;

        return (
          <div key={step.id} className="flex flex-1 flex-col items-center text-center">
            <div className="flex w-full items-center">
              <div
                className={`h-[2px] flex-1 ${
                  index === 0 ? 'bg-transparent' : index <= currentIndex ? 'bg-[#2540dd]' : 'bg-[#e5e5e5]'
                }`}
              />
              <div
                className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border transition sm:h-11 sm:w-11 ${
                  isDone
                    ? 'border-[#2540dd] bg-[#2540dd] text-white'
                    : 'border-[#e5e5e5] bg-white text-[#c4c4c4]'
                }`}
              >
                <StepIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div
                className={`h-[2px] flex-1 ${
                  index === orderSteps.length - 1
                    ? 'bg-transparent'
                    : index < currentIndex
                      ? 'bg-[#2540dd]'
                      : 'bg-[#e5e5e5]'
                }`}
              />
            </div>
            <div
              className={`mt-2 px-1 text-[10.5px] font-semibold leading-4 sm:text-[12.5px] ${
                isDone ? 'text-[#050505]' : 'text-[#9a9a9a]'
              }`}
            >
              {step.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function OrderItemRow({ item }) {
  return (
    <div className="flex items-center gap-3.5 rounded-[12px] border border-[#ededed] bg-[#fafafa] px-3.5 py-3">
      <div className="h-16 w-14 flex-shrink-0 overflow-hidden rounded-[8px] border border-[#ececec] bg-white">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.productName} loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[#c4c4c4]">
            <ShoppingBag className="h-5 w-5" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        {item.productSlug ? (
          <Link
            href={`/products/${item.productSlug}`}
            className="line-clamp-2 text-[14px] font-semibold leading-5 text-[#15110d] transition hover:text-[#2540dd] sm:text-[15px]"
          >
            {item.productName}
          </Link>
        ) : (
          <div className="line-clamp-2 text-[14px] font-semibold leading-5 text-[#15110d] sm:text-[15px]">
            {item.productName}
          </div>
        )}
        {item.variantName ? <div className="mt-1 text-[13px] text-[#777]">{item.variantName}</div> : null}
        <div className="mt-1 text-[12.5px] text-[#8a8a8a]">
          {item.isGift ? 'Quà tặng kèm' : `Đơn giá ${currencyFormatter.format(item.unitPrice)}`}
        </div>
      </div>

      <div className="flex-shrink-0 text-right">
        <div className="text-[13px] text-[#777]">x{item.quantity}</div>
        <div className="font-['Inter',_sans-serif] mt-1.5 text-[14px] font-semibold text-[#15110d] sm:text-[15px]">
          {currencyFormatter.format(item.lineTotal)}
        </div>
      </div>
    </div>
  );
}

export default function CheckOrderPage() {
  const router = useRouter();
  const searchParams = useBrowserSearchParams();
  const queryCode = (searchParams.get('ordercode') ?? '').trim();

  const [codeInput, setCodeInput] = useState('');
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const loadOrder = useCallback(async (orderCode, options = {}) => {
    const { shouldCancel } = options;

    try {
      setIsLoading(true);
      setError('');
      setHasSearched(true);

      const response = await fetch(`/api/orders/lookup?ordercode=${encodeURIComponent(orderCode)}`, {
        method: 'GET',
        cache: 'no-store',
      });
      const data = await parseJson(response);

      if (shouldCancel?.()) {
        return;
      }

      if (!response.ok) {
        throw new Error(data.message ?? 'Không thể tra cứu đơn hàng.');
      }

      setOrder(data.order ?? null);
    } catch (lookupError) {
      if (shouldCancel?.()) {
        return;
      }

      setOrder(null);
      setError(lookupError.message);
    } finally {
      if (!shouldCancel?.()) {
        setIsLoading(false);
      }
    }
  }, []);

  // Mã đơn trên URL cho phép mở thẳng /check-order?ordercode=... mà không cần thao tác.
  useEffect(() => {
    setCodeInput(queryCode);

    if (!queryCode) {
      setOrder(null);
      setError('');
      setHasSearched(false);
      return undefined;
    }

    let isCancelled = false;
    void loadOrder(queryCode, { shouldCancel: () => isCancelled });

    return () => {
      isCancelled = true;
    };
  }, [loadOrder, queryCode]);

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextCode = codeInput.trim().toUpperCase();

    if (!nextCode) {
      setOrder(null);
      setHasSearched(true);
      setError('Vui lòng nhập mã đơn hàng.');
      return;
    }

    if (nextCode === queryCode.toUpperCase()) {
      // URL không đổi nên effect không chạy lại, tra cứu lại trực tiếp.
      void loadOrder(nextCode);
      return;
    }

    router.replace(`/check-order?ordercode=${encodeURIComponent(nextCode)}`, { scroll: false });
  };

  const isClosedOrder = order ? closedStatuses.includes(order.orderStatus) : false;
  const shouldShowPaymentLink =
    order?.paymentMethod === 'bank_transfer' && ['pending', 'failed'].includes(order?.paymentStatus);

  return (
    <section className="bg-white pb-16 pt-6 md:pb-20 md:pt-10">
      <div className="mx-auto max-w-[1100px] px-3 sm:px-6">
        <div className="rounded-[14px] border border-[#e5e5e5] bg-[#eef1ff] px-5 py-7 sm:px-8 sm:py-9">
          <div className="inline-flex rounded-full bg-white px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#2540dd]">
            Tra cứu đơn hàng
          </div>
          <h1 className="mt-4 text-[26px] font-semibold leading-tight tracking-[-0.03em] text-[#050505] sm:text-[32px]">
            Kiểm tra đơn hàng
          </h1>
          <p className="mt-2.5 max-w-[620px] text-[14px] leading-7 text-[#555] sm:text-[15px]">
            Nhập mã đơn hàng nhận được sau khi đặt hàng để xem trạng thái và chi tiết đơn. Bạn không cần đăng nhập.
          </p>

          <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-2.5 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9a9a9a]" />
              <input
                type="text"
                value={codeInput}
                onChange={(event) => setCodeInput(event.target.value)}
                placeholder="Ví dụ: SRX1234567890ABCD"
                aria-label="Mã đơn hàng"
                autoComplete="off"
                className="min-h-[52px] w-full rounded-full border border-[#d8d8d8] bg-white pl-11 pr-5 text-[14px] font-semibold uppercase text-[#15110d] outline-none transition placeholder:font-normal placeholder:normal-case placeholder:text-[#9a9a9a] focus:border-[#2540dd]"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-black px-8 text-[13px] font-bold uppercase text-white transition hover:bg-[#222] disabled:cursor-not-allowed disabled:opacity-60 sm:text-[14px]"
            >
              {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
              Tra cứu
            </button>
          </form>
        </div>

        {isLoading ? (
          <div className="mt-4 flex min-h-[220px] items-center justify-center gap-3 rounded-[14px] border border-[#e5e5e5] bg-white text-[14px] text-[#666]">
            <LoaderCircle className="h-5 w-5 animate-spin text-[#2540dd]" />
            Đang tra cứu đơn hàng...
          </div>
        ) : error ? (
          <div className="mt-4 rounded-[14px] border border-[#f0d3d3] bg-[#fff5f5] px-5 py-10 text-center sm:px-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#b14040]">
              <XCircle className="h-7 w-7" />
            </div>
            <h2 className="mt-4 text-[19px] font-semibold tracking-[-0.02em] text-[#050505] sm:text-[22px]">
              Không tra cứu được đơn hàng
            </h2>
            <p className="mx-auto mt-2 max-w-[460px] text-[14px] leading-7 text-[#7c5a5a]">{error}</p>
            <p className="mx-auto mt-1 max-w-[460px] text-[13px] leading-6 text-[#a08585]">
              Mã đơn hàng nằm trong thư xác nhận hoặc màn hình đặt hàng thành công, bắt đầu bằng SRX.
            </p>
          </div>
        ) : order ? (
          <>
            <div className="mt-4 rounded-[14px] border border-[#e5e5e5] bg-white p-5 sm:p-6">
              <div className="flex flex-col gap-4 border-b border-[#f0f0f0] pb-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8a8a8a]">
                    Mã đơn hàng
                  </div>
                  <div className="mt-1.5 break-all text-[22px] font-bold tracking-[-0.02em] text-[#050505] sm:text-[26px]">
                    #{order.orderNumber}
                  </div>
                  <div className="mt-1.5 text-[13.5px] text-[#777]">Đặt ngày {formatOrderDate(order.placedAt)}</div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex rounded-full border px-3 py-1.5 text-[13px] font-medium ${getOrderStatusClass(
                      order.orderStatus,
                    )}`}
                  >
                    {orderStatusLabels[order.orderStatus] ?? order.orderStatus}
                  </span>
                  <span className="inline-flex rounded-full border border-[#e5e5e5] bg-[#f3f3f3] px-3 py-1.5 text-[13px] font-medium text-[#555]">
                    {paymentStatusLabels[order.paymentStatus] ?? order.paymentStatus}
                  </span>
                  <span className="font-['Inter',_sans-serif] text-[19px] font-bold text-[#2540dd]">
                    {currencyFormatter.format(order.grandTotal)}
                  </span>
                </div>
              </div>

              <div className="pt-6">
                {isClosedOrder ? (
                  <div className="flex items-start gap-3 rounded-[12px] border border-[#f0d3d3] bg-[#fff5f5] px-4 py-3.5">
                    <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#b14040]" />
                    <div className="text-[14px] leading-6 text-[#8c4b4b]">
                      Đơn hàng đã {orderStatusLabels[order.orderStatus]?.toLowerCase() ?? order.orderStatus}
                      {order.cancelledAt ? ` vào ${formatOrderDate(order.cancelledAt)}` : ''}. Liên hệ SRX nếu bạn cần
                      hỗ trợ thêm.
                    </div>
                  </div>
                ) : (
                  <OrderStepper status={order.orderStatus} />
                )}
              </div>

              {shouldShowPaymentLink ? (
                <Link
                  href={`/checkout/payment/${encodeURIComponent(order.orderNumber)}`}
                  className="mt-6 inline-flex min-h-[50px] w-full items-center justify-center gap-2 rounded-full bg-[#2540dd] px-7 text-[13px] font-bold uppercase text-white transition hover:bg-[#1f34ba] sm:w-auto sm:text-[14px]"
                >
                  <CreditCard className="h-4 w-4" />
                  Thanh toán đơn hàng
                </Link>
              ) : null}
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <InfoCard title="Thông tin đơn hàng">
                <InfoRow label="Ngày đặt" value={formatOrderDate(order.placedAt)} />
                <InfoRow
                  label="Trạng thái đơn"
                  value={orderStatusLabels[order.orderStatus] ?? order.orderStatus}
                />
                <InfoRow
                  label="Trạng thái thanh toán"
                  value={paymentStatusLabels[order.paymentStatus] ?? order.paymentStatus}
                />
                <InfoRow
                  label="Phương thức thanh toán"
                  value={paymentMethodLabels[order.paymentMethod] ?? order.paymentMethod}
                />
                {order.paidAt ? <InfoRow label="Thanh toán lúc" value={formatOrderDate(order.paidAt)} /> : null}
                {order.completedAt ? (
                  <InfoRow label="Hoàn thành lúc" value={formatOrderDate(order.completedAt)} />
                ) : null}
              </InfoCard>

              <InfoCard title="Thông tin nhận hàng">
                <InfoRow
                  label="Tên khách hàng"
                  value={formatValue(order.shippingAddress?.recipientName || order.customer?.name)}
                />
                <InfoRow
                  label="Số điện thoại"
                  value={formatValue(order.shippingAddress?.recipientPhone || order.customer?.phone)}
                />
                {order.customer?.email ? <InfoRow label="Email" value={order.customer.email} /> : null}
                <InfoRow
                  label="Địa chỉ giao hàng"
                  value={formatValue(formatShippingAddress(order.shippingAddress))}
                />
                <InfoRow
                  label="Phí vận chuyển"
                  value={order.shippingTotal > 0 ? currencyFormatter.format(order.shippingTotal) : 'Miễn phí'}
                />
              </InfoCard>
            </div>

            <div className="mt-4 rounded-[14px] border border-[#e5e5e5] bg-white p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-[16px] font-semibold tracking-[-0.02em] text-[#050505] sm:text-[17px]">
                  Sản phẩm trong đơn
                </h2>
                <span className="text-[13px] text-[#777]">{order.totalQuantity} sản phẩm</span>
              </div>

              <div className="mt-4 grid gap-2.5">
                {order.items.length ? (
                  order.items.map((item, index) => <OrderItemRow key={`${item.productName}-${index}`} item={item} />)
                ) : (
                  <div className="rounded-[12px] border border-dashed border-[#d8d8d8] px-4 py-6 text-center text-[14px] text-[#777]">
                    Đơn hàng chưa có dòng sản phẩm chi tiết.
                  </div>
                )}
              </div>

              <div className="mt-5 space-y-3 border-t border-[#e5e5e5] pt-4 text-[14px] text-[#666] sm:text-[15px]">
                <div className="flex items-center justify-between">
                  <span>Tạm tính</span>
                  <span className="font-['Inter',_sans-serif] font-medium text-[#15110d]">
                    {currencyFormatter.format(order.subtotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Giảm giá</span>
                  <span className="font-['Inter',_sans-serif] font-medium text-[#15110d]">
                    -{currencyFormatter.format(order.discountTotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Phí vận chuyển</span>
                  <span className="font-medium text-[#15110d]">
                    {order.shippingTotal > 0 ? currencyFormatter.format(order.shippingTotal) : 'Miễn phí'}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-[#e5e5e5] pt-4 text-[16px] font-bold text-[#15110d]">
                  <span>Tổng cộng</span>
                  <span className="font-['Inter',_sans-serif] text-[18px] text-[#2540dd]">
                    {currencyFormatter.format(order.grandTotal)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
              <Link
                href="/account?view=orders"
                className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-full border border-[#d8d8d8] bg-white px-7 text-[13px] font-bold uppercase text-[#050505] transition hover:border-[#2540dd] hover:text-[#2540dd] sm:text-[14px]"
              >
                Đơn hàng của tôi
              </Link>
              <Link
                href="/products"
                className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-full bg-black px-7 text-[13px] font-bold uppercase text-white transition hover:bg-[#222] sm:text-[14px]"
              >
                Tiếp tục mua sắm
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </>
        ) : hasSearched ? null : (
          <div className="mt-4 rounded-[14px] border border-[#e5e5e5] bg-white px-5 py-12 text-center sm:px-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#eef1ff] text-[#2540dd]">
              <PackageSearch className="h-7 w-7" />
            </div>
            <h2 className="mt-4 text-[19px] font-semibold tracking-[-0.02em] text-[#050505] sm:text-[22px]">
              Nhập mã đơn để xem chi tiết
            </h2>
            <p className="mx-auto mt-2 max-w-[520px] text-[14px] leading-7 text-[#666]">
              Mã đơn hàng bắt đầu bằng SRX, có trong thư xác nhận đơn hoặc màn hình đặt hàng thành công. Bạn cũng có thể
              mở nhanh bằng đường dẫn dạng /check-order?ordercode=SRX...
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
