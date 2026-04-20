'use client';

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Pause, Play } from "lucide-react";
import ScrollRevealHeading from "./ScrollRevealHeading.jsx";
import {
  homeButtonHighlightClass,
  homeButtonSheenClass,
  homePrimaryButtonClass,
  homeSecondaryButtonClass,
} from "./homeCtaStyles.js";

const defaultSlides = [
  {
    id: "retinol-cream-peptides",
    image: "/assets/images/home/sl1.webp",
    date: "06/07/2026",
    title: "Phức hợp 30 loại Peptides trong Retinol A Cream có tác dụng gì?",
    description:
      "Tổng hợp cơ chế hỗ trợ phục hồi, củng cố hàng rào bảo vệ da và lý do công thức peptide của SRX phù hợp cho giai đoạn tái tạo chuyên sâu.",
    href: "#",
  },
  {
    id: "retinol-8-benefits",
    image: "/assets/images/home/sl2.webp",
    date: "03/07/2025",
    title: "Phức hợp Retinol 8% của SRX có gì đặc biệt?",
    description:
      "Giải thích cách SRX cân bằng hiệu quả đổi mới bề mặt da với độ êm ái cần thiết để tối ưu trải nghiệm sử dụng dài hạn.",
    href: "#",
  },
  {
    id: "repair-ampoule-routine-1",
    image: "/assets/images/home/sl3.webp",
    date: "15/01/2024",
    title: "Phác đồ kết hợp Retinol và Repair Ampoule của SRX",
    description:
      "Một routine kết hợp giúp làm dịu, phục hồi và hỗ trợ làn da ổn định hơn trong quá trình treatment cường độ cao.",
    href: "#",
  },
  {
    id: "repair-ampoule-routine-2",
    image: "/assets/images/home/sl4.webp",
    date: "15/01/2024",
    title: "Phác đồ kết hợp Retinol và Repair Ampoule của SRX",
    description:
      "Một routine kết hợp giúp làm dịu, phục hồi và hỗ trợ làn da ổn định hơn trong quá trình treatment cường độ cao.",
    href: "#",
  },
  {
    id: "repair-ampoule-routine-3",
    image: "/assets/images/home/sl5.webp",
    date: "15/01/2024",
    title: "Phác đồ kết hợp Retinol và Repair Ampoule của SRX",
    description:
      "Một routine kết hợp giúp làm dịu, phục hồi và hỗ trợ làn da ổn định hơn trong quá trình treatment cường độ cao.",
    href: "#",
  },
];

function getSegmentProgress(segmentIndex, currentIndex, currentProgress) {
  if (segmentIndex < currentIndex) {
    return 100;
  }

  if (segmentIndex > currentIndex) {
    return 0;
  }

  return currentProgress * 100;
}

