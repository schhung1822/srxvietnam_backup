'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { createPortal } from 'react-dom';
import {
  ChevronRight,
  ImageOff,
  LockKeyhole,
  LogOut,
  PackageSearch,
  ShieldCheck,
  ShoppingBag,
  UserRound,
  X,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import useBrowserSearchParams from '../../hooks/useBrowserSearchParams.js';
import { AuthField, AuthPasswordField } from '../../components/auth/AuthField.jsx';
import { AuthAlert, AuthDivider, AuthSubmitButton, AuthTabs } from '../../components/auth/AuthPrimitives.jsx';
import GoogleAuthButton from '../../components/auth/GoogleAuthButton.jsx';
import ZaloQrLoginButton from '../../components/auth/ZaloQrLoginButton.jsx';
import { getAuthErrorMessage } from '../../components/auth/authErrors.js';

const dashboardTabIds = ['profile', 'password', 'orders', 'logout'];

const PANEL = 'rounded-[16px] border border-[#D9D9D9] bg-white';
const TILE = 'rounded-[14px] border border-[#D9D9D9] bg-[#F6F6F6]';
const EYEBROW = 'text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5E6266]';
const BTN_PRIMARY =
  'inline-flex items-center justify-center gap-2 rounded-full bg-[#15110d] px-5 py-3 text-[14.5px] font-semibold text-white transition hover:bg-[#2b2520] disabled:cursor-not-allowed disabled:opacity-60';
const BTN_GHOST =
  'inline-flex items-center justify-center gap-2 rounded-full border border-[#B7B7B7] bg-white px-5 py-3 text-[14.5px] font-semibold text-[#15110d] transition hover:border-[#15110d] hover:bg-[#15110d] hover:text-white disabled:cursor-not-allowed disabled:opacity-60';

const getTabFromSearch = (searchParams) =>
  searchParams.get('tab') === 'register' ? 'register' : 'login';

const getDashboardTabFromSearch = (searchParams) => {
  const view = searchParams.get('view');

  return dashboardTabIds.includes(view) ? view : 'profile';
};

const dashboardTabs = [
  {
    id: 'profile',
    label: 'Thông tin tài khoản',
    description: 'Có thể sửa thông tin tài khoản tại đây.',
    icon: UserRound,
  },
  {
    id: 'password',
    label: 'Đổi mật khẩu',
    description: 'Cập nhật mật khẩu để tăng bảo mật cho tài khoản.',
    icon: LockKeyhole,
  },
  {
    id: 'orders',
    label: 'Đơn hàng',
    description: 'Theo dõi các đơn hàng của tài khoản.',
    icon: PackageSearch,
  },
  {
    id: 'logout',
    label: 'Đăng xuất',
    description: 'Kết thúc phiên đăng nhập trên thiết bị hiện tại.',
    icon: LogOut,
  },
];

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
  cod: 'Thanh toan khi nhan hang',
  bank_transfer: 'Chuyen khoan QR',
  card: 'The',
  e_wallet: 'Vi dien tu',
};

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
});

