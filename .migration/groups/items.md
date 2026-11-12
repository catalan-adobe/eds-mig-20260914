# Group items: key-benefits, box-links

Owner of `blocks/key-benefits/`, `blocks/box-links/`, the transforms `keyBenefits.mjs`,
`boxLink.mjs`, `boxLinkContainer.mjs`, and `icons/plus.svg`, `minus.svg`, `link.svg`.

## key-benefits

Source: `keyBenefits` (622). One row per item. Cell 1: the icon. Cell 2: the title (first
paragraph, a link when the source item has an `href`), then the description.

```html
<div class="key-benefits cols-3">
  <div>
    <div><img src="…/media/accelerate-1-purple.svg" alt="Faster Validation"></div>
    <div><p><a href="/f52-synopsys-1211-02/ai/ai-chip-development">Faster Validation</a></p><p>Automated testbench …</p></div>
  </div>
</div>
```

- `cols-N` (1 to 4): columns from 730, one column below. Without it: one column.
- Rows are in reading order (row by row). The block deals them into N column stacks, as the
  source's cells: a tall item moves only its own column, and below 730 the columns follow
  each other (column 1, then column 2).
- An empty row leaves its place in the column empty.
- A linked title makes the whole item the link. No visible hover or focus change (the source
  has none), only the pointer.
- Title and description are cut after two lines, as in the source.
- 81 items have no description: the source keeps the 32 / 48 px below them, the block too.

## box-links

Source: `boxLink` (2,251) and `boxLinkContainer` (345). One row, one cell per box. The kind of
a box is read from its cell:

| Cell | Kind | Source |
| --- | --- | --- |
| a link | label and round link icon | `component-boxLink no-dropdown` (1,825) |
| text without a link | the same, not clickable | 1 |
| a paragraph (text or link) and a list of links | label, plus / minus icon, list opens below | `dropdown-link` (423) |
| two or more paragraphs, one with a link | event box: date, title, place, chevron | `cmp-boxlink` (3, `/newsroom.html`) |
| a heading | title of the group | `boxLinkContainer h2` (142) |

```html
<div class="box-links cols-2">
  <div><div><h2>Tools</h2></div></div>
  <div><div><a href="/f52-synopsys-1211-02/…/primesim-spice">PrimeSim SPICE</a></div></div>
  <div><div><p><a href="/f52-synopsys-1211-02/…/usb">USB</a></p><ul><li><a href="…">USB 3.2</a></li></ul></div></div>
  <div><div></div></div>
  <div><div><p>Nov 15-20, 2026</p><p><a href="https://…">Supercomputing 2026</a></p><p>Chicago, IL</p></div></div>
</div>
```

- `cols-N`, reading order and empty rows: as in `key-benefits`. `boxLinkContainer` fills
  column by column, so the transform writes its boxes row by row; a column that is shorter
  than the one after it gets an empty row (5 containers).
- `no-title`: a group without a title (203). It keeps the group's padding (20 px, and 26 px
  above the boxes). A block with a title row has the group's padding too. A block with neither
  is a plain run of boxes (`boxLink` in a `column`): no padding.
- Dropdown: a click on the item (not on a link) opens and closes its list, 0.4 s slide. Each
  item on its own, as the source. The icon is a button with `aria-expanded`.
- Link box: label and icon are one link. From 730 the icon is on the left and the row is at
  most 342 px wide; below 730 the icon is on the right. Labels are cut after 2 lines (1 below
  730). No visible hover change (the source has none), underline on focus.
- Event boxes are 15 px apart (each source box has `vert-pad-bottom-xs`; the section keeps the
  last one as `bottom-xs`).

## Differs from the contract

- **Hover.** The contract expects "hover (arrow icon, background)". The source of today has no
  hover rule for either component: checked with a pointer on both sites.
- **`no-title`** is a new variant: without it a group without a title and a loose run of boxes
  could not be told apart (45 px against 0 px above the boxes).
- **Dropdown boxes** are not in the contract: 423 boxes, written as paragraph plus list.
- **Empty rows** keep a column slot: needed for 5 uneven groups.
- Rows are dealt into columns by script instead of a CSS grid: only stacks give the source's
  order below 730 and its behaviour when a dropdown opens.

## Not migrated, known gaps

- `target="_blank"` of 8 linked key benefits (and of box links): the link opens in the same tab.
- Event box colours `blue` and `orange` exist in the source CSS, no page uses them: only
  purple is built. The transform warns when it meets another colour.
- `title` attribute of the event date.
- Box links inside `floatingTabs` (55 rows, among them all on
  `/solutions/multi-die-design.html`) are flattened to a list of links by the `tabs`
  transform: the `tabs` block draws them.
- A row of box links or key benefits with uneven cells inside another row's cell (10 rows,
  `/company/resources/newsletters.html`) is stacked by `column.mjs`: see the request.

## Checks

`region.mjs`-style clip of the block on the integrated page, source against
http://localhost:3520, at 1440 / 768 / 375. A diff above 0 on key benefits is the second
description line (25.6 px line height) landing on another pixel row, because the page offset
above the block differs by a fraction of a pixel. Geometry is equal to 1/64 px.
