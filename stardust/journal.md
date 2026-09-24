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

## Preserve direction — verbatim promotion, empty register, dynamics triage 15/15 (2026-09-24)

**Prompt:** Replica Phase 2 PRESERVE DIRECTION + dynamics gate (Phases 1–3), hands-off, all pages.

**Decisions:**
- `stardust/current/{PRODUCT.md,DESIGN.md,DESIGN.json}` promoted byte-for-byte to the project root (`cmp` verified); provenance `verbatim --prep promotion`. The `direct` skill was not invoked.
- `stardust/direction.md` rewritten in the preserve-mode shape with the hands-off activation and named assumptions A1–A6 (flow=replica from the user phrase; ALL pages, no cap; no DA target → delivery stops before the DA PUT; empty register; dynamics target origin unknown; members-only pages ship as normal pages).
- `stardust/replica/inconsistency-register.md` — **empty, pure replica** (no audit requested, no `--register`).
- Dynamics: `dynamics-detect --from-state` probed 9 archetype pages (first slug per type → all /ca/en; byte-identical to /us/en) + reach from 64/64 → 34 findings; `dynamics-plan` drafted 34 rows (self 16 / owner batch 17) without `--target-origin`. Curated to 15 rows in `stardust/dynamic-features.md`: search merged (9→1, probe `surf` → 3 results recorded as expectCount/expectTitles), ContextHub merged (9→1), 5 client-only interactions added from the DOM (carousel, tabs, accordion, language dropdown, off-canvas nav), `2o7.net` resolved to Adobe Analytics (not "inspect").
- Hands-off owner decisions by name: D-L1 listings curated (authored cards, index switch deferred), D-I1 all captured locales ship, D-T1 no tags load until a Launch property is named, D-X1 Sign In/Out kept as inert hash anchors; decided-out: X-01 auth, D-01 ContextHub, D-02 Granite plumbing.
- No regulated-PII form (only form = search box), no blank client-rendered capture → no blocked rows.
- `stardust/replica/progress.json` initialised: 9 page types, iterations 0, gates {}, residuals [], motion {}.

**Artifacts touched:** PRODUCT.md, DESIGN.md, DESIGN.json (root, created) · stardust/direction.md · stardust/replica/inconsistency-register.md · stardust/replica/progress.json · stardust/current/_dynamics.json, dynamic-features.generated.md · stardust/dynamics/dynamic-features.generated-plan.{md,json} · stardust/dynamic-features.md, stardust/dynamic-features-plan.md · stardust/status.jsonl, stardust/journal.md

**Findings worth flagging:**
- Search on the source is a header typeahead (min 3 chars, 5 results) with no results page — none is invented; P4 needs `helix-query.yaml` on the target code branch.
- Adventures listing = 6 activity tabs each wrapping an image-list (All 16 cards); tabs and cards are one nested block pair in recreation.
- Carousel autoplay delay 5000 ms on home hero and adventure-detail gallery — motion gate input.

**Open questions:** D-L1, D-I1, D-T1, D-X1 (all with interim decisions above); EDS/DA target for A3.

---

## Recreate + gate — recreate + source-fidelity-gate: 9/9 archetypes approved, canon fidelity fixes applied (2026-09-24)

**Prompt:** Replica Phases 3–4 (RECREATE + SOURCE-FIDELITY GATE), hands-off, all pages; 9 archetype subagents fanned out (one per page type), this section is the coordinator's bookkeeping.

**Decisions:**
- All 9 archetypes pass both breakpoints (1440 / 360) — pixel % / Δh / structural 🔴, iterations:
  landing `us-en-html` 0.00 / 0.57 · Δ0 · 0 (3 it) — listing `us-en-adventures-html` 0.00 / 0.81 · Δ0 · 0 (2) — magazine `us-en-magazine-html` 0.00 / 0.12 · Δ0 · 0 (2) — program `us-en-adventures-riverside-camping-australia-html` 0.00 / 0.95 · Δ0/−1 · 0 (2) — article `us-en-magazine-western-australia-html` 0.00 / 0.01 · Δ0 · 0 (3) — static `us-en-about-us-html` 0.00 / 0.02 · Δ0 · 0 (1) — faq `us-en-faqs-html` 0.00 / 0.93 · Δ0 · 0 (1) — unique `ca-en-magazine-members-only-html` 0.00 / 0.04 · Δ0 · 0 (2) — stub `us-es-html` 0.00 / 0.02 · Δ0 · 0 (3). Chrome-parity ✓ and header/footer crop bands ≥99.1% on every archetype; no horizontal overflow.
