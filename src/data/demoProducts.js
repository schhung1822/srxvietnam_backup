const productImages = {
  repairAmpoule: [
    '/assets/images/products/DxlGqif6SjoxKpaOGNxHTFuNek.webp',
    '/assets/images/products/yM3Ek7WKUdnGwqMkfDTCELyX7E.avif',
    '/assets/images/products/8YqNMp1LLntVSTG9iHzSmb4kI.avif',
  ],
  recoveryBooster: [
    '/assets/images/products/qp31eL87RIERDgBJ6THoWtlgO5Y.avif',
    '/assets/images/products/mE7jC3367liaeyEtElFGpmhCW0.avif',
    '/assets/images/products/yM3Ek7WKUdnGwqMkfDTCELyX7E.avif',
  ],
  retinolCream: [
    '/assets/images/products/8YqNMp1LLntVSTG9iHzSmb4kI.avif',
    '/assets/images/products/zyl98xm7YqGvQBgtrBs7iHEv94.avif',
    '/assets/images/products/0J73ScfckdOF2U3ruS0VR6nI2Xw.avif',
  ],
  rosyVeilSun: [
    '/assets/images/products/0J73ScfckdOF2U3ruS0VR6nI2Xw.avif',
    '/assets/images/products/qp31eL87RIERDgBJ6THoWtlgO5Y.avif',
    '/assets/images/products/DxlGqif6SjoxKpaOGNxHTFuNek.webp',
  ],
};

function createGallery({ productName, detailText, palette, accent, packageType, images }) {
  const galleryMeta = [
    { id: 'hero', title: 'Bao bì', eyebrow: detailText },
    { id: 'texture', title: 'Kết cấu', eyebrow: 'Ảnh mô phỏng sản phẩm' },
    { id: 'ritual', title: 'Routine', eyebrow: 'Gợi ý sử dụng hằng ngày' },
  ];

  return galleryMeta.map((item, index) => ({
    ...item,
    word: item.title,
    palette,
    accent,
    packageType,
    layout: 'single',
    image: images[index] ?? images[0],
    alt: `${productName} - ${item.title}`,
  }));
}

