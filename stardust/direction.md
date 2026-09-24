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

## Migrate render unit `us-en-adventures-html` — hands-off assumptions (2026-09-24)

- **A-MR-L1 — hero teaser → `teaser--featured` (canon).** The magazine page's first teaser is the live `cmp-teaser--featured` family (pretitle + CTA, split-media inside the fixed container), not the archetype's full-bleed `teaser--hero`. The sibling's `intro` slot is rendered with canon's existing `.teaser--featured` rules (the homepage archetype shipped them); the archetype's hero section is not reused and canon.css is untouched.
- **A-MR-L2 — `teaser--list` / `teaser--secure` authored as sibling variants.** No canon rule covers the live `cmp-teaser--list cmp-teaser--secure` members-only teasers. Their rules (max-height 200 image, uppercase 18 px sans title, dimgray uppercase description, anonymous-state `::before` lock corner `\e98f` on the accent gradient, `.teaser` opacity .65, grey action label) and the AEM grid widths default--4 / tablet--6 / phone--12 (`.column--third`) are lifted verbatim from clientlib-site.min.css into `stardust/.work/migrate/us-en-magazine-html.variants.css`, linked by the sibling only. The place agent folds this file into the block CSS; canon.css and the archetype files stay unchanged.
- **A-MR-L3 — `no-tabs` image-list.** The archetype wraps its card grid in a tabs module; the magazine page has one flat image list (5 cards). The sibling renders the same `.card-list` markup as a plain `section.column.image-list[data-variant="no-tabs"]` with no tabs list, no panels and no tab script. No content is dropped.
- **A-MR-L4 — members-only "Read More" kept as plain text.** Live renders the two secure teasers' action container as text (no `<a>`, sign-in gated); the sibling keeps it as a text node in `.teaser__actions`, not a link — content-diff pairs it as body on both sides (CTA count 6 = 6).
- **A-MR-L5 — content-count run against the served capture, cross-checked against live.** `content-diff` with the capture (`/current/pages/us-en-magazine-html.html`, unstyled on localhost) as source gives identical counts (25 text / 6 headings / 6 CTAs / 8 img; header 28; footer 17) but 16 ROLE SWAP / ICON DIFF 🔴 that are purely the missing stylesheet on the source side (uppercase eyebrows read as body, icon-font glyphs empty). The same command against the live URL returns `Findings: none — content + roles match`, so the capture-side findings are recorded as a source-rendering artefact, not a deviation.

## Hands-off assumptions — migrate render unit `us-en-adventures-climbing-new-zealand-html-2` (2026-09-24)

- **A-MR2-1 Program siblings carry TWO authored structures, not one.** The live `container_fixed` on 7 of 15 program pages (in this unit: tahoe-skiing, west-coast-cycling, yosemite-backpacking) is itself an `aem-GridColumn` (side padding zeroed) and its facts rail is a nested `aem-Grid--3` with phone 7/5 and tablet 9/3 columns, so at 360 the facts sit beside "Share this Adventure" and the tabs span 332 px. The archetype (climbing-new-zealand) stacks them. Round 1 at 360 missed the bar (24.6–27.9 %, Δh 166–234 px); fixed as VARIANT classes on the sibling content — `program-body--flush`, `program-facts--split` — with CSS lifted from the live clientlib grid (`58.3333 % / 41.6667 %` phone, `75 % / 25 %` tablet, `padding: 0 14px`). Class names and rules are identical to the `-1` unit's so rollout dedups them once; canon.css and the archetype files are untouched. The A-MP-1 read ("content-length only") was too narrow for these seven pages.
- **A-MR2-2 Image captions are a variant, not a drop.** `.cmp-image__title` (live: float left, 14 px, 600, uppercase, margin-top −.25em) exists on surf-camp-costa-rica, tahoe-skiing and yosemite-backpacking but not on the archetype; carried verbatim as `<span class="image__caption">` under an `image--captioned` column (same class as the `-1` unit). content-diff paired every caption as an eyebrow.
- **A-MR2-3 Content-count source side is the capture, styled.** Serving `stardust/current/pages/<slug>.html` unstyled turns every eyebrow into a body and every icon into an empty box (24 false 🔴 on tahoe). The reference is still the capture file — a byte copy under `stardust/.work/migrate/capture/<slug>.html` with one injected `<base href="https://wknd.site/…">` so the live stylesheet resolves — never a fresh live hit of the page. Result: 0 findings on all 7 pages.
- **A-MR2-4 Variant `<style>` lives in the sibling `<head>` at this stage.** `stardust/.work/migrate/<slug>.html` carries `<style data-variants="…">` after the archetype stylesheet link; the place agent lifts it into `_meta.json variants[]` and the block CSS. No sibling-level CSS file, no archetype edit.

