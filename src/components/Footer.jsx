import React, { useState } from "react";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { ConsultationPopup } from "./ConsultationPopup.jsx";

const srxLinks = [
  { to: "/services/about", label: "Về SRX" },
  { to: "/products", label: "Sản phẩm" },
  { to: "/services/key-srx", label: "Từ điển sản phẩm" },
  { to: "/services/follow-srx", label: "Theo dòng SRX" },
  { to: "/services/tin-tuc", label: "Tin tức" },
  { to: "/services/su-kien", label: "Sự kiện" },
  { to: "/services/chu-de-khoa-hoc", label: "Chủ đề khoa học" },
  { to: "/affiliate", label: "Affiliate" },
  { to: "/faqs", label: "FAQs" },
];

const policyLinks = [
  { to: "/chinh-sach-bao-mat", label: "Chính sách & bảo mật" },
  { to: "/dieu-khoan", label: "Điều khoản" },
  { href: "/chinh-sach-giao-hang", label: "Chính sách giao hàng" },
  { href: "/chinh-sach-hoan-tra", label: "Chính sách hoàn trả" },
  { href: "/quy-dinh-thanh-toan", label: "Quy định về thanh toán" },
  { href: "/chinh-sach-affiliate", label: "Chính sách cho Affiliate" },
  { href: "/cach-dang-ky-affiliate", label: "Cách đăng ký Affiliate" },
];

const footerChevronClass =
  "mr-2 h-4 w-4 shrink-0 text-[#c59efe] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5 group-hover:text-white group-focus-within:translate-x-0.5 group-focus-within:text-white";

const FooterAnimatedLink = ({ children, href, to }) => {
  const Component = href ? "a" : Link;
  const linkProps = href ? { href } : { to };

  return (
    <Component {...linkProps} className="relative inline-flex max-w-full text-white/90 transition-colors duration-500">
      <span className="leading-[1.45] md:hidden">{children}</span>
      <span className="hidden md:inline-grid">
        <span
          aria-hidden="true"
          className="invisible col-start-1 row-start-1 whitespace-nowrap font-semibold leading-[1.55]"
        >
          {children}
        </span>
        <span className="relative col-start-1 row-start-1 block h-[1.55em] overflow-hidden">
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-0 flex items-center whitespace-nowrap leading-[1.55] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-full group-focus-within:-translate-y-full"
          >
            {children}
          </span>
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-0 flex items-center whitespace-nowrap translate-y-full font-semibold leading-[1.55] text-white transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 group-focus-within:translate-y-0"
          >
            {children}
          </span>
        </span>
      </span>
    </Component>
  );
};

const FooterLinkItem = ({ href, label, to }) => (
  <li className="group flex items-center text-[14px] text-white">
    <ChevronRight className={footerChevronClass} />
    <FooterAnimatedLink href={href} to={to}>
      {label}
    </FooterAnimatedLink>
  </li>
);

const Footer = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  return (
    <>
      <footer className="bg-[#7584d6] pb-[20px] py-[40px] text-white lg:pt-[100px]">
        <div className="mx-auto max-w-[1840px] px-6 sm:px-6 lg:px-8">
          <div className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-20">
            <div className="space-y-4">
              <div className="mb-14">
                <img
                  src="/assets/images/footer/logo_srx_white.webp"
                  alt="SRX Logo"
                  className="h-14 w-auto object-contain lg:h-16"
                />
              </div>

              <h3 className="mb-2 text-[16px] font-medium text-white">
                CÔNG TY TNHH XUẤT NHẬP KHẨU TOÀN DIỆN EAC - Chuyên nhập khẩu & phân phối sản phẩm thẩm mỹ nội khoa, filler, skin booster, thiết bị y tế, dược mỹ phẩm
              </h3>
              <div className="space-y-3">
                <div className="text-[14px] text-white">
                  <span className="font-medium">Hotline:</span>
                  <div className="text-white">+84 903.010.692</div>
                </div>
                <div className="text-[14px] text-white">
                  <span className="font-medium">Email:</span>
                  <div className="text-white">eacgroup.vn@gmail.com</div>
                </div>
                <div className="text-[14px] text-white">
                  <span className="font-medium">Address:</span>
                  <div className="text-white">
                    58 Phước Hưng, Phường 08, Quận 5, Thành phố Hồ Chí Minh, Việt Nam
                  </div>
                </div>
              </div>

              <div className="flex space-x-5 pt-4">
                <a href="https://www.facebook.com/srxvnofficial" className="transition-opacity hover:opacity-80">
                  <img
                    src="/assets/images/footer/facebook.webp"
                    alt="Facebook"
                    className="h-10 w-10 object-contain"
                  />
                </a>
                <a href="https://zalo.me/4112137101220932811" className="transition-opacity hover:opacity-80">
                  <img
                    src="/assets/images/footer/zalo.webp"
                    alt="Zalo OA"
                    className="h-10 w-10 object-contain"
                  />
                </a>
                <a href="https://www.tiktok.com/@srxvietnam" className="transition-opacity hover:opacity-80">
                  <img
                    src="/assets/images/footer/tiktok.webp"
                    alt="TikTok"
                    className="h-10 w-10 object-contain"
                  />
                </a>
                <a href="https://shopee.vn/srxvietnam" className="transition-opacity hover:opacity-80">
                  <img
                    src="/assets/images/footer/shopee.webp"
                    alt="Shopee"
                    className="h-10 w-10 object-contain"
                  />
                </a>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="mb-2 text-[16px] font-medium text-white">SRX Việt Nam</h3>
              <ul className="space-y-3">
                {srxLinks.map((item) => (
                  <FooterLinkItem key={item.label} {...item} />
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="mb-2 text-[16px] font-medium text-white">Hỗ trợ khách hàng</h3>
              <ul className="space-y-3">
                {policyLinks.map((item) => (
                  <FooterLinkItem key={item.label} {...item} />
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="mb-2 text-[20px] font-medium text-white">Đối tác & Liên kết</h3>
              <p className="mb-2 text-[14px] text-white">
                Đăng ký để nhận thông tin mới nhất về sản phẩm và xu hướng làm đẹp từ SRX.
              </p>
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="Nhập email của bạn"
                  className="w-full rounded-3xl bg-white px-3 py-2.5 text-white placeholder-gray-400 transition-colors focus:border-[#c59efe] focus:outline-none focus:ring-1 focus:ring-[#c59efe]"
                />
                <button className="w-full transform rounded-3xl bg-black px-3 py-2.5 font-medium text-white transition-all hover:scale-105 hover:bg-purple-400">
                  Đăng ký
                </button>
              </div>
              <button
                type="button"
                onClick={() => setIsPopupOpen(true)}
                className="flex w-full items-center justify-between gap-3 rounded-full bg-gradient-to-r from-[#2B144D] via-[#c08dfe] to-[#2B144D] px-5 py-1.5 text-left text-[15px] font-medium text-white transition-transform duration-300 hover:scale-[1.02]"
              >
                <span>Hợp tác ngay</span>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black">
                  <ArrowUpRight className="h-5 w-5" strokeWidth={2.3} />
                </span>
              </button>
            </div>
          </div>

          <div className="pt-8 text-center">
            <p className="text-[13px] text-white lg:text-[14px]">
              © Bản quyền thuộc về & cung cấp bởi{" "}
              <a href="https://nextgency.vn/" className="text-white hover:text-bold" target="_blank" rel="noopener noreferrer">
                SRX Việt Nam
              </a>
            </p>
          </div>
        </div>
      </footer>
      <ConsultationPopup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} />
    </>
  );
};

export default Footer;
