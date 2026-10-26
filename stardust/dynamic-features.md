# Dynamic features — site scope (Track B)

Curated from `stardust/dynamics/dynamic-features.generated-plan.md` (69 rows over the roster) and
merged with Track A's `stardust/first-page/dynamic-features.md`. Hands-off: owner decisions ship
the interim tier and are recorded by name; nothing is `decided-out` on a named assumption.

| # | feature | pages | disposition | tier | owner decision (named assumption) |
|---|---|---|---|---|---|
| 1 | Next.js `_next/data/*` prefetches, `__NEXT_DATA__`, client framework | all | static-snapshot (content authored in DA) | delivered | none |
| 2 | Newsletter sign-up (AWeber `email` form → www.aweber.com) | home, articles, /newsletter | form → interim | interim: validation only | AWeber list endpoint on the new host |
| 3 | Semrush keyword widget / ranking modal form → www.semrush.com | home, articles | form → interim | interim: inert form | Semrush widget embed + affiliate params |
| 4 | Header search (JS-wired form) | all | form → interim | interim: submits to backlinko.com | site search backend |
| 5 | Header Semrush popup, mega menus, mobile drop, headroom | all | interaction → built | built (home) | none |
| 6 | Share counts `GET /wp-json/backlinkostats/v1/shares/{n}` | articles | data-fed → interim | interim: not rendered | stats API reachability from EDS (host-bound) |
| 7 | Tool apps `/tools/*` (Semrush-backed checkers) | 7 tool pages | app → interim | interim: link to source host | keep app-routed on backlinko.com or rebuild |
| 8 | Captcha / antibot on forms | forms | form protection → interim | interim: none | captcha provider on the new host |
| 9 | YouTube video embeds, runtime iframes | articles | media → built at rollout | pending | none |
| 10 | Tags: GTM, Google Analytics/Ads, ad pixel, cookiehub CMP, SparkLoop, VWO, OWOX, Pingdom | all | martech → consent-gated | interim: not loaded | which tags run on the new host, CMP choice |
| 11 | Locale variants (us, gb, lp) | some | i18n → scope question | pending | locale scope (no locale tree captured) |
| 12 | Sign-in / account links, price strings (deal, tools) | deal, tools | static links | delivered as links | none |
