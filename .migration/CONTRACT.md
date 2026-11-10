# WKND to Edge Delivery: shared contract

Source: https://wknd.site (65 pages). Target: DA folder `/f52-1011-02`, branch `f52-1011-02`.
Everything here was read from the cached source HTML, `clientlib-site.min.css`,
`clientlib-base.min.css` and the live site at 1440, 768 and 375 px. Where this file gives a
number, it is a source value. Where it gives only a source selector, port the declarations
from the source CSS.

Words used below:

- **Grid area**: the 1164 px wide centred column (x = 138 to 1302 at 1440 px).
- **Inset**: the 14 px side padding every leaf component has inside its column. Text in a
  full-width column therefore runs from x = 152 to 1288 at 1440 px (1136 px wide).
- **Desktop** is 1025 px and wider, **tablet** is 768 to 1024 px, **phone** is 767 px and
  narrower.

Facts checked against DA and the preview pipeline while writing this contract:

- `<u>` inside a heading survives to the page.
- `<hr>` does NOT survive: the pipeline turns it into a section break. Never author `<hr>`.
- A block with one empty cell survives (`<div class="separator"><div><div></div></div></div>`).
- A sheet uploaded as `.json` is served as JSON after preview.
- Images referenced from `content.da.live` become `./media_<hash>` pictures with their alt text.
- The `title` attribute on links survives.
- A `Template` row in the metadata block becomes `<meta name="template">`, which the
  boilerplate turns into a body class.
- Section Metadata is applied by the pipeline: `.plain.html` has no `section-metadata` block,
  the section `div` already carries the classes (`<div class="sidebar text-small">`).
- `<blockquote>text</blockquote>` in default content survives as
  `<blockquote><p>text</p></blockquote>`.
- A list item that holds a nested list gets its own content wrapped in a `<p>`
  (`<li><p><a>Home</a></p><ul>...</ul></li>`).
- A page without `Description` or `Image` metadata still gets `meta description` and
  `og:image` from the pipeline (first long paragraph, first picture).

---

## a. URLs, links, locale roots, nav and footer

### Path mapping

| Source | DA document | Web path |
| --- | --- | --- |
| `/us/en.html` | `/f52-1011-02/us/en.html` | `/f52-1011-02/us/en` |
| `/us/en/adventures/x.html` | `/f52-1011-02/us/en/adventures/x.html` | `/f52-1011-02/us/en/adventures/x` |
| `/us/en/errors/404.html` | `/f52-1011-02/us/en/errors/404.html` | `/f52-1011-02/us/en/errors/404` |

Rule: web path = `/f52-1011-02` + source path without `.html`.

### Links in content

- Internal page link `/cc/ll/....html` becomes `/f52-1011-02/cc/ll/...` (root-relative, no host,
  no `.html`).
- Hash links (`#`, `#sign-in`, `#facebookwknd`, ...) and external links stay as they are.
- The PDF download link becomes the DA path of the uploaded PDF (see section j).
- Links to pages that do not exist on the source (for example `/us/en/magazine/members-only/*`,
  which return 404) are not created. The source has no such links in its HTML.
- No link is rewritten at runtime. The importer writes final paths.

### Locale roots

Eleven roots. A root is the first two path segments after `/f52-1011-02`.

| Root | Pages | html lang | Flag |
| --- | --- | --- | --- |
| `/us/en` | full site (27 pages) + `errors/404` | en-US | US |
| `/ca/en` | mirror of `/us/en` plus `magazine/members-only` and its 2 articles (29 pages) | en-CA | CA |
| `/us/es` | single page | es-US | US |
| `/ca/fr` | single page | fr-CA | CA |
| `/ch/de`, `/ch/fr`, `/ch/it` | single page each | de-CH, fr-CH, it-CH | CH |
| `/de/de` | single page | de-DE | DE |
| `/fr/fr` | single page | fr-FR | FR |
| `/es/es` | single page | es-ES | ES |
| `/it/it` | single page | it-IT | IT |

`/ca/en` has no `ai-powered-search` page. The header search button of every locale links to
`/f52-1011-02/us/en/ai-powered-search`, as on the source.

### Resolving the locale root in code

Header, footer, breadcrumb and search all use this one expression. Copy it; do not import it.

```js
const [root] = window.location.pathname.match(/^\/f52-1011-02\/[a-z]{2}\/[a-z]{2}/)
  || ['/f52-1011-02/us/en'];
```

The fallback covers the 404 page and any path outside a locale. The source serves the
`/us/en` header, footer and 404 body for every unknown URL, so the fallback is correct.

### Per-locale nav and footer documents

Each root has `<root>/nav` and `<root>/footer` (22 documents). Header loads `${root}/nav`,
footer loads `${root}/footer`, both with `loadFragment`. Their content model is in section e
(header, footer).

---

## b. Page templates

The metadata block row `Template` sets the body class.

| AEM template | `Template` value | Body class | Pages |
| --- | --- | --- | --- |
| `landing-page-template` | `landing` | `landing` | 11 locale roots, `adventures`, `magazine` |
| `content-page-template` | `content` | `content` | `about-us`, `faqs`, `ai-powered-search`, `magazine/members-only`, `errors/404` |
| `adventure-page-template` | `adventure` | `adventure` | 32 adventure pages |
| `article-page-template` | `article` | `article` | 12 magazine articles |

### Layout rules that apply to every template

- `header` is fixed. `main` starts 200 px from the top on desktop and 130 px on tablet and
  phone (the real header is 194 px and 117 px tall; the gap is part of the source).
- Page content is at most 1680 px wide (`body .root { max-width: 105pc }`), centred.
- A section has no margin, padding or background of its own. All vertical spacing comes from
  the elements inside it.
- Every wrapper (`main .section > div`) is 1164 px wide at most, centred, with 14 px side
  padding (border-box). Below 1192 px viewport width it is fluid with the same 14 px padding.
- Only `.hero-wrapper` is full-bleed: no max-width, no side padding.
- Authors may split a page into sections freely. Sections matter only when a section style
  from section d is used.

### `landing`

Single column. Blocks and default content stack. See section e for each block.

- Home: `hero` (3 slides); `teaser`; h2; `cards`; primary button; `separator`; h2; `hero`
  (image-bottom); h3; `cards`; primary button; `separator`.
- Adventures: h1; `hero`; h2; `cards` (tabs); `separator`.
- Magazine: h1; `teaser`; h2; `cards`; h2; paragraph; `separator` (medium); `cards` (secure).
- Single-page locale root: `hero` (title only); `separator`.

### `content`

Single column, except:

- **FAQs**: section 1 (h1 underlined, picture, paragraph, `accordion`) and section 2 with
  style `sidebar, text-small` (`separator` hidden small, h3, paragraph). See the `sidebar`
  style in section d.
- **About us**: two sections with style `grid-4, text-small`. Section 1: h1, h2, paragraph in
  italics, 4 contributor fragment links. Section 2: h2, paragraph in italics, 3 contributor
  fragment links.
- **404**: one `columns` block (text left, picture right).
- **AI-powered search**: one `search` block.
- **Members only** (ca/en): h1, `cards`.

### `adventure`

Authored as two sections:

1. `hero` (mini) with 1 to 3 image slides.
2. h1 (underlined), `adventure-details`, h5 "Share this Adventure", `tabs`.

scripts.js inserts the breadcrumb as the first child of section 1, above the hero.

