import type { SVGProps } from "react";

export type IconName =
  | "search"
  | "close"
  | "bookmark"
  | "arrow"
  | "external"
  | "refresh"
  | "home"
  | "topics"
  | "saved"
  | "back"
  | "clock"
  | "check"
  | "sun"
  | "moon"
  | "monitor"
  | "share"
  | "star"
  | "copy"
  | "repo"
  | "cap";

const paths: Record<IconName, string> = {
  search: "M20 20l-4.4-4.4M18 10.5a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z",
  close: "m18 6-12 12M6 6l12 12",
  bookmark: "M6 4.8A1.8 1.8 0 0 1 7.8 3h8.4A1.8 1.8 0 0 1 18 4.8V21l-6-4-6 4V4.8Z",
  arrow: "M4 12h15m-6-6 6 6-6 6",
  external: "M14 4h6v6m-11 5L20 4M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5",
  refresh: "M20 7v5h-5M4 17v-5h5m-4.1-3a7 7 0 0 1 11.6-2.6L20 12M4 12l3.5 5.6A7 7 0 0 0 19.1 15",
  home: "m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10Z",
  topics: "M4 4h7v7H4zM14 4h6v4h-6zM14 11h6v9h-6zM4 14h7v6H4z",
  saved: "M6 4.8A1.8 1.8 0 0 1 7.8 3h8.4A1.8 1.8 0 0 1 18 4.8V21l-6-4-6 4V4.8Z",
  back: "m15 18-6-6 6-6M9 12h11",
  clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm0-16v6l4 2",
  check: "m5 12 4 4L19 6",
  star: "m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z",
  copy: "M9 9h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V10a1 1 0 0 1 1-1ZM5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1",
  cap: "M2 9.5 12 5l10 4.5-10 4.5L2 9.5ZM6 11.3V16c0 1.4 2.7 3 6 3s6-1.6 6-3v-4.7M22 9.5V15",
  repo: "M5 4.5A2.5 2.5 0 0 1 7.5 2H19v16H7.5A2.5 2.5 0 0 0 5 20.5v-16ZM5 20.5A2.5 2.5 0 0 0 7.5 23H19v-5M9 6h6",
  share: "M12 3v12M7.5 7.5 12 3l4.5 4.5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6",
  sun: "M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM12 1.5v2M12 20.5v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1.5 12h2M20.5 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4",
  moon: "M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z",
  monitor: "M3 5a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5ZM8 21h8M12 17v4",
};

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
  filled?: boolean;
}

export function Icon({ name, filled, ...props }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d={paths[name]} />
    </svg>
  );
}
