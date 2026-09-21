import DefaultEventLanding from './DefaultEventLanding.jsx';
import StarryEventLanding from './StarryEventLanding.jsx';
import EventLandingVisitTracker from './EventLandingVisitTracker.jsx';

const templateRegistry = {
  default: DefaultEventLanding,
  starry: StarryEventLanding,
};

export default function EventLandingRenderer({ event }) {
  const TemplateComponent = templateRegistry[event.templateStyle] || templateRegistry.default;

  return (
    <>
      <EventLandingVisitTracker eventId={event.id} slug={event.slug} />
      <TemplateComponent event={event} />
    </>
  );
}
