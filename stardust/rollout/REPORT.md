# wknd.site → AEM Edge Delivery Services — replica migration report

Run: 2026-09-24 · flow: **replica** (same design, no redesign, no rewording, no DOM copy) · mode:
hands-off · volume: all pages · source: https://wknd.site

**State: rollout complete through I-dashboard — 64/64 pages live AND verified on the preview
origin, 9/9 templates gated PASS at 1440 + 360, optimize gate pass (health 85/100, 0 open P1/P2).**
DA catalan-adobe/eds-mig-20260914, code branch `sd-25-fable-replica`, preview host
https://sd-25-fable-replica--eds-mig-20260914--catalan-adobe.aem.page — **preview only**
(`--no-publish`; nothing of this run on .aem.live). Ledger: `rollout I-dashboard end`
(`stardust/status.jsonl`; phases D-site, E-full-site, F-optimize, G-aem (skipped), H-report,
I-dashboard each start/end). The earlier local-only run (`C-deliver blocked`, no DA target) is
superseded; its sections below are kept where still true. Site-level results in § 2c.

## 1. Page coverage

| stage | count | evidence |
|---|---|---|
| extracted (prep crawl, full inventory) | 64 | `stardust/state.json` 64 rows; journal § Extract |
| archetypes recreated + gate-approved | 9 | one per page type; `stardust/replica/gates/` |
| migrated (sibling tier) | 64 | `stardust/migrated/**`, commit c64b67c |
| authored as EDS content (local) | 64 | `content/**/*.html` (64) = Σ `stardust/rollout/units/*.paths` (64) |
| PUT + previewed (preview origin) | 64 | `stardust/deploy/ledger-*.json` |
| pixel-gate-verified on the preview origin | 17 | archetype + sibling per template (`stardust/replica/gates/<slug>-<w>/*-pub*.txt`) |
| verified by `verify.mjs` (E-full-site: 200, no `about:error`, internal hrefs resolve) | 64 | `coverage/pages.json` 64 `verified`, 0 `failed`; `rollout.json.lastRun` |
| headless render check (first page of each template) | 9/9 | `stardust/.work/rollout/final/render-check.jsonl` — `body.appear`, all blocks `loaded`, 1 `<h1>`, 0 broken images, 0 JS errors |
| published (.aem.live) | 0 | owner decision — `--no-publish` |

Per template cluster (`stardust/rollout/progress.json` → `units.*`, all `done`; published gate in § 2b):

| cluster | pages | blocks authored | blocks reused | local chain |
|---|---|---|---|---|
| program (adventure detail) | 32/32 | breadcrumb, mini-carousel, content-fragment-elements, tabs | — | green |
| article (magazine) | 12/12 | content-fragment, text-quote, byline, sharing, download, list-upnext | breadcrumb (+`article` variant) | green |
| locale-landing (9 "Coming soon" stubs) | 9/9 | teaser-hero | — | green |
| landing (/us/en, /ca/en) | 2/2 | hero-carousel, teaser-featured | image-list, teaser-hero (+CTA slot, `imagebottom`) | green |
| listing (/adventures) | 2/2 | image-list | teaser-hero (+description slot) | green |
| magazine-hub (/magazine) | 2/2 | teaser-list | teaser-featured, image-list | green |
| about (/about-us) | 2/2 | contributor | — | green |
| faqs | 2/2 | accordion | — | green |
| members-only (ca/en) | 1/1 | — | image-list | green |
| foundation (C0) | 22 chrome docs | header, footer | — | green; commit d2ea721 |

"green" = per page: `delivery-lint` 0 P0/P1/P2 · `media-reconcile` · `davids-model-lint` 0 🔴 ·
`sanitise` · `qa-gate` PASS · `block-roundtrip --ew` closed (0 dead / duplicated) · `measure.mjs`
harness vs gated prototype Δ 0 px on probed boxes at 1440 + 360 (exceptions in § 6).

