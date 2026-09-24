# EDS conversion log — replica wknd.site/us/en → replica-wknd--eds-mig-20260914--catalan-adobe

Written by the rollout prepare step (Phase 5 handoff, 2026-09-24). Cluster and foundation
subagents append their per-section decode tiers and lint residues below their own heading.

## Target

- DA: org `catalan-adobe`, repo `eds-mig-20260914`, code branch `replica-wknd`.
- Preview `https://replica-wknd--eds-mig-20260914--catalan-adobe.aem.page`,
  live `https://replica-wknd--eds-mig-20260914--catalan-adobe.aem.live`.
- Runtime contract: `stardust/runtime-contract.json` (vanilla EDS, `formatted-only`
  buttonization in `p.button-wrapper`, Trusted Types default policy installed by `scripts.js`,
  `/nav` + `/footer` chrome documents, `emptySectionCollapse: true`).

## Publish decision — PUBLISH (POST /live per page)

Decided hands-off at prepare time, once, for the whole rollout: every page, `/nav` and
`/footer` go PUT → preview → **live**. Rationale: rollout Phase D verifies the LIVE origin
(`assemble.mjs --verify-origin …aem.live`, the root `/` check, the served sitemap) and the
header/footer blocks build from the `/nav` and `/footer` documents on the live tree; the
final source-fidelity gate is judged on the published origin. Staying preview-only would
leave D-site with nothing to verify. `deploy-batch.mjs` therefore runs WITHOUT
`--no-publish`.

**Pre-existing DA content (assumption A-RO-1, direction.md).** The DA repo already holds
documents from an earlier, unrelated deploy in this repo (root-level `/about.html`,
`/footer.html`, …). Our page tree lives under `/us/en/…`; the chrome documents are `/nav`
and `/footer` at the root. Overwriting the root `/nav` and `/footer` is accepted; the other
foreign root documents are left untouched (they are not in coverage and are not published
by us). D-site's sitemap verification compares against coverage rows, so a foreign
document still published from the earlier deploy shows up there as an "extra path" — the
D-site agent lists and unpublishes (or `noindex`es) such rows, never our pages.

## Locked block names (Phase B, deploy § 2) — LOCKED, do not rename

| sidecar module id | edsBlockName | kind | collection pattern (D11) | converted by | reused by |
|---|---|---|---|---|---|
| hero-carousel | `hero-carousel` | block | carousel content model (1 row per slide: image \| text with h1/h2 + p + CTA) | landing (us-en-html) | — |
| featured-teaser | `featured-teaser` | block | none — WKND teaser (1 row: image \| text) | landing | listing (magazine) |
| hero-teaser | `hero-teaser` | block; variant `image-bottom` on landing | none — full-bleed teaser | landing | listing (adventures) |
| image-list | `cards` | block (overwrites the stock `blocks/cards/`) | cards (1 row per card: image \| link title + description) | landing | listing (adventures tabs panels, magazine) |
| list-teaser | `list-teaser` | block | none — 3-col secure teasers | listing (magazine) | — |
| tabs | `tabs` | block; variant `cards` for panels that hold a card list | tabs (1 row per tab: title \| content) | program (climbing-new-zealand) | listing (adventures) |
| mini-carousel | `mini-carousel` | block | carousel content model, image-only slides | program | — |
| trip-facts | `trip-facts` | block | none — 1 row per fact: label \| value | program | — |
| sharing | `default-content` (omitted) | not a block | empty `fb-share-button` + empty Pinterest anchor; no CSS, zero rendered pixels in the gated prototypes (A-RO-4) | — | — |
| content-fragment | `article-body` | block | none — article prose stream (h1, h4 byline, h3, captioned images, h2/p) | article (san-diego-surf) | article siblings |
| contributor-byline | `contributor-byline` | block | none — byline image + name + occupations + social buttons | article | article siblings |
| upnext-list | `upnext-list` | block | none — sidebar list of article links + dates | article | article siblings |
| download | `download` | block | none — PDF title link + description + `dl` properties; the PDF is served root-relative from the code origin (never `content.da.live`) | article (guide-la-skateparks) | — |
| contributor-card | `contributor-card` | block | none — about-us contributor rows | static (about-us) | — |
| accordion | `accordion` | block | accordion (1 row per item: title \| panel) | unique (faqs) | — |

