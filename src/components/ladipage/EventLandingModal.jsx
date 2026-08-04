'use client';

import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { joinClassNames } from '../../lib/ladipage/eventLandingForm.js';

const VARIANTS = {
  default: {
    overlay: 'bg-[rgba(24,18,32,0.42)]',
    card: 'bg-white text-[#2a2233] shadow-[0_40px_90px_rgba(24,18,32,0.28)]',
    title: 'text-[#1f1826]',
    message: 'text-[#6b6377]',
    success: 'bg-emerald-500/12 text-emerald-600',
    error: 'bg-rose-500/12 text-rose-600',
    button:
      'bg-[linear-gradient(135deg,var(--lp-primary),var(--lp-primary2))] text-white hover:brightness-110',
  },
  starry: {
    overlay: 'bg-black/75',
    card: 'border border-white/12 bg-[#140609] text-white shadow-[0_40px_90px_rgba(0,0,0,0.6)]',
    title: 'text-white',
    message: 'text-white/65',
    success: 'bg-white/10 text-[color:var(--lp-accent)]',
    error: 'bg-white/10 text-white/80',
    button:
      'bg-[linear-gradient(90deg,var(--lp-primary2),var(--lp-primary))] text-white hover:brightness-110',
  },
};

export default function EventLandingModal({ state, onClose, variant = 'default' }) {
  const styles = VARIANTS[variant] ?? VARIANTS.default;
  const isSuccess = state.type === 'success';

  return (
    <div
      className={joinClassNames(
        'fixed inset-0 z-[100] place-items-center px-5 backdrop-blur-md transition',
        styles.overlay,
        state.open ? 'grid' : 'hidden',
      )}
      role="dialog"
      aria-modal="true"
      aria-hidden={!state.open}
      onClick={(clickEvent) => {
        if (clickEvent.target === clickEvent.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={joinClassNames(
          'w-full max-w-[26rem] animate-news-rise rounded-[26px] p-7 text-center',
          styles.card,
        )}
      >
        <div
          className={joinClassNames(
            'mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl',
            isSuccess ? styles.success : styles.error,
          )}
        >
          {isSuccess ? <CheckCircle2 className="h-8 w-8" /> : <AlertCircle className="h-8 w-8" />}
        </div>

        <h3 className={joinClassNames('text-[22px] font-bold leading-tight tracking-[-0.02em]', styles.title)}>
          {state.title}
        </h3>
        <p className={joinClassNames('mt-3 text-[15px] leading-7', styles.message)}>{state.message}</p>

        <button
          type="button"
          onClick={onClose}
          className={joinClassNames(
            'mt-6 h-12 w-full rounded-full text-[14px] font-bold uppercase tracking-[0.12em] transition duration-300',
            styles.button,
          )}
        >
          Đã hiểu
        </button>
      </div>
    </div>
  );
}
