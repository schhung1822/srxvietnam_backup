import { NextResponse } from 'next/server';
import { sendLeadFormNotification } from '../../../src/lib/server/lark.js';

export const runtime = 'nodejs';

const leadSourceConfigs = {
  'contact-page-form': {
    formType: 'consultation',
    sourceLabel: 'Form tu van trang lien he',
  },
  'consultation-popup': {
    formType: 'consultation',
    sourceLabel: 'Popup tu van mien phi',
  },
  'consultation-section': {
    formType: 'consultation',
    sourceLabel: 'Khoi tu van website',
  },
  'consultation-section-primary': {
    formType: 'consultation',
    sourceLabel: 'Khoi tu van chinh',
  },
  'about-contact-popup': {
    formType: 'contact',
    sourceLabel: 'Popup lien he SRX',
  },
};

const validationMessages = new Set([
  'Vui long nhap ho ten hop le.',
  'Vui long nhap so dien thoai hop le.',
  'Vui long nhap email hop le.',
  'Vui long nhap noi dung lien he.',
]);

function normalizeString(value) {
  return String(value ?? '').trim();
}

function normalizeLeadContext({ formType, sourceKey, sourceLabel, pagePath }) {
  const normalizedFormType = normalizeString(formType).toLowerCase();
  const normalizedSourceKey = normalizeString(sourceKey).toLowerCase();
  const normalizedSourceLabel = normalizeString(sourceLabel);
  const normalizedPagePath = normalizeString(pagePath).toLowerCase();

  if (leadSourceConfigs[normalizedSourceKey]) {
    return {
      sourceKey: normalizedSourceKey,
      ...leadSourceConfigs[normalizedSourceKey],
    };
  }

  if (normalizedPagePath === '/contact') {
    return {
      sourceKey: 'contact-page-form',
      ...leadSourceConfigs['contact-page-form'],
    };
  }

  if (
    normalizedFormType === 'partnership' &&
    [
      'Popup hÃ¡Â»Â£p tÃƒÂ¡c',
      'Popup há»£p tÃ¡c',
      'Popup tÆ° váº¥n miá»…n phÃ­',
      'Popup tu van mien phi',
    ].includes(normalizedSourceLabel)
  ) {
    return {
      sourceKey: 'consultation-popup',
      ...leadSourceConfigs['consultation-popup'],
    };
  }

  return {
    sourceKey: normalizedSourceKey,
    formType: normalizedFormType || 'contact',
    sourceLabel: normalizedSourceLabel || 'Website form',
  };
}

function normalizeSubmission(body) {
  const pagePath = normalizeString(body?.pagePath);
  const leadContext = normalizeLeadContext({
    formType: body?.formType,
    sourceKey: body?.sourceKey,
    sourceLabel: body?.sourceLabel,
    pagePath,
  });

  return {
    sourceKey: leadContext.sourceKey,
    formType: leadContext.formType,
    sourceLabel: leadContext.sourceLabel,
    customerName: normalizeString(body?.customer_name),
    phone: normalizeString(body?.phone),
    email: normalizeString(body?.email).toLowerCase(),
    businessField: normalizeString(body?.business_field),
    brandName: normalizeString(body?.brand_name),
    consultationRequest: normalizeString(body?.consultation_request),
    pagePath,
    pageUrl: normalizeString(body?.pageUrl),
  };
}

function validateSubmission(submission) {
  if (submission.customerName.length < 2) {
    throw new Error('Vui long nhap ho ten hop le.');
  }

  if (submission.phone.length < 8) {
    throw new Error('Vui long nhap so dien thoai hop le.');
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(submission.email)) {
    throw new Error('Vui long nhap email hop le.');
  }

  if (!submission.consultationRequest) {
    throw new Error('Vui long nhap noi dung lien he.');
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const submission = normalizeSubmission(body);

    validateSubmission(submission);

    try {
      await sendLeadFormNotification(submission);
    } catch (notificationError) {
      console.error('Lead form Lark notification error:', notificationError);

      return NextResponse.json(
        { message: 'Khong gui duoc thong bao Lark. Vui long thu lai.' },
        { status: 502 },
      );
    }

    return NextResponse.json(
      {
        message: 'Thong tin da duoc gui thanh cong.',
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Lead form submission error:', error);

    if (error instanceof Error && validationMessages.has(error.message)) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { message: 'Khong the gui thong tin luc nay.' },
      { status: 500 },
    );
  }
}