## 2. Archetype source-fidelity gate (replica Phase 4, prototype vs live)

| archetype (template) | width | pixel % | height Δ | structural 🔴 | iter | residuals |
|---|---|---|---|---|---|---|
| us-en (landing) | 1440 | 0.00 | 0 | 0 | 3 | — |
|  | 360 | 0.57 | 0 | 0 | 3 | photo resampling (live 300–400w renditions vs 1600w capture); object-fit crops flagged STRETCHED ×11/×8 = live; header search x-template class names 🟡×3 |
| us-en-adventures (listing) | 1440 | 0.00 | 0 | 0 | 2 | — |
|  | 360 | 0.81 | 0 | 0 | 2 | card-image resampling (hottest band 4.0 %, text clean); STRETCHED ×17/×16 = live crops |
| us-en-magazine (magazine-hub) | 1440 | 0.00 | 0 | 0 | 2 | — |
|  | 360 | 0.12 | 0 | 0 | 2 | ~288w live renditions vs captured 1280/1600w; featured-teaser lazy-load height settles to 0 |
| us-en-adventures-riverside-camping-australia (program) | 1440 | 0.00 | 0 | 0 | 2 | — |
|  | 360 | 0.95 | −1 | 0 | 2 | live main 1930.77 px fractional; 0.86 % footer band aligned; empty FB/Pinterest widgets replicated as captured |
| us-en-magazine-western-australia (article) | 1440 | 0.00 | 0 | 0 | 3 | — |
|  | 360 | 0.01 | 0 | 0 | 3 | byline 60×60 crop advisory; live 360 rendition is load-order dependent (±2 px), build mirrors the 400w srcset state |
| us-en-about-us (about) | 1440 | 0.00 | 0 | 0 | 1 | — |
|  | 360 | 0.02 | 0 | 0 | 1 | 277 px resampling noise; 164×164 circle crops = live |
| us-en-faqs (faqs) | 1440 | 0.00 | 0 | 0 | 1 | — |
|  | 360 | 0.93 | 0 | 0 | 1 | glyph anti-aliasing on justified intro + accordion titles, identical line breaks; single 1447×964 rendition vs live coreimg srcset |
| ca-en-magazine-members-only (members-only) | 1440 | 0.00 | 0 | 0 | 2 | — |
|  | 360 | 0.04 | 0 | 0 | 2 | 230 px anti-aliasing; motion advisories are sampler artefacts |
| us-es (locale-landing stub) | 1440 | 0.00 | 0 | 0 | 3 | — |
|  | 360 | 0.02 | 0 | 0 | 3 | hero object-fit crop advisory; header/footer crop 100 %/100 % |

Every archetype passed at both widths; every residual is photo resampling / anti-aliasing / a
sampler artefact — zero layout effect. The EDS build's numbers against the same live pages are in
§ 2b (preview origin, C-deliver).

## 2b. Published-origin gate (preview origin vs live, gate.sh --full, C-deliver)

Archetype per template at 1440 / 360; sibling in parentheses. Pixel bar 10 %, height bar 8 px,
crop bands (header/footer) bar 2 %. Every round PASS. C-final re-gated all 9 archetypes after the
two applied foundation requests (§ 6) — pixel numbers identical, chrome-parity byte-identical,
content-diff −1 🔴 per page (header clear-icon), article 1440 stitched Δh −80 → 0.

