# cards-columns

Owns: `blocks/cards/*`, `blocks/columns/*`, `migration/sections/cards-columns.html`.
Session names used for testing: `cc-d` (desktop 1440x900), `cc-m` (iPhone 13).

## What was built

1. **Cards** (slot desktop 964-1548, mobile 840-2812) — reworked the boilerplate `cards` block into
   4 tall photo cards (Synopsys.ai / EDA / Systems / Silicon IP). Each row's cells become a single
   `<a>` wrapping the image, a bottom gradient overlay, and a centered title; on hover (desktop) the
   description + "Learn More >" reveal by sliding the text block up (`bottom: -25px → 15px`, `1s`)
   and fading the paragraphs in (`opacity 0 → 1`, `.3s`) — timings taken from the site's
   `.component-solutioncard .image:hover .text-hover` / `.text-hover p` rules. Below 900px all
   content is always visible (matches `mobile-full.png`; the real site does the same via its own
   `max-width:730px` override).
2. **Features** ("Design the Future Today with Synopsys", slot desktop 1548-2696, mobile 2812-5018)
   — the `<h2>` is plain default content (site keeps it outside the icon-list component too); the
   two-column icon lists are a `columns key-benefits` block. Row 0 = the two `<h3>` column headings;
   rows 1-6 = one icon+title+description item per column cell. JS flattens the table into a single
   per-column list (`heading, item*6`) so mobile gets "Industry list, then Technology list" for free
   from plain document order (no JS media-query re-layout needed); desktop lays the same flat list
   out with `grid-auto-flow: column` + `grid-template-rows: repeat(7, auto)` so both column tracks
   stay row-aligned without duplicating markup. Each item becomes a single link (matches
   `.cmp-key-benefits__link` wrapping icon+title+description).
3. **Support/Careers** (slot desktop 3737-4017, mobile 5971-6357) — a `columns divider` block: one
   row, two cells (h2 + paragraph + a link-alone-in-a-paragraph CTA), with a JS-inserted 1px vertical
   divider between the two cells shown only at >=900px (matches `.snps-col-divider`/`.vl`). Section
   uses the existing `section-metadata` → `style: light-grey` convention (styles.css already ships
   `.section.light-grey`).

## Content model

| Block | Row 0 | Rows 1..N | Notes |
|---|---|---|---|
| `cards` | — | `[picture][h3 link, p desc, p link "Learn More"]` per card | Both links share the card's href; JS unwraps them and wraps the whole card body in one `<a>` |
| `columns key-benefits` | `[h3 Industry][h3 Technology]` | `[picture, h4 link, p desc]` x2 per row, 6 rows | JS flattens row-major table into two per-column lists, wraps each item in one `<a>` |
| `columns divider` | `[h2, p, p→a CTA][h2, p, p→a CTA]` | — | Plain link-alone-in-paragraph CTA, JS adds a divider div + `.columns-cta-link` class |

Variants: `key-benefits` and `divider` are explicit block options (not inferable purely from a plain
2-column table — the first needs the flatten/grid-column layout, the second needs the vertical rule),
so both get an explicit variant name per "no explicit variant when inferable, else a clear name".

## Evidence (desktop 1440x900 / iPhone 13, screenshots + sbs under
`$MAIN/migration/evidence/blocks/cards-columns/`, `cmp-<name>-sbs.png`)

| state | viewport | crop | mismatch % |
|---|---|---|---|
| cards (rest) | desktop | `1440x584+0+53` (from `-top.png`, see gap below) | 6.09% |
| cards (hover, card 1) | desktop | manual `.hover()` screenshot, `eds-cards-hover.png` | qualitative match (see below) |
| features | desktop | `1440x1148+0+637` | 2.79% |
| support | desktop | `1440x280+0+1787` | 2.35% |
| cards | mobile | `390x1932+0+0` | 1.94% |
| features | mobile | `390x2140+0+1985` | 4.91% |
| support | mobile | `390x480+0+4139` | 13.34%* |

