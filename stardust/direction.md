<!-- stardust:provenance
  writtenBy: stardust:replica
  writtenAt: 2026-09-24T07:34:48Z
  stardustVersion: 0.10.0
-->
# Direction — WKND replica

Flow: **replica** (same-design). Design is preserved; the only permitted changes are entries in
`stardust/replica/inconsistency-register.md`. Hands-off run: gates auto-resolve, each decision is a named
assumption in `stardust/journal.md`.

## Named deviations (extract)
- **Discovery supplement, not an instrument replacement.** `crawl.mjs` discovered 26 of 64 pages (no sitemap; nav links of the entry page only). A fetch-only same-origin BFS (`stardust/.work/extract/discover.mjs`, extract § Phase 1 step 2) produced the URL list; all capture ran through the shipped `crawl.mjs --pages`.
- **Per-site page-type catalog.** `magazine`, `faq`, `stub` added to the standard seven so each distinct component shape has its own archetype (state-machine § Page types allows per-site additions).
- **Media download** was done with a small fetch script (`stardust/.work/extract/media-dl.mjs`) since `crawl.mjs` records image URLs only; `assets/media/_manifest.json` maps URL → file.
