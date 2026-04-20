const newsDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export const ALL_NEWS_CATEGORY = "Tất cả";

export const demoNews = [
  {
    id: 1,
    slug: "phuc-hop-30-loai-peptides-trong-retinol-a-cream-co-tac-dung-gi",
    title: "Phức hợp 30 loại Peptides trong Retinol A Cream có tác dụng gì?",
    category: "Kiến thức",
    excerpt:
      "Peptide đa tầng giúp tăng độ săn chắc, hỗ trợ tái tạo bề mặt da và giảm cảm giác khô rát khi kết hợp treatment kéo dài.",
    content:
      "Phức hợp 30 loại peptide trong Retinol A Cream được xây dựng theo hướng hỗ trợ tái tạo nhưng vẫn giữ nhịp phục hồi cho da. Điểm mạnh của công thức nằm ở việc nhiều phân tử peptide đảm nhiệm các vai trò khác nhau: hỗ trợ tín hiệu tăng sinh collagen, cải thiện đàn hồi và giúp bề mặt da trông mịn, ổn định hơn.\n\nTrong routine treatment, tổ hợp này đặc biệt hữu ích khi da bắt đầu có dấu hiệu mệt, xỉn hoặc kém săn chắc. Khi dùng đều với tần suất hợp lý, peptide góp phần giảm cảm giác khô rít kéo dài và giữ cho quá trình treatment diễn ra êm hơn.",
    publishedAt: "2026-07-06",
    readTime: "5 phút đọc",
    tags: ["peptide", "retinol", "phục hồi", "treatment"],
    coverImage: "/assets/images/home/sl2.webp",
    coverAlt: "Hình ảnh cải thiện làn da sau quá trình treatment.",
    featured: true,
  },
  {
    id: 2,
    slug: "phuc-hop-retinol-8-cua-srx-co-gi-dac-biet",
    title: "Phức hợp Retinol 8% của SRX có gì đặc biệt?",
    category: "Công nghệ",
    excerpt:
      "Cấu trúc retinol cải tiến hướng tới hiệu quả tái tạo rõ hơn nhưng vẫn kiểm soát cảm giác châm chích và bong tróc quá mức.",
    content:
      "Retinol 8% của SRX không chỉ là câu chuyện về nồng độ, mà là cách toàn bộ hệ công thức được phối hợp để tối ưu nhịp tái tạo. Bên cạnh retinoid, nền công thức còn bổ sung các thành phần làm dịu và phục hồi nhằm kiểm soát nguy cơ kích ứng tích lũy.\n\nVì vậy, sản phẩm phù hợp với người dùng muốn nâng treatment lên một mức mạnh hơn nhưng vẫn cần bề mặt da đủ ổn định để theo được liệu trình. Đây là kiểu công thức ưu tiên tính đều đặn thay vì tạo cảm giác quá tải ngay từ giai đoạn đầu.",
    publishedAt: "2026-07-03",
    readTime: "4 phút đọc",
    tags: ["retinol", "công nghệ", "tái tạo", "chống lão hóa"],
    coverImage: "/assets/images/home/blue.webp",
    coverAlt: "Các phân tử hoạt chất nổi trên nền xanh trong suốt.",
    featured: true,
  },
  {
    id: 3,
    slug: "phac-do-ket-hop-retinol-va-repair-ampoule-cua-srx",
    title: "Phác đồ kết hợp Retinol & Repair Ampoule của SRX.",
    category: "Phác đồ",
    excerpt:
      "Kết hợp retinol với ampoule phục hồi theo nhịp phù hợp giúp da tiếp nhận treatment tốt hơn mà không phải đánh đổi độ ổn định hàng rào da.",
    content:
      "Với làn da đang bắt đầu treatment hoặc dễ phản ứng, cách kết hợp retinol cùng Repair Ampoule nên đi theo nhịp chậm và có chủ đích. Ở những tối dùng retinol, ampoule phục hồi nên được đặt trước hoặc sau tùy tình trạng da để giảm cảm giác châm chích và hỗ trợ bề mặt da đỡ khô căng.\n\nĐiểm quan trọng nhất là duy trì được tính đều đặn. Một phác đồ bền vững luôn tốt hơn việc tăng tốc quá nhanh rồi phải ngắt quãng do kích ứng. Khi da ổn định, bạn mới có thể nâng dần cường độ treatment theo từng giai đoạn.",
    publishedAt: "2026-07-03",
    readTime: "6 phút đọc",
    tags: ["phác đồ", "repair ampoule", "retinol", "routine"],
    coverImage: "/assets/images/home/purble.webp",
    coverAlt: "Kết cấu hoạt chất màu tím với bề mặt bóng nhẹ.",
    featured: true,
  },
  {
    id: 4,
    slug: "srx-nourishing-ampoule-phu-hop-dung-o-giai-doan-nao",
    title: "SRX Nourishing Ampoule phù hợp dùng ở giai đoạn nào?",
    category: "Kiến thức",
    excerpt:
      "Đây là lựa chọn phù hợp khi da bắt đầu mỏng, thiếu ẩm, dễ đỏ hoặc cần một bước đệm trước và sau các hoạt chất mạnh.",
    content:
      "Nourishing Ampoule phát huy tốt nhất ở những giai đoạn da cần nạp lại độ ẩm và độ êm. Đây có thể là thời điểm trước khi bước vào treatment, giữa liệu trình khi da có dấu hiệu mỏng yếu hoặc sau những ngày bong tróc kéo dài.\n\nNếu dùng đúng vai trò, ampoule sẽ không chỉ làm dịu tức thì mà còn giúp da duy trì cảm giác đủ nước, mềm và bớt nhạy trước các tác nhân từ môi trường. Đó là lý do sản phẩm này thường được xem như một điểm đệm ổn định cho routine.",
    publishedAt: "2026-06-28",
    readTime: "4 phút đọc",
    tags: ["ampoule", "cấp ẩm", "làm dịu", "phục hồi"],
    coverImage: "/assets/images/home/yellow.webp",
    coverAlt: "Những giọt tinh chất vàng trong suốt lơ lửng trên nền sáng.",
    featured: false,
  },
  {
    id: 5,
    slug: "he-thong-phuc-hoi-sinh-hoc-chuyen-sau-cua-srx-hoat-dong-ra-sao",
    title: "Hệ thống phục hồi sinh học chuyên sâu của SRX hoạt động ra sao?",
    category: "Công nghệ",
    excerpt:
      "Cơ chế này tập trung vào làm dịu viêm vi điểm, củng cố hàng rào và hỗ trợ mô da phục hồi theo nhịp ổn định hơn.",
    content:
      "Hệ thống phục hồi sinh học chuyên sâu của SRX được xây dựng quanh ba mục tiêu: giảm viêm vi điểm, phục hồi hàng rào da và hỗ trợ tái tạo mô bề mặt. Thay vì chỉ xử lý một triệu chứng đơn lẻ, công thức hướng đến giữ cho môi trường trên da đủ ổn định để da tự phục hồi hiệu quả hơn.\n\nCách tiếp cận này đặc biệt phù hợp với làn da đang treatment, da nhạy cảm hoặc da vừa trải qua giai đoạn mất cân bằng kéo dài. Khi môi trường da ổn định, các hoạt chất tái tạo mới có cơ hội phát huy hiệu quả tốt hơn.",
    publishedAt: "2026-06-24",
    readTime: "5 phút đọc",
    tags: ["phục hồi sinh học", "barrier", "công nghệ", "nhạy cảm"],
    coverImage: "/assets/images/home/slider2.webp",
    coverAlt: "Bộ sản phẩm SRX trên nền tím hồng ánh sáng mềm.",
    featured: false,
  },
  {
    id: 6,
    slug: "cach-layer-treatment-voi-serum-phuc-hoi-de-giam-kich-ung",
    title: "Cách layer treatment với serum phục hồi để giảm kích ứng",
    category: "Routine",
    excerpt:
      "Một routine thông minh không chỉ là dùng đúng hoạt chất, mà còn là biết đặt bước phục hồi vào đúng thời điểm trong chuỗi layer.",
    content:
      "Khi da bắt đầu treatment, thứ quyết định trải nghiệm thực tế thường không nằm ở một sản phẩm đơn lẻ mà ở cách bạn layer toàn bộ routine. Serum phục hồi có thể được dùng như bước đệm trước treatment hoặc bước khóa ẩm dịu nhẹ sau treatment, tùy vào mức chịu đựng của da.\n\nNguyên tắc cốt lõi là không xếp quá nhiều tầng có hoạt tính cao trong cùng một tối. Giữ routine gọn, có nhịp nghỉ hợp lý và bổ sung bước phục hồi đúng lúc sẽ giúp da theo được liệu trình lâu hơn, giảm nguy cơ đỏ rát và bong tróc kéo dài.",
    publishedAt: "2026-06-18",
    readTime: "5 phút đọc",
    tags: ["layering", "routine", "serum phục hồi", "kích ứng"],
    coverImage: "/assets/images/home/sl4.webp",
    coverAlt: "Kết quả cải thiện vùng da sau liệu trình chăm sóc chuyên sâu.",
    featured: false,
  },
];

