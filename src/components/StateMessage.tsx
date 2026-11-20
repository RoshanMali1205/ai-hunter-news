import { Link } from "react-router-dom";

interface StateMessageProps {
  title: string;
  message: string;
  action?: { label: string; to: string };
  onRetry?: () => void;
  retryLabel?: string;
  compact?: boolean;
}

export function StateMessage({
  title,
  message,
  action,
  onRetry,
  retryLabel = "Try again",
  compact = false,
}: StateMessageProps) {
  return (
    <div className={`state-message${compact ? " is-compact" : ""}`} role="status">
      <span className="state-mark" aria-hidden="true">·</span>
      <div>
        <h2>{title}</h2>
        <p>{message}</p>
        {onRetry && <button type="button" className="text-button" onClick={onRetry}>{retryLabel}</button>}
        {action && <Link className="text-button" to={action.to}>{action.label}</Link>}
      </div>
    </div>
  );
}
