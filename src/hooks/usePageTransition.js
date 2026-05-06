import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const TRANSITION_PHASE = {
  HIDDEN: "hidden",
  COVERING: "covering",
  REVEALING: "revealing",
};

const NAVIGATION_START_DELAY_MS = 180;
const REVEAL_DURATION_MS = 320;
const SCROLL_RESET_DELAY_MS = 40;

function isModifiedClick(event) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
}

function resolveInternalHref(rawHref) {
  if (!rawHref || rawHref.startsWith("#")) {
    return null;
  }

  try {
    const url = new URL(rawHref, window.location.origin);

    if (url.origin !== window.location.origin) {
      return null;
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

function getPathnameFromHref(href) {
  if (!href) {
    return "";
  }

  try {
    return new URL(href, window.location.origin).pathname;
  } catch {
    return href;
  }
}

export const usePageTransition = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [transitionPhase, setTransitionPhase] = useState(TRANSITION_PHASE.HIDDEN);
  const [pendingPath, setPendingPath] = useState(null);
  const navigationTimerRef = useRef(null);
  const revealTimerRef = useRef(null);
  const scrollTimerRef = useRef(null);

  const clearTransitionTimers = useCallback(() => {
    window.clearTimeout(navigationTimerRef.current);
    window.clearTimeout(revealTimerRef.current);
    window.clearTimeout(scrollTimerRef.current);
    navigationTimerRef.current = null;
    revealTimerRef.current = null;
    scrollTimerRef.current = null;
  }, []);

  const finishTransition = useCallback(() => {
    clearTransitionTimers();
    document.body.classList.remove("transition-active");
    setPendingPath(null);
    setTransitionPhase(TRANSITION_PHASE.HIDDEN);
    scrollTimerRef.current = window.setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "instant" });
    }, SCROLL_RESET_DELAY_MS);
  }, [clearTransitionTimers]);

  const navigateWithTransition = useCallback(
    (path, options = {}) => {
      const nextPathname = getPathnameFromHref(path);

      if (typeof path === "number") {
        navigate(path);
        return;
      }

      if (!path || nextPathname === location.pathname || transitionPhase !== TRANSITION_PHASE.HIDDEN) {
        return;
      }

      clearTransitionTimers();
      document.body.classList.add("transition-active");
      setPendingPath(nextPathname);
      setTransitionPhase(TRANSITION_PHASE.COVERING);

      navigationTimerRef.current = window.setTimeout(() => {
        navigate(path, options);
      }, NAVIGATION_START_DELAY_MS);
    },
    [clearTransitionTimers, location.pathname, navigate, transitionPhase],
  );

  useEffect(() => {
    if (
      transitionPhase === TRANSITION_PHASE.COVERING &&
      pendingPath &&
      location.pathname === pendingPath
    ) {
      setTransitionPhase(TRANSITION_PHASE.REVEALING);
      revealTimerRef.current = window.setTimeout(() => {
        finishTransition();
      }, REVEAL_DURATION_MS);
    }
  }, [finishTransition, location.pathname, pendingPath, transitionPhase]);

  useEffect(() => {
    const handleLinkClick = (event) => {
      if (event.defaultPrevented || isModifiedClick(event)) {
        return;
      }

      const link = event.target.closest("a[href]");

      if (!link) {
        return;
      }

      if (
        link.hasAttribute("download") ||
        link.getAttribute("target") === "_blank" ||
        link.getAttribute("data-no-transition") === "true"
      ) {
        return;
      }

      const href = resolveInternalHref(link.getAttribute("href"));

      if (!href || href === `${location.pathname}${window.location.search}${window.location.hash}`) {
        return;
      }

      event.preventDefault();
      navigateWithTransition(href);
    };

    document.addEventListener("click", handleLinkClick, true);

    return () => {
      document.removeEventListener("click", handleLinkClick, true);
    };
  }, [location.pathname, navigateWithTransition]);

  useEffect(() => {
    return () => {
      clearTransitionTimers();
      document.body.classList.remove("transition-active");
    };
  }, [clearTransitionTimers]);

  return {
    currentPath: location.pathname,
    isTransitioning: transitionPhase !== TRANSITION_PHASE.HIDDEN,
    navigateWithTransition,
    transitionPhase,
  };
};