Default content (not blocks, D1): page titles (`h1.page-title`), section titles with the
accent underline (h2 + section style `underline`), breadcrumbs (`ol` of links + section style
`breadcrumb`), separators (`<hr>`), body text (`text--font-small` → section style
`font-small`), button lists (`strong`/`em` links → `p.button-wrapper` buttons; icon buttons
carry `span.icon.icon-<name>`). Their CSS is FOUNDATION scope (`styles/styles.css`).

Two triage questions per section (D1 block-or-not, D11 collection pattern) are answered
in the table above; the decode tier per section (template-slotted / reconstructive) is
recorded by each cluster below.

## Foundation (C0) — appended by the foundation subagent

## Landing cluster — appended by its subagent

Page `us-en-html` → `/us/en` (archetype, template us-en-html). Schema
`stardust/eds-schema/us-en-html.json` (10 sections). Media: 13 editorial images rehosted to
`media/wknd/` (`da-media-upload.mjs --manifest`, source fetch 200, plain technique).

| section (schema) | authored as | block | decode tier |
|---|---|---|---|
| hero | 3 rows: image \| h1/h2 + p + `<strong><a>` (section style `flush`) | `hero-carousel` | reconstructive (one slide per row; heading-boundary fallback) |
| featured-article | 1 row: image \| `<p><strong>` eyebrow + h2 + p + CTA | `featured-teaser` | template-slotted |
| recent-articles-title / destinations-title | default content h2 (`underline`) / h3 | — (D1) | — |
| recent-articles / destinations | 4 rows: image \| `<p><a>` title + p | `cards` (stock block replaced) | reconstructive (one card per row; media-boundary fallback) |
| all-articles-cta / all-trips-cta | default content `<p><strong><a>` → foundation button | — (D1) | — |
| separators | empty section, style `separator` | — (D1) | — |
| next-adventures-title + next-adventure | ONE section: default-content h2 + block, styles `flush, underline` | `hero-teaser` (variant `image-bottom`) | template-slotted |

