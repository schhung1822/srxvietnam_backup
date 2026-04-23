'use client';

import { useState } from 'react';

const featuredProducts = [
  {
    id: 'retinol-a-cream',
    name: 'SRX Retinol A Cream',
    outline: '/assets/images/about/border_sp1.webp',
    preview: '/assets/images/about/sp1.webp',
    frameHeightClass: 'h-[210px] sm:h-[240px] lg:h-[360px]',
  },
  {
    id: 'lipoderm-mask',
    name: 'Lipoderm Mask',
    outline: '/assets/images/about/border_sp2.webp',
    preview: '/assets/images/about/sp2.webp',
    frameHeightClass: 'h-[200px] sm:h-[232px] lg:h-[350px]',
  },
  {
    id: 'repair-ampoule',
    name: 'SRX Repair Ampoule',
    outline: '/assets/images/about/border_sp3.webp',
    preview: '/assets/images/about/sp3.webp',
    frameHeightClass: 'h-[175px] sm:h-[210px] lg:h-[310px]',
  },
  {
    id: 'rosy-veil-tone-up-glow-sun',
    name: 'SRX Rosy Veil Tone Up Glow Sun SPF50+ PA++++',
    outline: '/assets/images/about/border_sp4.webp',
    preview: '/assets/images/about/sp4.webp',
    frameHeightClass: 'h-[195px] sm:h-[228px] lg:h-[340px]',
  },
  {
    id: 'recovery-booster',
    name: 'SRX Recovery Booster',
    outline: '/assets/images/about/border_sp5.webp',
    preview: '/assets/images/about/sp5.webp',
    frameHeightClass: 'h-[220px] sm:h-[255px] lg:h-[380px]',
  },
];

export default function AboutFeaturedProductsSection() {
  const [activeProductId, setActiveProductId] = useState(null);

  return (
    <section className="bg-white px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-[1800px] px-[20px]">
        <div className="max-w-[640px]">
          <h2
            className="text-[24px] font-medium leading-[1] tracking-[-0.06em] text-[#111111] sm:text-[36px] lg:text-[40px]"
            style={{ fontFamily: '"Manrope", "Hubot Sans", sans-serif' }}
          >
            Lựa chọn hàng đầu của chúng tôi
          </h2>
        </div>

        <div className="mt-10 grid auto-rows-fr grid-cols-2 gap-x-4 gap-y-6 sm:mt-12 sm:grid-cols-3 lg:grid-cols-5 lg:gap-x-3 xl:gap-x-5">
          {featuredProducts.map((product) => {
            const isActive = product.id === activeProductId;

            return (
              <button
                key={product.id}
                type="button"
                className="group flex h-full flex-col justify-end text-left"
                aria-pressed={isActive}
                onMouseEnter={() => setActiveProductId(product.id)}
                onMouseLeave={() => setActiveProductId(null)}
                onFocus={() => setActiveProductId(product.id)}
                onBlur={() => setActiveProductId(null)}
                onClick={() =>
                  setActiveProductId((currentProductId) =>
                    currentProductId === product.id ? null : product.id
                  )
                }
              >
                <div className="relative flex min-h-[400px] flex-1 items-end justify-center py-3 transition duration-300 lg:min-h-[560px]">
                  <img
                    src={product.outline}
                    alt=""
                    aria-hidden="true"
                    className={`absolute bottom-3 left-1/2 w-auto -translate-x-1/2 object-contain transition-all duration-300 ${product.frameHeightClass} ${
                      isActive
                        ? 'scale-[0.985] opacity-0'
                        : 'scale-100 opacity-70 group-hover:opacity-100 group-focus-visible:opacity-100'
                    }`}
                    loading="lazy"
                  />

                  <img
                    src={product.preview}
                    alt={product.name}
                    className={`absolute bottom-3 left-1/2 w-auto -translate-x-1/2 object-contain transition-all duration-300 ${product.frameHeightClass} ${
                      isActive
                        ? 'translate-y-0 scale-100 opacity-100'
                        : 'translate-y-3 scale-[0.985] opacity-0'
                    }`}
                    loading="lazy"
                  />
                </div>

                <span
                  className={`mt-3 block text-center text-[11px] leading-[1.35] text-[#121212] transition-opacity duration-300 sm:text-[11px] ${
                    isActive ? 'opacity-100' : 'opacity-72 group-hover:opacity-100'
                  }`}
                  style={{ fontFamily: '"Inter", "Hubot Sans", sans-serif' }}
                >
                  {product.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
