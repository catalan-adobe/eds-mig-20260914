# Report: synopsys.com to Edge Delivery Services

Branch `f52-synopsys-1211-02`. DA folder `/f52-synopsys-1211-02` of
`catalan-adobe/eds-mig-20260914`. Written 2026-11-13 by the wrap-up step. Every count below
comes from `out/report.json` of the final import (2026-11-13 06:41 UTC) or from a sweep
`summary.json` named in its section.

## The source can no longer be fetched

`source/FETCH-STOP` exists since 2026-11-12 23:19 UTC. The source answered 403 (bot check) for
the image `https://images.synopsys.com/is/image/synopsys/oppo?...`. From then on no tool fetched
anything from `*.synopsys.com`. The stop was not removed and not worked around. Every page whose
images were not in the local cache by then could not be imported. This is the main reason for
the numbers below.

## What was migrated

- Source: 7,007 HTML URLs. 6,850 answer 200, 138 answer 301, 18 answer 302, 1 answers 404.
- 39 pages under `/<lang>/refs/global-navigation/` are skipped on purpose (CONTRACT h17). That
  leaves 6,811 pages.
- Final import (`import.mjs --all`): 3,022 unchanged, 20 previewed, 3,769 failed.
- 3,042 pages are previewed. All 3,042 answer 200 as `.plain.html` on http://localhost:3520,
  and none holds an `about:error` image.
- 3,769 pages are not previewed. Every one fails only because its images are not in DA and not
  in the cache (`image not on content.da.live`, `images missing`).
- Fragments: 103 built, 93 previewed and answering 200, 10 blocked by missing images.
- Images: 7,250 already in DA, 0 copied in the final run, 5 failed.

Pages previewed per language:

| Language | Previewed | Not previewed |
| --- | --- | --- |
| en | 1,464 | 2,878 |
| ja-jp | 979 | 193 |
| zh-cn | 417 | 470 |
| zh-tw | 136 | 211 |
| ko-kr | 46 | 17 |

Pages previewed per template (29 templates):

| Template | Previewed | Not previewed |
| --- | --- | --- |
| content-page-template | 2,093 | 915 |
| content-type-element | 239 | 50 |
| chip-design-author-page | 146 | 310 |
| chip-design-article-page | 127 | 1,007 |
| campaign-landing-page | 77 | 449 |
| product-individual | 59 | 17 |
| dw-content-page | 46 | 181 |
| ip-technical-bulletin | 37 | 1 |
| webinar-landing-page | 33 | 190 |
| contact-us-landing-page | 32 | 8 |
| content_internal-events-landing-page | 24 | 7 |
| success-story-template | 20 | 32 |
| glossary-template | 19 | 89 |
| silicon-ip-technical-bulletin-blog-article | 17 | 255 |
| product-category | 14 | 3 |
| solution-category | 14 | 0 |
| content_3rd-party-events-landing-page | 13 | 6 |
| verification-central-blog | 8 | 236 |
| synopsys-partners | 5 | 0 |
| error-page | 4 | 0 |
| form | 3 | 0 |
| video-landing-page | 3 | 0 |
| article-landing-page | 2 | 0 |
| chip-design-landing-page | 2 | 0 |
| -gated--success-story-template | 1 | 13 |
| empty-campaign-landing-page | 1 | 0 |
| marketo-thankyou-page | 1 | 0 |
| chip-design-category-page | 1 | 0 |
| article-category-page | 1 | 0 |

## Blocks and owners

31 blocks. Each group owns its blocks and the transforms of its source components
(`owners.json`).

| Group | Blocks | Source components |
| --- | --- | --- |
| header | header | topNav, subNavLeft, subNavRight, navList, subNavLinks, mediaLinkTile, topNavAd |
| footer | footer | siteFooter, siteFooterChinese |
| global | fragment, plus styles, scripts, section grid | synopsysContainer, column, text, richTextEditor, html, image, interactiveImage, pageTitle, anchor, separator, callToAction, experiencefragment, pageList, list, downloads, socialLinks, ghost, factoid |
| hero | hero | banner, interactiveBanner |
| article | article-hero, author-profile, social-share, spotlight | blogBanner, authorProfile, socialShare, spotlight |
| toc | toc, breadcrumb | tableOfContents, breadcrumb |
| cards | cards | cards, product-card |
| teasers | teasers | assetCard, dynamicCards, cardContainer, pressRelease, contentTypeListing |
| items | key-benefits, box-links | keyBenefits, boxLink, boxLinkContainer |
| columns | columns | imageTextCta, textImage2Column, imageAndLinks, featuredImageTextLinks |
| tabs | tabs | floatingTabs |
| accordion-quote | accordion, quote | faq, quote |
| carousel | carousel | carousel, contentCarousel, logoCarousel |
| media | video, embed | video, googleMap |
| forms | form | marketoFormsContainer, mktoForm, subscriptionForm |
| listing | listing, blog-nav | search, blogsDev |
| html | promo, search-box, table | htmlTextOnly, table |
| rail | rail-card, dw-products | rightRailItem, dwProductsDownloads |
| tiles | mosaic, content-tile | mosaicCardContainer, mosaicCardColor, mosaicCardRTE, mosaicCardVideoImage, contentTile |

