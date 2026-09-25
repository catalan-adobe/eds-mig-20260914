# EDS conversion log — wknd-adventures.com home → catalan-adobe/eds-mig-20260914

Replica flow (same design). Prototype gated 0.00% (1440) / 2.19% (360, R-01) before conversion.

## Runtime
`stardust/runtime-contract.json`: vanilla aem-boilerplate; `a.button.primary|secondary|accent` in `p.button-wrapper`, formatted-only buttonization; stock section DOM.

## Section triage (D1) and block inventory
| Section | Model | Block / style | Tier | Notes |
|---|---|---|---|---|
| Hero | block `hero` (collection name), variant `full` | template-slotted | image layer + scrim + eyebrow/h1/lead/CTAs — bespoke composition (lint 🟡 D1 justified: image layer under text is not prose) |
| Featured article | block `featured` | template-slotted | 2-col image + eyebrow/h2/lead/CTA with footer rule — fixed composition (🟡 D1 justified) |
| Browse by Activity | default `<h2>` + block `tabs` (collection model: label \| panel) | reconstructive | 4 panels × 3 cards; cards segment on `<h3>` with pre-heading image+tag buffering; card-as-link (EW6) |
| Ticker strip | block `ticker` | reconstructive | one `<ul>` of 10 words; second copy is a presentational clone (EW4) — marquee widget (🟡 D1 justified) |
| Not sure where to start? | default content, `style: inverse-narrow` | — | CTA row = consecutive `p.button-wrapper` (font-size-0 wrapper trick, see styles.css) |
| Quick Answers | default `<h2>` + block `accordion` (collection model) | reconstructive | question in a div, chevron `<button>` (EW7) |
| How We Work | default `<h2>` + block `editorial-index` | reconstructive | `01 \| h3 + p` per row |
| In the Field | default `<h2>` + `<p><a>` text link + block `gallery` | reconstructive | one image per row (D3); trailing single image spans full width |
| Ready to plan… | default content, `style: accent-center` | — | |
| Nav / footer | `/nav`, `/footer` documents; `header`, `footer` blocks | template-slotted | logo authored as SVG `<img>` (dark/light variants, 336 B pure vector); megamenu contract: `<li>label<ul>links…</ul></li>`, nested `<li>label<ul>` = article column |

Eyebrow pill: a bold-only paragraph (`p strong:only-child`) — the site's `.tag`.
Deliberate drops: none. Section-metadata style set: `inverse-narrow`, `accent-center`.

## Fonts
Same OFL woff2 files as the source (Instrument Sans variable 400–700, Syncopate 400/700) in `fonts/`, declared in `styles/fonts.css`; metric-matched `instrument-sans-fallback` / `syncopate-fallback` (fonttools, Arial reference) in `styles/styles.css`. No licensing alert needed.

## Gates before deploy
- `npm run lint` clean (ESLint airbnb-base + Stylelint standard; `.eslintignore` excludes `stardust/`, `.claude/`, `.agents/`).
- `davids-model-lint`: 0 🔴, 5 🟡 (three D1 advisories justified above; two D4 SVG advisories — pure-vector 336 B logos).
- `block-roundtrip` (hero, featured, tabs, ticker, accordion, editorial-index): 0 structural 🔴; 🟠 EXTRA section-head `<h2>` per mapped block = the head lives as default content outside the mapped prototype element (by design).
- `ew-editability-probe --simulate-editor`: 79/79 authored texts editable, 0 dead, 0 duplicated. Edit-mode drift: "Field Notes" text link 42→26 px (flex head row breaks under the editor wrappers; edit-mode only); editorial numbers fixed with `white-space: nowrap`.
- `qa-gate` (harness): runtime booted, one `<h1>`, 8 blocks loaded, cap 1200 holds at 2560. Known harness limitations: 2 "broken" images = `content.da.live` logo SVGs (401 anonymous); `featured` unit-count rows are the schema's tabs rows shifted by the metadata section (the pipeline removes that section on delivery).
- `localize-links --check` PASS; `delivery-lint` 0 P0/P1, 1 P2 (hero `<img>` on content.da.live — rehosted editorial image, expected).

## Decisions
- Branch: `sd-spm--0001` pushed as requested; previews from alias `sd-spm-0001` (Code Sync cannot build a `--` ref — see `stardust/direction.md`).
- Preview only, no `aem.live` publish.
- R-01 (register): navbar wordmark hidden ≤ 450 px (source overflows phones by 75 px).
