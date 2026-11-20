import { SOURCES } from "../data/sources";
import { assignUniqueIds } from "./id";
import { parseFeed } from "./parseFeed";
import type { CachedEdition, SourceId, Story } from "../types";

export interface SourceCoverage {
  successfulSources: number;
  failedSourceIds: SourceId[];
}

export interface EditionResult extends CachedEdition, SourceCoverage {}

/** English list: "The Verge", "The Verge and Anthropic", "The Verge, MIT, and Anthropic". */
export function formatMissingSources(names: string[]): string {
  if (names.length <= 1) return names[0] ?? "";
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}

async function fetchSource(source: (typeof SOURCES)[number]): Promise<Story[]> {
  const response = await fetch(`/feeds/${source.id}`, {
    signal: AbortSignal.timeout(8_000),
    headers: { Accept: source.format === "html" ? "text/html" : "application/xml, text/xml, */*" },
  });
  if (!response.ok) throw new Error(`${source.name} returned ${response.status}`);
  const stories = parseFeed(await response.text(), source);
  if (stories.length === 0) throw new Error(`${source.name} returned no usable stories`);
  return stories;
}

export async function fetchEdition(): Promise<EditionResult> {
  const settled = await Promise.allSettled(SOURCES.map(fetchSource));
  const failedSourceIds = SOURCES.flatMap((source, index) =>
    settled[index]?.status === "rejected" ? [source.id] : [],
  );
  const storyGroups = settled
    .filter((result): result is PromiseFulfilledResult<Story[]> => result.status === "fulfilled")
    .map((result) => result.value);
  const successfulSources = storyGroups.length;
  const stories = storyGroups.flat().sort((left, right) => {
    const dateDifference = Date.parse(right.publishedAt) - Date.parse(left.publishedAt);
    return dateDifference || left.title.localeCompare(right.title);
  });
  const identifiedStories = assignUniqueIds(stories);
  if (identifiedStories.length === 0) throw new Error("No sources returned usable stories");

  return {
    updatedAt: new Date().toISOString(),
    stories: identifiedStories,
    successfulSources,
    failedSourceIds,
  };
}
