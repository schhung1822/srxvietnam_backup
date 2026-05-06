export async function submitLeadForm({
  formType,
  sourceKey,
  sourceLabel,
  customer_name,
  phone,
  email,
  business_field,
  brand_name,
  consultation_request,
}) {
  const response = await fetch('/api/contact-submissions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      formType,
      sourceKey,
      sourceLabel,
      customer_name,
      phone,
      email,
      business_field,
      brand_name,
      consultation_request,
      pagePath: typeof window !== 'undefined' ? window.location.pathname : '',
      pageUrl: typeof window !== 'undefined' ? window.location.href : '',
    }),
  });

  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(data.message || 'Khong the gui thong tin luc nay.');
  }

  return data;
}