- Motion: 37 behaviours observed live, 37 implemented (canon.js: scrolly header morph, carousel, language toggle, off-canvas nav; page js: tabs ×2, accordion). Dead hovers/autoplay listed per type in `stardust/replica/progress.json`.
- Canon requests (`stardust/replica/canon-requests.md`) triaged: APPLIED two pure fidelity fixes to `canon.css` — the footer active level-1 link rule (live @132288; 7 page-scoped duplicates removed) and the `body.scrolly .masthead` transition (`ease/ease`, Chrome's -webkit fallback to live's invalid declaration; us-es workaround removed). Confirmation pixel round (`canon` label) on all 9 × 2 widths: every number identical to the gated value. DEFERRED to rollout C0: module promotions (teaser-hero, image-list, carousel base, `.image img`) and the `.container-fixed` ≤1024 box-model change (needs home-page verification, as the requester noted).
- `state.mjs advance … --to approved --by hands-off` for the 9 archetypes; 55 siblings stay `extracted` for migrate. No archetype missing.
- Fonts: no substitutions (Asar + Source Sans Pro from Google Fonts, self-hosted; wknd-icon-font from the clientlib).

**Named hands-off assumptions:** A7 per-project prototype server on port 8794 (8791 is a foreign sibling-run server, never killed). A8 only the captured master rendition serves at 360 (no per-breakpoint AEM renditions) — 0.1–1% resampling residuals accepted, flagged for delivery. A9 STRETCHED IMAGE advisories = intentional object-fit:cover crops identical to live. A10 search x-template class rename (🟡×3 header) accepted as non-content. A11 live sampler misses of #toggleNav at 360 on sub-pages accepted (behaviour is canon.js, observed live on landing). A12 promotions/refactors are not fidelity fixes → deferred, not applied this phase.

**Artifacts touched:** stardust/prototypes/canon.css (+7 page CSS, us-es-html.css) · stardust/replica/progress.json · stardust/replica/canon-requests.md · stardust/replica/gates/<slug>-<w>/ (canon round) · stardust/state.json · stardust/status.jsonl · stardust/journal.md

**Findings worth flagging (for deploy/rollout):**
- Box model: source is content-box; only AEM grid columns are border-box — the EDS styles.css reset must be scoped to block wrappers, never universal.
- Carousel/accordion/menu glyphs and social icons use wknd-icon-font codepoints — deploy must ship the icon font.
- Content-page-template pages (members-only): live main children carry no grid-column padding — do not wrap main sections in `.col`.
- Extract's intercepted latin-ext woff2 have different advances than live's latin subsets — canon.css uses the page's own google-fonts subsets; deploy must self-host those, not stardust/current/assets/fonts.

**Open questions:** EDS/DA target for Phase 5 (still unnamed → delivery stops before the DA PUT); .container-fixed back-port decision at rollout C0.

---

## Migrate — plan + render + state-and-report: 64/64 pages migrated at sibling tier (2026-09-24)

**Prompt:** Migrate siblings (replica flow, hands-off, ALL pages). 9 cluster subagents fanned out (one per page type: landing, listing, magazine, program, article, static, faq, unique, stub); this section is the coordinator's bookkeeping.

**Result:** 64 rendered into `stardust/migrated/` (43 MB, 230 bundled assets, self-contained), 0 failed, 0 stale. Branches: Path A 9 archetypes (approved prototype verbatim), Path A' 55 template-applied siblings (31 program, 11 article, 8 stub, 1 each landing/listing/magazine/static/faq), Path B 0. Every page: contentFidelity pass, content-count equal in every role (main/header/footer, 0 structural 🔴 vs live; the 3 🟡 per page are the header search x-template rename, A10), pixel bar 1440 0.00–0.03 % / Δ0 and 360 0.02–4.41 % / |Δh| ≤ 3 px, no horizontal overflow. Variance probes: 0 deltas on landing/listing/faq/stub; content-shape deltas only on magazine/static/article/program except the budgeted variants below.

