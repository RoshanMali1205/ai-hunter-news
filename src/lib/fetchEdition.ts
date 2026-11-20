import { SOURCES } from "../data/sources";
import { assignUniqueIds } from "./id";
import { parseFeed } from "./parseFeed";
import type { CachedEdition, Story } from "../types";

export interface EditionResult extends CachedEdition {
  successfulSources: number;
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
  };
}
