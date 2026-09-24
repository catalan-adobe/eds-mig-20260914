
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
