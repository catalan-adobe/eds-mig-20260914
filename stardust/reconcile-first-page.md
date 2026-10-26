# RECONCILE — first page (home) × site scope

Track A: home (https://backlinko.com/, slug `index`) delivered at
https://scope-2610-01--eds-mig-20260914--catalan-adobe.aem.live/scope-2610-01/.
Track B: 79-page roster (cap 100/20 of 571), types, module catalog, dynamics.
Promotion: Track B's current/PRODUCT.md, DESIGN.md, DESIGN.json replaced the bounded-single
spec verbatim; direction.md rewritten (full-prep branch, roster caps). Hands-off: corrections
applied without asking; published-origin gate re-run after them (pub6).

| # | check | verdict | evidence |
|---|---|---|---|
| 1 | Page type | confirmed | state.json `index` = `landing`; home is the landing archetype (`rep_url` https://backlinko.com/); the only other landing (/deals/semrush-coupon) is a different template |
| 2 | Blocks | corrected (e99821e) | hero, keyword-search: home-only, no catalog module. posts ↔ post-card + section-heading (home, /blog); tool-cards ↔ tool-card (home, /tools); hubs ↔ hub-row (8 pages). /hub/seo reuses hub-row with 9 rows and 9 topic colours, so the home's nth-child colour map would have forked: hubs now keys `--topic-color` on the tile link slug (`data-topic`, 12 lifted colours) — one block, no variant fork |
| 3 | Chrome | confirmed | header `default` on 13/14 pages carrying the flag, footer `default` 66/67; the one `plain` variant is /newsletter (form page) — not a reuse of this chrome, deferred to that template. nav/footer documents cover the default variant (mega Articles/Tools, search, Semrush popup, mobile drop; Learn/Company/Connect/legal) |
| 4 | Dynamics | confirmed | every row of first-page/dynamic-features.md maps into dynamic-features.md: _next/data → 1, AWeber → 2, Semrush widget → 3, header search → 4, popup + menus → 5, tags → 10; interim tiers unchanged |
| 5 | Listings | confirmed | home cards are editorial picks authored as `posts` rows (not a query); metadata carries title, description, nav, footer only — no listings-contract field depends on the home |
| 6 | Scope | corrected (e99821e) | home, nav and footer carried 146 links to backlinko.com paths outside the delivered set, authored root-relative (incl. app-routed /tools/* — dynamics row 7), which 404ed on EDS; they now point at https://backlinko.com/<path> (localize-links re-points them as pages enter the tree, --check PASS). "/" stays (delivered home) |
| 7 | Canon | confirmed | promoted DESIGN.json tokens = the lifted values styles/styles.css uses (Inter, #00bc98 …, container 540/720/960/1140); site-wide shell 1320 / 740 article column applies to the article template only — no delta for the home foundation |

Gate after corrections (pub6): 1440 0.47 % Δ0 · 360 3.45 % Δ1 · content-diff 0 🔴 0 🟡 ·
visual-diff 0 · chrome-parity quiet · clip 0.

Record: `state.mjs advance index --to approved --by hands-off --prototype stardust/prototypes/index-proposed.html`.
