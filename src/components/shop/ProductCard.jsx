import Link from 'next/link';
import ProductArtwork from './ProductArtwork';

const moneyFormatter = new Intl.NumberFormat('vi-VN');

function getDiscountPercent(originalPrice, salePrice) {
  const original = Number(originalPrice);
  const sale = Number(salePrice);

  if (!original || original <= sale) {
    return null;
  }

  return Math.max(1, Math.round(((original - sale) / original) * 100));
}

export default function ProductCard({ product, priority = false }) {
  const artwork = product.gallery[0];
  const hoverArtwork = product.gallery[1] ?? artwork;
  const hasDiscount = Number(product.originalPrice) > Number(product.price);
  const discountPercent = getDiscountPercent(product.originalPrice, product.price);
  const imageBadge = discountPercent ? `-${discountPercent}%` : '';

  return (
    <Link href={`/products/${product.slug}`} className="group block" prefetch={priority}>
      <div className="overflow-hidden rounded-[16px] bg-transparent">
        <ProductArtwork
          scene={artwork}
          hoverScene={hoverArtwork}
          badge={imageBadge}
          mode="card"
        />
      </div>

      <div className="px-1 pt-2">
        <div className="mt-2 flex items-center justify-between text-[11px] text-[#726351] sm:text-[13px]">
          <span>{product.category}</span>
          <span>{product.rating.toFixed(1)}</span>
        </div>
        <h3 className="line-clamp-2 min-h-[40px] text-[14px] font-semibold leading-[1.4] text-[#171311] transition-colors group-hover:text-[#2540dd] sm:min-h-[48px] sm:text-[16px]">
          {product.name}
        </h3>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="font-['Inter',_sans-serif] text-[15px] font-bold text-[#171311] sm:text-[18px]">
            {moneyFormatter.format(product.price)}đ
          </span>
          {hasDiscount ? (
            <span className="font-['Inter',_sans-serif] text-[12px] text-[#9e8d7b] line-through sm:text-[14px]">
              {moneyFormatter.format(product.originalPrice)}đ
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
