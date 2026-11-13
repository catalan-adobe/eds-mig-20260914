# The importer

Turns the fetched source HTML (`M/source/pages/`) into DA documents, uploads the ones that
changed and previews them. `M` is `.migration/`. The content model is `M/CONTRACT.md`.

```
node M/import/import.mjs --page /ai/agentic-ai.html     one page ("/" is the home page)
node M/import/import.mjs --pages M/source/reps.txt      one source path per line
node M/import/import.mjs --all                          every fetched page with status 200
  --dry        build and check only. No request to the source, nothing written to DA
  --media      only make sure the images of the selected pages are in DA
  --force      upload and preview also when the document did not change
  --fragments  rebuild fragments.json from all fetched pages (done once, see "Fragments")
node --test                                             in M/import: the tests
```

Work on a transform with `--dry --page <path>`, read `M/out/<path>` and the page's entry in
`M/out/report.json`, then run without `--dry` to see it on http://localhost:3520.
The exit code is 1 when a page failed.

## What happens to a page

1. `lib/page.mjs` reads the page and removes the header and footer fragments.
2. `lib/document.mjs` walks the components in DOM order. A component is an element with the
   class `aem-GridColumn`, or a `div` directly in an inherited rail, a carousel slide or a
   column cell. Its name is its first class. Each one goes to `components/<name>.mjs`.
3. `lib/sections.mjs` assembles sections, section metadata and the metadata block.
4. `lib/media.mjs` copies the images, `lib/check.mjs` checks the result.
5. The document is written to `M/out/<path>`. `lib/publish.mjs` uploads and previews it when
   its content differs from the last successful upload (`M/out/manifest.json`).

Shared fragments found on a page are documents too: `M/out/fragments/...`.
The pages under `/<lang>/refs/global-navigation/` are skipped (CONTRACT h17).

## The transform interface

`components/<component name>.mjs` exports one function:

```js
export default function name(el, ctx) { return … }
```

`el` is the component's wrapper element (a cheerio/domhandler node). It returns one of:

- **content**: an html string, a block, or an array of both. The importer makes **one
  section** of it and gives it the component's own background and spacing (`ctx.styles(el)`).
- **sections**: one `ctx.section(...)` or an array of them, for a transform that sets styles
  or returns several sections (containers). Nothing is added.
- nothing (`undefined`, `[]`): the component is empty. Its spacing goes to the next section.

Transforms are synchronous and must not load anything.

| `ctx.` | What it is |
| --- | --- |
| `$` | cheerio of the page |
| `page` | `{ path, lang, template }`: source path, `en` / `ja-jp` / …, template as in the contract |
| `children(scope = el)` | the sections of the components inside `scope`, already transformed, items merged, empty ones settled |
| `block(name, variants, rows, { merge })` | a block. `rows` is an array of rows, a row an array of cell html. `merge: true` marks an item block: neighbours with the same class list join into one (CONTRACT a, rule 4) |
| `section(content, { styles, id })` | a section with its section metadata |
| `clean(el, { inline })` | the html of an element as DA markup, for a cell or default content: links rewritten, images registered, buttons, `:icons:` and linked images written as CONTRACT a) defines. `inline: true` gives the inside of a block without `<p>`, or a phrase element (`a`, `strong`) itself |
| `content(el)` | like `clean`, as an array for a section: a `<table>` becomes a `table` block |
| `image(img or url, alt)` | `<img src alt>` for a source image. Pass the `<img>` node (the rendition is chosen, the alt read) or a URL |
| `link(href)` | the rewritten href (rules below) |
| `video(el)` | the video link of a `[data-video-id]` element: the Brightcove player URL of CONTRACT a), or the YouTube watch URL when its provider is YouTube |
| `styles(el)` | section styles of a component's `.background-component`: `light-grey`, `top-sm`, `bottom-md` |
| `merge(sections, ...variants)` | item merge of a list you built, adding variants (`carousel`, `cols-3`) to the item blocks |
| `band(sections, styles)` | the styles of an enclosing band on its sections: background on all, `band-top-*` on the first, `band-bottom-*` on the last |
| `flat(sections)` | sections as the html of one cell (a tab panel): blocks become their cells' content |
| `fallback(el = el)` | the default-content sections of a component, as if it had no transform |
| `fragment(el, name)` | a `fragment` block when this content is a shared fragment, else `null` |
| `drop(el, reason)` | takes source elements out of the content check and writes the reason into the report. For what is not migrated on purpose: a mobile copy of a text, a dialog, a script-drawn control |
| `meta(key, value)` | sets a row of the page's metadata block (`publication-date`, `tags`, `json-ld`) |
| `warn(message)` | a warning in the report, with the component name |

