# Group carousel: carousel

Owner of `blocks/carousel/`, the transforms `carousel.mjs`, `contentCarousel.mjs` and
`logoCarousel.mjs`, and the icons `expand`, `arrow-down-to-line-regular` and `xmark-light`.

## Where a source carousel goes

242 fetched pages have one. Counts are blocks in the dry import of those pages.

| Source | Result | Count |
| --- | --- | ---: |
| `carousel` `card-carousel`, `contentCarousel` with cards | `cards cols-N carousel` | 164 |
| slides of `assetCard` | `teasers cols-1 carousel` | 5 |
| slides of `quote` | `quote carousel` | 52 |
| `carousel` `banner-carousel` | `hero carousel` | 5 |
| `logoCarousel` | `carousel logos` | 24 |
| `carousel` `image-carousel` | `carousel images` | 8 |
| other slides of a `contentCarousel` | `carousel` | 11 |
| other slides of a `carousel` (`content-carousel`) | `carousel fade` | 5 |
| one slide that is not an item | no carousel: the slide's own sections | 2 |
| no filled slide | dropped | 3 |

Item carousels (CONTRACT a, rule 4):

- The slides' `column`, `cardContainer` and `synopsysContainer` are layout: the items inside
  them merge into one block with `carousel`.
- `cols-N`: for a `card-carousel` the cells of its first row, as the source's script. Else the
  cells of the first slide, times `data-slides-to-show`.
- `carousel` is added only when there are more items than `cols-N`.
- Added with `carousel`: `no-mobile` (`mobile-no-carousel`), `autoplay` (`data-autoplay`, 6 s),
  `autoplay-N` (another `data-autoplayspeed`, in seconds).
- A `text` beside a quote in a slide (5 pages) follows the block as its own section.
- The spacing below the items of a slide stays below the block (`bottom-*`).

## carousel

Row = one slide. Cells = the cells of the slide's `column` or `cardContainer`, or of its
`columns media` block (`imageTextCta`). Any other slide is one cell.

```html
<div class="carousel w-4-8 rich-text">
  <div>
    <div><h2>Samsung Memory</h2><p><strong>- Jung Yun Choi</strong></p></div>
    <div><h4>"PrimeSim Pro can deliver up to 5X performance." <a href="https://news.synopsys.com/x">Read more</a></h4></div>
  </div>
</div>
```

| Variant | Source | Effect |
| --- | --- | --- |
| `fade` | core `carousel`, `content-carousel` | slides fade, top aligned, arrows 36 px higher |
| `w-4-8`, `w-8-4`, `w-3-9`, `w-9-3` | `col-sm-N` of the slide's row | cell widths from 730. Default: equal cells |
| `rich-text` | cells of `richTextEditor` | element defaults. Without it a cell is a `text`: 16 px, first `h2` is the title |
| `title-small`, `title-large`, `title-dark` | title styles of the `text` sections | as the section styles |
| `image-pad-sm`, `-md`, `-lg` | `horizontal-padding-*` of the images | 5 / 25 / 100 px |
| `media` | `imageTextCta` | second cell first below 730, 24 px below image and text |
| `slide-top-*`, `slide-bottom-*` | spacing of the component in every slide | padding of the slide |
| `autoplay`, `autoplay-N` | `data-autoplay` | 6 s or N s, pauses on hover and focus |
| `no-mobile` | `mobile-no-carousel` | slides stack below 730 |

A cell cannot carry section styles, so the look variants are the styles that at least half
of the texts (or images) in the slides have. The importer warns when they are mixed.

In a cell the block also:

