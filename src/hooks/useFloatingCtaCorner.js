'use client';

import { useSyncExternalStore } from 'react';

/**
 * Góc màn hình đang đặt nút liên hệ nổi (FloatingCallToAction, khách kéo thả được).
 * Nút vòng quay may mắn đọc để xếp dọc cạnh nút liên hệ khi nút nằm bên phải.
 */

const DEFAULT_CORNER = 'bottom-right';

let currentCorner = DEFAULT_CORNER;
const listeners = new Set();

export function setFloatingCtaCorner(corner) {
  if (!corner || corner === currentCorner) {
    return;
  }

  currentCorner = corner;
  listeners.forEach((listener) => listener());
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export default function useFloatingCtaCorner() {
  return useSyncExternalStore(
    subscribe,
    () => currentCorner,
    () => DEFAULT_CORNER,
  );
}
