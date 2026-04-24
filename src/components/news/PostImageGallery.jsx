'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const previewTransitionClass =
  'transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]';

function getStackLayouts(total, isHovered) {
  if (total <= 1) {
    return [{ x: 0, y: 0, rotate: 0, scale: 1, zIndex: 30 }];
  }

  if (total === 2) {
    return isHovered
      ? [
          { x: -44, y: 22, rotate: -11, scale: 0.95, zIndex: 10 },
          { x: 38, y: -20, rotate: 9, scale: 1, zIndex: 20 },
        ]
      : [
          { x: -18, y: 14, rotate: -8, scale: 0.95, zIndex: 10 },
          { x: 18, y: -8, rotate: 6, scale: 1, zIndex: 20 },
        ];
  }

  return isHovered
    ? [
        { x: -56, y: 28, rotate: -14, scale: 0.94, zIndex: 10 },
        { x: 60, y: -28, rotate: 11, scale: 0.95, zIndex: 20 },
        { x: 0, y: 0, rotate: -2, scale: 1, zIndex: 30 },
      ]
    : [
        { x: -22, y: 18, rotate: -9, scale: 0.94, zIndex: 10 },
        { x: 28, y: -12, rotate: 7, scale: 0.95, zIndex: 20 },
        { x: 0, y: 4, rotate: -3, scale: 1, zIndex: 30 },
      ];
}

function getPreviewCardSize(total, index) {
  if (total <= 1) {
    return 'h-[78%] w-[76%]';
  }

  if (total === 2) {
    return index === 0 ? 'h-[70%] w-[72%]' : 'h-[76%] w-[76%]';
  }

  return index === 2 ? 'h-[78%] w-[77%]' : 'h-[72%] w-[72%]';
}

function GalleryButton({ children, className = '', ...props }) {
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

export default function PostImageGallery({ images = [] }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  const previewImages = useMemo(() => images.slice(0, 3), [images]);
  const previewLayouts = useMemo(
    () => getStackLayouts(previewImages.length, isHovered),
    [isHovered, previewImages.length],
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }

      if (images.length > 1 && event.key === 'ArrowLeft') {
        setActiveIndex((current) => (current - 1 + images.length) % images.length);
      }

      if (images.length > 1 && event.key === 'ArrowRight') {
        setActiveIndex((current) => (current + 1) % images.length);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [images.length, isOpen]);

  useEffect(() => {
    if (activeIndex < images.length) {
      return;
    }

    setActiveIndex(0);
  }, [activeIndex, images.length]);

  if (!images.length) {
    return null;
  }

  const openAt = (index) => {
    setIsHovered(false);
    setActiveIndex(index);
    setIsOpen(true);
  };

  const showPrevious = () => {
    setActiveIndex((current) => (current - 1 + images.length) % images.length);
  };

  const showNext = () => {
    setActiveIndex((current) => (current + 1) % images.length);
  };

  return (
    <>
      <div className="mt-8">
        <div
          className="relative h-[320px] px-4 py-5"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {previewImages.map((image, index) => {
            const layout = previewLayouts[index];

            return (
              <button
                key={image.src}
                type="button"
                onClick={() => openAt(index)}
                className={`absolute left-1/2 top-[46%] overflow-hidden rounded-[28px] border border-white/90 bg-white shadow-[0_30px_55px_rgba(57,72,122,0.18)] ${previewTransitionClass} ${getPreviewCardSize(previewImages.length, index)}`}
                style={{
                  zIndex: layout.zIndex,
                  transform: `translate(calc(-50% + ${layout.x}px), calc(-50% + ${layout.y}px)) rotate(${layout.rotate}deg) scale(${layout.scale})`,
                }}
                aria-label={`Xem hinh ${index + 1}`}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.03]"
                />
              </button>
            );
          })}
        </div>
      </div>

      {isMounted && isOpen
        ? createPortal(
            <div
              className="fixed inset-0 z-[120] grid h-dvh w-screen place-items-center bg-[#0f1528]/72 p-4 backdrop-blur-md sm:p-6"
              role="dialog"
              aria-modal="true"
              aria-label="Thu vien anh bai viet"
            >
              <div className="absolute inset-0" onClick={() => setIsOpen(false)} aria-hidden="true" />

              <div className="relative z-10 mx-auto w-full max-w-[760px]">
                <div className="relative overflow-hidden rounded-[34px] bg-white shadow-[0_36px_100px_rgba(0,0,0,0.35)]">
                  <div className="relative aspect-square max-h-[calc(100dvh-2rem)] overflow-hidden bg-[#e7eefc] sm:max-h-[calc(100dvh-3rem)]">
                    {images.map((image, index) => {
                      const isActive = index === activeIndex;

                      return (
                        <div
                          key={image.src}
                          className={`absolute inset-0 transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                            isActive ? 'opacity-100 scale-100' : 'pointer-events-none opacity-0 scale-[1.015]'
                          }`}
                          aria-hidden={!isActive}
                        >
                          <img src={image.src} alt={image.alt} className="h-full w-full object-cover" />
                        </div>
                      );
                    })}

                    <GalleryButton
                      onClick={() => setIsOpen(false)}
                      className="absolute right-4 top-4 z-20 bg-black text-white hover:bg-[#161616]"
                      aria-label="Dong popup"
                    >
                      <X className="h-5 w-5" />
                    </GalleryButton>

                    {images.length > 1 ? (
                      <>
                        <GalleryButton
                          onClick={showPrevious}
                          className="absolute left-4 top-1/2 z-20 -translate-y-1/2 border border-[#1a1a1a] bg-white/78 text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white"
                          aria-label="Anh truoc"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </GalleryButton>

                        <GalleryButton
                          onClick={showNext}
                          className="absolute right-4 top-1/2 z-20 -translate-y-1/2 border border-[#1a1a1a] bg-white/78 text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white"
                          aria-label="Anh tiep theo"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </GalleryButton>
                      </>
                    ) : null}

                    {images.length > 1 ? (
                      <div className="absolute inset-x-0 bottom-5 z-20 flex justify-center gap-2">
                        {images.map((image, index) => {
                          const isActive = index === activeIndex;

                          return (
                            <button
                              key={`${image.src}-dot`}
                              type="button"
                              onClick={() => setActiveIndex(index)}
                              className={`h-2.5 rounded-full transition ${
                                isActive ? 'w-8 bg-white shadow-[0_4px_16px_rgba(255,255,255,0.65)]' : 'w-2.5 bg-white/55'
                              }`}
                              aria-label={`Chuyen toi hinh ${index + 1}`}
                            />
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
