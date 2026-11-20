import type { SourceId, TopicId } from "../types";

const FRONTIER_SOURCES = new Set<SourceId>(["openai", "deepmind", "anthropic", "google", "microsoft"]);

export function classifyTopic(title: string, summary: string, source: SourceId): TopicId {
  const text = `${title} ${summary} ${source}`.toLowerCase();

  if (
    /\b(congress|senate|lawmaker|legislation|regulator|regulation|federal|white house|faa|lawsuit|antitrust|export control|ai act|parliament|nist|ban on)\b/.test(
      text,
    )
  ) {
    return "policy";
  }
  if (/\b(nvidia|gpu|tsmc|semiconductor|foundry|chip|asml|hbm|wafer)\b/.test(text)) {
    return "chips";
  }
  if (
    /\b(startup|raises|funding|series (?:a|b|c)|seed round|valuation|ipo|neocloud)\b/.test(
      text,
    )
  ) {
    return "startups";
  }
  // Microsoft Research posts are research by definition.
  if (source === "msresearch" || /\b(arxiv|peer-reviewed|benchmark|dataset|researchers|study finds|paper)\b/.test(text)) {
    return "research";
  }

  if (
    FRONTIER_SOURCES.has(source) &&
    (/\b(introducing|announc(?:e|ed|es)|launch(?:es|ed)?|unveil(?:s|ed)?|weights)\b/.test(title.toLowerCase()) ||
      /\b(gpt|claude|gemini|llama|opus|sonnet|haiku|genie|phi|mai)[\s-]?\d+(?:\.\d+)?\b/i.test(title))
  ) {
    return "frontier-models";
  }

  return "products";
}
