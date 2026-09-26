# Hero carousel block

## What was built

New block `blocks/hero-carousel/` implementing the homepage banner carousel (desktop slot
53–753 / mobile slot 0–560, both under the overlaid nav). 5 slides, each with a full-bleed
background photo (desktop) + a separate smaller "stacked" photo (mobile), title with authored
line breaks, subtitle, 1–2 CTA buttons, a bottom tab bar with per-slide labels, a 2px track +
white progress bar that fills linearly over 7000ms and auto-advances (200ms cross-fade), and a
round pause/play button. Keyboard (Left/Right/Home/End) and click-to-jump on tabs are supported.
Slide 5 has no desktop photo — it shows the NVIDIA/Synopsys foreground lockup over a black
gradient background, matching the reference `carousel_copy_copy` markup.

Timings/sizes were read directly from the reference CSS/JS (not guessed):
- `synopsys-pagelibs.min...js`: `autoplay:true, autoplaySpeed:7E3, speed:200` (banner-carousel
  slick config), and the custom progress-bar driver (`E=7E3` autoplay ms, `.animate({width:'100%'},E,'linear')`,
  reset to 0 on `afterChange`, `slickPause`/`slickPlay` + icon swap on the `.pause-btn` click).
- `.carousel-wrapper-hp`, `.carousel-holder[carousel-type="banner-carousel"] .center-wrapper/.slick-dots/.pause-btn`
  for all sizes/paddings/gaps at breakpoints 730/992/1200/1400.
- `.component-banner .bg-desktop/.bg-mobile.{black,dark-purple}-gradient`, `.image-overlay.opacity-{0,40,50}`
  for the per-slide background treatment.

## Content model (DA table rows)

One block row per slide, 4 cells:

| cell | contents |
|---|---|
| 1. images | 1 or 2 `<picture>`: **2** → `[desktop photo, mobile photo]`; **1** → mobile-only (no desktop photo, e.g. slide 5) |
| 2. foreground image | optional single `<picture>` (only slide 5 populates it — the NVIDIA/Synopsys lockup SVG) |
| 3. content | `<h2>` title (`<br>` for an authored forced line break, e.g. slide 1/4), optional `<p>` subtitle, 1–2 button paragraphs (`**bold**` link → primary/white, `*italic*` link → secondary/outlined) |
| 4. tab label | plain text used for the bottom-tab accessible label (shorter than the visible title in the reference, so kept as its own cell rather than reusing the h2) |

No JSON/HTML/CSS in the doc. Per-slide background gradient/overlay variant (dark-purple vs.
black, overlay darkness on slides 3/4) is **not** authored — it's inferred from slide position
(`:nth-child`) in the block's own CSS, since it's a fixed 5-slide component, not a generic
n-slide pattern; see "global change requests" for why this doesn't belong in content.

Buttons: relies on the existing global `decorateButtons`/`a.button.primary|secondary` — but the
reference's "dark primary" (white fill, dark text) and "dark secondary" (transparent, white
border/text) don't match the global `.primary` (purple) styling, so `hero-carousel.css` overrides
`.hero-carousel a.button.primary/.secondary` scoped to the block only (no global edit).

First slide's images are `loading="eager"` (LCP); all other images/pictures are lazy.

## Test hook (documented for the integrator)

`aem up` + local block JS has no dependency on `page.clock` (it hangs on this project's pages —
confirmed independently, matches the note already patched into `pw.sh`/`capture.tpl.js`). Use
real interaction instead, from a plain `page.evaluate`, no timers required:

```js
// Force-select slide N (0-based) at t=0, paused (reliable even mid-autoplay: click a
// different tab first so the click always triggers a real transition, then the target):
const tabs = document.querySelectorAll('.hero-carousel-tabs button');
tabs[(N + 1) % tabs.length].click();
tabs[N].click();
document.querySelector('.hero-carousel-pause').click(); // freezes the active progress bar

// Mid-progress screenshot (e.g. "3.5s / 50%"), no waiting required:
const bar = document.querySelector('.hero-carousel-tabs [aria-selected="true"] .hero-carousel-progress-bar');
bar.style.transition = 'none';
bar.style.width = '50%';
```

