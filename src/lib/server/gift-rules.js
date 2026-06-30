const MISSING_GIFT_TABLE_CODES = new Set(['ER_NO_SUCH_TABLE', 'ER_BAD_FIELD_ERROR']);

function normalizeNumber(value, fallback = 0) {
  const normalized = Number(value);
  return Number.isFinite(normalized) ? normalized : fallback;
}

function normalizeInteger(value, fallback = 0) {
  const normalized = Number(value);
  return Number.isInteger(normalized) ? normalized : fallback;
}

function normalizeBoolean(value) {
  return Boolean(Number(value ?? 0));
}

function normalizeLimitQuantity(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  return Math.max(normalizeInteger(Number(value), 0), 0);
}

function normalizeImagePath(path = '') {
  const normalizedPath = String(path ?? '').trim();

  if (!normalizedPath) {
    return '';
  }

  if (/^https?:\/\//i.test(normalizedPath)) {
    return normalizedPath;
  }

  return normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`;
}

function normalizeGiftRule(row) {
  return {
    id: Number(row.id),
    name: String(row.name ?? '').trim(),
    description: String(row.description ?? '').trim(),
    ruleType: String(row.rule_type ?? '').trim(),
    productId: row.product_id ? Number(row.product_id) : null,
    variantId: row.variant_id ? Number(row.variant_id) : null,
    minQuantity: Math.max(normalizeInteger(Number(row.min_quantity), 1), 1),
    minSubtotal: Math.max(normalizeNumber(row.min_subtotal), 0),
    giftProductId: row.gift_product_id ? Number(row.gift_product_id) : null,
    giftVariantId: row.gift_variant_id ? Number(row.gift_variant_id) : null,
    giftSku: String(row.gift_sku ?? '').trim() || null,
    giftName: String(row.gift_name ?? '').trim(),
    giftVariantName: String(row.gift_variant_name ?? '').trim() || null,
    giftImg: normalizeImagePath(row.gift_img),
    giftQuantity: Math.max(normalizeInteger(Number(row.gift_quantity), 1), 1),
    limitQuantity: normalizeLimitQuantity(row.limit_quantity),
    multiplyByMatchedQuantity: normalizeBoolean(row.multiply_by_matched_quantity),
    priority: normalizeInteger(Number(row.priority), 0),
  };
}

function getAvailableGiftQuantity(rule, requestedQuantity) {
  const normalizedRequestedQuantity = Math.max(normalizeInteger(Number(requestedQuantity), 0), 0);

  if (!normalizedRequestedQuantity) {
    return 0;
  }

  if (rule.limitQuantity === null) {
    return normalizedRequestedQuantity;
  }

  return Math.min(normalizedRequestedQuantity, rule.limitQuantity);
}

function normalizeGiftItem(rule, quantity) {
  const availableQuantity = getAvailableGiftQuantity(rule, quantity);

  if (!availableQuantity) {
    return null;
  }

  return {
    giftRuleId: rule.id,
    ruleName: rule.name,
    productId: rule.giftProductId,
    variantId: rule.giftVariantId,
    sku: rule.giftSku,
    name: rule.giftName,
    variantLabel: rule.giftVariantName,
    giftImg: rule.giftImg,
    quantity: availableQuantity,
    price: 0,
    discountAmount: 0,
    lineTotal: 0,
    isGift: true,
  };
}

function getMatchedQuantity(rule, items) {
  return items.reduce((total, item) => {
    const productMatches = !rule.productId || Number(item.productId) === rule.productId;
    const variantMatches = !rule.variantId || Number(item.variantId) === rule.variantId;

    return productMatches && variantMatches ? total + Math.max(Number(item.quantity) || 0, 0) : total;
  }, 0);
}

function getGiftFromRule(rule, { items, subtotal }) {
  if (!rule.giftName || !rule.giftQuantity || rule.limitQuantity === 0) {
    return null;
  }

  if (rule.ruleType === 'order_subtotal') {
    if (subtotal < rule.minSubtotal) {
      return null;
    }

    return normalizeGiftItem(rule, rule.giftQuantity);
  }

  if (rule.ruleType === 'product_quantity') {
    const matchedQuantity = getMatchedQuantity(rule, items);

    if (matchedQuantity < rule.minQuantity) {
      return null;
    }

    const multiplier = rule.multiplyByMatchedQuantity
      ? Math.floor(matchedQuantity / rule.minQuantity)
      : 1;

    return normalizeGiftItem(rule, rule.giftQuantity * Math.max(multiplier, 1));
  }

  return null;
}

export function getEligibleGiftsFromRules({ rules = [], items = [], subtotal = 0 } = {}) {
  const normalizedSubtotal = Math.max(Number(subtotal) || 0, 0);
  const context = {
    items,
    subtotal: normalizedSubtotal,
  };
  const subtotalGifts = rules
    .filter((rule) => rule.ruleType === 'order_subtotal')
    .map((rule) => getGiftFromRule(rule, context))
    .filter(Boolean);

  if (subtotalGifts.length) {
    return subtotalGifts;
  }

  return rules
    .filter((rule) => rule.ruleType !== 'order_subtotal')
    .map((rule) => getGiftFromRule(rule, context))
    .filter(Boolean);
}

export async function getActiveGiftRules(executor, { lockForUpdate = false } = {}) {
  try {
    const [rows] = await executor.execute(
      `
        SELECT
          id,
          name,
          description,
          rule_type,
          product_id,
          variant_id,
          min_quantity,
          min_subtotal,
          gift_product_id,
          gift_variant_id,
          gift_sku,
          gift_name,
          gift_variant_name,
          gift_img,
          gift_quantity,
          limit_quantity,
          multiply_by_matched_quantity,
          priority
        FROM gift_rules
        WHERE is_active = 1
          AND (limit_quantity IS NULL OR limit_quantity > 0)
          AND (starts_at IS NULL OR starts_at <= CURRENT_TIMESTAMP)
          AND (ends_at IS NULL OR ends_at >= CURRENT_TIMESTAMP)
        ORDER BY priority ASC, id ASC
        ${lockForUpdate ? 'FOR UPDATE' : ''}
      `,
    );

    return rows.map(normalizeGiftRule);
  } catch (error) {
    if (MISSING_GIFT_TABLE_CODES.has(error?.code)) {
      return [];
    }

    throw error;
  }
}

export async function getEligibleGifts(executor, { items = [], subtotal = 0, lockForUpdate = false } = {}) {
  const rules = await getActiveGiftRules(executor, { lockForUpdate });

  return getEligibleGiftsFromRules({
    rules,
    items,
    subtotal,
  });
}

export async function decrementGiftRuleLimits(executor, gifts = []) {
  for (const gift of gifts) {
    if (!gift.giftRuleId || !gift.quantity) {
      continue;
    }

    await executor.execute(
      `
        UPDATE gift_rules
        SET limit_quantity = CASE
          WHEN limit_quantity IS NULL THEN NULL
          ELSE GREATEST(limit_quantity - ?, 0)
        END
        WHERE id = ?
          AND (limit_quantity IS NULL OR limit_quantity >= ?)
      `,
      [gift.quantity, gift.giftRuleId, gift.quantity],
    );
  }
}