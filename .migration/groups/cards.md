# Group cards: the block `cards`

Owner of `blocks/cards/`, the transforms `cards.mjs` and `product-card.mjs`. Source: `cards`
(4,831 instances: 4,552 asset cards of which 249 with a video, 105 agenda, 89 solution, 18 event,
3 quick-task titles, 52 empty) and `product-card` (7, one page).

## Authored model as built

One row per card. The kind is a block class; no class is the asset card.

| Kind | Cell 1 | Cell 2 | Cell 3 |
| --- | --- | --- | --- |
| asset (default) | image, or empty | label, date (paragraphs before the heading), `h4` title, description, last paragraph with only a link = call to action | |
| video (a row, not a class) | thumbnail paragraph (optional), then a paragraph with the player link | as asset | |
| `solution` | image | `h4`, text, link ending with `:chevron-right:` | |
| `agenda` | date and hours (two paragraphs), or one text, or empty | type (paragraph before the heading), `h4`, speakers `<ul>` (`Name, Company`), description | line colour |
| `event` | image | `h4` name, then type, place, date paragraphs, link | |
| `quick` | image, or empty | `h4` title, `h5` subtitle, `h4` heading, text | |

```html
<div class="cards cols-3 carousel">
  <div>
    <div><p><img src="…/media/thumb.jpg" alt=""></p><p><a href="https://players.brightcove.net/5748441669001/rka4xWwYG_default/index.html?videoId=6379238357112">https://players.brightcove.net/…</a></p></div>
    <div><p>Video</p><h4>Design and Verify RFICs: Part 3</h4><p>In Part 3 of this series …</p></div>
  </div>
</div>
```

- `cols-N` (1 to 4): columns from 730, one column below. Rows are in reading order at every
  width.
- `carousel`: the source's card carousel. `cols-N` cards per view from 728, 2 from 600, 1
  below; it moves by a full view. Arrows beside the cards from 730 (outside the container from
  1400), on the row of the dots below. Swipe and arrow keys come from `scripts/slider.js`.
- `carousel` with `rows`, `no-mobile` or `autoplay[-N]`: the source's content carousel. Each
  view is one row of `cols-N` cards laid out as a block without `carousel` (30 px gutter); below
  730 the row is a stack. `no-mobile`: no carousel below 730, all rows follow each other.
  `autoplay` is 6 s, `autoplay-4` is 4 s.
- `tight`: the card sat in a `cardContainer` (cells with 10 px of padding instead of 15).
- `size-xxs` … `size-xxl` on `quick`: the card height of its container, from 730.
- Line colours of `agenda`: `purple` (default), `orange`, `green`, `blue`, `teal`,
  `dark-turquoise`, `gray`, `burnt-orange`, `black`.

Behaviour:

- Asset and event cards: a click anywhere on the card follows its link; an external link opens
  in a new tab, as in the source. Hover changes the link colour only (the source has no card
  hover). A card link without a label (its text is its URL) moves into the title.
- Video card: the thumbnail is a button that opens the player (`scripts/modal.js`). Without an
  authored thumbnail (221 of 249) the block reads the poster from Brightcove's playback API, as
  the source's player does.
- Title and description share five lines: the description gets what the title leaves.
- Solution card: from 1025 px the text and the button show on hover (1 s), below they always
  show. The whole card is the link.
- Agenda card: "Read More" opens the description and the other speakers, "Read Less" closes
  it. The cards of neighbouring agenda sections get one height, as the source's script gives.
  In a column of 3, 4 or 6 twelfths (or `cols-2` … `cols-4`) the time sits above the details.
- `quick` with a single `h2` row is the title of the source's quick-task list (3, one page):
  it is drawn as a centred title without a card.

## Differs from the contract

- **No `video` class.** A video card is a row whose first cell holds a link: 50 of the 71
  blocks with a video card also hold asset cards.
- **New variants** `tight` (34 blocks) and, on `quick`, `size-*` (1): both change spacing and
  height and come from the card container.
- **New variants** `rows`, `no-mobile`, `autoplay[-N]` on `carousel`. The carousel transforms
  already write `no-mobile` and `autoplay-N`; `rows` is requested (see below). Without them a
  content carousel of cards cannot be told from a card carousel.
- **The class `carousel` is renamed to `cards-sliding` when the block loads.** The block
  `carousel` styles `.carousel …`, which also matches this variant (seen on `/zh-cn.html`).
- **Agenda** has a type paragraph before the heading (46 cards) and nine line colours.
- **Rows are never dealt into column stacks.** A block of several full rows reads row by row
  below 730. That is the source's order when the rows were several source rows (38 blocks). It
  is not when one source row had several cards in each cell (6 blocks, see gaps).
- **`product-card`** rows are `cards quick tight size-xxs cols-1`, with the title as `h4` and
  the heading as a second `h4`.

## Measured (source against http://localhost:3520, diff of the block's region)

