'use client';

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

const feedbackCardSizeClass = "w-[180px] sm:w-[300px] lg:w-[340px]";

const feedbackFileNames = [
  "Case lâm sàng điều trị các vấn đề trên da cùng bộ sản phẩm SRX 5.webp",
  "Case lâm sàng điều trị các vấn đề trên da cùng bộ sản phẩm SRX 6.webp",
  "Case lâm sàng điều trị các vấn đề trên da cùng bộ sản phẩm SRX 7.webp",
  "Case lâm sàng điều trị các vấn đề trên da cùng bộ sản phẩm SRX 8.webp",
  "fb 1.webp",
  "fb 10.webp",
  "fb 11.webp",
  "fb 12.webp",
  "fb 13.webp",
  "fb 2.webp",
  "fb 3.webp",
  "fb 4.webp",
  "fb 5.webp",
  "fb 6.webp",
  "fb 7.webp",
  "fb 8.webp",
  "fb 9.webp",
  "FEEDBACK CHỈ 1 THÁNG DA CĂNG MỌNG, SÁNG RÕ RỆT CÙNG SRX REPAIR AMPOULE.webp",
  "feedback mask 4.webp",
  "feedback mask 5.webp",
  "feedback mask 6.webp",
  "feedback mask 7.webp",
  "feedback mask 8.webp",
  "feedback mask 9.webp",
  "feedback-mask.webp",
  "feedback-mask-2.webp",
  "feedback-mask-3.webp",
  "feedback-mask-4.webp",
  "feedback-mask-5.webp",
  "HẾT SẦN MỤN & THÂM SAU 8 TUẦN.webp",
  "Hiệu-quả-trẻ-hóa-sáng-da,-sạch-mụn-từ-Retinol-A-Crem-+-Repair-Ampoule-đã-được-kiểm-chứng.webp",
  "KẾ HOẠCH ĐIỀU TRỊ NÁM & TÀN NHANG BẰNG BÔI THOA TẠI NH.webp",
  "RETINOL-A-CREAM-và-NHỮNG-HÌNH-ẢNH-BIẾT-NÓI-3.webp",
  "THÍCH KHOE DA SAU PEEL VÀ CÁI KẾT.webp",
  "web_fb 2.webp",
];

const feedbackImages = feedbackFileNames.map((fileName, index) => {
  const label = fileName
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return {
    id: `feedback-${index + 1}`,
    src: `/assets/images/feedback/${encodeURIComponent(fileName)}`,
    alt: `Feedback SRX ${label}`,
    label,
  };
});

