import react from "@vitejs/plugin-react";
import type { Connect, Plugin } from "vite";
import { defineConfig } from "vite";
import { SOURCES } from "./src/data/sources";

function installFeedProxy(middlewares: Connect.Server): void {
  middlewares.use(async (request, response, next) => {
    if (request.method !== "GET") return next();
    const url = new URL(request.url ?? "/", "http://localhost");
    const match = url.pathname.match(/^\/feeds\/([^/]+)\/?$/);
    if (!match) return next();

    const source = SOURCES.find((candidate) => candidate.id === match[1]);
    if (!source) return next();

    try {
      const upstream = await fetch(source.feedUrl, {
        headers: { "User-Agent": "Mozilla/5.0" },
        redirect: "follow",
        signal: AbortSignal.timeout(8_000),
      });
      if (upstream.status !== 200) {
        response.statusCode = 502;
        response.end();
        return;
      }

      const body = await upstream.text();
      const upstreamType = (upstream.headers.get("content-type") ?? "").split(";")[0].trim();
      const contentTypeAllowed =
        upstreamType === "text/html" ||
        upstreamType.includes("xml") ||
        upstreamType === "application/rss";
      response.statusCode = 200;
      response.setHeader(
        "Content-Type",
        `${contentTypeAllowed ? upstreamType : "application/xml"}; charset=utf-8`,
      );
      response.end(body);
    } catch {
      response.statusCode = 502;
      response.end();
    }
  });
}

const feedProxy: Plugin = {
  name: "ai-hunter-news-feed-proxy",
  configureServer(server) {
    installFeedProxy(server.middlewares);
  },
  configurePreviewServer(server) {
    installFeedProxy(server.middlewares);
  },
};

export default defineConfig({
  plugins: [react(), feedProxy],
  server: { host: "127.0.0.1" },
});
