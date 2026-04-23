const foundersParagraphs = [
  "SRX được hình thành từ niềm tin rằng chăm sóc da hiệu quả phải bắt đầu từ dữ liệu, khả năng tương thích sinh học và sự minh bạch khoa học.",
  "Ngay từ những ngày đầu, đội ngũ sáng lập đã theo đuổi một hướng đi rõ ràng: xây dựng hệ sinh thái mỹ phẩm nội khoa nơi mỗi công thức đều có mục đích lâm sàng, trải nghiệm cảm quan tinh gọn và hiệu quả đủ bền vững để đồng hành lâu dài cùng làn da châu Á.",
  "Triết lý ấy giúp SRX không chạy theo sự hoàn hảo bề mặt, mà tập trung vào những giá trị cốt lõi hơn: phục hồi, ổn định và nuôi dưỡng nền da khỏe từ bên trong.",
];

const visionParagraphs = [
  "Trở thành cầu nối giữa khoa học và làn da: SRX định vị thương hiệu không chỉ sản xuất dược mỹ phẩm mà còn là cầu nối mang đến những giải pháp làm đẹp tiên tiến, an toàn và bền vững.",
  "Tiên phong chuẩn hóa thị trường thẩm mỹ nội khoa: SRX vượt qua những giới hạn của một thị trường thẩm mỹ chưa được tiêu chuẩn hóa. Từ đó, thương hiệu tự hào tiên phong phân phối các sản phẩm điều trị có nền tảng lâm sàng rõ ràng, dựa trên sự minh bạch và tính tương thích sinh học cao.",
];

const missionParagraphs = [
  "Nâng tầm vị thế cho các đối tác chuyên môn: SRX hướng tới mục tiêu giúp các bác sĩ và cơ sở chuyên môn tại Việt Nam tiếp cận với công nghệ sinh học tiên tiến nhất thế giới, giúp họ nâng tầm vị thế trong ngành làm đẹp & thẩm mỹ.",
];

const philosophyParagraphs = [
  "Gắn kết khoa học và làn da thế hệ mới",
  'SRX được phát triển dựa trên nền tảng khoa học thực tiễn với sự minh bạch tuyệt đối về bảng thành phần. Chính vì vậy, chúng tôi tin rằng: "Sự trung thực chuẩn khoa học quan trọng hơn việc trở nên hoàn hảo".',
  "Thương hiệu tập trung vào việc nghiên cứu những công thức tối giản nhất nhưng phải đạt được sự tối ưu về mặt nồng độ hoạt chất để mang lại hiệu quả thật sự trên làn da.",
  "Sử dụng nguồn nguyên liệu chuyên sâu được chắt lọc chuẩn Châu Âu (đáp ứng tiêu chuẩn SCCS), nhằm tạo ra sự cộng hưởng giúp cải thiện tổng thể các vấn đề về da.",
];

const panelHeightClass = "min-h-[320px] sm:min-h-[460px] lg:min-h-[640px] rounded-[12px]";

function SectionLabel({ children }) {
  return (
    <p
      className="text-[11px] italic uppercase tracking-[0.22em] text-[#111111] sm:text-[12px]"
      style={{ fontFamily: '"Inter", "Hubot Sans", sans-serif' }}
    >
      {children}
    </p>
  );
}

