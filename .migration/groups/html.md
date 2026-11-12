# Group html: promo, search-box, table

Owner of `blocks/promo/`, `blocks/search-box/`, `blocks/table/` and the transforms
`htmlTextOnly.mjs`, `table.mjs`. No new icons.

## htmlTextOnly, as built

`htmlTextOnly.mjs` classifies each box in this order:

1. JSON-LD (`script[type=application/ld+json]`): page metadata `json-ld`, minified. Several
   scripts in one box become one JSON array.
2. Widgets drawn by the source's scripts are dropped: chat bar (`#chat-bar`, `#floating-icon`),
   scroll-to-top (`.scroll-to-top`), the scroll progress ring (`.pb`, `.pc`). Eloqua forms
   (`form.elq-form`, action on eloqua.com) too.
3. `.pa`: `promo`. `form[name=ipForm]`: `search-box`. `#extraInfo`: `promo outline`.
   `video[data-playlist-id]`: `video playlist` (player of `data-account` / `data-player`,
   `?playlistId=`). `form[id^=mktoForm_]`: `form` with the key row `form`. Only iframes:
   one `embed` each, with `W x H` when the source sets a size (300 x 150 as googleMap).
4. A link around `.component-image` and `.component-text` (logo walls, success-story cards:
   `/success-stories/view-all.html` 52, `/partners.html` 27): default content, image, then the
   title as the link, then the description. A linked image would not survive in a block cell.
5. Nothing visible (styles, scripts, chat styles): no section.
6. Anything else: the importer's default content (tables become `table` blocks there), with the
   warning `one-off HTML written as default content`.

## Authored model

```html
<div class="promo"><div><div>
  <h2>Subscribe to the Synopsys IP Technical Bulletin</h2>
  <p>Includes in-depth technical articles, …</p>
  <p><strong><a href="https://www.synopsys.com/cgi-bin/dwtb/req1.cgi">Subscribe</a></strong></p>
</div></div></div>

<div class="promo outline"><div><div>
  <h2>Synopsys IP 技术公告</h2><p>…</p>
  <p><em><a href="https://www.synopsys.com/cgi-bin/dwtb/req1.cgi">订阅</a></em></p>
</div></div></div>

<div class="search-box"><div>
  <div>Search IP</div>
  <div><a href="https://www.synopsys.com/dw/ipsearch.php?p=">https://www.synopsys.com/dw/ipsearch.php?p=</a></div>
</div></div>

<div class="table striped w-113-119-292-137 paragraphs">
  <div><div><p><strong>Era</strong></p></div><div>…</div></div>
</div>
```

`promo`: the image cell of the contract is supported (side by side, hidden up to 480 px). No
source box has one: the 389 boxes all hide an empty image column, so the transform writes none.

## Variants

| Block | Variant | Source | Look |
| --- | --- | --- | --- |
| promo | (default) | `.pa` (389) | `#5a2a82` box, 40 px padding (30 up to 480), title 32 / 500, button `#80539c` 10 x 30 px, hover underlines, gradient rule 2 px below |
| promo | `outline` | `#extraInfo` (30, zh-cn rail) | 1 px `#80539c` border, centred, title 0.8 of the `text` title size, yellow button with purple border, hover darkens |
| search-box | | `form[name=ipForm]` (249) | browser field, 100 % wide, one empty line below. Enter: target + `encodeURIComponent(query)` |
| table | (default) | tables in text and in htmlTextOnly | the global `table, th, td` rules: 1 px `#ccc`, 8 px |
| table | `striped` | the `table` component (161) | `.cmp-table`: shadow, `#e3e3e3` outline, striped rows, cells 18 x 24 px, width 200 / 25 % / 285 px per column (211.8 px in a `span-9`), at least 100 %, scrolls sideways |
| table | `auto-width` | `useauthoredwidth` (18) | the table keeps its own width |
| table | `header` | first row of `th` | th 16 px / 400 |
| table | `sticky` | `.cmp-table.sticky` (1) | first column stays put on horizontal scroll |
| table | `center`, `center-first-row` | inline `text-align: center` on every cell, on the first row | centred cells |
| table | `w-73-605` | `width` of the first row's cells (116 tables) | sets the first row's cell widths (px, `p` = %, `0` = none): the source's fixed layout |
| table | `paragraphs` | cells hold `<p>` (41) | keeps the `p` (body size, 10 px under), which the pipeline strips from a lone paragraph |

## Different from the contract

- `table striped`: the contract has one table look (the global `#ccc` one). The `table`
  component looks different, so the transform adds `striped`. `auto-width`, `center`,
  `center-first-row`, `w-*` and `paragraphs` are needed for the source's widths, alignment and
  type. Contract request below.
- `table header` keeps the header row in `tbody`, as the source, so the stripes count it.
- An empty table block (the source's `<table>` without rows) draws nothing, as the source.
  An empty row gets one line of height (the source's `&nbsp;` cells, which the pipeline drops).
- `.table.striped` keeps the source's 20 px bottom margin only when the next section has no top
  spacing (the source margin collapses with the next component's top margin).

## Measured (region compare on localhost:3520, 1440 / 768 / 375)

- promo: 0 / 0.62 / subpixel (en article); 0.35 / 0.34 / 1.95 (zh-cn, subpixel text)
- promo outline: 0 / 0.19 / 1.66 (1 px: subpixel row offset; boxes measure equal)
- search-box: 1.34 / 0 / 3.03, from the band's grey background (fragment, not this block)
- table striped: 0.6 / 0.36 / 0.63; data-center 0 / 0 / 0; advisories 0 / 1.08 / 0.24;
  sticky 0.36 / 0.55 / 0.71; header 0.03 / 0 / 0
- States: promo hover (underline, no shadow), outline hover (inset shadow), field focus (browser
  ring), Enter (same URL with https), overflow and sticky scroll: equal on both sites.

## Known gaps

- `table`: merged cells (`colspan`, `rowspan`, about 20) are written unmerged (warning). The
  source's merged-row colouring script is not ported. The one `✔` check-mark cell
  (`/glossary/what-is-3dic.html`) stays a text character.
- Cells partly centred (12 tables) lose their alignment.
- One-off HTML keeps its content, not its page styles: `/success-stories/view-all.html` cards
  (2 to 4 % per band at 1440: description 18 px and grey title in the source), `/partners.html`.
- Tables inside htmlTextOnly (47) and in text use the default look; their inline widths and
  page styles are lost.