export const demoProducts = [
  {
    id: 1,
    slug: 'srx-repair-ampoule-50ml',
    name: 'Tinh chất SRX Repair Ampoule 50ml',
    brand: 'SRX',
    category: 'Phục hồi da',
    subcategory: 'Tinh chất phục hồi',
    price: 740000,
    originalPrice: 790000,
    rating: 4.9,
    reviewCount: 128,
    soldCount: 640,
    badge: 'Repair',
    promoLabel: '50ml',
    shortDescription:
      'Giải pháp tái sinh và chữa lành tổn thương trên da nhạy cảm, hỗ trợ làm dịu nhanh nền da mỏng yếu sau treatment.',
    description:
      'SRX Repair Ampoule là tinh chất cấp ẩm phục hồi cho làn da khô ráp, thiếu nước, dễ kích ứng hoặc vừa trải qua các liệu trình xâm lấn như laser, lăn kim và peel da. Kết cấu serum thẩm thấu nhanh, thoáng nhẹ, phù hợp cho routine phục hồi mỗi ngày.',
    searchKeywords: ['repair ampoule', 'phục hồi da', 'serum đồng', 'copper tripeptide', 'da nhạy cảm'],
    skinTypes: ['Da nhạy cảm', 'Da khô', 'Da hỗn hợp'],
    concerns: ['Phục hồi', 'Cấp ẩm', 'Làm dịu', 'Sau treatment'],
    swatches: ['#f1e8ff', '#ba9cff', '#6e58d9'],
    variants: [
      { id: '50ml', label: '50ml', price: 740000, originalPrice: 790000, stock: 18, sku: 'SRX-RA-50' },
    ],
    specs: [
      { label: 'Danh mục', value: 'Phục hồi da' },
      { label: 'Kết cấu', value: 'Serum lỏng, thấm nhanh' },
      { label: 'Dung tích', value: '50ml' },
      { label: 'Phù hợp', value: 'Da nhạy cảm, da bong tróc, da sau can thiệp xâm lấn' },
      { label: 'Thời điểm dùng', value: 'Sáng và tối' },
    ],
    highlights: [
      {
        title: 'Tái sinh và chữa lành',
        description:
          'Copper Tripeptide-1 hỗ trợ tăng tốc độ phục hồi mô da, làm dịu tổn thương và cải thiện độ mềm mịn.',
      },
      {
        title: 'Củng cố hàng rào da',
        description:
          'Panthenol, Ceramide và Betaine giúp giảm kích ứng, giảm mất nước qua biểu bì và tăng khả năng đề kháng của da.',
      },
      {
        title: 'Siêu cấp ẩm',
        description:
          'Sodium Hyaluronate duy trì độ ẩm sâu, hỗ trợ bề mặt da căng mềm và hạn chế khô ráp kéo dài.',
      },
    ],
    ingredients: ['Copper Tripeptide-1', 'Panthenol', 'Ceramide', 'Betaine', 'Sodium Hyaluronate'],
    howToUse: [
      'Làm sạch da với sản phẩm tẩy trang và sữa rửa mặt dịu nhẹ.',
      'Lấy 2 đến 3 giọt tinh chất, chấm lên trán, má và cằm rồi thoa đều từ trong ra ngoài.',
      'Dùng đều đặn mỗi ngày để duy trì nền da khỏe và phục hồi nhanh hơn sau treatment.',
    ],
    gallery: createGallery({
      productName: 'SRX Repair Ampoule 50ml',
      detailText: 'Copper Tripeptide-1 + Panthenol',
      palette: ['#f7f0ff', '#d6c7ff'],
      accent: '#6e58d9',
      packageType: 'dropper',
      images: productImages.repairAmpoule,
    }),
    relatedSlugs: ['srx-recovery-booster-50ml', 'srx-retinol-a-cream-50ml', 'srx-rosy-veil-tone-up-glow-sun-50ml'],
  },
  {
    id: 2,
    slug: 'srx-recovery-booster-50ml',
    name: 'SRX Recovery Booster 50ml',
    brand: 'SRX',
    category: 'Phục hồi da',
    subcategory: 'Gel phục hồi',
    price: 850000,
    originalPrice: 920000,
    rating: 4.9,
    reviewCount: 94,
    soldCount: 420,
    badge: 'Booster',
    promoLabel: 'Booster Gel',
    shortDescription:
      'Gel tăng cường phục hồi da thế hệ mới giúp cấp nước nhanh, hỗ trợ rút ngắn thời gian tái tạo và làm dịu kích ứng.',
    description:
      'SRX Recovery Booster là gel phục hồi chuyên sâu dành cho làn da thiếu nước, nhạy cảm, sau xâm lấn hoặc đang treatment mạnh. Sản phẩm tập trung vào cấp ẩm tức thì, phục hồi hàng rào bảo vệ tự nhiên và giảm thiểu các tác nhân gây hại từ môi trường.',
    searchKeywords: ['recovery booster', 'gel phục hồi', 'cấp nước', 'ceramide', 'sau laser'],
    skinTypes: ['Da nhạy cảm', 'Da khô', 'Da dầu', 'Da hỗn hợp'],
    concerns: ['Phục hồi', 'Cấp ẩm', 'Làm dịu', 'Sau treatment'],
    swatches: ['#e9f4ff', '#9ec9f6', '#4f8cd7'],
    variants: [
      { id: '50ml', label: '50ml', price: 850000, originalPrice: 920000, stock: 14, sku: 'SRX-RB-50' },
    ],
    specs: [
      { label: 'Danh mục', value: 'Phục hồi da' },
      { label: 'Kết cấu', value: 'Gel mỏng nhẹ, ngậm nước' },
      { label: 'Dung tích', value: '50ml' },
      { label: 'Phù hợp', value: 'Da thiếu nước, da nhạy cảm, da sau peel, laser, phi kim' },
      { label: 'Thời điểm dùng', value: 'Sáng và tối' },
    ],
    highlights: [
      {
        title: 'Rút ngắn thời gian tái tạo',
        description:
          'Copper Tripeptides-1 và Panthenol hỗ trợ sửa chữa tổn thương, giảm đỏ rát và tăng sinh nền da khỏe hơn.',
      },
      {
        title: 'Khóa ẩm và chống thất thoát nước',
        description:
          'Ceramides giúp phục hồi màng bảo vệ tự nhiên, hạn chế mất nước và giảm cảm giác căng tức kéo dài.',
      },
      {
        title: 'Bảo vệ trước stress môi trường',
        description:
          'Hydroxydecyl Ubiquinone hỗ trợ chống oxy hóa, giảm tác động từ tia UV, ô nhiễm và độc tố.',
      },
    ],
    ingredients: ['Copper Tripeptides-1', 'Ceramides', 'Panthenol', 'Hydroxydecyl Ubiquinone'],
    howToUse: [
      'Làm sạch da và cân bằng với toner dịu nhẹ trước khi dùng booster.',
      'Có thể dùng sau lớp tinh chất lỏng như Repair Ampoule, sau đó lấy 1 đến 2 hạt đậu gel thoa đều toàn mặt.',
      'Ban ngày luôn kết thúc routine bằng kem chống nắng để bảo vệ nền da đang phục hồi.',
    ],
    gallery: createGallery({
      productName: 'SRX Recovery Booster 50ml',
      detailText: 'Ceramides + Panthenol',
      palette: ['#eef7ff', '#c9e0ff'],
      accent: '#4f8cd7',
      packageType: 'pump',
      images: productImages.recoveryBooster,
    }),
    relatedSlugs: ['srx-repair-ampoule-50ml', 'srx-retinol-a-cream-50ml', 'srx-rosy-veil-tone-up-glow-sun-50ml'],
  },
  {
    id: 3,
    slug: 'srx-retinol-a-cream-50ml',
    name: 'SRX Retinol A Cream 50ml',
    brand: 'SRX',
    category: 'Tái tạo da',
    subcategory: 'Kem tái tạo',
    price: 1050000,
    originalPrice: 1150000,
    rating: 5.0,
    reviewCount: 173,
    soldCount: 980,
    badge: 'Best Seller',
    promoLabel: 'Retinol 8%',
    shortDescription:
      'Kem tái tạo và trẻ hóa da thế hệ mới với Retinol Complex 8%, tập trung chống lão hóa, làm sáng da và cải thiện bề mặt da.',
    description:
      'SRX Retinol A Cream là dòng kem tái tạo chuyên sâu dành cho làn da cần xử lý lão hóa, xỉn màu, bít tắc và bề mặt thô ráp. Công thức kết hợp Retinol Complex 8%, 30 loại peptides, Glycolic Acid 5%, Glutathione và Niacinamide để tăng tốc độ thay sừng nhưng vẫn hỗ trợ nền da ổn định hơn.',
    searchKeywords: ['retinol a cream', 'retinol 8%', 'glycolic acid', 'chống lão hóa', 'làm sáng da'],
    skinTypes: ['Da khô', 'Da dầu', 'Da hỗn hợp', 'Da nhạy cảm'],
    concerns: ['Tái tạo da', 'Chống lão hóa', 'Làm sáng da', 'Kiểm soát dầu'],
    swatches: ['#f6ecd9', '#d7b682', '#8e6738'],
    variants: [
      { id: '50ml', label: '50ml', price: 1050000, originalPrice: 1150000, stock: 11, sku: 'SRX-RET-50' },
    ],
    specs: [
      { label: 'Danh mục', value: 'Tái tạo da' },
      { label: 'Kết cấu', value: 'Kem treatment mỏng nhẹ' },
      { label: 'Dung tích', value: '50ml' },
      { label: 'Phù hợp', value: 'Da lão hóa, da xỉn màu, da có lỗ chân lông to và bít tắc' },
      { label: 'Thời điểm dùng', value: 'Chỉ dùng buổi tối' },
    ],
    highlights: [
      {
        title: 'Tái tạo và thay sừng',
        description:
          'Retinol Complex 8% kết hợp Glycolic Acid 5% hỗ trợ làm mịn bề mặt và tăng tốc độ đổi mới da.',
      },
      {
        title: 'Chống lão hóa toàn diện',
        description:
          'Phức hợp 30 loại peptides cùng Niacinamide hỗ trợ độ đàn hồi, giảm nếp nhăn và củng cố hàng rào lipid.',
      },
      {
        title: 'Làm sáng và cải thiện sắc tố',
        description:
          'Glutathione cùng Niacinamide hỗ trợ giảm xỉn màu, nếp sạm và làm đều tông da rõ hơn theo thời gian.',
      },
    ],
    ingredients: ['Retinol Complex 8%', '30 loại Peptides', 'Glycolic Acid 5%', 'Glutathione', 'Niacinamide'],
    howToUse: [
      'Làm sạch da, dùng toner dịu nhẹ và lớp serum/phục hồi như Repair Ampoule hoặc Recovery Booster trước khi bôi kem.',
      'Lấy lượng kem cỡ 1 hạt đậu xanh, thoa một lớp mỏng lên toàn mặt và tránh vùng mắt, khóe mũi, mép môi.',
      'Bắt đầu với tần suất 2 đến 3 lần mỗi tuần nếu da nhạy cảm, sau đó tăng dần; ban ngày bắt buộc dùng kem chống nắng.',
    ],
    gallery: createGallery({
      productName: 'SRX Retinol A Cream 50ml',
      detailText: 'Retinol Complex 8% + 30 Peptides',
      palette: ['#fbf1df', '#e5d0a9'],
      accent: '#8e6738',
      packageType: 'jar',
      images: productImages.retinolCream,
    }),
    relatedSlugs: ['srx-repair-ampoule-50ml', 'srx-recovery-booster-50ml', 'srx-rosy-veil-tone-up-glow-sun-50ml'],
  },
  {
    id: 4,
    slug: 'srx-rosy-veil-tone-up-glow-sun-50ml',
    name: 'SRX Rosy Veil Tone Up Glow Sun SPF50 PA+++ 50ml',
    brand: 'SRX',
    category: 'Bảo vệ da',
    subcategory: 'Kem chống nắng nâng tông',
    price: 389000,
    originalPrice: 429000,
    rating: 4.8,
    reviewCount: 76,
    soldCount: 388,
    badge: 'Tone Up',
    promoLabel: 'SPF50',
    shortDescription:
      'Kem chống nắng nâng tông 3 trong 1 giúp bảo vệ da, làm sáng tức thì và tạo hiệu ứng căng bóng nhẹ cho nền da mệt mỏi.',
    description:
      'SRX Rosy Veil Tone Up Glow Sun là giải pháp bảo vệ da ban ngày kết hợp chống nắng quang phổ rộng, hiệu ứng tone up hồng nhẹ và lớp finish glow mướt. Công thức tập trung vào làm dịu, dưỡng sáng và cấp nước để phù hợp với cả làn da nhạy cảm hoặc da sau treatment.',
    searchKeywords: ['rosy veil', 'tone up glow sun', 'kem chống nắng nâng tông', 'spf50', 'glow sun'],
    skinTypes: ['Da nhạy cảm', 'Da khô', 'Da dầu', 'Da hỗn hợp'],
    concerns: ['Bảo vệ UV', 'Làm sáng da', 'Cấp ẩm', 'Kiểm soát dầu'],
    swatches: ['#fff2f7', '#f3c2d4', '#d87ca2'],
    variants: [
      { id: '50ml', label: '50ml', price: 389000, originalPrice: 429000, stock: 20, sku: 'SRX-RV-50' },
    ],
    specs: [
      { label: 'Danh mục', value: 'Bảo vệ da' },
      { label: 'Kết cấu', value: 'Kem nâng tông ẩm mịn' },
      { label: 'Dung tích', value: '50ml' },
      { label: 'Phù hợp', value: 'Da xỉn màu, da thiếu nước, da nhạy cảm, da cần lớp lót sáng nhẹ' },
      { label: 'Thời điểm dùng', value: 'Ban ngày, thoa lại sau 2 đến 3 giờ khi ở ngoài trời' },
    ],
    highlights: [
      {
        title: 'Chống nắng và bảo vệ toàn diện',
        description:
          'Màng lọc quang phổ rộng hỗ trợ chống lại tia UVA và UVB, đặc biệt quan trọng khi da đang dùng treatment tái tạo.',
      },
      {
        title: 'Rosy tone up tức thì',
        description:
          'Sắc hồng nhạt giúp trung hòa nền da xỉn màu, mệt mỏi và tạo hiệu ứng rạng rỡ tự nhiên khi không makeup.',
      },
      {
        title: 'Glow ẩm mượt',
        description:
          'Niacinamide, Panthenol, rau má, Glutathione và Hyaluronic Acid hỗ trợ làm dịu, dưỡng sáng và cấp nước sâu hơn.',
      },
    ],
    ingredients: ['Niacinamide', 'Centella Asiatica', 'Panthenol', 'Glutathione', 'Hyaluronic Acid'],
    howToUse: [
      'Dùng trên lớp dưỡng ẩm; với da dầu có thể dùng trực tiếp như bước dưỡng ẩm kiêm chống nắng 2 trong 1.',
      'Lấy lượng kem theo quy tắc 2 ngón tay, chấm lên mặt rồi vỗ nhẹ để kem dàn đều và tiệp vào da.',
      'Thoa lại sau mỗi 2 đến 3 giờ nếu hoạt động liên tục ngoài trời hoặc đổ nhiều mồ hôi.',
    ],
    gallery: createGallery({
      productName: 'SRX Rosy Veil Tone Up Glow Sun 50ml',
      detailText: 'Tone Up Glow + UV Protection',
      palette: ['#fff4f8', '#f4cfdd'],
      accent: '#d87ca2',
      packageType: 'tube',
      images: productImages.rosyVeilSun,
    }),
    relatedSlugs: ['srx-repair-ampoule-50ml', 'srx-recovery-booster-50ml', 'srx-retinol-a-cream-50ml'],
  },
];

