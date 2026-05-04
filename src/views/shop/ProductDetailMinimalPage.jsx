'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Minus, Plus, Star } from 'lucide-react';
import ProductArtwork from '../../components/shop/ProductArtwork';
import ProductCard from '../../components/shop/ProductCard';
import ProductIngredientShowcase from '../../components/shop/ProductIngredientShowcase';
import { useCart } from '../../contexts/CartContext';
import AboutContactSection from "../../components/aboutus/AboutContactSection.jsx";
import SRXLogo from "../../components/home/SrxLogo.jsx";

const moneyFormatter = new Intl.NumberFormat('vi-VN');

const purchaseNotes = [
  'Giao nhanh toàn quốc',
  'Đổi trả trong 7 ngày',
  'Sản phẩm chính hãng',
];

const HTML_ENTITY_MAP = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
};

const PRODUCT_INFO_SECTION_LABELS = {
  'chỉ định sử dụng': 'Chỉ định sử dụng',
  'hướng dẫn sử dụng': 'Hướng dẫn sử dụng',
  'lưu ý': 'Lưu ý khi sử dụng sản phẩm',
  'lưu ý khi sử dụng sản phẩm': 'Lưu ý khi sử dụng sản phẩm',
  'thành phần': 'Thành phần',
  'thành phần chính': 'Thành phần chính',
  'công dụng': 'Công dụng',
  'công dụng nổi bật': 'Công dụng nổi bật',
};

