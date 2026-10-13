'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, Copy, LoaderCircle, LogIn, Share2, Sparkles, Ticket, Users, X } from 'lucide-react';
import ZaloLogo from '../auth/ZaloLogo.jsx';
import CircularCarousel from './CircularCarousel.jsx';
import styles from './LuckyWheel.module.css';

// Khớp thời lượng hiệu ứng đóng trong LuckyWheel.module.css.
const EXIT_DURATION_MS = 240;
// Ít phần thưởng thì vòng trông thưa: lặp lại nguyên bộ cho đủ số ô tối thiểu.
const MIN_RING_ITEMS = 5;
const SPIN_TURNS = 5;
const SPIN_DURATION_MS = 6500;
// Màu nền khu vực vòng quay; các thẻ ở xa mờ dần về màu này.
const STAGE_COLOR = '#F3F0FA';
// Ảnh phần thưởng tỷ lệ 4:5 (rộng / cao).
const PRIZE_IMAGE_RATIO = 4 / 5;
// Mũi kim chạm hơi chồm lên mép trên của thẻ phía trước.
const POINTER_HEIGHT = 46;
const POINTER_OVERLAP = 6;

/** Kim chỉ ô trúng thưởng: hình ghim với viền trắng, đứng ngay trên thẻ phía trước. */
function WheelPointer({ tipTop }) {
  return (
    <div
      className="pointer-events-none absolute z-10"
      style={{
        left: '50%',
        top: Math.max(0, tipTop - POINTER_HEIGHT + POINTER_OVERLAP),
        transform: 'translateX(-50%)',
      }}
      aria-hidden="true"
    >
      <svg className={styles.pointer} width="38" height={POINTER_HEIGHT} viewBox="0 0 38 46">
        <defs>
          <linearGradient id="lucky-wheel-pointer" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2b2333" />
            <stop offset="100%" stopColor="#5b468a" />
          </linearGradient>
        </defs>
        <path
          d="M19 44C19 44 4 29 4 18.5a15 15 0 0 1 30 0C34 29 19 44 19 44Z"
          fill="url(#lucky-wheel-pointer)"
          stroke="#fff"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <circle cx="19" cy="18.5" r="6.5" fill="#fff" />
        <circle cx="19" cy="18.5" r="3" fill="#7C93F1" />
      </svg>
    </div>
  );
}

const DARK_BUTTON_CLASS =
  'relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full border border-white/70 bg-[linear-gradient(145deg,rgba(21,17,17,0.96),rgba(79,60,117,0.96))] px-5 font-semibold text-white shadow-[0_14px_34px_rgba(26,19,38,0.28)] transition hover:shadow-[0_18px_42px_rgba(26,19,38,0.34)] active:scale-[0.99]';

async function parseJson(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

// Khớp breakpoint lg của Tailwind, nơi popup chuyển sang bố cục hai cột.
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(min-width: 1024px)');
    const update = () => setIsDesktop(query.matches);

    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return isDesktop;
}

function buildRing(prizes) {
  if (!prizes?.length) {
    return [];
  }

  const copies = Math.ceil(MIN_RING_ITEMS / prizes.length);

  return Array.from({ length: copies }, () => prizes).flat();
}

function CopyButton({ value, label = 'Sao chép', className = '' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt('Sao chép nội dung dưới đây:', value);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-semibold transition ${className}`}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? 'Đã chép' : label}
    </button>
  );
}

function PrizeInfo({ prize, hint, isSpinning }) {
  if (isSpinning) {
    return (
      <div className="flex min-h-[92px] flex-col items-center justify-center gap-2 rounded-[20px] bg-[#F7F6FB] px-4 py-4 text-center">
        <LoaderCircle className="h-5 w-5 animate-spin text-[#4f3c75]" />
        <div className="text-[14px] font-semibold text-[#15110d]">Vòng quay đang chạy, chúc bạn may mắn!</div>
      </div>
    );
  }

  if (!prize) {
    return null;
  }

  return (
    <div key={prize.id} className={`${styles.reveal} min-h-[92px] rounded-[20px] bg-[#F7F6FB] px-4 py-4 text-center`}>
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7C6BB0]">{hint}</div>
      <div className="mt-1 text-[17px] font-bold leading-snug text-[#15110d]">{prize.name}</div>
      {prize.description ? (
        <p className="mt-1 text-[13.5px] leading-[1.6] text-[#5E6266]">{prize.description}</p>
      ) : null}
    </div>
  );
}

