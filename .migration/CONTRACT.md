# Contract: synopsys.com to Edge Delivery Services

Everyone builds against this file. Measured on 5,562 fetched pages (of 7,007) on 2026-11-12.
`M` is `.migration/`. A number in brackets is a count of instances, unless it says pages.
A change to this file is a request to the architect, not an edit.

## a) Page model

### Sections

The source page is a tree of components. Each component has its own background and vertical
spacing (`background-component light-grey-bg vert-pad-top-sm …`). The joints between components
have no dominant spacing (text to title: 27 % / 22 % / 15 % / 15 %), so spacing is authored, not
derived. The importer (`global`) builds sections like this:

1. Walk the root container in document order. These are transparent: `synopsysContainer`,
   `anchor`, a `column` with one cell, an inlined `experiencefragment`.
2. Every other component becomes **one section**: default content, or one block.
3. `anchor` gives its `id` to the next section (section metadata `Id`).
4. **Item merge.** Neighbouring blocks with the same class list merge into one block, rows in
   reading order: siblings in a cell, the cells of one `column` row (adds `cols-N`), the slides
   of a card or quote carousel (adds `carousel`), the children of `cardContainer` and
   `boxLinkContainer`. Cells with different item counts do not merge: use the section grid.
5. An empty component is dropped. Its spacing goes to the next section as `band-top-*`.
6. Transforms run bottom-up: a container transform receives its children already transformed.
7. **Inherited rail.** The right cell of 880 `9 | 3` rows holds `.par.iparys_inherited`: content
   inherited from a parent page. Its children are components without the grid classes (first
   class = name): 2,618 `rightRailItem`, 368 `pageList`, 11 `callToAction`. The importer treats
   them as components and writes the rail as a fragment (see d).
   Slides of a `carousel` hold components without the grid classes too (`div.quote.image`,
   `div.banner.image`, `div.column`).

### Section metadata

Keys: `Style` (list) and `Id`. `global` sets `section.id` from `data-id`. A section without
metadata has no background, no spacing, full container width, left aligned.

| Style | Source | Effect |
| --- | --- | --- |
| `light-grey`, `white` | `light-grey-bg`, `white-bg` | full-bleed background `#f7f7fa`, `#fff` |
| `top-xs`, `top-sm`, `top-md` | `vert-pad-top-*` of the component | 15 / 30 / 60 px; 40 px for all three below 730 |
| `bottom-xs`, `bottom-sm`, `bottom-md` | `vert-pad-bottom-*` | 15 / 30 / 60 px; below 731: 15 / 0 / 10 px |
| `band-top-*`, `band-bottom-*` | the same classes of an enclosing band (`column`, container) | added to the first / last section of the band; sums with `top-*` / `bottom-*` |
| `span-3`, `span-4`, `span-6`, `span-8`, `span-9` | `col-sm-N` cell of a `column` | section grid, see below |
| `offset-3`, `offset-4`, `offset-6` | empty cells before the first filled cell (174 rows) | left offset in twelfths |
| `stack` | second and later component of one cell | the section sits under the previous one, in the same grid column |
| `divider` | `divider-row` (752) | 1 px vertical line between grid columns, 30 px on each side |
| `center`, `right` | `text-align-center`, `-right` | text alignment of the section |
| `buttons-center`, `buttons-right` | `.buttons.align-*` when it differs from the text | button row alignment |
| `title-small`, `title-large` | `title text-size-smaller`, `-larger` | title 24 / 24 px, 32 / 40 px (below / from 730). Default 24 / 32 px |
| `title-dark` | title colour `#111c24` or empty (11,780) | title colour. Default is `#5a2a82` (16,477) |
| `title-flush` | `title no-margin` (625) | no title margin |
| `rule` | `hr.separator` after a text (1,466), `separator` | 1 px rule below the section |
| `rich-text` | `richTextEditor`, `html` | body type scale (see f). Default sections use the `text` scale |
| `image-pad-sm`, `image-pad-md`, `image-pad-lg` | `img.horizontal-padding-*` (1,467) | horizontal padding of the image |
| `zoom` | `zoom-container` (721) | "Click to see the detail" button, image opens in a modal |

**Section grid.** Consecutive sections with a `span-N` style form one row, a 12-column grid
with a 30 px gutter that stacks below 730. A `span-N` section starts a grid column N wide. A
`stack` section continues the column of the section before it. A row wraps when the spans pass
12. The row takes background and `band-*` spacing from its first section. The importer uses the
grid when a `column` row has blocks in a cell, several components in a cell, or cells whose
components differ in spacing or title style. `global` wraps the row in `div.section-row`.

Examples: an article is `span-3` (rail: `toc`, fragment, `social-share`, each `stack` after the
first) then `span-9` and `span-9, stack` for every body section. `9 | empty` (1,123 rows) is
`span-9` then `span-9, stack`: no neighbour column, so the content stays left and 75 % wide.
`9 | inherited rail` (880 rows) is the same, then one `span-3` section with the rail's
`fragment`.

### Default content

| Source | DA markup |
| --- | --- |
| `text` title | `<h2>`, first element of its section. Size and colour are section styles |
| `text` body, `richTextEditor`, `html` | paragraphs, lists, headings as authored. Drop `style`, `class`, `span`, empty paragraphs |
| `pageTitle` | `<h1>` in its own section |
| `image` | `<p><img></p>`. Alt from the source. Caption: the next `text` section |
| linked image (546) | image paragraph, then a paragraph with only a link whose text is its URL. `global` wraps the picture and removes the paragraph |
| primary button | `<p><strong><a href>Label</a></strong></p>` |
| secondary button | `<p><em><a href>Label</a></em></p>` |
| call-to-action link (`cta-link`, 1,320) | a link whose text ends with `:chevron-right:` |
| button icon | `:chevron-right:` (`has-arrow`), `:arrow-down-to-line:` (download), `:play:` (video) at the end of the link text |
| plain link alone in a paragraph (1,505) | stays a link. `global` does not promote it to a button |
| `pageList`, `list` | `<ul>` of links, with its `<h5>` when it has one |
| `downloads` | `<ul>` of links, each starting with `:download:` |
| `socialLinks` | `<p>` of links, each with one icon: `:linkedin-in:` |
| `callToAction` | button paragraphs. Alignment is the section style |
| email links (`__cf_email__`) | decode `data-cfemail`, write a `mailto:` link |
| video link | `https://players.brightcove.net/<account>/<player>_default/index.html?videoId=<id>` (`account` is `data-video-lang`, `player` is `rka4xWwYG` unless set) |

Internal links are written as `/f52-synopsys-1211-02/<source path without .html>`. Links to PDFs
and other downloads keep `https://www.synopsys.com/...`. Images are
`https://content.da.live/catalan-adobe/eds-mig-20260914/f52-synopsys-1211-02/media/...`.

### Templates and page metadata

`template` is the source `data-template`, lower case, runs of other characters as one hyphen:
`content-page-template`, `chip-design-article-page`, `campaign-landing-page`,
`chip-design-author-page`, `content-type-element`,
`silicon-ip-technical-bulletin-blog-article`, `dw-content-page`, `webinar-landing-page`,
`verification-central-blog`, `glossary-template`, `product-individual`,
`success-story-template`, `contact-us-landing-page`, `ip-technical-bulletin`,
`content-internal-events-landing-page`, `content-3rd-party-events-landing-page`,
`product-category`, `solution-category`, `gated-success-story-template`, `synopsys-partners`,
`form`, `error-page`, `video-landing-page`, `chip-design-landing-page`, `article-landing-page`,
`article-category-page`, `chip-design-category-page`, `empty-campaign-landing-page`,
`marketo-thankyou-page`. It becomes a body class. Layout is never implied by the template: it
is in the sections.

