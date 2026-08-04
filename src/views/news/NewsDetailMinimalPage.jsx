import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, ChevronRight, Clock3 } from 'lucide-react';
import { formatNewsDate } from '../../lib/news/articles.js';
import { getPostGalleryImages, getRelatedNewsArticles } from '../../lib/server/news.js';
import AboutContactSection from '../../components/aboutus/AboutContactSection.jsx';
import NewsShareCopyButton from '../../components/news/NewsShareCopyButton.jsx';
import NewsArticleViewTracker from '../../components/news/NewsArticleViewTracker.jsx';
import NewsArticleToc from '../../components/news/NewsArticleToc.jsx';
import NewsReadingProgress from '../../components/news/NewsReadingProgress.jsx';
import PostImageGallery from '../../components/news/PostImageGallery.jsx';
import SRXLogo from '../../components/home/SrxLogo.jsx';
import styles from './NewsDetailMinimalPage.module.css';

const CONTENT_ELEMENT_ID = 'news-article-content';

const ENTITY_MAP = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
};

function decodeHtmlEntities(value = '') {
  return String(value)
    .replace(/&nbsp;|&amp;|&lt;|&gt;|&quot;|&#39;/gi, (entity) => ENTITY_MAP[entity] ?? entity)
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCharCode(Number.parseInt(code, 16)));
}

