<!-- stardust provenance: skill=stardust:dynamics · phase=plan draft · 2026-09-23T12:32:53.574Z · input stardust/current/_dynamics.json (5 pages, 1 findings) · target probe https://stardust-replica-migration--eds-mig-20260914--catalan-adobe.aem.page -->
# Dynamic features — draft inventory (curate into `stardust/dynamic-features.md`)

One row per detected finding. Merge duplicates, drop noise, keep every axis honest. Columns: disposition = what we do · reproducibility = what it needs · status = where it stands (reference/triage.md).

| # | id | class | feature | pages | disposition | reproducibility | status | pattern | decision needed | notes |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | m-modal-trigger-aria-haspopup-chrome-only-target-outside-dom | M | modal trigger aria-haspopup (chrome only) → target outside DOM at capture | 5/5 (reach 63/21) | rebuild-native | self | pending | chrome-interaction | none (motion-observe evidence) |  |

## Triage

- **Ships autonomously (reproducibility `self`):** 1 row(s) — chrome-interaction.
- **One owner decision batch:** 0 row(s) — none.
- **Already delivered by the capture pipeline:** 0 row(s) — no work.
- **Host-bound on the target:** 0 of 0 probed API paths — the off-origin data work.

## Phases

- **interactive** — 1
