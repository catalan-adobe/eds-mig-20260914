# Group tabs: tabs

Owner of `blocks/tabs/` and the transform `floatingTabs.mjs`. No new icon: the block uses
`chevron-right.svg`, `link.svg`, `plus.svg` and `minus.svg` as masks.

Source: `floatingTabs` (375 on 357 pages): 322 horizontal (188 with one panel), 53 vertical,
943 panels.

## The authored model

A row is one band of a panel: `label | cell … | styles`.

- **Label** (cell 1). A row with a label starts a panel. A row with an empty label continues
  the panel above it. The tab's hash is the slug of the label; a label written as a link
  (`<a href="#opc">Mask Synthesis</a>`) sets it: more than half of the source's ids are not
  the slug of their label (`#a`, `#demo1`, `#sfbe`).
- **Cells** (cell 2 and on) lie side by side from 730, on the source's 12 columns with a 30 px
  gutter, and are stacked below. An empty cell keeps its column. A cell is the source's `text`
  (`h2` is its title, 24 px), an `image` when it holds only an image, a `richTextEditor` with
  the style `rich-text`.
- **Styles** (last cell, optional): words as in section metadata, for this row only.
  `top-xs|sm|md`, `bottom-xs|sm|md` (the source's spacing of the component, 40 px tops and
  the `site-content` bottoms below 730), `title-dark`, `title-large`, `center`, `right`, `rule`,
  `rich-text`, `image-pad-sm|md|lg`, `light-grey`, `white`, `w-3-9`, `w-9-3`, `w-4-8`, `w-8-4`,
  `divider`, `box-links`.
- **`box-links`**: the lists of links of the row are drawn as the source's `boxLink`. One list
  alone in its row: two per row. An item with a list inside opens it (plus and minus).
- **A block inside a panel**: a style that names a block, `cards (cols-3)`, `columns (media)`,
  `accordion`, makes the row a row of that block. Rows that name the same block, one after
  the other, are one block. The tabs block builds it and loads it with `loadBlock`. Allowed:
  `accordion`, `cards`, `carousel`, `columns`, `content-tile`, `embed`, `key-benefits`,
  `mosaic`, `promo`, `quote`, `table`, `teasers`, `video`.
- **`cell columns (media, narrow, …)`**: in every cell of the row, each image paragraph and
  the text after it, up to the next image, is one `columns` block of that kind, drawn inside
  the cell with the source's 30 px top and 15 px bottom spacing (textImage2Column beside
  another cell: `/events/ai-infra-summit.html`, first panel).

```html
<div class="tabs vertical">
  <div>
    <div><a href="#architecture">Architecture Exploration</a></div>
    <div><h2>Architecture Exploration</h2><p>Architecture exploration is a crucial phase.</p></div>
    <div>title-dark</div>
  </div>
  <div><div></div><div><h2>Related Products</h2></div><div>title-dark, top-md, bottom-xs</div></div>
  <div>
    <div></div>
    <div><ul><li><a href="/f52-synopsys-1211-02/a">Platform Architect</a></li></ul></div>
    <div><ul><li><a href="/f52-synopsys-1211-02/b">Data Center IP</a></li></ul></div>
    <div>box-links</div>
  </div>
  <div>
    <div>Software</div>
    <div><h2>Early Software Development</h2><p>Shift left.</p></div>
    <div><img src="…/media/software.jpg" alt=""></div>
    <div>columns (media), top-xs</div>
  </div>
</div>
```

## Variants and states

