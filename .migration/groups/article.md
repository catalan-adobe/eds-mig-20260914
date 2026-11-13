# Group article: article-hero, author-profile, social-share, spotlight

Owner of `blocks/article-hero/`, `blocks/author-profile/`, `blocks/social-share/`,
`blocks/spotlight/` and the transforms `blogBanner.mjs`, `authorProfile.mjs`,
`socialShare.mjs`, `spotlight.mjs`. No new icon: `x-twitter`, `linkedin-in` and `facebook`
were in `icons/` already.

## article-hero

Source: `blogBanner[data-blog-banner-variant=article]` (1,129). One row, one cell: `h1`, a
paragraph of authors, a paragraph "date / read time".

```html
<div class="article-hero purple-blue">
  <div><div>
    <h1>Building an IP-XACT Design &amp; Verification Environment with Synopsys IP</h1>
    <p><a href="/f52-synopsys-1211-02/authors/john-swanson">John Swanson</a></p>
    <p>Jul 23, 2012 / 8 min read</p>
  </div></div>
</div>
```

- Variants: `purple` (586, also the look without a variant), `purple-blue` (272), `blue`
  (271). The source's `green-blue-gradient` is not used on any page and not built.
- Authors are kept as the source has them: links, plain names (60 pages have no author page),
  or both, separated by commas. 3 pages have no authors, 10 no date: the paragraph is left out
  or holds only the read time.
- The block wraps the " / " of the last paragraph in a span for the source's 20 px on each
  side. A paragraph without " / " stays as it is.
- 259 px high, 344 px from 1200. Author link hover: underline, colour stays white.
- The transform also writes the page metadata `publication-date` (ISO), `authors` (names,
  comma separated) and `read-time`.

## teasers featured (rows only, the block is the teasers group's)

Source: `blogBanner` `landing` (4) and `cmp-featured-blogbanner` (38), on `/blogs/chip-design`,
`/articles`, `/resources`, `/webinars`, `/success-stories`. Each is one mergeable row of
`teasers featured`: cell 1 the image, cell 2 date line (when the source has one), `h4` with
the link, the authors line ("By …", "Feat. …"), the tags line ("Tags: a, b").

- The landing banner stays a block of its own without `cols-N` (the `column` transform adds
  `cols-4` or `cols-3` to the merged featured rows). The teasers block draws a `featured`
  block without `cols-N` large.
- Dropped on purpose (`ctx.drop`): the mobile rendition of the landing image (the same
  picture, smaller) and the author photo circles (the teasers block reads photos from the
  `authors` sheet).

## author-profile

Source: `authorProfile` (435). One row: cell 1 the photo, cell 2 `h2` name, biography
paragraphs, then "Follow on:" and a paragraph of icon links.

```html
<div class="author-profile">
  <div>
    <div><img src="…/media/leader-aart.jpg" alt="Dr. Aart de Geus"></div>
    <div>
      <h2>Dr. Aart de Geus</h2>
      <p>Aart de Geus is the Co-founder and Executive Chair of Synopsys Inc.</p>
      <p>Follow on:</p>
      <p><a href="https://www.linkedin.com/in/aart-de-geus-2a624b23/">:linkedin-in:</a></p>
    </div>
  </div>
</div>
```

- Differs from the contract: the source's "Follow on:" label is authored as its own paragraph
  before the links (the content check needs the words, and an author can change them).
- 390 profiles have LinkedIn, 19 of them also X, 45 have no links (then no label either).
- The paragraph that holds only icon links is the link row; a paragraph without a link right
  before it is the label. Links open in a new tab with the source's tooltips. The block puts
  a space between the links again (the pipeline removes it, the source has it).
- Photo 150 px, 90 px from 730, 160 px from 992. Icon hover: `#5a2a82`.

## social-share

Source: `socialShare` (1,026). Row 1: the networks by icon name. Row 2, optional: the title to
share.

```html
<div class="social-share">
  <div><div>x-twitter, linkedin-in, facebook</div></div>
  <div><div>MSC1 | 5G vs. 4G: What’s the Difference?</div></div>
</div>
```

