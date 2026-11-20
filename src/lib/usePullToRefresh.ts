import { useEffect, useRef, useState } from "react";

const TRIGGER = 72;
const MAX = 110;

/**
 * Pull down at the top of the page to refresh (touch devices).
 * Returns the current pull distance so the page can draw an indicator.
 */
export function usePullToRefresh(onRefresh: () => void, enabled = true): number {
  const [pull, setPull] = useState(0);
  const start = useRef<number | null>(null);
  const pullRef = useRef(0);
  const refreshRef = useRef(onRefresh);
  refreshRef.current = onRefresh;

  useEffect(() => {
    if (!enabled) return;
    const onStart = (event: TouchEvent) => {
      start.current = window.scrollY <= 0 && event.touches.length === 1 ? event.touches[0].clientY : null;
    };
    const onMove = (event: TouchEvent) => {
      if (start.current === null) return;
      const distance = event.touches[0].clientY - start.current;
      if (distance <= 0 || window.scrollY > 0) { pullRef.current = 0; setPull(0); return; }
      // Resistance: the further you pull, the slower it moves.
      const eased = Math.min(MAX, distance * 0.5);
      pullRef.current = eased;
      setPull(eased);
    };
    const onEnd = () => {
      if (pullRef.current >= TRIGGER) refreshRef.current();
      start.current = null;
      pullRef.current = 0;
      setPull(0);
    };
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onEnd);
    window.addEventListener("touchcancel", onEnd);
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
      window.removeEventListener("touchcancel", onEnd);
    };
  }, [enabled]);

  return pull;
}

export const PULL_TRIGGER = TRIGGER;
