'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Manrope } from 'next/font/google';
import gsap from 'gsap';
import {
  homePrimaryButtonClass,
  homeSecondaryButtonClass,
} from './homeCtaStyles.js';
import styles from './FramerHeroSection.module.css';

const Topography = dynamic(() => import('./Topography.jsx'), {
  ssr: false,
});

const heroLegacyHeadingFont = Manrope({
  subsets: ['latin', 'vietnamese'],
  weight: ['500'],
  display: 'swap',
});

const HERO_ASSETS = {
  backgroundVideo: '/assets/images/home/video_bh_hero.mp4',
  mobileBackgroundImage: '/assets/images/home/background_hero_mobile.webp',
  infinityArtwork: '/assets/images/home/SRX_3D.webp',
  mobileInfinityArtwork: '/assets/images/home/SRX_3D_mobile.webp',
  titlePillFrame: '/assets/images/home/khoahoctrilieu_bg.webp',
  mobileTitlePillFrame: '/assets/images/home/khoahoctrilieu_bg_mobile.webp',
};

const heroCards = [
  {
    text: 'SRX Tiên phong tích hợp công nghệ tiên tiến nhất trong nghiên cứu và phát triển sản phẩm chăm da',
    desktopClass:
      'lg:absolute lg:left-4 lg:top-[43%] lg:w-[634px] lg:max-w-[calc(100vw-32px)] lg:px-[42px] lg:py-[44px] xl:left-[-4%] 2xl:left-[-10%]',
  },
  {
    text: 'SRX là thương hiệu dược mỹ phẩm cao cấp đến từ Hàn Quốc, chính thức ra đời vào năm 2005. Trải qua nhiều năm phát triển, SRX đã tạo được tiếng vang lớn không chỉ tại Hàn Quốc mà còn vươn ra thị trường quốc tế, có mặt ở các quốc gia lớn như Mỹ, Đức, Pháp, và hiện tại là Việt Nam.',
    desktopClass:
      'lg:absolute lg:right-4 lg:bottom-[-40%] lg:w-[686px] lg:max-w-[calc(100vw-32px)] lg:px-[54px] lg:py-[58px] xl:right-[-4%] 2xl:right-[-10%]',
    boldLead: 'SRX',
  },
];