- Differs from the contract: row 2. The source shares its own page title, which on 406 pages
  is not the `h1` (it has a campaign prefix). The importer writes row 2 only on those pages.
  Without it the block shares the page's `h1`, then `document.title`.
- The page URL is the canonical link, else the address. The share URLs and the 500 x 500
  popup are the source's. Each link also has the share URL as `href`.
- No visible hover change, as in the source (its hover rule sets `color` on a path that is
  filled by another rule).
- Up to 730 px, on a page with a `toc` block, the section loses its own top and bottom
  spacing, as the source does through `tocSictkyArticlesMobile`.

## spotlight

Source: `spotlight` (170): "Definition" (106), "About The Author" (62, inside fragments),
two others. Row 1: the title, drawn on the border. Row 2: the content.

```html
<div class="spotlight">
  <div><div>Definition</div></div>
  <div><div><p>A 3DIC is a three-dimensional integrated circuit.</p></div></div>
</div>
```

- Variants: default (`spotlight-header-indented`, 168), `left` (2: the title starts at the
  left edge). `rich-text` (1 page, `/glossary/what-is-an-ai-chip`): the content is a
  `richTextEditor`, so it keeps the element defaults instead of the `text` look.
- Not in the contract: a spotlight with a title row only frames everything that follows it in
  its section. The importer writes this form when the source box holds blocks (`/newsroom`:
  a content tile, once the `contentTile` transform exists). Today that tile is default
  content and sits in row 2.
- The 30 px above the box are padding of `.spotlight-wrapper`.

## Measured (compare.mjs, source against http://localhost:3520, in %)

| Region | Page | 1440 | 768 | 375 |
| --- | --- | ---: | ---: | ---: |
| article-hero `purple-blue` | /articles/design-verification-environment | 0 | 0 | 0.01 |
| article-hero `purple` | /glossary/what-is-a-data-center | 0 | 0 | 0 |
| article-hero `blue` | /blogs/chip-design/securing-network-traffic-macsec… | 0.1 | 0.53 | 0.7 |
| article-hero, 6 authors | /articles/understanding-peripherals | 0 | 0 | 0 |
| article-hero, no date / no authors / plain author / zh-cn | 4 pages | 0 | 0 | 0 to 0.01 |
| social-share | /articles/design-verification-environment | 0.16 | 0.14 | 0.15 |
| author-profile | /authors/aart-de-geus | 0.02 | 0.03 | 0.02 |
| author-profile, two links | /authors/achim-nohl | 0.01 | 0.02 | 0.04 |
| author-profile, no text | /zh-cn/authors/bernadette-mortell | 0 | 0 | 0 |
| spotlight | /glossary/what-is-a-data-center | 0 | 0 | 0 |
| spotlight `rich-text` | /glossary/what-is-an-ai-chip | 0 | 0 | 0 |
| spotlight `left` | /zh-tw/taiwan/blog/verification-flow-ai-soc-design | 0 | 1.74 | 3.99 |
| spotlight `left`, title | /newsroom | 0 | 0 | 0 |

- `blue` at 768 and 375: one pixel row at the top edge, under the sticky blog navigation.
- `left` on the zh-tw page: the box has the same size and offsets as the source to 0.01 px;
  it sits at another fraction of a pixel, which shifts the anti-aliasing of the CJK glyphs.
- Page bands with these blocks: `/articles/design-verification-environment` 0 / 0.02 / 0.01
  (hero) and 0.15 / 0.26 (share, in the hero band at 375); `/glossary/what-is-a-data-center`
  0.07 / 0.1 / 0.11 (hero) and 0.01 / 0.01 / 0 (spotlight).
- States, one script on both sites: author link hover, share hover, the three popup URLs,
  profile links (href, tooltip, target) and their hover colour.

## Known gaps

- `/newsroom`: the frame and title of the spotlight match the source at the three widths. Its
  content is the content tile, which has no transform yet.
- "About The Author" boxes: two differences that are not in these files, see the requests
  (a lost `&nbsp;` after a linked name, and the 15 px indent of fragments below 730).
- The blog pages (`/blogs/chip-design/*`) cannot be compared as a page yet: the blog
  navigation fragment above the hero is still default content and moves everything down.
