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
