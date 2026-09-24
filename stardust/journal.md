# Journal — WKND (wknd.site) replica migration to AEM Edge Delivery Services

Chronological log of every prompt execution. Most recent at the bottom.
See `skills/stardust/reference/journal-format.md` for entry format.

---

## Extract — full-inventory prep crawl of wknd.site, 64/64 pages live, 9 page types (2026-09-24)

**Prompt:** Replica (same-design) migration of https://wknd.site to EDS, hands-off, ALL pages. This entry covers master + replica Setup and Phase 1 EXTRACT (`extract https://wknd.site --prep --dynamics`).

**Decisions:**
- Flow stamped `replica` / `flowSource: user-phrase` / `handsOff: true` in `stardust/state.json` (assumption: the user's "same-design migration" phrase is the flow choice).
- No sitemap.xml and no `Sitemap:` in robots.txt; `crawl.mjs` alone discovers only the entry page's nav links (26). Per extract § Phase 1 step 2, a same-origin BFS (depth 3, fetch-only, `stardust/.work/extract/discover.mjs`) listed 64 URLs; every capture still ran through the shipped `crawl.mjs --pages` (3 batches: 26 + 28 + 10). Not a replacement of an instrument — discovery only.
- Cap lifted (`--max 500`, `--prep` ⇒ all). Scope = whole site: 64 pages, 0 failures, 0 junk-filtered.
- Page-type catalog (per-site, state-machine § Page types allows additions): `landing` home ×2, `listing` adventures index ×2, `magazine` magazine index ×2, `program` adventure detail ×32, `article` magazine story ×12, `static` about-us ×2, `faq` ×2, `unique` members-only index ×1, `stub` "Coming Soon!" locale roots ×9. Assumption: distinct component shapes get their own type so sibling rendering never forces one shape onto another (replica pixel bar).
- Archetypes = richest us/en instance per type: us-en-html, us-en-adventures-html, us-en-magazine-html, us-en-adventures-riverside-camping-australia-html, us-en-magazine-western-australia-html, us-en-about-us-html, us-en-faqs-html, ca-en-magazine-members-only-html, us-es-html.
- /ca/en tree is a byte-identical MSM live copy of /us/en (+3 members-only pages that 404 under /us/en); crawl hash flagged `ca-en-html` as `duplicateOf us-en-html`. Kept as siblings, not dropped — the user asked for all pages.
- Locale-root capture gaps: none reported by crawl.mjs (`captureGaps.roots` empty); manual probes confirm `/fr/fr/adventures.html` etc. are 404 — the 9 stubs have no subtree.
- Consent: none on site (`consent.method: auto`, nothing to dismiss); bot management: none (headless technique, all 200).

**Artifacts touched:**
- stardust/.gitignore, .gitignore (`# >>> stardust` .env block), .hlxignore (`stardust/`) — created/updated
- stardust/scripts/{replica,stardust,migrate,diff,extract,dynamics,deploy,rollout}/ — copied from .agents/skills
- stardust/current/pages/<slug>.json + .html (64, with `type` and `slots`), assets/screenshots/ (64 + 9 thumbs) — created by crawl.mjs
- stardust/current/_crawl-log.json (discovery, visionCheck, notes), _computed-styles.json (style-census 64 × {1440,360}) — created
- stardust/current/_brand-extraction.json, DESIGN.json, DESIGN.md, PRODUCT.md, brand-review.html — created
- stardust/current/assets/: logo.svg, logo-light.svg, favicon.png, fonts/ (Asar 400, Source Sans Pro 300/400/600 ± italic woff2, wknd-icon-font woff/ttf), css/ (clientlib-site/base, google-fonts), media/ (252 files + _manifest.json) — created
- stardust/state.json (64 pages `extracted`, typed, `pageTypes` archetype map), stardust/status.jsonl — created

**Findings worth flagging:**
- Fonts: Asar 400 (headings) + Source Sans Pro 300/400/600 (body/UI) from Google Fonts; icon font `wknd-icon-font` (social, menu, carousel arrows, accordion, breadcrumb chevron) — codepoints in DESIGN.json#extensions.iconFont.
- Tokens exist as CSS custom-property defaults in clientlib-site.min.css (`--brandPrimary #ffea00`, `--brandSecondary #202020`, `--brandThird #ebebeb`, `--linkColor #0045ff`, `--headerHeight 200px`, `--headerMobileHeight 130px`, `--utilityNavHeight 25px`, …). Radius 0, no shadows, no gradients.
- Content root on the live site: `main` (outer `main.container.responsivegrid` wraps an inner `main.cmp-layout-container--fixed`); chrome is `header.cmp-experiencefragment--header` / `footer.cmp-experiencefragment--footer`.
- Dynamic surface (reach): site search form GET `<page>.searchresults.json/...`, ContextHub `contexthub.pagedata.json`, `segments.seg.js`, csrf/currentuser JSON, demdex/Adobe Launch beacons; carousel, tabs, accordion, language dropdown, off-canvas nav, Sign In/Out hash links. `_crawl-log.json#dynamicSurface` rollup only reflects the last crawl batch — per-page `dynamic` sections are complete for all 64.
- Media: 252 renditions downloaded (67 MB, `assets/media/_manifest.json` URL→file); 16 invented `.1600` widths 404 (ignored — real `src` renditions captured).
- Vision check: archetype thumbnails (home, adventure, article, about, stub) match records; the stubs are genuine "Coming Soon!" placeholders.

**Open questions:**
- Members-only pages (ca/en only) — deliver as normal pages or gate? (defaulted: normal pages, content preserved)
- Whether /ca/en duplicates should ship as separate EDS paths (defaulted: yes, all pages requested).

**Next:** replica Phase 2 — preserve direction (mechanical promotion of stardust/current/PRODUCT.md, DESIGN.md, DESIGN.json to root), then Phase 3 recreate one archetype per type.

---
