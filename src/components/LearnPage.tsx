import { useMemo, useState } from "react";
import {
  LEARNING_ITEMS,
  LEARNING_ROLES,
  LEARNING_VERIFIED_ON,
  type LearningCost,
  type LearningItem,
  type LearningKind,
  type LearningRole,
} from "../data/learning";
import { Icon } from "./Icon";
import { SearchField } from "./SearchField";
import { StateMessage } from "./StateMessage";

const DONE_KEY = "ai-hunter-news.learn-done";

const KIND_LABEL: Record<LearningKind, string> = {
  certification: "Certifications",
  course: "Courses",
  reference: "Learning sites & docs",
};
const COST_LABEL: Record<LearningCost, string> = {
  free: "Free",
  "free-learn": "Free to learn · paid certificate",
  exam: "Certification exam",
};
const COST_SHORT: Record<LearningCost, string> = { free: "Free", "free-learn": "Free to learn", exam: "Exam" };

function readDone(): Set<string> {
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(DONE_KEY) ?? "[]");
    return new Set(Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []);
  } catch {
    return new Set();
  }
}

const normalize = (value: string) => value.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "");

function LearningCard({
  item,
  done,
  onToggleDone,
  step,
}: {
  item: LearningItem;
  done: boolean;
  onToggleDone: (id: string) => void;
  step?: number;
}) {
  return (
    <article className={`learn-card kind-${item.kind}${done ? " is-done" : ""}`}>
      <a className="learn-card-link" href={item.url} target="_blank" rel="noopener noreferrer">
        <span className="learn-card-top">
          {step !== undefined && <span className="learn-step">{step}</span>}
          <span className="learn-provider">{item.provider}</span>
          {item.examCode && <span className="learn-code">{item.examCode}</span>}
          {item.beta && <span className="learn-code is-beta">Beta</span>}
        </span>
        <strong className="learn-title">{item.title}</strong>
        <span className="learn-note">{item.note}</span>
        <span className="learn-meta">
          <span className={`learn-cost cost-${item.cost}`} title={COST_LABEL[item.cost]}>{COST_SHORT[item.cost]}</span>
          <span className="learn-level">{item.level}</span>
          {step !== undefined && (
            <span className="learn-kind">{item.kind === "reference" ? "Docs" : item.kind === "course" ? "Course" : "Certification"}</span>
          )}
          <span className="learn-open" aria-hidden="true">Open ↗</span>
        </span>
      </a>
      <button
        type="button"
        className={`learn-done${done ? " is-done" : ""}`}
        aria-pressed={done}
        aria-label={done ? `Mark ${item.title} as not done` : `Mark ${item.title} as done`}
        title={done ? "Done" : "Mark as done"}
        onClick={() => onToggleDone(item.id)}
      >
        <Icon name="check" />
      </button>
    </article>
  );
}

