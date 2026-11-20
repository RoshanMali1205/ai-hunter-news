/** Per-device reading activity: read stories, last visit, recent searches. */

const READ_KEY = "ai-hunter-news.read";
const VISIT_KEY = "ai-hunter-news.last-visit";
const RECENT_KEY = "ai-hunter-news.recent-searches";
const MAX_READ = 1000;
const MAX_RECENT = 6;

function readArray(key: string): string[] {
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(key) ?? "[]");
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function write(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or blocked: activity is a convenience, so ignore */
  }
}

export function readReadIds(): Set<string> {
  return new Set(readArray(READ_KEY));
}

export function addReadId(ids: Set<string>, id: string): Set<string> {
  if (ids.has(id)) return ids;
  const next = new Set(ids);
  next.add(id);
  write(READ_KEY, [...next].slice(-MAX_READ));
  return next;
}

/**
 * Returns when the reader was last here (before this session) and records now.
 * Stories published after that moment are shown as "New".
 */
export function takeLastVisit(now = new Date()): string | undefined {
  let previous: string | undefined;
  try {
    previous = window.localStorage.getItem(VISIT_KEY) ?? undefined;
  } catch {
    previous = undefined;
  }
  try {
    window.localStorage.setItem(VISIT_KEY, now.toISOString());
  } catch {
    /* ignore */
  }
  return previous && Number.isFinite(Date.parse(previous)) ? previous : undefined;
}

export function readRecentSearches(): string[] {
  return readArray(RECENT_KEY).slice(0, MAX_RECENT);
}

export function addRecentSearch(query: string): string[] {
  const clean = query.trim().replace(/\s+/g, " ");
  if (clean.length < 2) return readRecentSearches();
  const next = [clean, ...readRecentSearches().filter((item) => item.toLowerCase() !== clean.toLowerCase())].slice(
    0,
    MAX_RECENT,
  );
  write(RECENT_KEY, next);
  return next;
}

export function clearRecentSearches(): void {
  write(RECENT_KEY, []);
}
