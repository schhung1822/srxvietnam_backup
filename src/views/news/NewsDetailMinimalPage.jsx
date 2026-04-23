import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { formatNewsDate } from '../../lib/news/articles.js';
import styles from './NewsDetailMinimalPage.module.css';

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
    .trim();

  if (!headings.length && content) {
    const fallbackId = 'noi-dung-bai-viet';
    headings.push({ id: fallbackId, text: 'Nội dung bài viết', level: 2 });
    content = `<h2 id="${fallbackId}">Nội dung bài viết</h2>${content}`;
  }

  return { html: content, headings };
}

function getTocIndent(level) {
  if (level <= 2) {
    return '';
  }

  if (level === 3) {
    return 'pl-4';
  }

  return 'pl-8';
}

export default function NewsDetailMinimalPage({ article }) {
  const { html, headings } = normalizeArticleContent(article.content);

  return (
    <section className="bg-[linear-gradient(180deg,#ffffff_0%,#f7f8ff_24%,#ffffff_100%)] pb-20 pt-8 md:pb-24 md:pt-8">
      <div className="mx-auto max-w-[1280px] px-4 md:px-6 xl:px-0">
        <div>
          <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-14">
            <article className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[14px] text-[#7e8498]">
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
              <h1
                className="mt-6 text-[24px] font-medium leading-[1] tracking-[-0.06em] text-[#232836] sm:text-[30px] lg:text-[36px]"
                style={{ fontFamily: '"Manrope", "Hubot Sans", sans-serif' }}
              >
                {article.title}
              </h1>

              <div className="mt-6 flex flex-wrap items-center gap-3 text-[14px] text-[#788196]">
                <div className="inline-flex rounded-full border border-[#dfe4ff] bg-white px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#6f7890]">
                  {article.category}
                </div>
                <span className="h-1 w-1 rounded-full bg-[#b3bad1]" />
                <span>{formatNewsDate(article.publishedAt)}</span>
                <span className="h-1 w-1 rounded-full bg-[#b3bad1]" />
                <span>{article.readTime}</span>
              </div>

              <p className="mt-6 w-full text-[16px] leading-9 text-[#5f687c]">{article.excerpt}</p>

              {(article.tags ?? []).length ? (
                <div className="mt-8 flex flex-wrap gap-2">
                  {(article.tags ?? []).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-[#dfe4ff] bg-[#f8f9ff] px-3 py-2 text-[13px] font-medium text-[#50586b]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}

              {article.coverImage ? (
                <figure className="mb-10 overflow-hidden rounded-[28px] bg-[#eef2ff] shadow-[0_24px_70px_rgba(79,94,147,0.12)]">
                  <img src={article.coverImage} alt={article.coverAlt} className="h-full w-full object-cover" />
                </figure>
              ) : null}

              <div className={styles.articleRich} dangerouslySetInnerHTML={{ __html: html }} />

              <Link
                href="/follow-srx"
                className="mt-14 inline-flex items-center gap-2 rounded-full border border-[#d8def7] bg-white px-5 py-3 text-[14px] font-medium text-[#252c3d] transition hover:border-[#bac4f5] hover:bg-[#f8f9ff]"
              >
                <ArrowLeft className="h-4 w-4" />
                Quay lại danh sách bài viết
              </Link>
            </article>

            <aside className="self-start lg:sticky lg:top-28">
              <div className="rounded-[28px] border border-[#eceef7] bg-[#fff] p-6 shadow-[0_18px_50px_rgba(79,94,147,0.08)]">
                <h2 className="text-[20px] font-semibold tracking-[-0.04em] text-[#1f2737]">Mục lục</h2>

                <hr className='mt-4' />

                {headings.length ? (
                  <nav className="mt-4 space-y-2">
                    {headings.map((heading, index) => (
                      <a
                        key={`${heading.id}-${index + 1}`}
                        href={`#${heading.id}`}
                        className={`block text-[15px] leading-7 text-[#4d566b] transition hover:text-[#6b71d5] ${getTocIndent(heading.level)}`}
                      >
                        {heading.text}
                      </a>
                    ))}
                  </nav>
                ) : (
                  <p className="mt-5 text-[15px] leading-7 text-[#6f7890]">Bài viết này chưa có mục lục.</p>
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
