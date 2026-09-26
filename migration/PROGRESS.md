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
- [ ] P1 research (bg subagents): EDS digest → `notes/eds-digest.md`; Jev → `notes/jev-research.md` + `tools/jev.mjs`
- [ ] P2 reference baseline: screenshots desktop/mobile, section map, styles, assets, states, animations
- [ ] P3 content model + DA docs (index/nav/footer) + media, preview
- [ ] P4 foundation: fonts, tokens, sections, buttons; local aem up
- [ ] P5 blocks (parallel subagents, worktrees): header, footer, hero carousel, cards, lists, logos, news carousel, columns, cta
- [ ] P6 integrate + whole-page diff loop (largest gap first)
- [ ] P7 authoring proof: edit → preview → verify → restore
- [ ] P8 push branch, verify on aem.page, final evidence, report + recipe

## Timeline (UTC)
| pass | start | end | notes |
|---|---|---|---|
| P0 setup | 17:59 | 18:08 | |

## Evidence index
(see `migration/evidence/` — gitignored; key numbers copied here)

## Learnings
See `notes/learnings.md`.