Layout of section 2 (foundation CSS, selector `body.adventure .section:has(> .tabs-wrapper)`):

| | Desktop | Tablet | Phone |
| --- | --- | --- | --- |
| h1 wrapper | 12/12 | 12/12 | 12/12 |
| `adventure-details` wrapper | 3/12, left | 9/12 | 7/12 |
| h5 wrapper | 3/12, left, below details | 3/12, right of details | 5/12, right of details |
| `tabs` wrapper | 9/12, right, spans both rows | 12/12, below | 12/12, below |

Reference at 1440 px (x, y, width, height): breadcrumb 138,200,1164,46; hero image
0,253,1440,400; h1 152,721,1136,70; details column 138,805,291; first detail 152,823;
tabs column 429,805,873; tab list 443,823,845,38; h5 152,1503.

### `article`

Authored as three sections:

1. Lead picture.
2. h1, h4 "By <author>", body (paragraphs, underlined h2, pictures, `quote`, lists), then the
   byline fragment link.
3. Style `sidebar`: h5 "Share this story", optional `separator` (hidden, small), optional
   `download`, `up-next`.

scripts.js appends the breadcrumb to section 1, below the lead picture.

Layout: section 1 is 12/12. Section 2 is 8/12 (776 px). Section 3 is 3/12 (291 px) with one
empty column between them. On tablet and phone all three are 12/12 and stack in order.

Source quirk to keep (`body.article`, section 2 only): h1, h4, paragraphs and the `quote`
box have NO inset, they start at the column edge (x = 138 at 1440 px, 776 px wide). Underlined
h2, pictures, the byline and everything in the sidebar keep the 14 px inset (x = 152, 748 px
wide in section 2).

Reference at 1440 px: lead picture 152,207,1136,638; breadcrumb 152,859; h1 138,953,776,60;
h4 138,1034; first paragraph 138,1079,776; quote 138,1471,776,251; h2 152,1766,748,64; body
picture 152,2179,748; sidebar 1011,926,291; h5 1025,949,263; download 1025,1029,263,163;
up-next 1025,1242,263; one up-next item 263 x 136.

---

## c. Design tokens

Foundation declares these on `:root` in `styles/styles.css`. Blocks use the custom properties,
never the raw values. Names and values are final.

```css
:root {
  /* colors */
  --color-brand-primary: #ffea00;
  --color-brand-secondary: #202020;
  --color-brand-third: #ebebeb;
  --color-background: #fff;
  --color-text: #202020;
  --color-text-inverse: #ebebeb;
  --color-text-muted: #696969;      /* "dimgray" in the source */
  --color-light: #f7f7f7;           /* footer and utility bar text */
  --color-link: #0045ff;
  --color-indicator: #afafaf;       /* inactive carousel dot */
  --color-error: #ff0058;

  /* fonts */
  --font-family-sans: "Source Sans Pro", "Helvetica Neue", helvetica, arial, sans-serif;
  --font-family-serif: "Asar", georgia, "Times New Roman", times, serif;
  --font-family-icon: "wknd-icon-font";
  --font-weight-normal: 400;
  --font-weight-bold: 600;

  /* type scale: identical at every breakpoint */
  --font-size-h1: 40px;
  --font-size-h2: 36px;
  --font-size-h3: 24px;
  --font-size-h4: 16px;
  --font-size-h5: 14px;
  --font-size-h6: 10px;
  --font-size-large: 24px;
  --font-size-medium: 18px;         /* body and paragraphs */
  --font-size-small: 14px;
  --font-size-xsmall: 12px;         /* 9pt in the source */
  --line-height-body: 1.5;
  --line-height-text: 2.5;          /* paragraphs */
  --line-height-compact: 1.75;      /* teaser and accordion text */

  /* layout */
  --gutter: 14px;
  --container-width: 1164px;        /* 873pt */
  --page-max-width: 1680px;         /* 105pc */
  --header-height: 200px;           /* 130px at 1024px and below */
  --utility-height: 25px;
  --button-size: 48px;
  --nav-panel-width: 275px;
  --z-header: 1030;
}
```

Only one token changes with the viewport: `--header-height` is 130 px at 1024 px and below.

### Breakpoints

Write media queries with exactly these limits.

| Query | Used for |
| --- | --- |
| `(width >= 1025px)` | desktop: fixed 1164 px container, desktop nav, 12-column layouts |
| `(width >= 768px)` and `(width < 1025px)` | tablet column widths |
| `(width < 768px)` | phone column widths, featured teaser stacks, cards justify |
| `(width >= 1165px)` | hero: 640 px image with overlapping text box |
| `(width >= 1201px)` | utility bar content limited to the 1164 px grid area |
| `(width <= 1200px)` | "Sign in" aligns left in the utility bar |
| `(width <= 475px)` | language toggle shows flag and chevron only, no text |

### Base typography (source selectors: `body`, `h1`..`h6`, `p`, `a`)

- body: sans, 18 px, line-height 1.5, color text, background white, margin 0.
- h1, h2, h3: serif, weight 400, margin 27px 0 13.5px, line-height 1.5.
- h4, h5, h6: sans, weight 600, uppercase, line-height 1.5, browser default margins.
- p: 18 px, line-height 2.5, margin 0 0 13.5px, `text-align: justify`.
- a: color link, no underline.
- Smoothing as the source renders it: do not add `-webkit-font-smoothing` to text; the icon
  font uses `antialiased`.

### Fonts to self-host in `/fonts`

| Family | Files needed | Source |
| --- | --- | --- |
| Asar | 400 normal | Google Fonts `family=Asar` |
| Source Sans Pro | 400 normal, 600 normal, 400 italic, 600 italic | Google Fonts `family=Source+Sans+Pro` |
| wknd-icon-font | 400 normal, `font-display: block` | `https://wknd.site/etc.clientlibs/wknd/clientlibs/clientlib-site/resources/fonts/wknd-icon-font.woff` |

The source also requests Source Sans Pro 300; no rule uses it, so it is not hosted. The one
`font-weight: 700` rule (teaser pretitle) renders with the 600 file on the source too.
Remove the boilerplate Roboto files. The icon font must be available before any block
renders an icon, so declare its `@font-face` in `styles.css`, not in the lazy `fonts.css`.

### Icons

There are no SVG icons and no `:icon:` tokens in content. Every icon is a glyph of
`wknd-icon-font`, drawn with a pseudo-element:

```css
font-family: var(--font-family-icon); font-weight: 400; font-style: normal; line-height: 1;
-webkit-font-smoothing: antialiased;
```

| Glyph | Code | Used by |
| --- | --- | --- |
| twitter | `\e901` | footer, contributor |
| facebook | `\e902` | footer, contributor |
| instagram | `\e903` | footer, contributor |
| download | `\e907` | download |
| right-arrow | `\e90e` | hero next |
| left-arrow | `\e90f` | hero previous |
| minus | `\e910` | accordion open |
| plus | `\e911` | accordion closed |
| search | `\e913` | header |
| menu | `\e916` | header |
| lock | `\e98f` | cards (secure) |
| play3 (small triangle) | `\ea1c` | breadcrumb separator, list bullets |

Delete the boilerplate `icons/search.svg`.

---

## d. Default content and section styles

### Default content

