'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, LoaderCircle, RefreshCw, ScanLine, Smartphone, TimerReset, X } from 'lucide-react';
import ZaloLogo from './ZaloLogo.jsx';

const POLL_INTERVAL_MS = 2000;

async function parseJson(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

function formatCountdown(seconds) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60);

  return `${String(minutes).padStart(2, '0')}:${String(safeSeconds % 60).padStart(2, '0')}`;
}

const STATUS_COPY = {
  pending: {
    title: 'Quét mã để đăng nhập hoặc đăng ký',
    description: 'Quét mã bằng camera điện thoại, hoặc QR trên Zalo Mini App của SRX Việt Nam',
    mobileDescription: 'Bấm nút bên trên để mở Zalo và xác nhận, hoặc dùng thiết bị khác quét mã QR.',
  },
  scanned: {
    title: 'Đã quét mã thành công',
    description: 'Mở mini app SRX trên điện thoại và bấm "Xác nhận đăng nhập" để hoàn tất.',
  },
  confirmed: {
    title: 'Đang hoàn tất đăng nhập',
    description: 'Bạn đã xác nhận trên Zalo. Vui lòng chờ trong giây lát.',
  },
  claimed: {
    title: 'Đăng nhập thành công',
    description: 'Đang chuyển bạn vào tài khoản SRX.',
  },
  cancelled: {
    title: 'Yêu cầu đã bị hủy',
    description: 'Đăng nhập đã bị từ chối trên Zalo. Tạo mã mới nếu bạn muốn thử lại.',
  },
  expired: {
    title: 'Mã QR đã hết hạn',
    description: 'Mỗi mã chỉ có hiệu lực trong 5 phút. Bấm "Tạo mã mới" để tiếp tục.',
  },
};

const DESKTOP_STEPS = [
  'Mở ứng dụng Zalo trên điện thoại',
  'Quét mã QR bên dưới bằng camera của Zalo',
  'Bấm "Xác nhận đăng nhập" trong Mini App SRX',
];

// Nút "Mở Zalo" chỉ hữu ích khi deep link mở được app, tức trên thiết bị di động.
function detectMobileDevice() {
  if (typeof window === 'undefined') {
    return false;
  }

  if (/android|iphone|ipad|ipod|windows phone/i.test(window.navigator.userAgent)) {
    return true;
  }

  return window.matchMedia?.('(pointer: coarse)').matches ?? false;
}

