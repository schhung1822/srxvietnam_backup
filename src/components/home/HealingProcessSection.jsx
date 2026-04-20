'use client';

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ScrollRevealHeading from "./ScrollRevealHeading.jsx";

gsap.registerPlugin(ScrollTrigger);

const defaultSlides = [
  {
    id: "reduce-inflammation",
    stageLabel: "Giai đoạn 1 - Giảm viêm",
    title: "Giảm viêm",
    description:
      "Đây là thời điểm da tập trung tái sinh các tế bào mới và sửa chữa tế bào hư tổn. Các hoạt chất sinh học tiên tiến như Copper Tripeptide-1 đóng vai trò thúc đẩy mạnh mẽ tốc độ lành vết thương, ổn định lại mô liên kết và ngăn ngừa việc hình thành sẹo. Bên cạnh đó, quá trình này cũng kích thích tăng sinh Collagen và Elastin, hỗ trợ sửa chữa DNA và giúp tăng tốc độ tái sinh các biểu mô mới trên bề mặt da.",
    media: {
      type: "video",
      src: "/assets/images/home/giamvien.mp4",
      alt: "Giai đoạn giảm viêm",
    },
  },
  {
    id: "cell-regeneration",
    stageLabel: "Giai đoạn 2 - Tăng Sinh",
    title: "Tăng sinh",
    description:
      "Khi da bước vào pha tăng sinh, collagen và elastin được kích hoạt đều hơn để củng cố cấu trúc nền. Đây là giai đoạn phù hợp để thúc đẩy tái tạo bề mặt, cải thiện độ đàn hồi và giúp làn da lấy lại độ căng khỏe tự nhiên.",
    media: {
      type: "image",
      src: "/assets/images/home/tangsinh.avif",
      poster: "/assets/images/home/tangsinh.avif",
    },
  },
  {
    id: "skin-remodeling",
    stageLabel: "Giai đoạn 3 - Tái tạo",
    title: "Tái tạo",
    description:
      "Ở giai đoạn cuối, mô da được sắp xếp ổn định hơn, bề mặt trở nên mịn và đều màu hơn. Quá trình tái tạo này giúp hạn chế dấu vết sau tổn thương, tăng độ săn chắc và duy trì trạng thái phục hồi bền vững cho da.",
    media: {
      type: "video",
      src: "/assets/images/home/taitao.mp4",
      alt: "Giai đoạn tái tạo",
    },
  },
];

function SlideMedia({ slide, index, isActive, videoRefs }) {
  if (slide.media.type === "video") {
    return (
      <video
        ref={(element) => {
          videoRefs.current[index] = element;
        }}
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay={isActive}
        muted
        loop
        playsInline
        preload="metadata"
        poster={slide.media.poster}
      >
        <source src={slide.media.src} />
      </video>
    );
  }

  return (
    <img
      src={slide.media.src}
      alt={slide.media.alt ?? slide.title}
      className="absolute inset-0 h-full w-full object-cover"
      loading={index === 0 ? "eager" : "lazy"}
    />
  );
}

