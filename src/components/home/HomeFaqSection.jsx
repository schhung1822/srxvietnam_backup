'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import ScrollRevealHeading from "./ScrollRevealHeading.jsx";

const defaultFaqItems = [
  {
    id: "peptides-retinol-a-cream",
    number: "001",
    question: "Thương hiệu SRX có xuất xứ từ đâu?",
    answer:
      "SRX là thương hiệu dược mỹ phẩm cao cấp đến từ Hàn Quốc, chính thức ra đời vào năm 2005. SRX có thế mạnh về phục hồi và tái tạo da chuyên sâu, ứng dụng công nghệ tế bào gốc và các hoạt chất sinh học tiên tiến. ",
    image: "/assets/images/home/slider3.webp",
  },
  {
    id: "retinol-8-complex",
    number: "002",
    question: "Sản phẩm SRX tại Việt Nam có chính hãng không?",
    answer:
      "Tại Việt Nam, EAC Group tự hào là nhà phân phối độc quyền của thương hiệu SRX, cam kết mang đến những giải pháp làm đẹp an toàn, hiệu quả và phù hợp nhất với đặc điểm làn da người Việt.",
    image: "/assets/images/home/slider2.webp",
  },
  {
    id: "nourishing-ampoule",
    number: "003",
    question: "Kem SRX Retinol A Cream chứa nồng độ Retinol lên tới 8% thì có gây kích ứng, bong tróc da không?",
    answer:
      "Dù chứa phức hợp Retinol nồng độ rất cao (Retinol Complex 8%) kết hợp với Glycolic Acid 5%, SRX Retinol A Cream được thiết kế công nghệ thế hệ mới giúp đem lại hiệu quả tái tạo, làm mờ nhăn và căng bóng da cao nhất mà hoàn toàn không gây kích ứng hay khó chịu trên da. ",
    image: "/assets/images/home/sl3.webp",
  },
  {
    id: "bio-recovery-system",
    number: "004",
    question: "Da vừa thực hiện can thiệp xâm lấn (laser, peel da, phi kim) hoặc đang dùng treatment mạnh thì nên dùng sản phẩm nào?",
    answer:
      "Bạn rất nên sử dụng Gel tăng cường phục hồi da SRX Recovery Booster hoặc Tinh chất SRX Repair Ampoule. Cả hai sản phẩm này đều là trợ thủ đắc lực giúp cấp nước tức thì, khôi phục hàng rào bảo vệ và cực kỳ an toàn cho làn da đang dùng treatment (như Retinoids) hoặc da đang tổn thương sau xâm lấn.",
    image: "/assets/images/home/sl4.webp",
  },
  {
    id: "core-ingredient-difference",
    number: "005",
    question: "5. Điểm khác biệt trong thành phần cốt lõi của SRX là gì?",
    answer:
      "Sức mạnh của SRX nằm ở sự kết hợp đột phá của Phức hợp 30 loại Peptides (nổi bật là Copper Tripeptide-1 giúp đẩy nhanh tốc độ lành vết thương và sửa chữa DNA),. Bên cạnh đó, các sản phẩm còn chứa hệ dưỡng chất phục hồi hàng rào bảo vệ vững chắc như Ceramides, Panthenol, Betaine và Sodium Hyaluronate.",
    image: "/assets/images/home/sl1.webp",
  },
  {
    id: "suitable-skin-types",
    number: "006",
    question: "Sản phẩm của SRX phù hợp với những nền da nào?",
    answer:
      "Các sản phẩm của SRX được chỉ định an toàn cho mọi loại da,. Đặc biệt, SRX tập trung giải quyết triệt để các vấn đề cho làn da nhạy cảm, thiếu nước, da lão hóa (nhiều nếp nhăn, thô ráp), da tăng sắc tố (nám, sạm) và da có lỗ chân lông to. ",
    image: "/assets/images/home/sl2.webp",
  },
];


const orbitDots = [
  "left-1/2 top-0 -translate-x-1/2 -translate-y-1/2",
  "right-0 top-1/2 translate-x-1/2 -translate-y-1/2",
  "left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2",
  "left-0 top-1/2 -translate-x-1/2 -translate-y-1/2",
];

