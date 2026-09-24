# us-en-about-us-html (static archetype) — lift notes

Prototype: `stardust/prototypes/us-en-about-us-html-proposed.html` + `canon.css` (shared, untouched) + `us-en-about-us-html.css` (page) + `canon.js` (shared interactions).
Assembled by `stardust/replica/lifts/build-about-us.mjs` (chrome lifted from the gated magazine prototype with "About Us" active; main authored from the capture). Served on **port 8794** (8791 is a foreign sibling-run server — never reuse/kill it).

## Gate (iter1 = iter2 confirmation, --full, no changes between rounds)
| width | pixel | Δh | structural 🔴 | chrome-parity | header band | footer band | overflow |
|---|---|---|---|---|---|---|---|
| 1440 | 0.00% (52 px) | 0 | 0 | ✓ | 99.99% | 100% | ok |
| 360 | 0.02% (277 px) | 0 | 0 | ✓ | 100% | 100% | ok |
Wide/intermediate box map (measure.mjs --against at 1920 and 900): every sampled box Δ0, scrollHeight Δ0.

## New modules lifted (clientlib-site.min.css, confirmed Δ0 by measure.mjs at 1440/360)
- `.cmp-text--font-small p` → `.text--font-small p { font-size: 14px }` (p keeps canon line-height 2.5 → 35px line).
- `.cmp-title--black .cmp-title__text` → `.title--black .title__text { color: #202020 }` (only on Stacey Roswells' role, as captured).
- Grid cell `aem-GridColumn--default--3 / --tablet--6 / --phone--12` → `.col--3`: 25% (≥1025) / 50% (768–1024) / 100% (≤767); `[data-template="content-page"] .container-fixed::after` clearfix.
- `.cmp-experience-fragment--contributor` → `.contributor`: text-align center, padding .5em 0 1em (+14px gutters from `.col`); nested `.cmp-layout-container--fixed` → `.contributor__body` padding 0 14px at every width; `.cmp-title__text` margin 0 0 .25em; image 164×164 circle, object-fit cover, inline with margin 7px 0 (baseline descender gives the live 185px image band); `.cmp-buildingblock--btn-list` padding-top 1em (+14px !important side padding ≤1024); button grid flex centered; icon-only columns float, no padding, width unset.
- `.cmp-button--secondary .cmp-button` → `.button--secondary .button { background #202020; color #ebebeb }`.
- Media: 7 contributor portraits copied from the 1200w master renditions in `stardust/current/assets/media/` to `stardust/prototypes/assets/media/<basename>.jpeg` (Sofia's `ayo-ogunseinde-237739.jpeg` already present from the adventure byline).

## Canon workaround (→ canon-requests.md)
- Footer active level-1 link (#f7f7f7 + underline) re-declared in the page CSS — third archetype to need it.

## Interaction parity (observed → implemented)
- 1440 live: body.scrolly header morph (padding .5s ×2), langNav toggle (`showMenu` + `open`) — all canon.js; motion-compare 6 parity / 0 missing / 0 extra. Hovers probed (header nav, contributor buttons, portraits, footer nav): none fired live → nothing added.
- 360 live: `scrolly` parity; `#toggleNav` → `navPanel-visible` + transform transitions fired on build only (advisory) — same live-sampler miss as the magazine archetype; behaviour was observed live on the landing archetype and lives in canon.js. No about-us-specific motion.

## Residuals
- content-diff 🟡×3 [header]: live search `<script type="x-template">` mirrored with clean class names (`search__item`) — inherited from canon, same as every archetype.
- visual-diff STRETCHED IMAGE ×5 (advisory): intentional 164×164 `object-fit: cover` circle crops, identical to live.
- Prototype serves the 1200w capture for every portrait; live picks 300–400w AEM renditions at 360 — 277 differing px of resampling noise, no layout effect.
- Live `main.container` IS the 1164px fixed container; prototype wraps `.container-fixed` inside a full-width `main` (same pattern as the gated siblings) — invisible in pixels, structural only.