| AEM component | Authored as | Rendering (source selector) |
| --- | --- | --- |
| Title, no style | `<h1>`..`<h5>` | base typography |
| Title `cmp-title--underline` | heading whose whole text is underlined: `<h2><u>Recent Articles</u></h2>` | 84 px wide, 2 px yellow line, 8 px below the text (`.cmp-title--underline .cmp-title__text:after`). The `<u>` itself has no text decoration. |
| Title `cmp-title--black` | plain heading | same as no style |
| Text | paragraphs, `<strong>`, `<em>`, links, lists | base typography; lists as `.cmp-text ul`, `.cmp-text ul li`, `.cmp-text ul li:before`, `.cmp-text ol`, `.cmp-text li` |
| Text `cmp-text--font-small` | section style `text-small` | paragraphs 14 px |
| Text `cmp-text--quote` | `quote` block | section e |
| Text with a `<blockquote>` and no quote style (arctic-surfing only) | `<blockquote>` in default content | Browser defaults, there is no source rule: margin 1em 40px, 18 px, line-height 1.5, left-aligned. The pipeline adds a `<p>` inside, so foundation resets it: `main blockquote p { margin: 0; line-height: 1.5; text-align: left }`. |
| Button `cmp-button--primary` | link alone in a paragraph, bold: `<p><strong><a href="...">All Articles</a></strong></p>` | `a.button.primary`: yellow, 48 px high, 14 px, weight 600, uppercase, padding 1rem 2rem, no radius (`.cmp-button`, `.cmp-button--primary .cmp-button`, `.cmp-button__text`). 146 x 48 for "All Articles". |
| Image | picture alone in a paragraph | 100% of its column, auto height, margin 7px 0 (`.cmp-image__image`) |
| Image with caption | picture paragraph followed by a paragraph that holds only italics: `<p><em>Caption</em></p>` | caption: sans 14 px, weight 600, uppercase, no italics, left (`.cmp-image__title`) |
| Several images in one grid row | several pictures in ONE paragraph | equal columns side by side (whistler-mountain-biking: three at 1/3) |
| Separator | `separator` block | section e |
| Sharing (Facebook, Pinterest) | not migrated | renders with height 0 on the source; its title (h5) is kept |
| Layout container | section, with a style when listed below | |

An underlined heading is only ever authored with `<u>`; there is no rule by heading level.
The yellow line is CSS only, one global rule in `styles.css` that is not scoped to a
wrapper, so it also works inside blocks and the sign-in dialog:
`:is(h1, h2, h3) > u:only-child`.

Plain h2 and h3 inside `tabs` content and in the san-diego-surf article have no line.

Links in paragraphs that are not bold stay plain links. Blocks style their own call to
action links; they are authored as a plain link in its own paragraph, never bold.

### Section styles (Section Metadata, key `Style`)

| Style | Effect | Used on |
| --- | --- | --- |
| `sidebar` | The section becomes the right column: 3/12 at columns 10 to 12. The section just before it becomes 8/12. Every other section stays 12/12. Tablet and phone: all 12/12, stacked. `main` is the 1164 px grid in this case. | article section 3, FAQs section 2 |
| `text-small` | Paragraphs are 14 px (`.cmp-text--font-small p`). | FAQs sidebar, About us |
| `grid-4` | Block wrappers in the section are 3/12 on desktop, 6/12 on tablet, 12/12 on phone, flowing left to right and wrapping. Default content wrappers stay 12/12. | About us (both sections) |

Foundation owns all wrapper and section layout, including these selectors:
`.hero-wrapper`, `.section.sidebar`, `.section.grid-4 > div`,
`body.adventure .section:has(> .tabs-wrapper)` and its child wrappers,
`body.article` section 2 inset quirk, `.breadcrumb-wrapper`.
Block CSS never styles a `-wrapper` or `-container`.

---

## e. Blocks

Fifteen blocks to build, plus the unchanged boilerplate `fragment`. For each: the authored DA
HTML, what the block does, and the source selectors to port. "Row" is a direct child `div` of
the block; "cell" is a child `div` of a row. Authors may leave out any optional cell or
element: check before use, never throw.

Shared rules:

- Pictures: use `createOptimizedPicture` from `aem.js` when you rebuild markup; keep `alt`.
- A block must work when it is loaded inside a fragment.
- Interactive elements are real `<button>` or `<a>` elements with an accessible name.
- Boilerplate blocks not in this list (`widget`) are deleted by the foundation role, with the
  code that feeds them (`buildWidgetAutoBlocks`, `consent-check.js`, `consented.js` if unused).

### 1. `header`

Pages: all. Source: `header.cmp-experiencefragment--header`.

Content, `${root}/nav`, three sections:

```html
<div>
  <p><a href="/f52-1011-02/us/en">WKND</a></p>
</div>
<div>
  <ul>
    <li><a href="/f52-1011-02/us/en">Home</a>
      <ul>
        <li><a href="/f52-1011-02/us/en/magazine">Magazine</a></li>
        <li><a href="/f52-1011-02/us/en/adventures">Adventures</a></li>
        <li><a href="/f52-1011-02/us/en/faqs">FAQs</a></li>
        <li><a href="/f52-1011-02/us/en/about-us">About Us</a></li>
      </ul>
    </li>
  </ul>
</div>
<div>
  <p><a href="#sign-in">Sign In</a></p>
  <ul>
    <li>United States
      <ul>
        <li><a href="/f52-1011-02/us/en">en-US</a></li>
        <li><a href="/f52-1011-02/us/es">es-US</a></li>
      </ul>
    </li>
    <li>Canada
      <ul>
        <li><a href="/f52-1011-02/ca/en">en-CA</a></li>
        <li><a href="/f52-1011-02/ca/fr">fr-CA</a></li>
      </ul>
    </li>
    <!-- Switzerland (de-CH, fr-CH, it-CH), Germany, France, Spain, Italy -->
  </ul>
  <p><a href="/f52-1011-02/us/en/ai-powered-search">Search</a></p>
</div>
```

The pipeline wraps the content of every list item that has a nested list in a `<p>`: the
country name (`li > p`) and also the top nav link (`li > p > a` for "Home", here and in the
footer). Select links with `li a`, not `li > a`. Single-page locales have one top item and no nested list
(`<li><a href="/f52-1011-02/fr/fr">Français</a></li>`); the desktop nav is then empty.

Structure to render:

