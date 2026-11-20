export function formatRelativeTime(value: string | Date, now = new Date()): string {
  const date = value instanceof Date ? value : new Date(value);
  const minutes = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 60_000));
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date);
}

export function formatDate(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatUpdatedTime(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

/** "5m ago", "3d ago", "just now", or "on Nov 11" for older dates. */
export function formatAgo(value: string | Date, now = new Date()): string {
  const date = value instanceof Date ? value : new Date(value);
  const minutes = (now.getTime() - date.getTime()) / 60_000;
  const relative = formatRelativeTime(date, now);
  if (minutes < 1) return "just now";
  // formatRelativeTime switches to a calendar date after 7 days; the wording follows that.
  return minutes < 7 * 24 * 60 ? `${relative} ago` : `on ${relative}`;
}

export type TimeGroup = "Last hour" | "Today" | "Yesterday" | "This week" | "Earlier";

/** Buckets a story by when it was published, for section headers in the feed. */
export function timeGroup(value: string, now = new Date()): TimeGroup {
  const date = new Date(value);
  const minutes = (now.getTime() - date.getTime()) / 60_000;
  if (minutes < 60) return "Last hour";
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  if (date.getTime() >= startOfToday) return "Today";
  if (date.getTime() >= startOfToday - 86_400_000) return "Yesterday";
  if (date.getTime() >= startOfToday - 6 * 86_400_000) return "This week";
  return "Earlier";
}
