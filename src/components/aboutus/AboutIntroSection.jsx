export default function AboutIntroSection() {
  return (
    <section className="bg-white px-4 pb-6 pt-20 sm:px-6 sm:pb-8 sm:pt-24 lg:px-8 lg:pb-10 lg:pt-28">
      <div className="mx-auto max-w-[1800px] px-[20px]">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.72fr)] lg:items-start lg:gap-14">
          <div className="max-w-[1080px]">
            <p
              className="text-[12px] italic uppercase tracking-[0.24em] text-[#111111] sm:text-[13px]"
              style={{ fontFamily: '"Inter", "Hubot Sans", sans-serif' }}
            >
              About
            </p>

            <h1
              className="mt-4 text-[24px] font-medium leading-[1] tracking-[-0.065em] text-[#171717] sm:text-[40px] lg:text-[84px] xl:text-[48px]"
              style={{ fontFamily: '"Manrope", "Hubot Sans", sans-serif' }}
            >
              "Sự trung thực chuẩn khoa học quan trọng hơn việc trở nên hoàn hảo"
            </h1>
          </div>

          <p
            className="max-w-[420px] text-[15px] leading-[1.55] text-[#1f1f1f] sm:text-[16px] lg:justify-self-end lg:pt-5"
            style={{ fontFamily: '"Inter", "Hubot Sans", sans-serif' }}
          >
            SRX mang đến hệ sinh thái skincare khoa học minh bạch và hiệu quả cao ngay tại nhà. 
            Chúng tôi đồng hành cùng hành trình nâng tầm nhan sắc Việt bằng các giải pháp chăm sóc da chuyên sâu, 
            dựa trên nền tảng nghiên cứu rõ ràng và tính tương thích sinh học tối ưu, mang lại sự an toàn và lành tính tuyệt đối cho mọi làn da. 
          </p>
        </div>

        <div className="mt-10 overflow-hidden bg-[#eef3ff] shadow-[0_24px_80px_rgba(190,201,236,0.24)] sm:mt-12 lg:mt-14">
          <div className="aspect-[16/11] w-full sm:aspect-[16/10] lg:aspect-[16/9]">
            <img
              src="/assets/images/about/banner.webp"
              alt="Banner giới thiệu SRX với hiệu ứng gợn nước mềm và cánh tay chạm mặt nước"
              className="h-full w-full object-cover"
              loading="eager"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
