'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  AlertCircle,
  ArrowRight,
  Banknote,
  BadgeCheck,
  Copy,
  ExternalLink,
  HelpCircle,
  LayoutDashboard,
  LineChart,
  Link2,
  LoaderCircle,
  LockKeyhole,
  MousePointerClick,
  ShieldCheck,
  ShoppingCart,
  UserRound,
  Wallet,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.jsx';

const numberFormatter = new Intl.NumberFormat('vi-VN');
const dateFormatter = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' });

const genderOptions = [
  { value: 'prefer_not_to_say', label: 'Chưa muốn chia sẻ' },
  { value: 'male', label: 'Nam' },
  { value: 'female', label: 'Nữ' },
  { value: 'other', label: 'Khác' },
];

const affiliateTabs = [
  {
    id: 'overview',
    label: 'Tổng quan',
    description: 'Trạng thái duyệt, mã giới thiệu và doanh thu tổng.',
    icon: LayoutDashboard,
    requiresUnlock: true,
  },
  {
    id: 'performance',
    label: 'Lượt click lượt mua',
    description: 'Theo dõi click, đơn hàng và hoa hồng tích lũy.',
    icon: LineChart,
    requiresUnlock: true,
  },
  {
    id: 'links',
    label: 'Link affiliate',
    description: 'Sao chép link ref và mã affiliate cá nhân.',
    icon: Link2,
    requiresUnlock: true,
  },
  {
    id: 'profile',
    label: 'Hồ sơ',
    description: 'Điền, cập nhật và theo dõi hồ sơ xét duyệt affiliate.',
    icon: UserRound,
    requiresUnlock: false,
  },
  {
    id: 'bank',
    label: 'Tài khoản ngân hàng',
    description: 'Lưu tài khoản nhận hoa hồng sau khi được kích hoạt.',
    icon: Wallet,
    requiresUnlock: true,
  },
  {
    id: 'support',
    label: 'Hỗ trợ',
    description: 'Quy trình vận hành, hỗ trợ và hướng dẫn tiếp theo.',
    icon: HelpCircle,
    requiresUnlock: false,
  },
];

const applicationStatusMap = {
  pending: {
    label: 'Chờ duyệt',
    tone: 'border-[#ecd8a0] bg-[#fff8df] text-[#7e5c0c]',
    title: 'Hồ sơ affiliate đang chờ xét duyệt',
    description:
      'Quản trị viên đang kiểm tra hồ sơ bạn đã gửi. Sau khi được duyệt và tạo mã affiliate, các mục dashboard sẽ được mở khóa.',
  },
  approved: {
    label: 'Đã duyệt',
    tone: 'border-[#b9e4ce] bg-[#eefbf3] text-[#167245]',
    title: 'Hồ sơ đã được duyệt',
    description:
      'Hồ sơ của bạn đã đạt yêu cầu. Khi tài khoản affiliate được kích hoạt trong hệ thống, các mục theo dõi click, link và ngân hàng sẽ hoạt động.',
  },
  rejected: {
    label: 'Cần cập nhật',
    tone: 'border-[#f1c0c0] bg-[#fff1f1] text-[#a43838]',
    title: 'Hồ sơ cần bổ sung thông tin',
    description:
      'Bạn có thể chỉnh sửa lại hồ sơ ngay bên dưới. Sau khi lưu, hồ sơ sẽ quay về trạng thái chờ duyệt để quản trị viên xem xét lại.',
  },
  idle: {
    label: 'Chưa đăng ký',
    tone: 'border-[#e7e1d8] bg-[#faf7f2] text-[#665a4e]',
    title: 'Bạn chưa gửi hồ sơ affiliate',
    description:
      'Hoàn tất hồ sơ để bắt đầu quy trình xét duyệt. Sau khi được duyệt, toàn bộ công cụ affiliate sẽ được mở khóa.',
  },
};

const defaultApplicationValues = {
  legalFullName: '',
  permanentAddress: '',
  nationalIdNumber: '',
  contactPhone: '',
  contactEmail: '',
  gender: 'prefer_not_to_say',
  facebookUrl: '',
  tiktokUrl: '',
};

const defaultBankValues = {
  accountHolderName: '',
  bankName: '',
  bankBranch: '',
  accountNumber: '',
};

