'use client';

import { useCallback, useEffect, useState } from 'react';
import PromoPopupModal from './PromoPopupModal.jsx';

const STORAGE_KEY = 'srx-home-promo-popup';
const DAY_MS = 24 * 60 * 60 * 1000;

function readStorage(storage) {
  try {
    return JSON.parse(storage.getItem(STORAGE_KEY) ?? 'null');
  } catch {
    return null;
  }
}

function writeStorage(storage, value) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Chế độ ẩn danh / chặn lưu trữ: popup vẫn chạy, chỉ không nhớ được lần đã xem.
  }
}

/** Lần trước khách đã xem popup của đúng phiên bản cấu hình này thì có cần chờ tiếp không. */
function wasShownRecently(settings, version) {
  if (settings.frequency === 'every_visit') {
    return false;
  }

  if (settings.frequency === 'once_per_session') {
    return readStorage(window.sessionStorage)?.version === version;
  }

  const lastShown = readStorage(window.localStorage);

  return lastShown?.version === version && Date.now() - Number(lastShown.shownAt) < settings.frequencyDays * DAY_MS;
}

function rememberShown(settings, version) {
  const value = { version, shownAt: Date.now() };

  if (settings.frequency === 'once_per_session') {
    writeStorage(window.sessionStorage, value);
  } else if (settings.frequency === 'once_per_days') {
    writeStorage(window.localStorage, value);
  }
}

function getScrollPercent() {
  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;

  if (scrollableHeight <= 0) {
    return 100;
  }

  return (window.scrollY / scrollableHeight) * 100;
}

function canDetectExitIntent() {
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

/** Gọi onTrigger đúng một lần theo cách xuất hiện đã cấu hình; trả về hàm hủy. */
function watchTrigger(settings, onTrigger) {
  if (settings.trigger === 'scroll') {
    const handleScroll = () => {
      if (getScrollPercent() >= settings.scrollPercent) {
        window.removeEventListener('scroll', handleScroll);
        onTrigger();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }

  if (settings.trigger === 'exit_intent' && canDetectExitIntent()) {
    const handleMouseOut = (event) => {
      // Chuột rời khỏi mép trên cửa sổ: thường là đi tới thanh tab / nút đóng.
      if (!event.relatedTarget && event.clientY <= 0) {
        document.removeEventListener('mouseout', handleMouseOut);
        onTrigger();
      }
    };

    document.addEventListener('mouseout', handleMouseOut);
    return () => document.removeEventListener('mouseout', handleMouseOut);
  }

  // 'delay', và 'exit_intent' trên thiết bị cảm ứng.
  const timer = window.setTimeout(onTrigger, settings.delaySeconds * 1000);
  return () => window.clearTimeout(timer);
}

/** Popup quảng cáo tự bật ở trang chủ. Cấu hình ở CRM: /srx/popup. */
export default function HomePromoPopup({ popup }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const handleClose = useCallback(() => setIsOpen(false), []);
  const settings = popup?.settings;
  const version = popup?.version;

  useEffect(() => {
    if (!settings || wasShownRecently(settings, version)) {
      return undefined;
    }

    return watchTrigger(settings, () => {
      rememberShown(settings, version);
      setActiveIndex(0);
      setIsOpen(true);
    });
  }, [settings, version]);

  if (!popup?.slides?.length) {
    return null;
  }

  return (
    <PromoPopupModal
      slides={popup.slides}
      isOpen={isOpen}
      activeIndex={activeIndex}
      onActiveIndexChange={setActiveIndex}
      onClose={handleClose}
      autoSlideSeconds={settings.autoSlideSeconds}
    />
  );
}
