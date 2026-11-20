import { useState } from "react";
import { Link } from "react-router-dom";
import { SOURCE_BY_ID, TOPICS } from "../data/sources";
import { formatDate, formatRelativeTime } from "../lib/time";
import type { Story } from "../types";
import { BookmarkButton } from "./BookmarkButton";
import { Icon } from "./Icon";
import { ShareButton } from "./ShareButton";
import { SourcePlate } from "./SourcePlate";
import { StoryRow } from "./StoryRow";
import { StateMessage } from "./StateMessage";

interface ArticleViewProps {
  story?: Story;
  allStories: Story[];
  savedStories: Story[];
  onToggleSaved: (story: Story) => void;
}

export function ArticleView({ story, allStories, savedStories, onToggleSaved }: ArticleViewProps) {
  const [imageFailed, setImageFailed] = useState(false);

  if (!story) {
    return (
      <main className="page-content">
        <StateMessage
          title="This story is not here"
          message="It may have moved or been removed from this edition."
          action={{ label: "Back to Home", to: "/" }}
        />
      </main>
    );
  }

  const source = SOURCE_BY_ID[story.source];
  const topic = TOPICS.find((item) => item.id === story.topic);
  const saved = savedStories.some((item) => item.id === story.id);
  const related = allStories
    .filter((item) => item.topic === story.topic && item.id !== story.id)
    .slice(0, 4);
  const wordCount = story.summary.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(wordCount / 200));

  return (
    <main className="article-page">
      <header className="story-sticky">
        <Link to="/" className="story-back"><Icon name="back" /> <span>News</span></Link>
        <div className="story-sticky-actions">
          <ShareButton title={story.title} url={story.url} />
          <BookmarkButton saved={saved} onClick={() => onToggleSaved(story)} />
        </div>
      </header>
      <article>
        <div className={`article-hero${!story.image || imageFailed ? " no-image" : ""}`}>
          {story.image && !imageFailed ? (
            <img
              src={story.image}
              alt=""
              referrerPolicy="no-referrer"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <SourcePlate source={story.source} />
          )}
        </div>
        <div className="article-copy">
          <p className="article-kicker" style={{ "--topic-color": topic?.color } as React.CSSProperties}>
            {topic?.label} <span aria-hidden="true">/</span> {source.name}
          </p>
          <h1>{story.title}</h1>
          <div className="article-dateline">
            <time dateTime={story.publishedAt}>{formatDate(story.publishedAt)}</time>
            <span aria-hidden="true">·</span>
            <span>{formatRelativeTime(story.publishedAt)}</span>
            <span aria-hidden="true">·</span>
            <span>{minutes} {minutes === 1 ? "min" : "mins"} read</span>
          </div>
          <div className="briefing-label"><span /> THE BRIEFING</div>
          <p className="article-briefing">{story.summary}</p>
          <a
            className="publisher-link"
            href={story.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Read at {source.name}<Icon name="external" />
          </a>
          <p className="publisher-footnote">
            Written for AI Hunter-News. The full article stays with {source.name}.
          </p>
        </div>
      </article>
      {related.length > 0 && (
        <section className="related-stories" aria-labelledby="related-title">
          <div className="section-label"><h2 id="related-title">MORE IN {topic?.label.toUpperCase()}</h2></div>
          {related.map((item) => (
            <StoryRow
              key={item.id}
              story={item}
              saved={savedStories.some((savedStory) => savedStory.id === item.id)}
              onToggleSaved={onToggleSaved}
            />
          ))}
        </section>
      )}
    </main>
  );
}
