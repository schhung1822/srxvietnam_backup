const VN_PHONE = /^(?:\+?84|0)(3|5|7|8|9)\d{8}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeText(value) {
  return String(value ?? '').trim();
}

export function joinClassNames(...values) {
  return values.filter(Boolean).join(' ');
}

export function normalizePhone(phone) {
  const sanitizedValue = String(phone ?? '').replace(/[^\d+]/g, '');

  if (sanitizedValue.startsWith('0')) {
    return `+84${sanitizedValue.slice(1)}`;
  }

  if (sanitizedValue.startsWith('84')) {
    return `+${sanitizedValue}`;
  }

  return sanitizedValue;
}

export function parseJsonResponse(response) {
  return response
    .json()
    .catch(() => ({}))
    .then((data) => data ?? {});
}

export function createInitialFormValues(event) {
  const standardFieldValues = {
    full_name: '',
    phone: '',
    email: '',
  };
  const customFieldValues = Object.fromEntries(
    Object.keys(event?.config?.fields?.hidden ?? {}).map((key) => [key, '']),
  );
  const questionValues = Object.fromEntries(
    (event?.config?.questions ?? []).map((question) => [question.id, '']),
  );

  return {
    ...standardFieldValues,
    ...customFieldValues,
    ...questionValues,
  };
}

export function buildVisibleFields(event) {
  const visibleFields = [];
  const standardFields = [
    ['full_name', event?.config?.fields?.full_name],
    ['phone', event?.config?.fields?.phone],
    ['email', event?.config?.fields?.email],
  ];

  standardFields.forEach(([key, config]) => {
    if (config?.enabled) {
      visibleFields.push({
        key,
        type: key === 'email' ? 'email' : key === 'phone' ? 'tel' : 'text',
        label: config.label,
        required: Boolean(config.required),
        placeholder: config.placeholder,
        options: [],
      });
    }
  });

  Object.entries(event?.config?.fields?.hidden ?? {}).forEach(([key, config]) => {
    if (config?.enabled && config?.visible) {
      visibleFields.push({
        key,
        type: config.type || 'text',
        label: config.label,
        required: Boolean(config.required),
        placeholder: config.placeholder,
        options: config.options ?? [],
      });
    }
  });

  (event?.config?.questions ?? []).forEach((question) => {
    if (question?.enabled) {
      visibleFields.push({
        key: question.id,
        type: question.type || 'text',
        label: question.label,
        required: Boolean(question.required),
        placeholder: question.placeholder,
        options: question.options ?? [],
      });
    }
  });

  return visibleFields;
}

export function buildHiddenFieldKeys(event) {
  return Object.entries(event?.config?.fields?.hidden ?? {})
    .filter(([, config]) => config?.enabled && !config?.visible)
    .map(([key]) => key);
}

export function applySearchPrefills(event, visibleFields, currentValues) {
  const searchParams = new URLSearchParams(window.location.search);
  const nextValues = { ...currentValues };

  const assignPrefillValue = (fieldKey, queryKey = fieldKey) => {
    const fieldValue = normalizeText(searchParams.get(queryKey));

    if (fieldValue && !normalizeText(nextValues[fieldKey])) {
      nextValues[fieldKey] = fieldValue;
    }
  };

  visibleFields.forEach((field) => assignPrefillValue(field.key, field.key));
  Object.keys(event?.config?.fields?.hidden ?? {}).forEach((fieldKey) => assignPrefillValue(fieldKey));
  Object.entries(event?.config?.behavior?.prefillKeys ?? {}).forEach(([fieldKey, queryKey]) => {
    assignPrefillValue(fieldKey, queryKey);
  });

  if (event?.config?.behavior?.readUserIdFromQueryKey) {
    assignPrefillValue('user_id', event.config.behavior.readUserIdFromQueryKey);
  }

  if (Object.prototype.hasOwnProperty.call(nextValues, 'full_name_nv')) {
    assignPrefillValue('full_name_nv', 'sale');
    assignPrefillValue('full_name_nv', 'sale_name');
  }

  return nextValues;
}

function buildValidationMessage(fieldLabel) {
  return `Vui lòng nhập ${normalizeText(fieldLabel).toLowerCase() || 'thông tin bắt buộc'}.`;
}

export function validateForm(event, values) {
  for (const field of buildVisibleFields(event)) {
    const fieldValue = normalizeText(values[field.key]);

    if (field.required && !fieldValue) {
      return buildValidationMessage(field.label);
    }

    if (field.key === 'full_name' && field.required && fieldValue.length < 2) {
      return 'Vui lòng nhập họ và tên hợp lệ.';
    }

    if (field.key === 'phone') {
      const normalizedPhone = normalizePhone(fieldValue);

      if (field.required && !normalizedPhone) {
        return 'Vui lòng nhập số điện thoại.';
      }

      if (normalizedPhone && !VN_PHONE.test(normalizedPhone)) {
        return 'Số điện thoại chưa đúng định dạng.';
      }
    }

    if (field.key === 'email' && fieldValue && !EMAIL.test(fieldValue)) {
      return 'Email chưa đúng định dạng.';
    }
  }

  return '';
}

export function splitDateParts(footer) {
  const day = normalizeText(footer?.dateDay).padStart(2, '0');
  const month = normalizeText(footer?.dateMonth).padStart(2, '0');

  return {
    day: normalizeText(footer?.dateDay),
    month: normalizeText(footer?.dateMonth),
    year: normalizeText(footer?.dateYear),
    date: day && month ? `${day}.${month}` : day || month || '--',
  };
}
