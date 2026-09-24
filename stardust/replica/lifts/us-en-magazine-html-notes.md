# us-en-magazine-html (magazine archetype) — lift notes

Prototype: `stardust/prototypes/us-en-magazine-html-proposed.html` + `canon.css` (shared, untouched) + `us-en-magazine-html.css` (page) + `canon.js` (shared interactions).
Served on **port 8794** (8791 is a foreign server from a sibling run — it even carries its own `us-en-magazine-html-proposed.html`; never reuse it).

## Gate (iter2 confirmation, --full)
| width | pixel | Δh | structural 🔴 | chrome-parity | header band | footer band | overflow |
|---|---|---|---|---|---|---|---|
| 1440 | 0.00% | 0 | 0 | ✓ | 99.99% | 100% | ok |
| 360 | 0.12% | 0 | 0 | ✓ | 100% | 100% | ok |

## New modules lifted (clientlib-site.min.css, confirmed Δ0 by measure.mjs at 1440/360)
- `.cmp-teaser--list`: title Source Sans Pro 18px 600 uppercase (margin .5em 0); description dimgray 14px uppercase (p 14px); image max-height 200px cover, margin 7px 0.
- `body.anonymous .cmp-teaser--secure`: `.cmp-teaser` opacity .65; action container #ebebeb / dimgray / 14px / padding .5em 1em / uppercase (no link when signed out — text only, as captured); `::before` lock glyph U+E98F 24px wknd-icon-font, padding 9pt, relative top 49px, z-index 2, background `linear-gradient(to top left, transparent 50%, #ffea00 50%)`.
- Grid cell `aem-GridColumn--default--4 / --tablet--6 / --phone--12` + `--default--none`: float left, clear none, 33.33% (≥1025) / 50% (768–1024) / 100% (≤767) → `.col--4`; `.container-fixed::after` clearfix stands in for `.aem-Grid::after` (scoped to `[data-template="magazine"]`).
- `.cmp-separator--space-medium .cmp-separator`: margin 2em 0.
- Featured teaser + image list: carried over verbatim from the gated landing CSS (`us-en-html.css`).

## Canon workaround (→ canon-requests.md)
- Footer active level-1 link: live `#f7f7f7` + underline; canon has no rule (landing had no active child). Scoped rule in the page CSS; request appended.

## Interaction parity (observed → implemented)
- 1440: body.scrolly header morph (padding .5s ×2), langNav toggle (`showMenu` + `open`) — parity via canon.js (6 parity / 0 missing / 0 extra).
- 360: `scrolly` parity; `#toggleNav` → `navPanel-visible` fired on build only (advisory) — live sampler missed the click this run; behaviour was observed live on the landing archetype and lives in canon.js. Not a magazine module.
- Hovers probed on header nav, featured CTA, list items, footer nav: none fired live → nothing added.

## Residuals
- 360: 0.12% pixel (max band 0.4%) — live selects ~288w AEM renditions, prototype serves the 1280w/1600w capture; resampling noise, no layout effect.
- visual-diff STRETCHED IMAGE flags (8 / 7): intentional `object-fit: cover` crops identical to live.
- content-diff 🟡×3 [header]: live search `<script type="x-template">` mirrored with clean class names (`search__item`) — inherited from canon, same as landing.
- Live featured-teaser image height at 360 is lazy-load-timing dependent (first measure.mjs read +20px, settled 0); gate captures the settled state.
