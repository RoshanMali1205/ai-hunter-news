import { app, BrowserWindow, Menu, protocol, shell } from "electron";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(here, "..", "dist");
const devUrl = process.env.ELECTRON_START_URL;

// The app is served from a fixed custom origin (app://hunter-news) instead of a
// localhost server on a random port. Browser storage (saved stories, cached
// edition, theme) is keyed by origin, so a stable origin keeps it across restarts.
const SCHEME = "app";
const APP_ORIGIN = `${SCHEME}://hunter-news`;

// Must run before the app is ready. "standard" gives normal URL/relative-path
// semantics and "secure" makes it a secure context, which localStorage and
// fetch need to behave like they do on https.
protocol.registerSchemesAsPrivileged([
  { scheme: SCHEME, privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true, stream: true } },
]);

const MIME = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".json": "application/json", ".webmanifest": "application/manifest+json", ".svg": "image/svg+xml",
  ".png": "image/png", ".ico": "image/x-icon", ".woff2": "font/woff2",
};

const sourcesPromise = readFile(path.join(here, "sources.json"), "utf8").then(JSON.parse);

// Same /feeds/:id proxy the Vite dev server and the Netlify function provide,
// fetched from the main process so feeds load without browser CORS limits.
async function serveFeed(id) {
  const target = (await sourcesPromise)[id];
  if (!target) return new Response(null, { status: 404 });
  try {
    const upstream = await fetch(target, {
      headers: { "User-Agent": "Mozilla/5.0" },
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
    });
    if (upstream.status !== 200) return new Response(null, { status: 502 });
    const type = (upstream.headers.get("content-type") ?? "").split(";")[0].trim();
    const ok = type === "text/html" || type.includes("xml") || type === "application/rss";
    return new Response(await upstream.text(), {
      headers: { "Content-Type": `${ok ? type : "application/xml"}; charset=utf-8` },
    });
  } catch {
    return new Response(null, { status: 502 });
  }
}

async function serveFile(pathname) {
  let file = path.normalize(path.join(distDir, decodeURIComponent(pathname)));
  if (file !== distDir && !file.startsWith(distDir + path.sep)) return new Response(null, { status: 403 });
  const isFile = await stat(file).then((info) => info.isFile(), () => false);
  if (!isFile) file = path.join(distDir, "index.html"); // single-page app fallback
  try {
    return new Response(await readFile(file), {
      headers: { "Content-Type": MIME[path.extname(file)] ?? "application/octet-stream" },
    });
  } catch {
    return new Response(null, { status: 404 });
  }
}

function registerAppProtocol() {
  protocol.handle(SCHEME, (request) => {
    const url = new URL(request.url);
    if (url.host !== "hunter-news") return new Response(null, { status: 404 });
    const feed = url.pathname.match(/^\/feeds\/([^/]+)\/?$/);
    return feed ? serveFeed(feed[1]) : serveFile(url.pathname);
  });
}

function createWindow() {
  const origin = devUrl ? new URL(devUrl).origin : APP_ORIGIN;
  const win = new BrowserWindow({
    width: 1200, height: 820, minWidth: 380, minHeight: 560,
    backgroundColor: "#F4EFE6", title: "AI Hunter-News",
    icon: path.join(here, "..", "build", "icon.png"),
    webPreferences: { contextIsolation: true, sandbox: true },
  });
  Menu.setApplicationMenu(null);
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/.test(url)) void shell.openExternal(url);
    return { action: "deny" };
  });
  win.webContents.on("will-navigate", (event, url) => {
    // Compare by prefix: URL.origin is "null" for custom schemes like app://.
    if (url === origin || url.startsWith(`${origin}/`)) return;
    event.preventDefault();
    if (/^https?:/.test(url)) void shell.openExternal(url);
  });
  void win.loadURL(devUrl ?? `${APP_ORIGIN}/`);
}

if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.on("second-instance", () => {
    const [win] = BrowserWindow.getAllWindows();
    if (win) { if (win.isMinimized()) win.restore(); win.focus(); }
  });
  app.whenReady().then(() => {
    registerAppProtocol();
    createWindow();
  });
  app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
  app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
}
