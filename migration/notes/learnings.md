# Learning machine — Synopsys homepage → EDS

Format: finding · evidence · status. GENERIC = hypothesis until tested on another site.

## Iteration 1 (setup, baseline, foundation) — 17:59–18:26 UTC

### Generic (hypotheses)
- G1 Parallel `git worktree add -b` races on `.git/config` when `branch.autoSetupMerge=always` (global) →
  set `git config --local branch.autoSetupMerge false` before fan-out. Evidence: first workflow failed with
  "could not lock config file"; relaunch after the change created 2 then 5 worktrees fine. Status: confirmed here.
- G2 Deterministic screenshots of animated legacy pages: `page.clock.install()` before navigation, natural time
  for load + lazy-scroll, then `clock.pauseAt()` freezes JS-driven carousels/progress bars/resize debouncers without
  site-specific code. CSS transitions still run (had to zero slick track transition). Status: confirmed on synopsys.
- G3 Download the site's CSS/JS bundles + rendered DOM at baseline so builders grep exact values (timings,
  breakpoints, easing) instead of eyeballing. Evidence: hero 7000ms/200ms fade and logo 5000ms linear found in JS in
  minutes; breakpoint histogram (730/992/1130/1200) from CSS. Status: useful here; test elsewhere.
- G4 A breakpoint histogram of `@media (min|max-width)` in the site CSS gives the real responsive grid quickly.
- G5 External image URLs in DA HTML are ingested into the media bus on preview (raster + SVG) → migration can skip
  a manual upload step for a first pass. Evidence: probe doc → ./media_<hash>.webp/.svg. Status: confirmed (DA).
- G6 playwright-cli `run-code --filename` + `--json` = scriptable captures while staying within "use playwright-cli".
  Mobile emulation with DPR3 needs `scale: 'css'` to keep screenshots diffable.
- G7 Research subagents are token-hungry (~10M tokens for 2 digests). Next time: give explicit URL lists + line
  caps, or do short doc reads inline.
- G8 This harness's commit gate requires re-reading verification-before-completion right before committing.

### Synopsys-specific
- S1 Stack: AEM Sites (aem-Grid), jQuery + slick carousels, FontAwesome kit, VideoJS, Coveo search, Adobe Brand
  Concierge chat bar (#chat-bar, fixed, z 10000), OneTrust consent.
- S2 Type: Roboto 300 dominant; body 18px/1.6 #111c24; h2 32px/1.1 (24px <730); html font-size 10px.
- S3 Hero: slick fade 200ms, custom 7000ms JS timer + jQuery-animated progress bar, pause button; stacked mobile
  layout with a separate mobile image; slide 5 = foreground image on black gradient.
- S4 Partners: slick marquee speed 5000 linear, autoplaySpeed 0, 5/4/3/2 per view; clones logos when 5.
- S5 What's New: 9 cards, 3/2/1 per view, slidesToScroll = slidesToShow, 200ms, arrows + dots, infinite.
- S6 Sticky nav: transparent over hero at top; white 80% + purple logo/CTA when scrolled; utility bar >=1130px.
- S7 No h1 on the page (hero h2 visually hidden, visible title is p>b).

### What I will do differently next time
- Set local git config for worktrees before the first fan-out.
- Capture the slot table (section y-ranges) first; it is the contract that makes parallel block work composable.

## Iteration 2 (parallel block build) — 18:26–19:40 UTC

### Generic (hypotheses)
- G2 REVISED: `page.clock.pauseAt()` works on the reference but HANGS on some EDS pages (hero draft; even with a
  +5 s target, and without any zero-delay timers in the block code). Root cause not isolated (time-boxed).
  Rule now: fake clock only on pages where it was verified; freeze EDS pages through block hooks
  (pause button, `getAnimations()` pause) — deterministic without faking time.
- G9 One hung `playwright-cli run-code` wedges its session daemon: every later command on that session queues
  forever, so an agent that "retries" hangs again. Two agents lost ~30-40 min each. Fix: `pw.sh` wraps run-code in
  `timeout` and kills the session daemon with an explanatory message; plus a global watchdog (150 s). Evidence:
  /tmp/pw-watchdog.log; agents resumed within minutes after the kill.
- G10 Background servers started inside an agent tool call (`aem up &`) die when the call's process group ends;
  use `nohup … &` (observed: all agent ports 3011-3015 dead after ~20 min; my own :3000 died the same way).
- G11 Full-page screenshots can put hover-gated elements into `:hover` (the pointer ends up over content when the
  viewport is expanded). Capture CSS `* { pointer-events: none !important }` on both sides removes it.
  (reported by cards agent, applied to ref + eds capture CSS).
- G12 Worktree agents still write to the main checkout when given absolute evidence paths (sections files, prep
  hooks landed in main). Harmless here, but merges need an "untracked files would be overwritten" check.
- G13 Cost: 5 parallel block agents ≈ 100M tokens in 35 min (mostly cached context). Parallelism bought wall
  time (5 blocks in ~40-70 min) at a high token price; small blocks (footer, logos) finished in 30-40 min.

### Synopsys-specific
- S9 Mobile shows `#floating-icon` (54px round button, rotating conic border) instead of `#chat-bar`.
- S10 The Ask pill's gradient border rotates (`rotate-border 4s linear infinite`, `@property --angle`); freeze
  with `animation: none` for comparisons.

## Iteration 3 (integration loop, me) — 19:05–20:37 UTC
Evidence: `migration/evidence/diff/<run>/table.md` (integ1 … main10, branch1). Page mismatch desktop 6.68% → 1.04%,
mobile 10.31% → 1.97%; every section ≤ 2.7%; tablet 1024 5.71% → 3.90%, 768 35.5% → 6.3%.

### Generic (hypotheses)
- G14 Per-section diffs need a selector→slot map, not section indexes: an extra heading section shifted every index
  after it and produced nonsense numbers. `tools/site/eds-slots.json` (first/last selector per slot) fixed it.
- G15 Measure element boxes at screenshot time (inside the capture), never after: layout changed after the clock
  resumed and crops landed on the wrong content.
- G16 Largest-gap-first on section HEIGHT before pixels: most mismatch was vertical drift (margins collapsing out
  of a background section, boilerplate `gap` leaking into grids, trailing paragraph margins). Fixing heights first
  collapsed the page diff from 7% to 3% before any styling change.
- G17 Global defaults must have zero specificity (`:where(a:any-link)`): a `(0,1,1)` global link rule silently beat
  every single-class block rule (wrong link colours in two blocks).
- G18 Copy the reference's rendering-affecting globals too: `-webkit-font-smoothing` (reference `auto` vs my
  `antialiased`) changed every glyph; removing it took the intro section from 0.25% to 0.00%.
