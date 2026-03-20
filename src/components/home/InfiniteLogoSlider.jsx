import React from 'react';

const InfiniteLogoSlider = () => {
    // Danh sách logo mẫu - thay thế bằng logo thực tế
    const logos = [
        { id: 1, src: 'assets/images/partner/partner2.png', alt: 'Partner 1' },
        { id: 2, src: '/assets/images/partner/partner30.png', alt: 'Partner 2' },
        { id: 3, src: '/assets/images/partner/partner29.png', alt: 'Partner 3' },
        { id: 4, src: '/assets/images/partner/partner4.png', alt: 'Partner 4' },
        { id: 5, src: '/assets/images/partner/partner5.png', alt: 'Partner 5' },
        { id: 6, src: '/assets/images/partner/partner6.png', alt: 'Partner 6' },
        { id: 7, src: '/assets/images/partner/partner27.png', alt: 'Partner 7' },
        { id: 8, src: '/assets/images/partner/partner10.png', alt: 'Partner 8' },
    ];
    


    // Duplicate logos để tạo hiệu ứng liền mạch
    const duplicatedLogos = [...logos, ...logos];
    return (
        <div className="relative w-full overflow-hidden bg-black py-4 md:py-6">
            {/* Overlay gradient bên trái */}
            <div className="absolute left-0 top-0 z-10 h-full w-12 md:w-32 bg-gradient-to-r from-black via-transparent to-transparent pointer-events-none" />

            {/* Overlay gradient bên phải */}
            <div className="absolute right-0 top-0 z-10 h-full w-12 md:w-32 bg-gradient-to-l from-black via-transparent to-transparent pointer-events-none" />

            {/* Container cho slider */}
            <div className="mx-auto">
                <div className="flex animate-scroll-logo">
                    {duplicatedLogos.map((logo, index) => (
                        <div
                            key={`${logo.id}-${index}`}
                            className="flex-shrink-0 mx-10 md:px-14 bg-white rounded-xl shadow-md"
                        >
                            <div className="flex items-center justify-center w-32 h-16 md:w-40 md:h-20">
                                <img
                                    src={logo.src}
                                    alt={logo.alt}
                                    className=" w-full h-full object-contain opacity-100 transition-all duration-300 hover:grayscale-0 hover:scale-110"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
                @keyframes scrollLogo {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(-50%);
                    }
                }

                .animate-scroll-logo {
                    animation: scrollLogo 15s linear infinite;
                }

                /* Tối ưu cho mobile */
                @media (max-width: 768px) {
                    .animate-scroll-logo {
                        animation-duration: 6s;
                    }
                }
            `}</style>
        </div>
    );
};

export default InfiniteLogoSlider;