import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { SOURCES } from "../data/sources";
import { formatUpdatedTime } from "../lib/time";
import type { Story, TopicId } from "../types";
import { Icon } from "./Icon";
import { SearchField } from "./SearchField";
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
}

export function HomePage({
  stories,
  savedStories,
  loading,
  updatedAt,
  onToggleSaved,
  onRefresh,
  refreshing,
}: HomePageProps) {
  const [query, setQuery] = useState("");
  const [activeTopic, setActiveTopic] = useState<TopicId | "all">("all");
  const search = query.trim().toLowerCase();
  const matchingStories = useMemo(
    () =>
      stories.filter((story) => {
        const topicMatch = activeTopic === "all" || story.topic === activeTopic;
        const searchMatch =
          !search ||
          `${story.title} ${story.summary} ${SOURCES.find((source) => source.id === story.source)?.name ?? story.source}`
            .toLowerCase()
            .includes(search);
        return topicMatch && searchMatch;
      }),
    [stories, activeTopic, search],
  );
  const lead = matchingStories[0];

  return (
    <main>
      <header className="home-header">
        <Link className="wordmark" to="/" aria-label="AI Hunter-News home">
          <span className="wordmark-monogram">AH</span>
          <span className="wordmark-copy">
            <span className="wordmark-kicker">AI WORLD NEWS</span>
            <span className="wordmark-name">AI Hunter-News</span>
          </span>
        </Link>
        <div className="header-actions">
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
        <time dateTime={new Date().toISOString()}>{new Intl.DateTimeFormat(undefined, {
          weekday: "long",
          month: "long",
          day: "numeric",
        }).format(new Date())}</time>
        {updatedAt && <span>Updated {formatUpdatedTime(updatedAt)}</span>}
      </div>

      <SearchField value={query} onChange={setQuery} placeholder="Search AI news" />
      <TopicChips active={activeTopic} onSelect={setActiveTopic} />

      {loading && stories.length === 0 ? (
        <div className="story-skeletons" aria-label="Loading news" aria-busy="true">
          <span className="skeleton skeleton-lead" />
          <span className="skeleton skeleton-row" />
          <span className="skeleton skeleton-row" />
        </div>
      ) : matchingStories.length === 0 ? (
        <StateMessage
          title={search ? `No stories found for “${query.trim()}”` : "No stories in this topic yet"}
          message="Try a different title, summary, or source."
          compact
        />
      ) : (
        <>
          <section className="lead-section" aria-label="Lead story">
            <StoryLead
              key={lead.id}
              story={lead}
              saved={savedStories.some((story) => story.id === lead.id)}
              onToggleSaved={onToggleSaved}
            />
          </section>
          <section className="feed-section" aria-labelledby="feed-title">
            <div className="section-label">
              <h2 id="feed-title">ALSO IN THE FEED</h2>
              <span>{Math.max(0, matchingStories.length - 1)} stories</span>
            </div>
            {matchingStories.slice(1).map((story) => (
              <StoryRow
                key={story.id}
                story={story}
                saved={savedStories.some((saved) => saved.id === story.id)}
                onToggleSaved={onToggleSaved}
              />
            ))}
          </section>
        </>
      )}
    </main>
  );
}
