<!-- stardust:provenance
  writtenBy: stardust:extract
  writtenAt: 2026-09-24T07:31:42Z
  readArtifacts: [https://wknd.site/us/en.html, stardust/current/pages/*.json, stardust/current/_brand-extraction.json]
  synthesizedInputs: []
  stardustVersion: 0.10.0
  mode: descriptive (current state, replica flow — not a target)
-->
# Product
<!-- impeccable:product-schema 1 -->

## Platform
web

## Users
Outdoor and travel enthusiasts browsing guided adventures (skiing, surfing, cycling, climbing, camping, food & wine trips) and long-form magazine stories; secondarily, AEM developers and evaluators — the footer states the site is Adobe's WKND reference implementation.
_provenance: inferred — from the adventure inventory (16 trips × 2 locales), magazine articles, and the footer disclaimer copy._

## Product Purpose
Present WKND's catalogue of guided adventure trips (each with overview, itinerary, what-to-bring, price, difficulty, group size) and its travel magazine, and funnel visitors from stories to trips ("View Trips", "Read More", "Where do you want to go?").

## Positioning
"WKND is a collective of outdoors, music, crafts, adventure sports, and travel enthusiasts that want to share our experiences, connections, and expertise with the world." (meta description, every page). Editorial-first travel brand: photography-led, magazine tone, trips presented as stories rather than as products.

## Capabilities and Constraints
- Content: 64 live pages — home, adventures index, 16 adventure detail pages, magazine index, 5 articles (+2 members-only articles and a members-only index on /ca/en), about-us (contributors + guides), FAQs; a /ca/en locale tree that is a byte-identical live copy of /us/en; nine locale roots (us/es, ca/fr, ch/de, ch/fr, ch/it, de/de, fr/fr, es/es, it/it) that render only "Coming Soon!".
- Dynamic surface: site search form (GET `…searchresults.json`), Sign In / Sign Out utility links (hash anchors, ContextHub-driven greeting), language navigation dropdown, hero and adventure image carousels, tabs (Overview / Itinerary / What to Bring), FAQ accordion, mobile off-canvas nav, share buttons, Adobe Launch / Analytics / demdex beacons. Depth and disposition: the dynamics skill.
- Constraints: AEM Sites core-components markup (`.cmp-*`), Google Fonts (Asar, Source Sans Pro), site icon font, images served as `.coreimg` renditions with srcset.

## Brand Commitments
- Register: **brand** (photography-led marketing/editorial site; no dashboards or data-dense tooling).
- Personality observed: adventurous, warm, confident, editorial; large photography with sparse serif headings and small uppercase sans labels; a single vivid yellow (#ffea00) as the only accent, used sparingly (active nav, primary button, title underline).
- Anti-references observed: no gradients, no drop shadows, no rounded buttons, no dense card chrome; everything sits flat on white with square corners.

## Evidence on Hand
- `stardust/current/pages/<slug>.json` + `.html` — 64 live Playwright captures (record + settled DOM), typed with `slots`.
- `stardust/current/assets/screenshots/<slug>.png` — 64 full-page screenshots at 1440.
- `stardust/current/_computed-styles.json` — style census, 64 pages × {1440, 360}.
- `stardust/current/_brand-extraction.json`, `DESIGN.md`, `DESIGN.json` — brand surface and tokens.
- `stardust/current/assets/` — `logo.svg`, `logo-light.svg`, `favicon.png`, `fonts/` (Asar 400; Source Sans Pro 300/400/600 + italics; wknd-icon-font), `css/` (clientlib-site, clientlib-base, google-fonts), `media/` (252 page images, `_manifest.json` maps URL → file).
- `stardust/current/_crawl-log.json` — discovery, consent, vision check, dynamic-surface rollup.

## Product Principles
- Photography leads; type stays quiet (one serif for headings, one sans for everything else).
- One accent colour, used as a marker (active state, underline, primary CTA), never as a surface.
- Trips are stories: every adventure detail opens with a full-bleed carousel and a serif title before any facts.
- Uppercase small sans labels carry all navigation and action affordances.

## Accessibility & Inclusion
Semantic landmarks (`header`, `main`, `footer`, `nav`), alt text present on content images, breadcrumb and tab ARIA from core components, skip-to-content absent, contrast of #202020 on #ffffff and #ffea00 passes; light-grey (#ebebeb) footer text on #202020 passes. Justified paragraph text (line-height 2.5) is a readability oddity carried from the source.
_provenance: inferred — from captured DOM; no audit run._
