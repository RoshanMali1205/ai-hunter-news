import { SOURCES, TOPICS } from "../data/sources";
import type { SourceId, Story, TopicId } from "../types";

/**
 * Search for the news feed.
 *
 * Syntax (all optional, combinable):
 *   claude agents        every word must match (word-prefix, so "clau" finds "Claude")
 *   "open source"        exact phrase
 *   -crypto              exclude stories mentioning a word
 *   source:verge         only one publisher (id or name prefix)
 *   topic:policy         only one topic (id or label prefix)
 *
 * Results are ranked: title hits > source/topic hits > summary hits, plus a small
 * boost for fresh stories.
 */

export interface ParsedQuery {
  terms: string[];
  phrases: string[];
  exclude: string[];
  sources: SourceId[];
  topics: TopicId[];
}

export interface SearchResult {
  story: Story;
  score: number;
}

export type SearchSort = "relevance" | "newest";

/** Words developers commonly type that should also match related wording. */
const ALIASES: Record<string, string[]> = {
  llm: ["llm", "language model"],
  llms: ["llm", "language model"],
  gpt: ["gpt", "chatgpt"],
  agent: ["agent", "agentic"],
  agents: ["agent", "agentic"],
  gpu: ["gpu", "chip", "nvidia"],
  gpus: ["gpu", "chip", "nvidia"],
  oss: ["open source", "open-source", "open weight", "open-weight"],
  opensource: ["open source", "open-source"],
  regulation: ["regulat", "law", "policy"],
  funding: ["funding", "raises", "raised", "valuation", "investment"],
  google: ["google", "gemini", "deepmind"],
  meta: ["meta", "llama"],
  ai: ["ai", "artificial intelligence"],
};

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "");

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function resolveSource(value: string): SourceId | undefined {
  const needle = normalize(value);
  return SOURCES.find(
    (source) =>
      source.id === needle ||
      normalize(source.name).startsWith(needle) ||
      normalize(source.shortName).startsWith(needle),
  )?.id;
}

function resolveTopic(value: string): TopicId | undefined {
  const needle = normalize(value).replace(/-/g, " ");
  return TOPICS.find(
    (topic) => topic.id.replace(/-/g, " ").startsWith(needle) || normalize(topic.label).startsWith(needle),
  )?.id;
}

export function parseQuery(raw: string): ParsedQuery {
  const parsed: ParsedQuery = { terms: [], phrases: [], exclude: [], sources: [], topics: [] };
  const pattern = /(-?)(?:(source|src|topic|in):)?(?:"([^"]*)"?|(\S+))/gi;
  for (const match of raw.matchAll(pattern)) {
    const [, minus, key, phrase, word] = match;
    const value = (phrase ?? word ?? "").trim();
    if (!value) continue;

    if (key) {
      const lowerKey = key.toLowerCase();
      if (lowerKey === "source" || lowerKey === "src") {
        const id = resolveSource(value);
        if (id && !parsed.sources.includes(id)) parsed.sources.push(id);
      } else {
        const id = resolveTopic(value);
        if (id && !parsed.topics.includes(id)) parsed.topics.push(id);
      }
      continue;
    }

    if (phrase !== undefined) {
      const text = normalize(value);
      (minus ? parsed.exclude : parsed.phrases).push(text);
      continue;
    }

    // Keep inner punctuation that matters in AI names (gpt-5, o3.5, c++), trim the rest.
    const cleaned = normalize(value).replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}+#]+$/gu, "");
    if (!cleaned) continue;
    (minus ? parsed.exclude : parsed.terms).push(cleaned);
  }
  return parsed;
}

export function isQueryActive(query: ParsedQuery): boolean {
  return (
    query.terms.length + query.phrases.length + query.exclude.length + query.sources.length + query.topics.length > 0
  );
}

/** Variants a term should match (itself plus any aliases). */
function variants(term: string): string[] {
  return ALIASES[term] ?? [term];
}

/** True when `needle` starts a word inside `haystack` (both already normalized). */
function hasWordPrefix(haystack: string, needle: string): boolean {
  let from = 0;
  for (;;) {
    const index = haystack.indexOf(needle, from);
    if (index === -1) return false;
    if (index === 0 || !/[\p{L}\p{N}]/u.test(haystack[index - 1])) return true;
    from = index + 1;
  }
}

const matchesAny = (haystack: string, term: string) => variants(term).some((v) => hasWordPrefix(haystack, v));

interface IndexedStory {
  story: Story;
  title: string;
  summary: string;
  meta: string;
}

function index(story: Story): IndexedStory {
  const source = SOURCES.find((item) => item.id === story.source);
  const topic = TOPICS.find((item) => item.id === story.topic);
  return {
    story,
    title: normalize(story.title),
    summary: normalize(story.summary),
    meta: normalize(`${source?.name ?? story.source} ${source?.shortName ?? ""} ${topic?.label ?? ""}`),
  };
}

