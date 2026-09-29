'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import styles from './PromoPopupModal.module.css';

// Khớp thời lượng hiệu ứng đóng trong PromoPopupModal.module.css.
const EXIT_DURATION_MS = 260;

function PopupButton({ children, className = '', ...props }) {
  return (
    <button
      type="button"
      className={`flex h-10 w-10 items-center justify-center rounded-full transition ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function SlideImage({ slide, className }) {
  if (!slide.mobileSrc) {
    return <img src={slide.src} alt={slide.alt} className={className} />;
  }

  return (
    <picture>
      <source media="(max-width: 640px)" srcSet={slide.mobileSrc} />
      <img src={slide.src} alt={slide.alt} className={className} />
    </picture>
  );
}

function SlideLink({ slide, className, children, ...props }) {
  const newTabProps = slide.openInNewTab ? { target: '_blank', rel: 'noopener noreferrer' } : {};

  return (
    <Link href={slide.href} className={className} {...newTabProps} {...props}>
      {children}
    </Link>
  );
}

/**
 * Popup quảng cáo dùng chung cho trang chủ (tự bật) và trang chi tiết tin tức (bấm vào ảnh xếp chồng).
 * Mỗi slide: { id, src, mobileSrc, alt, title, ctaLabel, href, openInNewTab }.
 */
export default function PromoPopupModal({
  slides = [],
  isOpen,
  activeIndex,
  onActiveIndexChange,
  onClose,
  autoSlideSeconds = 0,
}) {
  const [isMounted, setIsMounted] = useState(false);
  // Giữ popup trong DOM thêm một nhịp sau khi đóng để hiệu ứng biến mất kịp chạy.
  const [isRendered, setIsRendered] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const total = slides.length;

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
      if (event.key === 'Escape') {
        onClose();
      }

      if (total > 1 && event.key === 'ArrowLeft') {
        onActiveIndexChange((current) => (current - 1 + total) % total);
      }

      if (total > 1 && event.key === 'ArrowRight') {
        onActiveIndexChange((current) => (current + 1) % total);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onActiveIndexChange, onClose, total]);

  // Hẹn giờ chạy lại mỗi lần đổi ảnh, nên bấm chuyển tay cũng được tính lại từ đầu.
  useEffect(() => {
    if (!isOpen || total < 2 || autoSlideSeconds <= 0) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      onActiveIndexChange((current) => (current + 1) % total);
    }, autoSlideSeconds * 1000);

    return () => window.clearTimeout(timer);
  }, [activeIndex, autoSlideSeconds, isOpen, onActiveIndexChange, total]);

  if (!isMounted || !isRendered || !total) {
    return null;
  }

  const activeSlide = slides[activeIndex] ?? slides[0];
  const showPrevious = () => onActiveIndexChange((current) => (current - 1 + total) % total);
  const showNext = () => onActiveIndexChange((current) => (current + 1) % total);

  return createPortal(
    <div
      className={`${styles.overlay} fixed inset-0 z-[120] grid h-dvh w-screen place-items-center bg-[#0f1528]/72 p-4 backdrop-blur-md sm:p-6`}
      data-state={isClosing ? 'closing' : 'open'}
      role="dialog"
      aria-modal="true"
      aria-label={activeSlide.title || 'Chương trình ưu đãi SRX'}
    >
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      <div className={`${styles.card} relative z-10 mx-auto w-full max-w-[760px]`}>
        <div className="relative overflow-hidden rounded-[34px] bg-white shadow-[0_36px_100px_rgba(0,0,0,0.35)]">
          <div className="relative aspect-square max-h-[calc(100dvh-2rem)] overflow-hidden bg-[#e7eefc] sm:max-h-[calc(100dvh-3rem)]">
            {slides.map((slide, index) => {
              const isActive = index === activeIndex;

              return (
                <div
                  key={slide.id ?? slide.src}
                  className={`absolute inset-0 transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    isActive ? 'opacity-100 scale-100' : 'pointer-events-none opacity-0 scale-[1.015]'
                  }`}
                  aria-hidden={!isActive}
                >
                  {slide.href ? (
                    <SlideLink
                      slide={slide}
                      className="block h-full w-full cursor-pointer"
                      aria-label={slide.title || slide.ctaLabel || slide.alt}
                      tabIndex={isActive ? 0 : -1}
                    >
                      <SlideImage
                        slide={slide}
                        className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.01]"
                      />
                    </SlideLink>
                  ) : (
                    <SlideImage slide={slide} className="h-full w-full object-cover" />
                  )}
                </div>
              );
            })}

            <div className={styles.shine} aria-hidden="true" />

            {activeSlide.title ? (
              <div className={`${styles.reveal} pointer-events-none absolute left-4 top-4 z-20 max-w-[calc(100%-5.5rem)] sm:left-5 sm:top-5`}>
                <span className="inline-block rounded-full bg-white/88 px-4 py-2 text-[13px] font-semibold leading-snug text-[#141822] shadow-[0_12px_28px_rgba(15,21,40,0.16)] backdrop-blur-sm sm:text-[14px]">
                  {activeSlide.title}
                </span>
              </div>
            ) : null}

            <PopupButton
              onClick={onClose}
              className={`${styles.closeButton} absolute right-4 top-4 z-20 bg-black text-white hover:bg-[#161616]`}
              aria-label="Đóng popup"
            >
              <X className="h-5 w-5" />
            </PopupButton>

            {total > 1 ? (
              <>
                <PopupButton
                  onClick={showPrevious}
                  className="absolute left-4 top-1/2 z-20 -translate-y-1/2 border border-[#1a1a1a] bg-white/78 text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white"
                  aria-label="Ảnh trước"
                >
                  <ChevronLeft className="h-5 w-5" />
                </PopupButton>

                <PopupButton
                  onClick={showNext}
                  className="absolute right-4 top-1/2 z-20 -translate-y-1/2 border border-[#1a1a1a] bg-white/78 text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white"
                  aria-label="Ảnh tiếp theo"
                >
                  <ChevronRight className="h-5 w-5" />
                </PopupButton>

                <div className={`${styles.revealLate} absolute inset-x-0 bottom-5 z-20 flex justify-center gap-2`}>
                  {slides.map((slide, index) => (
                    <button
                      key={`${slide.id ?? slide.src}-dot`}
                      type="button"
                      onClick={() => onActiveIndexChange(index)}
                      className={`h-2.5 rounded-full transition ${
                        index === activeIndex
                          ? 'w-8 bg-white shadow-[0_4px_16px_rgba(255,255,255,0.65)]'
                          : 'w-2.5 bg-white/55'
                      }`}
                      aria-label={`Chuyển tới ảnh ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            ) : null}

            {activeSlide.href ? (
              <div className={`${styles.revealLate} absolute bottom-4 left-4 z-20 sm:bottom-5 sm:left-5`}>
                <SlideLink
                  slide={activeSlide}
                  className="inline-flex items-center rounded-full bg-black/80 px-4 py-2 text-[13px] font-semibold text-white shadow-[0_16px_32px_rgba(0,0,0,0.18)] transition hover:bg-black"
                >
                  {activeSlide.ctaLabel || 'Xem ngay'}
                </SlideLink>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
