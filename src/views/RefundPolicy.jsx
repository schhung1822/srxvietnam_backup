import React from 'react';

export default function PrivacyPolicyPage() {
    const sections = [
        {
            title: "I. Điều kiện đổi trả.",
            items: [
                "Quý Khách hàng cần kiểm tra tình trạng hàng hóa và có thể đổi hàng/ trả lại hàng ngay tại thời điểm giao/nhận hàng trong những trường hợp sau:",
                "Hàng không đúng chủng loại, mẫu mã trong đơn hàng đã đặt hoặc như trên website tại thời điểm đặt hàng.",
                "Không đủ số lượng, không đủ bộ như trong đơn hàng.",
                "Tình trạng bên ngoài bị ảnh hưởng như rách bao bì, bong tróc, bể vỡ…",
                " Khách hàng có trách nhiệm trình giấy tờ liên quan chứng minh sự thiếu sót trên để hoàn thành việc hoàn trả/đổi trả hàng hóa."
            ]
        },

        {
            title: "II. Quy định về thời gian thông báo và gửi sản phẩm đổi trả.",
            items: [
                "Thời gian thông báo đổi trả: trong vòng 48h kể từ khi nhận sản phẩm đối với trường hợp sản phẩm thiếu phụ kiện, quà tặng hoặc bể vỡ.",
                "Thời gian gửi chuyển trả sản phẩm: trong vòng 14 ngày kể từ khi nhận sản phẩm.",
                "Địa điểm đổi trả sản phẩm: Khách hàng có thể mang hàng trực tiếp đến văn phòng/ cửa hàng của chúng tôi hoặc chuyển qua đường bưu điện.",
                "Trong trường hợp Quý Khách hàng có ý kiến đóng góp/khiếu nại liên quan đến chất lượng sản phẩm, Quý Khách hàng vui lòng liên hệ đường dây chăm sóc khách hàng của chúng tôi."
            ]
        },
    ];

    return (
        <div className="bg-white min-h-screen">
            <section className="py-16 lg:py-24">
                <div className="md:max-w-[700px] lg:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Title */}
                    <div className="text-center mb-12">
                        <h1 className="text-[32px] md:text-[40px] lg:text-[48px] font-bold text-black mb-4">
                            CHÍNH SÁCH ĐỔI TRẢ
                        </h1>
                    </div>

                    {/* Content */}
                    <div className="space-y-10">
                        {sections.map((section, sectionIndex) => (
                            <div key={sectionIndex}>
                                <h2 className="text-[20px] lg:text-[24px] font-bold text-black mb-4">
                                    {section.title}
                                </h2>

                                <div className="space-y-4 text-[15px] lg:text-[16px] text-gray-800 leading-relaxed">
                                    {section.items.map((item, itemIndex) => (
                                        <p key={itemIndex}>
                                            <strong>{itemIndex + 1}.</strong> <span dangerouslySetInnerHTML={{ __html: item }} />
                                        </p>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}