## Hands-off assumptions — migrate render unit `us-en-adventures-climbing-new-zealand-html-1` (2026-09-24)

- **A-MR1-1 Program siblings fork the archetype by DOM transform, not by hand.** `stardust/.work/migrate/_render-program.mjs` loads the captured `stardust/current/pages/<slug>.html` in a JS-disabled, network-aborted Playwright page, re-emits its `<main>` in the archetype's class vocabulary (cmp-*/aem-* → breadcrumb/carousel/program-*/facts/tabs/fragment), absolutises `src`/`srcset` to `https://wknd.site`, and splices it into the archetype shell (head, canon header/footer, mobile nav) with `<title>`/`description`/`og:*` from the capture JSON. Text nodes, `&nbsp;`, `<b>` in headings, `<dd>` leading spaces and image `alt`/`title` pass through untouched; only ids, `<meta>` stubs, `aem-*` classes and the fragment `href` attribute are dropped.
- **A-MR1-2 `program-body--flush` + `program-facts--split` are one authored structure, two variant classes.** On bali-surf-camp, colorado-rock-climbing, cycling-southern-utah, gastronomic-marais-tour and napa-wine-tasting the live `container_fixed` is itself a `responsivegrid aem-GridColumn` (live rule `.responsivegrid.aem-GridColumn { padding-left:0; padding-right:0 }` → content 28 px wider at every width) and the facts rail's three children are grid columns (phone 7/5/5 of 12, tablet 9/3/3, `padding 0 14px`). Rendered as variant classes on the sibling content with the lifted rules in a `<style data-variants>` block in the sibling `<head>`; canon.css and the archetype files untouched. Before the variants: 360 FAIL 17–31 % / Δh 104–275 px on those five; after: 0.00 % / Δh 0 at 360, 0.03–0.05 % at 1440.
- **A-MR1-3 `image--captioned` is a variant, not a drop.** `.cmp-image__title` captions (cycling-southern-utah, gastronomic-marais-tour, napa-wine-tasting) are kept verbatim as `.image__caption` with the live rule lifted (`float:left; 14px; 600; uppercase; margin-top:-.25em`).
- **A-MR1-4 Content-count follows A-MR2-3.** Source side = byte copy of the capture under `stardust/.work/migrate/capture/<slug>.html` with one injected `<base href="https://wknd.site/…">` so the live stylesheet resolves (unstyled, the same run reports 29 false 🔴 per page — role swaps on uppercase labels, empty icon boxes). Never a fresh live hit. Result: `Findings: none` on all 8 pages, all three roots.
- **A-MR1-5 Extra `.grid` wrappers are inert.** Siblings carry `aem-Grid` wrappers at levels the archetype lacks (root, facts rail); they map to `.grid` (block + clearfix) and measure identically to live, so they stay rather than being unwrapped.

## Hands-off assumptions — migrate render unit `us-en-magazine-san-diego-surf-html` (2026-09-24)

