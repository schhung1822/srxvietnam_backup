'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  LockKeyhole,
  LogOut,
  MapPin,
  PackageSearch,
  Pencil,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  UserRound,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const ADDRESS_LIMIT = 5;
const dashboardTabIds = ['profile', 'addresses', 'password', 'orders', 'logout'];

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
    id: 'addresses',
    label: 'Địa chỉ giao hàng',
    description: 'Thêm, sửa, xóa tối đa 5 địa chỉ giao hàng.',
    icon: MapPin,
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

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
});

const emptyAddressValues = {
  label: '',
  recipientName: '',
  recipientPhone: '',
  province: '',
  ward: '',
  addressLine: '',
  isDefault: false,
};

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
      return 'border-[#eadfce] bg-[#fcfaf8] text-[#7a6958]';
  }
}

function getFeedbackClass(type) {
  return type === 'success'
    ? 'border-[#d6e9da] bg-[#eef8f0] text-[#296d3b]'
    : 'border-[#efd3d3] bg-[#fff1f1] text-[#ad4040]';
}

function formatAddressPreview(address) {
  return [address.addressLine, address.ward, address.province]
    .filter(Boolean)
    .join(', ');
}

function DashboardTabButton({ isActive, tab, onClick }) {
  const Icon = tab.icon;

  return (
    <button
      type="button"
      onClick={() => onClick(tab.id)}
      className={`flex w-full items-start gap-4 rounded-[24px] border px-4 py-4 text-left transition ${
        isActive
          ? 'border-[#15110d] bg-[#15110d] text-white shadow-[0_20px_48px_rgba(21,17,13,0.12)]'
          : 'border-[#ece4da] bg-[#fcfaf8] text-[#15110d] hover:border-[#cabcae]'
      }`}
    >
      <div
        className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full ${
          isActive ? 'bg-white/14 text-white' : 'bg-white text-[#15110d]'
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <div className="text-[15px] font-semibold">{tab.label}</div>
        <div className={`mt-1 text-[13px] leading-6 ${isActive ? 'text-white/74' : 'text-[#6f6256]'}`}>
          {tab.description}
        </div>
      </div>
    </button>
  );
}

export default function AccountPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading, login, register: registerAccount, logout, refreshUser } = useAuth();
  const [authTab, setAuthTab] = useState(getTabFromSearch(searchParams));
  const [dashboardTab, setDashboardTab] = useState(getDashboardTabFromSearch(searchParams));
  const [loginError, setLoginError] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
  const [addressMessage, setAddressMessage] = useState({ type: '', text: '' });
  const [ordersError, setOrdersError] = useState('');
  const [addressesError, setAddressesError] = useState('');
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [addressLimit, setAddressLimit] = useState(ADDRESS_LIMIT);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [hasLoadedOrders, setHasLoadedOrders] = useState(false);
  const [hasLoadedAddresses, setHasLoadedAddresses] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [isDeletingAddressId, setIsDeletingAddressId] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const loginForm = useForm({
    defaultValues: {
      email: '',
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

  const addressForm = useForm({
    defaultValues: emptyAddressValues,
  });

  const registerPassword = registerForm.watch('password');
  const newPassword = passwordForm.watch('newPassword');

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
      addressForm.reset(emptyAddressValues);
      setEditingAddressId(null);
      setOrders([]);
      setAddresses([]);
      setAddressLimit(ADDRESS_LIMIT);
      setHasLoadedOrders(false);
      setHasLoadedAddresses(false);
      return;
    }

    profileForm.reset({
      fullName: user.fullName ?? '',
      displayName: user.displayName ?? '',
      email: user.email ?? '',
      phone: user.phone ?? '',
    });
  }, [addressForm, passwordForm, profileForm, user]);

  useEffect(() => {
    setDashboardTab(getDashboardTabFromSearch(searchParams));
    setProfileMessage({ type: '', text: '' });
    setPasswordMessage({ type: '', text: '' });
    setAddressMessage({ type: '', text: '' });
    setOrdersError('');
    setAddressesError('');
    setOrders([]);
    setAddresses([]);
    setAddressLimit(ADDRESS_LIMIT);
    setEditingAddressId(null);
    setHasLoadedOrders(false);
    setHasLoadedAddresses(false);
  }, [searchParams, user?.id]);

  useEffect(() => {
    if (!user || dashboardTab !== 'orders' || hasLoadedOrders || isLoadingOrders) {
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
  }, [dashboardTab, hasLoadedOrders, isLoadingOrders, user]);

  useEffect(() => {
    if (!user || dashboardTab !== 'addresses' || hasLoadedAddresses || isLoadingAddresses) {
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
          throw new Error(data.message ?? 'Không thể tải danh sách địa chỉ giao hàng.');
        }

        if (!isCancelled) {
          setAddresses(Array.isArray(data.addresses) ? data.addresses : []);
          setAddressLimit(Number(data.limit ?? ADDRESS_LIMIT));
          setHasLoadedAddresses(true);
        }
      } catch (error) {
        if (!isCancelled) {
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
  }, [dashboardTab, hasLoadedAddresses, isLoadingAddresses, user]);

  const resetAddressForm = (values = emptyAddressValues) => {
    addressForm.reset(values);
    setEditingAddressId(null);
  };

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

  const onSubmitAddress = addressForm.handleSubmit(async (values) => {
    try {
      setIsSavingAddress(true);
      setAddressMessage({ type: '', text: '' });
      setAddressesError('');

      const method = editingAddressId ? 'PATCH' : 'POST';
      const endpoint = editingAddressId
        ? `/api/account/addresses/${editingAddressId}`
        : '/api/account/addresses';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await parseJson(response);

      if (!response.ok) {
        throw new Error(data.message ?? 'Không thể lưu địa chỉ giao hàng.');
      }

      setAddresses(Array.isArray(data.addresses) ? data.addresses : []);
      setAddressLimit(Number(data.limit ?? addressLimit));
      setHasLoadedAddresses(true);
      setEditingAddressId(null);
      addressForm.reset({
        ...emptyAddressValues,
        isDefault: false,
      });
      setAddressMessage({
        type: 'success',
        text: data.message ?? 'Đã lưu địa chỉ giao hàng.',
      });
    } catch (error) {
      setAddressMessage({
        type: 'error',
        text: error.message,
      });
    } finally {
      setIsSavingAddress(false);
    }
  });

  const handleEditAddress = (address) => {
    setEditingAddressId(address.id);
    setAddressMessage({ type: '', text: '' });
    addressForm.reset({
      label: address.label ?? '',
      recipientName: address.recipientName ?? '',
      recipientPhone: address.recipientPhone ?? '',
      province: address.province ?? '',
      ward: address.ward ?? '',
      addressLine: address.addressLine ?? '',
      isDefault: Boolean(address.isDefault),
    });
  };

  const handleStartNewAddress = () => {
    setEditingAddressId(null);
    setAddressMessage({ type: '', text: '' });
    addressForm.reset({
      ...emptyAddressValues,
      isDefault: addresses.length === 0,
    });
  };

  const handleDeleteAddress = async (address) => {
    if (!window.confirm(`Xóa địa chỉ "${address.label || address.recipientName}"?`)) {
      return;
    }

    try {
      setIsDeletingAddressId(address.id);
      setAddressMessage({ type: '', text: '' });
      setAddressesError('');

      const response = await fetch(`/api/account/addresses/${address.id}`, {
        method: 'DELETE',
      });
      const data = await parseJson(response);

      if (!response.ok) {
        throw new Error(data.message ?? 'Không thể xóa địa chỉ giao hàng.');
      }

      setAddresses(Array.isArray(data.addresses) ? data.addresses : []);
      setHasLoadedAddresses(true);

      if (editingAddressId === address.id) {
        resetAddressForm({
          ...emptyAddressValues,
          isDefault: (data.addresses ?? []).length === 0,
        });
      }

      setAddressMessage({
        type: 'success',
        text: data.message ?? 'Đã xóa địa chỉ giao hàng.',
      });
    } catch (error) {
      setAddressMessage({
        type: 'error',
        text: error.message,
      });
    } finally {
      setIsDeletingAddressId(null);
    }
  };

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
          <div className="inline-flex rounded-full border border-[#e8dfd3] bg-[#fcfaf8] px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.22em] text-[#8d7f72]">
            Thông tin tài khoản
          </div>
          <h2 className="mt-5 text-[30px] font-semibold tracking-[-0.04em] text-[#15110d] md:text-[34px]">
            Cập nhật hồ sơ cá nhân
          </h2>
          <p className="mt-3 max-w-[620px] text-[15px] leading-7 text-[#665a4e]">
            Có thể sửa thông tin tài khoản tại đây để đồng bộ dữ liệu mua hàng và liên hệ.
          </p>

          <form onSubmit={onSubmitProfile} className="mt-8 space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-[14px] font-medium text-[#3e342b]">Họ và tên</label>
                <input
                  type="text"
                  {...profileForm.register('fullName', {
                    required: 'Vui lòng nhập họ và tên.',
                    minLength: {
                      value: 2,
                      message: 'Họ và tên quá ngắn.',
                    },
                  })}
                  className="w-full rounded-[18px] border border-[#ddd3c6] bg-[#fcfaf8] px-4 py-3.5 text-[15px] outline-none transition focus:border-[#15110d]"
                  placeholder="Nguyễn Văn A"
                />
                {profileForm.formState.errors.fullName ? (
                  <div className="mt-2 text-[13px] text-red-600">
                    {profileForm.formState.errors.fullName.message}
                  </div>
                ) : null}
              </div>

              <div>
                <label className="mb-2 block text-[14px] font-medium text-[#3e342b]">Tên hiển thị</label>
                <input
                  type="text"
                  {...profileForm.register('displayName')}
                  className="w-full rounded-[18px] border border-[#ddd3c6] bg-[#fcfaf8] px-4 py-3.5 text-[15px] outline-none transition focus:border-[#15110d]"
                  placeholder="Tên hiển thị trên tài khoản"
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-[14px] font-medium text-[#3e342b]">Email</label>
                <input
                  type="email"
                  {...profileForm.register('email', {
                    required: 'Vui lòng nhập email.',
                  })}
                  className="w-full rounded-[18px] border border-[#ddd3c6] bg-[#fcfaf8] px-4 py-3.5 text-[15px] outline-none transition focus:border-[#15110d]"
                  placeholder="you@example.com"
                />
                {profileForm.formState.errors.email ? (
                  <div className="mt-2 text-[13px] text-red-600">
                    {profileForm.formState.errors.email.message}
                  </div>
                ) : null}
              </div>

              <div>
                <label className="mb-2 block text-[14px] font-medium text-[#3e342b]">Số điện thoại</label>
                <input
                  type="tel"
                  {...profileForm.register('phone')}
                  className="w-full rounded-[18px] border border-[#ddd3c6] bg-[#fcfaf8] px-4 py-3.5 text-[15px] outline-none transition focus:border-[#15110d]"
                  placeholder="0903 010 692"
                />
              </div>
            </div>

            {profileMessage.text ? (
              <div className={`rounded-[18px] border px-4 py-3 text-[14px] ${getFeedbackClass(profileMessage.type)}`}>
                {profileMessage.text}
              </div>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={isSavingProfile}
                className="inline-flex items-center justify-center rounded-full bg-[#15110d] px-6 py-3.5 text-[15px] font-semibold text-white transition hover:bg-[#2b2520] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSavingProfile ? 'Đang lưu...' : 'Lưu thông tin'}
              </button>
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
                className="inline-flex items-center justify-center rounded-full border border-[#15110d] px-6 py-3.5 text-[15px] font-semibold text-[#15110d] transition hover:bg-[#15110d] hover:text-white"
              >
                Khôi phục dữ liệu hiện tại
              </button>
            </div>
          </form>
        </div>
      );
    }

    if (dashboardTab === 'addresses') {
      const canAddMoreAddresses = addresses.length < addressLimit;

      return (
        <div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="inline-flex rounded-full border border-[#e8dfd3] bg-[#fcfaf8] px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.22em] text-[#8d7f72]">
                Địa chỉ giao hàng
              </div>
              <h2 className="mt-5 text-[30px] font-semibold tracking-[-0.04em] text-[#15110d] md:text-[34px]">
                Quản lý địa chỉ nhận hàng
              </h2>
            </div>

            <button
              type="button"
              onClick={handleStartNewAddress}
              disabled={!canAddMoreAddresses && !editingAddressId}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#15110d] px-5 py-3 text-[14px] font-semibold text-[#15110d] transition hover:bg-[#15110d] hover:text-white disabled:cursor-not-allowed disabled:border-[#d9cec2] disabled:text-[#a09080] disabled:hover:bg-transparent"
            >
              <Plus className="h-4 w-4" />
              <span>{editingAddressId ? 'Tạo địa chỉ mới' : 'Thêm địa chỉ'}</span>
            </button>
          </div>

          <div className="mt-8 grid gap-6">
            <div className="rounded-[28px] border border-[#ece4da] bg-[#fcfaf8] p-5 md:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-[18px] font-semibold text-[#15110d]">Danh sách địa chỉ</div>
                </div>
                <span className="rounded-full border border-[#e0d5c8] bg-white px-3 py-1.5 text-[12px] font-medium text-[#665a4e]">
                  {addresses.length}/{addressLimit}
                </span>
              </div>

              {isLoadingAddresses ? (
                <div className="mt-6 rounded-[22px] border border-[#ece4da] bg-white px-5 py-10 text-center text-[15px] text-[#665a4e]">
                  Đang tải địa chỉ giao hàng...
                </div>
              ) : addresses.length ? (
                <div className="mt-6 space-y-4">
                  {addresses.map((address) => (
                    <article
                      key={address.id}
                      className="rounded-[24px] border border-[#ece4da] bg-white p-5"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="text-[18px] font-semibold text-[#15110d]">
                              {address.label || 'Địa chỉ giao hàng'}
                            </div>
                            {address.isDefault ? (
                              <span className="rounded-full border border-[#dbe3ff] bg-[#eef2ff] px-3 py-1 text-[12px] font-semibold text-[#2b4eff]">
                                Mặc định
                              </span>
                            ) : null}
                          </div>
                          <div className="mt-3 text-[15px] font-medium text-[#15110d]">
                            {address.recipientName} • {address.recipientPhone}
                          </div>
                          <div className="mt-2 text-[14px] leading-7 text-[#665a4e]">
                            {formatAddressPreview(address)}
                          </div>
                        </div>

                        <div className="flex shrink-0 gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditAddress(address)}
                            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#15110d] px-4 py-2.5 text-[13px] font-semibold text-[#15110d] transition hover:bg-[#15110d] hover:text-white"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            <span>Sửa</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteAddress(address)}
                            disabled={isDeletingAddressId === address.id}
                            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#d84d4d] px-4 py-2.5 text-[13px] font-semibold text-[#d84d4d] transition hover:bg-[#d84d4d] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>{isDeletingAddressId === address.id ? 'Đang xóa...' : 'Xóa'}</span>
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-[22px] border border-dashed border-[#d8c8b6] bg-white px-6 py-12 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#15110d] text-white">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-[24px] font-semibold text-[#15110d]">Chưa có địa chỉ giao hàng</h3>
                  <p className="mt-3 text-[15px] leading-7 text-[#665a4e]">
                    Hãy thêm địa chỉ nhận hàng đầu tiên để tiện dùng khi mua sắm.
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-[28px] border border-[#ece4da] bg-[#fcfaf8] p-5 md:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-[18px] font-semibold text-[#15110d]">
                    {editingAddressId ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
                  </div>
                  <div className="mt-1 text-[14px] text-[#665a4e]">
                    {addresses.length}/{addressLimit} địa chỉ đang lưu
                  </div>
                </div>
                {!editingAddressId && addresses.length ? (
                  <span className="rounded-full border border-[#e0d5c8] bg-white px-3 py-1.5 text-[12px] font-medium text-[#665a4e]">
                    {canAddMoreAddresses ? 'Có thể thêm mới' : 'Đã đạt giới hạn'}
                  </span>
                ) : null}
              </div>

              <form onSubmit={onSubmitAddress} className="mt-6 space-y-4">
                <div>
                  <label className="mb-2 block text-[14px] font-medium text-[#3e342b]">Nhãn địa chỉ</label>
                  <input
                    type="text"
                    {...addressForm.register('label')}
                    className="w-full rounded-[18px] border border-[#ddd3c6] bg-white px-4 py-3.5 text-[15px] outline-none transition focus:border-[#15110d]"
                    placeholder="Nhà riêng, Văn phòng..."
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-[14px] font-medium text-[#3e342b]">Người nhận</label>
                    <input
                      type="text"
                      {...addressForm.register('recipientName', {
                        required: 'Vui lòng nhập tên người nhận.',
                        minLength: {
                          value: 2,
                          message: 'Tên người nhận quá ngắn.',
                        },
                      })}
                      className="w-full rounded-[18px] border border-[#ddd3c6] bg-white px-4 py-3.5 text-[15px] outline-none transition focus:border-[#15110d]"
                      placeholder="Nguyễn Văn A"
                    />
                    {addressForm.formState.errors.recipientName ? (
                      <div className="mt-2 text-[13px] text-red-600">
                        {addressForm.formState.errors.recipientName.message}
                      </div>
                    ) : null}
                  </div>

                  <div>
                    <label className="mb-2 block text-[14px] font-medium text-[#3e342b]">Số điện thoại</label>
                    <input
                      type="tel"
                      {...addressForm.register('recipientPhone', {
                        required: 'Vui lòng nhập số điện thoại.',
                        minLength: {
                          value: 8,
                          message: 'Số điện thoại chưa hợp lệ.',
                        },
                      })}
                      className="w-full rounded-[18px] border border-[#ddd3c6] bg-white px-4 py-3.5 text-[15px] outline-none transition focus:border-[#15110d]"
                      placeholder="0903 010 692"
                    />
                    {addressForm.formState.errors.recipientPhone ? (
                      <div className="mt-2 text-[13px] text-red-600">
                        {addressForm.formState.errors.recipientPhone.message}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-[14px] font-medium text-[#3e342b]">Tỉnh / Thành phố</label>
                    <input
                      type="text"
                      {...addressForm.register('province', {
                        required: 'Vui lòng nhập tỉnh / thành phố.',
                      })}
                      className="w-full rounded-[18px] border border-[#ddd3c6] bg-white px-4 py-3.5 text-[15px] outline-none transition focus:border-[#15110d]"
                      placeholder="TP. Hồ Chí Minh"
                    />
                    {addressForm.formState.errors.province ? (
                      <div className="mt-2 text-[13px] text-red-600">
                        {addressForm.formState.errors.province.message}
                      </div>
                    ) : null}
                  </div>

                  <div>
                    <label className="mb-2 block text-[14px] font-medium text-[#3e342b]">Phường / Xã</label>
                    <input
                      type="text"
                      {...addressForm.register('ward')}
                      className="w-full rounded-[18px] border border-[#ddd3c6] bg-white px-4 py-3.5 text-[15px] outline-none transition focus:border-[#15110d]"
                      placeholder="Phường Võ Thị Sáu"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-[14px] font-medium text-[#3e342b]">Địa chỉ chi tiết</label>
                  <textarea
                    {...addressForm.register('addressLine', {
                      required: 'Vui lòng nhập địa chỉ chi tiết.',
                      minLength: {
                        value: 6,
                        message: 'Địa chỉ chi tiết quá ngắn.',
                      },
                    })}
                    rows={4}
                    className="w-full rounded-[18px] border border-[#ddd3c6] bg-white px-4 py-3.5 text-[15px] outline-none transition focus:border-[#15110d]"
                    placeholder="Số nhà, tên đường, tòa nhà..."
                  />
                  {addressForm.formState.errors.addressLine ? (
                    <div className="mt-2 text-[13px] text-red-600">
                      {addressForm.formState.errors.addressLine.message}
                    </div>
                  ) : null}
                </div>

                <label className="flex items-center gap-3 rounded-[18px] border border-[#e5ddd2] bg-white px-4 py-3 text-[14px] text-[#3e342b]">
                  <input
                    type="checkbox"
                    {...addressForm.register('isDefault')}
                    className="h-4 w-4 rounded border-[#cfc2b4] text-[#15110d] focus:ring-[#15110d]"
                  />
                  <span>Đặt làm địa chỉ mặc định</span>
                </label>

                {addressMessage.text ? (
                  <div className={`rounded-[18px] border px-4 py-3 text-[14px] ${getFeedbackClass(addressMessage.type)}`}>
                    {addressMessage.text}
                  </div>
                ) : null}

                {addressesError ? (
                  <div className="rounded-[18px] border border-[#efd3d3] bg-[#fff1f1] px-4 py-3 text-[14px] text-[#ad4040]">
                    {addressesError}
                  </div>
                ) : null}

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="submit"
                    disabled={isSavingAddress || (!editingAddressId && !canAddMoreAddresses)}
                    className="inline-flex items-center justify-center rounded-full bg-[#15110d] px-6 py-3.5 text-[15px] font-semibold text-white transition hover:bg-[#2b2520] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSavingAddress
                      ? 'Đang lưu...'
                      : editingAddressId
                        ? 'Cập nhật địa chỉ'
                        : 'Lưu địa chỉ'}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      resetAddressForm({
                        ...emptyAddressValues,
                        isDefault: addresses.length === 0,
                      })
                    }
                    className="inline-flex items-center justify-center rounded-full border border-[#15110d] px-6 py-3.5 text-[15px] font-semibold text-[#15110d] transition hover:bg-[#15110d] hover:text-white"
                  >
                    {editingAddressId ? 'Hủy chỉnh sửa' : 'Làm mới biểu mẫu'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      );
    }

    if (dashboardTab === 'password') {
      return (
        <div>
          <div className="inline-flex rounded-full border border-[#e8dfd3] bg-[#fcfaf8] px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.22em] text-[#8d7f72]">
            Đổi mật khẩu
          </div>
          <h2 className="mt-5 text-[30px] font-semibold tracking-[-0.04em] text-[#15110d] md:text-[34px]">
            Cập nhật mật khẩu đăng nhập
          </h2>
          <p className="mt-3 max-w-[620px] text-[15px] leading-7 text-[#665a4e]">
            Nên sử dụng mật khẩu có ít nhất 8 ký tự và khác với mật khẩu cũ để tăng bảo mật.
          </p>

          <form onSubmit={onSubmitPassword} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-[14px] font-medium text-[#3e342b]">Mật khẩu hiện tại</label>
              <input
                type="password"
                {...passwordForm.register('currentPassword', {
                  required: 'Vui lòng nhập mật khẩu hiện tại.',
                })}
                className="w-full rounded-[18px] border border-[#ddd3c6] bg-[#fcfaf8] px-4 py-3.5 text-[15px] outline-none transition focus:border-[#15110d]"
                placeholder="••••••••"
              />
              {passwordForm.formState.errors.currentPassword ? (
                <div className="mt-2 text-[13px] text-red-600">
                  {passwordForm.formState.errors.currentPassword.message}
                </div>
              ) : null}
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-[14px] font-medium text-[#3e342b]">Mật khẩu mới</label>
                <input
                  type="password"
                  {...passwordForm.register('newPassword', {
                    required: 'Vui lòng nhập mật khẩu mới.',
                    minLength: {
                      value: 8,
                      message: 'Mật khẩu mới phải từ 8 ký tự.',
                    },
                  })}
                  className="w-full rounded-[18px] border border-[#ddd3c6] bg-[#fcfaf8] px-4 py-3.5 text-[15px] outline-none transition focus:border-[#15110d]"
                  placeholder="••••••••"
                />
                {passwordForm.formState.errors.newPassword ? (
                  <div className="mt-2 text-[13px] text-red-600">
                    {passwordForm.formState.errors.newPassword.message}
                  </div>
                ) : null}
              </div>

              <div>
                <label className="mb-2 block text-[14px] font-medium text-[#3e342b]">Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  {...passwordForm.register('confirmPassword', {
                    required: 'Vui lòng xác nhận mật khẩu mới.',
                    validate: (value) => value === newPassword || 'Mật khẩu xác nhận không khớp.',
                  })}
                  className="w-full rounded-[18px] border border-[#ddd3c6] bg-[#fcfaf8] px-4 py-3.5 text-[15px] outline-none transition focus:border-[#15110d]"
                  placeholder="••••••••"
                />
                {passwordForm.formState.errors.confirmPassword ? (
                  <div className="mt-2 text-[13px] text-red-600">
                    {passwordForm.formState.errors.confirmPassword.message}
                  </div>
                ) : null}
              </div>
            </div>

            {passwordMessage.text ? (
              <div className={`rounded-[18px] border px-4 py-3 text-[14px] ${getFeedbackClass(passwordMessage.type)}`}>
                {passwordMessage.text}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isChangingPassword}
              className="inline-flex items-center justify-center rounded-full bg-[#15110d] px-6 py-3.5 text-[15px] font-semibold text-white transition hover:bg-[#2b2520] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isChangingPassword ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
            </button>
          </form>
        </div>
      );
    }

    if (dashboardTab === 'orders') {
      return (
        <div>
          <div className="inline-flex rounded-full border border-[#e8dfd3] bg-[#fcfaf8] px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.22em] text-[#8d7f72]">
            Đơn hàng
          </div>
          <h2 className="mt-5 text-[30px] font-semibold tracking-[-0.04em] text-[#15110d] md:text-[34px]">
            Theo dõi các đơn hàng của tài khoản
          </h2>
          <p className="mt-3 max-w-[620px] text-[15px] leading-7 text-[#665a4e]">
            Danh sách dưới đây hiển thị các đơn hàng gần nhất đã gắn với tài khoản hiện tại.
          </p>

          {isLoadingOrders ? (
            <div className="mt-8 rounded-[24px] border border-[#ece4da] bg-[#fcfaf8] px-5 py-10 text-center text-[15px] text-[#665a4e]">
              Đang tải danh sách đơn hàng...
            </div>
          ) : ordersError ? (
            <div className="mt-8 rounded-[24px] border border-[#efd3d3] bg-[#fff1f1] px-5 py-4 text-[14px] text-[#ad4040]">
              {ordersError}
            </div>
          ) : orders.length ? (
            <div className="mt-8 space-y-4">
              {orders.map((order) => (
                <article
                  key={order.id}
                  className="rounded-[28px] border border-[#ece4da] bg-[#fcfaf8] p-5 md:p-6"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#8d7f72]">
                        Mã đơn hàng
                      </div>
                      <div className="mt-2 text-[24px] font-semibold tracking-[-0.03em] text-[#15110d]">
                        #{order.orderNumber}
                      </div>
                        <div className="font-['Inter',_sans-serif] mt-3 text-[14px] text-[#665a4e]">
                          Đặt ngày{' '}
                          {new Intl.DateTimeFormat('vi-VN', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          }).format(new Date(order.placedAt))}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1.5 text-[13px] font-medium ${getOrderStatusClass(
                          order.orderStatus,
                        )}`}
                      >
                        {orderStatusLabels[order.orderStatus] ?? order.orderStatus}
                      </span>
                      <span className="inline-flex rounded-full border border-[#eadfce] bg-white px-3 py-1.5 text-[13px] font-medium text-[#665a4e]">
                        {paymentStatusLabels[order.paymentStatus] ?? order.paymentStatus}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-3">
                    <div className="rounded-[20px] border border-[#ece4da] bg-white p-4">
                      <div className="text-[12px] uppercase tracking-[0.18em] text-[#8d7f72]">Tổng thanh toán</div>
                      <div className="font-['Inter',_sans-serif] mt-2 text-[20px] font-semibold text-[#15110d]">
                        {currencyFormatter.format(order.grandTotal)}
                      </div>
                    </div>
                    <div className="rounded-[20px] border border-[#ece4da] bg-white p-4">
                      <div className="text-[12px] uppercase tracking-[0.18em] text-[#8d7f72]">Số dòng sản phẩm</div>
                      <div className="mt-2 text-[20px] font-semibold text-[#15110d]">{order.totalItems}</div>
                    </div>
                    <div className="rounded-[20px] border border-[#ece4da] bg-white p-4">
                      <div className="text-[12px] uppercase tracking-[0.18em] text-[#8d7f72]">Tổng số lượng</div>
                      <div className="mt-2 text-[20px] font-semibold text-[#15110d]">{order.totalQuantity}</div>
                    </div>
                  </div>

                  <div className="mt-5 rounded-[22px] border border-[#ece4da] bg-white p-4">
                    <div className="text-[12px] uppercase tracking-[0.18em] text-[#8d7f72]">Sản phẩm trong đơn</div>
                    <div className="mt-3 space-y-2">
                      {order.items.length ? (
                        order.items.slice(0, 4).map((item, index) => (
                          <div
                            key={`${order.id}-${index}`}
                            className="flex items-start justify-between gap-4 text-[14px] text-[#3f342b]"
                          >
                            <div className="min-w-0">
                              <div className="font-medium text-[#15110d]">{item.productName}</div>
                              {item.variantName ? (
                                <div className="mt-1 text-[13px] text-[#7c6f63]">{item.variantName}</div>
                              ) : null}
                            </div>
                            <div className="flex-shrink-0 text-[#665a4e]">x{item.quantity}</div>
                          </div>
                        ))
                      ) : (
                        <div className="text-[14px] text-[#665a4e]">Đơn hàng chưa có dòng sản phẩm chi tiết.</div>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-[24px] border border-dashed border-[#d8c8b6] bg-[#fcfaf8] px-6 py-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#15110d] text-white">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-[24px] font-semibold text-[#15110d]">Chưa có đơn hàng nào</h3>
              <p className="mt-3 text-[15px] leading-7 text-[#665a4e]">
                Khi tài khoản phát sinh đơn mua hàng, bạn sẽ theo dõi được trạng thái ngay tại đây.
              </p>
              <Link
                href="/products"
                className="mt-6 inline-flex items-center justify-center rounded-full bg-[#15110d] px-6 py-3.5 text-[15px] font-semibold text-white transition hover:bg-[#2b2520]"
              >
                Tiếp tục mua sắm
              </Link>
            </div>
          )}
        </div>
      );
    }

    return (
      <div>
        <div className="inline-flex rounded-full border border-[#e8dfd3] bg-[#fcfaf8] px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.22em] text-[#8d7f72]">
          Đăng xuất
        </div>
        <h2 className="mt-5 text-[30px] font-semibold tracking-[-0.04em] text-[#15110d] md:text-[34px]">
          Kết thúc phiên đăng nhập hiện tại
        </h2>
        <p className="mt-3 max-w-[620px] text-[15px] leading-7 text-[#665a4e]">
          Bạn có thể đăng xuất khỏi tài khoản trên thiết bị này bất cứ lúc nào. Sau khi đăng xuất, hệ thống sẽ yêu cầu đăng nhập lại để truy cập dashboard tài khoản.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-full bg-[#15110d] px-6 py-3.5 text-[15px] font-semibold text-white transition hover:bg-[#2b2520]"
          >
            Tiếp tục mua sắm
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#15110d] px-6 py-3.5 text-[15px] font-semibold text-[#15110d] transition hover:bg-[#15110d] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogOut className="h-4 w-4" />
            <span>{isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <section className="bg-[#f9f9f9] py-12 md:py-20">
      <div className="mx-auto max-w-[1280px] px-4 md:px-6">
        <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="hidden md:block rounded-[32px] border border-[#ece4da] bg-white p-7 md:p-9">
            <div className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#8d7f72]">
              SRX ACCOUNT
            </div>

            {user ? (
              <>
                <h1 className="mt-4 text-[30px] font-semibold leading-tight tracking-[-0.04em] text-[#15110d] md:text-[36px]">
                  Xin chào {user.fullName || user.email}
                </h1>
                <p className="mt-5 max-w-[520px] text-[16px] leading-8 text-[#665a4e]">
                  Chào mừng bạn quay lại. Tại đây bạn có thể cập nhật hồ sơ, quản lý địa chỉ giao hàng, đổi mật khẩu, theo dõi đơn hàng và đăng xuất khỏi phiên hiện tại.
                </p>

                <div className="mt-8 space-y-3">
                  {dashboardTabs.map((tab) => (
                    <DashboardTabButton
                      key={tab.id}
                      tab={tab}
                      isActive={dashboardTab === tab.id}
                      onClick={changeDashboardTab}
                    />
                  ))}
                </div>
              </>
            ) : (
              <>
                <h1 className=" mt-4 text-[30px] font-semibold leading-tight tracking-[-0.04em] text-[#15110d] md:text-[36px]">
                  Rất nhiều đặc quyền và quyền lợi mua sắm đang chờ bạn
                </h1>
                <p className="mt-5 max-w-[520px] text-[16px] leading-8 text-[#665a4e]">
                  Bằng việc ấn nút đăng ký, bạn xác nhận là đã đọc và hiểu về chính sách bảo mật dữ liệu cá nhân của SRX.
                </p>

                <div className="mt-8 space-y-3 text-[15px] text-[#665a4e]">
                  <div>• Quản lý thông tin tài khoản và lịch sử mua hàng tại một nơi.</div>
                  <div>• Theo dõi đơn hàng, trạng thái xử lý và cập nhật giao hàng.</div>
                  <div>• Lưu địa chỉ giao hàng, đổi mật khẩu và đăng xuất nhanh khi cần.</div>
                </div>
              </>
            )}
          </div>

          <div className="rounded-[32px] border border-[#ece4da] bg-white p-6 md:p-8">
            {isLoading ? (
              <div className="flex min-h-[420px] items-center justify-center text-[15px] text-[#665a4e]">
                Đang tải thông tin tài khoản...
              </div>
            ) : user ? (
              renderDashboardContent()
            ) : (
              <>
                <div className="inline-flex rounded-full border border-[#e8dfd3] bg-[#fcfaf8] p-1">
                  <button
                    type="button"
                    onClick={() => changeAuthTab('login')}
                    className={`rounded-full px-5 py-2.5 text-[14px] font-semibold transition ${
                      authTab === 'login'
                        ? 'bg-[#15110d] text-white'
                        : 'text-[#665a4e] hover:text-[#15110d]'
                    }`}
                  >
                    Đăng nhập
                  </button>
                  <button
                    type="button"
                    onClick={() => changeAuthTab('register')}
                    className={`rounded-full px-5 py-2.5 text-[14px] font-semibold transition ${
                      authTab === 'register'
                        ? 'bg-[#15110d] text-white'
                        : 'text-[#665a4e] hover:text-[#15110d]'
                    }`}
                  >
                    Đăng ký
                  </button>
                </div>

                {authTab === 'login' ? (
                  <form onSubmit={onSubmitLogin} className="mt-8">
                    <div className="text-[30px] font-semibold tracking-[-0.04em] text-[#15110d]">
                      Đăng nhập
                    </div>
                    <p className="mt-3 text-[15px] leading-7 text-[#665a4e]">
                      Nhập email và mật khẩu đã đăng ký để truy cập tài khoản.
                    </p>

                    <div className="mt-6 space-y-5">
                      <div>
                        <label className="mb-2 block text-[14px] font-medium text-[#3e342b]">
                          Email
                        </label>
                        <input
                          type="email"
                          {...loginForm.register('email', {
                            required: 'Vui lòng nhập email.',
                          })}
                          className="w-full rounded-[18px] border border-[#ddd3c6] bg-[#fcfaf8] px-4 py-3.5 text-[15px] outline-none transition focus:border-[#15110d]"
                          placeholder="you@example.com"
                        />
                        {loginForm.formState.errors.email ? (
                          <div className="mt-2 text-[13px] text-red-600">
                            {loginForm.formState.errors.email.message}
                          </div>
                        ) : null}
                      </div>

                      <div>
                        <label className="mb-2 block text-[14px] font-medium text-[#3e342b]">
                          Mật khẩu
                        </label>
                        <input
                          type="password"
                          {...loginForm.register('password', {
                            required: 'Vui lòng nhập mật khẩu.',
                          })}
                          className="w-full rounded-[18px] border border-[#ddd3c6] bg-[#fcfaf8] px-4 py-3.5 text-[15px] outline-none transition focus:border-[#15110d]"
                          placeholder="••••••••"
                        />
                        {loginForm.formState.errors.password ? (
                          <div className="mt-2 text-[13px] text-red-600">
                            {loginForm.formState.errors.password.message}
                          </div>
                        ) : null}

                        <div className="mt-3 text-right text-[14px]">
                          <Link href="/forgot-password" className="font-semibold text-[#15110d]">
                            Quên mật khẩu?
                          </Link>
                        </div>
                      </div>
                    </div>

                    {loginError ? <div className="mt-4 text-[14px] text-red-600">{loginError}</div> : null}

                    <button
                      type="submit"
                      disabled={isLoggingIn}
                      className="mt-6 w-full rounded-full bg-[#15110d] px-6 py-4 text-[15px] font-semibold text-white transition hover:bg-[#2b2520] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isLoggingIn ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={onSubmitRegister} className="mt-8">
                    <div className="text-[30px] font-semibold tracking-[-0.04em] text-[#15110d]">
                      Tạo tài khoản
                    </div>
                    <p className="mt-3 text-[15px] leading-7 text-[#665a4e]">
                      Điền thông tin cơ bản để tạo tài khoản và đăng nhập ngay sau đó.
                    </p>

                    <div className="mt-6 space-y-5">
                      <div>
                        <label className="mb-2 block text-[14px] font-medium text-[#3e342b]">
                          Họ và tên
                        </label>
                        <input
                          type="text"
                          {...registerForm.register('fullName', {
                            required: 'Vui lòng nhập họ tên.',
                            minLength: {
                              value: 2,
                              message: 'Họ tên quá ngắn.',
                            },
                          })}
                          className="w-full rounded-[18px] border border-[#ddd3c6] bg-[#fcfaf8] px-4 py-3.5 text-[15px] outline-none transition focus:border-[#15110d]"
                          placeholder="Nguyễn Văn A"
                        />
                        {registerForm.formState.errors.fullName ? (
                          <div className="mt-2 text-[13px] text-red-600">
                            {registerForm.formState.errors.fullName.message}
                          </div>
                        ) : null}
                      </div>

                      <div className="grid gap-5 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-[14px] font-medium text-[#3e342b]">
                            Email
                          </label>
                          <input
                            type="email"
                            {...registerForm.register('email', {
                              required: 'Vui lòng nhập email.',
                            })}
                            className="w-full rounded-[18px] border border-[#ddd3c6] bg-[#fcfaf8] px-4 py-3.5 text-[15px] outline-none transition focus:border-[#15110d]"
                            placeholder="you@example.com"
                          />
                          {registerForm.formState.errors.email ? (
                            <div className="mt-2 text-[13px] text-red-600">
                              {registerForm.formState.errors.email.message}
                            </div>
                          ) : null}
                        </div>

                        <div>
                          <label className="mb-2 block text-[14px] font-medium text-[#3e342b]">
                            Số điện thoại
                          </label>
                          <input
                            type="tel"
                            {...registerForm.register('phone')}
                            className="w-full rounded-[18px] border border-[#ddd3c6] bg-[#fcfaf8] px-4 py-3.5 text-[15px] outline-none transition focus:border-[#15110d]"
                            placeholder="0903 010 692"
                          />
                        </div>
                      </div>

                      <div className="grid gap-5 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-[14px] font-medium text-[#3e342b]">
                            Mật khẩu
                          </label>
                          <input
                            type="password"
                            {...registerForm.register('password', {
                              required: 'Vui lòng nhập mật khẩu.',
                              minLength: {
                                value: 8,
                                message: 'Mật khẩu phải từ 8 ký tự.',
                              },
                            })}
                            className="w-full rounded-[18px] border border-[#ddd3c6] bg-[#fcfaf8] px-4 py-3.5 text-[15px] outline-none transition focus:border-[#15110d]"
                            placeholder="••••••••"
                          />
                          {registerForm.formState.errors.password ? (
                            <div className="mt-2 text-[13px] text-red-600">
                              {registerForm.formState.errors.password.message}
                            </div>
                          ) : null}
                        </div>

                        <div>
                          <label className="mb-2 block text-[14px] font-medium text-[#3e342b]">
                            Xác nhận mật khẩu
                          </label>
                          <input
                            type="password"
                            {...registerForm.register('confirmPassword', {
                              required: 'Vui lòng xác nhận mật khẩu.',
                              validate: (value) =>
                                value === registerPassword || 'Mật khẩu xác nhận không khớp.',
                            })}
                            className="w-full rounded-[18px] border border-[#ddd3c6] bg-[#fcfaf8] px-4 py-3.5 text-[15px] outline-none transition focus:border-[#15110d]"
                            placeholder="••••••••"
                          />
                          {registerForm.formState.errors.confirmPassword ? (
                            <div className="mt-2 text-[13px] text-red-600">
                              {registerForm.formState.errors.confirmPassword.message}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    {registerError ? (
                      <div className="mt-4 text-[14px] text-red-600">{registerError}</div>
                    ) : null}

                    <button
                      type="submit"
                      disabled={isRegistering}
                      className="mt-6 w-full rounded-full bg-[#15110d] px-6 py-4 text-[15px] font-semibold text-white transition hover:bg-[#2b2520] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isRegistering ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
                    </button>
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
