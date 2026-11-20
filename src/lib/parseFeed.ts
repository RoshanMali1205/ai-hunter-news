import { cleanBriefing, fallbackBriefing, sourceNameForBriefing } from "./briefing";
import { classifyTopic } from "./classify";
import { firstImageInHtml, htmlToText, isTrackingImage } from "./html";
import { canonicalizeUrl } from "./id";
import { parseAnthropic } from "./parseAnthropic";
import type { SourceDefinition } from "../types";
import type { Story } from "../types";

const TITLE_MINIMUM_LENGTH = 8;

function elementsByLocalName(parent: Element, localName: string): Element[] {
  return Array.from(parent.getElementsByTagNameNS("*", localName));
}

function firstElement(parent: Element, localName: string): Element | undefined {
  return elementsByLocalName(parent, localName)[0];
}

function textFrom(parent: Element, ...names: string[]): string {
  for (const name of names) {
    const node = firstElement(parent, name);
    const text = node?.textContent?.trim();
    if (text) return text;
  }
  return "";
}

function resolveHttpUrl(value: string, baseUrl: string): string | undefined {
  try {
    const url = new URL(value.trim(), baseUrl);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : undefined;
  } catch {
    return undefined;
  }
}

function validDate(value: string): string | undefined {
  const timestamp = Date.parse(value.trim());
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : undefined;
}

function categoriesFor(element: Element): string[] {
  return elementsByLocalName(element, "category").map(
    (category) => category.getAttribute("term") ?? category.textContent ?? "",
  );
}

function shouldSkip(
  source: SourceDefinition["id"],
  url: string,
  categories: string[],
): boolean {
  const pathSegments = new URL(url).pathname.toLowerCase().split("/").filter(Boolean);
  const normalizedCategories = categories.map((category) => htmlToText(category).toLowerCase().trim());
  if (pathSegments.includes("podcast") || normalizedCategories.includes("podcast")) return true;

  if (source === "openai") {
    if (pathSegments.some((segment) => segment === "customer-stories" || segment === "customers")) {
      return true;
    }
    if (
      normalizedCategories.some((category) =>
        ["demo", "demos", "guide", "guides", "webinar", "webinars"].includes(category),
      )
    ) {
      return true;
    }
  }

  return source === "mit" && normalizedCategories.includes("sponsored");
}

function storyFromParts(
  source: SourceDefinition,
  parts: {
    title: string;
    url: string;
    publishedAt: string;
    categories: string[];
    blurb: string;
    image?: string;
  },
): Story | undefined {
  const title = htmlToText(parts.title);
  const url = resolveHttpUrl(parts.url, source.siteUrl);
  const publishedAt = validDate(parts.publishedAt);
  if (!url || !publishedAt || title.length < TITLE_MINIMUM_LENGTH) return undefined;
  if (shouldSkip(source.id, url, parts.categories)) return undefined;

  const summary = cleanBriefing(parts.blurb);
  const topic = classifyTopic(title, summary, source.id);
  return {
    id: "",
    title,
    source: source.id,
    url,
    publishedAt,
    topic,
    summary: summary || fallbackBriefing(sourceNameForBriefing(source.id), topic),
    image: parts.image,
  };
}

function imageFromItem(item: Element, blurb: string, articleUrl: string): string | undefined {
  const candidates: string[] = [];
  for (const content of elementsByLocalName(item, "content")) {
    const type = content.getAttribute("type") ?? "";
    if (
      type.startsWith("image/") ||
      content.getAttribute("medium") === "image" ||
      /\.(?:avif|gif|jpe?g|png|webp)(?:[?#]|$)/i.test(content.getAttribute("url") ?? "")
    ) {
      const url = content.getAttribute("url");
      if (url && !isTrackingImage(url, content)) candidates.push(url);
    }
  }
  for (const thumbnail of elementsByLocalName(item, "thumbnail")) {
    const url = thumbnail.getAttribute("url");
    if (url && !isTrackingImage(url, thumbnail)) candidates.push(url);
  }
  for (const enclosure of elementsByLocalName(item, "enclosure")) {
    if ((enclosure.getAttribute("type") ?? "").startsWith("image/")) {
      const url = enclosure.getAttribute("url");
      if (url && !isTrackingImage(url, enclosure)) candidates.push(url);
    }
  }

  for (const candidate of candidates) {
    if (isTrackingImage(candidate)) continue;
    const resolved = resolveHttpUrl(candidate, articleUrl);
    if (resolved) return resolved;
  }
  return firstImageInHtml(blurb, articleUrl);
}

function parseRss(document: Document, source: SourceDefinition): Story[] {
  return Array.from(document.getElementsByTagName("item"))
    .map((item) => {
      const title = textFrom(item, "title");
      const url = textFrom(item, "link");
      const date = textFrom(item, "pubDate", "date");
      const blurb = textFrom(item, "description", "encoded");
      return storyFromParts(source, {
        title,
        url,
        publishedAt: date,
        categories: categoriesFor(item),
        blurb,
        image: imageFromItem(item, blurb, resolveHttpUrl(url, source.siteUrl) ?? source.siteUrl),
      });
    })
    .filter((story): story is Story => Boolean(story));
}

function atomAlternateUrl(entry: Element, baseUrl: string): string {
  const links = elementsByLocalName(entry, "link");
  const alternate = links.find((link) => !link.getAttribute("rel") || link.getAttribute("rel") === "alternate");
  const selected = alternate ?? links[0];
  return selected?.getAttribute("href") ?? selected?.textContent?.trim() ?? baseUrl;
}

function parseAtom(document: Document, source: SourceDefinition): Story[] {
  return Array.from(document.getElementsByTagNameNS("*", "entry"))
    .map((entry) => {
      const title = textFrom(entry, "title");
      const url = atomAlternateUrl(entry, source.siteUrl);
      const date = textFrom(entry, "published", "updated");
      const blurb = textFrom(entry, "summary", "content");
      return storyFromParts(source, {
        title,
        url,
        publishedAt: date,
        categories: categoriesFor(entry),
        blurb,
        image: imageFromItem(entry, blurb, resolveHttpUrl(url, source.siteUrl) ?? source.siteUrl),
      });
    })
    .filter((story): story is Story => Boolean(story));
}

export function parseFeed(text: string, source: SourceDefinition, limit = 8): Story[] {
  if (source.format === "html") return parseAnthropic(text, source, limit);
  const document = new DOMParser().parseFromString(text, "text/xml");
  if (document.getElementsByTagName("parsererror").length > 0) return [];
  const stories = source.format === "atom" ? parseAtom(document, source) : parseRss(document, source);
  const canonicalUrls = new Set<string>();
  return stories.filter((story) => {
    try {
      const canonical = canonicalizeUrl(story.url);
      if (canonicalUrls.has(canonical)) return false;
      canonicalUrls.add(canonical);
      return true;
    } catch {
      return false;
    }
  }).slice(0, limit);
}
