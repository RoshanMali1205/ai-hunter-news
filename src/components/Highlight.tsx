import { splitHighlights } from "../lib/search";

export function Highlight({ text, terms }: { text: string; terms?: string[] }) {
  if (!terms?.length) return <>{text}</>;
  return (
    <>
      {splitHighlights(text, terms).map((part, index) =>
        part.hit ? <mark key={index}>{part.text}</mark> : <span key={index}>{part.text}</span>,
      )}
    </>
  );
}
