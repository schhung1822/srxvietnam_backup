'use client';

import { AlertCircle, LoaderCircle } from 'lucide-react';

export function AuthAlert({ children, className = '' }) {
  if (!children) {
    return null;
  }

  return (
    <div
      role="alert"
      className={`flex gap-2.5 rounded-[14px] border border-[#f0cfcf] bg-[#fff5f5] px-4 py-3 text-[13.5px] leading-6 text-[#a33a3a] ${className}`}
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

export function AuthDivider({ label = 'hoặc dùng email' }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px flex-1 bg-[#D9D9D9]" />
      <span className="text-[12px] font-medium uppercase tracking-[0.12em] text-[#5E6266]">{label}</span>
      <span className="h-px flex-1 bg-[#D9D9D9]" />
    </div>
  );
}

export function AuthSubmitButton({ isLoading, loadingLabel, children, className = '', ...props }) {
  return (
    <button
      type="submit"
      disabled={isLoading}
      {...props}
      className={`inline-flex h-[50px] w-full items-center justify-center gap-2 rounded-full bg-[#15110d] text-[15px] font-semibold text-white transition hover:bg-[#2b2520] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {isLoading ? (
        <>
          <LoaderCircle className="h-4 w-4 animate-spin" />
          {loadingLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
}

export function AuthTabs({ value, onChange }) {
  return (
    <div className="flex rounded-full border border-[#D9D9D9] bg-[#F6F6F6] p-1">
      {[
        { id: 'login', label: 'Đăng nhập' },
        { id: 'register', label: 'Đăng ký' },
      ].map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          aria-pressed={value === tab.id}
          className={`flex-1 rounded-full px-5 py-2.5 text-[14px] font-semibold transition ${
            value === tab.id
              ? 'bg-[#15110d] text-white shadow-[0_6px_16px_rgba(21,17,13,0.16)]'
              : 'text-[#5E6266] hover:text-[#15110d]'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
