'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const VN_PHONE = /^(?:\+?84|0)(3|5|7|8|9)\d{8}$/;
const bubbleDecorations = [
  { className: '-left-24 -top-14 h-48 w-48 animate-lp-bubble' },
  { className: '-right-16 top-16 h-36 w-36 animate-lp-bubble-alt [animation-delay:-2s]' },
  { className: '-left-20 bottom-44 h-32 w-32 animate-lp-bubble [animation-delay:-4s]' },
  { className: 'bottom-0 right-2 h-44 w-44 animate-lp-bubble-alt [animation-delay:-1.5s]' },
  { className: 'left-[73%] top-[41%] h-20 w-20 animate-lp-bubble [animation-delay:-5s]' },
  { className: 'left-[16%] top-[19%] h-[4.5rem] w-[4.5rem] animate-lp-bubble-alt [animation-delay:-6.5s]' },
  { className: '-right-8 top-[53%] h-28 w-28 animate-lp-bubble [animation-delay:-3.6s]' },
  { className: 'left-[68%] top-[8.5rem] h-[3.8rem] w-[3.8rem] animate-lp-bubble-alt [animation-delay:-7.8s]' },
];

function normalizeText(value) {
  return String(value ?? '').trim();
}

function joinClassNames(...values) {
  return values.filter(Boolean).join(' ');
}

function normalizePhone(phone) {
  const sanitizedValue = String(phone ?? '').replace(/[^\d+]/g, '');

  if (sanitizedValue.startsWith('0')) {
    return `+84${sanitizedValue.slice(1)}`;
  }

  if (sanitizedValue.startsWith('84')) {
    return `+${sanitizedValue}`;
  }

  return sanitizedValue;
}

function parseJson(response) {
  return response
    .json()
    .catch(() => ({}))
    .then((data) => data ?? {});
}

function headerTitle(event) {
  return event.config.header.titleText || event.eventName;
}

function createInitialFormValues(event) {
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

function getFieldValue(searchParams, key) {
  return normalizeText(searchParams?.get?.(key));
}

function applySearchPrefills(event, visibleFields, currentValues) {
  const searchParams = new URLSearchParams(window.location.search);
  const nextValues = { ...currentValues };

  const assignPrefillValue = (fieldKey, queryKey = fieldKey) => {
    const fieldValue = getFieldValue(searchParams, queryKey);

    if (fieldValue && !normalizeText(nextValues[fieldKey])) {
      nextValues[fieldKey] = fieldValue;
    }
  };

  visibleFields.forEach((field) => {
    assignPrefillValue(field.key, field.key);
  });

  Object.keys(event?.config?.fields?.hidden ?? {}).forEach((fieldKey) => {
    assignPrefillValue(fieldKey, fieldKey);
  });

  Object.entries(event?.config?.behavior?.prefillKeys ?? {}).forEach(([fieldKey, queryKey]) => {
    assignPrefillValue(fieldKey, queryKey);
  });

  if (event?.config?.behavior?.readUserIdFromQueryKey) {
    assignPrefillValue('user_id', event.config.behavior.readUserIdFromQueryKey);
  }

  return nextValues;
}

function buildVisibleFields(event) {
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

function buildValidationMessage(fieldLabel) {
  return `Vui lòng nhập ${normalizeText(fieldLabel).toLowerCase() || 'thông tin bắt buộc'}.`;
}

function validateForm(event, values) {
  const visibleFields = buildVisibleFields(event);

  for (const field of visibleFields) {
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

    if (field.key === 'email' && fieldValue) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fieldValue)) {
        return 'Email chưa đúng định dạng.';
      }
    }
  }

  return '';
}

function getFieldSurfaceStyle() {
  return {
    borderColor: 'color-mix(in srgb, var(--lp-primary2) 48%, white)',
    boxShadow:
      'inset 0 1px 0 rgba(255,255,255,0.84), 0 10px 18px color-mix(in srgb, var(--lp-primary) 7%, transparent)',
  };
}

