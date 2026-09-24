<!-- stardust:provenance
  writtenBy: stardust:replica (dynamics Phase 3)
  writtenAt: 2026-09-24T07:45:00Z
  againstInput: https://wknd.site
  readArtifacts:
    - stardust/dynamic-features.md
    - stardust/dynamics/dynamic-features.generated-plan.json
  targetOrigin: unknown
  handsOff: true
-->
# Dynamic features plan — wknd.site

Static first, then wire (triage rule 7): every feature below degrades to a working static page in
Phase 3 RECREATE; the wiring phases replace one degradation with the live behaviour and never
block delivery. Target origin unknown — phases that need the host are marked *(host)*.

## Phase P1 — Chrome interactions (client-only, ship with the foundation)

Rows: M-04 language dropdown, M-05 off-canvas nav, M-06 sign-in/out anchors, F-01 search UI.

- **Deliverables:** `blocks/header/header.js|css` — utility bar (Sign In / Sign Out hash anchors,
  language toggle → dropdown of 9 locale roots), primary nav, hamburger + off-canvas panel at
  ≤ 1200 px, search field with clear button and results dropdown (min 3 chars, 5 rows).
- **Authoring contract:** per-locale `nav` document (`/us/en/nav`, `/ca/en/nav`, …): brand,
  sections, tools; the language list is one list in the nav doc.
- **Verification:** `motion-observe.mjs` on the live header vs the recreation (open/close states
  at 1440 and 360); `chrome-parity.mjs` on every archetype.
- **Owner decision:** D-X1 (auth) — interim inert anchors. **Effort:** S.

## Phase P2 — Content-block interactions (client-only)

Rows: M-01 carousel, M-02 tabs, M-03 accordion.

- **Deliverables:** `blocks/carousel/` (3 slides, autoplay 5000 ms, pause on interaction,
  prev/next + indicators; variants `hero` for home, gallery for adventure detail), `blocks/tabs/`
  (adventure detail: itinerary / what-to-bring; adventures listing: activity filter panels each
  holding one cards list), `blocks/accordion/` (single-expand, 7 items on FAQ).
- **Authoring contract:** carousel = one row per slide (image | title/description/CTA); tabs =
  one row per tab (label | panel content); accordion = one row per item (question | answer).
- **Verification:** `motion-observe.mjs` + `motion-compare.mjs` per archetype (carousel
  autoplay interval, tab/accordion toggle states); pixel gate covers the resting state.
- **Owner decision:** none. **Effort:** M.

## Phase P3 — Listings (interim: authored cards)

Rows: L-01, L-02, L-03.

- **Deliverables:** `blocks/cards/` (image-list style: image, title, description, CTA; variants
  for the 3-up adventure grid, the magazine 2-col teaser list and the article sidebar list).
  Cards authored verbatim from the capture per listing page (decision D-L1).
- **Authoring contract:** one row per card (image | title | description | link). Every adventure
  and article page emits the `<meta>` fields of the § Listings contract so the index-driven
  switch is a data-source change only.
- **Verification:** card count and order equal the capture per listing (`content-fidelity`
  check); pixel gate.
- **Owner decision:** D-L1 — interim curated. *(host)* On opt-in: `helix-query.yaml` with the
  per-locale adventure/magazine indexes, `cards.js` reads the index. **Effort:** M (interim) / S
  (switch).

## Phase P4 — Search *(host)*

Row: F-01.

- **Deliverables:** `helix-query.yaml` site-wide index (title, description, image, path) committed
  in the code branch; `blocks/header/search.js` fetches `/query-index.json` once, ranks title
  matches first, dedupes by title + description, caps the dropdown at 5 (source
  `data-cmp-results-size="5"`, `data-cmp-min-length="3"`).
- **Authoring contract:** none beyond page metadata.
- **Verification:** parity check `search-query` term `surf` → expectCount 3, expectTitles
  [Surf Camp in Costa Rica, Bali Surf Camp, San Diego Surf Spots], expectIncludes
  `/us/en/adventures/bali-surf-camp.html`. Until the host exists the search UI ships with the
  field, clear button and an empty results list (presence check only).
- **Owner decision:** none (self); requires code-branch write on the target. **Effort:** S.

## Phase P5 — Tags *(owner)*

Row: T-01.

- **Deliverables:** none wired. The Launch library URL and vendor hosts are recorded in
  `stardust/dynamic-features.md` § Decision batch for the owner; when a property id arrives the
  loader goes in `scripts/delayed.js` (owner-facing, consent not required — no CMP on source).
- **Verification:** third-party request census on the deployed page = 0 until D-T1 is answered.
- **Owner decision:** D-T1. **Effort:** XS.

## Decided-out (no phase)

X-01 auth backend, D-01 ContextHub, D-02 Granite plumbing — § Register in
`stardust/dynamic-features.md`.

## Locale wave

I18N-01: all captured locale roots ship (D-I1 = assumption A2). `/ca/en/*` pages ride the sibling
tier of their `/us/en/*` twins; the 9 stub roots render the `stub` archetype. No `D3-multilingual`
work — no uncaptured language trees exist.

## Verification summary (Phase 5 inputs)

`stardust/dynamics/parity.json` checks to emit at implement time: `chrome-open` (M-04, M-05),
`carousel-autoplay` (M-01), `tab-switch` (M-02), `accordion-toggle` (M-03), `search-query`
(F-01, expectations above), `listing-count` (L-01 16/L-02 6+3/L-03 4), `third-party-requests`
(T-01 = 0), `first-party-api` (D-01/D-02 absent = pass).
