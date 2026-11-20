import { useMemo, useState } from "react";
import { CURATED_REPOS, REPO_CATEGORIES, REPO_PEOPLE, reposByPerson, type CuratedRepo, type RepoCategory } from "../data/repos";
import { formatStars, type RepoInfo } from "../lib/github";
import { formatAgo } from "../lib/time";
import { useRepos } from "../lib/useRepos";
import { Icon } from "./Icon";
import { SearchField } from "./SearchField";
import { StateMessage } from "./StateMessage";

type Filter = "all" | "featured" | RepoCategory | `@${string}`;
type Sort = "curated" | "stars" | "updated";

const LANGUAGE_COLORS: Record<string, string> = {
  Python: "#3572A5", TypeScript: "#3178c6", JavaScript: "#f1e05a", Rust: "#dea584", Go: "#00ADD8",
  "C++": "#f34b7d", C: "#555555", Cuda: "#3A4E3A", "Jupyter Notebook": "#DA5B0B", MDX: "#fcb32c",
};

const normalize = (value: string) => value.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "");

interface Row {
  curated?: CuratedRepo;
  info?: RepoInfo;
  fullName: string;
}

function matches(row: Row, words: string[]): boolean {
  if (!words.length) return true;
  const haystack = normalize(
    [row.fullName, row.curated?.note, row.info?.description, row.info?.language, ...(row.info?.topics ?? [])].join(" "),
  );
  return words.every((word) => haystack.includes(word));
}

