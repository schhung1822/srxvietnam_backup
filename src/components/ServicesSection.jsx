import React from 'react';

const ServicesSection = () => {
    const projects = [
        {
            id: 1,
            image: "/assets/images/projects/Web_Ecomerce.webp",
            title: "Wesite E-commerce"
        },
        {
            id: 2,
            image: "/assets/images/projects/Web_elearning.webp",
            title: "Website E-learning"
        },
        {
            id: 3,
            image: "/assets/images/projects/webgioithieu.webp",
            title: "Wesite giới thiệu doanh nghiệp"
        },
        {
            id: 4,
            image: "/assets/images/projects/websukien.webp",
            title: "Wesite sự kiện"
        },
        {
            id: 5,
            image: "/assets/images/projects/payment_checkin.webp",
            title: "Hệ thống Thanh toán & Check-in Sự kiện"
        },
        {
            id: 6,
            image: "/assets/images/projects/CRM_dashboard.webp",
            title: "CRM Dashboard"
        },
        {
            id: 7,
            image: "/assets/images/projects/thiepmoi.webp",
            title: "Web tạo thiệp mời"
        },
        {
            id: 8,
            image: "/assets/images/projects/bonhandienthuonghieu.webp",
            title: "Thiết kế bộ nhận diện thương hiệu"
        },
        {
            id: 9,
            image: "/assets/images/projects/dataset.webp",
            title: "Dataset Ads Funnel"
        }
    ];

    const duplicatedProjects = [...projects, ...projects];

    return (
        <div className="w-full bg-white overflow-hidden relative py-[60px] lg:py-[90px]">
            <div className="absolute left-0 top-0 z-10 h-full w-12 md:w-32 bg-gradient-to-r from-white/60 to-transparent pointer-events-none" />
            <div className="absolute right-0 top-0 z-10 h-full w-12 md:w-32 bg-gradient-to-l from-white/60 to-transparent pointer-events-none" />

            <div className="relative h-[160px] md:h-[260px] lg:h-[300px]">
                <div className="flex h-full">
                    <div className="flex animate-scroll-left">
                        {duplicatedProjects.map((project, index) => (
                            <div
                                key={`${project.id}-${index}`}
                                className="flex-shrink-0 px-2 h-full flex items-center"
                            >
                                <div className="relative h-[160px] md:h-[260px] lg:h-[300px] w-[200px] sm:w-[280px] md:w-[360px] lg:w-[440px] group">
                                    <div className="relative h-full w-full overflow-hidden rounded-lg">
                                        <img
                                            src={project.image}
                                            alt={project.title}
                                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />
                                        <div className="absolute bottom-0 left-0 right-0 p-2">
                                            <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-lg p-2">
                                                <h3 className="text-white text-[12px] lg:text-[14px] font-light tracking-wide">
                                                    {project.title}
                                                </h3>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes scrollLeft {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(-50%);
                    }
                }

                .animate-scroll-left {
                    animation: scrollLeft 70s linear infinite;
                    will-change: transform;
                }

                @media (max-width: 640px) {
                    .animate-scroll-left {
                        animation-duration: 70s;
                    }
                }
            `}</style>
        </div>
    );
};

export default ServicesSection;