export function LearnPage() {
  const [role, setRole] = useState<LearningRole | "all">("all");
  const [kind, setKind] = useState<LearningKind | "all">("all");
  const [freeOnly, setFreeOnly] = useState(false);
  const [query, setQuery] = useState("");
  const [done, setDone] = useState(() => readDone());

  const toggleDone = (id: string) =>
    setDone((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        window.localStorage.setItem(DONE_KEY, JSON.stringify([...next]));
      } catch {
        /* progress just won't persist */
      }
      return next;
    });

  const roleInfo = LEARNING_ROLES.find((item) => item.id === role);
  const pathItems = roleInfo ? roleInfo.path.map((id) => LEARNING_ITEMS.find((item) => item.id === id)!).filter(Boolean) : [];
  const pathDone = pathItems.filter((item) => done.has(item.id)).length;

  const words = normalize(query).split(/\s+/).filter(Boolean);
  const items = useMemo(
    () =>
      LEARNING_ITEMS.filter((item) => {
        if (role !== "all" && !item.roles.includes(role)) return false;
        if (kind !== "all" && item.kind !== kind) return false;
        if (freeOnly && item.cost !== "free") return false;
        if (!words.length) return true;
        const haystack = normalize(`${item.title} ${item.provider} ${item.note} ${item.examCode ?? ""} ${item.level}`);
        return words.every((word) => haystack.includes(word));
      }),
    [role, kind, freeOnly, words.join(" ")], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const groups = (["certification", "course", "reference"] as const)
    .map((group) => ({ group, items: items.filter((item) => item.kind === group) }))
    .filter((group) => group.items.length > 0);

  const certCount = LEARNING_ITEMS.filter((item) => item.kind === "certification").length;
  const freeCount = LEARNING_ITEMS.filter((item) => item.cost === "free").length;

  return (
    <main className="page-content learn-page">
      <header className="page-heading">
        <span className="page-kicker">LEVEL UP</span>
        <h1>Learn AI</h1>
        <p>
          Certifications, courses and the best learning sites for every role — {certCount} certifications and {freeCount} free
          resources from Anthropic, OpenAI, Microsoft, Google, AWS and more.
        </p>
      </header>

      <div className="role-tabs" role="tablist" aria-label="Choose your role">
        <button type="button" role="tab" aria-selected={role === "all"} className={role === "all" ? "is-active" : ""} onClick={() => setRole("all")}>
          All roles
        </button>
        {LEARNING_ROLES.map((item) => (
          <button
            type="button"
            role="tab"
            key={item.id}
            aria-selected={role === item.id}
            className={role === item.id ? "is-active" : ""}
            onClick={() => setRole(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {roleInfo && (
        <section className="learn-path" aria-labelledby="path-title">
          <div className="learn-path-head">
            <div>
              <h2 id="path-title">Suggested path · {roleInfo.label}</h2>
              <p>{roleInfo.description}</p>
            </div>
            <div className="learn-progress" aria-label={`${pathDone} of ${pathItems.length} steps done`}>
              <span className="learn-progress-bar"><span style={{ width: `${(pathDone / Math.max(1, pathItems.length)) * 100}%` }} /></span>
              <span>{pathDone}/{pathItems.length} done</span>
            </div>
          </div>
          <div className="learn-path-steps">
            {pathItems.map((item, index) => (
              <LearningCard key={item.id} item={item} step={index + 1} done={done.has(item.id)} onToggleDone={toggleDone} />
            ))}
          </div>
          {roleInfo.tip && <p className="learn-tip">💡 {roleInfo.tip}</p>}
        </section>
      )}

      <SearchField value={query} onChange={setQuery} placeholder="Search certifications, courses, exam codes…" label="Search learning resources" shortcut />

      <div className="learn-filters">
        <div className="segmented" role="group" aria-label="Type">
          {(["all", "certification", "course", "reference"] as const).map((option) => (
            <button type="button" key={option} className={kind === option ? "is-active" : ""} aria-pressed={kind === option} onClick={() => setKind(option)}>
              {option === "all" ? "All" : option === "certification" ? "Certifications" : option === "course" ? "Courses" : "Sites & docs"}
            </button>
          ))}
        </div>
        <button type="button" className={`pulse-stat pulse-toggle${freeOnly ? " is-active" : ""}`} aria-pressed={freeOnly} onClick={() => setFreeOnly((value) => !value)}>
          Free only
        </button>
      </div>

      {groups.length === 0 ? (
        <StateMessage
          title="Nothing matches these filters"
          message="Try another role or type, or turn off Free only."
          onRetry={() => { setKind("all"); setFreeOnly(false); setQuery(""); }}
          retryLabel="Clear filters"
          compact
        />
      ) : (
        groups.map(({ group, items: groupItems }) => (
          <section className="learn-section" key={group} aria-labelledby={`learn-${group}`}>
            <div className="section-label">
              <h2 id={`learn-${group}`}>{KIND_LABEL[group].toUpperCase()}</h2>
              <span>{groupItems.length}</span>
            </div>
            <div className="learn-grid">
              {groupItems.map((item) => (
                <LearningCard key={item.id} item={item} done={done.has(item.id)} onToggleDone={toggleDone} />
              ))}
            </div>
          </section>
        ))
      )}

      <p className="repo-status">
        Links, exam codes and status checked on {new Date(LEARNING_VERIFIED_ON).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}.
        Certifications change often — always confirm prices, exam versions and availability on the provider's page.
      </p>
    </main>
  );
}
