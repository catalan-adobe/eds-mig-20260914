# Journal — wknd-adventures.com replica migration

Chronological log of every prompt execution. Most recent at the bottom.
See `skills/stardust/reference/journal-format.md` for entry format.

---
## Extract — home page captured, bounded single-page entry (2026-09-25)

**Prompt:** Migrate https://wknd-adventures.com/ (home only) to EDS as a pixel-perfect replica; deploy to catalan-adobe/eds-mig-20260914 branch sd-spm--0001; hands-off.

**Decisions:**
- Flow `replica`, hands-off, bounded entry (`crawl.mjs --pages / --dynamics`); no PRODUCT/DESIGN synthesis from extract — Phase 2 takes the bounded promotion branch.
- Source is a static site: one stylesheet `css/styles.css` (30 KB minified), `js/site.js` (2 KB), self-hosted OFL fonts (Instrument Sans, Syncopate) → self-host the same woff2 files.

**Artifacts touched:**
- stardust/current/pages/index.{json,html}, assets/screenshots/index.png — created (crawl)
- stardust/current/assets/fonts/*.woff2 (3), assets/media/** (9 images) — created (harvest)
- stardust/replica/capture/styles.css, site.js — created (source CSS/JS for lifting)
- stardust/current/DESIGN.json — created (cap-probe: containerMaxWidth 1200, probeWidth 2560, 9 modules)
- stardust/state.json — page row `index` → extracted

**Findings worth flagging:**
- Dynamic surface: 0 endpoints, 0 forms, 0 hydrated — static page; ticker strip + nav toggle are the only JS behaviors (site.js).

**Open questions:** none

**Next:** Phase 2 preserve-direction (bounded synthesis) → Phase 3 recreate.

---
## Preserve-direction — bounded synthesis, empty register (2026-09-25)

**Prompt:** (same run) Phase 2 of replica.

**Decisions:**
- Bounded promotion branch: PRODUCT.md / DESIGN.md / DESIGN.json synthesized from index.json + lifted tokens, provenance `bounded-single`.
- Inconsistency register empty — pure replica (no audit, no --register).
- Dynamics: crawl reported 0 endpoints / 0 forms / 0 hydration; behaviors are client-only (tabs, FAQ, nav, ticker) → no dynamic-features triage rows needed beyond the static recreation; recorded here as the disposition.

**Artifacts touched:** PRODUCT.md, DESIGN.md, DESIGN.json — created; stardust/direction.md — rewritten in the contract shape; stardust/replica/inconsistency-register.md, stardust/replica/capture/tokens.json — created.

**Open questions:** none

**Next:** Phase 3 recreate `stardust/prototypes/index-proposed.html`.

---
## Recreate — index archetype authored from captured content + lifted CSS (2026-09-25)

**Prompt:** (same run) Phase 3 of replica.

**Decisions:**
- Prototype `stardust/prototypes/index-proposed.html` + `replica-canon.css` (tokens, base, buttons, navbar, footer) + `index-proposed.css` (modules) + `index-proposed.js` (motion layer mirroring site.js: tabs, FAQ, nav toggle, megamenu hover/click).
- Live navbar is `div.navbar` (no `<header>`); mirrored so gate roots scope symmetrically; sticky replicated sticky.
- Fonts: same OFL woff2 files self-hosted (Instrument Sans, Syncopate). Images: 15 harvested from the source (incl. hidden tab panes), served from prototypes/assets.
- R-01 applied (register): source navbar overflows viewports < 451 px (scrollWidth 435 @360, both sides); `.navbar .logo-text` hidden ≤ 450 px so the gate's hard overflow assert holds.
- Card hover kept: motion-observe's hover sampler read no change on self but the transition log shows border-*-color + background-color events on the hovered card (alive).

**Artifacts touched:** stardust/prototypes/** — created; stardust/replica/inconsistency-register.md — R-01 added; stardust/replica/capture/tokens.json — created.

**Open questions:** none

**Next:** Phase 4 gate bookkeeping, then Phase 5 handoff (deploy to EDS).

---
## Source-fidelity-gate — index passes at 1440 (0.00%) and 360 (2.19%, R-01 only) (2026-09-25)

**Prompt:** (same run) Phase 4 of replica.

**Decisions:**
- 1440: pixel 0.00%, Δ0, 0 structural, header/footer crops 100%, chrome-parity quiet, cap-probe PASS @2560.
- 360: pixel 2.19% (all in sticky-header seam repeats, R-01), Δ0, overflow assert ok after R-01; body band 0.00%.
- Motion: 22/22 parity at 1440, 8/8 at 360 after adding the source's border-color transition to buttons.
- Approved hands-off. Evidence: stardust/replica/progress.json, gates/index-{1440,360,2560}/, motion/.

**Artifacts touched:** stardust/replica/progress.json — created; stardust/state.json — index → approved.

**Open questions:** none

**Next:** Phase 5 handoff — deploy to EDS (catalan-adobe/eds-mig-20260914, branch sd-spm--0001).

---
