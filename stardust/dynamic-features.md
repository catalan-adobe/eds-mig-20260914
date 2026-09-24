---
_provenance:
  writtenBy: stardust:dynamics (replica Phase 2 gate, hands-off)
  writtenAt: 2026-09-24T07:20:00Z
  againstInput: https://wknd.site/us/en
  readArtifacts:
    - stardust/current/_dynamics.json
    - stardust/current/dynamic-features.generated.md
    - stardust/dynamics/dynamic-features.generated-plan.json
    - stardust/current/_crawl-log.json#dynamicSurface
  targetOrigin: https://main--eds-mig-20260914--catalan-adobe.aem.page
---

# Dynamic features — wknd.site /us/en (replica)

Detector: 6 archetype pages probed, 28 raw findings, reach rolled from the 26-page
`extract --dynamics` capture (26/26 pages carry the same-site data + search form). Target probe:
9/9 recorded first-party API paths are **host-bound** (404 on the EDS host); `/query-index.json`
is 404 on the target (no `helix-query.yaml` yet — rule 8: a yaml file, not a service). The 28
draft rows are curated below into 11 features (duplicates per page merged; the AEM runtime
endpoints grouped).

## Listings contract

Listings ship as `static-snapshot` (authored cards, see DF-04) so the pixel gate has a fixed
target. Every page still emits the metadata an index would read, so the unfreeze to
`index-backed` is a yaml file plus a block change, not a content re-author:

| content type | pages | `<meta name>` fields each page must emit |
|---|---|---|
| adventure (`/us/en/adventures/*`) | 16 | `template=adventure`, `title`, `description`, `image` (og:image), `trip-length`, `price`, `difficulty`, `activity`, `group-size` |
| magazine (`/us/en/magazine/*`) | 5 | `template=magazine`, `title`, `description`, `image` (og:image), `author` |
| other | 5 | `title`, `description`, `image` when the source has one |

Index each listing would read (once unfrozen): `/us/en/adventures/query-index.json` (DF-04a, b),
`/us/en/magazine/query-index.json` (DF-04c); search (DF-01) reads `/us/en/query-index.json`.

## Features

| # | id | feature | class | reach | disposition | reproducibility | status | pattern | decision / owner | evidence |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | DF-01 | Header search: `form.cmp-search__form` (1 field `fulltext`) → same-origin `<page>.searchresults.json/…/search`, typeahead dropdown of page results (title + description + url) | F/S | 26/26 | index-backed | self | pending (handoff Phase 4) | search-index-backed | none — `helix-query.yaml` authored in the code branch; results dropdown rebuilt in the header block, ranked title-first, deduped, capped at source count | 6 draft rows `f-form-cmp-search-form-*`; source probe `fulltext=surf` → 3 results: Surf Camp in Costa Rica · Bali Surf Camp · San Diego Surf Spots (recorded in `stardust/dynamics/parity.json`) |
| 2 | DF-02 | Sign In / Sign Out header links (`#sign-in` / `#sign-out`, `data-modal-url` trigger, target outside DOM; "Welcome" greeting) | X/M | 26/26 | decided-out | needs-backend | decided-out | decided-out | **A-DY2** owner: auth / commerce on the new host? Hands-off: none exists — the visible links are kept as static chrome (design frozen), the modal/session behaviour is not rebuilt | draft rows `x-sign-in-account-links`, `m-modal-trigger-data-modal-url-*`; header text "Welcome · Sign In · Sign Out" |
| 3 | DF-03 | Language navigation (10 locale variants: en-US es-US en-CA fr-CA de-CH fr-CH it-CH de-DE fr-FR es-ES it-IT) | I18N | 26/26 | rebuild-native | needs-business-decision | interim | locale-tree | **A-DY3** owner: scope of the locale trees. Hands-off: nav rebuilt as static chrome with root-relative locale hrefs (`/ca/en.html` …); the trees themselves are scope debt D3-multilingual (A-EX1) and 404 on the target until rolled out | draft row `i18n-locale-variants-*`; header language list |
| 4a | DF-04a | Adventures listing `cmp-image-list` (16 cards, `cmp-tabs` filter by activity) | L | 1 (`/adventures.html`) | static-snapshot | self | interim | listing-index-backed | **A-DY4** owner: index-driven or editorially curated? Hands-off: cards authored as static content (pixel gate target); unfreeze condition: owner confirms index-driven → `index-backed` on `/us/en/adventures/query-index.json` at rollout | draft row `l-listing-candidate-cmp-image-list-16-cards` |
| 4b | DF-04b | Home "Adventures" `cmp-image-list` (6 cards) | L | 1 (`/en.html`) | static-snapshot | self | interim | listing-index-backed | as DF-04a (A-DY4) | draft row `l-listing-candidate-cmp-image-list-6-cards` |
| 4c | DF-04c | Magazine listing `cmp-list` (5 teasers) | L | 1 (`/magazine.html`) | static-snapshot | self | interim | listing-index-backed | as DF-04a (A-DY4); index `/us/en/magazine/query-index.json` | draft row `l-listing-candidate-cmp-list-5-cards` |
| 5 | DF-05 | AEM Sites runtime data: ContextHub (`segments.seg.js`, `<page>/_jcr_content/contexthub.pagedata.json`), Granite `csrf/token.json`, `security/currentuser.json`, `/home/users/…infinity.json` | D | 26/26 | decided-out | self | decided-out | — | none — session/personalization plumbing of the source CMS; no personalized variation observed in any capture; all 9 paths dead on target (404) | draft rows `d-first-party-data-file-*` (9, hostBound) |
| 6 | DF-06 | CMS settings objects `Granite`, `CQ` (AEM runtime globals) | A | 26/26 | decided-out | self | decided-out | — | none — authoring-runtime globals with no consumer on the migrated pages | draft rows `a-cms-app-settings-object-granite`, `-cq` |
| 7 | DF-07 | Tags: Adobe Launch (`assets.adobedtm.com`), Adobe Analytics / Experience Cloud ID (`dpm.demdex.net`), Adobe Analytics collection host `wkndsitewknd887971p.112.2o7.net` (classified from host: Omniture/AA data collection — not unknown), ad/retargeting pixel, `adobeDataLayer` settings object | T/A | 26/26 | embed-passthrough | needs-business-decision | scaffolded-awaiting-owner | consent-gated-tags | **A-DY7** owner: which tags run on the new host; Launch property id. Hands-off: `scripts/site-config.js` scaffold with the Launch embed **disabled** (loaded from `delayed.js` once enabled); `adobeDataLayer` ships with it | draft rows `t-tag-manager-adobe-launch`, `t-analytics-*`, `t-marketing-*`, `t-unknown-third-party-host-*`, `a-cms-app-settings-object-adobedatalayer` |
| 8 | DF-08 | Tabs: adventures listing activity filter (`cmp-tabs`), adventure detail Overview / Itinerary / What to Bring (`cmp-tabs`) | CR | 17 | client-only | self | pending (Phase 3 recreate) | chrome-interaction | none — pure client tab switching, all panels server-rendered in the capture | Phase 1 summary; `stardust/current/pages/us-en-adventures-html.html`, `…climbing-new-zealand-html.html` (`cmp-tabs__tab`, `cmp-tabs__tabpanel`) |
| 9 | DF-09 | Carousels: home hero `cmp-carousel--hero` (3 slides, autoplay + indicators), adventure detail mini carousel | CR | 17 | client-only | self | pending (Phase 3 recreate) | chrome-interaction | none — slides server-rendered; autoplay timing verified by `motion-compare.mjs` in Phase 4 | `us-en-html.html` `cmp-carousel__item` ×3; Phase 1 summary |
| 10 | DF-10 | FAQ accordion (`cmp-accordion`) | CR | 1 (`/faqs.html`) | client-only | self | pending (Phase 3 recreate) | chrome-interaction | none | `us-en-faqs-html.html` |
| 11 | DF-11 | Header chrome interactions: search toggle (`cmp-search__field`), mobile navigation toggle | M | 26/26 | rebuild-native | self | pending (Phase 3 recreate) | chrome-interaction | none | header slice; `triggerPages.data-modal-url` |

