import react from "@vitejs/plugin-react";
import type { Connect, Plugin } from "vite";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import { FEED_USER_AGENT, SOURCES } from "./src/data/sources";

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
        headers: { "User-Agent": FEED_USER_AGENT },
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
  plugins: [
    react(),
    feedProxy,
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "favicon.ico", "apple-touch-icon-180x180.png"],
      manifest: {
        name: "AI Hunter-News",
        short_name: "Hunter-News",
        description: "A sharper lens on artificial intelligence — AI news from the best sources.",
        theme_color: "#F4EFE6",
        background_color: "#F4EFE6",
        display: "standalone",
        start_url: "/",
        scope: "/",
        categories: ["news"],
        icons: [
          { src: "pwa-64x64.png", sizes: "64x64", type: "image/png" },
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
          { src: "maskable-icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
        shortcuts: [
          { name: "Topics", url: "/topics" },
          { name: "Saved", url: "/saved" },
        ],
      },
      workbox: {
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/feeds\//],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith("/feeds/"),
            handler: "NetworkFirst",
            options: { cacheName: "feeds", networkTimeoutSeconds: 6, expiration: { maxEntries: 20, maxAgeSeconds: 86400 } },
          },
          {
            urlPattern: ({ url }) => url.origin === "https://fonts.googleapis.com",
            handler: "StaleWhileRevalidate",
            options: { cacheName: "google-fonts-css" },
          },
          {
            urlPattern: ({ url }) => url.origin === "https://fonts.gstatic.com",
            handler: "CacheFirst",
            options: { cacheName: "google-fonts-files", expiration: { maxEntries: 20, maxAgeSeconds: 31536000 }, cacheableResponse: { statuses: [0, 200] } },
          },
          {
            urlPattern: ({ request }) => request.destination === "image",
            handler: "StaleWhileRevalidate",
            options: { cacheName: "images", expiration: { maxEntries: 80, maxAgeSeconds: 604800 }, cacheableResponse: { statuses: [0, 200] } },
          },
        ],
      },
    }),
  ],
  server: { host: "127.0.0.1" },
});
