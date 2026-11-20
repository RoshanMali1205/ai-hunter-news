import { Link, useParams } from "react-router-dom";
import { TOPICS } from "../data/sources";
import type { Story } from "../types";
import { StateMessage } from "./StateMessage";
import { StoryLead } from "./StoryLead";
import { StoryRow } from "./StoryRow";

interface TopicEditionPageProps {
  stories: Story[];
  savedStories: Story[];
  loading: boolean;
  onToggleSaved: (story: Story) => void;
}

export function TopicEditionPage({
  stories,
  savedStories,
  loading,
  onToggleSaved,
}: TopicEditionPageProps) {
  const { topicId } = useParams();
  const topic = TOPICS.find((item) => item.id === topicId);
  if (!topic) {
    return (
      <main className="page-content">
        <StateMessage
          title="Topic not found"
          message="That edition is not available."
          action={{ label: "Back to Home", to: "/" }}
        />
      </main>
    );
  }

  const topicStories = stories.filter((story) => story.topic === topic.id);
  const lead = topicStories[0];

  return (
    <main className="page-content topic-edition">
      <Link to="/topics" className="back-link">← All topics</Link>
      <header className="page-heading" style={{ "--topic-color": topic.color } as React.CSSProperties}>
        <span className="page-kicker">{topic.label.toUpperCase()} EDITION</span>
        <h1>{topic.label}</h1>
        <p>{topic.description}</p>
      </header>
      {!lead && loading && stories.length === 0 ? (
        <div className="story-skeletons" aria-label="Loading topic stories" aria-busy="true">
          <span className="skeleton skeleton-lead" />
          <span className="skeleton skeleton-row" />
          <span className="skeleton skeleton-row" />
        </div>
      ) : lead ? (
        <>
          <StoryLead
            key={lead.id}
            story={lead}
            saved={savedStories.some((story) => story.id === lead.id)}
            onToggleSaved={onToggleSaved}
          />
          <section className="feed-section" aria-labelledby="topic-feed-title">
            <div className="section-label">
              <h2 id="topic-feed-title">ALSO IN THIS EDITION</h2>
              <span>{topicStories.length - 1} stories</span>
            </div>
            {topicStories.slice(1).map((story) => (
              <StoryRow
                key={story.id}
                story={story}
                saved={savedStories.some((saved) => saved.id === story.id)}
                onToggleSaved={onToggleSaved}
              />
            ))}
          </section>
        </>
      ) : (
        <StateMessage
          title="No stories in this edition yet"
          message="Check back soon as new reports arrive from our sources."
          action={{ label: "Browse all stories", to: "/" }}
        />
      )}
    </main>
  );
}
