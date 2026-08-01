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
    title: 'Quét mã bằng ứng dụng Zalo',
    description: 'Mở Zalo trên điện thoại, chọn biểu tượng quét mã QR và hướng camera vào mã bên dưới.',
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

export default function ZaloQrLoginModal({ open, onClose, onSuccess, nextPath = '/account' }) {
  const [session, setSession] = useState(null);
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(0);

  const isMountedRef = useRef(false);
  const isClaimingRef = useRef(false);
  // Ticket đang hiển thị, giữ trong ref để hàm dọn dẹp của effect hủy đúng mã đó.
  const activeTicketRef = useRef('');
  // Bấm "Tạo mã mới" liên tục (hoặc StrictMode gọi effect hai lần) sẽ có nhiều lần
  // start chồng nhau; chỉ lần mới nhất được phép ghi kết quả ra giao diện.
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

      // Ticket đã dùng xong, không cần hủy khi đóng popup nữa.
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

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Mở popup -> tạo ticket mới; đóng popup -> hủy ticket để mã QR cũ không còn dùng được.
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
        // Gửi kèm ticket để không lỡ tay hủy mã mới vừa được tạo ngay sau đó.
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
        // Mất mạng tạm thời: bỏ qua, vòng poll kế tiếp thử lại.
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

  return createPortal(
    <div className="fixed inset-0 z-[150] overflow-y-auto" role="dialog" aria-modal="true" aria-label="Đăng nhập bằng mã QR Zalo">
      <div className="absolute inset-0 bg-[rgba(21,17,13,0.4)] backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      <div className="relative flex min-h-full items-center justify-center p-4">
        <div className="w-full max-w-[440px] rounded-[24px] border border-[#D9D9D9] bg-white p-6 shadow-[0_30px_80px_rgba(21,17,13,0.18)] md:p-7">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-[12px] border border-[#D9D9D9] bg-[#F6F6F6]">
                <ZaloLogo className="h-5 w-5" />
              </span>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5E6266]">Zalo Mini App</div>
                <div className="text-[16px] font-semibold tracking-[-0.02em] text-[#15110d]">Đăng nhập bằng mã QR</div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#D9D9D9] text-[#5E6266] transition hover:border-[#15110d] hover:text-[#15110d]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-6 flex flex-col items-center text-center">
            <div className="relative flex h-[248px] w-[248px] items-center justify-center overflow-hidden rounded-[20px] border border-[#D9D9D9] bg-white p-3">
              {status === 'loading' ? (
                <LoaderCircle className="h-7 w-7 animate-spin text-[#5E6266]" />
              ) : session?.qrImage ? (
                <>
                  <img
                    src={session.qrImage}
                    alt="Mã QR đăng nhập SRX bằng Zalo"
                    className={`h-full w-full object-contain transition ${isQrUsable ? '' : 'opacity-15'}`}
                  />

                  {status === 'scanned' ? (
                    <div className="absolute inset-3 flex flex-col items-center justify-center gap-2 rounded-[14px] bg-[rgba(255,255,255,0.92)]">
                      <Smartphone className="h-8 w-8 text-[#0068FF]" />
                      <div className="text-[14px] font-semibold text-[#15110d]">Xác nhận trên điện thoại</div>
                    </div>
                  ) : null}

                  {status === 'confirmed' ? (
                    <div className="absolute inset-3 flex flex-col items-center justify-center gap-2 rounded-[14px] bg-[rgba(255,255,255,0.92)]">
                      <LoaderCircle className="h-8 w-8 animate-spin text-[#15110d]" />
                      <div className="text-[14px] font-semibold text-[#15110d]">Đang đăng nhập...</div>
                    </div>
                  ) : null}

                  {status === 'claimed' ? (
                    <div className="absolute inset-3 flex flex-col items-center justify-center gap-2 rounded-[14px] bg-[rgba(255,255,255,0.94)]">
                      <CheckCircle2 className="h-9 w-9 text-[#237a3b]" />
                      <div className="text-[14px] font-semibold text-[#15110d]">Đăng nhập thành công</div>
                    </div>
                  ) : null}

                  {canRetry ? (
                    <button
                      type="button"
                      onClick={startSession}
                      className="absolute inset-3 flex flex-col items-center justify-center gap-2 rounded-[14px] bg-[rgba(255,255,255,0.94)] text-[#15110d]"
                    >
                      <TimerReset className="h-8 w-8" />
                      <span className="text-[14px] font-semibold">Tạo mã mới</span>
                    </button>
                  ) : null}
                </>
              ) : (
                <div className="px-5 text-[13.5px] leading-6 text-[#5E6266]">
                  {errorMessage || 'Không tải được mã QR.'}
                </div>
              )}
            </div>

            <div className="mt-5 text-[16px] font-semibold tracking-[-0.02em] text-[#15110d]">{copy.title}</div>
            <p className="mt-2 max-w-[340px] text-[13.5px] leading-6 text-[#5E6266]">{copy.description}</p>

            {isQrUsable ? (
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#D9D9D9] bg-[#F6F6F6] px-4 py-2 text-[13px] font-semibold text-[#5E6266]">
                <ScanLine className="h-4 w-4" />
                Mã hết hạn sau {formatCountdown(secondsLeft)}
              </div>
            ) : null}

            {errorMessage && session?.qrImage ? (
              <div className="mt-4 w-full rounded-[14px] border border-[#f0cfcf] bg-[#fff5f5] px-4 py-3 text-[13px] leading-6 text-[#a33a3a]">
                {errorMessage}
              </div>
            ) : null}

            {canRetry ? (
              <button
                type="button"
                onClick={startSession}
                className="mt-5 inline-flex h-[46px] w-full items-center justify-center gap-2 rounded-full bg-[#15110d] text-[14.5px] font-semibold text-white transition hover:bg-[#2b2520]"
              >
                <RefreshCw className="h-4 w-4" />
                Tạo mã mới
              </button>
            ) : null}

          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
