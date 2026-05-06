import https from 'node:https';

const LARK_WEBHOOK_URL =
  process.env.LARK_WEBHOOK_URL?.trim() ||
  'https://open.larksuite.com/open-apis/bot/v2/hook/4e741a32-ca82-4381-8b37-5825c7d91f37';

const currencyFormatter = new Intl.NumberFormat('vi-VN');

function formatCurrencyVnd(value) {
  return `${currencyFormatter.format(Math.max(Number(value) || 0, 0))} VND`;
}

function normalizeText(value, fallback = 'Khong co') {
  const normalized = String(value ?? '').trim();
  return normalized || fallback;
}

function uniqueTextValues(values) {
  const seen = new Set();

  return values.filter((value) => {
    const normalized = normalizeText(value, '').toLowerCase();

    if (!normalized || seen.has(normalized)) {
      return false;
    }

    seen.add(normalized);
    return true;
  });
}

function buildField(label, value, isShort = false) {
  return {
    is_short: isShort,
    text: {
      tag: 'lark_md',
      content: `**${label}**: ${normalizeText(value)}`,
    },
  };
}

function buildStackedField(label, value, isShort = false) {
  return {
    is_short: isShort,
    text: {
      tag: 'lark_md',
      content: `**${label}:**\n${normalizeText(value)}`,
    },
  };
}

function buildMultilineMarkdown(label, value) {
  return `**${label}:**\n${normalizeText(value)}`;
}

function buildAddress(customer = {}) {
  const parts = uniqueTextValues([
    customer.addressLine,
    customer.ward,
    customer.district,
    customer.province,
  ]);

  return parts.join(' - ') || 'Khong co';
}

function formatOrderItems(items = []) {
  if (!Array.isArray(items) || !items.length) {
    return 'Khong co san pham';
  }

  return items
    .map((item) => {
      const variantLabel = normalizeText(item.variantLabel, '');
      const variantText = variantLabel ? `, ${variantLabel}` : '';
      return `${normalizeText(item.name)}${variantText}, SL ${Math.max(Number(item.quantity) || 0, 0)} - ${formatCurrencyVnd(item.price)}`;
    })
    .join('\n');
}

function buildInteractiveCard({ title, template = 'blue', elements }) {
  return {
    msg_type: 'interactive',
    card: {
      config: {
        wide_screen_mode: true,
      },
      header: {
        template,
        title: {
          tag: 'plain_text',
          content: title,
        },
      },
      elements,
    },
  };
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function postToLark(payload) {
  if (!LARK_WEBHOOK_URL) {
    return;
  }

  const requestBody = JSON.stringify(payload);
  let lastError = null;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const responseText = await new Promise((resolve, reject) => {
        const request = https.request(
          LARK_WEBHOOK_URL,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              'Content-Length': Buffer.byteLength(requestBody),
            },
          },
          (response) => {
            let body = '';

            response.setEncoding('utf8');
            response.on('data', (chunk) => {
              body += chunk;
            });
            response.on('end', () => {
              if ((response.statusCode ?? 500) >= 400) {
                reject(new Error(`Lark webhook failed (${response.statusCode}): ${body}`));
                return;
              }

              resolve(body);
            });
          },
        );

        request.on('error', reject);
        request.setTimeout(10000, () => {
          request.destroy(new Error('Lark webhook request timed out.'));
        });
        request.write(requestBody);
        request.end();
      });

      if (!responseText) {
        return;
      }

      const responseData = JSON.parse(responseText);

      if (typeof responseData?.code === 'number' && responseData.code !== 0) {
        throw new Error(
          `Lark webhook rejected payload (${responseData.code}): ${responseData.msg || 'Unknown error'}`,
        );
      }

      return;
    } catch (error) {
      lastError = error;

      if (attempt < 3) {
        await wait(attempt * 500);
      }
    }
  }

  throw lastError ?? new Error('Lark webhook request failed.');
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

