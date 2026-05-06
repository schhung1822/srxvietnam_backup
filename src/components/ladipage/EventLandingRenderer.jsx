import DefaultEventLanding from './DefaultEventLanding.jsx';

const templateRegistry = {
  default: DefaultEventLanding,
};

export default function EventLandingRenderer({ event }) {
  const TemplateComponent = templateRegistry[event.templateStyle] || templateRegistry.default;

  return <TemplateComponent event={event} />;
}
