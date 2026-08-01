'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import ZaloLogo from './ZaloLogo.jsx';
import ZaloQrLoginModal from './ZaloQrLoginModal.jsx';

export default function ZaloQrLoginButton({
  label = 'Quét mã QR Zalo',
  nextPath = '/account',
  disabled = false,
  className = '',
}) {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleSuccess = useCallback(
    async (user, resolvedNextPath) => {
      await refreshUser();
      setIsOpen(false);
      router.push(resolvedNextPath || nextPath);
      router.refresh();
    },
    [nextPath, refreshUser, router],
  );

  if (disabled) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`inline-flex h-[50px] w-full items-center justify-center gap-2.5 whitespace-nowrap rounded-full border border-[#B7B7B7] bg-white px-4 text-[15px] font-semibold text-[#15110d] transition hover:border-[#15110d] hover:bg-[#F6F6F6] ${className}`}
      >
        <ZaloLogo />
        {label}
      </button>

      <ZaloQrLoginModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        onSuccess={handleSuccess}
        nextPath={nextPath}
      />
    </>
  );
}
