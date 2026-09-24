# us-en-faqs-html (faq archetype) — lift notes

Prototype: `stardust/prototypes/us-en-faqs-html-proposed.html` + `canon.css` (shared, untouched) + `us-en-faqs-html.css` / `.js` (page) + `canon.js` (shared interactions).
Served on **port 8794** (reused — sibling-started server whose cwd is this project's `stardust/prototypes`; 8791 is a foreign server from sd-…-0001; never kill either).

## Gate (iter1 = iter2 confirmation, --full, --main main, --marker WKND)
| width | pixel | Δh | structural 🔴 | chrome-parity | header band | footer band | overflow |
|---|---|---|---|---|---|---|---|
| 1440 | 0.00% | 0 | 0 | ✓ | 99.99% | 100% | ok |
| 360 | 0.93% | 0 | 0 | ✓ | 100% | 99.99% | ok |

measure.mjs --against (stardust/replica/lifts/us-en-faqs-html-against1.json): every measured box Δ 0/0/0/0 at both widths after two fixes (main = the fixed container itself; small-text `<p style="text-align: left;">` is authored inline on live and mirrored).

## Lifted values (clientlib-site.min.css, confirmed by measure.mjs at 1440 + 360)
- Page grid: main is `.cmp-layout-container--fixed` (1164 centred ≥1025, padding 0 — measured 0 at 360 too on this page). Two container columns (`.responsivegrid.aem-GridColumn` → padding 0): main column `default--8` (66.67%, 776px) + aside `default--3 offset--default--1` (25% / margin-left 8.33% → x 1011 w 291); both 100% and stacked ≤1024 (`tablet--12`/`phone--12`, offsets 0). `.aem-Grid:after` table clearfix.
- Inner grid (`aem-Grid--8` / `--tablet--12` / `--phone--12`): title 100%; image `default--8`=100%, `tablet--8`/`phone--8` = 66.67%; text 100% default+phone, 66.67% tablet; accordion 100%. All float left clear none, 14px gutters (canon `.col`).
- Title underline: canon (h1 40px Asar / 60px line, 84px × 2px #ffea00 underline).
- Image (`.cmp-image .cmp-image__image`): width 100%, height auto, margin 7px 0, inline (baseline slack kept). Live serves coreimg renditions (1302×867 at 1440, 325×216 at 360); prototype uses the single captured 1447×964 file — pixel-identical at the gate.
- Accordion (`.cmp-accordion`): button UA font (Arial 13.33px → padding 1em = 13.33px, colour #000 inherited by title + icon), border-bottom 2px #ebebeb, block 100%, no focus outline; title inline 16px/600 uppercase Source Sans Pro padding-left .5em; icon float right wknd-icon-font 1.25rem (`[class*=__icon]` → canon `.icon`) U+E911 closed / U+E910 expanded; panel 14px, padding .5em left/top, fadeIn .5s both, `p` 14px / 1.75; `--expanded` button drops its border. Item height 48.66px × 7 = 340.6 ✓.
- Aside: separator `--hidden --space-small` (margin 1em, no rule), h3 24px Asar (canon), `.cmp-text--font-small p` 14px (line-height 2.5 → 35px from canon `p`).
- Footer margin-top 48px (canon).

## Fonts
Same as foundation: canon's self-hosted Google Fonts (Asar 400, Source Sans Pro 300/400/600) + wknd-icon-font. No substitutions.

## Interaction parity (observed → implemented)
- accordion button click → `--expanded` on button, `--hidden`↔`--expanded` swap on panel, fadeIn; items expand independently (item 1 stayed open when item 2 opened) ✓ (page js, single class write like live)
- header `scrolly` morph + language toggle `showMenu`/`open` ✓ (canon.js)
- Hovers on accordion button, small-text link, nav link: no measured change on live → nothing added.
- motion-compare MISSING/EXTRA lines are the cmp- → clean class renames (2×/2×/1× on both sides) — parity by count.

## Residuals
- 360: 0.93% pixel (band y500–1000 = 2.6%) — glyph anti-aliasing on the justified intro paragraph and accordion titles; same line breaks and box positions (Δ 0), live main height fractional (1244.83).
- content-diff 🟡×3 [header]: search `<script type="x-template">` item mirrored with clean class names (inherited from the foundation).
- Lead image uses one captured rendition instead of live's per-breakpoint coreimg srcset (no visible delta at either gate width).