- **Utility bar** (`.cmp-layoutcontainer--utility`): 25 px high, background #202020. Holds
  "Sign In" (`.wknd-sign-in-buttons`, 14 px, uppercase, color #f7f7f7) and the language toggle.
  At 1440: sign in at x = 1050, toggle at x = 1122. At 1201 px and wider its content sits in
  the grid area; "Sign In" is right-aligned in a 10/12 column, the toggle in the last 2/12.
  At 1200 px and below "Sign In" is left-aligned (x = 14) and the toggle right-aligned.
- **Main bar** (`.cmp-layoutcontainer--header`): white, padding 50px 0 on desktop, 15px 0 on
  tablet and phone. Content in the grid area with the inset.
  - Logo: `icons/wknd-logo-dk.svg` (download from the source header image, alt "WKND Logo"),
    linked to the locale root. 128 x 48 on desktop (`max-width: 8rem`); on tablet and phone
    96 x 36 with `margin-left: 2rem; margin-top: .75rem` (x = 60, y = 52).
  - Desktop nav (`.cmp-navigation--header`, `.cmp-navigation__item-link`): the nested links
    only (the top "Home" item is hidden), right-aligned, 14 px, uppercase, padding 0 17px,
    48 px high, yellow background on hover, focus and when active. Active = the link whose
    path equals the current path or is a parent of it (an article marks "Magazine").
  - Search button (`.cmp-button--header-search`): 48 x 48, transparent, search glyph,
    yellow on hover and focus, `aria-label="Search"`, a plain link to the search page.
    At 1440: nav 872,85,368,48; search 1240,85,48,48. Phone and tablet: search at the right
    edge (x = viewport - 48, y = 40).
- **Scrolled state**: when `scrollY > 15` the header gets a shadow
  `0 8px 20px 0 rgb(0 0 0 / 26%)`; on desktop the main bar padding becomes 15px 0 5px with a
  .5 s transition (`.scrolly .cmp-layoutcontainer--header`).
- **Language switcher** (`.cmp-languagenavigation--header`, `--default`, `--dark`,
  `--langnavtoggle`): the toggle shows the flag of the current country (25 px wide), the
  current locale label (link text of the entry whose href equals the locale root, for example
  `en-US`, uppercase) and a chevron that flips when open. Click opens a 360 px wide dark
  panel, fixed at top 38 px, its left edge 240 px left of the toggle (882,38,360,419 at
  1440). Each country row: flag, country name (12 px), locale links (14 px, separated by a
  1 px line, the current one underlined). Click outside or on the toggle closes it. Set
  `aria-expanded`. Flags: copy `US, CA, CH, DE, FR, ES, IT .svg` from
  `https://wknd.site/etc.clientlibs/wknd/clientlibs/clientlib-site/resources/images/country-flags/`
  to `icons/flag-<cc>.svg`. Country code = first path segment of the first locale link in
  the row.
- **Mobile menu** (tablet and phone; `#toggleNav`, `#mobileNav`, `.cmp-navigation--mobile`):
  the desktop nav is hidden. A menu button (menu glyph, 28 px, at 10,40, 40 x 44) opens a
  275 px dark panel from the left, full height, with ALL nav links including "Home" (44 px
  rows, 14 px, uppercase, color #ebebeb, yellow on hover, 1 px top border
  `rgb(255 255 255 / 5%)`, first row 15 px from the top). The page shifts right by 275 px
  (transform, .5 s ease). The header block toggles the class `nav-open` on `body`; header
  CSS moves the header parts, foundation CSS moves `main` and `footer`
  (`body.nav-open main, body.nav-open footer { transform: translateX(275px) }` with the same
  transition, and `overflow-x: hidden` on body). Click on a link or outside the panel
  closes it.
- **Sign in**: see section h.

### 2. `footer`

Pages: all. Source: `footer.cmp-experiencefragment--footer`, `.cmp-layoutcontainer--footer`,
`.cmp-navigation--footer`, `.cmp-title--right`, `.cmp-buildingblock--btn-list`,
`.cmp-button--icononly`, `.cmp-text--font-xsmall`.

Content, `${root}/footer`, one section:

```html
<div>
  <p><a href="/f52-1011-02/us/en">WKND</a></p>
  <ul>
    <li><a href="/f52-1011-02/us/en">Home</a>
      <ul>
        <li><a href="/f52-1011-02/us/en/magazine">Magazine</a></li>
        <li><a href="/f52-1011-02/us/en/adventures">Adventures</a></li>
        <li><a href="/f52-1011-02/us/en/faqs">FAQs</a></li>
        <li><a href="/f52-1011-02/us/en/about-us">About Us</a></li>
      </ul>
    </li>
  </ul>
  <h4>Follow Us</h4>
  <ul>
    <li><a href="#facebookwknd" title="Facebook WKND Button">Facebook</a></li>
    <li><a href="#twitterWKND" title="Twitter WKND Button">Twitter</a></li>
    <li><a href="#instagramwknd" title="Instagram WKND">Instagram</a></li>
  </ul>
  <p>Ⓒ 2019, WKND Site.</p>
  <p>WKND is a fictitious adventure and travel website ... <a href="https://github.com/adobe/aem-guides-wknd/">site source code</a> ...</p>
  <p>Many of the beautiful images ... <a href="https://stock.adobe.com/">Adobe Stock</a>.</p>
</div>
```

The first list is the nav, the list after the h4 is the social list. Everything after the
social list is the legal text.

- Background #202020, text #f7f7f7, `margin-top: 3rem`, padding 1rem 0 1.5rem. 260 px high
  at 1440.
- Desktop row: logo 2/12 (`icons/wknd-logo-light.svg`, 128 x 48, links to the locale root),
  nav 6/12 (nested links only, 14 px uppercase, color #ebebeb, underline on hover and when
  active, no yellow), "Follow Us" h4 2/12 right-aligned and white, social buttons 2/12.
  At 1440: logo 152,+23; nav 346,+16; h4 928,+37; buttons 1108,+16 (y relative to the footer
  top).
- Social buttons: 48 x 48, background #ebebeb, dark glyph at 1.25em of the 14 px button font
  (17.5 px) with `padding: 18px 0 0 14px`, text hidden, the `title` becomes `aria-label`. The glyph comes from the link text (facebook, twitter, instagram).
- Legal text: 12 px, line-height 1.25, links #f7f7f7 underlined. Preceded by a 1em spacer
  (the source has a hidden small separator there).
- Tablet and phone: logo left with the nav links stacked beside it (one per row, 1rem
  apart), then "Follow Us" left-aligned, the buttons, the legal text.
- Single-page locales have no nested nav list: render no nav links.

### 3. `hero`

Variants: none, `image-bottom`, `mini`. Pages: home (3 slides, and one `image-bottom`),
adventures landing, 9 single-page locale roots, 32 adventure pages (`mini`).
Source: `.cmp-teaser--hero`, `.cmp-teaser--imagebottom`, `.cmp-carousel`, `.cmp-carousel--hero`,
`.cmp-carousel--mini`, plus `.cmp-teaser__title`, `__description`, `__action-container`,
`__action-link`.

One row per slide. A slide is a picture cell and an optional text cell:

```html
<div class="hero">
  <div>
    <div><picture><img src="..." alt=""></picture></div>
    <div>
      <h2>WKND Adventures</h2>
      <p>Join us on one of our next adventures. Browse our list ...</p>
      <p><a href="/f52-1011-02/us/en/adventures">View Trips</a></p>
    </div>
  </div>
  <div>...slide 2...</div>
  <div>...slide 3...</div>
</div>
```

```html
<div class="hero mini">
  <div><div><picture><img src="..." alt="Surfer on a wave"></picture></div></div>
</div>
```

- Description and link are optional (locale roots have the h2 only; the adventures landing
  has no link).
- Image: full-bleed, `object-fit: cover`, `object-position: center` (`bottom` for
  `image-bottom`). Height 640 px at 1165 px and wider, 400 px maximum below. `mini`: always
  400 px (25pc) plus 7 px margin above and below.
- Text box at 1165 px and wider: white, overlaps the bottom 180 px of the image
  (`margin-top: -180px; min-height: 180px`), 1136 px wide plus 28 px padding each side
  (124,660,1192 at 1440), centred. Below 1165 px: under the image, padding 0 14px.
- Title: serif 36 px, margin .5em 0 0. Description 18 px, line-height 1.75. Link: yellow,
  14 px, weight 600, uppercase, padding 1em 2.5em, margin 1em 0 (139 x 49 for "View Trips").
- Controls (dots and previous/next) are rendered when the block has more than one slide OR
  has the `mini` variant (a `mini` hero with one slide still shows one dot and both arrows,
  as on the source). A default hero with one slide has no controls.
- Controls: dots centred under the slide (10 px circles, 7 px side margin, #afafaf, active
  `rgb(0 0 0 / 80%)`, `margin-top: .5em`), clickable. Arrows right-aligned (left-arrow and
  right-arrow glyphs, 20 px, `margin-right: 1em`). On phone the dots of a non-mini hero are
  left-aligned with 14 px padding. With controls and not `mini`, the block has
  `margin-bottom: 4em`.
- Behaviour: one slide visible; changing slide fades the new one in (`fadeIn`, .5 s).
  Previous on the first slide goes to the last and the reverse. No autoplay (the source
  sets no autoplay attribute). Keyboard: arrows are buttons; dots are buttons with
  `aria-label="Slide N"`. The first slide's image loads eagerly, the others lazily.
- Reference at 1440 (home): block 0,200,1440,740; image 640 high; dots at y = 858; arrows
  1358,849,82,27.

### 4. `teaser`

Pages: home, magazine. Source: `.cmp-teaser--featured` and `.cmp-teaser__*`.

```html
<div class="teaser">
  <div>
    <div><picture><img src="..." alt=""></picture></div>
    <div>
      <p>Featured Article</p>
      <h2>Camping in Western Australia</h2>
      <p>The Australian West coast is a camper's heaven. ...</p>
      <p><a href="/f52-1011-02/us/en/magazine/western-australia">Full Article</a></p>
    </div>
  </div>
</div>
```

The paragraph before the heading is the pretitle (optional). The last paragraph holding only
a link is the call to action (optional).

- Desktop and tablet: image left (flex 2, `object-fit: cover`, `object-position: top`,
  full height), text right (flex 1) on #ebebeb with padding 3.5em 2em 2em. At 1440:
  152,940,1136,509; image 709 wide, text 427 wide. `margin-bottom: 1em`.
- Phone: text box first, image below it (see the 375 px source), text box `margin-top: -1em`.
- Pretitle weight 700 (renders 600), title serif 36 px margin .5em 0, description 14 px
  line-height 1.75 left-aligned, link as in `hero`.

### 5. `cards`

Variants: none, `tabs`, `secure`. Pages: home (2), magazine (1 + `secure`), adventures
landing (`tabs`), ca/en members-only.
Source: `.cmp-image-list` and `.cmp-image-list__*`; for `tabs` also `.cmp-tabs__tablist`,
`.cmp-tabs__tab`, `.cmp-tabs__tab--active`; for `secure` `.cmp-teaser--list`,
`body.anonymous .cmp-teaser--secure`.

```html
<div class="cards">
  <div>
    <div><picture><img src="..." alt=""></picture></div>
    <div>
      <p><a href="/f52-1011-02/us/en/magazine/guide-la-skateparks">Ultimate Guide to LA Skateparks</a></p>
      <p>Breaking down the top skate destinations in all of Los Angeles. ...</p>
    </div>
  </div>
  <!-- one row per card -->
</div>
```

- Render a `ul`/`li` list. Card: 260 px image column (`flex-basis: 260px`), 14 px right
  padding, `margin-bottom: 2rem`; four per row in the 1136 px column (card 274 wide).
  Image 260 x 200, `object-fit: cover`, linked to the same href as the title.
  Title: sans 18 px, weight 600, uppercase, color text. Description: 14 px, uppercase,
  dimgray, `margin-top: 1rem`, ONE line with ellipsis, 260 px wide.
- Phone: `justify-content: space-between`, no right padding.

`tabs` variant (adventures landing). A row with ONE cell starts a new tab and holds its
label; the card rows after it belong to that tab:

```html
<div class="cards tabs">
  <div><div>All</div></div>
  <div><div><picture>...</picture></div><div><p><a href="...">Bali Surf Camp</a></p><p>...</p></div></div>
  <!-- 15 more cards -->
  <div><div>Climbing</div></div>
  <div>...</div>
  <!-- Cycling, Skiing, Surfing, Travel -->
</div>
```

- The tab lists are authored, not filtered: the source lists are hand-made (Cycling has its
  own order, one adventure is in two tabs, one is in none). Keep rows exactly as the source.
- Tab list above the cards: flex, wrap; tab 14 px uppercase, padding .5rem 1rem, 38 px
  high; active tab background #202020, text white. First tab is active on load. Click or
  Enter/Space selects; left and right arrow keys move between tabs
  (`role="tablist"`, `tab`, `tabpanel`).

`secure` variant (magazine "Members Only"):

```html
<div class="cards secure">
  <div>
    <div><picture><img src="..." alt=""></picture></div>
    <div>
      <p>Alaskan Adventure</p>
      <p>Discover the 49th state</p>
      <p>Read More</p>
    </div>
  </div>
  <div>...Fly Fishing the Amazon...</div>
</div>
```

- No links (the source renders none for anonymous visitors, the only state it has).
- Card is 4/12 on desktop, 6/12 on tablet, 12/12 on phone, with the inset. Order inside a
  card: title, description, "Read More", then the image BELOW (max-height 200 px, cover).
- Whole card at 65% opacity. A yellow triangle with the lock glyph (24 px, black) sits on
  the top-left corner over the title (`:before` rule of `.cmp-teaser--secure`). "Read More"
  is a grey label: background #ebebeb, dimgray, 14 px, uppercase, padding .5em 1em.
- Title 18 px weight 600 uppercase sans; description 14 px uppercase dimgray.

### 6. `tabs`

Pages: 32 adventure pages. Source: `.cmp-tabs` and `.cmp-tabs__*`, content rules
`.cmp-contentfragment ul`, `li`, `li:before`, `ol`.

```html
<div class="tabs">
  <div>
    <div>Overview</div>
    <div>
      <p>Surfing in Bali is on the bucket list of every surfer ...</p>
      <p><picture><img src="..." alt=""></picture></p>
      <p>Looking for a low cost alternative? Checkout Surf Camp Costa Rica</p>
    </div>
  </div>
  <div><div>Itinerary</div><div><p><strong>Keramas</strong></p><p>...</p></div></div>
  <div><div>What to Bring</div><div><ul><li>Surf shorts</li><li>...</li></ul></div></div>
</div>
```

- Tab list and behaviour exactly as in `cards` `tabs` (same source rules).
- Panel content is rich text: paragraphs (18 px, line-height 2.5, justified), h2 and h3
  WITHOUT the yellow line, lists with the triangle bullet (`\ea1c`, .55em, li line-height 2,
  li padding-left 12px), bold, italics, pictures (full panel width), picture captions and
  multi-picture paragraphs as in section d. Empty paragraphs from the source are dropped by
  the importer.
- Panel fades in. Reference at 1440: tab list 443,823,845,38; first tab 93 x 38; panel
  starts y = 879, 845 wide.

### 7. `accordion`

Pages: FAQs (us, ca). Source: `.cmp-accordion` and `.cmp-accordion__*`.

```html
<div class="accordion">
  <div>
    <div>Who is WKND's intended audience?</div>
    <div><p>We believe the best adventures and activities are ...</p></div>
  </div>
  <!-- one row per item -->
</div>
```

- Header: h3 with a full-width button, padding 1em, 2 px bottom border #ebebeb, no border
  when open. Title sans 16 px weight 600 uppercase, `padding-left: .5em`. Plus glyph at the
  right, minus when open.
- Panel: hidden until opened, fades in (.5 s), 14 px text, line-height 1.75,
  `padding: .5em 0 0 .5em`.
- All items start closed. Several items can be open at once. `aria-expanded` and
  `aria-controls` on the button.

### 8. `quote`

Pages: 7 article pages. Source: `.cmp-text--quote`.

```html
<div class="quote">
  <div><div>
    <p>"There is no better place to shred then Los Angeles"</p>
    <p>Jacob Wester - Pro Skater</p>
  </div></div>
</div>
```

- First paragraph becomes a `blockquote`; the optional second is the attribution.
- Both may hold `<strong>`, `<em>` and `<br>` (western-australia: a bold two-line quote and
  the attribution "noun" in bold italics). Keep the inline markup when rebuilding.
- Box: background #ebebeb, margin 1em 0, padding 1em. Blockquote: serif 36 px, margin
  0 0 .5em, padding 14px, followed by an 80 px (5pc) wide 2 px yellow line. Attribution:
  sans 18 px, no underline. Reference: 776 x 251 at 1440 for a two-line quote.

### 9. `adventure-details`

Pages: 32 adventure pages. Source: `.cmp-contentfragment--elements` and
`.cmp-contentfragment__element*`.

```html
<div class="adventure-details">
  <div><div>Activity</div><div>Surfing</div></div>
  <div><div>Adventure Type</div><div>Overnight Trip</div></div>
  <div><div>Trip Length</div><div>6 Days</div></div>
  <div><div>Group Size</div><div>6</div></div>
  <div><div>Difficulty</div><div>Beginner</div></div>
  <div><div>Price</div><div>5000.0</div></div>
</div>
```

- Render a `dl`. Desktop: items stacked, each 84 px high, `border-left: 5px solid #ebebeb`,
  padding 0 1em, `margin-bottom: 1.25em`, uppercase. Label 12 px dimgray, `padding-top: 1em`.
  Value 14 px weight 600, `padding-top: .5em`. Values are shown as authored ("5000.0").
- Tablet and phone: items flow in a row and wrap, no border, padding 0 2em 0 0, auto width.

### 10. `contributor`

Variants: none (card), `byline`. Pages: about-us (7 cards), every article (1 byline), always
through a fragment (section g). Source: `.cmp-experience-fragment--contributor` (card);
`.cmp-byline`, `.cmp-buildingblock--btn-list`, `.cmp-button--secondary`,
`.cmp-button--icononly` (byline and buttons).

```html
<div class="contributor">
  <div>
    <div><picture><img src="..." alt=""></picture></div>
    <div>
      <h3>Stacey Roswells</h3>
      <p>Artist | Photographer | Traveler</p>
      <ul>
        <li><a href="#facebook-staceyroswell" title="Facebook Social Media">Facebook</a></li>
        <li><a href="#twitter-staceyroswells" title="Twitter Social Media">Twitter</a></li>
        <li><a href="#insta-staceyroswells" title="Instagram Social Media">Instagram</a></li>
      </ul>
    </div>
  </div>
</div>
```

`byline` uses the same cells (`<div class="contributor byline">`, roles text
"Artist, Photographer, Traveler").

- Social buttons (both variants): 48 x 48 each, no gap, background #202020, glyph #ebebeb
  (17.5 px, as in the footer), text hidden, `title` becomes `aria-label`, glyph chosen from the link text, order as
  authored.
- Card: centred, padding .5em 0 1em. Image 164 x 164 circle, cover. Name serif 24 px, margin
  0 0 .25em. Roles sans 14 px weight 600 uppercase. Buttons centred, `padding-top: 1em`.
- Byline: image 60 x 60 circle, floated left. Name serif 24 px, `margin: 0 0 .25rem 85px`,
  `padding-top: .5rem`. Roles 12 px uppercase dimgray, `margin-left: 85px`. Desktop: name
  block 9/12 and buttons 3/12 on the right in one row (byline 152,+0,554,78; buttons at
  x = 720, same y, at 1440). Tablet and phone: buttons below, left.

### 11. `download`

Pages: guide-la-skateparks (us, ca). Source: `.cmp-download` and `.cmp-download__*`.

```html
<div class="download">
  <div><div><a href="/f52-1011-02/media/ultimateguidetolaskateparks.pdf">Download PDF</a></div></div>
  <div><div>Get the Full Story</div></div>
  <div><div>Filename</div><div>ultimateguidetolaskateparks.pdf</div></div>
  <div><div>Size</div><div>139 KB</div></div>
  <div><div>Format</div><div>application/pdf</div></div>
</div>
```

Rows with one cell: the first is the title link, the second the description. Rows with two
cells are properties (label, value).

- Title: sans 14 px weight 600 uppercase, link in text color, `margin: .5em 0 0`.
  Description: 16 px weight 600 uppercase. Properties: values only (labels visually hidden),
  12 px uppercase dimgray, in one row with `margin-right: 1em`.
- Action button built by the block: same href and text as the title link, background
  #202020, text white, 48 px high, 14 px uppercase, padding 0 2.5em 0 2.25em, download glyph
  (17.6 px) before the text; `download` attribute set. 190 x 48 at 1440; block 263 x 163.

### 12. `up-next`

Pages: 12 articles. Source: `.cmp-list`, `.cmp-list--upnext`.

```html
<div class="up-next">
  <div>
    <div><a href="/f52-1011-02/us/en/magazine/guide-la-skateparks">Ultimate Guide to LA Skateparks</a></div>
    <div>Wednesday, 30 Sep 2020</div>
  </div>
  <!-- one row per article, 4 or 5 rows -->
</div>
```

- Render a `ul`; each item is one link holding the title and the date. `padding-top: 2rem`.
- Item: link 120 px high (90pt) plus padding .5rem 1rem (136 px in total),
  `border-left: 5px solid #ebebeb`, `margin-bottom: 1em`, full width. Title 18 px weight 400 uppercase, color text, padding
  5px. Date 12 px uppercase dimgray, padding 5px. Hover: background yellow, border color
  #202020, no underline.

### 13. `search`

Page: `/us/en/ai-powered-search`. Source: `.cmp-contentaisearch` and
`.cmp-contentaisearch__*` in `clientlib-base.min.css`. Behaviour: section h.

```html
<div class="search">
  <div><div>Search WKND adventures, magazine stories, and more...</div></div>
</div>
```

The cell is the input placeholder. All other labels are fixed strings, as in the source:
"Search", "Clear", "Show AI-generated summary", "Results layout", "Cards", "List",
"Search results", "Load more results".

### 14. `columns`

Page: `/us/en/errors/404` (shown by `404.html`). Source: the two 6/12 columns of the 404 page.

```html
<div class="columns">
  <div>
    <div>
      <h1>Ruh-Roh! Page Not Found</h1>
      <p>We're sorry, we are unable to fetch this page!</p>
    </div>
    <div><picture><img src="..." alt=""></picture></div>
  </div>
</div>
```

- Rewrite the boilerplate block. Two equal columns at 768 px and wider, stacked on phone;
  each cell has the 14 px inset. The text column starts 8rem lower than the picture (the
  source has a hidden separator, 4rem above and below, before the h1).

### 15. `separator`

Variants: none, `hidden`, `small`, `medium` (combine as on the source: `hidden small`).
Pages: home (2), adventures landing, magazine (`medium`), 9 locale roots, byline fragments,
article and FAQ sidebars (`hidden small`).
Source: `.cmp-separator`, `.cmp-separator__horizontal-rule`, `.cmp-separator--space-small`,
`--space-medium`, `--hidden`.

```html
<div class="separator hidden small"><div><div></div></div></div>
```

- Renders one `<hr>`: 1 px solid #ebebeb border on all sides (2 px tall in total), margin
  4rem 0. `small`: 1em 0. `medium`: 2em 0. `hidden`: no border, the margins stay.

### `fragment` (boilerplate, unchanged)

No owner, no changes. It flattens the fragment's content into the section that holds it, so
a fragment with a `contributor` block yields `.section > .contributor-wrapper`.

---

## f. scripts.js duties (foundation)

1. **Fragment links.** In `buildAutoBlocks`, a paragraph whose only content is a link to
   `/f52-1011-02/fragments/...` is replaced by a `fragment` block (`buildBlock`) before the
   sections are decorated. Remove the boilerplate code that inlines fragments itself. Result
   in the page: the fragment's block wrappers are direct children of the section.
2. **Breadcrumb** for templates `adventure` and `article`, built from the path, no fetch:
   - Items: one per path segment below the locale root, except the last. Label = the
     segment with `-` replaced by a space (CSS uppercases it: `magazine`, `members only`).
     Link = `${root}/<segments so far>`.
   - Last item: `document.title`, not linked, `aria-current="page"`. (On all 44 source pages
     the active breadcrumb label equals the page title.)
   - Markup: `<div class="breadcrumb-wrapper"><nav class="breadcrumb"
     aria-label="Breadcrumb"><ol><li><a>..</a></li><li aria-current="page">..</li></ol></nav></div>`.
   - Position: `adventure`: first child of the first section. `article`: last child of the
     first section.
   - Style (`.cmp-breadcrumb*`, in `styles.css`): 14 px (12 px on phone), uppercase, items
     inline with padding 10px 5px, first item no left padding, links weight 600 in text
     color, a yellow triangle glyph (`\ea1c`, 1em, 5 px right padding) before every item but
     the first. List padding 12px 12px 0 0 (0 top on `adventure`).
3. **Buttons.** Keep the boilerplate rule: a bold link alone in a paragraph becomes
   `a.button.primary`. Nothing else becomes a button.
4. **Template class** comes from `decorateTemplateAndTheme` (already there).
5. **`lang`**: set `document.documentElement.lang` from the root using the table in
   section a.
6. No link rewriting, no auto-blocked hero, no other auto-blocks.

`404.html` (foundation): keeps the boilerplate head, loads
`/f52-1011-02/us/en/errors/404.plain.html` into `main`, decorates and loads it like a page,
and shows the header and footer (which fall back to `/us/en`). Document title
"Page not found". If the fetch fails, show the h1 text "Page Not Found".

---

## g. Fragments

All under `/f52-1011-02/fragments`, shared by every locale (the source uses one English set).

| Document | Content | Used by |
| --- | --- | --- |
| `fragments/contributors/<slug>` | one `contributor` block | about-us |
| `fragments/contributors/<slug>-byline` | `separator` block, then one `contributor byline` block | article section 2, last element |
| `fragments/sign-in` | sign-in dialog content (section h) | header |

Slugs: `stacey-roswells`, `jake-hammer`, `ian-provo`, `jacob-wester`, `sofia-sjoeberg`,
`justin-barr`, `kumar-selveraj` (card for all seven; byline for the six that sign articles:
all but `kumar-selveraj`). Card and byline are separate documents because the source texts
differ (card "Artist | Rock Climber", byline "Ceramic Artist, Rock Climber, Writer").

A fragment is referenced by a link alone in a paragraph; the link text is the path:

```html
<p><a href="/f52-1011-02/fragments/contributors/stacey-roswells">/f52-1011-02/fragments/contributors/stacey-roswells</a></p>
```

Fragment documents have no metadata block.

---

## h. Dynamic features

Only what the public source exposes is reproduced.

### Sign in

Source facts: the page always loads as anonymous; "Sign In" opens a dialog fetched from an
experience fragment; submitting it posts to `/system/sling/login/j_security_check`, which
answers 401 on the public site. "Sign Out" and the "Welcome" greeting never show.

- The header shows "Sign In" only.
- Click opens a dialog built from `/f52-1011-02/fragments/sign-in`:

```html
<div>
  <h1><u>Sign In</u></h1>
  <h3>Welcome Back</h3>
  <ul>
    <li>USERNAME</li>
    <li>PASSWORD</li>
  </ul>
  <p><a href="#">FORGOT YOUR PASSWORD?</a></p>
  <p><strong>SIGN IN</strong></p>
</div>
```

  List items become inputs with that placeholder and `aria-label` (the second is
  `type="password"`); the bold paragraph becomes the submit button.
- Look (`#wknd-modal`, `.cmp-layout-container--modal`, `.cmp-form-text__text`,
  `.cmp-form-button`): fixed, centred, 450 px wide box with a 386 px dark panel (#202020,
  margin 2rem, padding 2rem 1.75rem, shadow `0 10px 20px dimgray`), all text white, h1 serif
  with the yellow line, inputs 386 x 66 with 1 px #ebebeb border and 4 px radius on a dark
  background, yellow 180 px wide button (18 px, weight 600), a 2 px grey gradient rule at
  the bottom. 495,164,450,571 at 1440. Phone: max-width 340 px, margin 0.
  Fades in (.3 s) and out (.2 s). No backdrop.
- Click outside the dialog or Escape closes it. Focus moves to the first input on open and
  back to "Sign In" on close.
- Submit: nothing is sent. Both inputs get the error border (1 px `--color-error`), which is
  the source's "invalid login" state. The dialog stays open.

### Members only

The lock state of `cards secure` is the only state: it is static. The two members-only
articles and their listing exist publicly under `/ca/en` and are migrated as normal pages.
Nothing links to them from the magazine page, as on the source.

### Header search

A link to `/f52-1011-02/us/en/ai-powered-search`. No inline search.

### AI-powered search (`search` block)

Source facts: the page calls `<component>.search.json?q=` and `.gensearch.json?q=` on
wknd.site. Both refuse cross-origin requests (204 without CORS headers when an `Origin`
header is sent), so the migrated site cannot call them.

- Data: `/f52-1011-02/search-index.json`, a DA sheet written by the content role with one
  row per migrated `/us/en` page (the source index is en-US only), without `errors/404` and
  `ai-powered-search`:

| Column | Value |
| --- | --- |
| `path` | web path, for example `/f52-1011-02/us/en/adventures/bali-surf-camp` |
| `title` | page title |
| `description` | meta description (may be empty) |
| `image` | absolute URL of the page's `og:image` on wknd.site (may be empty) |
| `keywords` | meta keywords (may be empty) |
| `text` | visible text of the page's main content, whitespace collapsed, at most 5000 characters |

  Sheet JSON shape: `{":type":"sheet","total":N,"offset":0,"limit":N,"data":[{...}]}`.
- Query: on form submit (Enter). Split the query into words; a page matches when every word
  occurs (case-insensitive) in title, description, keywords or text. Order: matches in the
  title first, then description or keywords, then text; ties keep sheet order.
- Initial state: only the search field and the toggle are visible. This is what visual QA
  compares.
- Field: full width, 32 px high, 1 px #ccc border, search icon at the left (the source
  SVG data URI), clear button (x) at the right when the field has text; clearing empties
  the results.