function SpinResult({ result, onDismiss }) {
  const isNoPrize = result.type === 'no_prize';

  return (
    <div
      className={`${styles.result} rounded-[22px] border border-[#DCD3F5] bg-[linear-gradient(160deg,#F4EFFF,#FFFFFF_70%)] p-4 text-center shadow-[0_14px_34px_rgba(79,60,117,0.12)] lg:p-5`}
    >
      <div className="flex items-center justify-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.16em] text-[#4f3c75]">
        <Sparkles className="h-3.5 w-3.5" />
        {isNoPrize ? 'Kết quả' : 'Chúc mừng bạn'}
      </div>
      <div className="mt-2 text-[19px] font-bold leading-snug text-[#15110d]">
        {isNoPrize ? result.name || 'Chúc bạn may mắn lần sau' : `Bạn đã trúng ${result.name}`}
      </div>
      {result.description ? (
        <p className="mt-1 text-[13.5px] leading-[1.55] text-[#5E6266]">{result.description}</p>
      ) : null}

      {result.rewardCode ? (
        <div className="mx-auto mt-3 flex max-w-[320px] items-center justify-between gap-2 rounded-full border border-dashed border-[#9D8DD6] bg-white py-1.5 pl-4 pr-1.5">
          <span className="truncate font-mono text-[15px] font-bold tracking-[0.08em] text-[#4f3c75]">
            {result.rewardCode}
          </span>
          <CopyButton value={result.rewardCode} className="bg-[#15110d] text-white hover:bg-[#2b2520]" />
        </div>
      ) : null}

      {result.voucher ? (
        <p className="mt-2.5 text-[12.5px] leading-[1.55] text-[#5E6266]">
          {result.voucher.description}
          <br />
          Hạn dùng đến hết ngày <span className="font-semibold text-[#15110d]">{result.voucher.endsOn}</span>
        </p>
      ) : null}

      {result.sentToZalo ? (
        <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-[#EAF2FF] px-3 py-1.5 text-[12.5px] font-semibold text-[#0068FF]">
          <ZaloLogo className="h-4 w-4" />
          Mã đã được gửi tới Zalo của bạn
        </div>
      ) : null}

      {result.claimInstructions ? (
        <p className="mt-3 whitespace-pre-line text-[12.5px] leading-[1.6] text-[#5E6266]">
          {result.claimInstructions}
        </p>
      ) : null}

      <button
        type="button"
        onClick={onDismiss}
        className="mt-3 text-[13px] font-semibold text-[#5E6266] underline-offset-4 transition hover:text-[#15110d] hover:underline"
      >
        Xem lại các phần thưởng
      </button>
    </div>
  );
}

function LoginOptions({ canLoginWithZalo, onRequestZaloLogin, onRememberReopen }) {
  return (
    <div className="grid gap-2.5">
      <p className="text-center text-[13.5px] leading-[1.55] text-[#5E6266]">
        Đăng nhập để nhận <span className="font-semibold text-[#15110d]">1 lượt quay miễn phí</span>.
      </p>
      <Link href="/login" onClick={onRememberReopen} className={`${DARK_BUTTON_CLASS} h-[50px] text-[15px]`}>
        <LogIn className="h-[18px] w-[18px]" />
        Đăng nhập
      </Link>
      {canLoginWithZalo ? (
        <button
          type="button"
          onClick={onRequestZaloLogin}
          className="flex h-[50px] w-full items-center justify-center gap-2.5 rounded-full border border-[#B7B7B7] bg-white px-4 text-[15px] font-semibold text-[#15110d] transition hover:border-[#15110d] hover:bg-[#F6F6F6]"
        >
          <ZaloLogo />
          Đăng nhập bằng Zalo
        </button>
      ) : null}
      <div className="text-center text-[13px] text-[#5E6266]">
        Chưa có tài khoản?{' '}
        <Link
          href="/register"
          onClick={onRememberReopen}
          className="font-semibold text-[#15110d] underline-offset-4 hover:underline"
        >
          Đăng ký ngay
        </Link>
      </div>
    </div>
  );
}

function ReferralBox({ referral, rule }) {
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function');
  }, []);

  const handleShare = () => {
    navigator
      .share({
        title: 'Vòng quay may mắn SRX',
        text: 'Tạo tài khoản SRX qua link này để cùng nhận lượt quay may mắn nhé!',
        url: referral.link,
      })
      .catch(() => {});
  };

  return (
    <div className="min-w-0 overflow-hidden rounded-[20px] border border-[#E4E7EE] bg-[#F7F8FB] p-3 sm:p-3.5">
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#4f3c75] shadow-[0_2px_8px_rgba(20,32,64,0.08)]">
          <Users className="h-4 w-4" />
        </span>
        <div className="min-w-0 text-[12.5px] leading-[1.55] text-[#5E6266]">
          <div className="text-[13.5px] font-semibold text-[#15110d]">Mời bạn bè, nhận thêm lượt quay</div>
          Mỗi người tạo tài khoản qua link của bạn
          {rule.requiresActivation ? ' và đăng nhập bằng Zalo' : ''}, bạn được cộng thêm {rule.spins} lượt.
        </div>
      </div>

      <div className="mt-3 grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-1.5 rounded-[18px] border border-[#E4E7EE] bg-white py-1 pl-3 pr-1">
        <span className="min-w-0 flex-1 truncate text-[12.5px] text-[#5E6266]">{referral.link}</span>
        <div className="flex shrink-0 items-center gap-1.5">
          <CopyButton value={referral.link} label="Chép" className="bg-[#15110d] text-white hover:bg-[#2b2520]" />
          {canShare ? (
            <button
              type="button"
              onClick={handleShare}
              aria-label="Chia sẻ link"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F1EEF9] text-[#4f3c75] transition hover:bg-[#E6E0F6]"
            >
              <Share2 className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
      </div>

      {referral.signedUp > 0 ? (
        <div className="mt-2 text-[12px] text-[#7A8190]">
          Đã có {referral.signedUp} người tạo tài khoản qua link của bạn · {referral.credited} người đã được tính lượt.
        </div>
      ) : null}
    </div>
  );
}

function RecentWins({ wins }) {
  if (!wins?.length) {
    return null;
  }

  return (
    <details className="group min-w-0 rounded-[20px] border border-[#E4E7EE] bg-white px-3.5 py-3">
      <summary className="flex cursor-pointer list-none items-center gap-2 text-[13.5px] font-semibold text-[#15110d]">
        <Ticket className="h-4 w-4 text-[#4f3c75]" />
        Phần thưởng của bạn ({wins.length})
        <span className="ml-auto text-[12px] font-medium text-[#9AA1AE] group-open:hidden">Xem</span>
      </summary>
      <ul className="mt-2.5 space-y-2">
        {wins.map((win) => (
          <li key={win.id} className="min-w-0 rounded-[14px] bg-[#F7F8FB] px-3 py-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="min-w-0 truncate text-[13px] font-semibold text-[#15110d]">{win.name}</span>
              <span className="shrink-0 text-[11px] text-[#9AA1AE]">
                {new Date(win.createdAt).toLocaleDateString('vi-VN')}
              </span>
            </div>
            {win.rewardCode ? (
              <div className="mt-1.5 flex items-center justify-between gap-2">
                <span className="truncate font-mono text-[13px] font-bold tracking-[0.06em] text-[#4f3c75]">
                  {win.rewardCode}
                </span>
                <CopyButton
                  value={win.rewardCode}
                  className="bg-white text-[#15110d] ring-1 ring-[#E4E7EE] hover:bg-[#F1F1F1]"
                />
              </div>
            ) : null}
            {win.voucherEndsOn ? (
              <p className="mt-1 text-[12px] text-[#7A8190]">Hạn dùng đến hết ngày {win.voucherEndsOn}</p>
            ) : null}
            {win.claimInstructions ? (
              <p className="mt-1 whitespace-pre-line text-[12px] leading-[1.5] text-[#7A8190]">
                {win.claimInstructions}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </details>
  );
}

/**
 * Popup vòng quay. Kết quả luôn do server bốc (POST /api/lucky-wheel/spin); vòng quay chỉ
 * diễn hoạt cảnh tới đúng ô server trả về.
 */
export default function LuckyWheelModal({
  isOpen,
  wheel,
  isLoggedIn,
  onClose,
  onSpun,
  onRequestZaloLogin,
  onRememberReopen,
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [phase, setPhase] = useState('idle');
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [pointerTop, setPointerTop] = useState(null);
  const isDesktop = useIsDesktop();
  const carouselRef = useRef(null);

  const prizes = wheel?.prizes;
  const ring = useMemo(() => buildRing(prizes), [prizes]);
  const ringItems = useMemo(
    () => ring.map((prize) => ({ src: prize.imageUrl, alt: prize.name, title: prize.name })),
    [ring],
  );
  const user = wheel?.user ?? null;
  const spinsLeft = user?.spinsLeft ?? 0;
  const isSpinning = phase === 'spinning';

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      setIsClosing(false);
      return undefined;
    }

    setIsClosing(true);
    const timer = window.setTimeout(() => {
      setIsRendered(false);
      setIsClosing(false);
      setPhase('idle');
      setResult(null);
      setErrorMessage('');
      setSelectedIndex(null);
      setHoveredIndex(null);
    }, EXIT_DURATION_MS);

    return () => window.clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      // onClose bị bỏ trống khi đang có popup Zalo đè lên: Esc chỉ đóng popup trên cùng.
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleSpin = useCallback(async () => {
    if (isSpinning) {
      return;
    }

    setPhase('spinning');
    setResult(null);
    setErrorMessage('');
    setSelectedIndex(null);

    try {
      const response = await fetch('/api/lucky-wheel/spin', { method: 'POST', cache: 'no-store' });
      const data = await parseJson(response);

      if (!response.ok) {
        setErrorMessage(data.message ?? 'Không thể quay lúc này. Vui lòng thử lại.');
        setPhase('idle');
        onSpun?.();
        return;
      }

      // Phần thưởng có thể xuất hiện ở nhiều ô khi bộ quà được lặp lại: chọn ngẫu nhiên một ô.
      const slots = ring.flatMap((prize, index) => (prize.id === data.result.prizeId ? [index] : []));

      if (slots.length && carouselRef.current) {
        const slot = slots[Math.floor(Math.random() * slots.length)];
        await carouselRef.current.spinTo(slot, { turns: SPIN_TURNS, duration: SPIN_DURATION_MS });
      }

      setResult(data.result);
      setPhase('result');
      onSpun?.(data.spinsLeft);
    } catch {
      setErrorMessage('Không thể kết nối tới máy chủ. Vui lòng thử lại.');
      setPhase('idle');
    }
  }, [isSpinning, onSpun, ring]);

  if (!isMounted || !isRendered || !ring.length) {
    return null;
  }

  const shownIndex = hoveredIndex ?? selectedIndex ?? activeIndex;
  const shownPrize = ring[shownIndex] ?? ring[0];
  const shownHint = hoveredIndex !== null || selectedIndex !== null ? 'Phần thưởng' : 'Đang hiển thị';

  const renderAction = () => {
    if (!isLoggedIn) {
      return (
        <LoginOptions
          canLoginWithZalo={wheel.canLoginWithZalo}
          onRequestZaloLogin={onRequestZaloLogin}
          onRememberReopen={onRememberReopen}
        />
      );
    }

    const canSpin = spinsLeft > 0 && !isSpinning;

    return (
      <button
        type="button"
        onClick={handleSpin}
        disabled={!canSpin}
        className={`${DARK_BUTTON_CLASS} h-[54px] text-[16px] tracking-[0.02em] disabled:cursor-not-allowed disabled:border-[#E4E7EE] disabled:bg-none disabled:bg-[#EDEFF4] disabled:text-[#9AA1AE] disabled:shadow-none`}
      >
        {isSpinning ? (
          <>
            <LoaderCircle className="h-5 w-5 animate-spin" />
            Đang quay...
          </>
        ) : spinsLeft > 0 ? (
          <>
            <Sparkles className="h-5 w-5" />
            Quay ngay · còn {spinsLeft} lượt
          </>
        ) : (
          'Bạn đã hết lượt quay'
        )}
      </button>
    );
  };

  return createPortal(
    <div
      className={`${styles.overlay} fixed inset-0 z-[140] overflow-hidden`}
      data-state={isClosing ? 'closing' : 'open'}
      role="dialog"
      aria-modal="true"
      aria-label={wheel.title}
    >
      <div
        className="absolute inset-0 bg-[rgba(9,12,20,0.5)] backdrop-blur-[6px]"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative flex min-h-[100dvh] w-full min-w-0 items-end justify-center sm:items-center sm:p-5">
        <div
          className={`${styles.card} relative flex max-h-[calc(100dvh-12px)] w-full min-w-0 max-w-[100vw] flex-col overflow-x-hidden overflow-y-auto overscroll-contain rounded-t-[28px] bg-white shadow-[0_-18px_70px_rgba(0,0,0,0.22)] sm:max-h-[calc(100vh-40px)] sm:max-w-[560px] sm:rounded-[28px] sm:shadow-[0_30px_90px_rgba(9,12,20,0.26)] lg:max-w-[760px]`}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="absolute right-3.5 top-3.5 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#5E6266] shadow-[0_4px_14px_rgba(9,12,20,0.10)] transition hover:bg-white hover:text-[#15110d]"
          >
            <X className="h-4 w-4" />
          </button>

          <div
            className="relative shrink-0"
            style={{
              background: `radial-gradient(70% 60% at 50% 45%, #FFFFFF 0%, ${STAGE_COLOR} 70%), ${STAGE_COLOR}`,
            }}
          >
            <span
              className="mx-auto block h-1 w-10 translate-y-3 rounded-full bg-[#D8DDE6] sm:hidden"
              aria-hidden="true"
            />

            <div className="px-12 pt-5 text-center sm:px-5 sm:pt-6 lg:pt-6">
              <WheelHeading wheel={wheel} />
            </div>

            <div
              className={`relative mt-1 h-[clamp(190px,30dvh,250px)] sm:h-[340px] lg:h-[400px] ${isSpinning ? styles.spinning : ''}`}
            >
              {pointerTop !== null ? <WheelPointer tipTop={pointerTop} /> : null}
              {/* Chừa khoảng trống hai bên để vòng quay không chạm mép popup. */}
              <div className="absolute inset-y-0 left-3 right-3 sm:left-5 sm:right-5 lg:left-6 lg:right-6">
                <CircularCarousel
                  ref={carouselRef}
                  items={ringItems}
                  preset="cylinder"
                  tilt={-2}
                  intro="rise"
                  cardWidth={isDesktop ? 260 : 220}
                  aspectRatio={PRIZE_IMAGE_RATIO}
                  gap={22}
                  onMeasure={({ frontTop }) => setPointerTop(frontTop)}
                  autoplay={phase === 'result' ? 'off' : 'drift'}
                  speed={16}
                  pauseOnHover
                  focusOnClick
                  snap
                  parallax={0.2}
                  depthFade={0.75}
                  fadeColor={STAGE_COLOR}
                  innerShade={0.8}
                  cornerRadius={18}
                  ariaLabel="Các phần thưởng của vòng quay"
                  onChange={setActiveIndex}
                  onHoverItem={setHoveredIndex}
                  onItemClick={(_, index) => setSelectedIndex(index)}
                />
              </div>
            </div>
          </div>

          <div className="mx-auto grid w-full min-w-0 max-w-[560px] content-start gap-3 px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-4 sm:gap-4 sm:px-6 sm:pb-6 lg:pb-8">
            {result ? (
              <SpinResult
                result={result}
                onDismiss={() => {
                  setResult(null);
                  setPhase('idle');
                }}
              />
            ) : (
              <PrizeInfo prize={shownPrize} hint={shownHint} isSpinning={isSpinning} />
            )}

            {renderAction()}

            {errorMessage ? (
              <div className="rounded-[14px] border border-[#F3D6D6] bg-[#FFF6F6] px-4 py-2.5 text-center text-[12.5px] leading-5 text-[#A33A3A]">
                {errorMessage}
              </div>
            ) : null}

            {user?.referral && wheel.referral ? <ReferralBox referral={user.referral} rule={wheel.referral} /> : null}

            <RecentWins wins={user?.recentWins} />

            {wheel.terms ? (
              <details className="text-[12.5px] leading-[1.6] text-[#7A8190]">
                <summary className="cursor-pointer text-center font-semibold text-[#5E6266] hover:text-[#15110d]">
                  Thể lệ chương trình
                </summary>
                <p className="mt-2 whitespace-pre-line">{wheel.terms}</p>
              </details>
            ) : null}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function WheelHeading({ wheel }) {
  return (
    <>
      <img
        src="/assets/images/header/logo_srx.webp"
        alt="SRX Việt Nam"
        className="mx-auto h-7 w-auto max-w-full object-contain lg:h-8"
      />
      <h2 className="mt-2.5 break-words text-[clamp(20px,5.8vw,22px)] font-bold leading-tight tracking-[-0.02em] text-[#15110d] lg:mt-3 lg:text-[28px]">
        {wheel.title}
      </h2>
      {wheel.description ? (
        <p className="mx-auto mt-1.5 max-w-[440px] whitespace-pre-line text-[13.5px] leading-[1.6] text-[#5E6266]">
          {wheel.description}
        </p>
      ) : null}
    </>
  );
}