export default function HealingProcessSection({
  title = "Quá trình\nlành thương\ncủa da",
  slides = defaultSlides,
}) {
  const sectionRef = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const videoRefs = useRef([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const media = gsap.matchMedia();

      media.add("(max-width: 1023px)", () => {
        gsap.from("[data-healing-intro]", {
          opacity: 0,
          duration: 0.7,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
          },
        });

        gsap.from("[data-healing-panel]", {
          opacity: 0,
          duration: 0.7,
          delay: 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 78%",
          },
        });
      });

      media.add("(min-width: 1024px)", () => {
        gsap.from("[data-healing-intro]", {
          opacity: 0,
          y: 42,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
          },
        });

        gsap.from("[data-healing-panel]", {
          opacity: 0,
          x: 54,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 72%",
          },
        });
      });

      return () => media.revert();
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) {
        return;
      }

      if (index === currentIndex) {
        const playback = video.play();

        if (playback && typeof playback.catch === "function") {
          playback.catch(() => {});
        }
      } else {
        video.pause();
      }
    });
  }, [currentIndex]);

  const goToSlide = (nextIndex) => {
    if (nextIndex < 0) {
      setCurrentIndex(slides.length - 1);
      return;
    }

    if (nextIndex >= slides.length) {
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
    <section
      ref={sectionRef}
      className="bg-white px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24"
    >
      <div className="mx-auto grid max-w-[1800px] gap-8 sm:gap-10 lg:grid-cols-2 lg:gap-8">
        <div
          data-healing-intro
          className="flex w-full flex-col gap-8 sm:gap-10 lg:min-h-[760px] lg:justify-between"
        >
          <div>
            <ScrollRevealHeading
              as="h2"
              className="text-[38px] font-medium leading-[0.98] tracking-[-0.05em] sm:text-[52px] lg:text-[74px]"
              revealedClassName="text-[#6e96fb]"
              baseStyle={{ color: 'rgba(110,150,251,0.18)' }}
              style={{ fontFamily: '"Manrope", "Hubot Sans", sans-serif' }}
            >
              {title}
            </ScrollRevealHeading>
          </div>

          <div className="flex items-end justify-between gap-4 sm:gap-8">
            <div className="min-w-0 flex-1 space-y-0.5 sm:space-y-1">
              {slides.map((slide, index) => {
                const isActive = index === currentIndex;

                return (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => goToSlide(index)}
                    className={`block text-left text-[14px] leading-[1.7] tracking-[-0.02em] transition-colors duration-300 sm:text-[16px] ${
                      isActive ? "text-[#ff5be2]" : "text-[#7f7f7f]"
                    }`}
                    style={{ fontFamily: '"Inter", "Hubot Sans", sans-serif' }}
                  >
                    {slide.stageLabel}
                  </button>
                );
              })}
            </div>

            <div className="flex shrink-0 items-center gap-2 text-[#202020] sm:gap-3">
              <button
                type="button"
                onClick={() => goToSlide(currentIndex - 1)}
                className="flex h-10 w-10 items-center justify-center transition-opacity duration-300 hover:opacity-65 sm:h-12 sm:w-12"
                aria-label="Slide trước"
              >
                <ArrowLeft className="h-6 w-6 stroke-[1.4] sm:h-8 sm:w-8" />
              </button>

              <button
                type="button"
                onClick={() => goToSlide(currentIndex + 1)}
                className="flex h-10 w-10 items-center justify-center transition-opacity duration-300 hover:opacity-65 sm:h-12 sm:w-12"
                aria-label="Slide tiếp theo"
              >
                <ArrowRight className="h-6 w-6 stroke-[1.4] sm:h-8 sm:w-8" />
              </button>
            </div>
          </div>
        </div>

        <div
          data-healing-panel
          className="relative w-full overflow-hidden rounded-[24px] bg-[#eff3ff] bg-cover bg-center bg-no-repeat p-4 shadow-[0_24px_70px_rgba(177,184,246,0.18)] sm:rounded-[28px] sm:p-8 lg:px-12 lg:py-16"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            touchAction: "pan-y",
            backgroundImage:
              "url('/assets/images/home/background_hero.webp')",
          }}
        >
          <div className="relative grid">
            {slides.map((slide, index) => {
              const isActive = index === currentIndex;

              return (
                <article
                  key={slide.id}
                  className={`col-start-1 row-start-1 transition-opacity duration-500 ease-out ${
                    isActive
                      ? "relative z-10 opacity-100"
                      : "pointer-events-none z-0 opacity-0"
                  }`}
                  aria-hidden={!isActive}
                >
                  <div className="flex flex-col items-start">
                    <p
                      className="text-[15px] font-normal tracking-[-0.02em] text-[#303030] sm:text-[17px]"
                      style={{ fontFamily: '"Aeonik TRIAL Regular", "Manrope", sans-serif' }}
                    >
                      /{String(index + 1).padStart(2, "0")}
                    </p>

                    <div
                      className="relative mt-3 w-full shrink-0 overflow-hidden bg-white/30 sm:mt-4"
                      style={{ aspectRatio: "5 / 4" }}
                    >
                      <SlideMedia
                        slide={slide}
                        index={index}
                        isActive={isActive}
                        videoRefs={videoRefs}
                      />
                    </div>

                    <div className="mt-4 w-full sm:mt-6">
                      <h3
                        className="text-[24px] font-bold tracking-[-0.03em] text-[#151515] sm:text-[28px] lg:text-[31px]"
                        style={{ fontFamily: '"Inter", "Hubot Sans", sans-serif' }}
                      >
                        {slide.title}
                      </h3>

                      <p
                        className="mt-3 w-full text-[14px] leading-[1.65] text-[#5f5f5f] sm:mt-4 sm:text-[15px]"
                        style={{ fontFamily: '"Inter", "Hubot Sans", sans-serif' }}
                      >
                        {slide.description}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
