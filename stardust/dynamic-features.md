<!-- stardust:provenance
  writtenBy: stardust:replica (dynamics Phases 1–3)
  writtenAt: 2026-09-24T07:45:00Z
  againstInput: https://wknd.site
  readArtifacts:
    - stardust/current/_dynamics.json (dynamics-detect, 9 archetype pages, reach 64/64)
    - stardust/current/dynamic-features.generated.md (34 findings)
    - stardust/dynamics/dynamic-features.generated-plan.{md,json} (draft, no --target-origin)
    - stardust/current/pages/<archetype>.html (cmp-* component census)
  targetOrigin: unknown (no EDS host yet — host-bound probe deferred to rollout B2)
  handsOff: true
-->
# Dynamic features — wknd.site

Detector probed 9 pages (one per page type; `dynamics-detect --from-state` picked the
first slug per type, all /ca/en — the /ca/en tree is a byte-identical MSM copy of /us/en, so the
evidence is site-wide). Reach rolled from all 64 crawled pages. 34 generated findings curated into
15 rows: the 9 per-page search-form findings are one feature, the 9 ContextHub `pagedata.json`
GETs are one feature, and 5 client-only interactions the network detector cannot see (carousel,
tabs, accordion, language dropdown, off-canvas nav) were added from the captured DOM.

**Target origin is unknown.** No EDS host exists yet, so `dynamics-plan.mjs` ran without
`--target-origin`; no row is marked host-bound. Rollout B2 re-runs the plan with the host and
re-checks rows D-01/D-02 (all first-party AEM paths will be dead there — already decided-out).

## Listings contract

Every listing on the site is a Core Components image-list / list rendered server-side from
authored page references. Replica preserves the cards verbatim as authored content (interim
tier); the index contract below is what an index-driven switch needs and what `helix-query.yaml`
must expose.

