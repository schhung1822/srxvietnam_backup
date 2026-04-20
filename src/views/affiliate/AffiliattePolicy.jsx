import React from 'react';

export default function PrivacyPolicyPage() {
    const sections = [
        {
            title: "I. Giới thiệu",
            items: [
                "Chào mừng quý khách hàng đến với website chúng tôi.",
                "Khi quý khách hàng truy cập vào trang website của chúng tôi có nghĩa là quý khách đồng ý với các điều khoản này. Trang web có quyền thay đổi, chỉnh sửa, thêm hoặc lược bỏ bất kỳ phần nào trong Điều khoản mua bán hàng hóa này, vào bất cứ lúc nào. Các thay đổi có hiệu lực ngay khi được đăng trên trang web mà không cần thông báo trước. Và khi quý khách tiếp tục sử dụng trang web, sau khi các thay đổi về Điều khoản này được đăng tải, có nghĩa là quý khách chấp nhận với những thay đổi đó.",
                "Quý khách hàng vui lòng kiểm tra thường xuyên để cập nhật những thay đổi của chúng tôi.",
            ]
        },

        {
            title: "II. Hướng dẫn sử dụng website",
            items: [
                "Khi vào web của chúng tôi, khách hàng phải đảm bảo đủ 18 tuổi, hoặc truy cập dưới sự giám sát của cha mẹ hay người giám hộ hợp pháp. Khách hàng đảm bảo có đầy đủ hành vi dân sự để thực hiện các giao dịch mua bán hàng hóa theo quy định hiện hành của pháp luật Việt Nam.",
                "Trong suốt quá trình đăng ký, quý khách đồng ý nhận email quảng cáo từ website. Nếu không muốn tiếp tục nhận mail, quý khách có thể từ chối bằng cách nhấp vào đường link ở dưới cùng trong mọi email quảng cáo.",
            ]
        },

        {
            title: "III. Thanh toán an toàn và tiện lợi",
            items: [
                "Người mua có thể tham khảo các phương thức thanh toán sau đây và lựa chọn áp dụng phương thức phù hợp:",
                "Cách 1: Thanh toán trực tiếp (người mua nhận hàng tại địa chỉ người bán)",
                "Cách 2: Thanh toán sau (COD – giao hàng và thu tiền tận nơi)",
                "Cách 3: Thanh toán online qua thẻ tín dụng, chuyển khoản"
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
                            Chính sách Affiliate
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
                                            <span dangerouslySetInnerHTML={{ __html: item }} />
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