<!-- stardust:provenance writtenBy=stardust:replica phase=preserve-direction(dynamics 1–3) writtenAt=2026-09-23 read=stardust/current/_dynamics.json,stardust/dynamics/dynamic-features.generated-plan.md,stardust/current/source-js/site.js -->
# Dynamic features

Source site is fully static (GitHub Pages): 0 first-party APIs, 0 third-party hosts,
0 forms, 0 media embeds, 0 client-rendered regions across 21/21 pages. The only
dynamic surface is `js/site.js` (2 KB) UI behaviour.

## Listings contract

None — every listing (cards, recent stories) is authored static content.

## Features

| id | class | feature | pages | disposition | reproducibility | status |
|---|---|---|---|---|---|---|
| m-megamenu | M | Nav megamenus Explore/Stories/Info: hover (>1024px, 200ms close delay) / click accordion (≤1024px) | 21/21 | reproduce in `header` block | self | planned |
| m-mobile-nav | M | Hamburger toggle `#nav-toggle` → `.nav-menu.is-open`, aria-expanded | 21/21 | reproduce in `header` block | self | planned |
| m-tabs | M | `[data-tabs]` Browse-by-Activity tabs (`.tab-menu-link` → `.tab-pane.is-active`) | index, adventures, basecamp, gear (4) | reproduce as `tabs` block | self | planned |
| m-faq | M | FAQ accordion `.faq-question` toggles `.faq-item.is-open`, aria-expanded | index, basecamp, community, faq (4) | reproduce as `accordion` block | self | planned |
| m-ticker | M | CSS marquee `.ticker-strip` 40s linear, off under reduced-motion | index, basecamp | reproduce as `ticker` block (CSS only) | self | planned |

## Decision batch

None — every row is reproducibility `self`.

## Register

No decided-out rows.