Each group's notes are in `groups/<group>.md`. The shared foundation is in `FOUNDATION.md`.

## Measurements

`compare.mjs` diff of the whole page, source against http://localhost:3520, in percent of
pixels. "Over 1 %" counts pages whose whole-page diff is over 1 %.

Representative pages (113 pages that cover every template, component and variant;
`shots/sweep-final/summary.json`):

| Width | Measured | Failed | Median | p90 | Max | Over 1 % |
| --- | --- | --- | --- | --- | --- | --- |
| 1440 | 110 | 3 | 4.67 | 26.67 | 75.62 | 70 |
| 768 | 110 | 3 | 5.48 | 29.70 | 77.54 | 76 |
| 375 | 110 | 3 | 7.11 | 46.22 | 70.59 | 89 |

- The 3 failed pages are `refs/global-navigation` pages. They are not imported (CONTRACT h17)
  and answer 404.
- Bands over 1 % by owner, all widths (first band of a page in brackets): global 833 (217),
  footer 508 (57), cards 181 (23), hero 179 (53), columns 161 (51), forms 140 (67),
  teasers 115 (21), html 90 (22), listing 88 (12), media 80 (23), accordion-quote 68 (16),
  carousel 56 (13), items 49 (14), tabs 46 (12), toc 35 (29), article 33 (18), rail 13 (3),
  tiles 9 (0).
- With FETCH-STOP set, some source shots miss images that were never cached. Those pages
  show a larger diff than the migrated page has.

Sample (150 pages from `tools/sample.mjs`, `source/sample.txt`;
`shots/sweep-sample3/summary.json`, finished 2026-11-13 07:18):

| Width | Measured | Failed | Median | p90 | Max | Over 1 % |
| --- | --- | --- | --- | --- | --- | --- |
| 1440 | 68 | 82 | 2.58 | 15.39 | 42.63 | 42 |
| 768 | 68 | 82 | 2.07 | 12.40 | 33.61 | 44 |
| 375 | 68 | 82 | 3.18 | 25.78 | 46.44 | 47 |

- The 82 failed sample pages answer 404: their images are blocked by FETCH-STOP.
- Bands over 1 % by owner: global 377, footer 215, hero 98, cards 86, html 48, teasers 42,
  columns 37, tabs 34, listing 32, forms 26, rail 25, toc 24, article 20, items 19,
  carousel 14, media 10, accordion-quote 9.

The goal in `PLAN.md` was every page within 1 % per band. It is not met.

## Content check

Measured by the importer on all 6,811 pages. Pages that could not be uploaded were checked
in build mode, with placeholders for the missing images.

- No page has word recall under 0.98.
- No component falls back to default content.
- The final import has no content failure other than missing images.
- `/implementation-and-signoff/physical-verification/icv-cloud.html` shows 6 of 8 images. The
  source answers 404 for the other 2.
- 4,155 pages carry warnings: content kept, some styling or structure lost. The largest:
  - global: 467 pages "column row inside a cell loses styles", 28 pages "row in cell holds
    blocks, stacked", 172 empty documents whose source body is empty too.
  - html: 86 one-off htmlTextOnly pages, 18 tables with merged cells.
  - tabs 17, carousel 11, teasers 10, cards 3, columns 1.
- The rollout found 4 pages where the freshness check of `import/lib/check.mjs` fails falsely:
  `isFresh()` strips `/:[a-z0-9-]+:/` as icons, which also removes times like `3:50pm`. All 4
  are previewed and unchanged in the final import.

## Behaviour audit

- The audit compared interactions and states with the source and found 36 items.
- The owners report 42 fixes: header 4, carousel 4, rail 4, cards 4, tiles 4, teasers 3,
  listing 3, html 3, tabs 3, items 2, toc 2, columns 2, forms 2, hero 1, global 1, media 0.