function renderInputField(field, value, onChange) {
  const baseFieldClassName =
    'w-full rounded-2xl border bg-white/95 px-4 py-[0.88rem] text-[15px] text-[var(--lp-text)] outline-none transition duration-200 placeholder:text-[var(--lp-muted)] focus:-translate-y-px focus:border-[var(--lp-primary)] focus:ring-4 focus:ring-[var(--lp-ring)]';
  const fieldStyle = getFieldSurfaceStyle();

  if (field.type === 'textarea') {
    return (
      <textarea
        id={field.key}
        name={field.key}
        value={value}
        onChange={onChange}
        placeholder={field.placeholder}
        required={field.required}
        className={`${baseFieldClassName} min-h-[6.8rem] resize-y`}
        style={fieldStyle}
      />
    );
  }

  if (field.type === 'select' || field.type === 'dropdown' || field.type === 'radio') {
    return (
      <select
        id={field.key}
        name={field.key}
        value={value}
        onChange={onChange}
        required={field.required}
        className={`${baseFieldClassName} appearance-none`}
        style={fieldStyle}
      >
        <option value="">Chọn {normalizeText(field.label).toLowerCase()}</option>
        {(field.options ?? []).map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  return (
    <input
      id={field.key}
      name={field.key}
      type={field.type}
      value={value}
      onChange={onChange}
      placeholder={field.placeholder}
      required={field.required}
      inputMode={field.key === 'phone' ? 'tel' : undefined}
      className={baseFieldClassName}
      style={fieldStyle}
    />
  );
}

export default function DefaultEventLanding({ event }) {
  const visibleFields = buildVisibleFields(event);
  const primaryTitle = headerTitle(event);
  const [formValues, setFormValues] = useState(() => createInitialFormValues(event));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [modalState, setModalState] = useState({
    open: false,
    type: 'success',
    title: '',
    message: '',
  });

  useEffect(() => {
    const nextVisibleFields = buildVisibleFields(event);
    setFormValues(applySearchPrefills(event, nextVisibleFields, createInitialFormValues(event)));
  }, [event]);

  const theme = event.config.theme;
  const footer = event.config.footer;
  const infoEvent = event.config.infoEvent;
  const header = event.config.header;
  const pageStyle = {
    '--lp-ring': theme.ring,
    '--lp-text': theme.text,
    '--lp-muted': theme.muted,
    '--lp-primary': theme.primary,
    '--lp-primary2': theme.primary2,
    color: theme.text,
    background: `radial-gradient(48rem 26rem at 12% 12%, color-mix(in srgb, ${theme.primary2} 28%, transparent), transparent 62%), radial-gradient(40rem 22rem at 88% 84%, color-mix(in srgb, ${theme.primary} 20%, transparent), transparent 58%), linear-gradient(180deg, color-mix(in srgb, ${theme.bg} 82%, white), ${theme.bg})`,
  };
  const ambientGridStyle = {
    backgroundImage:
      'linear-gradient(rgba(255,255,255,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.18) 1px, transparent 1px)',
    backgroundSize: '2rem 2rem',
    maskImage: 'linear-gradient(180deg, rgba(0,0,0,0.55), transparent 88%)',
  };
  const bubbleStyle = {
    background:
      'radial-gradient(circle at 28% 26%, rgba(255,255,255,0.96), rgba(255,255,255,0.62) 28%, rgba(255,255,255,0.14) 46%, color-mix(in srgb, var(--lp-primary) 48%, transparent) 66%, transparent 82%)',
    boxShadow:
      'inset -18px -14px 30px rgba(255,255,255,0.35), inset 12px 14px 22px rgba(255,255,255,0.16), 0 26px 50px color-mix(in srgb, var(--lp-primary) 20%, transparent)',
  };
  const cardStyle = {
    background: `linear-gradient(180deg, rgba(255,255,255,0.16), transparent 32%), ${theme.card}`,
    boxShadow: `0 34px 80px color-mix(in srgb, ${theme.primary} 16%, transparent), inset 0 0 0 1px rgba(255,255,255,0.6)`,
  };
  const cardGlowStyle = {
    background: `color-mix(in srgb, ${theme.primary2} 22%, white)`,
  };
  const cardHeadStyle = {
    background: `linear-gradient(135deg, ${theme.primary2}, ${theme.primary})`,
  };
  const cardHeadOverlayStyle = {
    background:
      'radial-gradient(circle at 20% 18%, rgba(255,255,255,0.22), transparent 38%), linear-gradient(180deg, rgba(255,255,255,0.14), transparent 56%)',
  };
  const footerStyle = {
    background: `linear-gradient(135deg, ${footer.gradientFrom}, ${footer.gradientTo})`,
    color: footer.textColor,
    boxShadow: `0 24px 48px color-mix(in srgb, ${footer.gradientTo} 22%, transparent)`,
  };
  const footerOverlayStyle = {
    background:
      'radial-gradient(circle at 16% 18%, rgba(255,255,255,0.22), transparent 30%), linear-gradient(180deg, rgba(255,255,255,0.14), transparent 45%)',
  };
  const buttonStyle = {
    background: `linear-gradient(135deg, ${theme.primary}, ${theme.primary2})`,
    boxShadow: `0 16px 36px color-mix(in srgb, ${theme.primary} 24%, transparent)`,
  };

  function closeModal() {
    setModalState((currentState) => ({
      ...currentState,
      open: false,
    }));
  }

  function handleInputChange(eventTarget) {
    const { name, value } = eventTarget.target;

    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));
  }

  async function handleSubmit(submitEvent) {
    submitEvent.preventDefault();

    const validationMessage = validateForm(event, formValues);

    if (validationMessage) {
      setModalState({
        open: true,
        type: 'error',
        title: 'Thiếu thông tin',
        message: validationMessage,
      });
      return;
    }

    const payload = {
      values: {
        ...formValues,
        phone: normalizePhone(formValues.phone),
      },
      pageUrl: window.location.href,
    };

    try {
      setIsSubmitting(true);
      setStatusText('Đang gửi thông tin, vui lòng chờ trong giây lát...');

      const response = await fetch(`/api/events/${event.slug}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const data = await parseJson(response);

      if (!response.ok) {
        throw new Error(data.message || 'Không thể gửi đăng ký lúc này.');
      }

      setModalState({
        open: true,
        type: 'success',
        title: 'Đăng ký thành công',
        message:
          data.message ||
          `SRX Việt Nam đã nhận thông tin tham dự ${event.eventName}. Chúng tôi sẽ liên hệ với bạn nếu cần xác nhận thêm.`,
      });
      setFormValues(applySearchPrefills(event, visibleFields, createInitialFormValues(event)));
      setStatusText('');
    } catch (error) {
      setModalState({
        open: true,
        type: 'error',
        title: 'Không thể gửi đăng ký',
        message: error.message || 'Vui lòng thử lại sau ít phút.',
      });
      setStatusText('');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="relative min-h-screen overflow-hidden px-4 pb-20 pt-9 sm:px-5" style={pageStyle}>
      <div className="relative z-10 mx-auto max-w-[600px]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-[-2rem] top-16 h-96 rounded-[2rem] opacity-[0.22] sm:inset-x-[-1rem] sm:top-12 sm:h-72"
          style={ambientGridStyle}
        />

        {bubbleDecorations.map((bubble, index) => (
          <div
            key={index + 1}
            className={`pointer-events-none absolute rounded-full opacity-90 ${bubble.className}`}
            style={bubbleStyle}
          >
            <span className="absolute left-[20%] top-[16%] h-[28%] w-[28%] rounded-full bg-white/60 blur-[2px]" />
            <span className="absolute inset-[14%] rounded-full border border-white/20" />
          </div>
        ))}

        <div className="relative z-10 mb-5 text-center">
          {header.headingImageUrl ? (
            <img
              src={header.headingImageUrl}
              alt={header.headingAlt || primaryTitle}
              className="mx-auto mb-3 block w-full max-w-[24rem] drop-shadow-[0_24px_42px_rgba(0,0,0,0.08)] sm:max-w-[22rem]"
            />
          ) : (
            <div className="mx-auto mb-4 max-w-[28rem] text-center text-[clamp(2.1rem,6vw,4rem)] font-extrabold leading-[0.92] tracking-[-0.05em] text-[var(--lp-text)]">
              {primaryTitle}
            </div>
          )}

          {header.descText ? (
            <p className="mx-auto inline-flex max-w-[28rem] items-center justify-center rounded-full border border-white/45 bg-white/55 px-4 py-2 text-center text-[15px] font-bold text-[color:var(--lp-primary)] backdrop-blur-md sm:max-w-[calc(100%-2rem)] sm:text-[13px]">
              {header.descText}
            </p>
          ) : null}
        </div>

        <main
          className="relative mx-auto overflow-hidden rounded-[28px] border border-white/60 backdrop-blur-xl"
          style={cardStyle}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-[18%] right-[52%] top-[-30%] h-48 rounded-full opacity-65 blur-[56px]"
            style={cardGlowStyle}
          />
          <div className="relative overflow-hidden px-6 py-4 sm:px-4 sm:py-6" style={cardHeadStyle}>
            <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={cardHeadOverlayStyle} />
            <div className="relative z-[1]">
              <h1 className="text-center text-[clamp(1.5rem,4vw,2rem)] font-bold uppercase leading-[1.04] tracking-[-0.035em] text-white">
                {primaryTitle}
              </h1>
            </div>
            {header.subtitleText ? (
              <p className="relative z-[1] mx-auto mt-2.5 max-w-[26rem] text-center text-[14px] leading-6 text-white/90">
                {header.subtitleText}
              </p>
            ) : null}
          </div>

          <form className="relative bg-white/[0.02] px-4 py-4 sm:px-6 sm:py-6" onSubmit={handleSubmit} noValidate>
            <div className="pointer-events-none absolute left-6 right-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent sm:left-4 sm:right-4" />
            {visibleFields.map((field) => (
              <div key={field.key} className="mb-4 last:mb-0">
                <label htmlFor={field.key} className="mb-1.5 block text-[14px] font-bold text-[var(--lp-text)]">
                  {field.label}{' '}
                  {field.required ? <span className="text-[var(--lp-primary)]">*</span> : null}
                </label>
                {renderInputField(field, formValues[field.key] ?? '', handleInputChange)}
              </div>
            ))}

            {Object.entries(event.config.fields.hidden)
              .filter(([, config]) => config.enabled && !config.visible)
              .map(([fieldKey]) => (
                <input
                  key={fieldKey}
                  type="hidden"
                  name={fieldKey}
                  value={formValues[fieldKey] ?? ''}
                  readOnly
                />
              ))}

            <div className="mt-1.5">
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full overflow-hidden rounded-2xl px-5 py-[0.92rem] text-[15px] font-extrabold text-white transition duration-200 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
                style={buttonStyle}
              >
                <span className="pointer-events-none absolute inset-0 -translate-x-[120%] bg-[linear-gradient(120deg,transparent_15%,rgba(255,255,255,0.28)_48%,transparent_78%)] transition-transform duration-500 group-hover:translate-x-[120%]" />
                {isSubmitting ? 'Đang gửi...' : 'Gửi thông tin'}
              </button>
              <span className="mt-2.5 block min-h-5 text-center text-[13px] text-[var(--lp-muted)]">
                {statusText || '\u00A0'}
              </span>
            </div>
          </form>

          <div className="px-6 pb-6 text-center text-[12px] leading-4 text-[var(--lp-muted)] sm:px-4 sm:pb-5">
            Bằng việc gửi thông tin, bạn đồng ý để SRX Việt Nam liên hệ nhằm xác nhận đăng ký và hỗ
            trợ các nội dung liên quan đến sự kiện.
          </div>
        </main>

        {infoEvent.topText || infoEvent.headline || infoEvent.motto || infoEvent.organizerText ? (
          <section
            className="relative z-10 mx-auto mt-8 overflow-hidden text-center "
          >
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[inherit]"/>
            {infoEvent.topText ? (
              <p className="relative z-[1] mb-3 inline-flex min-h-8 items-center justify-center rounded-full border border-white/50 bg-white/60 px-3.5 py-1 text-[12px] font-extrabold uppercase tracking-[0.1em] text-[color:var(--lp-primary)]">
                {infoEvent.topText}
              </p>
            ) : null}
            {infoEvent.headline ? (
              <h2 className="relative z-[1] text-[clamp(1.8rem,5vw,2.55rem)] font-extrabold leading-[0.96] tracking-[-0.045em] text-[color:var(--lp-primary)]">
                {infoEvent.headline}
              </h2>
            ) : null}
            {infoEvent.motto ? (
              <p className="relative z-[1] mx-auto mt-2 max-w-[31rem] text-[16px] font-bold leading-7 text-[color:var(--lp-primary)]">
                {infoEvent.motto}
              </p>
            ) : null}
            {infoEvent.organizerText ? (
              <p className="relative z-[1] mt-2 text-[15px] leading-7 text-[color:var(--lp-primary)]">
                {infoEvent.organizerText}
              </p>
            ) : null}

            {infoEvent.logo1Url || infoEvent.logo2Url ? (
              <div className="relative z-[1] my-4 flex flex-wrap items-center justify-center gap-4">
                {infoEvent.logo1Url ? (
                  <img
                    src={infoEvent.logo1Url}
                    alt="Logo đơn vị tổ chức 1"
                    className="max-h-16 max-w-[min(8rem,40vw)] object-contain]"
                  />
                ) : null}
                {infoEvent.logo2Url ? (
                  <img
                    src={infoEvent.logo2Url}
                    alt="Logo đơn vị tổ chức 2"
                    className="max-h-16 max-w-[min(8rem,40vw)] object-contain]"
                  />
                ) : null}
              </div>
            ) : null}

            {infoEvent.bottomText ? (
              <p className="relative z-[1] mx-auto mt-2 max-w-[28rem] text-[14px] leading-7 text-[color:var(--lp-primary)]">
                {infoEvent.bottomText}
              </p>
            ) : null}
          </section>
        ) : null}

        {footer.placeName || footer.dateDay || footer.dressCodeTitle ? (
          <footer className="relative z-10 mx-auto mt-7 overflow-hidden rounded-[26px]" style={footerStyle}>
            <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={footerOverlayStyle} />
            <div className="relative grid gap-4 p-8 md:grid-cols-3 sm:p-6">
              <div className="min-w-0">
                {footer.dressCodeTitle ? <div className="mb-1.5 text-[18px] font-extrabold leading-tight">{footer.dressCodeTitle}</div> : null}
                {footer.dressCodeDesc ? <p className="mb-3 text-[13px] leading-6">{footer.dressCodeDesc}</p> : null}
                <div className="flex items-center gap-2">
                  <span className="h-[1.65rem] w-[1.65rem] rounded-full border border-white/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]" style={{ background: footer.dressDots.white }} />
                  <span className="h-[1.65rem] w-[1.65rem] rounded-full border border-white/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]" style={{ background: footer.dressDots.whitePink }} />
                  <span className="h-[1.65rem] w-[1.65rem] rounded-full border border-white/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]" style={{ background: footer.dressDots.pink }} />
                  <span className="h-[1.65rem] w-[1.65rem] rounded-full border border-white/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]" style={{ background: footer.dressDots.black }} />
                </div>
              </div>

              <div className="min-w-0 text-center">
                {(footer.dateDay || footer.dateMonth || footer.dateYear) && (
                  <div className="flex items-center justify-center gap-2.5">
                    <div className="text-[2.6rem] font-extrabold leading-none">{footer.dateDay || '--'}</div>
                    <div className="text-left">
                      <div className="text-[1.2rem] font-bold leading-none">{footer.dateMonth || '--'}</div>
                      <div className="mt-1 text-[0.88rem] font-semibold leading-none">{footer.dateYear || '--'}</div>
                    </div>
                  </div>
                )}
                {footer.timeText ? <div className="mt-2 text-[15px] font-bold">{footer.timeText}</div> : null}
              </div>

              <div className="min-w-0">
                <div>
                  {footer.placeName ? <span className="mb-2 block text-[17px] font-extrabold leading-6">{footer.placeName}</span> : null}
                  {footer.placeLine1 ? <span className="block text-[13px] leading-6">{footer.placeLine1}</span> : null}
                  {footer.placeLine2 ? <span className="block text-[13px] leading-6">{footer.placeLine2}</span> : null}
                </div>
              </div>
            </div>
          </footer>
        ) : null}
      </div>

      <section
        className={joinClassNames(
          'fixed inset-0 z-[60] place-items-center bg-[rgba(32,21,14,0.32)] px-4 backdrop-blur-md',
          modalState.open ? 'grid' : 'hidden',
        )}
        role="dialog"
        aria-modal="true"
        aria-hidden={!modalState.open}
        onClick={(eventTarget) => {
          if (eventTarget.target === eventTarget.currentTarget) {
            closeModal();
          }
        }}
      >
        <div className="w-full max-w-[32rem] rounded-[24px] bg-white p-6 text-center shadow-[0_32px_64px_rgba(0,0,0,0.16)]">
          <div
            className={joinClassNames(
              'mx-auto mb-4 flex h-[3.8rem] w-[3.8rem] items-center justify-center rounded-2xl',
              modalState.type === 'success' ? 'bg-emerald-500/10 text-emerald-700' : 'bg-red-500/10 text-red-700',
            )}
          >
            {modalState.type === 'success' ? <CheckCircle2 className="h-7 w-7" /> : <AlertCircle className="h-7 w-7" />}
          </div>
          <h3 className="text-[1.4rem] font-extrabold leading-[1.15] text-[#1f1711]">{modalState.title}</h3>
          <p className="mt-3 text-[15px] leading-7 text-[#5e4c40]">{modalState.message}</p>
          <button
            type="button"
            className="mt-5 rounded-full px-5 py-3 text-[14px] font-extrabold text-white"
            style={{ background: theme.primary }}
            onClick={closeModal}
          >
            Đã hiểu
          </button>
        </div>
      </section>
    </section>
  );
}