export default function ClinicalProofSection({
  title = "Chứng minh\nlâm sàng",
  description = "Là quá trình nghiên cứu, thử nghiệm công phu trên người bệnh thực tế để xác nhận hiệu quả và độ an toàn của sản phẩm, phương pháp điều trị, hoặc sản phẩm y tế. Đây là tiêu chuẩn vàng giúp phân biệt sản phẩm uy tín với quảng cáo, đảm bảo mang lại kết quả thực tế.",
  primaryCta = { label: "Khám phá ngay", href: "#" },
  secondaryCta = { label: "Nâng cấp làn da của bạn", href: "#" },
  slides = defaultSlides,
  slideDurationMs = 5200,
}) {
  const safeSlides = slides.length > 0 ? slides : defaultSlides;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);
  const frameRef = useRef(null);
  const lastTimestampRef = useRef(null);
  const elapsedRef = useRef(0);
  const currentIndexRef = useRef(0);

  const isTimerStopped = isHovered || isManuallyPaused;

  const activeSlide = safeSlides[currentIndex];

  const goToSlide = (nextIndex) => {
    const total = safeSlides.length;
    const resolvedIndex = ((nextIndex % total) + total) % total;

    currentIndexRef.current = resolvedIndex;
    elapsedRef.current = 0;
    lastTimestampRef.current = null;
    setCurrentProgress(0);
    setCurrentIndex(resolvedIndex);
  };

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    if (safeSlides.length <= 1) {
      setCurrentProgress(1);
      return undefined;
    }

    if (isTimerStopped) {
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }

      lastTimestampRef.current = null;
      return undefined;
    }

    const tick = (timestamp) => {
      if (lastTimestampRef.current === null) {
        lastTimestampRef.current = timestamp;
        frameRef.current = window.requestAnimationFrame(tick);
        return;
      }

      const rawDelta = timestamp - lastTimestampRef.current;
      const delta = Math.min(rawDelta, 80);
      lastTimestampRef.current = timestamp;

      let nextElapsed = elapsedRef.current + delta;
      let nextIndex = currentIndexRef.current;

      while (nextElapsed >= slideDurationMs) {
        nextElapsed -= slideDurationMs;
        nextIndex = (nextIndex + 1) % safeSlides.length;
      }

      elapsedRef.current = nextElapsed;

      if (nextIndex !== currentIndexRef.current) {
        currentIndexRef.current = nextIndex;
        setCurrentIndex(nextIndex);
      }

      setCurrentProgress(nextElapsed / slideDurationMs);
      frameRef.current = window.requestAnimationFrame(tick);
    };

    frameRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [isTimerStopped, safeSlides.length, slideDurationMs]);

  return (
    <section className="bg-white px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
      <div className="mx-auto grid max-w-[1800px] gap-10 sm:gap-12 lg:grid-cols-[minmax(320px,0.92fr)_minmax(420px,1fr)] lg:items-stretch lg:gap-20">
        <div className="flex flex-col justify-between gap-8 sm:gap-12">
          <div className="max-w-[520px]">
            <ScrollRevealHeading
              as="h2"
              className="text-[40px] font-medium leading-[1.3] tracking-[-0.06em] sm:text-[56px] lg:text-[84px]"
              revealedClassName="bg-gradient-to-r from-[#ff9dd7] via-[#b59bff] to-[#6e96fb] bg-clip-text text-transparent"
              baseStyle={{ color: 'rgba(198,173,248,0.28)' }}
              blurPx={10}
              style={{ fontFamily: '"Manrope", "Hubot Sans", sans-serif' }}
            >
              {title}
            </ScrollRevealHeading>
          </div>

          <div className="max-w-[540px] space-y-6 sm:space-y-8">
            <p
              className="text-[16px] leading-[1.65] text-[#242424] sm:text-[17px] lg:text-[18px]"
              style={{ fontFamily: '"Inter", "Hubot Sans", sans-serif' }}
            >
              {description}
            </p>

            <div className="flex justify-center sm:justify-start gap-4 sm:gap-[18px]">
              <a
                href={primaryCta.href}
                className={`${homePrimaryButtonClass} justify-center shrink-0 min-w-[116px] sm:w-auto min-w-[118px]`}
                style={{ fontFamily: '"Manrope", "Hubot Sans", sans-serif' }}
              >
                <span className={homeButtonHighlightClass} />
                <span className={homeButtonSheenClass} />
                <span className="relative z-[1]">{primaryCta.label}</span>
              </a>

              <a
                href={secondaryCta.href}
                className={`${homeSecondaryButtonClass} justify-center shrink-0 px-6 sm:w-auto min-w-[210px] sm:px-7`}
                style={{ fontFamily: '"Manrope", "Hubot Sans", sans-serif' }}
              >
                <span className={homeButtonHighlightClass} />
                <span className={homeButtonSheenClass} />
                <span className="relative z-[1]">{secondaryCta.label}</span>
              </a>
            </div>
          </div>
        </div>

        <div
          className="relative overflow-hidden rounded-[22px] bg-[#1d0f13] shadow-[0_30px_90px_rgba(87,52,34,0.18)] sm:rounded-[28px]"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onFocusCapture={() => setIsHovered(true)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              setIsHovered(false);
            }
          }}
        >
          <div className="relative aspect-[4/5] sm:aspect-[1.02/1] lg:aspect-[1.08/1]">
            {safeSlides.map((slide, index) => {
              const isActive = index === currentIndex;

              return (
                <img
                  key={`${slide.id}-${index}`}
                  src={slide.image}
                  alt={slide.title}
                  className={`absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-700 ease-out ${
                    isActive ? "scale-100 opacity-100" : "scale-[1.02] opacity-0"
                  }`}
                  loading={index === 0 ? "eager" : "lazy"}
                  aria-hidden={!isActive}
                />
              );
            })}

            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,6,5,0.08),rgba(17,8,7,0.18)_24%,rgba(17,8,7,0.34)_56%,rgba(17,8,7,0.82)_100%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_38%)]" />

            <div className="absolute inset-x-0 top-0 z-30 p-4 sm:p-6 lg:p-7">
              <div className="flex items-center gap-2.5 sm:gap-3">
                {safeSlides.map((slide, index) => (
                  <button
                    key={`${slide.id}-progress-${index}`}
                    type="button"
                    onClick={() => goToSlide(index)}
                    className="group relative h-[4px] flex-1 overflow-hidden rounded-full bg-white/25 "
                    aria-label={`Đến slide ${index + 1}`}
                  >
                    <span
                      className="absolute inset-y-0 left-0 rounded-full bg-white transition-[width] duration-100 ease-linear"
                      style={{
                        width: `${getSegmentProgress(index, currentIndex, currentProgress)}%`,
                      }}
                    />
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => {
                    lastTimestampRef.current = null;
                    setIsManuallyPaused((previousValue) => !previousValue);
                  }}
                  className="ml-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black/28 text-white backdrop-blur-sm transition-colors duration-300 hover:bg-black/42 sm:h-8 sm:w-8"
                  aria-label={isManuallyPaused ? "Tiếp tục slider" : "Tạm dừng slider"}
                  aria-pressed={isManuallyPaused}
                >
                  {isManuallyPaused ? (
                    <Play className="h-3 w-3 translate-x-[1px] sm:h-3.5 sm:w-3.5" strokeWidth={2.25} />
                  ) : (
                    <Pause className="h-3 w-3 sm:h-3.5 sm:w-3.5" strokeWidth={2.25} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => goToSlide(currentIndex - 1)}
              className="absolute left-3 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/22 text-white backdrop-blur-sm transition-colors duration-300 hover:bg-black/34 sm:left-4 sm:h-11 sm:w-11"
              aria-label="Slide trước"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={() => goToSlide(currentIndex + 1)}
              className="absolute right-3 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/22 text-white backdrop-blur-sm transition-colors duration-300 hover:bg-black/34 sm:right-4 sm:h-11 sm:w-11"
              aria-label="Slide tiếp theo"
            >
              <ArrowRight className="h-5 w-5" />
            </button>

            <div className="absolute inset-x-0 bottom-0 z-30 p-4 sm:p-6 lg:p-7">
              <a
                href={activeSlide.href}
                className="block transition-transform duration-300 hover:-translate-y-0.5"
              >
                <p
                  className="text-[12px] font-medium uppercase tracking-[0.08em] text-white sm:text-[14px]"
                  style={{ fontFamily: '"Inter", "Hubot Sans", sans-serif' }}
                >
                  {activeSlide.date}
                </p>

                <div className="mt-3 flex items-start justify-between gap-4 sm:gap-8">
                  <div className="min-w-0">
                    <h3
                      className="text-[22px] font-semibold leading-[1.08] tracking-[-0.04em] text-white sm:text-[28px] lg:text-[34px]"
                      style={{ fontFamily: '"Inter", "Hubot Sans", sans-serif' }}
                    >
                      {activeSlide.title}
                    </h3>

                    <p
                      className="mt-3 max-w-full text-[14px] leading-[1.65] text-white sm:max-w-[95%] sm:text-[15px] lg:text-[16px]"
                      style={{ fontFamily: '"Inter", "Hubot Sans", sans-serif' }}
                    >
                      {activeSlide.description}
                    </p>
                  </div>

                  <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white sm:h-11 sm:w-11">
                    <ArrowUpRight className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