function BodyCopy({ paragraphs, className = "" }) {
  return (
    <div
      className={`space-y-3 text-[13px] leading-[1.55] text-[#232323] sm:text-[14px] ${className}`}
      style={{ fontFamily: '"Inter", "Hubot Sans", sans-serif' }}
    >
      {paragraphs.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </div>
  );
}

function StoryTextPanel({ children }) {
  return (
    <div
      className={`flex ${panelHeightClass} items-center justify-center bg-white px-6 py-8 sm:px-10 sm:py-10 lg:px-16 lg:py-14 xl:px-20`}
    >
      <div className="w-full max-w-[560px]">{children}</div>
    </div>
  );
}

function StoryImagePanel({ src, alt, backgroundClass = "bg-[#f5f5f5]" }) {
  return (
    <div className={`${panelHeightClass} ${backgroundClass} rounded-[12px]`}>
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover rounded-[12px]"
        loading="lazy"
      />
    </div>
  );
}

export default function AboutBrandStorySection() {
  return (
    <section className="bg-white px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-[1800px]">
        <div className="space-y-10 sm:space-y-12 lg:space-y-16">
          <div className="grid items-stretch lg:grid-cols-2 lg:gap-0">
            <StoryTextPanel>
              <h2
                className="text-[38px] font-medium leading-[0.95] tracking-[-0.065em] text-[#151515] sm:text-[52px] lg:text-[66px]"
                style={{ fontFamily: '"Manrope", "Hubot Sans", sans-serif' }}
              >
                The Founders
              </h2>

              <BodyCopy paragraphs={foundersParagraphs} className="mt-5 max-w-[360px]" />
            </StoryTextPanel>

            <StoryImagePanel
              src="/assets/images/about/founders.webp"
              alt="Chân dung người mẫu đại diện cho hình ảnh nhà sáng lập SRX"
              backgroundClass="bg-[#f5f2ef]"
            />
          </div>

          <div className="grid items-stretch lg:grid-cols-2 lg:gap-0">
            <StoryImagePanel
              src="/assets/images/about/tamnhin_sumenh.webp"
              alt="Hình ảnh minh họa công nghệ sinh học cho tầm nhìn và sứ mệnh SRX"
              backgroundClass="bg-[#f3f0ff]"
            />

            <StoryTextPanel>
              <div>
                <SectionLabel>Vision</SectionLabel>
                <h3
                  className="mt-2 text-[34px] font-medium leading-[1] tracking-[-0.06em] text-[#161616] sm:text-[44px] lg:text-[54px]"
                  style={{ fontFamily: '"Manrope", "Hubot Sans", sans-serif' }}
                >
                  Tầm nhìn
                </h3>
                <BodyCopy paragraphs={visionParagraphs} className="mt-4 max-w-[420px]" />
              </div>

              <div className="mt-10 sm:mt-12 lg:mt-16">
                <SectionLabel>Mission</SectionLabel>
                <h3
                  className="mt-1 text-[34px] font-medium leading-[0.96] tracking-[-0.06em] text-[#161616] sm:text-[44px] lg:text-[54px]"
                  style={{ fontFamily: '"Manrope", "Hubot Sans", sans-serif' }}
                >
                  Sứ mệnh
                </h3>
                <BodyCopy paragraphs={missionParagraphs} className="mt-4 max-w-[420px]" />
              </div>
            </StoryTextPanel>
          </div>

          <div className="grid items-stretch lg:grid-cols-2 lg:gap-0">
            <StoryTextPanel>
              <SectionLabel>Brand Philosophy</SectionLabel>
              <h3
                className="mt-1 text-[34px] font-medium leading-[0.96] tracking-[-0.06em] text-[#161616] sm:text-[44px] lg:text-[54px]"
                style={{ fontFamily: '"Manrope", "Hubot Sans", sans-serif' }}
              >
                Triết lý thương hiệu
              </h3>

              <p
                className="mt-5 text-[14px] font-semibold leading-[1.5] text-[#171717] sm:text-[15px]"
                style={{ fontFamily: '"Inter", "Hubot Sans", sans-serif' }}
              >
                Chuẩn khoa học là nền tảng của vẻ đẹp mới.
              </p>

              <BodyCopy paragraphs={philosophyParagraphs} className="mt-4 max-w-[360px]" />
            </StoryTextPanel>

            <StoryImagePanel
              src="/assets/images/about/trietly.webp"
              alt="Sản phẩm SRX đại diện cho triết lý thương hiệu"
              backgroundClass="bg-[#f3f3f3]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
