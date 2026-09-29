// Từ khóa SEO cho từng sản phẩm, theo slug.
// - descriptor: loại sản phẩm + công dụng chính, được ghép vào <title> (Google dùng title để xếp hạng).
// - keywords: cách khách hàng thường tìm sản phẩm (tên cũ, loại sản phẩm, nhu cầu da).
// Sản phẩm mới chưa có trong danh sách vẫn dùng được, chỉ nhận bộ từ khóa chung.
export const PRODUCT_SEO = {
  'srx-recovery-booster-50ml': {
    descriptor: 'Gel phục hồi da, cấp ẩm sau laser',
    keywords: [
      'SRX Recovery Booster',
      'gel phục hồi da SRX',
      'gel dưỡng ẩm phục hồi da',
      'phục hồi da sau laser',
      'phục hồi da sau peel',
      'làm dịu da kích ứng',
      'Copper Tripeptide-1',
    ],
  },
  'srx-nourishing-ampoule-50ml': {
    descriptor: 'Serum cấp ẩm phục hồi da',
    keywords: [
      'SRX Nourishing Ampoule',
      'serum SRX',
      'tinh chất SRX',
      'serum phục hồi da',
      'serum cấp ẩm',
      'ampoule phục hồi da Hàn Quốc',
      'serum cho da nhạy cảm',
    ],
  },
  'srx-retinol-enhance-peel-30ml': {
    descriptor: 'Kem dưỡng Retinol tái tạo, trẻ hóa da',
    keywords: [
      'SRX Retinol Enhance Peel',
      'SRX Retinol',
      'SRX Retinol A Crem',
      'kem Retinol SRX',
      'kem dưỡng Retinol',
      'Retinol Complex 8%',
      'Retinol chống lão hóa',
      'Retinol cho da mụn',
    ],
  },
  'srx-sga-renew-peel': {
    descriptor: 'Tinh chất peel sinh học cho da mụn',
    keywords: [
      'SRX SGA Renew Peel',
      'peel da sinh học',
      'peel da mụn tại nhà',
      'tinh chất peel da',
      'gom cồi mụn',
      'mờ thâm mụn',
      'micropeel',
    ],
  },
  'srx-rosy-veil-toneup-glow-sun-50ml': {
    descriptor: 'Serum chống nắng nâng tông',
    keywords: [
      'SRX Rosy Veil',
      'kem chống nắng SRX',
      'serum chống nắng nâng tông',
      'kem chống nắng nâng tông',
      'chống nắng cho da nhạy cảm',
      'chống nắng sau treatment',
      'SPF50+ PA++++',
    ],
  },
  'srx-cloud-mask-body-cream-250ml': {
    descriptor: 'Kem ủ trắng dưỡng thể toàn thân',
    keywords: [
      'SRX Cloud Mask Body Cream',
      'kem body SRX',
      'kem ủ trắng body',
      'kem dưỡng thể trắng da',
      'kem dưỡng body Hàn Quốc',
    ],
  },
  'lipoderm-mask': {
    descriptor: 'Mặt nạ phục hồi da cấp ẩm',
    keywords: [
      'SRX Lipoderm Mask',
      'mặt nạ SRX',
      'mặt nạ phục hồi da',
      'mặt nạ tế bào gốc',
      'mặt nạ sau laser',
      'mặt nạ cấp ẩm làm dịu da',
    ],
  },
};

function normalizeText(value = '') {
  return String(value ?? '')
    .normalize('NFC')
    .toLowerCase()
    .trim();
}

export function getProductSeo(product) {
  const name = String(product?.name ?? '').trim();
  const entry = PRODUCT_SEO[product?.slug] ?? {};
  const descriptor = String(entry.descriptor ?? '').trim();
  // Không ghép descriptor nếu tên sản phẩm đã chứa sẵn (tránh title lặp từ).
  const title =
    descriptor && !normalizeText(name).includes(normalizeText(descriptor))
      ? `${name} - ${descriptor}`
      : name;

  return {
    title,
    keywords: [
      name,
      `${name} chính hãng`,
      `mua ${name}`,
      `${name} giá bao nhiêu`,
      `review ${name}`,
      ...(entry.keywords ?? []),
      product?.category,
      ...(product?.concerns ?? []),
      ...(product?.skinTypes ?? []),
      ...(product?.ingredients ?? []),
    ],
  };
}
