# Journal — WKND replica migration

Chronological log of every prompt execution. Most recent at the bottom.
See `skills/stardust/reference/journal-format.md` for entry format.

---

## Extract — captured /us/en (26 pages, prep + dynamics) (2026-09-24)

**Prompt:** Phase 1 of a hands-off same-design (replica) migration of https://wknd.site/us/en to AEM Edge Delivery: run `extract --prep --dynamics`, type every page, draft module candidates, seed the descriptive PRODUCT/DESIGN files and brand review, stamp the replica flow.

**Decisions:**
- Scope narrowed to the `/us/en` subtree (A-EX1 in `stardust/direction.md`); 9 other locale trees are D3-multilingual scope debt.
- No sitemap on the origin → same-origin BFS (depth 3) found 26 pages; all 26 crawled with `crawl.mjs --pages … --concurrency 4 --dynamics` (headless, consent `auto`, 0 failures).
- Page types: landing 1 · listing 2 · program 16 · article 5 · static 1 · unique 1 (A-EX3/A-EX4).
- 14 module candidates drafted (`DESIGN.json#extensions.modules[]`, status candidate), 5 system components, icon-font glyph table.
- Style census (26 × {1440, 360}) run from a work copy because the shipped script needs `live-session.mjs` beside it (A-EX6).
- brand-review.html validated at 1440/768/390: fixed mobile text overflow (long loader URL) and h2→h5 heading skips, then a clean pass.

**Artifacts touched:**
- `stardust/current/pages/<slug>.json|.html` (26) — created (typed `slots` added)
- `stardust/current/assets/{screenshots/,logo.svg,logo-light.svg,favicon.png,css/,fonts/}` — created
- `stardust/current/_crawl-log.json` (+visionCheck), `_computed-styles.json`, `_brand-extraction.json` — created
- `stardust/current/PRODUCT.md`, `DESIGN.md`, `DESIGN.json`, `brand-review.html` — created
- `stardust/validation/brand-review/{desktop,tablet,mobile}.png` — created
- `stardust/state.json` — created (flow replica, handsOff, captureGaps [])
- `stardust/direction.md` — created (assumptions A-EX1…A-EX9)

**Findings worth flagging:**
- Provenance 26/26 live; every page medium wait 2500 ms, HTTP 200; `captureGaps.detail`: "uncaptured first-level targets: none (no locale root captured)".
- `cssBackgrounds: []` on all pages is genuine (imagery via `<img>`), confirmed by thumbnails.
- Adventures listing is client-hydrated tabs + image list; header search posts to `<page>.searchresults.json?fulltext=`; AEM ContextHub/CSRF/currentuser calls and Adobe Launch/demdex on every page.
- Fonts: Asar + Source Sans Pro from Google Fonts (OFL, self-hostable, files saved); `wknd-icon-font` is the site's own.

**Open questions:**
- none (hands-off; gates resolved as named assumptions)

**Next:** replica Phase 2 — recreate one archetype per page type (home, adventures listing [+ magazine variant], adventure detail, magazine article, about-us, faqs) and gate against the live site.

---
