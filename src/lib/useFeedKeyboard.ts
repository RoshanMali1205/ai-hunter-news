import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export interface FeedKeyboardActions {
  onToggleSaved: (storyId: string) => void;
  onOpenOriginal: (storyId: string) => void;
  onRefresh?: () => void;
  onToggleUnread?: () => void;
  onHelp: () => void;
}

const isTypingTarget = (target: EventTarget | null) =>
  target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));

/**
 * Keyboard navigation for story lists (elements marked with data-feed-item):
 *   j / k  next / previous story     Enter  open briefing
 *   s      save / unsave             o      open original article
 *   r      refresh                   u      toggle unread-only
 *   ?      show shortcuts
 */
export function useFeedKeyboard(actions: FeedKeyboardActions): void {
  const navigate = useNavigate();
  const ref = useRef(actions);
  ref.current = actions;

  useEffect(() => {
    const items = () => [...document.querySelectorAll<HTMLElement>("[data-feed-item]")];
    const currentIndex = (list: HTMLElement[]) => list.findIndex((item) => item.contains(document.activeElement));
    const focusItem = (item: HTMLElement | undefined) => {
      const link = item?.querySelector<HTMLElement>("a");
      if (!link) return;
      link.focus({ preventScroll: true });
      item!.scrollIntoView({ block: "nearest", behavior: "smooth" });
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || isTypingTarget(event.target)) return;
      const list = items();
      const index = currentIndex(list);
      const storyId = index >= 0 ? list[index].dataset.storyId : undefined;

      switch (event.key) {
        case "j":
          event.preventDefault();
          focusItem(list[Math.min(list.length - 1, index + 1)]);
          break;
        case "k":
          event.preventDefault();
          focusItem(list[Math.max(0, index - 1)]);
          break;
        case "s":
          if (storyId) { event.preventDefault(); ref.current.onToggleSaved(storyId); }
          break;
        case "o":
          if (storyId) { event.preventDefault(); ref.current.onOpenOriginal(storyId); }
          break;
        case "r":
          if (ref.current.onRefresh) { event.preventDefault(); ref.current.onRefresh(); }
          break;
        case "u":
          if (ref.current.onToggleUnread) { event.preventDefault(); ref.current.onToggleUnread(); }
          break;
        case "?":
          event.preventDefault();
          ref.current.onHelp();
          break;
        case "g":
          // "g" then "h" / "t" / "r" / "s": go to home / topics / repos / saved
          event.preventDefault();
          {
            const next = (second: KeyboardEvent) => {
              window.removeEventListener("keydown", next, true);
              const target = { h: "/", t: "/topics", r: "/repos", l: "/learn", s: "/saved" }[second.key];
              if (target) { second.preventDefault(); second.stopPropagation(); navigate(target); }
            };
            window.addEventListener("keydown", next, true);
            window.setTimeout(() => window.removeEventListener("keydown", next, true), 1200);
          }
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);
}
