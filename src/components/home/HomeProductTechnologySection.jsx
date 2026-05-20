'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import dynamic from 'next/dynamic';
import ScrollRevealHeading from './ScrollRevealHeading.jsx';
import {
  homeButtonHighlightClass,
  homeButtonSheenClass,
  homePrimaryButtonClass,
  homeSecondaryButtonClass,
} from './homeCtaStyles.js';

gsap.registerPlugin(ScrollTrigger);

const Grainient = dynamic(() => import('./Grainient.jsx'), { ssr: false });

const technologySlides = Array.from({ length: 6 }, (_, index) => ({
  id: `technology-${index + 1}`,
  image: `/assets/images/home/${encodeURIComponent(`4.congnghe ${index + 1}.webp`)}`,
  alt: `Cong nghe SRX ${index + 1}`,
}));

function getSlidesPerView(width) {
  if (width >= 1024) {
    return 3;
  }

  if (width >= 640) {
    return 2;
  }

  return 1;
}

export default function HomeProductTechnologySection() {
  const sectionRef = useRef(null);
  const slideRefs = useRef([]);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [slidesPerView, setSlidesPerView] = useState(1);
  const [translateX, setTranslateX] = useState(0);

  const maxIndex = Math.max(technologySlides.length - slidesPerView, 0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const isMobile = window.matchMedia('(max-width: 767px)').matches;

      gsap.from('[data-tech-intro]', {
        opacity: 0,
        y: isMobile ? 0 : 36,
        duration: isMobile ? 0.65 : 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 78%',
        },
      });

      gsap.from('[data-tech-slider]', {
        opacity: 0,
        y: isMobile ? 0 : 42,
        duration: isMobile ? 0.65 : 0.85,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 72%',
        },
      });

      gsap.from('[data-tech-cta]', {
        opacity: 0,
        y: isMobile ? 0 : 24,
        duration: isMobile ? 0.55 : 0.7,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 66%',
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const updateSlidesPerView = () => {
      setSlidesPerView(getSlidesPerView(window.innerWidth));
    };

    updateSlidesPerView();
    window.addEventListener('resize', updateSlidesPerView);

    return () => {
      window.removeEventListener('resize', updateSlidesPerView);
    };
  }, []);

  useEffect(() => {
    setCurrentIndex((previousIndex) => Math.min(previousIndex, maxIndex));
  }, [maxIndex]);

  useEffect(() => {
    const updateTranslateX = () => {
      const activeSlide = slideRefs.current[currentIndex];
      setTranslateX(activeSlide ? activeSlide.offsetLeft : 0);
    };

    updateTranslateX();
    window.addEventListener('resize', updateTranslateX);

    return () => {
      window.removeEventListener('resize', updateTranslateX);
    };
  }, [currentIndex, slidesPerView]);

  useEffect(() => {
    if (isPaused || technologySlides.length <= slidesPerView) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setCurrentIndex((previousIndex) => (previousIndex >= maxIndex ? 0 : previousIndex + 1));
    }, 4200);

    return () => window.clearInterval(intervalId);
  }, [isPaused, slidesPerView, maxIndex]);

  const goToSlide = (nextIndex) => {
    if (nextIndex < 0) {
      setCurrentIndex(maxIndex);
      return;
    }

    if (nextIndex > maxIndex) {
      setCurrentIndex(0);
      return;
    }

    setCurrentIndex(nextIndex);
  };

  const handleTouchStart = (event) => {
    touchStartX.current = event.targetTouches[0].clientX;
    touchEndX.current = event.targetTouches[0].clientX;
  };

  const handleTouchMove = (event) => {
    touchEndX.current = event.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const distance = touchStartX.current - touchEndX.current;

    if (distance > 50) {
      goToSlide(currentIndex + 1);
    }

    if (distance < -50) {
      goToSlide(currentIndex - 1);
    }
  };

  return (
    <section ref={sectionRef} className="relative">
      <Grainient
        className="bg-[#050505] px-4 py-8 sm:px-6 lg:px-8 lg:py-24"
        color1="#7C93F1"
        color2="#F6BFDF"
        color3="#B497CF"
        timeSpeed={1.85}
        colorBalance={0}
        warpStrength={1}
        warpFrequency={5}
        warpSpeed={2}
        warpAmplitude={50}
        blendAngle={0}
        blendSoftness={0.05}
        rotationAmount={500}
        noiseScale={2}
        grainAmount={0.1}
        grainScale={2}
        grainAnimated={false}
        contrast={1.5}
        gamma={1}
        saturation={1}
        centerX={0}
        centerY={0}
        zoom={0.9}
      >
        <div className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(180deg,rgba(5,5,5,0.1),rgba(5,5,5,0.12)_38%,rgba(5,5,5,0.24)_100%)]" />

        <div className="relative z-10 mx-auto max-w-[1920px]">
          <div className="flex flex-col items-center gap-10 lg:gap-14">
            <div data-tech-intro className="w-full max-w-[1440px]">
              <div className="mt-4 text-center">
                <ScrollRevealHeading
                  as="h2"
                  className="mx-auto mt-4 max-w-[780px] text-[32px] font-medium leading-[1.3] tracking-[-0.05em] sm:text-[42px] lg:text-[62px]"
                  revealedClassName="text-[#fff]"
                  baseStyle={{ color: 'rgba(255,255,255,0.22)' }}
                  style={{ fontFamily: '"Manrope", "Hubot Sans", sans-serif' }}
                >
                  Công nghệ sản phẩm
                </ScrollRevealHeading>
              </div>
            </div>

            <div data-tech-slider className="w-full max-w-[1840px]">
              <div className="mb-5 flex items-center justify-between gap-4 sm:mb-6">
                <p
                  className="text-[14px] tracking-[0.18em] text-white sm:text-[15px]"
                  style={{ fontFamily: '"Inter", "Hubot Sans", sans-serif' }}
                >
                  {String(currentIndex + 1).padStart(2, '0')} - {String(technologySlides.length).padStart(2, '0')}
                </p>

                <div className="flex items-center gap-3 text-white">
                  <button
                    type="button"
                    onClick={() => goToSlide(currentIndex - 1)}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white bg-white/12 transition-colors duration-300 hover:bg-white/30"
                    aria-label="Slide truoc"
                  >
                    <ArrowLeft className="h-5 w-5 stroke-[1.5]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => goToSlide(currentIndex + 1)}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white bg-white/12 transition-colors duration-300 hover:bg-white/30"
                    aria-label="Slide tiep theo"
                  >
                    <ArrowRight className="h-5 w-5 stroke-[1.5]" />
                  </button>
                </div>
              </div>

              <div
                className="overflow-hidden"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{ touchAction: 'pan-y' }}
              >
                <div
                  className="flex gap-5 transition-transform duration-700 ease-out will-change-transform"
                  style={{ transform: `translateX(-${translateX}px)` }}
                >
                  {technologySlides.map((slide, index) => (
                    <article
                      key={slide.id}
                      ref={(element) => {
                        slideRefs.current[index] = element;
                      }}
                      className="group relative aspect-[4/5] min-w-full overflow-hidden bg-[#050505] shadow-[0_30px_80px_rgba(11,16,40,0.12)] sm:min-w-[calc((100%-1.25rem)/2)] lg:min-w-[calc((100%-2.5rem)/3)]"
                    >
                      <img
                        src={slide.image}
                        alt={slide.alt}
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        loading={index < 3 ? 'eager' : 'lazy'}
                      />

                      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.06),rgba(0,0,0,0)_45%,rgba(0,0,0,0.12)_100%)]" />
                      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),rgba(255,255,255,0)_34%)]" />
                    </article>
                  ))}
                </div>
              </div>

              <div className="mt-5 flex justify-center gap-2.5 sm:mt-6">
                {Array.from({ length: maxIndex + 1 }, (_, index) => (
                  <button
                    key={`technology-dot-${index}`}
                    type="button"
                    onClick={() => goToSlide(index)}
                    className={`h-2.5 rounded-full border border-white/40 transition-all duration-300 ${
                      index === currentIndex ? 'w-8 bg-white' : 'w-2.5 bg-white/25'
                    }`}
                    aria-label={`Di toi slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            <div data-tech-cta className="mt-4 flex w-full justify-center sm:mt-12">
              <div className="flex w-full max-w-[460px] justify-center gap-3 sm:w-auto sm:max-w-none sm:gap-[18px]">
                <Link
                  href="/products"
                  className={`${homePrimaryButtonClass} min-w-[118px] shrink-0 justify-center sm:w-auto`}
                  style={{ fontFamily: '"Manrope", "Hubot Sans", sans-serif' }}
                >
                  <span className={homeButtonHighlightClass} />
                  <span className={homeButtonSheenClass} />
                  <span className="relative z-[1]">Khám phá ngay</span>
                </Link>

                <Link
                  href="/contact"
                  className={`${homeSecondaryButtonClass} min-w-[210px] shrink-0 justify-center px-6 sm:w-auto sm:px-7`}
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
      </Grainient>
    </section>
  );
}
