# Group columns: columns

Owner of `blocks/columns/` and the transforms `imageTextCta.mjs`, `textImage2Column.mjs`,
`imageAndLinks.mjs`, `featuredImageTextLinks.mjs`. No new icon.

The block draws about 2,950 blocks of the imported site (counted in `M/out` on 2026-11-12):
2,475 plain rows (written by the `column` and `cardContainer` transforms), 338 `media`,
126 `media narrow`, 17 `media card`. The `tabs` block builds it too, for rows inside a panel.

## The authored model

One row is one source row. Cells lie side by side from 730 on the source's 12 columns with a
30 px gutter, and are stacked below 730.

### Plain rows (`column`, `cardContainer`)

Each cell is the default content of one source component and gets the global look of default
content. The block reads the kind of a cell from its content:

| Cell | Kind |
| --- | --- |
| `h2` first, then text and buttons | `text`: the `h2` is the title (size and colour from the section) |
| only images | `image`: the image fills the cell. A linked image is the image paragraph and a paragraph with its URL |
| images, then text | an `image` above a `text`: the body keeps its top margin (24 px, 16 px below 730) |
| `ul` of plain links, optional `h5` | `pageList` |
| paragraph of icon links | `socialLinks` |
| `ul` of `:download:` links, optional heading | `downloads` |

```html
<div class="columns w-4-8 divider">
  <div>
    <div><p><img src="…/media/chip.jpg" alt="Chip"></p></div>
    <div><h2>Resource Library</h2><p>Explore success stories.</p><p><a href="/f52-synopsys-1211-02/resources">Discover More :chevron-right:</a></p></div>
  </div>
</div>
```

- Widths: `w-3-9`, `w-9-3`, `w-4-8`, `w-8-4`. Without one the cells are equal. `cols-N` sets
  the count when a row has fewer cells than columns.
- `divider`: a 1 px line between the cells, 30 px wide in total, as high as the source's cells
  (with the section's `top-*` and `bottom-*`).
- `tight`: the cells of a `cardContainer`: 10 px of padding from 730 (20 px gutter, 5 px wider
  than the container on each side), 15 px below. **No transform writes it yet.**
- `image-pad-sm`, `-md`, `-lg`: the source's `horizontal-padding-*` of an `image` (5, 25,
  100 px on each side), for the images of the row. The block reads it as a variant and as the
  section style of the same name. **`column` does not write it for rows inside a cell yet.**
- Section styles that the block reads: `title-small`, `title-large`, `title-dark`, `center`,
  `right`, `rich-text`, `no-title`, `top-*`, `bottom-*` (the gap between stacked cells).
- An empty cell keeps its column.

### `media` (`imageTextCta`, 538)

One row. The cell order is the side from 730 (`mediatext`, `textmedia`). Below 730 the media
is always under the text, as in the source.

```html
<div class="columns media">
  <div>
    <div><img src="…/media/infographic.jpg" alt=""></div>
    <div>
      <h2>AI Chip Development Infographic</h2>
      <h3>Optional subtitle</h3>
      <p>Discover the future of AI chip design.</p>
      <p><strong><a href="https://www.synopsys.com/content/dam/x.pdf">Download :chevron-right:</a></strong></p>
    </div>
  </div>
</div>
```

