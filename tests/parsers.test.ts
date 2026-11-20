import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";
import { JSDOM } from "jsdom";
import { SOURCES } from "../src/data/sources";
import { FALLBACK_STORIES } from "../src/data/fallback";
import { fallbackBriefing, readingTime } from "../src/lib/briefing";
import { classifyTopic } from "../src/lib/classify";
import { canonicalizeUrl } from "../src/lib/id";
import { parseAnthropic } from "../src/lib/parseAnthropic";
import { parseFeed } from "../src/lib/parseFeed";
import {
  EDITION_STORAGE_KEY,
  SAVED_STORAGE_KEY,
  readEdition,
  readSavedStories,
  toggleSavedStory,
  writeEdition,
  writeSavedStories,
} from "../src/lib/storage";
import { formatRelativeTime } from "../src/lib/time";
import type { SourceDefinition } from "../src/types";

const { window } = new JSDOM("", { url: "https://ai-hunter-news.test/" });
globalThis.DOMParser = window.DOMParser;
Object.defineProperty(globalThis, "window", { value: window, configurable: true });
const fixture = (name: string) => readFile(join(import.meta.dirname, "fixtures", name), "utf8");
const source = (id: SourceDefinition["id"]) => SOURCES.find((item) => item.id === id)!;

test("classifies policy, chips, startups, and named frontier launches in priority order", () => {
  assert.equal(classifyTopic("Senate advances AI legislation", "A new federal rule.", "openai"), "policy");
  assert.equal(classifyTopic("Nvidia unveils a new GPU", "A launch.", "techcrunch"), "chips");
  assert.equal(classifyTopic("AI startup raises Series A", "The seed round.", "verge"), "startups");
  assert.equal(classifyTopic("Introducing GPT-99", "A new model.", "openai"), "frontier-models");
  assert.equal(classifyTopic("Introducing Claude 9", "", "anthropic"), "frontier-models");
});

test("canonicalizes tracking parameters without changing the article path", () => {
  assert.equal(
    canonicalizeUrl("https://EXAMPLE.com/story/?utm_source=mail&fbclid=123&ref=home#top"),
    "https://example.com/story/?ref=home",
  );
  assert.equal(
    canonicalizeUrl("https://example.com/story?mc_cid=abc"),
    "https://example.com/story",
  );
});

test("formats recent publication times and computes minimum reading time", () => {
  const now = new Date("2026-11-20T12:00:00.000Z");
  assert.equal(formatRelativeTime("2026-11-20T11:50:00.000Z", now), "10m");
  assert.equal(formatRelativeTime("2026-11-20T08:00:00.000Z", now), "4h");
  assert.equal(readingTime("One brief sentence."), 1);
});

test("keeps a publisher-hosted fallback story for every topic", () => {
  assert.ok(FALLBACK_STORIES.length >= 24);
  for (const topic of ["frontier-models", "products", "research", "policy", "chips", "startups"]) {
    assert.ok(FALLBACK_STORIES.filter((story) => story.topic === topic).length >= 2, topic);
  }
  for (const story of FALLBACK_STORIES) {
    const sourceHost = new URL(source(story.source).siteUrl).hostname;
    const storyHost = new URL(story.url).hostname;
    assert.ok(storyHost === sourceHost || storyHost.endsWith(`.${sourceHost}`), story.url);
    assert.match(story.id, /^[\da-f]{8}(?:-\d+)?$/);
  }
});

test("persists saved stories and treats corrupt local storage as empty", () => {
  window.localStorage.clear();
  const story = FALLBACK_STORIES[0];
  const saved = toggleSavedStory([], story);
  assert.deepEqual(saved, [story]);
  assert.equal(writeSavedStories(saved), true);
  assert.deepEqual(readSavedStories(), [story]);
  const removed = toggleSavedStory([story], story);
  assert.deepEqual(removed, []);
  assert.equal(writeSavedStories(removed), true);
  assert.deepEqual(readSavedStories(), []);

  window.localStorage.setItem(SAVED_STORAGE_KEY, "{bad json");
  assert.deepEqual(readSavedStories(), []);
  window.localStorage.setItem(EDITION_STORAGE_KEY, JSON.stringify({
    updatedAt: new Date().toISOString(),
    stories: [{ ...story, source: "unknown-source" }],
  }));
  assert.equal(readEdition(), undefined);

  assert.equal(writeEdition({ updatedAt: new Date().toISOString(), stories: [story] }), true);
  assert.deepEqual(Object.keys(window.localStorage).sort(), [EDITION_STORAGE_KEY, SAVED_STORAGE_KEY].sort());
});

test("keeps a short feed briefing to two sentences and writes an original fallback", async () => {
  const { cleanBriefing } = await import("../src/lib/briefing");
  const summary = cleanBriefing("<p>First sentence. Second sentence. Third sentence. Read more</p>");
  assert.equal(summary, "First sentence. Second sentence.");
  assert.equal(cleanBriefing(""), "");

  const fallback = fallbackBriefing("Ars Technica", "research");
  const wordCount = fallback.split(/\s+/).length;
  assert.ok(wordCount >= 25 && wordCount <= 50);
  assert.ok(fallback.includes("Ars Technica"));
});