Eight templates load the source's blog stylesheet (1,468 pages): `chip-design-article-page`,
`chip-design-author-page`, `chip-design-landing-page`, `chip-design-category-page`,
`silicon-ip-technical-bulletin-blog-article`, `verification-central-blog`,
`article-landing-page`, `article-category-page`. `global` scopes its differences to these
body classes.

| Key | From | Used by |
| --- | --- | --- |
| `title`, `description` | `<title>`, `meta description` | head |
| `image` | `og:image`, uploaded | head |
| `template` | `body[data-template]` | body class |
| `nav`, `footer` | only when not the language default (see d) | header, footer |
| `content-type` | `searchContentType` | index |
| `business-area`, `product-category`, `solution-type`, `marketing-stage` | `search*` metas | index, facets |
| `thumbnail` | `searchImage`, uploaded | index |
| `publication-date`, `authors`, `read-time` | `blogBanner` data attributes and text | index |
| `tags` | the page's `cmp-blogsdev__pagetags-container` | index |
| `json-ld` | JSON-LD of `htmlTextOnly` (191), minified | `global` writes the script element |
| `robots` | `meta robots` (1 page) | head |

## b) Every source component

| Component | Pages | Treatment | Group |
| --- | ---: | --- | --- |
| `synopsysContainer` | 5,562 | transparent container | global |
| `text` | 4,681 | default content, one section, title and alignment as section styles | global |
| `htmlTextOnly` | 4,671 | by class, see section "htmlTextOnly" below | html |
| `column` | 4,666 | one cell: transparent, its classes become `band-*` and background. One filled cell: `span-N` (+ `offset-N`). Like items: item merge. Cells of single default-content components with equal spacing and title style: block `columns`. Else: section grid | global |
| `image` | 2,328 | default content, styles `image-pad-*`, `zoom` | global |
| `experiencefragment` | 1,955 | block `fragment` on 2 or more pages, inlined on one. `chatbot`, `ask-synopsys`: not migrated. `topnav`, `footer`: documents (d) | global |
| `pageTitle` | 1,949 | default content `<h1>` | global |
| `anchor` | 1,868 | section metadata `Id` of the next section | global |
| `tableOfContents` | 1,676 | block `toc` (`bar`, or rail list) | toc |
| `blogsDev` | 1,465 | `mostRecentArticles`: `listing author`. `categoryPage`: `listing category`. `browseByTags`: row of `blog-nav`. Page tags: page metadata `tags` and `<ul>` of links in a section | listing |
| `banner` | 1,294 | block `hero` | hero |
| `blogBanner` | 1,134 | `article`: block `article-hero`. `landing` and featured: rows of `teasers featured` | article |
| `dynamicCards` | 1,071 | block `teasers post`, static rows; `carousel` when the source slides | teasers |
| `socialShare` | 1,026 | block `social-share` | article |
| `cards` | 917 | block `cards` | cards |
| `marketoFormsContainer` | 664 | block `form landing` | forms |
| `richTextEditor` | 598 | default content, style `rich-text` | global |
| `authorProfile` | 435 | block `author-profile` | article |
| `search` | 421 | blog sub navigation: block `blog-nav`. Result pages (7): `listing faceted` | listing |
| `boxLink` | 371 | row of block `box-links` | items |
| `floatingTabs` | 357 | block `tabs` | tabs |
| `boxLinkContainer` | 317 | block `box-links` with its title row | items |
| `video` | 301 | block `video` | media |
| `imageTextCta` | 289 | block `columns media` | columns |
| `subscriptionForm` | 223 | block `form subscribe` | forms |
| `callToAction` | 199 | default content buttons | global |
| `carousel` | 195 | `card-carousel`: `cards carousel` or `teasers carousel`. Quotes: `quote carousel`. `banner-carousel`: `hero carousel`. `image-carousel` and other content: block `carousel` | carousel |
| `dwProductsDownloads` | 170 | block `dw-products` | rail |
| `spotlight` | 170 | block `spotlight` | article |
| `keyBenefits` | 159 | row of block `key-benefits` | items |
| `cardContainer` | 136 | item merge of its children, adds `cols-N` and `size-*`. Other children: `columns` | teasers |
| `quote` | 115 | block `quote` | accordion-quote |
| `textImage2Column` | 106 | block `columns media narrow` | columns |
| `assetCard` | 102 | block `teasers` | teasers |
| `mktoForm` | 87 | block `form` | forms |
| `table` | 85 | block `table` | html |
| `faq` | 58 | block `accordion` | accordion-quote |
| `downloads` | 57 | default content list | global |
| `pageList` | 48 | default content list (items are in the server HTML) | global |
| `contentCarousel` | 39 | slides of cards: `cards carousel`. Else block `carousel` | carousel |
| `rightRailItem` | 36, and 880 in inherited rails | block `rail-card` (2,784 instances) | rail |
| `subNavRight`, `navList`, `subNavLeft`, `topNav` | 25, 25, 10, 4 | only on `/<lang>/refs/global-navigation/**` (39 pages): pages not migrated, content is in the nav documents | header |
| `socialLinks` | 24 | default content links with icons | global |
| `googleMap` | 20 | block `embed` | media |
| `logoCarousel` | 18 | block `carousel logos` | carousel |
| `breadcrumb` | 18 | block `breadcrumb` | toc |
| `mosaicCardContainer`, `mosaicCardColor`, `mosaicCardVideoImage`, `mosaicCardRTE` | 10, 5, 6, 3 | block `mosaic`, one row per card | tiles |
| `contentTile` | 6 | block `content-tile` | tiles |
| `interactiveImage` | 6 | default content image. Hover tooltips: not migrated | global |
| `siteFooter` | 4 | footer document `footer-landing` | footer |
| `featuredImageTextLinks` | 4 | block `columns media` when it has content (1), else dropped | columns |
| `interactiveBanner` | 3 | block `hero video` | hero |
| `imageAndLinks` | 3 | block `columns media` | columns |
| `separator` | 3 | section with its label as `<p>` and style `rule` | global |
| `pressRelease` | 2 | its heading, and the list as `teasers` rows when the feed is in the cache | teasers |
| `list` | 2 | default content `<ul>` | global |
| `ghost`, `factoid` | 2, 1 | not migrated: empty in the source | global |
| `html` | 1 | default content, style `rich-text` | global |
| `product-card` | 1 | rows of `cards quick` | cards |
| `contentTypeListing` | 1 | heading only: its list comes from a servlet of the source | teasers |

### htmlTextOnly, by class

5,704 instances. 79 distinct style sets (43 used once), 41 distinct inline scripts, 402 distinct
visible HTML shapes (374 used once). The transform classifies in this order:

| Class | Instances | Treatment |
| --- | ---: | --- |
| Style that hides or shows the chat widget | 4,342 | not migrated |
| JSON-LD (`FAQPage` 176, `WebPage` 173, `BreadcrumbList` 170) | 191 | page metadata `json-ld` |
| Purple promo box (`.pa`), mostly in fragments | 354 | block `promo` |
| IP search box (`form[name=ipForm]`) | 249 | block `search-box` |
| Newsletter box (`#extraInfo`) | 30 | block `promo outline` |
| Tables | 47 | block `table` |
| Brightcove playlist | 20 | block `video playlist` |
| Marketo form | 4 | block `form` |
| iframe (Podbean, Spotify, YouTube, Google Maps) | 6 | block `embed` |
| Styles for sibling components (logo walls 79, banner link colours 37, hover borders) | about 130 | variant where one exists (`teasers logos`), else not migrated |
| Tracking, Eloqua forms and their scripts, scroll progress ring, per-page scripts | about 70 | not migrated |
| Other visible HTML (198 mixed, 44 images only, 21 buttons, 16 inline SVG, 4 A-Z bars) | 283 | default content: text, links, images, lists, buttons. Importer warning with the page |