export function searchStories(
  stories: Story[],
  query: ParsedQuery,
  sort: SearchSort = "relevance",
  now = Date.now(),
): SearchResult[] {
  const results: SearchResult[] = [];

  for (const item of stories.map(index)) {
    const { story, title, summary, meta } = item;
    if (query.sources.length && !query.sources.includes(story.source)) continue;
    if (query.topics.length && !query.topics.includes(story.topic)) continue;

    const all = `${title} ${summary} ${meta}`;
    if (query.exclude.some((term) => (term.includes(" ") ? all.includes(term) : matchesAny(all, term)))) continue;

    let score = 0;
    let ok = true;
    for (const term of query.terms) {
      const inTitle = matchesAny(title, term);
      const inMeta = matchesAny(meta, term);
      const inSummary = matchesAny(summary, term);
      if (!inTitle && !inMeta && !inSummary) { ok = false; break; }
      score += (inTitle ? 6 : 0) + (inMeta ? 4 : 0) + (inSummary ? 2 : 0);
      // Whole-word title match ranks above a prefix match ("claude" vs "claudette").
      if (inTitle && new RegExp(`(^|[^\\p{L}\\p{N}])${escapeRegExp(term)}($|[^\\p{L}\\p{N}])`, "u").test(title)) score += 2;
    }
    if (!ok) continue;

    for (const phrase of query.phrases) {
      const inTitle = title.includes(phrase);
      const inRest = summary.includes(phrase) || meta.includes(phrase);
      if (!inTitle && !inRest) { ok = false; break; }
      score += inTitle ? 8 : 3;
    }
    if (!ok) continue;

    const ageDays = Math.max(0, (now - Date.parse(story.publishedAt)) / 86_400_000);
    score += Math.max(0, 3 - ageDays); // fresher stories float up a little
    results.push({ story, score });
  }

  return results.sort((left, right) => {
    const byDate = Date.parse(right.story.publishedAt) - Date.parse(left.story.publishedAt);
    return sort === "newest" ? byDate : right.score - left.score || byDate;
  });
}

/** Words to highlight in results: terms (with aliases) and phrases. */
export function highlightTerms(query: ParsedQuery): string[] {
  const words = query.terms.flatMap(variants).concat(query.phrases);
  return [...new Set(words)].filter(Boolean).sort((a, b) => b.length - a.length);
}

/** A window of `text` around the first highlighted term, so results show why they matched. */
export function snippet(text: string, terms: string[], length = 150): string {
  if (text.length <= length) return text;
  const lower = normalize(text);
  const first = terms
    .map((term) => lower.indexOf(term))
    .filter((position) => position >= 0)
    .sort((a, b) => a - b)[0];
  if (first === undefined || first < length * 0.6) return `${text.slice(0, length).trimEnd()}…`;
  const start = Math.max(0, first - Math.floor(length / 3));
  return `…${text.slice(start, start + length).trim()}…`;
}

/** Splits text into plain and highlighted parts (word-prefix matches only). */
export function splitHighlights(text: string, terms: string[]): { text: string; hit: boolean }[] {
  if (!terms.length) return [{ text, hit: false }];
  // Normalise per character so positions line up with the original text even when a
  // character expands under NFKD (e.g. "…" → "..."): keep only its first base character.
  const lower = Array.from(text, (char) => (normalize(char)[0] ?? char)).join("");
  if (lower.length !== text.length) return [{ text, hit: false }]; // astral characters: skip highlighting

  const parts: { text: string; hit: boolean }[] = [];
  let cursor = 0;
  let position = 0;
  while (position < text.length) {
    const atWordStart = position === 0 || !/[\p{L}\p{N}]/u.test(lower[position - 1]);
    const term = atWordStart ? terms.find((candidate) => lower.startsWith(candidate, position)) : undefined;
    if (term) {
      if (position > cursor) parts.push({ text: text.slice(cursor, position), hit: false });
      parts.push({ text: text.slice(position, position + term.length), hit: true });
      position += term.length;
      cursor = position;
    } else {
      position += 1;
    }
  }
  if (cursor < text.length) parts.push({ text: text.slice(cursor), hit: false });
  return parts;
}

/** Names developers follow; shown as "Trending" suggestions when they appear in the feed. */
const TRENDING_CANDIDATES = [
  "OpenAI", "Anthropic", "Claude", "Gemini", "GPT", "ChatGPT", "Nvidia", "Llama", "Mistral",
  "DeepSeek", "Microsoft", "Apple", "Meta", "xAI", "Grok", "Copilot", "Agents", "Robotics",
  "Open source", "Chips", "Funding", "Safety", "Regulation", "Benchmark", "Coding",
];

export function trendingTerms(stories: Story[], limit = 8): { term: string; count: number }[] {
  const indexed = stories.map((story) => normalize(`${story.title} ${story.summary}`));
  return TRENDING_CANDIDATES.map((term) => {
    const query = parseQuery(term.includes(" ") ? `"${term}"` : term);
    const count = indexed.filter((text) =>
      query.phrases.length ? text.includes(query.phrases[0]) : matchesAny(text, query.terms[0]),
    ).length;
    return { term, count };
  })
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