async function parseJson(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

function formatCurrency(value) {
  return `${numberFormatter.format(Number(value ?? 0))}đ`;
}

function formatNumber(value) {
  return numberFormatter.format(Number(value ?? 0));
}

function formatDate(value) {
  if (!value) {
    return 'Chưa có dữ liệu';
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Chưa có dữ liệu';
  }

  return dateFormatter.format(parsedDate);
}

function maskAccountNumber(value) {
  const digits = String(value ?? '').replace(/\s+/g, '');

  if (!digits) {
    return 'Chưa có dữ liệu';
  }

  if (digits.length <= 4) {
    return digits;
  }

  return `•••• ${digits.slice(-4)}`;
}

function getStatusMeta(status) {
  return applicationStatusMap[status] ?? applicationStatusMap.idle;
}

function getApplicationDefaults(user, application) {
  return {
    legalFullName: application?.legalFullName ?? user?.fullName ?? user?.displayName ?? '',
    permanentAddress: application?.permanentAddress ?? '',
    nationalIdNumber: application?.nationalIdNumber ?? '',
    contactPhone: application?.contactPhone ?? user?.phone ?? '',
    contactEmail: application?.contactEmail ?? user?.email ?? '',
    gender: application?.gender ?? user?.gender ?? 'prefer_not_to_say',
    facebookUrl: application?.facebookUrl ?? '',
    tiktokUrl: application?.tiktokUrl ?? '',
  };
}

function getBankDefaults(bankAccount) {
  return {
    accountHolderName: bankAccount?.accountHolderName ?? '',
    bankName: bankAccount?.bankName ?? '',
    bankBranch: bankAccount?.bankBranch ?? '',
    accountNumber: bankAccount?.accountNumber ?? '',
  };
}

function getMessageTone(message) {
  return message.startsWith('Đã')
    ? 'border-[#c7e7d3] bg-[#effbf3] text-[#156c42]'
    : 'border-[#efc4c4] bg-[#fff4f4] text-[#a33a3a]';
}

function getLockedFeatureCopy(status) {
  switch (status) {
    case 'pending':
      return 'Hồ sơ đang chờ duyệt. Khi quản trị viên phê duyệt và kích hoạt tài khoản affiliate, mục này sẽ tự mở.';
    case 'approved':
      return 'Hồ sơ đã được duyệt nhưng tài khoản affiliate chưa được kích hoạt trong hệ thống. Mục này sẽ mở ngay khi mã affiliate được tạo.';
    case 'rejected':
      return 'Hồ sơ đang cần bổ sung lại thông tin. Hãy cập nhật hồ sơ để gửi xét duyệt lại và mở khóa mục này.';
    default:
      return 'Bạn cần gửi hồ sơ affiliate trước. Sau khi hồ sơ được duyệt, dashboard affiliate sẽ được mở khóa.';
  }
}

function InputField({ label, error, className = '', ...props }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-[14px] font-medium text-[#3d332a]">{label}</span>
      <input
        {...props}
        className="h-[52px] w-full rounded-[18px] border border-[#ddd3c6] bg-[#fcfaf8] px-4 text-[15px] text-[#16110d] outline-none transition placeholder:text-[#9e9489] focus:border-[#15110d]"
      />
      {error ? <span className="mt-2 block text-[13px] text-[#b42318]">{error}</span> : null}
    </label>
  );
}

function SelectField({ label, error, children, className = '', ...props }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-[14px] font-medium text-[#3d332a]">{label}</span>
      <select
        {...props}
        className="h-[52px] w-full rounded-[18px] border border-[#ddd3c6] bg-[#fcfaf8] px-4 text-[15px] text-[#16110d] outline-none transition focus:border-[#15110d]"
      >
        {children}
      </select>
      {error ? <span className="mt-2 block text-[13px] text-[#b42318]">{error}</span> : null}
    </label>
  );
}

function TextareaField({ label, error, className = '', ...props }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-[14px] font-medium text-[#3d332a]">{label}</span>
      <textarea
        {...props}
        className="min-h-[138px] w-full rounded-[18px] border border-[#ddd3c6] bg-[#fcfaf8] px-4 py-3.5 text-[15px] text-[#16110d] outline-none transition placeholder:text-[#9e9489] focus:border-[#15110d]"
      />
      {error ? <span className="mt-2 block text-[13px] text-[#b42318]">{error}</span> : null}
    </label>
  );
}

function MetricCard({ icon, label, value, helper }) {
  const IconComponent = icon;

  return (
    <div className="rounded-[24px] border border-[#ece4da] bg-white p-5 shadow-[0_18px_40px_rgba(22,17,13,0.05)]">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#15110d] text-white">
        <IconComponent className="h-5 w-5" />
      </div>
      <div className="mt-4 text-[13px] uppercase tracking-[0.16em] text-[#8d7f72]">{label}</div>
      <div className="mt-2 text-[30px] font-semibold tracking-[-0.05em] text-[#15110d]">{value}</div>
      <div className="mt-2 text-[14px] leading-6 text-[#6a5e53]">{helper}</div>
    </div>
  );
}

function SectionShell({ eyebrow, title, description, actions, children }) {
  return (
    <section className="rounded-[30px] border border-[#ece4da] bg-white p-6 shadow-[0_22px_60px_rgba(22,17,13,0.06)] md:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-[12px] font-semibold uppercase tracking-[0.24em] text-[#8d7f72]">{eyebrow}</div>
          <h2 className="mt-4 text-[28px] font-semibold leading-tight tracking-[-0.05em] text-[#15110d] md:text-[34px]">
            {title}
          </h2>
          {description ? (
            <p className="mt-4 max-w-[760px] text-[15px] leading-8 text-[#665a4e]">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
      </div>
      <div className="mt-8">{children}</div>
    </section>
  );
}

function DashboardTabButton({ tab, isActive, isLocked, onClick }) {
  const Icon = tab.icon;

  return (
    <button
      type="button"
      onClick={() => onClick(tab.id)}
      className={`flex w-full items-center gap-3 rounded-[22px] border px-4 py-3.5 text-left transition ${
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
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <div className="text-[15px] font-semibold leading-6">{tab.label}</div>
          {isLocked ? (
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${
                isActive
                  ? 'border-white/20 bg-white/10 text-white'
                  : 'border-[#e8dccf] bg-white text-[#7a6d60]'
              }`}
            >
              <LockKeyhole className="h-3.5 w-3.5" />
              Khóa
            </span>
          ) : null}
        </div>
      </div>
    </button>
  );
}

function LockedFeatureCard({ statusMeta, message, onOpenProfile }) {
  return (
    <div className="rounded-[28px] border border-dashed border-[#d9ccbf] bg-[#fcfaf8] p-6 md:p-7">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#15110d] text-white">
        <LockKeyhole className="h-5 w-5" />
      </div>
      <div className="mt-5 text-[24px] font-semibold tracking-[-0.04em] text-[#15110d]">
        Chức năng này sẽ mở sau khi hồ sơ được duyệt
      </div>
      <p className="mt-4 max-w-[760px] text-[15px] leading-8 text-[#665a4e]">{message}</p>
      <div className={`mt-5 inline-flex rounded-full border px-4 py-2 text-[13px] font-semibold ${statusMeta.tone}`}>
        {statusMeta.label}
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={onOpenProfile}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#15110d] px-5 py-3 text-[14px] font-semibold text-white transition hover:bg-[#2b2520]"
        >
          Đi tới hồ sơ
          <ArrowRight className="h-4 w-4" />
        </button>
        <div className="text-[13px] leading-6 text-[#8d7f72]">
          Hồ sơ duyệt xong sẽ mở khóa tổng quan, link, lượt click và tài khoản ngân hàng.
        </div>
      </div>
    </div>
  );
}

function ActivationPendingCard({ onOpenSupport }) {
  return (
    <div className="rounded-[28px] border border-[#d7eadf] bg-[#f4fcf7] p-6 md:p-7">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#15110d] text-white">
        <BadgeCheck className="h-5 w-5" />
      </div>
      <div className="mt-5 text-[24px] font-semibold tracking-[-0.04em] text-[#15110d]">
        Hồ sơ đã duyệt, đang chờ cấp mã affiliate
      </div>
      <p className="mt-4 max-w-[760px] text-[15px] leading-8 text-[#665a4e]">
        Các mục affiliate đã được mở theo trạng thái duyệt hồ sơ. Khi quản trị viên tạo xong mã affiliate và tài khoản
        ref trong hệ thống, phần thống kê, link và ngân hàng sẽ tự có dữ liệu thật.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={onOpenSupport}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#15110d] px-5 py-3 text-[14px] font-semibold text-white transition hover:bg-[#2b2520]"
        >
          Xem hỗ trợ
          <ArrowRight className="h-4 w-4" />
        </button>
        <div className="text-[13px] leading-6 text-[#8d7f72]">
          Đây là trạng thái trung gian khi hồ sơ đã được duyệt nhưng dữ liệu affiliate chưa được khởi tạo.
        </div>
      </div>
    </div>
  );
}

function LockedState() {
  return (
    <section className="rounded-[30px] border border-[#ece4da] bg-white p-7 shadow-[0_22px_60px_rgba(22,17,13,0.06)] md:p-9">
      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div>
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#15110d] text-white">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="mt-6 text-[32px] font-semibold leading-[1.02] tracking-[-0.06em] text-[#15110d] md:text-[42px]">
            Đăng nhập để mở khu vực affiliate.
          </div>
          <p className="mt-4 max-w-[560px] text-[16px] leading-8 text-[#665a4e]">
            Sau khi đăng nhập, bạn có thể gửi hồ sơ đăng ký, chờ xét duyệt và theo dõi dashboard affiliate ngay trong
            một giao diện quản lý tương tự trang tài khoản của mình.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/account"
              className="inline-flex items-center justify-center rounded-full bg-[#15110d] px-6 py-3.5 text-[15px] font-semibold text-white transition hover:bg-[#2b2520]"
            >
              Đăng nhập
            </Link>
            <Link
              href="/account?tab=register"
              className="inline-flex items-center justify-center rounded-full border border-[#15110d] px-6 py-3.5 text-[15px] font-semibold text-[#15110d] transition hover:bg-[#15110d] hover:text-white"
            >
              Tạo tài khoản mới
            </Link>
          </div>
        </div>

        <div className="rounded-[28px] border border-[#ede6dc] bg-[#fcfaf8] p-6">
          <div className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#8d7f72]">Quy trình tham gia</div>
          <div className="mt-6 space-y-4">
            {[
              'Đăng nhập tài khoản SRX và điền hồ sơ affiliate đầy đủ.',
              'Quản trị viên duyệt hồ sơ và kích hoạt tài khoản affiliate.',
              'Sau khi được duyệt, bạn dùng dashboard để theo dõi link, click, đơn hàng và ngân hàng nhận commission.',
            ].map((item, index) => (
              <div key={item} className="flex gap-4 rounded-[20px] border border-[#ebe3d8] bg-white p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#15110d] text-[13px] font-semibold text-white">
                  0{index + 1}
                </div>
                <div className="pt-1 text-[15px] leading-7 text-[#5f5449]">{item}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function AffiliatePage() {
  const { user, isLoading } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [snapshot, setSnapshot] = useState(null);
  const [snapshotError, setSnapshotError] = useState('');
  const [isSnapshotLoading, setIsSnapshotLoading] = useState(false);
  const [isSavingApplication, setIsSavingApplication] = useState(false);
  const [isSavingBank, setIsSavingBank] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState('');
  const [bankMessage, setBankMessage] = useState('');
  const [copyMessage, setCopyMessage] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const applicationForm = useForm({
    defaultValues: defaultApplicationValues,
  });

  const bankForm = useForm({
    defaultValues: defaultBankValues,
  });

  const affiliateUser = profileUser ?? user;
  const status = snapshot?.application?.status ?? 'idle';
  const statusMeta = getStatusMeta(status);
  const areAffiliateToolsUnlocked = status === 'approved';
  const hasAffiliateAccount = Boolean(snapshot?.account);
  const isActivationPending = areAffiliateToolsUnlocked && !hasAffiliateAccount;
  const lockedFeatureCopy = getLockedFeatureCopy(status);

  const overviewCards = useMemo(() => {
    if (!snapshot?.account) {
      return [];
    }

    return [
      {
        icon: MousePointerClick,
        label: 'Lượt click',
        value: formatNumber(snapshot.account.totalClicks ?? 0),
        helper: 'Tổng lượt truy cập vào link giới thiệu của bạn.',
      },
      {
        icon: ShoppingCart,
        label: 'Lượt mua',
        value: formatNumber(snapshot.account.totalOrders ?? 0),
        helper: 'Tổng số đơn hàng đã được ghi nhận cho mã affiliate.',
      },
      {
        icon: Wallet,
        label: 'Hoa hồng chờ duyệt',
        value: formatCurrency(snapshot.account.pendingCommission),
        helper: 'Khoản tạm tính từ các đơn chưa hoàn tất đối soát.',
      },
      {
        icon: Banknote,
        label: 'Hoa hồng đã thanh toán',
        value: formatCurrency(snapshot.account.paidCommission),
        helper: 'Tổng tiền commission đã được chi trả cho bạn.',
      },
    ];
  }, [snapshot?.account]);

  const performanceStats = useMemo(() => {
    if (!snapshot?.account) {
      return {
        clicks: 0,
        orders: 0,
        conversionRate: '0%',
        pendingCommission: 0,
        approvedCommission: 0,
        paidCommission: 0,
      };
    }

    const clicks = Number(snapshot.account.totalClicks ?? 0);
    const orders = Number(snapshot.account.totalOrders ?? 0);
    const conversionRate = clicks > 0 ? `${((orders / clicks) * 100).toFixed(1)}%` : '0%';

    return {
      clicks,
      orders,
      conversionRate,
      pendingCommission: Number(snapshot.account.pendingCommission ?? 0),
      approvedCommission: Number(snapshot.account.approvedCommission ?? 0),
      paidCommission: Number(snapshot.account.paidCommission ?? 0),
    };
  }, [snapshot?.account]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!user) {
      setProfileUser(null);
      setSnapshot(null);
      setSnapshotError('');
      setApplicationMessage('');
      setBankMessage('');
      setCopyMessage('');
      setActiveTab('overview');
      applicationForm.reset(defaultApplicationValues);
      bankForm.reset(defaultBankValues);
      return;
    }

    let ignore = false;

    async function loadSnapshot() {
      try {
        setIsSnapshotLoading(true);
        setSnapshotError('');

        const response = await fetch('/api/affiliate/me', {
          method: 'GET',
          cache: 'no-store',
        });

        const data = await parseJson(response);

        if (ignore) {
          return;
        }

        if (!response.ok) {
          throw new Error(data.message ?? 'Không thể tải dữ liệu affiliate.');
        }

        setProfileUser(data.user ?? user);
        setSnapshot(data.snapshot ?? null);
        applicationForm.reset(getApplicationDefaults(data.user ?? user, data.snapshot?.application));
        bankForm.reset(getBankDefaults(data.snapshot?.bankAccount));
      } catch (error) {
        if (!ignore) {
          setSnapshotError(error.message);
        }
      } finally {
        if (!ignore) {
          setIsSnapshotLoading(false);
        }
      }
    }

    loadSnapshot();

    return () => {
      ignore = true;
    };
  }, [applicationForm, bankForm, isLoading, user]);

  useEffect(() => {
    if (!copyMessage) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setCopyMessage(''), 2200);
    return () => window.clearTimeout(timeoutId);
  }, [copyMessage]);

  const handleApplicationSubmit = applicationForm.handleSubmit(async (values) => {
    try {
      setIsSavingApplication(true);
      setApplicationMessage('');
      setSnapshotError('');

      const response = await fetch('/api/affiliate/application', {
        method: snapshot?.application ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await parseJson(response);

      if (!response.ok) {
        throw new Error(data.message ?? 'Không thể lưu hồ sơ affiliate.');
      }

      setProfileUser(data.user ?? profileUser);
      setSnapshot(data.snapshot ?? snapshot);
      applicationForm.reset(getApplicationDefaults(data.user ?? profileUser, data.snapshot?.application));
      setApplicationMessage(
        data.snapshot?.application?.status === 'approved'
          ? 'Đã cập nhật hồ sơ affiliate.'
          : 'Đã lưu hồ sơ và gửi về trạng thái chờ duyệt.',
      );
    } catch (error) {
      setApplicationMessage(error.message);
    } finally {
      setIsSavingApplication(false);
    }
  });

  const handleBankSubmit = bankForm.handleSubmit(async (values) => {
    try {
      setIsSavingBank(true);
      setBankMessage('');
      setSnapshotError('');

      const response = await fetch('/api/affiliate/bank-account', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await parseJson(response);

      if (!response.ok) {
        throw new Error(data.message ?? 'Không thể cập nhật tài khoản ngân hàng.');
      }

      setProfileUser(data.user ?? profileUser);
      setSnapshot(data.snapshot ?? snapshot);
      bankForm.reset(getBankDefaults(data.snapshot?.bankAccount));
      setBankMessage('Đã lưu thông tin tài khoản ngân hàng.');
    } catch (error) {
      setBankMessage(error.message);
    } finally {
      setIsSavingBank(false);
    }
  });

  const handleCopyLink = async () => {
    if (!snapshot?.account?.referralLink || !navigator?.clipboard) {
      setCopyMessage('Không thể sao chép tự động. Hãy copy thủ công.');
      return;
    }

    try {
      await navigator.clipboard.writeText(snapshot.account.referralLink);
      setCopyMessage('Đã sao chép link affiliate.');
    } catch {
      setCopyMessage('Không thể sao chép tự động. Hãy copy thủ công.');
    }
  };

  const renderOverviewSection = () => (
    <SectionShell
      eyebrow="Tổng quan"
      title="Bảng điều khiển affiliate"
      description="Sau khi hồ sơ được duyệt và mã affiliate được kích hoạt, đây là nơi bạn theo dõi toàn bộ trạng thái hoạt động, link giới thiệu và tiến độ commission."
      actions={
        hasAffiliateAccount ? (
          <>
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#15110d] px-5 py-3 text-[14px] font-semibold text-white transition hover:bg-[#2b2520]"
            >
              <Copy className="h-4 w-4" />
              Sao chép link
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('links')}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#15110d] px-5 py-3 text-[14px] font-semibold text-[#15110d] transition hover:bg-[#15110d] hover:text-white"
            >
              Xem link affiliate
              <ArrowRight className="h-4 w-4" />
            </button>
          </>
        ) : null
      }
    >
      {!areAffiliateToolsUnlocked ? (
        <LockedFeatureCard statusMeta={statusMeta} message={lockedFeatureCopy} onOpenProfile={() => setActiveTab('profile')} />
      ) : isActivationPending ? (
        <ActivationPendingCard onOpenSupport={() => setActiveTab('support')} />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {overviewCards.map((card) => (
              <MetricCard key={card.label} {...card} />
            ))}
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_360px]">
            <div className="rounded-[26px] border border-[#ece4da] bg-[#fcfaf8] p-5 md:p-6">
              <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#8d7f72]">Link giới thiệu chính</div>
              <div className="mt-3 break-all text-[15px] leading-7 text-[#15110d]">{snapshot.account.referralLink}</div>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-[20px] border border-[#e8dfd4] bg-white p-4">
                  <div className="text-[12px] uppercase tracking-[0.16em] text-[#8d7f72]">Mã affiliate</div>
                  <div className="mt-2 text-[24px] font-semibold tracking-[0.04em] text-[#15110d]">
                    {snapshot.account.affiliateCode}
                  </div>
                </div>
                <div className="rounded-[20px] border border-[#e8dfd4] bg-white p-4">
                  <div className="text-[12px] uppercase tracking-[0.16em] text-[#8d7f72]">Cách tính commission</div>
                  <div className="mt-2 text-[18px] font-semibold leading-7 text-[#15110d]">
                    {snapshot.account.commissionType === 'percent'
                      ? `${snapshot.account.commissionRate}% / đơn hợp lệ`
                      : `${formatCurrency(snapshot.account.commissionRate)} / đơn hợp lệ`}
                  </div>
                </div>
              </div>
              {copyMessage ? <div className="mt-4 text-[13px] text-[#665a4e]">{copyMessage}</div> : null}
            </div>

            <div className="space-y-4">
              <div className="rounded-[26px] border border-[#ece4da] bg-white p-5">
                <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#8d7f72]">Trạng thái hồ sơ</div>
                <div className="mt-3 text-[22px] font-semibold leading-8 tracking-[-0.04em] text-[#15110d]">
                  {statusMeta.title}
                </div>
                <div className="mt-3 text-[14px] leading-7 text-[#665a4e]">{statusMeta.description}</div>
              </div>

              <div className="rounded-[26px] border border-[#ece4da] bg-[#15110d] p-5 text-white">
                <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/70">Cookie ghi nhận</div>
                <div className="mt-2 text-[28px] font-semibold tracking-[-0.04em]">
                  {snapshot.account.cookieDurationDays} ngày
                </div>
                <div className="mt-3 text-[14px] leading-7 text-white/75">
                  Người dùng truy cập qua link của bạn sẽ được hệ thống ghi nhận trong thời gian này.
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </SectionShell>
  );

  const renderPerformanceSection = () => (
    <SectionShell
      eyebrow="Lượt click lượt mua"
      title="Hiệu suất affiliate"
      description="Dữ liệu hiện tại hiển thị theo tổng tích lũy của tài khoản affiliate. Khi backend tracking chi tiết hơn được nối vào, phần này có thể mở rộng sang biểu đồ và lịch sử theo ngày."
    >
      {!areAffiliateToolsUnlocked ? (
        <LockedFeatureCard statusMeta={statusMeta} message={lockedFeatureCopy} onOpenProfile={() => setActiveTab('profile')} />
      ) : isActivationPending ? (
        <ActivationPendingCard onOpenSupport={() => setActiveTab('support')} />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              icon={MousePointerClick}
              label="Lượt click"
              value={formatNumber(performanceStats.clicks)}
              helper="Tổng lượt click vào link affiliate của bạn."
            />
            <MetricCard
              icon={ShoppingCart}
              label="Lượt mua"
              value={formatNumber(performanceStats.orders)}
              helper="Số đơn hàng đã gắn với mã affiliate hiện tại."
            />
            <MetricCard
              icon={LineChart}
              label="Tỷ lệ chuyển đổi"
              value={performanceStats.conversionRate}
              helper="Tỷ lệ giữa số đơn ghi nhận và tổng lượt click."
            />
            <MetricCard
              icon={Banknote}
              label="Sẵn sàng đối soát"
              value={formatCurrency(performanceStats.approvedCommission)}
              helper="Khoản commission đã sẵn sàng cho bước chi trả."
            />
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="rounded-[26px] border border-[#ece4da] bg-[#fcfaf8] p-5 md:p-6">
              <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#8d7f72]">Phân tích nhanh</div>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div className="rounded-[20px] border border-[#e9dfd4] bg-white p-4">
                  <div className="text-[13px] uppercase tracking-[0.14em] text-[#8d7f72]">Click</div>
                  <div className="mt-2 text-[28px] font-semibold tracking-[-0.04em] text-[#15110d]">
                    {formatNumber(performanceStats.clicks)}
                  </div>
                  <p className="mt-2 text-[13px] leading-6 text-[#6a5e53]">Lượng truy cập từ social, bài viết và landing page của bạn.</p>
                </div>
                <div className="rounded-[20px] border border-[#e9dfd4] bg-white p-4">
                  <div className="text-[13px] uppercase tracking-[0.14em] text-[#8d7f72]">Mua hàng</div>
                  <div className="mt-2 text-[28px] font-semibold tracking-[-0.04em] text-[#15110d]">
                    {formatNumber(performanceStats.orders)}
                  </div>
                  <p className="mt-2 text-[13px] leading-6 text-[#6a5e53]">Đơn hàng hợp lệ được hệ thống ghi nhận cho mã affiliate.</p>
                </div>
                <div className="rounded-[20px] border border-[#e9dfd4] bg-white p-4">
                  <div className="text-[13px] uppercase tracking-[0.14em] text-[#8d7f72]">Chuyển đổi</div>
                  <div className="mt-2 text-[28px] font-semibold tracking-[-0.04em] text-[#15110d]">
                    {performanceStats.conversionRate}
                  </div>
                  <p className="mt-2 text-[13px] leading-6 text-[#6a5e53]">Chỉ số chuyển đổi tổng hợp dựa trên click và số đơn ghi nhận.</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[26px] border border-[#ece4da] bg-white p-5">
                <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#8d7f72]">Commission chờ duyệt</div>
                <div className="mt-2 text-[28px] font-semibold tracking-[-0.04em] text-[#15110d]">
                  {formatCurrency(performanceStats.pendingCommission)}
                </div>
                <div className="mt-3 text-[14px] leading-7 text-[#665a4e]">Đơn đang chờ hoàn tất điều kiện để được tính vào đối soát.</div>
              </div>

              <div className="rounded-[26px] border border-[#ece4da] bg-white p-5">
                <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#8d7f72]">Commission đã thanh toán</div>
                <div className="mt-2 text-[28px] font-semibold tracking-[-0.04em] text-[#15110d]">
                  {formatCurrency(performanceStats.paidCommission)}
                </div>
                <div className="mt-3 text-[14px] leading-7 text-[#665a4e]">Tổng tiền hoa hồng đã được chi trả vào tài khoản của bạn.</div>
              </div>
            </div>
          </div>
        </>
      )}
    </SectionShell>
  );

  const renderLinksSection = () => (
    <SectionShell
      eyebrow="Link affiliate"
      title="Quản lý link giới thiệu"
      description="Bạn có thể dùng link này cho bài viết, social hoặc landing page cá nhân. Mọi đơn hợp lệ đi từ link này sẽ được hệ thống gắn vào tài khoản affiliate của bạn."
      actions={
        hasAffiliateAccount ? (
          <>
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#15110d] px-5 py-3 text-[14px] font-semibold text-white transition hover:bg-[#2b2520]"
            >
              <Copy className="h-4 w-4" />
              Copy link
            </button>
            <a
              href={snapshot.account.referralLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#15110d] px-5 py-3 text-[14px] font-semibold text-[#15110d] transition hover:bg-[#15110d] hover:text-white"
            >
              <ExternalLink className="h-4 w-4" />
              Mở thử link
            </a>
          </>
        ) : null
      }
    >
      {!areAffiliateToolsUnlocked ? (
        <LockedFeatureCard statusMeta={statusMeta} message={lockedFeatureCopy} onOpenProfile={() => setActiveTab('profile')} />
      ) : isActivationPending ? (
        <ActivationPendingCard onOpenSupport={() => setActiveTab('support')} />
      ) : (
        <>
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_360px]">
            <div className="rounded-[26px] border border-[#ece4da] bg-[#fcfaf8] p-5 md:p-6">
              <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#8d7f72]">Link chính</div>
              <div className="mt-3 break-all rounded-[20px] border border-[#e8dfd4] bg-white px-4 py-4 text-[15px] leading-7 text-[#15110d]">
                {snapshot.account.referralLink}
              </div>
              {copyMessage ? <div className="mt-3 text-[13px] text-[#665a4e]">{copyMessage}</div> : null}

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-[20px] border border-[#e8dfd4] bg-white p-4">
                  <div className="text-[12px] uppercase tracking-[0.16em] text-[#8d7f72]">Mã affiliate</div>
                  <div className="mt-2 text-[24px] font-semibold tracking-[0.04em] text-[#15110d]">
                    {snapshot.account.affiliateCode}
                  </div>
                </div>
                <div className="rounded-[20px] border border-[#e8dfd4] bg-white p-4">
                  <div className="text-[12px] uppercase tracking-[0.16em] text-[#8d7f72]">Cookie</div>
                  <div className="mt-2 text-[24px] font-semibold tracking-[0.04em] text-[#15110d]">
                    {snapshot.account.cookieDurationDays} ngày
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[26px] border border-[#ece4da] bg-white p-5">
              <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#8d7f72]">Cách dùng hiệu quả</div>
              <div className="mt-4 space-y-3">
                {[
                  'Gắn link affiliate vào bio social, bài viết và landing page riêng.',
                  'Dùng cùng nội dung review hoặc chia sẻ routine để tăng tỷ lệ click.',
                  'Theo dõi lượt click và lượt mua tại mục thống kê để tối ưu kênh bán.',
                ].map((item) => (
                  <div key={item} className="flex gap-3 rounded-[20px] border border-[#ece4da] bg-[#fcfaf8] p-4">
                    <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#15110d]" />
                    <div className="text-[14px] leading-7 text-[#665a4e]">{item}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </SectionShell>
  );

  const renderProfileSection = () => (
    <SectionShell
      eyebrow="Hồ sơ"
      title="Quản lý hồ sơ affiliate"
      description="Hồ sơ này là điều kiện mở khóa toàn bộ công cụ affiliate. Sau khi hồ sơ được duyệt, bạn vẫn có thể cập nhật thông tin mà không làm mất mã affiliate hiện tại."
    >
      {snapshot?.application?.reviewNote ? (
        <div className="mb-6 rounded-[22px] border border-[#efc7c7] bg-[#fff5f5] px-5 py-4 text-[14px] leading-7 text-[#8e3939]">
          <div className="font-semibold">Ghi chú từ quản trị viên</div>
          <div className="mt-1">{snapshot.application.reviewNote}</div>
        </div>
      ) : null}

      {applicationMessage ? (
        <div className={`mb-6 rounded-[22px] border px-5 py-4 text-[14px] leading-7 ${getMessageTone(applicationMessage)}`}>
          {applicationMessage}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <form onSubmit={handleApplicationSubmit} className="space-y-5 rounded-[26px] border border-[#ece4da] bg-[#fcfaf8] p-5 md:p-6">
          <div className="grid gap-5 md:grid-cols-2">
            <InputField
              label="Họ và tên"
              placeholder="Nguyễn Văn A"
              error={applicationForm.formState.errors.legalFullName?.message}
              {...applicationForm.register('legalFullName', {
                required: 'Vui lòng nhập họ và tên.',
              })}
            />
            <InputField
              label="Số CCCD"
              placeholder="079123456789"
              error={applicationForm.formState.errors.nationalIdNumber?.message}
              {...applicationForm.register('nationalIdNumber', {
                required: 'Vui lòng nhập số CCCD.',
              })}
            />
          </div>

          <TextareaField
            label="Địa chỉ thường trú"
            placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
            error={applicationForm.formState.errors.permanentAddress?.message}
            {...applicationForm.register('permanentAddress', {
              required: 'Vui lòng nhập địa chỉ thường trú.',
            })}
          />

          <div className="grid gap-5 md:grid-cols-3">
            <InputField
              label="Số điện thoại"
              type="tel"
              placeholder="0903 010 692"
              error={applicationForm.formState.errors.contactPhone?.message}
              {...applicationForm.register('contactPhone', {
                required: 'Vui lòng nhập số điện thoại.',
              })}
            />
            <InputField
              label="Email"
              type="email"
              placeholder="you@example.com"
              error={applicationForm.formState.errors.contactEmail?.message}
              {...applicationForm.register('contactEmail', {
                required: 'Vui lòng nhập email.',
              })}
            />
            <SelectField
              label="Giới tính"
              error={applicationForm.formState.errors.gender?.message}
              {...applicationForm.register('gender')}
            >
              {genderOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SelectField>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <InputField
              label="Link Facebook"
              placeholder="https://facebook.com/yourprofile"
              error={applicationForm.formState.errors.facebookUrl?.message}
              {...applicationForm.register('facebookUrl', {
                required: 'Vui lòng nhập link Facebook.',
              })}
            />
            <InputField
              label="Link TikTok"
              placeholder="https://tiktok.com/@yourprofile"
              error={applicationForm.formState.errors.tiktokUrl?.message}
              {...applicationForm.register('tiktokUrl', {
                required: 'Vui lòng nhập link TikTok.',
              })}
            />
          </div>

          <div className="flex flex-col gap-3 border-t border-[#eee6db] pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-[13px] leading-6 text-[#8d7f72]">
              Quản trị viên sẽ xét duyệt thủ công dựa trên thông tin hồ sơ và kênh social của bạn.
            </div>
            <button
              type="submit"
              disabled={isSavingApplication}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#15110d] px-6 py-3.5 text-[15px] font-semibold text-white transition hover:bg-[#2b2520] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSavingApplication ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <span>{snapshot?.application ? 'Cập nhật hồ sơ' : 'Gửi hồ sơ affiliate'}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="space-y-4">
          <div className="rounded-[26px] border border-[#ece4da] bg-white p-5">
            <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#8d7f72]">Trạng thái hiện tại</div>
            <div className="mt-3 text-[22px] font-semibold leading-8 tracking-[-0.04em] text-[#15110d]">{statusMeta.title}</div>
            <div className="mt-3 text-[14px] leading-7 text-[#665a4e]">{statusMeta.description}</div>
          </div>

          <div className="rounded-[26px] border border-[#ece4da] bg-white p-5">
            <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#8d7f72]">Ngày gửi hồ sơ</div>
            <div className="mt-2 text-[20px] font-semibold text-[#15110d]">{formatDate(snapshot?.application?.createdAt)}</div>
          </div>

          <div className="rounded-[26px] border border-[#ece4da] bg-white p-5">
            <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#8d7f72]">Ngày xét duyệt</div>
            <div className="mt-2 text-[20px] font-semibold text-[#15110d]">
              {formatDate(snapshot?.account?.approvedAt ?? snapshot?.application?.reviewedAt)}
            </div>
          </div>
        </div>
      </div>
    </SectionShell>
  );

  const renderBankSection = () => (
    <SectionShell
      eyebrow="Tài khoản ngân hàng"
      title="Cập nhật tài khoản nhận commission"
      description="Sau khi hồ sơ đã được duyệt và tài khoản affiliate được mở, bạn có thể lưu tài khoản ngân hàng để phục vụ bước chi trả commission."
    >
      {!areAffiliateToolsUnlocked ? (
        <LockedFeatureCard statusMeta={statusMeta} message={lockedFeatureCopy} onOpenProfile={() => setActiveTab('profile')} />
      ) : isActivationPending ? (
        <ActivationPendingCard onOpenSupport={() => setActiveTab('support')} />
      ) : (
        <>
          {bankMessage ? (
            <div className={`mb-6 rounded-[22px] border px-5 py-4 text-[14px] leading-7 ${getMessageTone(bankMessage)}`}>
              {bankMessage}
            </div>
          ) : null}

          <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
            <div className="space-y-4">
              <div className="rounded-[26px] border border-[#ece4da] bg-white p-5">
                <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#8d7f72]">Tài khoản hiện tại</div>
                <div className="mt-3 text-[22px] font-semibold leading-8 tracking-[-0.04em] text-[#15110d]">
                  {snapshot?.bankAccount?.bankName || 'Chưa lưu ngân hàng'}
                </div>
                <div className="mt-2 text-[14px] leading-7 text-[#665a4e]">
                  {snapshot?.bankAccount?.accountHolderName || 'Chưa có tên chủ tài khoản'}
                </div>
                <div className="mt-1 text-[14px] leading-7 text-[#665a4e]">{maskAccountNumber(snapshot?.bankAccount?.accountNumber)}</div>
              </div>

              <div className="rounded-[26px] border border-[#ece4da] bg-[#fcfaf8] p-5">
                <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#8d7f72]">Lần cập nhật gần nhất</div>
                <div className="mt-2 text-[20px] font-semibold text-[#15110d]">{formatDate(snapshot?.bankAccount?.updatedAt)}</div>
                <div className="mt-3 text-[14px] leading-7 text-[#665a4e]">
                  Hãy kiểm tra kỹ số tài khoản và tên chủ tài khoản trước khi lưu.
                </div>
              </div>
            </div>

            <form onSubmit={handleBankSubmit} className="space-y-5 rounded-[26px] border border-[#ece4da] bg-[#fcfaf8] p-5 md:p-6">
              <div className="grid gap-5 md:grid-cols-2">
                <InputField
                  label="Tên chủ tài khoản"
                  placeholder="NGUYEN VAN A"
                  error={bankForm.formState.errors.accountHolderName?.message}
                  {...bankForm.register('accountHolderName', {
                    required: 'Vui lòng nhập tên chủ tài khoản.',
                  })}
                />
                <InputField
                  label="Tên ngân hàng"
                  placeholder="Vietcombank"
                  error={bankForm.formState.errors.bankName?.message}
                  {...bankForm.register('bankName', {
                    required: 'Vui lòng nhập tên ngân hàng.',
                  })}
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <InputField
                  label="Chi nhánh"
                  placeholder="Chi nhánh TP.HCM"
                  error={bankForm.formState.errors.bankBranch?.message}
                  {...bankForm.register('bankBranch')}
                />
                <InputField
                  label="Số tài khoản"
                  placeholder="0123456789"
                  error={bankForm.formState.errors.accountNumber?.message}
                  {...bankForm.register('accountNumber', {
                    required: 'Vui lòng nhập số tài khoản.',
                  })}
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingBank}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#15110d] px-6 py-3.5 text-[15px] font-semibold text-white transition hover:bg-[#2b2520] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSavingBank ? (
                    <>
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <span>Lưu ngân hàng</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </SectionShell>
  );

  const renderSupportSection = () => (
    <SectionShell
      eyebrow="Hỗ trợ"
      title="Hướng dẫn vận hành affiliate"
      description="Khi cần cập nhật hồ sơ, kiểm tra trạng thái duyệt hoặc xử lý thắc mắc về commission, bạn có thể theo dõi các bước dưới đây."
    >
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-[24px] border border-[#ece4da] bg-[#fcfaf8] p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#15110d] text-white">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="mt-4 text-[21px] font-semibold tracking-[-0.04em] text-[#15110d]">1. Hoàn tất hồ sơ</div>
          <p className="mt-3 text-[14px] leading-7 text-[#665a4e]">
            Kiểm tra lại họ tên, CCCD, số điện thoại và social link ở mục Hồ sơ trước khi gửi xét duyệt.
          </p>
        </div>

        <div className="rounded-[24px] border border-[#ece4da] bg-[#fcfaf8] p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#15110d] text-white">
            <BadgeCheck className="h-5 w-5" />
          </div>
          <div className="mt-4 text-[21px] font-semibold tracking-[-0.04em] text-[#15110d]">2. Chờ kích hoạt</div>
          <p className="mt-3 text-[14px] leading-7 text-[#665a4e]">
            Sau khi hồ sơ được duyệt, quản trị viên sẽ kích hoạt tài khoản affiliate để mở các mục tổng quan, link và ngân hàng.
          </p>
        </div>

        <div className="rounded-[24px] border border-[#ece4da] bg-[#fcfaf8] p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#15110d] text-white">
            <Wallet className="h-5 w-5" />
          </div>
          <div className="mt-4 text-[21px] font-semibold tracking-[-0.04em] text-[#15110d]">3. Đối soát commission</div>
          <p className="mt-3 text-[14px] leading-7 text-[#665a4e]">
            Hãy lưu sẵn tài khoản ngân hàng để sẵn sàng cho bước chi trả khi commission được duyệt thanh toán.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-[26px] border border-[#ece4da] bg-white p-5 md:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#8d7f72]">Cần hỗ trợ thêm?</div>
            <div className="mt-3 text-[22px] font-semibold tracking-[-0.04em] text-[#15110d]">
              Bạn có thể gửi yêu cầu hỗ trợ hoặc cập nhật hồ sơ bất cứ lúc nào.
            </div>
            <p className="mt-3 max-w-[760px] text-[14px] leading-7 text-[#665a4e]">
              Nếu hồ sơ đang bị từ chối hoặc chờ duyệt quá lâu, hãy liên hệ đội ngũ SRX để được kiểm tra lại trạng thái.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#15110d] px-5 py-3 text-[14px] font-semibold text-white transition hover:bg-[#2b2520]"
            >
              Xem hồ sơ
              <ArrowRight className="h-4 w-4" />
            </button>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#15110d] px-5 py-3 text-[14px] font-semibold text-[#15110d] transition hover:bg-[#15110d] hover:text-white"
            >
              Liên hệ hỗ trợ
            </Link>
          </div>
        </div>
      </div>
    </SectionShell>
  );

  const renderActiveSection = () => {
    switch (activeTab) {
      case 'performance':
        return renderPerformanceSection();
      case 'links':
        return renderLinksSection();
      case 'profile':
        return renderProfileSection();
      case 'bank':
        return renderBankSection();
      case 'support':
        return renderSupportSection();
      default:
        return renderOverviewSection();
    }
  };

  return (
    <section className="bg-[#f9f9f9] py-12 md:py-16 lg:py-20">
      <div className="mx-auto max-w-[1560px] px-4 md:px-6">
        <div className="mt-8">
          {isLoading ? (
            <div className="flex min-h-[280px] items-center justify-center rounded-[30px] border border-[#ece4da] bg-white text-[15px] text-[#665a4e] shadow-[0_18px_60px_rgba(22,17,13,0.06)]">
              <LoaderCircle className="mr-3 h-5 w-5 animate-spin" />
              Đang kiểm tra trạng thái tài khoản...
            </div>
          ) : !user ? (
            <LockedState />
          ) : (
            <div className="grid gap-8 xl:grid-cols-[320px_minmax(0,1fr)]">
              <aside className="space-y-5">
                <div className="rounded-[30px] border border-[#ece4da] bg-white p-5 shadow-[0_18px_50px_rgba(22,17,13,0.05)]">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#15110d] text-white">
                      <UserRound className="h-6 w-6" />
                    </div>
                    <div className={`inline-flex rounded-full border px-4 py-2 text-[13px] font-semibold ${statusMeta.tone}`}>
                      {statusMeta.label}
                    </div>
                  </div>
                  <div className="mt-5 text-[12px] uppercase tracking-[0.2em] text-[#8d7f72]">Thành viên</div>
                  <div className="mt-2 text-[24px] font-semibold leading-tight tracking-[-0.05em] text-[#15110d]">
                    {affiliateUser?.fullName || affiliateUser?.displayName || affiliateUser?.email}
                  </div>
                  <div className="mt-2 text-[14px] text-[#665a4e]">{affiliateUser?.email}</div>
                  {affiliateUser?.phone ? <div className="mt-1 text-[14px] text-[#665a4e]">{affiliateUser.phone}</div> : null}

                </div>

                <div className="rounded-[30px] border border-[#ece4da] bg-white p-3 shadow-[0_18px_50px_rgba(22,17,13,0.05)]">
                  <div className="mb-2 px-3 pt-3 text-[12px] font-semibold uppercase tracking-[0.2em] text-[#8d7f72]">
                    Khu vực affiliate
                  </div>
                  <div className="space-y-3">
                    {affiliateTabs.map((tab) => (
                      <DashboardTabButton
                        key={tab.id}
                        tab={tab}
                        isActive={activeTab === tab.id}
                        isLocked={tab.requiresUnlock && !areAffiliateToolsUnlocked}
                        onClick={setActiveTab}
                      />
                    ))}
                  </div>
                </div>
              </aside>

              <div className="space-y-6">
                {snapshot?.schemaNeedsUpdate ? (
                  <div className="rounded-[24px] border border-[#f2d2a6] bg-[#fff7ea] px-5 py-4 text-[14px] leading-7 text-[#7b5b1a]">
                    <div className="flex gap-3">
                      <AlertCircle className="mt-1 h-5 w-5 shrink-0" />
                      <div>
                        Cơ sở dữ liệu hiện chưa có đủ trường cho affiliate. Hãy chạy file
                        <span className="mx-1 font-semibold">database/mysql/05_affiliate_management.sql</span>
                        trước khi dùng dữ liệu thật.
                      </div>
                    </div>
                  </div>
                ) : null}

                {snapshotError ? (
                  <div className="rounded-[24px] border border-[#efc4c4] bg-[#fff4f4] px-5 py-4 text-[14px] leading-7 text-[#a33a3a]">
                    {snapshotError}
                  </div>
                ) : null}

                {isSnapshotLoading && !snapshot ? (
                  <div className="flex min-h-[220px] items-center justify-center rounded-[30px] border border-[#ece4da] bg-white text-[15px] text-[#665a4e] shadow-[0_18px_50px_rgba(22,17,13,0.05)]">
                    <LoaderCircle className="mr-3 h-5 w-5 animate-spin" />
                    Đang tải dữ liệu affiliate...
                  </div>
                ) : (
                  renderActiveSection()
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
