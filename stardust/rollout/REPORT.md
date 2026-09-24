# wknd.site → AEM Edge Delivery Services — replica migration report

Run: 2026-09-24 · flow: **replica** (same design, no redesign, no rewording, no DOM copy) · mode:
hands-off · volume: all pages · source: https://wknd.site

**State: pages authored and locally asserted; nothing PUT.** `rollout.json.site.da.{org,site,ref}`
and `DA_TOKEN` were never provided, so every C-deliver unit stopped before the PUT → preview →
published-origin gate. Ledger: `rollout C-deliver blocked` (`stardust/status.jsonl`).

## 1. Page coverage

| stage | count | evidence |
|---|---|---|
| extracted (prep crawl, full inventory) | 64 | `stardust/state.json` 64 rows; journal § Extract |
| archetypes recreated + gate-approved | 9 | one per page type; `stardust/replica/gates/` |
| migrated (sibling tier) | 64 | `stardust/migrated/**`, commit c64b67c |
| authored as EDS content (local) | 64 | `content/**/*.html` (64) = Σ `stardust/rollout/units/*.paths` (64) |
| PUT / previewed / published | 0 | no DA target |

Per template cluster (`stardust/rollout/progress.json` → `units.*`, all `done-local`):

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
sampler artefact — zero layout effect. The same numbers are NOT yet available for the EDS build:
the published-origin round (§ 7 step 4) is pending.

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

1. **DA target + token** — `rollout.json.site.da.{org,site,ref}` null, no `DA_TOKEN`: nothing PUT,
   previewed or published; the published-origin gates (pixel, `crop-compare` bands, chrome parity)
   and `deployed` / `verified` coverage rows are all pending (page rows remain `pending`, A-F-3).
2. **Editorial media rehost** — every editorial `<img src>` and PDF `href` is the captured
   `https://wknd.site/…` URL (anonymous 200 today); `da-media-upload.mjs --scope <cluster>` + src
   rewrite at PUT. Side effect until then: external images are not wrapped in `<picture>`, so
   `/us/en/faqs` sits 7–9 px taller than its prototype (A-F-2).
3. **`<html lang>`** — `scripts/scripts.js` hard-codes `lang = 'en'` (source `en-US`, `en-CA`,
   `es-US`, `fr-CA`, `de-CH` …). Root `scripts/` was outside this run's write boundary; one-line
   fix for the project owner (A-F-1; learnings entry).
4. **Inconsistency register R-1** — magazine-hub Fly Fishing description 13.5 px lower than live
   (source markup asymmetry normalised into the block model; A-F-4, reversible).
5. **Migrated-tree links** — 55 `stardust/migrated` pages carry `href="https://wknd.site/…"` for
   in-inventory targets (parallel render); the authored `content/` pages use root-relative
   extensionless hrefs, but E2 `localize-links.mjs --check` must confirm on the live tree.
6. **No-`<h1>` source pages** — landing (2) + locale stubs (9) have no source h1; clusters authored
   the first teaser title as `h1` sized as the live h2 (delivery-lint P0 resolution). Owner may
   prefer an allowlist entry instead.
7. **Publish decision** — preview-only (`--no-publish`) until the owner decides.
8. **Boilerplate leftovers** — `blocks/{cards,columns,hero,widget}` unused (`--background-color`
   token references); delete or keep as a project decision.
9. **Harness footer** — the local harness resolves the footer from its own pathname (falls back to
   `/us/en`), so `ca/*` measurements show the US footer (Δ confined to the footer) — harness only.
10. **Search (F-01) + listings (L-0x) index** — `helix-query.yaml` / `/query-index.json` and the
    search service are D2 work on the published host.

## 7. Next commands (once `DA_TOKEN` + org/repo/branch exist)

Run from the project root. Fill `stardust/rollout/rollout.json` → `site.da.{org,site,ref}` and
`site.liveHost` first (`inventory.mjs --site-url https://wknd.site` re-derives coverage and keeps rows).

1. Rehost editorial media per cluster, then rewrite `src`/`href` in `content/` from each ledger:
   ```
   for c in program article locale-landing landing listing magazine-hub about faqs members-only; do
     DA_TOKEN=… node stardust/scripts/deploy/da-media-upload.mjs --org <org> --repo <repo> \
       --scope $c --dir content --ledger stardust/deploy/media-$c.json
   done
   ```
