import { useState } from "react";
import { Link } from "react-router-dom";
import { SOURCE_BY_ID, TOPICS } from "../data/sources";
import { formatRelativeTime } from "../lib/time";
import type { Story } from "../types";
import { BookmarkButton } from "./BookmarkButton";
import { SourcePlate } from "./SourcePlate";

interface StoryLeadProps {
  story: Story;
  saved: boolean;
  onToggleSaved: (story: Story) => void;
}

export function StoryLead({ story, saved, onToggleSaved }: StoryLeadProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const topic = TOPICS.find((item) => item.id === story.topic);

  return (
    <article className="story-lead">
      <Link to={`/story/${story.id}`} className={`story-lead-visual${!story.image || imageFailed ? " no-image" : ""}`}>
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
        <span className="lead-topic" style={{ "--topic-color": topic?.color } as React.CSSProperties}>
          {topic?.label}
        </span>
      </Link>
      <div className="story-lead-copy">
        <div className="lead-byline">
          <SourcePlate source={story.source} compact />
          <span>{SOURCE_BY_ID[story.source].name}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={story.publishedAt}>{formatRelativeTime(story.publishedAt)}</time>
          <BookmarkButton
            saved={saved}
            onClick={() => onToggleSaved(story)}
            className="lead-bookmark"
          />
        </div>
        <Link to={`/story/${story.id}`} className="lead-headline-link">
          <h2>{story.title}</h2>
        </Link>
        <p>{story.summary}</p>
        <Link className="lead-read-more" to={`/story/${story.id}`}>
          Read the briefing <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}
