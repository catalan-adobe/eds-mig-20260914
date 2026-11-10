# Foundation: what block developers get

Global layer for the contract in `CONTRACT.md`. Files: `styles/styles.css`, `styles/fonts.css`,
`scripts/scripts.js`, `fonts/`, `404.html`, `favicon.ico`.

## Tokens

All custom properties of contract section c are on `:root`, with the same names and values
(`--color-*`, `--font-family-*`, `--font-weight-*`, `--font-size-*`, `--line-height-*`,
`--gutter`, `--container-width`, `--page-max-width`, `--header-height`, `--utility-height`,
`--button-size`, `--nav-panel-width`, `--z-header`). `--header-height` is 130px below 1025px.

## Fonts and icons

- `Asar` 400, `Source Sans Pro` 400, 600, 400 italic, 600 italic: lazy, in `fonts.css`.
- `wknd-icon-font`: declared in `styles.css`, ready when a block renders. Draw a glyph with

```css
.block .thing::before {
  content: "\e913";
  font-family: var(--font-family-icon);
  font-weight: 400;
  font-style: normal;
  line-height: 1;
  -webkit-font-smoothing: antialiased;
}
```

## Base styles that reach into blocks

- `p`: 18px, line-height 2.5, margin `0 0 13.5px`, justified. Reset what a block does not want.
- `h1`-`h3`: serif, margin `27px 0 13.5px`. `h4`-`h6`: sans, 600, uppercase, browser margins.
- `a`: `--color-link`, no underline, no hover style.
- `:is(h1, h2, h3):has(> u:only-child)::after` draws the yellow line anywhere (also in the
  sign-in dialog). The `<u>` has no text decoration.
- `a.button`: 48px high, 14px, 600, uppercase, padding `1rem 2rem`; `.primary` is yellow. Only a
  bold link alone in a paragraph gets it (`p.button-wrapper > a.button.primary`). Call to
  action links inside blocks stay plain links: style them in the block.
- Lists, pictures, captions and multi-picture paragraphs of section d are styled inside
  `.default-content-wrapper` and inside any element with the class `rich-text`. A block that
  shows authored rich text (the `tabs` panel) adds `rich-text` to the element that holds it
  and gets the source rendering, checked against the source list of bali-surf-camp.

## Layout

- `header` is `position: fixed` at the top with `z-index: var(--z-header)`; `main` has
  `padding-top: var(--header-height)`. The header block sets its own height and background.
- `main` is at most 1680px wide and centred. `footer` width is the footer block's job.
- Every `main .section > div` wrapper: `max-width: 1164px`, centred, `padding: 0 14px`,
  border-box, `display: flow-root`. A block is therefore 1136px wide at 1440px and its own
  outer margins stay inside the wrapper (they do not collapse with the neighbours, as on the
  source). Put the vertical margins of the contract on the block or its children.
- `.hero-wrapper` has no max-width and no padding.
- `grid-4`, `sidebar`, the adventure grid, the article inset quirk and the FAQ quirks are done.
  Block CSS must not style a `-wrapper` or `-container`.
- FAQ sidebar (`body.content .section.sidebar`): wrappers are plain blocks without padding, so
  the `separator` there must keep its margins on the `<hr>` itself.
- Mobile menu: the header toggles `nav-open` on `body`; foundation shifts `main` and `footer`
  by `--nav-panel-width` with `transform .5s ease` and sets `overflow-x: hidden` on `body`.

## scripts.js

- `getLocaleRoot()` is exported from `/scripts/scripts.js`. It is the contract expression; a
  block may copy the expression instead of importing it.
- `decorateMain(main)` is exported (used by `fragment`).
- A paragraph holding only a link to `/f52-1011-02/fragments/...` becomes a `fragment` block.
- Breadcrumb: `.breadcrumb-wrapper > nav.breadcrumb > ol > li`, built on `adventure` and
  `article` pages only, styled in `styles.css`.
- `document.documentElement.lang` is set from the path (`/ca/fr` gives `fr-CA`).
- `404.html` loads `/f52-1011-02/us/en/errors/404` through `loadFragment` and falls back to an
  `h1` "Page Not Found".

## Facts found on the way

- Section Metadata `Style` arrives as classes on the section `div` in the delivered HTML.
- A picture that is alone in its section arrives without a `<p>` around it.
- The dev server needs a branch name short enough for a DNS label.