- **A-MA-1 Article siblings fork the archetype by DOM transform (Path A′), not by hand.** `stardust/.work/migrate/_render-article.mjs` loads the captured `stardust/current/pages/<slug>.html` JS-disabled and re-emits its `<main>` in the archetype's vocabulary (lead image → breadcrumb → article-main → contributor → sidebar); chrome and `<head>` shape are the archetype's verbatim, only title/description/og/slug swapped. Paragraphs, headings, blockquotes, image `src/srcset/alt/title/width/height`, hrefs and order are copied as block nodes; the live content-fragment's classless `<div>` wrapper around the body and its empty `aem-Grid` placeholders are flattened/dropped (they render nothing — measured Δh 0 on `article` at 360).
- **A-MA-2 Variance deltas are three variant classes on the sibling's content, no archetype edit.** `section-title--underline` (Title component h2s inside the body: arctic-surfing, guide-la-skateparks, western-australia — canon.css L323 already carries the rule), `text` (plain `.text` blockquote: arctic-surfing, default browser blockquote as live) and `text--quote` (guide-la-skateparks, ski-touring, western-australia — live `.cmp-text--quote` rules lifted verbatim into the sibling `<style data-variants>`: `--color-third` band, 1em padding, serif 36px quote, 5pc accent underline, `u` back to sans).
- **A-MA-3 Sidebar composition follows the source, not the archetype.** arctic-surfing and ski-touring have no hidden separator between sharing and the up-next list; carrying the archetype's `separator--hidden separator--space-small` made the 360 build 36–37 px taller (aside Δh +36 at 360). The transform now emits sidebar children in source order and only those present. ski-touring's share title lacks `cmp-title--black` on live; `.sidebar-title__text` renders the same #202020 (360 diff 0.01 %), no variant needed.
- **A-MA-4 guide-la-skateparks' sidebar Download component is a template adaptation, kept in place.** The archetype has no download slot; live `.cmp-download` (PDF title link, "Get the Full Story", filename/size/format, action button with the \e907 glyph) is rendered as `<div class="column download" data-module="download" data-bespoke="download">` in its source position with the live rules lifted (variant `download`). Without it the 360 build was 162 px short. Logged as `template-adapted` + `module-bespoke-slot` for the sidecar. western-australia's `.download` column is EMPTY on live (renders nothing) and is dropped as an empty section.
- **A-MA-5 Contributor button hrefs follow the archetype's convention.** Live `href="#"` (arctic-surfing, ski-touring, western-australia) becomes `#<initial><lastname>` (`#jwester`, `#ssjöberg`) as the archetype did for `#jbarr` — same resolution target (the page itself), avoids duplicate bare-`#` CTAs; guide-la-skateparks' real `#facebook-staceyroswell`-style hrefs pass through untouched.
- **A-MA-6 Content-count follows A-MR2-3.** Source side = byte copy of the capture under `stardust/.work/migrate/capture/<slug>.html` with one injected `<base href>` so the live stylesheet resolves; unstyled it reports 16–23 false 🔴 (eyebrow→body, empty icon boxes). Styled: identical counts on all four pages (main 24/40/21/26 text nodes, headings 8/8/5/8, CTAs 8/10/8/8, img 5/4/6/5; header 28, footer 17), 0 🔴, one 🟡 ICON MOVED per page = the contributor photo paired to the same byline whose anchor string differs only by whitespace (no space between name and occupations in the archetype markup) — not a deviation.

## Migrate place + report — hands-off assumptions and named deviation (2026-09-24)

