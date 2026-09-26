# Reusable recipe: legacy page → EDS (DA), pixel-faithful and authorable

Status: derived from ONE site (synopsys.com homepage, 2026-09-26). Everything marked (H) is a hypothesis until it
has been repeated on another site. Times are wall-clock from this run.

## 0. Setup (7 min)
1. Inspect repo (AGENTS.md, blocks, styles, scripts), remotes and push rights. If `gh` has the wrong active account,
   set an SSH push URL for this clone only (`git remote set-url --push origin git@github.com:…`).
2. Before any parallel fan-out: `git config --local branch.autoSetupMerge false` (H; avoids a `.git/config` lock race).
3. Workspace `migration/` (`tools/`, `notes/`, `sections/`, `evidence/` gitignored; `migration/*` in `.hlxignore`).
4. Durable checkpoint `migration/PROGRESS.md` + learning log `notes/learnings.md`; update after every pass.

## 1. Reference baseline (18 min)
1. Record two viewports: desktop 1440×900 (DPR1) and device emulation (iPhone 13, DPR3; screenshots `scale: 'css'`).
2. `tools/capture.sh`: fake clock (`page.clock.install` → load → lazy-scroll → `pauseAt`) ONLY on the reference host;
   site prep resets carousels; hide consent + fixed overlays in full-page shots, keep them in viewport shots;
   `* { pointer-events: none }` so full-page capture cannot trigger `:hover`.
3. Save rendered DOM, server HTML, all CSS/JS bundles and fonts. Build an inventory (boxes, text styles, images
   per section) and a breakpoint histogram of the CSS (H: the top 4 values are the real grid).
4. Build the SLOT TABLE (y-range per section per viewport) — the contract for parallel block work.
5. Script the interaction states (sticky header, each menu, hovers, carousel steps, mobile menu, accordions) on the
   reference; the EDS twin script must produce the same file names.
6. Note rendering globals (font smoothing, box-sizing, html font-size) — copy them, they touch every pixel.

## 2. Foundation (5 min, before fan-out)
- Self-host the reference's own font files (TTF→woff2, same subset). Mirror container widths, gutters and
  breakpoints from the reference CSS (not boilerplate defaults). Global rules with zero specificity (`:where()`).

## 3. Content model (David's Model)
- Default content first; blocks only for components; infer variants from content; complex list items = block rows;
  nav/footer as fragments (per-page `nav`/`footer` metadata to keep test docs isolated); no HTML/JSON in docs;
  links absolute; images by URL (preview ingests external raster + SVG), then copied into DA
  (`assemble.mjs --media`, incremental: 56 s → 5.5 s on re-runs).

## 4. Parallel block build (worktrees) — 33–93 min per agent
- One agent per component group; shared brief file (rules, tools, slot table, evidence paths); own worktree,
  own `nohup aem up --port`, own playwright sessions, own DA draft; owned files only; section HTML output file;
  notes with evidence + learnings + global change requests.
- Definition of done must include every interaction state of the component (menus, hovers), not just rest state.
- Guard rails: run-code through a timeout wrapper that kills wedged sessions + a global watchdog; no fake clock on
  EDS pages; re-measure every agent claim after integration.

## 5. Integration loop (≈90 min here, 14 rounds)
1. Merge branches (resolve shared-asset conflicts), apply global change requests.
2. `node migration/tools/assemble.mjs --media --push` → DA index doc → preview (≈6 s).
3. `node migration/tools/fullcompare.mjs <url> <label>` (≈45 s): whole page + per-slot diffs at both viewports
   (selector-based slot map `tools/site/eds-slots.json`, boxes measured at capture time).
4. Fix section HEIGHTS first (vertical drift dominates), then typography/geometry from exact reference CSS values,
   then states. Re-run after each fix; commit when green.
5. Sanity-check unrecorded widths (1024, 768) — breakpoint mistakes show up there first.

## 6. Authoring proof (10 min)
- `node migration/tools/authoring-test.mjs apply edits.json` → screenshots of the edited branch preview →
  `… restore edits.json` (asserts previewed HTML byte-identical to the pre-edit snapshot).

## 7. Decision support (Jev / System-1)
- Record closed decisions (section→block, authorable vs code, fidelity trade-offs) with context and own answer in
  `migration/jev/decisions.json`; replay with `tools/jev-eval.mjs` (Jev) or `tools/cf-llm-eval.mjs` (proxy model).
- Observed: 70B proxy agreed 16/18, 8B 13/18, at ~0.25–0.5 s per call. Use as a pre-classifier/second opinion that
  flags disagreements, not as the decider; valuable at multi-page scale, marginal for one page.
