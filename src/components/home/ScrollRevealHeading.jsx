'use client';

import { createElement, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function clamp(value) {
  return Math.max(0, Math.min(1, value));
}

export default function ScrollRevealHeading({
  as: Tag = 'h2',
  children,
  className = '',
  revealedClassName = 'text-black',
  baseClassName = '',
  style,
  baseStyle,
  start = 'top 90%',
  end = 'top 38%',
  blurPx = 4,
  ...props
}) {
  const headingRef = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!headingRef.current) {
      return undefined;
    }

    const trigger = ScrollTrigger.create({
      trigger: headingRef.current,
      start,
      end,
      scrub: true,
      onUpdate: (self) => {
        setProgress(clamp(self.progress));
      },
    });

    setProgress(clamp(trigger.progress));

    return () => {
      trigger.kill();
    };
  }, [end, start]);

  const revealPercent = progress * 100;

  return createElement(
    Tag,
    {
      ref: headingRef,
      className: `relative block ${className}`,
      style,
      ...props,
    },
    <>
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 block select-none whitespace-pre-line ${baseClassName}`}
        style={{
          filter: `blur(${blurPx}px)`,
          opacity: 0.9,
          ...baseStyle,
        }}
      >
        {children}
      </span>

      <span
        className={`relative block whitespace-pre-line ${revealedClassName}`}
        style={{
          clipPath: `inset(0 ${100 - revealPercent}% 0 0)`,
          WebkitClipPath: `inset(0 ${100 - revealPercent}% 0 0)`,
          willChange: 'clip-path',
        }}
      >
        {children}
      </span>
    </>,
  );
}
