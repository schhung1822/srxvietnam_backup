'use client';

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

const buildLineup = (palette) => [
  {
    id: "skinshield",
    name: "SKINSHIELD",
    subtitle: "ANHYDROUS SUNSCREEN",
    form: "pump",
    x: 28,
    y: 14,
    width: 176,
    height: 412,
    shellFrom: palette.pump[0],
    shellTo: palette.pump[1],
    labelTone: palette.labelTone,
    glow: palette.glow,
  },
  {
    id: "ampoule",
    name: "NOURISHING",
    subtitle: "AMPOULE",
    form: "dropper",
    x: 194,
    y: 2,
    width: 170,
    height: 286,
    shellFrom: palette.dropper[0],
    shellTo: palette.dropper[1],
    labelTone: palette.labelTone,
    glow: palette.glow,
  },
  {
    id: "retinol",
    name: "RETINOL A",
    subtitle: "CREAM",
    form: "tube",
    x: 374,
    y: 48,
    width: 150,
    height: 426,
    shellFrom: palette.tube[0],
    shellTo: palette.tube[1],
    labelTone: palette.labelTone,
    glow: palette.glow,
  },
  {
    id: "booster",
    name: "RECOVERY",
    subtitle: "BOOSTER",
    form: "cylinder",
    x: 532,
    y: 18,
    width: 172,
    height: 398,
    shellFrom: palette.booster[0],
    shellTo: palette.booster[1],
    labelTone: palette.labelTone,
    glow: palette.glow,
  },
  {
    id: "mask",
    name: "LIPODERM",
    subtitle: "MASK",
    form: "pouch",
    x: 716,
    y: 10,
    width: 246,
    height: 370,
    shellFrom: palette.mask[0],
    shellTo: palette.mask[1],
    labelTone: palette.labelTone,
    glow: palette.glow,
  },
];

const showcaseSlides = [
  {
    id: "recovery-lab",
    eyebrow: "SRX Signature",
    title: "Recovery Lab Collection",
    caption: "Peptide, ceramide và retinol trong một visual trưng bày nổi bật.",
    panelTone: "#4e5bc7",
    descriptionTone: "#556189",
    background:
      "linear-gradient(126deg, #dfe4ff 0%, #f8faff 42%, #eaeeff 100%)",
    overlay:
      "radial-gradient(circle at 48% 28%, rgba(255,255,255,0.92), transparent 34%), radial-gradient(circle at 76% 14%, rgba(205,213,255,0.6), transparent 24%), linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 30%)",
    stage:
      "linear-gradient(180deg, rgba(232,236,255,0) 0%, rgba(221,226,255,0.55) 45%, rgba(205,210,246,0.92) 100%)",
    stageBorder: "rgba(140, 149, 239, 0.24)",
    accent: "#5f5ce7",
    accentSoft: "rgba(105, 112, 255, 0.28)",
    lineColor: "rgba(137, 148, 255, 0.38)",
    products: buildLineup({
      pump: ["#ffffff", "#5f6cf5"],
      dropper: ["#cfd5ff", "#626dff"],
      tube: ["#e8ebff", "#6571ff"],
      booster: ["#7f8eff", "#4d5be0"],
      mask: ["#5c60f1", "#2d35b6"],
      labelTone: "#eef2ff",
      glow: "rgba(97, 105, 245, 0.3)",
    }),
  },
  {
    id: "daily-shield",
    eyebrow: "Clinical Display",
    title: "Daily Shield Routine",
    caption: "Bố cục tập trung vào cảm giác sạch, sáng và cao cấp như packshot sản phẩm.",
    panelTone: "#4668c6",
    descriptionTone: "#53688d",
    background:
      "linear-gradient(125deg, #edf3ff 0%, #ffffff 44%, #edf4ff 100%)",
    overlay:
      "radial-gradient(circle at 52% 25%, rgba(255,255,255,0.95), transparent 36%), radial-gradient(circle at 83% 18%, rgba(205,226,255,0.65), transparent 22%), linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 26%)",
    stage:
      "linear-gradient(180deg, rgba(228,240,255,0) 0%, rgba(217,231,255,0.48) 46%, rgba(205,220,243,0.92) 100%)",
    stageBorder: "rgba(139, 176, 227, 0.22)",
    accent: "#4f7cf0",
    accentSoft: "rgba(79, 124, 240, 0.22)",
    lineColor: "rgba(122, 166, 241, 0.34)",
    products: buildLineup({
      pump: ["#ffffff", "#6ba5ff"],
      dropper: ["#d8e6ff", "#76a4ff"],
      tube: ["#edf7ff", "#7fa9ff"],
      booster: ["#84b5ff", "#5483e5"],
      mask: ["#5f8df8", "#3352c4"],
      labelTone: "#f3f8ff",
      glow: "rgba(75, 126, 240, 0.25)",
    }),
  },
  {
    id: "retinol-focus",
    eyebrow: "Biotech Formula",
    title: "Retinol Focus Showcase",
    caption: "Tông lavender lạnh và chi tiết laboratory giúp banner nổi khối hơn trên desktop.",
    panelTone: "#6150c7",
    descriptionTone: "#5f648f",
    background:
      "linear-gradient(128deg, #ebe5ff 0%, #fbfcff 46%, #f1ebff 100%)",
    overlay:
      "radial-gradient(circle at 46% 26%, rgba(255,255,255,0.95), transparent 34%), radial-gradient(circle at 80% 18%, rgba(224,213,255,0.64), transparent 22%), linear-gradient(180deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 28%)",
    stage:
      "linear-gradient(180deg, rgba(240,232,255,0) 0%, rgba(225,219,255,0.5) 46%, rgba(214,209,246,0.92) 100%)",
    stageBorder: "rgba(169, 147, 237, 0.24)",
    accent: "#6d54ea",
    accentSoft: "rgba(118, 94, 245, 0.24)",
    lineColor: "rgba(159, 142, 238, 0.32)",
    products: buildLineup({
      pump: ["#ffffff", "#7e73ff"],
      dropper: ["#ded8ff", "#8a7eff"],
      tube: ["#f0ebff", "#8c7fff"],
      booster: ["#9c8eff", "#6957e3"],
      mask: ["#6b52ed", "#3521bc"],
      labelTone: "#f6f0ff",
      glow: "rgba(110, 84, 234, 0.28)",
    }),
  },
];

