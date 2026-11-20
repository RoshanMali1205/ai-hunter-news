import { Icon } from "./Icon";

interface BookmarkButtonProps {
  saved: boolean;
  onClick: () => void;
  className?: string;
}

export function BookmarkButton({ saved, onClick, className = "" }: BookmarkButtonProps) {
  return (
    <button
      className={`bookmark-button${saved ? " is-saved" : ""} ${className}`.trim()}
      type="button"
      aria-label={saved ? "Remove from saved stories" : "Save story"}
      aria-pressed={saved}
      onClick={onClick}
    >
      <Icon name="bookmark" filled={saved} />
    </button>
  );
}
