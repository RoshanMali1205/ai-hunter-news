import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CURATED_REPOS } from "../data/repos";
import { SOURCES, TOPICS } from "../data/sources";
import { highlightTerms, isQueryActive, parseQuery, searchStories } from "../lib/search";
import type { Story } from "../types";
import { Icon } from "./Icon";
import { SearchField } from "./SearchField";
import { SourcePlate } from "./SourcePlate";
import { StateMessage } from "./StateMessage";
import { StoryRow } from "./StoryRow";

interface TopicsPageProps {
  stories: Story[];
  savedStories: Story[];
  loading: boolean;
  onToggleSaved: (story: Story) => void;
}

export function TopicsPage({ stories, savedStories, loading, onToggleSaved }: TopicsPageProps) {
  const [query, setQuery] = useState("");
  const trimmedQuery = query.trim();
  const parsed = useMemo(() => parseQuery(query), [query]);
  const terms = useMemo(() => highlightTerms(parsed), [parsed]);
  const results = useMemo(
    () => (isQueryActive(parsed) ? searchStories(stories, parsed).map((result) => result.story) : []),
    [stories, parsed],
  );

  return (
    <main className="page-content">
      <header className="page-heading">
        <span className="page-kicker">EXPLORE THE FIELD</span>
        <h1>Topics</h1>
        <p>Follow the part of AI you care about most.</p>
      </header>
      <SearchField
        value={query}
        onChange={setQuery}
        placeholder="Search topics and stories"
        label="Search topics and stories"
      />

      {trimmedQuery ? (
        <section className="topic-search-results" aria-label="Topic search results">
          {loading && stories.length === 0 ? (
            <div className="story-skeletons" aria-label="Searching stories" aria-busy="true">
              <span className="skeleton skeleton-row" />
              <span className="skeleton skeleton-row" />
            </div>
          ) : results.length ? (
            results.map((story) => (
              <StoryRow
                key={story.id}
                story={story}
                saved={savedStories.some((item) => item.id === story.id)}
                onToggleSaved={onToggleSaved}
                terms={terms}
              />
            ))
          ) : (
            <StateMessage
              title={`No results for “${trimmedQuery}”`}
              message="Try another topic, publisher, or headline."
              compact
            />
          )}
        </section>
      ) : (
        <>
          <section className="topic-grid" aria-label="All topics">
            {TOPICS.map((topic) => {
              const count = stories.filter((story) => story.topic === topic.id).length;
              return (
                <Link
                  className="topic-card"
                  key={topic.id}
                  to={`/topics/${topic.id}`}
                  style={{ "--topic-color": topic.color } as React.CSSProperties}
                >
                  <span className="topic-card-mark" aria-hidden="true" />
                  <span className="topic-card-name">{topic.label}</span>
                  <span className="topic-card-description">{topic.description}</span>
                  <span className="topic-card-count">{count} {count === 1 ? "story" : "stories"} <span>→</span></span>
                </Link>
              );
            })}
          </section>

          <Link className="repos-promo" to="/repos">
            <span className="repos-promo-icon" aria-hidden="true"><Icon name="repo" /></span>
            <span className="repos-promo-copy">
              <span className="page-kicker">FOR BUILDERS</span>
              <strong>AI repos worth starring</strong>
              <span>{CURATED_REPOS.length} hand-picked GitHub repos from Karpathy, Andrew Ng, Simon Willison, Sebastian Raschka and more, plus what's rising this month.</span>
            </span>
            <span className="repos-promo-arrow" aria-hidden="true">→</span>
          </Link>

          <section className="sources-section" aria-labelledby="sources-title">
            <div className="section-label"><h2 id="sources-title">THE SOURCES</h2><span>8 publishers</span></div>
            <div className="source-list">
              {SOURCES.map((source) => (
                <a
                  className="source-list-item"
                  href={source.siteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  key={source.id}
                >
                  <SourcePlate source={source.id} compact />
                  <span>{source.name}</span>
                  <span className="source-list-arrow" aria-hidden="true">↗</span>
                </a>
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  );
}
