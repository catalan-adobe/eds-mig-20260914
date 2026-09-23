---
_provenance:
  writtenBy: stardust:replica
  writtenAt: 2026-09-23T10:53:41Z
  againstInput: https://wknd-adventures.com/
  readArtifacts:
    - stardust/current/PRODUCT.md
    - stardust/current/DESIGN.md
    - stardust/current/DESIGN.json
---

# Direction — preserve mode (same-design migration)

Mode: PRESERVE. The target spec is the captured current state of https://wknd-adventures.com/,
promoted verbatim (no direct invocation, no creative decisions).

Promoted: current/PRODUCT.md → PRODUCT.md · current/DESIGN.md → DESIGN.md ·
current/DESIGN.json → DESIGN.json (at 2026-09-23T10:53:41Z).

Permitted deltas: ONLY the entries of stardust/replica/inconsistency-register.md
(empty — pure replica).

Fidelity: ia verbatim · design verbatim · content verbatim.

## Named deviations

- extract: crawl ran with an explicit `--pages` list of the 21 sitemap paths because the
  sitemap's `<loc>` host is `wkndadventures.com` (no hyphen) — a different origin the
  crawler would have filtered out. Same 21 paths, same origin as the ask.
- extract Phase 5 (brand-review.html) skipped: preserve mode has no brand-review consumer;
  the target spec is the captured state.
- recreate: `stardust/prototypes/compose.py` authors archetype markup from the captured page
  (canon class vocabulary + verbatim text) instead of hand-retyping ~16 KB per page. Not a
  skill-phase replacement: output is still gated per archetype by gate.sh.
- gate (about-html @360): gate.sh stitches without `--settle`; a lazy image loads mid-stitch
  on the live side only (Δ219px). Evidence re-taken with `stitch-shot.mjs --settle` on BOTH
  sides + `pixel-compare.mjs` → 0.00%, Δ0 (stardust/replica/gates/about-html-360/diff-settle.png).
