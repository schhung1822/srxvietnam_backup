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
  Link2,
  LineChart,
  LoaderCircle,
  ShieldCheck,
  UserRound,
  Wallet,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.jsx';

const moneyFormatter = new Intl.NumberFormat('vi-VN');
const dateFormatter = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' });

const genderOptions = [
  { value: 'prefer_not_to_say', label: 'Chưa muốn chia sẻ' },
  { value: 'male', label: 'Nam' },
  { value: 'female', label: 'Nữ' },
  { value: 'other', label: 'Khác' },
];

const applicationStatusMap = {
  pending: {
    label: 'Chờ duyệt',
    tone: 'border-[#ecd8a0] bg-[#fff8df] text-[#7e5c0c]',
    title: 'Hồ sơ đang chờ quản trị viên duyệt',
    description:
      'Bạn đã hoàn tất bước đăng ký affiliate. Quản trị viên sẽ rà soát hồ sơ và kích hoạt mã giới thiệu sau khi xác minh thông tin.',
  },
  approved: {
    label: 'Đã duyệt',
    tone: 'border-[#b9e4ce] bg-[#eefbf3] text-[#167245]',
    title: 'Hồ sơ đã được duyệt',
    description:
      'Bạn đã đủ điều kiện tham gia affiliate. Nếu chưa thấy dashboard hoạt động, quản trị viên vẫn cần tạo mã affiliate và bật tài khoản trong SQL.',
  },
  rejected: {
    label: 'Cần cập nhật',
    tone: 'border-[#f1c0c0] bg-[#fff1f1] text-[#a43838]',
    title: 'Hồ sơ cần bổ sung lại thông tin',
    description:
      'Bạn có thể chỉnh sửa thông tin ngay bên dưới và gửi lại hồ sơ. Sau khi lưu, trạng thái sẽ trở về chờ duyệt.',
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

function parseJson(response) {
  return response
    .json()
    .catch(() => ({}));
}

function formatCurrency(value) {
  return `${moneyFormatter.format(Number(value ?? 0))}đ`;
}

function formatDate(value) {
  if (!value) {
    return 'Chưa có dữ liệu';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Chưa có dữ liệu';
  }

  return dateFormatter.format(date);
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

function getStatusMeta(status) {
  return applicationStatusMap[status] ?? {
    label: 'Chưa đăng ký',
    tone: 'border-[#e7e1d8] bg-[#faf7f2] text-[#665a4e]',
    title: 'Chưa gửi hồ sơ affiliate',
    description:
      'Điền thông tin pháp lý và kênh social của bạn để bắt đầu quy trình xét duyệt affiliate.',
  };
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

function StatCard({ icon: Icon, label, value, helper }) {
  return (
    <div className="rounded-[24px] border border-[#ece4da] bg-white p-5 shadow-[0_18px_40px_rgba(22,17,13,0.05)]">
      {Icon ? (
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#15110d] text-white">
          <Icon className="h-5 w-5" />
        </div>
      ) : null}
      <div className="mt-4 text-[13px] uppercase tracking-[0.16em] text-[#8d7f72]">{label}</div>
      <div className="mt-2 text-[30px] font-semibold tracking-[-0.05em] text-[#15110d]">{value}</div>
      <div className="mt-2 text-[14px] leading-6 text-[#6a5e53]">{helper}</div>
    </div>
  );
}

function SectionCard({ eyebrow, title, description, children, aside }) {
  return (
    <section className="rounded-[30px] border border-[#ece4da] bg-white p-6 shadow-[0_22px_60px_rgba(22,17,13,0.06)] md:p-8">
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_260px]">
        <div>
          <div className="text-[12px] font-semibold uppercase tracking-[0.24em] text-[#8d7f72]">
            {eyebrow}
          </div>
          <h2 className="mt-4 text-[28px] font-semibold leading-tight tracking-[-0.05em] text-[#15110d] md:text-[34px]">
            {title}
          </h2>
          {description ? (
            <p className="mt-4 max-w-[760px] text-[15px] leading-8 text-[#665a4e]">{description}</p>
          ) : null}
          <div className="mt-8">{children}</div>
        </div>
        {aside ? <div className="xl:pl-2">{aside}</div> : null}
      </div>
    </section>
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
            Bạn cần có tài khoản SRX trước khi gửi hồ sơ affiliate. Sau khi đăng nhập, hệ thống sẽ
            hiển thị form đăng ký và dashboard quản lý link giới thiệu, hoa hồng và ngân hàng thụ hưởng.
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
          <div className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#8d7f72]">
            Quy trình tham gia
          </div>
          <div className="mt-6 space-y-4">
            {[
              'Đăng nhập tài khoản SRX và điền hồ sơ affiliate đầy đủ.',
              'Quản trị viên sẽ xem xét và phê duyệt hồ sơ của bạn.',
              'Sau khi được phê duyệt, bạn sẽ trở thành cộng tác viên chính thức.',
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

  const applicationForm = useForm({
    defaultValues: defaultApplicationValues,
  });

  const bankForm = useForm({
    defaultValues: defaultBankValues,
  });

  const affiliateUser = profileUser ?? user;
  const status = snapshot?.application?.status ?? 'idle';
  const statusMeta = getStatusMeta(status);
  const hasAffiliateAccount = Boolean(snapshot?.account);
  const isApprovedOnly = snapshot?.application?.status === 'approved' && !snapshot?.account;

  const overviewCards = useMemo(() => {
    if (!snapshot?.account) {
      return [];
    }

    return [
      {
        icon: Link2,
        label: 'Lượt click',
        value: moneyFormatter.format(snapshot.account.totalClicks ?? 0),
        helper: 'Tổng lượt truy cập qua link giới thiệu của bạn.',
      },
      {
        icon: LineChart,
        label: 'Đơn hàng ghi nhận',
        value: moneyFormatter.format(snapshot.account.totalOrders ?? 0),
        helper: 'Số đơn đã được liên kết với mã affiliate hiện tại.',
      },
      {
        icon: Wallet,
        label: 'Hoa hồng chờ duyệt',
        value: formatCurrency(snapshot.account.pendingCommission),
        helper: 'Khoản tạm tính, sẽ đối soát sau khi đơn đủ điều kiện.',
      },
      {
        icon: Banknote,
        label: 'Hoa hồng đã thanh toán',
        value: formatCurrency(snapshot.account.paidCommission),
        helper: 'Tổng số tiền đã chi trả cho tài khoản của bạn.',
      },
    ];
  }, [snapshot?.account]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!user) {
      setProfileUser(null);
      setSnapshot(null);
      setSnapshotError('');
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
        throw new Error(data.message ?? 'Không thể cập nhật ngân hàng thụ hưởng.');
      }

      setProfileUser(data.user ?? profileUser);
      setSnapshot(data.snapshot ?? snapshot);
      bankForm.reset(getBankDefaults(data.snapshot?.bankAccount));
      setBankMessage('Đã lưu thông tin ngân hàng thụ hưởng.');
    } catch (error) {
      setBankMessage(error.message);
    } finally {
      setIsSavingBank(false);
    }
  });

  const handleCopyLink = async () => {
    if (!snapshot?.account?.referralLink) {
      return;
    }

    try {
      await navigator.clipboard.writeText(snapshot.account.referralLink);
      setCopyMessage('Đã sao chép link affiliate.');
    } catch {
      setCopyMessage('Không thể sao chép tự động. Hãy copy thủ công.');
    }
  };

  return (
    <section className="bg-[linear-gradient(180deg,#fcfaf8_0%,#f6f1ea_58%,#fcfaf8_100%)] py-12 md:py-16 lg:py-20">
      <div className="mx-auto max-w-[1320px] px-4 md:px-6">
        <div className="rounded-[34px] border border-[#ece4da] bg-white px-6 py-8 shadow-[0_28px_90px_rgba(22,17,13,0.08)] md:px-8 md:py-10 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
            <div>
              <div className="text-[12px] font-semibold uppercase tracking-[0.26em] text-[#8d7f72]">
                SRX Affiliate
              </div>
              <h1 className="mt-2 text-[30px] font-semibold leading-[0.96] tracking-[-0.07em] text-[#15110d] md:text-[48px] lg:text-[60px]">
                Đăng ký cộng tác viên affiliate.
              </h1>
              <p className="mt-6 max-w-[840px] text-[16px] leading-8 text-[#665a4e]">
                Khu vực này dành cho Affiliate của SRX. Bạn có thể gửi hồ sơ xét duyệt,
                cập nhật thông tin pháp lý để trở thành cộng tác viên chính thức của SRX và bắt đầu kiếm hoa hồng từ việc giới thiệu khách hàng qua link affiliate cá nhân.
              </p>
            </div>
          </div>
        </div>

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
              <aside className="space-y-6">
                <div className="rounded-[30px] border border-[#ece4da] bg-white p-6 shadow-[0_18px_50px_rgba(22,17,13,0.05)]">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#15110d] text-white">
                    <UserRound className="h-6 w-6" />
                  </div>
                  <div className="mt-5 text-[12px] uppercase tracking-[0.2em] text-[#8d7f72]">Thành viên</div>
                  <div className="mt-2 text-[24px] font-semibold leading-tight tracking-[-0.05em] text-[#15110d]">
                    {affiliateUser?.fullName || affiliateUser?.displayName || affiliateUser?.email}
                  </div>
                  <div className="mt-2 text-[14px] text-[#665a4e]">{affiliateUser?.email}</div>
                  {affiliateUser?.phone ? (
                    <div className="mt-1 text-[14px] text-[#665a4e]">{affiliateUser.phone}</div>
                  ) : null}

                  <div className={`mt-6 inline-flex rounded-full border px-4 py-2 text-[13px] font-semibold ${statusMeta.tone}`}>
                    {statusMeta.label}
                  </div>

                  <div className="mt-5 rounded-[22px] border border-[#eee6db] bg-[#fcfaf8] p-4">
                    <div className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[#8d7f72]">
                      Trạng thái hồ sơ
                    </div>
                    <div className="mt-3 text-[18px] font-semibold leading-7 text-[#15110d]">
                      {statusMeta.title}
                    </div>
                    <div className="mt-3 text-[14px] leading-7 text-[#665a4e]">{statusMeta.description}</div>
                    {snapshot?.application?.reviewNote ? (
                      <div className="mt-4 rounded-[18px] border border-[#efd3d3] bg-[#fff5f5] p-4 text-[14px] leading-7 text-[#7c2d2d]">
                        <div className="font-semibold">Ghi chú từ quản trị viên</div>
                        <div className="mt-1">{snapshot.application.reviewNote}</div>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="rounded-[30px] border border-[#ece4da] bg-white p-6 shadow-[0_18px_50px_rgba(22,17,13,0.05)]">
                  <div className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#8d7f72]">
                    Quyền lợi sau khi duyệt
                  </div>
                  <div className="mt-5 space-y-3">
                    {[
                      'Link affiliate cá nhân dạng ?ref=masoid.',
                      'Theo dõi click, đơn hàng và hoa hồng ngay trong dashboard.',
                      'Lưu ngân hàng thụ hưởng để chuẩn bị cho bước đối soát sau.',
                    ].map((item) => (
                      <div key={item} className="flex gap-3 rounded-[20px] border border-[#ece4da] bg-[#fcfaf8] p-4">
                        <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#15110d]" />
                        <div className="text-[14px] leading-7 text-[#665a4e]">{item}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </aside>

              <div className="space-y-8">
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

                {isSnapshotLoading ? (
                  <div className="flex min-h-[220px] items-center justify-center rounded-[30px] border border-[#ece4da] bg-white text-[15px] text-[#665a4e] shadow-[0_18px_50px_rgba(22,17,13,0.05)]">
                    <LoaderCircle className="mr-3 h-5 w-5 animate-spin" />
                    Đang tải dữ liệu affiliate...
                  </div>
                ) : null}

                {hasAffiliateAccount ? (
                  <>
                    <SectionCard
                      eyebrow="Affiliate Dashboard"
                      title="Bảng điều khiển hoạt động affiliate"
                      description="Hiện tại phần này tập trung vào giao diện và thông tin tổng quan. Phần xử lý đối soát đơn hàng và tính commission tự động sẽ được nối ở bước sau."
                      aside={
                        <div className="space-y-4">
                          <div className="rounded-[24px] border border-[#ece4da] bg-[#fcfaf8] p-5">
                            <div className="text-[12px] uppercase tracking-[0.18em] text-[#8d7f72]">
                              Mã affiliate
                            </div>
                            <div className="mt-2 text-[28px] font-semibold tracking-[0.02em] text-[#15110d]">
                              {snapshot.account.affiliateCode}
                            </div>
                            <div className="mt-3 text-[14px] leading-7 text-[#665a4e]">
                              {snapshot.account.commissionType === 'percent'
                                ? `Hoa hồng ${snapshot.account.commissionRate}% cho mỗi đơn đủ điều kiện.`
                                : `Hoa hồng cố định ${formatCurrency(snapshot.account.commissionRate)} mỗi đơn.`}
                            </div>
                          </div>

                          <div className="rounded-[24px] border border-[#ece4da] bg-[#15110d] p-5 text-white">
                            <div className="text-[12px] uppercase tracking-[0.18em] text-white/70">
                              Cookie ghi nhận
                            </div>
                            <div className="mt-2 text-[28px] font-semibold tracking-[-0.04em]">
                              {snapshot.account.cookieDurationDays} ngày
                            </div>
                            <div className="mt-3 text-[14px] leading-7 text-white/75">
                              Người dùng truy cập qua link của bạn sẽ được ghi nhận trong khoảng thời gian này.
                            </div>
                          </div>
                        </div>
                      }
                    >
                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {overviewCards.map((card) => (
                          <StatCard key={card.label} {...card} />
                        ))}
                      </div>

                      <div className="mt-8 rounded-[26px] border border-[#ece4da] bg-[#fcfaf8] p-5">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                          <div>
                            <div className="text-[12px] uppercase tracking-[0.18em] text-[#8d7f72]">
                              Link giới thiệu
                            </div>
                            <div className="mt-3 break-all text-[15px] leading-7 text-[#15110d]">
                              {snapshot.account.referralLink}
                            </div>
                          </div>
                          <div className="flex flex-col gap-3 sm:flex-row">
                            <button
                              type="button"
                              onClick={handleCopyLink}
                              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#15110d] px-5 py-3 text-[14px] font-semibold text-white transition hover:bg-[#2b2520]"
                            >
                              <Copy className="h-4 w-4" />
                              Sao chép link
                            </button>
                            <Link
                              href={snapshot.account.referralLink}
                              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#15110d] px-5 py-3 text-[14px] font-semibold text-[#15110d] transition hover:bg-[#15110d] hover:text-white"
                            >
                              <ExternalLink className="h-4 w-4" />
                              Mở thử link
                            </Link>
                          </div>
                        </div>
                        {copyMessage ? (
                          <div className="mt-4 text-[13px] text-[#665a4e]">{copyMessage}</div>
                        ) : null}
                      </div>
                    </SectionCard>
                  </>
                ) : (
                  <SectionCard
                    eyebrow="Đăng ký Affiliate"
                    title={
                      isApprovedOnly
                        ? 'Hồ sơ đã duyệt, đang chờ tạo mã affiliate'
                        : snapshot?.application?.status === 'pending'
                          ? 'Hồ sơ affiliate đang trong hàng chờ duyệt'
                          : snapshot?.application?.status === 'rejected'
                            ? 'Cập nhật hồ sơ và gửi lại để xét duyệt'
                            : 'Điền hồ sơ để bắt đầu tham gia affiliate'
                    }
                    description={
                      isApprovedOnly
                        ? 'Quản trị viên đã duyệt hồ sơ của bạn nhưng chưa tạo bản ghi affiliate account. Tạm thời bạn vẫn có thể chỉnh lại thông tin cá nhân ngay bên dưới.'
                        : 'Bạn cần hoàn thành đầy đủ hồ sơ trước khi hệ thống hiển thị dashboard và link giới thiệu cá nhân.'
                    }
                    aside={
                      <div className="space-y-4">
                        <div className="rounded-[24px] border border-[#ece4da] bg-[#fcfaf8] p-5">
                          <div className="text-[12px] uppercase tracking-[0.18em] text-[#8d7f72]">
                            Hồ sơ hiện tại
                          </div>
                          <div className="mt-3 text-[18px] font-semibold leading-7 text-[#15110d]">
                            {statusMeta.title}
                          </div>
                          <div className="mt-3 text-[14px] leading-7 text-[#665a4e]">
                            {statusMeta.description}
                          </div>
                        </div>

                        <div className="rounded-[24px] border border-[#ece4da] bg-[#fcfaf8] p-5">
                          <div className="text-[12px] uppercase tracking-[0.18em] text-[#8d7f72]">
                            Lưu ý xét duyệt
                          </div>
                          <div className="mt-3 space-y-3 text-[14px] leading-7 text-[#665a4e]">
                            <div>Thông tin CCCD, địa chỉ và social link nên trùng với hồ sơ bạn dùng để cộng tác.</div>
                            <div>Quản trị viên sẽ duyệt thủ công trên SQL ở giai đoạn hiện tại.</div>
                          </div>
                        </div>
                      </div>
                    }
                  >
                    {snapshot?.application?.reviewNote ? (
                      <div className="mb-6 rounded-[22px] border border-[#efc7c7] bg-[#fff5f5] px-5 py-4 text-[14px] leading-7 text-[#8e3939]">
                        <div className="font-semibold">Ghi chú từ quản trị viên</div>
                        <div className="mt-1">{snapshot.application.reviewNote}</div>
                      </div>
                    ) : null}

                    {applicationMessage ? (
                      <div
                        className={`mb-6 rounded-[22px] px-5 py-4 text-[14px] leading-7 ${
                          applicationMessage.startsWith('Đã')
                            ? 'border border-[#c7e7d3] bg-[#effbf3] text-[#156c42]'
                            : 'border border-[#efc4c4] bg-[#fff4f4] text-[#a33a3a]'
                        }`}
                      >
                        {applicationMessage}
                      </div>
                    ) : null}

                    <form onSubmit={handleApplicationSubmit} className="space-y-5">
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
                          Sau khi gửi, quản trị viên sẽ xem xét hồ sơ của bạn và phê duyệt.
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
                  </SectionCard>
                )}

                <SectionCard
                  eyebrow="Thông tin quản lý"
                  title="Hồ sơ affiliate và ngân hàng thụ hưởng"
                  description="Phần hồ sơ luôn có thể cập nhật lại. Thông tin ngân hàng sẽ sẵn sàng cho bước thanh toán commission khi backend đối soát đơn hàng được triển khai."
                  aside={
                    <div className="space-y-4">
                      <div className="rounded-[24px] border border-[#ece4da] bg-[#fcfaf8] p-5">
                        <div className="text-[12px] uppercase tracking-[0.18em] text-[#8d7f72]">Ngày gửi hồ sơ</div>
                        <div className="mt-2 text-[20px] font-semibold text-[#15110d]">
                          {formatDate(snapshot?.application?.createdAt)}
                        </div>
                      </div>
                      <div className="rounded-[24px] border border-[#ece4da] bg-[#fcfaf8] p-5">
                        <div className="text-[12px] uppercase tracking-[0.18em] text-[#8d7f72]">Lần cập nhật gần nhất</div>
                        <div className="mt-2 text-[20px] font-semibold text-[#15110d]">
                          {formatDate(snapshot?.bankAccount?.updatedAt ?? snapshot?.application?.updatedAt)}
                        </div>
                      </div>
                    </div>
                  }
                >
                  <div className="grid gap-8 xl:grid-cols-2">
                    <div className="rounded-[26px] border border-[#ece4da] bg-[#fcfaf8] p-5 md:p-6">
                      <div className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#8d7f72]">
                        Hồ sơ affiliate
                      </div>
                      <div className="mt-3 text-[22px] font-semibold tracking-[-0.04em] text-[#15110d]">
                        Luôn có thể cập nhật lại
                      </div>
                      <p className="mt-3 text-[14px] leading-7 text-[#665a4e]">
                        Khi hồ sơ đã được duyệt, việc chỉnh sửa thông tin tại đây sẽ chỉ cập nhật lại dữ liệu hồ sơ mà không làm mất mã affiliate hiện có.
                      </p>
                    </div>

                    <div className="rounded-[26px] border border-[#ece4da] bg-[#fcfaf8] p-5 md:p-6">
                      <div className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#8d7f72]">
                        Ngân hàng thụ hưởng
                      </div>
                      <div className="mt-3 text-[22px] font-semibold tracking-[-0.04em] text-[#15110d]">
                        {hasAffiliateAccount ? 'Đã sẵn sàng để cập nhật' : 'Sẽ mở sau khi được kích hoạt'}
                      </div>
                      <p className="mt-3 text-[14px] leading-7 text-[#665a4e]">
                        {hasAffiliateAccount
                          ? 'Bạn có thể lưu sẵn tài khoản ngân hàng ngay từ bây giờ để phục vụ bước thanh toán commission sau này.'
                          : 'Ngân hàng thụ hưởng chỉ được mở khi quản trị viên đã tạo affiliate account và mã ref cho bạn.'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 grid gap-6 xl:grid-cols-2">
                    {hasAffiliateAccount ? (
                      <div className="rounded-[26px] border border-[#ece4da] bg-white p-5 md:p-6">
                        <div className="flex items-center gap-3">
                          <ShieldCheck className="h-5 w-5 text-[#15110d]" />
                          <div className="text-[20px] font-semibold tracking-[-0.04em] text-[#15110d]">
                            Cập nhật hồ sơ affiliate
                          </div>
                        </div>

                        {applicationMessage ? (
                          <div
                            className={`mt-5 rounded-[20px] px-4 py-3 text-[14px] leading-7 ${
                              applicationMessage.startsWith('Đã')
                                ? 'border border-[#c7e7d3] bg-[#effbf3] text-[#156c42]'
                                : 'border border-[#efc4c4] bg-[#fff4f4] text-[#a33a3a]'
                            }`}
                          >
                            {applicationMessage}
                          </div>
                        ) : null}

                        <form onSubmit={handleApplicationSubmit} className="mt-6 space-y-5">
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

                          <div className="flex justify-end">
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
                                  <span>Cập nhật hồ sơ</span>
                                  <ArrowRight className="h-4 w-4" />
                                </>
                              )}
                            </button>
                          </div>
                        </form>
                      </div>
                    ) : null}

                    <div className="rounded-[26px] border border-[#ece4da] bg-white p-5 md:p-6">
                      <div className="flex items-center gap-3">
                        <Wallet className="h-5 w-5 text-[#15110d]" />
                        <div className="text-[20px] font-semibold tracking-[-0.04em] text-[#15110d]">
                          Thông tin ngân hàng thụ hưởng
                        </div>
                      </div>

                      {bankMessage ? (
                        <div
                          className={`mt-5 rounded-[20px] px-4 py-3 text-[14px] leading-7 ${
                            bankMessage.startsWith('Đã')
                              ? 'border border-[#c7e7d3] bg-[#effbf3] text-[#156c42]'
                              : 'border border-[#efc4c4] bg-[#fff4f4] text-[#a33a3a]'
                          }`}
                        >
                          {bankMessage}
                        </div>
                      ) : null}

                      {hasAffiliateAccount ? (
                        <form onSubmit={handleBankSubmit} className="mt-6 space-y-5">
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
                      ) : (
                        <div className="mt-6 rounded-[22px] border border-dashed border-[#ddcfbe] bg-[#fcfaf8] px-5 py-6 text-[14px] leading-7 text-[#665a4e]">
                          Sau khi quản trị viên duyệt và tạo affiliate account, phần ngân hàng thụ hưởng sẽ mở để bạn thêm hoặc chỉnh sửa thông tin nhận hoa hồng.
                        </div>
                      )}
                    </div>
                  </div>
                </SectionCard>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
