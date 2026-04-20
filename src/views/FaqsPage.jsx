"use client";

import React, { useDeferredValue, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CircleHelp,
  PackageSearch,
  RefreshCcw,
  Search,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

const FAQ_CATEGORIES = [
  {
    id: "featured",
    label: "Có thể bạn quan tâm",
    icon: Sparkles,
  },
  {
    id: "shopping",
    label: "Mua hàng",
    icon: ShoppingBag,
  },
  {
    id: "orders",
    label: "Thông tin đơn hàng",
    icon: PackageSearch,
  },
  {
    id: "returns",
    label: "Đổi/Trả hàng",
    icon: RefreshCcw,
  },
  {
    id: "other",
    label: "Hỏi khác",
    icon: CircleHelp,
  },
];

const CATEGORY_LABELS = Object.fromEntries(
  FAQ_CATEGORIES.map((category) => [category.id, category.label]),
);

const FAQ_ITEMS = [
  {
    id: "urgent-delivery",
    category: "shopping",
    featured: true,
    title: "[Mua hàng] Cần nhận gấp đơn hàng trong ngày làm như thế nào?",
    excerpt:
      "Nếu bạn cần giao nhanh tại khu vực nội thành, hãy ưu tiên lựa chọn sản phẩm còn sẵn và để lại ghi chú khi thanh toán. Đội ngũ SRX sẽ chủ động liên hệ để xác nhận thời gian xử lý phù hợp nhất.",
    tags: ["giao nhanh", "hỏa tốc", "nhận gấp"],
  },
  {
    id: "change-order-info",
    category: "orders",
    featured: true,
    title: "Cách thay đổi thông tin mua hàng tại website",
    excerpt:
      "Bạn có thể liên hệ bộ phận chăm sóc khách hàng ngay sau khi đặt đơn để cập nhật họ tên, số điện thoại, địa chỉ hoặc ghi chú nhận hàng. Với các đơn đã bàn giao cho đơn vị vận chuyển, SRX sẽ hỗ trợ kiểm tra khả năng điều chỉnh theo trạng thái thực tế.",
    tags: ["đổi thông tin", "địa chỉ", "số điện thoại"],
  },
  {
    id: "return-process",
    category: "returns",
    featured: true,
    title: "Làm thế nào để đổi/trả hàng?",
    excerpt:
      "Bạn chỉ cần gửi mã đơn hàng và lý do đổi trả qua kênh hỗ trợ của SRX. Đội ngũ CS sẽ kiểm tra điều kiện áp dụng, hướng dẫn đóng gói sản phẩm và xác nhận thời gian tiếp nhận để xử lý nhanh nhất.",
    tags: ["đổi trả", "hoàn hàng", "trả hàng"],
  },
  {
    id: "price-difference",
    category: "other",
    featured: true,
    title: "Tại sao giá mua trên sàn TMĐT có thể khác với website?",
    excerpt:
      "Mức giá có thể thay đổi do chương trình trợ giá riêng theo từng kênh, mã giảm giá theo chiến dịch hoặc chi phí vận hành nền tảng. Website và sàn TMĐT đều được SRX quản lý nhưng có chính sách ưu đãi khác nhau ở từng thời điểm.",
    tags: ["giá", "shopee", "tmdt", "khuyến mãi"],
  },
  {
    id: "product-origin",
    category: "other",
    featured: true,
    title: "Xuất xứ sản phẩm SRX được sản xuất tại đâu?",
    excerpt:
      "SRX ưu tiên minh bạch nguồn gốc, tiêu chuẩn nghiên cứu và thông tin công bố trên từng dòng sản phẩm. Bạn có thể xem chi tiết xuất xứ, số công bố và hướng dẫn sử dụng ngay trong trang chi tiết sản phẩm hoặc nhắn CS để được gửi thêm thông tin.",
    tags: ["xuất xứ", "sản xuất", "nguồn gốc"],
  },
  {
    id: "track-order",
    category: "orders",
    featured: false,
    title: "Làm sao để theo dõi trạng thái đơn hàng?",
    excerpt:
      "Sau khi đơn được xác nhận, bạn sẽ nhận được thông tin vận chuyển qua email, số điện thoại hoặc kênh liên hệ đã đăng ký. Nếu chưa thấy cập nhật, hãy cung cấp mã đơn để SRX kiểm tra giúp bạn.",
    tags: ["theo dõi", "trạng thái", "vận chuyển"],
  },
  {
    id: "cancel-order",
    category: "orders",
    featured: false,
    title: "Tôi có thể hủy đơn hàng sau khi đã đặt không?",
    excerpt:
      "Đơn hàng có thể được hỗ trợ hủy nếu vẫn đang ở bước chờ xác nhận hoặc chưa bàn giao cho đơn vị vận chuyển. Bạn nên liên hệ sớm để SRX kiểm tra và phản hồi phương án phù hợp.",
    tags: ["hủy đơn", "đơn hàng"],
  },
  {
    id: "refund-time",
    category: "returns",
    featured: false,
    title: "Bao lâu tôi nhận được hoàn tiền sau khi hủy hoặc trả hàng?",
    excerpt:
      "Thời gian hoàn tiền phụ thuộc vào phương thức thanh toán ban đầu và thời điểm đối soát với ngân hàng hoặc nền tảng trung gian. Thông thường, SRX sẽ xác nhận kết quả xử lý trong vài ngày làm việc.",
    tags: ["hoàn tiền", "trả hàng", "refund"],
  },
  {
    id: "sensitive-skin",
    category: "other",
    featured: false,
    title: "Da nhạy cảm có dùng được sản phẩm SRX không?",
    excerpt:
      "Bạn nên ưu tiên đọc bảng thành phần, hướng dẫn patch test và mô tả công dụng trên từng sản phẩm. Nếu cần gợi ý đúng tình trạng da, đội ngũ SRX có thể hỗ trợ tư vấn trước khi bạn đặt mua.",
    tags: ["da nhạy cảm", "thành phần", "tư vấn"],
  },
  {
    id: "payment-methods",
    category: "shopping",
    featured: false,
    title: "Website đang hỗ trợ những hình thức thanh toán nào?",
    excerpt:
      "Bạn có thể thanh toán khi nhận hàng, chuyển khoản hoặc sử dụng các phương thức thanh toán điện tử đang được tích hợp tại bước checkout. Thông tin này sẽ hiển thị rõ trước khi bạn xác nhận đơn.",
    tags: ["thanh toán", "cod", "chuyển khoản"],
  },
];

export default function FaqsPage() {
  const [activeCategory, setActiveCategory] = useState("featured");
  const [searchQuery, setSearchQuery] = useState("");

  const deferredQuery = useDeferredValue(searchQuery.trim().toLowerCase());

  const visibleItems = FAQ_ITEMS.filter((item) => {
    if (deferredQuery) {
      const searchableContent =
        `${item.title} ${item.excerpt} ${item.tags.join(" ")}`.toLowerCase();
      return searchableContent.includes(deferredQuery);
    }

    if (activeCategory === "featured") {
      return item.featured;
    }

    return item.category === activeCategory;
  });

  return (
    <div className="bg-white">
      <section className="py-[64px] lg:py-[96px]">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[920px] text-center">
            <h1 className="text-[34px] font-semibold uppercase leading-[1.05] tracking-[-0.04em] text-[#211d1c] md:text-[48px] lg:text-[64px]">
              Chúng mình có thể giúp gì cho bạn?
            </h1>
            <p className="mt-4 text-[15px] text-[#4d4742] md:text-[18px]">
              CS Team luôn ở đây để lắng nghe và hỗ trợ.
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-[1200px]">
            <label className="flex items-center gap-4 rounded-full border border-[#d8d2ca] bg-white px-6 py-4 shadow-[0_10px_35px_rgba(15,11,7,0.04)] transition focus-within:border-[#111111]">
              <Search className="h-6 w-6 text-[#111111]" strokeWidth={1.9} />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Tìm kiếm câu hỏi, đơn hàng, đổi trả..."
                className="w-full bg-transparent text-[16px] text-[#1a1715] outline-none placeholder:text-[#92867a]"
              />
            </label>
          </div>

          <div className="mt-8 rounded-[32px] bg-[#f1f1ef] p-6 sm:p-8 lg:mt-10 lg:p-14">
            <div className="grid gap-8 lg:grid-cols-[290px,minmax(0,1fr)] xl:gap-14">
              <div>
                <div className="text-[18px] font-semibold uppercase tracking-[0.14em] text-[#1b1713]">
                  Thư viện và hỏi đáp
                </div>

                <div className="mt-8 space-y-4">
                  {FAQ_CATEGORIES.map((category) => {
                    const Icon = category.icon;
                    const isActive = activeCategory === category.id;

                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => setActiveCategory(category.id)}
                        className={`flex w-full items-center justify-between gap-4 rounded-[18px] border px-4 py-4 text-left transition-all duration-300 ${
                          isActive
                            ? "border-black bg-black text-white shadow-[0_16px_35px_rgba(0,0,0,0.16)]"
                            : "border-transparent bg-white text-[#15110d] hover:border-[#d8d2ca] hover:shadow-[0_12px_24px_rgba(15,11,7,0.06)]"
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#5270ff] to-[#2343d9] text-white">
                            <Icon className="h-4 w-4" strokeWidth={2.2} />
                          </span>
                          <span className="text-[15px] font-semibold uppercase tracking-[-0.01em]">
                            {category.label}
                          </span>
                        </span>

                        <ArrowRight
                          className={`h-5 w-5 shrink-0 transition-transform duration-300 ${
                            isActive
                              ? "translate-x-0.5 text-white"
                              : "text-[#15110d]"
                          }`}
                          strokeWidth={2.1}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="grid gap-4 md:grid-cols-2">
                  {visibleItems.length > 0 ? (
                    visibleItems.map((item) => (
                      <article
                        key={item.id}
                        className="group rounded-[24px] border border-[#d5d0c8] bg-white p-6 md:p-7 transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(15,11,7,0.06)]"
                      >
                        <h3 className="text-[20px] font-semibold leading-[1.35] tracking-[-0.03em] text-[#1b1713]">
                          {item.title}
                        </h3>
                        <p className="mt-4 text-[15px] leading-7 text-[#6e6760]">
                          {item.excerpt}
                        </p>
                        <div className="mt-6 inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-[#3955df]">
                          <span>{CATEGORY_LABELS[item.category]}</span>
                          <ArrowRight className="h-4 w-4" strokeWidth={2.1} />
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className="rounded-[24px] border border-dashed border-[#cfc7bd] bg-white px-6 py-10 text-center md:col-span-2">
                      <div className="text-[22px] font-semibold tracking-[-0.03em] text-[#1b1713]">
                        Chưa tìm thấy câu hỏi phù hợp
                      </div>
                      <p className="mx-auto mt-3 max-w-[480px] text-[15px] leading-7 text-[#6e6760]">
                        Hãy thử đổi từ khóa tìm kiếm hoặc chọn lại một nhóm câu
                        hỏi khác để xem thêm nội dung hỗ trợ từ SRX.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 flex justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-4 rounded-full bg-black px-8 py-4 text-[15px] font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-[#1f1f1f]"
            >
              Tìm hiểu thêm
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10">
                <ArrowRight className="h-5 w-5" strokeWidth={2.2} />
              </span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
