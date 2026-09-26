# Synopsys homepage → EDS migration — durable checkpoint

Resume here. Update after every pass. Secrets: `.hlx/.da-token.json`, `.env.jev` — never print/commit.

## Understanding (brief)
- Goal: 1:1 replica of https://www.synopsys.com/ (header, all sections, footer) on EDS, authorable in DA.
- Success order: (1) pixel fidelity incl. animations, desktop + mobile; (2) authorable content
  (proved by edit → preview → restore); (3) speed (timed passes); (4) learning log (generic vs Synopsys).
- Constraints: no adobe/skills, no reuse of other local projects/branches; test docs only; never edit
  `scripts/aem.js`; scope = homepage.
- Assumptions: desktop viewport 1440x900, mobile 390x844 (DPR 1 for diffs); cookie-consent banner (OneTrust)
  is 3rd-party and excluded; content/doc paths under `/spm-ft-0001/` in DA; code on branch `spm-ft-0001`.

## Environment
- Repo: catalan-adobe/eds-mig-20260914, branch `spm-ft-0001` (other branches belong to other runs — untouched).
- DA: https://da.live/#/catalan-adobe/eds-mig-20260914/spm-ft-0001 (index, nav, footer)
- Preview (content): https://main--eds-mig-20260914--catalan-adobe.aem.page/spm-ft-0001/
- Preview (code branch): https://spm-ft-0001--eds-mig-20260914--catalan-adobe.aem.page/spm-ft-0001/
- Local: `aem up` → http://localhost:3000/spm-ft-0001/

## Plan
- [x] P0 inspect project, branch, checkpoint
- [x] P1 research (bg subagents): EDS digest → `notes/eds-digest.md`; Jev → `notes/jev-research.md` + `tools/jev.mjs`
- [x] P2 reference baseline: screenshots desktop/mobile, section map, styles, assets, states, animations
- [x] P3 content model + DA docs (index/nav/footer) + media, preview
- [x] P4 foundation: fonts, tokens, sections, buttons; local aem up
- [x] P5 blocks (parallel subagents, worktrees): header, footer, hero carousel, cards, lists, logos, news carousel, columns, cta
- [x] P6 integrate + whole-page diff loop (largest gap first) — desktop 1.62% / mobile 2.55%
- [x] P7 authoring proof: edit → preview → verify → restore (notes/authoring-proof.md)
- [ ] P8 push branch, verify on aem.page, final evidence, report + recipe

## Timeline (UTC)
| pass | start | end | notes |
|---|---|---|---|
| P0 setup + inspection | 17:59 | 18:06 | branch spm-ft-0001, workspace, ignores |
| P1 research (2 bg agents) | 18:06 | 18:18 | 1st launch failed (git config lock race), relaunch ok; ~10M tokens |
| P2 reference baseline | 18:06 | 18:24 | full-page + top screenshots desktop/mobile, DOM/CSS/JS, inventory, tokens |
| P4 foundation | 18:21 | 18:25 | fonts (synopsys TTF->woff2), tokens, container, buttons, compare tool |
| P5 block agents (5 parallel) | 18:26 | 20:00 | footer 33m, logos 40m, cards 49m, header 85m, hero 93m (2 hung ~40m on wedged sessions) |
| P6 integration loop (me) | 19:05 | 20:19 | 14 compare rounds; page 6.7%→1.63% desktop, 10.3%→2.55% mobile |
| P6b interaction states | 20:19 | 20:22 | 13 states compared; menus 3-13% → delegated (menus agent) |
| P7 authoring proof | 20:24 | 20:33 | 5 edits in 2 docs, verified + restored |

## Key decisions
- Viewports: desktop 1440x900 Chromium DPR1; mobile iPhone 13 emulation 390x664 DPR3 (CSS-px screenshots).
- Deterministic states: page.clock.install() before goto, pauseAt() after lazy-load scroll, carousels reset to 0.
- OneTrust hidden (3rd-party consent), #chat-bar hidden in full-page shots (fixed overlay compared in viewport shots).
- Breakpoints mirror source CSS (730/992/1130/1200) instead of boilerplate 600/900/1200 (fidelity > convention).
- Fonts: synopsys' own Roboto TTF 300/400/500/700 converted to woff2 (latin subset) for identical metrics.
- Images: DA HTML may reference external URLs; preview ingests into media bus (verified incl. SVG).
- Jev (typesafe/jev via CF AI gateway): HTTP 402 insufficient balance -> blocked; decision set prepared.

## Evidence index
(see `migration/evidence/` — gitignored; key numbers copied here)

## Learnings
See `notes/learnings.md`.
