'use client';

import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ScrollRevealHeading from "./ScrollRevealHeading.jsx";
import {
  homeButtonHighlightClass,
  homeButtonSheenClass,
  homePrimaryButtonClass,
  homeSecondaryButtonClass,
} from './homeCtaStyles.js';

gsap.registerPlugin(ScrollTrigger);

const technologyCards = [
  {
    title: "Công nghệ tế bào gốc và hoạt chất sinh học",
    description:
      "Đây là nền tảng cốt lõi được SRX ứng dụng để tạo ra các giải pháp điều trị hiệu quả, giúp kích hoạt khả năng sửa chữa, phục hồi tự thân và tái sinh làn da một cách mạnh mẽ, đặc biệt phù hợp với làn da châu Á.",
    image:
      "/assets/images/home/yellow.webp",
  },
  {
    title: "Công nghệ phức hợp Retinol thế hệ mới",
    description:
      "Cấu trúc retinol cải tiến hướng tới hiệu quả tái tạo rõ rệt hơn nhưng vẫn kiểm soát cảm giác châm chích, giúp làn da tiếp nhận treatment ổn định và bền vững hơn theo thời gian.",
    image:
      "/assets/images/home/blue.webp",
  },
  {
    title: "Hệ thống phục hồi sinh học chuyên sâu",
    description:
      "Thiết kế cho da yếu, da sau treatment và da cần hồi phục nhanh, tập trung củng cố hàng rào bảo vệ, giảm kích ứng và đưa bề mặt da trở lại trạng thái khỏe, ẩm và ổn định.",
    image:
      "/assets/images/home/purble.webp",
  },
];

