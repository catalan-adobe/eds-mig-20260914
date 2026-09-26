# logos-news — Ecosystem Partners + What's New

Task ID: `logos-news`. Sessions `ln-d` / `ln-m`. Port 3014.

## What was built

Two new blocks, authored as one section each in `migration/sections/logos-news.html`:

1. **Ecosystem Partners** (`blocks/logo-carousel`) — light-grey section, centered `<h2>`,
   continuous seamless marquee of the 10 partner logos. Pure CSS animation (no JS library):
   the block JS duplicates the 10 `<li>` items once (aria-hidden clones, `tabindex="-1"`
   links) and a `translateX(0 → -50%)` keyframe loops forever. Visible-count is driven by a
   `--logo-visible` custom property (5 desktop / 4 / 3 / 2) and the track width is
   `calc(2000% / var(--logo-visible))` with each item fixed at `flex: 0 0 calc(100% / (2 *
   count))` — this makes the per-item pixel width always equal `containerWidth / visible`
   regardless of breakpoint, and the `-50%` translate is always exactly "one full lap"
   because the content is always doubled.
2. **What's New** (`blocks/news-carousel`) — centered `<h2>`, 9 news cards (image 16:9, pill
   tag, right-aligned date, title, "Learn more" link with the site's existing
   `.link-arrow` chevron), sliding carousel with prev/next round buttons + line dots.
   Pagination/step math (3 desktop / 2 tablet / 1 mobile, 200 ms ease, infinite wrap) is
   plain JS measuring `viewport.clientWidth`, no slick/library.

## Content model

### `logo-carousel` — one row per logo, one cell
| cell | content |
|---|---|
| 1 | `<a href="…absolute partner page…"><img src="…absolute svg…" alt="Name"></a>` |

10 rows, order taken from the live `data-slick-index` order of `.cmp-logo-carousel`
(NVIDIA is slide 0): NVIDIA, TSMC, Intel Foundry, Tower Semiconductor, SiFive, Arm,
Imagination, UMC, Global Foundries, Samsung.

### `news-carousel` — one row per card, two cells
| cell | content |
|---|---|
| 1 (image) | `<img src="…absolute jpg/png…" alt="title">` |
| 2 (content) | `<p>tag</p><p>date</p><p><a href="…">title</a></p><p><a href="…">Learn more</a></p>` |

Decorate JS classifies paragraphs defensively (first no-link `<p>` → tag, second → date,
first `<p><a>` → title, second → "Learn more"); missing cells are just skipped. External
(non `www.synopsys.com`) links get `target="_blank" rel="noopener"`, matching the
reference's newsroom-vs-blog link behavior.

Both blocks reuse existing tokens from `styles/styles.css` (`--purple-light`, `--link-color`,
`--grey-text`) instead of hardcoding the reference's hex values, and the "Learn more" link
reuses the already-defined `.link-arrow::after` chevron mask.

Section IDs: `#ecosystem-partners` / `#whats-new` (via `section-metadata` `id` row) — used
only to scope the centered-`<h2>` rule in each block's own CSS file (no edits to
`styles.css` or `scripts.js`).

## Interactions / animations (source: site CSS + `synopsys-pagelibs.min.*.js`)

- Logo marquee: verified in bundled slick init call — `speed:5000, autoplay:true,
  autoplaySpeed:0, cssEase:'linear', slidesToShow:5, infinite:true, pauseOnHover:false,
  responsive:[{992:4},{768:3},{320:2}]`. 10 logos × 5000 ms / step ⇒ one full lap = 50 s.
  Reproduced as a 50 s linear infinite CSS animation. No pause-on-hover (matches reference).
- Card carousel: verified slick init — `infinite:true, dots:true, draggable:false,
  autoplay:false, speed:200, slidesToShow/Scroll:3, responsive:[{728:2},{600:1}]`.
  Reproduced with a 200 ms ease `transform` transition and modulo-based infinite paging.
  **Gap:** the wrap from last page → first page is a plain animated jump, not slick's
  seamless clone-based wrap — invisible in the default (slide-0) screenshot state, only
  visible if you page all the way around.
