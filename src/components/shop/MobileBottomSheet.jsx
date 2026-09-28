'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { CONTACT_ITEMS, renderContactIcon } from '../FloatingCallToAction';

// `showOnDesktop` keeps the sheet usable at lg+, where it becomes a card above the bottom bar's left edge.
export function BottomSheet({ isOpen, onClose, title, showOnDesktop = false, children }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isMounted) {
    return null;
  }

  // Portalled to body so a transformed page ancestor cannot anchor `fixed` to itself.
  return createPortal(
    <div
      className={`fixed inset-0 z-[95] ${showOnDesktop ? '' : 'lg:hidden'} ${isOpen ? '' : 'pointer-events-none'}`}
      aria-hidden={!isOpen}
    >
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 lg:bg-black/15 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={[
          'absolute inset-x-0 bottom-0 flex max-h-[85dvh] flex-col rounded-t-[24px] bg-white shadow-[0_-20px_60px_rgba(15,23,42,0.18)]',
          'transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
          showOnDesktop
            ? 'lg:bottom-[calc(96px+env(safe-area-inset-bottom))] lg:left-8 lg:right-auto lg:w-[360px] lg:rounded-[24px] lg:shadow-[0_28px_70px_rgba(26,17,39,0.2)] xl:left-10 2xl:left-12'
            : '',
          isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full lg:translate-y-4 lg:opacity-0',
        ].join(' ')}
      >
        <div className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-[#ddd3c6] lg:hidden" />
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-[#15110d] transition hover:bg-[#f4f3f1]"
          aria-label="Đóng"
        >
          <X className="h-5 w-5" />
        </button>
        {children}
      </div>
    </div>,
    document.body,
  );
}

export function ContactBottomSheet({ isOpen, onClose, showOnDesktop = false }) {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Liên hệ SRX" showOnDesktop={showOnDesktop}>
      <div className="px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-3 lg:pb-4 lg:pt-5">
        <div className="pr-10 text-[16px] font-semibold text-[#15110d]">Liên hệ tư vấn</div>
        <div className="mt-3 space-y-1">
          {CONTACT_ITEMS.map((item) => {
            const isExternal = item.id !== 'phone';

            return (
              <a
                key={item.id}
                href={item.href}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noreferrer' : undefined}
                onClick={onClose}
                className="flex items-center gap-3 rounded-[16px] px-2 py-2.5 transition active:bg-[#f4f3f1]"
              >
                {renderContactIcon(item.icon)}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[15px] font-semibold text-[#231b17]">{item.label}</div>
                  <div className="truncate text-[13px] text-[#6d6780]">{item.meta}</div>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </BottomSheet>
  );
}
