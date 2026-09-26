# Block agent brief (shared)

Main checkout (read-only evidence): /Users/catalan/repos/ai/migration-tests/spm-tests/spm-ft-0001
Evidence dir: $MAIN/migration/evidence/ref/
- desktop-full.png / desktop-top.png (1440x900, Chromium desktop, DPR1)
- mobile-full.png / mobile-top.png (iPhone 13 emulation: 390x664 CSS, DPR3, touch; screenshots in CSS px)
- desktop.dom.html (rendered DOM after JS), source.html (server HTML)
- css/synopsys-pagelibs.min.*.css (ALL site CSS — grep class names for exact values), js/ (site JS)
- desktop-inventory.json / mobile-inventory.json (per section: boxes [x,y,w,h], text styles, images, bgs)
- desktop-tokens.json, mobile-tokens.json, nav-tree-clean.txt, fonts/
Screenshot states: carousels reset to slide 0, JS clock paused, OneTrust hidden; `*-full.png` also hides #chat-bar.

## Reference slots (y ranges in the full-page screenshots; each section must fill its slot exactly)
| part | desktop y | mobile y |
|---|---|---|
| utility bar | 0-53 (nav overlays hero 53-133) | none (nav overlays hero 0-70) |
| hero | 53-753 | 0-560 |
| intro (h2+p) | 753-964 | 560-840 |
| cards | 964-1548 | 840-2812 |
| features (Design the Future) | 1548-2696 | 2812-5018 |
| partners (logos) | 2696-3011 | 5018-5236 |
| what's new | 3011-3737 | 5236-5971 |
| support/careers | 3737-4017 | 5971-6357 |
| connect with us | 4017-4302 | 6357-6642 |
| footer | 4302-4877 | 6642-7318 |

## Breakpoints (from site CSS): 730 (mobile/tablet), 992 (container 970), 1130 (desktop header), 1200 (container 1170).
Container: 1170 (>=1200) / 970 (>=992) / fluid, all with 15px side padding. Already in styles/styles.css.

## Tools (in your worktree under migration/tools)
- `tools/pw.sh <session> <file.run.js>`: run playwright code via playwright-cli, print result.
- `tools/capture.sh <session> <url> <abs-out-prefix> <w> <h> <css-file> <prep-js-file> [full-css-file]`
  (w=0 keeps device viewport). Loads page, scrolls to trigger lazy load, pauses JS clock
  (page.clock), runs prep JS (no timers inside prep!), writes <out>-top.png + <out>-full.png.
- `tools/compare.sh <ref.png> <eds.png> <out-prefix> [ref-crop WxH+X+Y] [eds-crop WxH+X+Y]`
  prints mismatch % (fuzz 10%) and writes -diff.png and -sbs.png (side by side). Look at the sbs images.
- `tools/da.sh put spm-ft-0001/drafts/<id>.html <file>` then `tools/da.sh preview spm-ft-0001/drafts/<id>`
  (DA token handled by script, never print it). Nav doc: spm-ft-0001/nav.html, footer: spm-ft-0001/footer.html.
- Browser: ONLY playwright-cli (headless). Desktop session: `playwright-cli -s=<you>-d open <url>` then
  `resize 1440 900`. Mobile: `playwright-cli -s=<you>-m open --device "iPhone 13" <url>`.
- Local server: `aem up --port <yourport> --no-open` in your worktree (background it; kill it at the end).
  Serves your local code + previewed content from main--eds-mig-20260914--catalan-adobe.aem.page.
- Lint: `ln -s $MAIN/node_modules node_modules` once, then `npm run lint` must pass (airbnb + stylelint).

## Content (DA) rules — David's Model
- Default content over blocks; blocks only for real components; infer variants from content; no nested blocks;
  few columns; complex list items = block rows; buttons = link alone in a paragraph (bold = primary,
  italic = secondary); no HTML/CSS/JSON in docs; no hidden semantics in alt text; fully qualified URLs.
- Links: keep the site's hrefs but make them absolute to https://www.synopsys.com when relative.
- Images: reference the original synopsys image URLs (highest quality: drop `wid`/use large wid) in the DA
  HTML; preview ingests them into the media bus (verified, also for SVG).
- DA HTML shape: see migration/notes/eds-digest.md §9. Section metadata block: `<div class="section-metadata">`
  with rows `<div><div>style</div><div>light-grey</div></div>`. Page metadata block `<div class="metadata">`
  with nav=/spm-ft-0001/nav, footer=/spm-ft-0001/footer.
- Write ONLY your section divs (children of <main>) to migration/sections/<id>.html. For testing wrap them
  in `<body><header></header><main>...plus a metadata section...</main><footer></footer></body>` and put to
  your draft spm-ft-0001/drafts/<id>.html.

## Code rules
- Only edit blocks you own (listed in your task), new icons in icons/ (unique names), your sections file,
  your notes file. Never edit scripts/aem.js, head.html, scripts/scripts.js, styles/*.css (unless your task
  says so). Need a global change? Put exact code under "Global change requests" in your notes.
- Vanilla JS/CSS, no libraries (no jQuery/slick), no build step. Scope CSS to your block. Respect
  prefers-reduced-motion only where the reference does nothing different (fidelity first) — note it.
- Keyboard/ARIA basics for interactive parts. LCP image eager only in the hero.
- Read the verification skill /Users/catalan/.pi/agent/git/github.com/obra/superpowers/skills/verification-before-completion/SKILL.md
  right before each git commit (a commit gate enforces it). Commit in your worktree only.

## Deliverables
1. Code committed in your worktree. 2. migration/sections/<id>.html (and nav/footer docs if yours, also saved
   under migration/sections/). 3. migration/notes/blocks/<id>.md with: what you built; content model table;
   evidence (mismatch % per viewport and per state, crops used, paths of sbs images under
   $MAIN/migration/evidence/blocks/<id>/ — write evidence images there, it is gitignored); interactions/
   animations checked (timings from site CSS/JS); remaining gaps; learnings split into GENERIC (hypotheses
   that might transfer) vs SYNOPSYS-SPECIFIC; global change requests; time spent.
4. Stop aem up + close your playwright sessions. Prioritise the largest visual gaps first; aim for <= 75 min.
