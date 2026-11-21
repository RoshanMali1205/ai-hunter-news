import { useCallback, useDeferredValue, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { SOURCE_GROUPS, SOURCES } from "../data/sources";
import { formatMissingSources, type SourceCoverage } from "../lib/fetchEdition";
import { addRecentSearch, clearRecentSearches, readRecentSearches } from "../lib/activity";
import {
  highlightTerms,
  isQueryActive,
  parseQuery,
  searchStories,
  trendingTerms,
  type SearchSort,
} from "../lib/search";
import { formatUpdatedTime, timeGroup, type TimeGroup } from "../lib/time";
import { useFeedKeyboard } from "../lib/useFeedKeyboard";
import { PULL_TRIGGER, usePullToRefresh } from "../lib/usePullToRefresh";
import type { SourceId, Story, TopicId } from "../types";
import { Icon } from "./Icon";
import { SearchField } from "./SearchField";
import { ShortcutsDialog } from "./ShortcutsDialog";
import { SourcePlate } from "./SourcePlate";
import { StateMessage } from "./StateMessage";
import { StoryLead } from "./StoryLead";
import { StoryRow } from "./StoryRow";
import { ThemeToggle } from "./ThemeToggle";
import { TopicChips } from "./TopicChips";

interface HomePageProps {
  stories: Story[];
  savedStories: Story[];
  loading: boolean;
  updatedAt?: string;
  onToggleSaved: (story: Story) => void;
  onRefresh: () => void;
  refreshing: boolean;
  readIds: Set<string>;
  lastVisit?: string;
  coverage?: SourceCoverage;
}

const GROUP_ORDER: TimeGroup[] = ["Last hour", "Today", "Yesterday", "This week", "Earlier"];

export function HomePage({
  stories,
  savedStories,
  loading,
  updatedAt,
  onToggleSaved,
  onRefresh,
  refreshing,
  readIds,
  lastVisit,
  coverage,
}: HomePageProps) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [activeTopic, setActiveTopic] = useState<TopicId | "all">("all");
  const [activeSources, setActiveSources] = useState<SourceId[]>([]);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [sort, setSort] = useState<SearchSort>("relevance");
  const [helpOpen, setHelpOpen] = useState(false);
  const [recent, setRecent] = useState(() => readRecentSearches());

  const savedIds = useMemo(() => new Set(savedStories.map((story) => story.id)), [savedStories]);
  const missingNames = (coverage?.failedSourceIds ?? [])
    .map((id) => SOURCES.find((source) => source.id === id)?.name)
    .filter((name): name is string => Boolean(name));
  const missingLabel = formatMissingSources(missingNames);
  const lastVisitTime = lastVisit ? Date.parse(lastVisit) : undefined;
  const isNew = (story: Story) => lastVisitTime !== undefined && Date.parse(story.publishedAt) > lastVisitTime;

  const parsed = useMemo(() => parseQuery(deferredQuery), [deferredQuery]);
  const searching = isQueryActive(parsed);
  const terms = useMemo(() => highlightTerms(parsed), [parsed]);
  const trending = useMemo(() => trendingTerms(stories), [stories]);

  // Chips (topic, sources, unread) narrow the feed and the search alike.
  const filtered = useMemo(
    () =>
      stories.filter(
        (story) =>
          (activeTopic === "all" || story.topic === activeTopic) &&
          (activeSources.length === 0 || activeSources.includes(story.source)) &&
          (!unreadOnly || !readIds.has(story.id)),
      ),
    [stories, activeTopic, activeSources, unreadOnly, readIds],
  );
  const results = useMemo(
    () => (searching ? searchStories(filtered, parsed, sort).map((result) => result.story) : filtered),
    [filtered, parsed, searching, sort],
  );

  const newCount = stories.filter(isNew).length;
  const unreadCount = stories.filter((story) => !readIds.has(story.id)).length;
  const filtersActive = activeTopic !== "all" || activeSources.length > 0 || unreadOnly;

  const toggleSource = (id: SourceId) =>
    setActiveSources((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  const resetFilters = () => {
    setActiveTopic("all");
    setActiveSources([]);
    setUnreadOnly(false);
    setQuery("");
  };
  const commitSearch = useCallback((value: string) => setRecent(addRecentSearch(value)), []);

  const findStory = (id: string) => stories.find((story) => story.id === id) ?? savedStories.find((s) => s.id === id);
  useFeedKeyboard({
    onToggleSaved: (id) => { const story = findStory(id); if (story) onToggleSaved(story); },
    onOpenOriginal: (id) => { const story = findStory(id); if (story) window.open(story.url, "_blank", "noopener"); },
    onRefresh: () => { if (!refreshing) onRefresh(); },
    onToggleUnread: () => setUnreadOnly((value) => !value),
    onHelp: () => setHelpOpen(true),
  });
  const pull = usePullToRefresh(() => { if (!refreshing) onRefresh(); });

  const lead = results[0];
  const groups = useMemo(() => {
    const now = new Date();
    const map = new Map<TimeGroup, Story[]>();
    for (const story of results.slice(1)) {
      const group = timeGroup(story.publishedAt, now);
      map.set(group, [...(map.get(group) ?? []), story]);
    }
    return GROUP_ORDER.filter((group) => map.has(group)).map((group) => ({ group, stories: map.get(group)! }));
  }, [results]);

  const rowProps = (story: Story) => ({
    story,
    saved: savedIds.has(story.id),
    onToggleSaved,
    read: readIds.has(story.id),
    isNew: isNew(story),
  });

  return (
    <main>
      <div
        className={`pull-indicator${pull >= PULL_TRIGGER ? " is-ready" : ""}${refreshing ? " is-refreshing" : ""}`}
        style={{ height: refreshing && pull === 0 ? 0 : pull }}
        aria-hidden="true"
      >
        <Icon name="refresh" style={{ transform: `rotate(${pull * 3}deg)` }} />
        <span>{pull >= PULL_TRIGGER ? "Release to refresh" : "Pull to refresh"}</span>
      </div>

      <header className="home-header">
        <Link className="wordmark" to="/" aria-label="AI Hunter-News home">
          <span className="wordmark-monogram">AH</span>
          <span className="wordmark-copy">
            <span className="wordmark-kicker">AI WORLD NEWS</span>
            <span className="wordmark-name">AI Hunter-News</span>
          </span>
        </Link>
        <div className="header-actions">
          <button type="button" className="shortcuts-button" onClick={() => setHelpOpen(true)} aria-label="Keyboard shortcuts">
            <kbd>?</kbd>
          </button>
          <ThemeToggle className="header-theme-toggle" />
          <button
            className={`refresh-button${refreshing ? " is-refreshing" : ""}`}
            type="button"
            onClick={onRefresh}
            aria-label="Refresh news"
            disabled={refreshing}
          >
            <Icon name="refresh" />
          </button>
        </div>
      </header>

      <div className="edition-date">
        <time dateTime={new Date().toISOString()}>
          {new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric" }).format(new Date())}
        </time>
        {updatedAt && <span>Updated {formatUpdatedTime(updatedAt)}</span>}
      </div>

      {stories.length > 0 && (
        <div className="pulse-bar" role="group" aria-label="Edition summary">
          <span className="pulse-stat"><strong>{stories.length}</strong> stories</span>
          {newCount > 0 && (
            <span className="pulse-stat is-new"><span className="pulse-dot" /> <strong>{newCount}</strong> new<span className="wide-only"> since last visit</span></span>
          )}
          <button
            type="button"
            className={`pulse-stat pulse-toggle${unreadOnly ? " is-active" : ""}`}
            aria-pressed={unreadOnly}
            onClick={() => setUnreadOnly((value) => !value)}
          >
            <strong>{unreadCount}</strong> unread {unreadOnly ? "· showing" : ""}
          </button>
          {coverage && (
            <span
              className={`pulse-stat${missingLabel ? " is-partial" : ""}`}
              aria-describedby={missingLabel ? "source-gap" : undefined}
            >
              <strong>{coverage.successfulSources}</strong> of {SOURCES.length} sources
            </span>
          )}
        </div>
      )}
      {missingLabel && (
        <p className="source-gap" id="source-gap">
          Missing {missingLabel}.
        </p>
      )}

      <SearchField
        value={query}
        onChange={setQuery}
        placeholder="Search models, companies, topics…"
        label="Search AI news"
        shortcut
        onCommit={commitSearch}
        suggestions={{
          recent,
          trending,
          onClearRecent: () => { clearRecentSearches(); setRecent([]); },
        }}
      />
      <TopicChips active={activeTopic} onSelect={setActiveTopic} />

      <div className="source-groups">
        {SOURCE_GROUPS.map((group) => (
          <div className="source-group" key={group.id}>
            <span className="source-group-label" id={`sources-${group.id}`}>{group.label}</span>
            <div className="source-filter" role="group" aria-labelledby={`sources-${group.id}`}>
              {SOURCES.filter((source) => source.group === group.id).map((source) => {
                const active = activeSources.includes(source.id);
                return (
                  <button
                    type="button"
                    key={source.id}
                    className={`source-chip${active ? " is-active" : ""}`}
                    aria-pressed={active}
                    onClick={() => toggleSource(source.id)}
                    title={source.name}
                  >
                    <SourcePlate source={source.id} compact />
                    <span>{source.shortName}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {loading && stories.length === 0 ? (
        <div className="story-skeletons" aria-label="Loading news" aria-busy="true">
          <span className="skeleton skeleton-lead" />
          <span className="skeleton skeleton-row" />
          <span className="skeleton skeleton-row" />
        </div>
      ) : results.length === 0 ? (
        <StateMessage
          title={searching ? `No stories match “${query.trim()}”` : "Nothing here with these filters"}
          message={
            searching
              ? "Try fewer words, a shorter prefix, or remove a filter. Tip: source:verge or topic:policy."
              : unreadOnly
                ? "You're all caught up on these stories."
                : "Try another topic or source."
          }
          onRetry={filtersActive || searching ? resetFilters : undefined}
          retryLabel="Clear search and filters"
          compact
        />
      ) : searching ? (
        <section className="search-results" aria-labelledby="results-title">
          <div className="results-head">
            <h2 id="results-title" aria-live="polite">
              <strong>{results.length}</strong> {results.length === 1 ? "result" : "results"}
            </h2>
            <div className="segmented" role="group" aria-label="Sort results">
              {(["relevance", "newest"] as const).map((option) => (
                <button
                  type="button"
                  key={option}
                  aria-pressed={sort === option}
                  className={sort === option ? "is-active" : ""}
                  onClick={() => setSort(option)}
                >
                  {option === "relevance" ? "Best match" : "Newest"}
                </button>
              ))}
            </div>
          </div>
          <div className="feed-list">
            {results.map((story) => <StoryRow key={story.id} {...rowProps(story)} terms={terms} />)}
          </div>
        </section>
      ) : (
        <>
          <section className="lead-section" aria-label="Lead story">
            <StoryLead key={lead.id} {...rowProps(lead)} />
          </section>
          {groups.map(({ group, stories: groupStories }) => (
            <section className="feed-section" key={group} aria-label={group}>
              <div className="section-label">
                <h2>{group.toUpperCase()}</h2>
                <span>{groupStories.length} {groupStories.length === 1 ? "story" : "stories"}</span>
              </div>
              {groupStories.map((story) => (
                <StoryRow key={story.id} {...rowProps(story)} showTopic={activeTopic === "all"} />
              ))}
            </section>
          ))}
        </>
      )}

      <p className="shortcut-hint">
        Press <kbd>?</kbd> for keyboard shortcuts · <kbd>j</kbd> <kbd>k</kbd> to move · <kbd>s</kbd> to save
      </p>
      <ShortcutsDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
    </main>
  );
}
