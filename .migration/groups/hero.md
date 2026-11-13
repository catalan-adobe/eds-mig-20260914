# Group hero

Block `hero`. Source: `banner` (2,139 instances on 1,304 pages), `interactiveBanner` (3 pages),
and the slides of `carousel[carousel-type=banner-carousel]` (the five language home pages).
Files: `blocks/hero/`, `M/import/components/banner.mjs`,
`M/import/components/interactiveBanner.mjs`, `icons/pause.svg`.

## Authored model, as built

One row per banner. Two or more rows make the home page carousel.

| Cell | Holds |
| --- | --- |
| 1 media | desktop image, then the mobile image (shown below 730). Or: a link to the mp4, its poster image, then the mobile image. Empty: gradient only |
| 2 text | carousel only: a paragraph before the heading is the label of the slide's tab (a line break in it stays). Heading at the source level (`h1`, `h2`, `h3`). Subtitle paragraphs. Buttons: `strong` link is white, `em` link is outlined |
| 3 foreground | optional image beside the text |
| 4 options | carousel only: the variants of this slide, comma separated |

- Button icons are at the end of the label: `:chevron-right:` stays last, `:play:` and
  `:arrow-down-to-line:` are drawn first, as the source does.
- A link to `players.brightcove.net` or YouTube opens the modal player.
- A blank paragraph in the source title stays as a line with a no-break space
  (`Title<br>&nbsp;`). The pipeline drops a trailing space: the block puts it back after a
  final `<br>`.
- PNG assets of the image service are copied with `fmt=png-alpha`, else transparent logos get
  a white box (20 banner images).
- The background images get the source's renditions (375, 480, 730, 992, 1200, 1900 wide, no
  `sizes`): the viewport width picks one, so the image is as soft as the source's.

## Variants

From the contract: `skinny`, `black`, `light-purple`, `overlay-30` … `-60`, `left`,
`width-25` … `-80`, `pad-md`, `pad-lg`, `expanded`, `title-small`, `title-large`, `video`,
`carousel`.

Added, because the source has them (count of banners):

| Variant | Source | Effect |
| --- | --- | --- |
| `classic` (46) | banner without `reg-banner` | the older type scale, no overlay |
| `animated` (16) | `.animation-element.slide-up` | the text slides up on load |
| `interactive` (3) | `interactiveBanner` | 325 px below 730 with the image, 500 px with the video from 730, own type, orange buttons |
| `white-buttons` (1) | page style on the Armenia page | `interactive` with the banner's white buttons |
| `fg-20`, `fg-50`, `fg-67`, `fg-75` | `foreground-width-N` | width of the foreground area. Default 40 % |
| `fg-left`, `fg-right` | `hLeft`, `hRight` | side of the image in its area. Default centre |
| `fg-pad-sm`, `-md`, `-lg` (5) | `svg-padding-*` | padding of the foreground area below 730 |
| `mobile-image-only` (10) | desktop image hidden, mobile image shown | the one image of cell 1 is the mobile image |
| `mobile-dark-purple`, `mobile-light-purple` (9) | `bg-mobile` gradient | gradient behind the stacked layout below 730. Default black |
| `right` (1 slide) | `content-align-right` | carousel slide with the text on the right |
| `tight-buttons` (5 slides) | page style of the English home page | 40 px buttons with 15 px below |
| `blank-before`, `blank-after` (3) | a blank paragraph before or after the subtitle | the same blank paragraph. The pipeline drops an empty paragraph, so it cannot be content |
| `video` in a carousel row (1, zh-cn home) | `component-video-banner.carousel-wrapper-hp` | the video fills the slide from 730, the mobile image shows below. Type and spacing of the video banner, text centred below 730. The video plays while its slide shows and starts again, as the source |

A banner with a mobile image, not `skinny`, `classic` or `video`, is "stacked" below 730: the
image above the text, the video button as a round play button on the image. The block derives
it from the cells.

## Differs from the contract

- Cell 4 and the tab label paragraph of the carousel are not in the contract. A slide has its
  own overlay, gradient and alignment, so block classes cannot carry them.
- `hero video` is the `video` variant of `banner` (21). `interactiveBanner` is
  `hero interactive video`: it differs in height, type and buttons.
- `expanded` has no effect: the source's rule sets the same 500 px as the default.
- The carousel has no previous and next buttons and does not pause on hover: the source's are
  0 px wide and its slick option is `pauseOnHover: false`. It has the source's tabs with a
  7 s progress bar, a pause button, swipe and arrow keys. A mouse drag does not change the
  slide (the source's `draggable: false`): the block keeps mouse `pointerdown` from the slider.
- The rules of the block `carousel` match `.hero.carousel` too. `hero.css` sets back what they
  change (see requests).

## Known gaps

- New tab: a button to another site opens in a new tab, as most of the source's do. The source
  also opens about 300 of its own pages in a new tab, an author's choice per link that DA
  cannot carry: those open in the same tab.
- A video button of the source is `href="#"`: the page jumps to the top behind the modal. The
  block keeps the scroll position.
- Keyboard focus keeps the browser's ring (`styles/styles.css`, deliberate); the source shows
  only the underline.

- `/synopsys-ansys-united`: a script of the page moves the banner text and logo 5 px down.
  Per-page scripts are not migrated.
- Images are resampled by another service: banners with fine line patterns differ up to 1 %
  at 768 without any layout difference.
- The modal player is the global modal: 30 px wider than the source's.
- The compare tools cannot load the source image `ai-hero-banner-v2(1)` (zh-cn home, slide 4):
  the offline cache rewrites a URL with brackets wrongly. Compare that slide with the `srcset`
  set right first (`/tmp/f52s/group-hero/prep-home-src2.js`).