function RepoCard({ row, rising = false }: { row: Row; rising?: boolean }) {
  const [copied, setCopied] = useState(false);
  const [owner, name] = row.fullName.split("/");
  const info = row.info;
  const url = info?.url ?? `https://github.com/${row.fullName}`;
  const copyClone = async () => {
    try {
      await navigator.clipboard.writeText(`git clone ${url}.git`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      window.prompt("Copy the clone command", `git clone ${url}.git`);
    }
  };

  return (
    <article className={`repo-card${rising ? " is-rising" : ""}`} data-feed-item>
      <a className="repo-card-link" href={url} target="_blank" rel="noopener noreferrer">
        <span className="repo-head">
          <img
            className="repo-avatar"
            src={info?.avatar ?? `https://github.com/${owner}.png?size=64`}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
          />
          <span className="repo-name">
            <span className="repo-owner">{owner}/</span>
            <strong>{name}</strong>
          </span>
        </span>
        <span className="repo-note">{row.curated?.note ?? info?.description}</span>
        <span className="repo-meta">
          {row.curated?.featured && <span className="repo-badge">Start here</span>}
          {info && (
            <span className="repo-stars" title={`${info.stars.toLocaleString()} stars`}>
              <Icon name="star" filled /> {formatStars(info.stars)}
            </span>
          )}
          {info?.language && (
            <span className="repo-lang">
              <span className="repo-lang-dot" style={{ background: LANGUAGE_COLORS[info.language] ?? "var(--muted)" }} />
              {info.language}
            </span>
          )}
          {info && <span>{rising ? `created ${formatAgo(info.createdAt)}` : `updated ${formatAgo(info.pushedAt)}`}</span>}
        </span>
      </a>
      <button type="button" className={`repo-copy${copied ? " is-copied" : ""}`} onClick={() => void copyClone()} aria-label={`Copy git clone command for ${row.fullName}`}>
        <Icon name={copied ? "check" : "copy"} />
        <span>{copied ? "Copied" : "Clone"}</span>
      </button>
    </article>
  );
}

export function ReposPage() {
  const { repos, rising, updatedAt, source, loading, refresh } = useRepos();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("curated");

  const rows: Row[] = useMemo(
    () => CURATED_REPOS.map((curated) => ({ curated, fullName: curated.fullName, info: repos[curated.fullName.toLowerCase()] })),
    [repos],
  );
  const words = normalize(query).split(/\s+/).filter(Boolean);
  const person = filter.startsWith("@") ? REPO_PEOPLE.find((item) => item.id === filter.slice(1)) : undefined;
  const personRepos = useMemo(() => new Set(person ? reposByPerson(person).map((repo) => repo.fullName) : []), [person]);

  const visible = useMemo(() => {
    const filtered = rows.filter((row) => {
      if (filter === "featured" && !row.curated?.featured) return false;
      if (person && !personRepos.has(row.fullName)) return false;
      if (REPO_CATEGORIES.some((category) => category.id === filter) && row.curated?.category !== filter) return false;
      return matches(row, words);
    });
    if (sort === "stars") return [...filtered].sort((a, b) => (b.info?.stars ?? 0) - (a.info?.stars ?? 0));
    if (sort === "updated") return [...filtered].sort((a, b) => Date.parse(b.info?.pushedAt ?? "0") - Date.parse(a.info?.pushedAt ?? "0"));
    return filtered;
  }, [rows, filter, sort, words.join(" "), person, personRepos]); // eslint-disable-line react-hooks/exhaustive-deps

  const risingRows = rising.filter((info) => matches({ fullName: info.fullName, info }, words));
  const grouped = filter === "all" && sort === "curated" && words.length === 0;

  const chip = (id: Filter, label: string) => (
    <button
      type="button"
      key={id}
      className={`topic-chip${filter === id ? " is-active" : ""}`}
      aria-pressed={filter === id}
      onClick={() => setFilter(filter === id ? "all" : id)}
    >
      {label}
    </button>
  );

  return (
    <main className="page-content repos-page">
      <header className="page-heading">
        <span className="page-kicker">FOR BUILDERS</span>
        <h1>AI repos</h1>
        <p>Hand-picked GitHub repositories every AI developer should know, with live stars and activity.</p>
      </header>

      <SearchField value={query} onChange={setQuery} placeholder="Search repos, languages, topics…" label="Search repositories" shortcut />

      <div className="topic-chips" role="group" aria-label="Filter repositories">
        {chip("all", "All")}
        {chip("featured", "Start here")}
        {REPO_CATEGORIES.map((category) => chip(category.id, category.label))}
      </div>
      <div className="people-label">People shaping AI</div>
      <div className="source-filter people-filter" role="group" aria-label="Filter by person">
        {REPO_PEOPLE.map((item) => {
          const id = `@${item.id}` as const;
          return (
            <button
              type="button"
              key={item.id}
              className={`source-chip${filter === id ? " is-active" : ""}`}
              aria-pressed={filter === id}
              title={item.role}
              onClick={() => setFilter(filter === id ? "all" : id)}
            >
              <img className="person-avatar" src={`https://github.com/${item.login}.png?size=48`} alt="" loading="lazy" referrerPolicy="no-referrer" />
              <span>{item.name}</span>
            </button>
          );
        })}
      </div>

      {person && (
        <div className="person-card" role="region" aria-label={person.name}>
          <img className="person-card-avatar" src={`https://github.com/${person.login}.png?size=96`} alt="" referrerPolicy="no-referrer" />
          <div className="person-card-copy">
            <strong>{person.name}</strong>
            <span>{person.role}</span>
          </div>
          <a className="person-card-link" href={`https://github.com/${person.login}`} target="_blank" rel="noopener noreferrer">
            @{person.login} <span aria-hidden="true">↗</span>
          </a>
        </div>
      )}

      <div className="results-head repos-toolbar">
        <h2>
          <strong>{visible.length}</strong> curated {visible.length === 1 ? "repo" : "repos"}
        </h2>
        <div className="segmented" role="group" aria-label="Sort repositories">
          {([["curated", "Curated"], ["stars", "Most stars"], ["updated", "Recently updated"]] as const).map(([id, label]) => (
            <button type="button" key={id} className={sort === id ? "is-active" : ""} aria-pressed={sort === id} onClick={() => setSort(id)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {grouped && risingRows.length > 0 && (
        <section className="repo-section rising-section" aria-labelledby="rising-title">
          <div className="section-label">
            <h2 id="rising-title"><span className="pulse-dot" /> RISING ON GITHUB · LAST 30 DAYS</h2>
            <span className="wide-only">Live, not curated</span>
          </div>
          <div className="rising-strip">
            {risingRows.map((info) => <RepoCard key={info.fullName} row={{ fullName: info.fullName, info }} rising />)}
          </div>
        </section>
      )}

      {visible.length === 0 ? (
        <StateMessage
          title={`No repos match “${query.trim() || "this filter"}”`}
          message="Try another word, or clear the filters."
          onRetry={() => { setQuery(""); setFilter("all"); }}
          retryLabel="Clear search and filters"
          compact
        />
      ) : grouped ? (
        REPO_CATEGORIES.map((category) => {
          const items = visible.filter((row) => row.curated?.category === category.id);
          return (
            <section className="repo-section" key={category.id} aria-labelledby={`repos-${category.id}`}>
              <div className="section-label">
                <h2 id={`repos-${category.id}`}>{category.label.toUpperCase()}</h2>
                <span>{items.length} repos</span>
              </div>
              <p className="repo-section-description">{category.description}</p>
              <div className="repo-grid">{items.map((row) => <RepoCard key={row.fullName} row={row} />)}</div>
            </section>
          );
        })
      ) : (
        <div className="repo-grid repo-grid-flat">{visible.map((row) => <RepoCard key={row.fullName} row={row} />)}</div>
      )}

      <p className="repo-status" role="status">
        {loading
          ? "Fetching the latest from GitHub…"
          : source === "snapshot"
            ? `Showing saved data${updatedAt ? ` from ${new Date(updatedAt).toLocaleDateString()}` : ""} — GitHub couldn't be reached.`
            : `Stars and activity from GitHub, updated ${updatedAt ? formatAgo(updatedAt) : "recently"}.`}{" "}
        {!loading && <button type="button" className="text-button" onClick={refresh}>Refresh</button>}
      </p>
    </main>
  );
}
