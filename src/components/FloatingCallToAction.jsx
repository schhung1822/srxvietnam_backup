'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { MessageCircleMore, Move, Phone, X } from 'lucide-react';

const BUTTON_SIZE = 58;
const EDGE_PADDING = 18;
const MOBILE_TOP_PADDING = 84;
const DESKTOP_TOP_PADDING = 102;
const DRAG_THRESHOLD = 6;
const STORAGE_KEY = 'srx-floating-contact-corner';
const DEFAULT_CORNER = 'bottom-right';
const FACEBOOK_URL = 'https://www.facebook.com/srxvnofficial';
const ZALO_URL = 'https://zalo.me/4112137101220932811';
const PHONE_NUMBER = '+84903010692';

const CONTACT_ITEMS = [
  {
    id: 'phone',
    label: 'Gọi cho SRX',
    meta: '0903 010 692',
    href: `tel:${PHONE_NUMBER}`,
    icon: 'phone',
  },
  {
    id: 'facebook',
    label: 'Fanpage SRX vietnam',
    meta: 'facebook.com/srxvnofficial',
    href: FACEBOOK_URL,
    icon: 'facebook',
  },
  {
    id: 'zalo',
    label: 'Zalo OA',
    meta: 'Nhắn tin trực tiếp với SRX',
    href: "https://zalo.me/4112137101220932811",
    icon: 'zalo',
  },
];

function getTopPadding() {
  if (typeof window === 'undefined') {
    return DESKTOP_TOP_PADDING;
  }

  return window.innerWidth >= 1024 ? DESKTOP_TOP_PADDING : MOBILE_TOP_PADDING;
}

function getViewport() {
  if (typeof window === 'undefined') {
    return { width: 0, height: 0 };
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

function getCornerPosition(corner, viewport) {
  const topPadding = getTopPadding();
  const maxX = Math.max(EDGE_PADDING, viewport.width - BUTTON_SIZE - EDGE_PADDING);
  const maxY = Math.max(topPadding, viewport.height - BUTTON_SIZE - EDGE_PADDING);

  switch (corner) {
    case 'top-left':
      return { x: EDGE_PADDING, y: topPadding };
    case 'top-right':
      return { x: maxX, y: topPadding };
    case 'bottom-left':
      return { x: EDGE_PADDING, y: maxY };
    case 'bottom-right':
    default:
      return { x: maxX, y: maxY };
  }
}

function clampPosition(position, viewport) {
  const topPadding = getTopPadding();
  const maxX = Math.max(EDGE_PADDING, viewport.width - BUTTON_SIZE - EDGE_PADDING);
  const maxY = Math.max(topPadding, viewport.height - BUTTON_SIZE - EDGE_PADDING);

  return {
    x: Math.min(Math.max(position.x, EDGE_PADDING), maxX),
    y: Math.min(Math.max(position.y, topPadding), maxY),
  };
}

function getNearestCorner(position, viewport) {
  const centerX = position.x + BUTTON_SIZE / 2;
  const centerY = position.y + BUTTON_SIZE / 2;
  const horizontal = centerX < viewport.width / 2 ? 'left' : 'right';
  const vertical = centerY < viewport.height / 2 ? 'top' : 'bottom';

  return `${vertical}-${horizontal}`;
}

function renderItemIcon(type) {
  if (type === 'phone') {
    return (
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1f1a18] text-white shadow-[0_16px_34px_rgba(31,26,24,0.28)]">
        <Phone className="h-5 w-5" strokeWidth={1.9} />
      </div>
    );
  }

  const iconSrc =
    type === 'facebook'
      ? '/assets/images/footer/facebook_white.webp'
      : '/assets/images/footer/zalo_white.webp';
  const iconAlt = type === 'facebook' ? 'Facebook' : 'Zalo';

  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#7C93F1] shadow-[0_14px_30px_rgba(44,35,57,0.14)] ring-1 ring-black/5">
      <Image src={iconSrc} alt={iconAlt} width={24} height={24} className="h-[22px] w-[22px]" />
    </div>
  );
}

