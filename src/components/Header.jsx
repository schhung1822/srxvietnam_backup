'use client';

import { useEffect, useState } from 'react';
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
import HeaderSearchOverlay from './search/HeaderSearchOverlay.jsx';

const navigationItems = [
  { name: 'Về SRX', path: '/about' },
  { name: 'Sản phẩm', path: '/products' },
  { name: 'Từ điển sản phẩm', path: '/key-srx' },
  {
    name: 'Theo dòng SRX',
    path: '/follow-srx',
    dropdown: [
      { name: 'Tin tức', path: '/tin-tuc', icon: Globe },
      { name: 'Sự kiện', path: '/su-kien', icon: Calendar1 },
      { name: 'chủ đề khoa học', path: '/chu-de-khoa-hoc', icon: Book },
    ],
  },
  {
    name: 'Affiliate',
    path: '/affiliate',
    dropdown: [
      { name: 'Tổng quan', path: '/affiliate', icon: BarChart3 },
      { name: 'Chính sách', path: '/chinh-sach-affiliate', icon: CheckCircle },
      { name: 'Quyền lợi', path: '/quyen-loi-affiliate', icon: CheckCircle },
      { name: 'Cách đăng ký', path: '/cach-dang-ky-affiliate', icon: CheckCircle },
    ],
  }
];

export default function Header() {
  const pathname = usePathname() ?? '/';
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openMobileDropdown, setOpenMobileDropdown] = useState(null);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { totalItems, toggleCart } = useCart();

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
    setIsSearchOpen(false);
  }, [pathname]);

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

  const isActiveRoute = (path) => {
    if (path === '/') {
      return pathname === '/';
    }

    return pathname.startsWith(path);
  };

  const toggleMobileMenu = () => {
    setIsMenuOpen((current) => !current);
  };

  const toggleMobileDropdown = (itemName) => {
    setOpenMobileDropdown((currentDropdown) =>
      currentDropdown === itemName ? null : itemName,
    );
  };

  const openSearch = () => {
    setIsMenuOpen(false);
    setIsSearchOpen(true);
  };

  const isNavigationItemActive = (item) => {
    if (isActiveRoute(item.path)) {
      return true;
    }

    return item.dropdown?.some((dropdownItem) => isActiveRoute(dropdownItem.path));
  };

  const renderDropdownLinks = (dropdownItems, { mobile = false } = {}) =>
    dropdownItems.map((dropdownItem) => {
      const Icon = dropdownItem.icon;
      const baseClasses = mobile
        ? 'flex items-center gap-2 rounded-3xl border border-[#111111] px-3 py-2 text-[13px] transition-all duration-200'
        : 'flex items-center gap-2 rounded-3xl border-[1.5px] border-[#111111] px-3 py-2.5 text-[14px] transition-colors duration-200';
      const activeClasses = isActiveRoute(dropdownItem.path)
        ? 'bg-black text-white hover:bg-black'
        : mobile
          ? 'text-black hover:bg-white'
          : 'text-black hover:bg-[#111111] hover:text-white';

      return (
        <Link
          key={`${dropdownItem.path}-${dropdownItem.name}`}
          href={dropdownItem.path}
          className={`${baseClasses} ${activeClasses}`}
        >
          <Icon className={mobile ? 'h-3 w-3 shrink-0' : 'h-3.5 w-3.5 shrink-0'} />
          <span className={mobile ? 'truncate' : ''}>{dropdownItem.name}</span>
        </Link>
      );
    });

  return (
    <>
      <header
        className={`fixed left-0 right-0 top-0 z-50 border-b-2 border-black bg-white transition-all duration-500 ${
          isVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="mx-auto max-w-[1840px] px-2 sm:px-6 lg:px-8">
          <div className="hidden h-[70px] items-center xl:flex xl:h-[85px]">
            <div className="flex min-w-0 flex-1 items-center">
              <Link href="/" className="block">
                <img
                  src="/assets/images/header/logo_srx.webp"
                  alt="SRX Logo"
                  className="h-8 w-auto object-contain lg:h-8"
                />
              </Link>
            </div>

            <nav className="hidden shrink-0 items-center xl:flex">
              <div className="flex items-center gap-2 xl:gap-4">
                {navigationItems.map((item) => (
                  <div key={item.name} className="group relative">
                    {item.dropdown ? (
                      <div className="relative">
                        <button className="relative flex min-h-[54px] items-center justify-center px-4 py-3 text-[16px] font-medium text-black">
                          <span
                            className={`relative inline-flex items-center gap-1.5 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                              isNavigationItemActive(item)
                                ? '-translate-y-0.5'
                                : 'group-hover:-translate-y-0.5'
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
                              isNavigationItemActive(item)
                                ? 'scale-x-100'
                                : 'scale-x-0 group-hover:scale-x-100'
                            }`}
                          />
                        </button>

                        <div className="invisible absolute left-0 top-full z-50 mt-2 w-[280px] rounded-3xl bg-white opacity-0 transition-all duration-300 group-hover:visible group-hover:opacity-100">
                          <div className="space-y-2 p-2.5">{renderDropdownLinks(item.dropdown)}</div>
                        </div>
                      </div>
                    ) : (
                      <Link
                        href={item.path}
                        className="group relative flex min-h-[54px] items-center justify-center px-4 py-3 text-[16px] font-medium text-black"
                      >
                        <span
                          className={`transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                            isNavigationItemActive(item)
                              ? '-translate-y-0.5'
                              : 'group-hover:-translate-y-0.5'
                          }`}
                        >
                          {item.name}
                        </span>
                        <span
                          className={`absolute bottom-[9px] left-4 right-4 h-[2px] origin-center rounded-full bg-black transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                            isNavigationItemActive(item)
                              ? 'scale-x-100'
                              : 'scale-x-0 group-hover:scale-x-100'
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
                <img
                  src="/assets/images/header/logo_srx.webp"
                  alt="SRX Logo"
                  className="h-8 w-auto object-contain"
                />
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
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-fade-in"
            onClick={toggleMobileMenu}
          />

          <div className="absolute inset-y-0 left-0 flex h-full w-[88vw] max-w-[360px] flex-col border-r border-black bg-white animate-slide-in-left">
            <div className="flex h-[70px] items-center justify-between px-5">
              <Link href="/" className="block">
                <img
                  src="/assets/images/header/logo_srx.webp"
                  alt="SRX Logo"
                  className="h-8 w-auto object-contain"
                />
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
                          <div className="space-y-2 rounded-3xl px-2 pt-5">
                            {renderDropdownLinks(item.dropdown, {
                              mobile: true,
                            })}
                          </div>
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
