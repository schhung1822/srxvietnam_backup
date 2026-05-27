import Link from 'next/link';
import { ArrowLeft, Star } from 'lucide-react';
import ProductCard from '../components/shop/ProductCard.jsx';
import AboutContactSection from '../components/aboutus/AboutContactSection.jsx';
import SRXLogo from '../components/home/SrxLogo.jsx';
import styles from './news/NewsDetailMinimalPage.module.css';

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

function normalizeIngredientContent(rawContent = '') {
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
    .replace(/&nbsp;/gi, ' ')
    .trim();

  if (!headings.length && content) {
    const fallbackId = 'tong-quan-thanh-phan';
    headings.push({ id: fallbackId, text: 'Tổng quan thành phần', level: 2 });
    content = `<h2 id="${fallbackId}">Tổng quan thành phần</h2>${content}`;
  }

  return { html: content, headings };
}

function normalizeImagePath(path = '') {
  const normalizedPath = String(path ?? '').trim();

  if (!normalizedPath) {
    return '';
  }

  if (/^https?:\/\//i.test(normalizedPath)) {
    return normalizedPath;
  }

  return normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`;
}

function normalizeStarsValue(value) {
  const parsedValue = Number.parseInt(value, 10);

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return 0;
  }

  return Math.min(5, Math.max(1, parsedValue));
}

function parseTagLabels(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  const rawValue = String(value ?? '').trim();

  if (!rawValue) {
    return [];
  }

  if (rawValue.startsWith('[') && rawValue.endsWith(']')) {
    try {
      const parsedValue = JSON.parse(rawValue);

      if (Array.isArray(parsedValue)) {
        return parsedValue.map((item) => String(item).trim()).filter(Boolean);
      }
    } catch {
      return rawValue
        .replace(/^\[|\]$/g, '')
        .split(/","|',\s*'|",\s*"|,\s*/)
        .map((item) => item.replace(/^['"]|['"]$/g, '').trim())
        .filter(Boolean);
    }
  }

  return rawValue
    .split(/\s*\|\|\s*|\s*,\s*|\s*;\s*/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function StarsRow({ value }) {
  const normalizedValue = normalizeStarsValue(value);

  if (!normalizedValue) {
    return <span className="text-[14px] text-[#7C93F1]">Chưa xếp hạng</span>;
  }

  return (
    <div className="flex items-center gap-1 text-[#7C93F1]">
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={`detail-star-${index + 1}`}
          className={`h-4 w-4 ${index < normalizedValue ? 'fill-current' : 'text-[#7C93F1]'}`}
          strokeWidth={1.8}
        />
      ))}
    </div>
  );
}

export default function KeySrxDetailPage({ entry, relatedProducts = [] }) {
  const tags = parseTagLabels(entry.tags);
  const contentSource = String(entry.longDescription ?? '').trim() || String(entry.description ?? '').trim();
  const { html } = normalizeIngredientContent(contentSource);
  const description = stripHtml(entry.description || contentSource);
  const detailImage = normalizeImagePath(entry.image);
  const displayProducts = relatedProducts.slice(0, 8);

  return (
    <section className="bg-[#fff] pb-20 pt-8 md:pb-24 md:pt-8">
      <div className="mx-auto max-w-[1280px] px-4 md:px-6 xl:px-0">
        <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-14">
          <article className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[14px] text-[#7e8498]">
              <Link href="/" className="transition hover:text-[#252c3d]">
                Trang chủ
              </Link>
              <span>/</span>
              <Link href="/key-srx" className="transition hover:text-[#252c3d]">
                Key SRX
              </Link>
              <span>/</span>
              <span className="line-clamp-1 text-[#252c3d]">{entry.name}</span>
            </div>

            <h1
              className="mt-6 text-[26px] font-medium leading-[1] tracking-[-0.06em] text-[#232836] sm:text-[34px] lg:text-[42px]"
              style={{ fontFamily: '"Manrope", "Hubot Sans", sans-serif' }}
            >
              {entry.name}
            </h1>

            {description ? (
              <p className="mt-6 w-full text-[16px] leading-9 text-[#5f687c]">{description}</p>
            ) : null}

            {detailImage ? (
              <figure className="mb-10 mt-6 overflow-hidden rounded-[12px] bg-[#eef2ff] shadow-[0_24px_70px_rgba(79,94,147,0.12)]">
                <img src={detailImage} alt={entry.name} className="h-full w-full object-cover" />
              </figure>
            ) : null}

            {html ? (
              <div className={styles.articleRich} dangerouslySetInnerHTML={{ __html: html }} />
            ) : null}

            <Link
              href="/key-srx"
              className="mt-14 inline-flex items-center gap-2 rounded-full border border-[#d8def7] bg-white px-5 py-3 text-[14px] font-medium text-[#252c3d] transition hover:border-[#bac4f5] hover:bg-[#f8f9ff]"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại danh sách thành phần
            </Link>
          </article>

          <aside className="self-start lg:sticky lg:top-28">
            <div className="rounded-[20px] border border-[#eceef7] bg-[#fff] p-6 shadow-[0_18px_50px_rgba(79,94,147,0.08)]">
              <h2 className="text-[20px] font-semibold tracking-[-0.04em] text-[#1f2737]">
                Thông tin thành phần
              </h2>

              <div className="mt-5 space-y-4 text-[14px] text-[#4d566b]">
                {entry.ingredientClass ? (
                  <div>
                    <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#8a90ab]">
                      Phân loại
                    </div>
                    <div className="mt-1">{entry.ingredientClass}</div>
                  </div>
                ) : null}

                <div>
                  <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#4d566b]">
                    Đánh giá
                  </div>
                  <div className="mt-2">
                    <StarsRow value={entry.stars} />
                  </div>
                </div>

                <div>
                  <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#8a90ab]">
                    Sản phẩm chứa thành phần
                  </div>
                  <div className="mt-1">{entry.linkedProductCount ?? relatedProducts.length}</div>
                </div>
              </div>

              {tags.length ? (
                <>
                  <hr className="mt-6 border-[#eceef7]" />
                  <div className="mt-6">
                    <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#8a90ab]">
                      Lợi ích
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <span
                          key={`aside-${entry.slug}-${tag}`}
                          className="rounded-full border border-[#dfe4ff] bg-[#f8f9ff] px-3 py-1.5 text-[13px] font-medium text-[#50586b]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              ) : null}

              <Link
                href={`/products/${entry.slug}`}
                className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[#111827] px-5 py-3 text-[13px] font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#7C93F1]"
              >
                Xem sản phẩm
              </Link>
            </div>
          </aside>
        </div>

        <div className="mt-20 border-t border-[#e8ebf7] pt-12">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="mt-2 text-[28px] font-medium tracking-[-0.05em] text-[#252c3d] md:text-[34px]">
                Sản phẩm có chứa {entry.name}
              </h2>
            </div>

            <Link
              href={`/products/${entry.slug}`}
              className="text-[14px] font-semibold text-[#252c3d] transition hover:text-[#7C93F1]"
            >
              Xem tất cả
            </Link>
          </div>

          {displayProducts.length ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10 xl:grid-cols-4">
              {displayProducts.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-[24px] border border-dashed border-[#d8deef] bg-[#fbfcff] px-6 py-12 text-center text-[#667086]">
              Chưa có sản phẩm nào đang liên kết với thành phần này.
            </div>
          )}
        </div>
      </div>

      <AboutContactSection />
      <SRXLogo />
    </section>
  );
}
