# Group toc: toc, breadcrumb

Owner of `blocks/toc/`, `blocks/breadcrumb/`, the transforms `tableOfContents.mjs` and
`breadcrumb.mjs`, and `icons/caret-down.svg`.

## toc

Source: `tableOfContents`, 2,285 instances on 2,284 pages. As in the contract.

```html
<div class="toc bar">
  <div><div><ul><li><a href="#news">What's New</a></li><li><a href="#faq">FAQ</a></li></ul></div></div>
  <div><div><a href="/f52-synopsys-1211-02/ai/contact-us">Get Started</a></div></div>
</div>
```

```html
<div class="toc">
  <div><div><p>Table of Contents</p><ul><li><a href="#1">Introduction</a></li></ul></div></div>
</div>
```

| Variant | Source | Count |
| --- | --- | ---: |
| `bar`, list and button | `table-of-contents-product-layout` | 626 |
| `bar`, list only (no button, or an empty button wrapper) | the same | 49 |
| default, title `Table of Contents` | `table-of-contents-article-layout` | 1,317 |
| default, title `目录` (zh-cn) | the same | 292 |
| no items | dropped | 1 |

- Row 1, cell 1: optional title paragraph, then the list. A link is `#<id of a section>`.
- Row 2 (`bar`): the button, a plain link. It opens in a new tab when it leaves the site (the
  source sets `target` on 54 buttons: 41 leave the site or are PDFs, 13 are pages of the site
  and now open in the same tab).
- The title is the one the source shows: its script replaces the server's English title by
  language (`目次`, `目录`, `目錄`). Without a title the block uses the same words.
- Extra rows and cells are ignored. A missing list gives an empty bar.

Behaviour, all taken from the source script and rules:

- `bar`: fixed under the utility bar (54.2 px from 1130, top 0 below) once its place reaches
  that line. The wrapper keeps 42 px while the nav is fixed, as the source: the page moves up
  12 px at that moment.
- From 731: the items wrap to a second line when they do not fit (7 items at 768: 107 px).
  The source does not scroll sideways (`overflow` has no effect on its `display: table`).
- To 730, both variants: one line of 42 px with the current section and a caret. A click opens
  the list (in the flow before it is fixed, over the page after).
- Default from 730: the grid column that holds the block is sticky at 128 px
  (`.section-col:has(.toc)`, the source's `two2575PinnedLeft`).
- To 730 the default block is full width, and the row that holds it loses its band spacing when
  it follows the hero (the source's `tocSictkyArticlesMobile`).
- Click: scroll to the section, less the utility bar and, for `bar` and to 730, the nav.
  Smooth from 731. The hash is replaced.
- Mark: the first section whose top is in the upper half of the window. No match keeps the
  last mark. A scroll to 0 removes the mark first; opening the list at scroll 0 keeps it.
- Below 1130 the source subtracts the height of its hidden utility bar (56.4 px, 58 px to 730)
  in jumps, marks and the fix line. The block does the same with these two constants.

## breadcrumb

Source: `breadcrumb`, 18 pages (`/zh-cn/authors/*`). As in the contract: one cell with a list,
links first, the current page as text.

The source hides this trail at every width (`.site-wrapper .component-breadcrumb
{ display: none }`). The trail on screen is the one in the header's utility bar. So the block
keeps the content in the document and shows nothing: there is no hover state to match.

## Differences from the contract

- "Scrolls horizontally when it overflows": the source wraps instead. The block wraps.
- "Breadcrumb link hover": the source never shows the trail.

## Known gaps

- Section ids. The pipeline rewrites the section metadata `Id` as a class name: `1` is dropped,
  `1abc` becomes `abc`, `Demo` becomes `demo`, `概览` is dropped. 6,946 of 11,174 source anchors
  start with a digit (1,597 pages, nearly every default `toc`). On those pages a click does
  nothing and no item is marked. With the ids set by hand the states match the source.
  Request to `global`.
- A section that holds only a fragment loses its id (`#interop` on
  `/designware-ip/interface-ip/pci-express/pci-express-7`). Request to `global`.
- 28 list links point to an id inside a text, not to an anchor
  (`/blogs/chip-design/lpddr5-enhancements-iot-ai-image-processing`). Such ids are not in the
  documents.
- The first item of a `bar` lands 12 px lower than the others from 731, as in the source.
- `/implementation-and-signoff/rtl-synthesis-test/rtl-architect`: the source also takes the
  spacing off a band after a second banner to 730. Not reproduced.
- To 730 the other blocks of the rail are 360 px wide in the source (no right inset), 345 px
  here.