- Toggle "Show AI-generated summary": rendered, on by default, yellow when on. It has no
  effect: the generative answer is NOT reproduced (the source option
  `data-cmp-gensearch-error-fallback="RESULTS_ONLY"` shows results only when the answer
  fails, which is the state reproduced).
- Results: toolbar at the right with "Cards" and "List" buttons (`aria-pressed`, the pressed
  one yellow). Default layout: list. List row: title (16 px, weight 700) and description
  (14 px, 3 lines maximum), no image, 1 px #ebebeb line between rows. Card layout: grid
  `repeat(auto-fill, minmax(15rem, 1fr))`, gap 1rem; card with 112 px image (striped yellow
  placeholder when there is no image), title 15 px (2 lines), description 13 px (3 lines).
- Paging: 8 results first, "Load more results" adds 8; the button is hidden when nothing is
  left. No results: the results section stays hidden.
- Result links go to the migrated `path`.

### Adventure filter

The tabs of the adventures landing page are authored lists (`cards tabs`), not a filter.

### Carousel, tabs, accordion

Plain client-side behaviour, described in section e.

---

## i. Metadata block

Last block of the last section of every page (not in fragments, nav or footer).

```html
<div class="metadata">
  <div><div>Title</div><div>Bali Surf Camp</div></div>
  <div><div>Description</div><div>Surfing in Bali is on the bucket list ...</div></div>
  <div><div>Keywords</div><div>Surfing</div></div>
  <div><div>Template</div><div>adventure</div></div>
  <div><div>Image</div><div><picture><img src="..." alt="Bali Surf Camp"></picture></div></div>
</div>
```

