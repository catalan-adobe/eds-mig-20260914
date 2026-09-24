# Inconsistency register — wknd.site replica

No entries — pure replica. Everything not listed here is frozen; any design
delta found by the gate is a defect, not an improvement.

## Entries

| # | template · page | source inconsistency | replica behaviour | measured delta | decision |
|---|---|---|---|---|---|
| R-1 | magazine-hub · /us/en/magazine, /ca/en/magazine (teaser-list "Members Only") | the two members-only teaser descriptions differ in markup: Alaskan Adventures wraps its text in `<p>` (13.5 px bottom margin), Fly Fishing is a bare text node (no margin) | `teaser-list` models every description as a paragraph (one block model for one component) | Fly Fishing label + image 13.5 px lower than live inside its own column at ≥ 768; page −14 px at 360 (measure.mjs harness vs prototype, C-final 2026-09-24) | A-F-4 (hands-off): accepted as the one permitted delta — normalising a single source markup inconsistency into the block's content model; reversible by authoring the Fly Fishing description as a bare run if the owner prefers the source's asymmetry |
| R-2 | every ca/en template · /ca/en/footer fragment (link "localization features with Core Components") | the source link text ends in a trailing space (`Core Components </a>`, authored `&nbsp;` in the component JSON) that widens the underlined link by 2 px | the pipeline drops the trailing `&nbsp;` authored in content/ca/en/footer.html (footer.plain.html serves `Components</a>`) — the link box is 218 px vs 220 px live | chrome-parity --region footer PAIR Δw −2 px on every ca/en gate at 1440 and 360; crop-compare footer band 0.00 % (bar 2 %) | A-F-4 (hands-off): not fixable from the authored document (trailing inline whitespace is normalised by the pipeline); recorded as the only chrome delta on ca/en — reversible only by a pipeline-side change |
