import { getMissingDatabaseEnvNames, hasDatabaseConfig, query } from './db.js';

let hasWarnedAboutMissingDbConfig = false;

const defaultTheme = {
  bg: '#f6efe8',
  card: 'rgba(255,255,255,0.94)',
  ring: 'rgba(126, 92, 60, 0.24)',
  text: '#2b2118',
  muted: '#8a7360',
  primary: '#6b4b3a',
  primary2: '#c59d76',
};

const defaultFieldConfigs = {
  full_name: {
    label: 'Họ và tên',
    enabled: true,
    required: true,
    placeholder: 'Nhập họ và tên của bạn',
  },
  phone: {
    label: 'Số điện thoại',
    enabled: true,
    required: true,
    placeholder: 'Nhập số điện thoại',
  },
  email: {
    label: 'Email',
    enabled: true,
    required: false,
    placeholder: 'Nhập email của bạn',
  },
};

function normalizeText(value, fallback = '') {
  const normalized = String(value ?? '').trim();
  return normalized || fallback;
}

function toBoolean(value, fallback = false) {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    return value !== 0;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();

    if (['1', 'true', 'yes', 'on'].includes(normalized)) {
      return true;
    }

    if (['0', 'false', 'no', 'off'].includes(normalized)) {
      return false;
    }
  }

  return fallback;
}

function parseJsonObject(value) {
  if (!value) {
    return {};
  }

  if (typeof value === 'object' && !Array.isArray(value)) {
    return value;
  }

  if (typeof value === 'string') {
    try {
      const parsedValue = JSON.parse(value);
      return typeof parsedValue === 'object' && parsedValue && !Array.isArray(parsedValue)
        ? parsedValue
        : {};
    } catch {
      return {};
    }
  }

  return {};
}

