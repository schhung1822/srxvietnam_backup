'use client';

import { ArrowRight, CalendarDays, Clock3, MapPin, ShieldCheck, Sparkles } from 'lucide-react';
import EventLandingField from './EventLandingField.jsx';
import EventLandingModal from './EventLandingModal.jsx';
import useEventLandingForm from './useEventLandingForm.js';
import { joinClassNames, splitDateParts } from '../../lib/ladipage/eventLandingForm.js';

const BUBBLES = [
  '-left-24 -top-10 h-48 w-48 animate-lp-bubble',
  '-right-16 top-20 h-36 w-36 animate-lp-bubble-alt [animation-delay:-2s]',
  '-left-20 bottom-52 h-32 w-32 animate-lp-bubble [animation-delay:-4s]',
  'bottom-4 right-2 h-44 w-44 animate-lp-bubble-alt [animation-delay:-1.5s]',
  'left-[74%] top-[42%] h-20 w-20 animate-lp-bubble [animation-delay:-5s]',
  'left-[14%] top-[20%] h-[4.5rem] w-[4.5rem] animate-lp-bubble-alt [animation-delay:-6.5s]',
  '-right-8 top-[54%] h-28 w-28 animate-lp-bubble [animation-delay:-3.6s]',
];

const FIELD_LABEL_CLASS =
  'mb-2 block text-[12px] font-bold uppercase tracking-[0.14em] text-[color:var(--lp-text)]';
const FIELD_CONTROL_CLASS =
  'w-full rounded-2xl border border-black/[0.07] bg-white px-4 py-3.5 text-[15px] text-[color:var(--lp-text)] shadow-[inset_0_1px_2px_rgba(16,18,40,0.05)] outline-none transition duration-200 placeholder:text-[color:var(--lp-muted)] focus:border-[color:var(--lp-primary)] focus:ring-4 focus:ring-[color:var(--lp-ring)]';

function DressDot({ color }) {
  return (
    <span
      className="h-7 w-7 rounded-full border border-white/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]"
      style={{ background: color }}
    />
  );
}

function DetailTile({ icon, label, children }) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-2 rounded-2xl border border-white/25 bg-white/12 px-4 py-5 text-center backdrop-blur-sm">
      <span className="grid h-9 w-9 place-items-center rounded-full bg-white/20">{icon}</span>
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-70">{label}</span>
      <div className="min-w-0 leading-tight">{children}</div>
    </div>
  );
}