Banner `style` elements (2,112): three rule sets, all derived from "is there a mobile image".
Not migrated: the `hero` block shows the second image below 730 when there is one.

Pages that keep a visible difference:
- 183 pages with one-off HTML (logo walls, show/hide links, inline SVG graphics, custom boxes):
  content kept, custom styling lost. The importer lists them in its warnings.
- 37 `ip-technical-bulletin` pages (zh-cn): no scroll progress ring.
- 3 zh-cn event pages: no Eloqua form.
- 6 pages: `interactiveImage` without hover tooltips.
- Tables with merged cells (about 20): cells are not merged.
- 170 pages with `dw-products`: the product tables depend on the source's API (see e).

## c) Block catalogue

Rules for every block:
- Cells hold only `h1`-`h6`, `p`, `ul`, `ol`, `li`, `a`, `img`, `strong`, `em`, `u`, `sub`,
  `sup`, `br`, `code`. No `span`, no `class`, no `style`. Icons are `:name:` in text.
- Buttons, call-to-action links, linked images and video links are written as in a).
- Variants are block classes. `cols-N` (1 to 4) is the column count from 730.
- A block reads cells by position and tolerates a missing or extra cell.

### hero

Purpose: page banner, call-to-action band, home carousel. Source: `banner`, `interactiveBanner`,
`carousel[carousel-type=banner-carousel]`.

Variants: `skinny` (`small-banner`, 1,706). Background without image: `dark-purple` (default),
`black`, `light-purple`. Image overlay: `overlay-30`, `-40`, `-50`, `-60`. `left`
(default is centre). Text width `width-25`, `-33`, `-50`, `-60`, `-80`. `pad-md`, `pad-lg`.
`expanded`. `title-small`, `title-large`. `video` (background video). `carousel` (one row per
slide, home pages).

Row: cell 1 media (desktop image, optional mobile image, or a link to the mp4 with a poster
image), cell 2 text (heading at the source level, subtitle, buttons), cell 3 optional foreground
image.

```html
<div class="hero skinny">
  <div>
    <div></div>
    <div>
      <h3>Connect with Us</h3>
      <p><strong><a href="/f52-synopsys-1211-02/contact-sales">Contact Sales :chevron-right:</a></strong></p>
    </div>
  </div>
</div>
```

```html
<div class="hero overlay-40 left width-60">
  <div>
    <div>
      <p><img src="https://content.da.live/catalan-adobe/eds-mig-20260914/f52-synopsys-1211-02/media/hero-1900x500.jpg" alt="AI Infra Summit"></p>
      <p><img src="https://content.da.live/catalan-adobe/eds-mig-20260914/f52-synopsys-1211-02/media/hero-730x325.jpg" alt=""></p>
    </div>
    <div>
      <h1>Synopsys Fusion Compiler</h1>
      <p>RTL-to-GDSII implementation</p>
      <p><strong><a href="https://www.synopsys.com/content/dam/x.pdf">Datasheet :arrow-down-to-line:</a></strong></p>
      <p><em><a href="https://players.brightcove.net/5748441669001/rka4xWwYG_default/index.html?videoId=6379238357112">Watch :play:</a></em></p>
    </div>
    <div><img src="https://content.da.live/catalan-adobe/eds-mig-20260914/f52-synopsys-1211-02/media/foreground.png" alt=""></div>
  </div>
</div>
```

States: button hover and focus. Video button opens a modal player, Escape and the close button
close it. `video`: muted autoplay loop, poster below 730. `carousel`: autoplay, dots, previous
and next, swipe, pause on hover. Mobile image below 730.

### article-hero

Source: `blogBanner[data-blog-banner-variant=article]`. Variants: `purple` (586),
`purple-blue` (272), `blue` (271): the gradient.

```html
<div class="article-hero purple-blue">
  <div>
    <div>
      <h1>Building an IP-XACT Design &amp; Verification Environment</h1>
      <p><a href="/f52-synopsys-1211-02/authors/john-swanson">John Swanson</a></p>
      <p>Jul 23, 2012 / 8 min read</p>
    </div>
  </div>
</div>
```

States: author link hover.

### author-profile, social-share, spotlight, breadcrumb

```html
<div class="author-profile">
  <div>
    <div><img src="https://content.da.live/catalan-adobe/eds-mig-20260914/f52-synopsys-1211-02/media/leader-aart.jpg" alt="Dr. Aart de Geus"></div>
    <div>
      <h2>Dr. Aart de Geus</h2>
      <p>Aart de Geus is the Co-founder and Executive Chair of Synopsys.</p>
      <p><a href="https://www.linkedin.com/in/aart-de-geus-2a624b23/">:linkedin-in:</a></p>
    </div>
  </div>
</div>
```

```html
<div class="social-share">
  <div><div>x-twitter, linkedin-in, facebook</div></div>
</div>
```

`social-share` builds the share URLs from the page URL and title. States: hover.

```html
<div class="spotlight">
  <div><div>Definition</div></div>
  <div><div><p>A 3DIC is a three-dimensional integrated circuit.</p></div></div>
</div>
```

`spotlight` variants: default `spotlight-header-indented` (168), `left` (2). Source: `spotlight`
with its `text`. Author boxes ("About The Author") are fragments that hold a `spotlight`.

```html
<div class="breadcrumb">
  <div><div><ul><li><a href="/f52-synopsys-1211-02/zh-cn/authors">Authors</a></li><li>Bernadette Mortell</li></ul></div></div>
</div>
```

### toc

Source: `tableOfContents`. `bar` (676): sticky bar under the hero with an optional button.
Default (1,000): titled list in the rail of articles.

```html
<div class="toc bar">
  <div><div><ul><li><a href="#overview">Overview</a></li><li><a href="#benefits">Key Benefits</a></li></ul></div></div>
  <div><div><a href="/f52-synopsys-1211-02/contact-sales">Get Started</a></div></div>
</div>
```

```html
<div class="toc">
  <div><div><p>Table of Contents</p><ul><li><a href="#1">Introduction</a></li><li><a href="#2">What is IP-XACT?</a></li></ul></div></div>
</div>
```

States: `bar` sticks below the header, marks the section in view, scrolls horizontally when it
overflows, smooth scroll with the header offset. Default: sticky in the rail from 730,
collapsible below (`tocSictkyArticlesMobile`), active item.

### cards

Source: `cards` (4,630), `product-card`. Row = one card: cell 1 image (may be empty), cell 2
text: paragraphs before the heading are label then date, `h4` title, paragraphs after it are the
description, a last paragraph with only a link is the call to action.

Variants: default asset card (4,390). `video` (249): cell 1 holds the thumbnail and a video
link. `solution` (93): text over the image, shown on hover. `agenda` (105): cell 1 time, cell 2
title, speakers `<ul>`, description behind "Read More", cell 3 colour `purple`, `teal`, `orange`.
`event` (18): cell 1 image, cell 2 `h4` name, then type, place, date and the link. `quick` (10). `carousel`. `cols-N`.

```html
<div class="cards cols-3">
  <div>
    <div><img src="https://content.da.live/catalan-adobe/eds-mig-20260914/f52-synopsys-1211-02/media/thumb.jpg" alt=""></div>
    <div>
      <p>White Paper</p>
      <h4>Building an AI Chip: Pre Silicon Planning</h4>
      <p><a href="/f52-synopsys-1211-02/ai/ai-chip-development/building-an-ai-chip">Download :chevron-right:</a></p>
    </div>
  </div>
  <div>
    <div></div>
    <div>
      <p>News</p>
      <p>November 9, 2026</p>
      <h4>EDA Express</h4>
      <p>Synopsys announces PrimeSim Continuum</p>
      <p><a href="https://www.eda-express.com/2021/04/synopsysprimesim-continuum.html">Read more :chevron-right:</a></p>
    </div>
  </div>
</div>
```

