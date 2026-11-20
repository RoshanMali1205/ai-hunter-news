import { Link } from "react-router-dom";
import { SOURCE_BY_ID } from "../data/sources";
import { formatRelativeTime } from "../lib/time";
import type { Story } from "../types";
import { BookmarkButton } from "./BookmarkButton";
import { SourcePlate } from "./SourcePlate";

interface StoryRowProps {
  story: Story;
  saved: boolean;
  onToggleSaved: (story: Story) => void;
}

export function StoryRow({ story, saved, onToggleSaved }: StoryRowProps) {
  return (
    <article className="story-row">
      <Link className="story-row-main" to={`/story/${story.id}`}>
        <span className="story-row-copy">
          <span className="story-row-meta">
            {SOURCE_BY_ID[story.source].shortName}
            <span aria-hidden="true">·</span>
            {formatRelativeTime(story.publishedAt)}
          </span>
          <span className="story-row-title">{story.title}</span>
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
      <BookmarkButton
        saved={saved}
        onClick={() => onToggleSaved(story)}
        className="story-row-bookmark"
      />
    </article>
  );
}
