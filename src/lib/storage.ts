import type { CachedEdition, Story } from "../types";
import { SOURCES } from "../data/sources";
import { TOPIC_IDS } from "../types";

const sourceIds = new Set<string>(SOURCES.map((source) => source.id));
const topicIds = new Set<string>(TOPIC_IDS);

export const EDITION_STORAGE_KEY = "ai-hunter-news.edition";
export const SAVED_STORAGE_KEY = "ai-hunter-news.saved";

function readJson<T>(key: string, validate: (value: unknown) => value is T): T | undefined {
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(key) ?? "null");
    return validate(value) ? value : undefined;
  } catch {
    return undefined;
  }
}

function isStory(value: unknown): value is Story {
  if (!value || typeof value !== "object") return false;
  const story = value as Partial<Story>;
  return (
    typeof story.id === "string" &&
    typeof story.title === "string" &&
    typeof story.source === "string" &&
    sourceIds.has(story.source) &&
    typeof story.url === "string" &&
    typeof story.publishedAt === "string" &&
    Number.isFinite(Date.parse(story.publishedAt)) &&
    typeof story.topic === "string" &&
    topicIds.has(story.topic) &&
    typeof story.summary === "string" &&
    (story.image === undefined || typeof story.image === "string")
  );
}

export function readEdition(): CachedEdition | undefined {
  return readJson(EDITION_STORAGE_KEY, (value): value is CachedEdition => {
    if (!value || typeof value !== "object") return false;
    const edition = value as Partial<CachedEdition>;
    return (
      typeof edition.updatedAt === "string" &&
      Number.isFinite(Date.parse(edition.updatedAt)) &&
      Array.isArray(edition.stories) &&
      edition.stories.every(isStory)
    );
  });
}

export function writeEdition(edition: CachedEdition): boolean {
  try {
    window.localStorage.setItem(EDITION_STORAGE_KEY, JSON.stringify(edition));
    return true;
  } catch {
    return false;
  }
}

export function readSavedStories(): Story[] {
  return readJson(SAVED_STORAGE_KEY, (value): value is Story[] =>
    Array.isArray(value) && value.every(isStory),
  ) ?? [];
}

export function writeSavedStories(stories: Story[]): boolean {
  try {
    window.localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(stories));
    return true;
  } catch {
    return false;
  }
}

export function toggleSavedStory(stories: Story[], story: Story): Story[] {
  return stories.some((saved) => saved.id === story.id)
    ? stories.filter((saved) => saved.id !== story.id)
    : [story, ...stories];
}
