import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "./Icon";

interface SearchSuggestions {
  recent: string[];
  trending: { term: string; count: number }[];
  onClearRecent?: () => void;
}

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  /** Focus with "/" or Ctrl/⌘+K from anywhere on the page. */
  shortcut?: boolean;
  /** Shown in a dropdown while the field is focused and empty. */
  suggestions?: SearchSuggestions;
  /** Called when a search "settles" (Enter, or a pause in typing) — used for recent searches. */
  onCommit?: (value: string) => void;
}

const isTypingTarget = (target: EventTarget | null) =>
  target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));

export function SearchField({
  value,
  onChange,
  placeholder = "Search stories",
  label = "Search stories",
  shortcut = false,
  suggestions,
  onCommit,
}: SearchFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  const panelId = useId();
  const hasQuery = value.trim().length > 0;

  useEffect(() => {
    if (!shortcut) return;
    const onKey = (event: KeyboardEvent) => {
      const commandK = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      const slash = event.key === "/" && !event.metaKey && !event.ctrlKey && !isTypingTarget(event.target);
      if (commandK || slash) {
        event.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shortcut]);

  // Remember a search once the reader pauses typing.
  useEffect(() => {
    if (!onCommit || value.trim().length < 2) return;
    const timer = window.setTimeout(() => onCommit(value), 1500);
    return () => window.clearTimeout(timer);
  }, [value, onCommit]);

  const showPanel =
    focused && !hasQuery && suggestions && (suggestions.recent.length > 0 || suggestions.trending.length > 0);

  const pick = (term: string) => {
    onChange(term);
    onCommit?.(term);
  };

  return (
    <div className={`search${showPanel ? " is-open" : ""}`}>
      <label className={`search-field${hasQuery ? " has-value" : ""}`}>
        <Icon name="search" />
        <input
          ref={inputRef}
          aria-label={label}
          aria-controls={suggestions ? panelId : undefined}
          aria-expanded={suggestions ? Boolean(showPanel) : undefined}
          type="search"
          enterKeyHint="search"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              if (hasQuery) onChange("");
              else event.currentTarget.blur();
            } else if (event.key === "Enter") {
              onCommit?.(value);
              event.currentTarget.blur(); // closes the on-screen keyboard on phones
            }
          }}
        />
        {hasQuery ? (
          <button type="button" aria-label="Clear search" onClick={() => { onChange(""); inputRef.current?.focus(); }}>
            <Icon name="close" />
          </button>
        ) : (
          shortcut && <kbd className="search-kbd" aria-hidden="true">/</kbd>
        )}
      </label>

      {showPanel && (
        // onMouseDown preventDefault keeps focus in the input while clicking a suggestion.
        <div id={panelId} className="search-panel" onMouseDown={(event) => event.preventDefault()}>
          {suggestions.recent.length > 0 && (
            <div className="search-panel-group">
              <div className="search-panel-label">
                <span>Recent</span>
                {suggestions.onClearRecent && (
                  <button type="button" className="search-panel-clear" onClick={suggestions.onClearRecent}>Clear</button>
                )}
              </div>
              {suggestions.recent.map((term) => (
                <button type="button" key={term} className="search-recent" onClick={() => pick(term)}>
                  <Icon name="clock" /> <span>{term}</span>
                </button>
              ))}
            </div>
          )}
          {suggestions.trending.length > 0 && (
            <div className="search-panel-group">
              <div className="search-panel-label"><span>Trending in this edition</span></div>
              <div className="search-trending">
                {suggestions.trending.map(({ term, count }) => (
                  <button type="button" key={term} className="search-trend" onClick={() => pick(term)}>
                    {term} <span>{count}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <p className="search-syntax">
            Tip: <code>source:verge</code> <code>topic:policy</code> <code>"exact phrase"</code> <code>-exclude</code>
          </p>
        </div>
      )}
    </div>
  );
}
