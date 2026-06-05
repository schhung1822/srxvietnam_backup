import { QrCode, ScanLine } from 'lucide-react';

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
});

function getQrFallbackCopy(payment) {
  if (payment?.isConfigured) {
    return {
      title: 'QR sẽ xuất hiện ngay khi đơn được tạo',
      description: 'Hệ thống cần mã đơn hàng để sinh đúng số tiền và nội dung chuyển khoản.',
    };
  }

  return {
    title: 'SePay chưa được cấu hình',
    description: 'Thiếu thông tin tài khoản để tạo QR thanh toán tự động.',
  };
}

function TransferInfoRow({ label, value, isHighlight = false }) {
  return (
    <div
      className={`flex items-start justify-between gap-4 border-b border-[#efe5d8] py-3 last:border-b-0 last:pb-0 first:pt-0 ${
        isHighlight ? 'pt-4' : ''
      }`}
    >
      <div className="text-[12px] font-medium text-[#8b7764]">{label}</div>
      <div
        className={`max-w-[58%] text-right text-[15px] font-semibold ${
          isHighlight ? "font-['Inter',_sans-serif] text-[24px] tracking-[-0.03em] text-[#15110d]" : 'text-[#15110d]'
        }`}
      >
        {value}
      </div>
    </div>
  );
}

export default function SepayPaymentPanel({ payment, paymentStatus = 'pending', showHeading = true }) {
  const qrFallbackCopy = getQrFallbackCopy(payment);
  const isWaiting = paymentStatus === 'pending';

  return (
    <div className="relative overflow-hidden rounded-[34px] border border-[#ccc] bg-[#fff] p-6 shadow-[0_30px_80px_rgba(70,52,34,0.08)] md:p-7">
      {showHeading ? (
        <>
          <div className="mt-4">
            <h3 className="text-[28px] font-semibold tracking-[-0.04em] text-[#15110d]">
              Chuyển khoản bằng QR code
            </h3>
            <p className="mt-2 text-[14px] leading-7 text-[#6f6052]">
              Quét mã bằng app ngân hàng để điền sẵn số tiền và nội dung chuyển khoản.
            </p>
          </div>

          {isWaiting ? (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#edd3a7] bg-[#fff7e7] px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#966b1f]">
              <ScanLine className="h-4 w-4" />
              Đang chờ đối soát
            </div>
          ) : null}
        </>
      ) : null}

      <div className="mt-6">
        {payment?.canGenerateQr ? (
          <div className="relative mx-auto max-w-[312px] overflow-hidden rounded-[28px] bg-white p-4 shadow-[0_18px_48px_rgba(26,18,12,0.12)]">
            <img
              src={payment.qrImageUrl}
              alt="QR thanh toán SePay"
              className="h-full w-full rounded-[20px] object-cover"
            />

            {isWaiting ? <div className="payment-qr-scan" /> : null}
          </div>
        ) : (
          <div className="flex min-h-[284px] flex-col items-center justify-center rounded-[28px] border border-dashed border-[#d8c8b6] bg-white/92 px-6 text-center shadow-[0_18px_48px_rgba(26,18,12,0.06)]">
            <QrCode className="h-11 w-11 text-[#15110d]" />
            <div className="mt-4 text-[15px] font-semibold text-[#15110d]">{qrFallbackCopy.title}</div>
            <div className="mt-2 max-w-[250px] text-[13px] leading-6 text-[#7a6d61]">{qrFallbackCopy.description}</div>
          </div>
        )}

        <div className="mt-5 rounded-[24px] border border-[#ccc] bg-white px-5 py-4 shadow-[0_16px_34px_rgba(70,52,34,0.05)]">
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#9a826b]">
            Thông tin chuyển khoản
          </div>

          <TransferInfoRow
            label="Mã giao dịch"
            value={payment?.transferContent || 'Sẽ hiển thị sau khi tạo đơn'}
          />
          <TransferInfoRow label="Ngân hàng" value={payment?.bankName || 'Chưa cấu hình'} />
          <TransferInfoRow label="Số tài khoản" value={payment?.accountNumber || 'Chưa cấu hình'} />
          <TransferInfoRow label="Chủ tài khoản" value={payment?.accountName || 'Chưa cấu hình'} />
          <TransferInfoRow
            label="Tổng thanh toán"
            value={currencyFormatter.format(payment?.amount ?? 0)}
            isHighlight
          />
        </div>
      </div>
    </div>
  );
}
