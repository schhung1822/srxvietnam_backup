'use client';

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
  const safeSpeed = clamp(Number(speed) || 0.6, 0.1, 4);
  const safeScale = clamp(Number(scale) || 1.5, 0.8, 3);
  const safeIntensity = clamp(Number(intensity) || 1.4, 0.2, 3);
  const safeOpacity = transparent ? 0.78 : 1;
  const duration = `${Math.max(16, Math.round(34 / safeSpeed))}s`;
  const blurStrength = `${18 + bandWidth * 4}px`;
  const primaryColor = colors[0] ?? '#5227FF';
  const secondaryColor = colors[1] ?? '#FF9FFC';

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={{ opacity: safeOpacity }}
    >
      <div
        className="absolute inset-[-20%]"
        style={{
          transform: `rotate(${rotation}deg) scale(${safeScale})`,
          filter: `blur(${blurStrength}) saturate(${0.9 + safeIntensity * 0.45})`,
          background: `
            radial-gradient(circle at 18% 22%, ${primaryColor} 0%, transparent 38%),
            radial-gradient(circle at 82% 18%, ${secondaryColor} 0%, transparent 34%),
            radial-gradient(circle at 68% 72%, ${primaryColor} 0%, transparent 30%),
            radial-gradient(circle at 30% 78%, ${secondaryColor} 0%, transparent 32%)
          `,
          mixBlendMode: 'screen',
          animation: `color-bends-drift ${duration} ease-in-out infinite alternate`,
        }}
      />

      <div
        className="absolute inset-[-10%]"
        style={{
          transform: `rotate(${-rotation * 0.6}deg) scale(${Math.max(1, safeScale - 0.18)})`,
          filter: `blur(${12 + bandWidth * 3}px) saturate(${1 + safeIntensity * 0.35})`,
          background: `linear-gradient(135deg, ${primaryColor}00 0%, ${primaryColor}aa 22%, ${secondaryColor}aa 58%, ${secondaryColor}00 100%)`,
          opacity: 0.5,
          animation: `color-bends-float ${duration} linear infinite`,
        }}
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),rgba(255,255,255,0)_62%)]" />

      {/* Đã sửa thẻ style ở đây */}
      <style>{`
        @keyframes color-bends-drift {
          0% {
            transform: rotate(${rotation}deg) scale(${safeScale}) translate3d(-2%, -1%, 0);
          }
          100% {
            transform: rotate(${rotation + 8}deg) scale(${safeScale + 0.08}) translate3d(2%, 2%, 0);
          }
        }

        @keyframes color-bends-float {
          0% {
            transform: rotate(${-rotation * 0.6}deg) scale(${Math.max(1, safeScale - 0.18)}) translate3d(-3%, 0, 0);
          }
          50% {
            transform: rotate(${4 - rotation * 0.6}deg) scale(${Math.max(1, safeScale - 0.12)}) translate3d(2%, -2%, 0);
          }
          100% {
            transform: rotate(${-rotation * 0.6}deg) scale(${Math.max(1, safeScale - 0.18)}) translate3d(-3%, 0, 0);
          }
        }
      `}</style>
    </div>
  );
}