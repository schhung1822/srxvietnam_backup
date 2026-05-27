'use client';

const defaultBadges = [
  {
    id: 'tag-1',
    src: '/assets/images/home/3.icon1.webp',
    alt: 'Chứng minh lâm sàng bởi chuyên gia',
    title: 'Chứng minh lâm sàng bởi chuyên gia',
  },
  {
    id: 'tag-2',
    src: '/assets/images/home/3.icon2.webp',
    alt: 'Tiêu chuẩn quốc tế cao nhất',
    title: 'Tiêu chuẩn quốc tế cao nhất',
  },
  {
    id: 'tag-3',
    src: '/assets/images/home/3.icon3.webp',
    alt: 'Công nghệ dẫn truyền đột phá',
    title: 'Công nghệ dẫn truyền đột phá',
  },
  {
    id: 'tag-4',
    src: '/assets/images/home/3.icon4.webp',
    alt: 'An toàn và lành tính',
    title: 'An toàn và lành tính',
  },
];

export default function HomeStandardsSection({
  quote = 'Tại SRX, chúng tôi tin rằng thấu hiểu làn da bản địa là chìa khóa của vẻ đẹp bền vững. Năm 2020, sau hành trình dài nghiên cứu về khí hậu và cơ địa đặc thù tại Việt Nam, chúng tôi tự hào mang đến giải pháp chăm sóc da tối ưu, an toàn và tương thích với làn da nhạy cảm của người Việt. Công nghệ quốc tế, hiệu quả nội tại - đó là cam kết từ SRX.',
  badges = defaultBadges,
}) {
  return (
    <section className="relative overflow-hidden bg-white px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-y-0 left-[-14%] w-[42%] bg-[radial-gradient(circle_at_center,rgba(150,176,255,0.32)_0%,rgba(150,176,255,0.18)_28%,rgba(255,255,255,0)_72%)] blur-2xl" />
        <div className="absolute inset-y-0 right-[-14%] w-[42%] bg-[radial-gradient(circle_at_center,rgba(246,177,233,0.3)_0%,rgba(246,177,233,0.18)_28%,rgba(255,255,255,0)_72%)] blur-2xl" />
        <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(to_right,rgba(180,189,224,0.16)_1px,transparent_1px)] [background-size:38px_100%]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0),rgba(255,255,255,0.72)_66%,rgba(255,255,255,0.94)_100%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1480px]">
        <div className="mx-auto max-w-[980px] text-center">
          <p
            className="text-[14px] leading-[1.85] tracking-[-0.02em] text-[#616161] sm:text-[16px] lg:text-[18px]"
            style={{ fontFamily: '"Inter", "Hubot Sans", sans-serif' }}
          >
            "{quote}"
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 justify-items-center gap-x-5 gap-y-8 sm:mt-14 sm:gap-x-8 sm:gap-y-10 lg:grid-cols-4 lg:gap-x-10">
          {badges.map((badge) => (
            <article key={badge.id} className="group flex w-full max-w-[290px] flex-col items-center text-center">
              <div className="w-full max-w-[180px] sm:max-w-[240px] lg:max-w-[280px]">
                <div className="rounded-full transition-transform duration-300 group-hover:-translate-y-1">
                  <div className="aspect-square overflow-hidden rounded-full">
                    <img
                      src={badge.src}
                      alt={badge.alt}
                      className="h-full w-full rounded-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                </div>
                <p className="text-[15px] sm:text-[16px] font-semibold max-w-[180px] mx-auto text-[#616161]">{badge.title}</p>

              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