- G19 Breakpoints and gutters belong to the reference grid, not the block author's habit: agents used 900/992
  where the reference switches at 730; aligning them fixed 768px (35% → 6%) without touching the recorded viewports.
- G20 Chromium full-page capture briefly re-evaluates media queries; CSS transitions then get caught mid-flight
  (cards revealed). Disable transitions in the capture CSS and verify timing separately (animation-evidence.md).
- G21 Agent self-reports are not evidence: one agent reported 2.79% for a section whose own sbs image showed a
  broken layout (real: 5.98%). Always re-measure integrated.
- G22 Freeze a live reference session (pause carousel) before measuring — probes taken seconds apart hit different
  slides and gave contradictory geometry.

### Synopsys-specific
- S11 Bootstrap-3 grid: containers 1170/970/fluid, 30px gutters, footer = full-width 5×20% row with 15px gutters.
- S12 Hero: slide text at fixed tops (170px desktop, 260px mobile), 7s timer, pause button with translateX(-50%),
  tab track line at the top of each tab, labels 400 16/22.4 clamped to 2 lines.
- S13 Cards image = height 102% centered (≥730), cover on mobile; text block anchored 15/-25px with fixed 68/77px boxes.
- S14 News carousel: track inset 40px and arrows at -9px below 1200; arrows at -95px ≥1200.
- S15 Ask pill = static 270° gradient ring (fill on hover); only the mobile floating icon rotates.

## Iteration 4 (states + authoring) — 20:19–20:37 UTC
- States: sticky 0.61%, card hover 1.78%, language 1.64%, news-next 0.46/0.53%, hero slide 3 0.66/1.69%;
  mega-menus 3–9% and mobile menu 13% → delegated to a focused agent.
- Authoring: 5 edits in 2 DA docs verified in preview within ~4s each and restored byte-identically
  (notes/authoring-proof.md). Nav doc edits deferred while an agent owned it.
- Timing: hero progress and marquee speed match to the sample (notes/animation-evidence.md).
- Next time: include menu/hover states in the block agents' definition of done from the start (the header agent
  only compared the closed header and got ~1% there while its menus were 3–13% off).
