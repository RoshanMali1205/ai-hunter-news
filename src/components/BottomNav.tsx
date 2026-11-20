import { NavLink } from "react-router-dom";
import { Icon, type IconName } from "./Icon";

interface BottomNavProps {
  savedCount: number;
}

const items: { to: string; label: string; icon: IconName; end?: boolean }[] = [
  { to: "/", label: "Home", icon: "home", end: true },
  { to: "/topics", label: "Topics", icon: "topics" },
  { to: "/saved", label: "Saved", icon: "saved" },
];

export function BottomNav({ savedCount }: BottomNavProps) {
  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) => `bottom-nav-link${isActive ? " is-active" : ""}`}
        >
          <span className="bottom-nav-icon">
            <Icon name={item.icon} />
            {item.label === "Saved" && savedCount > 0 && (
              <span className="saved-badge">{savedCount > 9 ? "9+" : savedCount}</span>
            )}
          </span>
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