function stripHtml(value = '') {
  return decodeHtmlEntities(String(value).replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function slugify(value = '', fallbackIndex = 1) {
  const normalized = decodeHtmlEntities(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return normalized || `muc-${fallbackIndex}`;
}

function extractAttribute(source = '', attributeName) {
  const pattern = new RegExp(`${attributeName}=["']([^"']+)["']`, 'i');
  const match = String(source).match(pattern);
  return match?.[1] ?? '';
}

function sanitizeAnchorTag(attributes = '', innerHtml = '') {
  const href = extractAttribute(attributes, 'href');

  if (!href) {
    return innerHtml;
  }

  const target = extractAttribute(attributes, 'target');
  const safeHref = escapeHtml(href);
  const safeTarget = target ? ` target="${escapeHtml(target)}"` : '';
  const rel = target === '_blank' ? ' rel="noreferrer noopener"' : '';

  return `<a href="${safeHref}"${safeTarget}${rel}>${innerHtml}</a>`;
}

function sanitizeImageTag(attributes = '') {
  const src = extractAttribute(attributes, 'src');

  if (!src) {
    return '';
  }

  const alt = extractAttribute(attributes, 'alt');

  return `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" />`;
}

function buildPlainTextHtml(value = '') {
  return String(value)
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br />')}</p>`)
    .join('');
}

function normalizeArticleContent(rawContent = '') {
  const originalContent = String(rawContent ?? '').trim();

  if (!originalContent) {
    return { html: '', headings: [] };
  }

  let content = /<\/?[a-z][\s\S]*>/i.test(originalContent)
    ? originalContent
    : buildPlainTextHtml(originalContent);

  content = content
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<\/?span[^>]*>/gi, '')
    .replace(/<\/?font[^>]*>/gi, '');

  const headings = [];
  let headingIndex = 0;

  content = content.replace(/<h([2-4])\b([^>]*)>([\s\S]*?)<\/h\1>/gi, (_, level, attributes, innerHtml) => {
    const text = stripHtml(innerHtml);

    if (!text) {
      return '';
    }

    headingIndex += 1;

    const existingId = extractAttribute(attributes, 'id');
    const id = slugify(existingId || text, headingIndex);
    headings.push({
      id,
      text,
      level: Number(level),
    });

    return `<h${level} id="${id}">${innerHtml.trim()}</h${level}>`;
  });

  content = content
    .replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi, (_, attributes, innerHtml) =>
      sanitizeAnchorTag(attributes, innerHtml),
    )
    .replace(/<img\b([^>]*)>/gi, (_, attributes) => sanitizeImageTag(attributes))
    .replace(/\s(?:style|class|dir|align|border|cellpadding|cellspacing|width|height|loading|decoding|data-[\w-]+|aria-[\w-]+)="[^"]*"/gi, '')
    .replace(/\s(?:style|class|dir|align|border|cellpadding|cellspacing|width|height|loading|decoding|data-[\w-]+|aria-[\w-]+)='[^']*'/gi, '')
    .replace(/<p>\s*(<img\b[^>]*>)\s*<\/p>/gi, '<figure>$1</figure>')
    .replace(/<p>\s*(?:&nbsp;|\s|<br\s*\/?>)*<\/p>/gi, '')
    .replace(/<li>([\s\S]*?)<br\s*\/?>\s*&nbsp;\s*<\/li>/gi, '<li>$1</li>')
    .replace(/&nbsp;/gi, ' ')
    .replace(/<table\b[\s\S]*?<\/table>/gi, (table) => `<div class="articleTableScroll">${table}</div>`)
    .trim();

  if (!headings.length && content) {
    const fallbackId = 'noi-dung-bai-viet';
    headings.push({ id: fallbackId, text: 'Nội dung bài viết', level: 2 });
    content = `<h2 id="${fallbackId}">Nội dung bài viết</h2>${content}`;
  }

  return { html: content, headings };
}

function RelatedNewsCard({ article }) {
  return (
    <Link href={`/follow-srx/${article.slug}`} className="group block h-full">
      <article className="flex h-full flex-col overflow-hidden rounded-[22px] border border-[#e6eaf8] bg-white shadow-[0_18px_44px_-32px_rgba(43,54,110,0.55)] transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1.5 group-hover:border-[#c8d2f7] group-hover:shadow-[0_34px_66px_-34px_rgba(43,54,110,0.5)]">
        <div className="relative aspect-[16/10] overflow-hidden bg-[#eef2ff]">
          <img
            src={article.coverImage}
            alt={article.coverAlt}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
          />
          <div className="absolute right-4 top-4 flex h-10 w-10 translate-y-1 items-center justify-center rounded-full bg-white/92 text-[#1f2737] opacity-0 shadow-[0_18px_40px_rgba(0,0,0,0.12)] transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            <ArrowUpRight className="h-5 w-5" strokeWidth={1.8} />
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-6">
          <div className="font-['Inter',_sans-serif] text-[12px] font-medium tracking-[0.01em] text-[#858ba5]">
            {formatNewsDate(article.publishedAt)}
          </div>
          <h3 className="line-clamp-3 text-[18px] font-semibold leading-[1.24] tracking-[-0.035em] text-[#141822] transition duration-300 group-hover:text-[#4d5cd3]">
            {article.title}
          </h3>
          <p className="line-clamp-2 text-[14px] leading-7 text-[#6b7288]">{article.excerpt}</p>
        </div>
      </article>
    </Link>
  );
}

export default async function NewsDetailMinimalPage({ article }) {
  const { html, headings } = normalizeArticleContent(article.content);
  const tocHeadings = headings.filter((heading) => heading.level === 2);
  const isMergedNewsEventCategory =
    article.categorySlug === 'tin-tuc' || article.categorySlug === 'su-kien';
  const listPath = isMergedNewsEventCategory ? '/tin-tuc' : '/follow-srx';
  const listLabel = isMergedNewsEventCategory ? 'Tin tức & Sự kiện' : 'Theo dòng SRX';
  const [galleryImages, relatedArticles] = await Promise.all([
    getPostGalleryImages(),
    getRelatedNewsArticles(article, { limit: 3 }),
  ]);

  return (
    <section className="bg-white pb-20 md:pb-24">
      <NewsArticleViewTracker slug={article.slug} />
      <NewsReadingProgress contentId={CONTENT_ELEMENT_ID} />

      <div className="mx-auto max-w-[1280px] px-4 md:px-6 xl:px-0">
        <div className="pb-2 pt-8 md:pt-10">
          <nav
            className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-[#858ba5]"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="transition hover:text-[#232b4d]">
              Trang chủ
            </Link>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60" />
            <Link href={listPath} className="transition hover:text-[#232b4d]">
              {listLabel}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60" />
            <span className="line-clamp-1 text-[#3d4560]">{article.title}</span>
          </nav>

          <div className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-2 text-[13px] text-[#6f7890]">
            <span className="inline-flex rounded-full border border-[#dde3fb] bg-white px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#5566d6]">
              {article.category}
            </span>
            <span className="font-['Inter',_sans-serif]">{formatNewsDate(article.publishedAt)}</span>
            <span className="h-1 w-1 rounded-full bg-[#b8bed4]" />
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="h-3.5 w-3.5 shrink-0" />
              {article.readTime}
            </span>
          </div>

          <h1
            className="mt-5 max-w-[90%] text-[28px] font-semibold leading-[1.14] tracking-[-0.035em] text-[#141822] sm:text-[36px] lg:text-[46px]"
            style={{ fontFamily: '"Manrope", "Hubot Sans", sans-serif' }}
          >
            {article.title}
          </h1>

          {article.excerpt ? (
            <p className="mt-6 max-w-[100%] border-l-[3px] border-[#4f67e8] pl-5 text-[15px] leading-[22px] text-[#5a6178] md:text-[16px]">
              {article.excerpt}
            </p>
          ) : null}

          {(article.tags ?? []).length ? (
            <div className="mt-6 flex flex-wrap gap-2">
              {(article.tags ?? []).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-[#e2e6f8] bg-white px-3.5 py-1.5 text-[13px] font-medium text-[#5a6178]"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-14">
          <article className="min-w-0">
            {article.coverImage ? (
              <figure className="mb-10 overflow-hidden rounded-[20px] bg-[#eef2ff]">
                <img
                  src={article.coverImage}
                  alt={article.coverAlt}
                  className="aspect-[16/9] w-full object-cover"
                />
              </figure>
            ) : null}

            <NewsArticleToc headings={tocHeadings} variant="mobile" />

            <div
              id={CONTENT_ELEMENT_ID}
              className={styles.articleRich}
              dangerouslySetInnerHTML={{ __html: html }}
            />

            <NewsShareCopyButton title={article.title} />

            <Link
              href={listPath}
              className="group mt-12 inline-flex items-center gap-2.5 rounded-full border border-[#d8def7] bg-white px-6 py-3.5 text-[13px] font-semibold text-[#232b4d] transition duration-300 hover:border-[#4f67e8] hover:bg-[#4f67e8] hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:-translate-x-1" />
              Quay lại danh sách bài viết
            </Link>

            {galleryImages.length ? (
              <div className="lg:hidden">
                <PostImageGallery images={galleryImages} />
              </div>
            ) : null}
          </article>

          <aside className="hidden self-start lg:sticky lg:top-28 lg:block">
            <NewsArticleToc headings={tocHeadings} variant="desktop" />

            {galleryImages.length ? <PostImageGallery images={galleryImages} /> : null}
          </aside>
        </div>

        {relatedArticles.length ? (
          <div className="mt-20 border-t border-[#e8ebf7] pt-14">
            <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#8a90ab]">
                  Bài viết liên quan
                </div>
                <h2 className="mt-3 text-[28px] font-semibold leading-[1.1] tracking-[-0.04em] text-[#141822] md:text-[36px]">
                  Đọc thêm từ SRX
                </h2>
              </div>

              <Link
                href={listPath}
                className="group inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.16em] text-[#4d5cd3]"
              >
                Xem tất cả
                <ArrowUpRight className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>

            <div className="grid gap-7 sm:grid-cols-2 xl:grid-cols-3">
              {relatedArticles.map((relatedArticle) => (
                <RelatedNewsCard key={relatedArticle.slug} article={relatedArticle} />
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <AboutContactSection />
      <SRXLogo />
    </section>
  );
}
