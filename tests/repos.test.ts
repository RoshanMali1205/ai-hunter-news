import assert from "node:assert/strict";
import test from "node:test";
import { CURATED_REPOS, REPO_CATEGORIES } from "../src/data/repos";
import { REPO_SNAPSHOT } from "../src/data/repoSnapshot";
import { fetchReposByName, fetchRisingRepos, formatStars } from "../src/lib/github";
import { formatAgo } from "../src/lib/time";

test("every curated repo is unique, categorised, and present in the snapshot", () => {
  const names = CURATED_REPOS.map((repo) => repo.fullName.toLowerCase());
  assert.equal(new Set(names).size, names.length, "duplicate repo in CURATED_REPOS");
  const categories = new Set(REPO_CATEGORIES.map((category) => category.id));
  for (const repo of CURATED_REPOS) {
    assert.ok(categories.has(repo.category), `${repo.fullName} has an unknown category`);
    assert.ok(repo.note.length > 20, `${repo.fullName} needs a note`);
    const snapshot = REPO_SNAPSHOT[repo.fullName.toLowerCase()];
    assert.ok(snapshot, `${repo.fullName} missing from snapshot — renamed? run npm run repos:snapshot`);
    assert.equal(snapshot.archived, false, `${repo.fullName} is archived`);
  }
  for (const category of REPO_CATEGORIES) {
    assert.ok(CURATED_REPOS.some((repo) => repo.category === category.id), `${category.id} is empty`);
  }
});

test("formatStars abbreviates large counts", () => {
  assert.equal(formatStars(950), "950");
  assert.equal(formatStars(1000), "1k");
  assert.equal(formatStars(2357), "2.4k");
  assert.equal(formatStars(64957), "65k");
});

test("formatAgo reads naturally for recent and older dates", () => {
  const now = new Date("2026-11-21T12:00:00Z");
  assert.equal(formatAgo("2026-11-21T11:59:40Z", now), "just now");
  assert.equal(formatAgo("2026-11-21T09:00:00Z", now), "3h ago");
  assert.match(formatAgo("2026-10-01T09:00:00Z", now), /^on /);
});

const item = (fullName: string, extra: Record<string, unknown> = {}) => ({
  full_name: fullName,
  html_url: `https://github.com/${fullName}`,
  description: "desc",
  stargazers_count: 10,
  forks_count: 1,
  language: "Python",
  pushed_at: "2026-11-20T00:00:00Z",
  created_at: "2026-11-01T00:00:00Z",
  topics: ["llm"],
  archived: false,
  owner: { avatar_url: "https://avatars.example/x" },
  ...extra,
});

test("fetchReposByName batches repo: qualifiers and keys results by lower-case name", async () => {
  const urls: string[] = [];
  const original = globalThis.fetch;
  globalThis.fetch = (async (input: string | URL) => {
    const url = new URL(String(input));
    urls.push(url.searchParams.get("q") ?? "");
    const names = (url.searchParams.get("q") ?? "").split(" ").map((part) => part.replace("repo:", ""));
    return new Response(JSON.stringify({ items: names.map((name) => item(name)) }), { status: 200 });
  }) as typeof fetch;
  try {
    const names = Array.from({ length: 60 }, (_, index) => `Owner/repo-${index}`);
    const result = await fetchReposByName(names);
    assert.equal(urls.length, 2, "60 repos should need two requests of up to 50");
    assert.equal(Object.keys(result).length, 60);
    assert.equal(result["owner/repo-0"].fullName, "Owner/repo-0");
  } finally {
    globalThis.fetch = original;
  }
});

test("fetchReposByName throws on GitHub errors so callers can fall back", async () => {
  const original = globalThis.fetch;
  globalThis.fetch = (async () => new Response("rate limited", { status: 403 })) as typeof fetch;
  try {
    await assert.rejects(fetchReposByName(["a/b"]), /403/);
  } finally {
    globalThis.fetch = original;
  }
});

test("fetchRisingRepos searches recent AI repos and drops ones without a description", async () => {
  let query = "";
  const original = globalThis.fetch;
  globalThis.fetch = (async (input: string | URL) => {
    query = new URL(String(input)).searchParams.get("q") ?? "";
    return new Response(JSON.stringify({ items: [item("a/one"), item("b/two", { description: null })] }), { status: 200 });
  }) as typeof fetch;
  try {
    const rising = await fetchRisingRepos({ now: new Date("2026-11-21T00:00:00Z"), days: 30 });
    assert.match(query, /created:>2026-10-22/);
    assert.deepEqual(rising.map((repo) => repo.fullName), ["a/one"]);
  } finally {
    globalThis.fetch = original;
  }
});

test("every person has at least one curated repo and a unique id", async () => {
  const { REPO_PEOPLE, reposByPerson } = await import("../src/data/repos");
  assert.equal(new Set(REPO_PEOPLE.map((person) => person.id)).size, REPO_PEOPLE.length);
  for (const person of REPO_PEOPLE) {
    assert.ok(reposByPerson(person).length > 0, `${person.name} has no curated repos`);
    assert.ok(person.role.length > 20, `${person.name} needs a role`);
  }
});
