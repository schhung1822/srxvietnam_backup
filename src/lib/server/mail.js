import nodemailer from 'nodemailer';
import { formatCurrencyVnd } from '../mail/formatters.js';

const SMTP_HOST = process.env.SMTP_HOST?.trim() || '';
const SMTP_PORT = Number(process.env.SMTP_PORT ?? 465);
const SMTP_SECURE = String(process.env.SMTP_SECURE ?? SMTP_PORT === 465).trim().toLowerCase() === 'true';
const SMTP_USER = process.env.SMTP_USER?.trim() || '';
const SMTP_PASS = process.env.SMTP_PASS?.trim() || '';
const SMTP_FROM_EMAIL = process.env.SMTP_FROM_EMAIL?.trim() || SMTP_USER;
const SMTP_FROM_NAME = process.env.SMTP_FROM_NAME?.trim() || 'SRX Việt Nam';

let transporter;

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizeText(value, fallback = 'Không có') {
  const normalized = String(value ?? '').trim();
  return normalized || fallback;
}

function buildAddress(customer = {}) {
  const parts = [
    customer.addressLine,
    customer.ward,
    customer.district,
    customer.province,
  ]
    .map((part) => String(part ?? '').trim())
    .filter(Boolean);

  return parts.join(' - ') || 'Không có';
}

function formatGenderLabel(gender) {
  switch (String(gender ?? '').trim()) {
    case 'male':
      return 'Nam';
    case 'female':
      return 'Nữ';
    case 'other':
      return 'Khác';
    default:
      return 'Chưa xác định';
  }
}

function getTransporter() {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
  }

  return transporter;
}

function getFromAddress() {
  if (!SMTP_FROM_EMAIL) {
    return undefined;
  }

  return `"${SMTP_FROM_NAME.replace(/"/g, '')}" <${SMTP_FROM_EMAIL}>`;
}

async function sendEmail({ to, subject, html, text }) {
  const mailTransporter = getTransporter();

  if (!mailTransporter || !to) {
    return false;
  }

  await mailTransporter.sendMail({
    from: getFromAddress(),
    to,
    subject,
    html,
    text,
  });

  return true;
}