export const newsCategories = Array.from(new Set(demoNews.map((item) => item.category)));

function normalizeSearchText(value = "") {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function getTimestamp(dateString) {
  const timestamp = new Date(dateString).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

export function formatNewsDate(dateString) {
  const timestamp = getTimestamp(dateString);

  if (!timestamp) {
    return dateString;
  }

  return newsDateFormatter.format(timestamp);
}

export function sortNewsByDate(items = demoNews) {
  return [...items].sort((left, right) => getTimestamp(right.publishedAt) - getTimestamp(left.publishedAt));
}

export function searchNews(query, items = demoNews) {
  const normalizedQuery = normalizeSearchText(query);
  const sortedItems = sortNewsByDate(items);

  if (!normalizedQuery) {
    return sortedItems;
  }

  return sortedItems.filter((article) => {
    const haystack = normalizeSearchText(
      [
        article.title,
        article.category,
        article.excerpt,
        article.content,
        article.readTime,
        ...(article.tags ?? []),
      ].join(" "),
    );

    return haystack.includes(normalizedQuery);
  });
}

export function filterNews({ items = demoNews, query = "", category = ALL_NEWS_CATEGORY } = {}) {
  return searchNews(query, items).filter((article) => {
    if (category === ALL_NEWS_CATEGORY) {
      return true;
    }

    return article.category === category;
  });
}

export function getNewsBySlug(slug) {
  return demoNews.find((item) => item.slug === slug);
}