function decodeHtmlEntities(value = '') {
  return String(value)
    .replace(/&nbsp;|&amp;|&lt;|&gt;|&quot;|&#39;/gi, (entity) => HTML_ENTITY_MAP[entity] ?? entity)
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCharCode(Number.parseInt(code, 16)));
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function stripHtml(value = '') {
  return decodeHtmlEntities(String(value).replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

function extractHtmlAttribute(source = '', attributeName) {
  const pattern = new RegExp(`${attributeName}=["']([^"']+)["']`, 'i');
  const match = String(source).match(pattern);
  return match?.[1] ?? '';
}

function sanitizeAnchorTag(attributes = '', innerHtml = '') {
  const href = extractHtmlAttribute(attributes, 'href');

  if (!href) {
    return innerHtml;
  }

  const target = extractHtmlAttribute(attributes, 'target');
  const safeHref = escapeHtml(href);
  const safeTarget = target ? ` target="${escapeHtml(target)}"` : '';
  const rel = target === '_blank' ? ' rel="noreferrer noopener"' : '';

  return `<a href="${safeHref}"${safeTarget}${rel}>${innerHtml}</a>`;
}

function sanitizeImageTag(attributes = '') {
  const src = extractHtmlAttribute(attributes, 'src');

  if (!src) {
    return '';
  }

  const alt = extractHtmlAttribute(attributes, 'alt');

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

function hasHtmlMarkup(value = '') {
  return /<\/?[a-z][\s\S]*>/i.test(String(value ?? ''));
}

function normalizeProductInfoHtml(rawContent = '') {
  const originalContent = String(rawContent ?? '').trim();

  if (!originalContent) {
    return '';
  }

  let content = hasHtmlMarkup(originalContent)
    ? originalContent
    : buildPlainTextHtml(originalContent);

  return content
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<meta[^>]*>/gi, '')
    .replace(/<\/?span[^>]*>/gi, '')
    .replace(/<\/?font[^>]*>/gi, '')
    .replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi, (_, attributes, innerHtml) =>
      sanitizeAnchorTag(attributes, innerHtml),
    )
    .replace(/<img\b([^>]*)>/gi, (_, attributes) => sanitizeImageTag(attributes))
    .replace(/\s(?:style|class|dir|align|border|cellpadding|cellspacing|width|height|loading|decoding|data-[\w-]+|aria-[\w-]+)="[^"]*"/gi, '')
    .replace(/\s(?:style|class|dir|align|border|cellpadding|cellspacing|width|height|loading|decoding|data-[\w-]+|aria-[\w-]+)='[^']*'/gi, '')
    .replace(/<p>\s*(?:&nbsp;|\s|<br\s*\/?>)*<\/p>/gi, '')
    .replace(/&nbsp;/gi, ' ')
    .trim();
}

function stripHtmlToLines(value = '') {
  const normalized = String(value ?? '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<meta[^>]*>/gi, '')
    .replace(/<\/?(span|font)[^>]*>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|ul|ol|h[1-6]|section|article)>/gi, '\n')
    .replace(/<li[^>]*>/gi, '\n- ')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, ' ');

  return decodeHtmlEntities(normalized)
    .split(/\r?\n+/)
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

function normalizeProductInfoSectionTitle(baseTitle = '', suffix = '') {
  const normalizedBase = String(baseTitle ?? '').trim().toLowerCase();
  const label = PRODUCT_INFO_SECTION_LABELS[normalizedBase] ?? baseTitle;
  return `${label}${suffix ?? ''}`.trim();
}

function parseProductInfoContent(rawContent = '') {
  const lines = stripHtmlToLines(rawContent);

  if (!lines.length) {
    return {
      intro: '',
      sections: [],
    };
  }

  const sections = [];
  const introLines = [];
  let currentSection = null;

  lines.forEach((line) => {
    const headingMatch = line.match(
      /^(chỉ định sử dụng|hướng dẫn sử dụng|lưu ý khi sử dụng sản phẩm|lưu ý|thành phần chính|thành phần|công dụng nổi bật|công dụng)(\s*\([^)]+\))?\s*:?\s*(.*)$/iu,
    );

    if (headingMatch) {
      const [, baseTitle, suffix = '', remainder = ''] = headingMatch;
      currentSection = {
        title: normalizeProductInfoSectionTitle(baseTitle, suffix),
        items: [],
        paragraphs: [],
      };
      sections.push(currentSection);

      if (remainder.trim()) {
        currentSection.paragraphs.push(remainder.trim());
      }

      return;
    }

    const cleanedLine = line.replace(/^[-•●]\s*/, '').trim();

    if (!cleanedLine) {
      return;
    }

    if (!currentSection) {
      introLines.push(cleanedLine);
      return;
    }

    const looksLikeListItem =
      /^(bước\s*\d+[:.]?|[-•●])/iu.test(line) ||
      /^(làn da|phù hợp|thích hợp|dùng|thoa|tránh|bảo quản|ban ngày|khuyên dùng)/iu.test(cleanedLine) ||
      currentSection.items.length > 0;

    if (looksLikeListItem) {
      currentSection.items.push(cleanedLine);
      return;
    }

    currentSection.paragraphs.push(cleanedLine);
  });

  return {
    intro: introLines.join(' '),
    sections: sections.filter((section) => section.title || section.items.length || section.paragraphs.length),
  };
}

function uniqueTextItems(items) {
  const seen = new Set();

  return items.filter((item) => {
    const normalized = String(item ?? '').trim();

    if (!normalized) {
      return false;
    }

    const key = normalized.toLowerCase();

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function lowercaseFirst(text) {
  const normalized = String(text ?? '').trim();

  if (!normalized) {
    return '';
  }

  return normalized.charAt(0).toLowerCase() + normalized.slice(1);
}

function formatLabelList(items) {
  const labels = uniqueTextItems(items.map((item) => lowercaseFirst(item)));

  if (!labels.length) {
    return '';
  }

  if (labels.length === 1) {
    return labels[0];
  }

  if (labels.length === 2) {
    return `${labels[0]} và ${labels[1]}`;
  }

  return `${labels.slice(0, -1).join(', ')} và ${labels[labels.length - 1]}`;
}

function toSentence(text) {
  const normalized = String(text ?? '').trim();

  if (!normalized) {
    return '';
  }

  return /[.!?:;]$/u.test(normalized) ? normalized : `${normalized}.`;
}

function splitTextSentences(text) {
  const normalized = String(text ?? '')
    .replace(/\s+/gu, ' ')
    .trim();

  if (!normalized) {
    return [];
  }

  return normalized
    .split(/(?<=[.!?])\s+/u)
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildInfoIndications(product) {
  const skinTypesLabel = formatLabelList(product.skinTypes ?? []);
  const concernsLabel = formatLabelList(product.concerns ?? []);
  const summary =
    splitTextSentences(stripHtml(product.shortDescription))[0] ??
    splitTextSentences(stripHtml(product.description))[0] ??
    '';

  return uniqueTextItems([
    skinTypesLabel
      ? `Phù hợp với ${skinTypesLabel} cần một công thức ổn định và dễ thích nghi.`
      : '',
    concernsLabel
      ? `Thích hợp khi bạn đang ưu tiên ${concernsLabel} trong routine chăm sóc hằng ngày.`
      : '',
    summary ? toSentence(summary) : '',
  ]).slice(0, 3);
}

function buildInfoNotes(product) {
  const searchableText = [
    ...(product.concerns ?? []),
    ...(product.ingredients ?? []),
    ...(product.skinTypes ?? []),
    stripHtml(product.shortDescription),
    stripHtml(product.description),
    ...(product.howToUse ?? []),
  ].join(' ');

  return uniqueTextItems([
    /chống nắng/iu.test(searchableText)
      ? 'Ban ngày nên kết hợp kem chống nắng để hỗ trợ bảo vệ da và duy trì hiệu quả chăm sóc.'
      : '',
    /(nhạy cảm|phục hồi|tái tạo|mụn|treatment)/iu.test(searchableText)
      ? 'Nên bắt đầu với tần suất phù hợp tình trạng da và thử trước trên một vùng nhỏ nếu da đang yếu hoặc nhạy cảm.'
      : '',
    /(retinol|aha|bha|glycolic|acid)/iu.test(searchableText)
      ? 'Tránh kết hợp quá nhiều hoạt chất mạnh trong cùng một routine nếu da chưa kịp thích nghi.'
      : '',
    'Bảo quản sản phẩm ở nơi khô ráo, thoáng mát, tránh ánh nắng trực tiếp và đậy kín nắp sau khi sử dụng.',
  ]).slice(0, 3);
}

function buildBenefitItems(product) {
  const searchableText = [
    ...(product.concerns ?? []),
    ...(product.ingredients ?? []),
    ...(product.skinTypes ?? []),
    stripHtml(product.shortDescription),
    stripHtml(product.description),
  ].join(' ');

  return [
    {
      icon_img: '/assets/images/products/Vector.webp',
      label: /(tái tạo|chống lão hóa|phục hồi|retinol|peptide)/iu.test(searchableText)
        ? 'Tái tạo & trẻ hóa'
        : 'Hiệu quả nổi bật',
    },
    {
      icon_img: '/assets/images/products/Vector1.webp',
      label: /(cấp ẩm|hyalur|panthenol|ceramide|betaine|glycerin|dưỡng ẩm)/iu.test(searchableText)
        ? 'Siêu cấp ẩm'
        : 'Nuôi dưỡng mềm mượt',
    },
    {
      icon_img: '/assets/images/products/Vector2.webp',
      label: /(bảo vệ|uv|chống nắng|barrier|ceramide|nhạy cảm)/iu.test(searchableText)
        ? 'Bảo vệ toàn diện'
        : 'Bảo vệ hàng rào da',
    },
    {
      icon_img: '/assets/images/products/Vector3.webp',
      label: /(kiểm soát dầu|làm sáng|mụn|niacinamide|acid|bã nhờn)/iu.test(searchableText)
        ? 'Kiểm soát dầu & dưỡng sáng'
        : 'Làm dịu & cân bằng',
    },
  ];
}

export default function ProductDetailMinimalPage({ product, relatedProducts = [] }) {
  const { addItem } = useCart();
  const [selectedSceneId, setSelectedSceneId] = useState(product.gallery[0]?.id ?? null);
  const [selectedVariantId, setSelectedVariantId] = useState(product.variants[0].id);
  const [quantity, setQuantity] = useState(1);
  const [openInfoPanelId, setOpenInfoPanelId] = useState('info');

  useEffect(() => {
    setSelectedSceneId(product.gallery[0]?.id ?? null);
    setSelectedVariantId(product.variants[0].id);
    setQuantity(1);
    setOpenInfoPanelId('info');
  }, [product.slug, product.gallery, product.variants]);

  const selectedScene =
    product.gallery.find((scene) => scene.id === selectedSceneId) ?? product.gallery[0] ?? null;
  const selectedVariant = product.variants.find((variant) => variant.id === selectedVariantId) ?? product.variants[0];
  const infoImage = product.infoImage || product.gallery[0]?.image || '';
  const shortDescriptionText = stripHtml(product.shortDescription);
  const descriptionText = stripHtml(product.description);
  const parsedInfoContent = parseProductInfoContent(product.description);
  const hasStructuredInfoContent = parsedInfoContent.sections.length > 0;
  const hasHtmlInfoContent = hasHtmlMarkup(product.description);
  const richInfoHtml = normalizeProductInfoHtml(product.description);
  const infoIntro = parsedInfoContent.intro || splitTextSentences(descriptionText)[0] || shortDescriptionText;
  const infoIndications = buildInfoIndications(product);
  const infoNotes = buildInfoNotes(product);
  const infoBenefits = buildBenefitItems(product);
  const accordionDescription =
    parsedInfoContent.intro ||
    splitTextSentences(descriptionText).slice(0, 3).join(' ') ||
    shortDescriptionText;
  const benefitSection =
    parsedInfoContent.sections.find((section) => /công dụng|chỉ định/iu.test(section.title)) ?? null;
  const ingredientSection =
    parsedInfoContent.sections.find((section) => /thành phần/iu.test(section.title)) ?? null;
  const accordionBenefitItems = uniqueTextItems([
    ...(benefitSection?.paragraphs ?? []),
    ...(benefitSection?.items ?? []),
    ...infoIndications,
    ...infoBenefits.map((benefit) => benefit.label),
  ]).slice(0, 5);
  const accordionIngredientItems = uniqueTextItems([
    ...(ingredientSection?.items ?? []),
    ...(ingredientSection?.paragraphs ?? []),
    ...(product.ingredients ?? []),
    ...(product.tagEntries?.map((entry) => entry.name) ?? []),
  ]).slice(0, 8);
  const topInfoPanels = [
    {
      id: 'info',
      title: 'THÔNG TIN',
      description: accordionDescription,
      items: [],
    },
    {
      id: 'benefits',
      title: 'LỢI ÍCH',
      description: '',
      items: accordionBenefitItems,
    },
    {
      id: 'ingredients',
      title: 'THÀNH PHẦN',
      description: '',
      items: accordionIngredientItems,
    },
  ].filter((panel) => panel.description || panel.items.length);
  const hasDiscount = Number(selectedVariant.originalPrice) > Number(selectedVariant.price);

  const increaseQuantity = () => setQuantity((current) => current + 1);
  const decreaseQuantity = () => setQuantity((current) => (current > 1 ? current - 1 : 1));

  return (
    <section className="bg-white pb-20 pt-8 md:pb-24">
      <div className=" w-full px-4 md:px-6 xl:px-8">
        <div className="max-w-[1440px] mx-auto pb-2 text-[14px] text-[#7e7165]">
          <Link href="/" className="transition hover:text-[#15110d]">
            Trang chủ
          </Link>
          <span className="mx-2">/</span>
          <Link href="/products" className="transition hover:text-[#15110d]">
            Sản phẩm
          </Link>
          <span className="mx-2">/</span>
          <span className="text-[#15110d]">{product.name}</span>
        </div>

        <div className="max-w-[1440px] mx-auto grid gap-8 pt-8 pb-20 xl:grid-cols-[100px_minmax(0,1fr)_minmax(380px,500px)] xl:gap-10">
          <div className="order-2 flex gap-3 overflow-x-auto xl:order-1 xl:flex-col xl:gap-4">
            {product.gallery.map((scene) => (
              <button
                key={scene.id}
                type="button"
                onClick={() => setSelectedSceneId(scene.id)}
                className={`min-w-[78px] overflow-hidden rounded-[16px] border bg-white transition ${
                  selectedSceneId === scene.id
                    ? 'border-[#15110d] opacity-100'
                    : 'border-[#CFC4C5] opacity-80 hover:border-[#cdbfb2] hover:opacity-100'
                }`}
              >
                <ProductArtwork scene={scene} mode="thumbnail" />
              </button>
            ))}
          </div>

          <div className="order-1 xl:order-2">
            <div className="overflow-hidden rounded-[28px] border border-[#CFC4C5] bg-white">
              <ProductArtwork scene={selectedScene} badge={product.badge} mode="detail" showEyebrow={false} />
            </div>
          </div>

          <div className="order-3 pt-1 xl:pt-0">
            <div className="text-[12px] font-medium uppercase tracking-[0.18em] text-[#a29a91]">
              {product.category}
            </div>

            <h1 className="mt-2 text-[26px] font-semibold leading-[1.04] tracking-[-0.06em] text-[#15110d] md:text-[44px]">
              {product.name}
            </h1>

            <div className="mt-5 flex items-end gap-3">
              <div className="font-['Inter',_sans-serif] text-[26px] font-semibold tracking-[-0.05em] text-[#15110d] md:text-[42px]">
                {moneyFormatter.format(selectedVariant.price)}đ
              </div>
              {hasDiscount ? (
                <div className="font-['Inter',_sans-serif] pb-1 text-[15px] text-[#9a8c7f] line-through">
                  {moneyFormatter.format(selectedVariant.originalPrice)}đ
                </div>
              ) : null}
            </div>

            <p className="mt-6 max-w-[520px] text-[14px] leading-[1.45] text-[#2b251f] md:text-[15px]">
              {shortDescriptionText}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-[#6f6357]">
              <span className="text-[#15110d]">{product.brand}</span>
              <span className="inline-flex items-center gap-2">
                <Star className="h-4 w-4 fill-current text-[#15110d]" />
                <span className="font-medium text-[#15110d]">{product.rating.toFixed(1)}</span>
              </span>
              <span>{product.reviewCount} đánh giá</span>
              <span>{product.soldCount}+ đã bán</span>
            </div>

            <div className="mt-12">
              <div className="mb-4 text-[18px] font-medium text-[#15110d]">
                Size
              </div>
              <div className="flex flex-wrap gap-3">
                {product.variants.map((variant) => {
                  const active = selectedVariantId === variant.id;

                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => setSelectedVariantId(variant.id)}
                      className={`min-w-[80px] rounded-[10px] border px-5 py-3 text-[14px] font-medium uppercase transition ${
                        active
                          ? 'border-[#15110d] bg-white text-[#15110d]'
                          : 'border-[#ddd3c6] bg-white text-[#2b251f] hover:border-[#15110d]'
                      }`}
                    >
                      {variant.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-8">
              <div className="flex flex-wrap items-center gap-3">
                <div className="grid min-h-[54px] min-w-[132px] grid-cols-[44px_1fr_44px] items-center rounded-[12px] bg-[#edf0ff]">
                  <button
                    type="button"
                    onClick={decreaseQuantity}
                    className="flex h-full items-center justify-center text-[#15110d] transition hover:text-[#6f6357]"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="text-center text-[16px] font-semibold text-[#15110d]">{quantity}</span>
                  <button
                    type="button"
                    onClick={increaseQuantity}
                    className="flex h-full items-center justify-center text-[#15110d] transition hover:text-[#6f6357]"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => addItem({ product, variant: selectedVariant, quantity })}
                  className="flex-1 rounded-[12px] bg-[linear-gradient(90deg,#7d91eb_0%,#efb6df_100%)] px-6 py-4 text-[12px] font-semibold uppercase tracking-[0.24em] text-white transition hover:opacity-95"
                >
                  Thêm vào giỏ →
                </button>
              </div>

              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-[#7b7064]">
                {purchaseNotes.map((note) => (
                  <span key={note}>{note}</span>
                ))}
              </div>
            </div>

            <div className="mt-16 border-t border-[#e8ddd0]">
              <div>
                {topInfoPanels.map((panel) => {
                  const isOpen = openInfoPanelId === panel.id;

                  return (
                    <div key={panel.id} className="border-b border-[#e8ddd0]">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenInfoPanelId((current) => (current === panel.id ? '' : panel.id))
                        }
                        className="flex w-full items-center justify-between gap-4 py-5 text-left"
                        aria-expanded={isOpen}
                      >
                        <span className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[#15110d]">
                          {panel.title}
                        </span>
                        {isOpen ? (
                          <Minus className="h-4 w-4 shrink-0 text-[#15110d]" />
                        ) : (
                          <Plus className="h-4 w-4 shrink-0 text-[#15110d]" />
                        )}
                      </button>

                      <div
                        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                        }`}
                      >
                        <div className="overflow-hidden">
                          <div className="pb-5 pr-4 text-[14px] leading-7 text-[#6f6357]">
                            {panel.description ? <p>{toSentence(panel.description)}</p> : null}

                            {panel.items.length ? (
                              <ul className={`${panel.description ? 'mt-4' : ''} space-y-2.5`}>
                                {panel.items.map((item, itemIndex) => (
                                  <li key={`${panel.id}-item-${itemIndex}`} className="flex gap-3">
                                    <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#15110d]" />
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1800px] mx-auto py-12 md:py-16">
          <div className="grid items-center gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(340px,0.82fr)] xl:gap-16">
            <div className="overflow-hidden rounded-[28px] bg-[#f8f4ee]">
              {infoImage ? (
                <div className="relative aspect-[10/11]">
                  <img
                    src={infoImage}
                    alt={`${product.name} thông tin chi tiết`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="flex aspect-[10/11] items-center justify-center bg-[linear-gradient(145deg,#faf7f2,#f1ebe2)] px-8 text-center text-[#8a7d70]">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.24em]">SRX Beauty</div>
                    <div className="mt-3 text-[16px] font-medium">Chưa có ảnh thông tin sản phẩm</div>
                  </div>
                </div>
              )}
            </div>

            <div className="max-w-[540px] mx-auto">
              {hasStructuredInfoContent ? (
                <>
                  {infoIntro ? (
                    <p className="text-[15px] leading-8 text-[#111]">
                      {toSentence(infoIntro)}
                    </p>
                  ) : null}

                  <div className="mt-8 space-y-8">
                    {parsedInfoContent.sections.map((section, sectionIndex) => {
                      const isHowToSection = /hướng dẫn sử dụng/iu.test(section.title);

                      return (
                        <div key={`${section.title}-${sectionIndex}`}>
                          <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#15110d]">
                            {section.title}
                          </div>

                          {section.paragraphs.length ? (
                            <div className="mt-4 space-y-3 text-[14px] leading-7 text-[#111]">
                              {section.paragraphs.map((paragraph, paragraphIndex) => (
                                <p key={`${section.title}-paragraph-${paragraphIndex}`}>{toSentence(paragraph)}</p>
                              ))}
                            </div>
                          ) : null}

                          {section.items.length ? (
                            isHowToSection ? (
                              <ul className="mt-4 space-y-2.5 text-[14px] leading-6 text-[#5f5449]">
                                {section.items.map((item, itemIndex) => (
                                  <li key={`${section.title}-item-${itemIndex}`} className="flex gap-3">
                                    <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#15110d]" />
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <ul className="mt-4 list-disc space-y-2.5 pl-5 text-[14px] leading-6 text-[#5f5449] marker:text-[#15110d]">
                                {section.items.map((item, itemIndex) => (
                                  <li key={`${section.title}-item-${itemIndex}`}>{toSentence(item)}</li>
                                ))}
                              </ul>
                            )
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : hasHtmlInfoContent && richInfoHtml ? (
                <div
                  className={[
                    'text-[#5f5449]',
                    '[&_p]:mt-0 [&_p]:text-[15px] [&_p]:leading-8',
                    '[&_p+*]:mt-4 [&_p+ul]:mt-5 [&_p+ol]:mt-5',
                    '[&_h2]:mt-8 [&_h2]:text-[12px] [&_h2]:font-semibold [&_h2]:uppercase [&_h2]:tracking-[0.18em] [&_h2]:text-[#15110d]',
                    '[&_h3]:mt-8 [&_h3]:text-[12px] [&_h3]:font-semibold [&_h3]:uppercase [&_h3]:tracking-[0.18em] [&_h3]:text-[#15110d]',
                    '[&_ul]:mt-4 [&_ul]:list-disc [&_ul]:space-y-2.5 [&_ul]:pl-5',
                    '[&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:space-y-2.5 [&_ol]:pl-5',
                    '[&_li]:text-[14px] [&_li]:leading-6',
                    '[&_a]:font-medium [&_a]:text-[#15110d] hover:[&_a]:text-[#6f6357]',
                    '[&_img]:mt-4 [&_img]:rounded-[20px]',
                  ].join(' ')}
                  dangerouslySetInnerHTML={{ __html: richInfoHtml }}
                />
              ) : (
                <>
                  {infoIntro ? (
                    <p className="text-[15px] leading-8 text-[#5f5449]">
                      {toSentence(infoIntro)}
                    </p>
                  ) : null}

                  <div className="mt-8 space-y-8">
                    <div>
                      <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#15110d]">
                        Chỉ định sử dụng: Sản phẩm được các chuyên gia khuyên dùng cho:
                      </div>
                      <ul className="mt-4 list-disc space-y-2.5 pl-5 text-[14px] leading-6 text-[#5f5449] marker:text-[#15110d]">
                        {infoIndications.map((item, itemIndex) => (
                          <li key={`indication-${itemIndex}`}>{item}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#15110d]">
                        Hướng dẫn sử dụng (Điều chỉnh theo làn da):
                      </div>
                      <ul className="mt-4 space-y-2.5 text-[14px] leading-6 text-[#5f5449]">
                        {product.howToUse.slice(0, 3).map((step, index) => (
                          <li key={`usage-${index}`} className="flex gap-3">
                            <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#15110d]" />
                            <span>{`Bước ${index + 1}: ${step}`}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#15110d]">
                        Lưu ý khi sử dụng sản phẩm:
                      </div>
                      <ul className="mt-4 list-disc space-y-2.5 pl-5 text-[14px] leading-6 text-[#5f5449] marker:text-[#15110d]">
                        {infoNotes.map((item, itemIndex) => (
                          <li key={`note-${itemIndex}`}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="max-w-[1440px] mx-auto mt-12 grid grid-cols-2 gap-x-6 gap-y-10 pt-10 md:grid-cols-4 md:gap-x-8">
            {infoBenefits.map((benefit) => {
              return (
                <div key={benefit.label} className="flex flex-col items-center text-center">
                  <div className="flex h-12 w-12 items-center justify-center">
                    <img
                      src={benefit.icon_img}
                      alt={benefit.label}
                      className="h-10 w-10 object-contain"
                      loading="lazy"
                    />
                  </div>
                  <div className="mt-3 text-[15px] leading-6 text-[#585858]">{benefit.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {product.tagEntries?.length ? (
          <div className="max-w-[1800px] mx-auto py-20">
            <ProductIngredientShowcase productName={product.name} entries={product.tagEntries} />
          </div>
        ) : null}

        <div className="max-w-[1800px] mx-auto py-10">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <div className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#8d7f72]">
                Sản phẩm liên quan
              </div>
              <h2 className="mt-2 text-[28px] font-semibold tracking-[-0.04em] text-[#15110d]">
                Gợi ý thêm cho routine
              </h2>
            </div>

            <Link
              href="/products"
              className="text-[14px] font-semibold text-[#15110d] transition hover:text-[#6f6357]"
            >
              Xem tất cả
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-6 md:gap-x-6 md:gap-y-8 lg:grid-cols-4">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.slug} product={relatedProduct} />
            ))}
          </div>
        </div>
      </div>
      <AboutContactSection />
      <SRXLogo/>
    </section>
  );
}
