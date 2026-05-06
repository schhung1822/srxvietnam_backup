'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Book,
  Calendar1,
  CheckCircle,
  ChevronDown,
  Globe,
  Menu,
  Search,
  ShoppingBag,
  UserRound,
  X,
} from 'lucide-react';
import { useCart } from '../contexts/CartContext.jsx';
import useBrowserSearchParams from '../hooks/useBrowserSearchParams.js';
import HeaderSearchOverlay from './search/HeaderSearchOverlay.jsx';

const navigationItems = [
  { name: 'Về SRX', path: '/about' },
  {
    name: 'Sản phẩm',
    path: '/products',
    desktopVariant: 'product-mega',
    dropdown: [{ name: 'Tất cả sản phẩm', path: '/products', icon: ShoppingBag }],
  },
  { name: 'Từ điển sản phẩm', path: '/key-srx' },
  {
    name: 'Theo dòng SRX',
    path: '/follow-srx',
    desktopVariant: 'thumbnail-grid',
    dropdown: [
      {
        name: 'Chủ đề khoa học',
        path: '/chu-de-khoa-hoc',
        icon: Book,
        thumbnail: '/assets/images/home/blue.webp',
      },
      {
        name: 'Tin tức',
        path: '/tin-tuc',
        icon: Globe,
        thumbnail: '/assets/images/home/sl2.webp',
      },
      {
        name: 'Sự kiện',
        path: '/su-kien',
        icon: Calendar1,
        thumbnail: '/assets/images/home/slider2.webp',
      },
    ],
  },
  {
    name: 'Affiliate',
    path: '/affiliate',
    dropdown: [
      { name: 'Tổng quan', path: '/affiliate', icon: BarChart3 },
      { name: 'Chính sách', path: '/chinh-sach-affiliate', icon: CheckCircle },
    ],
  },
];

