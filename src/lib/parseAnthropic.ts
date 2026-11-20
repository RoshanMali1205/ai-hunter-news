import { cleanBriefing, fallbackBriefing, sourceNameForBriefing } from "./briefing";
import { classifyTopic } from "./classify";
import { htmlToText } from "./html";
import { canonicalizeUrl } from "./id";
import type { SourceDefinition, Story } from "../types";

const SKIPPED_SECTIONS = new Set(["announcements", "features", "research"]);

function parseDate(value: string): string | undefined {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : undefined;
}

function rowFor(anchor: Element): Element | undefined {
  let current = anchor.parentElement;
  for (let depth = 0; current && depth < 7; depth += 1, current = current.parentElement) {
    if (current.querySelector("h2, h3")) return current;
  }
  return undefined;
}

export function parseAnthropic(
  html: string,
  source: SourceDefinition,
  limit = 8,
): Story[] {
  const document = new DOMParser().parseFromString(html, "text/html");
  const seen = new Set<string>();
  const stories: Story[] = [];

  for (const anchor of document.querySelectorAll<HTMLAnchorElement>('a[href^="/news/"]')) {
    const path = new URL(anchor.getAttribute("href") ?? "", source.siteUrl).pathname;
    const match = path.match(/^\/news\/([^/]+)\/?$/);
    if (!match || SKIPPED_SECTIONS.has(match[1].toLowerCase())) continue;

    const url = new URL(`/news/${match[1]}`, source.siteUrl).href;
    let canonical: string;
    try {
      canonical = canonicalizeUrl(url);
    } catch {
      continue;
    }
    if (seen.has(canonical)) continue;

    const row = rowFor(anchor);
    if (!row) continue;
    const heading = row.querySelector("h2, h3");
    const title = htmlToText(heading?.textContent ?? "");
    if (title.length < 8) continue;

    const time = row.querySelector("time");
    const date = time?.getAttribute("datetime") || time?.textContent || "";
    const publishedAt = parseDate(date.trim());
    if (!publishedAt) continue;

    const paragraph = row.querySelector("p");
    const rawSummary = paragraph?.innerHTML ?? "";
    const summary = cleanBriefing(rawSummary);
    const topic = classifyTopic(title, summary, source.id);
    stories.push({
      id: "",
      title,
      source: source.id,
      url,
      publishedAt,
      topic,
      summary: summary || fallbackBriefing(sourceNameForBriefing(source.id), topic),
    });
    seen.add(canonical);
    if (stories.length === limit) break;
  }

  return stories;
}