2. Foundation first (chrome docs, styles, fonts already on the code branch — push the branch):
   ```
   git push -u origin <branch>
   DA_TOKEN=… node stardust/scripts/deploy/deploy-batch.mjs --org <org> --repo <repo> --branch <branch> \
     --content content --paths stardust/rollout/units/foundation.paths --no-publish \
     --ledger stardust/deploy/ledger-foundation.json --log stardust/.work/rollout/deploy-foundation.log
   ```
   (`foundation.paths` = the 22 `/<country>/<lang>/nav` + `/footer` documents.) Then the
   foundation-first gate on `/us/es`:
   `bash stardust/scripts/replica/gate.sh us-es-html https://wknd.site/us/es.html https://<branch>--<repo>--<org>.aem.page/us/es 1440 pub1 --full`
   and `360`, plus `crop-compare.mjs` header/footer bands and `chrome-parity.mjs`.
3. Clusters, ≤ 3 concurrently (`--concurrency 1` when more), each through `run-bg.mjs start`:
   ```
   node stardust/scripts/replica/run-bg.mjs start --name deploy-<cluster> -- \
     node stardust/scripts/deploy/deploy-batch.mjs --org <org> --repo <repo> --branch <branch> \
       --content content --paths stardust/rollout/units/<cluster>.paths --no-publish --concurrency 2 \
       --ledger stardust/deploy/ledger-<cluster>.json --log stardust/.work/rollout/<cluster>/deploy.log
   node stardust/scripts/replica/run-bg.mjs wait --max 100 deploy-<cluster>
   ```
   Clusters: program · article · locale-landing · landing · listing · magazine-hub · about · faqs ·
   members-only. A 401 halt (exit 3) resumes with the same command after the token is refreshed.
4. Published-origin gate, `pub1` round, archetype + one sibling per cluster at 1440 and 360:
   ```
   bash stardust/scripts/replica/gate.sh <slug> https://wknd.site/<path>.html \
     https://<branch>--<repo>--<org>.aem.page/<path> 1440 pub1 --full
   bash stardust/scripts/replica/gate.sh <slug> https://wknd.site/<path>.html \
     https://<branch>--<repo>--<org>.aem.page/<path> 360 pub1 --full
   node stardust/scripts/replica/crop-compare.mjs …   # header + footer bands (gate doc § Pass bar 5)
   node stardust/scripts/replica/chrome-parity.mjs https://wknd.site/<path>.html https://<branch>--<repo>--<org>.aem.page/<path>
   node stardust/scripts/replica/gate-evidence.mjs --progress stardust/replica/progress.json
   ```
   Archetype slugs/paths: us-en-html `/us/en` · us-en-adventures-html `/us/en/adventures` ·
   us-en-magazine-html `/us/en/magazine` · us-en-adventures-riverside-camping-australia-html ·
   us-en-magazine-western-australia-html · us-en-about-us-html · us-en-faqs-html ·
   ca-en-magazine-members-only-html · us-es-html `/us/es`.
5. Record and close C-deliver, then continue the rollout phases:
   ```
   node stardust/scripts/rollout/update-coverage.mjs <slug> --status deployed --url <preview-url>   # per page (deploy-batch does this when wired)
   node stardust/scripts/stardust/ledger.mjs rollout C-deliver end --strict --detail "64/64 previewed; gate pub1 1440 x% / 360 y%"
   node stardust/scripts/rollout/assemble.mjs --verify-origin https://<branch>--<repo>--<org>.aem.live   # D-site
   node stardust/scripts/dynamics/dynamics-check.mjs --origin https://<branch>--<repo>--<org>.aem.page  # D2 (after helix-query.yaml + publish)
   node stardust/scripts/deploy/localize-links.mjs --source-host wknd.site --content content --redirects stardust/redirects.tsv --check  # E2
   node stardust/scripts/rollout/verify.mjs --base https://<branch>--<repo>--<org>.aem.page             # E
   node stardust/scripts/rollout/optimize.mjs && node stardust/scripts/rollout/dashboard.mjs           # F, I
   ```
   Open a PR carrying the `<branch>--<repo>--<org>.aem.page/us/en` link (AGENTS.md rule).

## 8. Artifacts

`stardust/eds-conversion-log.md` (C0 + 9 units + C-final, named assumptions A-C0-*, A-P-*, A-LL-*,
A-about-*, A-faq-*, A-ART-*, A-L-*, A-mag-*, A-MO-*, A-F-1…4) · `stardust/rollout/progress.json` ·
`stardust/rollout/units/*.paths|md` · `stardust/rollout/foundation-requests.md` (applied) ·
`stardust/rollout/foundation-freeze.json` · `stardust/eds-schema/*.json` · `stardust/learnings.md`
(6 pending entries) · `stardust/replica/inconsistency-register.md` (R-1) · `stardust/journal.md`.
