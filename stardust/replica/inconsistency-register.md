# Inconsistency register — wknd-adventures.com replica

The ONLY permitted design deltas. Everything else is verbatim.

## R-01 — Navbar overflows the viewport on phones (< 451 px)

- **Evidence:** `measure.mjs` live @360: root scrollWidth 435 > viewport 360 (+75 px); `.nav-right` rect x 196 w 239 (right edge 435); `.logo` w 156, `.nav-inner` gap 24, Subscribe `.button` w 183, hamburger 40. Log: `stardust/.work/replica/bg/measure-against.log` (both sides identical), `stardust/replica/gates/index-360/overflow-iter1.txt`.
- **Finding:** the source navbar's fixed-width children (wordmark 156 + Subscribe 183 + toggle 40 + gaps/padding 72 = 451 px) never fit a 360–450 px viewport; the page scrolls horizontally on every phone. A defect, not a preference — and the gate's horizontal-overflow assert cannot be waived.
- **Minimal change:** `@media (max-width: 450px) { .navbar .logo-text { display: none } }` — the icon logo, Subscribe CTA and toggle stay; no other navbar change; footer wordmark untouched.
- **Status:** applied
- **Where:** home (and every page sharing the navbar) — header band only, viewports ≤ 450 px. Expected gate delta: 360 header crop-compare > 2 % (justified by this entry); full-page 360 pixel diff < 1 %.