| template | archetype | 1440 px % (sib) | 360 px % (sib) | Δh 1440/360 | header ≤ | footer ≤ | content-diff 🔴 left | rounds |
|---|---|---|---|---|---|---|---|---|
| landing | us-en | 0.26 (0.26) | 0.42 (0.79) | 0 / 0 | 0.59 % | 0.87 % | 2 aria-label (owner: scripts.js) | 3 + C-final pub4 |
| listing | us-en-adventures | 0.22 (0.22) | 0.69 (0.69) | 0 / 0 | 0.59 % | 0.00 % | 0 | 2 + pub3 |
| magazine-hub | us-en-magazine | 1.07 (1.15) | 3.90 (3.78) | 0 / −14 (R-1) | 0.59 % | 0.90 % | 0 | 2 + pub3 |
| program | riverside-camping-australia | 1.13 (0.07) | 1.07 (1.93) | 0 / −1 | 0.59 % | 0.86 % | 0 | 1 + pub2 |
| article | western-australia | 0.03 (0.03) | 2.91 (3.00) | 0 / −2 | 0.64 % | 1.10 % | 3 footer-social region artefact | 3 + pub4 |
| about | us-en-about-us | 0.02 (0.02) | 0.12 (0.12) | 0 / 0 | 0.66 % | 0.00 % | 0 | 2 + pub3 |
| faqs | us-en-faqs | 0.20 (0.19) | 1.34 (1.42) | 0 / 0 | 0.59 % | 0.01 % | 0 | 2 + pub3 |
| members-only | ca-en-magazine-members-only | 0.04 | 0.14 | 0 / 0 | 0.59 % | 0.00 % | 0 | 1 + pub2 |
| locale-landing | us-es | 0.24 (0.24) | 0.21 (0.21) | 0 / 0 | 0.66 % | 0.00 % | 0 | 1 + pub2 |

Chrome parity: element probe (`--region header=header|.header .site-header`, `footer=footer|.footer
.site-footer`) ✓ on every page; the default-region report lists the EDS `<header>`/`<footer>`
wrapper artefacts (static/white, +6/+13 px, off-canvas nav at 360) and, on ca/en, the footer link
Δw −2 px (R-2). Fixes off the instruments during the clusters: text-quote blockquote face (article,
bfe1256), contributor icon span (about, 9803608), accordion icon host (faqs, ed12bb8), landing
indicator text; C-final: footer logo `aspect-ratio` + inline clear-icon data URI (e402744).

## 2c. Site-level rollout (phases D–I, 2026-09-24 15:07–15:15Z)

| phase | result | evidence |
|---|---|---|
| D-site | `assemble.mjs` → `stardust/rollout/site/{sitemap.xml (64 urls), robots.txt, manifest.json}` = the EXPECTED set (`.hlxignore` keeps `stardust/` off the origin). Served `/sitemap.xml` on the preview host lists **26** urls — the sibling run's published `/us/**` set; this run's 64 pages are preview-only and therefore absent from the published index (`manifest.json.servedSitemap.match false`, 0 extra, 38 missing = the 37 non-`/us/` pages + `/us/es`; the 26 served paths coincide with 26 of our 27 `/us/**` paths because the sibling publishes the same routes). Expected under `--no-publish`; re-check after publish. Root: source `https://wknd.site/` 301 → `/us/en.html`; preview `/` 301 → `/us/en` → 200 via the existing `/redirects.json` (28 rows: `/`, `/index.html`, 26 `/us/**.html` → extensionless — written by the sibling run, left untouched). No `stardust/redirects.tsv` in this run, so no `/ca/**.html` → extensionless rows exist (open item 14). All 22 chrome docs (`/<country>/<lang>/nav`, `/footer`) carry `Robots \| noindex`. | `stardust/rollout/site/manifest.json` |
| E-full-site | `verify.mjs --all --base <preview>`: **64 checked · 64 verified · 0 failed**; headless render check 9/9 templates clean (see § 1). No page re-driven. | `coverage/pages.json`, `stardust/.work/replica/bg/verify-e.log` |
| F-optimize | `optimize.mjs --all`: health **85/100** (seo 100 · ai-search 100 · cross-page 56 · a11y/brand/design/content not assessed); open **P1 0 · P2 0 · P3 11** — all `design-pass` `cross-page/duplicate-description`: each ca/en page shares its meta description with its us/en twin (source content, preserved verbatim in replica). Source parity 134 (P2 104 · P3 30: duplicate `<title>` across the same twins, no JSON-LD on the source either) — informational. **GATE pass.** | `stardust/rollout/optimize/{findings,scorecard}.json` |
| G-aem | **skipped** — F left 0 open in-scope P1 findings; `autofix-aem.mjs` not run, no project edits. | ledger |
| H-report | this file; `stardust/learnings.md` (7 pending entries); journal § Rollout D–I | — |
| I-dashboard | `dashboard.mjs` → `stardust/rollout/dashboard/{index.html,data.json}` | `stardust/rollout/dashboard/` |

