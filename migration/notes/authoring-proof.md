# Authoring proof (DA edit → preview → verify → restore)

Run: 2026-09-26 ~20:30 UTC · tool: `node migration/tools/authoring-test.mjs apply|restore migration/authoring/edits.json`

| # | document | edit (as an author would do in DA) | verified in previewed `.plain.html` | visible on branch preview |
|---|---|---|---|---|
| 1 | spm-ft-0001/index | hero slide-1 headline → "…Physical AI Solutions (Edited in DA)" | yes | yes (3-line headline, layout adapts) |
| 2 | spm-ft-0001/index | Synopsys.ai card image swapped for the EDA image + new alt text | yes (`alt="Synopsys.ai image swapped in DA"`) | yes |
| 3 | spm-ft-0001/index | Support link href + text → training page "View Training (edited link)" | yes (`href=…/support/training.html`) | yes |
| 4 | spm-ft-0001/index | intro copy "Conquer Complexity (edited)" | yes | yes |
| 5 | spm-ft-0001/footer | copyright text "(footer edited in DA)" | yes | yes |

- DA PUT + preview latency: 3.4–4.4 s per document; whole apply 10.4 s, restore 9.6 s.
- Restore: previewed `.plain.html` byte-identical to the pre-edit snapshot and DA source identical to the backup
  for both documents (`restoredPlainEqualsBefore: true`, `restoredSourceEqualsBackup: true`, `editsGone: true`).
- Evidence: `migration/evidence/authoring/` (before/after/restored plain HTML, `edited-desktop-full.png`,
  `edited-mobile-full.png`, summaries).
- Nav doc not edited here because a parallel agent was editing it; it is authored the same way (headings/lists/links).
