import { useEffect, useState } from "react";
import { Icon } from "./Icon";

/** Native share sheet on phones; copies the link elsewhere. */
export function ShareButton({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch (error) {
        if ((error as DOMException)?.name === "AbortError") return; // user closed the sheet
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      window.prompt("Copy this link", url);
    }
  };

  return (
    <button type="button" className={`share-button${copied ? " is-copied" : ""}`} onClick={() => void share()} aria-label="Share story">
      <Icon name={copied ? "check" : "share"} />
      <span className="share-label" role="status">{copied ? "Link copied" : "Share"}</span>
    </button>
  );
}
