---
_provenance:
  writtenBy: stardust:replica
  writtenAt: 2026-09-25T18:44:35Z
  againstInput: https://wknd-adventures.com/
  readArtifacts:
    - stardust/current/pages/index.json
    - stardust/current/DESIGN.json
    - stardust/replica/capture/tokens.json
---

# Direction — preserve mode (same-design migration)

Mode: PRESERVE. The target spec is the captured current state of https://wknd-adventures.com/ (home page), promoted mechanically (no direct invocation, no creative decisions).

Synthesized (bounded-single): current/pages/index.json + Phase-3 CSS lift → PRODUCT.md · DESIGN.md · DESIGN.json (at 2026-09-25T18:44:35Z). A later site-scope `extract --prep` run replaces this synthesized spec with the verbatim promotion.

Permitted deltas: ONLY the entries of stardust/replica/inconsistency-register.md (empty — pure replica).

Fidelity: ia verbatim · design verbatim · content verbatim.

## Hands-off
- 2026-09-25T18:44:35Z — Hands-off mode ACTIVATED (`--hands-off` on `replica`). Interactive gates auto-resolve; quality gates unchanged.
- Flow: **replica**, flowSource user-phrase ("keeping its current design (pixel-perfect replica)"). No `prepare-migration`, no `direct`.
- Scope: single page — home (`/`, slug `index`, type landing). Deploy target: catalan-adobe/eds-mig-20260914, branch `sd-spm--0001`.
- Named assumptions: (1) fonts are OFL (Instrument Sans, Syncopate) → self-hosted from the site's own woff2; (2) hidden tab panes and megamenu content are content, replicated verbatim; (3) the hero overlay and ticker animation are replicated as captured (animation frozen only by the capture instrument).

## Handoff decisions (hands-off, 2026-09-25T19:24:05Z)
- **Branch host.** The requested code branch `sd-spm--0001` is pushed to GitHub, but AEM Code Sync never builds a ref containing `--` (the host-label separator): `/styles/styles.css` stayed 404 on `sd-spm--0001--eds-mig-20260914--catalan-adobe.aem.page` after two forced `POST /code/*` jobs, while an alias branch on the same commit, `sd-spm-0001`, served the code within 5 s. Named assumption: previews are served from `sd-spm-0001`; `sd-spm--0001` stays as the requested branch name and mirrors the same commits.
- **DA content tree is shared across branches.** `/index.html`, `/nav.html`, `/footer.html` in catalan-adobe/eds-mig-20260914 held content from earlier runs; this run overwrites them (the ask names this repo). Media lands under `media/sd-spm-0001/` (own scope, nothing else touched).
- **Publish decision.** Preview only (`deploy-batch --no-publish`); `aem.live` publish is left to the owner.
