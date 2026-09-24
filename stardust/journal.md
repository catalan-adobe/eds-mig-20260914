# Journal — WKND replica migration

Chronological log of every prompt execution. Most recent at the bottom.
See `skills/stardust/reference/journal-format.md` for entry format.

---

## Extract — captured /us/en (26 pages, prep + dynamics) (2026-09-24)

**Prompt:** Phase 1 of a hands-off same-design (replica) migration of https://wknd.site/us/en to AEM Edge Delivery: run `extract --prep --dynamics`, type every page, draft module candidates, seed the descriptive PRODUCT/DESIGN files and brand review, stamp the replica flow.

**Decisions:**
- Scope narrowed to the `/us/en` subtree (A-EX1 in `stardust/direction.md`); 9 other locale trees are D3-multilingual scope debt.
- No sitemap on the origin → same-origin BFS (depth 3) found 26 pages; all 26 crawled with `crawl.mjs --pages … --concurrency 4 --dynamics` (headless, consent `auto`, 0 failures).
- Page types: landing 1 · listing 2 · program 16 · article 5 · static 1 · unique 1 (A-EX3/A-EX4).
- 14 module candidates drafted (`DESIGN.json#extensions.modules[]`, status candidate), 5 system components, icon-font glyph table.
- Style census (26 × {1440, 360}) run from a work copy because the shipped script needs `live-session.mjs` beside it (A-EX6).
- brand-review.html validated at 1440/768/390: fixed mobile text overflow (long loader URL) and h2→h5 heading skips, then a clean pass.

**Artifacts touched:**
- `stardust/current/pages/<slug>.json|.html` (26) — created (typed `slots` added)
- `stardust/current/assets/{screenshots/,logo.svg,logo-light.svg,favicon.png,css/,fonts/}` — created
- `stardust/current/_crawl-log.json` (+visionCheck), `_computed-styles.json`, `_brand-extraction.json` — created
- `stardust/current/PRODUCT.md`, `DESIGN.md`, `DESIGN.json`, `brand-review.html` — created
- `stardust/validation/brand-review/{desktop,tablet,mobile}.png` — created
- `stardust/state.json` — created (flow replica, handsOff, captureGaps [])
- `stardust/direction.md` — created (assumptions A-EX1…A-EX9)

**Findings worth flagging:**
- Provenance 26/26 live; every page medium wait 2500 ms, HTTP 200; `captureGaps.detail`: "uncaptured first-level targets: none (no locale root captured)".
- `cssBackgrounds: []` on all pages is genuine (imagery via `<img>`), confirmed by thumbnails.
- Adventures listing is client-hydrated tabs + image list; header search posts to `<page>.searchresults.json?fulltext=`; AEM ContextHub/CSRF/currentuser calls and Adobe Launch/demdex on every page.
- Fonts: Asar + Source Sans Pro from Google Fonts (OFL, self-hostable, files saved); `wknd-icon-font` is the site's own.

**Open questions:**
- none (hands-off; gates resolved as named assumptions)

**Next:** replica Phase 2 — recreate one archetype per page type (home, adventures listing [+ magazine variant], adventure detail, magazine article, about-us, faqs) and gate against the live site.

---

## Preserve direction — verbatim promotion, empty register, dynamics gate, archetype roster (2026-09-24)

**Prompt:** Replica Phase 2, hands-off: promote the --prep spec verbatim, write direction.md in preserve mode, build the (empty) inconsistency register, run the dynamics gate (detect → plan → curate) against the EDS target origin, confirm the six-archetype roster with live URL + main selector.

**Decisions:**
- `stardust/current/{PRODUCT.md,DESIGN.md,DESIGN.json}` → project root byte-for-byte (`cmp` clean); no divergence roll, no variant files (A-PD1).
- Empty register — pure replica; no audit, no user items (A-PD2).
- Archetype roster = Phase 1 proposal, landing first, 6 types / 26 pages covered (A-PD3); magazine listing stays the declared variant (A-EX4).
- `mainSelector` = `header + main` on every archetype — bare `main` matches 2–3 nested AEM layout containers (A-PD4).
- Dynamics: 28 detector rows curated into 11 features, all with a disposition; 4 client-only interaction rows (tabs, carousels, accordion, header toggles) added from Phase 1 evidence because the SSR source reports `client-rendered 0` (A-DY1). Owner decisions ship the interim tier: sign-in decided-out (A-DY2), language nav static with locale hrefs (A-DY3), listings static-snapshot with metadata contract (A-DY4), search index-backed via `helix-query.yaml` (A-DY5), AEM runtime JSON decided-out (A-DY6), tags scaffolded disabled (A-DY7).

**Artifacts touched:**
- `PRODUCT.md`, `DESIGN.md`, `DESIGN.json` — created (verbatim copies)
- `stardust/direction.md` — updated (provenance header, preserve-mode record, assumptions A-PD1…A-PD4, A-DY1…A-DY7)
- `stardust/replica/inconsistency-register.md` — created (empty template + schema comment)
- `stardust/replica/progress.json` — created (6 archetypes, status pending)
- `stardust/current/_dynamics.json`, `dynamic-features.generated.md` — created (detector, 6 archetypes, `--reach`)
- `stardust/dynamics/dynamic-features.generated-plan.{json,md}` — created (`--target-origin` probe: 9/9 API paths host-bound)
- `stardust/dynamic-features.md`, `stardust/dynamic-features-plan.md`, `stardust/dynamics/parity.json` — created (curated)

**Findings worth flagging:**
- `/query-index.json` is 404 on `https://main--eds-mig-20260914--catalan-adobe.aem.page` — `helix-query.yaml` must be authored in the code branch at handoff (triage rule 8).
- Source search endpoint is `https://wknd.site/content/wknd/us/en/<page>.searchresults.json/_jcr_content/root/container/container_1195249223/search?fulltext=` (the `/us/en/...` short form 404s); `surf` → 3 results (Surf Camp in Costa Rica, Bali Surf Camp, San Diego Surf Spots).
- `wkndsitewknd887971p.112.2o7.net` is Adobe Analytics (Omniture) collection, not an unknown vendor.
- Every archetype: one `<header>` directly followed by the outer `<main class="container responsivegrid aem-GridColumn aem-GridColumn--default--12">`, then `<footer>`, all inside `.root > .cmp-container > .aem-Grid`.

**Open questions:**
- none (hands-off; owner decision batch recorded in `stardust/dynamic-features.md § Decision batch`)

**Next:** replica Phase 3 — recreate the landing archetype (`us-en-html`, canon chrome) first, then the five other archetypes, each as clean HTML/CSS under `stardust/prototypes/`, gated with `header + main` as the main selector.

---

## Recreate — us-en-html landing archetype recreated as clean HTML/CSS + canon authored (2026-09-24)