```html
<div class="cards agenda">
  <div>
    <div>9:00 AM - 9:30 AM PT</div>
    <div>
      <h4>Agentic AI for Chip Design &amp; Verification</h4>
      <ul><li>Jane Doe, Synopsys</li></ul>
      <p>These demos offer a behind-the-scenes look.</p>
    </div>
    <div>purple</div>
  </div>
</div>
```

States: the whole card is a link, hover. `video` opens the modal player. `solution` hover
overlay. `agenda` "Read More" and "Read Less". `carousel`: 3 per view from 730 (2 at `cols-2`,
4 at `cols-4`), 1 below, arrows, swipe.

### teasers

Source: `assetCard` (`component-card-b`, 394), `dynamicCards` (1,116), `cardContainer`,
`blogBanner` landing and featured (42), `pressRelease`. Static rows: the source renders these
lists on the server and the query is not in the HTML.

Variants: default flag card: cell 1 flag label, cell 2 optional image, cell 3 `h4`, text, link.
`post`: cell 1 image, cell 2 "5 min read / Nov 04, 2026", `h4` with link, authors, tags.
`featured`: as `post`, first row large, the others four per row. `logos`: cell 1 logo image,
cell 2 its link, a border that darkens on hover. `carousel`. `cols-N`. `size-xxs`, `size-xs`, `size-sm`, `size-md`, `size-lg`,
`size-xxl` (`card-size-*`).

```html
<div class="teasers cols-3">
  <div>
    <div>Webinar</div>
    <div></div>
    <div>
      <h4>Let Invisible Keys Secure Your IIoT Hardware</h4>
      <p><a href="https://www.synopsys.com/webinars/invisible-keys-from-pufs.html">Watch On-Demand</a></p>
    </div>
  </div>
</div>
```

```html
<div class="teasers post cols-3 carousel">
  <div>
    <div><img src="https://content.da.live/catalan-adobe/eds-mig-20260914/f52-synopsys-1211-02/media/multi-die-400x225.jpg" alt=""></div>
    <div>
      <p>5 min read / Nov 04, 2026</p>
      <h4><a href="/f52-synopsys-1211-02/blogs/chip-design/multi-die-design-real-world-projects">What Real-World Projects Reveal About Multi-Die Design</a></h4>
      <p>By <a href="/f52-synopsys-1211-02/authors/greg-sorber">Greg Sorber</a></p>
      <p>Tags: <a href="/f52-synopsys-1211-02/blogs/chip-design/category?tag=multi-die-system">Multi-Die</a>, <a href="/f52-synopsys-1211-02/blogs/chip-design/category?tag=design">Design</a></p>
    </div>
  </div>
</div>
```

States: hover, card link. Author initials circle when the author has no photo (the photo comes
from the index sheet `authors`). `carousel` as in `cards`, with centre mode below 730.

### key-benefits, box-links

Source: `keyBenefits` (622); `boxLink` (2,251) and `boxLinkContainer` (345).

```html
<div class="key-benefits cols-3">
  <div>
    <div><img src="https://content.da.live/catalan-adobe/eds-mig-20260914/f52-synopsys-1211-02/media/accelerate-1-purple.svg" alt="Faster Validation"></div>
    <div>
      <p><a href="/f52-synopsys-1211-02/ai/ai-chip-development">Faster Validation</a></p>
      <p>Automated testbench and validation ensure rapid first-silicon bring-up.</p>
    </div>
  </div>
</div>
```

The title is a link only when the source item has an `href`.

```html
<div class="box-links cols-2">
  <div><div><h2>Tools</h2></div></div>
  <div><div><a href="/f52-synopsys-1211-02/ja-jp/implementation-and-signoff/ams-simulation/primesim-spice">PrimeSim SPICE</a></div></div>
  <div><div><p>Nov 15-20, 2026</p><p><a href="https://sc26.supercomputing.org/">Supercomputing 2026</a></p><p>Chicago, IL</p></div></div>
</div>
```

A row with a heading is the title. States: hover (arrow icon, background), whole box is the
link. `key-benefits` hover when linked.

### columns

Source: `column` rows of default content (rule in b), `imageTextCta` (532), `textImage2Column`
(140), `imageAndLinks`, `featuredImageTextLinks`, `cardContainer` cells of image and text.

Variants: widths `w-3-9`, `w-9-3`, `w-4-8`, `w-8-4` (default is equal cells). `divider`.
`media`: image and text, 6 | 6, the cell order gives the side (`mediatext`, `textmedia`), title
`h2`, subtitle `h3`. `narrow`: image 4 | text 8. `cols-N` when rows repeat.

```html
<div class="columns media">
  <div>
    <div><img src="https://content.da.live/catalan-adobe/eds-mig-20260914/f52-synopsys-1211-02/media/infographic.jpg" alt=""></div>
    <div>
      <h2>AI Chip Development Infographic</h2>
      <p>Discover the future of AI chip design with Synopsys.</p>
      <p><strong><a href="https://www.synopsys.com/content/dam/synopsys/solutions/ai/ai-chips-infographic.pdf">Download :chevron-right:</a></strong></p>
    </div>
  </div>
</div>
```

The block takes title size, title colour and alignment from its section's styles. States:
stacks below 730, the image cell first when the source uses `col-sm-push`. Button hover.

### tabs

Source: `floatingTabs` (374): `horizontal-tabs` (default, 321, of which 188 have one panel),
variant `vertical` (53). Row = one panel: cell 1 label, cell 2 content, optional cell 3 is a
second column beside it (`imageTextCta`, a 6 | 6 `column`). Inside a panel a `<ul>` whose items
are only links is drawn as box links, two per row. Other nested blocks become default content.

```html
<div class="tabs vertical">
  <div>
    <div>Architecture Exploration</div>
    <div>
      <h2>Architecture Exploration</h2>
      <p>Architecture exploration is a crucial phase in AI chip development.</p>
      <ul><li><a href="/f52-synopsys-1211-02/verification/virtual-prototyping/platform-architect">Platform Architect</a></li></ul>
    </div>
  </div>
  <div>
    <div>Software</div>
    <div><p>Shift left with virtual prototypes.</p></div>
    <div><img src="https://content.da.live/catalan-adobe/eds-mig-20260914/f52-synopsys-1211-02/media/software.jpg" alt=""></div>
  </div>
</div>
```

States: first tab active, click, arrow keys, `#<label slug>` opens a tab. Below 730 the tabs
are an accordion with "+" and "-", one panel open.

### accordion, quote

Source: `faq` (63); `quote` (260).

```html
<div class="accordion">
  <div>
    <div>What is AI Chip Development?</div>
    <div><p>AI Chip Development involves designing specialized chips.</p></div>
  </div>
</div>
```

States: closed at load, click toggles one item, caret up and down, `aria-expanded`.

```html
<div class="quote carousel">
  <div>
    <div>"Meeting industry security requirements can be challenging."</div>
    <div><p>Avi Bauer</p><p>Vice President of Hardware Engineering, Arbe</p></div>
    <div><img src="https://content.da.live/catalan-adobe/eds-mig-20260914/f52-synopsys-1211-02/media/arbe.svg" alt="Arbe Logo"></div>
    <div><a href="/f52-synopsys-1211-02/success-stories/arbe">Read the story</a></div>
  </div>
</div>
```

Cell 4 (33 quotes) makes the quote a link. `carousel`: one quote per view, arrows, dots, swipe.

### carousel

Source: `contentCarousel` (60), `carousel` with images or mixed content, `logoCarousel` (24).
Row = one slide, cells = columns inside the slide.

Variants: default (one slide per view, arrows, dots, autoplay 6 s when the source has
`data-autoplay`). `images` (zoom modal). `logos` (row = logo image, then its link).
`no-mobile` (`mobile-no-carousel`: slides stack below 730).

