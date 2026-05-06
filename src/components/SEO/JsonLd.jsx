function serializeJsonLd(data) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export default function JsonLd({ data, idPrefix = 'jsonld' }) {
  const items = Array.isArray(data) ? data.filter(Boolean) : [data].filter(Boolean);

  return items.map((item, index) => (
    <script
      key={`${idPrefix}-${index + 1}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(item) }}
    />
  ));
}
