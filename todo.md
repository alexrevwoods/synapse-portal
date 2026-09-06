# WhoAreWe — Signal Publishing, Ownership & Search Visibility

## Completed release

- [x] Added editable Signal SEO and share metadata, including a title, description, and featured-image selector that only permits media belonging to the same Signal.
- [x] Produce separate clean in-app and permanently watermarked protected-download JPG, PNG, and WebP Signal image derivatives at storage time.
- [x] Reprocessed the three pre-release Signal images from retained originals into clean-view and full-image-watermarked protected-download managed-storage objects, then updated their Signal records.
- [x] Added Portal-level Standard, Strong, and Maximum watermark-strength controls for future image uploads.
- [x] Added clear pre-publish image-protection notice and optional per-Signal media-license choices, with the license displayed on public image Signals.
- [x] Added an optional **Add SEO & share details** checkbox to the Signal composer. Authors may publish without it, then use **Edit & SEO** later to set content, title, description, featured image, and license.
- [x] Added a public Signal rights panel with explicit protected-download acknowledgement and owner contact path.
- [x] Added aggregate Signal view, copied-share, and protected-download metrics to creator Insights.
- [x] Built canonical, shareable Signal detail pages at `/{username}/signals/{signalId}`.
- [x] Server-rendered the homepage, Discover, topic, public Portal, and public Signal routes, with safe browser-global guards for the public rendering path.
- [x] Added route-specific title, description, canonical, OpenGraph, Twitter, JSON-LD, `robots.txt`, and public-only `sitemap.xml` output.
- [x] Corrected the production SSR JSX-runtime configuration and verified production responses for the homepage, Discover, Portal, Signal, robots, and sitemap routes.
- [x] Verified desktop/mobile public pages, the rendered owner publishing workspace, and the baked watermark output. See `.manus-logs/signal-seo-visual-check.md`.

## Product guardrail

Original image files are stored with a visible copyright watermark. This deters uncredited reuse and ensures that ordinary saves or new-tab visits retain attribution; it cannot technically stop screenshots or a determined person who has access to the displayed file.

Because a browser must receive an image before it can display it, it cannot reliably detect or block a screenshot. WhoAreWe now presents a clean in-app rendition and provides a distinct full-image-watermarked derivative only through the acknowledged download flow. Owners can choose Standard, Strong, or Maximum coverage for future protected downloads. A clean screenshot remains technically possible; no web platform can prevent it, so license terms and the acknowledged protected-download record provide additional creator safeguards.

## Follow-up verification

The browser session available to this task did not carry a project OAuth cookie, so a final human-session click-through of saving an owner edit could not be completed here. The protected route, mutation contract, ownership checks, rendered editor workspace, and full production server-rendering checks are complete; the next signed-in owner visit should perform one live save of the Signal body and SEO fields.
