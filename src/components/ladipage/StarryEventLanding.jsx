'use client';

import { ArrowRight, CalendarDays, Clock3, MapPin } from 'lucide-react';
import EventLandingField from './EventLandingField.jsx';
import EventLandingModal from './EventLandingModal.jsx';
import useEventLandingForm from './useEventLandingForm.js';
import { joinClassNames, splitDateParts } from '../../lib/ladipage/eventLandingForm.js';

const STARFIELD_CLASS =
  'pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_24%,rgba(255,255,255,0.16)_0_1px,transparent_2px),radial-gradient(circle_at_82%_18%,var(--lp-accent)_0_1.5px,transparent_3px),radial-gradient(circle_at_74%_72%,rgba(255,255,255,0.12)_0_1px,transparent_2px)] bg-[length:86px_86px,122px_122px,68px_68px] opacity-60';

const FIELD_LABEL_CLASS = 'mb-2 block text-[12px] font-bold uppercase tracking-[0.14em] text-white/80';
const FIELD_CONTROL_CLASS =
  'h-12 w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 text-[14px] font-semibold text-white outline-none transition duration-200 placeholder:font-normal placeholder:text-white/35 focus:border-[color:var(--lp-accent)] focus:bg-white/10 focus:ring-4 focus:ring-white/10';

function StatTile({ icon, label, value }) {
  return (
    <div className="flex min-h-[86px] min-w-0 flex-col items-center justify-center gap-1.5 rounded-2xl border border-white/12 bg-white/[0.06] px-2 py-3 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
      {icon}
      <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/45">{label}</span>
      <strong className="line-clamp-2 text-[15px] font-black leading-tight">{value}</strong>
    </div>
  );
}

function getAgendaItems(event) {
  const enabledQuestions = (event.config.questions ?? []).filter((question) => question?.enabled);
  const fallbackItems = [
    event.config.infoEvent.headline,
    event.config.infoEvent.motto,
    event.config.infoEvent.organizerText,
  ].filter(Boolean);
  const items = enabledQuestions.length ? enabledQuestions.map((question) => question.label) : fallbackItems;

  return items.slice(0, 3);
}

