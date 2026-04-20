'use client';

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

const slides = [
  {
    id: "slider-1",
    src: "/assets/images/home/slider1.avif",
    alt: "SRX slider 1",
  },
  {
    id: "slider-2",
    src: "/assets/images/home/slider2.webp",
    alt: "SRX slider 2",
  },
  {
    id: "slider-3",
    src: "/assets/images/home/slider3.webp",
    alt: "SRX slider 3",
  },
];

export default function HomeImageSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    if (isPaused) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setCurrentIndex((previousIndex) =>
        previousIndex === slides.length - 1 ? 0 : previousIndex + 1,
      );
    }, 4800);

    return () => window.clearInterval(intervalId);
  }, [isPaused]);

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
    <section className="bg-white px-2 pb-6 pt-12 sm:px-6 sm:pb-8 sm:pt-16 lg:px-8 lg:pb-12 lg:pt-20">
      <div className="mx-auto max-w-[1800px]">
        <div
          className="relative overflow-hidden rounded-[20px] border border-[#e5e8fb] bg-[#f8f9ff] shadow-[0_26px_60px_rgba(115,128,225,0.12)] sm:rounded-[24px]"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ touchAction: "pan-y" }}
        >
          <div className="relative aspect-[4/3] sm:aspect-[5/4] md:aspect-[16/10] lg:h-[620px] lg:aspect-auto">
            {slides.map((slide, index) => {
              const isActive = index === currentIndex;

              return (
                <div
                  key={slide.id}
                  className={`absolute inset-0 transition-opacity duration-700 ease-out ${
                    isActive ? "opacity-100" : "pointer-events-none opacity-0"
                  }`}
                  aria-hidden={!isActive}
                >
                  <img
                    src={slide.src}
                    alt={slide.alt}
                    className="h-full w-full object-cover object-center"
                    loading={index === 0 ? "eager" : "lazy"}
                    fetchPriority={index === 0 ? "high" : "auto"}
                  />
                </div>
              );
            })}

            <button
              type="button"
              onClick={() => goToSlide(currentIndex - 1)}
              className="absolute left-2.5 top-1/2 z-16 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-[#231f20] transition-all duration-300 hover:bg-[#6e96fb] hover:text-white md:left-6 md:h-[34px] md:w-[58px]"
              aria-label="Slide trước"
            >
              <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
            </button>

            <button
              type="button"
              onClick={() => goToSlide(currentIndex + 1)}
              className="absolute right-2.5 top-1/2 z-16 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-[#231f20] transition-all duration-300 hover:bg-[#6e96fb] hover:text-white md:right-6 md:h-[34px] md:w-[58px]"
              aria-label="Slide tiếp theo"
            >
              <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
            </button>

            <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 md:bottom-8 md:left-auto md:right-10 md:translate-x-0 md:gap-2.5">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => goToSlide(index)}
                  className={`h-3 w-3 rounded-full border border-white/90 transition-all duration-300 md:h-3.5 md:w-3.5 ${
                    index === currentIndex
                      ? "scale-110 bg-[#7b95ff]"
                      : "bg-white/90"
                  }`}
                  aria-label={`Đi tới slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
