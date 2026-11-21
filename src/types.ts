export const TOPIC_IDS = [
  "frontier-models",
  "products",
  "research",
  "policy",
  "chips",
  "startups",
] as const;

export type TopicId = (typeof TOPIC_IDS)[number];
export type SourceId =
  | "techcrunch"
  | "verge"
  | "mit"
  | "openai"
  | "google"
  | "deepmind"
  | "ars"
  | "anthropic"
  | "microsoft"
  | "msresearch"
  | "ieee"
  | "interconnects"
  | "huggingface"
  | "mistral"
  | "nvidia";

export interface Story {
  id: string;
  title: string;
  source: SourceId;
  url: string;
  publishedAt: string;
  topic: TopicId;
  summary: string;
  image?: string;
}

export interface CachedEdition {
  updatedAt: string;
  stories: Story[];
}

export type FeedFormat = "rss" | "atom" | "html";
export type SourceGroup = "newsroom" | "lab";

export interface SourceDefinition {
  id: SourceId;
  name: string;
  shortName: string;
  initials: string;
  color: string;
  feedUrl: string;
  siteUrl: string;
  format: FeedFormat;
  group: SourceGroup;
}