Rules:

- A cell holds html. Escape text you read with `.text()`; `ctx.clean()` does it for you.
- Never write an image URL yourself: `ctx.image()` and `ctx.clean()` register the source
  image, the importer swaps in the DA URL afterwards.
- The content check compares the words and images of the source with the output. Text you do
  not write must be dropped with `ctx.drop()`, or the page fails. Nothing is lost silently.
- A component without a transform becomes default content (its text, images and links in
  order; nested components keep their own transforms) with a warning in the report.

### A worked example

The source component `keyBenefits` (three of them sit in the three cells of a `column`):

```html
<div class="keyBenefits aem-GridColumn aem-GridColumn--default--12">
  <section class="cmp-key-benefits">
    <a class="cmp-key-benefits__link" href="/ai/ai-chip-development.html">
      <div class="cmp-key-benefits__img-wrapper">
        <img src="/content/dam/synopsys/icon/chip-purple.svg.imgo.svg" alt="Silicon Proven">
      </div>
      <div class="cmp-key-benefits__title">Silicon Proven</div>
      <div class="cmp-key-benefits__description">Trusted by foundries and customers</div>
    </a>
  </section>
</div>
```

`components/keyBenefits.mjs` (an example: the `items` group owns the real one):

```js
export default function keyBenefits(el, ctx) {
  const box = ctx.$(el).find('.cmp-key-benefits').first();
  const title = ctx.clean(box.find('.cmp-key-benefits__title'), { inline: true });
  const href = ctx.link(box.find('.cmp-key-benefits__link').attr('href'));
  const text = [
    `<p>${href ? `<a href="${href}">${title}</a>` : title}</p>`,
    ctx.clean(box.find('.cmp-key-benefits__description')),
  ];
  const row = [ctx.image(box.find('img').first()), text];
  return ctx.block('key-benefits', [], [row], { merge: true });
}
```

The transform returns one block with one row. The importer wraps it in a section. The
`column` transform then sees three cells that each hold one `key-benefits` item block and
merges them (`merge: true`), adds `cols-3`, and applies the column's background and spacing:

```html
<div>
<div class="key-benefits cols-3">
<div><div><img src="https://content.da.live/…/media/chip-purple-699a888208.svg" alt="Silicon Proven"></div><div><p><a href="/f52-synopsys-1211-02/ai/ai-chip-development">Silicon Proven</a></p><p>Trusted by foundries and customers</p></div></div>
<div>…</div>
<div>…</div>
</div>
<div class="section-metadata">
<div><div>Style</div><div>light-grey, band-top-sm, band-bottom-md</div></div>
</div>
</div>
```

A container (a carousel, tabs) reads its children: `ctx.children(slide)` gives the sections of
one slide, `ctx.merge(sections, 'carousel')` joins the item blocks, `ctx.flat(sections)` makes
cell html when a block cannot hold blocks.

## Sections (who does what)

- Every component is one section. `anchor` returns an empty section with an id. An empty
  section is dropped: its id goes to the next section, its spacing too, as `band-top-*`
  (the sum of its paddings: up to 22 px `xs`, up to 45 px `sm`, else `md`). What one band
  cannot hold (two empty components of 60 px) goes to the section before, as `band-bottom-*`.
