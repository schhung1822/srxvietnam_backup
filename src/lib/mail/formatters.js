const currencyFormatter = new Intl.NumberFormat('vi-VN');

export function formatCurrencyVnd(value) {
  return `${currencyFormatter.format(Math.max(Number(value) || 0, 0))} VND`;
}
