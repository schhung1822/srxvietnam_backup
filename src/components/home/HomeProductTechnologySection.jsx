'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowDown, ArrowUp, ArrowUpRight } from 'lucide-react';
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

function homeTechnologyImage(fileName) {
  return `/assets/images/home/${encodeURIComponent(fileName)}`;
}

// Update articleLink later when the destination article pages are ready.
const technologyItems = [
  {
    id: 'refreshing-cooling',
    name: 'REFRESHING COOLING',
    shortDescription: 'Công nghệ hạ nhiệt tức thì cho làn da, tạo cảm giác lạnh sâu và bền vững.',
    detailDescription:
      'Lipoderm Mask sử dụng hoạt chất chuyên biệt Methyl Diisopropyl Propionamide, công nghệ này mang lại giải pháp hạ nhiệt tức thì cho làn da đang trong trạng thái nóng rát. Khác với tính dầu bọc hạ để gây kích ứng, Refreshing - Cooling tạo cảm giác mát lạnh sâu và bền vững, đặc biệt an toàn cho nền da sau xâm lấn (Laser, lăn kim, peel) mà không làm ảnh hưởng đến hàng rào bảo vệ da tự nhiên.',
    image: homeTechnologyImage('tech_1.webp'),
    articleLink: '/follow-srx/cong-nghe-refreshing-cooling',
  },
  {
    id: 'liposome',
    name: 'LIPOSOME (AQUA TECA™)',
    shortDescription: 'Giúp làm dịu tức thì và tái tạo mjanh mẽ các tế bào đang bị tổn thương.',
    detailDescription:
      'Để khắc phục nhược điểm khó hòa tan của chiết xuất rau má TECA truyền thống, SRX ứng dụng công nghệ dẫn truyền Liposome siêu nhỏ. Với cấu trúc tương thích sinh học cao, lớp vỏ Liposome đóng vai trò như một “phương tiện vận chuyển” thông minh, bảo vệ hoạt chất xuyên qua màng tế bào và tác động chính xác vào đích đến. Công nghệ này giúp làm dịu tức thì và tái tạo mạnh mẽ các tế bào đang tổn thương.',
    image: homeTechnologyImage('tech_2.webp'),
    articleLink: '/follow-srx/cong-nghe-liposome',
  },
  {
    id: 'vasome-retinol',
    name: 'VASOME RETINOL',
    shortDescription: 'Giảm tối đa tình trạng đỏ rát và kích ứng và tối ứu hóa thẩm thấu vào cá tần sâu hơn.',
    detailDescription:
      'Enhance Peel Vasome Retinol là hệ thống vận chuyển hoạt chất tiên tiến, sử dụng màng lipid kép để bao bọc các phân tử Retinoids. Công nghệ này thiết lập hàng rào bảo vệ vững chắc, ngăn chặn sự phân huỷ hoạt chất trước các tác nhân môi trường (nhiệt độ, ánh sáng, oxy hóa). Đặc biệt, Vasome Retinol cho phép giải phóng hoạt chất có kiểm soát (slow-release), giúp giảm thiểu tối đa tình trạng đỏ rát và kích ứng, đồng thời tối ưu hóa khả năng thẩm thấu vào các tầng da sâu hơn',
    image: homeTechnologyImage('tech_3.webp'),
    articleLink: '/follow-srx/cong-nghe-vasome-retinol',
  },
  {
    id: 'hydrolyzed-sponge',
    name: 'HYDROLYZED SPONGE',
    shortDescription: 'Giúp kích hoạt phản ứng tự chữa lành của da, thúc đẩy tăng sinh tế bào và loại bỏ lớp sừng già cỗi.',
    detailDescription:
      'Đóng vai trò là “hệ thống vi kênh dẫn truyền”, SRX sử dụng các vi kim chiết xuất từ bọt biển nước ngọt với kích thước siêu vi. Khi tiếp xúc với da, các vi kim này tạo ra hàng triệu điểm tiếp nhận hoạt chất, giúp dưỡng chất đi thẳng xuống lớp đáy thượng bì. Cơ chế này đồng thời kích hoạt phản ứng tự chữa lành, thúc đẩy tăng sinh tế bào và loại bỏ lớp sừng già cỗi, mang lại hiệu quả tái tạo tương đương lăn kim truyền thống nhưng đảm bảo an toàn và không gây tổn thương hở.',
    image: homeTechnologyImage('tech_4.webp'),
    articleLink: '/follow-srx/cong-nghe-hydrolyzed-sponge',
  },
  {
    id: 'dual-action-peel',
    name: 'DUAL ACTION PEEL',
    shortDescription: 'Giúp đảm bảo hiệu quả làm sạch sâu và điều trị mụn mà không gây hiện tượng bong tróc hay kích ứng mạnh',
    detailDescription:
      'Đây là giải pháp chuyên biệt cho da mụn nhạy cảm, kết hợp giữa các Acid phân tử nhỏ (Glycolic, Lactic, Succinic Acid) và phức hợp Enzyme sinh học (đu đủ, đu đủ). Cơ chế tác động kép giúp phá vỡ và liên kết giữa các tế bào sừng thừa, gom cồi mụn và kháng viêm một cách êm dịu. Công nghệ này đảm bảo hiệu quả làm sạch sâu và điều trị mụn mà không gây hiện tượng bong tróc hay kích ứng mạnh.',
    image: homeTechnologyImage('tech_5.webp'),
    articleLink: '/follow-srx/cong-nghe-dual-action-peel',
  },
  {
    id: 'hdrogel',
    name: 'HYDROGEL',
    shortDescription: 'Cân bằng độ ẩm, làm dịu các ổ viêm và hỗ trợ quá trình phục hồi diễn ra nhanh chóng.',
    detailDescription:
      'Công nghệ Hydrogel tạo ra một màng giữ ẩm thông minh, giúp cố định hoạt chất trên bề mặt da lâu hơn và tăng cường khả năng ngậm nước. Điều này giúp cân bằng độ ẩm tức thì, làm dịu các ổ viêm và hỗ trợ quá trình phục hồi diễn ra nhanh chóng dưới tác động diễn ra nhanh chóng dưới tác động.',
    image: homeTechnologyImage('tech_6.webp'),
    articleLink: '/follow-srx/cong-nghe-hydrogel',
  },
];

