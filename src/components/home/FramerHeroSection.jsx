import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { Link } from "react-router-dom";
import {
  homeButtonHighlightClass,
  homeButtonSheenClass,
  homePrimaryButtonClass,
  homeSecondaryButtonClass,
} from "./homeCtaStyles.js";

const HERO_ASSETS = {
  backgroundVideo:
    "/assets/images/home/video_bh_hero.mp4",
  infinityArtwork:
    "/assets/images/home/logo_3d_hero.webp",
  titlePill:
    "/assets/images/home/background_hero.webp",
  badgeIcon:
    "https://framerusercontent.com/images/8l5o7RMsH7c7Xe3dBJBR4Fpc3A.svg?width=16&height=16",
};

const heroCards = [
  {
    text: "SRX Tiên phong tích hợp công nghệ tiên tiến nhất trong nghiên cứu và phát triển sản phẩm chăm da",
    desktopClass:
      "lg:absolute lg:left-[-10%] lg:top-[43%] lg:w-[634px] lg:max-w-[634px] lg:px-[42px] lg:py-[44px]",
  },
  {
    text: "SRX là thương hiệu dược mỹ phẩm cao cấp đến từ Hàn Quốc, chính thức ra đời vào năm 2005. Trải qua nhiều năm phát triển, SRX đã tạo được tiếng vang lớn không chỉ tại Hàn Quốc mà còn vươn ra thị trường quốc tế, có mặt ở các quốc gia lớn như Mỹ, Đức, Pháp, và hiện tại là Việt Nam.",
    desktopClass:
      "lg:absolute lg:right-[-10%] lg:bottom-[-40%] lg:w-[686px] lg:max-w-[686px] lg:px-[54px] lg:py-[58px]",
    boldLead: "SRX",
  },
];

