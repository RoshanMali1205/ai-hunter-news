import { TOPICS } from "../data/sources";
import type { TopicId } from "../types";

interface TopicChipsProps {
  active: TopicId | "all";
  onSelect: (topic: TopicId | "all") => void;
}

export function TopicChips({ active, onSelect }: TopicChipsProps) {
  return (
    <div className="topic-chips" aria-label="Filter by topic">
      <button
        type="button"
        className={`topic-chip${active === "all" ? " is-active" : ""}`}
        aria-pressed={active === "all"}
        onClick={() => onSelect("all")}
      >
        All
      </button>
      {TOPICS.map((topic) => (
        <button
          type="button"
          key={topic.id}
          className={`topic-chip${active === topic.id ? " is-active" : ""}`}
          style={{ "--topic-color": topic.color } as React.CSSProperties}
          aria-pressed={active === topic.id}
          onClick={() => onSelect(topic.id)}
        >
          {topic.label}
        </button>
      ))}
    </div>
  );
}
