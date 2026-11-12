# Foundation: what block developers build on

Files: `styles/styles.css` (eager), `styles/lazy-styles.css` (modal), `scripts/scripts.js`,
`scripts/slider.js`, `scripts/modal.js`, `scripts/site.js`, `404.html`. Values are the source's
(`css-rules.mjs`), measured against the source at 1440, 768 and 375.

## What the pipeline delivers (checked on a previewed DA page)

- Section metadata is applied on the server: `Style` becomes classes of the section `div`,
  `Id` becomes its `id`. No `section-metadata` block reaches the browser.
- `:name:` arrives as `<span class="icon icon-name"></span>`, with the space before it removed.
- The page metadata `json-ld` is written as `<script type="application/ld+json">` by the
  pipeline. `scripts.js` does nothing for it.
- A local draft `.migration/drafts/<label>/x.plain.html` must be written the same way:
  `<div class="top-md light-grey" id="overview">…</div>` per section.

## Tokens (`:root` of `styles/styles.css`)

Use the tokens, not literals. They change at the source's breakpoints by themselves.

| Group | Tokens |
| --- | --- |
| Colour | `--color-text`, `--color-purple`, `--color-purple-mid`, `--color-purple-light`, `--color-purple-dark`, `--color-link`, `--color-link-hover`, `--color-grey-text`, `--color-grey-dark`, `--color-bg-light`, `--color-bg-page`, `--color-border`, `--color-border-light`, `--color-orange`, `--color-orange-dark`, `--color-blue`, `--color-teal`, `--color-green` |
| Gradient | `--gradient-dark-purple`, `--gradient-black`, `--gradient-light-purple`, `--gradient-article-purple`, `--gradient-article-purple-blue`, `--gradient-article-blue` |
| Type | `--font-family`, `--font-weight-body` (300), `--font-weight-button` (400), `--line-height-body` (1.6), `--line-height-heading` (1.1), `--body-font-size` (the source's `body`: 15 / 14 / 18 px), `--body-size` (the source's `p, ul, ol`: 15 / 14 / 16 px), `--text-size` (16 px), `--heading-size-h1` … `-h6`, `--page-title-size`, `--title-size`, `--title-size-small`, `--title-size-large` |
| Space | `--space-xs` / `-sm` / `-md` (15 / 30 / 60 px), `--text-gap` (24 px), `--text-margin-top`, `--text-margin-bottom`, `--container` (100 % / 970 / 1170 px), `--container-padding` (15 px), `--gutter` (30 px) |
| Shape | `--radius`, `--radius-button`, `--button-min-height`, `--button-padding`, `--button-hover`, `--shadow-card`, `--shadow-card-hover` |
| Header | `--nav-height` (70 / 80 px from 1130), `--utility-height` (0 / 55.2 px), `--header-height` (their sum). `header` reserves it; on `body.home-page` only the utility bar |

Media queries: `(width >= 730px)`, `(width < 730px)`, `(width >= 992px)`, `(width >= 1200px)`,
`(width >= 1130px)` for the header.

## Global rules a block meets

- `html` is 10 px, `box-sizing: border-box` everywhere, no font smoothing, as the source.
- Element defaults (`h1`-`h6`, `p`, `ul`, `ol`, `a`, `img`, `table`, `button`, `.icon`,
  `a.button`, `a.cta-link`, `p.button-wrapper`) are the source's globals, all in `:where()`:
  **one class of yours wins**. Headings are purple, weight 300, margin `15px 0`. `p, ul, ol`
  are `--body-size`, other text inherits `--body-font-size`. Links are blue, underlined on hover.
- `:where(.section) > :where(div)` is the source's container (`--container`, 15 px padding,
  `display: flow-root`). A full-bleed block resets it: `.hero-wrapper { max-width: none;
  padding: 0; }`. Inside a grid column (`.section-col`) the padding is already 0.
- Section classes set custom properties: read `--title` (title size) and `--title-color` in a
  block that draws a `text` title. Section alignment is `.section.center`, `.section.right`.
- `body` classes: the template (`content-page-template`, …), `home-page` on the five language
  home pages, the page metadata `theme`.

## What `decorateMain` does, in this order

1. Icons: `span.icon > img` (from `aem.js`), plus `--icon: url(…)` on the span. Inside `main`
   an icon is drawn as a mask in `currentcolor`, so it takes the text colour. An icon is 1em
   high, as Font Awesome; set `height` on `.icon` to change it. In the header and footer the
   `img` shows as it is; add `background-color: currentcolor; mask: var(--icon) center / contain
   no-repeat;` and hide the `img` to get the same.
