---
_provenance:
  writtenBy: stardust:replica
  writtenAt: 2026-09-21T13:14:06Z
  againstInput: https://www.synopsys.com/
  readArtifacts:
    - stardust/current/pages/index.json
    - stardust/current/_computed-styles.json
    - stardust/replica/capture/
---

# Direction — preserve mode (same-design migration)

Mode: PRESERVE. The target spec is the captured current state of https://www.synopsys.com/
(no direct invocation, no creative decisions).

Synthesized (bounded-single): current/pages/index.json + Phase-3 CSS lift → PRODUCT.md · DESIGN.md ·
DESIGN.json (at 2026-09-21T13:14:06Z). A later site-scope run (`extract --prep`) replaces this synthesized spec
with the verbatim promotion.

Permitted deltas: ONLY the entries of stardust/replica/inconsistency-register.md (empty — pure replica).

Fidelity: ia verbatim · design verbatim · content verbatim.
