---
_provenance:
  writtenBy: stardust:replica
  writtenAt: 2026-10-26T15:09:23Z
  againstInput: https://backlinko.com/
  readArtifacts:
    - stardust/first-page/current/pages/index.json
    - stardust/first-page/lift/rules-slim.css
---

# Direction — preserve mode (same-design migration)

Mode: PRESERVE. The target spec is the captured current state of https://backlinko.com/
(no direct invocation, no creative decisions).

Synthesized (bounded-single): stardust/first-page/current/pages/index.json + Phase-3 CSS lift
→ PRODUCT.md · DESIGN.md · DESIGN.json (at 2026-10-26T15:09:23Z). Track A (first page first, home);
replaced verbatim by Track B's prep spec at RECONCILE.

Permitted deltas: ONLY the entries of stardust/replica/inconsistency-register.md
(0 entries — pure replica).

Fidelity: ia verbatim · design verbatim · content verbatim.

- HANDS-OFF activated by the user (approvals recorded `approvedBy: hands-off`).
- Delivery target (named assumption): repo catalan-adobe/eds-mig-20260914 is a shared test
  repo whose DA root holds other runs' content; this run delivers under the DA folder
  `/scope-2610-01/` (home = `/scope-2610-01/`, chrome documents `/scope-2610-01/nav` and
  `/scope-2610-01/footer`) from code branch `scope-2610-01`, never touching the DA root or `main`.
