'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Gift, Sparkle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import useBrowserSearchParams from '../../hooks/useBrowserSearchParams.js';
import useFloatingCtaCorner from '../../hooks/useFloatingCtaCorner';
import ZaloQrLoginModal from '../auth/ZaloQrLoginModal.jsx';
import LuckyWheelModal from './LuckyWheelModal.jsx';
import styles from './LuckyWheel.module.css';

const REFERRAL_PARAM = 'wheel_ref';
// Khách bấm "Đăng nhập / Tạo tài khoản" từ popup: quay lại website thì mở lại vòng quay.
const REOPEN_STORAGE_KEY = 'srx-lucky-wheel-reopen';

async function parseJson(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

function readReopenFlag() {
  try {
    return window.sessionStorage.getItem(REOPEN_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function writeReopenFlag(value) {
  try {
    if (value) {
      window.sessionStorage.setItem(REOPEN_STORAGE_KEY, '1');
    } else {
      window.sessionStorage.removeItem(REOPEN_STORAGE_KEY);
    }
  } catch {
    // Trình duyệt chặn lưu trữ: chỉ mất tính năng tự mở lại.
  }
}

/**
 * Vị trí nút, căn theo nút liên hệ nổi (FloatingCallToAction):
 *   - Nút liên hệ ở góc phải dưới: đứng ngay phía trên (cách 10px).
 *   - Nút liên hệ ở góc phải trên: đứng ngay phía dưới để không chạm header.
 *   - Nút liên hệ ở bên trái: đứng riêng ở góc phải dưới.
 * Nút liên hệ nằm trong ô BUTTON_SIZE (58px) cách mép EDGE_PADDING (18px) nhưng bản thân nút chỉ
 * cao/rộng 54px, nên mép nhìn thấy cách cạnh màn hình 22px.
 * top-[84px] / lg:top-[102px] khớp MOBILE_TOP_PADDING / DESKTOP_TOP_PADDING của nút liên hệ.
 * Chiều ngang dùng 100vw - 76px (= window.innerWidth - BUTTON_SIZE - EDGE_PADDING) giống hệt cách nút
 * liên hệ tính, kể cả bề rộng thanh cuộn, để hai nút thẳng cột trên desktop.
 */
function getLauncherPositionClass(contactCorner) {
  if (contactCorner === 'top-right') {
    return 'left-[calc(100vw-76px)] top-[148px] lg:top-[166px]';
  }

  if (contactCorner === 'bottom-right') {
    return 'bottom-[86px] left-[calc(100vw-76px)]';
  }

  return 'bottom-[22px] left-[calc(100vw-76px)]';
}

/** Ghi nhận link giới thiệu ?wheel_ref=<mã> (một lần cho mỗi mã). */
function useReferralTracking() {
  const searchParams = useBrowserSearchParams();
  const trackedCodeRef = useRef('');

  useEffect(() => {
    const code = String(searchParams?.get(REFERRAL_PARAM) ?? '').trim();

    if (!code || trackedCodeRef.current === code) {
      return;
    }

    trackedCodeRef.current = code;
    fetch('/api/lucky-wheel/referral', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    }).catch(() => {});
  }, [searchParams]);
}

/**
 * Nút vòng quay may mắn ở góc phải dưới (nằm trên nút liên hệ). Chỉ hiện khi CRM bật tính năng
 * và có ít nhất một phần thưởng. Cấu hình ở CRM: /srx/lucky-wheel.
 */
export default function LuckyWheelLauncher({ hideButton = false }) {
  const { user, isLoading: isAuthLoading, refreshUser } = useAuth();
  const [wheel, setWheel] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isZaloLoginOpen, setIsZaloLoginOpen] = useState(false);
  const contactCorner = useFloatingCtaCorner();
  const userId = user?.id ?? null;

  useReferralTracking();

  const loadWheel = useCallback(async () => {
    try {
      const response = await fetch('/api/lucky-wheel', { cache: 'no-store' });
      const data = await parseJson(response);

      setWheel(data.enabled ? data : null);
      return data;
    } catch {
      return null;
    }
  }, []);

  // Tải lại khi đăng nhập/đăng xuất: số lượt và việc ghép link giới thiệu phụ thuộc tài khoản.
  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    loadWheel().then((data) => {
      if (data?.enabled && userId && readReopenFlag()) {
        writeReopenFlag(false);
        setIsOpen(true);
      }
    });
  }, [isAuthLoading, loadWheel, userId]);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    // Lượt giới thiệu có thể vừa được cộng khi bạn bè tạo tài khoản: lấy số mới nhất.
    loadWheel();
  }, [loadWheel]);

  const handleClose = useCallback(() => setIsOpen(false), []);

  const handleSpun = useCallback(
    (spinsLeft) => {
      if (typeof spinsLeft === 'number') {
        setWheel((current) => (current?.user ? { ...current, user: { ...current.user, spinsLeft } } : current));
      }

      loadWheel();
    },
    [loadWheel],
  );

  const handleZaloSuccess = useCallback(async () => {
    setIsZaloLoginOpen(false);
    await refreshUser();
    await loadWheel();
  }, [loadWheel, refreshUser]);

  if (!wheel) {
    return null;
  }

  const spinsLeft = wheel.user?.spinsLeft ?? 0;

  return (
    <>
      {hideButton ? null : (
        // Tròn 54px như nút liên hệ để hai nút thẳng cột; màu tím – hồng để nổi bật hơn nút liên hệ.
        <button
          type="button"
          data-floating-cta
          onClick={handleOpen}
          aria-label={spinsLeft > 0 ? `Mở ${wheel.title}, còn ${spinsLeft} lượt quay` : `Mở ${wheel.title}`}
          className={[
            styles.launcher,
            'group fixed z-[89] flex h-[54px] w-[54px] items-center justify-center rounded-full',
            'border border-white/80 bg-[linear-gradient(145deg,#7659df_0%,#b062d6_55%,#ec6fa8_100%)] text-white',
            'shadow-[0_14px_34px_rgba(118,89,223,0.42)] transition-[transform,box-shadow] duration-200',
            'hover:scale-[1.06] hover:shadow-[0_18px_40px_rgba(118,89,223,0.5)] active:scale-[0.96]',
            getLauncherPositionClass(contactCorner),
          ].join(' ')}
        >
          <span
            className="absolute inset-[1px] rounded-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_58%)]"
            aria-hidden="true"
          />
          <Gift className={`${styles.launcherGift} relative h-6 w-6`} strokeWidth={2.1} aria-hidden="true" />
          <Sparkle
            className={`${styles.launcherSparkle} left-[9px] top-[8px] h-2.5 w-2.5 fill-white text-white`}
            aria-hidden="true"
          />
          <Sparkle
            className={`${styles.launcherSparkle} ${styles.launcherSparkleLate} bottom-[10px] right-[8px] h-2 w-2 fill-white text-white`}
            aria-hidden="true"
          />
          {spinsLeft > 0 ? (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ff3f6c] px-1 text-[10.5px] font-bold text-white ring-2 ring-white">
              {spinsLeft}
            </span>
          ) : null}
          <span className="pointer-events-none absolute right-[calc(100%+12px)] whitespace-nowrap rounded-full border border-[#E4E7EE] bg-white px-3.5 py-2 text-[13px] font-semibold text-[#15110d] opacity-0 shadow-[0_12px_30px_rgba(26,17,39,0.14)] transition-opacity group-hover:opacity-100 max-lg:hidden">
            {spinsLeft > 0 ? `${wheel.title} · còn ${spinsLeft} lượt` : wheel.title}
          </span>
        </button>
      )}

      <LuckyWheelModal
        isOpen={isOpen}
        wheel={wheel}
        isLoggedIn={Boolean(userId)}
        onClose={isZaloLoginOpen ? undefined : handleClose}
        onSpun={handleSpun}
        onRequestZaloLogin={() => setIsZaloLoginOpen(true)}
        onRememberReopen={() => writeReopenFlag(true)}
      />

      {isZaloLoginOpen ? (
        <ZaloQrLoginModal open nextPath="/" onClose={() => setIsZaloLoginOpen(false)} onSuccess={handleZaloSuccess} />
      ) : null}
    </>
  );
}