| Field | Source | Required |
| --- | --- | --- |
| `Title` | `<title>` | yes |
| `Description` | `meta[name=description]` | when the source has it (55 of 65) |
| `Keywords` | `meta[name=keywords]` | when the source has it (36 of 65) |
| `Template` | section b | yes |
| `Image` | `meta[property=og:image]`, uploaded to DA; alt = `og:image:alt` | when the source has it (61 of 65) |

---

## j. Images and files

- Every image is downloaded from wknd.site and uploaded to DA under
  `/f52-1011-02/media/`, then referenced in the document as
  `https://content.da.live/catalan-adobe/eds-mig-20260914/f52-1011-02/media/<file>`.
  Preview turns it into a `./media_<hash>` picture.
- Rendition: the DAM original, `https://wknd.site` + `data-cmp-filereference` of the image
  component (for example 1600 x 900 for the home hero). The `src` attribute of the `<img>`
  is NOT the original: it is capped at 1280 px wide. `src` is used only where the component
  has no file reference (the six byline portraits). No content image is cropped by its
  component (checked: every `width`/`height` pair in `main` has the aspect ratio of its
  original).
- File name: the last path segment of the downloaded URL; when two different images share a
  name, prefix the second with its document slug. The same source image is uploaded once
  and reused (119 files, including the PDF).
