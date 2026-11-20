export function formatReadingTime(value: string): number {
  const words = value.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
