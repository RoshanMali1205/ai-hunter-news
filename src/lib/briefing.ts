import { htmlToText } from "./html";
import { formatReadingTime } from "./readingTime";
import { TOPICS } from "../data/sources";
import type { SourceId, TopicId } from "../types";

const TRAILING_PROMOTION =
  /\s*(?:read more|continue reading|read the full story|continue to read|\[\s*\.{2,3}\s*\]|\u2026|\.{3})[\s\S]*$/i;

export function cleanBriefing(raw: string): string {
  const text = htmlToText(raw)
    .replace(TRAILING_PROMOTION, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return "";

  const sentences = text.split(/(?<=[.!?])\s+(?=[A-Z"'“‘])/).slice(0, 2);
  let briefing = sentences.join(" ").trim();
  if (briefing.length > 320) {
    const slice = briefing.slice(0, 320);
    const lastSpace = slice.lastIndexOf(" ");
    briefing = `${slice.slice(0, lastSpace > 0 ? lastSpace : 320).trimEnd()}…`;
  }
  return briefing;
}

export function fallbackBriefing(sourceName: string, topic: TopicId): string {
  const topicName = TOPICS.find((item) => item.id === topic)?.label.toLowerCase() ?? "AI";
  return `${sourceName} has published a new report in the ${topicName} area of artificial intelligence. It highlights a current development and directs readers to the original source for its facts, context, and any later updates.`;
}

export function ensureSentence(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /[.!?…]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

export function readingTime(value: string): number {
  return formatReadingTime(value);
}

export function sourceNameForBriefing(source: SourceId): string {
  const names: Record<SourceId, string> = {
    techcrunch: "TechCrunch",
    verge: "The Verge",
    mit: "MIT Technology Review",
    openai: "OpenAI",
    google: "Google",
    deepmind: "Google DeepMind",
    ars: "Ars Technica",
    anthropic: "Anthropic",
    microsoft: "Microsoft",
    msresearch: "Microsoft Research",
    ieee: "IEEE Spectrum",
    interconnects: "Interconnects",
    huggingface: "Hugging Face",
    mistral: "Mistral",
    nvidia: "NVIDIA",
  };
  return names[source];
}