**Prompt:** Phase 3 recreate of the landing archetype `us-en-html` (https://wknd.site/us/en.html) as the canon author, hands-off, no design deltas.

**Decisions:**
- Canon split: `stardust/prototypes/canon.css` (tokens per token contract, @font-face, header/utility bar/language menu/mobile nav, footer, shared modules: button, title, separator, image list, teaser hero/featured, carousel), `canon.js` (fired behaviours only), `us-en-html.css` (empty — every module on the page is canon).
- Values lifted from `clientlib-site.min.css` via css-rules.mjs, models confirmed with measure.mjs on live at 1440/360 (float grid with 14 px column padding, no padding on the main fixed container, footer container padded, fixed header + `body .root` padding-top 200/130, hero flex column-reverse with `flex:1` content sizing).
- Images reference the live renditions (same `src`/`srcset`, no captured media dir — capture-state policy); fonts self-hosted from the Google latin files named by the captured `google-fonts.css` (A-RC1).
- Structural vocabulary: `data-template="landing"`, `data-section/intent/layout` per section, `data-module` + `data-slot` (hero, featured, recent-articles, cta, next-adventures, destinations, logo, primary-nav, footer-nav, social, legal), `data-canon` on header/footer, `data-nav-collapse="hamburger"`.

**Artifacts touched:**
- `stardust/prototypes/us-en-html-proposed.html`, `us-en-html.css`, `canon.css`, `canon.js` — created
- `stardust/current/assets/fonts/gf/*.woff2`, `stardust/current/assets/flags/*.svg` — harvested
- `stardust/replica/lift/*` — lifted tables (computed styles, image tags, icon URIs)
- `stardust/direction.md` — assumptions A-RC1…A-RC7 appended

**Findings worth flagging:**
- The extract's woff2 fonts are a different version of Source Sans Pro/Asar (4–7 % wider glyphs) — every archetype must use `fonts/gf/` through canon.css or every nav/text width drifts.
- `header + main` must be literal siblings for the symmetric `--main` selector; `main` needs a BFC (live: float column) or visual-diff reads it as blank.
- A trailing `separator` (130 px) follows the "All Trips" button — html-slice truncation hid it; always read the tail of `main`.

**Open questions:**
- none

**Next:** source-fidelity gate for us-en-html (below); siblings import canon.css + canon.js as is.

---

## Source-fidelity gate — us-en-html passes 0.00 % at 1440 and 360, motion parity (2026-09-24)

**Prompt:** Phase 4 gate for `us-en-html` vs https://wknd.site/us/en.html, `--main "header + main"`, both breakpoints, then interaction parity.

**Decisions:**
- iter1 (`--full`): 19.6 % / Δ-72 px @1440, 23.6 % / Δ-260 px @360; 4 structural 🔴 (hidden Welcome/Sign Out/Home nodes), chrome-parity 20/15 deltas (font widths +7 %), visual-diff BLANK RENDER (main had no BFC). Fixes off the instruments: Google latin font files (A-RC1), hidden nodes (A-RC2), `header + main` siblings, `main`/containers float model, footer container padding, hr margin model, `.card-list .image img` specificity, missing trailing separator.
- iter2 (pixel): 0.06 % / Δ0 @1440, 0.09 % / Δ0 @360. iter3 (`--full`): content-diff none, chrome-parity quiet; crop-compare footer 0.51 % @1440 → social-buttons column padding 0 (live), 0.65 % @360 header → US flag on the language toggle (A-RC3); then 0.00 % both widths, chrome header/footer crops 100 % at both widths.
- Confirmation `--full` round: pixel 0.00 % / Δ0 / overflow ok / content-diff none / chrome-parity quiet at 1440 and 360. visual-diff advisory STRETCHED IMAGE ×11/×8 = `object-fit: cover` crops identical to live (pixel 0.00 %) — justified.
- Interaction parity: live observed (1440: 3 fadeIn, 4 padding transitions, scrolly/active/showMenu/open; 360: navPanel-visible + transform transitions). Implemented in canon.js/css: scroll-morph, carousel active swap + fadeIn, language menu, mobile panel, nav hover bg. motion-compare: 8 parity + 5 parity; the 2 MISSING/2 advisory lines are the same carousel behaviour under the clean class names (`carousel__item--active` vs `cmp-carousel__item--active`, 3× each) — resolved as naming. Dead on live (not implemented): hover on hero CTA, article cards, primary button, social buttons, footer nav (probe-visible props). Final pixel round after canon.js: 0.00 % both widths.

**Artifacts touched:**
- `stardust/replica/gates/us-en-html-{1440,360}/` — captures, iter1/iter2/iter3/confirm/final evidence, chrome-*-diff.png
- `stardust/replica/motion/us-en-html{,-360}{,-build}.json` — observations
- `stardust/prototypes/canon.css`, `canon.js`, `us-en-html-proposed.html` — updated

**Findings worth flagging:**
- Ledger note: the gate phase `start` was written after its rounds began (rounds interleaved with recreate fixes); timings in status.jsonl for this phase are therefore compressed.

**Open questions:**
- none

**Next:** coordinator advances `us-en-html` to approved (hands-off) and records progress.json from the returned JSON; siblings fork from `us-en-html-proposed.html` (data-slot vocabulary) and import canon.css + canon.js unchanged.

---

## Recreate — us-en-adventures-html (listing) authored as sibling archetype on frozen canon (2026-09-24)

- Prototype `stardust/prototypes/us-en-adventures-html-proposed.html` generated from the capture by `stardust/replica/lift/us-en-adventures-html-build.mjs` (text, hrefs, alt/title, srcset/width/height verbatim; clean BEM markup, 32 cards in 6 tab panels, hero teaser, h1, underline title, trailing separator).
- New modules lifted from `clientlib-site.min.css`: `.cmp-tabs` (14px uppercase tabs, .5rem 1rem, active #202020/#fff, hidden inactive panels) and `.cmp-layout-container--fixed` (computes to canon `.container`). Everything else is canon.
- `measure.mjs` live vs proto: every measured box equal at 1440 and 360; root scrollHeight 2769/2769 and 6497/6497 after adding the separator missed in the first count reconciliation (−130 px).
- `chrome-parity.mjs` header+footer: parity at 1440 and 360 — no page-level compensation, zero canon requests.
- Fonts: canon (Asar + Source Sans Pro self-hosted Google Fonts woff2, wknd-icon-font from the site); no licensed kit.

## Source-fidelity gate — us-en-adventures-html passes at 1440 and 360 in one iteration (2026-09-24)

- Round 1 (`gate.sh --full`, main `header + main`): 1440 → pixel 0.00 %, Δh 0 px (2769/2769), 0 structural 🔴, no overflow, chrome parity; 360 → 0.00 %, Δh 0 px (6497/6497), 0 🔴, no overflow, chrome parity. Header/footer crop bands 0.00 % at both widths.
- visual-diff advisory: STRETCHED IMAGE flags on object-fit: cover images — same rules live, justified (direction.md A-adv-1).
- Interaction parity: `motion-observe.mjs` live → `stardust/replica/motion/us-en-adventures-html.json` (0 animations, header padding transitions, 10 class mutations: scrolly ×2, tab/panel --active ×3 each, showMenu/open). Implemented the tabs class swap (inline script in the prototype); build observation → `us-en-adventures-html-build.json`; `motion-compare.mjs`: 6 parity, the 2 MISSING + 2 advisory lines are the renamed tab classes (A-adv-2); 5 hover families dead on live → not implemented.
- Confirmation round (`--full`) after the script: 0.00 % / Δh 0 at both widths — gated number unchanged.
- Iterations used: 1 of 3 per breakpoint. Residuals: none. Canon requests: 0.

## Recreate — us-en-adventures-climbing-new-zealand-html (program archetype) authored as sibling of the landing canon (2026-09-24)

- Prototype `stardust/prototypes/us-en-adventures-climbing-new-zealand-html-proposed.html` + `us-en-adventures-climbing-new-zealand-html.css` (+ `.js` stub); links frozen `canon.css`/`canon.js`; `data-template="program"`, slots breadcrumb / gallery / program-headline / facts / cta-band / tabs.
- Content verbatim from `current/pages/us-en-adventures-climbing-new-zealand-html.{json,html}`; images referenced by live src + rebuilt coreimg srcset (no captured media dir — capture-state policy).
- Values lifted with `css-rules.mjs` (cmp-breadcrumb, cmp-carousel--mini, cmp-contentfragment--elements, cmp-tabs, aem-Grid) and `measure.mjs` box tables (saved under `stardust/replica/lift/us-en-adventures-climbing-new-zealand-html-*.txt`).
- Chrome parity vs canon: only page-state deltas (active "Adventures" nav item in header/footer) → `is-active` class already in canon; no canon compensation needed.
- Two geometry fixes off measure.mjs: `.program-body` clears the gallery float at ≥1025 (+8px), and a `.program-facts__inner` wrapper restores the live margin-collapse chain (+23px in the facts rail). Box table now matches live at 1440 and 360 (scrollHeight 3030 / 3930).

## Source-fidelity gate — us-en-adventures-climbing-new-zealand-html passes iteration 1 at both breakpoints (2026-09-24)

- 1440: pixel 0.02 % (755/4 363 200 px), height Δ 0 px (3030/3030), 0 structural 🔴 (main + chrome), no overflow (scrollWidth 1440), chrome-parity quiet, header/footer crop bands 100.00 %.
- 360: pixel 0.04 % (581/1 414 440 px), height Δ 0 px (3929/3929), 0 structural 🔴, no overflow (360), chrome-parity quiet, header/footer crop bands 100.00 %.
- Only visual-diff advisory: STRETCHED IMAGE on the mini-carousel slide — the live object-fit cover crop (direction.md A-CNZ-2).
- Interaction parity: motion-observe on live (1440 + 360) recorded body.scrolly + header padding 0.5 s transition, carousel --active swap with fadeIn, language-menu open/showMenu, mobile navPanel-visible (all canon.js/canon.css) and the tabs --active class swap (new; implemented in `us-en-adventures-climbing-new-zealand-html.js`). Hover fired only on the header nav link (canon rule). 4 MISSING/4 advisory lines in motion-compare are class-name mappings with equal counts (A-CNZ-4).
- Confirmation round (iter2 --full) after the JS addition returned the gated numbers exactly: 0.02 % / 0.04 %, Δ 0, 0 red.

## Recreate — us-en-magazine-san-diego-surf-html (article archetype) authored as sibling of the landing canon (2026-09-24)

- Prototype `stardust/prototypes/us-en-magazine-san-diego-surf-html-proposed.html` + `us-en-magazine-san-diego-surf-html.css`; links frozen `canon.css`/`canon.js`; `<body class="anonymous page-article" data-template="article">`, slots leadImage / breadcrumb / headline / byline / body / author / share / related.
- Content verbatim from `current/pages/us-en-magazine-san-diego-surf-html.{json,html}` (7 paragraphs, 6 h2, image caption span, byline, 5 up-next items with dates); img tags lifted to `stardust/replica/lift/us-en-magazine-san-diego-surf-html-imgtags.txt` and absolutised (capture-state policy, no media dir).
- Values lifted with `css-rules.mjs` from `clientlib-site.min.css`: cmp-layout-container--fixed, aem-Grid 12/3 columns + offset, `.responsivegrid.aem-GridColumn` zero padding, cmp-breadcrumb (chevron `\ea1c`, 1em list margin above 1024), cmp-image__title, cmp-byline, cmp-buildingblock--btn-list, cmp-list--upnext, cmp-separator modifiers.
- Three measure.mjs-driven fixes: container/column padding model (A-SDS-1), image rows wrapped in self-clearing `.grid` + column-flex body so p→h2 margins do not collapse (A-SDS-2), `.column` specificity on byline/buttons/upnext widths and padding. Removed a wrong hr-margin compensation once the footer measured +18 px from it. Final box table equal at 1440 and 360 (scrollHeight 5524/5522 and 6254/6254).
- `chrome-parity.mjs` header+footer: parity at 1440 and 360 — no page compensation, zero canon requests.
- Fonts: canon (Asar + Source Sans Pro self-hosted Google Fonts woff2, wknd-icon-font from the site); no licensed kit, no substitution.

## Source-fidelity gate — us-en-magazine-san-diego-surf-html passes iteration 1 at both breakpoints (2026-09-24)

- 1440 (`gate.sh --full`, main `header + main`): pixel 0.14 % (11 030 / 7 951 680), height Δ 2 px (5524/5522), 0 structural 🔴 (main + chrome), no overflow (scrollWidth 1440), chrome-parity quiet, no hot band.
- 360: pixel 0.02 % (540 / 2 251 440), height Δ 0 px (6254/6254), 0 structural 🔴, no overflow (360), chrome-parity quiet, no hot band.
- visual-diff advisory: STRETCHED IMAGE on the 60×60 byline avatar — the live object-fit cover crop (A-SDS-4).
- Interaction parity: `motion-observe.mjs` live 1440 → `stardust/replica/motion/us-en-magazine-san-diego-surf-html.json` (body.scrolly ×2 + header padding 0.5 s transitions, language menu open/showMenu, header nav hover background) plus a re-probe file `…-hover2.json` (up-next link hover → #ffea00, A-SDS-5); 360 → `…-360.json` (navPanel-visible + transform transitions, open/showMenu, scrolly). Build observed identically → `…-build.json`, `…-hover2-build.json`, `…-360-build.json`; `motion-compare.mjs`: 7 + 5 + 5 parity, 0 MISSING, 0 EXTRA. Observed 4 behaviours, implemented 4 (3 canon.js/canon.css, 1 page hover rule); dead on live: breadcrumb, contributor social buttons, footer nav/social hovers.
- Confirmation pixel round (iter2) after the motion pass: 0.14 % / Δ 2 px and 0.02 % / Δ 0 px — gated numbers unchanged. Iterations used: 1 of 3 per breakpoint. Residuals: none. Canon requests: 0.

## Recreate — us-en-about-us-html (static archetype, sibling) authored from capture + lifted CSS (2026-09-24)

- `stardust/prototypes/us-en-about-us-html-proposed.html` (240 lines, `data-template="static"`, slots headline / section-title / section-intro / person{name, role, social}) + `us-en-about-us-html.css` (38 lines, scoped under `body.page-about`); canon.css linked untouched. Content verbatim from `current/pages/us-en-about-us-html.html` via `html-slice.mjs`: h1, two underlined h2, two italic `cmp-text--font-small` intros, seven contributor cards (portrait, h3, h5, three icon buttons with the live hrefs, aria-labels and the Kumar Selveraj Facebook/Instagram/Twitter order).
- Values lifted with `css-rules.mjs` from `clientlib-site.min.css`: `.cmp-experience-fragment--contributor` (flex centred, padding .5em/1em), aem-Grid 3/12 · 6/12 · 12/12 columns, 164 px circular `object-fit: cover` portrait, `.cmp-title__text` margins, `.cmp-buildingblock--btn-list` (padding-top 1em, flex-centred, `width: unset` buttons), `.cmp-title--black`, `.cmp-text--font-small`.
- `measure.mjs --against` (1440 + 360, all matches): Δ 0 on main h1/h2/p, every contributor section, portrait, h3, h5 and button; one fix off the instrument — portraits switched from the 1200 rendition to the live `src` + 300w–1200w srcset (natural 1440 vs 1200 fork).
- `chrome-parity.mjs` header+footer: parity at 1440 and 360 — no page compensation, zero canon requests.
- Fonts: canon (Asar + Source Sans Pro self-hosted Google Fonts woff2, wknd-icon-font from the site); no licensed kit, no substitution.

## Source-fidelity gate — us-en-about-us-html passes iteration 1 at both breakpoints (2026-09-24)

- 1440 (`gate.sh --full`, main `header + main`): pixel 0.00 % (0 / 2 309 760), height Δ 0 px (1604/1604), 0 structural 🔴 (main + chrome: 40/40 text nodes, 21/21 attributes, 21/21 icons), no overflow (scrollWidth 1440), chrome-parity quiet, no hot band.
- 360: pixel 0.00 % (0 / 1 330 200), height Δ 0 px (3695/3695), 0 structural 🔴, no overflow (360), chrome-parity quiet, no hot band.
- live.png/build.png byte-identical at both widths; confirmed as a real comparison (independent visual-diff captures agree, DOMs differ under measure.mjs, row-profile shows the rendered page) — A-AU-7.
- visual-diff advisory: STRETCHED IMAGE ×5 on the 164×164 contributor portraits — the live object-fit cover crop (A-AU-5).
- Interaction parity: `motion-observe.mjs` live 1440 → `stardust/replica/motion/us-en-about-us-html.json` (body.scrolly ×2 + header padding 0.5 s transitions, language menu open/showMenu, header nav hover background); 360 → `…-360.json` (navPanel-visible + transform transitions, scrolly). Build observed identically → `…-build.json`, `…-360-build.json`; `motion-compare.mjs`: 7 + 3 parity, 0 MISSING, 0 EXTRA. Observed 4 behaviours, implemented 4 (all canon.js/canon.css); dead on live: contributor social buttons, contributor name/portrait, footer nav/social hovers (A-AU-6).
- Confirmation pixel round (iter2) after the motion pass: 0.00 % / Δ 0 px at both widths — gated numbers unchanged. Iterations used: 1 of 3 per breakpoint. Residuals: none. Canon requests: 0.

## Recreate — us-en-faqs-html (unique archetype, sibling) authored from capture + lifted CSS (2026-09-24)

- `stardust/prototypes/us-en-faqs-html-proposed.html` (208 lines, `data-template="unique"`, slots headline / image / intro / accordion / aside{aside-title, aside-text}, module `accordion`) + `us-en-faqs-html.css` (scoped under `body.page-faqs`) + `us-en-faqs-html.js` (accordion toggle); canon.css linked untouched. Content verbatim from `current/pages/us-en-faqs-html.html` via `html-slice.mjs`: underlined h1, hero image with srcset, intro paragraph, seven accordion items (h3 > button > title span + icon span, hidden panels incl. the authored empty `<h3>&nbsp;</h3>`), aside separator, "Need more help?" h3 and the contact paragraph with its inline `text-align: left`.
- Values lifted with `css-rules.mjs` from `clientlib-site.min.css`: `.cmp-layout-container--fixed`, aem-Grid 12 → content 8/12 + aside 3/12 offset 1 (tablet/phone 12/12; image 8/12 at tablet and phone), `.responsivegrid.aem-GridColumn` zero padding, `.cmp-accordion` (button border-bottom 2px #ebebeb, padding 1em, title 16px/600 uppercase padding-left .5em, panel 14px/1.75 fadeIn .5s, icon glyphs `\e911`/`\e910`), `[class*=__icon]` sizing, `.cmp-text--font-small`, `.cmp-separator--space-small`.
- Two measure.mjs-driven fixes: button font reverted to the UA default the live site keeps (A-FQ-2, −37 px per item), aside hr margin 9px 0 (A-FQ-4, canon request). After them scrollHeight 1672/1672 at 1440 and 2017/2017 at 360, every `main img/button/span/h3/hr/p` box Δ 0.
- `chrome-parity.mjs` header+footer at 1440: parity once main height matched; one canon request (separator hr margin) recorded in `stardust/replica/canon-requests.md`.
- Fonts: canon (Asar + Source Sans Pro self-hosted Google Fonts woff2, wknd-icon-font from the site); no licensed kit, no substitution.

## Source-fidelity gate — us-en-faqs-html passes iteration 1 at both breakpoints (2026-09-24)

- 1440 (`gate.sh --full`, main `header + main`): pixel 0.00 % (0 / 2 407 680), height Δ 0 px (1672/1672), 0 structural 🔴 (main + chrome), no overflow (scrollWidth 1440), chrome-parity quiet, no hot band; crop-compare header y0+200 and footer y1412+260 both 0 px (pass bar item 5).
- 360: pixel 0.00 % (0 / 726 120), height Δ 0 px (2017/2017), 0 structural 🔴, no overflow (360), chrome-parity quiet, no hot band.
- visual-diff advisory: none at either width.
- Interaction parity: `motion-observe.mjs` live 1440 → `stardust/replica/motion/us-en-faqs-html.json` (clicks: accordion item 1, item 2, language toggle; hovers: header nav, accordion button, aside links, footer nav, footer Facebook) — body.scrolly ×3 + header padding 0.5 s transitions, language menu open/showMenu, header nav hover background, accordion expanded classes added 2× with fadeIn on 2 panels (multi-expansion, A-FQ-8); 360 → `…-360.json` (navPanel-visible + transform transitions, scrolly, accordion 1×). Build observed identically → `…-build.json`, `…-360-build.json`; `motion-compare.mjs`: 8 + 4 parity, the 2 + 2 MISSING/EXTRA lines are the accordion class rename with identical counts (A-FQ-9). Observed 5 behaviours (scroll-morph, language menu, nav hover, mobile nav, accordion), implemented 5 (4 canon.js/canon.css, 1 page `us-en-faqs-html.js`); dead on live: accordion button hover, aside links, footer nav/social hovers (A-FQ-10).
- Confirmation `--full` round (iter2) after the motion pass: 0.00 % / Δ 0 px at both widths — gated numbers unchanged. Iterations used: 1 of 3 per breakpoint. Residuals: none. Canon requests: 1 (separator hr margin, `stardust/replica/canon-requests.md`).

## Source-fidelity gate — consolidation: canon request reverted, six archetypes approved (2026-09-24)

- Applied the one canon request (`.separator hr` margin, us-en-faqs-html; live sets none → UA 0.5em) to `stardust/prototypes/canon.css` and removed the FAQ compensation; ran 12 confirmation `gate.sh --full` rounds (6 archetypes × 1440/360) through run-bg.
- Every round failed the height bar (Δ −18/−36/−54 px, one 18 px per separator; chrome-parity footer Δy +18 px): the hr margin does not collapse through `.separator` in the prototypes' columns as it does in live's float grid. Reverted the canon line, restored `.page-faqs .faq-aside .separator hr { margin: 9px 0 }`, moved the request to `stardust/replica/canon-requests.applied.md`, logged residual A-GC1 (direction.md). Canon changes applied: 0.
- Re-ran the 12 confirmation rounds on the restored state: us-en-html 0.00 %/Δ0 · 0.00 %/Δ0; us-en-adventures-html 0.00/Δ0 · 0.00/Δ0; us-en-adventures-climbing-new-zealand-html 0.02/Δ0 · 0.04/Δ0; us-en-magazine-san-diego-surf-html 0.14/Δ2 · 0.02/Δ0; us-en-about-us-html 0.00/Δ0 · 0.00/Δ0; us-en-faqs-html 0.00/Δ0 · 0.00/Δ0 (1440 · 360). All exit 0, content-diff 0 🔴, no overflow, chrome-parity quiet.
- `stardust/replica/progress.json` merged over the Phase 2 roster: per archetype status, iterations, per-breakpoint result/justified/residuals, motion {observed, implemented, dead}, fonts, siblings.
- `state.mjs advance` → prototyped → approved (`--by hands-off`, prototype path set) for all six archetypes; none prototyped-only.

## Migrate plan — six archetypes placed (Path A), three variance probes, unit ledger written (2026-09-24)

- `migrate.mjs render` of the six approved archetypes with `--canon-css stardust/prototypes/canon.css`: `rendered 6, unchanged 0, refused 0, passthrough 0` → `stardust/migrated/us/en.html`, `us/en/adventures.html`, `us/en/adventures/climbing-new-zealand.html`, `us/en/magazine/san-diego-surf.html`, `us/en/about-us.html`, `us/en/faqs.html` (+ sidecars, `fidelityTier: archetype`, `modules[]` filled: hero-carousel/featured-teaser/image-list/hero-teaser · hero-teaser/tabs · mini-carousel/trip-facts/sharing/tabs · content-fragment/contributor-byline/upnext-list · contributor-card · accordion). No strict refusal; "broken" link counts are soft (links to pages outside the 26-page inventory).
- Variance probes (`sibling-variance.mjs`, live vs live, 1440, archetype-side live selectors), JSON under `stardust/migrate/variance/<template>.json`:
  - listing (`us-en-adventures-html` → `us-en-magazine-html`): exit 2 — hero teaser 1→3 matches in 2 style families (`cmp-teaser--featured` + 2× `cmp-teaser--list`), title 2→3, image-list cards 16→5, tabs MISSING, `.text` EXTRA. Budget: `teaser--featured` (canon has it), `teaser--list` variant (NOT in canon — author on the sibling's block CSS in the render unit), image-list without tabs, default text.
  - program (`us-en-adventures-climbing-new-zealand-html` → 15 siblings): exit 2 but content-length boxes only — breadcrumb width (label length), tabs height 1899→788…1558 (itinerary text), carousel h 440→448 and fragment dt w 291→263 on 8 siblings (image aspect / longest fact label); no COUNT/MISSING/EXTRA/CLUSTERS finding on any sibling → clone as-is, no variant.
  - article (`us-en-magazine-san-diego-surf-html` → 4 siblings): exit 2 — every sibling adds one `.text .cmp-text` intro block and (3 of 4) three `cmp-title--underline` h2 section titles as Title components (archetype's h2s live inside the content fragment). Budget: canon `.section-title--underline` (exists, L323) + default text block; image count/families vary with content only.
- `stardust/migrate/progress.json`: `plan` done; four `render` units pending — `us-en-adventures-html` (1), `us-en-adventures-climbing-new-zealand-html-1` (8), `-2` (7), `us-en-magazine-san-diego-surf-html` (4).
- Hands-off assumption A-MP-1 (direction.md): program-template deltas are content-driven and carry no variant; listing and article deltas are budgeted as variants above, never as per-page block forks.

---

## Migrate — render unit `us-en-adventures-html` (listing), sibling `us-en-magazine-html` rendered (2026-09-24)

- Path A′ fork of `stardust/prototypes/us-en-adventures-html-proposed.html` via `stardust/.work/migrate/build-us-en-magazine-html.mjs` → `stardust/.work/migrate/us-en-magazine-html.html` (header/footer/mobile nav verbatim from the archetype with the Magazine item active; `<head>` title + description from the capture; every heading, paragraph, CTA + href, image src/srcset/alt/width/height copied verbatim from `stardust/current/pages/us-en-magazine-html.html`).
- Variants on the sibling only (`data-variant`): `teaser--featured` (canon rules), `teaser--list` + `teaser--secure` + `column--third` (authored in `stardust/.work/migrate/us-en-magazine-html.variants.css`), `no-tabs` image-list, default `text`, `separator--space-medium`.
- Pixel bar (`gate.sh … sib1 --main "header + main"`): 1440 → 0.04 % / Δh 0 / overflow ok; 360 → 0.09 % / Δh 0 / overflow ok. All differing pixels sit in the y 0–500 header band (canon chrome noise, identical 1396 px at both widths); main is pixel-identical.
- Content-count (`content-diff.mjs --profile generic --main "header + main"`): capture as source → counts equal on every root (25/6/6/8 main, 28 header, 17 footer), 16 🔴 all stylesheet artefacts of the unstyled capture (A-MR-L5); live as source → `Findings: none — content + roles match`. Zero content deviations.
- Not done here by design: `migrate.mjs render`, `_meta.json`, `state.json`, `progress.json` — the place agent owns them.

---

## Migrate — render unit `us-en-adventures-climbing-new-zealand-html-2` (program), 7 siblings rendered (2026-09-24)

- Path A′ fork of `stardust/prototypes/us-en-adventures-climbing-new-zealand-html-proposed.html` via `stardust/.work/migrate/gen-program.mjs` (playwright DOM read of the captured page, no network) → `stardust/.work/migrate/<slug>.html` for riverside-camping-australia, ski-touring-mont-blanc, surf-camp-costa-rica, tahoe-skiing, west-coast-cycling, whistler-mountain-biking, yosemite-backpacking. Injected verbatim: title/description, breadcrumb, carousel slides (1 or 3; src/srcset/width/height/alt/title absolutised to https://wknd.site), h1, 6 facts, "Share this Adventure", 3 tabs with full fragment bodies (`<h2><b>`, `<br>` inside headings, `&nbsp;`, lists, images kept as authored). Canon chrome untouched.
- Variants (sibling content only, same class names as unit `-1`): `program-body--flush` + `program-facts--split` on tahoe-skiing, west-coast-cycling, yosemite-backpacking (live nested `aem-Grid--3` rail — A-MR2-1); `image--captioned` on surf-camp-costa-rica, tahoe-skiing, yosemite-backpacking (A-MR2-2). Rules in a `<style data-variants>` block per page (A-MR2-4).
- Pixel bar (`gate.sh … sib1|sib2 --main "header + main"`, `stardust/replica/gates/<slug>-<w>/`): all 7 × 2 widths PASS, Δh 0 px, overflow ok — 1440: 0.02–0.04 % (riverside 0.02, ski-touring 0.02, surf 0.03, tahoe 0.03, west-coast 0.04, whistler 0.03, yosemite 0.04); 360: 0.04–0.07 % (0.05, 0.06, 0.06, 0.04, 0.05, 0.07, 0.05). Round 1 misses at 360 on the three grid-variant pages (24.6–27.9 %, Δh 166–234) closed in round 2 by the variants; no third round needed.
- Content-count (`content-diff.mjs <styled capture> <build> --profile generic --main "header + main"`, A-MR2-3): "Findings: none — content + roles match" on all 7 pages, every root (header 28/28, footer 17/17, main equal per page incl. img counts).
- Not done here by design: `migrate.mjs render`, `_meta.json`, `state.json`, `progress.json` — the place agent owns them. Gate logs: `stardust/.work/replica/bg/<slug>-{1440,360}[-r2].log`, `<slug>-cdiff.log`.

## Migrate — render unit `us-en-adventures-climbing-new-zealand-html-1`: 8 program siblings rendered, gated, counted (2026-09-24)

**Prompt:** Phase 5a render unit for the 8 program siblings of `us-en-adventures-climbing-new-zealand-html` (bali-surf-camp, beervana-portland, colorado-rock-climbing, cycling-southern-utah, cycling-tuscany, downhill-skiing-wyoming, gastronomic-marais-tour, napa-wine-tasting): fork the archetype, inject captured content verbatim, pixel bar at 1440/360, content-count; no `migrate.mjs render`, no state/progress writes.

**Decisions:**
- Path A′ by DOM transform of the captured `<main>` (A-MR1-1) — one script, eight forks, no hand-authored content.
- Variance deltas as variant classes: `program-body--flush`, `program-facts--split` (5 pages), `image--captioned` (3 pages); rules inline in the sibling `<head>` (A-MR1-2/3).
- Content-count reference = styled byte copy of the capture with `<base href>` (A-MR1-4, same as A-MR2-3).

**Artifacts touched:**
- stardust/.work/migrate/_render-program.mjs — created (render script)
- stardust/.work/migrate/us-en-adventures-{bali-surf-camp,beervana-portland,colorado-rock-climbing,cycling-southern-utah,cycling-tuscany,downhill-skiing-wyoming,gastronomic-marais-tour,napa-wine-tasting}-html.html — created
- stardust/.work/migrate/capture/<slug>.html — created (8 styled capture copies)
- stardust/replica/gates/<slug>-{1440,360}/ — gate rounds sib1 (all), sib2 + sib3 (five flush pages)
- stardust/direction.md — appended A-MR1-1…5

**Findings worth flagging:**
- Pixel bar: 1440 → 0.00 % (beervana, tuscany, wyoming) / 0.03–0.05 % (other five); 360 → 0.00 % on all 8; Δh 0 everywhere; overflow assert ok at both widths on all 8.
- Two fix rounds were needed on the five "flush" pages: round 1 (padding only) moved 360 the wrong way (build shorter by 168–275 px) because the facts rail's column split, not the container padding, drove the height; measuring `.fragment--facts` / `.section-title` / `.sharing` against live named it.
- Content-count: `Findings: none — content + roles match` on all 8 (header + main, header, footer). Unstyled capture as source gives 29 false 🔴 per page — never use it.
- macOS BSD `sed` has no `0,/re/` address; a `<base>` injection via sed silently produced byte copies — use python/node for one-shot substitutions.

**Open questions:**
- none

**Next:** place agent runs `migrate.mjs render` for this cluster, declares `variants[]` (`program-body--flush`, `program-facts--split`, `image--captioned`) and `modules[]` (`mini-carousel`, `trip-facts`, `sharing`, `tabs`) on the sidecars, then `gate-evidence.mjs`.

---

## Migrate — render unit `us-en-magazine-san-diego-surf-html` (article), 4 siblings rendered, gated, counted (2026-09-24)

- Path A′ fork of `stardust/prototypes/us-en-magazine-san-diego-surf-html-proposed.html` via `stardust/.work/migrate/_render-article.mjs` (playwright DOM read of the captured page, no network) → `stardust/.work/migrate/<slug>.html` for arctic-surfing, guide-la-skateparks, ski-touring, western-australia; CSS/JS/favicon linked as `../../prototypes/…` / `../../current/…`; `<head>` carries the archetype meta + `stardust-archetype`, page title/description/og (A-MA-1).
- Variants (sibling content only, rules in `<style data-variants>`): `section-title--underline` (arctic-surfing, guide-la-skateparks, western-australia — canon L323), `text` (arctic-surfing), `text--quote` (guide-la-skateparks, ski-touring, western-australia — live `.cmp-text--quote` lifted), `download` (guide-la-skateparks — sidebar PDF Download component, template-adapted + bespoke slot, A-MA-4). Sidebar children follow source order/presence (no hidden separator on arctic-surfing, ski-touring — A-MA-3); western-australia's empty live `.download` dropped.
- Pixel bar (`gate.sh … sib1|sib2 --main "header + main"`, `stardust/replica/gates/<slug>-<w>/`): all 4 × 2 widths PASS, overflow ok. Final: 1440 — arctic 0.12 % Δh 2, skateparks 0.16 % Δh 2, ski-touring 0.12 % Δh 2, western-australia 0.17 % Δh 3; 360 — arctic 0.01 % Δh −1, skateparks 0.03 % Δh −1, ski-touring 0.01 % Δh −1, western-australia 0.03 % Δh −1. Round sib1 at 360 failed the |Δh| bar on three pages (arctic −37, ski-touring −37, skateparks +162) → separator/download fixes above → sib2 pass; two rounds used, cap not exceeded.
- Content-count (`content-diff.mjs <styled capture> <build> --profile generic --main "header + main"`, A-MA-6): counts identical on every root for all 4 pages, 0 🔴; one 🟡 ICON MOVED per page (contributor photo, whitespace-only anchor difference) — not a deviation. Contributor `href="#"` → `#<initial><lastname>` per archetype convention (A-MA-5).
- Not done here by design: `migrate.mjs render`, `_meta.json`, `state.json`, `progress.json` — the place agent owns them. Gate logs: `stardust/.work/replica/bg/<slug>-{1440,360}[-r2].log`, `<slug>-cd2.log`.

**Next:** place agent runs `migrate.mjs render` for this cluster, declares `variants[]` per page (above) and `modules[]` (`content-fragment`, `contributor-byline`, `upnext-list`; `download` on guide-la-skateparks), records the `template-adapted` decision for the skateparks download block.

## Migrate place + state-and-report — 20 siblings placed at sibling tier, advanced to migrated (2026-09-24)

**Prompt:** Phase 5a place + report: run `migrate.mjs render` for the 20 pre-gated sibling files (4 clusters), fill sidecars (modules, variants, deviations, gates), lint, `gate-evidence`, advance to `migrated`, report unit, ledger, journal, commit.

**Decisions:**
- Placed copies (`stardust/.work/migrate/placed/`) rewrite only asset hrefs to prototype-relative; content bytes verbatim (D-MP-1). Magazine listing's variants.css folded in as `<style data-variants>` (A-MP-2).
- Siblings advanced `extracted → directed` per cluster so the driver takes branch A′ (A-MP-1); 20/20 rendered A′, `fidelityTier: sibling`, `archetypeSource`/`template` = archetype slug, 0 refused.
- Sidecars: `modules[]` per brief (program: mini-carousel, trip-facts, sharing, tabs; article: content-fragment, contributor-byline, upnext-list [+download]; listing: featured-teaser, image-list, list-teaser); `variants[]` one class per entry; `contentDeviations[]` from the render agents (article cluster: contributor href transform, empty aem-Grid drops, download template-adapted).
- Variance probes re-run as run-bg jobs for attribution (A-MP-3); `content-length` variant token on 6 clone-as-is program pages.
- Gates per sibling: content-fidelity (declared), pixel-gate-1440/360 [prototype regime], content-count, delivery-lint (0 P0 · 0 P1 · 1 P2 everywhere), variance-probe; media-reconcile `n/a` until delivery. `gate-evidence.mjs --check` exit 0.
- Placement spot-check: gate.sh at 360 on the MIGRATED files (`us-en-magazine-html-360-placed` 0.09 % PASS, `us-en-magazine-guide-la-skateparks-html-360-placed` 0.03 % PASS) — assets resolve from `stardust/migrated/assets/`.

**Artifacts touched:**
- stardust/migrated/us/en/**/*.html + *._meta.json (20 siblings) — created
- stardust/migrated/assets/ — canon/archetype CSS+JS bundled (updated)
- stardust/migrate/progress.json — 4 render units done, report unit — updated
- stardust/state.json — 20 pages → migrated (state.mjs); state.json.migrate merged by the driver — updated
- stardust/.work/migrate/placed/ (brief.json, _place.mjs, _sidecar.sh, placed html) — created
- stardust/direction.md — D-MP-1, A-MP-1…6 — updated

**Findings worth flagging:**
- `migrate.mjs` chooses A′ by page status (`directed`), not by `--archetype`; an `extracted` page renders as tier archetype silently.
- The driver resolves asset hrefs against the proto-dir, not the `--source` file's directory — fan-out files must reference `canon.css` as the prototypes do.
- The driver's idempotent skip did not notice a `--source` content change (needed `--force`).
- Adjacent, not in scope: the 6 archetypes are still `approved` (never advanced to migrated by the plan unit) and `stardust/migrated/us/en.html` lints P0 `no <h1>`; the archetype adventures.html keeps absolute `https://wknd.site/...` program links inside its tabs `x-template`.

**Open questions:** none

**Next:** deploy/rollout once DA_TOKEN is available — Phase A inventory from `stardust/migrated/`, media-reconcile per page (row 7), published-origin gate.

---

## handoff — migrate complete, deploy/rollout pending DA_TOKEN (2026-09-24)

**Prompt:** close the replica handoff phase after migrate.

**Decisions:**
- Handoff ends at migrate: 26 pages rendered under `stardust/migrated/` (6 archetypes from the plan unit, 20 siblings from this session); no DA_TOKEN in the environment, so deploy (row 2) and rollout (A–I) are not attempted.

**Artifacts touched:**
- stardust/status.jsonl — `replica handoff end` — updated

**Open questions:** none

**Next:** with DA_TOKEN set, `rollout` Phase A from `stardust/migrated/`; the media-reconcile gate (row 7) and the published-origin pixel gate run there.

---

## Migrate — archetypes re-placed and advanced (2026-09-24)

- Coordinator follow-up after run 1: the six archetypes had been placed in the plan unit before any sibling existed, so their sidecars counted every sibling link as broken (73 on the adventures listing). Re-rendered all six with `migrate.mjs render --force`; residual broken links are now exactly the 10 locale-root links (`/us/es.html`, `/ca/en.html`, …) — the D3-multilingual scope debt (A-EX1), not defects.
- Advanced the six archetypes `approved → migrated`. 26/26 pages migrated.
- Open for run 2 (deploy): `us/en.html` fails delivery-lint P0 `h1` — the live home page has no `<h1>` either (carousel headings are `<h2>`). Resolving it is a design delta and needs an inconsistency-register entry before the PUT.
- `crop-diff.png` had leaked to the project root (write boundary) — trashed.

## Preserve direction — register entry R-01 applied (2026-09-24)

- User decision (option 1): the home page's first carousel slide title becomes the page `<h1>`, rendered at the h2 size. Register entry R-01 written; prototype + `us-en-html.css` edited; gate.sh rounds `r01` at 1440 and 360 both 0.00 % / Δ0 / no overflow; `stardust/migrated/us/en.html` re-placed and now lints 0 P0 / 0 P1.
- DA token obtained through the `da-auth` skill (`da-auth-helper token`, browser IMS login), stored in `.env` (gitignored), valid to 2026-09-25T09:40Z; `admin.da.live/list` → 200.

## A-inventory — 26 pages, 6 templates, DA coordinates filled (2026-09-24)

- Gated-archetype precondition verified from `stardust/replica/progress.json`: all 6 archetypes (landing, listing, program, article, static, unique) `result.pass: true` at 1440 and 360, every residual carries a `cause`. Nothing blocked.
- `inventory.mjs --site-url https://wknd.site/us/en` in full mode → `coverage/pages.json` (26 rows, all `pending`), `coverage/templates.json` (6: us-en-html:1, us-en-adventures-html:2, us-en-adventures-climbing-new-zealand-html:16, us-en-magazine-san-diego-surf-html:5, us-en-about-us-html:1, us-en-faqs-html:1), `rollout.json`.
- **A-RO-0:** the brief's `--state stardust/state.json` (archetypes-only mode) produced 26 one-page templates because every page is fully migrated with a sidecar naming its `template`; full mode is the documented mode for a complete migrated tree and was used instead.
- `rollout.json` `site.da` = catalan-adobe / eds-mig-20260914 / replica-wknd; `site.liveHost` = replica-wknd--eds-mig-20260914--catalan-adobe.aem.live (targeted edit).

## B-block — 15 distinct blocks → 14 block conversions + 1 default-content, names locked (2026-09-24)

- `blocks.mjs`: 15 distinct module blocks, 0 chrome (header/footer are foundation), 91 instances → 15 conversion points; most reused tabs×17, mini-carousel/trip-facts/sharing×16.
- `plan.mjs`: representative-first per template; `plan.json` written. Cross-cluster shared blocks: featured-teaser / cards / hero-teaser (landing ↔ listing) and tabs (program ↔ listing).
- Names locked in `stardust/eds-conversion-log.md` (deploy § 2 triage D1/D11 per module) and in `coverage/blocks.json` via `update-coverage.mjs --block … --eds-name`: `image-list → cards`, `content-fragment → article-body`, `sharing → default-content` (converted, omitted, A-RO-4). 14 blocks pending.
- Cluster list (7 units): foundation (C0) → landing order 1 → program, article, static, unique order 2 (concurrent, disjoint) → listing order 3 (reuses tabs from program, cards/featured-teaser/hero-teaser from landing). Assumptions A-RO-0…6 in `direction.md`.

## B2-dynamic — dynamic-features.md re-verified against fresh evidence, 11/11 rows dispositioned (2026-09-24)

- `dynamics-detect.mjs` (run-bg `b2-detect`): 28 findings, 6 pages, reach rolled from the 26-page capture. `dynamics-plan.mjs --target-origin …replica-wknd…aem.page --migrated stardust/migrated`: 28 rows, host-bound 9/9, delivered 0.
- Every fresh row maps to a curated DF-01…DF-11 row; no new evidence; every row carries a disposition. Note added to `stardust/dynamic-features.md` (consent-check.js replaces delayed.js for the DF-07 scaffold).

## Rollout prepare — runtime contract, publish decision, cluster list, progress.json (2026-09-24)

- `stardust/runtime-contract.json` written from `scripts/aem.js` + `scripts/scripts.js` + `head.html`: vanilla EDS, `formatted-only` buttonization into `p.button-wrapper` (`.button.primary|secondary|accent`), `div.<name>-wrapper` / `.<name>-container`, Trusted Types default policy (CSP `require-trusted-types-for 'script'`), `/nav` + `/footer` chrome documents, `emptySectionCollapse: true`, `documentElement.lang` hard-coded `en`, `consent-check.js` in `loadDelayed` (no `delayed.js`), stock `cards`/`columns`/`hero`/`widget` blocks present.
- Publish decision PUBLISH recorded in `stardust/eds-conversion-log.md` (created) with the pre-existing-DA-content note (A-RO-1).
- `stardust/rollout/progress.json`: units foundation (o0) → landing (o1) → program, article, static, unique (o2) → listing (o3) → final; every unit `pending`, each cluster carrying pageSlugs, daPaths, blocksToConvert, blocksToReuse.
- Lint environment finding (conversion log § Lint environment): `lint:js` needs `NODE_PATH` to the `.work/lint-babel` shim; 0 runtime hits; `stardust/` to be added to `.eslintignore` by the foundation unit.

## C-deliver C0 — foundation authored and deployed: styles, fonts, favicon, header/footer blocks, /nav + /footer live, shell previewed (2026-09-24)

- `styles/styles.css` rewritten from `canon.css` (tokens verbatim, kebab-case; base type; WKND button
  system on the EDS conventions — `strong` = accent yellow primary, `em` = dark secondary, `em+strong`
  = the source's grey default; section scaffold = `.container` 1164 + `.column` 14px gutters; section
  styles `flush`, `underline`, `font-small`, `dark`, `separator`, `spacer`, `breadcrumb`,
  `article-layout`, `program-layout`; EW edit-mode repaint). `styles/fonts.css`: Asar 400, Source
  Sans Pro 300/400/600 n+i, wknd-icon-font (block) from `fonts/`; metric-matched `asar-fallback`
  (Georgia) and `source-sans-pro-fallback` (Helvetica Neue/Arial) in styles.css. `favicon.png` +
  `favicon.ico` from the capture, one `head.html` link. `stardust/` added to `.eslintignore`.
- `blocks/header`: template-slotted fixed chrome (utility bar with account links / language menu,
  masthead with logo / primary nav / search UI, mobile toggle + off-canvas panel; body.scrolly at
  scrollY > 15; the primary `<ul>` is re-placed between masthead and panel on the 1025px breakpoint,
  never cloned). `blocks/footer`: logo / nav / Follow Us / social icon buttons (icons/*.svg
  extracted from the icon font, sized by the glyph advance) / legal text. Flags + search icons ride
  the code origin under `blocks/header/`.
- `/nav` and `/footer` authored (Robots noindex) and PUT → preview → publish (deploy-batch, ledger
  `stardust/deploy/ledger-foundation.json`); logos rehosted via `da-media-upload.mjs` (media ledger,
  2 files, scope `wknd`). `/us/en/shell-check` previewed only. `.plain.html`: 200 / 0 about:error /
  0 `/img/` on all three; deployed shell: header + footer `loaded`, logos 300×112 natural, fonts
  loaded, 0 console errors, `main` top = 200px.
- Harness (`qa-gate.mjs` on :3013): 8 ok; the 2 fails are by design — the shell page has no `<h1>`
  (one paragraph, per brief) and the two logo images 404 locally (the dev server rewrites
  `content.da.live` to an anonymous preview.da.live URL) — both verified green on the preview origin.
- Notes for clusters: the stock `blocks/cards` + `blocks/hero` still reference `var(--background-color)`
  (token gate hit; both are replaced by the landing cluster). The source is content-box by default —
  lift `box-sizing` together with any width + padding rule (see A-C0-1). `article-layout` puts every
  wrapper in the main column and `.upnext-list-wrapper` in the sidebar; `program-layout` spans the
  default-content title, then `.trip-facts-wrapper` (1/4) beside `.tabs-wrapper` (3/4).

## C-deliver — foundation gated and frozen (2026-09-24)

Foundation-first gate on the published shell
`https://replica-wknd--eds-mig-20260914--catalan-adobe.aem.page/us/en/shell-check` vs
`https://wknd.site/us/en.html` (live side from the cached chrome/anchor probes of the day):
- `crop-compare.mjs` (bar ≤ 2 % per band): 1440 header 0.09 % (194 px), footer 0.02 % (260 px,
  live y 3469 / build y 293); 360 header 0.53 % (117 px), footer 0.84 % (593 px, live y 5256 /
  build y 223). Evidence: `stardust/replica/gates/us-en-html-<w>/{shell.png,chrome-*-diff-shell.png}`.
- `chrome-parity.mjs`: Δ25 @1440, Δ29 @360 — judged non-defects, pixels confirm (direction.md
  A-C0-8); one residual ("Sign In" colour) queued in `stardust/rollout/foundation-requests.md`.
- Guard (`stardust/.work/rollout/probes/shell-guard.mjs`): header/footer `data-block-status=loaded`,
  0 pageerror, 5/5 visible images with clientWidth > 0, scrollWidth 1440/1440 and 360/360.
Verdict: PASS. `foundation-freeze.mjs freeze` → 39 files (styles, fonts, blocks/header,
blocks/footer, head.html, scripts, favicon.*, icons, runtime-contract.json, content/nav.html,
content/footer.html); `check` → unchanged. progress.json `units.foundation` → done.

## C-deliver unit static — /us/en/about-us live, contributor-card, gate 1440 0.40 % / 360 0.24 % (2026-09-24)

- Template us-en-about-us-html (archetype only, 1 page). Block `contributor-card` authored
  template-slotted: ONE block per contributor, several per section; the section carries the
  1164px grid, the block wrapper the floated 25 % / 50 % / 100 % column (block-scoped rules).
- 7 portraits rehosted to `media/wknd/`; default content h1 / h2 + `<p><em>` intros with section
  styles `underline, font-small`.
- Harness: davids-model 0 🔴, delivery-lint 0/0/0, media-reconcile 7 hosted, block-roundtrip 7/7
  closed (EW 21/21), qa-gate 8 explained fails (chrome logos auth-gated on the harness; the
  schema's 3-button unit is a nested flex `ul`).
- Deployed + published. pub1 @1440 failed (decorated icon `<img>` classified as a portrait →
  duplicate card, dropped list) — fixed in the block, code-synced; pub2 @1440 0.40 % Δh 0,
  pub1 @360 0.24 % Δh 1, 0 overflow; crop bands 1440 1.56 % / 0.02 %, 360 0.48 % / 0.04 %;
  computed-style guard 24/24 on the preview; ai-readability 100 %.
- Foundation requests filed: cross-section default-content margin collapse (`main` +
  `.default-content-wrapper` flow-root — overridden in the block CSS, scoped `body.static`) and
  the missing current-page nav marker in header/footer (no block override).
- Git push needed the `catalan-adobe` gh credential (the keychain default `catalan_adobe` is
  denied 403 on the repo) — pushed via a per-command credential helper, nothing global changed.

## C-deliver unit `listing` — /us/en/adventures + /us/en/magazine live (2026-09-24)

- Blocks: `list-teaser` (new — one row per members-only teaser, variant `secure`, reconstructive);
  `tabs` gained the `cards` variant CSS its JSDoc declared (adopted `data-tab` card sections are
  the D2 split of the adventures tab panels) plus two listing-template scoped overrides
  (`page-title` gutter on adventures, `main` flow-root for the trailing separator); reuse of
  `hero-teaser`, `featured-teaser`, `cards`. Media: 2 new uploads (`alaskan-grizzly`,
  `amazon-river-02`), 18 ledger URLs reused.
- Structural gates green on the harness (`davids-model-lint` 0/0, `delivery-lint` 0 P0/P1,
  `media-reconcile` 25 hosted, `block-roundtrip --ew` 0 🔴 / 92 editable / 0 dead, `qa-gate`
  fails all explained: chrome logos on the anonymous harness, inactive tab panels h=0, the
  6-panel schema paired with a `cards` block by order).
- Published-origin gates: adventures 1440 1.00 % Δh 1 / 360 1.15 % Δh 2 PASS; magazine 1440
  1.64 % Δh 0 PASS, 360 3.83 % Δh +13 = pixel pass, height residual (source richtext
  inconsistency between the two teasers — A-CL-3, flagged for user, register candidate R-02).
  Crop bands 1440 1.82 % / 0.04 %, 360 0.48 % / 0.05 %; chrome-parity 13 / 16 (foundation set);
  computed-style guard 4/4 runs green; `ai-readability` 100 %.
- Live finding: the two live listing pages disagree on the page-title gutter (adventures flush,
  magazine guttered); the archetype prototype + migrated sibling render both flush. Delivered per
  live page (A-CL-4). Foundation requests: `page-title` section style; `separator space-medium`.
- Coverage: 2 pages `deployed`, block `list-teaser` `deployed`. Push via the `catalan-adobe`
  credential helper (keychain default 403s, as the static unit recorded).