Decisions (hands-off, recorded in direction.md): carousel controls carry aria-labels and
icon-font glyphs, no DOM words (#100) — the live "Previous"/"Next"/indicator texts are
`display:none`/`font-size:0`, so 0 rendered pixels (round-trip 🟡 MISSING BODY ×5 accepted);
the "Next Adventures" title shares the hero-teaser section so its 27px top margin cannot
collapse into the separator's 4rem (live `.column` floats are BFCs) — block CSS scopes
`main .section.hero-teaser-container .default-content-wrapper` (flow-root, container width)
and cancels the `underline` ::after on the block's own heading; foundation request filed
(`main .section.separator { display: flow-root }` or padding) for every other template.
Every block is `display: flow-root` for the same reason. R-01 applied in hero-carousel CSS
(h1 at `--heading-xl`).

Gates (harness, structural): `davids-model-lint` 0 🔴 / 0 🟡; `delivery-lint` 0 P0 · 0 P1 · 4 P2
(cross-origin-optimize advisories — this cards block does not call createOptimizedPicture);
`media-reconcile` 13 hosted; `block-roundtrip --ew` (maps: `section.carousel--hero`,
`section.teaser--featured`, `section:has(> .card-list)`, `section.teaser--hero`) 0 🔴,
EW 33/33 editable, 0 dead, 0 duplicated; `qa-gate` 20 ok / 3 warn / 2 fail — both fails
explained: the 2 "broken images" are the frozen header/footer logos on `preview.da.live`
(auth-gated for the anonymous harness, fine on the preview origin) and the schema→block
order heuristic paired `recent-articles` with `hero-teaser` (round-trip proves 4/4 cards in
both cards instances). Lint: eslint 0, stylelint 0 on the four blocks.

Published-origin gate (preview URL, `gate.sh --full`, live capture cached, 4 rounds):
pub1 1440 10.23 % Δh −54 / 360 19.87 % Δh −95 → three lifts the harness could not show —
(1) live images are inline `<img>` inside a block `div.image`, so every image line box carries
a 7px baseline descender (cards 4×7, hero + featured + hero-teaser at 360): `<picture>` now
plays the block box and the `<img>` stays inline; (2) `main`'s last section margin collapsed
into `footer .footer { margin-top: 3rem }` (−48px; live `.page-main`/`.site-footer` are floats):
`main:has(> .section.hero-carousel-container) { display: flow-root }` in hero-carousel.css +
foundation request; (3) the carousel controls: the UA-font buttons (13.333px/normal, 1px 6px)
and the inner `.hero-carousel-inner { margin-bottom: 4em }` box so the floated controls hang
below it as on live (+10px). pub3 found the desktop hero image at its intrinsic 810px: live
L367 sizes the INNER `.image` box to 640px too — a definite height the img's `height: 100%`
can resolve against (flex-basis 0 % leaves the flex item indefinite) — restored on `picture`.
**pub4: 1440 2.00 % Δh 2px, 360 2.41 % Δh 3px, 0 overflow → PASS**; crop bands 1440 header
0.09 % / footer 0.02 %, 360 header 0.48 % / footer 0.89 % (bar 2 %); chrome-parity 25 = the
foundation's justified set (A-C0-8: "Sign In" colour queued, icon-link names) + footer Δy −2px
(= the two 1px separators, request filed); content-diff 13 🔴 — 9 in chrome (foundation set),
4 in main: "San Diego Surf Spots" ROLE SWAP / MISSING CTA (the dropped hidden indicator text,
A-C1-1 — the card link is present, extensionless) and the two `aria-label`s on the All
Articles / All Trips buttons ("read our articles", "explore our adventures") — DA strips
`aria-*` from authored anchors; the visible text stays descriptive — accepted residual.
Computed-style guard 1440 + 360: 12 sections, 5 blocks flex, 16 visible images loaded,
0 pageerror. Carousel driven on the preview: next/prev/dot move the active slide, 1 visible.
`.plain.html`: 200, 1 h1, 0 about:error, 0 /img/, 13 `<picture>`/alt. `ai-readability`
strict 100 % / code 100 %. Published (POST /live 200, aem.live 200).

## Program cluster — appended by its subagent

Template `us-en-adventures-climbing-new-zealand-html` (archetype) + 15 siblings → 16 pages under
`/us/en/adventures/<slug>`. Schema `stardust/eds-schema/us-en-adventures-climbing-new-zealand-html.json`
(5 sections). Media: 74 editorial images rehosted to `media/wknd/` (`da-media-upload.mjs --manifest`,
source fetch 200, headless technique; 4 same-asset name collisions = one upload each).

| section (schema) | authored as | block | decode tier |
|---|---|---|---|
| breadcrumb | default content `<ul>` (link + current), section style `breadcrumb`; `body.program` via metadata `template` | — (D1) | — |
| gallery | 1 row per slide: image (alt = caption); section style `flush` | `mini-carousel` | reconstructive (one slide per authored image) |
| program-headline | default content `<h1>` inside the `program-layout` section (foundation grid 25/75 places the two blocks) | — (D1) | — |
| trip-facts | leading row `<h3>` fragment title (hidden, A-PR-1) · 6 rows label \| value · trailing row `<h5>Share this Adventure</h5>` (A-PR-2) | `trip-facts` | reconstructive (one item per two-cell row; single-cell rows = title / aside prose) |
| trip-details | variant `tabs fragment`; 1 row per tab: title \| `<h3>` fragment title + prose (h2 `<strong>`, `<p><img>` (+caption text), p, ul) | `tabs` | reconstructive (one tab per row; empty content cell → adopts `data-tab` sections and `loadBlock`s them — the D2 path for the listing's card panels) |

Lint: `davids-model-lint` 0 🔴 / 2 🟡 ×16 — D1 "mini-carousel holds only images" (a genuine
carousel widget) and D3 "trip-facts rows have 2 and 1 cells" (documented shape: single-cell rows
are the hidden title / sidebar prose, never spans); `delivery-lint` 0 P0 · 0 P1 · 0 P2 ×16;
`media-reconcile` 75 hosted; `sanitise.js` per file. Boilerplate lint: eslint 0, stylelint 0 on
the three blocks. Publish decision: publish (POST /live, aem.live 200).

Harness (structural): archetype `block-roundtrip --ew` (maps `section.carousel--mini`,
`.program-facts`, `.program-tabs`) 0 🔴, EW 30/30 editable, 0 dead, 0 duplicated (2 🟡 MISSING
BODY = the hidden "Previous"/"Next" control words, A-C1-1); `qa-gate` 16 ok / 3 warn / 2 fail
×16 — fails are the auth-gated chrome logos and the schema→block order pairing (A-PR-4);
`ew-editability-probe` exit 0 ×16 (0 dead, 0 duplicated).

Published-origin gate (preview URL, `gate.sh --full`, main `header + main`): pub1 1440 9.51 % /
360 10.82 % (hot band y 0–500) → the breadcrumb list rode a block instead of live's inline-block
nav (page shifted 5/7 px) → scoped override + request; pub2 1440 1.26 % / 360 2.32 %, Δh 0;
current-section nav state added (header accent / footer underline, request filed) → **pub3 1440
0.80 % Δh 0, 360 2.32 % Δh 0, 0 overflow → PASS**. Sibling `surf-camp-costa-rica` pub1 1440
0.06 % Δh 0 / 360 0.48 % Δh 1. Crop bands: 1440 header 0.09 % / footer 0.31 %; 360 header 0.53 %
/ footer 0.01 % (`--y-b` +1, the build footer sits 1 px lower). chrome-parity 11 @1440 / 15 @360 =
the foundation's justified set (A-C0-8: fixed→static reservation, "Sign In" colour queued, rehosted
logo signatures, social icon names). content-diff 9 🔴 — all in chrome (the same foundation set),
0 in main. Computed-style guard 1440 + 360: 4 sections, 3 blocks flow-root, 8 visible images,
0 pageerror. Drive on the preview: tab click / ArrowRight switch the active panel (1 visible),
carousel next / dot move the active slide, hidden titles display:none, 6 fact items.
`.plain.html` ×16: 200, 1 h1, 0 about:error, 0 /img/, `<picture>` count = authored `<img>` count.
`ai-readability` ×16 strict 100 % / code 100 %.

Residuals: the 1 px footer offset at 360 (sub-pixel margins); two foundation requests (breadcrumb
baseline, current-section nav state) carried as `body.program` overrides in mini-carousel.css
until C-final.

## Article cluster — appended by its subagent

## Listing cluster — appended by its subagent

## Static cluster — appended by its subagent

Page `us-en-about-us-html` → `/us/en/about-us` (archetype, template us-en-about-us-html, the
only page of the cluster). Schema `stardust/eds-schema/us-en-about-us-html.json` (10 sections:
headline, contributors, 4 × column, guides, 3 × column). Media: 7 contributor portraits rehosted
to `media/wknd/` (`da-media-upload.mjs --manifest`, source fetch 200, plain technique); the
source's `alt=""` portraits are authored with the contributor's name as alt (non-visible,
recorded in direction.md). Publish decision: publish (the landing unit's decision, unchanged).

| section (schema) | authored as | block | decode tier |
|---|---|---|---|
| headline | default content h1 (own section) | — (D1) | — |
| contributors / guides | default content h2 + `<p><em>` intro, section style `underline, font-small` | — (D1) | — |
| column × 7 (contributor) | ONE block per contributor, one row: portrait \| h3 name + h5 role + `<ul>` of 3 icon links (`:facebook:` / `:twitter:` / `:instagram:`, source `aria-label` carried as `title`) — 4 blocks in the contributors section, 3 in the guides section | `contributor-card` | template-slotted (the source is one experience fragment per person; a multi-row block degrades to stacked cards, DA-flattened rows segment on the portrait / name boundary) |

Layout: the section carries the source `.container` (1164px, flow-root) and every
`.contributor-card-wrapper` the floated `.column` (25 % / 50 % ≤ 1024 / 100 % ≤ 767, 0 14px
gutters) — both scoped through `main .section.contributor-card-container` in the block CSS.
`body.static > main` and `body.static main .section > .default-content-wrapper` are
`flow-root` in the block CSS (live `.page-main` and every `.column` are floats — the h1 → h2 gap
is 13.5 + 27 = 40.5px, never a collapsed 27px); foundation request filed. Social icons: the
foundation's `/icons/*.svg` (filled #202020) painted `--color-fg-inverse` with
`filter: invert(1) brightness(1.05)` (#eaeaea vs #ebebeb) on the dark secondary square.

Gates (harness, structural): `davids-model-lint` 0 🔴 / 0 🟡; `delivery-lint` 0 P0 · 0 P1 · 0 P2;
`media-reconcile` 7 hosted; `block-roundtrip --ew --map contributor-card=section.contributor`
7/7 instances closed, 0 🔴, EW 21/21 editable, 0 dead, 0 duplicated; `qa-gate` 23 ok / 8 fail —
all explained: 2 "broken images" = the frozen chrome logos on `content.da.live` (auth-gated for
the anonymous harness, as on landing), 7 × "units column renders ≥3" = the schema's repeat unit
is the 3-button social row (`DIV.button`), a `ul` nested below the block's flex box that the
grid/flex-child heuristic cannot see — the round-trip proves 3/3 CTAs per instance. Lint
(`eslint blocks/contributor-card` + `stylelint`) 0 hits.

## Unique cluster — appended by its subagent

Page `us-en-faqs-html` → `/us/en/faqs` (archetype, template us-en-faqs-html, the only page of
the cluster). Schema `stardust/eds-schema/us-en-faqs-html.json` (2 sections: faq — h1, image,
intro, 7 × `DIV.accordion__item`; need-more-help — h3 + small text with two `#` links). Media:
the FAQ image (`adobestock-277768563.jpeg`, 1447×964) is byte-identical to the program
cluster's carousel upload (`cmp` against `stardust/.work/deploy/media/program/…`, 93 276 B) —
the existing `media/wknd/adobestock-277768563.jpeg` ledger URL is authored, no second upload.
Publish decision: publish (the landing unit's decision, unchanged).

| section (schema) | authored as | block | decode tier |
|---|---|---|---|
| faq head (h1 / image / intro) | default content in the SAME section, before the block | — (D1) | — |
| faq items × 7 | ONE block, one row per item: question `<p>` \| answer `<p>`(s) — `<b>` → `<strong>` | `accordion` | reconstructive (D5 accordion shape; single-cell rows segment on headings, extra cells fold into the panel) |
| need-more-help (aside) | default content in the SAME section, after the block: h3 + `<p>` with `<br>`s | — (D1) | — |

Layout: the section carries style `article-layout` (the foundation's 2/3 + 1/12 gap + 1/4 grid
above 1024px, the same aem-Grid 8 / offset-1 / 3 model as the source); the block CSS places
the wrapper AFTER the accordion (the aside) in grid column 2 (`.accordion-wrapper ~
.default-content-wrapper`), gives the head elements and the block wrapper the source's
0 14px `.column` gutters (the aside has none on the source), draws the h1 underline
(cmp-title--underline) and paints the aside copy `font-small` + `text-align: left` (the
source paragraph's inline style, which DA strips). Both default-content wrappers are
`flow-root` (the source columns are floats). Tablet / phone widths (image 8/12, intro 8/12 on
tablet) ride `p:has(picture)` / descendant `p` rules on the head wrapper.

Accordion decode (EW7): the question moves into `div.accordion-title` (inline, `role="heading"
aria-level="3"` — the source's `h3.accordion__header > button > span`), the header row takes
the click, a chevron-only `<button>` (`aria-labelledby` the title, `aria-controls` the panel)
floats right; panels use `hidden` + the source's `fadeIn .5s`. The header keeps the source's
UA button box (Arial 13.333px strut, `padding: 1em` → 13.3333px, black) so the 16px uppercase
question sits in the same line box. The block is a single-column grid (`minmax(0, 1fr)`), one
grid child per item.

Decisions: (1) questions authored as `<p>`, not `<h3>` — the shared role classifier reads the
source question as an eyebrow (uppercase 16px span), an authored `<h3>` reads as a heading and
the round-trip reports 7 ROLE SWAPs; the wrapper's ARIA heading role keeps the outline for AT.
(2) The source's empty `<h3>&nbsp;</h3>` at the end of panel 2 is dropped (whitespace-only
content never survives the pipeline; the panel is collapsed at rest — the expanded panel 2 is
one empty heading line shorter than live). (3) `href="#"` phone / e-mail links kept verbatim.

Gates (harness, structural): `localize-links --check` PASS; `davids-model-lint` 0 🔴 / 0 🟡;
`delivery-lint` 0 P0 · 0 P1 · 0 P2; `media-reconcile` 1 hosted; `sanitise` 2 chars;
`block-roundtrip --ew --map 'accordion=main .container--fixed'` (the section = both prototype
data-sections) closed — proto 22 / EDS 22 text nodes, 2 headings, 7 eyebrows, 2 CTAs, 11 body,
1 img each side, EW 18/18 editable, 0 dead, 0 duplicated; `qa-gate` 12 ok / 1 fail — the fail is
the 2 frozen chrome logos on the auth-gated `preview.da.live` host (anonymous harness), listed
by `stardust/.work/deploy/probes/broken-images.mjs`; units 7/7 rendered. Lint: `eslint
blocks/accordion` + `stylelint` 0 hits.

## Lint environment (prepare finding, 2026-09-24)

- `npm run lint:css` passes on the stock tree. `npm run lint:js` (`eslint .`) could not load
  `@babel/core` — the peer of `@babel/eslint-parser` is in `package-lock.json` (7.24.7) but
  absent from `node_modules/`, and `npm install` is forbidden in this run (it prunes the
  `--no-save` gate deps). Workaround in place for every agent, machine-local and gitignored:
  `NODE_PATH="$PWD/stardust/.work/lint-babel/node_modules" npm run lint:js`
  (`@babel/core@7.24.7` installed under that separate prefix; the project `node_modules/` was
  not touched).
- With the parser loading, `eslint .` reports 92 errors / 51 warnings — ALL under `stardust/`
  (`prototypes/*.js`, `migrated/assets/*.js`, `scripts/deploy/sanitise.js`), 0 in
  `blocks/`, `scripts/`, `styles/`. `stardust/` is already in `.hlxignore` (never served) and
  is frozen design evidence, not runtime code: the FOUNDATION unit (the only unit allowed to
  touch project-root files) adds `stardust/` to `.eslintignore` — this is not the forbidden
  "ignore for runtime files". Until then, clusters lint their own files by path:
  `npx eslint blocks/<name>` + `npx stylelint "blocks/<name>/*.css"`.

## C0 foundation — decode tiers and foundation vocabulary (2026-09-24)

- header, footer: template-slotted (chrome). Authored documents `/nav` (brand / sections / tools)
  and `/footer` (logo / nav / heading / social list / text), both `Robots | noindex`, published.
- Fonts: Asar 400 (headings), Source Sans Pro 300/400/600 normal+italic (body), wknd-icon-font
  (block) — all self-hosted under `fonts/`, declared in `styles/fonts.css`; fallbacks
  `asar-fallback` (Georgia 95.56%) and `source-sans-pro-fallback` (Helvetica Neue 93.5%) in
  `styles/styles.css`. Licences: SIL OFL 1.1 (Google Fonts) + the site's own icon font.
- Section styles (D1 closed set): `flush`, `underline`, `font-small`, `dark`, `separator`, `spacer`,
  `breadcrumb`, `article-layout`, `program-layout`. Template body classes: `landing`, `article`,
  `program`, `static`, `unique`, `listing` (metadata `template`).
- Lint: `npm run lint` (with the `.work/lint-babel` NODE_PATH) 0 hits; `stardust/` ignored.

### Static cluster — published-origin gates (2026-09-24)

`/us/en/about-us` PUT → preview → live (`deploy-batch.mjs`, ledger `stardust/deploy/ledger-static.json`,
publish = yes). `.plain.html` 200, 1 h1, 0 about:error, 0 /img/, 7 `<picture>` + 7 alt, 21 icon
spans, 7 `contributor-card` tables, section metadata folded (`underline font-small`).
`ai-readability` strict 100 % / code 100 %. pub1 @1440 FAILED (26.47 %, Δh −292px): on the
published origin `decorateIcons` turns the social `:facebook:` spans into `<img>`, so the
`isMedia()` classifier took each `<ul>` for a portrait — a second card per block and the list
dropped (invisible on the harness, where icons stay spans). Fix: an icon `<img>` (`.closest('.icon')`)
is never media and lists are never media; lists are slotted before media. **pub2 @1440: 0.40 %,
Δh 0, overflow 0 → PASS; pub1 @360: 0.24 %, Δh 1px, overflow 0 → PASS.** `measure.mjs` live vs
build @1440: h1 / h2 / intro p / column (138,454 291×345) / portrait (202,470 164×164) / h3 / h5 /
button list (714, h66) / 48px buttons / 23×36 icon boxes identical. Crop bands: 1440 header
1.56 % / footer 0.02 %, 360 header 0.48 % / footer 0.04 % (bar 2 %). chrome-parity 13 @1440 /
16 @360 — the foundation's set (fixed header, "Sign In" colour, logo signatures, footer
social-link names) plus the current-page nav marker (header "About Us" accent background,
footer underline) → foundation request filed. `content-diff` 51 🔴 = the 21 icon links
(build text hidden by `font-size: 0`, live by `display: none` — classifier does not see the
build text; hrefs verified present 1:1 in `.plain.html`) + chrome; `visual-diff` STRETCHED
IMAGE × 5 = the round `object-fit: cover` portraits (known false-positive class). Computed-style
guard on the preview (`qa-gate.mjs` without schema): 24 ok / 0 fail — booted, 1 h1, 6 sections,
9 blocks loaded non-empty, 0 pageerror, 0 broken images; `data-block-name` on 7, button list
computes `flex`. Coverage: page deployed, block `contributor-card` deployed. No sibling (the
template has one page).
