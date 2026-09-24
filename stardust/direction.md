---
_provenance:
  writtenBy: stardust:replica
  writtenAt: 2026-09-24T07:40:00Z
  stardustVersion: 0.10.0
  againstInput: https://wknd.site
  readArtifacts:
    - stardust/current/PRODUCT.md
    - stardust/current/DESIGN.md
    - stardust/current/DESIGN.json
    - stardust/state.json
---

# Direction — preserve mode (same-design migration)

Mode: PRESERVE. The target spec is the captured current state of https://wknd.site,
promoted verbatim (no direct invocation, no creative decisions).

Promoted: current/PRODUCT.md → PRODUCT.md · current/DESIGN.md → DESIGN.md ·
current/DESIGN.json → DESIGN.json (at 2026-09-24T07:40:00Z). Provenance:
**verbatim --prep promotion** (byte-for-byte, verified with `cmp`).

Permitted deltas: ONLY the entries of stardust/replica/inconsistency-register.md
(empty — pure replica; no audit was requested, no user-supplied items).

Fidelity: ia verbatim · design verbatim · content verbatim.

## Hands-off activation

Hands-off mode activated by the user's phrase (no `--hands-off` flag; the brief
asked for an autonomous run). `state.json.handsOff: true` was stamped at Setup.
Every interactive gate auto-resolves; each resolution below is a named assumption.

## Named assumptions

- **A1 flow=replica.** Chosen from the user phrase "keep the design"
  (`state.json.flowSource: user-phrase`). No redesign, no rewording, no DOM copy.
- **A2 scope=ALL pages.** The user asked for every page; the hands-off default
  cap (100 overall / 20 per template) is not applied — 64 captured pages, all
  in the roster. Locale is never a reason to drop a page: the 9 "Coming Soon!"
  locale roots ship as `stub` siblings, the byte-identical /ca/en tree ships as
  siblings of its /us/en twin.
- **A3 no DA target yet.** No `site.deployUrl` and no DA org/site were given, so
  delivery stops before the DA PUT; code (blocks/, styles/, content/) is
  produced locally and the handoff records the missing target as a decision.
- **A4 register empty.** No `audit` run and no `--register` file: pure replica.
- **A5 dynamics target origin unknown.** `dynamics-plan.mjs` runs without
  `--target-origin`; host-bound probing is deferred to rollout B2 once the EDS
  host exists. Owner decisions ship the interim tier (see
  `stardust/dynamic-features.md` § Decision batch).
- **A6 members-only pages** (ca/en only) deliver as normal pages, content
  preserved; no auth gate is invented.

## Named deviations (extract, carried forward)

- **Discovery supplement, not an instrument replacement.** `crawl.mjs` discovered
  26 of 64 pages (no sitemap; nav links of the entry page only). A fetch-only
  same-origin BFS (`stardust/.work/extract/discover.mjs`, extract § Phase 1
  step 2) produced the URL list; all capture ran through the shipped
  `crawl.mjs --pages`.
- **Per-site page-type catalog.** `magazine`, `faq`, `stub` added to the
  standard seven so each distinct component shape has its own archetype.
- **Media download** was done with a small fetch script
  (`stardust/.work/extract/media-dl.mjs`) since `crawl.mjs` records image URLs
  only; `assets/media/_manifest.json` maps URL → file.

## Register pointer

`stardust/replica/inconsistency-register.md` — the only permitted design deltas.
Anything not listed there is frozen; a gate delta outside it is a defect.
