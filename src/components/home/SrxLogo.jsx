'use client';

import { useRef } from "react";

const defaultHighlights = [
  "Công nghệ sinh học",
  "Công nghệ phức hợp Retinol thế hệ mới",
  "Hệ thống phục hồi sinh học chuyên sâu",
  "Hỗ trợ 24/7",
  "Hàng nghìn đối tác",
  "Mỹ phẩm cao cấp Hàn Quốc",
  "Công nghệ Vi Tảo và TECA Liposom",
  "Công nghệ tế bào gốc và hoạt chất sinh học",
  "Cam kết chất lượng cao",
  "92% khách hàng đánh giá 5 sao",
];


export default function SrxLogo({ highlights = defaultHighlights } = {}) {
  const sectionRef = useRef(null);
  const SRX_LOGO_MASK_ID = "srx-logo-mask";

  const safeHighlights = Array.isArray(highlights) ? highlights.filter(Boolean) : [];
  const marqueeItems = [...safeHighlights, ...safeHighlights];

  return (
    <section ref={sectionRef} className="bg-white py-4 sm:py-6 lg:py-8">
      {marqueeItems.length > 0 ? (
        <div className="relative z-20 mt-10 overflow-hidden bg-[#edf6ff] sm:mt-14">
          <div
            className="overflow-hidden"
            style={{
              WebkitMaskImage:
                "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
              maskImage:
                "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
            }}
          >
            <div className="flex w-max animate-home-faq-marquee items-center py-3.5 sm:py-5">
              {marqueeItems.map((item, index) => (
                <div
                  key={`${item}-${index}`}
                  className="flex shrink-0 items-center gap-3 px-4 sm:gap-10 sm:px-5"
                >
                  <svg
                    className="animate-home-faq-icon-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    width="34"
                    height="16"
                    fill="none"
                    overflow="visible"
                  >
                    <path
                      d="M 11.172 11.767 C 11.172 11.767 9.665 13.23 7.747 13.06 C 5.828 12.891 4.565 12.136 3.56 10.565 C 2.555 8.994 2.296 5.021 5.92 3.404 C 9.543 1.787 11.888 4.99 11.888 4.99 L 14.887 8.024 L 12.893 10.119 L 14.979 12.213 L 17.034 10.119 L 21.556 14.554 C 21.556 14.554 27.28 18.851 32.563 12.629 C 34.664 9.272 34.086 6.469 33.187 4.482 C 32.289 2.495 29.884 0.015 26.214 0.015 C 22.545 0.015 20.764 2.172 20.764 2.172 L 22.88 4.22 C 22.88 4.22 24.783 2.033 28.194 3.404 C 30.325 4.343 30.934 6.638 30.934 6.638 C 30.934 6.638 31.851 10.695 28.589 12.383 C 25.328 14.07 22.88 11.89 22.88 11.89 L 19.059 8.024 L 21.16 5.899 L 19.059 3.773 L 16.961 5.887 L 13.55 2.437 C 13.55 2.437 10.475 -1.116 5.588 0.358 C 0.701 1.831 -0.132 6.499 0.015 8.763 C 0.163 11.027 2.114 15.232 6.498 15.879 C 10.883 16.526 13.212 13.861 13.212 13.861 Z M 20.767 2.172"
                      fill="rgb(128,229,255)"
                    />
                  </svg>
                  <span
                    className="whitespace-nowrap text-[18px] font-medium leading-none tracking-[-0.04em] text-[#788ce6] sm:text-[28px] lg:text-[32px]"
                    style={{ fontFamily: '"Manrope", "Hubot Sans", sans-serif' }}
                  >
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <style jsx>{`
        @keyframes doctor-quote-marquee {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-50%, 0, 0);
          }
        }

        @keyframes svg-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-doctor-quote-marquee {
          animation: doctor-quote-marquee 60s linear infinite;
          will-change: transform;
        }

        .animate-svg-spin {
          /* duration 8s, linear, infinite */
          animation: svg-spin 4s linear infinite;
          /* Đảm bảo xoay quanh tâm */
          transform-origin: center; 
          will-change: transform;
        }

        @keyframes faq-orbit-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes faq-thumb-float {
          0% {
            transform: translateY(8px) rotate(-6deg);
          }
          50% {
            transform: translateY(-4px) rotate(-3deg);
          }
          100% {
            transform: translateY(8px) rotate(-6deg);
          }
        }

        .animate-faq-orbit-slow {
          animation: faq-orbit-slow 9s linear infinite;
          transform-origin: center;
          will-change: transform;
        }

        .animate-faq-thumb-float {
          animation: faq-thumb-float 4.6s ease-in-out infinite;
        }

        @keyframes home-faq-marquee {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-50%, 0, 0);
          }
        }

        @keyframes home-faq-icon-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-home-faq-marquee {
          animation: home-faq-marquee 60s linear infinite;
          will-change: transform;
        }

        .animate-home-faq-icon-spin {
          animation: home-faq-icon-spin 4s linear infinite;
          transform-origin: center;
          will-change: transform;
        }
      `}</style>

      <div className="mx-auto max-w-[1920px]">
        

        <div className="flex flex-col items-center gap-10 lg:gap-14">
          <div data-tech-intro className="w-full max-w-[1440px]">
            {/* Tăng chiều cao (h-[250px] và lg:h-[450px]) để khung thoáng hơn, chữ không bị chạm viền */}
            <div className="relative mx-auto flex h-[170px] w-full max-w-[100%] items-center justify-center overflow-hidden sm:h-[240px] lg:h-[450px]">
              
              <svg
                className="pointer-events-none absolute inset-0 h-full w-full"
                aria-hidden="true"
              >
                <defs>
                  {/* Bỏ các kích thước tĩnh, để mask tự phủ 100% */}
                  <mask id={SRX_LOGO_MASK_ID}>
                    <rect width="100%" height="100%" fill="black" />
                    <text
                      x="50%"
                      y="50%"
                      fill="white"
                      textAnchor="middle"          // Căn giữa theo trục ngang (X)
                      dominantBaseline="central"   // Căn giữa theo trục dọc (Y)
                      style={{
                        fontFamily: '"Manrope", "Hubot Sans", sans-serif',
                        // Sử dụng clamp() để font chữ tự động to/nhỏ theo chiều rộng màn hình.
                        // Min: 100px (Mobile), Tương đối: 22vw, Max: 300px (Desktop)
                        fontSize: "clamp(72px, 20vw, 300px)", 
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                      }}
                    >
                      SRX
                    </text>
                  </mask>
                </defs>
              </svg>

              <video
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                className="absolute inset-0 h-full w-full object-cover"
                style={{
                  mask: `url(#${SRX_LOGO_MASK_ID})`,
                  WebkitMask: `url(#${SRX_LOGO_MASK_ID})`,
                }}
              >
                <source src="/assets/images/home/video_bh_hero.mp4" type="video/mp4" />
              </video>

              {/* Thêm pointer-events-none để lớp gradient không chặn các thao tác chuột (nếu có) */}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2),rgba(255,255,255,0)_55%)]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
