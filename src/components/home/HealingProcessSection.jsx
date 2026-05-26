'use client';

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ScrollRevealHeading from "./ScrollRevealHeading.jsx";

gsap.registerPlugin(ScrollTrigger);

const Grainient = dynamic(() => import("./Grainient.jsx"), { ssr: false });

const defaultSlides = [
  {
    id: "hemostasis",
    stageLabel: "Giai đoạn 1 - Cầm máu",
    title: "Cầm máu",
    description:
      "Ngay sau khi da bị tổn thương, cơ thể kích hoạt cơ chế co mạch và tạo cục máu đông nhằm ngăn mất máu. Lớp bảo vệ tạm thời này giúp che chắn vùng da tổn thương, hạn chế tác nhân bên ngoài và tạo nền tảng cho quá trình phục hồi tiếp theo.",
    media: {
      type: "image",
      src: "/assets/images/home/GD1.webp",
      poster: "/assets/images/home/GD1.webp",
    },
  },
  {
    id: "inflammation",
    stageLabel: "Giai đoạn 2 - Giảm viêm",
    title: "Giảm viêm",
    description:
      "Đây là thời điểm da tập trung tái sinh các tế bào mới và sửa chữa tế bào hư tổn. Các hoạt chất sinh học tiên tiến như Copper Tripeptide-1 đóng vai trò thúc đẩy mạnh mẽ tốc độ lành vết thương, ổn định lại mô liên kết và ngăn ngừa việc hình thành sẹo. Bên cạnh đó, quá trình này cũng kích thích tăng sinh Collagen và Elastin, hỗ trợ sửa chữa DNA và giúp tăng tốc độ tái sinh các biểu mô mới trên bề mặt da.",
    media: {
      type: "image",
      src: "/assets/images/home/GD2.webp",
      poster: "/assets/images/home/GD2.webp",
    },
  },
  {
    id: "proliferation",
    stageLabel: "Giai đoạn 3 - Tăng Sinh",
    title: "Tăng sinh",
    description:
      "Khi da bước vào pha tăng sinh, collagen và elastin được kích hoạt đều hơn để củng cố cấu trúc nền. Đây là giai đoạn phù hợp để thúc đẩy tái tạo bề mặt, cải thiện độ đàn hồi và giúp làn da lấy lại độ căng khỏe tự nhiên.",
    media: {
      type: "image",
      src: "/assets/images/home/GD3.webp",
      poster: "/assets/images/home/GD3.webp",
    },
  },
  {
    id: "remodeling",
    stageLabel: "Giai đoạn 4 - Tái tạo",
    title: "Tái tạo",
    description:
      "Ở giai đoạn cuối, mô da được sắp xếp ổn định hơn, bề mặt trở nên mịn và đều màu hơn. Quá trình tái tạo này giúp hạn chế dấu vết sau tổn thương, tăng độ săn chắc và duy trì trạng thái phục hồi bền vững cho da.",
    media: {
      type: "image",
      src: "/assets/images/home/GD4.webp",
      poster: "/assets/images/home/GD4.webp",
    },
  },
];