- The id is written as the section metadata `Anchor`, not `Id`: the pipeline rewrites an `Id`
  as a class name (`1` is lost, `What's New` becomes `what-s-new`) and keeps `Anchor` as
  `data-anchor`. `scripts.js` sets the section's `id` from it.
- Item merge does not join a section that starts a grid column (`span-N` without `stack`),
  nor two sections with band spacing between them.
- `column` decides in this order: one cell is transparent (its background and spacing become
  the band of its sections); like item blocks in cells of equal width merge (`cols-N`, and
  `cols-(M x N)` when the cells hold `cols-M` blocks); cells that each hold one
  default-content section with equal styles become a `columns` block (`w-3-9`, `w-9-3`,
  `w-4-8`, `w-8-4`, `divider`); everything else is the section grid. Cells that each hold
  several `cards` use the grid: below 730 the source shows cell after cell.
- Section grid: each section of a cell gets `span-N`, the later ones of a cell `stack`, empty
  cells before a filled one `offset-N`. The first section of the row carries the row's
  background, `band-top-*`, `band-bottom-*` and `divider`. The first section of a sticky left
  cell (`two2575PinnedLeft`, `two3366PinnedLeft`) gets `pinned`.
- A row inside the cell of another row cannot be a grid (sections do not nest). It becomes a
  `columns` block when its cells are default content (their own styles are lost, with a
  warning; one image padding stays as the variant `image-pad-*`), else its cells are stacked
  (warning). `box-links` and `key-benefits` cells of unequal counts merge there, the shorter
  cell padded with empty rows.
- When two bands meet on one edge of a section the larger one stays.
- A row that is not full (`9 | empty`) followed by a row whose first cell still fits
  (`3 | 9`) would join it: the first section of that second row gets the style `row`, which
  starts a new row.

## Links

| Source href | Result |
| --- | --- |
| `/a/b.html`, `https://www.synopsys.com/a/b.html`, relative | `/f52-synopsys-1211-02/a/b` (query and anchor kept) |
| `/`, `/content/synopsys/en-us.html` | `/f52-synopsys-1211-02/` |
| a path the preview refuses (`/a/locations_austin.html`, `-(miet)-`: 33 pages) | runs of other ASCII characters than letters, digits and hyphens are one hyphen, in the DA path and in links (`webSafe` of `lib/config.mjs`) |
| `/ja-jp/x.html`, `/content/synopsys/ja-jp/x.html` | `/f52-synopsys-1211-02/ja-jp/x` (`/content/synopsys/en-us/` has no folder) |
| `…/category.<tag>.html` | `…/category?tag=<tag>` |
| a path with another extension (`.pdf`, `.zip`, `.php`, `.cgi`), `/content/dam/…` | `https://www.synopsys.com/…` |
| other hosts, also `news.synopsys.com` | unchanged |
| `#x`, `mailto:`, `tel:` | unchanged |
| `/cdn-cgi/l/email-protection`, `data-cfemail` | `mailto:` with the decoded address |
| `javascript:`, empty | the link is removed, its text stays |

## Media

- `ctx.image()` writes the source URL. After the build the importer reads each image through
  `tools/source.mjs` (once: `M/source/media-manifest.json` remembers it), uploads it to
  `/f52-synopsys-1211-02/media/<name>-<10 hex of its sha1>.<ext>` and writes the
  `content.da.live` URL. Equal bytes get one file.
- **Rendition.** For an `<img>` with a `srcset` (Dynamic Media, `images.synopsys.com`) the
  importer takes the widest candidate, `wid=1200` in the source's markup: it is what the
  source shows at 1440 px. Without a `srcset` it takes `src` as it is (`data-src` when there
  is no `src`). Pass a URL to `ctx.image()` to choose another rendition yourself.