```html
<div class="carousel logos">
  <div>
    <div><img src="https://content.da.live/catalan-adobe/eds-mig-20260914/f52-synopsys-1211-02/media/tsmc.svg" alt="TSMC"></div>
    <div><a href="/f52-synopsys-1211-02/partners/tsmc">TSMC</a></div>
  </div>
</div>
```

```html
<div class="carousel">
  <div>
    <div><h2>Kioxia</h2><p>SSD application engineering</p></div>
    <div><p>PrimeSim Continuum cut our runtime.</p></div>
  </div>
</div>
```

States: previous, next, dots, swipe, autoplay pause on hover and focus, keyboard. `logos`:
visible count by width, loops.

### video, embed

Source: `video` (437), Brightcove playlists in `htmlTextOnly` (20); `googleMap` (23), iframes.

```html
<div class="video modal">
  <div>
    <div>
      <p><img src="https://content.da.live/catalan-adobe/eds-mig-20260914/f52-synopsys-1211-02/media/poster.jpg" alt=""></p>
      <p><a href="https://players.brightcove.net/5748441669001/rka4xWwYG_default/index.html?videoId=6248890317001">https://players.brightcove.net/5748441669001/rka4xWwYG_default/index.html?videoId=6248890317001</a></p>
    </div>
  </div>
</div>
```

Variants: default inline, `modal`, `playlist` (the link carries `playlistId`). The poster is the
authored thumbnail, else the Brightcove poster. States: play button hover, click loads the
player, modal open and close, 16:9.

```html
<div class="embed">
  <div><div><a href="https://www.google.com/maps/embed/v1/place?q=35.611679,139.628600">https://www.google.com/maps/embed/v1/place?q=35.611679,139.628600</a></div></div>
  <div><div>350 x 350</div></div>
</div>
```

`embed` writes an iframe for Google Maps, YouTube, Podbean and Spotify links. The second row is
optional: width x height.

### form

Source: `marketoFormsContainer` (664), `mktoForm` (88), `subscriptionForm` (223), Marketo in
`htmlTextOnly`. Variants: `landing` with `purple` (473), `white` (185), `dark` (6): row 1 is the
intro (h1, text, optional image) on the left, the form is on the right. `subscribe`.
`two-column` (form class).

```html
<div class="form landing purple">
  <div><div><h1>SRAM PUF: A Revolutionary Approach</h1><p>Discover why SRAM PUF is the market-leading PUF solution.</p></div></div>
  <div><div>title</div><div>Download SRAM PUF White Paper</div></div>
  <div><div>form</div><div>6087</div></div>
  <div><div>known-visitor-form</div><div>7792</div></div>
  <div><div>asset-type</div><div>White Paper</div></div>
  <div><div>success</div><div>Thanks for subscribing to the blog!</div></div>
</div>
```

Key rows: `title`, `form`, `known-visitor-form`, `asset-type`, `success` (a message or a link),
`blocked-domains`, `domain-error`. The first row is the intro only when its first cell is not a
key. States and behaviour in e).

### listing, blog-nav

Source: `blogsDev` `mostRecentArticles` (435 author pages) and `categoryPage` (2), `search`
result pages (7), `search` blog sub navigation (415) with `blogsDev browseByTags`.

```html
<div class="listing faceted">
  <div><div>sheet</div><div>events</div></div>
  <div><div>facets</div><div>Products=product, Solutions=solution, Availability=eventType</div></div>
  <div><div>sort</div><div>eventDate desc</div></div>
  <div><div>page-size</div><div>10</div></div>
</div>
```

Variants: `faceted` (search box, facets, sort, list and grid switch, paging). `author` (posts of
the page's author, 5 per page, row `sheet` only). `category` (stories and writers counts, top
writers, posts of `?tag=`). Keys: `sheet`, `filter` (`column=value`), `facets`, `sort`,
`page-size`, `title`. Data and behaviour in e).

```html
<div class="blog-nav">
  <div><div><a href="/f52-synopsys-1211-02/blogs/chip-design">Silicon to Systems Blog</a></div></div>
  <div>
    <div>
      <h2>Browse by Tags</h2>
      <p>Use these tags to explore our category pages to learn more</p>
      <ul><li><a href="/f52-synopsys-1211-02/blogs/chip-design/category?tag=5g-wireless">5G Wireless</a></li></ul>
    </div>
  </div>
</div>
```

`blog-nav` states: sticky under the header, search box (Enter goes to the blog landing page with
`?q=`), "Topics" button opens and closes the tag panel, tag hover.

### promo, search-box, table

Source: `htmlTextOnly` classes; `table` (150).

```html
<div class="promo">
  <div>
    <div>
      <h2>Subscribe to the Synopsys IP Technical Bulletin</h2>
      <p>Includes in-depth technical articles, white papers and videos.</p>
      <p><strong><a href="https://online.synopsys.com/subscription-center.html">Subscribe</a></strong></p>
    </div>
    <div><img src="https://content.da.live/catalan-adobe/eds-mig-20260914/f52-synopsys-1211-02/media/bulletin.png" alt=""></div>
  </div>
</div>
```

`promo`: purple box `#5a2a82`, white text. Variant `outline` (`#extraInfo`: border
`1px solid #80539c`, centred). The image cell is optional.

```html
<div class="search-box">
  <div><div>Search IP</div><div><a href="https://www.synopsys.com/dw/ipsearch.php?p=">https://www.synopsys.com/dw/ipsearch.php?p=</a></div></div>
</div>
```

`search-box`: cell 1 placeholder, cell 2 target. Enter goes to the target plus the encoded query.

```html
<div class="table header">
  <div><div>coreKit</div><div>IP-XACT Component</div></div>
  <div><div>Supported implementation tools</div><div>Single ASCII file</div></div>
</div>
```

`table` renders a `<table>` with the source's 1 px `#ccc` borders and 8 px cell padding.
Variants: `header` (the first row is `th`), `sticky`. It scrolls sideways when it overflows.

### rail-card, dw-products

```html
<div class="rail-card">
  <div><div><a href="/f52-synopsys-1211-02/support/training">Training</a></div></div>
  <div><div><ul><li><a href="https://www.synopsys.com/support/training/self-paced.html"><strong>NEW</strong> Self-Paced Learning</a></li></ul></div></div>
</div>
```

Source: `rightRailItem` (166 as components, 2,618 in inherited rails): purple flag with a
triangle, then links. `NEW` is the source's `span.label-new`. States: hover.

```html
<div class="dw-products">
  <div><div>dwc_sms_vl35x000vpnnsmdrb32ks</div><div>9415</div></div>
</div>
```

Source: `dwProductsDownloads` (174). Row = component name, id. Behaviour in e).

### mosaic, content-tile

```html
<div class="mosaic cols-3">
  <div>
    <div>#4c9ec9</div>
    <div><p>Interview: the golden signoff framework of Fusion Compiler</p><p><a href="https://www.synopsys.com/blogs/x">Read the interview</a></p></div>
  </div>
  <div>
    <div><p><img src="https://content.da.live/catalan-adobe/eds-mig-20260914/f52-synopsys-1211-02/media/poster.jpg" alt=""></p><p><a href="https://players.brightcove.net/6024607096001/rka4xWwYG_default/index.html?videoId=6202928581001">https://players.brightcove.net/6024607096001/rka4xWwYG_default/index.html?videoId=6202928581001</a></p></div>
    <div><p>Watch the video</p></div>
  </div>
</div>
```

Source: the `mosaicCard*` components (54 cards on 10 pages). Cell 1 is a colour or media.

