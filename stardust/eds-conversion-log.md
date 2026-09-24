# EDS conversion log

## C0 — foundation (2026-09-24, local unit; no DA target, stopped before PUT)

**Decode tier:** header and footer are template-slotted (fixed compositions): the canon chrome DOM
is built as empty slot containers and every authored node of the locale's `/nav` + `/footer`
document is moved in by role (EW1). The off-canvas panel carries a stripped clone of the nav
list (EW4). Search labels (nav section 3) are attribute text — declared `@ew-exempt`.

**Authoring contract:** `content/<country>/<lang>/nav.html` (brand · nav tree · search labels ·
account · language) and `…/footer.html` (brand · nav tree · Follow Us · social list · one section
per text component), 11 locales, each with a `Robots | noindex` metadata row. The blocks resolve
`/<country>/<lang>/nav|footer` from the pathname (`nav`/`footer` metadata still override; `/us/en`
is the fallback outside a locale prefix), so pages need no chrome metadata.

**Named assumptions (hands-off):**
- A-C0-1 No DA org/repo/token: logos ship from the code origin through the `:icon:` convention
  (`icons/wknd-logo-dk.svg`, `icons/wknd-logo-light.svg`, alt from the link title) instead of a
  `content.da.live` media URL; flags are decorative CSS backgrounds (`blocks/header/flags/`).
- A-C0-2 Box model follows the gated canon (content-box default, border-box per column class) —
  the deploy skill's global `border-box` reset (#106) is deliberately NOT applied: the lifted
  values (`.search-input width: calc(100% - 4rem)` + padding, column widths) were measured under
  content-box. `img { max-width: 100%; height: auto }` is kept for the pipeline's width/height
  attributes.
- A-C0-3 `--nav-height` = the live `.root` padding-top (200px ≥ 1025px, 130px below); the fixed
  header renders 194px / 117px inside it exactly as the live lift (stardust/replica/lifts/
  us-en-html-live.json). Header + footer boxes match the lift at 1440 and 360 (footer 260 / 593).
- A-C0-4 BEM class names of the canon are flattened to kebab-case (stylelint-config-standard
  `selector-class-pattern`): `nav__link` → styled through `.nav a`, `utility-bar__inner` →
  `.utility-bar-inner`, etc. Cluster agents lifting prototype CSS face the same rename.
- A-C0-5 `.eslintignore` gains `stardust` — the pipeline artifacts (prototype/migrated JS) are
  not runtime files and are already `.hlxignore`d; runtime files stay linted.
- A-C0-6 Search ships as the UI shell (field, clear button, empty results list) per
  dynamic-features-plan P1; P4 (`/query-index.json`-backed results) needs the target host.
- A-C0-7 Section styles for default content (closed set): `title-underline`, `title-right`,
  `title-white`, `text-font-small`, `separator`, `separator-space-small`, `full-bleed` (plus the
  planned full-bleed containers hero-carousel, mini-carousel, breadcrumb, teaser-hero).
- A-C0-8 Publish decision: none yet — no PUT happened; preview-only (`--no-publish`) until the
  DA target exists.

**Fonts:** Asar 400 + Source Sans Pro 300/400/600 (normal + italic), every Google-Fonts subset
self-hosted under `fonts/` (SIL OFL) + the clientlib `wknd-icon-font`; metric fallbacks computed
from the woff2 (source-sans-pro-fallback 96.46% / asar-fallback 101.54%).

**Lint:** `npm run lint` clean (stylelint `no-descending-specificity` disabled per chrome file with
justification — rules grouped by region). Token-completeness gate: only the unused boilerplate
`cards`/`hero` blocks reference `--background-color` (not added; blocks unused by the plan).

