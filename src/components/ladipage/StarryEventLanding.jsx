'use client';

import { useEffect, useState } from 'react';

const VN_PHONE = /^(?:\+?84|0)(3|5|7|8|9)\d{8}$/;

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

function getFieldValue(searchParams, key) {
  return normalizeText(searchParams?.get?.(key));
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

function applySearchPrefills(event, visibleFields, currentValues) {
  const searchParams = new URLSearchParams(window.location.search);
  const nextValues = { ...currentValues };

  const assignPrefillValue = (fieldKey, queryKey = fieldKey) => {
    const fieldValue = getFieldValue(searchParams, queryKey);

    if (fieldValue && !normalizeText(nextValues[fieldKey])) {
      nextValues[fieldKey] = fieldValue;
    }
  };

  visibleFields.forEach((field) => assignPrefillValue(field.key, field.key));
  Object.keys(event?.config?.fields?.hidden ?? {}).forEach((fieldKey) => assignPrefillValue(fieldKey, fieldKey));
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

function validateForm(event, values) {
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

    if (field.key === 'email' && fieldValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fieldValue)) {
      return 'Email chưa đúng định dạng.';
    }
  }

  return '';
}

function renderInputField(field, value, onChange) {
  const baseClassName = 'h-11 w-full rounded-xl border border-white/30 bg-white/95 px-3.5 text-[13px] font-bold text-[#260508] shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_10px_24px_rgba(0,0,0,0.16)] outline-none transition placeholder:text-[#9b8d90] focus:border-[var(--lp-red-3)] focus:ring-4 focus:ring-[rgba(236,74,81,0.18)]';

  if (field.type === 'textarea') {
    return (
      <textarea
        id={field.key}
        name={field.key}
        value={value}
        onChange={onChange}
        placeholder={field.placeholder}
        required={field.required}
        className={`${baseClassName} min-h-[5.8rem] resize-y py-3`}
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
        className={`${baseClassName} appearance-none`}
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
      className={baseClassName}
    />
  );
}

function splitDateParts(footer) {
  const day = normalizeText(footer.dateDay).padStart(2, '0');
  const month = normalizeText(footer.dateMonth).padStart(2, '0');

  return {
    date: day && month ? `${day}.${month}` : day || month || '--',
    year: normalizeText(footer.dateYear),
  };
}

function getAgendaItems(event) {
  const enabledQuestions = (event.config.questions ?? []).filter((question) => question?.enabled);
  const fallbackItems = [
    event.config.infoEvent.headline,
    event.config.infoEvent.motto,
    event.config.infoEvent.organizerText,
  ].filter(Boolean);
  const items = enabledQuestions.length > 0 ? enabledQuestions.map((question) => question.label) : fallbackItems;

  return items.slice(0, 3);
}

export default function StarryEventLanding({ event }) {
  const visibleFields = buildVisibleFields(event);
  const [formValues, setFormValues] = useState(() => createInitialFormValues(event));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalState, setModalState] = useState({ open: false, type: 'success', title: '', message: '' });

  useEffect(() => {
    const nextVisibleFields = buildVisibleFields(event);
    setFormValues(applySearchPrefills(event, nextVisibleFields, createInitialFormValues(event)));
  }, [event]);

  const theme = event.config.theme;
  const header = event.config.header;
  const footer = event.config.footer;
  const infoEvent = event.config.infoEvent;
  const title = event.eventName || header.titleText;
  const { date, year } = splitDateParts(footer);
  const agendaItems = getAgendaItems(event);
  const logoUrls = [infoEvent.logo1Url, infoEvent.logo2Url, infoEvent.logo3Url].filter(Boolean);
  const pageStyle = {
    '--lp-bg': theme.bg || '#070405',
    '--lp-red': theme.primary || '#c4212b',
    '--lp-red-2': theme.primary2 || '#8d1119',
    '--lp-red-3': theme.primary2 || '#ec4a51',
    '--lp-gold': theme.muted || '#ffd7a2',
    color: '#ffffff',
    background:
      'radial-gradient(circle at 50% 0%, color-mix(in srgb, var(--lp-red) 18%, transparent), transparent 32%), linear-gradient(180deg, #050303, #170607 56%, #050303)',
  };
  const footerStyle = {
    color: footer.textColor || '#ffffff',
    background: `linear-gradient(180deg, ${footer.gradientFrom || '#090304'}, ${footer.gradientTo || '#180608'} 58%, #050303)`,
  };
  const footerLogoGridClassName = joinClassNames(
    'relative z-[1] mb-4 grid w-full max-w-[360px] items-center gap-2.5',
    logoUrls.length === 1 ? 'grid-cols-1 justify-items-center' : logoUrls.length === 2 ? 'grid-cols-2' : 'grid-cols-3',
  );

  function closeModal() {
    setModalState((currentState) => ({ ...currentState, open: false }));
  }

  function handleInputChange(eventTarget) {
    const { name, value } = eventTarget.target;
    setFormValues((currentValues) => ({ ...currentValues, [name]: value }));
  }

  async function handleSubmit(submitEvent) {
    submitEvent.preventDefault();

    const validationMessage = validateForm(event, formValues);

    if (validationMessage) {
      setModalState({ open: true, type: 'error', title: 'Thiếu thông tin', message: validationMessage });
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/events/${event.slug}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          values: {
            ...formValues,
            phone: normalizePhone(formValues.phone),
          },
          pageUrl: window.location.href,
        }),
      });
      const data = await parseJson(response);

      if (!response.ok) {
        throw new Error(data.message || 'Không thể gửi đăng ký lúc này.');
      }

      setModalState({
        open: true,
        type: 'success',
        title: 'Đăng ký thành công',
        message: data.message || `SRX Việt Nam đã nhận thông tin tham dự ${event.eventName}.`,
      });
      setFormValues(applySearchPrefills(event, visibleFields, createInitialFormValues(event)));
    } catch (error) {
      setModalState({
        open: true,
        type: 'error',
        title: 'Không thể đăng ký',
        message: error.message || 'Vui lòng thử lại sau.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="min-h-screen overflow-x-hidden" style={pageStyle}>
      <div className="relative mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#070405] shadow-[0_0_80px_rgba(0,0,0,0.55)]">
        <section className="relative bg-[#050303] after:pointer-events-none after:absolute after:inset-x-0 after:-bottom-px after:h-24 after:bg-[linear-gradient(180deg,rgba(5,3,3,0),#090304_70%,#120607)]">
          {header.headingImageUrl ? (
            <img src={header.headingImageUrl} alt={header.headingAlt || title} className="block h-auto w-full" />
          ) : (
            <div className="px-5 py-16 text-center text-[2.1rem] font-black uppercase leading-[0.95] tracking-[-0.04em]">
              {title}
            </div>
          )}
        </section>

        <section className="relative bg-[radial-gradient(circle_at_50%_-10%,rgba(225,36,48,0.35),transparent_46%),linear-gradient(180deg,#120607,#070405)] px-4 pb-5 pt-[18px] before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_18%_24%,rgba(255,255,255,0.12)_0_1px,transparent_2px),radial-gradient(circle_at_82%_18%,rgba(236,74,81,0.22)_0_2px,transparent_3px),radial-gradient(circle_at_74%_72%,rgba(255,255,255,0.10)_0_1px,transparent_2px)] before:bg-[length:86px_86px,122px_122px,68px_68px] before:opacity-70">
          {(header.descText || infoEvent.topText) && (
            <div className="relative z-[1] mx-auto mb-3 w-max max-w-full rounded-full border border-white/20 bg-[linear-gradient(90deg,var(--lp-red-2),var(--lp-red))] px-[18px] py-[7px] text-center text-xs font-black uppercase tracking-[0.025em] shadow-[0_0_32px_rgba(226,28,42,0.42)]">
              {header.descText || infoEvent.topText}
            </div>
          )}

          <h1 className="relative z-[1] mx-auto mb-3 max-w-[390px] text-center text-xl font-black uppercase leading-[1.18] tracking-[-0.025em]">
            {title}
          </h1>

          <div className="relative z-[1] mt-4 grid grid-cols-3 gap-2">
            <div className="min-h-[72px] rounded-2xl border border-white/15 my-auto bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.04))] px-2 py-3 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
              <strong className="block text-xl font-black leading-none">{date}</strong>
            </div>
            <div className="min-h-[72px] rounded-2xl border border-white/15 my-auto bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.04))] px-2 py-3 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
              <strong className="block text-xl font-black leading-none">{footer.timeText || '--'}</strong>
            </div>
            <div className="min-h-[72px] rounded-2xl border border-white/15 my-auto bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.04))] px-2 py-3 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
              <strong className="block text-lg font-black leading-none">{footer.placeName || 'SRX'}</strong>
            </div>
          </div>

          {agendaItems.length > 0 && (
            <ul className="relative z-[1] mt-4 list-none p-0">
              {agendaItems.map((item, index) => (
                <li key={`${item}-${index}`} className="grid grid-cols-[42px_1fr] items-start gap-2.5 border-b border-white/10 py-2.5 text-xs leading-[1.35] text-white/85 last:border-b-0">
                  <b className="text-[25px] font-black leading-none tracking-[-0.04em] text-white shadow-[0_0_32px_rgba(226,28,42,0.42)]">{String(index + 1).padStart(2, '0')}</b>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="relative bg-[linear-gradient(180deg,#070405_0%,#220609_42%,#080304_100%)] px-4 py-7 before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_18%_24%,rgba(255,255,255,0.12)_0_1px,transparent_2px),radial-gradient(circle_at_82%_18%,rgba(236,74,81,0.22)_0_2px,transparent_3px),radial-gradient(circle_at_74%_72%,rgba(255,255,255,0.10)_0_1px,transparent_2px)] before:bg-[length:86px_86px,122px_122px,68px_68px] before:opacity-70">
          <main className="relative z-[1] overflow-hidden rounded-3xl border border-white/25 bg-[linear-gradient(180deg,rgba(255,255,255,0.10),rgba(255,255,255,0.035)),radial-gradient(circle_at_50%_0%,rgba(229,37,49,0.32),transparent_45%)] px-4 py-6 text-white shadow-[0_24px_70px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.16)] before:pointer-events-none before:absolute before:inset-0 before:bg-[linear-gradient(135deg,rgba(255,255,255,0.22),transparent_30%,rgba(225,31,45,0.18))] before:opacity-70">
            <h2 className="relative z-[1] mb-2.5 text-center text-[22px] font-black uppercase leading-[1.12] tracking-[0.0125em]">
              {infoEvent.headline || 'Đăng ký tham dự'}
              {header.subtitleText ? <small className="mt-1 block text-xs font-black uppercase tracking-[0.12em] text-[var(--lp-red-3)]">{header.subtitleText}</small> : null}
            </h2>
            {(infoEvent.motto || infoEvent.organizerText || infoEvent.bottomText) && (
              <p className="relative z-[1] mb-[18px] text-center text-xs leading-[1.45] text-white/80">
                {[infoEvent.motto, infoEvent.organizerText, infoEvent.bottomText].filter(Boolean).join(' ')}
              </p>
            )}

            <form className="relative z-[1]" onSubmit={handleSubmit} noValidate>
              {visibleFields.map((field) => (
                <div key={field.key} className="mb-[13px]">
                  <label htmlFor={field.key} className="mb-2 ml-1 block text-[13px] font-extrabold leading-none text-white">
                    {field.label} {field.required ? <span className="text-[var(--lp-red-3)]">*</span> : null}
                  </label>
                  {renderInputField(field, formValues[field.key] ?? '', handleInputChange)}
                </div>
              ))}

              {Object.entries(event.config.fields.hidden)
                .filter(([, config]) => config.enabled && !config.visible)
                .map(([fieldKey]) => (
                  <input key={fieldKey} type="hidden" name={fieldKey} value={formValues[fieldKey] ?? ''} readOnly />
                ))}

              <div className="mt-5 flex items-center justify-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex h-12 w-full max-w-[250px] items-center justify-center gap-2.5 rounded-full border-0 bg-[linear-gradient(90deg,#851017,#e32735_50%,#a1131c)] text-[15px] font-black uppercase text-white shadow-[0_14px_30px_rgba(226,39,53,0.34),inset_0_1px_0_rgba(255,255,255,0.24)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <span className="grid h-7 w-7 place-items-center rounded-full border border-white/20 bg-white/20 text-base leading-none">→</span>
                  <span>{isSubmitting ? 'Đang gửi...' : 'Đăng ký'}</span>
                </button>
              </div>
            </form>
          </main>
        </section>

        <footer
          className="relative flex min-h-[120px] flex-col items-center justify-center border-t border-white/10 px-4 pb-10 pt-8 text-white before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_18%_24%,rgba(255,255,255,0.12)_0_1px,transparent_2px),radial-gradient(circle_at_82%_18%,rgba(236,74,81,0.22)_0_2px,transparent_3px),radial-gradient(circle_at_74%_72%,rgba(255,255,255,0.10)_0_1px,transparent_2px)] before:bg-[length:86px_86px,122px_122px,68px_68px] before:opacity-70"
          style={footerStyle}
        >
          {logoUrls.length > 0 && (
            <div className={footerLogoGridClassName}>
              {logoUrls.map((logoUrl, index) => (
                <span
                  key={`${logoUrl}-${index}`}
                  className={joinClassNames(
                    'flex h-[58px] min-w-0 items-center justify-center',
                    logoUrls.length === 1 ? 'w-full max-w-[220px]' : '',
                  )}
                >
                  <img src={logoUrl} alt={`Logo sự kiện ${index + 1}`} className="max-h-10 w-full object-contain" />
                </span>
              ))}
            </div>
          )}

          {(footer.placeName || footer.placeLine1 || footer.placeLine2 || footer.timeText) && (
            <div className="relative z-[1] w-full max-w-[360px] rounded-2xl p-2 text-center text-xs font-bold leading-[18px] text-white/80">
              {footer.placeName ? <h3 className="mb-1 text-base font-black text-white">{footer.placeName}</h3> : null}
              {footer.placeLine1 ? <div>{footer.placeLine1}</div> : null}
              {footer.placeLine2 ? <div>{footer.placeLine2}</div> : null}
              {footer.timeText ? <div>Thời gian: {[date, year].filter(Boolean).join('/')} - {footer.timeText}</div> : null}
            </div>
          )}

          {footer.template2FooterText ? (
            <p className="relative z-[1] mt-3 w-full max-w-[360px] whitespace-pre-line rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-center text-[11px] font-semibold leading-[17px] text-white/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              {footer.template2FooterText}
            </p>
          ) : null}
        </footer>
      </div>

      <section
        className={joinClassNames(
          'fixed inset-0 z-[100] place-items-center bg-black/70 px-5 backdrop-blur-md',
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
        <div className="w-full max-w-[340px] rounded-[22px] bg-white px-5 py-6 text-center text-[#2b0709] shadow-[0_24px_70px_rgba(0,0,0,0.42)]">
          <div className={joinClassNames('mx-auto mb-3 grid h-[58px] w-[58px] place-items-center rounded-full text-3xl font-black text-white', modalState.type === 'success' ? 'bg-[linear-gradient(180deg,#e32735,#911018)]' : 'bg-[#333]')}>
            {modalState.type === 'success' ? '✓' : '!'}
          </div>
          <h3 className="mb-2 text-xl font-black text-[#97121a]">{modalState.title}</h3>
          <p className="mb-[18px] text-[13px] leading-[1.4] text-[#5a3639]">{modalState.message}</p>
          <button type="button" className="h-10 min-w-28 rounded-full bg-[linear-gradient(90deg,#8d1119,#df2633)] px-[18px] font-black text-white" onClick={closeModal}>
            Đã hiểu
          </button>
        </div>
      </section>
    </section>
  );
}