export async function sendOrderPlacedNotification({
  orderNumber,
  customer,
  items,
  grandTotal,
  paymentMethodLabel,
  notes,
  source,
}) {
  const storeName = normalizeText(source, 'SRX Việt Nam').replace(/^Website\s+/i, '');
  const payload = buildInteractiveCard({
    title: `Đơn hàng mới từ ${storeName} #${normalizeText(orderNumber)}`,
    template: 'grey',
    elements: [
      {
        tag: 'div',
        fields: [
          buildStackedField('Tổng tiền', formatCurrencyVnd(grandTotal), true),
          buildStackedField('Thanh toán', paymentMethodLabel, true),
        ],
      },
      {
        tag: 'hr',
      },
      {
        tag: 'div',
        fields: [
          buildStackedField('Họ và tên', customer?.fullName, true),
          buildStackedField('Số điện thoại', customer?.phone, true),
          buildStackedField('Email', customer?.email, true),
          buildStackedField('Địa chỉ', buildAddress(customer), true),
        ],
      },
      {
        tag: 'hr',
      },
      {
        tag: 'div',
        text: {
          tag: 'lark_md',
          content: buildMultilineMarkdown('Sản phẩm', formatOrderItems(items)),
        },
      },
      {
        tag: 'hr',
      },
      {
        tag: 'div',
        fields: [
          buildStackedField('Ghi chu', notes),
          buildStackedField('Nguon', source),
        ],
      },
    ],
  });

  await postToLark(payload);
}

const leadCardConfigs = {
  contact: {
    template: 'blue',
    title: 'Liên hệ mới',
    contentLabel: 'Nội dung liên hệ',
    formLabel: 'Form liên hệ website',
  },
  consultation: {
    template: 'orange',
    title: 'Yêu cầu tư vấn mới',
    contentLabel: 'Yêu cầu tư vấn',
    formLabel: 'Form tư vấn website',
  },
  partnership: {
    template: 'purple',
    title: 'Yêu cầu hợp tác mới',
    contentLabel: 'Nội dung hợp tác',
    formLabel: 'Form hợp tác website',
  },
};

export async function sendLeadFormNotification(lead) {
  const config = leadCardConfigs[lead.formType] ?? {
    template: 'blue',
    title: 'Thông báo form mới',
    contentLabel: 'Nội dung',
    formLabel: 'Form website',
  };

  const payload = buildInteractiveCard({
    title: `${config.title} từ ${normalizeText(lead.customerName)}`,
    template: config.template,
    elements: [
      {
        tag: 'div',
        fields: [
          buildField('Họ và tên', lead.customerName),
          buildField('Số điện thoại', lead.phone),
          buildField('Email', lead.email),
          buildField('Lĩnh vực kinh doanh', lead.businessField),
          buildField('Tên thương hiệu', lead.brandName),
          buildField('Loại biểu mẫu', config.formLabel),
          buildField('Nguồn gửi', lead.sourceLabel),
          buildField('Trang gửi', lead.pageUrl || lead.pagePath),
        ],
      },
      {
        tag: 'hr',
      },
      {
        tag: 'div',
        text: {
          tag: 'lark_md',
          content: buildMultilineMarkdown(config.contentLabel, lead.consultationRequest),
        },
      },
    ],
  });

  await postToLark(payload);
}

export async function sendAffiliateApplicationSubmittedNotification({
  user,
  application,
  source,
  resubmitted = false,
}) {
  const titlePrefix = resubmitted ? 'Hồ sơ affiliate gửi lại cần duyệt' : 'Hồ sơ affiliate mới cần duyệt';
  const accountLabel =
    normalizeText(user?.full_name || user?.fullName || user?.displayName || '', '') ||
    normalizeText(user?.email);

  const payload = buildInteractiveCard({
    title: `${titlePrefix} - ${normalizeText(application?.legalFullName)}`,
    template: 'indigo',
    elements: [
      {
        tag: 'div',
        fields: [
          buildStackedField('Họ và tên pháp lý', application?.legalFullName, true),
          buildStackedField('Số điện thoại', application?.contactPhone, true),
          buildStackedField('Email liên hệ', application?.contactEmail, true),
          buildStackedField('Tài khoản SRX', accountLabel, true),
        ],
      },
      {
        tag: 'hr',
      },
      {
        tag: 'div',
        fields: [
          buildStackedField('CCCD', application?.nationalIdNumber, true),
          buildStackedField('Giới tính', formatGenderLabel(application?.gender), true),
          buildStackedField('Trạng thái', 'Cho duyệt', true),
          buildStackedField('Nguồn', source || 'Website SRX Viet Nam', true),
        ],
      },
      {
        tag: 'hr',
      },
      {
        tag: 'div',
        text: {
          tag: 'lark_md',
          content: buildMultilineMarkdown('Địa chỉ thường trú', application?.permanentAddress),
        },
      },
      {
        tag: 'hr',
      },
      {
        tag: 'div',
        fields: [
          buildStackedField('Facebook', application?.facebookUrl),
          buildStackedField('TikTok', application?.tiktokUrl),
        ],
      },
    ],
  });

  await postToLark(payload);
}
