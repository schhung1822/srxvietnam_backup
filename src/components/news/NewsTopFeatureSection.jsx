"use client";

import Link from "next/link";

const PRIMARY_BANNER_IMAGE = "/assets/images/post/banner_post2.webp";
const SECONDARY_BANNER_IMAGE = "/assets/images/post/banner_post.webp";

function formatFeatureDate(dateString) {
  const timestamp = new Date(dateString).getTime();

  if (Number.isNaN(timestamp)) {
    return dateString;
  }

  const date = new Date(timestamp);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `Ngày ${day} tháng ${month} năm ${year}`;
}

function BannerCard({ src, alt, priority = false }) {
  return (
    <div className="overflow-hidden rounded-[18px] bg-[#f5f7ff] shadow-[0_22px_60px_rgba(64,86,158,0.1)]">
      <div className="aspect-[4/4.55] overflow-hidden">
        <img
          src={src}
          alt={alt}
          className="w-full h-full  object-cover transition duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.02]"
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
        />
      </div>
    </div>
  );
}

export default function NewsTopFeatureSection({ article }) {
  if (!article) {
    return null;
  }

  return (
    <section className="pt-8 md:pt-10">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,0.9fr)_minmax(320px,0.76fr)] xl:items-center xl:gap-6">
        <BannerCard
          src={PRIMARY_BANNER_IMAGE}
          alt={`${article.title} - Banner mở đầu`}
          priority
        />

        <BannerCard
          src={SECONDARY_BANNER_IMAGE}
          alt={`${article.title} - Banner sản phẩm`}
        />

        <div className="rounded-[18px] bg-white px-1 py-2 sm:col-span-2 xl:col-span-1 xl:px-4">
          <div className="font-['Inter',_sans-serif] text-[14px] font-normal tracking-[-0.02em] text-[#8a8a8a] sm:text-[15px]">
            {formatFeatureDate(article.publishedAt)}
          </div>

          <h2 className="mt-4 text-[24px] font-medium leading-[1.04] tracking-[-0.05em] text-[#101010] sm:text-[36px] xl:text-[40px]">
            {article.title}
          </h2>

          {article.excerpt ? (
            <p className="mt-6 max-w-[42ch] text-[16px] leading-[1.65] text-[#6a6a6a] sm:text-[17px]">
              {article.excerpt}
            </p>
          ) : null}

          <Link
            href={`/follow-srx/${article.slug}`}
            className="mt-8 inline-flex min-w-[170px] items-center justify-center rounded-full bg-black px-7 py-3.5 text-[15px] font-medium text-white transition hover:bg-[#1a1a1a]"
          >
            Xem thêm
          </Link>
        </div>
      </div>
    </section>
  );
}
