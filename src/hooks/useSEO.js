import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export const useSEO = () => {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    document.documentElement.lang = 'vi';
  }, [pathname]);
};