\* support-mobile crop height (480) is taller than the real content (~410px); the extra ~70px picks
up the *next* section's background color bleeding in on both ref and eds crops (different colors on
each side since neither page has "connect with us" authored in this isolated test doc) — this is a
crop-boundary artifact, not a real fidelity gap. The actual two-column text/CTA layout matches almost
exactly in the sbs image.

Remaining ~6% cards mismatch is dominated by WebP re-compression noise in the 4 background photos
(visible as fine high-frequency speckle in the diff, not structural misalignment) — inherent to
the media-bus pipeline (images are re-encoded to WebP), not a CSS/markup issue.

## Interactions / animations checked

- Card hover reveal: `bottom -25px→15px` transition `1s`, description/CTA `opacity 0→1` transition
  `.3s` — verified by an explicit `page.hover()` + screenshot (`eds-cards-hover.png`): hovered card
  shows description + underlined "Learn More >", the other 3 stay closed. Timings/easing taken
  directly from `.component-solutioncard .image .text-hover` / `:hover` rules in the site CSS.
- `key-benefits` item links: site CSS defines no `:hover` state beyond `text-decoration:none`
  (verified: no `.cmp-key-benefits__link:hover` rule exists) — added a small `text-decoration:
  underline` on the title only as a keyboard/mouse affordance; this is a deviation from strict
  fidelity, noted as a gap below.
- `divider` CTA links: no site-specific hover animation found either; added a plain underline.
- Reduced motion: none of these three components have JS-driven or infinite animation (all are CSS
  `transition`s on `:hover`/`:focus-within`), so no `prefers-reduced-motion` handling was added,
  consistent with "respect it only where the reference does something different."

## Remaining gaps

- Cards default-state fidelity is measured from `-top.png`, not `-full.png` — see the fullPage
  screenshot bug in learnings below; this is a testing-methodology note, not a shipped-code gap.
- `columns key-benefits` mobile total height still runs a little long/short depending on the exact
  item copy length (13-line description wrapping); spacing constants (`margin-bottom`, `row-gap`) are
  hand-tuned to the reference's specific 12 items and would need re-tuning if item count/copy length
  changes materially.
- Support section mobile crop mismatch (13.34%) is a measurement artifact (see evidence table), not
  a real defect.

## Global change requests

None required for this task — the "section-metadata → style class" mechanism I assumed would need
wiring in `scripts.js` turned out to already be handled server-side by the DA/Helix preview pipeline
itself (confirmed empirically: an authored `<div class="section-metadata"><div><div>style</div>
<div>light-grey</div></div></div>` inside a section is stripped and its section gets `class=
"light-grey"` in the rendered `plain.html`, before `aem.js` even runs client-side). No code change
needed; corrected my own understanding mid-task (see learnings).

## Learnings — GENERIC (hypotheses that might transfer)

- **Playwright/Chromium `page.screenshot({fullPage: true})` can spuriously trigger `:hover`/
  transition state on off-screen elements that were never actually hovered.** Reproduced reliably:
  identical CSS, identical DOM, `page.screenshot()` (viewport-only) always shows the correct rest
  state; `page.screenshot({fullPage: true})` on the *same* page sometimes shows every hover-gated
  element mid-transition (verified via `transitionstart` listeners firing with no matching
  `mouseenter`). Root cause not fully isolated (likely an artifact of Chromium's CDP full-page
  capture internally resizing/recomposing the page), but the fix is: for any block whose default
  vs. hover state matters for a pixel diff, screenshot the state you need in a *dedicated* script
  (`page.hover()` + a scoped `clip` screenshot, or just no interaction + a non-fullPage screenshot)
  rather than trusting a generic `-full.png` capture for below-the-fold hover-gated content. Above
  the fold, prefer `-top.png` over `-full.png` when comparing rest-state hover components.