- Test hook (screenshot freeze): `migration/tools/site/eds.prep.js` now pauses & resets
  `.logo-carousel-track`'s Web Animation (`getAnimations().forEach(a => { a.pause(); a.currentTime
  = 0 })`) so captures always start at frame 0 (NVIDIA left-aligned). The news carousel needs
  no hook — it has no autoplay and always renders page 0 on load.

## Evidence (mismatch %, `tools/compare.sh`, fuzz 10%)

Crops use each block's live `getBoundingClientRect()` span (not the shared reference slot
y-range), because the isolated test page has no hero/cards/features above these two
sections — see gaps below. Images: `$MAIN/migration/evidence/blocks/logos-news/final-*`.

| state | viewport | crop | mismatch |
|---|---|---|---|
| Ecosystem Partners | desktop 1440 | `final-partners-d-sbs.png` | 4.78% |
| What's New | desktop 1440 | `final-news-d-sbs.png` | 16.03% |
| Ecosystem Partners | mobile 390 | `final-partners-m-sbs.png` | 7.57% |
| What's New | mobile 390 | `final-news-m-sbs.png` | 26.16% |

3 capture/compare rounds were run (r1: wrong marquee frame + 6 cards visible instead of 3;
r2: fixed marquee freeze hook + `ResizeObserver`-driven card sizing; final: added real
section padding to close most of the whitespace-height gap). Screenshot order/content
(logo names, alt text, card titles/dates/tags, "Learn more" links) matches the reference
exactly in the side-by-side images; remaining mismatch is dominated by section height
being a few percent short (see gaps) and, on mobile news, the card being ~20px narrower
than the reference's edge-to-edge layout.

## Remaining gaps

- Section vertical whitespace is a few percent short of the reference slot height in all
  four states (~315→351 px desktop / ~218→226 px mobile for partners is now *over*;
  news is still ~30–100 px short). The reference height includes generic per-component
  spacing (visible in `desktop-inventory.json`, e.g. `s7-column` height 315 vs the
  `.cmp-logo-carousel` CSS's own math of ~255px) that isn't captured in the digest/CSS
  I could inspect — I approximated it with a fixed `padding` on the section id rather than
  reverse-engineering the exact source, since content fidelity mattered more than exact
  whitespace under the time budget.
- News carousel infinite wrap is a plain jump, not a seamless clone-based loop (see above).
- Desktop arrow `left:-80px`/`right:-80px` offset was tuned empirically against the
  1440 screenshot; it hasn't been checked at intermediate desktop widths (992–1439px)
  where the reference's own breakpoints differ slightly from this project's container
  breakpoints (992/1200 vs the source site's 992/1400) — noted, not fixed, since only
  1440 and 390 are in scope.
- Reference's own screenshot includes an unrelated floating "Subscribe" pill bleeding into
  the What's New crop from an adjacent component — not something to reproduce.

## Global change requests

None. No edits to `scripts/aem.js`, `scripts/scripts.js`, `styles/*.css`, or `head.html`.

## Learnings

### Generic (may transfer to other blocks/tasks)
- **`section-metadata` `Style`/`Id` are resolved server-side by the DA/edge preview
  pipeline, not by this repo's `scripts/aem.js`/`scripts.js`** — grepped both files fully;
  neither contains logic to turn a `section-metadata` block into a `class`/`id` on the
  `.section`. Confirmed empirically: `curl .../x.plain.html` on both the local `aem up`
  proxy and the real `*.aem.page` origin already returns `<div class="light-grey"
  id="ecosystem-partners">` — so it's safe to write `section-metadata` in a sections file
  and trust it, even though there's no client-side code that looks like it processes it.
- **Block-authored images already arrive as `<picture>`, not a bare `<img>`.** The `Cards`
  block precedent (`createOptimizedPicture` inside `cards.js`) suggested block JS must
  build the picture itself, but that's stale for this project: the DA/edge pipeline
  optimizes *every* authored `<img>` (default content and block cells alike) into a
  `<picture>` before the client ever sees it. Calling `createOptimizedPicture` again on an
  already-optimized `<picture>`'s inner `<img>` re-wraps/duplicates it. Always
  `querySelector('picture')` first and only fall back to building one from a raw `<img>`.
- **A `window.addEventListener('resize', …)` alone is not enough to size a block that
  starts inside `display:none`.** `decorateSections` hides each `.section` until its blocks
  finish loading, so any block JS that reads `element.clientWidth` during `decorate()` gets
  0/garbage and never gets a real resize event when the section becomes visible (no resize
  fires on a `display` change). Use a `ResizeObserver` on the element you need to measure
  instead — it fires once layout is established, and also covers real window resizes for
  free.
- **`aem up` refuses to start if the current git branch name makes
  `<branch>--<repo>--<owner>` exceed 63 chars**, and it does this check *before* honoring
  a manually supplied `--url`, even though `--url` alone should be enough to bypass it when
  the git remote resolves fine. Long auto-generated worktree branch names (e.g.
  `pi/wf/…-uuid`) hit this immediately. Workaround: `git checkout -b <short-name>` inside
  the worktree just to run the local dev server, then switch back — no need to touch the
  real feature branch or commit anything on the temp one.
- **`pkill -f "aem-cli up"` is unsafe in a shared multi-agent environment** — it matches
  and kills *every* running `aem up` process on the machine, including other agents'
  local dev servers on other ports (confirmed: this run killed a peer's server on
  :3013). Prefer killing by the exact PID you started, or by port
  (`lsof -ti:<port> | xargs kill`).
- **Percentage-based flex-basis marquee trick**: for an N-item seamless CSS-only marquee
  with a variable "visible count" per breakpoint, doubling the item list and setting each
  item's `flex-basis` to a *constant* `100% / (2×N)` while varying only the *track*'s own
  width (`2000% / visible`) keeps `translateX(-50%)` correct at every breakpoint with zero
  JS resize logic — the visible-count only ever needs a CSS custom property.

### Synopsys-specific
- `.cmp-logo-carousel`'s slick config (`speed:5000, autoplaySpeed:0, slidesToShow:5`,
  responsive `992→4, 768→3, 320→2`) is only discoverable by grepping the minified
  `synopsys-pagelibs.min.*.js` bundle for `logoCarousel`/`card-carousel` — it is not present
  in any CSS comment or the DOM, and the two carousel types share the generic `.slick-*`
  CSS classes so you have to cross-reference `carousel-type="…"` attributes to know which
  slick options apply to which visual component.
- The reference "10 partner logos" are **not** in a single alphabetic/authoring order in
  the DOM — the real order (from `data-slick-index`) is NVIDIA, TSMC, Intel Foundry, Tower,
  SiFive, **Arm**, Imagination, UMC, Global Foundries, Samsung. The brief's prose list
  dropped Arm; only the DOM's `data-slick-index` sequence is authoritative.
- What's New card tag pill color (`#7e45af`) and "Learn more" link color (`#316aca`) are
  already project CSS variables (`--purple-light`, `--link-color`) — no new hex values
  needed.

## Time spent

~70 minutes.
