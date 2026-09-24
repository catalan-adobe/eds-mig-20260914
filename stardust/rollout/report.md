# rollout — wknd.site /us/en → aem-eds (replica, same-design)

Generated 2026-09-24 from `stardust/rollout/rollout.json.lastRun` (14:04:29Z),
`optimize/scorecard.json` (run-1) and `stardust/qa/dynamics-report.md`.

```
rollout — https://wknd.site/us/en → aem-eds
==================================================
Pages       26 total · 26 verified · 0 deployed · 0 pending
            0 content-pending · 0 stale · 0 failed
Templates   6 (landing 1/1 · adventure detail 16/16 · listing 2/2 · article 5/5
            static 1/1 · faqs 1/1)
Blocks      15 total · 15 converted · 0 pending
Quality     health 100/100 · open P1 0 / P2 0 / P3 0 · source parity 30 (informational)
To deliver  — (none)
Content     0 pages awaiting content track
```

Origins: preview `https://replica-wknd--eds-mig-20260914--catalan-adobe.aem.page`,
live `https://replica-wknd--eds-mig-20260914--catalan-adobe.aem.live`; DA
`catalan-adobe/eds-mig-20260914`, code branch `replica-wknd`.

## Pages by template — published-origin gate (C-final re-gate, pixel diff vs wknd.site)

Coverage ids: landing `us-en-html`, adventure detail `us-en-adventures-climbing-new-zealand-html`,
listing `us-en-adventures-html`, article `us-en-magazine-san-diego-surf-html`, static
`us-en-about-us-html`, faqs `us-en-faqs-html`.

| template | pages | archetype | 1440 | 360 |
|---|---|---|---|---|
| landing | 1 | /us/en | 0.26 % Δh 0 | 0.48 % Δh +1 |
| adventure detail | 16 | /us/en/adventures/climbing-new-zealand | 0.80 % Δh 0 | 2.32 % Δh 0 |
| listing | 2 | /us/en/adventures | 0.21 % Δh 0 | 0.73 % Δh +1 |
| listing — magazine sibling | — | /us/en/magazine | 1.28 % Δh 0 | 3.83 % Δh +13 |
| article | 5 | /us/en/magazine/san-diego-surf | 0.32 % Δh 0 | 2.89 % Δh −1 |
| static | 1 | /us/en/about-us | 0.03 % Δh 0 | 0.23 % Δh +1 |
| faqs | 1 | /us/en/faqs | 0.03 % Δh 0 | 1.22 % Δh +1 |

All 14 rounds PASS, 0 horizontal overflow. Chrome parity 1440 10 / 360 14 residual deltas —
the foundation's justified set (A-C0-8: region-level header reserve vs the live fixed header,
pipeline media-hash icon signatures, icon-link a11y text, off-canvas mobile nav).

Every page: `verify.mjs --base live --all` → 26 verified · 0 failed (E, re-run in G). Headless
render check on the first page of each template 7/7 PASS (0 pageerrors, 0 broken images).

## Blocks (15 authored, `blocks/`)

accordion · content-fragment (delivered as `fragment`) · contributor-byline · contributor-card ·
download · featured-teaser · hero-carousel · hero-teaser · image-list (delivered as `cards`) ·
list-teaser · mini-carousel · sharing (omitted per A-PR-2, sidebar title kept) · tabs ·
trip-facts · upnext-list — plus the foundation: header, footer, hero, columns, article-body,
widget, fragment (`blocks/`), `styles/`, `fonts/`, `head.html`, `scripts/site-config.js`.

## Site assembly

- Served `/sitemap.xml`: 26 URLs = coverage rows (`assemble.mjs --verify-origin` exit 0).
- Redirects sheet `/redirects.json`: 28 rows — `/` and `/index.html` → `/us/en` (the source root
  itself 301s to `/us/en.html`; A-D-1) + 26 `<path>.html → <path>` aliases. `/` → 301 → 200 on
  both origins.
- `/nav` + `/footer` published with `Robots | noindex`.
- Link audit (E2): 42 distinct live hrefs, 27 internal 200 (26 pages + PDF), 15 external 200,
  0 404s; `localize-links --check` PASS.

## Quality (F-optimize run-1, G-aem)

- Open in-scope findings: P1 0 · P2 0 · P3 0; dimensions seo 100 · ai-search 100 · cross-page
  100; brand-tensions / design-ux / accessibility / content-conversion not assessed (null — no
  impeccable or tensions source ran in this hands-off session).
- Source parity (informational, `fixability: out-of-scope`, not scored, not gated): 30 —
  26 × `ai-search/jsonld` (no JSON-LD on the source either), 3 × `seo/title-length` ("About Us",
  "Magazine", "FAQs" are the source's own titles), 1 × `seo/duplicate-description` (2 pages
  share the source's description). Kept byte-faithful by the replica flow (A-G-1).
- `autofix-aem.mjs --project .`: 0 candidates, nothing edited, nothing re-deployed.

## Dynamic surface (D2, `stardust/qa/dynamics-report.md`)

`dynamics-check`: 12 checks / 11 features — pass 12, fail 0.

| feature | class | status | replayed check |
|---|---|---|---|
| DF-01 header search | F/S | delivered — query index, 26 rows | total 26; `surf` → 3 = source |
| DF-03 language nav | I18N | interim — 10 locale roots → wknd.site | 11 links ≥ 10 |
| DF-04 listings | L | interim — authored cards | adv 32 ≥ 16 · home 8 ≥ 6 · mag 5 ≥ 5 |
| DF-07 tags (Launch, Analytics, 2o7, pixel) | T/A | scaffolded-awaiting-owner | consent-gate PASS |
| DF-08 tabs | CR | delivered | 6 × [role=tab] |
| DF-09 hero carousel | CR | delivered | 3 slides [role=tabpanel] |
| DF-10 FAQ accordion | CR | delivered | 7 buttons |
| DF-11 header search / mobile nav toggles | M | delivered | no-page-errors on 6 paths |
| DF-02 / DF-05 / DF-06 | — | decided-out (see `stardust/dynamic-features.md`) | — |

Index: `helix-query.yaml` committed (72e200c) AND the same YAML POSTed to the config service
(204) — this DA-backed site does not consume the repo yaml (A-D2-1).

## Design delta

- R-01 (`stardust/replica/inconsistency-register.md`): the landing page has no `<h1>` on the
  source; the first hero-carousel slide title is delivered as `<h1>` at the `<h2>` size. Applied.
- R-02 candidate (flagged, not applied): `/us/en/magazine` 360 Δh +13 px — the source authors
  one members-only teaser description as bare text, DA delivers every cell as `<p>` (A-CL-3).
  Pixel 3.83 % passes.

## Scope debt / owner decisions

- Locale trees never captured (`/us/es /it/it /fr/fr /es/es /de/de /ch/it /ch/fr /ch/de
  /ca/fr /ca/en`, A-EX1): header language menu repointed to `https://wknd.site/<locale>.html`
  (A-E2-1). Capture + deliver them to bring the language switch in-tree.
- Shared DA content root (A-D2-4, owner decision): sibling run `sd-25-fable-replica` writes the
  same `catalan-adobe/eds-mig-20260914` `/us/en/**` paths. Live was restored from this run's
  28 documents at 13:54Z (`deploy-batch --force`, 28 ok) and every D2–G result was measured on
  that tree; any further publish by the sibling flips live. Fix: one DA repo per run, or
  serialize; then re-run `deploy-batch --force` over `stardust/rollout/units/site-all.paths` and
  replay `dynamics-check` + `verify`.
- Tags (DF-07) stay disabled until the owner supplies Launch property + consent vendor.
