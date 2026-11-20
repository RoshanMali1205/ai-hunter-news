import { useMemo, useState } from "react";
import { highlightTerms, isQueryActive, parseQuery, searchStories } from "../lib/search";
import { SearchField } from "./SearchField";
import { StateMessage } from "./StateMessage";
import { StoryRow } from "./StoryRow";
import type { Story } from "../types";

interface SavedPageProps {
  savedStories: Story[];
  onToggleSaved: (story: Story) => void;
}

export function SavedPage({ savedStories, onToggleSaved }: SavedPageProps) {
  const [query, setQuery] = useState("");
  const parsed = useMemo(() => parseQuery(query), [query]);
  const terms = useMemo(() => highlightTerms(parsed), [parsed]);
  const stories = useMemo(
    () => (isQueryActive(parsed) ? searchStories(savedStories, parsed).map((result) => result.story) : savedStories),
    [savedStories, parsed],
  );

  return (
    <main className="page-content">
      <header className="page-heading">
        <span className="page-kicker">KEPT CLOSE, ON THIS DEVICE</span>
        <h1>Saved stories</h1>
        <p>Your reading list lives here, just for you.</p>
      </header>
      <SearchField value={query} onChange={setQuery} placeholder="Search saved stories" />
      {stories.length ? (
        <section className="saved-list" aria-label="Saved stories">
          {stories.map((story) => (
            <StoryRow
              key={story.id}
              story={story}
              saved
              onToggleSaved={onToggleSaved}
              terms={terms}
            />
          ))}
        </section>
      ) : savedStories.length ? (
        <StateMessage
          title={`No saved stories match “${query.trim()}”`}
          message="Try a different search or clear the search field."
          compact
        />
      ) : (
        <StateMessage
          title="Nothing saved yet"
          message="Bookmark a story and it will be kept here on this device."
          action={{ label: "Browse the latest", to: "/" }}
        />
      )}
    </main>
  );
}
