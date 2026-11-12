# Group teasers

Block `teasers` (the source's `component-card-b` family). Transforms: `assetCard`,
`dynamicCards`, `cardContainer`, `pressRelease`, `contentTypeListing`.

## Authored model as built

A row is one item. A row with one cell that holds only a heading is the title of the list
(`cardContainer` title, `pressRelease` heading).

| Variant | Row | From |
| --- | --- | --- |
| default (flag card) | cell 1 flag, cell 2 image, or image and video link, or empty, cell 3 title, text, link | `assetCard` |
| `post` | cell 1 image, cell 2: label (`<strong>`), date, `h4` with link, authors, tags, link | `dynamicCards` |
| `featured` | as `post`. Without `cols-N` the first row is the large banner | `blogBanner` (group article) |
| `logos` | cell 1 logo, cell 2 link, then optional text paragraphs | `htmlTextOnly` (group html) |
| `news` | one cell: linked title, date | `pressRelease` |

Other classes: `cols-N`, `size-xxs` … `size-xxl` (card height from 730), `carousel`,
`limit-N`.

- Flag card title: `h4` is the source's smaller title (`text-size-smaller`, 314 of 400), `h3`
  the normal size. A card without a visible link carries its link on the title.
- A video card writes the video link in cell 2. Without a thumbnail the block reads the poster
  from Brightcove, as the source's player does.
- `post`: the photo circle is built from the authors line. An author with a page shows the
  photo of the index sheet `authors`, else the initials. An author without a link shows grey.
- `carousel`: posts slide `cols-N` per view from 730. Below 730 one card sits in the centre,
  with the edges of its neighbours, and there are no arrows. Flag cards slide one per view.

`cardContainer`:

- Cells that each hold one like item block become one block with `cols-N` and `size-*`. The
  title becomes the first row.
- Cells of default content become a `columns` block. Anything else is the section grid.
- A container is never joined with the next container. Two source containers are two blocks.
  Joined, the spacing between them and the padding of empty cells would be lost.
- An empty cell is not written. Below 730 the block adds its 30 px from `cols-N` and the card
  count.

## What differs from the contract

- `post` has two more parts than the contract's example: a label paragraph (`<strong>`, 53
  lists outside the blog) and a last paragraph with the link ("Read Article :chevron-right:").
- `limit-N`: in shared content the source lists one post more than its limit and removes the
  post of the current page in the browser. The block does the same.
- `news` is a variant of its own, for `pressRelease`: two per row with lines between.
- `carousel` is written only when the source shows more posts than fit in one view.
- A webinar card shows "On Demand" and its on-demand link text when the webinar is over. The
  source decides this in the browser. The importer writes the state at import time.
- Video links of `assetCard` name the Brightcove player of their account (`k9ROJJb3q` for
  zh-cn, `jj9Z5xaG4z`). `ctx.video()` names the English player for every account.

## Measured

Region against region, on the imported pages, at 1440 / 768 / 375. The clip is taken from a
full-page shot, so that a sticky bar does not cover it.

| Variant | Page | Diff % |
| --- | --- | --- |
| flag, `size-xxs`, title | `/videos/security-ip.html` | 0.00 / 0.02 / 0.00 |
| flag with image, `size-xs` | `/photonic-solutions/resources.html` | 0.01 / 0.01 / 0.36 |
| flag with video, `size-xxl` | `/photonic-solutions/resources.html` | 0.09 / 0.03 / 0.65 |
| flag, title, `size-lg` | `/photonic-solutions/optsim/aerospace-defense.html` | 0.04 / 0.23 / 1.01 |
| flag, video poster, zh-cn | `/zh-cn/china/events/fusion-design-platform-process-challenge.html` | 0.03 / 0.04 / 0.17 |
| flag cards in a column | `/community/snug/snug-silicon-valley/location-proceedings-2024.html` | 0.40 / 1.12 / 0.38 |
| flag `carousel` | `/community/snug/snug-silicon-valley/location-proceedings-2026.html` | 0.00 / 0.01 / 0.03 |
| `post carousel` | `/glossary/what-is-a-data-center.html` | 0.11 / 0.19 / 1.72 |
| `post carousel`, zh-cn | `/zh-cn/blogs/chip-design.html` | 0.51 / 0.28 / 0.16 |
| `post`, label, no authors | `/success-stories/astera-labs-accelerates-hpc-systems-time-to-market.html` | 0.02 / 0.26 / 0.83 |
| `post carousel limit-5` | `/solutions/automotive.html` | 0.06 / 0.10 / 0.01 |
| `featured`, large | `/blogs/chip-design.html` | 0.04 / 0.06 / 0.18 |
| `featured cols-4` | `/blogs/chip-design.html` | 0.04 / 0.52 / 0.62 |
| `news` | `/zh-cn/china/about-us/newsroom.html` | 0.00 / 0.00 / 0.00 |

Where a diff is above 0.5 % the box sizes are equal to 0.01 px. The block starts at another
fraction of a pixel than in the source, so text rows are drawn one pixel apart.

Whole pages (`compare.mjs --page`): `/zh-cn/blogs/chip-design.html` 0.13 / 0.17 / 0.97 %,
`/zh-cn/china/about-us/newsroom.html` 0.08 / 0.23 / 7.37 % (at 375 the footer band). On the
other four sample pages the bands with `teasers` are shifted by blocks above them
(`blog-nav`, `rail-card`, the fragment band): `trace.mjs` shows the same offset before and
inside the block.

States, one script on both sites: card hover shadow, card click, title, tag and link hover,
arrows, dots, swipe below 730, video modal with Escape, logo border on hover. All equal,
except the new tab below.

## Known gaps

- Author photos need the index sheet `authors` (group listing). It did not exist when this
  was written, so every author shows initials. With the sheet mocked from the source's photos
  the glossary carousel is at 0.01 / 0.02 / 1.61 %.
- New tab: the source opens 166 cards with an internal link in a new tab (`data-new-tab`).
  The block opens links to other sites in a new tab and internal links in the same tab.
- An empty `cardContainer` is dropped (3 pages). `/photonic-solutions/resources.html` loses
  21 px from 730 and 91 px below it.
- `logos` is measured on a draft only (`drafts/group-teasers/logos`): boxes equal to 0.01 px.
  No imported page has it until `htmlTextOnly` writes it.
- `pressRelease`: the date is formatted in the importer's time zone. Five or more releases
  are three per row in the source, two here (not in the fetched pages).
- `contentTypeListing` (1 page): heading only. Its list comes from a servlet of the source.
- A `teasers` block inside a fragment loses the band of the fragment's host section
  (`blocks/fragment/fragment.js` replaces the section).
