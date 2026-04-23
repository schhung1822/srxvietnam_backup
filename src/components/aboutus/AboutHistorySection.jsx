const historyItems = [
  {
    year: "2005",
    title: "Ra đời và khẳng định tên tuổi tại Hàn Quốc",
    description:
      "Ra đời và khẳng định tên tuổi tại Hàn Quốc: SRX chính thức được thành lập tại Hàn Quốc. Thương hiệu tập trung vào thế mạnh là phục hồi và tái tạo da chuyên sâu, ứng dụng công nghệ tế bào gốc và các hoạt chất sinh học tiên tiến. Nhờ các công thức khoa học, hiện đại, SRX nhanh chóng tạo được tiếng vang lớn và các sản phẩm của hãng được chứng nhận, tin dùng rộng rãi tại nhiều phòng mạch, viện da liễu, Spa và Clinic.",
    image: "/assets/images/about/history1.webp",
    imageAlt: "Chân dung đại diện cho giai đoạn khởi đầu của thương hiệu SRX",
    imageClassName: "object-cover object-center",
  },
  {
    year: "2010",
    title: "Vươn tầm quốc tế",
    description:
      "Vươn tầm quốc tế: Từ thành công tại thị trường nội địa, SRX đã mở rộng mạng lưới ra thị trường thế giới và có mặt tại nhiều quốc gia lớn như Mỹ, Đức, Pháp.",
    image: "/assets/images/about/history2.webp",
    imageAlt: "Khối thị giác ánh ngọc biểu trưng cho giai đoạn mở rộng quốc tế của SRX",
    imageClassName: "object-cover object-center",
  },
  {
    year: "2022",
    title: "Bước ngoặt tại thị trường Việt Nam",
    description:
      "Bước ngoặt tại thị trường Việt Nam: Sau một thời gian dài nghiên cứu chuyên sâu về thị trường, môi trường sống cũng như đặc điểm cơ địa của người Việt, SRX đã chính thức phát triển các dòng sản phẩm chuyên biệt nhằm đem lại giải pháp khắc phục hiệu quả các vấn đề da cho người dùng Việt Nam.",
    image: "/assets/images/about/history3.webp",
    imageAlt: "Các hộp sản phẩm SRX tượng trưng cho bước phát triển tại Việt Nam",
    imageClassName: "object-cover object-center",
  },
  {
    year: "2025",
    title: "Phân phối độc quyền và phát triển mạnh mẽ",
    description:
      "Phân phối độc quyền và phát triển mạnh mẽ: Tại Việt Nam, EAC Group là đơn vị đối tác phân phối độc quyền của SRX, cam kết mang lại những giải pháp chăm sóc da hiệu quả và an toàn nhất. Thương hiệu ngày càng khẳng định vị thế vững chắc khi liên tục đồng hành cùng các chuyên gia, bác sĩ da liễu (như Bác sĩ Hoàng Văn Tâm trong việc lan tỏa giá trị chăm sóc da khoa học) và bùng nổ tại các sự kiện lớn của ngành làm đẹp như Beauty Summit 2025 hay triển lãm Cosmoprof CBE ASEAN 2025.",
    image: "/assets/images/about/banner.webp",
    imageAlt: "Sản phẩm ampoule của SRX đại diện cho giai đoạn tăng trưởng mạnh",
    imageClassName: "object-cover object-center",
  },
];

export default function AboutHistorySection() {
  return (
    <section className="bg-white px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-[1800px] px-[20px]">
        <div className="max-w-[840px]">
          <h2
            className="text-[42px] font-medium leading-[0.95] tracking-[-0.07em] text-[#121212] sm:text-[56px] lg:text-[72px]"
            style={{ fontFamily: '"Manrope", "Hubot Sans", sans-serif' }}
          >
            Lịch sử thương hiệu
          </h2>
        </div>

        <div className="mt-8 grid gap-8 sm:mt-10 sm:grid-cols-2 lg:mt-12 lg:grid-cols-4 lg:gap-4 xl:gap-5">
          {historyItems.map((item) => (
            <article key={item.year} className="flex flex-col">
              <div className="overflow-hidden rounded-[8px] bg-[#f4f1ff]">
                <img
                  src={item.image}
                  alt={item.imageAlt}
                  className={`h-[320px] w-full ${item.imageClassName} sm:h-[420px] lg:h-[560px]`}
                  loading="lazy"
                />
              </div>

              <div className="mt-4 border-t border-[#1a1a1a] pt-4 mx-4">
                <p
                  className="text-[18px] font-semibold leading-none tracking-[-0.06em] text-[#111111] sm:text-[20px]"
                  style={{ fontFamily: '"Inter", "Hubot Sans", sans-serif' }}
                >
                  {item.year}
                </p>

                <p
                  className="mt-2 text-[14px] leading-[1.55] text-[#242424] sm:text-[14px]"
                  style={{ fontFamily: '"Inter", "Hubot Sans", sans-serif' }}
                >
                  {item.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
