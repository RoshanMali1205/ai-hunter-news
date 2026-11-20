import { useEffect, useState } from "react";
import { applyTheme, readTheme, writeTheme, type ThemeChoice } from "../lib/theme";
import { Icon } from "./Icon";

const NEXT: Record<ThemeChoice, ThemeChoice> = { system: "light", light: "dark", dark: "system" };
const LABEL: Record<ThemeChoice, string> = { system: "System theme", light: "Light theme", dark: "Dark theme" };
const ICON = { system: "monitor", light: "sun", dark: "moon" } as const;

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [choice, setChoice] = useState<ThemeChoice>(() => readTheme());

  // Follow OS changes while on "system", and stay in sync with other toggles on the page.
  useEffect(() => {
    const media = window.matchMedia?.("(prefers-color-scheme: dark)");
    const onSystemChange = () => { if (readTheme() === "system") applyTheme("system"); };
    const onSync = () => setChoice(readTheme());
    media?.addEventListener("change", onSystemChange);
    window.addEventListener("ahn-theme-change", onSync);
    return () => {
      media?.removeEventListener("change", onSystemChange);
      window.removeEventListener("ahn-theme-change", onSync);
    };
  }, []);

  return (
    <button
      type="button"
      className={`theme-toggle ${className}`.trim()}
      aria-label={`${LABEL[choice]} — switch to ${LABEL[NEXT[choice]].toLowerCase()}`}
      title={LABEL[choice]}
      onClick={() => {
        const next = NEXT[choice];
        writeTheme(next);
        setChoice(next);
        window.dispatchEvent(new Event("ahn-theme-change"));
      }}
    >
      <Icon name={ICON[choice]} />
      <span className="theme-toggle-label">{LABEL[choice]}</span>
    </button>
  );
}
