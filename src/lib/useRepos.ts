import { useCallback, useEffect, useState } from "react";
import { CURATED_REPOS } from "../data/repos";
import { REPO_SNAPSHOT, REPO_SNAPSHOT_DATE } from "../data/repoSnapshot";
import { fetchReposByName, fetchRisingRepos, type RepoInfo } from "./github";

const CACHE_KEY = "ai-hunter-news.repos";
const FRESH_MS = 3 * 60 * 60_000; // re-fetch from GitHub after 3 hours

interface RepoCache {
  savedAt: string;
  repos: Record<string, RepoInfo>;
  rising: RepoInfo[];
}

export interface RepoData {
  repos: Record<string, RepoInfo>;
  rising: RepoInfo[];
  /** When the data shown was fetched from GitHub. */
  updatedAt?: string;
  source: "live" | "cache" | "snapshot";
  loading: boolean;
  refresh: () => void;
}

function readCache(): RepoCache | undefined {
  try {
    const value = JSON.parse(window.localStorage.getItem(CACHE_KEY) ?? "null") as RepoCache | null;
    return value && typeof value.savedAt === "string" && value.repos && Array.isArray(value.rising) ? value : undefined;
  } catch {
    return undefined;
  }
}

function writeCache(cache: RepoCache): void {
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    /* ignore: the cache is only an optimisation */
  }
}

export function useRepos(): RepoData {
  const [state, setState] = useState<Omit<RepoData, "refresh">>(() => {
    const cache = readCache();
    return cache
      ? { repos: { ...REPO_SNAPSHOT, ...cache.repos }, rising: cache.rising, updatedAt: cache.savedAt, source: "cache", loading: false }
      : { repos: REPO_SNAPSHOT, rising: [], updatedAt: REPO_SNAPSHOT_DATE || undefined, source: "snapshot", loading: false };
  });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const cache = readCache();
    const fresh = cache && Date.now() - Date.parse(cache.savedAt) < FRESH_MS;
    if (fresh && attempt === 0) return;

    const controller = new AbortController();
    setState((current) => ({ ...current, loading: true }));
    Promise.all([
      fetchReposByName(CURATED_REPOS.map((repo) => repo.fullName), { signal: controller.signal }),
      fetchRisingRepos({ signal: controller.signal }).catch(() => cache?.rising ?? []),
    ])
      .then(([repos, rising]) => {
        const savedAt = new Date().toISOString();
        writeCache({ savedAt, repos, rising });
        setState({ repos: { ...REPO_SNAPSHOT, ...repos }, rising, updatedAt: savedAt, source: "live", loading: false });
      })
      .catch(() => {
        // Offline or rate-limited: keep showing the cache or the bundled snapshot.
        if (!controller.signal.aborted) setState((current) => ({ ...current, loading: false }));
      });
    return () => controller.abort();
  }, [attempt]);

  const refresh = useCallback(() => setAttempt((value) => value + 1), []);
  return { ...state, refresh };
}