- Default: tab bar. `vertical`: tab column of 317 px. One panel (188): a bar with one tab.
- The tab's active background is `#f7f7fa`, white in a `light-grey` section.
- First tab active. Click opens a tab and writes its hash, as the source's links do. A hash
  at load opens its tab. Panels have no ids (the block removes the pipeline's heading ids),
  so a tab's hash scrolls nowhere, as in the source.
- Arrow keys move to the next and previous tab (the contract asks for it; the source has no
  keys).
- Below 730: accordion, "+" and "-". A click on the open panel closes it, so none may be open,
  as in the source.
- The panel fades in from 730 (0.4 s), as the source.

## The transform

- A panel's components become rows in order, each with its own spacing and title colour.
- A `column` of two or more cells directly in a panel is read cell by cell. Like blocks in
  every cell (cards) become one block with `cols-N`. Box links become one list per cell.
  A row with one filled cell gives one row per component of that cell.
- A `box-links` block becomes lists (`box-links`), a plain `columns` block a row of cells,
  every other block of the list above stays a block.
- The mobile copy of the label (`.tab-header`) is dropped from the content check.

## What differs from the contract, and why

1. **A panel may take several rows, and a row has a style cell.** The contract has one row per
   panel. The source gives each component of a panel its own spacing (more than ten
   combinations on the 943 panels, none dominant) and its own title colour (371 dark, 157
   purple). One cell cannot carry them.
2. **Box links need the style `box-links`.** The contract draws every list of links as box
   links. Panels also hold plain bulleted lists of links (`/zh-cn/ai/ai-chip-development.html`,
   the "Downloads" panels): they must stay lists.
3. **Blocks inside a panel stay blocks.** The contract makes them default content. A faq, a
   card row, a video or an image-and-text row would lose its look: 188 `imageTextCta`, 54
   cards, 20 videos, 6 faqs.
4. **A label may be a link to its hash.** The contract uses the slug only. 12 links of the
   fetched pages point to a tab by its source id (`/verification/services-costart.html#vip`).

## Known gaps

- A row has one spacing. Components of one cell that have their own spacing, beside another
  filled cell, lose it: 77 warnings on 16 pages (`top spacing inside the cells of a row is
  lost`, `bottom …`). Example: `/zh-cn/ai/ai-chip-development.html`, 50 px short at 1440.
- A block inside a cell of a row with other filled cells becomes default content, except
  image-and-text rows (`cell columns (…)`): `/verification/static-and-formal-verification/
  vc-formal.html`.
- Box links beside a plain list of links in one row are drawn as a list: 11 rows on
  `/ja-jp/ai.html` and `/zh-cn/ai.html`.
- The title of a panel is 24 px. One title of the site is not small
  (`/designware-ip/technical-bulletin.html`): it gets 24 px too. `zoom` is not drawn in a
  panel (12 images).
- Blocks inside panels look as their owners draw them. Not there yet when this was written:
  `accordion` (`/solutions/automotive.html`), `carousel`
  (`/zh-cn/…/fusion-compiler/simply-better-ppa.html`), `video` (`/ai/agentic-ai.html`).

## Measured (region `.component-floating-tabs` against `.tabs`, integrated pages)

| Page, state | 1440 | 768 | 375 |
| --- | ---: | ---: | ---: |
| `/ai/ai-chip-development.html` vertical, text and box links | 0.00 % | 0.01 % | 0.01 % |
| the same, `#sfbe` (third tab), box link menu open | 0.00 % | 0.01 % | 0.01 % |
| `/partners/bluespec.html` horizontal, text beside image | 0.16 % | 0.12 % | 0.18 % |
| the same, second tab (`columns (media)`) | 0.01 % | 0.00 % | 0.25 % |
| `/designware-ip/interface-ip/ddr/ddr-universal-umctl2.html` one panel | 0.22 % | 0.00 % | 0.23 % |
| `/events/ai-infra-summit.html` first tabs, speakers in a cell | 0.11 % | 0.11 % | 2.41 % |
| `/events/ai-infra-summit.html` second tabs, vertical | 0.10 % | 0.76 % | 9.48 % |
| `/solutions/multi-die-design.html` vertical, uneven box link columns | 0.00 % | 0.01 % | 0.01 % |
| `/implementation-and-signoff/custom-design-platform.html` four tabs | 0.86 % | 1.81 % | 0.03 % |
| `/manufacturing/mask-solutions.html` | 0.46 % | 0.33 % | 0.40 % |

`ai-infra-summit` at 375 is 0.46 % with the body class `site-content`, which the importer
does not write yet (the source shrinks `bottom-md` to 10 px there). `custom-design-platform`
at 768 has equal heights: the difference is text and image rasterisation.

Not within 1 % on the sample pages, for the reasons above: the first tabs of
`/events/ai-infra-summit.html` (11.6 / 5.7 / 12.8 %, a block inside a cell),
`/solutions/automotive.html` (7.8 / 11.6 / 13.6 %, no `accordion` yet),
`/zh-cn/…/simply-better-ppa.html` (17.8 / 19.8 / 14.4 %, no `carousel` yet).

Tab colours, borders, padding, hover, the open panel after each click, the hash and the
accordion toggles are equal on both sites (one script, `bluespec` and `ai-chip-development`).