- `alt`: copied as is. An empty or missing `alt` stays empty. The `title` attribute is not
  migrated, except as the caption where the source shows `.cmp-image__title`.
- Authored markup: `<picture><img src="..." alt="..."></picture>`, in its own paragraph in
  default content, or directly in a block cell.
- Logos and flags are code, not content (`icons/`, see header and footer).
- PDF: `ultimateguidetolaskateparks.pdf` (source
  `/content/dam/wknd-shared/en/magazine/la-skateparks/ultimateguidetolaskateparks.pdf`) is
  uploaded to `/f52-1011-02/media/ultimateguidetolaskateparks.pdf` and previewed.
- Components that render nothing on the source (empty download on western-australia, the
  sharing widget, empty rich-text paragraphs and headings) are skipped.
- Non-breaking spaces of the source text are kept (for example the two in
  "Ⓒ 2019,&nbsp;&nbsp;WKND Site."), because they change the rendered width.
- The contributor portraits have an empty `alt` on the source, so they have one here.
- One source text is a bare `<div>` instead of a `<p>` (cycling-tuscany, "What to Bring",
  first paragraph; line-height 1.5 on the source). It is authored as a normal paragraph.
- The `/ca/en` footer has one more legal paragraph than the others ("Canadian specific
  footer ..."), before the copyright line.

---

## k. File ownership

| Role | Owns | Notes |
| --- | --- | --- |
| Architect | `.migration/CONTRACT.md` | |
| Foundation | `styles/*`, `scripts/scripts.js`, new `scripts/*.js`, `head.html`, `fonts/*`, `favicon.ico`, `404.html` | Also: delete `blocks/widget`, `scripts/consent-check.js`, `scripts/consented.js`, `icons/search.svg`, the Roboto fonts, when nothing uses them. Favicon: source `.../clientlib-site/resources/images/favicons/favicon-32.png`. Never edits `scripts/aem.js`. |
| Block owner | `blocks/<name>/<name>.js`, `blocks/<name>/<name>.css`; may add files to `icons/` | One owner per block of section e. Nobody edits `blocks/fragment`. |
| Content | `.migration/import/*`; DA documents under `/f52-1011-02` only | 65 pages + `us/en/errors/404`, 22 nav and footer documents, 14 fragments, `search-index.json`, media. Preview only. |

Shared names, so nobody has to ask:

| Name | Set by | Read by |
| --- | --- | --- |
| body class `landing`, `content`, `adventure`, `article` | metadata `Template` | foundation CSS |
| body class `nav-open` | header | header CSS, foundation CSS (`main`, `footer` shift) |
| section classes `sidebar`, `text-small`, `grid-4` | Section Metadata `Style` | foundation CSS |
| `.breadcrumb-wrapper`, `nav.breadcrumb` | scripts.js | foundation CSS |
| `a.button.primary` | scripts.js | foundation CSS |
| custom properties of section c | foundation | everyone |
| font family `wknd-icon-font` | foundation | blocks |
| `/f52-1011-02/search-index.json` | content | search |
| `/f52-1011-02/fragments/sign-in`, `${root}/nav`, `${root}/footer` | content | header, footer |
| `icons/wknd-logo-dk.svg`, `icons/flag-<cc>.svg` | header owner | header |
| `icons/wknd-logo-light.svg` | footer owner | footer |

### The source 404 page

The source answers every unknown URL with status 404 and the body of `/us/en/errors/404.html`
(header and footer of `/us/en`, "Ruh-Roh! Page Not Found", a dog picture in two columns).
It is migrated: the content lives in DA at `/f52-1011-02/us/en/errors/404` (template
`content`, one `columns` block) and `404.html` displays it for every unknown path.

---

## Known gaps, decided on purpose

- The generative answer of the AI search is not reproduced (no cross-origin access).
- Search results come from a static index of the migrated pages, so ranking differs from the
  source's Content AI ranking.
- Sign-in cannot succeed; neither can it on the public source.
- Facebook and Pinterest share widgets are dropped (zero height on the source).
- Analytics, ContextHub, data layer and Target scripts of the source are not migrated.
