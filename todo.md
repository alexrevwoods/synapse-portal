# WhoAreWe — Signal Publishing, Ownership & Search Visibility

## Completed release

- [x] Added editable Signal SEO and share metadata, including a title, description, and featured-image selector that only permits media belonging to the same Signal.
- [x] Watermarked uploaded JPG, PNG, and WebP Signal images at storage time using a permanent Sharp image transform, repeated across the full image with the owner display name and Portal handle.
- [x] Reprocessed the three pre-release Signal images into new full-image-watermarked managed-storage objects and updated their Signal records.
- [x] Added Portal-level Standard, Strong, and Maximum watermark-strength controls for future image uploads.
- [x] Added clear pre-publish image-protection notice and optional per-Signal media-license choices, with the license displayed on public image Signals.
- [x] Added an optional **Add SEO & share details** checkbox to the Signal composer. Authors may publish without it, then use **Edit & SEO** later to set content, title, description, featured image, and license.
- [x] Built canonical, shareable Signal detail pages at `/{username}/signals/{signalId}`.
- [x] Server-rendered the homepage, Discover, topic, public Portal, and public Signal routes, with safe browser-global guards for the public rendering path.
- [x] Added route-specific title, description, canonical, OpenGraph, Twitter, JSON-LD, `robots.txt`, and public-only `sitemap.xml` output.
- [x] Corrected the production SSR JSX-runtime configuration and verified production responses for the homepage, Discover, Portal, Signal, robots, and sitemap routes.
- [x] Verified desktop/mobile public pages, the rendered owner publishing workspace, and the baked watermark output. See `.manus-logs/signal-seo-visual-check.md`.

## Product guardrail

Original image files are stored with a visible copyright watermark. This deters uncredited reuse and ensures that ordinary saves or new-tab visits retain attribution; it cannot technically stop screenshots or a determined person who has access to the displayed file.

Because a browser must download an image before it can display it, the platform cannot reliably show a clean image normally but watermark only a later save or screenshot attempt. Serving the permanently watermarked bytes is the reliable option: the attribution covers browser display, mobile saves, downloads, new tabs, and screenshots. Owners can choose Standard, Strong, or Maximum coverage for future uploads.

## Follow-up verification

The browser session available to this task did not carry a project OAuth cookie, so a final human-session click-through of saving an owner edit could not be completed here. The protected route, mutation contract, ownership checks, rendered editor workspace, and full production server-rendering checks are complete; the next signed-in owner visit should perform one live save of the Signal body and SEO fields.
