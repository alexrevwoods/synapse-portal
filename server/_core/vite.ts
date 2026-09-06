import express, { type Express, type Request } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";

type RenderedPage = { html: string; state: unknown; head: { title: string; description: string; image: string; canonicalPath: string; type: "website" | "article"; robots: string; jsonLd?: Record<string, unknown> } };
type PublicRenderer = {
  loadPublicPage: (url: string) => Promise<RenderedPage>;
  renderHead: (head: { title: string; description: string; image: string; canonicalPath: string; type: "website" | "article"; robots: string; jsonLd?: Record<string, unknown> }, origin: string) => string;
};

function requestOrigin(req: Request) {
  const forwarded = req.headers["x-forwarded-proto"];
  const protocol = typeof forwarded === "string" ? forwarded.split(",")[0] : req.protocol || "https";
  return `${protocol}://${req.get("host")}`;
}

function serializeState(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}

function fillPage(template: string, page: RenderedPage, renderer: PublicRenderer, req: Request) {
  return template
    .replace("<!--whoarewe-head-->", renderer.renderHead(page.head, requestOrigin(req)))
    .replace("<!--whoarewe-app-->", page.html)
    .replace("<!--whoarewe-state-->", serializeState(page.state));
}

function pageCacheControl(page: RenderedPage) {
  // Public SSR data is loaded without credentials. Internal routes remain
  // private so account-specific shells cannot enter a shared cache.
  return page.head.robots.startsWith("index,follow")
    ? "public, max-age=300, s-maxage=900, stale-while-revalidate=3600"
    : "private, no-store";
}

// Manus Debug Collector writes browser diagnostics locally during development.
const PROJECT_ROOT = import.meta.dirname;
const LOG_DIR = path.join(PROJECT_ROOT, ".manus-logs");
const MAX_LOG_SIZE_BYTES = 1 * 1024 * 1024;
const TRIM_TARGET_BYTES = Math.floor(MAX_LOG_SIZE_BYTES * 0.6);
type LogSource = "browserConsole" | "networkRequests" | "sessionReplay";
function ensureLogDir() { if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true }); }
function trimLogFile(logPath: string, maxSize: number) {
  try {
    if (!fs.existsSync(logPath) || fs.statSync(logPath).size <= maxSize) return;
    const lines = fs.readFileSync(logPath, "utf-8").split("\n");
    const kept: string[] = []; let bytes = 0;
    for (let index = lines.length - 1; index >= 0; index--) { const size = Buffer.byteLength(`${lines[index]}\n`, "utf-8"); if (bytes + size > TRIM_TARGET_BYTES) break; kept.unshift(lines[index]); bytes += size; }
    fs.writeFileSync(logPath, kept.join("\n"), "utf-8");
  } catch {}
}
function writeToLogFile(source: LogSource, entries: unknown[]) {
  if (!entries.length) return;
  ensureLogDir();
  const logPath = path.join(LOG_DIR, `${source}.log`);
  fs.appendFileSync(logPath, `${entries.map((entry) => `[${new Date().toISOString()}] ${JSON.stringify(entry)}`).join("\n")}\n`, "utf-8");
  trimLogFile(logPath, MAX_LOG_SIZE_BYTES);
}
function vitePluginManusDebugCollector() {
  return {
    name: "manus-debug-collector",
    transformIndexHtml(html: string) {
      if (process.env.NODE_ENV === "production") return html;
      return { html, tags: [{ tag: "script", attrs: { src: "/__manus__/debug-collector.js", defer: true }, injectTo: "head" as const }] };
    },
    configureServer(server: import("vite").ViteDevServer) {
      server.middlewares.use("/__manus__/logs", (req, res, next) => {
        if (req.method !== "POST") return next();
        let body = "";
        req.on("data", (chunk) => { body += chunk.toString(); });
        req.on("end", () => {
          try {
            const payload = JSON.parse(body);
            if (payload.consoleLogs?.length) writeToLogFile("browserConsole", payload.consoleLogs);
            if (payload.networkRequests?.length) writeToLogFile("networkRequests", payload.networkRequests);
            if (payload.sessionEvents?.length) writeToLogFile("sessionReplay", payload.sessionEvents);
            res.statusCode = 200; res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify({ success: true }));
          } catch { res.statusCode = 400; res.end(JSON.stringify({ success: false })); }
        });
      });
    },
  };
}

export async function setupVite(app: Express, server: Server) {
  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    plugins: [...(viteConfig.plugins || []), vitePluginManusDebugCollector() as never],
    server: { middlewareMode: true, hmr: { server }, allowedHosts: true },
    appType: "custom",
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    try {
      const templatePath = path.resolve(import.meta.dirname, "../..", "client", "index.html");
      let template = await fs.promises.readFile(templatePath, "utf-8");
      template = template.replace('src="/src/main.tsx"', `src="/src/main.tsx?v=${nanoid()}"`);
      template = await vite.transformIndexHtml(req.originalUrl, template);
      const renderer = await vite.ssrLoadModule("/src/entry-server.tsx") as PublicRenderer;
      const page = await renderer.loadPublicPage(req.originalUrl);
      res.status(200).set({ "Content-Type": "text/html", "Cache-Control": "private, no-store" }).end(fillPage(template, page, renderer, req));
    } catch (error) {
      vite.ssrFixStacktrace(error as Error);
      next(error);
    }
  });
}

export async function serveStatic(app: Express) {
  const distPath = path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) console.error("Could not find the build directory: make sure to build the client first");
  app.use(express.static(distPath, { index: false }));
  const rendererPath = path.resolve(import.meta.dirname, "ssr", "entry-server.js");
  const renderer = await import(rendererPath) as PublicRenderer;
  const templatePath = path.resolve(distPath, "index.html");
  app.use("*", async (req, res, next) => {
    try {
      const template = await fs.promises.readFile(templatePath, "utf-8");
      const page = await renderer.loadPublicPage(req.originalUrl);
      res.status(200).set({ "Content-Type": "text/html", "Cache-Control": pageCacheControl(page) }).end(fillPage(template, page, renderer, req));
    } catch (error) { next(error); }
  });
}
