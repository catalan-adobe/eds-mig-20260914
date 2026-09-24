# us-en-adventures-riverside-camping-australia-html (program archetype) — lift notes

Prototype: `stardust/prototypes/us-en-adventures-riverside-camping-australia-html-proposed.html` + `canon.css` (shared, untouched) + `us-en-adventures-riverside-camping-australia-html.css` / `.js` (page) + `canon.js` (shared interactions).
Served on **port 8794** (8791 is a foreign server — it 404s this file; never kill it).

## Gate (iter2 confirmation, --full)
| width | pixel | Δh | structural 🔴 | chrome-parity | header band | footer band | overflow |
|---|---|---|---|---|---|---|---|
| 1440 | 0.00% | 0 | 0 | ✓ | 99.99% | 100% | ok |
| 360 | 0.95% | −1 | 0 | ✓ | 100% | 99.14% | ok |

## Lifted values (clientlib-site.min.css, confirmed by measure.mjs at 1440 + 360)
- Breadcrumb (`.cmp-breadcrumb--fixed`): centred rail max-width 1164 + 14px padding (content-box); nav inline-block; list 14px (12px ≤767) padding 0 12px 0 0; item inline-block padding 10px 5px (first: 0 left) uppercase; `::before` U+EA1C wknd-icon-font #ffea00 1em, 5px right pad; link #202020 600. Live keeps a whitespace text node between the icon and the span (3px) — mirrored.
- Mini carousel (`.cmp-carousel--mini`): full-bleed, img 400px cover center margin 7px 0 (inline img → 421px item box); actions float right (UA button 13.33px Arial, margin-right 1em, glyphs U+E90F/E90E at 1.25rem); indicators flex centred margin 9px 0 0, 10px dots #afafaf / rgba(0,0,0,.8); NO margin-bottom (hero variant has 4em); the floated actions end 8px below the indicators and the next block clears them.
- Fixed container: live `.cmp-layout-container--fixed` is display:block + padding 0 14px at every width — page-scoped override at ≤1024 (canon flow-root shrank beside the float; missing 14px shifted columns) + `::after` table clearfix (live `.aem-Grid:after`).
- Grid: title 12/12; facts container default--3 (25%, padding 0 — `.responsivegrid.aem-GridColumn`), tabs default--9 (75%, padding 0 14px), both float left ≥1025, stacked 100% below.
- Content-fragment elements: dl float left width 100% margin 1em 0; element content-box float left width 100% (overflows to 332px like live) height 84 border-left 5px #ebebeb padding 0 1em margin-bottom 1.25em uppercase; dt 12px dimgray padding-top 1em; dd 14px 600 padding-top .5em. ≤1024: no border, padding-right 2em, width auto (elements flow 2-per-row). Hidden `h3` fragment title kept (display:none) for role parity ×4.
- Share: h5 14px 600 uppercase UA margin 1.67em; the h5 line sits below the floated dl. `.fb-share-button` / Pinterest anchor render EMPTY on live (third-party SDKs do not paint in capture) — replicated as captured.
- Chrome margin-collapse quirk: live's `.cmp-container` wrapper lets the h5's top margin resolve before the deferred float is placed (elements div at +23.38px); an intermediate `.facts-body` wrapper reproduces it (without it the float lands 23px higher).
- Tabs: tablist flex wrap margin 1em 0; tab 14px uppercase padding .5rem 1rem border-bottom 1px transparent min-width 48; active #202020/#fff; panel display none/block + table clearfix (live trailing `.aem-Grid`).
- Panel rich text: img 100% margin 7px 0; `p` from canon (18px/2.5 justify); `ul` margin 1em 0, `li` padding-left 12px line-height 2 with U+EA1C .55em marker.

## Fonts
Same as foundation: canon's self-hosted Google Fonts (Asar 400, Source Sans Pro 300/400/600) + wknd-icon-font. No substitutions.

## Interaction parity (observed → implemented)
- carousel next/prev/indicator → item/indicator active swap + fadeIn ✓ (canon.js)
- tabs click → tab + panel `--active` swap ✓ (page js; no transition on live)
- language toggle showMenu/open ✓, body.scrolly header morph ✓ (canon.js)
- Hovers on header nav link, tab, breadcrumb link, carousel icon: no measured change on live → nothing added.
- motion-compare MISSING/EXTRA lines are the cmp- → clean class renames (each 3× on both sides) — parity by count.

## Residuals
- 360: 0.95% pixel, −1px height (live main 1930.77 fractional vs 1931) — footer band reads 7.4% unaligned in the gate breakdown, 0.86% when aligned with --y-b.
- visual-diff STRETCHED IMAGE: intentional 400px `object-fit: cover` identical to live.
- content-diff 🟡×3 [header]: search `<script type="x-template">` item mirrored with clean class names (inherited from the foundation).
