'use client';

import { forwardRef, useMemo } from 'react';
import NextLink from 'next/link';
import { useParams as useNextParams, usePathname, useRouter } from 'next/navigation';

const resolveHref = (to) => {
  if (typeof to === 'string') {
    return to;
  }

  if (to && typeof to === 'object') {
    const pathname = to.pathname ?? '';
    const search = to.search ?? '';
    const hash = to.hash ?? '';
    return `${pathname}${search}${hash}` || '#';
  }

  return '#';
};

const isExternalHref = (href) =>
  href.startsWith('http://') ||
  href.startsWith('https://') ||
  href.startsWith('mailto:') ||
  href.startsWith('tel:') ||
  href.startsWith('#');

export const Link = forwardRef(function Link(
  { to, href: hrefProp, state: _state, replace, scroll, prefetch, children, ...props },
  ref
) {
  void _state;
  const href = hrefProp ?? resolveHref(to);

  if (isExternalHref(href)) {
    return (
      <a ref={ref} href={href} {...props}>
        {children}
      </a>
    );
  }

  return (
    <NextLink
      ref={ref}
      href={href}
      replace={replace}
      scroll={scroll}
      prefetch={prefetch}
      {...props}
    >
      {children}
    </NextLink>
  );
});

export const useNavigate = () => {
  const router = useRouter();

  return (to, options = {}) => {
    if (typeof to === 'number') {
      if (to === -1) {
        router.back();
      }
      return;
    }

    const href = resolveHref(to);

    if (options.replace) {
      router.replace(href, { scroll: options.scroll });
      return;
    }

    router.push(href, { scroll: options.scroll });
  };
};

export const useLocation = () => {
  const pathname = usePathname() ?? '/';

  return useMemo(() => {
    return {
      pathname,
      search: '',
      hash: '',
      state: null,
      key: pathname,
    };
  }, [pathname]);
};

export const useParams = () => useNextParams();

export const BrowserRouter = ({ children }) => children;
export const Routes = ({ children }) => children;
export const Route = ({ element }) => element ?? null;
