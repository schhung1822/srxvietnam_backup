import { query } from './db.js';

/**
 * Cột discount_codes.stack_with_public: mã riêng (class = 'private') được dùng cùng một mã chung
 * trong cùng đơn hàng. Bản thiết lập ở CRM (/srx/voucher, vòng quay may mắn). Thiếu cột thì mọi
 * truy vấn mã giảm giá đều lỗi, nên tự thêm ở lần dùng đầu tiên (CRM cũng làm như vậy).
 */

let stackColumnPromise;

export function ensureDiscountCodeStackColumn() {
  stackColumnPromise ??= (async () => {
    const rows = await query(`SHOW COLUMNS FROM discount_codes LIKE 'stack_with_public'`);

    if (!rows.length) {
      await query(`ALTER TABLE discount_codes ADD COLUMN stack_with_public TINYINT(1) NOT NULL DEFAULT 0 AFTER class`);
    }
  })().catch((error) => {
    stackColumnPromise = undefined;
    throw error;
  });

  return stackColumnPromise;
}