**Local asserts (harness http://localhost:3000/stardust/.work/harness/page.html):** qa-gate 10/10;
chrome EW survival 14/14 editable, 3 exempt, 0 dead/duplicated; interaction drive 15/15 (language
menu, scrolly morph, off-canvas panel + Escape, search clear) at 1440 and 360; 0 page errors.
Pixel/crop gates deferred to the published origin.

## C-deliver — locale-landing cluster (2026-09-24, local unit; no DA target, stopped before PUT)

Pages 9/9 authored: `content/{us/es,ca/fr,ch/de,ch/fr,ch/it,de/de,es/es,fr/fr,it/it}.html`
(list: `stardust/rollout/units/locale-landing.paths`). Block authored: `blocks/teaser-hero/`.

**Decode tier:** `teaser-hero` is template-slotted (schema
`stardust/eds-schema/us-es-html.json § coming-soon-hero`: 1 heading + 1 img): the authored heading
and picture are MOVED into `.teaser-content` / `.teaser-image > .image` slots (EW1/EW2), rows
order-agnostic, either slot omitted when its row is missing. D1 🟡 (single-column prose block)
is justified: the composition is bespoke — a 640px cover image with a 1136px white title box
overlapping its bottom 180px above 1165px — not default content. Shape: simple (one property
per row). Trailing separator = empty section with `style: separator` (no block).

**Named assumptions (hands-off):**
- A-LL-1 No DA org/repo: the hero image is authored as its captured source URL on wknd.site
  (public 200, `media-reconcile` → keep; the pipeline ingests external images at preview).
  When the DA target exists, `da-media-upload.mjs` rewrites it to `content.da.live` (C-final).
- A-LL-2 Metadata verbatim: `Title` = the live `<title>` (Español / Français / Deutsch /
  Italiano); no Description row — the source has none (delivery-lint clean).
- A-LL-3 The title is authored as `<h1>` (delivery-lint P0: exactly one h1; live has none, its
  teaser title is an h2) and sized `--heading-xl` in the block CSS — 36px measured on both.
- A-LL-4 Two scoped overrides ride `teaser-hero.css` (queued in `foundation-requests.md`):
  the standalone separator section is `:empty` and the foundation hides it; the foundation's
  `calc(4rem + 9px)` separator margin adds margins that collapse live (64px).

**Local asserts:** per page delivery-lint 0 P0/P1/P2 · media-reconcile 1 keep · davids-model 0 🔴
· sanitise · qa-gate 13/13 (aem-cli local render `http://localhost:3000/<path>`, footer resolved
per locale) · block-roundtrip `--map teaser-hero=section.teaser--hero --ew` 1/1 editable, 0 dead,
whole-page run closed. Boxes vs live (measure.mjs, `/us/es`): 1440 — main 200→970, content box
124/660 1192×180, title 36px, separator 138/904 1164×2, footer 1018; 360 — main 130→649.5,
separator 519.5→649.5, footer 697.5 (live 698). `npx eslint blocks/teaser-hero` + stylelint clean.
Pixel/crop gates deferred to the published origin.

## C-deliver unit `program` (2026-09-24, local unit; no DA target, stopped before PUT)

**Template:** us-en-adventures-riverside-camping-australia-html (archetype) + 31 siblings — 32 pages
(`/us/en/adventures/*`, `/ca/en/adventures/*`), page list in `stardust/rollout/units/program.paths`.
Schema per page under `stardust/eds-schema/<slug>.json` (`.blocks.json` = the qa-gate view: the
default-content `adventure-title` section and the carousel BUTTON control repeat removed — qa-gate
matches schema index → block index and would otherwise assert the facts count against the tabs).

**Blocks authored (4) and decode tiers:**
- `breadcrumb` — template-slotted; one row, one cell, one `<ol>` (the list is the editable unit,
  EW5); last item `aria-current="page"`. Variant `program-grid` (border-box rail).
  D11: no collection match (bespoke rail). Component shape: simple.
- `mini-carousel` — template-slotted chrome, one slide per row (`<p><img></p>` [+ `<p><em>`
  caption]); generated prev/next glyph buttons + indicator dots; canon.js interaction (no
  autoplay). D11 mirrors the collection `carousel` authoring (one row per slide). Shape: container.
- `content-fragment-elements` — reconstructive; container shape: single-cell rows before the facts
  = the source's display:none content-fragment title (kept for role parity, hidden in CSS), 2-cell
  rows = label | value (→ `dl > div > dt/dd`, the authored `<p>` moved inside), single-cell rows
  after = the share title. Variants `col-3` (25% grid column, floated wrapper) and `program-grid`.
  D3 🟡 ragged rows (1, 2) is the container shape — justified, not a span. The `dl` renders as a
  wrapping flex row instead of floated items: same geometry (measure.mjs Δ 0 at 1440/360, items
  keep the 332px content-box overflow with `flex-shrink: 0`).
- `tabs` — reconstructive; one row per tab, `label | fragment title | panel content` (3 cells;
  a 2-cell `label | content` row also decodes for the listing template's reuse). Labels move into
  `li[role=tab]` (not a button, EW7); panel nodes move into `.cf-body`; `<p><img>` + `<p><em>`
  → `.image` with `.image-title` (the source `.cmp-image__title`). Variant `col-9` (75% column:
  `.tabs-wrapper:has(> .col-9)` flow-root beside the floated facts wrapper).
- `title` → default content `<h1>` in the fixed-container section, section style `title-underline`.

**Section model:** the source's fixed container (title 12/12 + facts 3 + tabs 9) is ONE EDS section
holding the `<h1>` + the two blocks; the AEM grid is reproduced by wrapper rules in the two block
CSS files (facts wrapper floated at −14px / 25%+7px, tabs wrapper a flow-root with 14px left
padding). Below 1025 the non-grid pages carry section style `container-padded` (28px section
padding — the container's 14px on the column's 14px); shipped as a scoped override in
`blocks/tabs/tabs.css`, queued in `stardust/rollout/foundation-requests.md`.

**Named assumptions (hands-off):**
- A-P-1 No DA org/repo: editorial `<img src>` are the captured SOURCE URLs (`https://wknd.site/…`
  from `stardust/current/pages/<slug>.html`, 200 anonymously — `media-reconcile` keep); at PUT time
  `da-media-upload.mjs --scope program` + a src rewrite to `content.da.live` replaces them.
- A-P-2 The hidden content-fragment titles (`.cmp-contentfragment__title`, display:none live) are
  authored and hidden in block CSS — verbatim content and role parity (block-roundtrip counts them).
- A-P-3 The share widgets (`.fb-share-button`, empty Pinterest anchor) render EMPTY on live and in
  the gated prototype (third-party SDKs) — not authored; the `Share this Adventure` h5 is.
- A-P-4 `<b>`/`<i>` → `<strong>`/`<em>` (DA's inline marks); text verbatim, `&nbsp;` kept.
- A-P-5 cycling-tuscany (us + ca) "What to Bring" carries one bare `<div>` text block in the source
  RTE; authored as `<p>` (renders with paragraph type, live renders with body type) — 1 element.
- A-P-6 Internal hrefs (breadcrumb `Adventures`) authored root-relative extensionless
  (`/us/en/adventures`); no source-host hrefs remain, so `localize-links.mjs` has nothing to do.
- A-P-7 Publish decision unchanged from C0: preview-only until the DA target exists.

**Local asserts (harness http://localhost:3000/stardust/.work/harness/program.html):** qa-gate 24/24
(archetype), block-roundtrip `--ew` 4/4 blocks closed, EW 32/32 editable, 0 dead / dropped /
duplicated; ew-editability-probe `--simulate-editor` 33/33 editable, drift 0, block Δh 0; drive
(tabs click, carousel next/prev wrap, indicator click): pass, 0 page errors. measure.mjs harness vs
prototype at 1440 + 360 (h1, dl, dl > div, h5, tab panel article, footer): Δ 0 px; scrollHeight
equal at both widths. `npx eslint` + `stylelint` clean on the four blocks. Per-page chain over 32
pages: `stardust/.work/rollout/program/chain.sh` (delivery-lint → davids-model-lint → sanitise →
section-schema → build-harness → qa-gate → block-roundtrip --ew) + media-reconcile — results below.
Pixel/crop gates deferred to the published origin.
Chain result: 32/32 pages `lint:ok model:ok sanitise:ok qa:ok roundtrip:ok` (0 🔴, 0 dead / dropped /
duplicated texts); media-reconcile 154/154 images `keep` (source URLs resolve 200); the program-grid
sibling (bali-surf-camp, ca) measured against its migrated page: Δ 0 px on h1 / dl / facts / h5 /
tab panel at 1440 + 360 (the footer Δh is the harness resolving the locale chrome from its own URL,
not a page defect). `npm run lint` clean; `foundation-freeze.mjs check`: unchanged.
Not run (needs the DA target): PUT / preview / `.plain.html` checks, published-origin pixel + crop
gates, `update-coverage.mjs` rows — the unit stops at the local structural asserts.

## C-deliver unit `listing` — image-list block + 2 pages (2026-09-24, local unit; stopped before PUT)

**Pages:** `content/us/en/adventures.html` (archetype), `content/ca/en/adventures.html` (sibling; same
text, locale hrefs + image URLs from its own capture). Sections: h1 (`container-flush`) · teaser-hero
(h2 + description + image) · h2 `title-underline` + image-list · empty `separator` · metadata
(Title + Description verbatim). Authored by `stardust/.work/rollout/listing/probes/author-listing.mjs`
from `stardust/migrated/<locale>/adventures.html`.

**Block `image-list` — decode tier: reconstructive** (repeat group; schema
`stardust/eds-schema/us-en-adventures-html.json` § 3, re-sectioned by
`probes/resection-schema.mjs`: the h1-only first section → `defaultContentSections`). Container
shape classified by ROW SHAPE, never index: a single-cell text row is a tab label opening a panel;
a card row is `picture | title link | description`. `decorate()` moves every authored node
(label `<p>` → `li[role=tab]`, EW7; image `<p>` → `.image`; title `<p>` → `.title`; description
`<p>` → `.description`; EW1/EW2), generates the source's text-less image anchor from the title
href, swaps tab + panel on click (source `.cmp-tabs` behaviour), is re-entrant (EW9). Without
label rows it renders one flat list. Component shape: container. D3 🟡 ragged rows (1, 3) is that
shape — justified. Geometry from the prototype CSS: 260px cards + 14px gutter, 200px cover
images, one-line ellipsis description, tab strip = the tabs block's rules scoped to `.image-list`.

**Reuse:** `teaser-hero` (locale-landing) — additive edit: paragraphs without images move into
`.teaser-content > .teaser-description` (source `.cmp-teaser__description`, 18px / 1.75); stub
pages (heading + image only) decode exactly as before (verified on the ca-fr harness).
`tabs` (program) was NOT reused: a panel holding an image-list would need a table inside a table
cell, which DA cannot author — the listing's tabs live in the image-list block instead (A-L-1).

**Named assumptions (hands-off):**
- A-L-1 Tabs + card list = ONE `image-list` block with label rows (above); the plan's `tabs`
  reuse row for this template is satisfied structurally (tablist / tab / panel roles), not by the
  `tabs` block.
- A-L-2 Images: no DA org/repo/token — editorial `<img src>` are the captured SOURCE URLs
  (`https://wknd.site/…coreimg.jpeg/…`, 200 anonymously → media-reconcile 17 keep per page);
  `da-media-upload.mjs --scope listing` + src rewrite at PUT time.
- A-L-3 Internal card hrefs authored root-relative extensionless (`/us/en/adventures/<slug>`), as
  every other cluster does; `localize-links.mjs --check` at E2.
- A-L-4 Two scoped overrides in `image-list.css`: `main > .section.container-flush { padding: 0 }`
  (queued in `foundation-requests.md`) and the trailing `separator` section display + `4rem`
  margin (already queued by locale-landing; written WITHOUT `:empty` so it also holds on the
  harness, whose folded section keeps a whitespace text node).
- A-L-5 The teaser h2's leading space (` Experience the world with us`) is authored verbatim.

**Local asserts:** delivery-lint 0/0/0 (both) · media-reconcile 17 keep (both) · davids-model-lint
0 🔴 2 🟡 (D1 teaser-hero bespoke hero, D3 container shape) · sanitise 2 chars per page ·
qa-gate 16/16 (both; units 16 ≥ 2, full-bleed teaser-hero 1440/1440) · block-roundtrip `--ew`
teaser-hero 2/2 + image-list 71/71 editable, 0 dead, 0 duplicated, 0 structural 🔴 (the one 🟠
EXTRA is the h2 default content outside the `--map`ped prototype section) · tab click swaps
panel (Climbing → 2 cards, 1 visible panel, aria-selected) · measure.mjs harness vs migrated
@1440/@360: h1, teaser h2/description/content/img, tablist, active tab, item, img, title,
description, active panel, footer y — all Δ 0, scrollHeight Δ 0 (us; ca footer Δh is the
harness resolving locale chrome) · eslint + stylelint clean · foundation-freeze check unchanged.
Not run (needs the DA target): PUT / preview / `.plain.html` checks, published-origin pixel + crop
gates, `update-coverage.mjs` rows.

## C-deliver — article cluster (2026-09-24, local unit; no DA target, stopped before PUT)

Pages 12/12 authored: `content/{us,ca}/en/magazine/{western-australia,arctic-surfing,
guide-la-skateparks,san-diego-surf,ski-touring}.html` + `content/ca/en/magazine/members-only/
{alaskan-adventure,fly-fishing-the-amazon}.html` (list: `stardust/rollout/units/article.paths`).
Blocks authored: `content-fragment`, `text-quote`, `byline`, `sharing`, `download`, `list-upnext`;
reused: `breadcrumb` (+ `article` variant appended to its CSS: border-box rail, list
`margin-top: 1em; padding-top: 12px`). Converter: `stardust/.work/rollout/article/convert.mjs`.

**Document shape** (per page): section 1 hero `<p><picture>` · section 2 `breadcrumb article` ·
section 3 (the article; `Style | title-underline` when the page has title components):
`h1` · author `h4` · `content-fragment` (1 row: the hidden fragment `h3`) · body as DEFAULT
CONTENT (`p`, `h2`, `<p><picture>[<strong>caption</strong>]</p>`, `blockquote`) with `text-quote`
blocks in the flow · `byline` (1 row: picture | h2 + p | 3 `<p><a>`) · `h5` "Share this story" ·
`sharing [spaced]` (key-value: Facebook | page URL, Pinterest | pin URL) · `download` (guide only:
h3 link, p, `<ul><li><strong>label</strong> value</li>…</ul>`, `<p><a>`) · `list-upnext` (1 row
per article: `<p><a>title</a></p><p>date</p>`) · metadata (Title + Description verbatim).

**Decode tiers:** `content-fragment` template-slotted at SECTION level — the block becomes the
AEM `.cmp-layoutcontainer` row (`.article-layout > article.article-column (default--8) +
aside.article-sidebar (default--3 offset--1)`) and MOVES the section's wrappers whole into the
two columns (EW1/EW8): everything up to the first sidebar block wrapper (`sharing` / `download`
/ `list-upnext`, plus a heading-only default-content wrapper right before it) is the article,
the rest the aside; the hidden `h3` keeps its authored position. `text-quote`, `byline`,
`sharing`, `download` template-slotted (cells classified by content, never `rows[N]`);
`list-upnext` reconstructive (card-as-link, EW6: href read, inner anchor unwrapped). `sharing`
reabsorbs the `h5` section head above it (EW8; zero pixel change — the block otherwise renders
the SDK-drawn hosts at 0 px, as the captured source does). Schemas:
`stardust/eds-schema/{us-en-magazine-western-australia,ca-en-magazine-guide-la-skateparks,
ca-en-magazine-arctic-surfing,us-en-magazine-san-diego-surf,
ca-en-magazine-members-only-fly-fishing-the-amazon}-html.json`, re-sectioned per block
(`stardust/.work/rollout/article/probes/resection-schema.mjs` — the canon renders the page as
one `.container-fixed` section).

**Named assumptions (hands-off):**
- A-ART-1 Two-column layout: EDS sections stack, so the side rail is composed by the
  `content-fragment` block from its section's sibling wrappers (a block-level composition of
  a fixed template composition, not a foundation rule). No `styles/` edit; the section keeps
  the foundation padding and the layout row cancels it (`margin: 0 -14px`, like `contributor`).
- A-ART-2 Article body = default content (David's Model D1), not a body-in-cells block. The
  title components' underline rides the `title-underline` section style: the pages that have
  title components have NO rich-text `h2`, and the one page with rich-text `h2`s (san-diego-surf)
  has no title components, so the section style never mis-styles a heading; the article head
  (h1/h4) and any sidebar heading are excluded by a scoped override. Body `h2` top margin is
  padding (27px) because the source never lets it collapse (title `.col` BFC / the content
  fragment's empty paragraph-split grids) — measured: p→h2 40.5px, picture→h2 27px.
- A-ART-3 Captions (`.cmp-image__title`, san-diego-surf) are authored as the bold run after
  the picture in the same paragraph (source: `<img>` + `<span>` in one block); a plain-text
  quote component (arctic-surfing `.cmp-text > blockquote`) is a default-content blockquote
  (UA 40px margins + the 14px gutter, 1em margins as padding).
- A-ART-4 Images: no DA org/repo/token — authored as the captured source URLs
  (`https://wknd.site/...coreimg...`, media-reconcile `optimize`); the PDF (`download`) likewise
  keeps its source URL (PDFs never ride content.da.live). The empty `download` component on
  western-australia renders nothing on the source — not authored.
- A-ART-5 `sharing` is key-value configuration (D14): the Facebook page URL and the Pinterest
  pin URL become `data-href` / `href` on the same hosts the source has; `@ew-exempt`. The
  hidden `.cmp-separator--space-small` after it on 6 pages is the `spaced` variant (36px).
- A-ART-6 `download` property labels (the source's hidden `<dt>`) are authored as the bold run
  of each list item and hidden by CSS, so the delivered DOM carries the same text as the source
  (content-diff parity) and the visible values keep their inline layout.
- A-ART-7 The `text-quote` block is `<b>`→`<strong>`, `<i>`→`<em>`, `<u>` kept (html2md
  underline); the nested `<b><b>` of western-australia is authored once.
- A-ART-8 `davids-model-lint` 🟡 D1 on `content-fragment` (1 heading row) is justified above:
  the row is the source's hidden fragment title and the block hosts the layout.

**Local asserts** (per page, `stardust/.work/rollout/article/chain.sh`): delivery-lint 0/0/0 ·
media-reconcile 4–6 optimize · davids-model-lint 0 🔴 (2 🟡: D1 breadcrumb, D1 content-fragment)
· sanitise · qa-gate PASS (23–25 asserts; per-variant schema) · block-roundtrip `--ew` round-trip
closed on all 12 (0 🔴, dead 0, duplicated 0, exempt 4 = the sharing config cells). Boxes vs the
gated prototype (measure.mjs, 1440 + 360): h1 / h4 / blockquote / h5 / up-next links / hero img
Δ 0 px, root scrollHeight Δ 0 on us pages (ca pages Δ +29/+44 = the harness resolves the US
footer from its pathname). `npx eslint blocks` + `stylelint blocks/**/*.css` clean;
foundation-freeze check unchanged. Publish decision unchanged (A-C0-8): preview-only until the
DA target exists.

## C-deliver unit `landing` — hero-carousel + teaser-featured blocks, 2 pages (2026-09-24, local unit; stopped before PUT)

**Pages:** `content/us/en.html` (archetype `us-en-html`), `content/ca/en.html` (sibling; the migrated
`<main>` differs only in the locale prefix of its hrefs and image source URLs). Page list:
`stardust/rollout/units/landing.paths`. ENCODE: `stardust/.work/rollout/landing/probes/author-landing.mjs`
(DOM read of `stardust/migrated/<locale>.html`, text moved verbatim). Sections, in page order:
hero-carousel (full-bleed) · teaser-featured · h2 `title-underline` + image-list (4 recent articles) ·
`<p><strong><a>` All Articles · empty `style: separator` · h2 `title-underline` Next Adventures ·
teaser-hero `imagebottom` (full-bleed) · h3 + image-list (4 adventures) · All Trips · `separator` ·
metadata (Title + Description verbatim from `_meta.json`).

**Blocks authored (2) and decode tiers** (schema `stardust/eds-schema/us-en-html.json`, qa-gate view
`.blocks.json` = the 5 image-bearing block sections; `probes/schema-view.mjs`):
- `hero-carousel` — reconstructive (one row per slide, authors add/remove slides), each slide
  template-slotted: cells classified by content (the picture cell = image, the other = content:
  heading → `.teaser-content`, `<p><a>` → `.teaser-actions`, other `<p>` → `.teaser-description`).
  Generated prev/next glyph buttons (wknd-icon-font `\e90f`/`\e90e`) + indicator dots, canon.js
  interaction (wrap, indicator select). Container shape.
- `teaser-featured` — template-slotted (one row, `content | image`; the paragraph BEFORE the heading
  is the source `.cmp-teaser__pretitle`). Simple shape.
- **Reused:** `image-list` (C6, as is — flat list, no label rows), `teaser-hero` (C2) with a targeted
  extension: CTA paragraphs move into `.teaser-actions` (EW3) and variant class `imagebottom`
  (`object-position: bottom`) — appended, nothing rewritten.

**Named assumptions (hands-off):**
- A-L-1 The source landing has NO `<h1>` (every teaser title is an h2). delivery-lint's `h1` rule is
  P0 at 0, so the first carousel slide's title (" WKND Adventures") is authored as `<h1>` and sized as
  the live h2 (`--heading-xl`) in the block CSS — the same technique as C2's teaser-hero. Boxes Δ 0.
- A-L-2 Images: no DA org/repo/token, so the 13 editorial images are the captured SOURCE URLs
  (`https://wknd.site/…/_jcr_content/…`, anonymous 200 → media-reconcile `keep`); rehost via
  `da-media-upload.mjs --scope landing` when the target exists.
- A-L-3 Carousel indicators: Core Components render the slide title as hidden indicator text
  (`font-size: 0; text-indent: -3000px`) beside `aria-label="Slide N"`; the block generates the dots
  with the same `aria-label` and no text (mini-carousel precedent) — block-roundtrip reports the 3
  hidden titles as 🟡 MISSING BODY (advisory, not structural). No autoplay: the source markup carries
  `data-cmp-delay` but no `data-cmp-autoplay`, and the gated canon.js has none.
- A-L-4 The two `.cmp-button--primary` CTAs are default content `<p><strong><a>` → `a.button.primary`
  (accent) via the foundation's decorateButtons; the source `aria-label` is authored as `title`
  (kept by `a.title = a.title || a.textContent`).
- A-L-5 Teaser descriptions: slides 1–2 and the featured teaser are bare-text divs (left-aligned),
  slide 3 a `<p>` (justified by the global rule); all authored as `<p>` with `text-align: left`.
- A-L-6 Section title + image-list share one section (C6's shape); block-roundtrip's 🟠 EXTRA heading
  on `image-list[n]` is the default-content h2/h3 in the same section, not a decode defect.
- A-L-7 The empty `style: separator` sections would be hidden by the frozen `main > .section:empty`
  rule (queued by locale-landing in foundation-requests.md, not re-queued); hero-carousel.css ships
  the scoped override `main:has(> .section.hero-carousel-container) > .section.separator` (display
  flow-root, `::before` margin 4rem 0 = the live collapsed 64px). No new foundation request.

**Local asserts (harness http://localhost:3000/stardust/.work/harness/landing/{us-en,ca-en}.html and the
aem-cli render http://localhost:3000/us/en):** delivery-lint 0/0/0 · media-reconcile 13 keep (both) ·
davids-model-lint 0 🔴 0 🟡 · sanitise 3 chars · qa-gate PASS 25/25 (both pages; units 3 slides, 4 + 4
cards; full-bleed hero-carousel + teaser-hero 1440/1440) · block-roundtrip `--ew` all 5 block
instances closed, 0 structural 🔴, EW 34/34 editable, dead 0, duplicated 0 (both pages) · measure.mjs
vs prototype at 1440 / 1164 / 1024 / 768 / 767 / 360: every `main img`, `main a`, h1/h2/h3, indicator
li, control button box Δ 0 px, root scrollHeight Δ 0 (ca/en footer Δh +29/+44 = the harness
resolving the US chrome from its pathname) · carousel drive (`probes/carousel-drive.mjs`, 1440 + 360):
next ×3 wraps, prev wraps, indicator click — 5/5 steps with the active slide's heading/img/CTA boxes
equal to the prototype's, 0 page errors · `npm run lint` clean · `foundation-freeze.mjs check`
unchanged. Publish decision unchanged (A-C0-8): preview-only until the DA target exists.
Not run (needs the DA target): PUT / preview / `.plain.html` checks, published-origin pixel + crop
gates, `update-coverage.mjs` rows.

## C-deliver unit `members-only` — 1 page, block `image-list` reused (2026-09-24, local; stopped before PUT)

`content/ca/en/magazine/members-only.html`: h1 + image-list (2 cards, flat list — no label rows), both
sections `container-flush`. Decode tier: reconstructive (image-list, unchanged). Full record, assumptions
A-MO-1…4 and local asserts: `stardust/rollout/units/members-only.md`. Publish decision unchanged
(preview-only until the DA target exists).


## C-deliver unit `about` — contributor block + 2 pages (2026-09-24, local unit; stopped before PUT)

**Pages:** `content/us/en/about-us.html` (archetype), `content/ca/en/about-us.html` (sibling; the
migrated `<main>` is byte-identical, so the delivered documents are too — locale chrome resolves
from the pathname). Sections: h1 · h2 `title-underline` · p `text-font-small` · contributor(4) ·
h2 `title-underline` · p `text-font-small` · contributor(3) · metadata (Title + Description verbatim).

**Block `contributor` — decode tier: reconstructive** (repeat group; schema
`stardust/eds-schema/us-en-about-us-html.json`). Container shape, one row per card:
`picture | h3 name, h5 role, one <p><a> per social link`. `decorate()` classifies by element type
(never `rows[N]`), moves every authored node into `contributor-card > contributor-body >
contributor-{image,name,role,links}` wrappers (EW1/EW2), keeps unrecognised cell content as
`contributor-text`, and is re-entrant (EW9). Grid: `repeat(4, 1fr)` ≥1025 / 2 cols 768–1024 /
1 col ≤767 (the source's `aem-GridColumn--default--3 / --tablet--6 / --phone--12` floats); the
block's `margin: 0 -14px` restores the source's padding-less `.cmp-layout-container--fixed` row
inside the 14px-padded section (no frozen-file edit).

**Named assumptions (hands-off):**
- A-about-1 Images: no DA org/repo/token, so the 7 portraits are authored as the source's live
  URLs (`https://wknd.site/content/experience-fragments/…/*.jpeg`, anonymous 200 → media-reconcile
  `keep`; the preview ingester rehosts them at PUT). Rehost via `da-media-upload.mjs` from
  `stardust/current/assets/media/` once the target exists.
- A-about-2 Social icon-only buttons follow the frozen footer's technique: authored label kept in
  the anchor (`font-size: 0`), glyph on `a::before` keyed on the network in the link text
  (`contributor-link-{facebook,twitter,instagram}`), source `aria-label` authored as the link
  `title` (survives html2md) and copied to `aria-label` in `decorate()`. content-diff's glyph
  detector needs an empty icon-class element, so it reports 21 `MISSING ICON` here exactly as it
  does for the footer's 3 — the published-origin pixel gate judges the glyphs.
- A-about-3 `.cmp-title--black` on Stacey Roswells' role is a no-op (#202020 = `--color-fg`, the
  default heading colour) — not carried as a variant.
- A-about-4 The schema generator saw ONE 12-unit section (the canon renders every grid cell as
  `<section class="col">`); the schema was re-sectioned to the ENCODE's page sections
  (`stardust/.work/rollout/about/probes/resection-schema.mjs`: 2 block sections 4 + 3 cards, 5
  `defaultContent` sections, same 40 items). `block-roundtrip.mjs` maps one prototype `<section>`
  per block instance and so reports "7 vs 2" with index-misaligned 🔴s — not a decode defect; the
  whole-page `content-diff.mjs` is the structural proof (below).
- A-about-5 `<i>` in the source lede paragraphs is authored as `<em>` (html2md's only italic).

**Local asserts (harness http://localhost:3000/stardust/.work/harness/about-us.html):**
delivery-lint 0/0/0 · media-reconcile 7 keep · davids-model-lint 0 🔴 · sanitise 1 char (ö) ·
qa-gate 16/16 (both pages; units 4 ≥ 4, 3 ≥ 3) · ew-editability-probe 40/40 editable, 0 dead,
0 duplicated, 0 edit drift · content-diff main 40=40 text nodes, 17=17 headings, 21=21 CTAs,
2=2 body, 7=7 img, 21=21 aria-labels · measure.mjs vs prototype @1440/@360: img/h3/h5/a boxes
Δ 0 px, scrollHeight Δ 0 · `npm run lint` clean · foundation-freeze check unchanged.
Publish decision unchanged (A-C0-8): preview-only until the DA target exists.


## C-deliver unit `faqs` — accordion block + 2 pages (2026-09-24, local unit; stopped before PUT)

**Pages:** `content/us/en/faqs.html` (archetype), `content/ca/en/faqs.html` (sibling; the migrated
`<main>` is byte-identical, so the documents differ only in the lead image's per-locale source URL).
Sections mirror the prototype's five: h1 `title-underline` · picture `faq-image` · p `faq-intro` ·
accordion(7) · h3 + p `text-font-small, faq-aside` · metadata (Title + Description verbatim).
Encoder: `stardust/.work/rollout/faqs/probes/encode-faqs.mjs <locale>` (lifts every node from the
migrated main by structure — no retyped text).

**Block `accordion` — decode tier: reconstructive** (repeat group; schema
`stardust/eds-schema/us-en-faqs-html.json § faq-main`). Block-collection `accordion` model, one row
per item: `question | answer`. `decorate()` moves the question into `accordion-header >
accordion-title` (EW7: the toggle `<button>` is glyph-only, `aria-labelledby` the title, the whole
header row takes the click), the answer nodes into `accordion-panel[role=region]` (hidden at rest via
the `hidden` attribute), a single-cell row into `accordion-head`; items expand independently like the
source (`stardust/migrated/assets/us-en-faqs-html.js`); re-entrant (EW9). CSS is the prototype's
`.accordion__*` rules re-scoped: 13.333px header padding + 2px `--color-third` rule (dropped when
expanded), uppercase 16px/600 title, `\e911`/`\e910` wknd-icon-font glyphs, `.5em` panel padding
with the 0.5s fade-in, 14px/1.75 panel paragraphs.

**Named assumptions (hands-off):**
- A-faq-1 Images: no DA org/repo/token, so the lead image is authored as each page's live URL
  (`https://wknd.site/{us,ca}/en/faqs/_jcr_content/…/adobestock-277768563.jpeg`, anonymous 200,
  media-reconcile `optimize`). Rehost via `da-media-upload.mjs` once the target exists.
- A-faq-2 Page layout: the source's 8-col main + offset-1 3-col aside is a CSS grid on
  `main:has(> .section.faq-aside)` (12 tracks of `--max-width / 12` between two flexible gutters;
  main-column sections `2 / span 8`, aside `11 / span 3`, `grid-row: 1 / span 8` over
  `repeat(7, auto) minmax(0, 1fr)` so the aside never stretches a content row). Shipped inside
  `blocks/accordion/accordion.css` (fan-out rule), queued in `foundation-requests.md` to move into
  `styles/styles.css` — the accordion is the 4th section, so on the published origin the layout
  applies when its CSS loads, after first paint.
- A-faq-3 Questions are authored as `<p>` (the block-collection accordion label model), not `<h3>`:
  the prototype's question text lives in a `<span>` and block-roundtrip classifies it `eyebrow`;
  an `<h3>` renders `heading` and reports 7 ROLE SWAP 🔴 (round-trip not closed). Text verbatim;
  the source's h3 outline for the questions is not carried — reversible by authoring `<h3>` and
  accepting the tool's 🔴.
- A-faq-4 The aside's hidden separator (`separator--hidden separator--space-small`, no rule) is
  spacing only: `padding: 1em 0 0` on the `faq-aside` section (h3 at +45px like the source).
  The aside is flush (no 14px section padding) at every width, as the prototype renders it.
- A-faq-5 The contact paragraph's inline `style="text-align: left"` (not carried by DA) is the
  `faq-aside` section rule `.default-content-wrapper p { text-align: left }`; its `<br>`s are the
  source's own line breaks and stay. `<b>` → `<strong>` (html2md's only bold). The source's empty
  `<h3>&nbsp;</h3>` inside answer 2 is kept verbatim in the answer cell.
- A-faq-6 `faq-image` / `faq-intro` sections take `width: 66.6667%; margin: 0` below 1025px
  (image) and 768–1024 (intro) — the source's 2/3 grid cells.

**Local asserts (harness http://localhost:3000/stardust/.work/harness/faqs.html, faqs-ca.html):**
delivery-lint 0/0/0 both pages · media-reconcile 1 optimize · davids-model-lint 0 🔴 0 🟡 ·
sanitise 2 chars (’) · qa-gate 13/13 both pages (units 7 ≥ 4) · block-roundtrip `--blocks accordion
--ew` closed: 16=16 text nodes (7 eyebrows, 9 body), EW editable 14/14, 0 dead, 0 duplicated ·
whole-page run closed (0 structural 🔴) · measure.mjs vs prototype @1440/1024/768/360: h1, img,
intro, accordion, aside h3/p, footer Δ 0, scrollHeight Δ 0; item header 152/1023 748×49, title
165/1037, toggle glyph right edge 887 (= 900 − 13.33) · toggle probe (items 1, 2@360, 7): panel
80.5/168/105 px tall at identical tops, aria-expanded true, header border 0, second click hides;
expanded item 1 + 7: item 2 top 565.97, main 1372.4, footer top 1022.4 on both · `npx eslint
blocks/accordion` + stylelint clean (`npm run lint` shows one max-len in another cluster's
`blocks/content-fragment/content-fragment.js:36`, untouched) · foundation-freeze check unchanged
(66 files). Pixel/crop gates deferred to the published origin. Publish decision unchanged:
preview-only until the DA target exists.

## C-deliver unit `magazine-hub` — teaser-list block + 2 pages (2026-09-24, local unit; stopped before PUT)

**Pages:** `content/us/en/magazine.html` (archetype), `content/ca/en/magazine.html` (sibling; same
text, locale hrefs + image URLs from its own capture; its members-only teasers carry the linked
`Read More` CTA the capture has — the `teaser-list--linked-cta` content variant, no CSS fork).
Sections mirror the prototype's nine: h1 · teaser-featured (pretitle + h2 + description + CTA |
image) · h2 `title-underline` · image-list (5 flat card rows, no tab labels) · h2 `title-underline` ·
p (`<strong>Sign in&nbsp;</strong>…`) · empty `separator-space-medium` · teaser-list `secure` (2 rows)
· metadata (Title + Description verbatim). Encoder:
`stardust/.work/rollout/magazine-hub/probes/encode-magazine.mjs <locale>` (lifts every node from the
migrated main by structure; image `src` = the page's live source from `stardust/current/pages/`).

**Block `teaser-list` — decode tier: reconstructive** (repeat group; schema
`stardust/eds-schema/us-en-magazine-html.json § alaskan-adventure / fly-fishing-the-amazon`, qa-gate
view `.blocks.json` by `probes/blocks-view.mjs`: default-content sections removed, the two source
`.col--4` teaser sections folded into the one block they are authored as). Container shape, one row
per teaser, cells classified by CONTENT never index: the cell with a picture/img is the image; the
cell with a heading is the content (heading + description paragraphs; a link-only paragraph in it is
an action, EW3); any other cell holds the action(s) — `<p><a>` (linked) or a plain `<p>` label (the
source's signed-out "Read More" text). `decorate()` MOVES every node (EW1) into `.teaser-item >
.teaser > .teaser-content (h2, .teaser-description, .teaser-actions) + .teaser-image > .image`
(wrappers carry the classes, EW2); re-entrant (EW9). Variant `secure` = the source
`body.anonymous .cmp-teaser--secure` state (lock glyph `\e98f` badge with the accent diagonal,
`.teaser` opacity .65, grey `#ebebeb` action label). CSS = the prototype's `.col--4` /
`.teaser--list` / secure rules re-scoped; the block spans the section gutters
(`margin: 0 -14px`) so each `.teaser-item` is a border-box 1/3 column with 14px gutters (50 %
768–1024, 100 % ≤ 767) — the source grid cell.

**Reuse (no edits):** `teaser-featured` (locale-landing), `image-list` (listing) — authored in their
documented shapes; both round-trip closed on this page.

**Named assumptions (hands-off):**
- A-mag-1 Two source `.col--4` teaser sections = ONE `teaser-list` block with two rows (siblings in
  a floated grid, not stacked sections); qa-gate view folds them accordingly.
- A-mag-2 No sign-in exists in the replica, so `secure` renders the anonymous state unconditionally
  (`body.anonymous` is not modelled).
- A-mag-3 Images: no DA org/repo/token — authored as the page's live URLs (media-reconcile 8/8
  `optimize`). Rehost via `da-media-upload.mjs` once the target exists.
- A-mag-4 Section style `separator-space-medium` (2em margins) shipped as a scoped override in
  `blocks/teaser-list/teaser-list.css` (+ `display: flow-root` to escape the foundation's `:empty`
  hide); queued in `foundation-requests.md` (lands late on the published origin → CLS until moved).
- A-mag-5 CANDIDATE INCONSISTENCY-REGISTER ENTRY (main agent decides): the source's two members-only
  descriptions differ in markup — Alaskan is rich text (`<p>`, 13.5px bottom margin), Fly Fishing is
  bare text (no margin). The block models the description as a paragraph, so Fly Fishing's action
  label + image sit 13.5px lower than live (its own column only at ≥ 768; page −14px at 360 stacks).
  measure.mjs harness vs prototype: every other box Δ 0 at 1440/1024/768/360.
- A-mag-6 The featured teaser's CTA `Read More` (a `.teaser__action` link in the source) is a plain
  `<p><a>` (no strong/em → not buttonized); `teaser-featured`'s own CSS styles it as the accent pill.

**Local asserts (harness http://localhost:3000/stardust/.work/harness/magazine.html, magazine-ca.html):**
delivery-lint 0/0/0 both · davids-model-lint 0 🔴 0 🟡 both · media-reconcile 8 optimize both ·
sanitise 4 chars each · qa-gate 18/18 both (units: image-list 5 ≥ 5, teaser-list 2 ≥ 2) ·
block-roundtrip `--blocks teaser-list --ew` closed both (us: 6=6 text nodes — 2 headings, 4 eyebrows;
ca: 2 headings, 2 eyebrows, 2 CTAs; EW 6/6, 0 dead / dropped / duplicated; proto mapped to a
`.teaser-list-group` wrapper around the two source sections in `schema-src/*/magazine-rt.html`) ·
whole-page run closed both (teaser-featured 4/4, image-list 10/10, teaser-list 6/6; EW 20/20) ·
measure.mjs vs prototype @1440/1024/768/360: h1, 5×h2, 8×img, footer Δ 0 except the A-mag-5 image
(Δy −13/−14); ca `main a` (accent CTAs) Δ 0; crop-compare teaser band @1440: Alaskan column identical
(badge, label, image), Fly Fishing column = the 13px shift · `npm run lint` clean ·
`foundation-freeze.mjs check` unchanged (66 files). Pixel/crop gates deferred to the published
origin. Publish decision unchanged: preview-only until the DA target exists.
Not run (needs the DA target): PUT / preview / `.plain.html` checks, published-origin pixel + crop
gates, `update-coverage.mjs` rows.

## C-final (2026-09-24, local; no DA target)

`foundation-freeze.mjs check` → unchanged (66 files) at start. The eight queued lines in
`stardust/rollout/foundation-requests.md` applied ONCE to `styles/styles.css`, each scoped block
override deleted from its block CSS (tabs, image-list, teaser-list, teaser-hero, hero-carousel,
accordion):

- `main > .section:empty` now excludes `.separator, .separator-space-small, .separator-space-medium`
  (the pipeline folds a separator section's metadata → empty `<div class="separator">`).
- separator `::before` margins `4rem 0` / `1em 0` / `2em 0` (live margins collapse; `calc(+9px)` was
  9 px off each side); `separator-space-medium` added to the closed section-style set.
- section styles `container-flush` (`padding: 0`) and `container-padded`
  (`padding: 0 calc(2 * var(--spacing-md))` ≤ 1024) in the foundation.
- FAQ `faq-aside` / `faq-image` / `faq-intro` page-grid rules moved into styles.css (first paint).
- NOT applied — `scripts/scripts.js` hard-codes `document.documentElement.lang = 'en'` (source
  `en-US` / `en-CA` / `es-US` …): the root `scripts/` dir is outside this run's write boundary;
  kept as an open item (A-F-1).

Verification: `npm run lint` clean; `qa-gate.mjs` PASS on the aem-cli render of the 7 affected
archetypes (/us/es 13, /us/en 25, /us/en/adventures 16, /us/en/magazine 18, /us/en/faqs 13,
/ca/en/magazine/members-only 13, /us/en/adventures/climbing-new-zealand 24); `measure.mjs`
harness vs migrated prototype at 1440 + 360, `main,footer,h1`: Δ 0 on /us/es, /us/en,
/us/en/adventures, /ca/en/magazine/members-only (1440 main Δy+27/Δh−27 = harness chrome offset,
scrollHeight 0); /us/en/magazine 360 Δh −14 = magazine-hub's register candidate (Fly Fishing
description markup); /us/en/adventures/climbing-new-zealand 360 Δh −1 (fractional live height);
/us/en/faqs Δh −8/−9 at both widths — pre-existing, not from the request lines: the lead image is an
external `<img>` (wknd.site URL) the pipeline does not wrap in `<picture>`, so
`main .default-content-wrapper picture img { margin: 7px 0 }` does not apply until
`da-media-upload.mjs` rehosts it (A-F-2). `foundation-freeze.mjs freeze` re-taken (66 files).
Coverage: 17 blocks → `converted` via `update-coverage.mjs`; page rows stay `pending` (nothing PUT —
A-F-3: no `deployed` row without a preview URL). Ledger: `rollout C-deliver blocked`.
