# Journal

## Setup — flow replica stamped, hands-off, deps + scripts copied (2026-10-26)

- impeccable 3.1.1 (4.7.1 available). Playwright/pixelmatch/pngjs/cheerio installed as devDependencies.
- Scripts copied to stardust/scripts/{replica,stardust,migrate,diff,deploy,rollout,dynamics,extract} + crawl.mjs.
- First page first: Track A = home, Track B = extract --prep.

## First page — Track A capture + bounded preserve-direction (home) (2026-10-26)

- crawl.mjs --max 1 → stardust/first-page/current (slug `index`), cap-probe: container 1140, probe 2560.
- Bounded promotion (§ 1a): PRODUCT.md / DESIGN.md / DESIGN.json synthesized, provenance bounded-single; register empty.
- Dynamics: 89 findings → curated stardust/first-page/dynamic-features.md (interim tier for forms/tags).

## Recreate — home prototype from lifted emotion CSS (2026-10-26)

- Source CSS: inline emotion styles extracted to first-page/lift/rules-slim.css; CSSOM-only rules (promo bar, hub tiles) read via measure.mjs.
- Prototype stardust/prototypes/index-proposed.html + canon.css + index.css + index.js; header re-authored from captured content by first-page/lift/build-header.mjs.

## Source-fidelity gate — prototype passes at 1440 and 360 (2026-10-26)

- iter1 1440 0.41% / 360 21.9% (promo-bar height 62 vs 111 at mobile); header mega content missing (121 🔴).
- iter2–4: header mega/search/Semrush/mobile drop content, tooltip, titles, overflow from search popup fixed.
- iter5 (confirmation): 1440 0.40% Δ0, 360 3.23% Δ1, content-diff 0 🔴 0 🟡, chrome quiet, clip 0, cap-probe PASS.
- Motion: headroom, mega, search, mobile drop implemented; motion-compare 12 parity / 1 internal class.

## Handoff — home delivered on the published origin (2026-10-26)

- Code branch scope-2610-01 (blocks hero, posts, keyword-search, tool-cards, hubs, header, footer; Inter font).
- DA folder /scope-2610-01/ (index, nav, footer) + 30 media; deploy-batch PUT → preview → live.
- pub1–pub4 fixes: Semrush title wrap error, Inter font file, double promo-bar height, loose nav lists,
  inline header glyphs, card-header min-height leak, quoted font family names.
- pub5: 1440 0.47% Δ0 · 360 3.45% Δ1 · content-diff 0 🔴 0 🟡 · visual-diff 0 · chrome quiet · gate-all PASS both widths.

## Extract (prep) — site scope roster, types, modules, dynamics (Track B, 2026-10-26)

- crawl.mjs --max 100 crashed after 59 pages (browser closed); a targeted re-crawl of 22 header/footer/landing
  paths at concurrency 2 completed: 79 pages captured of 571 in the sitemaps (cap 100/20, hands-off).
- Page types: article 56 · listing 12 · form 7 · static 2 · landing 2. Modules: promo bar, header, footer
  (77–78 pages), hub row (8), hub topic list (13), tool card (2), post cards + section heading (home, blog).
- cap-probe across /, /blog, /hub/seo, /seo-strategy: container 1140, shell 1320, articles 740 content column.
- Capture gap reported by crawl: "uncaptured first-level targets: hub/seo 55" (scope debt for rollout).
- Dynamics: 69 rows → stardust/dynamic-features.md (12 curated rows, interim tiers named).