Not run (out of this run's scope, listed in § 6): D2-dynamic (`/query-index.json` 404 on the preview
host — `helix-query.yaml` + publish needed), D3-multilingual (n/a, every captured locale root ships),
E2-link-audit (`localize-links.mjs --check`; 3 `content/ca/en/**` hrefs still point at
`https://wknd.site/ca/en/magazine/members-only.html` and 2 PDF hrefs at the wknd.site DAM).

## 3. Blocks (17 authored + 2 chrome)

`blocks/`: accordion · breadcrumb (variants `program-grid`, `article`) · byline · content-fragment
(section-level layout composer, article) · content-fragment-elements (variants `col-3`,
`program-grid`) · contributor · download · hero-carousel · image-list · list-upnext · mini-carousel ·
sharing (`spaced`) · tabs (`col-9`) · teaser-featured · teaser-hero (`imagebottom`, CTA +
description slots) · teaser-list (`secure`) · text-quote — plus header · footer (C0, template-slotted
node-slotting, per-locale `nav` / `footer` documents under `content/<country>/<lang>/`).
Default content: title, text, image, button (4 source modules → no block).
Closed section-style set (`styles/styles.css`): title-underline, title-right, title-white,
text-font-small, separator, separator-space-small, separator-space-medium, full-bleed,
container-flush, container-padded, faq-image, faq-intro, faq-aside.
Boilerplate `cards`, `columns`, `hero`, `widget` blocks are unused by the plan and untouched (open
item).

## 4. Dynamics dispositions (`stardust/dynamic-features.md`)

| id | feature | disposition | status |
|---|---|---|---|
| F-01 | header site search (typeahead, 5 results) | index-backed on `/query-index.json`; UI shell shipped in header (C0), search service needs the published host | planned → D2 |
| L-01 / L-02 / L-03 | adventures tabs listing · magazine + members-only listing · article sidebar lists | **D-L1 (hands-off): editorially curated** — cards authored verbatim from capture; index-driven switch deferred to owner | interim |
| M-01 | hero carousel + adventure gallery | rebuilt native (hero-carousel, mini-carousel; no autoplay per capture) | done-local |
| M-02 | tabs (listing filter, adventure detail) | rebuilt native (image-list internal tabs, tabs block) | done-local |
| M-03 | FAQ accordion | rebuilt native (accordion) | done-local |
| M-04 / M-05 | language dropdown · off-canvas mobile nav | rebuilt native in header.js (drive 15/15 at 1440 + 360) | done-local |
| M-06 / X-01 | Sign In / Sign Out (`#sign-in` modal target absent on source) | **D-X1**: inert hash anchors kept verbatim; authentication decided-out (register) | interim / decided-out |
| I18N-01 | 11 locale roots (us/en, ca/en full; 9 stubs) | **D-I1**: every captured root ships; no uncaptured trees (D3 n/a) | done-local |
| T-01 | Adobe Launch / Analytics / Advertising pixel | **D-T1**: no tag loads until the owner names a Launch property; URL recorded | scaffolded-awaiting-owner |
| D-01 / D-02 | ContextHub page data · Granite session JSON | decided-out (AEM runtime plumbing, no visible surface) | register |

## 5. Fonts

No substitutions. Asar 400 and Source Sans Pro 300/400/600 (normal + italic) self-hosted under
`fonts/` (47 files, every Google-Fonts subset, SIL OFL) plus the clientlib `wknd-icon-font`; metric
fallbacks computed from the woff2 (source-sans-pro-fallback 96.46 %, asar-fallback 101.54 %). The
boilerplate Roboto files were removed.