- makes an image the link of the paragraph that follows it (text = its URL), as `global` does
- draws an SVG image 140 px high up to 730 (the source's `.img-responsive.svg`)
- turns a paragraph with only a Brightcove player link into a video: the image before it as
  poster, else the video's own poster, a round play button, the player in the modal.

Behaviour (source: slick, `infinite`, `dots`): previous and next wrap, dots, swipe, arrow keys.
Between 481 and 729 px the slider is as high as the slide in view (`adaptiveHeight`; the
source switches it off up to 480). One slide: no controls.

### carousel images

```html
<div class="carousel images">
  <div>
    <div><img src="https://content.da.live/catalan-adobe/eds-mig-20260914/f52-synopsys-1211-02/media/a.jpg" alt=""></div>
    <div><p>The caption of the image.</p><p><a href="https://www.synopsys.com/content/dam/a.jpg">:arrow-down-to-line:</a></p></div>
  </div>
</div>
```

Cell 2: optional caption, optional link to the file. One image in view (16:9), counter,
arrows, caption over the image (1 line below 730, 2 from 730), a strip of thumbnails (3, 4
from 420, 5 from 640, 6 from 1024) that turns by pages. The expand button opens a dialog with
the same gallery, a grid of all thumbnails and the download link. Escape, the close button and
a click outside close it. Not migrated from the source: the dialog under the utility bar.

### carousel logos

As in the contract. `reverse` (`dir="rtl"`, 6 blocks) runs to the right. A row without a link
(`<a>` without `href`, 7 blocks) is the image alone. The strip moves one logo every 5 s and
never pauses, as the source. Logos in view: 2 below 320, 3, 4 from 768, 5 from 992. Height
80 px and margin `24px 0 48px` up to 730, then 100 px and `40px 0 80px`.

## Differences from the contract

- `fade`, `rich-text`, `title-*`, `image-pad-*`, `media`, `slide-*`, `reverse` and the `w-*`
  widths are new variants. Reason: the two source carousels differ in look, and a cell cannot
  carry the section styles of the components it holds.
- `autoplay` is a variant of its own, also on `cards`, `teasers` and `quote` carousels: only
  3 `contentCarousel` have `data-autoplay`.
- A carousel of one slide is no carousel.

## Measured (state compare of the block's region, source against http://localhost:3520)

| Variant, page | 1440 | 768 | 375 |
| --- | ---: | ---: | ---: |
| default `w-4-8 rich-text`, `/ja-jp/implementation-and-signoff/ams-simulation`, slide 2 | 4.39 % | 0.25 % | 1.25 % |
| the same, slide 1 / previous (slide 4) / dot 3 | 4.98 / 5.83 / 3.35 % | 1.47 / 0.50 / 0.33 % | 7.54 / 2.22 / 1.36 % |
| default, image slides, `/zh-cn/ai/ai-powered-eda/dso-ai`, first / next | 0.12 / 0.11 % | 0.45 / 0.41 % | 0.83 / 0.75 % |
| default `w-4-8`, image and texts, `/cloud` | 4.52 % | 1.39 % | 1.81 % |
| `fade`, images, `/implementation-and-signoff/signoff/primeclosure`, first / next | 0.10 / 0.06 % | 0.38 / 0.26 % | 0.64 / 0.40 % |
| `fade`, videos, the same page, first / next | 0.65 / 0.62 % | 1.18 / 1.39 % | 0.25 / 0.26 % |
| `fade media`, `/services/design-services` | 0.01 % | 0.02 % | 0.03 % |
| `fade title-small title-dark`, `/ai/ai-powered-eda`, first / next | 0.72 / 0.07 % | 1.67 / 1.10 % | 0.02 / 0.02 % |
| `images`, `/converge/newsroom`, first / next twice / previous | 0.85 / 1.02 / 1.24 % | 0.60 / 0.67 / 0.78 % | 0.16 / 0.10 / 0.30 % |
| `images`, dialog open / next / thumbnail 5 (viewport) | 1.20 / 1.14 / 1.21 % | 0.62 / 0.58 / 0.60 % | 0.98 / 0.98 / 1.02 % |
| `logos`, `/contact-sales`, strip held at the same logo | 0.20 % | 0.47 % | 0.02 % |
| `logos reverse`, `/cloud/startup-program`, the same | 0.20 % | 0.74 % | 0.43 % |

Logo geometry and speed were also measured at 1440, 992, 768, 750 and 375: equal pitch (228,
188, 185, 240, 115 px) and speed (45.5, 37.5, 37, 48, 23 px/s).

Checked on the target with one script: next, previous, wrap at both ends, dots, arrow keys,
swipe both ways, `inert` on hidden slides, autoplay after 6 s, pause on hover and on focus,
`no-mobile` at 375 and back at 1440, one slide without controls, empty `logos` and `images`
blocks, the dialog (opens at the image in view, download link, Escape, close button, click
outside, focus back on the expand button).

## Known gaps

- `/ja-jp/implementation-and-signoff/ams-simulation`: the first slide has an `h2` whose text
  is 14 px by an inline style, and a `text-color-black` span in an `h4`. DA has neither, so
  the slide is 13 px higher at 1440 (10 px at 375) and the quote is purple. With the heading
  set to 14 px in the browser the block is as high as the source.
- Spacing between two components in one cell is not carried (`/cloud`: 8 px text offset at
  1440, 27 px shorter at 768, 19 px at 375).
- `image-pad-*` is one value for the block (`/ai/ai-powered-eda` mixes none, sm and md).
- A video in a slide plays in the modal with the play button of the source. Its mode
  (`inline`) and the `mosaicCardVideoImage` in slides (3 pages) depend on the `mosaic`
  transform of the `tiles` group: until it exists the slide holds the fallback text.
- `mobile-center-mode` (1 page, `/zh-cn/designware-ip/ip-market-segments/automotive`) is not
  migrated: importer warning.
- An empty `contentCarousel` (2 pages) is dropped. Its 104 px (15 + 29 + 60) become
  `band-top-md` on the next section: 44 px less on
  `/zh-cn/designware-ip/interface-ip/die-to-die/ucie`.
- The source's slider rounds slide widths up: an image is up to 0.5 px wider than here.
- In the dialog the arrow keys work once an arrow has the focus.
