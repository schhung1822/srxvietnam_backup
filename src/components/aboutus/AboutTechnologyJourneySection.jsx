const technologyCards = [
  {
    id: 'stem-cell-bio-actives',
    title: 'Công nghệ Tế bào gốc & Hoạt chất sinh học tiên tiến',
    description:
      'Nền tảng công nghệ cốt lõi giúp SRX tập trung vào khả năng phục hồi, tái tạo và củng cố sức sống cho làn da bằng các hoạt chất sinh học có tính ứng dụng cao.',
    backgroundImage: '/assets/images/about/dc1.webp',
    backgroundPosition: '14% center',
  },
  {
    id: 'teca-liposome',
    title: 'Công nghệ màng bọc TECA Liposome',
    description:
      'Cấu trúc màng bọc ổn định giúp hoạt chất tiếp cận bề mặt da mượt hơn, tăng khả năng dung nạp và hỗ trợ đưa tinh chất vào đúng điểm da cần chăm sóc.',
    backgroundImage: '/assets/images/about/dc2.webp',
    backgroundPosition: '70% center',
    foregroundClassName:
      'bottom-0 left-5 w-[32%] min-w-[92px] sm:left-6 sm:w-[28%] lg:left-7 lg:w-[26%]',
  },
  {
    id: 'bio-microneedling',
    title: 'Công nghệ Vi Tảo (Microneedle Spicule / Bio-Microneedling)',
    description:
      'Vi tảo sinh học tạo nên những vi dẫn siêu nhỏ giúp tăng khả năng dẫn truyền hoạt chất, hỗ trợ quá trình làm mới bề mặt da và tối ưu hiệu quả của routine điều trị.',
    backgroundImage: '/assets/images/about/dc3.webp',
    backgroundPosition: 'center center',
  },
  {
    id: 'peptides-5',
    title: 'Công nghệ PEPTIDES sinh học 5.0 - Quyền năng trẻ hóa thế hệ mới',
    description:
      'Tổ hợp peptide được thiết kế để hỗ trợ độ săn chắc, cải thiện cảm giác đàn hồi và mang lại hiệu ứng bề mặt da mịn, khỏe, sáng hơn theo thời gian.',
    backgroundImage: '/assets/images/about/dc4.webp',
    foregroundClassName:
      'bottom-0 left-1/2 w-[56%] min-w-[160px] -translate-x-1/2 sm:w-[48%] lg:w-[52%]',
  },
];

function TechnologyCard({
  title,
  description,
  backgroundImage,
  backgroundPosition = 'center center',
  backgroundClassName = 'bg-[#f2f2f2]',
  foregroundImage,
  foregroundClassName = '',
}) {
  return (
    <article className="group relative min-h-[420px] overflow-hidden rounded-[18px] bg-white sm:min-h-[500px] lg:min-h-[560px]">
      <div className={`absolute inset-0 ${backgroundClassName}`} />

      {backgroundImage ? (
        <img
          src={backgroundImage}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          style={{ objectPosition: backgroundPosition }}
          loading="lazy"
        />
      ) : null}

      {foregroundImage ? (
        <img
          src={foregroundImage}
          alt=""
          aria-hidden="true"
          className={`pointer-events-none absolute z-[1] h-auto object-contain transition-transform duration-700 ease-out group-hover:scale-[1.03] ${foregroundClassName}`}
          loading="lazy"
        />
      ) : null}

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_20%,rgba(0,0,0,0.3)_72%,rgba(0,0,0,0.7)_100%)] transition-opacity duration-500 group-hover:opacity-0" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08)_0%,rgba(0,0,0,0.48)_48%,rgba(0,0,0,0.88)_100%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <div className="absolute inset-x-0 bottom-0 z-[2] p-5 sm:p-6 lg:p-7">
        <div className="translate-y-0 transition-transform duration-500 ease-out group-hover:-translate-y-4">
          <div className="flex items-end justify-between gap-4">
            <h3
              className="max-w-[85%] text-[18px] font-medium leading-[1.02] tracking-[-0.05em] text-white sm:text-[20px] lg:text-[22px]"
              style={{ fontFamily: '"Manrope", "Hubot Sans", sans-serif' }}
            >
              {title}
            </h3>

            <span className="relative mb-1 block h-5 w-5 shrink-0 text-white transition-transform duration-300 group-hover:rotate-90">
              <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-current" />
              <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-current" />
            </span>
          </div>

          <div className="overflow-hidden">
            <p
              className="max-h-0 max-w-[92%] translate-y-3 pt-0 text-[14px] leading-[1.55] text-white/90 opacity-0 transition-all duration-500 ease-out group-hover:max-h-40 group-hover:translate-y-0 group-hover:pt-5 group-hover:opacity-100 sm:text-[15px]"
              style={{ fontFamily: '"Inter", "Hubot Sans", sans-serif' }}
            >
              {description}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function AboutTechnologyJourneySection() {
  return (
    <section className="bg-white px-4 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-[1800px] px-[20px]">
        <div className="mx-auto max-w-[980px]">
          <p
            className="bg-[linear-gradient(90deg,#7b90ff_0%,#f0a8e8_100%)] bg-clip-text text-center text-[24px] font-medium leading-[1.3] tracking-[-0.06em] text-transparent sm:text-[40px] lg:text-[60px]"
            style={{ fontFamily: '"Manrope", "Hubot Sans", sans-serif' }}
          >
            “Hành trình đưa công nghệ sinh học đến gần hơn với làn da Việt”
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:mt-24 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.58fr)] lg:items-end">
          <div>
            <h2
              className="text-[34px] font-medium leading-[0.98] tracking-[-0.06em] text-[#111111] sm:text-[48px] lg:text-[64px]"
              style={{ fontFamily: '"Manrope", "Hubot Sans", sans-serif' }}
            >
              Từ phòng nghiên cứu tới làn da
            </h2>
          </div>

          <p
            className="max-w-[420px] text-[15px] leading-[1.55] text-[#1f1f1f] lg:justify-self-end lg:text-[16px]"
            style={{ fontFamily: '"Inter", "Hubot Sans", sans-serif' }}
          >
            SRX không chỉ đơn thuần tạo ra mỹ phẩm, mà là sự chuyển giao những thành tựu
            công nghệ sinh học tiên tiến nhất từ phòng lab đến trực tiếp làn da của bạn.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {technologyCards.map((card) => (
            <TechnologyCard key={card.id} {...card} />
          ))}
        </div>
      </div>
    </section>
  );
}