export default function DefaultEventLanding({ event }) {
  const {
    visibleFields,
    hiddenFieldKeys,
    formValues,
    isSubmitting,
    statusText,
    modalState,
    closeModal,
    handleInputChange,
    handleSubmit,
  } = useEventLandingForm(event, {
    successMessage: `SRX Việt Nam đã nhận thông tin tham dự ${event.eventName}. Chúng tôi sẽ liên hệ với bạn nếu cần xác nhận thêm.`,
  });

  const { theme, header, footer, infoEvent } = event.config;
  const primaryTitle = header.titleText || event.eventName;
  const { day, month, year } = splitDateParts(footer);
  const logoUrls = [infoEvent.logo1Url, infoEvent.logo2Url, infoEvent.logo3Url].filter(Boolean);
  const hasInfoSection =
    infoEvent.topText || infoEvent.headline || infoEvent.motto || infoEvent.organizerText;
  const hasDetailSection = footer.placeName || day || footer.timeText;

  const pageStyle = {
    '--lp-bg': theme.bg,
    '--lp-card': theme.card,
    '--lp-ring': theme.ring,
    '--lp-text': theme.text,
    '--lp-muted': theme.muted,
    '--lp-primary': theme.primary,
    '--lp-primary2': theme.primary2,
    '--lp-footer-from': footer.gradientFrom,
    '--lp-footer-to': footer.gradientTo,
    '--lp-footer-text': footer.textColor,
  };

  return (
    <section
      className="relative min-h-screen overflow-hidden bg-[var(--lp-bg)] px-4 pb-16 pt-10 text-[color:var(--lp-text)] sm:px-6"
      style={pageStyle}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(46rem_26rem_at_10%_-4%,var(--lp-primary2),transparent_62%),radial-gradient(40rem_24rem_at_92%_88%,var(--lp-primary),transparent_58%)] opacity-[0.22]"
      />

      <div className="relative z-10 mx-auto w-full max-w-[620px]">
        {BUBBLES.map((bubbleClassName) => (
          <div
            key={bubbleClassName}
            aria-hidden="true"
            className={joinClassNames(
              'pointer-events-none absolute rounded-full bg-[radial-gradient(circle_at_28%_26%,rgba(255,255,255,0.95),rgba(255,255,255,0.55)_30%,rgba(255,255,255,0.12)_48%,var(--lp-primary)_72%,transparent_84%)] opacity-60 shadow-[inset_-16px_-12px_28px_rgba(255,255,255,0.35),0_26px_50px_rgba(16,18,40,0.08)]',
              bubbleClassName,
            )}
          >
            <span className="absolute left-[20%] top-[16%] h-[26%] w-[26%] rounded-full bg-white/70 blur-[2px]" />
          </div>
        ))}

        <header className="relative z-10 mb-7 text-center">
          {header.headingImageUrl ? (
            <img
              src={header.headingImageUrl}
              alt={header.headingAlt || primaryTitle}
              className="mx-auto mb-5 block w-full max-w-[22rem] drop-shadow-[0_24px_42px_rgba(16,18,40,0.12)]"
            />
          ) : (
            <h1 className="mx-auto mb-5 max-w-[30rem] text-[clamp(2rem,7vw,3.4rem)] font-extrabold leading-[1.02] tracking-[-0.04em]">
              {primaryTitle}
            </h1>
          )}

          {header.descText ? (
            <p className="mx-auto inline-flex max-w-full items-center gap-2 rounded-full border border-white/60 bg-white/70 px-5 py-2.5 text-[13px] font-bold text-[color:var(--lp-primary)] shadow-[0_12px_30px_-18px_rgba(16,18,40,0.5)] backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 shrink-0" />
              {header.descText}
            </p>
          ) : null}
        </header>

        <main className="relative overflow-hidden rounded-[30px] border border-white/60 bg-[var(--lp-card)] shadow-[0_40px_90px_-50px_rgba(16,18,40,0.55)] backdrop-blur-xl">
          <div className="relative overflow-hidden bg-[linear-gradient(135deg,var(--lp-primary2),var(--lp-primary))] px-6 py-7 text-white sm:px-8">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(255,255,255,0.28),transparent_42%)]"
            />
            <div className="relative">
              {header.headingImageUrl ? (
                <h1 className="text-center text-[clamp(1.4rem,4.4vw,1.9rem)] font-bold uppercase leading-[1.12] tracking-[-0.03em]">
                  {primaryTitle}
                </h1>
              ) : (
                <p className="text-center text-[11px] font-bold uppercase tracking-[0.24em] opacity-80">
                  Đăng ký tham dự
                </p>
              )}

              {header.subtitleText ? (
                <p className="mx-auto mt-3 max-w-[28rem] text-center text-[14px] leading-6 text-white/85">
                  {header.subtitleText}
                </p>
              ) : null}
            </div>
          </div>

          <form className="space-y-4 px-5 py-6 sm:px-8 sm:py-8" onSubmit={handleSubmit} noValidate>
            {visibleFields.map((field) => (
              <EventLandingField
                key={field.key}
                field={field}
                value={formValues[field.key] ?? ''}
                onChange={handleInputChange}
                labelClassName={FIELD_LABEL_CLASS}
                requiredMarkClassName="text-[color:var(--lp-primary)]"
                controlClassName={FIELD_CONTROL_CLASS}
                chevronClassName="text-[color:var(--lp-muted)]"
              />
            ))}

            {hiddenFieldKeys.map((fieldKey) => (
              <input key={fieldKey} type="hidden" name={fieldKey} value={formValues[fieldKey] ?? ''} readOnly />
            ))}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-[linear-gradient(135deg,var(--lp-primary),var(--lp-primary2))] px-6 py-4 text-[15px] font-extrabold text-white shadow-[0_20px_40px_-20px_rgba(16,18,40,0.7)] transition duration-300 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span className="pointer-events-none absolute inset-0 -translate-x-[120%] bg-[linear-gradient(120deg,transparent_15%,rgba(255,255,255,0.28)_48%,transparent_78%)] transition-transform duration-700 group-hover:translate-x-[120%]" />
                <span className="relative">{isSubmitting ? 'Đang gửi...' : 'Gửi thông tin đăng ký'}</span>
                <ArrowRight className="relative h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
              </button>

              <span className="mt-3 block min-h-5 text-center text-[13px] text-[color:var(--lp-muted)]">
                {statusText || ' '}
              </span>
            </div>
          </form>

          <div className="flex items-start gap-2.5 border-t border-black/[0.06] px-5 py-5 text-[12px] leading-5 text-[color:var(--lp-muted)] sm:px-8">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--lp-primary)]" />
            <p>
              Bằng việc gửi thông tin, bạn đồng ý để SRX Việt Nam liên hệ nhằm xác nhận đăng ký và hỗ trợ các
              nội dung liên quan đến sự kiện.
            </p>
          </div>
        </main>

        {hasInfoSection ? (
          <section className="relative z-10 mt-12 text-center">
            {infoEvent.topText ? (
              <p className="mb-4 inline-flex items-center rounded-full border border-white/60 bg-white/70 px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[color:var(--lp-primary)] backdrop-blur-md">
                {infoEvent.topText}
              </p>
            ) : null}

            {infoEvent.headline ? (
              <h2 className="text-[clamp(1.7rem,5.4vw,2.5rem)] font-extrabold leading-[1.04] tracking-[-0.04em] text-[color:var(--lp-primary)]">
                {infoEvent.headline}
              </h2>
            ) : null}

            {infoEvent.motto ? (
              <p className="mx-auto mt-4 max-w-[32rem] text-[16px] font-bold leading-7 text-[color:var(--lp-primary)]">
                {infoEvent.motto}
              </p>
            ) : null}

            {infoEvent.organizerText ? (
              <p className="mx-auto mt-3 max-w-[32rem] text-[15px] leading-7 text-[color:var(--lp-text)] opacity-80">
                {infoEvent.organizerText}
              </p>
            ) : null}

            {logoUrls.length ? (
              <div className="mt-7 flex flex-wrap items-center justify-center gap-x-8 gap-y-5">
                {logoUrls.map((logoUrl, index) => (
                  <img
                    key={logoUrl}
                    src={logoUrl}
                    alt={`Logo đơn vị tổ chức ${index + 1}`}
                    className="max-h-14 w-auto max-w-[min(9rem,40vw)] object-contain"
                  />
                ))}
              </div>
            ) : null}

            {infoEvent.bottomText ? (
              <p className="mx-auto mt-6 max-w-[30rem] text-[14px] leading-7 text-[color:var(--lp-text)] opacity-75">
                {infoEvent.bottomText}
              </p>
            ) : null}
          </section>
        ) : null}

        {hasDetailSection ? (
          <footer
            className="relative z-10 mt-12 overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,var(--lp-footer-from),var(--lp-footer-to))] text-[color:var(--lp-footer-text)] shadow-[0_36px_70px_-40px_rgba(16,18,40,0.75)]"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_12%,rgba(255,255,255,0.26),transparent_38%)]"
            />

            <div className="relative grid gap-3 p-5 sm:grid-cols-3 sm:p-6">
              <DetailTile icon={<CalendarDays className="h-4 w-4" />} label="Ngày diễn ra">
                <div className="flex items-baseline justify-center gap-1.5">
                  <span className="text-[2rem] font-extrabold leading-none">{day || '--'}</span>
                  <span className="text-[13px] font-bold opacity-90">
                    /{month || '--'}
                    {year ? `/${year}` : ''}
                  </span>
                </div>
              </DetailTile>

              <DetailTile icon={<Clock3 className="h-4 w-4" />} label="Thời gian">
                <span className="text-[17px] font-bold">{footer.timeText || 'Đang cập nhật'}</span>
              </DetailTile>

              <DetailTile icon={<MapPin className="h-4 w-4" />} label="Địa điểm">
                <span className="block text-[15px] font-bold leading-snug">
                  {footer.placeName || 'Đang cập nhật'}
                </span>
                {footer.placeLine1 ? (
                  <span className="mt-1 block text-[12px] leading-5 opacity-80">{footer.placeLine1}</span>
                ) : null}
                {footer.placeLine2 ? (
                  <span className="block text-[12px] leading-5 opacity-80">{footer.placeLine2}</span>
                ) : null}
              </DetailTile>
            </div>

            {footer.dressCodeTitle || footer.dressCodeDesc ? (
              <div className="relative flex flex-col gap-4 border-t border-white/20 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div className="min-w-0">
                  {footer.dressCodeTitle ? (
                    <div className="text-[17px] font-extrabold leading-tight">{footer.dressCodeTitle}</div>
                  ) : null}
                  {footer.dressCodeDesc ? (
                    <p className="mt-1.5 max-w-[30rem] text-[13px] leading-6 opacity-85">
                      {footer.dressCodeDesc}
                    </p>
                  ) : null}
                </div>

                <div className="flex shrink-0 items-center gap-2.5">
                  <DressDot color={footer.dressDots.white} />
                  <DressDot color={footer.dressDots.whitePink} />
                  <DressDot color={footer.dressDots.pink} />
                  <DressDot color={footer.dressDots.black} />
                </div>
              </div>
            ) : null}
          </footer>
        ) : null}
      </div>

      <EventLandingModal state={modalState} onClose={closeModal} variant="default" />
    </section>
  );
}