## 6. Open items

1. **Shared DA site with sibling run stardust-25-pi-opus-5-5-0003** (branch replica-wknd) — it PUTs
   and publishes 27 /us/** paths plus /nav, /footer into catalan-adobe/eds-mig-20260914; it overwrote
   /us/en, /us/en/adventures, /us/en/magazine at ~13:54Z (re-PUT --force, re-gated). C-final sweep:
   0/64 pages clobbered, but any /us/** page can be overwritten again — separate DA sites (or stop the
   other run) before publishing. `.aem.live` and the served `/sitemap.xml` (26 urls) and
   `/redirects.json` (28 rows) currently reflect the other run's /us/** publish.
2. **Publish decision** — preview-only (`--no-publish`); nothing of this run on .aem.live. Publishing
   needs item 1 resolved first, then `deploy-batch.mjs` without `--no-publish` per cluster,
   `assemble.mjs --verify-origin https://<branch>--<repo>--<org>.aem.live` (must exit 0), and the
   D2 index (`helix-query.yaml` → `/query-index.json`) for search F-01.
3. **`<html lang>`** — `scripts/scripts.js` hard-codes `lang = 'en'` (source `en-US`, `en-CA`,
   `es-US`, `fr-CA`, `de-CH` …). Root `scripts/` was outside this run's write boundary; one-line
   fix for the project owner (A-F-1; learnings entry).
4. **`a.button` aria-label** — the pipeline keeps `title` and drops `aria-label` on default-content
   buttons (landing 2 🔴 "read our articles" / "explore our adventures" on /us/en + /ca/en); copy
   title → aria-label in `scripts/scripts.js` `decorateMain` (owner, with item 3).
5. **Inconsistency register R-1** — magazine-hub Fly Fishing description modelled as `<p>`, 13.5 px
   lower than live at 360 (Δh −14; source markup asymmetry normalised into the block model; A-F-4,
   reversible). Worst published gate: us-en-magazine 360 = 3.90 % (1440 1.07 %).
6. **Inconsistency register R-2** — ca/en footer link "localization features with Core Components"
   218 vs 220 px: the source's trailing space inside the link is dropped by the pipeline
   (`inconsistency-register.md`; chrome-parity Δw −2 px on every ca/en page, footer band 0.00 %).
7. **Boilerplate leftovers** — `blocks/{cards,columns,hero,widget}` unused by the plan
   (`--background-color` token references); delete or keep as a project decision.
8. **Media** — the media ledger rows carry `source: null`, so `media-reconcile.mjs` cannot map
   wknd.site `src` → `contentUrl`; magazine-hub rewrote 16 srcs via `probes/rehost-src.mjs`, the
   other clusters kept the `https://wknd.site/…` URLs (ingested as `/media_*` renditions at
   preview, 0 broken images in the render check). The LA-skateparks PDF href (2 pages) stays
   absolute to the wknd.site DAM.
9. **E2 link audit not run** — 3 `content/ca/en/magazine/**` hrefs point at
   `https://wknd.site/ca/en/magazine/members-only.html` (an in-inventory page, `/ca/en/magazine/members-only`);
   `localize-links.mjs --source-host wknd.site --content content --check` + re-PUT of the 3 pages
   would close it. `verify.mjs` passed because it checks root-relative hrefs only.
10. **Sitemap / redirects on the published origin** — served sitemap ≠ assembled (26 vs 64) is
    the `--no-publish` consequence (§ 2c); no `stardust/redirects.tsv` exists, so `/ca/**.html` and
    the locale-stub `.html` source URLs have no redirect rows (only the sibling's `/us/**.html` rows).
    Generate the sheet from `coverage/pages.json` (`<path>.html → <path>`) and PUT `/redirects.json`
    once the DA site is this run's alone.
11. **Optimize P3 ×11** — `cross-page/duplicate-description` ca/en ↔ us/en twins: source content
    preserved verbatim (replica forbids rewording); design-pass, upstream/owner.
12. **No-`<h1>` source pages** — landing (2) + locale stubs (9) have no source h1; clusters authored
    the first teaser title as `h1` sized as the live h2 (delivery-lint P0 resolution). Owner may
    prefer an allowlist entry instead.
13. **Article content-diff 3 🔴 MISSING ICON** (footer social glyphs) is a region-classification
    artefact — the live footer sits inside `<main>`; chrome-parity footer icons 1/1 paired, footer
    band 0.00 % @1440.
14. **Search (F-01) + listings (L-0x) index** — `helix-query.yaml` / `/query-index.json` (404 on the
    preview host) and the search service are D2 work on the published host.
15. **Harness footer** — the local harness resolves the footer from its own pathname (falls back to
    `/us/en`), so `ca/*` measurements show the US footer (Δ confined to the footer) — harness only.
16. **Tooling** — `commit-push.sh` gained `--autostash` on its pull (landing unit; coordinator to
    confirm); Code Sync admin `POST /code/…/*` is 401 anonymously, 202 with Bearer DA_TOKEN (not
    needed — pushes reached the code origin within 5 s).

## 7. Remaining commands (to go from preview to published)

Run from the project root with `set -a; . ./.env; set +a` (DA_TOKEN). Item 1 (§ 6) first.

1. Close E2: `node stardust/scripts/deploy/localize-links.mjs --source-host wknd.site --content content
   --redirects stardust/redirects.tsv`, then `--check`; re-PUT the rewritten pages with their cluster
   `deploy-batch.mjs --paths stardust/rollout/units/<cluster>.paths --force --no-publish`.
2. Publish per cluster: the same `deploy-batch.mjs` lines as C-deliver (`stardust/journal.md`
   § C-deliver) without `--no-publish`, ≤ 3 clusters concurrently through `run-bg.mjs`.
3. Redirects: build `/redirects.json` rows `<path>.html → <path>` for all 64 pages (+ `/`,
   `/index.html` → `/us/en`), PUT + preview + publish.
4. `node stardust/scripts/rollout/assemble.mjs --verify-origin https://sd-25-fable-replica--eds-mig-20260914--catalan-adobe.aem.live`
   must exit 0 (served == 64); `curl -sIL …aem.live/` ends in 200.
5. D2: add `helix-query.yaml`, publish, poll `/query-index.json` until `total` settles; then
   `node stardust/scripts/dynamics/dynamics-check.mjs --origin https://<live-host>`.
6. Re-run `verify.mjs --all`, `optimize.mjs --all`, `dashboard.mjs` against the live host; open a PR
   carrying the `sd-25-fable-replica--eds-mig-20260914--catalan-adobe.aem.page/us/en` link (AGENTS.md rule).

## 8. Artifacts

`stardust/eds-conversion-log.md` (C0 + 9 units + C-final, named assumptions A-C0-*, A-P-*, A-LL-*,
A-about-*, A-faq-*, A-ART-*, A-L-*, A-mag-*, A-MO-*, A-F-1…4) · `stardust/rollout/progress.json` ·
`stardust/rollout/units/*.paths|md` · `stardust/rollout/foundation-requests.md` (applied) ·
`stardust/rollout/foundation-freeze.json` · `stardust/eds-schema/*.json` · `stardust/learnings.md`
(7 pending entries) · `stardust/replica/inconsistency-register.md` (R-1, R-2) · `stardust/journal.md` ·
`stardust/rollout/site/{sitemap.xml,robots.txt,manifest.json}` · `stardust/rollout/optimize/{findings,scorecard}.json` ·
`stardust/rollout/dashboard/{index.html,data.json}` · `stardust/rollout/coverage/*.json` · `stardust/status.jsonl`.