export default function HomeProductTechnologySection() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from("[data-tech-intro]", {
        opacity: 0,
        y: 36,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 78%",
        },
      });

      gsap.from("[data-tech-card]", {
        opacity: 0,
        y: 42,
        duration: 0.85,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 72%",
        },
      });

      gsap.from("[data-tech-cta]", {
        opacity: 0,
        y: 24,
        duration: 0.7,
        ease: "power2.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 66%",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden px-4 py-8 sm:px-6 lg:px-8 lg:py-24"
    >
      <div className="absolute inset-0 overflow-hidden bg-[#c6b7f2]">
        <style>
          {`
            @keyframes wave1 {
              0% { transform: translate(0%, 0%) scale(1); }
              100% { transform: translate(40%, -30%) scale(1.3); }
            }
            @keyframes wave2 {
              0% { transform: translate(50%, 50%) scale(1); }
              100% { transform: translate(-20%, 20%) scale(1.4); }
            }
            @keyframes wave3 {
              0% { transform: translate(30%, -20%) scale(1); }
              100% { transform: translate(60%, 40%) scale(1.2); }
            }
            @keyframes float1 {
              0% { transform: translate(10%, 20%) scale(1); }
              100% { transform: translate(70%, 60%) scale(1.2); }
            }
            @keyframes float2 {
              0% { transform: translate(80%, 10%) scale(1); }
              100% { transform: translate(20%, 70%) scale(1.3); }
            }
          `}
        </style>

        {/* nền blur */}
        <div className="absolute inset-0 blur-[120px]">
          <div
            className="absolute left-[-10%] top-[-10%] h-[60%] w-[60%] rounded-full bg-[#d8b6e3] opacity-60"
            style={{ animation: "wave1 30s ease-in-out infinite alternate" }}
          />
          <div
            className="absolute right-[-10%] top-[20%] h-[60%] w-[60%] rounded-full bg-[#b7c4f5] opacity-60"
            style={{ animation: "wave2 35s ease-in-out infinite alternate" }}
          />
          <div
            className="absolute left-[20%] bottom-[-20%] h-[60%] w-[60%] rounded-full bg-[#cdb3f0] opacity-60"
            style={{ animation: "wave3 40s ease-in-out infinite alternate" }}
          />
        </div>

        {/* vùng sáng nổi bật hơn */}
        <div
          className="absolute left-[8%] top-[12%] h-[28%] w-[28%] rounded-full bg-white opacity-90 blur-[60px] mix-blend-screen"
          style={{ animation: "float1 18s ease-in-out infinite alternate" }}
        />
        <div
          className="absolute right-[10%] bottom-[8%] h-[26%] w-[26%] rounded-full bg-[#f0e9ff] opacity-90 blur-[60px] mix-blend-screen"
          style={{ animation: "float2 22s ease-in-out infinite alternate" }}
        />

        {/* overlay nhẹ hơn để không che mất background */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.42),rgba(248,250,255,0.28)_38%,rgba(255,255,255,0.46)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),rgba(255,255,255,0)_42%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1920px]">
        <div className="flex flex-col items-center gap-10 lg:gap-14">
          <div data-tech-intro className="w-full max-w-[1440px]">
            <div className="mt-8 text-center">
              <ScrollRevealHeading
                as="h2"
                className="mx-auto mt-4 max-w-[780px] text-[32px] font-medium leading-[1.3] tracking-[-0.05em] sm:text-[42px] lg:text-[62px]"
                revealedClassName="text-[#111111]"
                baseStyle={{ color: 'rgba(17,17,17,0.14)' }}
                style={{ fontFamily: '"Manrope", "Hubot Sans", sans-serif' }}
              >
                Công nghệ sản phẩm
              </ScrollRevealHeading>
            </div>
          </div>

          <div className="grid w-full max-w-[1840px] gap-5 lg:grid-cols-3">
            {technologyCards.map((card) => (
              <article
                key={card.title}
                data-tech-card
                className="group relative overflow-hidden bg-[#050505] shadow-[0_30px_80px_rgba(11,16,40,0.12)]"
              >
                <div className="relative h-[420px] sm:h-[600px] lg:h-[750px]">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="h-full w-full object-cover transition-[transform,filter] duration-700 ease-out group-hover:scale-105 group-hover:brightness-[0.78]"
                  />

                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.3),rgba(0,0,0,0.3)_38%,rgba(0,0,0,0.3)_100%)]" />
                  <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/20" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),rgba(255,255,255,0)_34%)]" />

                  <div className="absolute inset-0 flex justify-between align-top p-6 sm:p-7 lg:p-8">
                    <div className="max-w-[360px]">
                      <h3
                        className="text-[28px] font-medium leading-[1.08] tracking-[-0.04em] text-white sm:text-[30px] lg:text-[31px]"
                        style={{ fontFamily: '"Manrope", "Hubot Sans", sans-serif' }}
                      >
                        {card.title}
                      </h3>

                      <p
                        className="mt-5 font-weight-300 text-[14px] leading-[1.55] text-white transition-all duration-500 md:translate-y-4 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 lg:text-[15px]"
                        style={{ fontFamily: '"Inter", "Hubot Sans", sans-serif' }}
                      >
                        {card.description}
                      </p>
                    </div>
                    <div className="ml-auto flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-sm transition-transform duration-300 group-hover:rotate-45">
                      <span className="absolute h-px w-4 bg-white" />
                      <span className="absolute h-4 w-px bg-white" />
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div data-tech-cta className="mt-4 sm:mt-20 flex w-full justify-center">
          <div className="flex justify-center w-full max-w-[460px] gap-3 sm:w-auto sm:max-w-none sm:gap-[18px]">
            <Link
              href="/products"
              className={`${homePrimaryButtonClass} justify-center shrink-0 sm:w-auto min-w-[118px]`}
              style={{ fontFamily: '"Manrope", "Hubot Sans", sans-serif' }}
            >
              <span className={homeButtonHighlightClass} />
              <span className={homeButtonSheenClass} />
              <span className="relative z-[1]">Khám phá ngay</span>
            </Link>

            <Link
              href="/contact"
              className={`${homeSecondaryButtonClass} justify-center shrink-0 px-6 sm:w-auto min-w-[210px] sm:px-7`}
              style={{ fontFamily: '"Manrope", "Hubot Sans", sans-serif' }}
            >
              <span className={homeButtonHighlightClass} />
              <span className={homeButtonSheenClass} />
              <span className="relative z-[1]">Nâng cấp làn da của bạn</span>
            </Link>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}
