---
_provenance:
  writtenBy: stardust:replica
  writtenAt: 2026-09-24T07:20:26.805Z
  againstInput: https://wknd.site/us/en
  readArtifacts:
    - stardust/current/PRODUCT.md
    - stardust/current/DESIGN.md
    - stardust/current/DESIGN.json
---

# Direction — preserve mode (same-design migration)

Mode: PRESERVE. The target spec is the captured current state of https://wknd.site/us/en,
promoted verbatim (no direct invocation, no creative decisions).

Promoted: current/PRODUCT.md → PRODUCT.md · current/DESIGN.md → DESIGN.md ·
current/DESIGN.json → DESIGN.json (at 2026-09-24T07:20:26.805Z). Provenance: verbatim --prep promotion
(byte-for-byte, verified with cmp).

Permitted deltas: ONLY the entries of stardust/replica/inconsistency-register.md
(empty — pure replica).

Fidelity: ia verbatim · design verbatim · content verbatim.

Hands-off activation: stardust replica run HANDS-OFF — every gate is resolved by its documented
hands-off rule and recorded below as a named assumption; quality gates never weaken.

Flow: **replica**. No redesign, no rewording, no improvement. This file records the
hands-off judgments made at each gate as named assumptions.

## Assumptions — Extract (2026-09-24)

- **A-EX1 Scope = /us/en subtree.** The crawl is narrowed to `https://wknd.site/us/en`
  (26 pages, discovered by same-origin BFS depth 3 — no sitemap.xml/robots Sitemap
  exists; `/sitemap.xml` answers the 404 page). The other locale trees (ca/en, ca/fr,
  ch/de, ch/fr, ch/it, de/de, es/es, fr/fr, it/it, us/es) are duplicate-design
  translations and are scope debt for rollout **D3-multilingual**, not captured now.
  `wknd.site/` 301s to `/us/en.html`. `/us/en/errors/404.html` is excluded as junk.
- **A-EX2 Slugs are the crawler's.** Page slugs are what the shipped `crawl.mjs`
  produced (`us-en-adventures-bali-surf-camp-html`); they are not renamed, so
  `renderedHtml`/`screenshot` references stay valid. Path mapping for delivery is the
  URL pathname in `state.json.pages[].url`.
- **A-EX3 Page types.** home → `landing`; `/adventures.html`, `/magazine.html` → `listing`;
  `/adventures/*` (16) → `program` (trip detail: facts, itinerary, price);
  `/magazine/*` (5) → `article`; `/about-us.html` → `static`; `/faqs.html` → `unique`
  (accordion + aside; no static sibling shares its shape).
- **A-EX4 Listing archetype.** The two `listing` pages differ in shape (adventures:
  `cmp-tabs` + image list; magazine: featured teaser + teaser grid). The adventures
  listing is the archetype (it feeds the 16-page program funnel); the magazine listing
  is a declared variant, to be recreated on its own in Phase 2 (`migrate.mjs variant`).
- **A-EX5 cssBackgrounds: [] is genuine.** Every page reports zero CSS backgrounds
  because imagery is served through `<img>` (AEM core image/teaser/carousel). Verified
  by reading 8 archetype thumbnails; the remaining 18 pages are template siblings with
  consistent crawler signals (no spaShellSuspect, no duplicateOf, ≥4 imgs, ≥3
  headings) and are recorded `ok` with `method: sibling-inference` in
  `_crawl-log.json#visionCheck`.
- **A-EX6 Style census run from a work copy.** `stardust/scripts/style-census.mjs`
  looks for `live-session.mjs` beside itself; `stardust/scripts/` may not be modified,
  so both files were copied to `stardust/.work/extract/census/` and run from there
  (same project `node_modules`). Output is the canonical
  `stardust/current/_computed-styles.json`.
- **A-EX7 Fonts.** Asar and Source Sans Pro are loaded from Google Fonts on the source
  (SIL OFL 1.1) — latin subsets saved under `stardust/current/assets/fonts/` for
  self-hosting; `wknd-icon-font` (ttf+woff) is the site's own clientlib font. The
  Google Fonts `<link>` is kept as the loader of record; self-hosting is a delivery
  decision for Phase 5, not a design change.
- **A-EX8 Dynamic surface is evidence only.** Header search (`<page>.searchresults.json
  ?fulltext=`, 26/26), Sign In/Out anchors, language nav, AEM ContextHub / Granite CSRF
  / currentuser JSON, Adobe Launch (`assets.adobedtm.com`) and Audience Manager
  (`dpm.demdex.net`) are recorded in `_crawl-log.json#dynamicSurface`; classification
  and re-implementation belong to the `dynamics` sub-skill.
