# Group tiles: mosaic, content-tile

Owner of `blocks/mosaic/`, `blocks/content-tile/` and the transforms `mosaicCardContainer.mjs`,
`mosaicCardColor.mjs`, `mosaicCardRTE.mjs`, `mosaicCardVideoImage.mjs`, `contentTile.mjs`.
No new icon: the video cards and tiles load the `video` block (play button, poster, modal).

## mosaic

Source: `mosaicCardContainer` (19 on 10 pages), `mosaicCardColor` (24), `mosaicCardRTE` (16),
`mosaicCardVideoImage` (14). One row per card.

```html
<div class="mosaic w-8-4">
  <div>
    <div><p><a href="https://players.brightcove.net/6024607096001/k9ROJJb3q_default/index.html?videoId=6202928581001">…</a></p></div>
    <div></div>
  </div>
  <div>
    <div>#4c9ec9</div>
    <div><p>专访：…黄金签核框架</p><p><a href="/f52-synopsys-1211-02/blogs/…">阅读采访</a></p></div>
  </div>
</div>
```

| Card | Cell 1 | Cell 2 |
| --- | --- | --- |
| colour | the background colour | headline paragraph, then the footer as the card's link (`<br>` between its lines) |
| rich (`rich` variant) | `<p>#bg [#heading]</p>`, then `<p><a>url</a></p>` when the card has a link its text does not hold | the text: headings, paragraphs, lists |
| video | optional thumbnail, then the video link | the caption |
| image | the image | the caption, linked to the card's link |

- Variants: `cols-3` (4 / 4 / 4), `w-8-4`, `w-4-8` (from the `col-sm-N` of the cells), `rich`.
  No layout variant: a card on its own in a column (`/zh-cn/solutions/finfet`).
- Text colour: white on a dark background, grey `#646e81` (colour cards) or `#111c24` (rich
  text) on a light one, as the source's inline styles.
- The whole card is an `a` when it has a link; links inside it become their text.
- A card the source opens in a new tab (`data-new-tab="true"`, colour and rich cards) has its
  link end with `#_blank`; the block strips it and sets `target="_blank"`.
- A video card loads the `video` block (`modal`) in its media box. Hover: shadow 0.15 to 0.3.
- Heights 400 / 280 / 280 px (colour), 400 / 280 / auto (rich), 400 / 280 / 200 (media).
- `cardContainer` (teasers) merges `mosaicCardRTE` items into `mosaic rich cols-3`.
- A container of other components (`cards` on `/manufacturing/quantumatk/on-demand-webinars`,
  `htmlTextOnly`) merges like items with `cols-N`, else the section grid. Its `container-title`
  is a centred `title-large` section, as `cardContainer` does.

## content-tile

Source: `contentTile` (27 on 6 pages). One row per tile; neighbouring tiles merge.

```html
<div class="content-tile">
  <div>
    <div><p><img src="…/media/investor-day.jpg" alt=""></p></div>
    <div><p>Sep 30, 2026</p><p>News</p><p><a href="https://news.synopsys.com/…">Synopsys Holds 2026 Investor Day</a></p><p>By Marc Swinnen</p></div>
  </div>
</div>
```

- Cell 2: the title is the linked paragraph, else the last one. Before it: the date (has a
  digit) and the type. After it: the author. Every part is optional.
- Cell 1: image, or a video link (with an optional thumbnail): the `video` block, in the modal.
- Variant `tight`: the source's `less-padding-10` (2 tiles).
- Title and type underline on hover with or without a link (video tiles have none), as the
  source's `.component-content-tile .content-tile-title:hover`.
- From 730: image 193 x 110, date under it, type and title beside it. Below 730: full-width
  image, date on the right of the type. Title and type underline on hover; the tile is the link.
- In the newsroom's featured story (`.spotlight-container`) the desktop date is hidden, as the
  source's page style does.

## Differs from the contract

- `mosaic` variants `w-8-4`, `w-4-8` and `rich` are new: the 8 | 4 rows and the rich text cards
  have their own layout.
- Cell 1 of a rich card holds a second colour (its heading colour) and the card's link.
- Blank lines of a rich card are paragraphs of one zero-width space: the preview drops an empty
  paragraph, and the source places its "READ THE BLOG" lines with blank lines.
- `content-tile` has an author paragraph and the `tight` variant.

## Measured (region against the source), 1440 / 768 / 375, diff %

| Block | Page | Diff |
| --- | --- | --- |
| mosaic cols-3 colour | `/zh-cn/…/fusion-compiler/simply-better-ppa` | 0.01 / 1.15 / 1.03 |
| mosaic w-8-4 video + colour | same | 0.00 / 0.80 / 1.04 |
| mosaic w-8-4, w-4-8, cols-3 colour, white card | `/zh-cn/solutions/low-power-design` | 0.01 / 0.01 / 0.00 |
| mosaic rich w-8-4 | `/ja-jp/implementation-and-signoff/ams-simulation` | 1.66 / 1.56 / 8.19 |
| mosaic rich cols-3 | same | 0.28 / 0.33 / 6.56 |
| mosaic cols-3 video thumbnails | `/ja-jp/…/design-compiler-nxt` | 0.01 / 0.17 / 0.54 |
| mosaic cols-3 colour + video | `/ja-jp/implementation-and-signoff/test-automation` | 0.00 / 0.01 / 0.94 |
| mosaic image card | `/zh-cn/solutions/finfet` | 0.28 / 0.63 / 1.74 |
| content-tile image | `/newsroom` (tile 2) | 0.00 / 0.00 / 0.09 |
| content-tile in spotlight | `/newsroom` (tile 1) | 0.00 / 0.00 / 0.06 |
| content-tile author, tight | `/community/snug/snug-news` | 0.00 / 0.07 / 0.19 |
| content-tile video (in tabs) | `/ai/agentic-ai` | same box sizes 783 x 160, 381 x 160, 345 x 304.8 |

The values near 1 % at 768 and 375 are half-pixel offsets of the whole region (the page above
it). States checked with one script on both sites: card hover shadow, cursor, click target,
video card play opens the modal and Escape closes it, tile title hover underline, tile link.

## Known gaps

- Rich cards: inline font sizes (`font-size: 0.8125rem` spans) are lost, and a source `p` line
  and a source `div` line both become a paragraph (drawn as the source's `div`: body size, no
  margin). `/ja-jp/…/ams-simulation` first card is 11 px shorter below 730; two cards with
  `p` lines are 10 px off.
- `data-new-tab` (cards that open in a new tab) is not migrated: DA has no link target.
- In a `cardContainer` (polymer simulation) the source's cells have 15 px padding below 730,
  the block 10 px.
- Mosaic cards in a `contentCarousel` slide (`…/fusion-compiler/videos`,
  `/zh-cn/…/primeclosure`) are default content: the carousel transform's choice.
- The modal is 936 x 527 at 1440, the source's 906 x 510 (global's file).
