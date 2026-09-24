# Learnings — wknd.site /us/en replica → EDS (run stardust-25-pi-opus-5-5-0003)

Written at rollout Phase H (2026-09-24). Shape per
`skills/stardust/reference/learnings.md § Entry shape`; one failure class per entry.

### Shared DA content root overwritten by a sibling run
- failure class: path-safety (two code branches, one DA content tree — the last PUT wins live)
- evidence: `curl https://replica-wknd--…aem.live/us/en.plain.html` served blocks
  `teaser-featured` / `title-underline` (404 on branch `replica-wknd`) at D2; sibling run
  `sd-25-fable-replica` deploys to the same `catalan-adobe/eds-mig-20260914` `/us/en/**`;
  restored with `deploy-batch --force` (28 ok, 13:54Z), DA source overwritten again at 13:59Z;
  decision
  A-D2-4, run-store key `rollout-site:da-collision`
- proposed change: `skills/replica/reference/handoff-contract.md § 2. Deploy — per page` —
  before the first PUT, GET `<live>/<archetype>.plain.html` and fail the phase (`blocked`,
  owner decision) when it serves block classes the code branch does not ship;
  `skills/rollout/SKILL.md § Setup` — require one DA repo per run (or a per-run content prefix)
  and record it in `rollout.json.site.da`
- status: pending

### helix-query.yaml not consumed by a config-service-backed DA site
- failure class: index-empty (repo yaml ignored; the index lives in the site config)
- evidence: `/us/en/query-index.json` 404 across 10 polls after commit 72e200c + push + Code Sync
  + bulk republish; the same YAML POSTed to `admin.hlx.page/config/<org>/sites/<site>/content/
  query.yaml` → 204 and the index built on the next republish (total 26); decision A-D2-1;
  project AGENTS.md lists `helix-query.yaml` as retired
- proposed change: `skills/dynamics/reference/listings.md § Getting an index at all` and
  `skills/replica/reference/handoff-contract.md § 3` row D2 — the "no configuration-service write
  is involved" sentence is wrong for DA-backed sites (config v6): read
  `admin.hlx.page/config/<org>/sites/<site>.json` first; when it answers 200 the YAML goes to
  `…/content/query.yaml` and the repo file is documentation only
- status: pending

### Root redirect when the source root itself 301s to the landing page
- failure class: path-safety (`/` answered 404 after every phase passed)
- evidence: `curl -sI https://wknd.site/` → 301 `/us/en.html`; nothing in the delivered tree
  answered `/` until `/redirects.json` carried `/` and `/index.html` → `/us/en` (28 rows incl. 26
  `.html` aliases; A-D-1); `curl -sIL <live>/` now ends 200
- proposed change: `skills/rollout/SKILL.md § Phase D` — `assemble.mjs` should follow the source
  root's Location chain and emit the `/` + `/index.html` rows (and a `.html` alias per delivered
  page when every source URL carries the extension) into `stardust/redirects.tsv` itself, instead
  of leaving the file for the agent to author at D-site
- status: pending

### Richtext normalisation opens a fixed height delta the pixel gate cannot close
- failure class: content-model (source authors bare text where DA always delivers `<p>`)
- evidence: `/us/en/magazine` 360 Δh +13 px across every C-deliver and C-final round (pixel
  3.83 % PASS); the second members-only teaser description is bare text on wknd.site, `<p>` on
  DA, so it gains the 13.5 px paragraph margin; A-CL-3, register candidate R-02
- proposed change: `skills/replica/SKILL.md` § inconsistency register — add a named class
  "platform richtext normalisation" so a Δh caused by DA's cell model is registered as R-nn at
  first sight instead of being re-measured every round;
  `skills/replica/reference/source-fidelity-gate.md § Pass bar` — the height tolerance cites it
- status: pending

### Other-locale nav targets outside the capture
- failure class: capture-gap (10 locale roots linked from every page's header, none captured)
- evidence: `/us/es /it/it /fr/fr /es/es /de/de /ch/it /ch/fr /ch/de /ca/fr /ca/en` 404 on the
  live tree at E2; `stardust/state.json` has 26 rows, all `/us/en` (A-EX1), no `site.captureGaps`
  entry for them; repointed to `https://wknd.site/<locale>.html` in `/nav` (A-E2-1)
- proposed change: `skills/extract/SKILL.md` (prep crawl) — when the header carries a language
  menu, list each locale root in `_crawl-log.json#captureGaps` with its link count so
  `state.json.site.captureGaps` names them at Phase 1 and E2 does not discover them
- status: pending

### Push credential: the active gh account is not the repo owner
- failure class: api-dependency (git push 403 mid-wave with the machine's default credential)
- evidence: `git push` → 403 under `gh` account `catalan_adobe`; pushes succeed with the
  `catalan-adobe` token from `gh auth token -u catalan-adobe` (A-PR-5, probe
  `stardust/.work/deploy/probes/program-push.sh`); recurred at D-site ("keychain default 403s")
- proposed change: `skills/deploy/SKILL.md § Deploy (DA Source API, from a local agent)` — the
  Code stage should probe `git push --dry-run` once at setup and, on 403, name the owner account
  from `rollout.json.site.da.org` for `gh auth token -u <owner>` (never printed) before any wave
- status: pending

### Dashboard counts source-parity findings as open, so no page reaches `optimised`
- failure class: silent-render (two instruments disagree on one ledger; the dashboard shows a
  red count on every page of a gate-clean site)
- evidence: `optimize.mjs` run-1 → open P1/P2/P3 0, health 100, 30 `source parity:` rows kept
  `status: open` + `fixability: out-of-scope`; `dashboard.mjs` → "deployed 26 · optimised 0",
  `data.json.pages[*].openFindings` 1–3 per page (the parity rows). Not hand-accepted (A-I-1)
- proposed change: `skills/rollout/scripts/dashboard.mjs` + `skills/rollout/SKILL.md § Phase I` —
  the `optimised` stage and the per-page red count must apply optimize's own exclusion (skip
  findings whose evidence starts with `source parity:` / fixability `out-of-scope`), so the
  dashboard and the gate read the same ledger the same way
- status: pending