const leftDots = [
  { x: 16, y: 18, size: 24, opacity: 0.9 },
  { x: 38, y: 28, size: 20, opacity: 0.86 },
  { x: 64, y: 42, size: 18, opacity: 0.82 },
  { x: 90, y: 58, size: 15, opacity: 0.76 },
  { x: 115, y: 78, size: 14, opacity: 0.72 },
  { x: 140, y: 104, size: 13, opacity: 0.68 },
  { x: 164, y: 134, size: 12, opacity: 0.62 },
  { x: 189, y: 166, size: 12, opacity: 0.58 },
  { x: 214, y: 126, size: 16, opacity: 0.74 },
  { x: 190, y: 96, size: 18, opacity: 0.78 },
  { x: 163, y: 72, size: 16, opacity: 0.72 },
  { x: 136, y: 56, size: 15, opacity: 0.68 },
  { x: 109, y: 46, size: 15, opacity: 0.64 },
  { x: 82, y: 40, size: 16, opacity: 0.62 },
  { x: 56, y: 38, size: 18, opacity: 0.66 },
  { x: 128, y: 154, size: 18, opacity: 0.46 },
  { x: 102, y: 178, size: 16, opacity: 0.42 },
  { x: 78, y: 206, size: 14, opacity: 0.38 },
];

const moleculeNodes = [
  { left: 26, top: 76, size: 80 },
  { left: 148, top: 22, size: 94 },
  { left: 228, top: 122, size: 54 },
  { left: 118, top: 164, size: 48 },
  { left: 218, top: 214, size: 42 },
  { left: 46, top: 222, size: 34 },
];

const moleculeLines = [
  { left: 88, top: 88, width: 98, rotate: -22 },
  { left: 192, top: 92, width: 76, rotate: 42 },
  { left: 92, top: 156, width: 62, rotate: 36 },
  { left: 144, top: 198, width: 88, rotate: -18 },
  { left: 56, top: 206, width: 72, rotate: -64 },
];