- **SVG over 40 KB.** The preview service rejects the whole page for one. The importer
  converts such an SVG to a PNG with `rsvg-convert` (2000 px wide, or the SVG's own `width`)
  and writes a warning with the URL and size into the report. `rsvg-convert` is the one
  program the importer needs besides Node (`brew install librsvg`).
- An image the source does not deliver (404, no image bytes) is left out, with a warning. Its
  alt text is not asked for by the check.
- A run that is not `--dry` ends with `images: N copied, N already present, N failed`. When
  the source tools report a bot check, the run saves what it has, prints one `FETCH-STOP`
  line and exits with code 1.
- `--dry` loads nothing: an image that is not in the manifest yet gets a placeholder URL
  (`…/media/unfetched-<hash>`) and the report counts it as `mediaPending`.

## Fragments

`fragments.json` is the registry of CONTRACT d): `<lang>|<name>|<hash of text, links and
images>` to `{ path, pages, from }`. `--fragments` scans all fetched pages and adds every
experience fragment and inherited rail that two or more pages use. It never renumbers an
entry. `experiencefragment` and `column` (rails) call `ctx.fragment()`: a registered content
becomes a `fragment` block, and its document `/fragments/[<lang>/]<name>` is built from the
first page of the run that has it. Unregistered content is inlined. `chatbot` and
`ask-synopsys` are not migrated.

## Checks and the report

Every built document is checked. A failure sets the status `failed` and the exit code 1; the
document is still uploaded, except when an image is not in DA (each preview would load it
from the source).

- a block name that is not in `M/owners.json`
- an internal link still on synopsys.com, ending in `.html`, or outside the site folder
- an empty main (allowed, with a warning, when the source page is empty too)
- a `script` or `style` element, a `style` attribute, an `hr`
- an image that is not on `content.da.live`
- an alt text the source has and the output lacks
- word recall under 0.98: every word of the source's content (chrome removed, dropped
  elements removed) must be in the output, counted per occurrence. A CJK character is a word
- a source image that is missing in the output

`M/out/report.json`: `pages[<source path>]` and `fragments[<path>]`, each with:

- `status`: `previewed` (uploaded and previewed in this run), `unchanged` (equal to its last
  upload), `built` (a `--dry` or `--media` run of a document that differs from its last
  upload), `failed` (a check failed), `error` (a transform threw, or DA or preview refused)
- `preview`, `failures`, `warnings`
- `recall`, `words`, `missing` (the first 40 missing words)
- `components` and `fallbacks` (counts by name), `blocks`, `sections`
- `images` (`source`, `output`), `mediaPending`
- `excluded`: what `ctx.drop()` and fragments took out of the content check, with the reason
- `unknownLinks`: internal links to a path that is not in the source's sitemap (the first 20)

A transform that throws stops its page only: the entry says `components/<name>.mjs: …`.

## Upload and preview

`lib/publish.mjs` uploads through `tools/da.mjs` (4 admin calls at a time). Up to 24 changed
documents are previewed one call each; from 25 on one bulk preview job
(`POST admin.hlx.page/preview/{org}/{site}/main/*` with `paths`, then the job's `details`
until it has stopped) replaces them. After that each page must answer 200 as `.plain.html`
with the words of the new document. The CDN sometimes keeps an earlier upload (seen once in
about 190 previews): then the page is previewed again, up to twice.
`--all` runs in batches of 100 pages, so a stopped run continues where the manifest ends.

## Files

| File | Holds |
| --- | --- |
| `import.mjs` | the command line, the batches, the report |
| `lib/page.mjs` | loading a page, finding components |
| `lib/document.mjs` | the walk and the transform context |
| `lib/sections.mjs` | blocks, sections, merge, bands, the document html |
| `lib/clean.mjs` | source markup to DA markup |
| `lib/links.mjs`, `lib/media.mjs`, `lib/fragments.mjs` | links, images, the fragment registry |
| `lib/check.mjs`, `lib/snapshot.mjs` | self-check, content check |
| `lib/publish.mjs`, `lib/store.mjs` | DA upload, preview, manifests shared by parallel runs |
| `components/` | one transform per source component, owned by the component's group |
| `chrome/` | header and footer documents (their owners) |
| `test/` | `node --test`: links, clean, sections, checks |
