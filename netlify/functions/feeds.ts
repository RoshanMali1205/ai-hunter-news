import { FEED_USER_AGENT, SOURCES } from "../../src/data/sources";

// Serves /feeds/:id on Netlify, same as the Vite dev proxy, so the PWA can fetch live news.
export default async (_request: Request, context: { params: Record<string, string> }): Promise<Response> => {
  const source = SOURCES.find((candidate) => candidate.id === context.params.id);
  if (!source) return new Response(null, { status: 404 });

  try {
    const upstream = await fetch(source.feedUrl, {
      headers: { "User-Agent": FEED_USER_AGENT },
      redirect: "follow",
      signal: AbortSignal.timeout(8_000),
    });
    if (upstream.status !== 200) return new Response(null, { status: 502 });
    const type = (upstream.headers.get("content-type") ?? "").split(";")[0].trim();
    const allowed = type === "text/html" || type.includes("xml") || type === "application/rss";
    return new Response(await upstream.text(), {
      status: 200,
      headers: {
        "Content-Type": `${allowed ? type : "application/xml"}; charset=utf-8`,
        "Netlify-CDN-Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch {
    return new Response(null, { status: 502 });
  }
};

export const config = { path: "/feeds/:id" };
