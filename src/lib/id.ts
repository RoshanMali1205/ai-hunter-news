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
  const usedIds = new Set<string>();
  const result: Story[] = [];

  for (const story of stories) {
    const canonicalUrl = canonicalizeUrl(story.url);
    if (canonicalUrls.has(canonicalUrl)) continue;
    canonicalUrls.add(canonicalUrl);

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
