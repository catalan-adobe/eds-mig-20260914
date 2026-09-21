# EDS conversion log — synopsys.com home (replica handoff, single page)

Source prototype: `stardust/prototypes/index-proposed.html` (gated 0.41 % @1440 / 2.78 % @360).
Schema: `stardust/eds-schema/index.json`. Runtime contract: `stardust/runtime-contract.json`.
Target: `catalan-adobe/eds-mig-20260914`, branch `main` → `content/index.html`, `/nav`, `/footer`.

## Locked names, tiers, decisions (Step 2 / 2b)

| # | prototype section | EDS | tier | notes |
|---|---|---|---|---|
| 0 | utility bar + top nav | `header` block ← `/nav` (sections: brand · links · tools · utility) | template-slotted | overlay chrome (#108): `--nav-height: 0`, absolute header; `.overlapping` at scrollTop > 80 in header JS |
| 1 | hero carousel (5 slides) | `carousel` (Block Collection model: row = slide, cells image \| content) | template-slotted per slide | slide 1 heading is the page `<h1>` (platform requirement, live has none); hidden a11y `<h2>` duplicates dropped; autoplay off (replica freeze) |
| 2,5,7 | empty spacer `text` sections | not authored — section margins in CSS | — | #112 whitespace-only content never survives |
| 3 | statement | default content, section `style: statement` | — | D1 |
| 4 | 4 solution cards | `cards solutions` rows: image \| body (h3, p, CTA p) | reconstructive | card-as-link (EW6) |
| 6 | Design the Future | default content `<h2>` + `columns key-benefits` (1 × 2; cell = `<h3>` + 6 × [img p, title-link p, desc p]) | reconstructive (triples) | items grouped by leading picture |
| 8 | Ecosystem Partners | default content `<h2>` + `cards logos` rows: `<a><img></a>` | reconstructive | CSS marquee; clones presentational (`alt=""`, no href, stripped indices) |
| 9–10 | What's New | default content `<h2>` + `cards news` rows: image \| body (label p `<strong>`, date p, h3, CTA p) | reconstructive | 3-up scroll-snap track; slick dots/arrows not rebuilt (deferred) |
| 11 | Support & Services / Careers | `columns divider` (1 × 2; cell = h2, p, link p) | reconstructive | text-CTA chevron via CSS |
| 12 | Connect with Us | default content, section `style: cta-band` (`<h2>` + `<strong><a>` CTA) | — | D1 |
| — | footer | `footer` block ← `/footer` (sections: 4 link columns · language · social · legal) | template-slotted | |
| — | Ask bar, OneTrust banner, mega-nav panels, search overlay | not delivered | — | dynamic-features.md rows 5/10/3/4 — owner decision batch |

Buttons: D6 — `<strong><a>` primary (white fill), `<em><a>` secondary (outline). Foundation restyles `a.button.*`.
Fonts: Roboto (Apache-2.0) already self-hosted by the boilerplate (400/500/700); added `roboto-light.woff2` (300 — the body weight). No `head.html` font edits.
Media: source Scene7 (`images.synopsys.com`) and `/content/dam` SVG URLs authored directly (verified 200; DA rehost deferred until `DA_TOKEN` is available — `da-media-upload.mjs --manifest`).
Publish decision: **preview-only** (`--no-publish`) until the owner confirms.

## Gate results
(filled by Local QA / Step 10)

### Local QA (harness, 2026-09-21)
- `npm run lint` exit 0 (stylelint `no-descending-specificity` disabled per block file with a justification comment; `@babel/core` is a missing peer of the boilerplate's `@babel/eslint-parser` — installed `--no-save` for the lint run).
- `davids-model-lint.mjs content/` — 0 🔴, 1 🟡 (23 authored SVGs, all verified pure-vector ≤ 22 KB).
- `localize-links.mjs --check` — PASS (53 internal targets stay absolute: not yet migrated; `/` localized in nav/footer).
- `qa-gate.mjs` — 27 ok / 2 fail: both are schema unit counts that include the prototype's slick **clones** (logos 25 = 10 + 15 clones; news 21 = 9 + 12 clones). Authored content carries only the real units (10 / 9) — clones are presentational (EW4/#100). Recorded as accepted.
- `block-roundtrip.mjs --ew` (whole page) — 0 structural 🔴; EW editable 67/67, dead 0, duplicated 0.
- `ew-editability-probe.mjs --simulate-editor` — authored 104 / editable 104 / dead 0. Reported "drift" on CTA `<p>`s (40 → 16 px) is a probe artefact: the probe's runtime mimic buttonizes bare links (`bare-links-too`); this target's `scripts.js` is `formatted-only` (runtime-contract.json), so plain text links are never 40 px tall on the real page.
- Computed-layout guard: `.cards.solutions > ul` grid · `.columns > div` flex · `.cards.news > ul` flex · carousel track grid; 0 zero-width images; document scrollWidth 1440.
- Deferred: mobile-specific hero renditions (one authorable image per slide; the desktop photo is cover-cropped at 180 px on mobile), slick dots/arrows on What's New (scroll-snap rail instead), hero pause control.

### Deployed (preview origin, 2026-09-21) — `https://replica-home--eds-mig-20260914--catalan-adobe.aem.page/`
- Code: branch `replica-home` (commits a9acddc → a774201), Code Sync forced via `POST /code/…/*` (202).
- Content: `deploy-batch.mjs --no-publish` → `/index`, `/nav`, `/footer` PUT 201 + previewed; **not published to live** (owner decision pending).
- `.plain.html`: 200 · one `<h1>` · 0 `about:error` · 0 `/img/` · 40 `<img>` (5 hero + 4 solutions + 12 icons + 10 logos + 9 news) · title/description from the metadata block.
- `ai-readability.mjs`: strict 100 / code 100 (gate ≥ 98).
- Computed-style guard: 8 blocks `loaded`, solutions `grid`, columns/news `flex`, carousel track `grid`, 0 broken / 0 zero-width images, 0 pageerror, scrollWidth 1440; section-metadata styles rendered server-side (`statement`, `light`, `cta-band`).
- **Published-origin source-fidelity gate** (live www.synopsys.com vs preview, `--marker Synopsys`): **1440 → 3.96 % / Δh 0** (pub3) · **360 → 2.94 % / Δh 0** (pub4). Crops: header 1440 1.33 %, footer 1440 1.62 %, header 360 0.29 %, footer 360 1.74 % — all ≤ 2 %.
- CLS (deployed URL, woff2 + nav/footer fetches delayed 1.5 s): 0.0002 @1440, 0.005 @360.
- Residuals: hero autoplay/pause/mobile renditions, What's New dots/arrows (scroll-snap rail), Ask bar / OneTrust / mega-nav panels / search overlay not delivered (dynamic-features.md decision batch); media still served from the source CDN (`da-media-upload.mjs --manifest` rehost pending an owner scope for `/media`).