export default function HomeFaqSection({
  title = "Câu hỏi thường gặp",
  items = defaultFaqItems,
}) {
  const faqItems = useMemo(() => {
    if (!Array.isArray(items) || items.length === 0) {
      return defaultFaqItems;
    }

    const usedIds = new Map();

    return items.map((item, index) => {
      const baseId = String(item.id ?? `faq-item-${index + 1}`).trim() || `faq-item-${index + 1}`;
      const duplicateCount = usedIds.get(baseId) ?? 0;
      usedIds.set(baseId, duplicateCount + 1);

      return {
        id: duplicateCount === 0 ? baseId : `${baseId}-${duplicateCount + 1}`,
        number:
          item.number ??
          String(index + 1).padStart(3, "0"),
        question: item.question ?? item.title ?? "",
        answer: item.answer ?? item.description ?? "",
        image: item.image ?? item.thumbnail ?? "",
      };
    });
  }, [items]);

  const [activeIndex, setActiveIndex] = useState(null);
  const faqOrbitRef = useRef(null);
  const faqCoreRef = useRef(null);

  useEffect(() => {
    if (activeIndex !== null && activeIndex > faqItems.length - 1) {
      setActiveIndex(null);
    }
  }, [activeIndex, faqItems.length]);

  const resetFaqCorePosition = () => {
    if (faqCoreRef.current) {
      faqCoreRef.current.style.transform = "translate3d(0, 0, 0)";
    }
  };

  const handleFaqOrbitMouseMove = (event) => {
    if (!faqOrbitRef.current || !faqCoreRef.current) {
      return;
    }

    const rect = faqOrbitRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = event.clientX - centerX;
    const deltaY = event.clientY - centerY;
    const distance = Math.hypot(deltaX, deltaY);
    const magneticRadius = 50;

    if (distance > magneticRadius) {
      resetFaqCorePosition();
      return;
    }

    const strength = (magneticRadius - distance) / magneticRadius;
    const safeDistance = Math.max(distance, 1);
    const maxOffset = 6;
    const offsetX = (deltaX / safeDistance) * maxOffset * strength;
    const offsetY = (deltaY / safeDistance) * maxOffset * strength;

    faqCoreRef.current.style.transform = `translate3d(${offsetX.toFixed(2)}px, ${offsetY.toFixed(2)}px, 0)`;
  };

  return (
    <section className="bg-white py-12 sm:py-16 lg:py-24">
      <div className="mx-auto max-w-[1800px] min-h-[780px] lg:min-h-[1020px] px-4 sm:px-6 lg:px-5">
        <div className="flex flex-col items-center">
          <div
            ref={faqOrbitRef}
            className="relative flex h-[106px] w-[106px] items-center justify-center"
            onMouseMove={handleFaqOrbitMouseMove}
            onMouseLeave={resetFaqCorePosition}
          >
            <div className="absolute inset-0 rounded-full border border-[#d8dbff]" />
            <div className="absolute inset-[14px] rounded-full border border-[#e9d2ff]" />

            <div className="absolute inset-0 animate-faq-orbit-slow">
              {orbitDots.map((position) => (
                <span
                  key={position}
                  className={`absolute h-3 w-3 rounded-full bg-[#7e98ff] shadow-[0_0_0_3px_rgba(126,152,255,0.12)] sm:h-3.5 sm:w-3.5 ${position}`}
                />
              ))}
            </div>

            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div
                ref={faqCoreRef}
                className="relative z-10 flex h-[50px] w-[50px] items-center justify-center transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform"
              >
                <span className="absolute inset-[-14px] rounded-full bg-[radial-gradient(circle,rgba(218,191,255,0.74)_0%,rgba(218,191,255,0.24)_45%,rgba(218,191,255,0)_78%)] blur-[10px]" />
                <div className="relative flex h-[50px] w-[50px] items-center justify-center rounded-full bg-[radial-gradient(circle_at_top,#ffb6eb,#f78dde_65%,#e97dd5)] ring-1 ring-white/35 shadow-[0_12px_24px_rgba(197,158,254,0.26)]">
                  <Sparkles className="h-4 w-4 text-white" strokeWidth={2.3} />
                </div>
              </div>
            </div>
          </div>

          <ScrollRevealHeading
            as="h2"
            className="mt-4 text-center text-[30px] font-medium leading-[1.3] tracking-[-0.06em] sm:text-[50px] lg:text-[72px]"
            revealedClassName="text-black"
            baseStyle={{ color: 'rgba(0,0,0,0.14)' }}
            style={{ fontFamily: '"Manrope", "Hubot Sans", sans-serif' }}
          >
            {title}
          </ScrollRevealHeading>
        </div>

        <div className="mt-12 overflow-hidden border-t border-[#e5e5e5] sm:mt-16 lg:mt-20">
          {faqItems.map((item, index) => {
            const isActive = index === activeIndex;
            const hasImage = Boolean(item.image);

            return (
              <article
                key={item.id}
                className={`group border-b border-[#e5e5e5] transition-colors duration-300 ${
                  isActive ? "border-[#181818]" : ""
                }`}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() =>
                  setActiveIndex((current) => (current === index ? null : current))
                }
              >
                <button
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  onFocus={() => setActiveIndex(index)}
                  onBlur={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget)) {
                      setActiveIndex((current) => (current === index ? null : current));
                    }
                  }}
                  className="w-full text-left"
                  aria-expanded={isActive}
                >
                  <div
                    className="grid min-h-[64px] grid-cols-[56px_minmax(0,1fr)_40px] items-center gap-3 px-0 transition-[color,min-height] duration-300 sm:min-h-[82px] sm:grid-cols-[92px_minmax(0,1fr)_64px] sm:gap-8 lg:min-h-[88px] lg:grid-cols-[110px_minmax(0,1fr)_88px] lg:px-0"
                  >
                    <div
                      className={`text-[26px] font-semibold leading-none tracking-[-0.04em] sm:text-[38px] lg:text-[42px] ${
                        isActive ? "text-black" : "text-[#bcbcbc]"
                      }`}
                      style={{ fontFamily: '"Inter", "Hubot Sans", sans-serif' }}
                    >
                      {item.number}
                    </div>

                    <div
                      className={`min-w-0 text-[14px] font-semibold leading-[1.18] tracking-[-0.04em] sm:text-[24px] lg:text-[26px] ${
                        isActive ? "text-black" : "text-[#b9b9b9]"
                      }`}
                      style={{ fontFamily: '"Inter", "Hubot Sans", sans-serif' }}
                    >
                      {item.question}
                    </div>

                    <div className="flex justify-self-end sm:flex">
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-300 sm:h-12 sm:w-12 lg:h-12 lg:w-12 ${
                          isActive
                            ? "bg-black text-white"
                            : "bg-black text-white group-hover:bg-[#181818]"
                        }`}
                      >
                        <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" strokeWidth={2.3} />
                      </span>
                    </div>
                  </div>
                </button>

                <div
                  className={`grid overflow-hidden transition-[grid-template-rows,opacity,margin] duration-500 ease-out ${
                    isActive ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="min-h-0">
                    <div className="pb-5 sm:grid sm:grid-cols-[92px_minmax(0,1fr)_64px] sm:gap-8 sm:pb-7 lg:grid-cols-[110px_minmax(0,1fr)_88px] lg:pb-8">
                      <div className="hidden sm:block" />

                      <div className={hasImage ? "lg:grid lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start lg:gap-10" : ""}>
                        <div className="min-h-0 overflow-hidden">
                          <p
                            className="max-w-[760px] text-[14px] leading-[1.7] text-black/92 sm:text-[18px]"
                            style={{ fontFamily: '"Inter", "Hubot Sans", sans-serif' }}
                          >
                            {item.answer}
                          </p>
                        </div>

                        {hasImage ? (
                          <div className="min-h-0 overflow-hidden lg:block">
                            <div
                              className={`mt-6 flex justify-start transition-[transform,opacity] duration-500 ease-out lg:mt-0 lg:justify-end ${
                                isActive
                                  ? "translate-y-0 opacity-100"
                                  : "translate-y-6 opacity-0"
                              }`}
                            >
                              <div className="animate-faq-thumb-float hidden sm:block overflow-hidden rounded-[6px] shadow-[0_16px_36px_rgba(78,96,173,0.16)] ring-1 ring-black/4">
                                <img
                                  src={item.image}
                                  alt={item.question}
                                  className="h-[120px] w-[190px] rotate-[-5deg] object-cover sm:h-[168px] sm:w-[280px]"
                                  loading="lazy"
                                />
                              </div>
                            </div>
                          </div>
                        ) : null}
                      </div>

                      <div className="hidden sm:block" />
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