function shouldReduceMotion() {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function getWrappedIndex(index, length) {
  if (!length) {
    return 0;
  }

  const wrappedIndex = index % length;
  return wrappedIndex < 0 ? wrappedIndex + length : wrappedIndex;
}

function getRelativeOffset(index, activeIndex, length) {
  let relativeOffset = index - activeIndex;

  if (relativeOffset > length / 2) {
    relativeOffset -= length;
  }

  if (relativeOffset < -length / 2) {
    relativeOffset += length;
  }

  return relativeOffset;
}

function getSlideStyle(relativeOffset) {
  if (relativeOffset === 0) {
    return {
      top: '34%',
      height: '32%',
      opacity: 1,
      zIndex: 30,
      transform: 'translate3d(0, 0, 0) scale(1)',
      filter: 'blur(0px)',
    };
  }

  if (relativeOffset === -1) {
    return {
      top: '0%',
      height: '28%',
      opacity: 0.78,
      zIndex: 20,
      transform: 'translate3d(0, 0, 0) scale(0.965)',
      filter: 'blur(0px)',
    };
  }

  if (relativeOffset === 1) {
    return {
      top: '72%',
      height: '28%',
      opacity: 0.78,
      zIndex: 20,
      transform: 'translate3d(0, 0, 0) scale(0.965)',
      filter: 'blur(0px)',
    };
  }

  return {
    top: relativeOffset < 0 ? '-12%' : '112%',
    height: '26%',
    opacity: 0,
    zIndex: 10,
    transform: `translate3d(0, 0, 0) scale(0.94)`,
    filter: 'blur(1px)',
  };
}

function TechnologySlideCard({ item, itemIndex, relativeOffset, onSelect, isMobileView }) {
  const isActive = relativeOffset === 0;
  const cardStyle = getSlideStyle(relativeOffset);
  const isImageRight = isActive;

  if (isMobileView && Math.abs(relativeOffset) > 1) {
    return null;
  }

  const handleActivate = () => {
    onSelect(itemIndex, relativeOffset === 0 ? 1 : relativeOffset);
  };

  const handleKeyDown = (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    event.preventDefault();
    handleActivate();
  };

  return (
    <article
      data-tech-card
      role="button"
      tabIndex={Math.abs(relativeOffset) <= 1 ? 0 : -1}
      onClick={handleActivate}
      onKeyDown={handleKeyDown}
      aria-pressed={isActive}
      className={`${isMobileView ? 'relative' : 'absolute inset-x-0'} overflow-hidden rounded-full border border-white/14 transition-[top,height,transform,opacity,filter] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        Math.abs(relativeOffset) > 1 ? 'pointer-events-none' : 'pointer-events-auto'
      }`}
      style={isMobileView ? undefined : cardStyle}
    >
      <div className="absolute inset-0 rounded-full border border-white/8" />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.09),rgba(255,255,255,0.035)_38%,rgba(255,255,255,0.05)_100%)] backdrop-blur-[3px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),rgba(255,255,255,0)_48%)]" />

      <div
        className={`relative z-10 grid items-center gap-3 px-3 py-3 sm:gap-6 sm:px-4 sm:py-4 lg:px-6 lg:py-5 ${
          isMobileView ? '' : 'h-full '
        }${
          isImageRight
            ? 'grid-cols-[minmax(0,1fr)_96px] sm:grid-cols-[minmax(0,1fr)_168px] lg:grid-cols-[minmax(0,1fr)_250px]'
            : 'grid-cols-[96px_minmax(0,1fr)] sm:grid-cols-[168px_minmax(0,1fr)] lg:grid-cols-[250px_minmax(0,1fr)]'
        }`}
      >
        <div
          className={`${isImageRight ? 'order-2 lg:justify-self-end' : 'order-1'} flex justify-center`}
        >
          <div
            className={`relative aspect-square overflow-hidden rounded-full transition-all duration-700 ${
              isActive ? 'w-[100px] sm:w-[150px] lg:w-[240px]' : 'w-[80px] sm:w-[132px] lg:w-[200px]'
            }`}
          >
            <img
              src={item.image}
              alt={item.name}
              className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
              loading="lazy"
            />
          </div>
        </div>

        <div
          className={`${isImageRight ? 'order-1' : 'order-2'} flex min-w-0 flex-col justify-center pl-1 pr-2 sm:block sm:pl-6 sm:pr-0 lg:pl-12`}
        >
          <div
            className={`hidden rounded-full border px-3.5 py-1.5 text-[11px] font-medium shadow-[0_10px_24px_rgba(120,126,244,0.18),inset_0_1px_0_rgba(255,255,255,0.36)] ring-1 ring-white/24 backdrop-blur-md transition-all duration-500 sm:inline-flex sm:px-4 sm:py-2 sm:text-[12px] ${
              isActive
                ? 'border-white/40 bg-[linear-gradient(180deg,rgba(121,120,244,0.94),rgba(98,106,236,0.86))] text-white'
                : 'border-white/22 bg-[linear-gradient(180deg,rgba(121,120,244,0.72),rgba(98,106,236,0.58))] text-white'
            }`}
            style={{ fontFamily: '"Inter", "Hubot Sans", sans-serif' }}
          >
            Công nghệ
          </div>

          <h3
            className={`mt-0 bg-[linear-gradient(90deg,#3B43CE,#9478FF,#474FEA)] bg-clip-text text-balance font-semibold text-transparent transition-all duration-500 sm:mt-4 ${
              isActive
                ? 'text-[21px] leading-[1.14] tracking-[-0.04em] sm:text-[38px] sm:leading-[1.3] lg:text-[44px]'
                : 'text-[18px] leading-[1.14] tracking-[-0.03em] sm:text-[26px] sm:leading-[1.3] lg:text-[30px]'
            }`}
            style={{ fontFamily: '"Manrope", "Hubot Sans", sans-serif' }}
          >
            {item.name}
          </h3>

          <p
            className={`mt-0 hidden overflow-hidden text-white transition-all duration-500 sm:mt-3 sm:block ${
              isActive
                ? 'sm:max-h-40 sm:text-[14px] sm:leading-6 sm:opacity-100 lg:text-[15px]'
                : 'sm:max-h-20 sm:text-[13px] sm:leading-5 sm:opacity-82'
            }`}
            style={{ fontFamily: '"Inter", "Hubot Sans", sans-serif' }}
          >
            {item.shortDescription}
          </p>
        </div>
      </div>
    </article>
  );
}

