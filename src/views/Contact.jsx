import React, { useState } from 'react';

export default function Contact() {
    const [formData, setFormData] = useState({
        customer_name: '',
        phone: '',
        email: '',
        business_field: '',
        brand_name: '',
        consultation_request: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const submitToNocoDB = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus(null);

        try {
            const response = await fetch('https://data.nextgency.vn/api/v1/db/data/noco/pt23og868jycyzo/mmw1iwmnal17i0t', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'xc-token': 'dY0LCW8ChnwtfC6KiA94S17SaBax6RGRaZ4LMaHb'
                },
                body: JSON.stringify({
                    customer_name: formData.customer_name,
                    phone: formData.phone,
                    email: formData.email,
                    business_field: formData.business_field,
                    brand_name: formData.brand_name,
                    consultation_request: formData.consultation_request,
                    created_at: new Date().toISOString(),
                    status: 'New'
                })
            });

            if (response.ok) {
                setSubmitStatus('success');
                setFormData({
                    customer_name: '',
                    phone: '',
                    email: '',
                    business_field: '',
                    brand_name: '',
                    consultation_request: ''
                });

                setTimeout(() => setSubmitStatus(null), 5000);
            } else {
                throw new Error('Failed to submit');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            setSubmitStatus('error');
            setTimeout(() => setSubmitStatus(null), 5000);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white pb-[60px] lg:pb-[90px]">
            <section className="w-full">
                <div className="mx-auto w-full overflow-hidden">
                    <div
                        className="relative min-h-[300px] bg-cover bg-center sm:min-h-[360px] lg:min-h-[430px]"
                        style={{
                            backgroundImage:
                                "linear-gradient(90deg, rgba(16, 13, 11, 0.68) 0%, rgba(16, 13, 11, 0.32) 42%, rgba(16, 13, 11, 0.08) 100%), url('/assets/images/bg_page_contact.webp')",
                        }}
                    >
                        <div className="mx-auto flex min-h-[300px] max-w-[1440px] items-end px-6 py-10 sm:min-h-[360px] sm:px-8 sm:py-12 lg:min-h-[720px] lg:px-12 lg:py-16">
                            <div className="max-w-[640px]">
                                <div className="text-[12px] font-medium uppercase tracking-[0.24em] text-white/75">
                                    Contact
                                </div>
                                <h1 className="mt-3 text-[34px] font-semibold leading-[1.02] tracking-[-0.06em] text-white sm:text-[46px] lg:text-[64px]">
                                    Nhận tư vấn ngay
                                </h1>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="max-w-[1440px] mx-auto px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">

                    {/* Right Side - Form */}
                    <div className="relative">
                        <div className="">
                            {/* Success/Error Messages */}
                            {submitStatus && (
                                <div className={`mb-4 p-4 rounded-lg ${
                                    submitStatus === 'success'
                                        ? 'bg-green-100 border-green-200 text-green-800'
                                        : 'bg-red-100 border-red-200 text-red-800'
                                }`}>
                                    {submitStatus === 'success'
                                        ? 'Cảm ơn bạn! Chúng tôi sẽ liên hệ trong vòng 24h.'
                                        : 'Có lỗi xảy ra, vui lòng thử lại sau.'
                                    }
                                </div>
                            )}

                            <form onSubmit={submitToNocoDB} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="block text-black text-[13px] lg:text-[15px] font-medium">
                                        Tên khách hàng *
                                    </label>
                                    <input
                                        type="text"
                                        name="customer_name"
                                        value={formData.customer_name}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-black text-[13px] lg:text-[15px] placeholder-gray-400 transition-all duration-300 focus:border-[#c59efe] focus:shadow-lg"
                                        placeholder="Nguyễn Văn A"
                                        required
                                    />
                                </div>

                                {/* Row with Phone and Email */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="block text-black text-[13px] lg:text-[15px] font-medium">
                                            Số điện thoại
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-black text-[13px] lg:text-[15px] placeholder-gray-400 transition-all duration-300 focus:border-[#c59efe] focus:shadow-lg"
                                            placeholder="09xxxxxxxx"
                                            required
                                        />
                                    </div>

                                    {/* Gmail */}
                                    <div className="space-y-2">
                                        <label className="block text-black text-[13px] lg:text-[15px] font-medium">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-black text-[13px] lg:text-[15px] placeholder-gray-400 transition-all duration-300 focus:border-[#c59efe] focus:shadow-lg"
                                            placeholder="example@gmail.com"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Row with Business Field and Brand */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="block text-black text-[13px] lg:text-[15px] font-medium">
                                            Lĩnh vực kinh doanh
                                        </label>
                                        <input
                                            type="text"
                                            name="business_field"
                                            value={formData.business_field}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-black text-[13px] lg:text-[15px] placeholder-gray-400 transition-all duration-300 focus:border-[#c59efe] focus:shadow-lg"
                                            placeholder="Ví dụ: Thương mại điện tử, F&B..."
                                            required
                                        />
                                    </div>

                                    {/* Tên thương hiệu */}
                                    <div className="space-y-2">
                                        <label className="block text-black text-[13px] lg:text-[15px] font-medium">
                                            Tên thương hiệu
                                        </label>
                                        <input
                                            type="text"
                                            name="brand_name"
                                            value={formData.brand_name}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-black text-[13px] lg:text-[15px] placeholder-gray-400 transition-all duration-300 focus:border-[#c59efe] focus:shadow-lg"
                                            placeholder="Nhập tên thương hiệu (nếu có)"
                                        />
                                    </div>
                                </div>

                                {/* Yêu cầu tư vấn */}
                                <div className="space-y-2">
                                    <label className="block text-black text-[13px] lg:text-[15px] font-medium">
                                        Yêu cầu tư vấn *
                                    </label>
                                    <textarea
                                        rows="5"
                                        name="consultation_request"
                                        value={formData.consultation_request}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-black text-[13px] lg:text-[15px] placeholder-gray-400 transition-all duration-300 focus:border-[#c59efe] focus:shadow-lg resize-none"
                                        placeholder="Mô tả chi tiết yêu cầu tư vấn của bạn..."
                                        required
                                    />
                                </div>

                                {/* Submit Button */}
                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full group relative px-8 py-4 bg-gradient-to-r from-[#7C93F1] to-[#F6BFDF] rounded-lg text-white font-medium text-[15px] lg:text-[16px] hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                    >
                                        <span className="flex items-center justify-center space-x-2">
                                            {isSubmitting ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                    <span>Đang gửi...</span>
                                                </>
                                            ) : (
                                                <span>Gửi thông tin</span>
                                            )}
                                        </span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                    {/* Left Side - Contact Info */}
                    <div className="relative">
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3 bg-gray-50/80 p-4 rounded-lg border border-gray-100">
                                <div>
                                    <h3 className="text-[11px] sm:text-[13px] font-archivo font-medium text-gray-500 mb-1 uppercase tracking-widest">Hotline</h3>
                                    <p className="text-black text-[13px] lg:text-[15px] font-medium">+84 903 010 692</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 bg-gray-50/80 p-4 rounded-lg border border-gray-100">
                                <div>
                                    <h3 className="text-[11px] sm:text-[13px] font-archivo font-medium text-gray-500 mb-1 uppercase tracking-widest">Email</h3>
                                    <p className="text-black text-[13px] lg:text-[15px] font-medium">eacgroup.vn@gmail.com</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 bg-gray-50/80 p-4 rounded-lg border border-gray-100">
                                <div>
                                    <h3 className="text-[11px] sm:text-[13px] font-archivo font-medium text-gray-500 mb-1 uppercase tracking-widest">Address</h3>
                                    <p className="text-black text-[13px] lg:text-[15px] font-medium">58 Phước Hưng, Phường 08, Quận 5, Thành phố Hồ Chí Minh, Việt Nam</p>
                                </div>
                            </div>
                        </div>

                        {/* Floating Stats */}
                        <div className="absolute -top-4 -right-0 bg-[#969DEE] rounded-lg px-4 py-2">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-white">10.000+</div>
                                <div className="text-xs text-white">Khách hàng</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
