const newsDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

export const ALL_NEWS_CATEGORY = 'Tất cả';

function normalizeSearchText(value = '') {
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function getTimestamp(dateString) {
  const timestamp = new Date(dateString).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

export function formatNewsDate(dateString) {
  const timestamp = getTimestamp(dateString);

  if (!timestamp) {
    return dateString;
  }

  return newsDateFormatter.format(timestamp);
}

export function sortNewsByDate(items = []) {
  return [...items].sort((left, right) => getTimestamp(right.publishedAt) - getTimestamp(left.publishedAt));
}

export function searchNews(query, items = []) {
  const normalizedQuery = normalizeSearchText(query);
  const sortedItems = sortNewsByDate(items);

  if (!normalizedQuery) {
    return sortedItems;
  }

  return sortedItems.filter((article) => {
    const haystack = normalizeSearchText(
      [
        article.title,
        article.category,
        article.excerpt,
        article.content,
        article.readTime,
        ...(article.tags ?? []),
      ].join(' '),
    );

    return haystack.includes(normalizedQuery);
  });
}

export function filterNews({ items = [], query = '', category = ALL_NEWS_CATEGORY } = {}) {
  return searchNews(query, items).filter((article) => {
    if (category === ALL_NEWS_CATEGORY) {
      return true;
    }

    return article.category === category;
  });
}

export function getNewsCategories(items = []) {
  return Array.from(
    new Set(
      items
        .map((item) => item.category)
        .filter(Boolean),
    ),
  );
}