- **A long-lived persistent Playwright session (reused across many `pw.sh` calls) can serve a
  stale cached copy of a block's `.js`/`.css` file after you edit it on disk**, even though
  `page.goto()` runs again each time — a hard `close`+re`open` of the session (or a genuine
  hard-reload) is needed to guarantee you're testing the current code. Symptom: DOM built by JS
  looks subtly wrong (e.g. half the expected items) purely because of which session issued the
  request, not because of a code bug — reproduce/bisect the *same* check across a freshly opened
  session before spending time debugging the "bug" in your own code.
- **`array.map()`/`.forEach()` over a live `Element.children` HTMLCollection while moving those same
  children (`appendChild` to a new parent) desyncs the index on the second pass** — moving
  `row.children[0]` immediately re-indexes `row.children[1]` down to index 0. Always snapshot
  `[...el.children]` into a plain array *before* starting any DOM moves that touch that collection,
  even if the moves happen in a later `.forEach` over a *different* array.
- CSS specificity gotcha: a narrow single-class selector (`.my-exception{flex:none}`) will **not**
  override a broader `.parent > div > div{flex:1}` rule appearing earlier in the cascade — the
  broader selector has *higher* specificity (two type selectors) despite reading like a "generic
  default". Fix by matching the same combinator shape with the exception's class appended
  (`.parent > div > .my-exception{flex:none}`), not just by adding a class.
- For a11y-linked "hover-reveal" components, grep the *entire* site CSS for the component's `:hover`
  rule before adding your own — if the reference genuinely has no interaction (or has a different
  one) for a given sub-element, matching that (including "no hover effect") is more faithful than
  inventing a plausible-looking one.
- Working in a shared local dev server (`aem up`) + shared content bus (nav/footer fragments) while
  other subagents are concurrently authoring those same shared docs means your own draft's rendered
  header/footer can change mid-session out from under you. Point your own throwaway test draft's
  `Nav`/`Footer` page-metadata at a path that reliably 404s so your block-only screenshots stay
  isolated from unrelated concurrent work; swap in the real `/nav`/`/footer` only for final
  integration testing.
- `aem up`'s `--url` override is silently ignored (and a `branch name too long` error is thrown
  instead) whenever `git remote origin` resolves successfully but the *checked-out branch name*
  produces a `>63`-char DNS label — which is exactly the case for long worktree branch names. `git
  checkout --detach` before `aem up` (then re-checkout the branch afterward) makes `GitUtils.
  getBranch` fall back to `main`, producing the intended `main--<repo>--<owner>.aem.page` URL without
  needing `--url` at all.

## Learnings — SYNOPSYS-SPECIFIC

- Card hover-reveal timings: `text-hover` position transition `1s` (`bottom -25px → 15px`),
  description/CTA `opacity` transition `.3s`, both via `.component-solutioncard .image:hover
  .text-hover(...)` rules; card image gradient overlay is `linear-gradient(to bottom, rgba(0 0 0/0),
  rgba(0 0 0/.5) 28%, black 100%)`, `height: 275px` — verified pixel-identical structure in the sbs.
- `key-benefits` icon+title layout is a flex row (icon 50x50 + inline `h4`) at **every** breakpoint on
  this site (not gated behind the 730px breakpoint like most of the rest of the layout) — confirmed
  from the real mobile (390px) inventory dump (`cmp-key-benefits__img-text{display:flex}`
  unconditional in the site CSS).
- `.cmp-key-benefits__link` has no site-defined `:hover` style at all (only the ambient
  `text-decoration:none`) — the "hover" affordance I added (underline on title) is a deliberate small
  deviation from strict fidelity for perceived interactivity, not something in the reference.
- `section-metadata` → CSS class (e.g. `light-grey`) is resolved **server-side by the DA/Helix
  preview pipeline**, not by any project JS — verified empirically (this vendored `aem.js`/
  `scripts.js` has no `section-metadata` handling at all, yet the class still appeared in the
  rendered `plain.html` after `da.sh preview`). Don't assume you need to file a global change request
  for this — check the actual preview output first.

## Time spent

~100 minutes (includes diagnosing two non-obvious bugs: the fullPage-screenshot hover artifact and
the live-HTMLCollection flatten bug — both documented above so other agents can skip the
re-discovery cost).
