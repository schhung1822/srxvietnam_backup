'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export default function ColorBends({
  className = '',
  colors = ['#5227FF', '#FF9FFC'],
  rotation = 0,
  speed = 0.6,
  transparent = true,
  scale = 1.5,
  intensity = 1.4,
  bandWidth = 6,
}) {
  const primaryLayerRef = useRef(null);
  const secondaryLayerRef = useRef(null);
  const safeSpeed = clamp(Number(speed) || 0.6, 0.1, 4);
  const safeScale = clamp(Number(scale) || 1.5, 0.8, 3);
  const safeIntensity = clamp(Number(intensity) || 1.4, 0.2, 3);
  const safeOpacity = transparent ? 0.78 : 1;
  const blurStrength = `${18 + bandWidth * 4}px`;
  const primaryColor = colors[0] ?? '#5227FF';
  const secondaryColor = colors[1] ?? '#FF9FFC';
  const secondaryScale = Math.max(1, safeScale - 0.18);
  const primaryDriftX = clamp(5 + safeIntensity * 3 + safeSpeed, 5, 16);
  const primaryDriftY = clamp(3 + safeIntensity * 2, 3, 10);
  const primaryRotateOffset = clamp(10 + safeIntensity * 4 + safeSpeed * 1.5, 10, 24);
  const primaryScaleBoost = clamp(0.1 + safeIntensity * 0.05, 0.1, 0.24);
  const secondaryDriftX = clamp(6 + safeIntensity * 2.5 + safeSpeed * 0.7, 6, 15);
  const secondaryDriftY = clamp(3 + safeIntensity * 2.2, 3, 10);
  const secondaryRotateOffset = clamp(5 + safeIntensity * 3.2 + safeSpeed, 5, 18);
  const secondaryScaleBoost = clamp(0.08 + safeIntensity * 0.05, 0.08, 0.2);

  useEffect(() => {
    if (!primaryLayerRef.current || !secondaryLayerRef.current) {
      return undefined;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }

    const primaryDuration = Math.max(8, 18 / safeSpeed);
    const secondaryDuration = Math.max(10, 22 / safeSpeed);

    const ctx = gsap.context(() => {
      gsap.set(primaryLayerRef.current, {
        xPercent: -primaryDriftX,
        yPercent: -primaryDriftY,
        rotate: rotation,
        scale: safeScale,
        force3D: true,
      });

      gsap.set(secondaryLayerRef.current, {
        xPercent: -secondaryDriftX,
        yPercent: secondaryDriftY * 0.35,
        rotate: -rotation * 0.6,
        scale: secondaryScale,
        force3D: true,
      });

      gsap.to(primaryLayerRef.current, {
        xPercent: primaryDriftX,
        yPercent: primaryDriftY,
        rotate: rotation + primaryRotateOffset,
        scale: safeScale + primaryScaleBoost,
        duration: primaryDuration,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });

      gsap.to(secondaryLayerRef.current, {
        keyframes: [
          {
            xPercent: secondaryDriftX * 0.7,
            yPercent: -secondaryDriftY,
            rotate: secondaryRotateOffset - rotation * 0.6,
            scale: secondaryScale + secondaryScaleBoost,
            duration: secondaryDuration * 0.5,
            ease: 'sine.inOut',
          },
          {
            xPercent: -secondaryDriftX,
            yPercent: secondaryDriftY * 0.35,
            rotate: -rotation * 0.6,
            scale: secondaryScale,
            duration: secondaryDuration * 0.5,
            ease: 'sine.inOut',
          },
        ],
        repeat: -1,
      });
    });

    return () => ctx.revert();
  }, [
    primaryDriftX,
    primaryDriftY,
    primaryRotateOffset,
    primaryScaleBoost,
    rotation,
    safeScale,
    safeSpeed,
    secondaryDriftX,
    secondaryDriftY,
    secondaryRotateOffset,
    secondaryScale,
    secondaryScaleBoost,
  ]);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={{ opacity: safeOpacity }}
    >
      <div
        ref={primaryLayerRef}
        className="absolute inset-[-20%]"
        style={{
          filter: `blur(${blurStrength}) saturate(${0.9 + safeIntensity * 0.45})`,
          background: `
            radial-gradient(circle at 18% 22%, ${primaryColor} 0%, transparent 38%),
            radial-gradient(circle at 82% 18%, ${secondaryColor} 0%, transparent 34%),
            radial-gradient(circle at 68% 72%, ${primaryColor} 0%, transparent 30%),
            radial-gradient(circle at 30% 78%, ${secondaryColor} 0%, transparent 32%)
          `,
          mixBlendMode: 'screen',
          opacity: clamp(0.78 + safeIntensity * 0.06, 0.78, 0.96),
          willChange: 'transform',
        }}
      />

      <div
        ref={secondaryLayerRef}
        className="absolute inset-[-10%]"
        style={{
          filter: `blur(${12 + bandWidth * 3}px) saturate(${1 + safeIntensity * 0.35})`,
          background: `linear-gradient(135deg, ${primaryColor}00 0%, ${primaryColor}aa 22%, ${secondaryColor}aa 58%, ${secondaryColor}00 100%)`,
          opacity: clamp(0.5 + safeIntensity * 0.08, 0.5, 0.78),
          willChange: 'transform',
        }}
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),rgba(255,255,255,0)_62%)]" />
    </div>
  );
}