**Variants (variance budget, additive CSS appended to the archetype's page CSS, never a fork):**
- `program-grid` ×16 (program: AEM grid-column breadcrumb/container/facts, share beside facts ≤1024) + `.fragment__body{display:flow-root}` and `.image__title` in `us-en-adventures-riverside-camping-australia-html.css`.
- `grid--figure` ×10, `text--plain-quote` ×2, `download--pdf` ×2, `image--captioned` ×2, `article-body--inline-headings` ×2 (article) in `us-en-magazine-western-australia-html.css`; empty AEM paragraph systems kept as `.grid--empty` flow-root (margin-collapse barrier, san-diego Δh 54 px otherwise).
- `footer--locale-ca` ×4 (magazine, static, faq siblings; CA chrome = archetype chrome re-localised + the Canadian footer paragraph verbatim from the gated CA archetype), `teaser-list--linked-cta` ×1 (magazine CA: linked Read More on secure teasers, existing rules cover it).

**Decisions:** `state.mjs advance <slug> --to migrated --migrated <path>` for all 64 (55 extracted→migrated, 9 approved→migrated). `state.json.migrate` merged from the nine cluster work copies (`stardust/.work/migrate/<archetype>/state.json`; page maps verified identical; pages 64, bundledAssets 230 = files on disk, missingAssets 0). 18 migrationDecisions and 3 contentDeviations recorded on sidecars (program archetype: two alt texts truncated ~85 chars in the approved prototype, kept verbatim; guide-la-skateparks US+CA: PDF not in media capture, href absolute pending media-reconcile).

**Named hands-off assumptions:** A13 clusters ran `migrate.mjs` against private state copies (siblings set `directed` there) and `gate-evidence.mjs --progress` redirected to their work dirs — shared `stardust/replica/progress.json` not rolled up this phase. A14 content-diff reference = live URL or a capture served with its clientlibs (unstyled capture yields role-swap/icon 🔴 artefacts). A15 sibling `<link rel=canonical>` follows the archetype of its type (present on magazine/article/static/faq/landing, absent on program). A16 CA chrome derived from the gated `ca-en-magazine-members-only-html` archetype, language-nav hrefs = captured page-level values. A17 `run-bg.mjs clean` by one cluster swept other clusters' ENDED job records mid-run; evidence JSON was saved beforehand, results unaffected.

**OPEN for deploy/rollout:**
- Cross-page links: 55 pages carry `href="https://wknd.site/…"` for in-inventory pages that were not yet migrated when that cluster rendered (766 driver 'broken' counts, all `in-inventory-not-migrated`). Now that all 64 are migrated, re-run `migrate.mjs render --all --force` (sibling `--source` = each cluster's built sibling HTML under `stardust/.work/migrate/<archetype>/`) or let deploy's link transform resolve them before any PUT.
- delivery-lint P0 `no <h1>` on landing (2) + stub (9) = 11 pages — a SOURCE property (teaser title is h2); replica adds none → inconsistency-register / lint-allowlist decision at rollout row 6.
- delivery-lint P1 html-extension on 19 pages (canonical / language-nav self-link `.html`, carried verbatim from live) — deploy's extensionless rewrite owns it. P2 no-metadata-block everywhere (expected pre-deploy).
- Register `program-grid` + the program/article CSS additions in the canon/variant registry at rollout C0 together with the deferred module promotions.

**Artifacts touched:** stardust/migrated/** (64 html + 64 _meta.json + assets/) · stardust/prototypes/us-en-adventures-riverside-camping-australia-html.css · stardust/prototypes/us-en-magazine-western-australia-html.css · stardust/state.json · stardust/status.jsonl · stardust/journal.md · stardust/replica/gates/<slug>-<w>/ (sibling rounds) · stardust/.work/migrate/** (cluster builders, probes, state copies)

## A-inventory — delivery coverage built from stardust/migrated (2026-09-24)

`inventory.mjs --site-url https://wknd.site` (no `--state`: all 64 pages individually migrated; the
`--state` archetypes-only mode split the tree into 64 singleton templates and was re-run without).
64 pages pending, 9 templates. `rollout.json.site.da.*` / `liveHost` left null — no DA org/repo/token
available anywhere (assumption recorded in `stardust/rollout/plan.md`).

## B-block — block dedup + representative-first plan (2026-09-24)

`blocks.mjs`: 21 distinct modules, 306 instances. `title`/`text`/`image`/`button` mapped to
`default-content` (deploy D1) via `update-coverage.mjs`; 17 blocks convert once site-wide.
`plan.mjs`: 64 steps, 9 template clusters, per-page convert/reuse. Header/footer are the C0
foundation (not in sidecar `modules[]`). Waves, tier bias and the no-DA constraint (C-deliver stops
before PUT) in `stardust/rollout/plan.md`.

## C-deliver — foundation + 9 cluster units, local only (2026-09-24)

C0 foundation (commit d2ea721): styles, 47 self-hosted font files, favicon, header + footer blocks,
22 per-locale nav/footer documents; frozen (66 files). Nine cluster subagents ran concurrently on
disjoint blocks + pages and authored 64/64 pages under `content/` with 17 blocks (program 32 · article
12 · locale-landing 9 · landing 2 · listing 2 · magazine-hub 2 · about 2 · faqs 2 · members-only 1),
every page through delivery-lint → media-reconcile → davids-model-lint → sanitise → qa-gate →
block-roundtrip --ew, all green; measure.mjs harness vs gated prototype Δ 0 on probed boxes at
1440 + 360. Every unit stopped before PUT: no DA org/repo/DA_TOKEN. Eight foundation-request lines
queued (scoped overrides shipped inside block CSS). Per-unit records: `stardust/eds-conversion-log.md`,
`stardust/rollout/units/*.md`, `progress.json` units `done-local`.

## Run report — C-final + report, C-deliver blocked on DA credentials (2026-09-24)

C-final: `foundation-freeze check` unchanged; the 8 request lines applied ONCE to `styles/styles.css`
(7 applied — separator `:empty` exclusion + collapsed margins, `separator-space-medium`,
`container-flush`, `container-padded`, `faq-*` page grid; 1 deferred — `scripts/scripts.js` `lang`,
outside the write boundary) and the matching block overrides removed; `npm run lint` clean; qa-gate
PASS on the 7 affected archetypes' aem-cli renders; measure.mjs Δ 0 except the magazine-hub 360
−14 px (register R-1, A-F-4) and faqs −8/−9 px (external `<img>` not picture-wrapped until rehost,
A-F-2); freeze re-taken. Coverage: 17 blocks `converted`, page rows `pending` (A-F-3). Ledger:
`rollout C-deliver blocked` — DA org/repo and DA_TOKEN not provided. `stardust/learnings.md` 6
pending entries. Report: `stardust/rollout/REPORT.md` (gate table, coverage, blocks, dynamics,
fonts, open items, exact next commands). Totals: 64 extracted · 9 archetypes approved · 64 migrated ·
64 authored · 0 PUT.

## C-deliver — 64/64 pages live on the preview origin, 9 templates gated (2026-09-24)

Fresh C-deliver against DA catalan-adobe/eds-mig-20260914, code branch `sd-25-fable-replica`,
preview only (`--no-publish`; nothing on .aem.live). C0 uploaded media once (media/wknd-sd25/,
stardust/deploy/media-ledger.json), PUT 22 chrome docs + /us/en and gated pub1→pub3; nine cluster
units then PUT their pages and gated archetype + sibling at 1440/360 on the preview origin — every
round PASS: landing 0.26/0.42 %, listing 0.22/0.69, magazine-hub 1.07/3.90 (Δh −14 = R-1), program
1.13/1.07, article 0.03/2.91, about 0.02/0.12, faqs 0.20/1.34, members-only 0.04/0.14,
locale-landing 0.24/0.21; header/footer crop bands ≤1.10 % (bar 2 %); chrome element probe ✓ except
the ca/en footer link Δw −2 px (now R-2: the source's trailing space inside the link, dropped by the
pipeline). Fixes off the instruments inside clusters: text-quote blockquote face (article), contributor
icon span (about), accordion icon host (faqs), landing indicator text.

C-final applied two foundation-request lines once — `blocks/footer/footer.css` `.footer .logo img
{ aspect-ratio: 300 / 112 }` (article 1440 stitched Δh −80 → 0) and `blocks/header/header.css`
inlining the source's base64 clear-icon data URI (byte-identical to icons/clear.svg, file removed;
the site-wide header ICON DIFF 🔴 is gone) — re-froze (66 files, check clean) and re-gated all 9
archetypes at both widths (18/18 PASS, pixel numbers identical to the cluster rounds, content-diff
−1 🔴 per page, chrome-parity byte-identical). Not applied: `scripts/scripts.js` `lang` and the
`a.button` title→aria-label copy (root scripts/ is outside the write boundary → owner items); the CA
footer −2 px is registered, not fixed. Coverage: 64 pages deployed, 17 verified (archetype + sibling
per template), 17/17 blocks verified. Ledger: `rollout C-deliver end`.

Cross-run hazard: sibling benchmark run stardust-25-pi-opus-5-5-0003 (branch replica-wknd) PUTs and
PUBLISHES 27 /us/** paths plus /nav and /footer into the same DA site; it overwrote /us/en,
/us/en/adventures and /us/en/magazine around 13:54Z (re-PUT --force by the clusters, re-gated). A
site-wide .plain.html sweep at C-final found 0/64 clobbered pages, but DA content is site-scoped —
any /us/** page can be overwritten again until the runs use separate DA sites. commit-push.sh gained
`--autostash` on its pull (landing unit) so shared-tree pushes go through.