2. Sections, then the **section grid**: neighbouring sections with `span-N` become
   `div.section-row > div.section-col.span-N[.offset-N] > div.section…`. A `stack` section
   joins the column before it. A row ends when the spans pass 12 or at a section with the style
   `row`. The row takes `light-grey` / `white`, `band-*` and `divider` of its **first**
   section; `band-*` on a later section stays that section's own spacing. To pin a rail:
   `.section-col:has(.toc) { position: sticky; top: …; align-self: start; }`.
3. Blocks (`decorateBlocks`).
4. Buttons, in default content and in block cells:
   - `<p><strong><a>` becomes `p.button-wrapper > a.button.primary`, `<em>` gives
     `a.button.secondary`. The `strong` / `em` is removed.
   - A link alone in its paragraph that ends with `:chevron-right:` becomes `a.cta-link`.
   - Neighbouring button paragraphs are merged into **one** `p.button-wrapper` (a flex row,
     gap 24 px). The default look is the button of the source's `text` component; a block
     overrides it with one class (`.hero a.button { … }`).
   - No `title` attribute is added.
5. Default content (`.default-content-wrapper` only, never block cells):
   - `h2` first in a section is the `text` title: class `title`. Not in `rich-text` and
     `no-title` sections.
   - An image paragraph followed by a paragraph with only a link whose text is its URL: the
     picture is wrapped in the link, the paragraph removed. Block cells keep both paragraphs.
   - A wrapper of image paragraphs only gets the class `image` (the image fills its column).
     With the section style `zoom` it gets the source's "Click to see the detail" button and
     opens in the modal.
   - `[h5 +] ul` of plain links only gets `link-list` (the source's `pageList`). A paragraph of
     icon-only links gets `social-links`. A list of links that start with `:download:` is
     styled as the source's `downloads`.

A block cell that holds a `text` (title, body, buttons) gets the source's look with the class
`text-content` on the cell and `title` on its title.

## Section styles

All of CONTRACT.md a). Notes:

- `title-flush` has no effect: the source has no rule for `.title.no-margin`.
- Bottom spacing below 731 px is 15 / 30 / 60 px, as at every width. Only pages whose root
  container is `.site-content` in the source get 15 / 0 / 10 px: `body.site-content` (page
  metadata `theme`), and the templates that always have it (`campaign-landing-page`,
  `contact-us-landing-page`, `video-landing-page`, `form`, `marketo-thankyou-page`).
- Also supported, and needed from the importer (the foundation's requests): `no-title` (a
  `text` without title whose body starts with `h2`), `row` (first section of a grid row that
  follows a row narrower than 12), `cta` and `cta-full` (`callToAction`: the Bootstrap button,
  and its `fullWidth` variant), the page metadata `theme: site-content`.
- `buttons-left` is supported too (the importer writes it).

## Helpers

```js
import { siteRoot, getLanguage, languageRoot } from '../../scripts/site.js';
import { createSlider } from '../../scripts/slider.js';
import openModal from '../../scripts/modal.js';
```

- `createSlider(track, { perView, autoplay, dots, arrows, loop })` returns
  `{ go(index), next(), prev(), destroy() }`. It builds `div.slider > div.slider-viewport >
  track.slider-track`, `button.slider-prev`, `button.slider-next`, `div.slider-dots >
  button.slider-dot`. `perView` is a number or `{ 0: 1, 730: 3 }`; the slider moves by that
  many slides and has one dot per step. Slides out of view are `inert` and
  `aria-hidden="true"`; the current dot has `aria-current`. Arrows and dots are `hidden` when
  everything fits. Swipe, arrow keys, pause on hover and focus are built in. The structure CSS
  is global; the block draws arrows and dots, and sets `--slider-gap` **on `.slider`**. For a
  fade instead of a slide: `.x .slider-track { transform: none; }` and style
  `[aria-hidden='true']`.
- `openModal(content)` shows the source's video and zoom modal (65 % wide from 730, 16:9,
  close button, Escape, click outside). `content` is an `img`, `picture`, `iframe` or `video`.
  It returns a function that closes it.
- Third-party scripts: `loadScript` of `aem.js` only (CSP with `strict-dynamic`).
