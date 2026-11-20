import { Link } from "react-router-dom";
import { SOURCE_BY_ID, TOPICS } from "../data/sources";
import { snippet } from "../lib/search";
import { formatRelativeTime } from "../lib/time";
import type { Story } from "../types";
import { BookmarkButton } from "./BookmarkButton";
import { Highlight } from "./Highlight";
import { SourcePlate } from "./SourcePlate";

interface StoryRowProps {
  story: Story;
  saved: boolean;
  onToggleSaved: (story: Story) => void;
  /** Search terms to highlight; also shows a summary snippet. */
  terms?: string[];
  read?: boolean;
  isNew?: boolean;
  showTopic?: boolean;
}

export function StoryRow({ story, saved, onToggleSaved, terms, read = false, isNew = false, showTopic = false }: StoryRowProps) {
  const topic = TOPICS.find((item) => item.id === story.topic);
  const searching = Boolean(terms?.length);
  return (
    <article className={`story-row${read ? " is-read" : ""}`} data-feed-item data-story-id={story.id}>
      <Link className="story-row-main" to={`/story/${story.id}`}>
        <span className="story-row-copy">
          <span className="story-row-meta">
            {isNew && <span className="new-badge">New</span>}
            <Highlight text={SOURCE_BY_ID[story.source].shortName} terms={terms} />
            <span aria-hidden="true">·</span>
            <time dateTime={story.publishedAt}>{formatRelativeTime(story.publishedAt)}</time>
            {(showTopic || searching) && topic && (
              <span className="row-topic" style={{ "--topic-color": topic.color } as React.CSSProperties}>
                {topic.label}
              </span>
            )}
          </span>
          <span className="story-row-title"><Highlight text={story.title} terms={terms} /></span>
          {searching && (
            <span className="story-row-snippet"><Highlight text={snippet(story.summary, terms!)} terms={terms} /></span>
          )}
        </span>
        {story.image ? (
          <img
            className="story-row-image"
            src={story.image}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={(event) => {
              event.currentTarget.hidden = true;
              event.currentTarget.nextElementSibling?.classList.remove("is-hidden");
            }}
          />
        ) : null}
        <span className={`story-row-plate${story.image ? " is-hidden" : ""}`}>
          <SourcePlate source={story.source} compact />
        </span>
      </Link>
      <BookmarkButton saved={saved} onClick={() => onToggleSaved(story)} className="story-row-bookmark" />
    </article>
  );
}