export default function HomeProductTechnologySection() {
  const sectionRef = useRef(null);
  const sliderViewportRef = useRef(null);
  const detailRef = useRef(null);
  const directionRef = useRef(1);
  const wheelLockRef = useRef(false);
  const touchStartYRef = useRef(0);
  const [currentIndex, setCurrentIndex] = useState(technologyItems.length > 1 ? 1 : 0);
  const [isMobileView, setIsMobileView] = useState(false);

  const activeTechnology = technologyItems[currentIndex] ?? technologyItems[0] ?? null;
  const slideEntries = useMemo(
    () =>
      technologyItems.map((item, itemIndex) => ({
        item,
        itemIndex,
        relativeOffset: getRelativeOffset(itemIndex, currentIndex, technologyItems.length),
      })),
    [currentIndex],
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const mediaQuery = window.matchMedia('(max-width: 639px)');
    const syncViewportState = () => setIsMobileView(mediaQuery.matches);

    syncViewportState();

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', syncViewportState);

      return () => {
        mediaQuery.removeEventListener('change', syncViewportState);
      };
    }

    mediaQuery.addListener(syncViewportState);

    return () => {
      mediaQuery.removeListener(syncViewportState);
    };
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const isCompact = window.matchMedia('(max-width: 1023px)').matches;

      gsap.from('[data-tech-intro]', {
        opacity: 0,
        y: isCompact ? 0 : 36,
        duration: isCompact ? 0.65 : 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 78%',
        },
      });

      gsap.from('[data-tech-slider-shell]', {
        opacity: 0,
        y: isCompact ? 18 : 28,
        duration: isCompact ? 0.65 : 0.86,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 72%',
        },
      });

      gsap.from('[data-tech-detail]', {
        opacity: 0,
        y: isCompact ? 18 : 28,
        x: isCompact ? 0 : 22,
        duration: isCompact ? 0.65 : 0.82,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
        },
      });

      gsap.from('[data-tech-cta]', {
        opacity: 0,
        y: isCompact ? 0 : 24,
        duration: isCompact ? 0.55 : 0.7,
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
    if (shouldReduceMotion()) {
      return undefined;
    }

    const activeNodes =
      sliderViewportRef.current?.querySelectorAll('[aria-pressed="true"] h3, [aria-pressed="true"] p, [aria-pressed="true"] a') ??
      [];
    const detailNodes = detailRef.current?.querySelectorAll('[data-tech-detail-node]') ?? [];

    const timeline = gsap.timeline({ defaults: { ease: 'power2.out' } });

    timeline.fromTo(
      activeNodes,
      {
        opacity: 0,
        y: 14,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.26,
        stagger: 0.04,
        clearProps: 'opacity,transform',
      },
      0.08,
    );

    timeline.fromTo(
      detailRef.current,
      {
        opacity: 0,
        x: directionRef.current > 0 ? 18 : -18,
        y: 8,
      },
      {
        opacity: 1,
        x: 0,
        y: 0,
        duration: 0.32,
      },
      0.04,
    );

    timeline.fromTo(
      detailNodes,
      {
        opacity: 0,
        y: 14,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.24,
        stagger: 0.035,
        clearProps: 'opacity,transform',
      },
      0.1,
    );

    return () => {
      timeline.kill();
    };
  }, [currentIndex]);

  const changeTechnology = (nextIndex, direction = 1) => {
    if (nextIndex === currentIndex) {
      return;
    }

    directionRef.current = direction >= 0 ? 1 : -1;
    setCurrentIndex(nextIndex);
  };

  const handleStep = (direction) => {
    changeTechnology(
      getWrappedIndex(currentIndex + direction, technologyItems.length),
      direction,
    );
  };

  const handleWheel = (event) => {
    if (window.matchMedia('(max-width: 1023px)').matches || wheelLockRef.current) {
      return;
    }

    if (Math.abs(event.deltaY) < 24) {
      return;
    }

    event.preventDefault();
    wheelLockRef.current = true;
    handleStep(event.deltaY > 0 ? 1 : -1);
    window.setTimeout(() => {
      wheelLockRef.current = false;
    }, 650);
  };

  const handleTouchStart = (event) => {
    touchStartYRef.current = event.targetTouches[0]?.clientY ?? 0;
  };

  const handleTouchEnd = (event) => {
    const touchEndY = event.changedTouches[0]?.clientY ?? 0;
    const deltaY = touchStartYRef.current - touchEndY;

    if (Math.abs(deltaY) < 40) {
      return;
    }

    handleStep(deltaY > 0 ? 1 : -1);
  };

  return (
    <section ref={sectionRef} className="relative overflow-hidden">
      <Grainient
        className="bg-[#050505] px-4 py-8 sm:px-6 lg:px-8 lg:py-24"
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
        zoom={0.9}
      >
        <div className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(180deg,rgba(5,5,5,0.1),rgba(5,5,5,0.12)_38%,rgba(5,5,5,0.24)_100%)]" />
        <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(circle_at_18%_20%,rgba(113,146,255,0.16),rgba(113,146,255,0)_26%),radial-gradient(circle_at_82%_26%,rgba(245,191,223,0.1),rgba(245,191,223,0)_24%)]" />

        <div className="relative z-10 mx-auto max-w-[1920px]">
          <div className="flex flex-col items-center gap-10 lg:gap-14">
            <div data-tech-intro className="w-full max-w-[1440px]">
              <div className="mt-4 text-center">
                <ScrollRevealHeading
                  as="h2"
                  className="mx-auto mt-4 max-w-[780px] text-[32px] font-medium leading-[1.35] tracking-[-0.05em] sm:text-[42px] lg:text-[62px]"
                  revealedClassName="text-[#fff]"
                  baseStyle={{ color: 'rgba(255,255,255,0.22)' }}
                  style={{ fontFamily: '"Manrope", "Hubot Sans", sans-serif' }}
                >
                  Công nghệ sản phẩm
                </ScrollRevealHeading>
              </div>
            </div>

            <div data-tech-slider-shell className="w-full max-w-[1840px]">
              <div className="mb-5 flex items-center justify-center sm:justify-end gap-3 sm:mb-6">
                <div
                  className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-[14px] tracking-[0.18em] text-white sm:text-[15px]"
                  style={{ fontFamily: '"Inter", "Hubot Sans", sans-serif' }}
                >
                  {String(currentIndex + 1).padStart(2, '0')} -{' '}
                  {String(technologyItems.length).padStart(2, '0')}
                </div>

                <button
                  type="button"
                  onClick={() => handleStep(-1)}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white bg-white/12 text-white transition-colors duration-300 hover:bg-white/30"
                  aria-label="Công nghệ trước"
                >
                  <ArrowUp className="h-5 w-5 stroke-[1.5]" />
                </button>

                <button
                  type="button"
                  onClick={() => handleStep(1)}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white bg-white/12 text-white transition-colors duration-300 hover:bg-white/30"
                  aria-label="Công nghệ tiếp theo"
                >
                  <ArrowDown className="h-5 w-5 stroke-[1.5]" />
                </button>
              </div>

              <div className="grid gap-8 lg:grid-cols-[minmax(0,1.06fr)_minmax(320px,0.74fr)] lg:items-center xl:gap-14">
                <div
                  ref={sliderViewportRef}
                  className={
                    isMobileView
                      ? 'flex flex-col gap-4'
                      : 'relative h-[680px] sm:h-[760px] lg:h-[860px]'
                  }
                  onWheel={handleWheel}
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                  style={{ touchAction: 'pan-x' }}
                >
                  {slideEntries.map(({ item, itemIndex, relativeOffset }) => (
                    <TechnologySlideCard
                      key={item.id}
                      item={item}
                      itemIndex={itemIndex}
                      relativeOffset={relativeOffset}
                      onSelect={changeTechnology}
                      isMobileView={isMobileView}
                    />
                  ))}
                </div>

                <div data-tech-detail className="lg:pl-3">
                  <div
                    ref={detailRef}
                    className="relative min-h-[320px] pl-0 sm:pl-8 lg:min-h-[460px] lg:pl-10"
                  >
                    <div className="flex h-full flex-col justify-center">
                      <div data-tech-detail-node>
                        <span className="inline-flex rounded-full border border-white/45 bg-[linear-gradient(180deg,rgba(121,120,244,0.92),rgba(98,106,236,0.84))] px-5 py-2 text-[15px] font-medium text-white shadow-[0_12px_30px_rgba(120,126,244,0.24),inset_0_1px_0_rgba(255,255,255,0.42)] ring-2 ring-white/28 backdrop-blur-md sm:px-6 sm:py-2.5 sm:text-[16px]"
                          style={{ fontFamily: '"Manrope", "Hubot Sans", sans-serif' }}
                        >
                          Công nghệ
                        </span>
                      </div>

                      <h3
                        data-tech-detail-node
                        className="mt-6  bg-[linear-gradient(90deg,#3B43CE,#9478FF,#474FEA)] bg-clip-text text-[34px] font-semibold leading-[1.3] tracking-[-0.06em] text-transparent sm:text-[46px] lg:text-[62px]"
                        style={{ fontFamily: '"Manrope", "Hubot Sans", sans-serif' }}
                      >
                        {activeTechnology.name}
                      </h3>

                      <p
                        data-tech-detail-node
                        className="mt-4 text-[14px] leading-1 text-white/90 sm:text-[17px]"
                        style={{ fontFamily: '"Inter", "Hubot Sans", sans-serif' }}
                      >
                        {activeTechnology.detailDescription}
                      </p>

                      <div
                        data-tech-detail-node
                        className="mt-8 flex items-center gap-2"
                      >
                        {technologyItems.map((technology, index) => (
                          <button
                            key={technology.id}
                            type="button"
                            onClick={() =>
                              changeTechnology(index, index > currentIndex ? 1 : -1)
                            }
                            className={`h-2.5 rounded-full transition-all duration-300 ${
                              index === currentIndex
                                ? 'w-10 bg-white'
                                : 'w-2.5 bg-[#ccc] hover:bg-[#dedede]'
                            }`}
                            aria-label={`Xem cong nghe ${technology.name}`}
                          />
                        ))}
                      </div>

                      <div
                        data-tech-detail-node
                        className="mt-10 flex flex-wrap items-center gap-4"
                      >
                        <Link
                          href={activeTechnology.articleLink || '/chu-de-khoa-hoc'}
                          className="group inline-flex min-h-[50px] items-center justify-center rounded-full border border-white/22 bg-white/6 px-6 text-[14px] font-medium text-white transition hover:bg-white hover:text-[#0f172a] sm:px-7"
                          style={{ fontFamily: '"Manrope", "Hubot Sans", sans-serif' }}
                        >
                          <span>Xem chi tiết</span>
                          <ArrowUpRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div data-tech-cta className="mt-4 flex w-full justify-center sm:mt-12">
              <div className="flex w-full max-w-[460px] justify-center gap-3 sm:w-auto sm:max-w-none sm:gap-[18px]">
                <Link
                  href="/key-srx"
                  className={`${homePrimaryButtonClass} min-w-[118px] shrink-0 justify-center sm:w-auto`}
                  style={{ fontFamily: '"Manrope", "Hubot Sans", sans-serif' }}
                >
                  <span className={homeButtonHighlightClass} />
                  <span className={homeButtonSheenClass} />
                  <span className="relative z-[1]">Khám phá ngay</span>
                </Link>

                <Link
                  href="/products"
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
