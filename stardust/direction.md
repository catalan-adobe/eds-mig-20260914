---
_provenance:
  writtenBy: stardust:replica
  writtenAt: 2026-10-26T15:52:37Z
  againstInput: https://backlinko.com/
  readArtifacts:
    - stardust/current/PRODUCT.md
    - stardust/current/DESIGN.md
    - stardust/current/DESIGN.json
---

# Direction — preserve mode (same-design migration)

Mode: PRESERVE. The target spec is the captured current state of https://backlinko.com/,
promoted verbatim (no direct invocation, no creative decisions).

Promoted: current/PRODUCT.md → PRODUCT.md · current/DESIGN.md → DESIGN.md ·
current/DESIGN.json → DESIGN.json (at 2026-10-26T15:52:37Z, RECONCILE — replaces the bounded-single spec
Track A synthesized for the first page).

Permitted deltas: ONLY the entries of stardust/replica/inconsistency-register.md
(0 entries — pure replica).

Fidelity: ia verbatim · design verbatim · content verbatim.

Roster: caps 100 overall / 20 per template (hands-off default) — 79 pages captured of 571 in the
sitemaps; a capped roster, not the full site. Capture gap: hub/seo 55 uncaptured first-level targets.

- HANDS-OFF activated by the user (approvals recorded `approvedBy: hands-off`).
- Delivery target (named assumption): repo catalan-adobe/eds-mig-20260914 is a shared test repo whose
  DA root holds other runs' content; this run delivers under the DA folder `/scope-2610-01/`
  (home = `/scope-2610-01/`, chrome documents `/scope-2610-01/nav` and `/scope-2610-01/footer`)
  from code branch `scope-2610-01`, never touching the DA root or `main`.
- First page first: home delivered first (Track A), reconciled at 2026-10-26T15:52:37Z (stardust/reconcile-first-page.md).
