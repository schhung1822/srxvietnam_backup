import React from 'react';

export default function PrivacyPolicyPage() {

    return (
        <div className="bg-white min-h-screen">
            <section className="py-16 lg:py-24">
                <div className="md:max-w-[700px] lg:max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Title */}
                    <div className="text-center mb-12">
                        <h1 className="text-[32px] md:text-[40px] lg:text-[48px] font-bold text-black mb-4">
                            QUY ĐỊNH THANH TOÁN
                        </h1>
                    </div>

                    {/* Content */}
                    <div className="space-y-10">
                      <div className="space-y-4 text-[15px] lg:text-[16px] text-gray-800 leading-relaxed">
                        <p>
                            Khách hàng có thể đặt mua sản phẩm SRX trực tiếp trên website chính thức hoặc thông qua các kênh bán hàng, tư vấn được SRX công bố.
                        </p>
                        <p>
                            Khi đặt hàng trên website, khách hàng cần lựa chọn sản phẩm, số lượng, kiểm tra giá bán, ưu đãi, phí vận chuyển và điền đầy đủ thông tin nhận hàng bao gồm họ tên, số điện thoại, địa chỉ và ghi chú đơn hàng nếu có.
                        </p>
                        <p>
                            Sau khi đơn hàng được gửi thành công, hệ thống hoặc nhân viên SRX sẽ tiếp nhận và xử lý đơn theo thông tin khách hàng cung cấp.
                        </p>
                        <p>
                            SRX hỗ trợ các hình thức thanh toán sau:.
                        </p>
                      </div>

                      <h2 className="text-[20px] lg:text-[24px] font-bold text-black mb-4">
                        1. Thanh toán khi nhận hàng
                      </h2>
                      <div className="space-y-4 text-[15px] lg:text-[16px] text-gray-800 leading-relaxed">
                        <p>
                            Khách hàng thanh toán trực tiếp cho nhân viên giao hàng sau khi nhận được sản phẩm. Đây là hình thức phù hợp với khách hàng muốn kiểm tra tình trạng kiện hàng trước khi thanh toán.
                        </p>
                      </div>

                      <h2 className="text-[20px] lg:text-[24px] font-bold text-black mb-4">
                        2. Thanh toán chuyển khoản ngân hàng
                      </h2>
                      <div className="space-y-4 text-[15px] lg:text-[16px] text-gray-800 leading-relaxed">
                        <p>
                            Khách hàng có thể thanh toán trước bằng hình thức chuyển khoản theo thông tin tài khoản do SRX cung cấp. Sau khi chuyển khoản, khách hàng vui lòng giữ lại biên lai hoặc ảnh chụp giao dịch để SRX kiểm tra và xác nhận đơn hàng nhanh hơn.
                        </p>
                      </div>

                      <h2 className="text-[20px] lg:text-[24px] font-bold text-black mb-4">
                        1. Thanh toán khi nhận hàng
                      </h2>
                      <div className="space-y-4 text-[15px] lg:text-[16px] text-gray-800 leading-relaxed">
                        <p>
                            Trong trường hợp website SRX tích hợp cổng thanh toán online, khách hàng có thể thanh toán bằng thẻ ngân hàng, ví điện tử hoặc các phương thức thanh toán được hỗ trợ trên hệ thống.
                        </p>
                        <p>
                            SRX chỉ tiến hành xử lý đơn hàng khi thông tin đặt hàng hợp lệ. Với các đơn hàng có dấu hiệu sai thông tin, không liên hệ được hoặc phát sinh bất thường, SRX có quyền liên hệ lại để xác minh trước khi giao hàng.
                        </p>
                      </div>
                    </div>
                </div>
            </section>
        </div>
    );
}