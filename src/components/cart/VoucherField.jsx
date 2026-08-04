'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Check, ChevronRight, Lock, TicketPercent, Truck, X } from 'lucide-react';
import { getCouponApplication } from '../../lib/commerce/checkout';
import {
  canUseVoucher,
  formatVoucherDate,
  formatVoucherMoney,
  getVoucherDescription,
  getVoucherStubLabel,
  getVoucherTitle,
  isFreeShippingVoucher,
  isVoucherEligible,
  maskVoucherCode,
  sortVouchers,
} from '../../lib/commerce/vouchers';

function VoucherStub({ voucher, isLocked }) {
  const stubLabel = getVoucherStubLabel(voucher);

  return (
    <div
      className={[
        'flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-center text-[13px] font-bold leading-tight text-white',
        isLocked ? 'bg-[#a89e90]' : 'bg-[#15110d]',
      ].join(' ')}
    >
      {isFreeShippingVoucher(voucher) || !stubLabel ? (
        <Truck className="h-6 w-6" strokeWidth={1.8} />
      ) : (
        stubLabel
      )}
    </div>
  );
}

function VoucherCard({ voucher, isApplied, isLoggedIn, subtotal, onUse, loginHref, onNavigate }) {
  const isAllowed = canUseVoucher(voucher, isLoggedIn);
  const isEligible = isVoucherEligible(voucher, subtotal);
  const isLocked = !isAllowed;
  const endsAtLabel = formatVoucherDate(voucher.endsAt);

  return (
    <div
      className={[
        'relative flex items-center gap-3.5 overflow-hidden rounded-[20px] border p-4 transition',
        isApplied ? 'border-[#3f6b39] bg-[#f6faf5]' : 'border-[#e3ddd3] bg-white',
        isLocked ? 'border-[#e3ddd3] bg-[#f5f2ed]' : '',
      ].join(' ')}
    >
      {isLocked ? (
        <span className="absolute right-0 top-0 inline-flex items-center gap-1 rounded-bl-[14px] bg-[#a89e90] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-white">
          <Lock className="h-3 w-3 shrink-0" />
          Thành viên
        </span>
      ) : null}

      <VoucherStub voucher={voucher} isLocked={isLocked} />

      <div className="min-w-0 flex-1">
        <div className={['text-[15px] font-bold leading-tight', isLocked ? 'text-[#8d8578]' : 'text-[#15110d]'].join(' ')}>
          {getVoucherTitle(voucher)}
        </div>

        <p className="mt-1 line-clamp-2 text-[13px] leading-5 text-[#a89e90]">
          {isLocked ? 'Đăng nhập để nhận mã đặc quyền này' : getVoucherDescription(voucher)}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span
            className={[
              'inline-block rounded-lg border border-dashed border-[#c8c0b4] px-2 py-0.5 text-[12px] font-bold tracking-[0.1em]',
              isLocked ? 'text-[#8d8578]' : 'text-[#15110d]',
            ].join(' ')}
          >
            {isLocked ? maskVoucherCode(voucher.code) : voucher.code}
          </span>

          {!isLocked && endsAtLabel ? (
            <span className="text-[11px] text-[#a89e90]">HSD {endsAtLabel}</span>
          ) : null}
        </div>

        {!isLocked && !isEligible ? (
          <p className="mt-2 text-[12px] font-semibold leading-5 text-[#b0703a]">
            Đơn tối thiểu {formatVoucherMoney(voucher.minOrderAmount)}
          </p>
        ) : null}
      </div>

      {isLocked ? (
        <Link
          href={loginHref}
          onClick={onNavigate}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border-[1.5px] border-[#15110d] px-4 py-2.5 text-[13px] font-bold text-[#15110d] transition hover:bg-[#15110d] hover:text-white"
        >
          Đăng nhập
        </Link>
      ) : (
        <button
          type="button"
          onClick={() => onUse(voucher.code)}
          disabled={!isEligible && !isApplied}
          className={[
            'inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2.5 text-[13px] font-bold transition',
            isApplied
              ? 'bg-[#3f6b39] text-white'
              : 'bg-[#15110d] text-white hover:bg-[#332b23] disabled:cursor-not-allowed disabled:bg-[#c8c0b4]',
          ].join(' ')}
        >
          {isApplied ? (
            <>
              <Check className="h-3.5 w-3.5 shrink-0" />
              Đang dùng
            </>
          ) : (
            'Dùng mã'
          )}
        </button>
      )}
    </div>
  );
}

export default function VoucherField({
  subtotal = 0,
  discountCodes = [],
  isLoading = false,
  appliedCode = '',
  discountTotal = 0,
  onApply,
  onRemove,
  isLoggedIn = false,
  loginHref = '/login',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (keyEvent) => {
      if (keyEvent.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const sortedVouchers = useMemo(
    () => sortVouchers(discountCodes, { subtotal, isLoggedIn }),
    [discountCodes, isLoggedIn, subtotal],
  );

  const appliedVoucher = useMemo(
    () => discountCodes.find((voucher) => voucher.code === appliedCode) ?? null,
    [appliedCode, discountCodes],
  );

  const openSheet = () => {
    setFeedback({ type: '', text: '' });
    setIsOpen(true);
  };

  const applyCode = (code) => {
    const result = getCouponApplication(code, subtotal, discountCodes);
    const matchedVoucher = discountCodes.find((voucher) => voucher.code === result.code) ?? null;

    if (result.isValid && matchedVoucher && !canUseVoucher(matchedVoucher, isLoggedIn)) {
      setFeedback({
        type: 'error',
        text: 'Mã này dành riêng cho thành viên, vui lòng đăng nhập để sử dụng.',
      });
      return;
    }

    if (!result.isValid) {
      setFeedback({ type: 'error', text: result.message });
      return;
    }

    onApply?.(result.code);
    setManualCode('');
    setFeedback({ type: '', text: '' });
    setIsOpen(false);
  };

  const handleRemove = () => {
    onRemove?.();
    setFeedback({ type: '', text: '' });
  };

  const sheet = (
    <div className={isOpen ? 'block' : 'hidden'}>
      <div
        className="fixed inset-0 z-[100] bg-[rgba(28,26,23,0.45)] backdrop-blur-[2px]"
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Chọn mã giảm giá"
        className="fixed inset-x-0 bottom-0 z-[110] mx-auto flex max-h-[86vh] w-full max-w-[520px] flex-col rounded-t-[28px] bg-[#faf9f7] shadow-[0_-20px_60px_rgba(28,26,23,0.25)] sm:inset-0 sm:my-auto sm:h-fit sm:max-h-[84vh] sm:rounded-[24px] sm:shadow-[0_40px_90px_rgba(28,26,23,0.35)]"
      >
        <div className="relative shrink-0 px-5 pb-4 pt-3.5 sm:px-7 sm:pt-6">
          <span className="mx-auto mb-4 block h-[5px] w-11 rounded-full bg-[#c8c0b4] sm:hidden" />

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Đóng"
            className="absolute right-4 top-3 hidden h-9 w-9 items-center justify-center rounded-full border border-[#e3ddd3] text-[#a89e90] transition hover:border-[#15110d] hover:text-[#15110d] sm:flex sm:right-6 sm:top-6"
          >
            <X className="h-4 w-4" />
          </button>

          <h3 className="text-[21px] font-bold tracking-[-0.01em] text-[#15110d] sm:text-[23px]">
            Mã giảm giá
          </h3>
          <p className="mt-1 text-[14px] text-[#a89e90]">
            {isLoggedIn
              ? 'Chọn một mã có sẵn hoặc nhập mã của bạn'
              : 'Đăng nhập để mở khoá các mã giảm giá dành cho thành viên'}
          </p>

          <div className="mt-5 flex gap-2.5">
            <input
              type="text"
              value={manualCode}
              onChange={(changeEvent) => setManualCode(changeEvent.target.value)}
              onKeyDown={(keyEvent) => {
                if (keyEvent.key === 'Enter') {
                  keyEvent.preventDefault();
                  applyCode(manualCode);
                }
              }}
              placeholder="Nhập mã giảm giá"
              autoComplete="off"
              className="min-w-0 flex-1 rounded-full border-[1.5px] border-[#c8c0b4] bg-white px-5 py-3 text-[15px] font-semibold uppercase tracking-[0.06em] text-[#15110d] outline-none transition placeholder:font-medium placeholder:normal-case placeholder:tracking-normal placeholder:text-[#a89e90] focus:border-[#15110d]"
            />
            <button
              type="button"
              onClick={() => applyCode(manualCode)}
              className="shrink-0 rounded-full bg-[#15110d] px-6 text-[14px] font-bold text-white transition hover:bg-[#332b23]"
            >
              Áp dụng
            </button>
          </div>

          {feedback.text ? (
            <p
              className={[
                'mt-2.5 px-1 text-[13px] font-semibold',
                feedback.type === 'error' ? 'text-[#ad4040]' : 'text-[#3f6b39]',
              ].join(' ')}
            >
              {feedback.text}
            </p>
          ) : null}
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 pb-8 pt-1 sm:px-7">
          {isLoading ? (
            <div className="rounded-[20px] border border-[#e3ddd3] bg-white px-5 py-10 text-center text-[14px] text-[#a89e90]">
              Đang tải mã giảm giá...
            </div>
          ) : sortedVouchers.length ? (
            sortedVouchers.map((voucher) => (
              <VoucherCard
                key={voucher.id ?? voucher.code}
                voucher={voucher}
                subtotal={subtotal}
                isLoggedIn={isLoggedIn}
                isApplied={appliedCode === voucher.code}
                onUse={applyCode}
                loginHref={loginHref}
                onNavigate={() => setIsOpen(false)}
              />
            ))
          ) : (
            <div className="rounded-[20px] border border-[#e3ddd3] bg-white px-5 py-10 text-center text-[14px] text-[#a89e90]">
              Chưa có mã giảm giá khả dụng
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <button
        type="button"
        onClick={openSheet}
        className="flex w-full items-center gap-2.5 py-1.5 text-left transition active:opacity-60"
      >
        <TicketPercent className="h-[22px] w-[22px] shrink-0 text-[#15110d]" strokeWidth={1.8} />
        <span className="text-[14px] font-bold uppercase tracking-[0.18em] text-[#15110d]">
          Mã giảm giá
        </span>
        <span
          className={[
            'ml-auto flex items-center gap-1.5 whitespace-nowrap text-[13px] font-semibold',
            appliedCode ? 'text-[#3f6b39]' : 'text-[#6B7280]',
          ].join(' ')}
        >
          {appliedCode
            ? discountTotal > 0
              ? `−${formatVoucherMoney(discountTotal)}`
              : 'Đã áp dụng'
            : 'Chọn hoặc nhập mã'}
          <ChevronRight className="h-4 w-4 shrink-0" />
        </span>
      </button>

      {appliedCode ? (
        <div className="mt-3.5 flex items-center gap-3.5 rounded-[20px] border-[1.5px] border-[#cfe0ca] bg-white p-3.5">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-[#3f6b39] text-white">
            <Check className="h-5 w-5" strokeWidth={2.4} />
          </span>

          <div className="min-w-0 flex-1">
            <div className="truncate text-[15px] font-bold text-[#15110d]">
              {appliedVoucher ? getVoucherTitle(appliedVoucher) : `Mã ${appliedCode}`}
            </div>
            <div className="mt-0.5 truncate text-[13px] font-semibold text-[#3f6b39]">
              {appliedCode}
              {discountTotal > 0 ? ` · Tiết kiệm ${formatVoucherMoney(discountTotal)}` : ''}
            </div>
          </div>

          <button
            type="button"
            onClick={handleRemove}
            className="shrink-0 rounded-full border-[1.5px] border-[#e3ddd3] px-4 py-2 text-[13px] font-bold text-[#a89e90] transition hover:border-[#15110d] hover:text-[#15110d]"
          >
            Bỏ mã
          </button>
        </div>
      ) : null}

      {isMounted ? createPortal(sheet, document.body) : null}
    </div>
  );
}