- **A-EX9 Tensions are descriptive.** The brand-review tension cards (ad-hoc scale,
  fragmented CTA voice, text-only accent, no `:root` tokens) are recorded for the canon;
  replica changes none of them.

## Assumptions — Preserve direction + dynamics gate (2026-09-24)

- **A-PD1 Verbatim promotion.** `stardust/current/{PRODUCT.md,DESIGN.md,DESIGN.json}` were copied
  byte-for-byte to the project root (verified with `cmp`). No divergence roll, no re-direction, no
  `DESIGN-A/B/C` variant files. Gaps in the captured spec are resolved in Phase 3 from the source
  CSS, never invented here.
- **A-PD2 Empty register.** No audit was requested and no `--register` items were supplied, so
  `stardust/replica/inconsistency-register.md` is the empty pure-replica template. Anything the
  gate flags is a defect.
- **A-PD3 Archetype roster = Phase 1 proposal.** Six archetypes, one per page type, landing first
  (`us-en-html` establishes the canon chrome): landing, listing (adventures; magazine is the
  declared variant per A-EX4), program (climbing-new-zealand, 15 siblings), article
  (san-diego-surf, 4 siblings), static (about-us), unique (faqs). Recorded in
  `stardust/replica/progress.json`.
- **A-PD4 Main selector = `header + main`.** Every archetype has exactly one `<header>` followed
  directly by the outer `<main class="container responsivegrid …">`; AEM nests further `<main>`
  layout containers inside it, so bare `main` is ambiguous (2–3 matches). `header + main` matches
  exactly one element on all six captures and is reproducible in clean re-authored HTML without
  copying the `.root > .cmp-container > .aem-Grid` wrappers.
- **A-DY1 Dynamics gate passed with 11 curated rows** (28 detector rows merged; 4 client-only
  interaction rows added from Phase 1 evidence because the server-rendered source reports
  `client-rendered 0`). Every row has a disposition; the static recreation continues.
- **A-DY2 Sign In / Sign Out: decided-out.** No auth backend exists on the EDS host; the links
  stay as static chrome (design frozen), the modal/session behaviour is not rebuilt.
- **A-DY3 Language navigation: interim.** Rebuilt as static chrome with root-relative locale
  hrefs; the locale trees are scope debt D3-multilingual (A-EX1) and 404 on the target until an
  owner scopes them.
- **A-DY4 Listings: static-snapshot.** Adventures (16), home (6) and magazine (5) cards ship as
  authored content so the pixel gate has a fixed target; every page emits the listings-contract
  metadata so the unfreeze to `index-backed` is a yaml + block change. Owner decides
  index-driven vs curated.
- **A-DY5 Search: index-backed, self.** `/query-index.json` is 404 on the target → author
  `helix-query.yaml` at handoff (triage rule 8). Source parity recorded: `fulltext=surf` → 3
  results (Surf Camp in Costa Rica, Bali Surf Camp, San Diego Surf Spots) in
  `stardust/dynamics/parity.json`.
- **A-DY6 AEM runtime JSON + globals: decided-out.** ContextHub, Granite CSRF/currentuser/
  infinity JSON (9/9 host-bound 404) and `Granite`/`CQ` globals have no consumer on the migrated
  pages.
- **A-DY7 Tags: scaffolded, disabled.** Adobe Launch, Analytics/ECID, `112.2o7.net` (classified
  from host as Adobe Analytics collection — not unknown) and the retargeting pixel ship as a
  disabled `scripts/site-config.js` scaffold until the owner names the tags and property.

## Assumptions — Recreate + source-fidelity gate, us-en-html (2026-09-24)

- **A-RC1 Fonts: Google-served latin subsets, not the extract's woff2.** The extract's
  `Source-Sans-Pro-*-latin.woff2` / `Asar-400-latin.woff2` render 4–7 % wider than the faces the live
  page loads (canvas `measureText` "MAGAZINE Magazine" 14px: 127.7 vs 119.3; Asar 36px: 343.4 vs 329.5
  — a different font version). Canon `@font-face` points at `stardust/current/assets/fonts/gf/*`, the
  exact files named by the captured `google-fonts.css` latin blocks (SIL OFL, self-hostable). The
  wknd-icon-font (Apache-2.0, aem-guides-wknd) is self-hosted from the capture. No substitutes.