export default function Header() {
  const pathname = usePathname() ?? '/';
  const searchParams = useBrowserSearchParams();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openMobileDropdown, setOpenMobileDropdown] = useState(null);
  const [openDesktopDropdown, setOpenDesktopDropdown] = useState(null);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [productMenuData, setProductMenuData] = useState({
    shopPath: '/products',
    categories: [],
    featuredProducts: [],
  });
  const desktopDropdownCloseTimerRef = useRef(null);
  const { totalItems, toggleCart } = useCart();

  const activeProductCategory = searchParams?.get('category') ?? '';

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    setIsMenuOpen(false);
    setOpenMobileDropdown(null);
    setOpenDesktopDropdown(null);
    setIsSearchOpen(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  useEffect(() => {
    return () => {
      window.clearTimeout(desktopDropdownCloseTimerRef.current);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadProductMenu = async () => {
      try {
        const response = await fetch('/api/products/menu', {
          method: 'GET',
          cache: 'no-store',
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok || !isMounted) {
          return;
        }

        setProductMenuData({
          shopPath: typeof data?.shopPath === 'string' && data.shopPath ? data.shopPath : '/products',
          categories: Array.isArray(data?.categories) ? data.categories.filter(Boolean) : [],
          featuredProducts: Array.isArray(data?.featuredProducts)
            ? data.featuredProducts.filter(Boolean)
            : [],
        });
      } catch (error) {
        console.error('Failed to load product menu data:', error);
      }
    };

    loadProductMenu();

    return () => {
      isMounted = false;
    };
  }, []);

  const productCategoryLinks = useMemo(
    () =>
      productMenuData.categories.map((categoryName) => ({
        name: categoryName,
        path: `/products?category=${encodeURIComponent(categoryName)}`,
      })),
    [productMenuData.categories],
  );

  const isActiveRoute = (path) => {
    if (path === '/') {
      return pathname === '/';
    }

    return pathname.startsWith(path);
  };

  const isNavigationItemActive = (item) => {
    if (isActiveRoute(item.path)) {
      return true;
    }

    return item.dropdown?.some((dropdownItem) => isActiveRoute(dropdownItem.path));
  };

  const toggleMobileMenu = () => {
    setIsMenuOpen((current) => !current);
  };

  const toggleMobileDropdown = (itemName) => {
    setOpenMobileDropdown((currentDropdown) => (currentDropdown === itemName ? null : itemName));
  };

  const openSearch = () => {
    setIsMenuOpen(false);
    setIsSearchOpen(true);
  };

  const openDesktopDropdownMenu = (itemName) => {
    window.clearTimeout(desktopDropdownCloseTimerRef.current);
    setOpenDesktopDropdown(itemName);
  };

  const scheduleCloseDesktopDropdown = () => {
    window.clearTimeout(desktopDropdownCloseTimerRef.current);
    desktopDropdownCloseTimerRef.current = window.setTimeout(() => {
      setOpenDesktopDropdown(null);
    }, 140);
  };
 
  const renderDropdownLinks = (dropdownItems, { mobile = false } = {}) =>
    dropdownItems.map((dropdownItem) => {
      const Icon = dropdownItem.icon;
      const isActive = isActiveRoute(dropdownItem.path);

      if (mobile) {
        return (
          <Link
            key={`${dropdownItem.path}-${dropdownItem.name}`}
            href={dropdownItem.path}
            className={`grid w-full grid-cols-[12px_minmax(0,1fr)] items-center gap-3 rounded-3xl border border-[#111111] px-4 py-3 transition-all duration-200 ${
              isActive ? 'bg-black text-white hover:bg-black' : 'bg-white text-black hover:bg-white'
            }`}
          >
            <Icon className="h-3 w-3 shrink-0" />
            <span
              className="block min-w-0 whitespace-nowrap text-left text-[13px] leading-[1.35] text-inherit"
              style={{ fontFamily: '"Inter", "Hubot Sans", sans-serif' }}
            >
              {dropdownItem.name}
            </span>
          </Link>
        );
      }

      return (
        <Link
          key={`${dropdownItem.path}-${dropdownItem.name}`}
          href={dropdownItem.path}
          className={`flex items-center gap-2 rounded-3xl border-[1.5px] border-[#111111] px-3 py-2.5 text-[14px] transition-colors duration-200 ${
            isActive ? 'bg-black text-white hover:bg-black' : 'text-black hover:bg-[#111111] hover:text-white'
          }`}
        >
          <Icon className="h-3.5 w-3.5 shrink-0" />
          <span>{dropdownItem.name}</span>
        </Link>
      );
    });

  const renderDesktopThumbnailDropdown = (dropdownItems) => (
    <div className="grid grid-cols-3 gap-6 p-3">
      {dropdownItems.map((dropdownItem) => {
        const isActive = isActiveRoute(dropdownItem.path);

        return (
          <Link key={`${dropdownItem.path}-${dropdownItem.name}`} href={dropdownItem.path} className="group/card block">
            <div
              className={`overflow-hidden rounded-[18px] bg-[#f4f5f8] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isActive
                  ? 'shadow-[0_18px_48px_rgba(0,0,0,0.12)] ring-2 ring-black/80'
                  : 'shadow-[0_14px_36px_rgba(0,0,0,0.08)] group-hover/card:-translate-y-1 group-hover/card:shadow-[0_22px_50px_rgba(0,0,0,0.14)]'
              }`}
            >
              <div className="aspect-[1.58/1] overflow-hidden">
                <img
                  src={dropdownItem.thumbnail}
                  alt={dropdownItem.name}
                  className="h-full w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:scale-[1.035]"
                />
              </div>
            </div>
            <div className="px-2 pb-1 pt-3 text-center">
              <span
                className={`text-[15px] font-medium tracking-[-0.02em] transition-colors duration-200 ${
                  isActive ? 'text-black' : 'text-[#1f1f1f] group-hover/card:text-black'
                }`}
              >
                {dropdownItem.name}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );

  const renderProductDesktopMenu = () => (
    <div className="grid grid-cols-[260px_minmax(0,1fr)] gap-8 px-3 py-3">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8b7e71]">
          Shop
        </div>
        <Link
          href={productMenuData.shopPath}
          className={`mt-3 block py-2 text-[15px] font-medium transition-colors duration-200 ${
            pathname.startsWith('/products') && !activeProductCategory
              ? ' text-black'
              : ' text-[#9D9D9D] hover:text-black'
          }`}
        >
          Tất cả sản phẩm
        </Link>

        <div className="mt-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8b7e71]">
          Danh mục
        </div>
        <div className="mt-3 space-y-2">
          {productCategoryLinks.map((categoryLink) => {
            const isCategoryActive =
              pathname.startsWith('/products') && activeProductCategory === categoryLink.name;

            return (
              <Link
                key={categoryLink.name}
                href={categoryLink.path}
                className={`block py-2 text-[15px] font-medium transition-colors duration-200 ${
                  isCategoryActive ? ' text-black' : ' text-[#9D9D9D] hover:text-black'
                }`}
              >
                {categoryLink.name}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {productMenuData.featuredProducts.length ? (
          productMenuData.featuredProducts.map((product) => (
            <Link key={product.slug} href={product.path} className="group/product block">
              <div className="overflow-hidden rounded-[22px] bg-[#f4f5f8] shadow-[0_14px_36px_rgba(0,0,0,0.08)] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/product:-translate-y-1 group-hover/product:shadow-[0_22px_50px_rgba(0,0,0,0.14)]">
                <div className="aspect-[1.12/1] overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/product:scale-[1.035]"
                  />
                </div>
              </div>
              <div className="px-1 pb-1 pt-3">
                <div className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#8b7e71]">
                  {product.category}
                </div>
                <div className="mt-1 line-clamp-2 text-[16px] font-medium leading-[1.35] tracking-[-0.02em] text-black">
                  {product.name}
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-2 flex min-h-[240px] items-center justify-center rounded-[22px] bg-[#f7f6f2] text-center text-[15px] text-[#6f6458]">
            Danh mục sản phẩm đang được cập nhật.
          </div>
        )}
      </div>
    </div>
  );

  const renderProductMobileLinks = () => (
    <div className="space-y-2 rounded-3xl px-2 pt-5">
      <Link
        href={productMenuData.shopPath}
        className={`block rounded-3xl border border-[#111111] px-4 py-3 text-[13px] font-medium transition-all duration-200 ${
          pathname.startsWith('/products') && !activeProductCategory
            ? 'bg-black text-white hover:bg-black'
            : 'bg-white text-black hover:bg-black hover:text-white'
        }`}
      >
        Tất cả sản phẩm
      </Link>
      {productCategoryLinks.map((categoryLink) => {
        const isCategoryActive =
          pathname.startsWith('/products') && activeProductCategory === categoryLink.name;

        return (
          <Link
            key={categoryLink.name}
            href={categoryLink.path}
            className={`block rounded-3xl border border-[#111111] px-4 py-3 text-[13px] font-medium transition-all duration-200 ${
              isCategoryActive
                ? 'bg-black text-white hover:bg-black'
                : 'bg-white text-black hover:bg-black hover:text-white'
            }`}
          >
            {categoryLink.name}
          </Link>
        );
      })}
    </div>
  );

  return (
    <>
      <header
        className={`fixed left-0 right-0 top-0 z-50 bg-white drop-shadow transition-all duration-500 ${
          isVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="mx-auto max-w-[1840px] px-2 sm:px-6 lg:px-8">
          <div className="hidden h-[70px] items-center xl:flex xl:h-[85px]">
            <div className="flex min-w-0 flex-1 items-center">
              <Link href="/" className="block">
                <img src="/assets/images/header/logo_srx.webp" alt="SRX Logo" className="h-8 w-auto object-contain lg:h-8" />
              </Link>
            </div>

            <nav className="hidden shrink-0 items-center xl:flex">
              <div className="flex items-center gap-2 xl:gap-4">
                {navigationItems.map((item) => (
                  <div
                    key={item.name}
                    className="group relative"
                    onMouseEnter={item.dropdown ? () => openDesktopDropdownMenu(item.name) : undefined}
                    onMouseLeave={item.dropdown ? scheduleCloseDesktopDropdown : undefined}
                  >
                    {item.dropdown ? (
                      <div className="relative">
                        <button className="relative flex min-h-[54px] items-center justify-center px-4 py-3 text-[16px] font-medium text-black">
                          <span
                            className={`relative inline-flex items-center gap-1.5 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                              isNavigationItemActive(item) ? '-translate-y-0.5' : 'group-hover:-translate-y-0.5'
                            }`}
                          >
                            <span>{item.name}</span>
                            <ChevronDown
                              className={`h-4 w-4 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                                isNavigationItemActive(item)
                                  ? '-translate-y-0.5'
                                  : 'group-hover:-translate-y-0.5 group-hover:rotate-180'
                              }`}
                            />
                          </span>
                          <span
                            className={`absolute bottom-[9px] left-4 right-4 h-[2px] origin-center rounded-full bg-black transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                              isNavigationItemActive(item) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                            }`}
                          />
                        </button>

                        {item.desktopVariant === 'product-mega' ? (
                          <div
                            className={`fixed left-0 right-0 top-[85px] z-50 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                              openDesktopDropdown === item.name
                                ? 'pointer-events-auto visible opacity-100'
                                : 'pointer-events-none invisible opacity-0'
                            }`}
                            onMouseEnter={() => openDesktopDropdownMenu(item.name)}
                            onMouseLeave={scheduleCloseDesktopDropdown}
                          >
                            <div className="w-full border-t border-black/5 bg-white/95 px-8 py-5 shadow-[0_24px_70px_rgba(0,0,0,0.10)] backdrop-blur-sm">
                              <div className="mx-auto max-w-[920px]">{renderProductDesktopMenu()}</div>
                            </div>
                          </div>
                        ) : item.desktopVariant === 'thumbnail-grid' ? (
                          <div
                            className={`fixed left-0 right-0 top-[85px] z-50 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                              openDesktopDropdown === item.name
                                ? 'pointer-events-auto visible opacity-100'
                                : 'pointer-events-none invisible opacity-0'
                            }`}
                            onMouseEnter={() => openDesktopDropdownMenu(item.name)}
                            onMouseLeave={scheduleCloseDesktopDropdown}
                          >
                            <div className="w-full border-t border-black/5 bg-white/95 px-8 py-5 shadow-[0_24px_70px_rgba(0,0,0,0.10)] backdrop-blur-sm">
                              <div className="mx-auto max-w-[920px]">{renderDesktopThumbnailDropdown(item.dropdown)}</div>
                            </div>
                          </div>
                        ) : (
                          <div
                            className={`absolute left-0 top-full z-50 pt-2 transition-all duration-300 ${
                              openDesktopDropdown === item.name
                                ? 'pointer-events-auto visible opacity-100'
                                : 'pointer-events-none invisible opacity-0'
                            }`}
                            onMouseEnter={() => openDesktopDropdownMenu(item.name)}
                            onMouseLeave={scheduleCloseDesktopDropdown}
                          >
                            <div className="w-[280px] rounded-3xl bg-white">
                              <div className="space-y-2 p-2.5">{renderDropdownLinks(item.dropdown)}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <Link
                        href={item.path}
                        className="group relative flex min-h-[54px] items-center justify-center px-4 py-3 text-[16px] font-medium text-black"
                      >
                        <span
                          className={`transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                            isNavigationItemActive(item) ? '-translate-y-0.5' : 'group-hover:-translate-y-0.5'
                          }`}
                        >
                          {item.name}
                        </span>
                        <span
                          className={`absolute bottom-[9px] left-4 right-4 h-[2px] origin-center rounded-full bg-black transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                            isNavigationItemActive(item) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                          }`}
                        />
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </nav>

            <div className="flex min-w-0 flex-1 items-center justify-end">
              <div className="hidden items-center space-x-4 xl:flex">
                <button
                  type="button"
                  onClick={openSearch}
                  className="relative flex h-[46px] w-[46px] items-center justify-center rounded-full border border-[#e5e5e5] text-black transition-all duration-300 hover:bg-[#6e96fb] hover:text-white"
                  aria-label="Tìm kiếm"
                >
                  <Search className="h-5 w-5" strokeWidth={2.1} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsSearchOpen(false);
                    toggleCart();
                  }}
                  className="relative flex h-[46px] w-[46px] items-center justify-center rounded-full border border-[#e5e5e5] text-black transition-all duration-300 hover:bg-[#6e96fb] hover:text-white"
                  aria-label="Mở giỏ hàng"
                >
                  <ShoppingBag className="h-5 w-5" strokeWidth={2.1} />
                  {totalItems > 0 ? (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-semibold leading-none text-white">
                      {totalItems > 99 ? '99+' : totalItems}
                    </span>
                  ) : null}
                </button>
                <Link
                  href="/account"
                  className="relative flex h-[46px] w-[46px] items-center justify-center rounded-full border border-[#e5e5e5] text-black transition-all duration-300 hover:bg-[#6e96fb] hover:text-white"
                  aria-label="Tài khoản"
                >
                  <UserRound className="h-5 w-5" strokeWidth={2.1} />
                </Link>
              </div>
            </div>
          </div>

          <div className="flex h-[70px] items-center xl:hidden">
            <div className="flex flex-1 items-center justify-start gap-1">
              <button
                type="button"
                onClick={toggleMobileMenu}
                className="relative flex h-11 w-11 items-center justify-center text-black"
                aria-label="Mở menu"
              >
                <Menu className="h-7 w-7" strokeWidth={1.8} />
              </button>
              <button
                type="button"
                onClick={openSearch}
                className="relative flex h-11 w-11 items-center justify-center text-black"
                aria-label="Tìm kiếm"
              >
                <Search className="h-5 w-5" strokeWidth={2.1} />
              </button>
            </div>

            <div className="flex shrink-0 items-center justify-center">
              <Link href="/" className="block">
                <img src="/assets/images/header/logo_srx.webp" alt="SRX Logo" className="h-8 w-auto object-contain" />
              </Link>
            </div>

            <div className="flex flex-1 items-center justify-end gap-1">
              <button
                type="button"
                onClick={() => {
                  setIsSearchOpen(false);
                  toggleCart();
                }}
                className="relative flex h-11 w-11 items-center justify-center text-black"
                aria-label="Mở giỏ hàng"
              >
                <ShoppingBag className="h-5 w-5" strokeWidth={2.1} />
                {totalItems > 0 ? (
                  <span className="absolute right-1 top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-none text-white">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                ) : null}
              </button>
              <Link
                href="/account"
                className="relative flex h-11 w-11 items-center justify-center text-black"
                aria-label="Tài khoản"
              >
                <UserRound className="h-5 w-5" strokeWidth={2.1} />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <HeaderSearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {isMenuOpen ? (
        <div className="fixed inset-0 z-50 xl:hidden">
          <div className="absolute inset-0 animate-fade-in bg-black/20 backdrop-blur-sm" onClick={toggleMobileMenu} />

          <div className="absolute inset-y-0 left-0 flex h-full w-[88vw] max-w-[360px] flex-col border-r border-black bg-white animate-slide-in-left">
            <div className="flex h-[70px] items-center justify-between px-5">
              <Link href="/" className="block">
                <img src="/assets/images/header/logo_srx.webp" alt="SRX Logo" className="h-8 w-auto object-contain" />
              </Link>

              <button
                type="button"
                onClick={toggleMobileMenu}
                className="rounded-full p-2 transition-colors duration-200 hover:bg-gray-100"
                aria-label="Đóng menu"
              >
                <X className="h-6 w-6 text-black" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              <nav className="space-y-8">
                {navigationItems.map((item, index) => (
                  <div
                    key={item.name}
                    className="animate-fade-in-up"
                    style={{
                      animationDelay: `${120 + index * 80}ms`,
                      animationFillMode: 'both',
                    }}
                  >
                    {item.dropdown ? (
                      <div className="space-y-0">
                        <button
                          type="button"
                          onClick={() => toggleMobileDropdown(item.name)}
                          className="flex w-full items-center justify-between border-l-2 border-black px-2 text-left text-[14px] font-medium text-black transition-all duration-300"
                        >
                          <span>{item.name}</span>
                          <ChevronDown
                            className={`h-5 w-5 transition-transform duration-300 ease-out ${
                              openMobileDropdown === item.name ? 'rotate-180' : ''
                            }`}
                          />
                        </button>

                        <div
                          className={`overflow-hidden transition-all duration-500 ease-out ${
                            openMobileDropdown === item.name
                              ? 'mt-4 max-h-[500px] translate-y-0 opacity-100'
                              : 'mt-0 max-h-0 -translate-y-2 opacity-0'
                          }`}
                        >
                          {item.desktopVariant === 'product-mega' ? (
                            renderProductMobileLinks()
                          ) : (
                            <div className="space-y-2 rounded-3xl px-2 pt-5">
                              {renderDropdownLinks(item.dropdown, { mobile: true })}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <Link
                        href={item.path}
                        className="block border-l-2 border-black px-2 text-[14px] font-medium text-black transition-all duration-200"
                      >
                        {item.name}
                      </Link>
                    )}
                  </div>
                ))}
              </nav>
            </div>
          </div>
        </div>
      ) : null}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-in-left {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-slide-in-left {
          animation: slide-in-left 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          opacity: 0;
        }
      `}</style>
    </>
  );
}