Also hide the header for isolated hero screenshots during dev (`header{display:none!important}`)
— the header block's own nav flyout got stuck open in some of my captures and rendered on top
of the hero area; not a hero-carousel bug, but it pollutes hero-only crops.

## Evidence

All screenshots/diffs under `$MAIN/migration/evidence/blocks/hero/` (desktop crop
`1440x700+0+0` eds vs `1440x700+0+53` ref to account for the missing header in isolated
captures; mobile crop `390x560+0+0` both sides). Reference slides 2–5 + the mid-progress state
were captured live from `https://www.synopsys.com/` via `jQuery('.carousel-list-holder').first().slick('slickGoTo', i, true)`
+ `.pause-btn` click, mirroring `migration/tools/site/ref-states.run.js`.

| state | viewport | mismatch |
|---|---|---|
| slide 1 @ t=0 | desktop 1440×700 | 3.02% |
| slide 2 | desktop | 3.55% |
| slide 3 | desktop | 3.39% |
| slide 4 | desktop | 2.87% |
| slide 5 | desktop | 2.30% |
| slide 1 @ ~3.5s (progress 50%) | desktop | 3.03% |
| slide 1 @ t=0 | mobile 390×560 | 9.96% |

Iterated 3 rounds: (1) first pass ~4.6–6.8% desktop, mobile untested — found the vertical
position used `align-items:center` instead of the reference's fixed `top:170/236px`, and slide 5's
desktop/mobile background fell through to the wrong gradient (bg layer was empty for the
no-photo slide, revealing the block's default purple instead of black); (2) fixed both, desktop
dropped to 2.3–3.6%, mobile-first pass was 11.35% single test, traced to a small cumulative
vertical offset in the mobile stacked text block; (3) nudged `.hero-carousel-inner`'s mobile
`top` from 236→252px, mobile down to 9.96%.

## Interactions/animations checked

- Autoplay 7000ms per slide, 200ms opacity cross-fade — matches `autoplaySpeed`/`speed` in the
  reference slick config.
- Progress bar fills linearly 0→100% over 7000ms, resets on every slide change (auto or manual).
- Pause/play button: click stops the timer and freezes the bar at its current fraction (computed
  from real elapsed ms, not the animation's rendered width), swaps to the play icon; click again
  resumes with the remaining time. Matches the reference's `Date.now()`-based elapsed bookkeeping
  (not just `animate().stop()`, so resuming continues from the correct point, not from 0).
- Tab click always jumps + resumes autoplay (un-pauses), matching the reference's `afterChange`
  handler which unconditionally calls `slickPlay`.
- Keyboard: Left/Right moves and activates the adjacent tab, Home/End jump to first/last.
- `prefers-reduced-motion` is **not** respected — the reference site itself doesn't gate the
  autoplay/fade on it either, so this preserves fidelity (documented per brief's guidance).

## Remaining gaps

- Mobile vertical offset not fully eliminated (~10% mismatch) — the reference likely composites
  the stacked mobile image/text differently (absolute overlap of a `top:236` block starting
  above the image's own bottom edge) than my normal-flow-adjacent approach; a full rebuild using
  absolute positioning for the mobile text block (matching the reference 1:1 instead of
  approximating) would likely close this further but was cut for time.
- Desktop mismatch (~2.3–3.6%) is mostly anti-aliasing/JPEG re-compression noise from the
  optimized-picture pipeline plus the missing header/nav band in isolated captures (not part of
  this block) — did not chase below ~2–3% given the time budget.
- Did not verify `prefers-reduced-motion` visually, only by reading the reference CSS/JS (no
  motion-media gating found).
- Slide 3's title (`Introducing Hardware-Assisted Verification for the AI Era`) relies on the
  same natural word-wrap as the reference (no authored `<br>`, single `<p>` in the source DOM) —
  wrap matched visually in every capture but wasn't diffed pixel-for-pixel against a dedicated
  reference-wrap-only crop.

## Learnings

**GENERIC** (may transfer to other blocks/projects):
- `page.clock.install()`/`pauseAt()` can hang indefinitely on real pages with their own timer-heavy
  JS (slick carousels, etc.) — don't rely on it for deterministic capture; instead give every
  timed/animated block an explicit JS test hook (a button click, or a documented one-liner that
  sets `el.style.transition='none'; el.style.width=X` directly) that freezes state without any
  waiting or fake timers.
- CSS transitions run on real wall-clock time regardless of any JS clock faking — a component
  driven by `element.style.width` + `transition` (rather than rAF-stepped JS) can't be frozen by
  faking `Date`/`setTimeout`; it needs its own freeze affordance.
- For a *known, fixed* small set of variants (e.g. "5 specific slides, not an open-ended list"),
  encoding per-item cosmetic parameters via block CSS `:nth-child` rather than extra authored
  cells is a reasonable content-model simplification — cuts columns without inventing hidden
  semantics, as long as it's documented (an author reordering slides would need a code follow-up,
  which is fine for a hero this custom).
- When a block's "primary/secondary" button colors don't match the project's global
  `.button.primary/.secondary` palette (e.g. dark-theme banners needing white-fill primary
  instead of brand-purple), scope an override to the block (`.my-block a.button.primary{...}`)
  rather than requesting a global change — it's just normal CSS specificity, no shared-file edit
  needed.
- Background aem-cli dev servers reliably die between separate tool invocations in a
  heavily-loaded sandbox even with `nohup`/`disown`; safest pattern is to check `ps`/curl-probe
  and restart it at the top of every command block that depends on it, in the same invocation as
  the work that needs it.

**SYNOPSYS-SPECIFIC**:
- Banner carousel autoplay = 7000ms, fade = 200ms, progress bar driven by real elapsed
  `Date.now()` deltas (not just a naive `setInterval` re-trigger), read from
  `synopsys-pagelibs.min...js` around the `banner-carousel` slick init block.
- Gradients: `black-gradient = linear-gradient(107.7deg,#000 0,#191c20 35%,#646e81 100%)`,
  `dark-purple-gradient = linear-gradient(107.7deg,#2d1541 0,#5a2a82 50%,#7e45af 100%)` — these
  exact stops recur across many other components (`.component-banner`, `.bg-desktop/.bg-mobile`)
  so are worth keeping as CSS custom properties if more blocks need them.
- The `.carousel-holder[carousel-type="banner-carousel"] .slick-dots li button` label text is
  visually hidden (`color:transparent`, `font-size:0`) below 992px and only shown from 992px up —
  easy to miss since the base (mobile) rule sets a real font-size/line-clamp that only becomes
  visible due to the color override, not a `display:none`.
- `component-button.dark.primary` = white fill/dark text, `.dark.secondary` = transparent/white
  border+text — this exact "dark" banner-button theme appears on every dark-background banner on
  the site (hero, other banners), not just this carousel; worth a shared utility if more banner
  blocks are built.

## Global change requests

None required for my own delivery. For information: `migration/tools/pw.sh` and
`migration/tools/capture.tpl.js` already contain an uncommitted fix (present in my worktree when
I started, likely pushed by the coordinator) that (a) skips `page.clock` entirely for `localhost`
URLs and (b) makes `pw.sh` time out after 120s and kill the wedged session with a clear message
instead of hanging forever. I did not commit this change (I don't own `migration/tools/`), but
if it isn't already merged centrally, it's worth doing so — it's what let me finish this task
after `page.clock.pauseAt()` hung repeatedly against my local dev server.

## Files changed

- `blocks/hero-carousel/hero-carousel.js` (new)
- `blocks/hero-carousel/hero-carousel.css` (new)
- `migration/sections/hero.html` (new)
- `migration/notes/blocks/hero.md` (this file)

## Time spent

~2.5 hours (well over the 75-minute target — most of the overage was infrastructure debugging:
the assigned worktree's git branch name exceeded aem-cli's 63-char DNS-label limit for local
serving, requiring a local-only short-named branch just to run `aem up`; the shared dev server
kept dying between tool calls in this sandbox; and `page.clock.pauseAt()` repeatedly hung against
the local dev server, requiring a from-scratch deterministic-capture script instead of
`tools/capture.sh`).