- **A-RC2 Header/footer "Home" links, "Welcome"/"Sign Out" kept hidden.** The live DOM carries them
  (`display:none`; sign-in state resolved by `currentuser.json` → anonymous); content-diff inventories
  hidden nodes, so the prototype carries the same nodes with the same visibility (`body.anonymous`).
- **A-RC3 Language toggle flag = US.** The live JS sets the toggle's `background-image` inline from the
  active country; every page in this migration is `/us/en`, so canon hard-codes the rehosted `US.svg`.
  Flags rehosted under `stardust/current/assets/flags/` (harvested from the live clientlib).
- **A-RC4 Mobile social-button column padding.** Measured 0 padding at 1440 and 14 px at 360; applied
  14 px for ≤1024 px (tablet not gated, not measured).
- **A-RC5 Search item `x-template`.** The live search section ships an `<script type="x-template">`
  result-item template whose text content-diff inventories as BODY; the prototype carries the same
  template verbatim (it is the dynamic search feature's scaffold, not visible copy).
- **A-RC6 Hover rules the probe cannot see.** motion-observe samples background/color/shadow/transform;
  the footer-nav / language-menu `text-decoration: underline` hovers and the mobile-nav hover colour
  (hidden panel) are lifted from the live CSS but unobservable — kept, logged as unobserved-lifted,
  not counted as implemented motion.
- **A-RC7 Canon behaviours in `canon.js`.** Scroll-morph (`body.scrolly` at scrollTop > 15), language
  menu, mobile panel and carousel active-swap are the only fired behaviours; they live in
  `stardust/prototypes/canon.js`, imported as-is by sibling archetypes.

## Hands-off assumptions — us-en-adventures-html (replica recreate + gate, 2026-09-24)

- **A-adv-1 visual-diff STRETCHED IMAGE flags (17 @1440, 16 @360) are justified:** they report `object-fit: cover` renditions on the 200 px card images and the hero — the live page applies the identical lifted rules (`.cmp-image-list .cmp-image__image`, `.cmp-teaser--hero .cmp-teaser__image .cmp-image__image`) and the pixel diff over those bands is 0.00 %.
- **A-adv-2 motion-compare MISSING/EXTRA lines are a class-name mapping, not a behaviour gap:** live `cmp-tabs__tab--active` / `cmp-tabs__tabpanel--active` added 3× ↔ build `tabs__tab--active` / `tabs__panel--active` added 3× under the same clicks; the panel switch is an instant class swap on live (0 animations, no transition sampled), replicated as such.
- **A-adv-3 hover families probed (tab, card title link, card image link, primary nav link, teaser title) measured no diff on live** → no hover CSS added on this archetype; canon's nav hover rule is untouched (frozen).
- **A-adv-4 0.00 % pixel diff accepted as a genuine measurement:** the live capture was taken from https://wknd.site/us/en/adventures.html (content-diff and chrome-parity read the live `cmp-*` DOM in the same round; the homepage archetype also gated at 0.00–0.06 %); build and live share image URLs and font binaries, so a deterministic Chromium render is byte-identical.

## Assumptions — us-en-adventures-climbing-new-zealand-html (program archetype, hands-off, 2026-09-24)

- **A-CNZ-1 Images by live src.** No captured media directory exists (`stardust/current/assets/media/` absent); per the capture-state policy every image references its live `wknd.site` src with the coreimg srcset rebuilt from the captured `<img>` pattern (100–1200 w + 1600 w), as the landing archetype does.
- **A-CNZ-2 STRETCHED IMAGE advisory is an intentional cover crop.** visual-diff flags `sport-climbing.jpeg` (natural 1440×655 → 1440×400). The live rule `.cmp-carousel--mini .cmp-image .cmp-image__image { height: 25pc; object-fit: cover }` produces the identical crop; the pixel diff over that band is zero. Justified, not fixed.
- **A-CNZ-3 Active-nav state is page state, not a canon delta.** chrome-parity vs the landing canon reported the yellow "Adventures" header item and the underlined light "Adventures" footer item; both are the live `cmp-navigation__item--active` state and are expressed with canon's existing `li.is-active` rule. No `canon-requests.md` line, canon.css untouched.
- **A-CNZ-4 Motion MISSING/EXTRA lines are class-name mappings.** motion-compare reports `cmp-carousel__item--active` / `cmp-carousel__indicator--active` / `cmp-tabs__tab--active` / `cmp-tabs__tabpanel--active` MISSING on build and the clean-named `carousel__*--active` / `tabs__*--active` EXTRA, with identical add counts (3×/3× at 1440, 1×/1× at 360) from the same pokes — the same state machine under re-authored class names. Treated as parity.
- **A-CNZ-5 Dead-on-live hovers stay unimplemented in the page file.** Hover diffs on breadcrumb link, inactive tab, carousel arrow, Facebook button and footer nav link measured no change on live; nothing was added for them.
- **A-CNZ-6 Empty sharing widgets replicated as captured.** `.fb-share-button` (empty div) and the Pinterest anchor (empty `<a>`) render 0 px on live (third-party scripts never hydrate them headless); kept as-is for role parity, flagged for the delivery phase.

## Hands-off assumptions — us-en-magazine-san-diego-surf-html (article archetype, 2026-09-24)

- **A-SDS-1 Container padding is the measured live value, not the sheet's first read.** `.cmp-layout-container--fixed { padding: 0 14px }` reads as a 14 px inset, but `measure.mjs` put the live `main` at x 138 / w 1164 with the lead image at x 152 / w 1136 — the `.responsivegrid.aem-GridColumn { padding-left/right: 0 }` rule wins on `main`, the inner article `main` and the `aside`. The prototype's `.fixed-container`, `.article-main`, `.article-sidebar` carry padding 0; gutters live only on the leaf columns.
- **A-SDS-2 Non-collapsing sibling margins are a lifted model.** Live wraps every content-fragment element in its own `aem-Grid` row (clearfix `::before/::after` tables), so a paragraph's 13.5 px bottom margin never collapses with the next h2's 27 px top margin (40.5 px gap, measured on all 4 `p → h2` seams). Replicated as `display: flex; flex-direction: column` on `.article-body__elements` (flex items never collapse margins) rather than as empty wrapper divs; article height matched live exactly (3851 / 3843 px) afterwards.
- **A-SDS-3 Hidden content-fragment title kept in the DOM.** Live renders `<h3 class="cmp-contentfragment__title">San Diego Surfspots</h3>` with `display: none`; the prototype keeps the h3 as `.article-body__title { display: none }` so the DOM and the rendered text both match. content-diff: 0 🔴 either way.
- **A-SDS-4 STRETCHED IMAGE advisory is the live byline avatar crop.** visual-diff flags `justin-barr.jpeg` (672×1008 → 60×60); the live rule `.cmp-byline__image .cmp-image__image { border-radius: 30px; height: 60px; width: 60px; object-fit: cover }` is what was lifted. Justified, not fixed.
- **A-SDS-5 Up-next hover re-probed once because the first probe landed under the fixed header.** `motion-observe.mjs --hover 'main aside li a'` scrolled the first list item to the viewport top, i.e. under the 194 px fixed header, and read no change; re-probing `li:nth-child(5) a` (cannot be scrolled to the top) fired `self.background` → #ffea00 on live and on the build. The `.upnext__link:hover` rule stays; the first sample is a probe artefact, recorded here rather than as a dead class.
- **A-SDS-6 Dead-on-live hovers not implemented.** Breadcrumb link, contributor Facebook/Twitter icon buttons, footer nav link and footer social button measured no hover diff on live (probed props); nothing page-specific was added for them (footer underline is canon's own rule).
- **A-SDS-7 Empty sharing widgets replicated as captured.** `.fb-share-button` (empty div) and the Pinterest anchor (empty `<a>`) render 0 px on live (third-party scripts never hydrate headless); kept for role parity — same as A-CNZ-6.
- **A-SDS-8 Images reference the live `src`/`srcset` (capture-state policy).** No `stardust/current/assets/media/` harvest exists in this run; every `<img>` keeps the captured `coreimg` URL, srcset, width/height, alt and title verbatim, absolutised to https://wknd.site.
- **A-SDS-9 Chrome parity quiet → no canon request.** `chrome-parity.mjs` at 1440 and 360 paired every header/footer text and icon within tolerance; the only page-state difference (active "Magazine" item) is canon's `li.is-active`. `canon-requests.md` gets no line from this archetype.

## Hands-off assumptions — us-en-about-us-html (static archetype, 2026-09-24)

- **A-AU-1 Sibling archetype forks the gated chrome verbatim.** Header, footer, mobile nav and language menu are the canon markup lifted from the gated magazine sibling with only the page state changed (`is-active` moved from Magazine to About Us in the primary and footer nav, as live renders it). `chrome-parity.mjs` at 1440 and 360 paired every header/footer text and icon within tolerance → no page compensation, zero canon requests.
- **A-AU-2 Contributor XF geometry is lifted, not eyeballed.** `.cmp-experience-fragment--contributor` (flex centred, padding .5em/1em, 3/12 default, 6/12 tablet, 12/12 phone), the 164 px circular `object-fit: cover` portrait, `.cmp-title__text` margins 0/.25em, `.cmp-buildingblock--btn-list` padding-top 1em with a flex-centred row of touching 48 px `.cmp-button--secondary.cmp-button--icononly` buttons — all from `clientlib-site.min.css` via `css-rules.mjs`; `measure.mjs --against` reported Δ 0 on every box at both widths before the first gate round.
- **A-AU-3 `cmp-title--black` kept as a role modifier.** Only Stacey Roswells' `h5` carries the live `cmp-title--black` variant (color #202020, identical to the default heading colour). Replicated as `.contributor__role--black` so the authored variant survives into the content model; it changes no pixel.
- **A-AU-4 Images reference the live `src`/`srcset` (capture-state policy).** No `stardust/current/assets/media/` harvest exists in this run; every contributor portrait keeps the captured `image.coreimg.jpeg` `src` plus the 300w–1200w `coreimg.75.<w>` srcset so the browser selects the same rendition as live (the first pass used the 1200 rendition as `src` and `measure.mjs` flagged natural 1440 vs 1200).
- **A-AU-5 STRETCHED IMAGE advisories are the live crop.** visual-diff flags five contributor portraits (e.g. 1440×958 → 164×164); the live rule crops them with `border-radius: 50%; object-fit: cover` and the build reports the identical natural dimensions → justified, not a defect.
- **A-AU-6 Dead-on-live hovers not implemented.** Contributor Facebook/Twitter icon buttons, contributor name, contributor portrait, footer nav link and footer social button measured no hover diff on live (`motion-observe.mjs`); the language toggle and mobile toggle widgets sampled no frame change but their class mutations (open/showMenu, navPanel-visible) fired and are canon.js behaviours. Nothing page-specific was added.
- **A-AU-7 0.00 % pixel diff verified as a real comparison.** live.png and build.png came out byte-identical at both widths; the independent visual-diff captures (`vdiff-iter1/`) agree, `measure.mjs` and `content-diff` read different DOMs (live main 1164 px vs build 1440 px page-main) and `row-profile.mjs` shows a rendered page — deterministic Chromium rendering of identical fonts, images and geometry, not a self-compare.

## Hands-off assumptions — us-en-faqs-html (unique archetype, 2026-09-24)

- **A-FQ-1 Sibling archetype forks the gated chrome verbatim.** Header, footer, mobile nav and language menu are the canon markup lifted from the gated about-us sibling with only the page state changed (`is-active` on FAQs in the primary and footer nav, as live renders it). `chrome-parity.mjs` at 1440 paired every header/footer text and icon; the only deltas were Δy offsets from the not-yet-fixed main height.
- **A-FQ-2 Accordion button keeps the UA button font — a lifted value, not a defect.** `measure.mjs` read the live `.cmp-accordion__button` as Arial 13.333 px, black, `line-height: normal`, padding 13.333 px (1em of the UA font): the live `.cmp-accordion .cmp-accordion__button` rule never resets the font, so the prototype does not either (`font: inherit` / `color: inherit` were removed after the first measure pass — they added +37 px per item).
- **A-FQ-3 Accordion icon is the site's `[class*=__icon]` attribute rule, scoped.** Live sizes `.cmp-accordion__icon` to 1.25rem / line-height 1 through `[class$=-icon],[class*=__icon]` (the rule canon.css carries as `.icon`); replicated on `.page-faqs .accordion__icon` with the glyphs `\e911` (collapsed) / `\e910` (expanded) read from the minified sheet's private-use codepoints.
- **A-FQ-4 Separator hr margin is a page compensation and a canon request.** Live `.cmp-separator__horizontal-rule` sets no margin, so the UA `hr` margin (9px 0 at 18px) keeps the hidden aside separator 18 px tall; canon `.separator hr { margin: 0 }` zeroes it. Compensated as `.page-faqs .faq-aside .separator hr { margin: 9px 0 }`, one line appended to `stardust/replica/canon-requests.md`; canon.css untouched.
- **A-FQ-5 Authored inline `style="text-align: left;"` on the aside paragraph is content.** The live "Give us a call" paragraph carries the inline style in the RTE output; `measure.mjs` read textAlign left vs justify. Mirrored verbatim on the prototype `<p>` (content-preservation, not a stylesheet rule).
- **A-FQ-6 Images reference the live `src`/`srcset` (capture-state policy).** No `stardust/current/assets/media/` harvest exists in this run; the FAQ image keeps the captured `coreimg` URL, the 100w–1600w `coreimg.60.<w>` srcset, width/height 1447×964, alt and title verbatim, absolutised to https://wknd.site.
- **A-FQ-7 Empty `<h3>&nbsp;</h3>` inside panel 2 kept.** Live authored an empty heading after the "How does WKND pay for itself?" answer; it is content (24 px Asar line + margins inside the hidden panel) and is carried verbatim.
- **A-FQ-8 Accordion is multi-expansion, observed not inferred.** `motion-observe.mjs` on live clicked item 1 then item 2: `cmp-accordion__button--expanded` / `cmp-accordion__panel--expanded` were each ADDED twice and the `fadeIn` entrance fired on 2 panels — the first panel stayed open, so the Core Components accordion runs without single-expansion. `us-en-faqs-html.js` toggles each item independently; the build trace shows the same 2× adds and 2 fadeIn firings.
- **A-FQ-9 motion-compare MISSING/EXTRA pairs are the class rename, not a behaviour gap.** `cmp-accordion__button--expanded` / `cmp-accordion__panel--expanded` (live) ↔ `accordion__button--expanded` / `accordion__panel--expanded` (build) carry identical add counts at 1440 (2×) and 360 (1×) with matching fadeIn firings; prototype classes are clean re-authored names (recreation-procedure § Interaction parity maps by text snippet, never class names). Resolved as parity; nothing added or removed.
- **A-FQ-10 Dead-on-live hovers/widgets not implemented.** Accordion button hover, aside `#` links, footer nav link and footer Facebook button measured no hover diff on live; the accordion click, language toggle and mobile toggle sampled no frame change (their class mutations fired and are matched). Nothing page-specific beyond the accordion toggle was added.
- **A-FQ-11 0.00 % pixel diff verified as a real comparison.** live.png (514 286 B) and build.png (514 290 B) at 1440 are distinct captures stitched from live and localhost respectively; `measure.mjs` reads different DOMs (live `main` 1164 px fixed container vs build 1440 px `.page-main`), content-diff paired all texts, and crop-compare on the header (y0+200) and footer (y1412+260) bands is 0 px — deterministic Chromium rendering of identical fonts, images and geometry.

## Hands-off assumptions — gate consolidation (Phase 4 close, 2026-09-24)

- **A-GC1 — canon request `.separator hr` margin reverted.** The one canon request (us-en-faqs-html: live `.cmp-separator__horizontal-rule` sets no margin, so the UA default `0.5em` = 9px applies; canon zeroes it) was lifted by dropping `margin: 0` from canon `.separator hr`. Confirmation rounds then failed on all six archetypes (height Δ −18 px per separator: −18/−36/−54 px; chrome-parity footer Δy +18 px; pixel > 0) — in the prototypes the hr margin cannot collapse through `.separator` the way it does inside live's float-based aem-Grid, so every non-aside separator grew 18 px. Per the hands-off rule the canon line is restored, the page-scoped `.page-faqs .faq-aside .separator hr { margin: 9px 0; }` compensation is restored, and the request is logged as a `user`-flagged residual on us-en-faqs-html in progress.json. Net canon changes applied: 0.
- **A-GC2 — all six archetypes approved by hands-off.** Every archetype meets the pass bar at both 1440 and 360 on the post-revert confirmation round (worst case us-en-magazine-san-diego-surf-html 1440: 0.14 % / Δ 2 px); none stays prototyped-only. Phase 5 may clone from all six.
- **A-GC3 — the reverted-state confirmation rounds are the shipped evidence.** The `conf` files under `stardust/replica/gates/<slug>-<w>/` were re-run after the revert so they reflect the state that ships, not the failed canon trial.

## Migrate plan — hands-off assumptions (2026-09-24)

- **A-MP-1** — sibling-variance exit 2 on the program template (15 siblings) consists only of PROBE box deltas that track content length (breadcrumb label, itinerary tabs height, carousel image height, fact-label width); treated as clone-as-is with no `variants[]` entry. Listing (`teaser--featured`, `teaser--list`, no tabs, text) and article (`section-title--underline`, text) deltas are budgeted as block variant classes on the sibling's content, per fidelity-tiers § Sibling variance probe.
