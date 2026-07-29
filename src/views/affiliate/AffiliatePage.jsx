'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  AlertCircle,
  ArrowRight,
  Banknote,
  BadgeCheck,
  Check,
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

const NUM_FONT = "font-['Inter',_sans-serif]";
const PANEL = 'rounded-[16px] border border-[#D9D9D9] bg-white shadow-[0_12px_36px_rgba(22,17,13,0.05)]';
const TILE = 'rounded-[20px] border border-[#D9D9D9] bg-[#F6F6F6]';
const BTN_PRIMARY =
  'inline-flex items-center justify-center gap-2 rounded-full bg-[#15110d] px-5 py-2.5 text-[14px] font-semibold text-white transition hover:bg-[#2b2520] disabled:cursor-not-allowed disabled:opacity-60';
const BTN_GHOST =
  'inline-flex items-center justify-center gap-2 rounded-full border border-[#B7B7B7] bg-white px-5 py-2.5 text-[14px] font-semibold text-[#15110d] transition hover:border-[#15110d] hover:bg-[#15110d] hover:text-white';
const FIELD_BASE =
  'w-full rounded-[12px] border border-[#B7B7B7] bg-white text-[15px] text-[#16110d] outline-none transition placeholder:text-[#6B7280] focus:border-[#15110d]';
const LABEL = 'mb-2 block text-[13px] font-medium text-[#3d332a]';
const EYEBROW = 'text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5E6266]';

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
    label: 'Click & đơn hàng',
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
    label: 'Ngân hàng',
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
    dot: 'bg-[#c99a1b]',
    title: 'Hồ sơ affiliate đang chờ xét duyệt',
    description:
      'Quản trị viên đang kiểm tra hồ sơ bạn đã gửi. Sau khi được duyệt và tạo mã affiliate, các mục dashboard sẽ được mở khóa.',
  },
  approved: {
    label: 'Đã duyệt',
    tone: 'border-[#b9e4ce] bg-[#eefbf3] text-[#167245]',
    dot: 'bg-[#1f8b58]',
    title: 'Hồ sơ đã được duyệt',
    description:
      'Hồ sơ của bạn đã đạt yêu cầu. Khi tài khoản affiliate được kích hoạt trong hệ thống, các mục theo dõi click, link và ngân hàng sẽ hoạt động.',
  },
  rejected: {
    label: 'Cần cập nhật',
    tone: 'border-[#f1c0c0] bg-[#fff1f1] text-[#a43838]',
    dot: 'bg-[#c15252]',
    title: 'Hồ sơ cần bổ sung thông tin',
    description:
      'Bạn có thể chỉnh sửa lại hồ sơ ngay bên dưới. Sau khi lưu, hồ sơ sẽ quay về trạng thái chờ duyệt để quản trị viên xem xét lại.',
  },
  idle: {
    label: 'Chưa đăng ký',
    tone: 'border-[#e7e1d8] bg-[#faf7f2] text-[#665a4e]',
    dot: 'bg-[#a3968a]',
    title: 'Bạn chưa gửi hồ sơ affiliate',
    description:
      'Hoàn tất hồ sơ để bắt đầu quy trình xét duyệt. Sau khi được duyệt, toàn bộ công cụ affiliate sẽ được mở khóa.',
  },
};

// Một thang đơn sắc theo vòng đời hoa hồng: càng đậm là càng tiến gần tới lúc nhận tiền.
const commissionSegments = [
  { key: 'pending', label: 'Chờ duyệt', color: '#d9cec1' },
  { key: 'approved', label: 'Sẵn sàng đối soát', color: '#5E6266' },
  { key: 'paid', label: 'Đã thanh toán', color: '#15110d' },
];

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

function isSuccessMessage(message) {
  return message.startsWith('Đã');
}

