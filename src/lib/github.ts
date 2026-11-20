/**
 * Minimal GitHub client for the Repos page.
 *
 * Uses the public search API, which allows browser requests (CORS) without a token:
 *   • curated repos: one search with `repo:owner/name` qualifiers returns them all
 *   • rising repos:  AI repos created in the last 30 days, sorted by stars
 * Unauthenticated search allows 10 requests a minute per visitor, and results are cached
 * on the device for a few hours, so a page view costs at most two requests.
 */

export interface RepoInfo {
  fullName: string;
  url: string;
  description: string;
  stars: number;
  forks: number;
  language?: string;
  pushedAt: string;
  createdAt: string;
  avatar: string;
  topics: string[];
  archived: boolean;
}

interface SearchItem {
  full_name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  pushed_at: string;
  created_at: string;
  topics?: string[];
  archived: boolean;
  owner: { avatar_url: string };
}

const API = "https://api.github.com/search/repositories";
const PER_QUERY = 50; // repo: qualifiers per search request

function toInfo(item: SearchItem): RepoInfo {
  return {
    fullName: item.full_name,
    url: item.html_url,
    description: item.description ?? "",
    stars: item.stargazers_count,
    forks: item.forks_count,
    language: item.language ?? undefined,
    pushedAt: item.pushed_at,
    createdAt: item.created_at,
    avatar: item.owner.avatar_url,
    topics: (item.topics ?? []).slice(0, 6),
    archived: item.archived,
  };
}

interface RequestOptions {
  token?: string;
  signal?: AbortSignal;
}

async function search(query: string, params: Record<string, string>, options: RequestOptions): Promise<SearchItem[]> {
  const url = new URL(API);
  url.searchParams.set("q", query);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  const response = await fetch(url, {
    signal: options.signal,
    headers: {
      Accept: "application/vnd.github+json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
  });
  if (!response.ok) throw new Error(`GitHub search returned ${response.status}`);
  const body = (await response.json()) as { items?: SearchItem[] };
  return body.items ?? [];
}

/** Looks up specific repositories. Keys of the result are lower-cased "owner/name". */
export async function fetchReposByName(names: string[], options: RequestOptions = {}): Promise<Record<string, RepoInfo>> {
  const result: Record<string, RepoInfo> = {};
  for (let index = 0; index < names.length; index += PER_QUERY) {
    const chunk = names.slice(index, index + PER_QUERY);
    const items = await search(chunk.map((name) => `repo:${name}`).join(" "), { per_page: "100" }, options);
    for (const item of items) result[item.full_name.toLowerCase()] = toInfo(item);
  }
  return result;
}

/** AI repositories created recently, most-starred first. */
export async function fetchRisingRepos(options: RequestOptions & { days?: number; now?: Date } = {}): Promise<RepoInfo[]> {
  const since = new Date((options.now ?? new Date()).getTime() - (options.days ?? 30) * 86_400_000).toISOString().slice(0, 10);
  const items = await search(
    `llm OR agent OR mcp created:>${since} stars:>100 archived:false`,
    { sort: "stars", order: "desc", per_page: "20" },
    options,
  );
  return items.filter((item) => item.description).slice(0, 12).map(toInfo);
}

export function formatStars(value: number): string {
  if (value < 1000) return String(value);
  if (value < 10_000) return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return `${Math.round(value / 1000)}k`;
}
