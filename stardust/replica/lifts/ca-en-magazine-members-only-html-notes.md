# ca-en-magazine-members-only-html (unique archetype) — lift notes

Live: https://wknd.site/ca/en/magazine/members-only.html (content-page-template, `body.page.basicpage.anonymous`).
Prototype: `stardust/prototypes/ca-en-magazine-members-only-html-proposed.html` + `canon.css` (shared, untouched) + `ca-en-magazine-members-only-html.css` (page) + `canon.js` (shared interactions).
Served on **port 8794** (8791 is a foreign sibling-run server — it 404s this file; never kill it). Hands-off assumption: per-project alternate port = 8794 (established by the earlier archetypes).

## Gate
| round | width | pixel | Δh | structural 🔴 | chrome-parity | header crop | footer crop | overflow |
|---|---|---|---|---|---|---|---|---|
| iter1 --full | 1440 | 2.51% | 0 | 0 | ✓ | — | — | ok |
| iter1 --full | 360 | 4.69% | 0 | 0 | ✓ | 100% | — | ok |
| iter2 --full | 1440 | 0.00% | 0 | 0 | ✓ | 99.99% | 100% | ok |
| iter2 --full | 360 | 0.04% | 0 | 0 | ✓ | 100% | 100% | ok |

## Content (verbatim from the capture)
- h1 "Members Only"; image list of 2 items (Alaskan Adventure, Fly Fishing the Amazon) — titles, descriptions, hrefs, alt text, 1152×767 renditions (`assets/media/alaskan-landscape-01.jpeg`, `amazon-river-01.jpeg` copied from `current/assets/media/`).
- No meta description on live (omitted); `meta[name=template]=content-page-template`; canonical `/ca/en/magazine/members-only.html`; `html[lang=en-CA]`.
- Chrome: /ca/en locale — every nav href `/ca/en/…`, language toggle `en-CA` + `flag-CA.svg`, `is-active` on the en-CA item (live links it to the current page), search action `/content/wknd/ca/en.searchresults.json/…`; footer carries the extra Canadian `.text` block ("Canadian specific footer. …" + localization link) before the © block — two `.site-footer__text` cols, same as live's two `cmp-text--font-xsmall` columns.

## Lift (measure.mjs, Δ0 after iter1 fix)
- iter1 → iter2 fix: live `main > .cmp-container > .title / .image-list` are plain divs (no `aem-GridColumn`), so **no 14px column padding**; live `main` computed padding is 0 at 360 and 1440 (`max-width 873pt` + `margin 0 auto` at ≥1025). Dropped `.col` from the two main sections. Before: h1/ul Δx +14 Δw −28 at both widths (band 0–500 9.2% at 360).
- Image list: values identical to the gated landing/magazine module (`.cmp-image-list` @120110–121390) — carried over verbatim.

## Interaction parity (observed → implemented)
- 1440 live: `body.scrolly` header morph (padding-top/bottom transitions 0.5s), langNav toggle (`showMenu` + `open`) — 5 parity / 0 missing / 0 extra via canon.js. Hovers probed (header nav a, list article a, list article, footer nav a): none fired live → nothing added.
- 1440 advisory: "scroll-morph magnitude delta 24.1px" is a sampling-phase artifact — the page is 940px tall so the traversal reaches only y=40 and the compare reads the first mid-transition frame (live 147.5 vs build 171.6 at the same t); both sides settle 193.6→113.6px (Δ80) on the same 500ms transition (timeline in `motion/<slug>.json` / `-build.json`).
- 360: `scrolly` parity; `#toggleNav` → `navPanel-visible` + panel transform transitions fired on build only (advisory) — live sampler missed the click (same as the magazine archetype); behaviour was observed live on the landing archetype and lives in canon.js.

## Canon workaround (→ canon-requests.md)
- Footer active level-1 link `#f7f7f7` + underline re-declared in the page CSS (fourth archetype).

## Residuals
- 360: 0.04% / 1440: 0.00% — glyph antialiasing noise only.
- visual-diff STRETCHED IMAGE ×2: intentional `object-fit: cover` 260×200 crops identical to live; live serves a 360w rendition at 360 vs the 1280w capture (no layout effect).
- content-diff 🟡×3 [header]: live search `<script type="x-template">` mirrored with clean class names (`search__item`) — inherited from canon, same as every archetype.
