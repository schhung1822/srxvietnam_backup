import DefaultEventLanding from './DefaultEventLanding.jsx';
import StarryEventLanding from './StarryEventLanding.jsx';

const templateRegistry = {
  default: DefaultEventLanding,
  starry: StarryEventLanding,
};

export default function EventLandingRenderer({ event }) {
  const TemplateComponent = templateRegistry[event.templateStyle] || templateRegistry.default;

  return <TemplateComponent event={event} />;
}