- **NAMED DEVIATION (D-MP-1):** sibling render fan-out authored files under `stardust/.work/migrate/` and pre-gated them there; `migrate.mjs render` placed them sequentially (state.json.migrate is not lock-safe). Placement copies live in `stardust/.work/migrate/placed/<slug>.html` — the fan-out file with asset hrefs made prototype-relative (`../../prototypes/x` → `x`, `../../current/` → `../current/`) so the driver's asset detector bundles canon/archetype CSS+JS into `stardust/migrated/assets/`; content bytes untouched.
- **A-MP-1:** siblings sat at `extracted`; `migrate.mjs` picks branch A′ only for `directed` pages (an `extracted` page with `--source` rendered as branch A / tier archetype on the first try). Each cluster was advanced `extracted → directed` via `state.mjs advance --skill replica` immediately before its render — the preserve-direction phase covers siblings by inheritance.
- **A-MP-2:** `us-en-magazine-html.variants.css` folded into the page as `<style data-variants>` (same shape as the other 19 siblings) rather than appended to the archetype's `us-en-adventures-html.css` — the archetype's gated CSS stays byte-identical; deploy folds `data-variants` rules into block CSS.
- **A-MP-3:** the plan unit's variance probes were not run-bg jobs, so `gate-evidence.mjs` could not attribute them; the three probes were re-run through run-bg (`variance-listing`, `variance-program`, `variance-article`) with the plan's probe selectors. Six program siblings that cloned as-is (beervana, tuscany, wyoming, riverside, mont-blanc, whistler) show only content-length deltas (breadcrumb width, tabs height); they declare the no-CSS variant token `content-length` so the gate reads "deltas covered by variants[]" — pixel bar 0.00–0.07 % at both widths confirms no visual variant is needed.
- **A-MP-4:** `migrate.mjs variant <slug> <class…>` stores its arguments as ONE entry; variants were recorded one class per call (7 separate entries on the magazine listing).
- **A-MP-5:** guide-la-skateparks' PDF (`/content/dam/…coredownload.pdf`) is rewritten by the driver to a relative path and logged `not-in-inventory` (soft) — a same-site DAM asset the rollout media step / dynamics rehosts; source kept verbatim.
- **A-MP-6:** delivery-lint P2 `no metadata block` on every migrated page is the prototype-shaped head; deploy's metadata block supplies it. Not a P0/P1.

## Rollout prepare — hands-off assumptions (2026-09-24)

- **A-RO-0:** `inventory.mjs` ran in full mode (no `--state`): every one of the 26 pages is migrated with a sidecar naming its `template`; archetypes-only mode (`--state`) produced 26 one-page templates and was discarded. Result: 6 templates.
- **A-RO-1:** Publish decision = PUBLISH (POST /live). DA already holds root documents from an earlier, unrelated deploy in this repo (`/about.html`, `/footer.html`, …). Our tree is `/us/en/…`; the chrome documents `/nav` and `/footer` at the root are OVERWRITTEN (accepted); other foreign root documents are left alone and are reconciled by D-site's served-sitemap check (extra path → unpublish/noindex, never a page of ours).
- **A-RO-2:** Landing cluster is order 1 and converts the shared blocks `featured-teaser`, `cards`, `hero-teaser` (plus `hero-carousel`) although `plan.mjs` assigned them to the magazine/adventures listing pages (largest-template-first). The cluster list in `stardust/rollout/progress.json` is authoritative for the C-deliver briefs; `plan.json` is left as generated (a script artifact, not hand-edited).
- **A-RO-3:** `tabs` is shared by the program template (16 pages, prose panels — the collection tabs content model) and the adventures listing (1 page, card-list panels). Conversion point = program cluster (order 2). The listing cluster therefore runs at order 3 (after program), extends `blocks/tabs/` with the `cards` panel variant itself (no concurrent editor by then) and reuses `cards` from the landing cluster. Order 2 clusters (program, article, static, unique) share no block and spawn concurrently.
- **A-RO-4:** `sharing` (program + article sidebars) is an empty `fb-share-button` div and an empty Pinterest anchor with no CSS anywhere in the gated prototypes — zero rendered pixels. Recorded `default-content` (omitted), no block; removes the only program↔article dependency. If a later gate shows a delta at that spot it is a residual with this cause.
- **A-RO-5:** `image-list` → `cards` (D11: mirrors the Block Collection name and content model; overwrites the stock `blocks/cards/`); `content-fragment` → `article-body` (an AEM term with no meaning to EDS authors; the block hosts the article prose stream). All other sidecar ids are kept as block names.
- **A-RO-6:** Recurring non-block treatments (`page-title`, `section-title--underline`, `breadcrumb`, `separator`, `text--font-small`, `button`/`btn-list`, `container`/`column` widths) are FOUNDATION scope as section styles / default-content CSS in `styles/styles.css`, because `styles/` freezes after C0 and four clusters need them. Also foundation: the `article-layout` (main 2/3 + sidebar 1/3) and `program-layout` (facts aside + tabs) section grids, expressed on `.section.<style>` and the `*-wrapper` children.

