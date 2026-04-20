'use client';

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const SRX_LOGO_MASK_ID = "srx-logo-mask";

export default function SrxLogo() {
  const sectionRef = useRef(null);

  return (
    <section ref={sectionRef} className="bg-white px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
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
