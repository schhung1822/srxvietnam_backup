'use client';

import { useCallback, useMemo, useState } from 'react';
import PromoPopupModal from '../promo/PromoPopupModal.jsx';

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

/** Popup ở trang chi tiết tin tức: ảnh xếp chồng, khách bấm vào thì mở popup. */
export default function PostImageGallery({ images = [], autoSlideSeconds = 0 }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const previewImages = useMemo(() => images.slice(0, 3), [images]);
  const previewLayouts = useMemo(
    () => getStackLayouts(previewImages.length, isHovered),
    [isHovered, previewImages.length],
  );
  const handleClose = useCallback(() => setIsOpen(false), []);

  if (!images.length) {
    return null;
  }

  const openAt = (index) => {
    setIsHovered(false);
    setActiveIndex(index);
    setIsOpen(true);
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
                key={image.id ?? image.src}
                type="button"
                onClick={() => openAt(index)}
                className={`absolute left-1/2 top-[46%] overflow-hidden rounded-[28px] border border-white/90 bg-white shadow-[0_30px_55px_rgba(57,72,122,0.18)] ${previewTransitionClass} ${getPreviewCardSize(previewImages.length, index)}`}
                style={{
                  zIndex: layout.zIndex,
                  transform: `translate(calc(-50% + ${layout.x}px), calc(-50% + ${layout.y}px)) rotate(${layout.rotate}deg) scale(${layout.scale})`,
                }}
                aria-label={image.title ? `Xem ${image.title}` : `Xem hình ${index + 1}`}
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

      <PromoPopupModal
        slides={images}
        isOpen={isOpen}
        activeIndex={activeIndex}
        onActiveIndexChange={setActiveIndex}
        onClose={handleClose}
        autoSlideSeconds={autoSlideSeconds}
      />
    </>
  );
}
