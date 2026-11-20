import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { BottomNav } from "./BottomNav";

interface ShellProps {
  savedCount: number;
  error?: string;
  storageError?: string;
  onRetry: () => void;
}

export function Shell({ savedCount, error, storageError, onRetry }: ShellProps) {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname]);

  return (
    <div className="app-column">
      <div className="top-rule" aria-hidden="true"><span /></div>
      {error && (
        <div className="refresh-banner" role="status">
          <span>{error}</span>
          <button type="button" className="text-button" onClick={onRetry}>Retry</button>
        </div>
      )}
      {storageError && <div className="storage-banner" role="status">{storageError}</div>}
      <Outlet />
      <BottomNav savedCount={savedCount} />
    </div>
  );
}
