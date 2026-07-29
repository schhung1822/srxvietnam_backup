'use client';

import { forwardRef, useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export const AUTH_FIELD_CLASS =
  'h-[50px] w-full rounded-[14px] border border-[#B7B7B7] bg-white px-4 text-[15px] text-[#15110d] outline-none transition placeholder:text-[#9AA0A6] hover:border-[#8b8b8b] focus:border-[#15110d] focus:ring-4 focus:ring-[#15110d]/10';

const LABEL_CLASS = 'mb-1.5 block text-[13px] font-semibold text-[#3e342b]';
const ERROR_CLASS = 'mt-1.5 block text-[12.5px] text-[#b42318]';

export const AuthField = forwardRef(function AuthField(
  { label, error, className = '', hint, ...props },
  ref,
) {
  const fieldId = useId();

  return (
    <div className={className}>
      <label htmlFor={fieldId} className={LABEL_CLASS}>
        {label}
      </label>
      <input
        {...props}
        id={fieldId}
        ref={ref}
        aria-invalid={error ? 'true' : undefined}
        className={`${AUTH_FIELD_CLASS} ${error ? 'border-[#d68a84]' : ''}`}
      />
      {error ? <span className={ERROR_CLASS}>{error}</span> : null}
      {!error && hint ? <span className="mt-1.5 block text-[12.5px] text-[#5E6266]">{hint}</span> : null}
    </div>
  );
});

export const AuthPasswordField = forwardRef(function AuthPasswordField(
  { label, error, className = '', hint, trailing, ...props },
  ref,
) {
  const fieldId = useId();
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className={className}>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={fieldId} className={`${LABEL_CLASS} mb-0`}>
          {label}
        </label>
        {trailing}
      </div>
      <div className="relative">
        <input
          {...props}
          id={fieldId}
          ref={ref}
          type={isVisible ? 'text' : 'password'}
          aria-invalid={error ? 'true' : undefined}
          className={`${AUTH_FIELD_CLASS} pr-12 ${error ? 'border-[#d68a84]' : ''}`}
        />
        <button
          type="button"
          onClick={() => setIsVisible((previous) => !previous)}
          aria-label={isVisible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          aria-pressed={isVisible}
          title={isVisible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-[10px] text-[#5E6266] transition hover:bg-[#F6F6F6] hover:text-[#15110d]"
        >
          {isVisible ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
        </button>
      </div>
      {error ? <span className={ERROR_CLASS}>{error}</span> : null}
      {!error && hint ? <span className="mt-1.5 block text-[12.5px] text-[#5E6266]">{hint}</span> : null}
    </div>
  );
});