function getMessageTone(message) {
  return isSuccessMessage(message)
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

function StatusPill({ statusMeta, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[13px] font-semibold ${statusMeta.tone} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${statusMeta.dot}`} />
      {statusMeta.label}
    </span>
  );
}

function InputField({ label, error, className = '', ...props }) {
  return (
    <label className={`block ${className}`}>
      <span className={LABEL}>{label}</span>
      <input {...props} className={`${FIELD_BASE} ${NUM_FONT} h-[48px] px-4`} />
      {error ? <span className="mt-1.5 block text-[12.5px] text-[#b42318]">{error}</span> : null}
    </label>
  );
}

function SelectField({ label, error, children, className = '', ...props }) {
  return (
    <label className={`block ${className}`}>
      <span className={LABEL}>{label}</span>
      <select {...props} className={`${FIELD_BASE} h-[48px] px-4`}>
        {children}
      </select>
      {error ? <span className="mt-1.5 block text-[12.5px] text-[#b42318]">{error}</span> : null}
    </label>
  );
}

function TextareaField({ label, error, className = '', ...props }) {
  return (
    <label className={`block ${className}`}>
      <span className={LABEL}>{label}</span>
      <textarea {...props} className={`${FIELD_BASE} min-h-[96px] px-4 py-3`} />
      {error ? <span className="mt-1.5 block text-[12.5px] text-[#b42318]">{error}</span> : null}
    </label>
  );
}

function MetricCard({ icon, label, value, helper }) {
  const IconComponent = icon;

  return (
    <div className="rounded-[20px] border border-[#D9D9D9] bg-white p-4 transition hover:border-[#d9cdbf]">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#F6F6F6] text-[#15110d]">
          <IconComponent className="h-4 w-4" />
        </span>
        <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#5E6266]">{label}</span>
      </div>
      <div className={`mt-3 text-[26px] font-semibold tracking-[-0.04em] text-[#15110d] ${NUM_FONT}`}>{value}</div>
      <p className="mt-1.5 text-[13px] leading-6 text-[#5E6266]">{helper}</p>
    </div>
  );
}

function DataTile({ label, value, helper, className = '' }) {
  return (
    <div className={`${TILE} p-4 ${className}`}>
      <div className={EYEBROW}>{label}</div>
      <div className={`mt-2 text-[19px] font-semibold leading-7 tracking-[-0.02em] text-[#15110d] ${NUM_FONT}`}>
        {value}
      </div>
      {helper ? <p className="mt-1.5 text-[13px] leading-6 text-[#5E6266]">{helper}</p> : null}
    </div>
  );
}

function Panel({ title, description, actions, children }) {
  return (
    <section className={`${PANEL} p-5 md:p-7`}>
      <div className="flex flex-col gap-4 border-b border-[#f2ece3] pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-[22px] font-semibold tracking-[-0.03em] text-[#15110d] md:text-[24px]">{title}</h2>
          {description ? (
            <p className="mt-2 max-w-[700px] text-[14px] leading-6 text-[#5E6266]">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2.5">{actions}</div> : null}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function TabButton({ tab, isActive, isLocked, onClick }) {
  const Icon = tab.icon;

  return (
    <button
      type="button"
      onClick={() => onClick(tab.id)}
      title={tab.description}
      className={`flex w-full items-center gap-2.5 rounded-[16px] border px-3 py-2.5 text-left transition sm:gap-3 sm:px-3.5 sm:py-3 ${
        isActive
          ? 'border-[#15110d] bg-[#15110d] text-white'
          : 'border-[#D9D9D9] bg-white text-[#15110d] hover:border-[#cabcae] hover:bg-[#F6F6F6]'
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
      {isLocked ? (
        <LockKeyhole className={`ml-auto h-3.5 w-3.5 shrink-0 ${isActive ? 'text-white/70' : 'text-[#a3968a]'}`} />
      ) : null}
    </button>
  );
}

function NoticeCard({ icon, title, message, statusMeta, actionLabel, onAction, hint }) {
  const IconComponent = icon;

  return (
    <div className="rounded-[22px] border border-dashed border-[#ddd0c1] bg-[#F6F6F6] p-5 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#15110d] text-white">
          <IconComponent className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-[19px] font-semibold tracking-[-0.02em] text-[#15110d]">{title}</h3>
            {statusMeta ? <StatusPill statusMeta={statusMeta} /> : null}
          </div>
          <p className="mt-2.5 max-w-[680px] text-[14px] leading-7 text-[#665a4e]">{message}</p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button type="button" onClick={onAction} className={BTN_PRIMARY}>
              {actionLabel}
              <ArrowRight className="h-4 w-4" />
            </button>
            {hint ? <span className="text-[13px] leading-6 text-[#5E6266]">{hint}</span> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function CommissionBreakdown({ pending, approved, paid }) {
  const values = { pending, approved, paid };
  const total = pending + approved + paid;

  return (
    <div className={`${TILE} p-5`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className={EYEBROW}>Dòng chảy hoa hồng</div>
        <div className={`text-[15px] font-semibold text-[#15110d] ${NUM_FONT}`}>Tổng {formatCurrency(total)}</div>
      </div>

      <div className="mt-4 flex h-3 w-full gap-[2px] overflow-hidden rounded-full bg-[#d9e1ff]">
        {total > 0
          ? commissionSegments.map((segment) => {
              const share = (values[segment.key] / total) * 100;

              if (share <= 0) {
                return null;
              }

              return (
                <span
                  key={segment.key}
                  className="h-full rounded-full"
                  style={{ width: `${share}%`, backgroundColor: segment.color }}
                />
              );
            })
          : null}
      </div>

      <div className="mt-5 space-y-3">
        {commissionSegments.map((segment) => (
          <div key={segment.key} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-inset ring-black/10"
                style={{ backgroundColor: segment.color }}
              />
              <span className="text-[14px] text-[#665a4e]">{segment.label}</span>
            </div>
            <span className={`text-[14.5px] font-semibold text-[#15110d] ${NUM_FONT}`}>
              {formatCurrency(values[segment.key])}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-4 border-t border-[#eee5da] pt-4 text-[13px] leading-6 text-[#5E6266]">
        Hoa hồng đi lần lượt từ chờ duyệt sang sẵn sàng đối soát rồi tới đã thanh toán.
      </p>
    </div>
  );
}

function ReferralLinkBox({ link, copyMessage, onCopy }) {
  const isCopied = Boolean(copyMessage) && isSuccessMessage(copyMessage);

  return (
    <div className={`${TILE} p-5`}>
      <div className={EYEBROW}>Link giới thiệu chính</div>
      <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center">
        <div
          className={`min-w-0 flex-1 break-all rounded-[16px] border border-[#e4dacd] bg-white px-4 py-3 text-[14.5px] leading-6 text-[#15110d] ${NUM_FONT}`}
        >
          {link}
        </div>
        <button type="button" onClick={onCopy} className={`${BTN_PRIMARY} shrink-0`}>
          {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {isCopied ? 'Đã copy' : 'Sao chép'}
        </button>
      </div>
      {copyMessage ? (
        <div className={`mt-2.5 text-[13px] ${isCopied ? 'text-[#156c42]' : 'text-[#a33a3a]'}`}>{copyMessage}</div>
      ) : null}
    </div>
  );
}

function LockedState() {
  return (
    <section className={`${PANEL} p-6 md:p-9`}>
      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div>
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-[16px] bg-[#15110d] text-white">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <h1 className="mt-6 text-[30px] font-semibold leading-[1.08] tracking-[-0.05em] text-[#15110d] md:text-[38px]">
            Đăng nhập để mở khu vực affiliate
          </h1>
          <p className="mt-4 max-w-[540px] text-[15px] leading-7 text-[#665a4e]">
            Sau khi đăng nhập, bạn có thể gửi hồ sơ đăng ký, chờ xét duyệt và theo dõi dashboard affiliate ngay trong
            một giao diện quản lý tương tự trang tài khoản của mình.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href="/account" className={`${BTN_PRIMARY} px-6 py-3.5 text-[15px]`}>
              Đăng nhập
            </Link>
            <Link href="/account?tab=register" className={`${BTN_GHOST} px-6 py-3.5 text-[15px]`}>
              Tạo tài khoản mới
            </Link>
          </div>
        </div>

        <div className={`${TILE} p-5 md:p-6`}>
          <div className={EYEBROW}>Quy trình tham gia</div>
          <div className="mt-5 space-y-3">
            {[
              'Đăng nhập tài khoản SRX và điền hồ sơ affiliate đầy đủ.',
              'Quản trị viên duyệt hồ sơ và kích hoạt tài khoản affiliate.',
              'Dùng dashboard để theo dõi link, click, đơn hàng và ngân hàng nhận commission.',
            ].map((item, index) => (
              <div key={item} className="flex gap-3.5 rounded-[16px] border border-[#ebe3d8] bg-white p-4">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#15110d] text-[13px] font-semibold text-white ${NUM_FONT}`}
                >
                  0{index + 1}
                </span>
                <div className="text-[14.5px] leading-7 text-[#5f5449]">{item}</div>
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
  const lockedFeatureCopy = getLockedFeatureCopy(status);
  const activeTabMeta = affiliateTabs.find((tab) => tab.id === activeTab) ?? affiliateTabs[0];

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
        label: 'Hoa hồng đã trả',
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

  const renderGate = () =>
    !areAffiliateToolsUnlocked ? (
      <NoticeCard
        icon={LockKeyhole}
        title="Mục này mở sau khi hồ sơ được duyệt"
        message={lockedFeatureCopy}
        statusMeta={statusMeta}
        actionLabel="Đi tới hồ sơ"
        onAction={() => setActiveTab('profile')}
        hint="Hồ sơ duyệt xong sẽ mở tổng quan, link, thống kê và ngân hàng."
      />
    ) : (
      <NoticeCard
        icon={BadgeCheck}
        title="Hồ sơ đã duyệt, đang chờ cấp mã affiliate"
        message="Khi quản trị viên tạo xong mã affiliate và tài khoản ref trong hệ thống, phần thống kê, link và ngân hàng sẽ tự có dữ liệu thật."
        actionLabel="Xem hỗ trợ"
        onAction={() => setActiveTab('support')}
        hint="Đây là trạng thái trung gian giữa duyệt hồ sơ và khởi tạo dữ liệu."
      />
    );

  const renderOverviewSection = () => (
    <Panel
      title="Bảng điều khiển affiliate"
      description={activeTabMeta.description}
      actions={
        hasAffiliateAccount ? (
          <>
            <button type="button" onClick={handleCopyLink} className={BTN_PRIMARY}>
              <Copy className="h-4 w-4" />
              Sao chép link
            </button>
            <button type="button" onClick={() => setActiveTab('links')} className={BTN_GHOST}>
              Xem link affiliate
              <ArrowRight className="h-4 w-4" />
            </button>
          </>
        ) : null
      }
    >
      {!hasAffiliateAccount ? (
        renderGate()
      ) : (
        <>
          <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
            {overviewCards.map((card) => (
              <MetricCard key={card.label} {...card} />
            ))}
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
            <div className="space-y-3.5">
              <ReferralLinkBox
                link={snapshot.account.referralLink}
                copyMessage={copyMessage}
                onCopy={handleCopyLink}
              />
              <div className="grid gap-3.5 sm:grid-cols-2">
                <DataTile label="Mã affiliate" value={snapshot.account.affiliateCode} />
                <DataTile
                  label="Cách tính commission"
                  value={
                    snapshot.account.commissionType === 'percent'
                      ? `${snapshot.account.commissionRate}% / đơn hợp lệ`
                      : `${formatCurrency(snapshot.account.commissionRate)} / đơn hợp lệ`
                  }
                />
              </div>
            </div>

            <div className="space-y-3.5">
              <div className={`${TILE} p-5`}>
                <div className="flex items-start justify-between gap-3">
                  <div className={EYEBROW}>Trạng thái hồ sơ</div>
                  <StatusPill statusMeta={statusMeta} />
                </div>
                <div className="mt-3 text-[18px] font-semibold leading-7 tracking-[-0.02em] text-[#15110d]">
                  {statusMeta.title}
                </div>
                <p className="mt-2 text-[13.5px] leading-6 text-[#5E6266]">{statusMeta.description}</p>
              </div>

              <div className="rounded-[20px] bg-[#15110d] p-5 text-white">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
                  Cookie ghi nhận
                </div>
                <div className={`mt-2 text-[26px] font-semibold tracking-[-0.04em] ${NUM_FONT}`}>
                  {snapshot.account.cookieDurationDays} ngày
                </div>
                <p className="mt-2 text-[13.5px] leading-6 text-white/70">
                  Người dùng truy cập qua link của bạn sẽ được hệ thống ghi nhận trong thời gian này.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </Panel>
  );

  const renderPerformanceSection = () => (
    <Panel title="Hiệu suất affiliate" description={activeTabMeta.description}>
      {!hasAffiliateAccount ? (
        renderGate()
      ) : (
        <>
          <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
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

          <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <CommissionBreakdown
              pending={performanceStats.pendingCommission}
              approved={performanceStats.approvedCommission}
              paid={performanceStats.paidCommission}
            />

            <div className="space-y-3.5">
              <DataTile
                label="Commission chờ duyệt"
                value={formatCurrency(performanceStats.pendingCommission)}
                helper="Đơn đang chờ hoàn tất điều kiện để được tính vào đối soát."
              />
              <DataTile
                label="Commission đã thanh toán"
                value={formatCurrency(performanceStats.paidCommission)}
                helper="Tổng tiền hoa hồng đã được chi trả vào tài khoản của bạn."
              />
              <DataTile
                label="Trung bình mỗi đơn"
                value={
                  performanceStats.orders > 0
                    ? formatCurrency(
                        Math.round(
                          (performanceStats.pendingCommission +
                            performanceStats.approvedCommission +
                            performanceStats.paidCommission) /
                            performanceStats.orders,
                        ),
                      )
                    : '—'
                }
                helper="Tổng hoa hồng chia cho số đơn hàng đã ghi nhận."
              />
            </div>
          </div>
        </>
      )}
    </Panel>
  );

  const renderLinksSection = () => (
    <Panel
      title="Quản lý link giới thiệu"
      description={activeTabMeta.description}
      actions={
        hasAffiliateAccount ? (
          <a href={snapshot.account.referralLink} target="_blank" rel="noreferrer" className={BTN_GHOST}>
            <ExternalLink className="h-4 w-4" />
            Mở thử link
          </a>
        ) : null
      }
    >
      {!hasAffiliateAccount ? (
        renderGate()
      ) : (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
          <div className="space-y-3.5">
            <ReferralLinkBox
              link={snapshot.account.referralLink}
              copyMessage={copyMessage}
              onCopy={handleCopyLink}
            />
            <div className="grid gap-3.5 sm:grid-cols-2">
              <DataTile label="Mã affiliate" value={snapshot.account.affiliateCode} />
              <DataTile label="Thời gian cookie" value={`${snapshot.account.cookieDurationDays} ngày`} />
            </div>
          </div>

          <div className={`${TILE} p-5`}>
            <div className={EYEBROW}>Cách dùng hiệu quả</div>
            <div className="mt-4 space-y-2.5">
              {[
                'Gắn link affiliate vào bio social, bài viết và landing page riêng.',
                'Dùng cùng nội dung review hoặc chia sẻ routine để tăng tỷ lệ click.',
                'Theo dõi lượt click và lượt mua tại mục thống kê để tối ưu kênh bán.',
              ].map((item) => (
                <div key={item} className="flex gap-3 rounded-[16px] border border-[#ebe3d8] bg-white p-3.5">
                  <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#15110d]" />
                  <div className="text-[13.5px] leading-6 text-[#665a4e]">{item}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Panel>
  );

  const renderProfileSection = () => (
    <Panel
      title="Quản lý hồ sơ affiliate"
      description={activeTabMeta.description}
      actions={<StatusPill statusMeta={statusMeta} />}
    >
      {snapshot?.application?.reviewNote ? (
        <div className="mb-5 flex gap-3 rounded-[18px] border border-[#efc7c7] bg-[#fff5f5] px-4 py-3.5 text-[13.5px] leading-6 text-[#8e3939]">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <div className="font-semibold">Ghi chú từ quản trị viên</div>
            <div className="mt-1">{snapshot.application.reviewNote}</div>
          </div>
        </div>
      ) : null}

      {applicationMessage ? (
        <div className={`mb-5 rounded-[18px] border px-4 py-3.5 text-[13.5px] leading-6 ${getMessageTone(applicationMessage)}`}>
          {applicationMessage}
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <form onSubmit={handleApplicationSubmit} className={`${TILE} space-y-4 p-5 md:p-6`}>
          <div className="grid gap-4 md:grid-cols-2">
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
              placeholder="09xxxxxxxx"
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

          <div className="grid gap-4 md:grid-cols-3">
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

          <div className="grid gap-4 md:grid-cols-2">
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

          <div className="flex flex-col gap-3 border-t border-[#eee6db] pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-[13px] leading-6 text-[#5E6266]">
              Quản trị viên sẽ xét duyệt thủ công dựa trên hồ sơ và kênh social của bạn.
            </div>
            <button type="submit" disabled={isSavingApplication} className={`${BTN_PRIMARY} shrink-0`}>
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

        <div className="space-y-3.5">
          <div className="rounded-[20px] border border-[#D9D9D9] bg-white p-5">
            <div className={EYEBROW}>Trạng thái hiện tại</div>
            <div className="mt-3 text-[18px] font-semibold leading-7 tracking-[-0.02em] text-[#15110d]">
              {statusMeta.title}
            </div>
            <p className="mt-2 text-[13.5px] leading-6 text-[#5E6266]">{statusMeta.description}</p>
          </div>

          <DataTile label="Ngày gửi hồ sơ" value={formatDate(snapshot?.application?.createdAt)} />
          <DataTile
            label="Ngày xét duyệt"
            value={formatDate(snapshot?.account?.approvedAt ?? snapshot?.application?.reviewedAt)}
          />
        </div>
      </div>
    </Panel>
  );

  const renderBankSection = () => (
    <Panel title="Tài khoản nhận commission" description={activeTabMeta.description}>
      {!hasAffiliateAccount ? (
        renderGate()
      ) : (
        <>
          {bankMessage ? (
            <div className={`mb-5 rounded-[18px] border px-4 py-3.5 text-[13.5px] leading-6 ${getMessageTone(bankMessage)}`}>
              {bankMessage}
            </div>
          ) : null}

          <div className="grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)]">
            <div className="space-y-3.5">
              <div className="rounded-[20px] border border-[#D9D9D9] bg-white p-5">
                <div className={EYEBROW}>Tài khoản hiện tại</div>
                <div className="mt-3 text-[18px] font-semibold leading-7 tracking-[-0.02em] text-[#15110d]">
                  {snapshot?.bankAccount?.bankName || 'Chưa lưu ngân hàng'}
                </div>
                <div className="mt-1.5 text-[13.5px] leading-6 text-[#5E6266]">
                  {snapshot?.bankAccount?.accountHolderName || 'Chưa có tên chủ tài khoản'}
                </div>
                <div className={`mt-1 text-[14px] leading-6 text-[#665a4e] ${NUM_FONT}`}>
                  {maskAccountNumber(snapshot?.bankAccount?.accountNumber)}
                </div>
              </div>

              <DataTile
                label="Lần cập nhật gần nhất"
                value={formatDate(snapshot?.bankAccount?.updatedAt)}
                helper="Hãy kiểm tra kỹ số tài khoản và tên chủ tài khoản trước khi lưu."
              />
            </div>

            <form onSubmit={handleBankSubmit} className={`${TILE} space-y-4 p-5 md:p-6`}>
              <div className="grid gap-4 md:grid-cols-2">
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

              <div className="grid gap-4 md:grid-cols-2">
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

              <div className="flex justify-end border-t border-[#eee6db] pt-5">
                <button type="submit" disabled={isSavingBank} className={BTN_PRIMARY}>
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
    </Panel>
  );

  const renderSupportSection = () => (
    <Panel
      title="Hướng dẫn vận hành affiliate"
      description={activeTabMeta.description}
      actions={
        <Link href="/chinh-sach-affiliate" className={BTN_GHOST}>
          Chính sách affiliate
          <ArrowRight className="h-4 w-4" />
        </Link>
      }
    >
      <div className="grid gap-3.5 lg:grid-cols-3">
        {[
          {
            icon: ShieldCheck,
            title: 'Hoàn tất hồ sơ',
            body: 'Kiểm tra lại họ tên, CCCD, số điện thoại và social link ở mục Hồ sơ trước khi gửi xét duyệt.',
          },
          {
            icon: BadgeCheck,
            title: 'Chờ kích hoạt',
            body: 'Sau khi hồ sơ được duyệt, quản trị viên sẽ kích hoạt tài khoản affiliate để mở tổng quan, link và ngân hàng.',
          },
          {
            icon: Wallet,
            title: 'Đối soát commission',
            body: 'Hãy lưu sẵn tài khoản ngân hàng để sẵn sàng cho bước chi trả khi commission được duyệt thanh toán.',
          },
        ].map((step, index) => {
          const StepIcon = step.icon;

          return (
            <div key={step.title} className={`${TILE} p-5`}>
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[#15110d] text-white">
                  <StepIcon className="h-4 w-4" />
                </span>
                <span className={`text-[13px] font-semibold text-[#5E6266] ${NUM_FONT}`}>0{index + 1}</span>
              </div>
              <div className="mt-4 text-[17px] font-semibold tracking-[-0.02em] text-[#15110d]">{step.title}</div>
              <p className="mt-2 text-[13.5px] leading-6 text-[#5E6266]">{step.body}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-5 rounded-[20px] border border-[#D9D9D9] bg-white p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className={EYEBROW}>Cần hỗ trợ thêm?</div>
            <div className="mt-2.5 text-[18px] font-semibold tracking-[-0.02em] text-[#15110d]">
              Bạn có thể gửi yêu cầu hỗ trợ hoặc cập nhật hồ sơ bất cứ lúc nào.
            </div>
            <p className="mt-2 max-w-[680px] text-[13.5px] leading-6 text-[#5E6266]">
              Nếu hồ sơ đang bị từ chối hoặc chờ duyệt quá lâu, hãy liên hệ đội ngũ SRX để được kiểm tra lại trạng thái.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={() => setActiveTab('profile')} className={BTN_PRIMARY}>
              Xem hồ sơ
              <ArrowRight className="h-4 w-4" />
            </button>
            <Link href="/contact" className={BTN_GHOST}>
              Liên hệ hỗ trợ
            </Link>
          </div>
        </div>
      </div>
    </Panel>
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
    <section className="bg-[#f9f9f9] py-10 md:py-16 md:min-h-[960px]">
      <div className="mx-auto max-w-[1440px] px-4 md:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="mt-3 text-[28px] font-semibold leading-tight tracking-[-0.04em] text-[#15110d] md:text-[34px]">
              Khu vực cộng tác viên
            </h1>
          </div>
          {user ? <StatusPill statusMeta={statusMeta} className="self-start lg:self-auto" /> : null}
        </div>

        <div className="mt-7">
          {isLoading ? (
            <div className={`${PANEL} flex min-h-[260px] items-center justify-center text-[15px] text-[#665a4e]`}>
              <LoaderCircle className="mr-3 h-5 w-5 animate-spin" />
              Đang kiểm tra trạng thái tài khoản...
            </div>
          ) : !user ? (
            <LockedState />
          ) : (
            <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)] xl:items-start">
              <aside className="space-y-4 xl:sticky xl:top-24">
                <div className={`${PANEL} p-5`}>
                  <div className="flex items-center gap-3.5">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#15110d] text-white">
                      <UserRound className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-[16px] font-semibold leading-6 tracking-[-0.02em] text-[#15110d]">
                        {affiliateUser?.fullName || affiliateUser?.displayName || affiliateUser?.email}
                      </div>
                      <div className="truncate text-[13px] text-[#5E6266]">{affiliateUser?.email}</div>
                    </div>
                  </div>
                  {affiliateUser?.phone ? (
                    <div className={`mt-3.5 border-t border-[#f2ece3] pt-3.5 text-[13.5px] text-[#5E6266] ${NUM_FONT}`}>
                      {affiliateUser.phone}
                    </div>
                  ) : null}
                </div>

                <div className={`${PANEL} p-3`}>
                  <div className={`${EYEBROW} px-2 pb-2.5 pt-1.5`}>Khu vực affiliate</div>
                  <nav className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-1 xl:gap-1.5">
                    {affiliateTabs.map((tab) => (
                      <TabButton
                        key={tab.id}
                        tab={tab}
                        isActive={activeTab === tab.id}
                        isLocked={tab.requiresUnlock && !areAffiliateToolsUnlocked}
                        onClick={setActiveTab}
                      />
                    ))}
                  </nav>
                </div>
              </aside>

              <div className="space-y-4">
                {snapshot?.schemaNeedsUpdate ? (
                  <div className="flex gap-3 rounded-[20px] border border-[#f2d2a6] bg-[#fff7ea] px-4 py-3.5 text-[13.5px] leading-6 text-[#7b5b1a]">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <div>
                      Cơ sở dữ liệu hiện chưa có đủ trường cho affiliate. Hãy chạy file
                      <span className="mx-1 font-semibold">database/mysql/05_affiliate_management.sql</span>
                      trước khi dùng dữ liệu thật.
                    </div>
                  </div>
                ) : null}

                {snapshotError ? (
                  <div className="flex gap-3 rounded-[20px] border border-[#efc4c4] bg-[#fff4f4] px-4 py-3.5 text-[13.5px] leading-6 text-[#a33a3a]">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <div>{snapshotError}</div>
                  </div>
                ) : null}

                {isSnapshotLoading && !snapshot ? (
                  <div className={`${PANEL} flex min-h-[220px] items-center justify-center text-[15px] text-[#665a4e]`}>
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
