import Link from 'next/link';
import ProductCard from '../shop/ProductCard.jsx';
import ScrollRevealHeading from './ScrollRevealHeading.jsx';
import {
  homeButtonHighlightClass,
  homeButtonSheenClass,
  homePrimaryButtonClass,
  homeSecondaryButtonClass,
} from './homeCtaStyles.js';

export default function HomeFeaturedProductsSection({ products = [] }) {
  if (!products.length) {
    return null;
  }

  const sectionTitle = 'Sản phẩm nổi bật';

  return (
    <section className="bg-white px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-[1840px]">
        <div className="mx-auto max-w-[760px] text-center">
          <div
            className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#8d7f72]"
            style={{ fontFamily: '"Inter", "Hubot Sans", sans-serif' }}
          >
            SRX Selection
          </div>
          <ScrollRevealHeading
            as="h2"
            className="mt-4 text-[30px] font-medium leading-[1.3] tracking-[-0.05em] sm:text-[48px] lg:text-[60px]"
            revealedClassName="text-[#6e96fb]"
            baseStyle={{ color: 'rgba(110,150,251,0.18)' }}
            blurPx={8}
            start="top 88%"
            end="top 44%"
            style={{ fontFamily: '"Manrope", "Hubot Sans", sans-serif' }}
          >
            {sectionTitle}
          </ScrollRevealHeading>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10 xl:grid-cols-4">
          {products.map((product, index) => (
            <ProductCard
              key={product.slug}
              product={product}
              priority={index < 2}
            />
          ))}
        </div>

        <div className="mt-12 flex w-full justify-center sm:mt-14">
          <div className="flex w-full max-w-[460px] justify-center gap-3 sm:w-auto sm:max-w-none sm:gap-[18px]">
            <Link
              href="/products"
              className={`${homePrimaryButtonClass} min-w-[118px] shrink-0 justify-center sm:w-auto`}
              style={{ fontFamily: '"Manrope", "Hubot Sans", sans-serif' }}
            >
              <span className={homeButtonHighlightClass} />
              <span className={homeButtonSheenClass} />
              <span className="relative z-[1]">Khám phá ngay</span>
            </Link>

            <Link
              href="/contact"
              className={`${homeSecondaryButtonClass} min-w-[210px] shrink-0 justify-center px-6 sm:w-auto sm:px-7`}
              style={{ fontFamily: '"Manrope", "Hubot Sans", sans-serif' }}
            >
              <span className={homeButtonHighlightClass} />
              <span className={homeButtonSheenClass} />
              <span className="relative z-[1]">Nâng cấp làn da của bạn</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
