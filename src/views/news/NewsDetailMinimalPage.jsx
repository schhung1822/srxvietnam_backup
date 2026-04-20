import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { formatNewsDate } from "../../data/demoNews";

export default function NewsDetailMinimalPage({ article }) {
  return (
    <section className="overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#f7f8ff_24%,#ffffff_100%)] pb-20 pt-8 md:pb-24 md:pt-12">
      <div className="mx-auto max-w-[1200px] px-4 md:px-6 xl:px-8">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-[#e9ecfb] pb-5 text-[14px] text-[#7e8498]">
          <Link href="/" className="transition hover:text-[#252c3d]">
            Trang chủ
          </Link>
          <span>/</span>
          <Link href="/follow-srx" className="transition hover:text-[#252c3d]">
            Theo dòng SRX
          </Link>
          <span>/</span>
          <span className="line-clamp-1 text-[#252c3d]">{article.title}</span>
        </div>

        <div className="grid gap-10 py-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(320px,0.78fr)] lg:items-start">
          <div className="max-w-[720px]">
            <div className="inline-flex rounded-full border border-[#dfe4ff] bg-white px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#6f7890]">
              {article.category}
            </div>
            <h1
              className="mt-5 text-[40px] font-medium leading-[0.98] tracking-[-0.06em] text-[#232836] sm:text-[54px]"
              style={{ fontFamily: '"Manrope", "Hubot Sans", sans-serif' }}
            >
              {article.title}
            </h1>
            <div className="mt-5 flex flex-wrap items-center gap-3 text-[14px] text-[#788196]">
              <span>{formatNewsDate(article.publishedAt)}</span>
              <span className="h-1 w-1 rounded-full bg-[#b3bad1]" />
              <span>{article.readTime}</span>
            </div>

            <p className="mt-8 max-w-[60ch] text-[18px] leading-9 text-[#5f687c]">{article.excerpt}</p>

            <div className="mt-10 flex flex-wrap gap-2">
              {(article.tags ?? []).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-[#dfe4ff] bg-[#f8f9ff] px-3 py-2 text-[13px] font-medium text-[#50586b]"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-12 text-[17px] leading-9 text-[#4e5669] whitespace-pre-line">
              {article.content}
            </div>

            <Link
              href="/follow-srx"
              className="mt-12 inline-flex items-center gap-2 rounded-full border border-[#d8def7] bg-white px-5 py-3 text-[14px] font-medium text-[#252c3d] transition hover:border-[#bac4f5] hover:bg-[#f8f9ff]"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại danh sách bài viết
            </Link>
          </div>

          <div className="lg:sticky lg:top-28">
            <div className="overflow-hidden rounded-[32px] bg-[#edf0ff] shadow-[0_24px_70px_rgba(79,94,147,0.12)]">
              <div className="aspect-[4/5] overflow-hidden">
                <img src={article.coverImage} alt={article.coverAlt} className="h-full w-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
