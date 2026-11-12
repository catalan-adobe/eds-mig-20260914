# Group accordion-quote: accordion, quote

Owner of `blocks/accordion/`, `blocks/quote/` and the transforms `faq.mjs`, `quote.mjs`.
New icons: `caret-up.svg`, `quote-mark.svg`, `quote-mark-cjk.svg` (the two marks are the
source's own SVGs). `quote` also uses `chevron-left-light.svg` and `chevron-right-light.svg`.

Source: `faq` (63 on 58 pages, 6 of them inside tabs), `quote` (286 on 115 pages): 133 single,
49 carousels of the `carousel` component, 3 of `contentCarousel`.

## The authored model

**accordion**: a row is one item, `question | answer`. The question is plain text (the source's
`h4`), the answer is paragraphs, lists and links. As the contract.

**quote**: a row is one quote, `text | name and role | logo or portrait | link`.

- Cell 2 holds two paragraphs, the name and the role. From 730 they share a line with `|`
  between them. The source draws the `|` also when one of them is empty, and so does the block.
- Cell 4 holds a link whose text is its URL (the source link has no text). It makes the whole
  card a link.

```html
<div class="quote fit carousel autoplay">
  <div>
    <div>By using Synopsys Cloud and BYOC, we complete our chips in 30% less time.</div>
    <div><p>Kalyan Mulam</p><p>Sr. VP of ASIC Engineering, Astera Labs</p></div>
    <div><img src="…/media/astera.svg" alt="Astera Labs"></div>
    <div><a href="/f52-synopsys-1211-02/cloud/x">/f52-synopsys-1211-02/cloud/x</a></div>
  </div>
</div>
```

## Variants and states

| Variant | Source | Look |
| --- | --- | --- |
| `quote` | a single quote (133) | white card, at most 1032 px, 4 lines of text (7 below 730) |
| `cjk` | `quote-chinese-*`, `quote-japanese` (15) | the corner bracket as the opening mark |
| `headshot` | `headshot-img` (4) | a round portrait of 60 px (45 px below 730) |
| `carousel` | `carousel`, `content-carousel` (49) | every quote has one height, the quotes fade |
| `carousel fit` | `contentCarousel` (3) | each quote keeps its height, the quotes slide |
| `autoplay`, `autoplay-N` | `data-autoplay` (2) | a step every 6 s, or every N s |

- Accordion: closed at load. A click opens an item and closes the open one, with the source's
  slide of 0.4 s. `aria-expanded`, caret down and up, grey title when open, dashed focus ring.
- Linked quote: name and role are blue, and darker on hover. The text keeps its colour.
- Carousel: arrows, dots, swipe, arrow keys. The ends wrap around. Below 730 the arrows sit
  beside the dots. `fit` is as high as its highest quote, and from 481 to 729 px as high as
  the quote in view, as the source.
- An accordion inside a tab panel is built by the `tabs` block from its rows (`groups/tabs.md`).

## The transforms

- `faq`: a blank line of the source (`<p>&nbsp;</p>`) cannot be a paragraph of a document. It
  is written as `<br><br>` in the paragraph next to it. The answers have no space between
  paragraphs, so the height is the same.
- `quote`: only the slides of a carousel merge into one block. Quotes that follow each other on
  a page stay one block each, with their own spacing (2 pages). The separator `|` is not
  content: the block draws it.
- `quote` adds `fit` when the quote sits in a `contentCarousel`. The `carousel` transform adds
  `carousel` and `autoplay`.

## What differs from the contract, and why

1. **`fit`.** The contract has one `quote carousel`. The source has two carousels that look and
   move differently (fixed height and fade, own height and slide).
2. **`cjk`, `headshot`, `autoplay`.** Not in the contract. They are classes of the source.
3. **The link cell holds the URL as its text**, not "Read the story": the source has no text.

## Known gaps

- A table in an answer becomes paragraphs: a cell cannot hold a table. One page,
  `/solutions/silicon-lifecycle-management/environmental-monitors/slm-pvt-monitor-ip.html`
  (22 items): an open item is up to 225 px lower than the source's at 1440.
- On the same page a bold link alone in a paragraph (`<a><b>`) arrives as `<strong><a>` and
  is drawn as a button. `lib/clean.mjs` removes the emphasis only for `<b><a>` (request).
- `/zh-cn/designware-ip/interface-ip/secure-interfaces.html`: the four slides have different
  spacing in the source (`top-xs bottom-xs`, then `top-sm`). The merged block has one: 15 px
  too high at 375, equal at 768 and 1440.
- `fit` at 375: the source shows the edge of the shadow of the slide before the first one
  (its clone). The block has no clones.
- The source's fading carousel does not follow a mouse drag (touch only). The block does.
- `no-mobile` (`mobile-no-carousel`) is not built for quotes: no quote carousel uses it.
- The source's autoplay was not seen running: the tools hold rotations still. The block's
  autoplay, and its pause on hover, were checked on a draft with `autoplay-1`.

## Measured (integrated pages on localhost:3520, source region against target region)

| Block, variant, page | 1440 | 768 | 375 |
| --- | ---: | ---: | ---: |
| accordion, `/ai/ai-chip-development.html` | 0.00 % | 0.00 % | 1.38 % |
| accordion in `span-9`, `/glossary/what-is-a-data-center.html` | 0.47 % | 0.44 % | 1.51 % |
| accordion in tabs, `/solutions/automotive.html` | 0.00 % | 0.00 % | 0.00 % |
| accordion, 10 items, `/designware-ip/security-ip.html` | 0.00 % | 0.00 % | 0.08 % |
| accordion, `/implementation-and-signoff.html` | 0.00 % | 0.26 % | 0.33 % |
| accordion in `span-8`, `/…/signoff/primetime.html` | 0.00 % | 0.00 % | 0.00 % |
| quote carousel, `/resources/sram-puf-….html` | 0.00 % | 0.65 % | 0.31 % |
| quote carousel, `/partners/bluespec.html` | 0.00 % | 0.01 % | 0.02 % |
| quote carousel with links, `/…/ams-simulation.html` | 0.05 % | 0.10 % | 0.02 % |
| quote `fit carousel autoplay`, `/cloud/astera-labs.html` | 0.00 % | 0.01 % | 1.33 % |
| quote `fit carousel`, `/careers/…/microelectronics-academy.html` | 0.00 % | 0.01 % | 1.35 % |
| quote `fit carousel autoplay-4`, `/zh-cn/…/secure-interfaces.html` | 0.00 % | 0.35 % | 3.94 % |
| quote, `/cloud/hcltech-success.html` | 1.12 % | 1.86 % | 0.68 % |
| quote with logo, `/partners/infineon.html` | 0.19 % | 0.00 % | 0.71 % |
| quote `headshot`, `/synopsys-ansys-united.html` | 0.48 % | 0.00 % | 0.00 % |
| quote `cjk`, `/zh-tw/taiwan/blog/power-of-silicon-remastering.html` | 0.00 % | 0.00 % | 2.86 % |
| quote `cjk`, `/zh-cn/designware-ip/ip-subsystems.html` | 0.00 % | 0.00 % | 0.00 % |
| quote with logo and link, `/…/fusion-compiler.html` | 0.14 % | 0.49 % | 0.89 % |
| quote with link, `/…/virtual-prototyping/platform-architect.html` | 0.80 % | 2.00 % | 2.12 % |

Every box of these regions has the source's size and position to 0.1 px (one script on both
sites: the 21 quote cards of 6 pages at three widths, and every accordion item of 10 pages,
each one open, at 1440 and 375; the items with a table differ, see the gaps). A value
above 1 % with equal geometry is text drawn half a pixel lower or higher: the block starts
at a fractional position that differs by up to 0.5 px, because of what lies above it. Where
both start on the same fraction the difference is 0.00 %.