- The items left open are listed below with their reason.
- The QA loop recorded one round with no bands assigned and ended as "clean".

## Differences that remain

Kept on purpose:

- Focus ring: `styles/styles.css` hides the ring for mouse focus but keeps it for keyboard
  focus. The source hides it for both.
- `/solutions/automotive` "Watch Now": the source jumps to the top of the page (its link is
  `href="#"`). The target opens the player and keeps the scroll position.
- About 316 of 1,565 same-site hero buttons open in a new tab on the source. The content model
  has no way to carry this per link. Only links to other sites open a new tab.
- `/converge/newsroom` zoom modal: on the source the sticky header covers the close button. The
  target modal sits above the header and closes on Escape.
- Search IP box (`ddr-universal-umctl2`): the target encodes the query and uses https. The
  source sends the raw text over http.

Limits of the content model:

- A row inside a cell loses its sections' own spacing and styles (about 469 pages). Sections
  do not nest, and `columns` has no per-cell spacing.
- Spacer paragraphs `<p>&nbsp;</p>` are dropped (6,278 on 1,736 pages, about 36 px each). DA
  drops them too.
- Per-image padding inside a block cell is lost (`image-pad-*` in carousels and tabs).
- Table cell merges (about 20 tables) and inline sizes are not kept.
- One-off htmlTextOnly styling (colour boxes, inline SVG diagrams, the glossary A-Z sticky bar)
  is lost. The content is kept as default content.
- Only primary and secondary buttons exist. A grey button becomes primary.
- Trailing `<br>`, `<br>` inside a list and empty lists are not kept by DA.

Open bugs and requests:

- Rail flags on `/videos/security-ip.html` and others link to `/f52-synopsys-1211-02/search#…`,
  which answers 404. `import/lib/links.mjs` rewrites `search.html` as an internal link, and
  `import/lib/check.mjs` rejects the source URL.
- `/verification/emulation-prototyping/*` (5 pages): the footnote of quote 2 sits after the
  carousel, not in the slide. The quote block reads only 4 cells.
- Heading colours in tab panels (atef "Your Challenges") stay purple. `floatingTabs.mjs` does
  not use `headingColourOf()` yet.
- `/cloud` quote carousel: 20 to 27 px shorter below 1440. The quote and the name use one type
  scale in the target and two in the source.
- Requests to the architect, not done: section styles `heading-gray`, `heading-black`,
  `heading-green` and `card-cells` in the contract; spacer paragraphs as `<p>\u200b</p>`.
- 24 pages with new-tab links in `imageTextCta` and `textImage2Column` keep their old documents.
  Their re-import is blocked by FETCH-STOP.
- One page path holds capital letters
  (`/community/resources/news/tsmc-news/Synopsys-Digital-…`). It answers 200 only with its
  capitals.

## Not migrated, and why

- Consent banner, chat widget, chatbot and ask-synopsys widgets, analytics and tag managers:
  out of scope by the brief. This includes 4,342 htmlTextOnly chat-widget styles.
- Tracking scripts, the Eloqua forms of 3 zh-cn event pages and other per-page scripts.
- The scroll progress ring of 37 zh-cn technical bulletin pages: a per-page script and style.
- About 130 htmlTextOnly styles that restyle other components, except logo walls, which become
  `teasers logos`.
- The banner's per-instance style element (2,112): implied by whether a mobile image exists.
- `/<lang>/refs/global-navigation/**` (39 pages): their content is in the nav documents.
- Empty source components: `ghost`, `factoid` (1 page), 3 of 4 `featuredImageTextLinks`.
- `contentTypeListing` (1 page): its list comes from a source servlet. The heading is kept.
- `interactiveImage` hover tooltips (6 pages): the image is kept.
- Coveo search (relevance sort, did-you-mean, `/search.html`): its tokens come from the source
  domain and expire. Lists use `listing` on index sheets.
- The footer's Cookie Settings link: OneTrust adds it.
- PDFs and other downloads: linked at `https://www.synopsys.com`.
- The Font Awesome kit: its icons are SVG files in `icons/`.

## Not verified

- 3,769 pages and 10 fragments are not previewed, so nothing was measured on them in the
  browser. Their documents were only built and checked in build mode.
- The sample sweep measured 68 of 150 pages. The representative sweep measured 110 of 113.
- Both sweeps ran before the final import. That import changed 20 documents, among them the
  home page.
- Source shots of pages with images that were never cached are incomplete, so their diff is
  not a true measure.
- Nothing was published to live. The preview links serve the branch code with previewed
  content.