Every row has a disposition — the gate passes. Rows 8–11 are not in the detector draft (the
source is server-rendered, so `client-rendered 0`); they are added from the Phase 1 evidence
because the pixel gate cannot certify interactions and `motion-compare.mjs` needs a named list.

## Decision batch

One message to the owner; the interim tier ships in every case (hands-off resolutions, recorded
as named assumptions in `stardust/direction.md`):

- **Backend / auth (DF-02, A-DY2):** is there a sign-in / account backend on the new host? None
  assumed → links kept as static chrome, no modal, no session.
- **Locale scope (DF-03, A-DY3):** which of the 10 locale trees migrate, and when? `/us/en` only
  now (A-EX1); the language nav keeps root-relative locale hrefs that 404 until D3-multilingual.
- **Listing datasource (DF-04, A-DY4):** are the adventures / magazine listings index-driven
  (new pages appear automatically) or editorially curated? Static-snapshot cards now; unfreeze
  to `index-backed` once confirmed — metadata contract above is emitted regardless.
- **Tags (DF-07, A-DY7):** which tags run on the new host, and under which Launch property? The
  scaffold ships disabled; no third-party request is made by the migrated pages until enabled.

## Register (decided-out)

| feature | reason | production statement |
|---|---|---|
| DF-02 Sign In / Sign Out behaviour | session-bound AEM Sites login/ContextHub; no auth backend on EDS | The header shows the "Welcome / Sign In / Sign Out" links exactly as designed; clicking does nothing until an owner-provided auth endpoint exists. |
| DF-05 ContextHub + Granite CSRF/currentuser/infinity JSON | source-CMS runtime plumbing, no consumer on the migrated pages, 404 on target | Not migrated; no personalization or session state exists on the new host. |
| DF-06 `Granite` / `CQ` globals | authoring-runtime globals | Not migrated. |

## B2 re-verification (rollout prepare, 2026-09-24)

Fresh evidence: `dynamics-detect.mjs --from-state --reach stardust/current` → 28 findings over
6 probed pages (same feature set as the Phase 2 run; only the sampled sibling pages differ),
`dynamics-plan.mjs --target-origin https://replica-wknd--eds-mig-20260914--catalan-adobe.aem.page
--migrated stardust/migrated` → 28 rows, self 13, owner batch 14, delivered 0, host-bound 9/9.
Every fresh row maps to DF-01…DF-11 (`adobeDataLayer` and the ad/retargeting pixel are inside
DF-07); no new feature, no row without a disposition. Gate passes. Runtime note for the
foundation: this boilerplate has no `delayed.js` — `scripts/scripts.js` `loadDelayed()` imports
`scripts/consent-check.js` (consent declined by default, `consented.js` only on
`?consent=accept`), so the DF-07 disabled tag scaffold lives behind `consented.js`, not a new
`delayed.js`. DF-01 (search) stays `index-backed`, built in D2-dynamic (`helix-query.yaml` in the
code branch + the search results page with a coverage row); the header ships the search form UI
as chrome (DF-11) in C0.