| content type | pages | `<meta>` fields each page must emit | index | read by |
|---|---|---|---|---|
| adventure (`program`) | /us/en/adventures/*, /ca/en/adventures/* (32) | `title`, `description`, `image`, `activity` (Climbing/Cycling/Skiing/Surfing/Travel), `trip-length`, `price`, `difficulty` | `/{locale}/adventures/query-index.json` | L-01 adventures listing (6 activity tabs), L-03 article "related adventures" |
| article (`article`) | /us/en/magazine/*, /ca/en/magazine/* (12) | `title`, `description`, `image`, `author`, `published-time` | `/{locale}/magazine/query-index.json` | L-02 magazine listing, members-only listing, L-03 recent articles |
| any page | 64 | `title`, `description` | `/query-index.json` (site-wide) | F-01 site search |

## Features

| # | id | feature | class | reach | disposition | reproducibility | status | pattern | decision / owner | evidence |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | F-01 | Header site search (`cmp-search`, typeahead: min 3 chars, 5 results dropdown; GET `<page>.searchresults.json/…/search?fulltext=`) | S search (detector: F form) | 64/64 | index-backed | self | planned | search-index-backed | none — rebuilt on `/query-index.json`; no results page on source (dropdown only), so none is invented | 9 generated `f-form-cmp-search-form-*` rows; probe `surf` → **expectCount 3**, **expectTitles** Surf Camp in Costa Rica · Bali Surf Camp · San Diego Surf Spots, **expectIncludes** /us/en/adventures/bali-surf-camp.html |
| 2 | L-01 | Adventures listing — 6 activity tabs (All 16 · Climbing · Cycling · Skiing · Surfing · Travel), each a `cmp-image-list` | L listing | 2/64 (listing pages) | index-backed | needs-business-decision | interim | listing-index-backed | **D-L1 (hands-off): editorially curated** — cards authored verbatim from capture; index-driven switch deferred to rollout B2 once the owner opts in | `l-listing-candidate-cmp-image-list-16-cards`; us-en-adventures-html.html `cmp-tabs` × 6 panels |
| 3 | L-02 | Magazine listing (`cmp-image-list`, 6 cards) + members-only listing (`cmp-image-list`, 3 cards) | L listing | 3/64 | index-backed | needs-business-decision | interim | listing-index-backed | D-L1 (same as L-01) | `l-listing-candidate-cmp-image-list-6-cards`; ca-en-magazine-members-only-html.html |
| 4 | L-03 | Article sidebar lists (`cmp-list`, 4 cards: recent articles / related adventures) | L listing | 12/64 | index-backed | needs-business-decision | interim | listing-index-backed | D-L1 (same as L-01) | `l-listing-candidate-cmp-list-4-cards`; us-en-magazine-western-australia-html.html |
| 5 | M-01 | Hero carousel (`cmp-carousel`, 3 slides, autoplay delay 5000 ms, prev/next + indicators) — home hero and adventure-detail gallery | M interactive | 34/64 | rebuild-native | self | planned | chrome-interaction (client-only block JS) | none | us-en-html.html / us-en-adventures-riverside-camping-australia-html.html `data-cmp-delay="5000"`, hooks item/indicator/previous/next |
| 6 | M-02 | Tabs (`cmp-tabs`): activity filter on adventures listing; itinerary / what-to-bring on adventure detail | M interactive | 34/64 | rebuild-native | self | planned | client-only tab switch (aria-selected / aria-hidden) | none | `data-cmp-hook-tabs="tab|tabpanel"` on listing + program archetypes |
| 7 | M-03 | FAQ accordion (`cmp-accordion`, 7 items, single-expand) | M interactive | 2/64 | rebuild-native | self | planned | client-only accordion | none | us-en-faqs-html.html `cmp-accordion__item` × 7 |
| 8 | M-04 | Language navigation dropdown (`cmp-languagenavigation`, header toggle, 2 countries → 9 locale roots) | M interactive / I18N | 64/64 | rebuild-native | self | planned | chrome-interaction | none (locale scope is A2 — all captured locales linked) | `cmp-languagenavigation--langnavtoggle` on every page |
| 9 | M-05 | Off-canvas mobile navigation (`cmp-navigation--mobile`, hamburger toggle at ≤ 1200 px) | M interactive | 64/64 | rebuild-native | self | planned | chrome-interaction | none | `cmp-navigation--mobile` on every page; 360 px capture shows hamburger |
| 10 | M-06 | Sign In / Sign Out utility links (`data-modal-url="#sign-in"` / `#sign-out`; modal target absent from DOM) | M modal | 64/64 (128 triggers) | static-snapshot | self | interim | inert anchor | **D-X1 (hands-off):** links kept verbatim as hash anchors (pixel + content fidelity); no modal exists on the source to rebuild. Unfreeze: owner supplies an auth (IMS) target | `m-modal-trigger-data-modal-url-chrome-only-target-outside-do` |
| 11 | X-01 | Authentication / account (what Sign In would open) | X auth | 64/64 | decided-out | needs-backend | decided-out | register | D-X1 — no auth backend on the new host; see § Register | `x-sign-in-account-links` |
| 12 | I18N-01 | Locale tree — us/en, ca/en (full, MSM twins) + us/es, ca/fr, ch/de, ch/fr, ch/it, de/de, es/es, fr/fr, it/it ("Coming Soon!" stubs) | I18N | 64/64 | rebuild-native | needs-business-decision | planned | locale-tree | **D-I1 (hands-off, = assumption A2):** every captured locale root ships; ca/en rides the sibling tier of us/en; the 9 stubs ship as `stub` pages. No uncaptured language trees exist (D3-multilingual n/a) | `i18n-locale-variants-us-us-ch-ch-ch` |
| 13 | T-01 | Adobe Experience Platform tags — Launch (`assets.adobedtm.com`), Analytics / ECID (`dpm.demdex.net`, `wkndsite.demdex.net`, `wkndsitewknd887971p.112.2o7.net` = Adobe Analytics collection server), Advertising Cloud pixel (`cm.everesttech.net`), `adobeDataLayer` global | T tag | 64/64 | embed-passthrough | needs-business-decision | scaffolded-awaiting-owner | consent-gated-tags (delayed.js) | **D-T1 (hands-off):** no tag loads on the new host until the owner names the Launch property for it; the source's Launch script URL is recorded here for the owner, not wired. No CMP on source, none added | `t-tag-manager-adobe-launch`, `t-analytics-*`, `t-marketing-*`, `t-unknown-third-party-host-wkndsitewknd887971p-112-2o7-net` (resolved: Adobe Analytics, not "inspect"), `a-cms-app-settings-object-adobedatalayer` |
| 14 | D-01 | AEM ContextHub page data (`/_jcr_content/contexthub.pagedata.json` per page, `segments.seg.js`) | D data / A personalisation | 64/64 | decided-out | self | decided-out | register | No visible surface on any captured page (no targeted content observed); nothing to reproduce off-origin | 9 `d-first-party-data-file-get-content-wknd-*-contexthub.pagedata.json` rows |
| 15 | D-02 | AEM runtime/session infrastructure — `/libs/granite/csrf/token.json`, `/libs/granite/security/currentuser.json`, `/home/users/o/….infinity.json`, `Granite` / `CQ` globals | D data / A settings | 64/64 | decided-out | self | decided-out | register | Authoring/session plumbing of the AEM publish tier; no consumer on migrated pages | `d-first-party-data-file-get-libs-granite-*`, `d-…-home-users-*`, `a-cms-app-settings-object-granite|cq` |

Rows with disposition: **15/15** (gate: pass). Regulated-PII forms: **none** (the only form is the
search box). Blank client-rendered captures: **none** (`client-rendered 0` on all 9 probes).

## Decision batch

One message to the owner; each item already has a hands-off interim decision so nothing waits.

**Business decisions**
- **D-L1 Listings (L-01, L-02, L-03):** index-driven or editorially curated? *Interim:* curated —
  cards authored verbatim from the capture (content fidelity). Switching to the query index later
  changes no markup, only the block's data source.
- **D-I1 Locale scope (I18N-01):** *Interim:* all 11 captured locale roots delivered; 9 as
  "Coming Soon!" stubs exactly as live. Nothing dropped for being a duplicate or a stub.
- **D-T1 Tags (T-01):** which tags run on the new host and under which Launch property / report
  suite? *Interim:* none load. Source references (for the owner):
  `assets.adobedtm.com` Launch library, report suite host `wkndsitewknd887971p.112.2o7.net`,
  ECID org `wkndsite.demdex.net`, Advertising Cloud `cm.everesttech.net`.

**Backend**
- **D-X1 Auth (M-06 / X-01):** is Sign In / Sign Out meant to work on the new host? The source
  has no working modal or backend either. *Interim:* links preserved as inert hash anchors.

**Target host (not a decision — a missing input)**
- No EDS origin / DA target was supplied (assumption A3). Rollout B2 re-runs
  `dynamics-plan.mjs --target-origin <host>` and authors `helix-query.yaml` in the code branch
  (`/query-index.json` 404 on target = author the yaml, never a sheet interim — triage rule 8).

## Register (decided-out)

| feature | reason | production statement |
|---|---|---|
| X-01 Authentication / account | Session-bound to the AEM publish tier; no backend on the new host; source modal target does not exist in the DOM | Sign In / Sign Out render exactly as on the source (utility-bar links, `#sign-in` / `#sign-out`); clicking them does nothing, as on the source's captured state. No account feature exists on the migrated site. |
| D-01 ContextHub page data / segments | AEM personalisation runtime; no targeted content observed on any of 64 pages; cannot exist off-origin | The migrated pages are the default (non-personalised) experience, which is what every captured page showed. |
| D-02 Granite CSRF / currentuser / user-home JSON, `Granite`/`CQ` globals | AEM authoring & session plumbing; no consumer on migrated pages | Not present on the migrated site; no visible or functional difference. |
