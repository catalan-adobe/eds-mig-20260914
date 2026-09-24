# Direction — WKND replica (same-design migration to AEM Edge Delivery)

Flow: **replica**. No redesign, no rewording, no improvement. This file records the
hands-off judgments made at each gate as named assumptions.

## Assumptions — Extract (2026-09-24)

- **A-EX1 Scope = /us/en subtree.** The crawl is narrowed to `https://wknd.site/us/en`
  (26 pages, discovered by same-origin BFS depth 3 — no sitemap.xml/robots Sitemap
  exists; `/sitemap.xml` answers the 404 page). The other locale trees (ca/en, ca/fr,
  ch/de, ch/fr, ch/it, de/de, es/es, fr/fr, it/it, us/es) are duplicate-design
  translations and are scope debt for rollout **D3-multilingual**, not captured now.
  `wknd.site/` 301s to `/us/en.html`. `/us/en/errors/404.html` is excluded as junk.
- **A-EX2 Slugs are the crawler's.** Page slugs are what the shipped `crawl.mjs`
  produced (`us-en-adventures-bali-surf-camp-html`); they are not renamed, so
  `renderedHtml`/`screenshot` references stay valid. Path mapping for delivery is the
  URL pathname in `state.json.pages[].url`.
- **A-EX3 Page types.** home → `landing`; `/adventures.html`, `/magazine.html` → `listing`;
  `/adventures/*` (16) → `program` (trip detail: facts, itinerary, price);
  `/magazine/*` (5) → `article`; `/about-us.html` → `static`; `/faqs.html` → `unique`
  (accordion + aside; no static sibling shares its shape).
- **A-EX4 Listing archetype.** The two `listing` pages differ in shape (adventures:
  `cmp-tabs` + image list; magazine: featured teaser + teaser grid). The adventures
  listing is the archetype (it feeds the 16-page program funnel); the magazine listing
  is a declared variant, to be recreated on its own in Phase 2 (`migrate.mjs variant`).
- **A-EX5 cssBackgrounds: [] is genuine.** Every page reports zero CSS backgrounds
  because imagery is served through `<img>` (AEM core image/teaser/carousel). Verified
  by reading 8 archetype thumbnails; the remaining 18 pages are template siblings with
  consistent crawler signals (no spaShellSuspect, no duplicateOf, ≥4 imgs, ≥3
  headings) and are recorded `ok` with `method: sibling-inference` in
  `_crawl-log.json#visionCheck`.
- **A-EX6 Style census run from a work copy.** `stardust/scripts/style-census.mjs`
  looks for `live-session.mjs` beside itself; `stardust/scripts/` may not be modified,
  so both files were copied to `stardust/.work/extract/census/` and run from there
  (same project `node_modules`). Output is the canonical
  `stardust/current/_computed-styles.json`.
- **A-EX7 Fonts.** Asar and Source Sans Pro are loaded from Google Fonts on the source
  (SIL OFL 1.1) — latin subsets saved under `stardust/current/assets/fonts/` for
  self-hosting; `wknd-icon-font` (ttf+woff) is the site's own clientlib font. The
  Google Fonts `<link>` is kept as the loader of record; self-hosting is a delivery
  decision for Phase 5, not a design change.
- **A-EX8 Dynamic surface is evidence only.** Header search (`<page>.searchresults.json
  ?fulltext=`, 26/26), Sign In/Out anchors, language nav, AEM ContextHub / Granite CSRF
  / currentuser JSON, Adobe Launch (`assets.adobedtm.com`) and Audience Manager
  (`dpm.demdex.net`) are recorded in `_crawl-log.json#dynamicSurface`; classification
  and re-implementation belong to the `dynamics` sub-skill.
- **A-EX9 Tensions are descriptive.** The brand-review tension cards (ad-hoc scale,
  fragmented CTA voice, text-only accent, no `:root` tokens) are recorded for the canon;
  replica changes none of them.