export default function FloatingCallToAction() {
  const [isReady, setIsReady] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [corner, setCorner] = useState(DEFAULT_CORNER);
  const [position, setPosition] = useState({ x: EDGE_PADDING, y: EDGE_PADDING });

  const containerRef = useRef(null);
  const positionRef = useRef(position);
  const dragStateRef = useRef(null);
  const hasDraggedRef = useRef(false);

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  useEffect(() => {
    const viewport = getViewport();
    const savedCorner = window.localStorage.getItem(STORAGE_KEY) || DEFAULT_CORNER;
    const nextPosition = getCornerPosition(savedCorner, viewport);

    setCorner(savedCorner);
    setPosition(nextPosition);
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) {
      return undefined;
    }

    const handleResize = () => {
      const viewport = getViewport();
      setPosition(getCornerPosition(corner, viewport));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [corner, isReady]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handlePointerDown = (event) => {
    if (event.button !== undefined && event.button !== 0) {
      return;
    }

    const target = event.currentTarget;
    target.setPointerCapture?.(event.pointerId);

    hasDraggedRef.current = false;
    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: positionRef.current.x,
      originY: positionRef.current.y,
    };
  };

  const handlePointerMove = (event) => {
    const dragState = dragStateRef.current;

    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - dragState.startX;
    const deltaY = event.clientY - dragState.startY;

    if (!hasDraggedRef.current && Math.hypot(deltaX, deltaY) > DRAG_THRESHOLD) {
      hasDraggedRef.current = true;
      setIsOpen(false);
    }

    if (!hasDraggedRef.current) {
      return;
    }

    const viewport = getViewport();
    const nextPosition = clampPosition(
      {
        x: dragState.originX + deltaX,
        y: dragState.originY + deltaY,
      },
      viewport,
    );

    setPosition(nextPosition);
  };

  const finishDrag = (pointerId, currentTarget) => {
    if (pointerId !== undefined) {
      currentTarget?.releasePointerCapture?.(pointerId);
    }

    dragStateRef.current = null;

    if (!hasDraggedRef.current) {
      setIsOpen((currentValue) => !currentValue);
      return;
    }

    const viewport = getViewport();
    const nextCorner = getNearestCorner(positionRef.current, viewport);
    const snappedPosition = getCornerPosition(nextCorner, viewport);

    hasDraggedRef.current = false;
    setCorner(nextCorner);
    setPosition(snappedPosition);
    window.localStorage.setItem(STORAGE_KEY, nextCorner);
  };

  const handlePointerUp = (event) => {
    finishDrag(event.pointerId, event.currentTarget);
  };

  const handlePointerCancel = (event) => {
    event.currentTarget?.releasePointerCapture?.(event.pointerId);
    dragStateRef.current = null;
    hasDraggedRef.current = false;
  };

  if (!isReady) {
    return null;
  }

  const isRightAligned = corner.endsWith('right');
  const opensUpward = corner.startsWith('bottom');

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed z-[90]"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div className="relative pointer-events-auto">
        {isOpen ? (
          <div
            className={[
              'absolute w-[min(320px,calc(100vw-36px))] overflow-hidden rounded-[28px] border border-white/60',
              'bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,244,255,0.96))]',
              'p-3 shadow-[0_28px_70px_rgba(26,17,39,0.24)] backdrop-blur-2xl',
              isRightAligned ? 'right-0' : 'left-0',
              opensUpward ? 'bottom-[calc(100%+14px)]' : 'top-[calc(100%+14px)]',
            ].join(' ')}
          >
            <div className="overflow-hidden">
              <div className="space-y-2">
                {CONTACT_ITEMS.map((item) => {
                  const isExternal = item.id !== 'phone';

                  return (
                    <a
                      key={item.id}
                      href={item.href}
                      target={isExternal ? '_blank' : undefined}
                      rel={isExternal ? 'noreferrer' : undefined}
                      className="group flex items-center gap-3 px-3 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#d9c6ff]"
                    >
                      {renderItemIcon(item.icon)}
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[15px] font-semibold text-[#231b17]">{item.label}</div>
                        <div className="truncate text-sm text-[#6d6780]">{item.meta}</div>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}

        <button
          type="button"
          aria-label={isOpen ? 'Đóng menu liên hệ' : 'Mở menu liên hệ'}
          aria-expanded={isOpen}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          className={[
            'group relative flex h-[54px] w-[54px] touch-none items-center justify-center rounded-full',
            'border border-white/70 bg-[linear-gradient(145deg,rgba(21,17,17,0.95),rgba(79,60,117,0.95))]',
            'text-white shadow-[0_18px_46px_rgba(26,19,38,0.34)] backdrop-blur-xl transition-all duration-200',
            'hover:scale-[1.03] hover:shadow-[0_22px_54px_rgba(26,19,38,0.4)] active:scale-[0.98]',
            hasDraggedRef.current ? 'cursor-grabbing' : 'cursor-grab',
          ].join(' ')}
        >
          <span className="absolute inset-[1px] rounded-full bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.22),transparent_56%)]" />
          <span className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/10" />
          <span className="relative flex items-center justify-center">
            {isOpen ? (
              <X className="h-5.5 w-5.5" strokeWidth={2} />
            ) : (
              <MessageCircleMore className="h-5.5 w-5.5" strokeWidth={2} />
            )}
          </span>
        </button>
      </div>
    </div>
  );
}