| Variant | Page | 1440 | 768 | 375 |
| --- | --- | ---: | ---: | ---: |
| asset `cols-3` with image | `/designware-ip/…/ethernet-scale-up-networking-esun.html` | 0.15 % | 0.27 % | 0.21 % |
| asset `cols-3 carousel` with image | same page | 0.02 % | 1.79 % | 0.05 % |
| video `cols-3 carousel` (authored thumbnails) | same page | 0.00 % | 0.13 % | 0.23 % |
| asset `cols-3 carousel` without image | `/implementation-and-signoff/custom-design-platform.html` | 0.04 % | 0.01 % | 0.02 % |
| video `cols-3 carousel` (Brightcove posters) | same page | 1.22 % | 0.09 % | 0.40 % |
| `agenda` | `/events/signoff-sig.html` | 0.08 % | 0.22 % | 0.40 % |
| `solution tight cols-2` | `/community/snug/snug-taiwan.html` | 0.00 % | 0.01 % | 0.02 % |
| `event cols-2`, `event` in a 6 / 6 grid | `/community/snug.html` | 0.04 % | 0.01 % | 0.01 % |
| `solution tight` with captions, in a 4 / 4 / 4 grid | `/zh-cn/china/events.html`, as a draft with the grid request applied | 0.21 % | 0.32 % | 0.51 % |
| `quick tight size-xxs cols-1` | `/zh-cn/china/events.html` | 0.00 % | 0.00 % | 0.00 % |
| `solution cols-4`, `cols-3 carousel` | `/zh-cn.html` | 0.30 %, 0.01 % | 0.38 %, 0.01 % | 0.67 %, 0.02 % |
| `cols-4` | `/implementation-and-signoff/physical-verification/icv-cloud.html` | 0.01 % | 0.12 % | 0.04 % |
| `solution cols-2`, `cols-3` | `/zh-tw/converge.html` | 0.00 %, 0.12 % | 0.00 %, 0.22 % | 0.58 %, 0.19 % |
| `agenda cols-3`, `cols-3` without image | `/events/nvidia-gtc.html` | 0.01 %, 0.03 % | 0.03 %, 0.04 % | 0.00 %, 0.00 % |
| `carousel no-mobile autoplay-4` | `/zh-cn/designware-ip/interface-ip/secure-interfaces.html` | 0.07 % | 1.98 % | 0.44 % |

The three values above 1 % are text that lands one pixel higher: the block's own geometry is
equal to 0.01 px (measured), but the block starts at another fraction of a pixel because of
sections above it.

States, same script on both sites: carousel after "next" 0.04 / 0.01 / 0.02 %; agenda card
open 0.08 / 0.22 / 0.38 %; call-to-action hover 0.19 % (1440); solution hover 0.00 % (1440).
Checked by script on the target, not by pixels: a card click follows the link, an external
link has `target="_blank"`, 3 / 3 / 2 / 1 cards per view at 1440 / 768 / 650 / 375, next wraps
around, arrow keys and swipe move, the play button opens the Brightcove player in the modal and
Escape closes it, "Read Less" restores the card height, `no-mobile` drops the slider below 730.

Whole pages (`compare.mjs --page`, 1440 / 768 / 375): `/community/snug.html` 0.03 / 0.06 /
0.11 %, `/community/snug/snug-taiwan.html` 0.04 / 0.14 / 4.71 % (375: `columns`). The four other
sample pages differ in height above or between the card blocks (requests below); `trace.mjs`
shows the same offset before and after every card block on them.

## Requests to other owners

- `cardContainer.mjs` (teasers): the later sections of a cell get `stack` without `span-N`,
  so `scripts.js` does not build the row. `/zh-cn/china/events.html` is 1,120 px too high.
- `lib/sections.mjs` `mergeItems` (global): two neighbouring grid columns with the same block
  merge into one (`/events/nvidia-gtc.html`: cells of 2, 1, 1 cards become 2 columns).
- `column.mjs` `likeItems` (global): a row whose cells hold rows of cards must multiply the
  columns (`/solutions.html`: 2 cells of 2 cards are `cols-4`, not `cols-2`; 22 pages).
- `column.mjs`, `cardContainer.mjs` `likeItems`: do not merge cells that hold more than one
  card; use the section grid, as for cells of unequal counts (see gaps).
- `carousel.mjs`, `contentCarousel.mjs` (carousel): add `rows` to card blocks of a content
  carousel; `cols-N` of a card carousel is the cell count of the first slide's row (the source
  script), not the largest card count of a slide.
- `blocks/carousel/carousel.css` (carousel): `.carousel …` also matches the `carousel` variant
  of `teasers`, `quote` and `hero`.
- `blocks/fragment/fragment.js` (global): the host section's background and `band-*` are lost.
- `scripts/modal.js` (global): the source's video dialog has 15 px of padding.

## Known gaps

- **Arrows of a carousel inside a one-cell `column`** (a nested container in the source, as in
  the fragments of the esun page) sit 15 px further in between 730 and 1399 px. The block
  cannot see the nesting.
- **Content carousels of cards** (42: 35 `contentCarousel`, 7 `carousel` of type
  `content-carousel`) arrive as `cards carousel` and are drawn as card carousels until the
  carousel transforms add `rows`. With `rows` the 7 of type `content-carousel` keep one
  difference: their arrows sit 36 px lower than in the source from 730. Below 730 the arrows of
  a `contentCarousel` without `no-mobile` are drawn as those of a card carousel (not measured:
  no imported page has one).
- **One source row with several cards in each cell** (6 blocks: `/events/signoff-conf.html`,
  `/events/tsmc-oip-ecosystem-forum.html`, three `location-proceedings` pages) is merged into
  one block by the `column` transform. Below 730 the source shows cell after cell, the block
  row after row. Needs the importer (see requests).
- **A label without a link** (2 cards) is kept as the description text. The source prints it
  below the description box, 18 px.
- **Solution card below 375 px**: the source lifts the image by 20 % on hover. Not built.
- **Inline video cards** (4): they play in the modal, as the other 245.
- The `tooltiptext` of an agenda title: no agenda card of the fetched pages has one.
