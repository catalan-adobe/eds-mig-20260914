# Reusable recipe: legacy page → EDS (DA) pixel-faithful migration

Status: draft from the Synopsys homepage run (1 site). Steps marked (H) are hypotheses not yet tested elsewhere.

## 0. Setup (≈7 min)
1. Inspect repo (blocks, styles, scripts, AGENTS.md), git remotes/permissions (push rights may sit on a different
   gh account; an SSH push URL per clone avoids global auth changes).
2. `git config --local branch.autoSetupMerge false` before any parallel worktree fan-out (H: generic git race).
3. Workspace `migration/` (tools, notes, sections, evidence — evidence gitignored, `migration/*` in .hlxignore).
4. Durable checkpoint `migration/PROGRESS.md` (plan, timeline, decisions) + `notes/learnings.md`.

## 1. Reference baseline (≈18 min)
1. Two recorded viewports: desktop 1440x900 (DPR1) and a device emulation (iPhone 13, DPR3, CSS-px shots).
2. Deterministic capture (`tools/capture.sh`): `page.clock.install()` → load → scroll for lazy media →
   `clock.pauseAt()` → site prep (reset carousels, hide consent) → viewport + full-page shots. Hide fixed
   overlays in full-page shots; compare them in viewport shots.
3. Save rendered DOM, server HTML, all CSS/JS bundles, fonts; build an inventory (per section boxes, text
   styles, images, backgrounds) and a breakpoint histogram from the CSS.
4. Build the SLOT TABLE (y-range per section per viewport). It is the contract that lets blocks be built in
   parallel and still line up in the assembled page.
5. Capture interaction states on the reference with a script (sticky header, menus, hovers, carousel steps,
   mobile menu, accordions) — same script shape will run against EDS.

## 2. Foundation (≈5 min, before fan-out)
- Self-host the reference's own font files (convert TTF→woff2, same subset) — identical metrics.
- Tokens, container widths and breakpoints mirrored from the reference CSS (fidelity > boilerplate defaults).
- Global buttons/links from the reference; section styles (backgrounds) as section-metadata styles.

## 3. Content model (David's Model)
- Default content first; blocks only for components; infer variants from content; rows for complex list items;
  nav/footer as fragments; no HTML/JSON in docs; images referenced by URL (preview ingests them) then copied
  into DA media for self-contained docs.

## 4. Parallel block build (worktrees)
- One agent per component group, each with: own worktree, own `aem up --port`, own playwright sessions, own DA
  draft doc, owned files only, section HTML output file, notes with evidence + learnings + global change requests.
- Shared brief file (rules, tools, slots, evidence paths) instead of long prompts.

## 5. Integration loop
1. Merge branches, reconcile conflicts (shared icons), apply global change requests.
2. `tools/assemble.mjs --media --push` → DA index doc (sections in page order + metadata) → preview.
3. `tools/fullcompare.mjs` → per-section + whole-page mismatch table at both viewports; fix the largest gap first.
4. Interaction states on EDS vs reference.

## 6. Authoring proof
- `tools/authoring-test.mjs edits.json`: edit copy/image/link in DA → preview → assert rendered → restore →
  assert restored equals original.

## 7. Decision support (Jev / System-1)
- Record closed decisions (section→block, authorable vs code, fidelity trade-offs) with context and own answer in
  `migration/jev/decisions.json`; replay through a fast classifier for agreement/latency/cost.
