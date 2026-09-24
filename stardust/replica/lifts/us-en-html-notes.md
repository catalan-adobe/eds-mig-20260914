# us-en-html (landing, foundation archetype) — lift notes

Prototype: `stardust/prototypes/us-en-html-proposed.html` + `canon.css` (shared) + `us-en-html.css` (page) + `canon.js` (shared interactions).
Served on **port 8794** (8791 is a foreign server from sd-…-0001 — never kill it).

## Gate (iter3 confirmation, --full)
| width | pixel | Δh | structural 🔴 | chrome-parity | header band | footer band | overflow |
|---|---|---|---|---|---|---|---|
| 1440 | 0.00% | 0 | 0 | ✓ | 99.99% | 100% | ok |
| 360 | 0.57% | 0 | 0 | ✓ | 100% | 99.13% | ok |
1920 spot check: header/main/footer/h2/h3/ul/hr/img boxes Δ0.

## Lifted values (source: clientlib-site.min.css, confirmed by measure.mjs)
- body: Source Sans Pro 18px/1.5 #202020; `p` 18px/2.5 margin 0 0 13.5px text-align justify; `a` #0045ff.
- h1–h3 Asar 400 line-height 1.5 margin 27px 0 13.5px; h2 36px; h3 24px; h4–h6 Source Sans Pro 600 uppercase, h4 16px.
- Header: fixed z1030; utility bar 25px #202020; masthead padding 50/50 (15/15 ≤1024); body.scrolly (scrollY>15) → 15/5 + shadow 0 8px 20px rgba(0,0,0,.26) ≥1025; content offset `.site-root` padding-top 200px (130px ≤1024), max-width 1680 centred.
- Grid rail: max-width 1164 (873pt) + 14px gutters; columns 2/8/2 (header), 2/6/2/2 (footer), 10/2 (utility), phone 8/4 utility, 6/6 header, 4/8 footer logo/nav.
- Box model: content-box everywhere except grid columns (`.col` border-box, `display:flow-root` stands in for the floated-column BFC).
- Hero teaser ≥1165: image 640px cover; content 1136px white, margin-top −180px, padding 0 28px; <1165: stacked, no bg.
- Carousel: `.carousel` margin-bottom 4em; fadeIn .5s on active item; dots 10px #afafaf / rgba(0,0,0,.8), margin 0 7px; arrows glyphs U+E90F / U+E90E.
- Featured teaser: row-reverse flex 2:1 (image:content), content #ebebeb padding 3.5em 2em 2em; ≤767 column, content margin-top −1em.
- Image list: flex wrap, item basis 260 + 14 right padding, img 200px cover, title 18px 600 uppercase, description 14px dimgray uppercase nowrap ellipsis width 260.
- Button: 48px, #ebebeb (primary #ffea00), text padding 1rem 2rem 14px 600 uppercase; icon-only 48×48 glyphs U+E902/E901/E903.
- Separator: margin 4rem 0, hr 1px solid #ebebeb (margin 9px 0); footer variant hidden, 1em.
- Footer: #202020, margin-top 3rem, padding 1rem 0 1.5rem; text 12px/1.25 #f7f7f7 justify; links underline.

## Fonts
Same public source (Google Fonts v23, OFL) self-hosted: `assets/fonts/fonts.css` is the page's google-fonts.css with all 45 subset files. **The extract-intercepted woff2 (latin-ext subsets) have different advances** (600 weight 4.5% wider) — using them caused extra wraps (+24px). Icon font: clientlib's wknd-icon-font (woff/ttf).

## Interaction parity (observed → implemented)
- body.scrolly header morph (both widths) ✓
- carousel prev/next/indicator → item/indicator active swap + fadeIn ✓ (no autoplay observed → not implemented)
- language toggle → nav.showMenu + a.open, left = toggle.left − 240, outside click closes ✓
- mobile #toggleNav → body.navPanel-visible (transform .5s) ✓
- header nav link hover → background #ffea00 ✓ (only measured hover)
- Dead/unobserved: hovers on teaser CTA, primary button, list titles, footer links, social buttons — no CSS added beyond lifted source rules (footer/lang link `text-decoration: underline` hovers are lifted source CSS; the sampler cannot observe text-decoration).

## Residuals
- 360: 0.57% pixel — live selects 300–400w AEM renditions, prototype serves the 1600w file (only rendition captured); photo resampling noise, no layout effect.
- visual-diff STRETCHED IMAGE flags: all intentional `object-fit: cover` crops identical to live.
- content-diff 🟡×3: live's search item `<script type="x-template">` mirrored with clean class names (`search__item`) — same DOM, different class string.
- Live featured-teaser image height at 360 is lazy-load-timing dependent (measured 173.25 once, 193.75 settled); gate captures the settled state and matches.
