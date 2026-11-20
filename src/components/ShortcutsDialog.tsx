import { useEffect, useRef } from "react";

const SHORTCUTS: [string[], string][] = [
  [["/"], "Search"],
  [["Ctrl", "K"], "Search from anywhere"],
  [["j"], "Next story"],
  [["k"], "Previous story"],
  [["Enter"], "Open briefing"],
  [["o"], "Open original article"],
  [["s"], "Save / unsave"],
  [["u"], "Unread only"],
  [["r"], "Refresh"],
  [["g", "h"], "Go home"],
  [["g", "t"], "Go to topics"],
  [["g", "r"], "Go to AI repos"],
  [["g", "l"], "Go to Learn"],
  [["g", "s"], "Go to saved"],
  [["Esc"], "Clear search / close"],
];

export function ShortcutsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="shortcuts-dialog"
      aria-labelledby="shortcuts-title"
      onClose={onClose}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div className="shortcuts-body">
        <div className="shortcuts-head">
          <h2 id="shortcuts-title">Keyboard shortcuts</h2>
          <button type="button" className="text-button" onClick={onClose}>Close</button>
        </div>
        <dl>
          {SHORTCUTS.map(([keys, label]) => (
            <div key={label}>
              <dt>{keys.map((key, index) => <kbd key={index}>{key}</kbd>)}</dt>
              <dd>{label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </dialog>
  );
}
