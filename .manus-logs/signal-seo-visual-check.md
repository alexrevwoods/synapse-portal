# Signal publishing and SEO visual verification

**Verified:** 2026-09-06

## Public experience

Desktop and 390px mobile captures of `/mediarevolution/signals/1` rendered the canonical Signal detail page without overlap. The page presents a clear public-Signal label, a large readable title, publisher attribution, Portal return link, Share action, the complete Signal card, and a follow-on Portal CTA. The responsive mobile capture retained the same hierarchy and touch-sized controls.

Desktop and mobile captures of `/mediarevolution` rendered the Portal map and Signal feed. The detail-card affordance, `Open Signal` link, owner-only `Publish Signal` action, and compact Signal cards were visible. The mobile Portal map showed the pre-existing one-time gesture guide correctly and did not conceal the Signal feed beneath the map controls.

The project screenshot renderer captured the owner workspace at `/signals/1`, showing public, followers, connections, and Private note publishing modes. Each owned item exposes **Owner controls** and an **Edit & SEO** entry point; public items additionally expose their canonical public-Signal link. The editor implementation provides content, meta title, meta description, and per-Signal featured-image selection controls. A direct local-browser session did not carry a project OAuth cookie, so live mutation/save verification in that browser remains unavailable; the protected API validation and rendered owner-workspace capture provide the release evidence available in this task.

## Watermark verification

A server-generated 1280×720 PNG sample passed through the same Sharp transform as Signal uploads. The rendered image displays repeated, high-contrast owner attribution across the entire image. Unit tests inspect the repeated SVG grid and transformed image pixels to confirm the watermark is baked into the output image bytes, rather than supplied only by CSS or a browser overlay.

### Full-image ownership update

The corner-only attribution has been replaced by a rotated, repeated grid across the entire image. Each repeated mark contains the owner’s display name, Portal handle, and **WhoAreWe**, for example `© Media Revolution · @mediarevolution · WhoAreWe`. The normalized image dimensions are determined after EXIF rotation, so portrait images captured on a phone receive a correctly sized full-image overlay. A 390px mobile capture of the Media Revolution Portal confirms the repeated attribution remains visible in the Signal feed image. The three Signal images that existed before the initial watermark release were reprocessed, written to new managed-storage objects, and their database references updated.

## SEO and SSR verification

Development and production smoke tests returned HTTP 200 for the homepage, Discover, public Portal, public Signal, `robots.txt`, and `sitemap.xml`. The public Signal HTML contains a unique title and canonical URL, while route-specific metadata is emitted server-side. The sitemap sample contained published Portal and public Signal entries only.

## Limitation

The watermark remains in normal saved, opened-in-a-new-tab, and downloaded image files originating from the Signal upload route. It does not, and cannot, prevent screenshots, deliberate re-encoding/cropping, or determined copying.
