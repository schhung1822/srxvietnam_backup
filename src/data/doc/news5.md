# Tối ưu hóa hiệu suất website với Core Web Vitals

**Core Web Vitals** là bộ chỉ số bắt buộc của Google đánh giá trải nghiệm người dùng. Bao gồm:
- **LCP** (Largest Contentful Paint): Thời gian tải phần nội dung chính
- **FID/INP** (First Input Delay / Interaction to Next Paint): độ trễ tương tác
- **CLS** (Cumulative Layout Shift): độ dịch chuyển bố cục không mong muốn

![Page speed optimization](https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80)

## 1. Vì sao Core Web Vitals quan trọng?

1. Tăng hiệu suất trải nghiệm người dùng.
2. Cải thiện thứ hạng SEO trên Google.
3. Giảm tỷ lệ bounce và tăng chuyển đổi.
4. Đánh giá tổng quan chất lượng website bằng chỉ số chuẩn.

## 2. Lợi thế của site tối ưu Core Web Vitals
- Tăng tốc độ tải trang ngay cả trên mạng di động.
- Trải nghiệm mượt mà hơn khi cuộn.
- Người dùng cảm thấy “tin cậy” khi không bị nhảy layout.
- Tăng chất lượng traffic, ít thoát và nhiều tương tác.

## 3. Chiến lược tối ưu LCP (Largest Contentful Paint)

### 3.1. Giảm thời gian phản hồi server (TTFB)
- Dùng CDN (Cloudflare/Akamai).
- Sử dụng cache máy chủ (Redis, Varnish).
- Tối ưu truy vấn DB và backend.

### 3.2. Tối ưu tài nguyên quan trọng
- Đặt image/hero section ở đầu và preload (`<link rel="preload" as="image" href="...">`).
- Dùng ảnh WebP/AVIF, nén hợp lý.
- Dùng lazy loading cho ảnh phụ.

### 3.3. Giảm render-blocking resources
- Chuyển CSS quan trọng inline, delay JS không cần thiết.
- Dùng `font-display: swap` để tránh FOUT và chặn render.

## 4. Cải thiện INP/FID (độ phản hồi)

- Break up long task: chia nhỏ tác vụ JS dài (>50ms) thành micro tasks.
- Sử dụng `requestIdleCallback` cho tác vụ không quan trọng.
- Dùng Web Worker cho tính toán nặng.
- Giảm số lượng listener và thao tác DOM.

## 5. Giảm CLS (layout shift)

### 5.1. Đặt kích thước cố định
- Ảnh: width/height hoặc CSS aspect-ratio.
- Video/iframe: placeholder kích thước rõ ràng.

### 5.2. Dự trữ không gian cho quảng cáo
- Nếu bạn dùng quảng cáo (AdSense), định vị vị trí hiển thị trước.

### 5.3. Tránh tải nội dung động trên đầu trang
- Không thêm banner/pop-up trên cùng sau khi trang đã hiển thị.

## 6. Kiểm tra Core Web Vitals với công cụ

- **Google PageSpeed Insights**
- **Lighthouse** (Chrome DevTools)
- **WebPageTest**
- **Chrome UX Report**

### 6.1. Cách đọc báo cáo
- Xem mục LCP/INP/CLS màu xanh: ổn.
- Mục màu cam: cần cải thiện.
- Mục đỏ: lỗi nghiêm trọng.

## 7. Hướng dẫn cụ thể cho Vite/React

### 7.1. Cấu hình Vite tốc độ
```js
// vite.config.js
export default defineConfig({
  build: {
    target: 'es2017',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom']
        }
      }
    }
  }
})
```

### 7.2. Tối ưu ảnh
- Dùng `srcset` và `sizes`.
- Lazy load: `<img loading="lazy" ...>`.
- Dùng CDN như Imgix, Cloudinary.

### 7.3. Tối ưu font
- Dùng font system hoặc `font-display: swap`.
- Giảm số font-weight, tải chỉ những font cần.

## 8. Hướng dẫn tối ưu cho Next.js

- Dùng `<Image />` component.
- Dùng `<Script strategy="lazyOnload" />` cho script bên thứ 3.
- Dùng `getStaticProps` để render phía server và tối ưu TTFB.

## 9. Quy trình cải tiến theo tuần

1. Mỗi tuần chạy Lighthouse.
2. Fix top 3 lỗi lớn.
3. Test trên mobile, mạng 3G.
4. Cập nhật tài liệu tối ưu và kiểm tra lại.

![Performance chart](https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1600&q=80)

## 10. Case study cụ thể

- Website A: LCP 4.8s -> 2.1s sau khi tối ưu ảnh + critical CSS.
- Website B: CLS 0.32 -> 0.05 sau khi xác định kích thước ảnh và block vị trí CTA.
- Website C: INP 380ms -> 130ms bằng cách delay script 3rd-party.

## 11. Checklist cuối cùng
- [x] LCP < 2.5s
- [x] INP < 200ms
- [x] CLS < 0.1
- [x] Time to Interactive < 3s
- [x] Không block main thread quá 50ms

> Kết luận: Core Web Vitals không chỉ là điểm số, mà là trải nghiệm thực tế. Hãy đo, sửa và lặp lại.
