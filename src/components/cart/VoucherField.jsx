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
        'flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] text-center text-[12px] font-bold leading-tight text-white',
        isLocked ? 'bg-[#9ca3af]' : 'bg-[#171717]',
      ].join(' ')}
    >
      {isFreeShippingVoucher(voucher) || !stubLabel ? (
        <Truck className="h-5 w-5" strokeWidth={1.8} />
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
        'relative flex items-center gap-3 overflow-hidden rounded-[16px] border p-3 transition',
        isApplied ? 'border-[#7ba474] bg-[#f5faf4]' : 'border-[#e1e3e6] bg-white',
        isLocked ? 'border-[#e1e3e6] bg-[#f1f2f4]' : '',
      ].join(' ')}
    >
      {isLocked ? (
        <span className="absolute right-0 top-0 inline-flex items-center gap-1 rounded-bl-[12px] bg-[#9ca3af] px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-white">
          <Lock className="h-3 w-3 shrink-0" />
          Thành viên
        </span>
      ) : null}

      <VoucherStub voucher={voucher} isLocked={isLocked} />

      <div className="min-w-0 flex-1">
        <div className={['text-[14px] font-bold leading-tight', isLocked ? 'text-[#6b7280]' : 'text-[#171717]'].join(' ')}>
          {getVoucherTitle(voucher)}
        </div>

        <p className="mt-0.5 line-clamp-2 text-[12px] leading-[17px] text-[#737780]">
          {isLocked ? 'Đăng nhập để nhận mã đặc quyền này' : getVoucherDescription(voucher)}
        </p>

        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span
            className={[
              'inline-block rounded-md border border-dashed border-[#bfc3c9] px-1.5 py-0.5 text-[11px] font-bold tracking-[0.08em]',
              isLocked ? 'text-[#6b7280]' : 'text-[#171717]',
            ].join(' ')}
          >
            {isLocked ? maskVoucherCode(voucher.code) : voucher.code}
          </span>

          {!isLocked && endsAtLabel ? (
            <span className="text-[10px] text-[#737780]">HSD {endsAtLabel}</span>
          ) : null}
        </div>

        {!isLocked && !isEligible ? (
          <p className="mt-1.5 text-[11px] font-semibold leading-4 text-[#a15c32]">
            Đơn tối thiểu {formatVoucherMoney(voucher.minOrderAmount)}
          </p>
        ) : null}
      </div>

      {isLocked ? (
        <Link
          href={loginHref}
          onClick={onNavigate}
          className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-[#171717] px-3 py-2 text-[12px] font-bold text-[#171717] transition hover:bg-[#171717] hover:text-white"
        >
          Đăng nhập
        </Link>
      ) : (
        <button
          type="button"
          onClick={() => onUse(voucher.code)}
          disabled={!isEligible && !isApplied}
          className={[
            'inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-[12px] font-bold transition',
            isApplied
              ? 'bg-[#3f6b39] text-white'
              : 'bg-[#171717] text-white hover:bg-black disabled:cursor-not-allowed disabled:bg-[#b9bdc4]',
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
  compact = false,
  onNavigate,
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

  const handleNavigate = () => {
    setIsOpen(false);
    onNavigate?.();
  };

  const sheet = (
    <div
      className={`fixed inset-0 z-[100] ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
      aria-hidden={!isOpen}
      inert={!isOpen}
    >
      <div
        className={`absolute inset-0 bg-black/35 backdrop-blur-[2px] transition-opacity duration-300 motion-reduce:transition-none ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal={isOpen ? 'true' : undefined}
        aria-label="Chọn mã giảm giá"
        className={`fixed inset-x-0 bottom-0 z-[110] mx-auto flex max-h-[82dvh] w-full max-w-[440px] flex-col rounded-t-[24px] bg-[#f5f6f7] pb-[env(safe-area-inset-bottom)] shadow-[0_-18px_50px_rgba(0,0,0,0.2)] transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none sm:inset-0 sm:my-auto sm:h-fit sm:max-h-[80dvh] sm:rounded-[20px] sm:pb-0 sm:shadow-[0_30px_80px_rgba(0,0,0,0.22)] ${
          isOpen
            ? 'translate-y-0 opacity-100 sm:scale-100'
            : 'translate-y-full opacity-0 sm:translate-y-4 sm:scale-[0.98]'
        }`}
      >
        <div className="relative shrink-0 px-4 pb-3 pt-2.5 sm:px-5 sm:pt-5">
          <span className="mx-auto mb-3 block h-1 w-9 rounded-full bg-[#b9bdc4] sm:hidden" />

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Đóng"
            className="absolute right-3.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full border border-[#dfe1e4] bg-white text-[#737780] transition hover:border-[#171717] hover:text-[#171717] sm:right-5 sm:top-5"
          >
            <X className="h-4 w-4" />
          </button>

          <h3 className="pr-10 text-[18px] font-bold tracking-[-0.01em] text-[#171717] sm:text-[20px]">
            Mã giảm giá
          </h3>
          <p className="mt-0.5 pr-8 text-[12px] leading-[18px] text-[#737780] sm:text-[13px]">
            {isLoggedIn
              ? 'Chọn một mã có sẵn hoặc nhập mã của bạn'
              : 'Đăng nhập để mở khoá các mã giảm giá dành cho thành viên'}
          </p>

          <div className="mt-3 flex gap-2">
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
              className="min-w-0 flex-1 rounded-full border border-[#cfd2d6] bg-white px-4 py-2.5 text-[13px] font-semibold uppercase tracking-[0.05em] text-[#171717] outline-none transition placeholder:font-medium placeholder:normal-case placeholder:tracking-normal placeholder:text-[#8a8f98] focus:border-[#171717]"
            />
            <button
              type="button"
              onClick={() => applyCode(manualCode)}
              className="shrink-0 rounded-full bg-[#171717] px-4 text-[12px] font-bold text-white transition hover:bg-black"
            >
              Áp dụng
            </button>
          </div>

          {feedback.text ? (
            <p
              className={[
                'mt-2 px-1 text-[12px] font-semibold',
                feedback.type === 'error' ? 'text-[#ad4040]' : 'text-[#3f6b39]',
              ].join(' ')}
            >
              {feedback.text}
            </p>
          ) : null}
        </div>

        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 pb-5 pt-1 sm:px-5">
          {isLoading ? (
            <div className="rounded-[16px] border border-[#e1e3e6] bg-white px-4 py-8 text-center text-[13px] text-[#737780]">
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
                onNavigate={handleNavigate}
              />
            ))
          ) : (
            <div className="rounded-[16px] border border-[#e1e3e6] bg-white px-4 py-8 text-center text-[13px] text-[#737780]">
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
        className={`flex w-full items-center text-left transition active:opacity-60 ${compact ? 'gap-2 py-1' : 'gap-2.5 py-1.5'}`}
      >
        <TicketPercent className={`${compact ? 'h-[18px] w-[18px]' : 'h-[22px] w-[22px]'} shrink-0 text-[#15110d]`} strokeWidth={1.8} />
        <span className={`${compact ? 'text-[11px] tracking-[0.13em]' : 'text-[14px] tracking-[0.18em]'} font-bold uppercase text-[#15110d]`}>
          Mã giảm giá
        </span>
        <span
          className={[
            `ml-auto flex items-center whitespace-nowrap font-semibold ${compact ? 'gap-1 text-[11px]' : 'gap-1.5 text-[13px]'}`,
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