States, one script on both sites, equal values at 1440, 768 and 375:

- accordion (`/ai/ai-chip-development.html`): load, open the second, open the sixth, close it,
  Enter on the first. Item and answer boxes, `aria-expanded` and title background are equal.
  Screenshot with the sixth open: 0.00 %, 0.00 %, 1.54 % (1 px of height at 375).
- quote carousel (`sram-puf`): next, previous past the first, hover of a linked quote, next
  past the last, the fourth dot, arrow hover. Screenshots after next and on hover: 0.00 %,
  0.00 %, 0.01 %.
- `fit` (`astera-labs`, also at 600): next twice, wrap both ways, the second dot, drag. Slider
  height, arrows and dots are equal to 0.1 px. Screenshots after next: 0.00 %, 0.00 %,
  0.95 % (600), 1.49 % (375, 1 px of height).
- linked quote (`platform-architect`): colours at rest and on hover are equal.

Whole pages: `/partners/bluespec.html` 0.08 %, 0.16 %, 0.20 %. `/ai/ai-chip-development.html`
0.23 %, 0.93 %, 0.70 %. On the other four sample pages the bands of these blocks are moved by
what lies above them (`trace.mjs`): the "Bosch + Synopsys" banner of `/solutions/automotive.html`
(60 px), two dropped blank lines of a `text` on `/cloud/hcltech-success.html` (71 px), the
tables of `/glossary/what-is-a-data-center.html`, the form of `sram-puf` below 1440.
