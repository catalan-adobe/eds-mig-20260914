# Dynamic features — first page (home), Track A

Curated from `stardust/first-page/dynamics/dynamic-features.generated-plan.md` (89 findings, 1 page).
Hands-off: owner decisions ship the interim tier and are recorded here by name.

| # | feature | evidence | disposition | tier shipped | owner decision (named assumption) |
|---|---|---|---|---|---|
| 1 | Next.js `_next/data/*.json` route prefetches (≈60 rows) | first-party GET on hover/viewport | static-snapshot — the content is authored in DA | delivered | none |
| 2 | Newsletter sign-up (hero, AWeber form `aweber-form-body`) | form + `aweber` hidden inputs | form → interim | interim: email validation + tooltip, submit not sent | AWeber list / ESP endpoint on the new host |
| 3 | Semrush keyword widget (`#keyword-overview-widget-*`) | widget input + button | form → interim | interim: inert form (no navigation) | Semrush widget embed / affiliate parameters |
| 4 | Header search popup | `form[data-sparkloop-form-id]` input "Search" | form → interim | interim: popup toggles; submit to `https://backlinko.com/` | site search backend for EDS |
| 5 | Header "Check My Site's SEO" Semrush popup | `.header-popup` timed reveal | widget → built (hidden, as captured) | built | none |
| 6 | Mega menus, mobile drop, headroom pin/unpin | motion-observe `index.json`, `index-360.json` | interaction → built | built | none |
| 7 | Third-party tags: cookiehub CMP, SparkLoop, VWO, OWOX BI, Pingdom RUM, Semrush | third-party hosts (14) | martech → consent-gated | interim: not loaded (boilerplate consent declines) | which tags run on the new host, CMP choice |