```html
<div class="content-tile">
  <div>
    <div><img src="https://content.da.live/catalan-adobe/eds-mig-20260914/f52-synopsys-1211-02/media/investor-day.jpg" alt=""></div>
    <div><p>Sep 30, 2026</p><p>News</p><p><a href="https://news.synopsys.com/2026-09-30-Synopsys-Holds-2026-Investor-Day">Synopsys Holds 2026 Investor Day</a></p></div>
  </div>
</div>
```

Source: `contentTile` (27). Cell 1 image or video. States: hover, whole tile is the link.

### fragment

```html
<div class="fragment">
  <div><div><a href="/f52-synopsys-1211-02/fragments/contact-us-general">/f52-synopsys-1211-02/fragments/contact-us-general</a></div></div>
</div>
```

The fragment's sections are placed inside the host section, with their own styles. The host
section carries the background and spacing of the band around the source fragment.

### A page, as an example

```html
<body>
  <header></header>
  <main>
    <div>
      <div class="hero skinny">
        <div><div></div><div><h1>Company Profile</h1></div></div>
      </div>
    </div>
    <div>
      <h2>Intelligent Analysis</h2>
      <p>Synopsys ParagonX is a fast layout parasitics tool.</p>
      <div class="section-metadata">
        <div><div>Style</div><div>span-6, top-md, bottom-sm</div></div>
        <div><div>Id</div><div>overview</div></div>
      </div>
    </div>
    <div>
      <p><img src="https://content.da.live/catalan-adobe/eds-mig-20260914/f52-synopsys-1211-02/media/paragonx.jpg" alt="ParagonX"></p>
      <div class="section-metadata">
        <div><div>Style</div><div>span-6, top-md, zoom</div></div>
      </div>
    </div>
    <div>
      <div class="fragment">
        <div><div><a href="/f52-synopsys-1211-02/fragments/contact-us-general">/f52-synopsys-1211-02/fragments/contact-us-general</a></div></div>
      </div>
      <div class="metadata">
        <div><div>title</div><div>Company Profile | Synopsys</div></div>
        <div><div>template</div><div>content-page-template</div></div>
      </div>
    </div>
  </main>
  <footer></footer>
</body>
```

## d) Fragments, nav and footer documents

**Fragments.** The source HTML names an experience fragment (`cmp-experiencefragment--<name>`)
but not its path, and one name can have several contents (`interface-ip`: 4). 104 distinct
(name, language, content) fragments were found, 25 of them on one page only.

- Path: `/f52-synopsys-1211-02/fragments/<name>` for English,
  `/f52-synopsys-1211-02/fragments/<lang>/<name>` for the other languages. `<name>` is the
  source name with runs of hyphens as one hyphen.
- More than one content for a name and language: the most used keeps `<name>`, the others get
  `<name>-2`, `<name>-3`. The importer records (name, language, hash of the source text) to
  path in `M/import/fragments.json` and never renumbers.
- Inherited rails (a, rule 7): 27 distinct contents on 880 pages, 7 of them on one page. Path
  `/f52-synopsys-1211-02/fragments/[<lang>/]rail-<n>`, numbered by use, recorded in the same
  file. The largest: ja-jp press releases (394 pages), zh-tw blog (167), zh-tw press (140).
- Used on one page: inlined. Empty in the server HTML (`ask-synopsys`, and the zh-cn
  `blog-sub-navigation` and `blog-subscription-form`): dropped.
- Most used: `blog-sub-navigation` (415), `talk-with-an-ip-expert-contact-us-band` (287),
  `technical-bulletin` (300), `rail-promotion-ag-newsletter` (277), `contact-us-general` (264),
  `find-your-ip` (227), `blog-subscription-form` (223), `dw-resources` (206).

Nav and footer paths below are under `/f52-synopsys-1211-02`.

**Nav**, one document per language: `/nav` (en, 3,613 pages), `/ja-jp/nav`, `/zh-cn/nav`,
`/zh-tw/nav`, `/ko-kr/nav`, and `/nav-landing` (logo only: template `form`, 3 pages). The header reads the page metadata `nav`, else `languageRoot() + '/nav'`.
Model: the sections by role of `M/prior/migrate-header-skill/references/eds-header.md`, as in
`M/prior/spm-ft-0001/sections/nav.html`: utility bar, brand, one `h3` per menu with its panel
content, tools. The `/<lang>/refs/global-navigation/**` pages are the source of the panels.

**Footer**, documents:

| Document | Pages | Used by |
| --- | ---: | --- |
| `/footer` | 2,972 | English default |
| `/footer-blog` | 641 | English, templates `chip-design-article-page`, `-author-page`, `-landing-page` |
| `/zh-cn/footer` | 542 | zh-cn default |
| `/zh-cn/footer-blog` | 360 | zh-cn, the `chip-design-*` templates |
| `/ja-jp/footer`, `/zh-tw/footer`, `/ko-kr/footer` | 629, 348, 66 | language default |
| `/footer-landing` | 4 | templates `form`, `empty-campaign-landing-page` |

The footer reads the page metadata `footer`, else `languageRoot() + '/footer'`. The importer
writes `nav` and `footer` only on pages that do not use the language default. The "Cookie
Settings" link the source adds by script is not migrated. `try-synopsys-cloud-footer` is a
normal fragment (a `hero skinny` band).

## e) Dynamic data

**Index sheets.** The importer step `M/import/index.mjs` (owner: `listing`) writes one JSON
workbook per language to DA: `/f52-synopsys-1211-02/data/index.json` and
`/f52-synopsys-1211-02/<lang>/data/index.json`. Blocks fetch `languageRoot() + '/data/index.json'`
with `?sheet=<name>&limit=1000&offset=<n>` until `total` is reached.

| Sheet | Rows | Used by |
| --- | --- | --- |
| `blogs` | `content-type` Blog (922) | blog landing, category and author pages |
| `articles` | Article, Technical Paper (380) | `/articles`, `/articles/category` |
| `webinars`, `events`, `success-stories` | Webinar (231), Event (202), Success Story (74) | their result pages |
| `resources` | White Paper, eBook, Video, Datasheet, Demo, Report | `/resources` |
| `news` | Press Release, News, News Release (120) | `/newsroom` |
| `authors` | template `chip-design-author-page` (435): `path`, `name`, `image` | author photos, top writers |

Columns: `path` (source path without `.html`), `title`, `description`, `image`, `type`, `date`
(ISO), `readTime`, `authors` (`Name=/authors/slug`, `;` between), `tags` (`slug=Label`, `;`
between), `product`, `solution`, `businessArea`, `stage`, and for events `eventDate`,
`eventType`, `location`. Sources: the `search*` metas, `blogBanner` data attributes, the page
tag list. The owner adds a column when a result card needs it.

**listing.** The source draws these lists with Coveo Atomic. Its tokens come from
`/bin/cs-info.json` on the source domain and expire, so Coveo cannot run on another domain.
The block renders from the sheet instead, in the source's default order (newest first), with the
source's facets (`facets` row), text filter, sort by date, list and grid view, page size and
pager. Facet state is in the URL query. Relevance sort and "did you mean" are not migrated.
`category.<tag>.html` links become `category?tag=<tag>`.

**teasers post.** Static rows, written by the importer from the server HTML (see c).

**Site search.** The header search field goes to the source's result page
`https://www.synopsys.com/search.html`, which is not in the sitemap and not migrated. The header
owner takes the query parameter from the source script. `search-box` goes to its authored target.

**Marketo (`form`).** As the source: load `//online.synopsys.com/js/forms2/js/forms2.min.js`,
then `MktoForms2.loadForm('//online.synopsys.com', '367-MRV-360', <form>)`. Keep: title, two
column layout, the known-visitor short form, blocked e-mail domains with their message, the
success message or redirect, prefill of the tracking code from `?cmp`. Load on view, not eager.

