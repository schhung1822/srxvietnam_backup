const foundersParagraphs = [
  "SRX - Tự hào cam kết về tính chuyên môn khoa học trị liệu chạm đến làn da",
  "“Ngay từ những ngày đầu đặt viên gạch đầu tiên cho hệ sinh thái, SRX đã kiên định rẽ lối đi riêng, tách biệt khỏi các phương thức làm đẹp nể nổi thông thường. SRX không đơn thuần định vị mình là một đơn vị sản xuất mỹ phẩm, chúng tôi tự hào mang đến “Dấu ấn Rx” -  một chứng thư cao quý đại diện cho tinh hoa thật nghiệm cận, phác đồ chuyên khoa hóa và hiệu quả trị liệu được chứng minh lâm sàng trong từng hoạt động chất.”",
  "Chúng tôi theo đuổi triết lý “Mỹ phẩm nội khoa” đích thực. Đó là nơi mỗi công thức ra đời đều mang một sứ mệnh y khoa sâu sắc, một trải nghiệm cảm quan tinh lọc được thiết kế để tiệm thấu và chữa lành từ cấp độ bào. Trải qua nhiều năm hoàn thiện cấu trúc, hệ sinh thái SRX giờ đây là sự kết hợp hoàn mỹ giữa nghiên cứu khoa học tiên tiến và khả năng thấu hiểu trọn vẹn những đặc trưng sinh học nhạy cảm của làn da Châu Á trước áp lực của khí hậu và môi trường hiện tại.",
];

const visionParagraphs = [
  "Trở thành thương hiệu dược mỹ phẩm tiên phong chuẩn hóa thị trường thẩm mỹ nội khoa, đóng vai trò là cầu nối vững chắc giữa khoa học trị liệu và sức khỏe làn da.",
  "SRX định hướng thiết lập những tiêu chuẩn mới về sự minh bạch và tính tương thích sinh học, mang đến các giải pháp làm đẹp chuyên sâu, an toàn và bền vững. Là sự lựa chọn tin cậy hàng đầu cho cộng đồng chuyên gia (Bác sĩ, chủ Spa/Clinic) và người tiêu dùng.",
];

const missionParagraphs = [
  "SRX cam kết mang đến hệ sinh thái sản phẩm dựa trên nền tảng khoa học chính xác, giúp giải quyết các vấn đề da liễu phức tạp thông qua",
  "Chuẩn hóa giải pháp chuyên môn: Đồng hành cùng các bác sĩ, chuyên gia và chủ Spa/Clinic bằng những phác đồ điều trị linh hoạt, minh bạch về thành phần và nồng độ.",
  "Tái tạo sức khỏe làn da: Sử dụng các công nghệ tiên tiến nhất để phục hồi và nuôi dưỡng làn da từ cấp độ tế bào, giúp khách hàng tự tin với vẻ đẹp nguyên bản.",
  "Kiến tạo niềm tin khoa học: Thay đổi thói quen chăm sóc da của người tiêu dùng theo hướng bền vững bằng cách dựa trên bằng chứng khoa học thực nghiệm",
];

const philosophyParagraphs = [
  "'Minimal yet Powerful – Tối giản nhưng Mạnh mẽ' Triết lý của SRX được xây dựng dựa trên 4 trụ cột cốt lõi:",
  'Khoa học & Chính xác: Mọi công thức đều được nghiên cứu rõ ràng, kiểm soát nồng độ phù hợp và dựa trên thực nghiệm lâm sàng khắt khe. Chúng tôi không chạy theo trào lưu, chúng tôi tập trung vào kết quả thực tế.',
  "Cá nhân hóa: Thấu hiểu mỗi làn da là một nền tảng sinh học riêng biệt để tạo ra các sản phẩm như những 'mảnh ghép linh hoạt', cho phép chuyên gia tùy chỉnh phác đồ tối ưu cho từng cá nhân.",
  "An toàn & Hiệu quả: Đạt tiêu chuẩn quốc tế cao nhất như KFDA, SGS, ISO 22716 - GMP. Sản phẩm được thiết kế để mang lại hiệu quả điều trị tối ưu nhưng vẫn đảm bảo tính lành tính, giảm thiểu rủi ro kích ứng, kể cả với những làn da nhạy cảm nhất.",
  "Minh bạch: Rõ ràng công khai trong mọi khía cạnh từ thành phần, cơ chế tác động đến thông tin truyền tải để xây dựng niềm tin tuyệt đối với khách hàng."
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
                Brand Story
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
              src="/assets/images/about/nourishing_ampoule_2.webp"
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
              src="/assets/images/about/lipoderm_mask.webp"
              alt="Sản phẩm SRX đại diện cho triết lý thương hiệu"
              backgroundClass="bg-[#f3f3f3]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
