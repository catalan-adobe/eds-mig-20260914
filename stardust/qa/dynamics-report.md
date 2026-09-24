# Dynamics parity check — https://replica-wknd--eds-mig-20260914--catalan-adobe.aem.live — 2026-09-24T13:55:55.250Z

Replayed 12 checks over 11 features · pass 12 · fail 0. Flows, not presence.

| feature | class | status | check | result | detail | third-party requests |
|---|---|---|---|---|---|---|
| header search (typeahead) | F/S | delivered (D2: config-service query index /us/en/query-index.json, 26 rows; header typeahead) | fetch-json | PASS | 200 · 26 rows · keys columns,data,offset,limit,total,:type |  |
| header search (typeahead) | F/S | delivered (D2: config-service query index /us/en/query-index.json, 26 rows; header typeahead) | search-query | PASS | 3 results (source 3) · first: bali surf camp · matches the source |  |
| language navigation | I18N | interim | dom-count | PASS | 11 × header .language-menu a (min 10) |  |
| listings (adventures 16, home 6, magazine 5) | L | interim | dom-count | PASS | 32 × .cards .card (min 16) |  |
| listings (adventures 16, home 6, magazine 5) | L | interim | dom-count | PASS | 8 × .cards .card (min 6) |  |
| listings (adventures 16, home 6, magazine 5) | L | interim | dom-count | PASS | 5 × .cards .card (min 5) |  |
| tags (Adobe Launch, Analytics/ECID, 2o7, retargeting pixel) | T/A | scaffolded-awaiting-owner (scripts/site-config.js tags.enabled=false, A-DY7) | consent-gate | PASS | no request to 3 gated host pattern(s) before consent |  |
| tabs (listing filter, adventure detail) | CR | delivered (Phase A block, C-deliver) | dom-count | PASS | 6 × [role=tab] (min 3) |  |
| tabs (listing filter, adventure detail) | CR | delivered (Phase A block, C-deliver) | dom-count | PASS | 6 × [role=tab] (min 2) |  |
| carousels (home hero, adventure mini) | CR | delivered (Phase A block, C-deliver) | dom-count | PASS | 3 × .hero-carousel .hero-carousel-item[role=tabpanel] (min 3) |  |
| FAQ accordion | CR | delivered (Phase A block, C-deliver) | dom-count | PASS | 7 × .accordion [role=button], .accordion button (min 3) |  |
| header search toggle + mobile nav toggle | M | delivered (Phase A block, C-deliver) | no-page-errors | PASS | none on 6 page(s) |  |

## Features without checks

- Sign In / Sign Out links (X/M) — decided-out · owner: A-DY2: auth / commerce backend on the new host?
- ContextHub + Granite runtime JSON (D) — decided-out
- Granite / CQ globals (A) — decided-out
