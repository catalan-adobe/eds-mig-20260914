<!-- stardust provenance: skill=stardust:replica (dynamics Phase 3) · 2026-09-21 · from stardust/dynamic-features.md -->
# Dynamic features — plan (home archetype pilot)

## Phase A — ships with the static recreation (reproducibility: self)
- **Hero video (row 1):** native `<video>` with the source poster + mp4 URL, pause toggle button.
  Authoring: one `hero` block; verification: pixel gate (poster frame) + motion-compare.
- **Mega-nav / search chrome (rows 3, 4):** header markup replicated; dropdown behaviour implemented
  only where `stardust/replica/motion/index.json` recorded it firing. Verification: motion-compare.
- **Data-layer objects (row 8):** not rendered; nothing to ship.
Effort: inside the archetype recreation.

## Phase B — decision batch (owner), scheduled at rollout
- Tags/consent/Edge (rows 7, 9, 10): head snippet on the EDS host once ids are supplied.
- Assistant bar (row 5): keep-as-captured until decided; production wiring is a separate feature.
- Embeds (rows 2, 12), locale trees (row 11), cs-info.json sync (row 6).
Effort: owner answers first; implementation is per-row `deploy`/`rollout` work.

## Verification
`dynamics-check.mjs` parity run against the delivered page at rollout B2 (not part of this
no-deploy pilot).
