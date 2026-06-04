'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
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
    question: "Kem SRX Retinol Enhance Peel chứa nồng độ Retinol lên tới 8% thì có gây kích ứng, bong tróc da không?",
    answer:
      "Dù chứa phức hợp Retinol nồng độ rất cao (Retinol Complex 8%) kết hợp với Glycolic Acid 5%, SRX Retinol Enhance Peel được thiết kế công nghệ thế hệ mới giúp đem lại hiệu quả tái tạo, làm mờ nhăn và căng bóng da cao nhất mà hoàn toàn không gây kích ứng hay khó chịu trên da. ",
    image: "/assets/images/home/sl3.webp",
  },
  {
    id: "bio-recovery-system",
    number: "004",
    question: "Da vừa thực hiện can thiệp xâm lấn (laser, peel da, phi kim) hoặc đang dùng treatment mạnh thì nên dùng sản phẩm nào?",
    answer:
      "Bạn rất nên sử dụng Gel tăng cường phục hồi da SRX Recovery Booster hoặc Tinh chất SRX Nourishing Ampoule. Cả hai sản phẩm này đều là trợ thủ đắc lực giúp cấp nước tức thì, khôi phục hàng rào bảo vệ và cực kỳ an toàn cho làn da đang dùng treatment (như Retinoids) hoặc da đang tổn thương sau xâm lấn.",
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

const orbitDots = [0, 90, 180, 270];
const orbitDuration = 9;

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
      };
    });
  }, [items]);

  const [activeIndex, setActiveIndex] = useState(0);
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

            <div className="absolute inset-0">
              {orbitDots.map((angle) => (
                <span
                  key={angle}
                  className="absolute inset-0 animate-faq-orbit-slow"
                  style={{
                    animationDelay: `${-(angle / 360) * orbitDuration}s`,
                    animationDuration: `${orbitDuration}s`,
                  }}
                >
                  <span className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#7e98ff] shadow-[0_0_0_3px_rgba(126,152,255,0.12)] sm:h-3.5 sm:w-3.5" />
                </span>
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
            className="mt-4 text-center text-[30px] font-medium leading-[1.35] tracking-[-0.06em] sm:text-[50px] lg:text-[72px]"
            revealedClassName="text-black"
            baseStyle={{ color: 'rgba(0,0,0,0.14)' }}
            style={{ fontFamily: '"Manrope", "Hubot Sans", sans-serif' }}
          >
            {title}
          </ScrollRevealHeading>
        </div>

        <div className="mx-auto mt-12 space-y-4 sm:mt-16 lg:mt-20">
          {faqItems.map((item, index) => {
            const isActive = index === activeIndex;
            const answerId = `${item.id}-answer`;

            return (
              <article
                key={item.id}
                className={`overflow-hidden rounded-[8px] border-l-[3px] bg-[#faf9ff] shadow-[0_16px_34px_rgba(61,55,122,0.08)] ring-1 ring-[#eeeafd] transition-[background-color,border-color,box-shadow] duration-300 ${
                  isActive
                    ? "border-l-[#5d4cc4] bg-[#f8f6ff] shadow-[0_18px_42px_rgba(61,55,122,0.12)]"
                    : "border-l-[#cac4ef]"
                }`}
              >
                <button
                  type="button"
                  onClick={() =>
                    setActiveIndex((current) => (current === index ? null : index))
                  }
                  className="grid w-full grid-cols-[minmax(0,1fr)_40px] items-center gap-4 px-4 py-4 text-left sm:grid-cols-[minmax(0,1fr)_48px] sm:px-6 sm:py-5"
                  aria-expanded={isActive}
                  aria-controls={answerId}
                >
                  <span
                    className="min-w-0 text-[15px] font-semibold leading-[1.35] text-[#17122f] sm:text-[19px]"
                    style={{ fontFamily: '"Inter", "Hubot Sans", sans-serif' }}
                  >
                    {item.question}
                  </span>

                  <span className="flex h-9 w-9 items-center justify-center justify-self-end rounded-full bg-[#5d4cc4] text-white shadow-[0_10px_22px_rgba(93,76,196,0.25)] sm:h-10 sm:w-10">
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-300 ${
                        isActive ? "rotate-180" : ""
                      }`}
                      strokeWidth={2.4}
                    />
                  </span>
                </button>

                <div
                  id={answerId}
                  className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-500 ease-out ${
                    isActive ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="min-h-0 px-4 sm:px-6">
                    <p
                      className="max-w-[920px] pb-5 text-[13px] leading-[1.75] text-[#3a3654] sm:pb-6 sm:text-[15px]"
                      style={{ fontFamily: '"Inter", "Hubot Sans", sans-serif' }}
                    >
                      {item.answer}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
      <style jsx>{`
        @keyframes faq-orbit-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-faq-orbit-slow {
          animation-name: faq-orbit-slow;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          transform-origin: center;
          will-change: transform;
        }
      `}</style>
    </section>
  );
}