function GalleryButton({ children, className = "", ...props }) {
  return (
    <button
      type="button"
      className={`flex h-11 w-11 items-center justify-center rounded-full transition ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default function HomeFeedbackGallerySection() {
  const marqueeRef = useRef(null);
  const frameRef = useRef(null);
  const lastTimestampRef = useRef(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPopupImageVisible, setIsPopupImageVisible] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isModalOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsModalOpen(false);
      }

      if (feedbackImages.length > 1 && event.key === "ArrowLeft") {
        setActiveIndex((current) => (current - 1 + feedbackImages.length) % feedbackImages.length);
      }

      if (feedbackImages.length > 1 && event.key === "ArrowRight") {
        setActiveIndex((current) => (current + 1) % feedbackImages.length);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModalOpen]);

  useEffect(() => {
    if (!isModalOpen) {
      setIsPopupImageVisible(false);
      return undefined;
    }

    setIsPopupImageVisible(false);

    const frameId = window.requestAnimationFrame(() => {
      setIsPopupImageVisible(true);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [activeIndex, isModalOpen]);

  useEffect(() => {
    const container = marqueeRef.current;

    if (!container) {
      return undefined;
    }

    if (isModalOpen || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      lastTimestampRef.current = null;
      return undefined;
    }

    const tick = (timestamp) => {
      const activeContainer = marqueeRef.current;

      if (!activeContainer) {
        return;
      }

      if (lastTimestampRef.current === null) {
        lastTimestampRef.current = timestamp;
        frameRef.current = window.requestAnimationFrame(tick);
        return;
      }

      const delta = Math.min(timestamp - lastTimestampRef.current, 48);
      const resetPoint = activeContainer.scrollWidth / 2;
      lastTimestampRef.current = timestamp;

      if (resetPoint > 0) {
        activeContainer.scrollLeft += delta * 0.075;

        if (activeContainer.scrollLeft >= resetPoint) {
          activeContainer.scrollLeft -= resetPoint;
        }
      }

      frameRef.current = window.requestAnimationFrame(tick);
    };

    frameRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [isModalOpen]);

  const openAt = (index) => {
    setActiveIndex(index);
    setIsModalOpen(true);
  };

  const showPrevious = () => {
    setActiveIndex((current) => (current - 1 + feedbackImages.length) % feedbackImages.length);
  };

  const showNext = () => {
    setActiveIndex((current) => (current + 1) % feedbackImages.length);
  };

  const activeImage = feedbackImages[activeIndex];

  return (
    <>
      <section className="bg-white px-4 pb-14 sm:px-6 sm:pb-18 lg:px-8 lg:pb-24">
        <div className="mx-auto max-w-full overflow-hidden">
          <div className="relative mt-5 sm:mt-6">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-white via-white/90 to-transparent sm:w-14" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-white via-white/90 to-transparent sm:w-14" />

            <div
              ref={marqueeRef}
              className="overflow-hidden [scrollbar-width:none] py-4"
              style={{ msOverflowStyle: "none" }}
            >
              <div className="flex w-max gap-4 px-4 pb-5 sm:gap-5 sm:px-6 sm:pb-6 lg:px-8 lg:pb-8">
                {[0, 1].map((copyIndex) =>
                  feedbackImages.map((image, index) => (
                    <button
                      key={`${image.id}-${copyIndex}`}
                      type="button"
                      tabIndex={copyIndex === 0 ? 0 : -1}
                      onClick={() => openAt(index)}
                      className={`${feedbackCardSizeClass} group relative aspect-square shrink-0 overflow-hidden rounded-[28px] shadow-[0_0px_6px_rgba(0,0,0,0.2)] transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:shadow-[0_0px_12px_rgba(0,0,0,0.3)]`}
                      aria-label={`Mo anh lon: ${image.label}`}
                    >
                      <span className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.92),rgba(242,245,255,0.82)_58%,rgba(233,238,255,0.98))]" />
                      <img
                        src={image.src}
                        alt={image.alt}
                        className="relative z-[1] aspect-square w-full rounded-[20px] object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                        loading="lazy"
                        decoding="async"
                      />
                      <span className="pointer-events-none absolute inset-x-4 bottom-4 z-[2] h-16 rounded-[18px] bg-gradient-to-t from-white/50 to-transparent" />
                    </button>
                  )),
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {isMounted && isModalOpen && activeImage
        ? createPortal(
            <div
              className="fixed inset-0 z-[140] bg-[rgba(0,0,0,0.3)] backdrop-blur-md"
              role="dialog"
              aria-modal="true"
              aria-label="Feedback gallery popup"
            >
              <div className="absolute inset-0" onClick={() => setIsModalOpen(false)} aria-hidden="true" />

              <div className="relative z-10 flex h-full items-center justify-center">
                <img
                  src={activeImage.src}
                  alt={activeImage.alt}
                  className={`h-[80vh] w-auto max-w-[calc(100vw-1.5rem)] rounded-[12px] object-contain transition-opacity duration-300 ease-out sm:max-w-[calc(100vw-8rem)] ${
                    isPopupImageVisible ? "opacity-100" : "opacity-0"
                  }`}
                />

                <GalleryButton
                  onClick={() => setIsModalOpen(false)}
                  className="absolute right-4 top-4 bg-[rgba(0,0,0,0.32)] text-white hover:bg-[rgba(0,0,0,0.5)] sm:right-6 sm:top-6"
                  aria-label="Dong popup"
                >
                  <X className="h-5 w-5" />
                </GalleryButton>

                {feedbackImages.length > 1 ? (
                  <>
                    <GalleryButton
                      onClick={showPrevious}
                      className="absolute left-4 top-1/2 -translate-y-1/2 border border-[#d2dafd] bg-white/92 text-[#1c2745] shadow-[0_18px_40px_rgba(49,65,109,0.12)] hover:bg-[rgba(28,39,69,0.5)] hover:text-white sm:left-6 lg:left-8"
                      aria-label="Anh truoc"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </GalleryButton>

                    <GalleryButton
                      onClick={showNext}
                      className="absolute right-4 top-1/2 -translate-y-1/2 border border-[#d2dafd] bg-white/92 text-[#1c2745] shadow-[0_18px_40px_rgba(49,65,109,0.12)] hover:bg-[rgba(28,39,69,0.5)] hover:text-white sm:right-6 lg:right-8"
                      aria-label="Anh tiep theo"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </GalleryButton>
                  </>
                ) : null}

                <p
                  className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/92 px-4 py-1.5 text-sm text-[#38405d] shadow-[0_12px_32px_rgba(0,0,0,0.12)] sm:bottom-6 sm:text-[15px]"
                  style={{ fontFamily: '"Inter", "Hubot Sans", sans-serif' }}
                >
                  {activeIndex + 1} / {feedbackImages.length}
                </p>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