const orderDateFormatter = new Intl.DateTimeFormat('vi-VN', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

async function parseJson(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

function getOrderStatusClass(status) {
  switch (status) {
    case 'completed':
      return 'border-[#d4ecdc] bg-[#edf9f1] text-[#237a3b]';
    case 'shipping':
    case 'processing':
      return 'border-[#dbe3ff] bg-[#eef2ff] text-[#2b4eff]';
    case 'cancelled':
    case 'refunded':
      return 'border-[#f0d3d3] bg-[#fff0f0] text-[#b14040]';
    default:
      return 'border-[#D9D9D9] bg-[#F6F6F6] text-[#5E6266]';
  }
}

function getFeedbackClass(type) {
  return type === 'success'
    ? 'border-[#d6e9da] bg-[#eef8f0] text-[#296d3b]'
    : 'border-[#efd3d3] bg-[#fff1f1] text-[#ad4040]';
}

function formatOrderDate(value) {
  if (!value) {
    return 'Chua cap nhat';
  }

  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? 'Chua cap nhat' : orderDateFormatter.format(parsedDate);
}

function getPaymentMethodLabel(paymentMethod) {
  return paymentMethodLabels[paymentMethod] ?? paymentMethod ?? 'Chua cap nhat';
}

function getOrderPreviewText(order) {
  const firstItem = order.items?.[0];

  if (!firstItem) {
    return 'Don hang chua co san pham chi tiet.';
  }

  const extraItemCount = Math.max((order.items?.length ?? 0) - 1, 0);

  if (!extraItemCount) {
    return firstItem.productName;
  }

  return `${firstItem.productName} va ${extraItemCount} san pham khac`;
}

function formatOrderContactValue(value) {
  return String(value ?? '').trim() || 'Chua cap nhat';
}

function formatOrderShippingAddress(address) {
  if (!address) {
    return 'Chua cap nhat';
  }

  const parts = [
    address.addressLine,
    address.ward,
    address.district,
    address.province,
    address.countryCode && address.countryCode !== 'VN' ? address.countryCode : '',
  ]
    .map((part) => String(part ?? '').trim())
    .filter(Boolean);

  return parts.length ? parts.join(', ') : 'Chua cap nhat';
}

function canRetryOrderPayment(order) {
  if (!order) {
    return false;
  }

  return (
    order.paymentMethod === 'bank_transfer' &&
    ['pending', 'failed'].includes(order.paymentStatus)
  );
}

function DashboardTabButton({ isActive, tab, onClick }) {
  const Icon = tab.icon;

  return (
    <button
      type="button"
      onClick={() => onClick(tab.id)}
      title={tab.description}
      className={`flex w-full items-center gap-2.5 rounded-[12px] border px-3 py-2.5 text-left transition sm:gap-3 sm:px-3.5 sm:py-3 ${
        isActive
          ? 'border-[#15110d] bg-[#15110d] text-white'
          : 'border-[#D9D9D9] bg-white text-[#15110d] hover:border-[#B7B7B7] hover:bg-[#F6F6F6]'
      }`}
    >
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] ${
          isActive ? 'bg-white/15 text-white' : 'bg-[#F6F6F6] text-[#15110d]'
        }`}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 text-[13.5px] font-semibold leading-5 sm:text-[14.5px]">{tab.label}</span>
    </button>
  );
}

function SectionHead({ title, description, actions }) {
  return (
    <div className="flex flex-col gap-4 border-b border-[#EDEDED] pb-5 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h2 className="text-[22px] font-semibold tracking-[-0.03em] text-[#15110d] md:text-[24px]">{title}</h2>
        {description ? (
          <p className="mt-2 max-w-[700px] text-[14px] leading-6 text-[#5E6266]">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2.5">{actions}</div> : null}
    </div>
  );
}

function FeedbackNote({ message }) {
  if (!message?.text) {
    return null;
  }

  return (
    <div className={`rounded-[12px] border px-4 py-3 text-[14px] leading-6 ${getFeedbackClass(message.type)}`}>
      {message.text}
    </div>
  );
}

function OrderDetailModal({ order, onClose }) {
  useEffect(() => {
    if (!order) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, order]);

  if (!order || typeof document === 'undefined') {
    return null;
  }

  const shouldShowPaymentLink = canRetryOrderPayment(order);

  return createPortal(
    <div
      className="fixed inset-0 z-[140] overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={`Chi tiet don hang ${order.orderNumber}`}
    >
      <div
        className="absolute inset-0 bg-[rgba(21,17,13,0.35)] backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative flex min-h-full items-center justify-center p-4 md:p-6">
        <div className="relative flex w-full max-w-[900px] flex-col overflow-hidden rounded-[18px] border border-[#D9D9D9] bg-white shadow-[0_32px_90px_rgba(21,17,13,0.16)]">
          <div className="border-b border-[#EDEDED] px-5 py-5 md:px-7">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className={EYEBROW}>Chi tiết đơn hàng</div>
                <h3 className="mt-2 break-all text-[22px] font-semibold tracking-[-0.03em] text-[#15110d] md:text-[26px]">
                  #{order.orderNumber}
                </h3>
                <div className="mt-1.5 text-[13.5px] text-[#5E6266]">
                  Đặt ngày {formatOrderDate(order.placedAt)}
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[12px] border border-[#D9D9D9] bg-white text-[#15110d] transition hover:border-[#15110d] hover:bg-[#15110d] hover:text-white"
                aria-label="Đóng chi tiết đơn hàng"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex rounded-full border px-2.5 py-1 text-[12.5px] font-medium ${getOrderStatusClass(
                  order.orderStatus,
                )}`}
              >
                {orderStatusLabels[order.orderStatus] ?? order.orderStatus}
              </span>
              <span className="inline-flex rounded-full border border-[#D9D9D9] bg-[#F6F6F6] px-2.5 py-1 text-[12.5px] font-medium text-[#5E6266]">
                {paymentStatusLabels[order.paymentStatus] ?? order.paymentStatus}
              </span>
              <span className="ml-auto text-[18px] font-semibold tracking-[-0.02em] text-[#15110d]">
                {currencyFormatter.format(order.grandTotal)}
              </span>
            </div>
          </div>

          <div className="max-h-[calc(100dvh-8rem)] overflow-y-auto px-5 py-5 md:px-7 md:py-6">
            <div className="grid gap-4 lg:grid-cols-2">
              <div className={`${TILE} p-5`}>
                <div className={EYEBROW}>Thông tin đơn hàng</div>
                <dl className="mt-4 space-y-3">
                  {[
                    ['Mã đơn hàng', `#${order.orderNumber}`],
                    ['Ngày đặt', formatOrderDate(order.placedAt)],
                    ['Trạng thái đơn', orderStatusLabels[order.orderStatus] ?? order.orderStatus],
                    ['Tổng tiền', currencyFormatter.format(order.grandTotal)],
                  ].map(([label, value]) => (
                    <div key={label} className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                      <dt className="text-[13px] text-[#5E6266] sm:text-[13.5px]">{label}</dt>
                      <dd className="text-[14px] font-semibold text-[#15110d] sm:text-right">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className={`${TILE} p-5`}>
                <div className={EYEBROW}>Thông tin nhận hàng</div>
                <dl className="mt-4 space-y-3">
                  {[
                    [
                      'Tên khách hàng',
                      formatOrderContactValue(order.customer?.name || order.shippingAddress?.recipientName),
                    ],
                    [
                      'Số điện thoại',
                      formatOrderContactValue(order.shippingAddress?.recipientPhone || order.customer?.phone),
                    ],
                    ['Email', formatOrderContactValue(order.customer?.email)],
                    ['Địa chỉ giao hàng', formatOrderShippingAddress(order.shippingAddress)],
                    ['Phương thức thanh toán', getPaymentMethodLabel(order.paymentMethod)],
                  ].map(([label, value]) => (
                    <div key={label} className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                      <dt className="shrink-0 text-[13px] text-[#5E6266] sm:text-[13.5px]">{label}</dt>
                      <dd className="break-words text-[14px] font-semibold leading-6 text-[#15110d] sm:text-right">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>

                {shouldShowPaymentLink ? (
                  <Link
                    href={`/checkout/payment/${encodeURIComponent(order.orderNumber)}`}
                    className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-[#15110d] px-5 py-3 text-[14px] font-semibold text-white transition hover:bg-[#2b2520]"
                  >
                    Thanh toán đơn hàng
                  </Link>
                ) : null}
              </div>
            </div>

            <div className={`mt-4 ${TILE} p-5`}>
              <div className="flex items-center justify-between gap-3">
                <div className={EYEBROW}>Sản phẩm trong đơn</div>
                <div className="text-[13px] text-[#5E6266]">{order.totalQuantity} sản phẩm</div>
              </div>

              <div className="mt-4 space-y-2.5">
                {order.items.length ? (
                  order.items.map((item, index) => (
                    <div
                      key={`${order.id}-${index}`}
                      className="flex items-center gap-3.5 rounded-[12px] border border-[#D9D9D9] bg-white px-4 py-3"
                    >
                      <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-[10px] border border-[#EDEDED] bg-[#F6F6F6]">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.productName}
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[#B7B7B7]">
                            <ImageOff className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[14.5px] font-semibold leading-6 text-[#15110d]">
                          {item.productName}
                        </div>
                        {item.variantName ? (
                          <div className="mt-0.5 text-[13px] text-[#5E6266]">{item.variantName}</div>
                        ) : null}
                        {item.isGift ? (
                          <span className="mt-1 inline-flex rounded-full border border-[#D9D9D9] bg-[#F6F6F6] px-2 py-0.5 text-[11.5px] font-medium text-[#5E6266]">
                            Quà tặng
                          </span>
                        ) : null}
                      </div>
                      <div className="flex-shrink-0 text-[14px] font-medium text-[#5E6266]">x{item.quantity}</div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[12px] border border-dashed border-[#B7B7B7] px-4 py-5 text-[14px] text-[#5E6266]">
                    Đơn hàng chưa có dòng sản phẩm chi tiết.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default function AccountPage({ isGoogleAuthEnabled = false, isZaloQrLoginEnabled = false }) {
  const router = useRouter();
  const searchParams = useBrowserSearchParams();
  const { user, isLoading, login, register: registerAccount, logout, refreshUser } = useAuth();
  const [authTab, setAuthTab] = useState(getTabFromSearch(searchParams));
  const [dashboardTab, setDashboardTab] = useState(getDashboardTabFromSearch(searchParams));
  const [loginError, setLoginError] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
  const [ordersError, setOrdersError] = useState('');
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [hasLoadedOrders, setHasLoadedOrders] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const loginForm = useForm({
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  const registerForm = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const profileForm = useForm({
    defaultValues: {
      fullName: '',
      displayName: '',
      email: '',
      phone: '',
    },
  });

  const passwordForm = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const registerPassword = registerForm.watch('password');
  const newPassword = passwordForm.watch('newPassword');
  const authErrorMessage = getAuthErrorMessage(searchParams.get('authError'));

  useEffect(() => {
    setAuthTab(getTabFromSearch(searchParams));
  }, [searchParams]);

  useEffect(() => {
    if (!user) {
      return;
    }

    setDashboardTab(getDashboardTabFromSearch(searchParams));
  }, [searchParams, user]);

  useEffect(() => {
    if (!user) {
      profileForm.reset({
        fullName: '',
        displayName: '',
        email: '',
        phone: '',
      });
      passwordForm.reset();
      setOrders([]);
      setSelectedOrder(null);
      setHasLoadedOrders(false);
      return;
    }

    profileForm.reset({
      fullName: user.fullName ?? '',
      displayName: user.displayName ?? '',
      email: user.email ?? '',
      phone: user.phone ?? '',
    });
  }, [passwordForm, profileForm, user]);

  useEffect(() => {
    setDashboardTab(getDashboardTabFromSearch(searchParams));
    setProfileMessage({ type: '', text: '' });
    setPasswordMessage({ type: '', text: '' });
    setOrdersError('');
    setOrders([]);
    setSelectedOrder(null);
    setHasLoadedOrders(false);
  }, [searchParams, user?.id]);

  useEffect(() => {
    if (!user?.id || dashboardTab !== 'orders' || hasLoadedOrders) {
      return;
    }

    let isCancelled = false;

    const loadOrders = async () => {
      try {
        setIsLoadingOrders(true);
        setOrdersError('');
        const response = await fetch('/api/account/orders', {
          method: 'GET',
          cache: 'no-store',
        });
        const data = await parseJson(response);

        if (!response.ok) {
          throw new Error(data.message ?? 'Không thể tải danh sách đơn hàng.');
        }

        if (!isCancelled) {
          setOrders(Array.isArray(data.orders) ? data.orders : []);
          setHasLoadedOrders(true);
        }
      } catch (error) {
        if (!isCancelled) {
          setOrdersError(error.message);
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingOrders(false);
        }
      }
    };

    loadOrders();

    return () => {
      isCancelled = true;
    };
  }, [dashboardTab, hasLoadedOrders, user?.id]);

  const changeAuthTab = (tab) => {
    setAuthTab(tab);
    setLoginError('');
    setRegisterError('');
    router.replace(tab === 'register' ? '/account?tab=register' : '/account', { scroll: false });
  };

  const changeDashboardTab = (tab) => {
    setDashboardTab(tab);
    router.replace(tab === 'profile' ? '/account' : `/account?view=${tab}`, {
      scroll: false,
    });
  };

  const onSubmitLogin = loginForm.handleSubmit(async (values) => {
    try {
      setIsLoggingIn(true);
      setLoginError('');
      await login(values);
      router.replace('/account', { scroll: false });
      router.refresh();
    } catch (error) {
      setLoginError(error.message);
    } finally {
      setIsLoggingIn(false);
    }
  });

  const onSubmitRegister = registerForm.handleSubmit(async (values) => {
    try {
      setIsRegistering(true);
      setRegisterError('');
      await registerAccount({
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        password: values.password,
      });
      router.replace('/account', { scroll: false });
      router.refresh();
    } catch (error) {
      setRegisterError(error.message);
    } finally {
      setIsRegistering(false);
    }
  });

  const onSubmitProfile = profileForm.handleSubmit(async (values) => {
    try {
      setIsSavingProfile(true);
      setProfileMessage({ type: '', text: '' });

      const response = await fetch('/api/account/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await parseJson(response);

      if (!response.ok) {
        throw new Error(data.message ?? 'Không thể cập nhật thông tin tài khoản.');
      }

      await refreshUser();
      setProfileMessage({
        type: 'success',
        text: data.message ?? 'Thông tin tài khoản đã được cập nhật.',
      });
    } catch (error) {
      setProfileMessage({
        type: 'error',
        text: error.message,
      });
    } finally {
      setIsSavingProfile(false);
    }
  });

  const onSubmitPassword = passwordForm.handleSubmit(async (values) => {
    try {
      setIsChangingPassword(true);
      setPasswordMessage({ type: '', text: '' });

      const response = await fetch('/api/account/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        }),
      });
      const data = await parseJson(response);

      if (!response.ok) {
        throw new Error(data.message ?? 'Không thể đổi mật khẩu.');
      }

      passwordForm.reset();
      setPasswordMessage({
        type: 'success',
        text: data.message ?? 'Mật khẩu đã được cập nhật thành công.',
      });
    } catch (error) {
      setPasswordMessage({
        type: 'error',
        text: error.message,
      });
    } finally {
      setIsChangingPassword(false);
    }
  });

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      router.replace('/account', { scroll: false });
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const renderDashboardContent = () => {
    if (dashboardTab === 'profile') {
      return (
        <div>
          <SectionHead
            title="Thông tin tài khoản"
            description="Cập nhật hồ sơ để đồng bộ dữ liệu mua hàng và thông tin liên hệ."
          />

          <form onSubmit={onSubmitProfile} className="mt-6 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <AuthField
                label="Họ và tên"
                type="text"
                autoComplete="name"
                placeholder="Nguyễn Văn A"
                error={profileForm.formState.errors.fullName?.message}
                {...profileForm.register('fullName', {
                  required: 'Vui lòng nhập họ và tên.',
                  minLength: {
                    value: 2,
                    message: 'Họ và tên quá ngắn.',
                  },
                })}
              />

              <AuthField
                label="Tên hiển thị"
                type="text"
                placeholder="Tên hiển thị trên tài khoản"
                {...profileForm.register('displayName')}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <AuthField
                label="Email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                error={profileForm.formState.errors.email?.message}
                {...profileForm.register('email', {
                  required: 'Vui lòng nhập email.',
                })}
              />

              <AuthField
                label="Số điện thoại"
                type="tel"
                autoComplete="tel"
                placeholder="0903 010 692"
                {...profileForm.register('phone')}
              />
            </div>

            <FeedbackNote message={profileMessage} />

            <div className="flex flex-col gap-3 border-t border-[#EDEDED] pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  profileForm.reset({
                    fullName: user?.fullName ?? '',
                    displayName: user?.displayName ?? '',
                    email: user?.email ?? '',
                    phone: user?.phone ?? '',
                  })
                }
                className={BTN_GHOST}
              >
                Khôi phục dữ liệu hiện tại
              </button>
              <button type="submit" disabled={isSavingProfile} className={BTN_PRIMARY}>
                {isSavingProfile ? 'Đang lưu...' : 'Lưu thông tin'}
              </button>
            </div>
          </form>
        </div>
      );
    }

    if (dashboardTab === 'password') {
      return (
        <div>
          <SectionHead
            title="Đổi mật khẩu"
            description="Nên dùng mật khẩu ít nhất 8 ký tự và khác với mật khẩu cũ để tăng bảo mật."
          />

          <form onSubmit={onSubmitPassword} className="mt-6 max-w-[100%] space-y-4">
            <AuthPasswordField
              label="Mật khẩu hiện tại"
              autoComplete="current-password"
              placeholder="••••••••"
              error={passwordForm.formState.errors.currentPassword?.message}
              {...passwordForm.register('currentPassword', {
                required: 'Vui lòng nhập mật khẩu hiện tại.',
              })}
            />

            <div className="grid gap-5 md:grid-cols-2">
              <AuthPasswordField
                label="Mật khẩu mới"
                autoComplete="new-password"
                placeholder="••••••••"
                hint="Tối thiểu 8 ký tự."
                error={passwordForm.formState.errors.newPassword?.message}
                {...passwordForm.register('newPassword', {
                  required: 'Vui lòng nhập mật khẩu mới.',
                  minLength: {
                    value: 8,
                    message: 'Mật khẩu mới phải từ 8 ký tự.',
                  },
                })}
              />

              <AuthPasswordField
                label="Xác nhận mật khẩu mới"
                autoComplete="new-password"
                placeholder="••••••••"
                error={passwordForm.formState.errors.confirmPassword?.message}
                {...passwordForm.register('confirmPassword', {
                  required: 'Vui lòng xác nhận mật khẩu mới.',
                  validate: (value) => value === newPassword || 'Mật khẩu xác nhận không khớp.',
                })}
              />
            </div>

            <FeedbackNote message={passwordMessage} />

            <div className="flex border-t border-[#EDEDED] pt-5 sm:justify-end">
              <button type="submit" disabled={isChangingPassword} className={`${BTN_PRIMARY} w-full sm:w-auto`}>
                {isChangingPassword ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
              </button>
            </div>
          </form>
        </div>
      );
    }

    if (dashboardTab === 'orders') {
      return (
        <div>
          <SectionHead
            title="Đơn hàng"
            description="Theo dõi trạng thái xử lý và thanh toán của các đơn đã đặt bằng tài khoản này."
            actions={
              orders.length ? (
                <span className={`${TILE} px-3.5 py-2 text-[13px] font-semibold text-[#15110d]`}>
                  {orders.length} đơn hàng
                </span>
              ) : null
            }
          />

          {isLoadingOrders ? (
            <div className={`mt-6 ${TILE} px-5 py-10 text-center text-[15px] text-[#5E6266]`}>
              Đang tải danh sách đơn hàng...
            </div>
          ) : ordersError ? (
            <div className="mt-6 rounded-[12px] border border-[#efd3d3] bg-[#fff1f1] px-4 py-3 text-[14px] text-[#ad4040]">
              {ordersError}
            </div>
          ) : orders.length ? (
            <div className="mt-6 space-y-3">
              {orders.map((order) => (
                <article
                  key={order.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedOrder(order)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setSelectedOrder(order);
                    }
                  }}
                  className="cursor-pointer rounded-[14px] border border-[#D9D9D9] bg-white p-4 transition hover:border-[#15110d] hover:bg-[#F6F6F6] md:p-5"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="text-[18px] font-semibold tracking-[-0.02em] text-[#15110d]">
                          #{order.orderNumber}
                        </span>
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-[12.5px] font-medium ${getOrderStatusClass(
                            order.orderStatus,
                          )}`}
                        >
                          {orderStatusLabels[order.orderStatus] ?? order.orderStatus}
                        </span>
                        <span className="inline-flex rounded-full border border-[#D9D9D9] bg-[#F6F6F6] px-2.5 py-1 text-[12.5px] font-medium text-[#5E6266]">
                          {paymentStatusLabels[order.paymentStatus] ?? order.paymentStatus}
                        </span>
                      </div>
                      <div className="mt-2 text-[13.5px] text-[#5E6266]">
                        Đặt ngày {formatOrderDate(order.placedAt)}
                      </div>
                      <div className="mt-1.5 text-[13.5px] leading-6 text-[#5E6266]">
                        {getOrderPreviewText(order)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 md:flex-col md:items-end">
                      <div className="text-[18px] font-semibold tracking-[-0.02em] text-[#15110d]">
                        {currencyFormatter.format(order.grandTotal)}
                      </div>
                      <div className="inline-flex items-center text-[13.5px] font-semibold text-[#15110d]">
                        Xem chi tiết
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-[14px] border border-dashed border-[#B7B7B7] bg-[#F6F6F6] px-6 py-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#15110d] text-white">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-[20px] font-semibold tracking-[-0.02em] text-[#15110d]">Chưa có đơn hàng nào</h3>
              <p className="mt-2 text-[14px] leading-6 text-[#5E6266]">
                Khi tài khoản phát sinh đơn mua hàng, bạn sẽ theo dõi được trạng thái ngay tại đây.
              </p>
              <Link href="/products" className={`${BTN_PRIMARY} mt-5`}>
                Tiếp tục mua sắm
              </Link>
            </div>
          )}
          <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
        </div>
      );
    }

    return (
      <div>
        <SectionHead
          title="Đăng xuất"
          description="Kết thúc phiên đăng nhập trên thiết bị này. Bạn sẽ cần đăng nhập lại để vào khu vực tài khoản."
        />

        <div className={`mt-6 ${TILE} p-5`}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-white text-[#15110d]">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <div>
                <div className="text-[15px] font-semibold text-[#15110d]">
                  {user?.fullName || user?.displayName || user?.email}
                </div>
                <div className="text-[13.5px] text-[#5E6266]">Phiên đăng nhập đang hoạt động</div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/products" className={BTN_GHOST}>
                Tiếp tục mua sắm
              </Link>
              <button type="button" onClick={handleLogout} disabled={isLoggingOut} className={BTN_PRIMARY}>
                <LogOut className="h-4 w-4" />
                <span>{isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="bg-[#f9f9f9] py-10 md:py-16">
      <div className="mx-auto max-w-[1280px] px-4 md:px-6">
        {user ? (
          <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className={EYEBROW}>SRX ACCOUNT</div>
              <h1 className="mt-3 text-[28px] font-semibold leading-tight tracking-[-0.04em] text-[#15110d] md:text-[34px]">
                Xin chào {user.fullName || user.displayName || user.email}
              </h1>
              <p className="mt-2.5 max-w-[620px] text-[14.5px] leading-7 text-[#5E6266]">
                Cập nhật hồ sơ, đổi mật khẩu và theo dõi đơn hàng của bạn trong cùng một nơi.
              </p>
            </div>
            <Link href="/affiliate" className={`${BTN_GHOST} self-start lg:self-auto`}>
              Khu vực affiliate
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        ) : null}

        <div
          className={`grid gap-6 ${
            user ? 'xl:grid-cols-[280px_minmax(0,1fr)] xl:items-start' : 'lg:grid-cols-[0.92fr_1.08fr]'
          }`}
        >
          <div
            className={
              user
                ? 'space-y-4 xl:sticky xl:top-24'
                : 'hidden md:block rounded-[20px] border border-[#D9D9D9] bg-white p-7 md:p-9'
            }
          >
            {user ? (
              <>
                <div className={`${PANEL} p-5`}>
                  <div className="flex items-center gap-3.5">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-[#15110d] text-white">
                      <UserRound className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-[16px] font-semibold leading-6 tracking-[-0.02em] text-[#15110d]">
                        {user.fullName || user.displayName || user.email}
                      </div>
                      <div className="truncate text-[13px] text-[#5E6266]">{user.email}</div>
                    </div>
                  </div>
                  {user.phone ? (
                    <div className="mt-3.5 border-t border-[#EDEDED] pt-3.5 text-[13.5px] text-[#5E6266]">
                      {user.phone}
                    </div>
                  ) : null}
                </div>

                <div className={`${PANEL} p-3`}>
                  <div className={`${EYEBROW} px-2 pb-2.5 pt-1.5`}>Quản lý tài khoản</div>
                  <nav className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-1 xl:gap-1.5">
                    {dashboardTabs.map((tab) => (
                      <DashboardTabButton
                        key={tab.id}
                        tab={tab}
                        isActive={dashboardTab === tab.id}
                        onClick={changeDashboardTab}
                      />
                    ))}
                  </nav>
                </div>
              </>
            ) : (
              <>
                <div className={EYEBROW}>SRX ACCOUNT</div>
                <h1 className=" mt-4 text-[30px] font-semibold leading-tight tracking-[-0.04em] text-[#15110d] md:text-[36px]">
                  Rất nhiều đặc quyền và quyền lợi mua sắm đang chờ bạn
                </h1>
                <p className="mt-4 max-w-[520px] text-[15px] leading-7 text-[#5E6266]">
                  Bằng việc ấn nút đăng ký, bạn xác nhận là đã đọc và hiểu về chính sách bảo mật dữ liệu cá nhân của SRX.
                </p>

                <div className="mt-8 space-y-3">
                  {[
                    { icon: ShoppingBag, text: 'Quản lý thông tin tài khoản và lịch sử mua hàng tại một nơi.' },
                    { icon: PackageSearch, text: 'Theo dõi đơn hàng, trạng thái xử lý và cập nhật giao hàng.' },
                    { icon: ShieldCheck, text: 'Đổi mật khẩu và quản lý phiên đăng nhập bất cứ lúc nào.' },
                  ].map((item) => {
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
              </>
            )}
          </div>

          <div className={`${PANEL} p-5 md:p-7`}>
            {isLoading ? (
              <div className="flex min-h-[420px] items-center justify-center text-[15px] text-[#5E6266]">
                Đang tải thông tin tài khoản...
              </div>
            ) : user ? (
              renderDashboardContent()
            ) : (
              <>
                <AuthTabs value={authTab} onChange={changeAuthTab} />

                {authErrorMessage ? <AuthAlert className="mt-5">{authErrorMessage}</AuthAlert> : null}

                {authTab === 'login' ? (
                  <form onSubmit={onSubmitLogin} className="mt-7">
                    <h2 className="text-[26px] font-semibold tracking-[-0.03em] text-[#15110d] md:text-[28px]">
                      Đăng nhập
                    </h2>
                    <p className="mt-2 text-[14.5px] leading-7 text-[#5E6266]">
                      Nhập email hoặc số điện thoại đã đăng ký cùng mật khẩu để truy cập tài khoản.
                    </p>

                    {isGoogleAuthEnabled || isZaloQrLoginEnabled ? (
                      <div className="mt-6 space-y-5">
                        {/* Máy tính: hai nút nằm cùng một hàng; điện thoại: xếp dọc. */}
                        <div className="flex flex-col gap-3 sm:flex-row">
                          {isGoogleAuthEnabled ? <GoogleAuthButton className="sm:min-w-0 sm:flex-1" nextPath="/account" /> : null}
                          {isZaloQrLoginEnabled ? <ZaloQrLoginButton className="sm:min-w-0 sm:flex-1" nextPath="/account" /> : null}
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
                        error={loginForm.formState.errors.identifier?.message}
                        {...loginForm.register('identifier', {
                          required: 'Vui lòng nhập email hoặc số điện thoại.',
                        })}
                      />

                      <AuthPasswordField
                        label="Mật khẩu"
                        autoComplete="current-password"
                        placeholder="••••••••"
                        error={loginForm.formState.errors.password?.message}
                        trailing={
                          <Link
                            href="/forgot-password"
                            className="text-[13px] font-semibold text-[#15110d] underline-offset-4 hover:underline"
                          >
                            Quên mật khẩu?
                          </Link>
                        }
                        {...loginForm.register('password', {
                          required: 'Vui lòng nhập mật khẩu.',
                        })}
                      />
                    </div>

                    <AuthAlert className="mt-4">{loginError}</AuthAlert>

                    <AuthSubmitButton className="mt-6" isLoading={isLoggingIn} loadingLabel="Đang đăng nhập...">
                      Đăng nhập
                    </AuthSubmitButton>

                    <div className="mt-5 text-center text-[14px] text-[#5E6266]">
                      Chưa có tài khoản?{' '}
                      <button
                        type="button"
                        onClick={() => changeAuthTab('register')}
                        className="font-semibold text-[#15110d] underline-offset-4 hover:underline"
                      >
                        Đăng ký ngay
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={onSubmitRegister} className="mt-7">
                    <h2 className="text-[26px] font-semibold tracking-[-0.03em] text-[#15110d] md:text-[28px]">
                      Tạo tài khoản
                    </h2>
                    <p className="mt-2 text-[14.5px] leading-7 text-[#5E6266]">
                      Điền thông tin cơ bản để tạo tài khoản và đăng nhập ngay sau đó.
                    </p>

                    {isGoogleAuthEnabled || isZaloQrLoginEnabled ? (
                      <div className="mt-6 space-y-5">
                        <div className="flex flex-col gap-3 sm:flex-row">
                          {isGoogleAuthEnabled ? (
                            <GoogleAuthButton className="sm:min-w-0 sm:flex-1" label="Đăng ký với Google" nextPath="/account" />
                          ) : null}
                          {isZaloQrLoginEnabled ? (
                            <ZaloQrLoginButton className="sm:min-w-0 sm:flex-1" nextPath="/account" />
                          ) : null}
                        </div>
                        <AuthDivider />
                      </div>
                    ) : null}

                    <div className="mt-5 space-y-4">
                      <AuthField
                        label="Họ và tên"
                        type="text"
                        autoComplete="name"
                        placeholder="Nguyễn Văn A"
                        error={registerForm.formState.errors.fullName?.message}
                        {...registerForm.register('fullName', {
                          required: 'Vui lòng nhập họ tên.',
                          minLength: {
                            value: 2,
                            message: 'Họ tên quá ngắn.',
                          },
                        })}
                      />

                      <div className="grid gap-4 md:grid-cols-2">
                        <AuthField
                          label="Email"
                          type="email"
                          autoComplete="email"
                          placeholder="you@example.com"
                          error={registerForm.formState.errors.email?.message}
                          {...registerForm.register('email', {
                            required: 'Vui lòng nhập email.',
                          })}
                        />

                        <AuthField
                          label="Số điện thoại"
                          type="tel"
                          autoComplete="tel"
                          placeholder="0903 010 692"
                          {...registerForm.register('phone')}
                        />
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <AuthPasswordField
                          label="Mật khẩu"
                          autoComplete="new-password"
                          placeholder="••••••••"
                          hint="Tối thiểu 8 ký tự."
                          error={registerForm.formState.errors.password?.message}
                          {...registerForm.register('password', {
                            required: 'Vui lòng nhập mật khẩu.',
                            minLength: {
                              value: 8,
                              message: 'Mật khẩu phải từ 8 ký tự.',
                            },
                          })}
                        />

                        <AuthPasswordField
                          label="Xác nhận mật khẩu"
                          autoComplete="new-password"
                          placeholder="••••••••"
                          error={registerForm.formState.errors.confirmPassword?.message}
                          {...registerForm.register('confirmPassword', {
                            required: 'Vui lòng xác nhận mật khẩu.',
                            validate: (value) =>
                              value === registerPassword || 'Mật khẩu xác nhận không khớp.',
                          })}
                        />
                      </div>
                    </div>

                    <AuthAlert className="mt-4">{registerError}</AuthAlert>

                    <AuthSubmitButton className="mt-6" isLoading={isRegistering} loadingLabel="Đang tạo tài khoản...">
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

                    <div className="mt-4 text-center text-[14px] text-[#5E6266]">
                      Đã có tài khoản?{' '}
                      <button
                        type="button"
                        onClick={() => changeAuthTab('login')}
                        className="font-semibold text-[#15110d] underline-offset-4 hover:underline"
                      >
                        Đăng nhập
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
