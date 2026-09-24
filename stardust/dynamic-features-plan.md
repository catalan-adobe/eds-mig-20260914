---
_provenance:
  writtenBy: stardust:dynamics (replica Phase 2 gate, hands-off)
  writtenAt: 2026-09-24T07:20:00Z
  againstInput: https://wknd.site/us/en
  readArtifacts:
    - stardust/dynamic-features.md
    - stardust/dynamics/dynamic-features.generated-plan.json
  targetOrigin: https://main--eds-mig-20260914--catalan-adobe.aem.page
---

# Dynamic features plan — wknd.site /us/en (replica)

Static first, then wire (triage rule 7). Every feature degrades to a working static page in
Phase 3; the phases below replace one degradation at a time. Counts: 11 curated features —
self 8 · owner batch 3 (DF-03, DF-04, DF-07; DF-02 decided-out) · delivered 0 · decided-out 3.

## Phase A — recreate-time (replica Phase 3, ships with the archetypes)

| deliverable | features | authoring contract | verification | effort |
|---|---|---|---|---|
| `blocks/header` with nav, language list, Sign In/Out links (static), search field + toggle | DF-02, DF-03, DF-11 | `nav.html` fragment: brand, primary nav, locale list, account links, search input | `chrome-parity.mjs` per breakpoint; `motion-observe.mjs --click` on search toggle and mobile nav | S |
| `blocks/tabs` (listing filter + detail Overview/Itinerary/What to Bring) | DF-08 | one row per tab: label cell + panel cell; first tab active | `dom-count` panels; `motion-compare.mjs` on tab click | S |
| `blocks/carousel` hero (autoplay, indicators) + mini carousel | DF-09 | one row per slide: image cell + text cell; autoplay interval read from source (`cmp-carousel` data attr) | `motion-compare.mjs` slide timing ± tolerance | M |
| `blocks/accordion` (FAQ) | DF-10 | one row per item: heading cell + body cell | `motion-observe.mjs --click` first item | S |
| Listing cards as authored block content (`image-list`, `list`) | DF-04a/b/c | one row per card: image, title, description, meta; metadata fields per § Listings contract emitted by every page | pixel gate (Phase 4) | S |

## Phase B — handoff-time (dynamics Phase 4, in the code branch before rollout)

| deliverable | features | authoring contract | verification | owner decision | effort |
|---|---|---|---|---|---|
| `helix-query.yaml` (indices `/us/en/query-index.json`, `/us/en/adventures/…`, `/us/en/magazine/…`) pushed + published; poll bounded | DF-01 (needed), DF-04 (unfreeze) | metadata contract § Listings contract | `fetch-json` `/us/en/query-index.json` minRows 26 | none | S |
| Search results dropdown in `blocks/header` fed by the index (title-first ranking, dedupe, cap at source count) | DF-01 | `fulltext` input keeps its name; results render title + description as on source | `search-query` term `surf` → count 3, titles {Surf Camp in Costa Rica, Bali Surf Camp, San Diego Surf Spots} (`stardust/dynamics/parity.json`) | none | M |
| `scripts/site-config.js` scaffold: Launch embed URL + `adobeDataLayer` init, **disabled**; wired from `delayed.js` | DF-07 | `SITE_CONFIG.tags.enabled = false` until the owner sets the property | `consent-gate` forbiddenHosts [assets.adobedtm.com, dpm.demdex.net, 112.2o7.net] while disabled | A-DY7 which tags / property id | S |

## Phase C — owner-gated (after the decision batch)

| deliverable | features | unfreeze condition | effort |
|---|---|---|---|
| Listings switch to `index-backed` blocks reading the Phase B indices | DF-04a/b/c | owner confirms index-driven (A-DY4) | S |
| Locale trees rolled out; language nav hrefs resolve | DF-03 | owner scopes locales (A-DY3) — rollout scope debt D3-multilingual | L |
| Sign-in modal + session | DF-02 | owner provides an auth backend (A-DY2); otherwise stays decided-out | — |
| Tags enabled | DF-07 | owner names the tags + property (A-DY7) | S |

## Verification (dynamics Phase 5)

`stardust/dynamics/parity.json` holds the checks: DF-01 `search-query`, DF-08/09/10 `dom-count`
+ motion evidence, DF-07 `consent-gate`, `no-page-errors` on the six archetype paths. Replayed by
`dynamics-check.mjs --origin <live>` after rollout; report at `stardust/qa/dynamics-report.md`.
