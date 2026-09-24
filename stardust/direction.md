---
_provenance:
  writtenBy: stardust:replica
  writtenAt: 2026-09-24T07:20:26.805Z
  againstInput: https://wknd.site/us/en
  readArtifacts:
    - stardust/current/PRODUCT.md
    - stardust/current/DESIGN.md
    - stardust/current/DESIGN.json
---

# Direction — preserve mode (same-design migration)

Mode: PRESERVE. The target spec is the captured current state of https://wknd.site/us/en,
promoted verbatim (no direct invocation, no creative decisions).

Promoted: current/PRODUCT.md → PRODUCT.md · current/DESIGN.md → DESIGN.md ·
current/DESIGN.json → DESIGN.json (at 2026-09-24T07:20:26.805Z). Provenance: verbatim --prep promotion
(byte-for-byte, verified with cmp).

Permitted deltas: ONLY the entries of stardust/replica/inconsistency-register.md
(empty — pure replica).

Fidelity: ia verbatim · design verbatim · content verbatim.

Hands-off activation: stardust replica run HANDS-OFF — every gate is resolved by its documented
hands-off rule and recorded below as a named assumption; quality gates never weaken.

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

## Assumptions — Preserve direction + dynamics gate (2026-09-24)

- **A-PD1 Verbatim promotion.** `stardust/current/{PRODUCT.md,DESIGN.md,DESIGN.json}` were copied
  byte-for-byte to the project root (verified with `cmp`). No divergence roll, no re-direction, no
  `DESIGN-A/B/C` variant files. Gaps in the captured spec are resolved in Phase 3 from the source
  CSS, never invented here.
- **A-PD2 Empty register.** No audit was requested and no `--register` items were supplied, so
  `stardust/replica/inconsistency-register.md` is the empty pure-replica template. Anything the
  gate flags is a defect.
- **A-PD3 Archetype roster = Phase 1 proposal.** Six archetypes, one per page type, landing first
  (`us-en-html` establishes the canon chrome): landing, listing (adventures; magazine is the
  declared variant per A-EX4), program (climbing-new-zealand, 15 siblings), article
  (san-diego-surf, 4 siblings), static (about-us), unique (faqs). Recorded in
  `stardust/replica/progress.json`.
- **A-PD4 Main selector = `header + main`.** Every archetype has exactly one `<header>` followed
  directly by the outer `<main class="container responsivegrid …">`; AEM nests further `<main>`
  layout containers inside it, so bare `main` is ambiguous (2–3 matches). `header + main` matches
  exactly one element on all six captures and is reproducible in clean re-authored HTML without
  copying the `.root > .cmp-container > .aem-Grid` wrappers.
- **A-DY1 Dynamics gate passed with 11 curated rows** (28 detector rows merged; 4 client-only
  interaction rows added from Phase 1 evidence because the server-rendered source reports
  `client-rendered 0`). Every row has a disposition; the static recreation continues.
- **A-DY2 Sign In / Sign Out: decided-out.** No auth backend exists on the EDS host; the links
  stay as static chrome (design frozen), the modal/session behaviour is not rebuilt.
- **A-DY3 Language navigation: interim.** Rebuilt as static chrome with root-relative locale
  hrefs; the locale trees are scope debt D3-multilingual (A-EX1) and 404 on the target until an
  owner scopes them.
- **A-DY4 Listings: static-snapshot.** Adventures (16), home (6) and magazine (5) cards ship as
  authored content so the pixel gate has a fixed target; every page emits the listings-contract
  metadata so the unfreeze to `index-backed` is a yaml + block change. Owner decides
  index-driven vs curated.
- **A-DY5 Search: index-backed, self.** `/query-index.json` is 404 on the target → author
  `helix-query.yaml` at handoff (triage rule 8). Source parity recorded: `fulltext=surf` → 3
  results (Surf Camp in Costa Rica, Bali Surf Camp, San Diego Surf Spots) in
  `stardust/dynamics/parity.json`.
- **A-DY6 AEM runtime JSON + globals: decided-out.** ContextHub, Granite CSRF/currentuser/
  infinity JSON (9/9 host-bound 404) and `Granite`/`CQ` globals have no consumer on the migrated
  pages.
- **A-DY7 Tags: scaffolded, disabled.** Adobe Launch, Analytics/ECID, `112.2o7.net` (classified
  from host as Adobe Analytics collection — not unknown) and the retargeting pixel ship as a
  disabled `scripts/site-config.js` scaffold until the owner names the tags and property.