export default function ZaloQrLoginModal({ open, onClose, onSuccess, nextPath = '/account' }) {
  const [session, setSession] = useState(null);
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const isMountedRef = useRef(false);
  const isClaimingRef = useRef(false);
  const activeTicketRef = useRef('');
  const startRunIdRef = useRef(0);

  const startSession = useCallback(async () => {
    const runId = startRunIdRef.current + 1;
    startRunIdRef.current = runId;

    const isStale = () => !isMountedRef.current || startRunIdRef.current !== runId;

    setStatus('loading');
    setErrorMessage('');
    setSession(null);

    try {
      const response = await fetch('/api/auth/zalo-qr/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nextPath }),
        cache: 'no-store',
      });
      const data = await parseJson(response);

      if (isStale()) {
        return;
      }

      if (!response.ok) {
        setStatus('error');
        setErrorMessage(data.message ?? 'Không thể tạo mã QR đăng nhập.');
        return;
      }

      activeTicketRef.current = data.ticket ?? '';
      setSession(data);
      setStatus('pending');
      setSecondsLeft(Math.max(0, Math.round((new Date(data.expiresAt).getTime() - Date.now()) / 1000)));
    } catch {
      if (!isStale()) {
        setStatus('error');
        setErrorMessage('Không thể kết nối tới máy chủ. Vui lòng thử lại.');
      }
    }
  }, [nextPath]);

  const claimSession = useCallback(async () => {
    if (isClaimingRef.current) {
      return;
    }

    isClaimingRef.current = true;

    try {
      const response = await fetch('/api/auth/zalo-qr/claim', { method: 'POST', cache: 'no-store' });
      const data = await parseJson(response);

      if (!isMountedRef.current) {
        return;
      }

      if (!response.ok) {
        setStatus(data.code === 'expired' ? 'expired' : 'error');
        setErrorMessage(data.message ?? 'Không thể hoàn tất đăng nhập.');
        return;
      }

      activeTicketRef.current = '';
      setStatus('claimed');
      onSuccess?.(data.user, data.nextPath ?? nextPath);
    } catch {
      if (isMountedRef.current) {
        setStatus('error');
        setErrorMessage('Không thể hoàn tất đăng nhập. Vui lòng thử lại.');
      }
    } finally {
      isClaimingRef.current = false;
    }
  }, [nextPath, onSuccess]);

  useEffect(() => {
    isMountedRef.current = true;
    setIsMobile(detectMobileDevice());

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    startSession();

    return () => {
      const ticket = activeTicketRef.current;
      activeTicketRef.current = '';

      if (!ticket) {
        return;
      }

      fetch('/api/auth/zalo-qr/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket }),
        keepalive: true,
      }).catch(() => {});
    };
  }, [open, startSession]);

  useEffect(() => {
    if (!open || !['pending', 'scanned'].includes(status)) {
      return undefined;
    }

    const intervalId = window.setInterval(async () => {
      try {
        const response = await fetch('/api/auth/zalo-qr/status', { method: 'GET', cache: 'no-store' });
        const data = await parseJson(response);

        if (!isMountedRef.current || !response.ok) {
          return;
        }

        if (data.status === 'confirmed') {
          setStatus('confirmed');
          claimSession();
          return;
        }

        if (['scanned', 'expired', 'cancelled'].includes(data.status)) {
          setStatus(data.status);
        }
      } catch {
        // Ignore transient network errors; the next polling cycle will retry.
      }
    }, POLL_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [claimSession, open, status]);

  useEffect(() => {
    if (!session?.expiresAt || !['pending', 'scanned'].includes(status)) {
      return undefined;
    }

    const expiresAtMs = new Date(session.expiresAt).getTime();
    const tick = () => {
      const remaining = Math.round((expiresAtMs - Date.now()) / 1000);
      setSecondsLeft(Math.max(0, remaining));

      if (remaining <= 0) {
        setStatus('expired');
      }
    };

    tick();
    const intervalId = window.setInterval(tick, 1000);

    return () => window.clearInterval(intervalId);
  }, [session, status]);

  useEffect(() => {
    if (!open) {
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
  }, [onClose, open]);

  if (!open || typeof document === 'undefined') {
    return null;
  }

  const copy = STATUS_COPY[status] ?? STATUS_COPY.pending;
  const isQrUsable = ['pending', 'scanned'].includes(status);
  const canRetry = ['expired', 'cancelled', 'error'].includes(status);
  const showOpenAppButton = isMobile && isQrUsable && Boolean(session?.scanUrl);
  const description = (isMobile && copy.mobileDescription) || copy.description;
  const totalSeconds = session?.expiresInSeconds || 300;
  const countdownPercent = Math.min(100, Math.max(0, (secondsLeft / totalSeconds) * 100));

  return createPortal(
    <div className="fixed inset-0 z-[150] overflow-hidden" role="dialog" aria-modal="true" aria-label="Đăng nhập bằng mã QR Zalo">
      <div className="absolute inset-0 bg-[rgba(9,12,20,0.62)] backdrop-blur-[6px]" onClick={onClose} aria-hidden="true" />

      <div className="relative flex min-h-full items-end justify-center sm:items-center sm:p-5">
        <div className="relative flex max-h-[calc(100dvh-16px)] w-full max-w-[416px] flex-col overflow-y-auto rounded-t-[26px] bg-white pb-6 shadow-[0_-18px_70px_rgba(0,0,0,0.28)] sm:max-h-[calc(100vh-48px)] sm:rounded-[26px] sm:pb-7 sm:shadow-[0_30px_90px_rgba(9,12,20,0.28)]">
          <div className="relative rounded-t-[26px] bg-gradient-to-b from-[#EDF3FF] to-white px-6 pb-4 pt-5 text-center">
            <span className="mx-auto mb-4 block h-1 w-10 rounded-full bg-[#D8DDE6] sm:hidden" aria-hidden="true" />

            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng"
              className="absolute right-3.5 top-3.5 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-[#5E6266] shadow-[0_4px_14px_rgba(9,12,20,0.10)] transition hover:bg-white hover:text-[#15110d]"
            >
              <X className="h-4 w-4" />
            </button>

            <img
              src="/assets/images/header/logo_srx.webp"
              alt="SRX Việt Nam"
              className="mx-auto h-7 w-auto object-contain"
            />

            <h2 className="mx-auto mt-4 max-w-[300px] text-[19px] font-bold leading-[1.4] tracking-[-0.01em] text-[#15110d] sm:text-[20px]">
              {copy.title}
            </h2>

            <p className="mx-auto mt-2 max-w-[320px] text-[13px] leading-[1.55] text-[#5E6266]">{description}</p>
          </div>

          <div className="px-6">
            {showOpenAppButton ? (
              <>
                <a
                  href={session.scanUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-[52px] w-full items-center justify-center gap-2.5 rounded-full bg-[#0068FF] px-5 text-[15px] font-bold text-white shadow-[0_12px_24px_rgba(0,104,255,0.28)] transition active:scale-[0.99]"
                >
                  <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-white">
                    <ZaloLogo className="h-5 w-5" />
                  </span>
                  Mở ứng dụng Zalo
                </a>

                <div className="my-4 flex items-center gap-3">
                  <span className="h-px flex-1 bg-[#E4E7EE]" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9AA1AE]">
                    hoặc quét mã
                  </span>
                  <span className="h-px flex-1 bg-[#E4E7EE]" />
                </div>
              </>
            ) : null}

            <div className="flex justify-center">
              <div className="relative rounded-[20px] border border-[#E4E7EE] bg-white p-3 shadow-[0_14px_38px_rgba(20,32,64,0.10)]">
                <span
                  className="pointer-events-none absolute left-2 top-2 h-4 w-4 rounded-tl-[8px] border-l-2 border-t-2 border-[#2F66EA]"
                  aria-hidden="true"
                />
                <span
                  className="pointer-events-none absolute right-2 top-2 h-4 w-4 rounded-tr-[8px] border-r-2 border-t-2 border-[#2F66EA]"
                  aria-hidden="true"
                />
                <span
                  className="pointer-events-none absolute bottom-2 left-2 h-4 w-4 rounded-bl-[8px] border-b-2 border-l-2 border-[#2F66EA]"
                  aria-hidden="true"
                />
                <span
                  className="pointer-events-none absolute bottom-2 right-2 h-4 w-4 rounded-br-[8px] border-b-2 border-r-2 border-[#2F66EA]"
                  aria-hidden="true"
                />

                <div className="relative flex aspect-square w-[178px] items-center justify-center overflow-hidden rounded-[12px] sm:w-[196px]">
                  {status === 'loading' ? (
                    <LoaderCircle className="h-7 w-7 animate-spin text-[#2F66EA]" />
                  ) : session?.qrImage ? (
                    <>
                      <img
                        src={session.qrImage}
                        alt="Mã QR đăng nhập SRX bằng Zalo"
                        className={`h-full w-full object-contain transition ${isQrUsable ? '' : 'opacity-10'}`}
                      />

                      {status === 'scanned' ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[rgba(255,255,255,0.95)] px-4 text-center">
                          <Smartphone className="h-8 w-8 text-[#2F66EA]" />
                          <div className="text-[13.5px] font-semibold text-[#15110d]">Xác nhận trên điện thoại</div>
                        </div>
                      ) : null}

                      {status === 'confirmed' ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[rgba(255,255,255,0.95)]">
                          <LoaderCircle className="h-8 w-8 animate-spin text-[#2F66EA]" />
                          <div className="text-[13.5px] font-semibold text-[#15110d]">Đang đăng nhập...</div>
                        </div>
                      ) : null}

                      {status === 'claimed' ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[rgba(255,255,255,0.97)]">
                          <CheckCircle2 className="h-9 w-9 text-[#237a3b]" />
                          <div className="text-[13.5px] font-semibold text-[#15110d]">Đăng nhập thành công</div>
                        </div>
                      ) : null}

                      {canRetry ? (
                        <button
                          type="button"
                          onClick={startSession}
                          className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[rgba(255,255,255,0.97)] text-[#15110d] transition hover:bg-white"
                        >
                          <TimerReset className="h-8 w-8 text-[#2F66EA]" />
                          <span className="text-[13.5px] font-semibold">Tạo mã mới</span>
                        </button>
                      ) : null}
                    </>
                  ) : (
                    <div className="px-4 text-center text-[13px] leading-6 text-[#5E6266]">
                      {errorMessage || 'Không tải được mã QR.'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {isQrUsable ? (
              <div className="mx-auto mt-4 w-full max-w-[300px]">
                <div className="flex items-center justify-center gap-1.5 text-[12px] font-semibold text-[#7A8190]">
                  <TimerReset className="h-3.5 w-3.5 text-[#2F66EA]" />
                  <span>Mã hết hạn sau</span>
                  <span className="font-bold tabular-nums text-[#15110d]">{formatCountdown(secondsLeft)}</span>
                </div>
                <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-[#EDEFF4]">
                  <div
                    className="h-full rounded-full bg-[#2F66EA] transition-[width] duration-1000 ease-linear"
                    style={{ width: `${countdownPercent}%` }}
                  />
                </div>
              </div>
            ) : null}

            {!isMobile && status === 'pending' ? (
              <ol className="mt-5 space-y-2 rounded-[16px] bg-[#F7F8FB] px-4 py-3.5">
                {DESKTOP_STEPS.map((step, index) => (
                  <li key={step} className="flex items-start gap-2.5 text-[12.5px] leading-5 text-[#5E6266]">
                    <span className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[11px] font-bold text-[#2F66EA] shadow-[0_1px_3px_rgba(20,32,64,0.10)]">
                      {index + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            ) : null}

            {isMobile && isQrUsable ? (
              <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[12px] leading-5 text-[#9AA1AE]">
                <ScanLine className="h-3.5 w-3.5 shrink-0" />
                Mã QR dùng khi bạn quét bằng một điện thoại khác.
              </p>
            ) : null}

            {errorMessage && session?.qrImage ? (
              <div className="mt-4 rounded-[14px] border border-[#F3D6D6] bg-[#FFF6F6] px-4 py-3 text-center text-[12.5px] leading-5 text-[#A33A3A]">
                {errorMessage}
              </div>
            ) : null}

            {canRetry ? (
              <button
                type="button"
                onClick={startSession}
                className="mt-5 inline-flex h-[50px] w-full items-center justify-center gap-2 rounded-full bg-[#15110d] text-[14.5px] font-semibold text-white transition hover:bg-[#2b2520]"
              >
                <RefreshCw className="h-4 w-4" />
                Tạo mã mới
              </button>
            ) : null}

            <button
              type="button"
              onClick={onClose}
              className="mx-auto mt-5 flex h-9 items-center justify-center px-4 text-[13.5px] font-semibold text-[#5E6266] transition hover:text-[#15110d]"
            >
              Quay lại
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
