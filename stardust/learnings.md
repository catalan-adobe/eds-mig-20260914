# Learnings — wknd.site replica migration (run 2026-09-24)

Shape and rules: `.agents/skills/stardust/reference/learnings.md`. Entries are pending until a
maintainer folds them into the named skill file.

### Empty-section hide swallows authored separator sections
- failure class: silent-render (foundation `main > .section:empty { display: none }` hides a `style: separator` section once the pipeline folds its metadata into the section class)
- evidence: aem-cli render of `/us/es`, section `.separator` display none → 0 px; live `.cmp-separator` 1164×2 at y 904 (measure.mjs 1440). Five clusters (locale-landing, listing, landing, magazine-hub, teaser-hero) each shipped the same scoped override; applied once at C-final (`styles/styles.css`).
- proposed change: `skills/deploy/SKILL.md` § 3 foundation — the `:empty` hide must exclude every section style whose whole content is a `::before` rule (`:not(.separator, .separator-space-*)`); name the exclusion in the D1 section-style set so C0 ships it.
- status: pending

### Margin-collapse lifted as a sum
- failure class: silent-render (a live rule pair whose margins collapse — `.separator` 4rem containing an `hr` 9px — was transcribed as `calc(4rem + 9px)`, 9 px off each side; every local structural assert green)
- evidence: measure.mjs https://wknd.site/us/es.html `.cmp-separator` marginTop 64 px vs build 73 px; main height 770 vs 715 + 9 px offset, footer 988 vs live 1018 (locale-landing request line).
- proposed change: `skills/replica/reference/recreate.md` § lifted values — when a lifted rule sums a parent and child margin, measure the COMPUTED rect distance on the live page (measure.mjs) rather than adding the declared values; add "collapsing margins" to the box-model fork list beside `boxSizing`.
- status: pending

### Section-style rules shipped in block CSS arrive after first paint
- failure class: silent-render (layout-critical section styles — `container-flush`, `container-padded`, `faq-*` page grid, `separator-space-medium` — lived in block CSS under the foundation freeze, so the published page lays out once without them and jumps when the block loads: CLS with zero fidelity-gate delta on the settled state)
- evidence: six foundation-requests.md lines (program, faqs, listing, members-only, magazine-hub, locale-landing) all describe the same mechanism; the faqs line names the visible jump ("aside stacks below, then jumps right").
- proposed change: `skills/rollout/SKILL.md` § Phase C fan-out discipline — a section-style rule that positions a section (padding, grid placement, display) is a FOUNDATION request at C0 time, never a scoped override: C0's foundation subagent reads every archetype's section-style set from the migrated `_meta.json` before freezing and ships the closed set; clusters may only override block-internal rules.
- status: pending

### External image URLs skip the picture wrapper
- failure class: silent-render (an `<img src="https://wknd.site/…">` in default content is not wrapped in `<picture>` by the pipeline, so `.default-content-wrapper picture img { margin: 7px 0 }` misses it until media is rehosted — a 7 px drift that resolves itself only after `da-media-upload.mjs`)
- evidence: `/us/en/faqs` harness vs prototype at 1440/360: `main img` Δy +7 (margin `0` → `7px 0`), main Δh −8, scrollHeight −9; `.plain.html` shows `<p><img src="https://wknd.site/…">` with no picture (C-final measure, 2026-09-24).
- proposed change: `skills/deploy/SKILL.md` § 9 content / media-reconcile — when images are authored as source URLs pending rehost, the local structural asserts must include a `picture` presence check per default-content image (or the harness must rewrite source URLs to a local media path) so the pre-PUT numbers match the post-rehost state.
- status: pending

### Page coverage has no honest status for "authored, not PUT"
- failure class: path-safety (the coverage vocabulary `pending | converting | deployed | verified | stale | failed` cannot record a page that is fully authored and locally asserted but never PUT; a hands-off run without DA credentials ends with 64 authored pages all `pending`)
- evidence: `stardust/rollout/coverage/pages.json` after C-final 2026-09-24 — 64 rows `pending`, 17 blocks `converted`; the unit state lives only in `progress.json` (`done-local`).
- proposed change: `skills/rollout/scripts/update-coverage.mjs` + `reference/delivery-gates.md` — add page status `authored` (local chain green, PUT pending) so `deploy-batch.mjs` resumes from it and the dashboard can show it; document `done-local` as a progress.json unit status.
- status: pending

### `<html lang>` hard-coded by the boilerplate
- failure class: silent-render (`scripts/scripts.js` sets `document.documentElement.lang = 'en'` on every page; the source serves `en-US`, `en-CA`, `es-US`, `fr-CA`, `de-CH` …; root `scripts/` is vendored/frozen so no cluster could fix it)
- evidence: about-us cluster request line; migrated `_meta.json` `metadata.lang` per page vs the rendered `<html lang="en">` on `/ca/en/about-us` and `/us/es`.
- proposed change: `skills/deploy/SKILL.md` § 3 foundation — C0 derives `lang` from the pathname (`/<country>/<lang>` → `<lang>-<COUNTRY>`) or from a `lang` metadata row in `scripts/scripts.js`; name `scripts/scripts.js` as a C0-editable file (not vendored like `aem.js`).
- status: pending