export default function StarryEventLanding({ event }) {
  const {
    visibleFields,
    hiddenFieldKeys,
    formValues,
    isSubmitting,
    modalState,
    closeModal,
    handleInputChange,
    handleSubmit,
  } = useEventLandingForm(event);

  const { theme, header, footer, infoEvent } = event.config;
  const title = event.eventName || header.titleText;
  const { date, year } = splitDateParts(footer);
  const agendaItems = getAgendaItems(event);
  const logoUrls = [infoEvent.logo1Url, infoEvent.logo2Url, infoEvent.logo3Url].filter(Boolean);
  const badgeText = header.descText || infoEvent.topText;
  const introText = [infoEvent.motto, infoEvent.organizerText, infoEvent.bottomText]
    .filter(Boolean)
    .join(' ');

  const pageStyle = {
    '--lp-bg': theme.bg || '#070405',
    '--lp-primary': theme.primary || '#c4212b',
    '--lp-primary2': theme.primary2 || '#8d1119',
    '--lp-accent': theme.muted || '#ffd7a2',
    '--lp-footer-from': footer.gradientFrom || '#0a0304',
    '--lp-footer-to': footer.gradientTo || '#180608',
    '--lp-footer-text': footer.textColor || '#ffffff',
  };

  return (
    <section
      className="relative min-h-screen overflow-x-hidden bg-[#040203] py-0 text-white sm:py-10"
      style={pageStyle}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60rem_36rem_at_50%_0%,var(--lp-primary),transparent_58%)] opacity-25"
      />

      <div className="relative mx-auto w-full max-w-[440px] overflow-hidden bg-[var(--lp-bg)] shadow-[0_0_100px_rgba(0,0,0,0.7)] sm:rounded-[32px] sm:ring-1 sm:ring-white/10">
        <div className="relative bg-[#050303]">
          {header.headingImageUrl ? (
            <img
              src={header.headingImageUrl}
              alt={header.headingAlt || title}
              className="block aspect-[4/5] w-full object-cover"
            />
          ) : (
            <div className="px-6 py-20 text-center text-[2rem] font-black uppercase leading-[1.02] tracking-[-0.035em]">
              {title}
            </div>
          )}

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-[linear-gradient(180deg,transparent,var(--lp-bg)_82%)]"
          />
        </div>

        <section className="relative -mt-6 bg-[linear-gradient(180deg,var(--lp-bg),#150607_58%,var(--lp-bg))] px-5 pb-7 pt-2">
          <div aria-hidden="true" className={STARFIELD_CLASS} />

          <div className="relative">
            {badgeText ? (
              <div className="mx-auto mb-4 w-max max-w-full rounded-full border border-white/20 bg-[linear-gradient(90deg,var(--lp-primary2),var(--lp-primary))] px-5 py-2 text-center text-[11px] font-black uppercase tracking-[0.1em] shadow-[0_0_36px_-8px_var(--lp-primary)]">
                {badgeText}
              </div>
            ) : null}

            <h1 className="mx-auto mb-6 max-w-[24rem] text-center text-[22px] font-black uppercase leading-[1.2] tracking-[-0.02em]">
              {title}
            </h1>

            <div className="grid grid-cols-3 gap-2.5">
              <StatTile
                icon={<CalendarDays className="h-3.5 w-3.5 shrink-0 text-[color:var(--lp-accent)]" />}
                label="Ngày"
                value={date}
              />
              <StatTile
                icon={<Clock3 className="h-3.5 w-3.5 shrink-0 text-[color:var(--lp-accent)]" />}
                label="Giờ"
                value={footer.timeText || '--'}
              />
              <StatTile
                icon={<MapPin className="h-3.5 w-3.5 shrink-0 text-[color:var(--lp-accent)]" />}
                label="Địa điểm"
                value={footer.placeName || 'SRX'}
              />
            </div>

            {agendaItems.length ? (
              <ul className="mt-6 space-y-0">
                {agendaItems.map((item, index) => (
                  <li
                    key={`${item}-${index + 1}`}
                    className="grid grid-cols-[2.6rem_1fr] items-start gap-3 border-b border-white/10 py-3.5 last:border-b-0"
                  >
                    <b className="text-[26px] font-black leading-none tracking-[-0.05em] text-[color:var(--lp-accent)]">
                      {String(index + 1).padStart(2, '0')}
                    </b>
                    <span className="text-[13px] leading-6 text-white/80">{item}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </section>

        <section className="relative bg-[linear-gradient(180deg,var(--lp-bg),#210609_46%,var(--lp-bg))] px-5 py-8">
          <div aria-hidden="true" className={STARFIELD_CLASS} />

          <main className="relative overflow-hidden rounded-3xl border border-white/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.09),rgba(255,255,255,0.03))] px-5 py-7 shadow-[0_30px_70px_-30px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.14)]">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(20rem_10rem_at_50%_0%,var(--lp-primary),transparent_70%)] opacity-40"
            />

            <div className="relative">
              <h2 className="text-center text-[21px] font-black uppercase leading-[1.16] tracking-[0.01em]">
                {infoEvent.headline || 'Đăng ký tham dự'}
              </h2>

              {header.subtitleText ? (
                <p className="mt-2 text-center text-[11px] font-black uppercase tracking-[0.16em] text-[color:var(--lp-accent)]">
                  {header.subtitleText}
                </p>
              ) : null}

              {introText ? (
                <p className="mx-auto mt-4 max-w-[22rem] text-center text-[12.5px] leading-6 text-white/65">
                  {introText}
                </p>
              ) : null}

              <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
                {visibleFields.map((field) => (
                  <EventLandingField
                    key={field.key}
                    field={field}
                    value={formValues[field.key] ?? ''}
                    onChange={handleInputChange}
                    labelClassName={FIELD_LABEL_CLASS}
                    requiredMarkClassName="text-[color:var(--lp-accent)]"
                    controlClassName={FIELD_CONTROL_CLASS}
                    chevronClassName="text-white/45"
                  />
                ))}

                {hiddenFieldKeys.map((fieldKey) => (
                  <input
                    key={fieldKey}
                    type="hidden"
                    name={fieldKey}
                    value={formValues[fieldKey] ?? ''}
                    readOnly
                  />
                ))}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group mt-2 flex w-full items-center justify-center gap-3 rounded-full bg-[linear-gradient(90deg,var(--lp-primary2),var(--lp-primary)_52%,var(--lp-primary2))] py-4 text-[15px] font-black uppercase tracking-[0.06em] text-white shadow-[0_18px_36px_-16px_var(--lp-primary),inset_0_1px_0_rgba(255,255,255,0.25)] transition duration-300 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? 'Đang gửi...' : 'Đăng ký ngay'}
                  <ArrowRight className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </form>
            </div>
          </main>
        </section>

        <footer className="relative flex flex-col items-center border-t border-white/10 bg-[linear-gradient(180deg,var(--lp-footer-from),var(--lp-footer-to)_62%,#040203)] px-5 pb-10 pt-8 text-[color:var(--lp-footer-text)]">
          <div aria-hidden="true" className={STARFIELD_CLASS} />

          {logoUrls.length ? (
            <div
              className={joinClassNames(
                'relative mb-6 grid w-full max-w-[22rem] items-center gap-4',
                logoUrls.length === 1 ? 'grid-cols-1 justify-items-center' : '',
                logoUrls.length === 2 ? 'grid-cols-2' : '',
                logoUrls.length >= 3 ? 'grid-cols-3' : '',
              )}
            >
              {logoUrls.map((logoUrl, index) => (
                <img
                  key={logoUrl}
                  src={logoUrl}
                  alt={`Logo sự kiện ${index + 1}`}
                  className="mx-auto max-h-10 w-full object-contain"
                />
              ))}
            </div>
          ) : null}

          {footer.placeName || footer.placeLine1 || footer.placeLine2 || footer.timeText ? (
            <div className="relative w-full max-w-[22rem] text-center">
              {footer.placeName ? (
                <h3 className="text-[16px] font-black leading-tight">{footer.placeName}</h3>
              ) : null}

              {footer.placeLine1 || footer.placeLine2 ? (
                <p className="mt-2 text-[12.5px] font-semibold leading-6 opacity-70">
                  {[footer.placeLine1, footer.placeLine2].filter(Boolean).join(' — ')}
                </p>
              ) : null}

              {footer.timeText ? (
                <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-4 py-2 text-[12px] font-bold">
                  <Clock3 className="h-3.5 w-3.5 shrink-0 text-[color:var(--lp-accent)]" />
                  {[date, year].filter(Boolean).join('/')} · {footer.timeText}
                </p>
              ) : null}
            </div>
          ) : null}

          {footer.template2FooterText ? (
            <p className="relative mt-6 w-full max-w-[22rem] whitespace-pre-line rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-4 text-center text-[11.5px] font-semibold leading-[1.7] opacity-75">
              {footer.template2FooterText}
            </p>
          ) : null}
        </footer>
      </div>

      <EventLandingModal state={modalState} onClose={closeModal} variant="starry" />
    </section>
  );
}
