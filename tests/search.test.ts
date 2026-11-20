import assert from "node:assert/strict";
import test from "node:test";
import {
  highlightTerms,
  isQueryActive,
  parseQuery,
  searchStories,
  snippet,
  splitHighlights,
  trendingTerms,
} from "../src/lib/search";
import { timeGroup } from "../src/lib/time";
import type { Story } from "../src/types";

const NOW = Date.parse("2026-11-20T12:00:00Z");
const story = (id: string, title: string, extra: Partial<Story> = {}): Story => ({
  id,
  title,
  source: "verge",
  url: `https://example.com/${id}`,
  publishedAt: "2026-11-20T10:00:00Z",
  topic: "products",
  summary: "",
  ...extra,
});

const STORIES: Story[] = [
  story("claude", "Anthropic ships Claude for coding agents", { source: "anthropic", topic: "frontier-models" }),
  story("gemini", "Google updates Gemini with new reasoning mode", { source: "google", summary: "A large language model upgrade." }),
  story("policy", "EU finalises AI Act rules", { topic: "policy", source: "mit", summary: "Regulation for model makers." }),
  story("crypto", "Claude-powered crypto bot raises funding", { source: "techcrunch", topic: "startups", publishedAt: "2026-11-10T10:00:00Z" }),
];
const ids = (query: string, sort?: "relevance" | "newest") =>
  searchStories(STORIES, parseQuery(query), sort, NOW).map((result) => result.story.id);

test("parseQuery reads terms, phrases, exclusions and filters", () => {
  const parsed = parseQuery('Claude "open source" -crypto source:verge topic:pol');
  assert.deepEqual(parsed.terms, ["claude"]);
  assert.deepEqual(parsed.phrases, ["open source"]);
  assert.deepEqual(parsed.exclude, ["crypto"]);
  assert.deepEqual(parsed.sources, ["verge"]);
  assert.deepEqual(parsed.topics, ["policy"]);
  assert.equal(isQueryActive(parseQuery("   ")), false);
});

test("word-prefix matching finds partial words but not mid-word fragments", () => {
  assert.deepEqual(ids("clau").sort(), ["claude", "crypto"]);
  assert.deepEqual(ids("laude"), []);
});

test("every word must match, and exclusions remove stories", () => {
  assert.deepEqual(ids("claude coding"), ["claude"]);
  assert.deepEqual(ids("claude -crypto"), ["claude"]);
});

test("title matches rank above summary-only matches; newest sort orders by date", () => {
  const relevance = ids("claude");
  assert.equal(relevance[0], "claude");
  assert.deepEqual(ids("claude", "newest"), ["claude", "crypto"]);
});

test("source and topic filters work alone and combined with words", () => {
  assert.deepEqual(ids("source:google"), ["gemini"]);
  assert.deepEqual(ids("topic:policy"), ["policy"]);
  assert.deepEqual(ids("source:anthropic claude"), ["claude"]);
  assert.deepEqual(ids("source:techcrunch rules"), []);
});

test("aliases: llm matches 'language model', regulation matches policy wording", () => {
  assert.deepEqual(ids("llm"), ["gemini"]);
  assert.ok(ids("regulation").includes("policy"));
});

test("searching by publisher name works without the source: prefix", () => {
  assert.deepEqual(ids("anthropic"), ["claude"]);
});

test("highlighting marks word-prefix matches only", () => {
  const terms = highlightTerms(parseQuery("clau"));
  assert.deepEqual(
    splitHighlights("Claude and Claudette, not inclaude", terms).filter((part) => part.hit).map((part) => part.text),
    ["Clau", "Clau"], // the typed prefix of "Claude" and "Claudette"; "inclaude" is mid-word, so not marked
  );
});

test("snippet centres on the first match in long text", () => {
  const text = `${"filler ".repeat(40)}the Claude announcement ${"tail ".repeat(40)}`;
  const result = snippet(text, ["claude"], 80);
  assert.ok(result.startsWith("…"));
  assert.ok(result.toLowerCase().includes("claude"));
});

test("trending counts names that appear in the edition", () => {
  const trending = trendingTerms(STORIES);
  assert.equal(trending.find((item) => item.term === "Claude")?.count, 2);
  assert.equal(trending.some((item) => item.term === "Nvidia"), false);
});

test("timeGroup buckets stories by age", () => {
  const now = new Date(2026, 10, 20, 12, 0);
  assert.equal(timeGroup(new Date(2026, 10, 20, 11, 30).toISOString(), now), "Last hour");
  assert.equal(timeGroup(new Date(2026, 10, 20, 2, 0).toISOString(), now), "Today");
  assert.equal(timeGroup(new Date(2026, 10, 19, 9, 0).toISOString(), now), "Yesterday");
  assert.equal(timeGroup(new Date(2026, 10, 16, 9, 0).toISOString(), now), "This week");
  assert.equal(timeGroup(new Date(2026, 9, 1).toISOString(), now), "Earlier");
});

test("highlighting still works when text contains characters that expand when normalised (…)", () => {
  const parts = splitHighlights("…how coding agents are accelerating", highlightTerms(parseQuery("agents")));
  assert.deepEqual(parts.filter((part) => part.hit).map((part) => part.text), ["agent"]);
  assert.equal(parts.map((part) => part.text).join(""), "…how coding agents are accelerating");
});

test("Microsoft sources are searchable and Microsoft Research posts classify as research", async () => {
  const { classifyTopic } = await import("../src/lib/classify");
  assert.equal(classifyTopic("Making coding agents more efficient", "", "msresearch"), "research");
  assert.equal(classifyTopic("Microsoft unveils 7 AI models", "", "microsoft"), "frontier-models");
  assert.deepEqual(parseQuery("source:microsoft").sources, ["microsoft"]);
  assert.deepEqual(parseQuery("source:msresearch").sources, ["msresearch"]);
});
