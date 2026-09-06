import type { Express, Request } from "express";
import { getPublicSitemapEntries } from "./db";

function originFor(req: Request) {
  const forwarded = req.headers["x-forwarded-proto"];
  const protocol = typeof forwarded === "string" ? forwarded.split(",")[0] : req.protocol || "https";
  return `${protocol}://${req.get("host")}`;
}

function xmlEscape(value: string) {
  return value.replace(/[<>&'\"]/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[character] || character);
}

function urlEntry(url: string, modified?: Date | null, priority = "0.7") {
  const date = modified ? `<lastmod>${modified.toISOString().slice(0, 10)}</lastmod>` : "";
  return `<url><loc>${xmlEscape(url)}</loc>${date}<changefreq>weekly</changefreq><priority>${priority}</priority></url>`;
}

export function registerSeoRoutes(app: Express) {
  app.get("/robots.txt", (req, res) => {
    const origin = originFor(req);
    res.type("text/plain").set("Cache-Control", "public, max-age=3600").send(`User-agent: *\nAllow: /\nDisallow: /account\nDisallow: /access\nDisallow: /builder/\nDisallow: /signals/\nDisallow: /network/\nDisallow: /timeline/\nDisallow: /notifications/\nDisallow: /insights/\nDisallow: /moderation\nDisallow: /api/\n\nSitemap: ${origin}/sitemap.xml\n`);
  });

  app.get("/sitemap.xml", async (req, res, next) => {
    try {
      const origin = originFor(req);
      const { portals, signals } = await getPublicSitemapEntries();
      const entries = [
        urlEntry(`${origin}/`, undefined, "1.0"),
        urlEntry(`${origin}/discover`, undefined, "0.9"),
        ...portals.map((portal) => urlEntry(`${origin}/${portal.username}`, portal.updatedAt, "0.8")),
        ...signals.map((signal) => urlEntry(`${origin}/${signal.username}/signals/${signal.signalId}`, signal.updatedAt || signal.publishedAt, "0.7")),
      ];
      res.type("application/xml").set("Cache-Control", "public, max-age=900").send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.join("")}</urlset>`);
    } catch (error) { next(error); }
  });
}