function SlideMedia({ slide, index, videoRefs }) {
  if (slide.media.type === "video") {
    return (
      <video
        ref={(element) => {
          videoRefs.current[index] = element;
        }}
        className="h-full w-full object-cover pointer-events-none"
        autoPlay
        muted
        loop
        playsInline
        webkit-playsinline="true"
        preload="metadata"
        poster={slide.media.poster}
        controls={false}
        disablePictureInPicture
        controlsList="nodownload nofullscreen noremoteplayback"
        tabIndex={-1}
        onContextMenu={(event) => event.preventDefault()}
      >
        <source src={slide.media.src} type="video/mp4" />
      </video>
    );
  }

  return (
    <img
      src={slide.media.src}
      alt={slide.media.alt ?? slide.title}
      className="h-full w-full object-cover"
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
    const selector = gsap.utils.selector(sectionRef);
    const mm = gsap.matchMedia();

    mm.add("(max-width: 767px)", () => {
      gsap.fromTo(
        selector("[data-healing-intro]"),
        { autoAlpha: 0 },
        {
          autoAlpha: 1,
          duration: 0.55,
          ease: "power2.out",
          clearProps: "opacity,visibility",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 82%",
          },
        },
      );

      gsap.fromTo(
        selector("[data-healing-panel]"),
        { autoAlpha: 0 },
        {
          autoAlpha: 1,
          duration: 0.6,
          ease: "power2.out",
          clearProps: "opacity,visibility",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 78%",
          },
        },
      );
    });

    mm.add("(min-width: 768px)", () => {
      gsap.from(selector("[data-healing-intro]"), {
        opacity: 0,
        y: 42,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
        },
      });

      gsap.from(selector("[data-healing-panel]"), {
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

    return () => mm.revert();
  }, []);

  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) {
        return;
      }

      if (index === currentIndex) {
        const playback = video.play();

        if (playback && typeof playback.catch === "function") {
          playback.catch(() => { });
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
      className="overflow-x-hidden bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
    >
      <div className="mx-auto grid max-w-[1800px] gap-10 lg:grid-cols-2 lg:gap-8">
        <div
          data-healing-intro
          className="flex w-full flex-col gap-10 lg:min-h-[760px] lg:justify-between"
        >
          <div>
            <h2
              className="whitespace-pre-line text-[48px] font-medium leading-[1] tracking-[-0.05em] text-[#6e96fb] md:hidden sm:text-[60px]"
              style={{ fontFamily: '"Manrope", "Hubot Sans", sans-serif' }}
            >
              {title}
            </h2>

            <ScrollRevealHeading
              as="h2"
              className="hidden text-[48px] font-medium leading-[1] tracking-[-0.05em] md:block sm:text-[60px] lg:text-[74px]"
              revealedClassName="text-[#6e96fb]"
              baseStyle={{ color: "rgba(110,150,251,0.18)" }}
              blurPx={4}
              start="top 90%"
              end="top 38%"
              style={{ fontFamily: '"Manrope", "Hubot Sans", sans-serif' }}
            >
              {title}
            </ScrollRevealHeading>
          </div>

          <div className="flex flex-row gap-8 items-end justify-between">
            <div className="space-y-1">
              {slides.map((slide, index) => {
                const isActive = index === currentIndex;

                return (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => goToSlide(index)}
                    className={`block text-left text-[16px] leading-[1.7] tracking-[-0.02em] transition-colors duration-300 ${isActive ? "text-[#ff5be2]" : "text-[#7f7f7f]"
                      }`}
                    style={{ fontFamily: '"Inter", "Hubot Sans", sans-serif' }}
                  >
                    {slide.stageLabel}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3 text-[#202020]">
              <button
                type="button"
                onClick={() => goToSlide(currentIndex - 1)}
                className="flex h-12 w-12 items-center justify-center transition-opacity duration-300 hover:opacity-65"
                aria-label="Slide trước"
              >
                <ArrowLeft className="h-8 w-8 stroke-[1.4]" />
              </button>

              <button
                type="button"
                onClick={() => goToSlide(currentIndex + 1)}
                className="flex h-12 w-12 items-center justify-center transition-opacity duration-300 hover:opacity-65"
                aria-label="Slide tiếp theo"
              >
                <ArrowRight className="h-8 w-8 stroke-[1.4]" />
              </button>
            </div>
          </div>
        </div>

        <div
          data-healing-panel
          className="relative w-full overflow-hidden shadow-[0_24px_70px_rgba(70,84,148,0.22)]"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ touchAction: "pan-y" }}
        >
          <Grainient
            className="bg-[#050505] p-6 sm:p-10 lg:px-12 lg:py-16"
            color1="#7C93F1"
            color2="#F6BFDF"
            color3="#B497CF"
            timeSpeed={2}
            colorBalance={0}
            warpStrength={1}
            warpFrequency={5}
            warpSpeed={2}
            warpAmplitude={50}
            blendAngle={0}
            blendSoftness={0.05}
            rotationAmount={500}
            noiseScale={2}
            grainAmount={0}
            grainScale={0}
            grainAnimated={false}
            contrast={1.5}
            gamma={1}
            saturation={1}
            centerX={0}
            centerY={0}
            zoom={0.8}
          >
            <div className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(180deg,rgba(5,5,5,0.14),rgba(5,5,5,0.14)_34%,rgba(5,5,5,0.28)_100%)]" />

            <div className="relative z-10 min-h-[620px] sm:min-h-[720px] lg:min-h-[760px]">
              {slides.map((slide, index) => {
                const isActive = index === currentIndex;

                return (
                  <article
                    key={slide.id}
                    className={`transition-opacity duration-500 ease-out ${isActive
                        ? "relative z-10 opacity-100"
                        : "pointer-events-none absolute inset-0 opacity-0"
                      }`}
                    aria-hidden={!isActive}
                  >
                    <div className="flex h-full flex-col">
                      <p
                        className="text-[24px] font-normal tracking-[-0.02em] text-white/82"
                        style={{ fontFamily: '"Aeonik TRIAL Regular", "Manrope", sans-serif' }}
                      >
                        /{String(index + 1).padStart(2, "0")}
                      </p>

                      <div className="mt-4 overflow-hidden rounded-[20px] border border-white/12 bg-white/10 backdrop-blur-[2px]">
                        <div
                          className="w-full shrink-0 overflow-hidden"
                          style={{ aspectRatio: "5 / 4" }}
                        >
                          <SlideMedia
                            slide={slide}
                            index={index}
                            videoRefs={videoRefs}
                          />
                        </div>
                      </div>

                      <div className="mt-8 max-w-[100%] sm:max-w-[92%]">
                        <h3
                          className="text-[28px] font-bold tracking-[-0.03em] text-white sm:text-[31px]"
                          style={{ fontFamily: '"Inter", "Hubot Sans", sans-serif' }}
                        >
                          {slide.title}
                        </h3>

                        <p
                          className="mt-4 min-h-[94px] text-[13px] leading-[1.65] text-white/74 sm:text-[14px]"
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
          </Grainient>
        </div>
      </div>
    </section>
  );
}