**Brightcove (`video`, video links).** As the source: the Brightcove player of `<account>` and
`<player>` from `players.brightcove.net`, loaded on click (on view for an inline player without
a poster). The poster comes from the block.

**Maps and other iframes (`embed`).** The source's iframe URL, loaded lazily.

`head.html` sets a CSP with `strict-dynamic` and trusted types: load third-party scripts with
`loadScript` of `scripts/aem.js`, never with an inline script.

**dw-products.** As the source: `POST https://www.synopsys.com/dw/api/v1/component` with the
ids and names, then two tabs ("Products", "Downloads & Documentation") in the source's table
markup, with "Show Documents" and "Hide Documents". Not verified from another origin: if the API
refuses, the block renders nothing, as the source does without data, and the owner reports it.

**Not migrated:** OneTrust, the chat widget and `ask-synopsys`, Adobe Launch, Ahrefs,
Cloudflare Insights, Eloqua, the Font Awesome kit.

## f) Design tokens

Values from the source CSS (`css-rules.mjs`, file `synopsys-pagelibs`). `global` defines them
in `styles/styles.css` on `:root`. Blocks use the tokens, not literals.

| Token | Value |
| --- | --- |
| `--color-text` | `#111c24` |
| `--color-purple` (headings, titles) | `#5a2a82` |
| `--color-purple-mid` (buttons) | `#7e45af` |
| `--color-purple-light` | `#80539c` |
| `--color-purple-dark` | `#2d1541` |
| `--color-link` / `--color-link-hover` | `#316aca` / `#23527c` |
| `--color-grey-text` | `#646e81` |
| `--color-grey-dark` | `#555` |
| `--color-bg-light` (`light-grey`) | `#f7f7fa` |
| `--color-bg-page` | `#fff` |
| `--color-border` / `--color-border-light` | `#c4c4c4` / `#e3e3e3` |
| `--color-orange` / `--color-orange-dark` | `#fcaf1a` / `#e07c05` |
| `--color-blue` / `--color-teal` / `--color-green` | `#4c9ec9` / `#00b2a9` / `#9c3` |
| `--gradient-dark-purple` | `linear-gradient(107.7deg,#2d1541 0,#5a2a82 50%,#7e45af 100%)` |
| `--gradient-black` | `linear-gradient(107.7deg,#000 0,#191c20 35%,#646e81 100%)` |
| `--gradient-light-purple` | `linear-gradient(107.7deg,#7e45af 0,#e5daef 100%)` |
| `--gradient-article-purple` | `linear-gradient(to right,#5a2a82,#714794,#956eb6)` |
| `--gradient-article-purple-blue` | `linear-gradient(to right,#8770a6,#606397,#446d92)` |
| `--gradient-article-blue` | `linear-gradient(to right,#416d91,#7eaad3)` |
| `--font-family` | `"Roboto", Arial, sans-serif` (weights 300, 400, 500, 700) |
| `--font-weight-body` / `--font-weight-button` | `300` / `400` |
| `--line-height-body` | `1.6` |
| `--body-size` (p, ul, ol in `rich-text`) | 15 px, 14 px from 730, 16 px from 1200 |
| `--text-size` (body of a `text`) | 16 px, line height 160 % |
| `--heading-size-h1` … `-h6` | 35, 30, 26, 22, 20, 20 px; from 730: 44, 38, 22, 20, 20, 20; from 1200: 60, 44, 34, 30, 26, 22. Weight 300, line height 1.1, margin 15 px 0 |
| `--page-title-size` | as `h1`, 45 px from 1200 |
| `--title-size` / `-small` / `-large` | 24 / 24 / 32 px; from 730: 32 / 24 / 40 px. Margin 0 |
| `--text-gap` | body margin `16px 0 24px`, from 730 `24px 0 0`. Button row margin-top 24 px, gap 24 px. `p` margin `0 0 10px` |
| `--space-xs` / `-sm` / `-md` | 15 / 30 / 60 px (mobile values in a) |
| `--container` | 100 % below 992, 970 px from 992, 1170 px from 1200. Padding 15 px |
| `--gutter` | 30 px |
| `--radius` / `--radius-button` | 5 px / 5 px (`.btn`: 4 px) |
| `--button-min-height` / `--button-padding` | 40 px / `0 24px`, min width 140 px, max 300 px |
| `--button-hover` | `inset 0 0 0 99999px rgba(0,0,0,.2)` |
| `--shadow-card` / `--shadow-card-hover` | `0 1px 7px 0 rgba(0,0,0,.15)` / `0 1px 7px 0 rgba(0,0,0,.3)` |
| Breakpoints | 730 (main: `min-width:730px`, `max-width:729px`), 992, 1200, 1130 (header), 480, 1400 |

`html` is 10 px, `box-sizing` and font smoothing as the source. Global defaults use
`:where(...)` so that one block class wins.

## g) Ownership

A group owns `blocks/<block>/` and `M/import/components/<component>.mjs`. `owners.json` is the
machine-readable form. Shared files: `global` owns `styles/`, `scripts/scripts.js`, `fonts/`,
the section styles, the section grid, the button and link rules of a), and `scripts/slider.js`.
`icons/` is shared: add a file, never change one. An icon's name is its Font Awesome name
(`chevron-right`, `arrow-down-to-line`, `play`, `download`, `caret-up`, `linkedin-in`).

`scripts/slider.js` exports `createSlider(track, { perView, autoplay, dots, arrows, loop })`:
`track` is the element whose children are the slides, `perView` a number or
`{ 0: 1, 730: 3 }`. It returns `{ go(index), next(), prev(), destroy() }` and adds the classes
`slider`, `slider-track`, `slider-prev`, `slider-next`, `slider-dots`. Used by `hero`, `cards`,
`teasers`, `quote` and `carousel`.