function renderEmailLayout({ preheader, title, intro, sections, footerNote }) {
  const sectionHtml = sections
    .map((section) => {
      if (section.type === 'table') {
        const rows = section.rows
          .map(
            (row) => `
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #ece7df;color:#6a5e53;font-size:14px;vertical-align:top;width:180px;">${escapeHtml(row.label)}</td>
                <td style="padding:10px 0;border-bottom:1px solid #ece7df;color:#201913;font-size:14px;font-weight:600;vertical-align:top;">${escapeHtml(row.value)}</td>
              </tr>
            `,
          )
          .join('');

        return `
          <div style="margin:0 0 24px;">
            ${section.title ? `<div style="margin:0 0 10px;color:#201913;font-size:16px;font-weight:700;">${escapeHtml(section.title)}</div>` : ''}
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">${rows}</table>
          </div>
        `;
      }

      if (section.type === 'html') {
        return `
          <div style="margin:0 0 24px;">
            ${section.title ? `<div style="margin:0 0 10px;color:#201913;font-size:16px;font-weight:700;">${escapeHtml(section.title)}</div>` : ''}
            ${section.html}
          </div>
        `;
      }

      return '';
    })
    .join('');

  return `
    <!doctype html>
    <html lang="vi">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${escapeHtml(title)}</title>
      </head>
      <body style="margin:0;background:#f6f2eb;padding:24px 12px;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;color:#201913;">
        <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
        <div style="margin:0 auto;max-width:680px;background:#ffffff;border:1px solid #ece7df;border-radius:20px;overflow:hidden;">
          <div style="padding:28px 32px;background:linear-gradient(135deg,#6f8ff8 0%,#ebb1e7 100%);color:#ffffff;">
            <div style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;opacity:0.82;">SRX Việt Nam</div>
            <h1 style="margin:14px 0 0;font-size:28px;line-height:1.2;font-weight:700;">${escapeHtml(title)}</h1>
          </div>
          <div style="padding:32px;">
            <p style="margin:0 0 24px;color:#3d332b;font-size:15px;line-height:1.8;">${escapeHtml(intro)}</p>
            ${sectionHtml}
            <p style="margin:28px 0 0;color:#6a5e53;font-size:13px;line-height:1.7;">
              ${escapeHtml(footerNote || 'Nếu cần hỗ trợ, vui lòng phản hồi email này hoặc liên hệ SRX Việt Nam.')}
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

function renderPrimaryAction({ href, label }) {
  return `
    <div style="margin:0 0 24px;">
      <a
        href="${escapeHtml(href)}"
        style="display:inline-block;border-radius:999px;background:#15110d;padding:14px 24px;color:#ffffff;font-size:14px;font-weight:700;letter-spacing:0.02em;text-decoration:none;"
      >
        ${escapeHtml(label)}
      </a>
    </div>
  `;
}

function renderOrderItemsTable(items = []) {
  const rows = items
    .map((item) => {
      const quantity = Math.max(Number(item.quantity) || 0, 0);
      const unitPrice = formatCurrencyVnd(item.price);
      const lineTotal = formatCurrencyVnd(item.lineTotal ?? item.price * quantity);
      const variantLabel = normalizeText(item.variantLabel, '');

      return `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #ece7df;color:#201913;font-size:14px;line-height:1.6;">
            <div style="font-weight:700;">${escapeHtml(normalizeText(item.name))}</div>
            ${variantLabel ? `<div style="color:#6a5e53;font-size:12px;">${escapeHtml(variantLabel)}</div>` : ''}
          </td>
          <td style="padding:12px 0;border-bottom:1px solid #ece7df;color:#201913;font-size:14px;text-align:center;">${quantity}</td>
          <td style="padding:12px 0;border-bottom:1px solid #ece7df;color:#201913;font-size:14px;text-align:right;">${escapeHtml(unitPrice)}</td>
          <td style="padding:12px 0;border-bottom:1px solid #ece7df;color:#201913;font-size:14px;text-align:right;font-weight:700;">${escapeHtml(lineTotal)}</td>
        </tr>
      `;
    })
    .join('');

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
      <thead>
        <tr>
          <th align="left" style="padding:0 0 12px;color:#6a5e53;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;">San pham</th>
          <th align="center" style="padding:0 0 12px;color:#6a5e53;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;">SL</th>
          <th align="right" style="padding:0 0 12px;color:#6a5e53;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;">Don gia</th>
          <th align="right" style="padding:0 0 12px;color:#6a5e53;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;">Thanh tien</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function buildOrderConfirmationEmail({
  orderNumber,
  customer,
  items,
  subtotal,
  discountTotal,
  grandTotal,
  paymentMethodLabel,
  notes,
  paymentDetails,
  siteOrigin,
}) {
  const subject = `SRX Việt Nam xác nhận đơn hàng ${normalizeText(orderNumber)}`;
  const intro = `Cảm ơn ${normalizeText(customer?.fullName)} đã đặt hàng tại SRX Việt Nam. Đơn hàng của bạn đã được ghi nhận và đang chờ xử lý.`;
  const sections = [
    {
      type: 'table',
      title: 'Thông tin đơn hàng',
      rows: [
        { label: 'Mã đơn hàng', value: orderNumber },
        { label: 'Phương thức thanh toán', value: paymentMethodLabel },
        { label: 'Trạng thái', value: paymentDetails ? 'Chờ thanh toán' : 'Đã ghi nhận' },
        { label: 'Tổng tạm tính', value: formatCurrencyVnd(subtotal) },
        { label: 'Giảm giá', value: formatCurrencyVnd(discountTotal) },
        { label: 'Tổng thanh toán', value: formatCurrencyVnd(grandTotal) },
        { label: 'Ghi chú', value: notes || 'Không có' },
      ],
    },
    {
      type: 'table',
      title: 'Thông tin nhận hàng',
      rows: [
        { label: 'Họ và tên', value: customer?.fullName },
        { label: 'Số điện thoại', value: customer?.phone },
        { label: 'Email', value: customer?.email },
        { label: 'Địa chỉ', value: buildAddress(customer) },
      ],
    },
    {
      type: 'html',
      title: 'Sản phẩm',
      html: renderOrderItemsTable(items),
    },
  ];

  if (paymentDetails) {
    sections.push({
      type: 'table',
      title: 'Hướng dẫn chuyển khoản',
      rows: [
        { label: 'Ngân hàng', value: paymentDetails.bankName },
        { label: 'Chủ tài khoản', value: paymentDetails.accountName },
        { label: 'Số tài khoản', value: paymentDetails.accountNumber },
        { label: 'Số tiền', value: formatCurrencyVnd(paymentDetails.amount) },
        { label: 'Nội dung chuyển khoản', value: paymentDetails.transferContent },
      ],
    });
  }

  const html = renderEmailLayout({
    preheader: `Đơn hàng ${normalizeText(orderNumber)} đã được ghi nhận.`,
    title: 'Đặt hàng thành công',
    intro,
    sections,
    footerNote: paymentDetails
      ? `Vui lòng hoàn tất thanh toán để SRX bắt đầu xử lý đơn hàng. Bạn có thể quay lại website tại ${siteOrigin || 'SRX Việt Nam'} để xem thêm thông tin.`
      : `SRX sẽ liên hệ xác nhận đơn hàng trong thời gian sớm nhất. Nếu cần hỗ trợ, vui lòng truy cập ${siteOrigin || 'website SRX Việt Nam'}.`,
  });

  const text = [
    'SRX Việt Nam - Đặt hàng thành công',
    '',
    intro,
    '',
    `Mã đơn hàng: ${normalizeText(orderNumber)}`,
    `Phương thức thanh toán: ${normalizeText(paymentMethodLabel)}`,
    `Tổng thanh toán: ${formatCurrencyVnd(grandTotal)}`,
    `Ghi chú: ${normalizeText(notes || 'Không có')}`,
    '',
    'Thông tin nhận hàng:',
    `- Họ và tên: ${normalizeText(customer?.fullName)}`,
    `- Số điện thoại: ${normalizeText(customer?.phone)}`,
    `- Email: ${normalizeText(customer?.email)}`,
    `- Địa chỉ: ${buildAddress(customer)}`,
    '',
    'Sản phẩm:',
    ...items.map((item) => {
      const quantity = Math.max(Number(item.quantity) || 0, 0);
      const variantLabel = normalizeText(item.variantLabel, '');
      const variantText = variantLabel ? ` (${variantLabel})` : '';
      return `- ${normalizeText(item.name)}${variantText} x${quantity}: ${formatCurrencyVnd(item.lineTotal ?? item.price * quantity)}`;
    }),
  ];

  if (paymentDetails) {
    text.push(
      '',
      'Hướng dẫn chuyển khoản:',
      `- Ngân hàng: ${normalizeText(paymentDetails.bankName)}`,
      `- Chủ tài khoản: ${normalizeText(paymentDetails.accountName)}`,
      `- Số tài khoản: ${normalizeText(paymentDetails.accountNumber)}`,
      `- Số tiền: ${formatCurrencyVnd(paymentDetails.amount)}`,
      `- Nội dung chuyển khoản: ${normalizeText(paymentDetails.transferContent)}`,
    );
  }

  return { subject, html, text: text.join('\n') };
}

function buildAffiliateApplicationReceivedEmail({
  application,
  resubmitted,
  siteOrigin,
}) {
  const subject = resubmitted
    ? 'SRX Việt Nam đã nhận hồ sơ affiliate gửi lại của bạn'
    : 'SRX Việt Nam đã nhận hồ sơ affiliate của bạn';
  const intro = resubmitted
    ? `SRX Việt Nam đã nhận hồ sơ affiliate bạn vừa cập nhật và gửi lại để duyệt. Đội ngũ sẽ kiểm tra và phản hồi sớm nhất.`
    : `ảm ơn bạn đã gửi hồ sơ đăng ký affiliate tại SRX Việt Nam. Hồ sơ của bạn đã được ghi nhận và chuyển sang trạng thái chờ duyệt.`;
  const html = renderEmailLayout({
    preheader: 'Hồ sơ affiliate của bạn đã được ghi nhận.',
    title: resubmitted ? 'Hồ sơ affiliate đã được gửi lại' : 'Đã nhận hồ sơ affiliate',
    intro,
    sections: [
      {
        type: 'table',
        title: 'Thông tin hồ sơ',
        rows: [
          { label: 'Họ tên', value: application?.legalFullName },
          { label: 'Số điện thoại', value: application?.contactPhone },
          { label: 'Email', value: application?.contactEmail },
          { label: 'CCCD', value: application?.nationalIdNumber },
          { label: 'Giới tính', value: formatGenderLabel(application?.gender) },
          { label: 'Facebook', value: application?.facebookUrl },
          { label: 'TikTok', value: application?.tiktokUrl },
          { label: 'Trạng thái', value: 'Cho duyệt' },
        ],
      },
      {
        type: 'html',
        title: 'Địa chỉ thường trú',
        html: `<div style="padding:16px;border:1px solid #ece7df;border-radius:14px;color:#201913;font-size:14px;line-height:1.7;">${escapeHtml(normalizeText(application?.permanentAddress))}</div>`,
      },
    ],
    footerNote: `Thông thường SRX cần 3-5 ngày làm việc để xem xét hồ sơ affiliate. ạn có thể theo dõi trạng thái tại ${siteOrigin || 'website SRX Việt Nam'}.`,
  });
  const text = [
    'SRX Việt Nam - Đã nhận hồ sơ affiliate',
    '',
    intro,
    '',
    `Họ tên: ${normalizeText(application?.legalFullName)}`,
    `Số điện thoại: ${normalizeText(application?.contactPhone)}`,
    `Email: ${normalizeText(application?.contactEmail)}`,
    `CCCD: ${normalizeText(application?.nationalIdNumber)}`,
    `Địa chỉ thường trú: ${normalizeText(application?.permanentAddress)}`,
    `Facebook: ${normalizeText(application?.facebookUrl)}`,
    `TikTok: ${normalizeText(application?.tiktokUrl)}`,
    'Trạng thái: Cho duyệt',
    '',
    'SRX thường cần 3-5 ngày làm việc để xem xét hồ sơ affiliate.',
  ].join('\n');

  return { subject, html, text };
}

function buildPasswordResetEmail({
  fullName,
  resetLink,
  expiresInMinutes,
  siteOrigin,
}) {
  const displayName = normalizeText(fullName, 'ban');
  const subject = 'SRX Việt Nam - Đặt lại mật khẩu';
  const intro = `SRX Việt Nam đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của ${displayName}. Nếu đây là bạn, vui lòng sử dụng nút bên dưới để tạo mật khẩu mới.`;
  const html = renderEmailLayout({
    preheader: 'Link đặt lại mật khẩu của bạn đã sẵn sàng.',
    title: 'Đặt lại mật khẩu',
    intro,
    sections: [
      {
        type: 'html',
        html: renderPrimaryAction({
          href: resetLink,
          label: 'Đặt lại mật khẩu',
        }),
      },
      {
        type: 'table',
        title: 'Thông tin bảo mật',
        rows: [
          { label: 'Link đặt lại', value: resetLink },
          { label: 'Hiệu lực', value: `${expiresInMinutes} phút` },
          { label: 'Website', value: siteOrigin || 'SRX Việt Nam' },
        ],
      },
    ],
    footerNote:
      'Nếu bạn không yêu cầu đặt lại mật khẩu, có thể bỏ qua email này. Link sẽ hết hạn sau thời gian trên.',
  });
  const text = [
    'SRX Việt Nam - Đặt lại mật khẩu',
    '',
    intro,
    '',
    `Link đặt lại mật khẩu: ${resetLink}`,
    `Hiệu lực: ${expiresInMinutes} phút`,
    '',
    'Nếu bạn không yêu cầu đặt lại mật khẩu, có thể bỏ qua email này.',
  ].join('\n');

  return { subject, html, text };
}

export function isMailConfigured() {
  return Boolean(getTransporter());
}

export async function verifyMailTransport() {
  const mailTransporter = getTransporter();

  if (!mailTransporter) {
    throw new Error('SMTP is not configured.');
  }

  await mailTransporter.verify();
}

export async function sendOrderConfirmationEmail({
  to,
  orderNumber,
  customer,
  items,
  subtotal,
  discountTotal,
  grandTotal,
  paymentMethodLabel,
  notes,
  paymentDetails,
  siteOrigin,
}) {
  const emailContent = buildOrderConfirmationEmail({
    orderNumber,
    customer,
    items,
    subtotal,
    discountTotal,
    grandTotal,
    paymentMethodLabel,
    notes,
    paymentDetails,
    siteOrigin,
  });

  return sendEmail({
    to,
    ...emailContent,
  });
}

export async function sendAffiliateApplicationReceivedEmail({
  to,
  application,
  resubmitted = false,
  siteOrigin,
}) {
  const emailContent = buildAffiliateApplicationReceivedEmail({
    application,
    resubmitted,
    siteOrigin,
  });

  return sendEmail({
    to,
    ...emailContent,
  });
}

export async function sendPasswordResetEmail({
  to,
  fullName,
  resetLink,
  expiresInMinutes,
  siteOrigin,
}) {
  const emailContent = buildPasswordResetEmail({
    fullName,
    resetLink,
    expiresInMinutes,
    siteOrigin,
  });

  return sendEmail({
    to,
    ...emailContent,
  });
}
