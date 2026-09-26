# Synopsys homepage → EDS migration — durable checkpoint (FINAL STATE)

Resume here. Secrets: `.hlx/.da-token.json`, `.env.jev` — never print/commit.

## Understanding
- Goal: 1:1 replica of https://www.synopsys.com/ (header, all sections, footer) on EDS, authorable in DA.
- Success order: (1) pixel fidelity incl. animations, desktop + mobile; (2) authorable content (edit → preview →
  restore); (3) speed (timed passes); (4) learning log (generic vs Synopsys).
- Constraints: no adobe/skills, no reuse of other local projects/branches; test docs only; never edit
  `scripts/aem.js`; scope = homepage.

## Environment / deliverables
- Code: GitHub `catalan-adobe/eds-mig-20260914`, branch `spm-ft-0001` (pushed via SSH push URL for this clone).
- DA documents: `/spm-ft-0001/index` (page), `/spm-ft-0001/nav`, `/spm-ft-0001/footer`, media in `/spm-ft-0001/media/`.
  Editor: https://da.live/edit#/catalan-adobe/eds-mig-20260914/spm-ft-0001/index
- Preview with this branch's code: https://spm-ft-0001--eds-mig-20260914--catalan-adobe.aem.page/spm-ft-0001/
- Content preview (main code): https://main--eds-mig-20260914--catalan-adobe.aem.page/spm-ft-0001/
- Local: `aem up` → http://localhost:3000/spm-ft-0001/
- Loop: `node migration/tools/assemble.mjs --media --push` then `node migration/tools/fullcompare.mjs <url> <label>`.

## Plan (all done)
- [x] P0 inspect project, branch, checkpoint
- [x] P1 research (bg subagents): EDS digest → `notes/eds-digest.md`; Jev → `notes/jev-research.md` + `tools/jev.mjs`
- [x] P2 reference baseline: screenshots desktop/mobile/tablet, DOM/CSS/JS, inventory, tokens, 13 states
- [x] P3 content model + DA docs (index/nav/footer) + media, preview
- [x] P4 foundation: fonts, tokens, container, buttons; local aem up
- [x] P5 blocks (5 parallel subagents in worktrees)
- [x] P6 integration + whole-page diff loop (largest gap first), states, tablet sanity
- [x] P7 authoring proof: edit → preview → verify → restore (`notes/authoring-proof.md`)
- [x] P8 push branch, verify on aem.page, cleanup (drafts, worktrees, sessions), report + recipe

## Timeline (UTC, 2026-09-26)
| pass | start | end | notes |
|---|---|---|---|
| P0 setup + inspection | 17:59 | 18:06 | branch, workspace, ignores |
| P1 research (2 bg agents) | 18:06 | 18:18 | 1st launch failed (git config lock race); ~10M tokens |
| P2 reference baseline | 18:06 | 18:24 | captures, DOM/CSS/JS, inventory, tokens |
| P4 foundation | 18:21 | 18:25 | fonts (synopsys TTF→woff2), tokens, container, buttons, tools |
| P5 block agents (5 parallel) | 18:26 | 20:00 | footer 33m, logos 40m, cards 49m, header 85m, hero 93m; 2 agents lost ~40m to wedged browser sessions; ~200M tokens |
| P6 integration loop (me) | 19:05 | 20:37 | 16 compare rounds; page 6.7%→1.04% desktop, 10.3%→1.97% mobile |
| P6b states + menus agent | 20:19 | 21:15 | menus agent 43m (~51M tokens) + my fixes; menus 3–13% → 1.6–3.6% |
| P7 authoring proof | 20:24 | 20:33 | 5 edits in 2 docs, verified + restored |
| P8 final verification + cleanup + docs | 21:15 | 21:25 | branch preview compare, drafts deleted/unpreviewed |
| **total** | 17:59 | 21:25 | **≈3h26m wall clock** |

## Final evidence (fuzz 10% pixel mismatch; `migration/evidence/diff/final-branch/table.md`, `final-states.md`)
| viewport | page | top viewport | worst section |
|---|---|---|---|
| desktop 1440×900 | 1.04% (4877 vs 4876 px tall) | 0.27% | footer 2.27% |
| mobile iPhone 13 390×664 | 1.97% (7316 vs 7318 px) | 0.38% | features 2.68% |
| tablet 1024 (unrecorded) | 3.90% | 0.32% | — |
| tablet 768 (unrecorded) | 6.32% | 0.45% | — |
States: sticky 0.23%, card hover 0.80%, language 1.32%, news-next 0.38/0.39%, hero slide 3 0.28/1.31%,
mega-menus 2.34/3.57/1.96/2.47/1.64%, mobile menu 2.98%. Timing: hero progress/slide change and marquee speed match.

## Key decisions
- Viewports: desktop 1440×900 Chromium DPR1; mobile iPhone 13 emulation (390×664, DPR3, CSS-px screenshots).
- Deterministic reference: fake clock + carousel reset; EDS: block hooks (no fake clock — it hangs on EDS pages).
- OneTrust hidden; `#chat-bar`/`#floating-icon` hidden in full-page shots, compared in viewport shots.
- Breakpoints/gutters/fonts/font-smoothing mirror the reference (fidelity > boilerplate conventions).
- Content: default content + 6 blocks (hero-carousel, cards, columns[key-benefits|divider], logo-carousel,
  news-carousel) + header/footer fragments; index images copied into DA media.
- Jev (typesafe/jev via CF AI gateway): HTTP 402 insufficient balance throughout → decision set + harness ready,
  proxy evaluation with Workers AI Llama models documented.

## Learnings
See `notes/learnings.md` (5 iterations, generic vs Synopsys-specific) and `notes/recipe.md`.