test("parses RSS, deduplicates canonical links, and skips publisher exclusions", async () => {
  const stories = parseFeed(await fixture("rss.xml"), source("openai"));
  assert.deepEqual(stories.map((story) => story.title), [
    "Introducing GPT-99: a new OpenAI model",
    "Sponsored AI coverage is discussed",
  ]);
  assert.equal(stories[0].topic, "frontier-models");
  assert.equal(stories[0].summary, "OpenAI introduces a new model for complex tasks. Its capabilities are described in the linked report.");
  assert.equal(stories[0].publishedAt, "2026-11-20T10:00:00.000Z");
});

test("caps each live publisher feed at eight surviving stories", () => {
  const items = Array.from({ length: 10 }, (_, index) =>
    `<item><title>A distinct AI report ${index + 1}</title><link>https://openai.com/index/report-${index + 1}/</link><pubDate>Fri, 20 Nov 2026 10:00:00 GMT</pubDate><description>A short report from the publisher.</description></item>`,
  ).join("");
  const stories = parseFeed(`<?xml version="1.0"?><rss><channel>${items}</channel></rss>`, source("openai"));
  assert.equal(stories.length, 8);
});

test("treats malformed XML as an unavailable publisher feed", () => {
  assert.deepEqual(parseFeed("<rss><item>", source("openai")), []);
});

test("parses Atom with double-escaped Verge content and ignores pixel images", async () => {
  const stories = parseFeed(await fixture("atom.xml"), source("verge"));
  assert.equal(stories.length, 2);
  assert.equal(stories[0].url, "https://www.theverge.com/ai/2026/11/20/nvidia-story");
  assert.equal(stories[0].topic, "chips");
  assert.equal(stories[0].image, "https://www.theverge.com/assets/ai-chips.webp");
  assert.equal(stories[0].summary.includes("<img"), false);
  assert.equal(stories[1].image, undefined);
});

test("skips MIT items marked sponsored but not stories mentioning sponsored coverage", async () => {
  const xml = `<?xml version="1.0"?><rss><channel>
    <item><title>A sponsored label on this source item</title><link>https://www.technologyreview.com/a/</link><pubDate>Fri, 20 Nov 2026 10:00:00 GMT</pubDate><description>Summary.</description><category>Sponsored</category></item>
    <item><title>Sponsored coverage gets public attention</title><link>https://www.technologyreview.com/b/</link><pubDate>Fri, 20 Nov 2026 09:00:00 GMT</pubDate><description>A report mentions sponsored coverage but the item is not labeled.</description></item>
  </channel></rss>`;
  const stories = parseFeed(xml, source("mit"));
  assert.equal(stories.length, 1);
  assert.equal(stories[0].title, "Sponsored coverage gets public attention");
});

test("skips only the exact OpenAI customer path segments", () => {
  const xml = `<?xml version="1.0"?><rss><channel>
    <item><title>A story from OpenAI customers</title><link>https://openai.com/index/customers/</link><pubDate>Fri, 20 Nov 2026 10:00:00 GMT</pubDate><description>Summary.</description></item>
    <item><title>A story about customer research</title><link>https://openai.com/index/customer-research/</link><pubDate>Fri, 20 Nov 2026 09:00:00 GMT</pubDate><description>This item is not in an excluded path.</description></item>
  </channel></rss>`;
  const stories = parseFeed(xml, source("openai"));
  assert.deepEqual(stories.map((story) => story.title), ["A story about customer research"]);
});

test("parses Anthropic news cards without relying on CSS classes", async () => {
  const stories = parseAnthropic(await fixture("anthropic.html"), source("anthropic"));
  assert.deepEqual(stories.map((story) => story.title), [
    "Introducing Claude 9",
    "AI for Science expands to more research partners",
  ]);
  assert.equal(stories[0].topic, "frontier-models");
  assert.equal(stories[0].image, undefined);
  assert.equal(stories[1].summary, "Anthropic brings its science program to additional research institutions.");
});

test("assignUniqueIds drops the same title from the same source under a different URL", async () => {
  const { assignUniqueIds } = await import("../src/lib/id");
  const base = { source: "anthropic" as const, publishedAt: "2026-10-27T00:00:00Z", topic: "products" as const, summary: "" };
  const result = assignUniqueIds([
    { ...base, id: "", title: "Expanding our partnership with GSA", url: "https://www.anthropic.com/news/gsa" },
    { ...base, id: "", title: "Expanding  our partnership with GSA ", url: "https://www.anthropic.com/news/gsa/" },
    { ...base, id: "", source: "verge", title: "Expanding our partnership with GSA", url: "https://www.theverge.com/gsa" },
  ]);
  assert.equal(result.length, 2); // same title from a different source is kept
});
