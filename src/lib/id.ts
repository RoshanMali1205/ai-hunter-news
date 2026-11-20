import type { Story } from "../types";

const TRACKING_PARAMETERS = new Set(["fbclid", "mc_cid", "mc_eid"]);

export function canonicalizeUrl(value: string): string {
  const url = new URL(value);
  url.hostname = url.hostname.toLowerCase();
  url.hash = "";
  for (const key of [...url.searchParams.keys()]) {
    if (TRACKING_PARAMETERS.has(key.toLowerCase()) || key.toLowerCase().startsWith("utm_")) {
      url.searchParams.delete(key);
    }
  }
  return url.href;
}

export function hashCanonicalUrl(value: string): string {
  const canonical = canonicalizeUrl(value);
  let hash = 5381;
  for (let index = 0; index < canonical.length; index += 1) {
    hash = ((hash << 5) + hash) ^ canonical.charCodeAt(index);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function assignUniqueIds(stories: Story[]): Story[] {
  const canonicalUrls = new Set<string>();
  const titles = new Set<string>();
  const usedIds = new Set<string>();
  const result: Story[] = [];

  for (const story of stories) {
    const canonicalUrl = canonicalizeUrl(story.url);
    // Publishers sometimes list one story under two URLs (e.g. with and without a trailing
    // slash, or a category path); treat the same title from the same source as a duplicate.
    const titleKey = `${story.source}|${story.title.toLowerCase().replace(/\s+/g, " ").trim()}`;
    if (canonicalUrls.has(canonicalUrl) || titles.has(titleKey)) continue;
    canonicalUrls.add(canonicalUrl);
    titles.add(titleKey);

    const baseId = hashCanonicalUrl(canonicalUrl);
    let id = baseId;
    let suffix = 2;
    while (usedIds.has(id)) {
      id = `${baseId}-${suffix}`;
      suffix += 1;
    }
    usedIds.add(id);
    result.push({ ...story, id });
  }

  return result;
}
