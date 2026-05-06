'use client';

import { useMemo, useSyncExternalStore } from 'react';

const URL_CHANGE_EVENT = 'srx:url-change';

let isHistoryPatched = false;

function dispatchUrlChange() {
  window.dispatchEvent(new Event(URL_CHANGE_EVENT));
}

function patchHistory() {
  if (typeof window === 'undefined' || isHistoryPatched) {
    return;
  }

  const originalPushState = window.history.pushState;
  const originalReplaceState = window.history.replaceState;

  window.history.pushState = function patchedPushState(...args) {
    const result = originalPushState.apply(this, args);
    dispatchUrlChange();
    return result;
  };

  window.history.replaceState = function patchedReplaceState(...args) {
    const result = originalReplaceState.apply(this, args);
    dispatchUrlChange();
    return result;
  };

  isHistoryPatched = true;
}

function subscribe(callback) {
  if (typeof window === 'undefined') {
    return () => {};
  }

  patchHistory();

  window.addEventListener(URL_CHANGE_EVENT, callback);
  window.addEventListener('popstate', callback);

  return () => {
    window.removeEventListener(URL_CHANGE_EVENT, callback);
    window.removeEventListener('popstate', callback);
  };
}

function getSnapshot() {
  if (typeof window === 'undefined') {
    return '';
  }

  return window.location.search;
}

function getServerSnapshot() {
  return '';
}

export default function useBrowserSearchParams() {
  const search = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return useMemo(() => new URLSearchParams(search), [search]);
}
