'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  LoaderCircle,
  MapPin,
  QrCode,
  ShieldCheck,
  ShoppingBag,
  TicketPercent,
  Truck,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { getCheckoutTotals, getSepayPaymentDetails, paymentMethodOptions } from '../../lib/commerce/checkout';

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
});

const paymentMethodIcons = {
  cod: Truck,
  bank_transfer: QrCode,
};

const defaultCheckoutValues = {
  fullName: '',
  phone: '',
  email: '',
  province: '',
  ward: '',
  addressLine: '',
};

async function parseJson(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

function formatSavedAddress(address) {
  return [address.addressLine, address.ward, address.province].filter(Boolean).join(', ');
}

function formatCheckoutContact(contact) {
  return [contact.addressLine, contact.ward, contact.province].filter(Boolean).join(', ');
}

function AddressOption({ address, isSelected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(address.id)}
      className={`rounded-[24px] border p-5 text-left transition ${
        isSelected
          ? 'border-[#15110d] bg-[#15110d] text-white shadow-[0_20px_48px_rgba(21,17,13,0.12)]'
          : 'border-[#ece4da] bg-white text-[#15110d] hover:border-[#cabcae]'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[16px] font-semibold">{address.label || address.recipientName}</div>
          <div className={`mt-1 text-[14px] ${isSelected ? 'text-white/78' : 'text-[#665a4e]'}`}>
            {address.recipientName} • {address.recipientPhone}
          </div>
        </div>

        {address.isDefault ? (
          <span
            className={`inline-flex rounded-full border px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.16em] ${
              isSelected
                ? 'border-white/16 bg-white/10 text-white'
                : 'border-[#e8dfd3] bg-[#fcfaf8] text-[#8d7f72]'
            }`}
          >
            Mặc định
          </span>
        ) : null}
      </div>

      <div className={`mt-4 text-[14px] leading-6 ${isSelected ? 'text-white/82' : 'text-[#665a4e]'}`}>
        {formatSavedAddress(address)}
      </div>
    </button>
  );
}

function PaymentMethodOption({ method, isSelected, onSelect }) {
  const Icon = paymentMethodIcons[method.id] ?? CreditCard;

  return (
    <button
      type="button"
      onClick={() => onSelect(method.id)}
      className={`flex w-full items-start gap-4 rounded-[24px] border p-5 text-left transition ${
        isSelected
          ? 'border-[#15110d] bg-[#15110d] text-white shadow-[0_20px_48px_rgba(21,17,13,0.12)]'
          : 'border-[#ece4da] bg-white text-[#15110d] hover:border-[#cabcae]'
      }`}
    >
      <div
        className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${
          isSelected ? 'bg-white/12 text-white' : 'bg-[#fcfaf8] text-[#15110d]'
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>

      <div className="min-w-0">
        <div className="text-[16px] font-semibold">{method.label}</div>
        <div className={`mt-2 text-[14px] leading-6 ${isSelected ? 'text-white/78' : 'text-[#665a4e]'}`}>
          {method.description}
        </div>
      </div>
    </button>
  );
}

function SepayPanel({ payment, showHeading = true }) {
  return (
    <div className="rounded-[28px] border border-[#ece4da] bg-white p-5">
      {showHeading ? (
        <>
          <div className="inline-flex rounded-full border border-[#e8dfd3] bg-[#fcfaf8] px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.2em] text-[#8d7f72]">
            QR SePay
          </div>
          <h3 className="mt-4 text-[24px] font-semibold tracking-[-0.03em] text-[#15110d]">
            Chuyển khoản bằng QR code
          </h3>
        </>
      ) : null}

      <div className="mt-5 grid gap-5 md:grid-cols-[220px_minmax(0,1fr)]">
        <div className="flex items-center justify-center rounded-[24px] border border-dashed border-[#ddd3c6] bg-[#fcfaf8] p-4">
          {payment.qrImageUrl ? (
            <img
              src={payment.qrImageUrl}
              alt="QR thanh toán SePay"
              className="h-[188px] w-[188px] rounded-[20px] object-cover"
            />
          ) : (
            <div className="flex h-[188px] w-[188px] flex-col items-center justify-center rounded-[20px] border border-dashed border-[#d8c8b6] bg-white px-5 text-center">
              <QrCode className="h-10 w-10 text-[#15110d]" />
              <div className="mt-4 text-[14px] font-semibold text-[#15110d]">QR SePay chưa cấu hình</div>
              <div className="mt-2 text-[13px] leading-6 text-[#7a6d61]">
                Thêm `NEXT_PUBLIC_SEPAY_QR_IMAGE_URL` để hiển thị mã QR thật.
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="rounded-[20px] border border-[#ece4da] bg-[#fcfaf8] p-4">
            <div className="text-[12px] uppercase tracking-[0.18em] text-[#8d7f72]">Số tiền</div>
            <div className="mt-2 text-[24px] font-semibold text-[#15110d]">
              {currencyFormatter.format(payment.amount)}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-[20px] border border-[#ece4da] bg-[#fcfaf8] p-4">
              <div className="text-[12px] uppercase tracking-[0.18em] text-[#8d7f72]">Ngân hàng</div>
              <div className="mt-2 text-[16px] font-semibold text-[#15110d]">{payment.bankName}</div>
            </div>
            <div className="rounded-[20px] border border-[#ece4da] bg-[#fcfaf8] p-4">
              <div className="text-[12px] uppercase tracking-[0.18em] text-[#8d7f72]">Số tài khoản</div>
              <div className="mt-2 text-[16px] font-semibold text-[#15110d]">{payment.accountNumber}</div>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-[20px] border border-[#ece4da] bg-[#fcfaf8] p-4">
              <div className="text-[12px] uppercase tracking-[0.18em] text-[#8d7f72]">Chủ tài khoản</div>
              <div className="mt-2 text-[16px] font-semibold text-[#15110d]">{payment.accountName}</div>
            </div>
            <div className="rounded-[20px] border border-[#ece4da] bg-[#fcfaf8] p-4">
              <div className="text-[12px] uppercase tracking-[0.18em] text-[#8d7f72]">Nội dung chuyển khoản</div>
              <div className="mt-2 text-[16px] font-semibold text-[#15110d]">{payment.transferContent}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FieldError({ error }) {
  if (!error?.message) {
    return null;
  }

  return <div className="mt-2 text-[13px] text-red-600">{error.message}</div>;
}

export default function CheckoutPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { items, subtotal, clearCart, isReady } = useCart();
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCouponCode, setAppliedCouponCode] = useState('');
  const [couponMessage, setCouponMessage] = useState('');
  const [couponMessageType, setCouponMessageType] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedCheckout, setCompletedCheckout] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [addressesError, setAddressesError] = useState('');

  const checkoutForm = useForm({
    defaultValues: defaultCheckoutValues,
    shouldUnregister: true,
  });

  useEffect(() => {
    const currentValues = checkoutForm.getValues();

    checkoutForm.reset({
      fullName: currentValues.fullName || user?.fullName || '',
      phone: currentValues.phone || user?.phone || '',
      email: currentValues.email || user?.email || '',
      province: currentValues.province || '',
      ward: currentValues.ward || '',
      addressLine: currentValues.addressLine || '',
    });
  }, [checkoutForm, user]);

  useEffect(() => {
    if (!user) {
      setAddresses([]);
      setSelectedAddressId(null);
      setAddressesError('');
      return;
    }

    let isCancelled = false;

    const loadAddresses = async () => {
      try {
        setIsLoadingAddresses(true);
        setAddressesError('');

        const response = await fetch('/api/account/addresses', {
          method: 'GET',
          cache: 'no-store',
        });
        const data = await parseJson(response);

        if (!response.ok) {
          throw new Error(data.message ?? 'Không thể tải danh sách địa chỉ.');
        }

        if (!isCancelled) {
          const nextAddresses = Array.isArray(data.addresses) ? data.addresses : [];
          setAddresses(nextAddresses);

          if (nextAddresses.length) {
            const defaultAddress = nextAddresses.find((address) => address.isDefault) ?? nextAddresses[0];
            setSelectedAddressId(defaultAddress.id);
          } else {
            setSelectedAddressId(null);
          }
        }
      } catch (error) {
        if (!isCancelled) {
          setAddresses([]);
          setSelectedAddressId(null);
          setAddressesError(error.message);
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingAddresses(false);
        }
      }
    };

    loadAddresses();

    return () => {
      isCancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!appliedCouponCode) {
      return;
    }

    const nextTotals = getCheckoutTotals({
      subtotal,
      couponCode: appliedCouponCode,
    });

    setCouponMessage(nextTotals.coupon.message);
    setCouponMessageType(nextTotals.coupon.isValid ? 'success' : 'error');

    if (!nextTotals.coupon.isValid) {
      setAppliedCouponCode('');
    }
  }, [appliedCouponCode, subtotal]);

  const totals = useMemo(
    () =>
      getCheckoutTotals({
        subtotal,
        couponCode: appliedCouponCode,
      }),
    [appliedCouponCode, subtotal],
  );

  const selectedAddress = useMemo(
    () => addresses.find((address) => address.id === selectedAddressId) ?? null,
    [addresses, selectedAddressId],
  );

  const useSavedAddresses = Boolean(user);
  const hasSavedAddresses = addresses.length > 0;

  const sepayPreview = useMemo(
    () =>
      getSepayPaymentDetails({
        amount: completedCheckout?.payment?.amount ?? totals.grandTotal,
        orderNumber: completedCheckout?.order?.orderNumber ?? '',
      }),
    [completedCheckout, totals.grandTotal],
  );

  const handleApplyCoupon = () => {
    const nextTotals = getCheckoutTotals({
      subtotal,
      couponCode,
    });

    setAppliedCouponCode(nextTotals.coupon.isValid ? nextTotals.coupon.code : '');
    setCouponMessage(nextTotals.coupon.message);
    setCouponMessageType(nextTotals.coupon.isValid ? 'success' : 'error');
  };

  const handleSubmitOrder = checkoutForm.handleSubmit(async (values) => {
    if (!items.length) {
      setSubmitError('Giỏ hàng đang trống.');
      return;
    }

    if (useSavedAddresses && !selectedAddressId) {
      setSubmitError('Vui lòng chọn địa chỉ giao hàng.');
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError('');

      const payloadItems = items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        sku: item.sku,
        name: item.name,
        variantLabel: item.variantLabel,
        price: item.price,
        quantity: item.quantity,
      }));

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentMethod,
          couponCode: appliedCouponCode,
          addressId: useSavedAddresses ? selectedAddressId : null,
          customer: useSavedAddresses ? null : values,
          items: payloadItems,
        }),
      });
      const data = await parseJson(response);

      if (!response.ok) {
        throw new Error(data.message ?? 'Không thể tạo đơn hàng.');
      }

      const contactSnapshot = useSavedAddresses
        ? {
            fullName: selectedAddress?.recipientName ?? user?.fullName ?? '',
            phone: selectedAddress?.recipientPhone ?? user?.phone ?? '',
            email: user?.email ?? '',
            province: selectedAddress?.province ?? '',
            ward: selectedAddress?.ward || selectedAddress?.district || '',
            addressLine: selectedAddress?.addressLine ?? '',
          }
        : values;

      setCompletedCheckout({
        order: data.order,
        payment: data.payment,
        customer: contactSnapshot,
        items: payloadItems,
      });
      clearCart();
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  });

  if (!isReady || isAuthLoading) {
    return (
      <section className="bg-[#fcfaf8] py-12 md:py-20">
        <div className="mx-auto max-w-[1280px] px-4 md:px-6">
          <div className="flex min-h-[420px] items-center justify-center rounded-[32px] border border-[#ece4da] bg-white text-[15px] text-[#665a4e]">
            Đang chuẩn bị checkout...
          </div>
        </div>
      </section>
    );
  }

  if (completedCheckout) {
    const isBankTransfer = completedCheckout.order.paymentMethod === 'bank_transfer';
    const paymentDetails = completedCheckout.payment ?? sepayPreview;

    return (
      <section className="bg-[#fcfaf8] py-12 md:py-20">
        <div className="mx-auto max-w-[1280px] px-4 md:px-6">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[32px] border border-[#ece4da] bg-white p-7 md:p-9">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#15110d] text-white">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div className="mt-6 inline-flex rounded-full border border-[#e8dfd3] bg-[#fcfaf8] px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.2em] text-[#8d7f72]">
                Đơn hàng thành công
              </div>
              <h1 className="mt-5 text-[32px] font-semibold leading-tight tracking-[-0.04em] text-[#15110d] md:text-[38px]">
                #{completedCheckout.order.orderNumber} đã được tạo
              </h1>
              <p className="mt-4 max-w-[620px] text-[16px] leading-8 text-[#665a4e]">
                {isBankTransfer
                  ? 'Đơn hàng đang chờ thanh toán. Quét QR hoặc chuyển khoản đúng số tiền và nội dung bên dưới để hệ thống dễ đối soát.'
                  : 'Đơn hàng của bạn đã được ghi nhận. SRX sẽ liên hệ xác nhận trước khi giao và bạn thanh toán khi nhận hàng.'}
              </p>

              <div className="mt-8 grid gap-4 md:grid-cols-2">
                <div className="rounded-[22px] border border-[#ece4da] bg-[#fcfaf8] p-5">
                  <div className="text-[12px] uppercase tracking-[0.18em] text-[#8d7f72]">Tổng thanh toán</div>
                  <div className="mt-2 text-[24px] font-semibold text-[#15110d]">
                    {currencyFormatter.format(completedCheckout.order.grandTotal)}
                  </div>
                </div>
                <div className="rounded-[22px] border border-[#ece4da] bg-[#fcfaf8] p-5">
                  <div className="text-[12px] uppercase tracking-[0.18em] text-[#8d7f72]">Phương thức</div>
                  <div className="mt-2 text-[18px] font-semibold text-[#15110d]">
                    {paymentMethodOptions.find((method) => method.id === completedCheckout.order.paymentMethod)?.label}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                {user ? (
                  <Link
                    href="/account"
                    className="inline-flex items-center justify-center rounded-full bg-[#15110d] px-6 py-3.5 text-[15px] font-semibold text-white transition hover:bg-[#2b2520]"
                  >
                    Xem tài khoản
                  </Link>
                ) : null}
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center rounded-full border border-[#15110d] px-6 py-3.5 text-[15px] font-semibold text-[#15110d] transition hover:bg-[#15110d] hover:text-white"
                >
                  Tiếp tục mua sắm
                </Link>
              </div>
            </div>

            <div className="space-y-6">
              {isBankTransfer ? <SepayPanel payment={paymentDetails} /> : null}

              <div className="rounded-[32px] border border-[#ece4da] bg-white p-6">
                <div className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#8d7f72]">
                  Thông tin nhận hàng
                </div>
                <div className="mt-4 rounded-[24px] border border-[#ece4da] bg-[#fcfaf8] p-5">
                  <div className="text-[17px] font-semibold text-[#15110d]">
                    {completedCheckout.customer.fullName}
                  </div>
                  <div className="mt-2 text-[14px] text-[#665a4e]">
                    {completedCheckout.customer.phone}
                    {completedCheckout.customer.email ? ` • ${completedCheckout.customer.email}` : ''}
                  </div>
                  <div className="mt-2 text-[14px] leading-6 text-[#665a4e]">
                    {formatCheckoutContact(completedCheckout.customer)}
                  </div>
                </div>

                <div className="mt-5 text-[12px] font-semibold uppercase tracking-[0.2em] text-[#8d7f72]">
                  Sản phẩm
                </div>
                <div className="mt-4 space-y-3">
                  {completedCheckout.items.map((item, index) => (
                    <div
                      key={`${item.name}-${index}`}
                      className="rounded-[22px] border border-[#ece4da] bg-[#fcfaf8] p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="text-[15px] font-semibold text-[#15110d]">{item.name}</div>
                          {item.variantLabel ? (
                            <div className="mt-1 text-[13px] text-[#665a4e]">{item.variantLabel}</div>
                          ) : null}
                        </div>
                        <div className="flex-shrink-0 text-[14px] text-[#665a4e]">x{item.quantity}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!items.length) {
    return (
      <section className="bg-[#fcfaf8] py-12 md:py-20">
        <div className="mx-auto max-w-[980px] px-4 md:px-6">
          <div className="rounded-[32px] border border-[#ece4da] bg-white px-6 py-14 text-center md:px-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#15110d] text-white">
              <ShoppingBag className="h-7 w-7" />
            </div>
            <h1 className="mt-6 text-[32px] font-semibold tracking-[-0.04em] text-[#15110d]">
              Giỏ hàng đang trống
            </h1>
            <p className="mt-3 text-[15px] leading-7 text-[#665a4e]">
              Hãy thêm sản phẩm vào giỏ trước khi tiến hành checkout.
            </p>
            <Link
              href="/products"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#15110d] px-6 py-3.5 text-[15px] font-semibold text-white transition hover:bg-[#2b2520]"
            >
              Xem sản phẩm
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#fcfaf8] py-12 md:py-20">
      <div className="mx-auto max-w-[1280px] px-4 md:px-6">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <div className="rounded-[32px] border border-[#ece4da] bg-white p-7 md:p-9">
              <div className="inline-flex rounded-full border border-[#e8dfd3] bg-[#fcfaf8] px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.2em] text-[#8d7f72]">
                Checkout
              </div>
              <h1 className="mt-5 text-[32px] font-semibold leading-tight tracking-[-0.04em] text-[#15110d] md:text-[38px]">
                Hoàn tất đơn hàng của bạn
              </h1>
            </div>

            {useSavedAddresses ? (
              <div className="rounded-[32px] border border-[#ece4da] bg-white p-7 md:p-9">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#15110d] text-white">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#8d7f72]">
                      Địa chỉ giao hàng
                    </div>
                    <h2 className="mt-2 text-[28px] font-semibold tracking-[-0.04em] text-[#15110d]">
                      Chọn địa chỉ có sẵn
                    </h2>
                  </div>
                </div>

                {isLoadingAddresses ? (
                  <div className="mt-6 flex items-center gap-3 rounded-[24px] border border-[#ece4da] bg-[#fcfaf8] px-5 py-4 text-[14px] text-[#665a4e]">
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Đang tải địa chỉ đã lưu...
                  </div>
                ) : addressesError ? (
                  <div className="mt-6 rounded-[20px] border border-[#efd3d3] bg-[#fff1f1] px-4 py-3 text-[14px] text-[#ad4040]">
                    {addressesError}
                  </div>
                ) : hasSavedAddresses ? (
                  <>
                    <div className="mt-6 grid gap-4">
                      {addresses.map((address) => (
                        <AddressOption
                          key={address.id}
                          address={address}
                          isSelected={selectedAddressId === address.id}
                          onSelect={setSelectedAddressId}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="mt-6 rounded-[24px] border border-dashed border-[#d8c8b6] bg-[#fcfaf8] px-6 py-10 text-center">
                    <MapPin className="mx-auto h-8 w-8 text-[#15110d]" />
                    <h3 className="mt-4 text-[22px] font-semibold text-[#15110d]">Tài khoản chưa có địa chỉ</h3>
                    <p className="mt-3 text-[15px] leading-7 text-[#665a4e]">
                      Khi đã đăng nhập, checkout chỉ dùng địa chỉ giao hàng đã lưu. Hãy thêm địa chỉ trong tài khoản rồi quay lại thanh toán.
                    </p>
                    <Link
                      href="/account"
                      className="mt-5 inline-flex items-center justify-center rounded-full bg-[#15110d] px-6 py-3.5 text-[15px] font-semibold text-white transition hover:bg-[#2b2520]"
                    >
                      Đi tới tài khoản
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-[32px] border border-[#ece4da] bg-white p-7 md:p-9">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#15110d] text-white">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#8d7f72]">
                      Thông tin nhận hàng
                    </div>
                    <h2 className="mt-2 text-[28px] font-semibold tracking-[-0.04em] text-[#15110d]">
                      Nhập form thanh toán
                    </h2>
                  </div>
                </div>

                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-[14px] font-medium text-[#3e342b]">Họ tên</label>
                    <input
                      type="text"
                      {...checkoutForm.register('fullName', {
                        required: 'Vui lòng nhập họ tên.',
                        minLength: {
                          value: 2,
                          message: 'Họ tên quá ngắn.',
                        },
                      })}
                      className="w-full rounded-[18px] border border-[#ddd3c6] bg-[#fcfaf8] px-4 py-3.5 text-[15px] outline-none transition focus:border-[#15110d]"
                      placeholder="Nguyễn Văn A"
                    />
                    <FieldError error={checkoutForm.formState.errors.fullName} />
                  </div>

                  <div>
                    <label className="mb-2 block text-[14px] font-medium text-[#3e342b]">SĐT</label>
                    <input
                      type="tel"
                      {...checkoutForm.register('phone', {
                        required: 'Vui lòng nhập số điện thoại.',
                        minLength: {
                          value: 8,
                          message: 'Số điện thoại không hợp lệ.',
                        },
                      })}
                      className="w-full rounded-[18px] border border-[#ddd3c6] bg-[#fcfaf8] px-4 py-3.5 text-[15px] outline-none transition focus:border-[#15110d]"
                      placeholder="0903 010 692"
                    />
                    <FieldError error={checkoutForm.formState.errors.phone} />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-[14px] font-medium text-[#3e342b]">Email</label>
                    <input
                      type="email"
                      {...checkoutForm.register('email', {
                        required: 'Vui lòng nhập email.',
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: 'Email không hợp lệ.',
                        },
                      })}
                      className="w-full rounded-[18px] border border-[#ddd3c6] bg-[#fcfaf8] px-4 py-3.5 text-[15px] outline-none transition focus:border-[#15110d]"
                      placeholder="you@example.com"
                    />
                    <FieldError error={checkoutForm.formState.errors.email} />
                  </div>

                  <div>
                    <label className="mb-2 block text-[14px] font-medium text-[#3e342b]">Tỉnh/TP</label>
                    <input
                      type="text"
                      {...checkoutForm.register('province', {
                        required: 'Vui lòng nhập tỉnh/thành phố.',
                        minLength: {
                          value: 2,
                          message: 'Tỉnh/TP quá ngắn.',
                        },
                      })}
                      className="w-full rounded-[18px] border border-[#ddd3c6] bg-[#fcfaf8] px-4 py-3.5 text-[15px] outline-none transition focus:border-[#15110d]"
                      placeholder="TP. Hồ Chí Minh"
                    />
                    <FieldError error={checkoutForm.formState.errors.province} />
                  </div>

                  <div>
                    <label className="mb-2 block text-[14px] font-medium text-[#3e342b]">Phường/Xã</label>
                    <input
                      type="text"
                      {...checkoutForm.register('ward', {
                        required: 'Vui lòng nhập phường/xã.',
                        minLength: {
                          value: 2,
                          message: 'Phường/Xã quá ngắn.',
                        },
                      })}
                      className="w-full rounded-[18px] border border-[#ddd3c6] bg-[#fcfaf8] px-4 py-3.5 text-[15px] outline-none transition focus:border-[#15110d]"
                      placeholder="Phường Bến Nghé"
                    />
                    <FieldError error={checkoutForm.formState.errors.ward} />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-[14px] font-medium text-[#3e342b]">
                      Địa chỉ chi tiết
                    </label>
                    <textarea
                      rows={4}
                      {...checkoutForm.register('addressLine', {
                        required: 'Vui lòng nhập địa chỉ chi tiết.',
                        minLength: {
                          value: 6,
                          message: 'Địa chỉ quá ngắn.',
                        },
                      })}
                      className="w-full rounded-[18px] border border-[#ddd3c6] bg-[#fcfaf8] px-4 py-3.5 text-[15px] outline-none transition focus:border-[#15110d]"
                      placeholder="Số nhà, tên đường, tòa nhà..."
                    />
                    <FieldError error={checkoutForm.formState.errors.addressLine} />
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-[32px] border border-[#ece4da] bg-white p-7 md:p-9">
              <div className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#8d7f72]">
                Thanh toán
              </div>
              <h2 className="mt-3 text-[28px] font-semibold tracking-[-0.04em] text-[#15110d]">
                Chọn phương thức phù hợp
              </h2>

              <div className="mt-6 grid gap-4">
                {paymentMethodOptions.map((method) => (
                  <PaymentMethodOption
                    key={method.id}
                    method={method}
                    isSelected={paymentMethod === method.id}
                    onSelect={setPaymentMethod}
                  />
                ))}
              </div>

              {paymentMethod === 'bank_transfer' ? (
                <div className="mt-6">
                  <SepayPanel payment={sepayPreview} showHeading={false} />
                </div>
              ) : null}
            </div>
          </div>

          <div className="space-y-6 lg:sticky lg:top-[110px] lg:self-start">
            <div className="rounded-[32px] border border-[#ece4da] bg-white p-7 md:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#15110d] text-white">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#8d7f72]">
                    Đơn hàng
                  </div>
                  <div className="mt-1 text-[24px] font-semibold tracking-[-0.03em] text-[#15110d]">
                    {items.length} sản phẩm trong giỏ
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {items.map((item) => (
                  <div key={item.lineId} className="rounded-[22px] border border-[#ece4da] bg-[#fcfaf8] p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="text-[15px] font-semibold text-[#15110d]">{item.name}</div>
                        <div className="mt-1 text-[13px] text-[#665a4e]">{item.variantLabel}</div>
                      </div>
                      <div className="flex-shrink-0 text-[14px] text-[#665a4e]">x{item.quantity}</div>
                    </div>
                    <div className="mt-3 text-[15px] font-semibold text-[#15110d]">
                      {currencyFormatter.format(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] border border-[#ece4da] bg-white p-7 md:p-8">
              <div className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.18em] text-[#8d7f72]">
                <TicketPercent className="h-4 w-4" />
                Mã giảm giá
              </div>

              <div className="mt-4 flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(event) => setCouponCode(event.target.value)}
                  placeholder="Ví dụ: SRX10"
                  className="min-w-0 flex-1 rounded-full border border-[#ddd3c6] bg-[#fcfaf8] px-4 py-3 text-[14px] text-[#15110d] outline-none transition focus:border-[#15110d]"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="rounded-full bg-[#15110d] px-4 py-3 text-[13px] font-semibold text-white transition hover:bg-[#2b2520]"
                >
                  Áp dụng
                </button>
              </div>

              {couponMessage ? (
                <div
                  className={`mt-3 text-[13px] ${
                    couponMessageType === 'success' ? 'text-[#2c7a4b]' : 'text-[#ad4040]'
                  }`}
                >
                  {couponMessage}
                </div>
              ) : null}

              {appliedCouponCode ? (
                <div className="mt-4 inline-flex rounded-full border border-[#e8dfd3] bg-[#fcfaf8] px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-[#8d7f72]">
                  Đang áp dụng: {appliedCouponCode}
                </div>
              ) : null}

              <div className="mt-6 space-y-3 text-[15px] text-[#665a4e]">
                <div className="flex items-center justify-between">
                  <span>Tạm tính</span>
                  <span className="font-medium text-[#15110d]">{currencyFormatter.format(totals.subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Giảm giá</span>
                  <span className="font-medium text-[#15110d]">-{currencyFormatter.format(totals.discountTotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Phí vận chuyển</span>
                  <span className="font-medium text-[#15110d]">Miễn phí</span>
                </div>
                <div className="flex items-center justify-between border-t border-[#ece4da] pt-4 text-[20px] font-semibold text-[#15110d]">
                  <span>Tổng cộng</span>
                  <span>{currencyFormatter.format(totals.grandTotal)}</span>
                </div>
              </div>

              {submitError ? (
                <div className="mt-4 rounded-[20px] border border-[#efd3d3] bg-[#fff1f1] px-4 py-3 text-[14px] text-[#ad4040]">
                  {submitError}
                </div>
              ) : null}

              <button
                type="button"
                onClick={handleSubmitOrder}
                disabled={isSubmitting || (useSavedAddresses ? !selectedAddressId : false) || (useSavedAddresses && isLoadingAddresses)}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#15110d] px-6 py-4 text-[15px] font-semibold text-white transition hover:bg-[#2b2520] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                <span>{paymentMethod === 'bank_transfer' ? 'Tạo đơn và nhận QR' : 'Xác nhận đặt hàng'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