- Media cell: an image, or a video as an optional poster paragraph and a paragraph with the
  player link. The block builds a `video` block in the cell (its look is the media group's).
- Text cell: `h2` title, `h3` subtitle, body, buttons.
- One cell with text only: the source's `component-no-media` (102), full width. An empty media
  cell beside the text (9): the text keeps its half.
- Section styles: `title-small`, `title-large`, `title-dark`, `buttons-center`,
  `buttons-right`, background and spacing.

| Variant | Source | Blocks |
| --- | --- | ---: |
| `video-modal` | `data-mode="modal"`: the video opens in the modal | 45 |
| `subtitle-purple` | a subtitle without a colour of its own | 8 |
| `blank-before`, `blank-after` | an empty paragraph at the start or the end of the text: one line and its margin (35.6 px). The pipeline drops empty paragraphs | 13 |
| `blank-after-2` | with `blank-after`: two empty paragraphs at the end of the text (71.2 px) | 1 |
| `title-grey`, `title-light` | title colours `#3c3c3c`, `#80539c` | 15 (cards) |

### `media narrow` (`textImage2Column`, 141)

Image 4, text 8. The text is `h4`, paragraphs, and a last paragraph with only a link.

```html
<div class="columns media narrow">
  <div>
    <div><img src="…/media/training.jpg" alt="Customer Training"></div>
    <div><h4>Customer Training</h4><p>Expert instruction.</p><p><a href="/f52-synopsys-1211-02/support/training">Learn More</a></p></div>
  </div>
</div>
```

- `w-6-6` (28) and `w-8-4` / `w-4-8` (1): the source's other widths. Text first: the source's
  `col-sm-push`.
- `svg-pad-sm`, `-md`, `-lg`: the source's `svg-padding-*` (25, 50, 100 px on each side; 1).
- With a link paragraph the whole row opens the link, as the source's `data-link`.
- Up to 730 the block has the source's own padding (30 px above, 15 px below) and the
  section's own `top-*` and `bottom-*` are 0 (`.textImage2Column > .background-component`).
  The image is first below 730.
- The title size (`title-small`, `title-large`) also moves a block without title, as in the
  source.

### `media card` (`imageAndLinks`, 17)

A white box with a shadow. Row 1 is the title (`h4`), row 2 image and text.

```html
<div class="columns media card title-light">
  <div><div><h4>Synopsys and Bosch</h4></div></div>
  <div><div><img src="…/media/bosch.jpg" alt=""></div><div><p>Bosch uses DesignWare IP.</p><p><a href="…">Read</a></p></div></div>
</div>
```

### `featuredImageTextLinks` (4)

`columns media` with one cell per row: the image, then the text. 3 have an image only, 1 is
empty and dropped.

## States

- Buttons, call-to-action links and text links: the global hover. Compared with the source on
  `media` (primary, secondary), `narrow` (link, row pointer) and `card` (link): equal.
- `media` video: click opens the modal (`video-modal`) or plays in place; Escape closes.
- New tab: a link of `imageTextCta` or `textImage2Column` with `target="_blank"` is authored
  with the hash `#_blank`; the block removes it and sets the target. A `narrow` row whose link
  opens in a new tab opens it with `window.open` on a click anywhere in the row, as the
  source's `data-new-tab`. Checked on `/ai/ai-chip-development.html` and `/support.html`.
- Stacking at 729 / 730 / 731 px: equal to the source.

## What differs from the contract, and why

- `imageAndLinks` is `columns media card`, not `columns media`: it has a title row above
  both cells and a box, which `media` cannot show.
- `textImage2Column` has `w-6-6` and `w-8-4` beside `narrow`: 29 instances are not 4 | 8.
- The variants `video-modal`, `subtitle-purple`, `blank-before`, `blank-after`, `blank-after-2`,
  `title-grey`, `title-light`, `svg-pad-*`, `image-pad-*`, `tight` are not in the contract.
  Each one is a property of the source component that no section style carries.
- A plain cell also draws the source's `downloads` (heading 20 / 20 / 26 px, not a title) and,
  up to 730, an SVG of an `image` 140 px high and centred (`.img-responsive.svg`).

## Known gaps

- 24 of the 71 pages with a new-tab link in these components were not re-imported after the
  `#_blank` change: their images are not in the cache and FETCH-STOP is set. They open the link
  in the same tab until they are imported again: 16 `/zh-cn/china/events/*`, `/academic-research`,
  `/solutions/silicon-lifecycle-management`, `/manufacturing/quantumatk/videos`, a few blogs.

- Image heights differ by up to 0.5 px: the pipeline's renditions round the aspect ratio.
- An SVG over 40 KB is a PNG after the import: in a plain cell it is full width below 731,
  not 140 px high (`/ja-jp/designware-ip/interface-ip/ethernet.html`).
- `&nbsp;` beside an inline element gets a second space from the pipeline: a line may wrap
  differently (`/support/training/self-paced.html` at 375: 25.6 px).
- A text with two empty paragraphs at its end keeps one (1 page, importer warning).
- A title colour other than `#5a2a82`, `#111c24`, `#3c3c3c`, `#80539c` is not migrated
  (importer warning; none in the fetched pages).
- Inside `floatingTabs` a `column` cell with `textImage2Column` becomes default content of
  the tab (`/events/ai-infra-summit.html`): the tabs transform, not this block.
- Rows inside the cell of another row lose the styles of their cells (469 pages, importer
  warning of `column`): spacing, `image-pad-*`, title size of single cells. The largest case
  is an image with its caption in a `9 | empty` row of an article. 426 such rows on about 170
  pages have images with one `horizontal-padding-*` (359 `lg`): without it the image is up to
  200 px too wide (`/articles/usb-ip-finfet.html`), and the 30 px under it are missing.
- `cardContainer` cells of text and images (about 30 blocks) are plain `columns` without
  `tight`: 5 px off on each side, 10 px too high.