function ScientificDots({ accent }) {
  return (
    <div className="pointer-events-none absolute left-0 top-0 hidden opacity-75 lg:block">
      <div className="relative h-[260px] w-[290px]">
        {leftDots.map((dot, index) => (
          <span
            key={`${dot.x}-${dot.y}-${index}`}
            className="absolute rounded-full"
            style={{
              left: dot.x,
              top: dot.y,
              width: dot.size,
              height: dot.size,
              opacity: dot.opacity,
              background: `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.96), ${accent})`,
              filter: "blur(0.4px)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function MoleculeCluster({ accent, lineColor }) {
  return (
    <div className="pointer-events-none absolute right-[4%] top-[10%] hidden lg:block">
      <div className="relative h-[290px] w-[320px]">
        {moleculeLines.map((line, index) => (
          <span
            key={`${line.left}-${line.top}-${index}`}
            className="absolute rounded-full"
            style={{
              left: line.left,
              top: line.top,
              width: line.width,
              height: 2,
              transform: `rotate(${line.rotate}deg)`,
              transformOrigin: "left center",
              background: lineColor,
              boxShadow: `0 0 18px ${accent}`,
            }}
          />
        ))}

        {moleculeNodes.map((node, index) => (
          <span
            key={`${node.left}-${node.top}-${index}`}
            className="absolute rounded-full border border-white/80"
            style={{
              left: node.left,
              top: node.top,
              width: node.size,
              height: node.size,
              background:
                "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.98), rgba(231,236,255,0.88) 42%, rgba(127,145,255,0.68) 68%, rgba(255,255,255,0.08) 100%)",
              boxShadow: `0 0 28px ${accent}, inset 0 0 24px rgba(255,255,255,0.82)`,
            }}
          >
            <span
              className="absolute left-1/2 top-1/2 h-[26%] w-[26%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/90"
              style={{ boxShadow: `0 0 20px ${accent}` }}
            />
          </span>
        ))}
      </div>
    </div>
  );
}

function ProductPack({ product }) {
  const shellStyle = {
    background: `linear-gradient(180deg, ${product.shellFrom} 0%, ${product.shellTo} 100%)`,
    boxShadow: `0 24px 44px ${product.glow}`,
  };

  const label = (
    <>
      <span
        className="block text-[22px] font-semibold tracking-[0.24em]"
        style={{ color: product.labelTone }}
      >
        SRX
      </span>
      <span
        className="mt-5 block text-[13px] font-semibold tracking-[0.18em] text-white/92"
        style={{ color: product.labelTone }}
      >
        {product.name}
      </span>
      <span className="mt-2 block text-[9px] font-medium tracking-[0.16em] text-white/80">
        {product.subtitle}
      </span>
    </>
  );

  if (product.form === "pump") {
    return (
      <div
        className="absolute"
        style={{
          left: product.x,
          bottom: product.y,
          width: product.width,
          height: product.height,
        }}
      >
        <div className="absolute left-1/2 top-0 h-5 w-16 -translate-x-1/2 rounded-full bg-white shadow-[0_8px_18px_rgba(255,255,255,0.56)]" />
        <div className="absolute left-1/2 top-3 h-10 w-7 -translate-x-1/2 rounded-[18px] bg-white" />
        <div className="absolute left-[44px] top-8 h-3 w-32 rounded-full bg-white/95" />
        <div
          className="absolute inset-x-[24px] bottom-[22px] top-[46px] rounded-[42px_42px_32px_32px] border border-white/55"
          style={shellStyle}
        >
          <div className="absolute inset-x-[20px] top-[26px] h-[98px] rounded-[26px] border border-white/30 bg-[linear-gradient(180deg,rgba(54,71,214,0.98),rgba(48,60,191,0.88))] px-5 pt-6 text-center" />
          <div className="absolute inset-x-[20px] top-[26px] text-center">
            {label}
          </div>
          <div className="absolute left-[18px] top-[16px] h-[100px] w-7 rounded-full bg-white/42 blur-md" />
        </div>
        <div
          className="absolute left-1/2 bottom-0 h-7 w-[126px] -translate-x-1/2 rounded-full blur-lg"
          style={{ background: product.glow }}
        />
      </div>
    );
  }

  if (product.form === "dropper") {
    return (
      <div
        className="absolute"
        style={{
          left: product.x,
          bottom: product.y,
          width: product.width,
          height: product.height,
        }}
      >
        <div className="absolute left-1/2 top-0 h-20 w-20 -translate-x-1/2 rounded-[22px] bg-[linear-gradient(180deg,#f7f7fb,#bcc5f2)] shadow-[0_18px_28px_rgba(176,186,255,0.36)]" />
        <div className="absolute left-1/2 top-[62px] h-[66px] w-[12px] -translate-x-1/2 rounded-full bg-white/92" />
        <div
          className="absolute inset-x-[20px] bottom-[16px] top-[82px] rounded-[42px_42px_26px_26px] border border-white/38"
          style={shellStyle}
        >
          <div className="absolute left-[14px] top-[14px] h-[90px] w-7 rounded-full bg-white/32 blur-md" />
          <div className="absolute inset-x-[12px] top-[24px] text-center">
            {label}
          </div>
        </div>
        <div
          className="absolute left-1/2 bottom-0 h-6 w-[110px] -translate-x-1/2 rounded-full blur-lg"
          style={{ background: product.glow }}
        />
      </div>
    );
  }

  if (product.form === "tube") {
    return (
      <div
        className="absolute"
        style={{
          left: product.x,
          bottom: product.y,
          width: product.width,
          height: product.height,
        }}
      >
        <div
          className="absolute inset-x-[18px] top-0 h-[342px] border border-white/42"
          style={{
            ...shellStyle,
            clipPath: "polygon(16% 0%, 84% 0%, 76% 92%, 24% 92%)",
            borderRadius: 28,
          }}
        >
          <div className="absolute left-[18px] top-[16px] h-[120px] w-7 rounded-full bg-white/34 blur-md" />
          <div
            className="absolute left-1/2 top-[54px] -translate-x-1/2 text-center"
            style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
          >
            {label}
          </div>
        </div>
        <div
          className="absolute left-1/2 top-[332px] h-[94px] w-[74px] -translate-x-1/2 rounded-[18px] border border-white/38"
          style={{
            background: `linear-gradient(180deg, ${product.shellTo} 0%, ${product.shellTo} 100%)`,
            boxShadow: `0 18px 36px ${product.glow}`,
          }}
        />
        <div
          className="absolute left-1/2 bottom-0 h-6 w-[96px] -translate-x-1/2 rounded-full blur-lg"
          style={{ background: product.glow }}
        />
      </div>
    );
  }

  if (product.form === "cylinder") {
    return (
      <div
        className="absolute"
        style={{
          left: product.x,
          bottom: product.y,
          width: product.width,
          height: product.height,
        }}
      >
        <div
          className="absolute left-1/2 top-0 h-[72px] w-[124px] -translate-x-1/2 rounded-[36px] border border-white/36"
          style={{
            background: `linear-gradient(180deg, ${product.shellFrom} 0%, ${product.shellTo} 100%)`,
            boxShadow: `0 16px 30px ${product.glow}`,
          }}
        />
        <div
          className="absolute inset-x-[18px] bottom-[22px] top-[38px] rounded-[48px_48px_24px_24px] border border-white/36"
          style={shellStyle}
        >
          <div className="absolute left-[18px] top-[18px] h-[118px] w-8 rounded-full bg-white/22 blur-md" />
          <div
            className="absolute left-1/2 top-[112px] -translate-x-1/2 text-center"
            style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
          >
            {label}
          </div>
        </div>
        <div
          className="absolute left-1/2 bottom-0 h-7 w-[108px] -translate-x-1/2 rounded-full blur-lg"
          style={{ background: product.glow }}
        />
      </div>
    );
  }

  return (
    <div
      className="absolute"
      style={{
        left: product.x,
        bottom: product.y,
        width: product.width,
        height: product.height,
      }}
    >
      <div
        className="absolute inset-0 rounded-[40px] border border-white/30"
        style={shellStyle}
      >
        <div className="absolute inset-x-[18px] top-[16px] h-[18px] rounded-full bg-white/16" />
        <div className="absolute left-[18px] top-[18px] h-[128px] w-10 rounded-full bg-white/18 blur-md" />
        <div className="absolute inset-x-[24px] top-[52px] text-center">
          <span className="block text-[24px] font-semibold tracking-[0.26em] text-white/96">
            SRX
          </span>
          <div className="mx-auto mt-9 flex h-[110px] w-[110px] items-center justify-center rounded-full border border-white/30">
            <div className="h-[70px] w-[70px] rounded-full border border-white/40" />
          </div>
          <span className="mt-9 block text-[15px] font-semibold tracking-[0.22em] text-white/92">
            {product.name}
          </span>
          <span className="mt-2 block text-[10px] font-medium tracking-[0.16em] text-white/76">
            {product.subtitle}
          </span>
        </div>
      </div>
      <div
        className="absolute left-1/2 bottom-0 h-8 w-[140px] -translate-x-1/2 rounded-full blur-lg"
        style={{ background: product.glow }}
      />
    </div>
  );
}

export default function SignatureProductCarousel() {
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
        previousIndex === showcaseSlides.length - 1 ? 0 : previousIndex + 1,
      );
    }, 4800);

    return () => window.clearInterval(intervalId);
  }, [isPaused]);

  const goToSlide = (nextIndex) => {
    if (nextIndex < 0) {
      setCurrentIndex(showcaseSlides.length - 1);
      return;
    }

    if (nextIndex >= showcaseSlides.length) {
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
    <section className="bg-white px-4 pb-8 sm:px-6 lg:px-8 lg:pb-12">
      <div className="mx-auto max-w-[1880px]">
        <div
          className="relative overflow-hidden rounded-[24px] border border-[#e4e8ff] shadow-[0_26px_60px_rgba(115,128,225,0.12)]"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ touchAction: "pan-y" }}
        >
          <div className="relative h-[360px] sm:h-[460px] md:h-[560px] lg:h-[670px]">
            {showcaseSlides.map((slide, index) => {
              const isActive = index === currentIndex;

              return (
                <article
                  key={slide.id}
                  className={`absolute inset-0 transition-all duration-700 ease-out ${
                    isActive
                      ? "translate-x-0 scale-100 opacity-100"
                      : "pointer-events-none translate-x-4 scale-[0.985] opacity-0"
                  }`}
                  style={{ background: slide.background }}
                  aria-hidden={!isActive}
                >
                  <div
                    className="absolute inset-0"
                    style={{ background: slide.overlay }}
                  />
                  <div
                    className="absolute inset-x-0 bottom-0 h-[36%] border-t"
                    style={{
                      background: slide.stage,
                      borderColor: slide.stageBorder,
                    }}
                  />
                  <div
                    className="absolute inset-x-[10%] top-[16%] h-[56%] rounded-full blur-3xl"
                    style={{ background: slide.accentSoft }}
                  />

                  <ScientificDots accent={slide.accent} />
                  <MoleculeCluster
                    accent={slide.accent}
                    lineColor={slide.lineColor}
                  />

                  <div className="absolute left-4 top-4 z-20 max-w-[270px] sm:left-8 sm:top-8">
                    <div className="inline-flex items-center gap-3 rounded-full border border-white/70 bg-white/58 px-4 py-2 shadow-[0_10px_30px_rgba(168,179,245,0.22)] backdrop-blur-xl">
                      <img
                        src="/assets/images/header/logo_srx.webp"
                        alt="SRX"
                        className="h-5 w-auto object-contain"
                      />
                      <span
                        className="text-[10px] font-semibold uppercase tracking-[0.34em] sm:text-[11px]"
                        style={{ color: slide.panelTone }}
                      >
                        {slide.eyebrow}
                      </span>
                    </div>

                    <div className="mt-3 rounded-[24px] border border-white/70 bg-white/34 p-4 shadow-[0_16px_40px_rgba(168,179,245,0.16)] backdrop-blur-xl sm:mt-4 sm:p-5">
                      <h2
                        className="text-[22px] font-semibold leading-[1.05] tracking-[-0.04em] sm:text-[30px]"
                        style={{ color: slide.panelTone }}
                      >
                        {slide.title}
                      </h2>
                      <p
                        className="mt-2 text-[13px] leading-6 sm:text-[14px]"
                        style={{ color: slide.descriptionTone }}
                      >
                        {slide.caption}
                      </p>
                    </div>
                  </div>

                  <div className="pointer-events-none absolute inset-x-0 bottom-[3%] z-[1] flex justify-center">
                    <div className="relative h-[520px] w-[980px] origin-bottom scale-[0.38] sm:scale-[0.5] md:scale-[0.68] lg:scale-[0.88] xl:scale-100">
                      <img
                        src="/assets/images/main.webp"
                        alt=""
                        aria-hidden="true"
                        className="absolute left-1/2 top-[12px] h-[448px] w-[760px] -translate-x-1/2 object-contain opacity-[0.82]"
                      />

                      <div className="absolute inset-x-[72px] bottom-[8px] h-[88px] rounded-full bg-[radial-gradient(circle,rgba(141,151,255,0.28),rgba(141,151,255,0.06),transparent_72%)] blur-xl" />

                      {slide.products.map((product) => (
                        <ProductPack key={product.id} product={product} />
                      ))}
                    </div>
                  </div>
                </article>
              );
            })}

            <button
              type="button"
              onClick={() => goToSlide(currentIndex - 1)}
              className="absolute left-3 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#231f20] bg-white/95 text-[#231f20] transition-all duration-300 hover:bg-[#231f20] hover:text-white md:left-6 md:h-[54px] md:w-[54px]"
              aria-label="Slide trước"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={() => goToSlide(currentIndex + 1)}
              className="absolute right-3 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#231f20] bg-white/95 text-[#231f20] transition-all duration-300 hover:bg-[#231f20] hover:text-white md:right-6 md:h-[54px] md:w-[54px]"
              aria-label="Slide tiếp theo"
            >
              <ArrowRight className="h-5 w-5" />
            </button>

            <div className="absolute bottom-5 right-5 z-30 flex items-center gap-2.5 md:bottom-8 md:right-10">
              {showcaseSlides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => goToSlide(index)}
                  className={`h-3.5 w-3.5 rounded-full border border-white/90 transition-all duration-300 ${
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