const FramerHeroSection = () => {
  const sectionRef = useRef(null);
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const updateViewport = () => setIsMobileViewport(mediaQuery.matches);

    updateViewport();
    mediaQuery.addEventListener('change', updateViewport);

    return () => mediaQuery.removeEventListener('change', updateViewport);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const selector = gsap.utils.selector(sectionRef);
      const backgroundNodes = selector('[data-hero-bg]');
      const artworkNodes = selector('[data-hero-art]');
      const badgeNodes = selector('[data-hero-badge]');
      const titlePartNodes = selector('[data-hero-title-part]');
      const titlePillNodes = selector('[data-hero-title-pill]');
      const cardNodes = selector('[data-hero-card]');
      const titlePill = titlePillNodes[0];
      const timeline = gsap.timeline({
        defaults: {
          ease: 'power3.out',
        },
      });
      const titlePillLoop = gsap.timeline({
        paused: true,
        repeat: -1,
        repeatDelay: 0.12,
        defaults: {
          ease: 'sine.inOut',
        },
      });

      if (titlePill) {
        gsap.set(titlePill, {
          transformPerspective: 900,
          transformOrigin: '50% 50%',
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

      if (backgroundNodes.length) {
        timeline.from(backgroundNodes, {
          opacity: 0,
          duration: 1.1,
        });
      }

      if (artworkNodes.length) {
        timeline.from(
          artworkNodes,
          {
            opacity: 0,
            scale: 0.96,
            rotate: -14,
            duration: 1.2,
          },
          '-=0.85',
        );
      }

      if (badgeNodes.length) {
        timeline.from(
          badgeNodes,
          {
            opacity: 0,
            y: 18,
            duration: 0.6,
          },
          '-=0.5',
        );
      }

      if (titlePartNodes.length) {
        timeline.from(
          titlePartNodes,
          {
            opacity: 0,
            y: 30,
            duration: 0.8,
            stagger: 0.08,
          },
          '-=0.3',
        );
      }

      if (titlePillNodes.length) {
        timeline.from(
          titlePillNodes,
          {
            opacity: 0,
            y: 70,
            rotateY: -70,
            transformOrigin: '50% 50%',
            duration: 1,
          },
          '-=0.65',
        );
      }

      if (cardNodes.length) {
        timeline.from(
          cardNodes,
          {
            opacity: 0,
            y: 12,
            duration: 0.7,
            stagger: 0.12,
          },
          '-=0.3',
        );
      }

      if (titlePill) {
        timeline.add(() => titlePillLoop.play(0));
      }

      if (artworkNodes.length) {
        gsap.to(artworkNodes, {
          y: 16,
          rotate: -8,
          duration: 7,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[#f8f9fa] md:bg-[#f1f2f9]"
    >
      <div className="absolute inset-0" data-hero-bg>
        {isMobileViewport ? (
          <Topography
            lowColor="#AEB0FE"
            midColor="#e3cbfa"
            highColor="#F5F2FD"
            speed={0.2}
            morphAmount={2}
            morphSpeed={0.19}
            bands={1.5}
            thickness={0.25}
            scale={4}
            pixelSize={1}
            glow={1.05}
            colorMode="elevation"
            contrast={0.2}
            brightness={0.95}
            fillBands
            opacity={1}
            grain={false}
            grainIntensity={0}
            mouseInteraction={false}
            mouseRadius={0.52}
            mouseStrength={1.4}
            className="pointer-events-none absolute inset-0 bg-[#f8f9fa]"
          />
        ) : (
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster={HERO_ASSETS.mobileBackgroundImage}
            controls={false}
            disablePictureInPicture
            controlsList="nodownload nofullscreen noremoteplayback"
            tabIndex={-1}
            aria-hidden="true"
            onContextMenu={(event) => event.preventDefault()}
            className="pointer-events-none absolute inset-0 hidden h-full w-full object-cover opacity-[0.81] [filter:saturate(0.88)] md:block"
          >
            <source
              src={HERO_ASSETS.backgroundVideo}
              type="video/mp4"
              media="(min-width: 768px)"
            />
          </video>
        )}
      </div>

      <div className="relative mx-auto min-h-[620px] max-w-[1920px] px-4 pb-14 pt-6 sm:min-h-[760px] sm:px-6 sm:pb-16 sm:pt-8 lg:min-h-[1334px] lg:px-0 lg:pb-20">
        <div
          data-hero-art
          className="pointer-events-none absolute left-1/2 top-[180px] z-[1] h-[300px] w-[165%] max-w-none -translate-x-1/2 rotate-[-10deg] sm:top-[260px] sm:h-[420px] sm:w-[145%] lg:top-[292px] lg:h-[1000px] lg:w-[2000px]"
        >
          <img
            src={HERO_ASSETS.infinityArtwork}
            srcSet={`${HERO_ASSETS.mobileInfinityArtwork} 800w, ${HERO_ASSETS.infinityArtwork} 2000w`}
            sizes="(max-width: 767px) 165vw, (max-width: 1023px) 145vw, 2000px"
            alt=""
            aria-hidden="true"
            width="2000"
            height="1428"
            loading="eager"
            decoding="async"
            className="h-full w-full scale-[1.025] object-contain"
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
                          src="/assets/images/home/badge-rocket.svg"
                          alt=""
                          width="16"
                          height="16"
                          decoding="async"
                          className="h-4 w-4 shrink-0"
                        />
                        <span>12K+</span>
                      </span>
                      <span className="text-center text-[11px] font-medium text-[#7584d6] sm:pr-4 sm:text-[11px]">
                        khách hàng đã tin dùng
                      </span>
                    </div>
                  </div>
                  <div />
                </div>

                <h1 className="flex w-full flex-wrap items-center justify-center lg:justify-start gap-2.5 sm:gap-3">
                  <span
                    data-hero-title-part
                    className="text-[30px] font-medium leading-none tracking-[-0.05em] text-[#7990f0] sm:text-[58px] lg:text-[80px]"
                    style={{ fontFamily: '"Manrope", "Hubot Sans", sans-serif' }}
                  >
                    Mang
                  </span>

                  <span
                    data-hero-title-pill
                    className={`${styles.titlePill} relative z-[4] inline-flex min-h-[58px] items-center justify-center px-7 py-3 sm:min-h-[94px] sm:px-10 sm:py-4 lg:min-h-[122px] lg:px-[46px] lg:py-[18px]`}
                  >
                    <img
                      src={HERO_ASSETS.titlePillFrame}
                      srcSet={`${HERO_ASSETS.mobileTitlePillFrame} 420w, ${HERO_ASSETS.titlePillFrame} 840w`}
                      sizes="(max-width: 767px) 280px, (max-width: 1023px) 480px, 620px"
                      alt=""
                      aria-hidden="true"
                      width="840"
                      height="165"
                      loading="eager"
                      decoding="async"
                      className="pointer-events-none absolute inset-0 h-full w-full object-fill drop-shadow-[0_18px_34px_rgba(114,113,221,0.26)] sm:drop-shadow-[0_22px_42px_rgba(114,113,221,0.3)]"
                    />

                    <span
                      data-hero-title-pill-text
                      className={`${heroLegacyHeadingFont.className} relative z-[1] text-[30px] font-medium leading-none tracking-[-0.05em] text-white [text-shadow:0_2px_10px_rgba(255,255,255,0.16)] sm:text-[58px] lg:text-[80px]`}
                    >
                      Khoa học trị liệu
                    </span>
                  </span>

                  <span
                    data-hero-title-part
                    className={`${heroLegacyHeadingFont.className} text-center text-[30px] font-medium leading-none tracking-[-0.05em] text-[#7990f0] sm:text-[58px] lg:text-[80px]`}
                  >
                    chạm đến làn da
                  </span>
                </h1>

                <div className="relative z-[5] hidden sm:block flex w-full flex-wrap items-start justify-start px-0 pt-6 sm:px-1 sm:pt-8">
                  <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:gap-[18px]">
                    <Link
                      data-hero-cta
                      href="/about"
                      className={`${homePrimaryButtonClass} ${styles.cta} w-full justify-center shrink-0 min-w-[116px] sm:w-auto sm:min-w-[118px]`}
                      style={{ fontFamily: '"Manrope", "Hubot Sans", sans-serif' }}
                    >
                      <span className="relative z-[1]">Khám phá ngay</span>
                    </Link>

                    <Link
                      data-hero-cta
                      href="/products"
                      className={`${homeSecondaryButtonClass} ${styles.cta} w-full justify-center shrink-0 min-w-[206px] px-6 sm:w-auto sm:min-w-[210px] sm:px-7`}
                      style={{ fontFamily: '"Manrope", "Hubot Sans", sans-serif' }}
                    >
                      <span className="relative z-[1]">
                        Nâng cấp làn da của bạn
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative mt-[240px] grid gap-3 px-0 sm:mt-[240px] sm:grid-cols-2 sm:gap-4 sm:px-2 lg:mt-0 lg:block lg:min-h-[520px] lg:w-[100%] lg:px-0">
              {heroCards.map((card, index) => (
                <div
                  key={card.text}
                  data-hero-card
                  className={`${styles.card} ${index % 2 === 0 ? styles.cardGlowLeft : styles.cardGlowRight} relative isolate overflow-hidden rounded-[32px] border border-white/45 bg-[linear-gradient(180deg,rgba(255,255,255,0.52),rgba(255,255,255,0.34)_42%,rgba(244,247,255,0.28)_100%)] px-6 py-7 shadow-[0_14px_34px_rgba(134,147,219,0.12),0_28px_52px_rgba(166,179,233,0.08),inset_0_1px_0_rgba(255,255,255,0.72)] backdrop-blur-[10px] sm:rounded-[56px] sm:px-5 sm:py-8 lg:rounded-[146px] ${card.desktopClass}`}
                >
                  <p
                    className="relative z-[1] mx-auto w-full max-w-[488px] break-words text-center text-[14px] leading-[1.5] tracking-[-0.01em] text-[#465478] sm:text-[17px] lg:text-[20px]"
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
                  href="/products"
                  className={`${homePrimaryButtonClass} ${styles.cta} justify-center shrink-0 min-w-[116px] sm:w-auto sm:min-w-[118px]`}
                  style={{ fontFamily: '"Manrope", "Hubot Sans", sans-serif' }}
                >
                  <span className="relative z-[1]">Khám phá ngay</span>
                </Link>

                <Link
                  data-hero-cta
                  href="/contact"
                  className={`${homeSecondaryButtonClass} ${styles.cta} justify-center shrink-0 min-w-[206px] px-6 sm:w-auto sm:min-w-[210px] sm:px-7`}
                  style={{ fontFamily: '"Manrope", "Hubot Sans", sans-serif' }}
                >
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
