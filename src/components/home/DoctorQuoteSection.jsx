'use client';

const defaultHighlights = [
  "Công nghệ sinh học",
  "Công nghệ phức hợp Retinol thế hệ mới",
  "Hệ thống phục hồi sinh học chuyên sâu",
  "Hỗ trợ 24/7",
  "Hàng nghìn đối tác",
  "Mỹ phẩm cao cấp Hàn Quốc",
  "Công nghệ Vi Tảo và TECA Liposom",
  "Công nghệ tế bào gốc và hoạt chất sinh học",
  "Cam kết chất lượng cao",
  "92% khách hàng đánh giá 5 sao",
];

export default function DoctorQuoteSection({
  doctorImage = "/assets/images/home/doctor.webp",
  doctorAlt = "Bác sĩ chuyên khoa da liễu",
  highlights = defaultHighlights,
}) {
  const marqueeItems = [...highlights, ...highlights];

  return (
    <section className="relative overflow-hidden bg-white pt-12 sm:pt-24 lg:pt-40">
      <div className="absolute inset-x-0 bottom-12 top-[0%] bg-[#e8efff] sm:bottom-20 sm:top-[32%]" />
      <div className="absolute inset-x-0 bottom-0 h-12 bg-[#e8efff] sm:h-20" />

      <div className="relative z-10 mx-auto max-w-[1680px] px-4 sm:px-6 lg:px-8">
        <div className="relative flex min-h-[470px] items-end sm:min-h-[620px] lg:min-h-[760px]">
          <div className="relative w-full">
            <div className="relative ml-0 mr-0 rounded-[34px] bg-[linear-gradient(90deg,#6f8ff8_0%,#8ea0f1_36%,#efb2e8_100%)] px-5 pb-14 pt-8 text-white shadow-[0_28px_80px_rgba(120,148,236,0.2)] sm:rounded-[60px] sm:px-8 sm:pb-36 sm:pt-16 lg:mb-20 lg:rounded-[80px] lg:px-12 lg:py-20 lg:pr-[clamp(240px,31vw,520px)] xl:pr-[clamp(320px,34vw,620px)]">
              <div
                className="pointer-events-none absolute left-4 top-[-20px] text-[82px] font-semibold leading-[82px] text-white/95 sm:left-8 sm:top-[-24px] sm:text-[128px] lg:left-14 lg:top-[-10px] lg:text-[190px]"
                style={{ fontFamily: '"Macondo Swash Caps", "Times New Roman", serif' }}
                aria-hidden="true"
              >
                "
              </div>

              <p
                className="relative max-w-[980px] text-[15px] font-medium leading-[1.75] tracking-[-0.03em] text-white sm:text-[20px] sm:leading-[1.65] lg:max-w-none lg:text-[24px] lg:leading-[1.58]"
                style={{ fontFamily: '"Inter", "Hubot Sans", sans-serif' }}
              >
                <b>Thạc sĩ, Bác sĩ Nội trú chuyên ngành Da liễu Hoàng Văn Tâm:</b> Bác sĩ đánh giá rất cao các giải pháp chăm sóc da của hãng. Đặc biệt, sản phẩm <b>SRX Nourishing Ampoule đã được đích thân Bác sĩ Tâm gợi ý sử dụng trong cuốn sách cẩm nang <i>"Chăm sóc da trọn đời"</i></b>. Ngoài ra, Bác sĩ Tâm còn trực tiếp đồng hành cùng nhãn hàng trong chiến dịch "SRX Việt Nam đồng hành cùng Bác sĩ Hoàng Văn Tâm - Lan tỏa giá trị chăm sóc da khoa học" nhằm lan tỏa những kiến thức chuẩn y khoa đến cộng đồng.
              </p>
            </div>

            <div className="pointer-events-none relative mx-auto mt-[-28px] flex max-w-[420px] justify-center sm:mt-[-48px] sm:max-w-[540px] lg:absolute lg:bottom-0 lg:right-0 lg:mt-0 lg:max-w-[clamp(260px,30vw,520px)] xl:max-w-[clamp(320px,34vw,620px)]">
              <img
                src={doctorImage}
                alt={doctorAlt}
                className="h-auto w-full object-contain drop-shadow-[0_24px_36px_rgba(164,176,224,0.24)]"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-20 overflow-hidden">
        <div className="flex w-max animate-doctor-quote-marquee items-center bg-[#d6e1ff] py-3.5 sm:py-5">
          {marqueeItems.map((item, index) => (
            <div
              key={`${item}-${index}`}
              className="flex shrink-0 items-center gap-3 px-4 sm:gap-10 sm:px-5"
            >
              <svg
                className="animate-svg-spin"
                xmlns="http://www.w3.org/2000/svg"
                width="34"
                height="16"
                fill="none"
                overflow="visible"
              >
                <path
                  d="M 11.172 11.767 C 11.172 11.767 9.665 13.23 7.747 13.06 C 5.828 12.891 4.565 12.136 3.56 10.565 C 2.555 8.994 2.296 5.021 5.92 3.404 C 9.543 1.787 11.888 4.99 11.888 4.99 L 14.887 8.024 L 12.893 10.119 L 14.979 12.213 L 17.034 10.119 L 21.556 14.554 C 21.556 14.554 27.28 18.851 32.563 12.629 C 34.664 9.272 34.086 6.469 33.187 4.482 C 32.289 2.495 29.884 0.015 26.214 0.015 C 22.545 0.015 20.764 2.172 20.764 2.172 L 22.88 4.22 C 22.88 4.22 24.783 2.033 28.194 3.404 C 30.325 4.343 30.934 6.638 30.934 6.638 C 30.934 6.638 31.851 10.695 28.589 12.383 C 25.328 14.07 22.88 11.89 22.88 11.89 L 19.059 8.024 L 21.16 5.899 L 19.059 3.773 L 16.961 5.887 L 13.55 2.437 C 13.55 2.437 10.475 -1.116 5.588 0.358 C 0.701 1.831 -0.132 6.499 0.015 8.763 C 0.163 11.027 2.114 15.232 6.498 15.879 C 10.883 16.526 13.212 13.861 13.212 13.861 Z M 20.767 2.172"
                  fill="rgb(128,229,255)"
                />
              </svg>
              <span
                className="whitespace-nowrap text-[18px] font-medium leading-none tracking-[-0.04em] text-[#788ce6] sm:text-[24px] lg:text-[32px]"
                style={{ fontFamily: '"Manrope", "Hubot Sans", sans-serif' }}
              >
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes doctor-quote-marquee {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-50%, 0, 0);
          }
        }

        @keyframes svg-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-doctor-quote-marquee {
          animation: doctor-quote-marquee 60s linear infinite;
          will-change: transform;
        }

        .animate-svg-spin {
          animation: svg-spin 4s linear infinite;
          transform-origin: center;
          will-change: transform;
        }
      `}</style>
    </section>
  );
}