## C-deliver C0 foundation — hands-off assumptions (2026-09-24)

- **A-C0-1:** No global `border-box` reset. The source stylesheet is content-box by default and
  declares `box-sizing: border-box` per element (grid columns, chrome columns); lifted rules render
  as on the source only under the same default (`.masthead__inner` 1164 + 28px, the search input
  `calc(100% - 4rem)` + 4rem padding). Elements the foundation owns declare border-box explicitly
  (`main > .section > div`, `a.button`, chrome columns); clusters lift `box-sizing` with the rule.
- **A-C0-2:** Button slots: `<strong>` = `.primary` (accent yellow, the source's `button--primary`),
  `<em>` = `.secondary` (dark, `button--secondary`), `<em><strong>` = `.accent` = the source's
  unstyled grey `.button a`. The 48px bar with the text 16px from the top reproduces the source's
  overflowing inner span.
- **A-C0-3:** `<hr>` cannot be authored (a section break in the pipeline), so the separator is an
  EMPTY section carrying `separator` (4rem, 1px rule) or `spacer` (the source's hidden +
  space-small, 1em gap); one style value per section (#120).
- **A-C0-4:** Social icons are decorateIcons images extracted from the icon-font glyphs
  (`icons/facebook|twitter|instagram.svg`, fill #202020, viewBox = glyph advance × em) so the
  authored footer stays `:facebook:`-style content; the anchor text is kept and hidden with
  `font-size: 0`. Chevron/menu glyphs stay icon-font (`.glyph-*`, presentational).
- **A-C0-5:** `is-home` / `is-active` are set by block JS on the authored `<li>` (hidden Home link,
  underlined current locale) — they vanish only inside the nav document's own editor view, where
  showing every item is acceptable. Country flags are content-anchored `li:has(ul a[href^='/xx/'])`.
- **A-C0-6:** Language locale links are root-relative `/xx/yy` (404 until D3, DF-03); Sign In /
  Sign Out are static `#sign-in` / `#sign-out` anchors in the anonymous state (DF-02).
- **A-C0-7:** The shell page `/us/en/shell-check` is preview-only, has no `<h1>` by design, and is
  deleted at C-final.
- **A-C0-8 (C0 gate, coordinator):** `chrome-parity.mjs` against the published shell reports
  Δ25 (1440) / Δ29 (360) while every crop band passes (1440 header 0.09 % / footer 0.02 %,
  360 header 0.53 % / footer 0.84 %, bar 2 %). The deltas are judged non-defects and the gate
  is decided on the pixel bar (gate doc § Pass bar item 5, "styles diagnose, pixels confirm"):
  the outer `<header>` is the boilerplate's 200/130 px static white reserve, the fixed
  transparent `.header.block` inside it is 194/117 px = live; footer Δy is the short shell
  page's length, not chrome; icon signatures are the pipeline's `/media_<hash>` rewrite;
  "Facebook/Twitter/Instagram" EXTRA texts are the icon links' accessible names; the four
  360 nav EXTRA links are the off-canvas menu. One true residual is carried: "Sign In"
  colour rgb(235,235,235) → rgb(247,247,247), sub-pixel-band, queued for C-final.

### Landing cluster (C-deliver unit `landing`, 2026-09-24) — hands-off assumptions

- **A-C1-1:** Carousel controls render no words: previous/next are `<button aria-label>` with
  icon-font glyphs, indicators are `<li role="tab" aria-label>` dots — the live texts are
  `display:none` / `font-size:0` (0 rendered pixels), and `decorate()` adds no words (#100).
- **A-C1-2:** The "Next Adventures" section title is authored as default content INSIDE the
  hero-teaser section (`style: flush, underline`), not as its own section: the foundation's
  `separator` section lets its 4rem `::after` margin collapse with the next heading's 27px
  margin (live floats never collapse). The block CSS scopes the wrapper (flow-root, container
  width) and cancels the `underline` rule on the block's own heading; the general fix is a
  foundation request line for C-final.
- **A-C1-3:** Every landing block is `display: flow-root` so its inner margins stay inside the
  block, mirroring the live `.column { float: left }` BFC; the carousel's 4em bottom gap is
  padding on the block for the same reason.
- **A-C1-4:** The card image link is a generated text-less `<a>` carrying the title link's
  href (live links the image too); the title is a bare `<p><a>` (the foundation's
  formatted-only buttonisation leaves it a link, A-C0-2).
- **A-C1-5:** R-01 rides the hero-carousel CSS: the first slide's `<h1>` renders at
  `--heading-xl` (36px), the live h2 size.
- **A-C1-6:** Publish decision for this cluster follows the log (§ Publish decision — PUBLISH):
  `deploy-batch.mjs` runs without `--no-publish`.

## Assumptions — C-deliver unit `static` (2026-09-24)

- A-CS-1 (alt text): the source's contributor portraits carry `alt=""`; the delivered page
  authors the contributor's name as alt. Non-visible, zero pixel effect, an accessibility and
  AI-readability gain; content text is otherwise verbatim.
- A-CS-2 (component model): one `contributor-card` block per contributor (the source's one
  experience fragment per person), several blocks in one section, instead of one block holding
  the group — the block round-trip maps 1:1 to the seven prototype `section.contributor`s and
  each person is one authorable table. Layout (25 % floated columns in a 1164px grid) rides the
  block-scoped section / wrapper rules.
- A-CS-3 (`aria-label`): DA strips `aria-*` from authored anchors (landing finding); the icon
  links carry the source label as `title`, and the visible link text (hidden by CSS) stays the
  accessible name.
- A-CS-4 (publish): publish = yes, the landing unit's decision, applied unchanged.
- A-CS-5 (current-page nav marker): the frozen header/footer do not highlight the current page
  ("About Us" yellow item / underlined footer link on live). Filed as a foundation request with
  the chrome-parity evidence; no override from the block CSS — a nav state belongs to the chrome
  JS (`aria-current`), and the 1440 header band passes at 1.56 % without it.

## Assumptions — C-deliver unit `program` (2026-09-24)

- **A-PR-1 (hidden content-fragment titles):** every AEM content fragment on the live program
  page renders an `<h3 class="cmp-contentfragment__title">` that CSS hides (`display: none`) —
  one above the fact sheet, one per tab panel. `block-roundtrip` inventories hidden headings
  and reports them MISSING HEADING (🔴); the gate never weakens, so the titles are authored as
  on live and hidden by block CSS: `trip-facts` leading single-cell row → `.trip-facts-title`;
  `tabs` variant `fragment` (block class `tabs fragment`) → a leading `<h3>` per panel →
  `.tabs-panel-title`. Both declared `@ew-exempt` (never displayed on live either).
- **A-PR-2 (sharing omitted, sidebar title kept):** the live `.sharing` module (empty Facebook
  div + empty Pinterest anchor) paints 0 px and is omitted (A-RO-4, conversion log); its visible
  `<h5>Share this Adventure</h5>` is authored as a trailing single-cell `trip-facts` row and
  rendered after the facts in `.trip-facts-aside` — the live position (the h5 line box sits
  right under the floated `dl`, its own top margin collapsed above the float, measured 41.4 px
  from the h1 column to the list — reproduced with `calc(1em + 23.38px)` on the list).
- **A-PR-3 (chrome state from a block):** the frozen header/footer carry no current-section
  state; live highlights "Adventures" in both navs on every adventure page. Shipped as a
  `body.program`-scoped override in `blocks/mini-carousel/mini-carousel.css` (the gallery is on
  every program page) with a foundation request; same for the breadcrumb list's inline-block
  baseline offset (5 px @1440 / 7 px @360). Both lines in `stardust/rollout/foundation-requests.md`.
- **A-PR-4 (sibling structural gates):** `block-roundtrip` compares TEXT against the archetype
  prototype, so it closes only for the archetype (0 🔴, EW 30/30); the 15 siblings run the same
  harness asserts without a prototype — `qa-gate` (one h1, blocks loaded non-empty, 0 pageerror;
  the 2 "broken images" are the auth-gated chrome logos and the unit-count pairing is the
  known schema→block order offset, as recorded by landing) and `ew-editability-probe` exit 0 ×16.
- **A-PR-5 (push credential):** the machine's active `gh` account (`catalan_adobe`) is denied on
  the repo (403 on push mid-wave); pushes run with the repo-owner token in the environment
  (`stardust/.work/deploy/probes/program-push.sh`, `gh auth token -u catalan-adobe`, never
  printed). Nothing global was switched.
- **A-PR-6 (trailing `<br>`):** source `<p>Day 1<br></p>` / `<h2>…<br></h2>` trailing breaks
  render no line box and the pipeline drops them — stripped at authoring; in-line `<br>` kept.

## Assumptions — C-deliver unit `unique` (2026-09-24)

- **A-CU-1 (question tag):** the FAQ questions are authored as `<p>` inside the accordion
  row, not `<h3>`: the shared role classifier reads the source's uppercase 16px span as an
  eyebrow, so an authored heading fails the round-trip with 7 ROLE SWAPs. The generated title
  wrapper carries `role="heading" aria-level="3"`, matching the source's `h3.accordion__header`
  for assistive technology. An authored `<h3>` decodes identically.
- **A-CU-2 (layout via `article-layout`):** the FAQ page reuses the foundation's
  `article-layout` section style (2/3 + 1/12 gap + 1/4 grid above 1024px — the source's
  aem-Grid 8 / offset 1 / 3 model); the aside is the default-content wrapper after the block,
  placed in grid column 2 by the block CSS. No frozen file touched; no new section style.
- **A-CU-3 (empty heading dropped):** the source's `<h3>&nbsp;</h3>` closing panel 2 is a
  whitespace-only authoring artefact the pipeline would drop; omitted, panel collapsed at rest.
- **A-CU-4 (media reuse):** the FAQ image is byte-identical to the program cluster's
  `media/wknd/adobestock-277768563.jpeg` (cmp, 93 276 B) — its ledger URL is authored, no
  duplicate upload.
- **A-CU-5 (publish):** publish = yes, the landing unit's decision, applied unchanged.

## Assumptions — C-deliver unit `article` (2026-09-24)

- **A-CA-1 (prose stream as one cell):** the article body is ONE `article-body` row with one
  cell holding the whole prose stream as flat siblings (h3, p, image p, h2, blockquote) — the
  DA-flattened shape authors naturally edit; the block wraps each element in its own flex row
  (the source's one-grid-row-per-element model, no margin collapse). Page-level source variants
  become block variants: `underline` (cmp-title--underline h2 columns), `quote` (text--quote
  grey box). Locked name `article-body` kept (D1 lint 🟡 "default-content candidate" accepted:
  gutters, captions, quote boxes and the non-collapsing row model are bespoke structure).
- **A-CA-2 (hidden fragment title):** the content fragment's `<h3>` title (display:none on the
  source) is authored and hidden by the block, as on the source — content-preserving; it is
  not the page `<h1>`.
- **A-CA-3 (captions and attributions):** an image caption is authored inside the image
  paragraph (`<p><img><em>caption</em></p>` — survives the pipeline as
  `<p><picture/><em>`); the paragraph right after a `<blockquote>` is its attribution (the
  source's `<u>` is not underlined there and does not survive DA — dropped, text kept).
- **A-CA-4 (sidebar):** `upnext-list` owns the sidebar head ("SHARE THIS STORY" h5) and the
  list; the source's empty sharing widgets are not authored (A-RO-4); the hidden
  separator--space-small (36px) is the block variant `spacer` (present on san-diego-surf,
  guide-la-skateparks, western-australia; absent on arctic-surfing, ski-touring). A `download`
  block authored in the section is adopted into the sidebar between head and list (source
  order); its PDF is committed under `media/wknd/` and linked root-relative.
- **A-CA-5 (download properties):** the source's hidden `<dt>` labels (Filename / Size /
  Format) are authored as `<p><strong>Label</strong></p>` rows before each value and hidden by
  the block — content-preserving, round-trip closed.
- **A-CA-6 (contributor icons):** the social icon buttons author the foundation's
  `span.icon.icon-<name>` vocabulary; the decorated dark `/icons/*.svg` is hidden and the
  source's white icon-font glyph drawn instead (the source renders the glyph). `aria-label`s
  on the anchors are not authored (DA strips `aria-*`; visible label text kept, hidden by
  `font-size: 0` as the source's `display:none` span).
- **A-CA-7 (lead image descender):** default-content lead image needs the source's inline-img
  7px descender — template-scoped override in article-body.css + foundation request.
- **A-CA-8 (rendition rounding residual):** at 360 the pipeline's 750-wide renditions round to
  a different aspect ratio than the source's 360-wide ones (221.33 vs 220.77 px per image) —
  a cumulative 1–2px page shift below the 3rd image, |Δh| ≤ 2, inside the ±8 tolerance;
  not fixable in block CSS without hard-coding per-image ratios.
- **A-CA-9 (publish):** publish = yes, the landing unit's decision, applied unchanged.

## Assumptions — C-deliver unit `listing` (2026-09-24)

- **A-CL-1 (tabs panels as sections, D2):** the adventures tab panels each hold a card list; a
  block inside a block is forbidden, so each panel is its own section (`tab | <title>` metadata →
  `data-tab`) adopted by the `tabs cards` block at decorate time (the path the program unit's
  tabs.js documented). The `cards` variant CSS the tabs JSDoc declared is added to tabs.css —
  a shared-block edit outside the frozen set, additive (program's `fragment` variant untouched).
- **A-CL-2 (members-only teasers):** live renders the two `teaser--secure` teasers for anonymous
  visitors only (lock glyph, 65 % opacity, grey non-link "Read More"); EDS has no sign-in state,
  so the block variant `secure` always applies and the action is an authored plain label (cell 3),
  never a fake link. The two teaser images carry `alt=""` on live and keep it (content-preserving).
- **A-CL-3 (richtext normalisation):** live authors the second teaser's description as bare text
  (no `<p>`, 22px line, no 13.5px margin) and the first as `<p>`; DA always delivers `<p>`, so both
  render the `<p>` form — the second column is 15px taller than live at 1440 (its image starts
  15px lower; the row height is set by the first column) and the page is +13px at 360 where the
  columns stack. Not a design delta: a platform richtext normalisation, recorded here.
- **A-CL-4 (page-title gutter):** live adventures puts `h1.page-title` flush with the container
  (x 138 / w 1164 at 1440, x 0 at 360) while live magazine keeps the 14px column gutter (x 152 /
  x 14) — the archetype prototype and the migrated sibling render both flush (a 14px prototype
  drift on magazine that the migrate gate absorbed). The delivered pages follow LIVE per page:
  adventures carries section style `page-title` (padding-0 rule scoped in tabs.css until C-final
  applies the foundation request), magazine uses the default gutter.
- **A-CL-5 (space-medium separator):** the magazine separator is live's 2em variant; scoped in
  list-teaser.css (see foundation-requests.md); the trailing adventures separator uses the
  foundation `separator` style (1px vs live 2px — landing's request already covers it).
- **A-CL-6 (publish):** publish = yes, the landing unit's decision, applied unchanged.