| Group | Blocks | Components | Sample pages |
| --- | --- | --- | --- |
| header | `header` | `topNav`, `subNavLeft`, `subNavRight`, `navList`, `subNavLinks`, `mediaLinkTile`, `topNavAd` | every page |
| footer | `footer` | `siteFooter`, `siteFooterChinese` | every page |
| global | `fragment` | `synopsysContainer`, `column`, `text`, `richTextEditor`, `html`, `image`, `interactiveImage`, `pageTitle`, `anchor`, `separator`, `callToAction`, `experiencefragment`, `pageList`, `list`, `downloads`, `socialLinks`, `ghost`, `factoid` | every page |
| hero | `hero` | `banner`, `interactiveBanner` | `/`, `/implementation-and-signoff/custom-design-platform.html`, `/ai/agentic-ai.html`, `/solutions/automotive.html`, `/partners/bluespec.html`, `/ja-jp/implementation-and-signoff/ams-simulation.html` |
| article | `article-hero`, `author-profile`, `social-share`, `spotlight` | `blogBanner`, `authorProfile`, `socialShare`, `spotlight` | `/blogs/chip-design/custom-design-family-customer-testimonials.html`, `/articles/design-verification-environment.html`, `/blogs/chip-design/securing-network-traffic-macsec-ethernet.html`, `/glossary/what-is-a-data-center.html`, `/authors/aart-de-geus.html`, `/newsroom.html` |
| toc | `toc`, `breadcrumb` | `tableOfContents`, `breadcrumb` | `/ai/ai-chip-development.html`, `/events/ai-infra-summit.html`, `/glossary/what-are-atomistic-simulations.html`, `/articles/usb-ip-finfet.html`, `/zh-cn/authors/bernadette-mortell.html` |
| cards | `cards` | `cards`, `product-card` | `/designware-ip/interface-ip/ethernet/ethernet-scale-up-networking-esun.html`, `/implementation-and-signoff/custom-design-platform.html`, `/zh-cn/china/events.html`, `/events/signoff-sig.html`, `/community/snug/snug-taiwan.html`, `/community/snug.html` |
| teasers | `teasers` | `assetCard`, `dynamicCards`, `cardContainer`, `pressRelease`, `contentTypeListing` | `/videos/security-ip.html`, `/glossary/what-is-a-data-center.html`, `/blogs/chip-design.html`, `/zh-cn/blogs/chip-design.html`, `/success-stories/astera-labs-accelerates-hpc-systems-time-to-market.html`, `/zh-cn/china/about-us/newsroom.html` |
| items | `key-benefits`, `box-links` | `keyBenefits`, `boxLink`, `boxLinkContainer` | `/ai/agentic-ai.html`, `/zh-cn/designware-ip/ip-market-segments/edge-ai.html`, `/ja-jp/implementation-and-signoff/ams-simulation.html`, `/solutions/multi-die-design.html`, `/newsroom.html`, `/` |
| columns | `columns` | `imageTextCta`, `textImage2Column`, `imageAndLinks`, `featuredImageTextLinks` | `/partners/bluespec.html`, `/ai/ai-chip-development.html`, `/cloud/astera-labs.html`, `/events/ai-infra-summit.html`, `/careers/verify-your-recruitment.html`, `/support.html` |
| tabs | `tabs` | `floatingTabs` | `/ai/ai-chip-development.html`, `/events/ai-infra-summit.html`, `/partners/bluespec.html`, `/designware-ip/interface-ip/ddr/ddr-universal-umctl2.html`, `/solutions/automotive.html`, `/zh-cn/implementation-and-signoff/physical-implementation/fusion-compiler/simply-better-ppa.html` |
| accordion-quote | `accordion`, `quote` | `faq`, `quote` | `/ai/ai-chip-development.html`, `/solutions/automotive.html`, `/resources/sram-puf-cryptographic-key-protection.html`, `/partners/bluespec.html`, `/cloud/hcltech-success.html`, `/glossary/what-is-a-data-center.html` |
| carousel | `carousel` | `carousel`, `contentCarousel`, `logoCarousel` | `/ja-jp/implementation-and-signoff/ams-simulation.html`, `/zh-cn/designware-ip/interface-ip/die-to-die/ucie.html`, `/contact-sales.html`, `/cloud/startup-program.html`, `/cloud/astera-labs.html`, `/converge/newsroom.html` |
| media | `video`, `embed` | `video`, `googleMap` | `/implementation-and-signoff/test-automation/synopsys-ip-sms.html`, `/ai/agentic-ai.html`, `/designware-ip/interface-ip/pci-express/pci-express-4.html`, `/videos/security-ip.html`, `/ja-jp/japan/company/company-profile.html`, `/events/signoff-sig.html` |
| forms | `form` | `marketoFormsContainer`, `mktoForm`, `subscriptionForm` | `/resources/sram-puf-cryptographic-key-protection.html`, `/webinars/automotive-margin.html`, `/ai/ai-chip-development.html`, `/blogs/chip-design/custom-design-family-customer-testimonials.html`, `/contact-sales.html`, `/converge/executive-forum-2025.html` |
| listing | `listing`, `blog-nav` | `search`, `blogsDev` | `/authors/aart-de-geus.html`, `/articles/category.html`, `/zh-cn/blogs/chip-design/category.html`, `/blogs/chip-design.html`, `/newsroom.html`, `/success-stories.html` |
| html | `promo`, `search-box`, `table` | `htmlTextOnly`, `table` | `/articles/design-verification-environment.html`, `/zh-cn/designware-ip/technical-bulletin/pam3-technology-implementation-usb4-v2.html`, `/designware-ip/interface-ip/ddr/ddr-universal-umctl2.html`, `/glossary/what-is-a-data-center.html`, `/company/legal/vulnerability-disclosure-policy/advisories.html`, `/success-stories/view-all.html` |
| rail | `rail-card`, `dw-products` | `rightRailItem`, `dwProductsDownloads` | `/videos/security-ip.html`, `/support.html`, `/designware-ip/interface-ip/ddr/ddr-universal-umctl2.html`, `/implementation-and-signoff/test-automation/synopsys-ip-sms.html`, `/company/contact-synopsys/office-locations/armenia/about-us/management-team.html`, `/ja-jp/japan/press-releases/2017-releases.html` |
| tiles | `mosaic`, `content-tile` | `mosaicCardContainer`, `mosaicCardColor`, `mosaicCardRTE`, `mosaicCardVideoImage`, `contentTile` | `/zh-cn/implementation-and-signoff/physical-implementation/fusion-compiler/simply-better-ppa.html`, `/ja-jp/implementation-and-signoff/ams-simulation.html`, `/newsroom.html`, `/ai/agentic-ai.html`, `/zh-cn/solutions/low-power-design.html` |

A transform may emit a block of another group (`carousel` emits `hero carousel`, `blogBanner`
emits `teasers featured`, `column` emits `columns`, `htmlTextOnly` emits `table`, `video`,
`form`, `embed`). It writes exactly the markup of c). The block's group owns how it looks.

## h) Decisions

1. **One section per source component.** Reason: spacing and background are authored per
   component and no joint has a dominant value, so only a section can carry them exactly.
   Vertical drift is the main source of mismatch.
2. **Spacing as tokens, in two layers (`top-*`, `band-top-*`).** Reason: the tokens are not a
   linear scale (all three top values are 40 px on a phone), so sums in pixels would be wrong.
3. **Title size, colour and alignment are section styles; the title is always `h2`.** Reason:
   three sizes and two colours do not map to heading levels, and the body's own headings use
   another scale (`h2` is 44 px at 1200).
4. **`rich-text` style for `richTextEditor`.** Reason: its paragraphs are 15 / 14 / 16 px by
   width, a `text` body is always 16 px.
5. **Section grid (`span-N`, `stack`) for layout rows that hold blocks.** Reason: no nested
   blocks, and 3,407 pages have a 9 | 3, 3 | 9, 8 | 4 or 4 | 8 row at the top level (an article
   with its rail, or a narrow column). A `columns` block is used only when it reproduces the row
   exactly.
6. **Buttons are `strong` and `em` links; a plain link alone in a paragraph stays a link.**
   Reason: 1,505 such links are body text. Call-to-action links are marked by their chevron
   icon. 117 bold or italic links alone in a paragraph lose the emphasis, so that they are not
   buttons.
7. **`hero` covers the skinny title band, the call-to-action band and the home carousel.**
   Reason: one source component with one set of options.
8. **Carousels are a variant of the item block (`cards`, `teasers`, `quote`, `hero`), with one
   shared `scripts/slider.js`.** Reason: no nested blocks, and the slide must look like the
   static item.
9. **`cards` and `teasers` are two blocks.** Reason: two source families (`component-assetcard`
   and `component-card-b`) with different markup and looks, each with its own variants.
10. **`dynamicCards` is static rows.** Reason: the server renders the result and the query is
    not in the HTML, so an index could not reproduce the source's choice.
11. **Coveo lists become `listing` on index sheets.** Reason: Coveo's tokens are bound to the
    source domain. Marketo, Brightcove and Google Maps stay as the source uses them.
12. **Anchors are section ids, kept as the source wrote them.** Reason: `toc` and inbound links
    use `#1`, `#overview`, which heading text cannot give.
13. **Fragments are identified by name, language and content.** Reason: the HTML has no
    fragment path and one name has several contents.
14. **JSON-LD is page metadata.** Reason: DA strips scripts. `global` writes the script element.
15. **The banner's per-instance `style` element is not migrated.** Reason: three rule sets,
    all implied by the mobile image.
16. **Layout never depends on the template.** Reason: 43 `content-page-template` pages use the
    article rail too. The template is a body class for type and chrome differences only.
17. **`/refs/global-navigation/**` pages are not migrated.** Reason: they are the header's
    content, published as pages by the source.