const FramerHeroSection = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const titlePill = gsap.utils.toArray("[data-hero-title-pill]")[0];
      const timeline = gsap.timeline({
        defaults: {
          ease: "power3.out",
        },
      });
      const titlePillLoop = gsap.timeline({
        paused: true,
        repeat: -1,
        repeatDelay: 0.12,
        defaults: {
          ease: "sine.inOut",
        },
      });

      if (titlePill) {
        gsap.set(titlePill, {
          transformPerspective: 900,
          transformOrigin: "50% 50%",
          force3D: true,
        });

        titlePillLoop
          .to(titlePill, {
            rotateY: 20,
            duration: 1.1,
          })
          .to(titlePill, {
            rotateY: 0,
            duration: 1.1,
          });
      }

      timeline
        .from("[data-hero-bg]", {
          opacity: 0,
          duration: 1.1,
        })
        .from(
          "[data-hero-art]",
          {
            opacity: 0,
            scale: 0.96,
            rotate: -14,
            duration: 1.2,
          },
          "-=0.85",
        )
        .from(
          "[data-hero-badge]",
          {
            opacity: 0,
            y: 18,
            duration: 0.6,
          },
          "-=0.5",
        )
        .from(
          "[data-hero-title-part]",
          {
            opacity: 0,
            y: 30,
            duration: 0.8,
            stagger: 0.08,
          },
          "-=0.3",
        )
        .from(
          "[data-hero-title-pill]",
          {
            opacity: 0,
            y: 70,
            rotateY: -70,
            transformOrigin: "50% 50%",
            duration: 1,
          },
          "-=0.65",
        )
        .from(
          "[data-hero-card]",
          {
            opacity: 0,
            y: 12,
            duration: 0.7,
            stagger: 0.12,
          },
          "-=0.3",
        );

      if (titlePill) {
        timeline.add(() => titlePillLoop.play(0));
      }

      gsap.to("[data-hero-art]", {
        y: 16,
        rotate: -8,
        duration: 7,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[#f1f2f9]"
    >
      <div className="absolute inset-0" data-hero-bg>
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover opacity-[0.81] [filter:saturate(0.88)]"
        >
          <source src={HERO_ASSETS.backgroundVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0),rgba(255,255,255,0))]" />
      </div>

      <div className="relative mx-auto min-h-[620px] max-w-[1920px] px-4 pb-14 pt-6 sm:min-h-[760px] sm:px-6 sm:pb-16 sm:pt-8 lg:min-h-[1334px] lg:px-0 lg:pb-20">
        <div
          data-hero-art
          className="pointer-events-none absolute left-1/2 top-[180px] z-[1] h-[300px] w-[165%] max-w-none -translate-x-1/2 rotate-[-10deg] sm:top-[260px] sm:h-[420px] sm:w-[145%] lg:top-[292px] lg:h-[1000px] lg:w-[2000px]"
        >
          <img
            src={HERO_ASSETS.infinityArtwork}
            alt=""
            className="h-full w-full object-contain scale-[1.025]"
          />
        </div>

        <div className="relative z-[2] mx-auto w-full max-w-[1440px] ">
          <div className="flex flex-col items-center">
            <div className="w-full max-w-[921px] pt-4 sm:pt-6 lg:ml-[40px] lg:mr-auto lg:px-0 lg:pt-[80px]">
              <div className="flex flex-col items-center gap-3 sm:gap-4">
                <div className="grid w-full justify-center ms:justify-start gap-4 lg:grid-cols-2">
                  <div className="flex max-w-[240px] flex-col gap-4">
                    <div
                      data-hero-badge
                      className="inline-flex flex-wrap items-center gap-2 rounded-full border border-[#7584d6] bg-white/30 pr-3 shadow-[0_2px_4px_rgba(189,200,223,0.1),0_7px_7px_rgba(189,200,223,0.09),0_15px_9px_rgba(189,200,223,0.05)] backdrop-blur-[10px] sm:gap-3 sm:pr-0"
                    >
                      <span className="flex items-center gap-2 rounded-full bg-[#7584d6] px-[12px] py-[6px] text-[13px] font-normal tracking-[-0.01em] text-[#f9fafb] shadow-[0_0.42px_0.25px_-1px_rgba(136,138,227,0.47),0_1.6px_0.96px_-2px_rgba(136,138,227,0.44),0_7px_4.2px_-3px_rgba(136,138,227,0.32),inset_0_0_2px_rgba(30,33,115,0.3)] sm:text-[14px]">
                        <img
                          src={HERO_ASSETS.badgeIcon}
                          alt=""
                          className="h-4 w-4 rounded-full object-cover"
                        />
                        <span>12K+</span>
                      </span>
                      <span className="text-center text-[11px] font-medium text-[#7584d6] sm:pr-4 sm:text-[12px]">
                        khách hàng đã tin dùng
                      </span>
                    </div>
                  </div>
                  <div />
                </div>

                <div className="flex w-full flex-wrap items-center justify-center lg:justify-start gap-2.5 sm:gap-3">
                  <h1
                    data-hero-title-part
                    className="text-[30px] font-medium leading-none tracking-[-0.05em] text-[#7990f0] sm:text-[58px] lg:text-[80px]"
                    style={{ fontFamily: '"Manrope", "Hubot Sans", sans-serif' }}
                  >
                    Công nghệ
                  </h1>

                  <div
                    data-hero-title-pill
                    className="relative z-[4] overflow-hidden rounded-[36px] border-2 border-[rgba(117,132,214,0.8)] px-5 py-2.5 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_10px_30px_rgba(128,139,214,0.2)] backdrop-blur-[5px] sm:rounded-[48px] sm:px-7 sm:py-3 lg:rounded-[56px] lg:px-[34px] lg:py-[12px]"
                  >
                    <img
                      src={HERO_ASSETS.titlePill}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <h1
                      data-hero-title-pill-text
                      className="relative text-[30px] font-medium leading-none tracking-[-0.05em] text-white sm:text-[58px] lg:text-[80px]"
                      style={{ fontFamily: '"Manrope", "Hubot Sans", sans-serif' }}
                    >
                      Sinh học
                    </h1>
                  </div>

                  <h1
                    data-hero-title-part
                    className="text-center text-[30px] font-medium leading-none tracking-[-0.05em] text-[#7990f0] sm:text-[58px] lg:text-[80px]"
                    style={{ fontFamily: '"Manrope", "Hubot Sans", sans-serif' }}
                  >
                    đến gần hơn với làn da Việt
                  </h1>
                </div>

                <div className="relative z-[5] hidden sm:block flex w-full flex-wrap items-start justify-start px-0 pt-6 sm:px-1 sm:pt-8">
                  <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:gap-[18px]">
                    <Link
                      data-hero-cta
                      to="/products"
                      className={`${homePrimaryButtonClass} w-full justify-center shrink-0 min-w-[116px] sm:w-auto sm:min-w-[118px]`}
                      style={{ fontFamily: '"Manrope", "Hubot Sans", sans-serif' }}
                    >
                      <span className={homeButtonHighlightClass} />
                      <span className={homeButtonSheenClass} />
                      <span className="relative z-[1]">Khám phá ngay</span>
                    </Link>

                    <Link
                      data-hero-cta
                      to="/contact"
                      className={`${homeSecondaryButtonClass} w-full justify-center shrink-0 min-w-[206px] px-6 sm:w-auto sm:min-w-[210px] sm:px-7`}
                      style={{ fontFamily: '"Manrope", "Hubot Sans", sans-serif' }}
                    >
                      <span className={homeButtonHighlightClass} />
                      <span className={homeButtonSheenClass} />
                      <span className="relative z-[1]">
                        Nâng cấp làn da của bạn
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative mt-[240px] grid gap-3 px-0 sm:mt-[240px] sm:grid-cols-2 sm:gap-4 sm:px-2 lg:mt-0 lg:block lg:min-h-[520px] lg:w-[100%] lg:px-0">
              {heroCards.map((card) => (
                <div
                  key={card.text}
                  data-hero-card
                  className={`rounded-[32px] bg-[rgba(255,255,255,0.29)] px-6 py-7 backdrop-blur-[8px] sm:rounded-[56px] sm:px-7 sm:py-8 lg:rounded-[146px] ${card.desktopClass}`}
                >
                  <p
                    className="mx-auto max-w-[478px] text-center text-[14px] leading-[1.5] tracking-[-0.01em] text-[#465478] sm:text-[17px] lg:text-[20px]"
                    style={{ fontFamily: '"Inter", "Hubot Sans", sans-serif' }}
                  >
                    {card.boldLead ? (
                      <>
                        <span className="font-bold">{card.boldLead}</span>
                        {card.text.slice(card.boldLead.length)}
                      </>
                    ) : (
                      card.text
                    )}
                  </p>
                </div>
              ))}
            </div>

            <div className="relative z-[5] block sm:hidden flex w-full flex-wrap items-start justify-center px-0 pt-6 sm:px-1 sm:pt-8">
                  <div className="flex w-full gap-3 justify-center sm:w-auto sm:flex-row sm:flex-wrap sm:gap-[18px]">
                    <Link
                      data-hero-cta
                      to="/products"
                      className={`${homePrimaryButtonClass} justify-center shrink-0 min-w-[116px] sm:w-auto sm:min-w-[118px]`}
                      style={{ fontFamily: '"Manrope", "Hubot Sans", sans-serif' }}
                    >
                      <span className={homeButtonHighlightClass} />
                      <span className={homeButtonSheenClass} />
                      <span className="relative z-[1]">Khám phá ngay</span>
                    </Link>

                    <Link
                      data-hero-cta
                      to="/contact"
                      className={`${homeSecondaryButtonClass} justify-center shrink-0 min-w-[206px] px-6 sm:w-auto sm:min-w-[210px] sm:px-7`}
                      style={{ fontFamily: '"Manrope", "Hubot Sans", sans-serif' }}
                    >
                      <span className={homeButtonHighlightClass} />
                      <span className={homeButtonSheenClass} />
                      <span className="relative z-[1]">
                        Nâng cấp làn da của bạn
                      </span>
                    </Link>
                  </div>
                </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FramerHeroSection;