export const productCategories = ['Tất cả', 'Phục hồi da', 'Tái tạo da', 'Bảo vệ da'];

export const concernOptions = [
  'Tất cả',
  'Phục hồi',
  'Cấp ẩm',
  'Làm dịu',
  'Sau treatment',
  'Tái tạo da',
  'Chống lão hóa',
  'Làm sáng da',
  'Bảo vệ UV',
  'Kiểm soát dầu',
];

export const skinTypeOptions = [
  'Tất cả',
  'Da nhạy cảm',
  'Da khô',
  'Da dầu',
  'Da hỗn hợp',
];

export const priceOptions = [
  { id: 'all', label: 'Tất cả mức giá' },
  { id: 'under-300', label: 'Dưới 300.000đ' },
  { id: '300-400', label: '300.000đ - 400.000đ' },
  { id: '400-500', label: '400.000đ - 500.000đ' },
  { id: 'over-500', label: 'Trên 500.000đ' },
];

export const getProductBySlug = (slug) => demoProducts.find((product) => product.slug === slug);

export const getRelatedProducts = (product) => {
  const related = (product.relatedSlugs ?? [])
    .map((slug) => getProductBySlug(slug))
    .filter(Boolean);

  if (related.length >= 3) {
    return related;
  }

  return demoProducts.filter((item) => item.slug !== product.slug).slice(0, 3);
};