function prettifyFieldName(key) {
  const normalized = normalizeText(key);

  if (!normalized) {
    return 'Thông tin bổ sung';
  }

  return normalized
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function normalizeTheme(theme = {}) {
  return {
    bg: normalizeText(theme.bg, defaultTheme.bg),
    card: normalizeText(theme.card, defaultTheme.card),
    ring: normalizeText(theme.ring, defaultTheme.ring),
    text: normalizeText(theme.text, defaultTheme.text),
    muted: normalizeText(theme.muted, defaultTheme.muted),
    primary: normalizeText(theme.primary, defaultTheme.primary),
    primary2: normalizeText(theme.primary2, defaultTheme.primary2),
  };
}

function normalizeFieldConfig(fieldConfig = {}, fallbackConfig) {
  return {
    label: normalizeText(fieldConfig.label, fallbackConfig.label),
    enabled: toBoolean(fieldConfig.enabled, fallbackConfig.enabled),
    required: toBoolean(fieldConfig.required, fallbackConfig.required),
    placeholder: normalizeText(fieldConfig.placeholder, fallbackConfig.placeholder),
  };
}

function normalizeSelectOptions(options) {
  if (!Array.isArray(options)) {
    return [];
  }

  return options.map((option) => normalizeText(option)).filter(Boolean);
}

function normalizeCustomFields(hiddenFieldConfigs = {}) {
  return Object.fromEntries(
    Object.entries(parseJsonObject(hiddenFieldConfigs)).map(([key, value]) => {
      const config = parseJsonObject(value);

      return [
        key,
        {
          label: normalizeText(config.label, prettifyFieldName(key)),
          enabled: toBoolean(config.enabled, false),
          required: toBoolean(config.required, false),
          visible: toBoolean(config.visible ?? config.display, false),
          placeholder: normalizeText(config.placeholder),
          type: normalizeText(config.type, 'text').toLowerCase(),
          options: normalizeSelectOptions(config.options),
        },
      ];
    }),
  );
}

function normalizeQuestions(questions) {
  if (!Array.isArray(questions)) {
    return [];
  }

  return questions.map((question, index) => {
    const config = parseJsonObject(question);

    return {
      id: normalizeText(config.id, `question_${index + 1}`),
      type: normalizeText(config.type, 'text').toLowerCase(),
      label: normalizeText(config.label, `Câu hỏi ${index + 1}`),
      enabled: toBoolean(config.enabled, false),
      required: toBoolean(config.required, false),
      placeholder: normalizeText(config.placeholder),
      options: normalizeSelectOptions(config.options),
    };
  });
}

function normalizeEventConfig(row) {
  const rawPublishedConfig = parseJsonObject(row.published_config_json);
  const rawDraftConfig = parseJsonObject(row.config_json);
  const rawConfig =
    Object.keys(rawPublishedConfig).length > 0 ? rawPublishedConfig : rawDraftConfig;

  const theme = normalizeTheme(rawConfig.theme);
  const rawFields = parseJsonObject(rawConfig.fields);
  const header = parseJsonObject(rawConfig.header);
  const footer = parseJsonObject(rawConfig.footer);
  const infoEvent = parseJsonObject(rawConfig.infoEvent);
  const behavior = parseJsonObject(rawConfig.behavior);

  return {
    theme,
    fields: {
      full_name: normalizeFieldConfig(rawFields.full_name, defaultFieldConfigs.full_name),
      phone: normalizeFieldConfig(rawFields.phone, defaultFieldConfigs.phone),
      email: normalizeFieldConfig(rawFields.email, defaultFieldConfigs.email),
      hidden: normalizeCustomFields(rawFields.hidden),
    },
    header: {
      descText: normalizeText(header.descText),
      titleText: normalizeText(header.titleText, normalizeText(row.event_name, normalizeText(row.name))),
      headingAlt: normalizeText(header.headingAlt, normalizeText(row.event_name, normalizeText(row.name))),
      subtitleText: normalizeText(header.subtitleText),
      headingImageUrl: normalizeText(header.headingImageUrl),
    },
    footer: {
      dateDay: normalizeText(footer.dateDay),
      dateMonth: normalizeText(footer.dateMonth),
      dateYear: normalizeText(footer.dateYear),
      timeText: normalizeText(footer.timeText),
      placeName: normalizeText(footer.placeName),
      placeLine1: normalizeText(footer.placeLine1),
      placeLine2: normalizeText(footer.placeLine2),
      textColor: normalizeText(footer.textColor, '#ffffff'),
      gradientFrom: normalizeText(footer.gradientFrom, theme.primary2),
      gradientTo: normalizeText(footer.gradientTo, theme.primary),
      dressCodeTitle: normalizeText(footer.dressCodeTitle),
      dressCodeDesc: normalizeText(footer.dressCodeDesc),
      dressDots: {
        pink: normalizeText(footer.dressDots?.pink, '#d34c87'),
        black: normalizeText(footer.dressDots?.black, '#111111'),
        white: normalizeText(footer.dressDots?.white, '#ffffff'),
        whitePink: normalizeText(footer.dressDots?.whitePink, '#f9d7eb'),
      },
    },
    infoEvent: {
      topText: normalizeText(infoEvent.topText),
      headline: normalizeText(infoEvent.headline),
      motto: normalizeText(infoEvent.motto),
      organizerText: normalizeText(infoEvent.organizerText),
      bottomText: normalizeText(infoEvent.bottomText),
      logo1Url: normalizeText(infoEvent.logo1Url),
      logo2Url: normalizeText(infoEvent.logo2Url),
    },
    behavior: {
      source: normalizeText(behavior.source, 'event-landing-page'),
      eventName: normalizeText(
        behavior.eventName,
        normalizeText(row.event_name, normalizeText(row.name, 'Sự kiện SRX Việt Nam')),
      ),
      prefillKeys:
        typeof behavior.prefillKeys === 'object' && behavior.prefillKeys ? behavior.prefillKeys : {},
      readUserIdFromQueryKey: normalizeText(behavior.readUserIdFromQueryKey),
    },
    questions: normalizeQuestions(rawConfig.questions),
    webhookUrl: normalizeText(rawConfig.webhookUrl),
    templateStyle: normalizeText(
      rawConfig.templateStyle,
      normalizeText(row.template_style, 'default'),
    ).toLowerCase(),
  };
}

function normalizeEventRow(row) {
  const config = normalizeEventConfig(row);

  return {
    id: Number(row.id ?? 0),
    name: normalizeText(row.name),
    slug: normalizeText(row.slug),
    eventName: normalizeText(row.event_name, normalizeText(row.name)),
    legacyTemplateSlug: normalizeText(row.legacy_template_slug),
    siteKey: normalizeText(row.site_key, 'srx-event-site'),
    publicBaseUrl: normalizeText(row.public_base_url),
    publicPath: normalizeText(row.public_path),
    status: normalizeText(row.status, 'draft'),
    isActive: toBoolean(row.is_active, false),
    templateStyle: config.templateStyle,
    sortOrder: Number(row.sort_order ?? 0),
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,
    publishedAt: row.published_at ?? null,
    lastSyncedAt: row.last_synced_at ?? null,
    path: `/events/${normalizeText(row.slug)}`,
    config,
  };
}

function shouldUseFallbackEvents() {
  if (hasDatabaseConfig()) {
    return false;
  }

  if (!hasWarnedAboutMissingDbConfig) {
    hasWarnedAboutMissingDbConfig = true;
    console.warn(
      `Database env is missing (${getMissingDatabaseEnvNames().join(', ')}). Event landing pages will stay unavailable until DB is configured.`,
    );
  }

  return true;
}

export async function getPublishedLadipageEventBySlug(slug) {
  const normalizedSlug = normalizeText(slug).toLowerCase();

  if (!normalizedSlug || shouldUseFallbackEvents()) {
    return null;
  }

  try {
    const rows = await query(
      `
        SELECT
          id,
          name,
          slug,
          event_name,
          legacy_template_slug,
          site_key,
          public_base_url,
          public_path,
          status,
          is_active,
          template_style,
          sort_order,
          config_json,
          published_config_json,
          published_at,
          last_synced_at,
          created_at,
          updated_at
        FROM ladipage_events
        WHERE slug = ?
          AND status = 'published'
          AND is_active = 1
        LIMIT 1
      `,
      [normalizedSlug],
    );

    if (!rows.length) {
      return null;
    }

    return normalizeEventRow(rows[0]);
  } catch (error) {
    console.error('Failed to load ladipage event by slug:', error);
    return null;
  }
}

export async function getPublishedLadipageEventEntries() {
  if (shouldUseFallbackEvents()) {
    return [];
  }

  try {
    const rows = await query(
      `
        SELECT
          slug,
          published_at,
          updated_at
        FROM ladipage_events
        WHERE status = 'published'
          AND is_active = 1
        ORDER BY sort_order ASC, id DESC
      `,
    );

    return rows.map((row) => ({
      slug: normalizeText(row.slug),
      publishedAt: row.published_at ?? null,
      updatedAt: row.updated_at ?? null,
    }));
  } catch (error) {
    console.error('Failed to load ladipage event entries:', error);
    return [];
  }
}
