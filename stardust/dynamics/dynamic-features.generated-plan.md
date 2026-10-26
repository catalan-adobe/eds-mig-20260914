<!-- stardust provenance: skill=stardust:dynamics · phase=plan draft · 2026-10-26T15:50:58.533Z · input stardust/current/_dynamics.json (5 pages, 69 findings) -->
# Dynamic features — draft inventory (curate into `stardust/dynamic-features.md`)

One row per detected finding. Merge duplicates, drop noise, keep every axis honest. Columns: disposition = what we do · target = the delivery form (widget where no authored rows remain) · reproducibility = what it needs · status = where it stands (reference/triage.md).

| # | id | class | feature | pages | disposition | target | reproducibility | status | pattern | decision needed | notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | a-unknown-third-party-host-dev-visualwebsiteoptimizer-com | A | unknown third-party host dev.visualwebsiteoptimizer.com | 5/5 | static-snapshot | — | needs-human-capture | pending | inspect | inspect the XHR, add a vendor row |  |
| 2 | a-unknown-third-party-host-js-sparkloop-app | A | unknown third-party host js.sparkloop.app | 5/5 | static-snapshot | — | needs-human-capture | pending | inspect | inspect the XHR, add a vendor row |  |
| 3 | a-unknown-third-party-host-cdn-cookiehub-eu | A | unknown third-party host cdn.cookiehub.eu | 5/5 | static-snapshot | — | needs-human-capture | pending | inspect | inspect the XHR, add a vendor row |  |
| 4 | a-unknown-third-party-host-www-semrush-com | A | unknown third-party host www.semrush.com | 5/5 | static-snapshot | — | needs-human-capture | pending | inspect | inspect the XHR, add a vendor row |  |
| 5 | a-unknown-third-party-host-streaming-bi-owox-com | A | unknown third-party host streaming.bi.owox.com | 5/5 | static-snapshot | — | needs-human-capture | pending | inspect | inspect the XHR, add a vendor row |  |
| 6 | a-unknown-third-party-host-region-eu-cookiehub-net | A | unknown third-party host region-eu.cookiehub.net | 5/5 | static-snapshot | — | needs-human-capture | pending | inspect | inspect the XHR, add a vendor row |  |
| 7 | a-unknown-third-party-host-rum-collector-2-pingdom-net | A | unknown third-party host rum-collector-2.pingdom.net | 5/5 | static-snapshot | — | needs-human-capture | pending | inspect | inspect the XHR, add a vendor row |  |
| 8 | a-unknown-third-party-host-script-settings-sparkloop-app | A | unknown third-party host script-settings.sparkloop.app | 5/5 | static-snapshot | — | needs-human-capture | pending | inspect | inspect the XHR, add a vendor row |  |
| 9 | a-first-party-api-get-next-data-98ej4qw-qitteteyyf6wn-templa | A | first-party API GET /_next/data/98eJ4qW-QitTETEyYF6Wn/templates/marketing.json | 5/5 | data-fed | block | needs-business-decision | pending | off-origin-data | which tier for the target host; consumer on the migrated pages? |  |
| 10 | a-first-party-api-get-next-data-98ej4qw-qitteteyyf6wn-tools- | A | first-party API GET /_next/data/98eJ4qW-QitTETEyYF6Wn/tools/website-authority.json | 5/5 | decided-out | — | needs-backend | pending | decided-out | none (session-bound off-origin) |  |
| 11 | a-first-party-api-get-next-data-98ej4qw-qitteteyyf6wn-index- | A | first-party API GET /_next/data/98eJ4qW-QitTETEyYF6Wn/index.json | 5/5 | data-fed | block | needs-business-decision | pending | off-origin-data | which tier for the target host; consumer on the migrated pages? |  |
| 12 | a-first-party-api-get-next-data-98ej4qw-qitteteyyf6wn-llm-se | A | first-party API GET /_next/data/98eJ4qW-QitTETEyYF6Wn/llm-seeding.json | 5/5 | data-fed | block | needs-business-decision | pending | off-origin-data | which tier for the target host; consumer on the migrated pages? |  |
| 13 | a-first-party-api-get-next-data-98ej4qw-qitteteyyf6wn-tools- | A | first-party API GET /_next/data/98eJ4qW-QitTETEyYF6Wn/tools/competitor-analysis.json | 5/5 | data-fed | block | needs-business-decision | pending | off-origin-data | which tier for the target host; consumer on the migrated pages? |  |
| 14 | a-first-party-api-get-next-data-98ej4qw-qitteteyyf6wn-tools- | A | first-party API GET /_next/data/98eJ4qW-QitTETEyYF6Wn/tools/keyword.json | 5/5 | data-fed | block | needs-business-decision | pending | off-origin-data | which tier for the target host; consumer on the migrated pages? |  |
| 15 | a-first-party-api-get-next-data-98ej4qw-qitteteyyf6wn-genera | A | first-party API GET /_next/data/98eJ4qW-QitTETEyYF6Wn/generative-engine-optimization-geo.json | 5/5 | data-fed | block | needs-business-decision | pending | off-origin-data | which tier for the target host; consumer on the migrated pages? |  |
| 16 | a-first-party-api-get-next-data-98ej4qw-qitteteyyf6wn-seo-st | A | first-party API GET /_next/data/98eJ4qW-QitTETEyYF6Wn/seo-strategy.json | 5/5 | data-fed | block | needs-business-decision | pending | off-origin-data | which tier for the target host; consumer on the migrated pages? |  |
| 17 | a-first-party-api-get-next-data-98ej4qw-qitteteyyf6wn-tools- | A | first-party API GET /_next/data/98eJ4qW-QitTETEyYF6Wn/tools/backlink-checker.json | 5/5 | data-fed | block | needs-business-decision | pending | off-origin-data | which tier for the target host; consumer on the migrated pages? |  |
| 18 | a-first-party-api-get-next-data-98ej4qw-qitteteyyf6wn-hub-se | A | first-party API GET /_next/data/98eJ4qW-QitTETEyYF6Wn/hub/seo/what-is-seo.json | 5/5 | data-fed | block | needs-business-decision | pending | off-origin-data | which tier for the target host; consumer on the migrated pages? |  |
| 19 | a-first-party-api-get-next-data-98ej4qw-qitteteyyf6wn-seo-ce | A | first-party API GET /_next/data/98eJ4qW-QitTETEyYF6Wn/seo-certification-guide.json | 5/5 | data-fed | block | needs-business-decision | pending | off-origin-data | which tier for the target host; consumer on the migrated pages? |  |
| 20 | a-first-party-api-get-next-data-98ej4qw-qitteteyyf6wn-tools- | A | first-party API GET /_next/data/98eJ4qW-QitTETEyYF6Wn/tools/keyword-difficulty-checker.json | 5/5 | data-fed | block | needs-business-decision | pending | off-origin-data | which tier for the target host; consumer on the migrated pages? |  |
| 21 | a-first-party-api-get-next-data-98ej4qw-qitteteyyf6wn-improv | A | first-party API GET /_next/data/98eJ4qW-QitTETEyYF6Wn/improve-your-seo.json | 5/5 | data-fed | block | needs-business-decision | pending | off-origin-data | which tier for the target host; consumer on the migrated pages? |  |
| 22 | a-first-party-api-get-next-data-98ej4qw-qitteteyyf6wn-google | A | first-party API GET /_next/data/98eJ4qW-QitTETEyYF6Wn/google-e-e-a-t.json | 5/5 | data-fed | block | needs-business-decision | pending | off-origin-data | which tier for the target host; consumer on the migrated pages? |  |
| 23 | a-first-party-api-get-next-data-98ej4qw-qitteteyyf6wn-ecomme | A | first-party API GET /_next/data/98eJ4qW-QitTETEyYF6Wn/ecommerce-seo.json | 5/5 | data-fed | block | needs-business-decision | pending | off-origin-data | which tier for the target host; consumer on the migrated pages? |  |
| 24 | a-first-party-api-get-next-data-98ej4qw-qitteteyyf6wn-hub-se | A | first-party API GET /_next/data/98eJ4qW-QitTETEyYF6Wn/hub/seo/internal-links.json | 5/5 | data-fed | block | needs-business-decision | pending | off-origin-data | which tier for the target host; consumer on the migrated pages? |  |
| 25 | a-first-party-api-get-next-data-98ej4qw-qitteteyyf6wn-tools- | A | first-party API GET /_next/data/98eJ4qW-QitTETEyYF6Wn/tools/ai-visibility-checker.json | 5/5 | data-fed | block | needs-business-decision | pending | off-origin-data | which tier for the target host; consumer on the migrated pages? |  |
| 26 | a-first-party-api-get-next-data-98ej4qw-qitteteyyf6wn-tools- | A | first-party API GET /_next/data/98eJ4qW-QitTETEyYF6Wn/tools/website-traffic-checker.json | 5/5 | data-fed | block | needs-business-decision | pending | off-origin-data | which tier for the target host; consumer on the migrated pages? |  |
| 27 | a-first-party-api-get-next-data-98ej4qw-qitteteyyf6wn-techni | A | first-party API GET /_next/data/98eJ4qW-QitTETEyYF6Wn/technical-seo-guide.json | 5/5 | data-fed | block | needs-business-decision | pending | off-origin-data | which tier for the target host; consumer on the migrated pages? |  |
| 28 | a-first-party-api-get-next-data-98ej4qw-qitteteyyf6wn-seo-ch | A | first-party API GET /_next/data/98eJ4qW-QitTETEyYF6Wn/seo-checklist.json | 5/5 | data-fed | block | needs-business-decision | pending | off-origin-data | which tier for the target host; consumer on the migrated pages? |  |
| 29 | a-first-party-api-get-next-data-98ej4qw-qitteteyyf6wn-on-pag | A | first-party API GET /_next/data/98eJ4qW-QitTETEyYF6Wn/on-page-seo.json | 5/5 | data-fed | block | needs-business-decision | pending | off-origin-data | which tier for the target host; consumer on the migrated pages? |  |
| 30 | a-first-party-api-get-next-data-98ej4qw-qitteteyyf6wn-about- | A | first-party API GET /_next/data/98eJ4qW-QitTETEyYF6Wn/about-backlinko.json | 5/5 | data-fed | block | needs-business-decision | pending | off-origin-data | which tier for the target host; consumer on the migrated pages? |  |
| 31 | a-cms-app-settings-object-datalayer | A | CMS / app settings object dataLayer | 5/5 | static-snapshot | content | self | pending | read-settings | — (keys name endpoints, ids, vendors) |  |
| 32 | a-cms-app-settings-object-next-data | A | CMS / app settings object __NEXT_DATA__ | 5/5 | static-snapshot | content | self | pending | read-settings | — (keys name endpoints, ids, vendors) |  |
| 33 | a-first-party-api-get-next-data-98ej4qw-qitteteyyf6wn-newsle | A | first-party API GET /_next/data/98eJ4qW-QitTETEyYF6Wn/newsletter.json | 4/5 | data-fed | block | needs-business-decision | pending | off-origin-data | which tier for the target host; consumer on the migrated pages? |  |
| 34 | a-first-party-api-get-next-data-98ej4qw-qitteteyyf6wn-blog-j | A | first-party API GET /_next/data/98eJ4qW-QitTETEyYF6Wn/blog.json | 2/5 | data-fed | block | needs-business-decision | pending | off-origin-data | which tier for the target host; consumer on the migrated pages? |  |
| 35 | a-first-party-api-get-next-data-98ej4qw-qitteteyyf6wn-deals- | A | first-party API GET /_next/data/98eJ4qW-QitTETEyYF6Wn/deals/semrush-coupon.json | 2/5 | data-fed | block | needs-business-decision | pending | off-origin-data | which tier for the target host; consumer on the migrated pages? |  |
| 36 | a-first-party-api-get-next-data-98ej4qw-qitteteyyf6wn-best-f | A | first-party API GET /_next/data/98eJ4qW-QitTETEyYF6Wn/best-free-seo-tools.json | 2/5 | data-fed | block | needs-business-decision | pending | off-origin-data | which tier for the target host; consumer on the migrated pages? |  |
| 37 | a-first-party-api-get-next-data-98ej4qw-qitteteyyf6wn-contac | A | first-party API GET /_next/data/98eJ4qW-QitTETEyYF6Wn/contact.json | 2/5 | data-fed | block | needs-business-decision | pending | off-origin-data | which tier for the target host; consumer on the migrated pages? |  |
| 38 | a-first-party-api-get-wp-json-backlinkostats-v1-shares-n | A | first-party API GET /wp-json/backlinkostats/v1/shares/{n} | 2/5 | data-fed | block | needs-business-decision | pending | off-origin-data | which tier for the target host; consumer on the migrated pages? |  |
| 39 | a-first-party-api-get-next-data-98ej4qw-qitteteyyf6wn-blog-a | A | first-party API GET /_next/data/98eJ4qW-QitTETEyYF6Wn/blog/authors/leigh-mckenzie.json | 2/5 | decided-out | — | needs-backend | pending | decided-out | none (session-bound off-origin) |  |
| 40 | a-first-party-api-get-next-data-98ej4qw-qitteteyyf6wn-blog-a | A | first-party API GET /_next/data/98eJ4qW-QitTETEyYF6Wn/blog/authors/backlinko-team.json | 1/5 | decided-out | — | needs-backend | pending | decided-out | none (session-bound off-origin) |  |
| 41 | a-first-party-api-get-next-data-98ej4qw-qitteteyyf6wn-ai-seo | A | first-party API GET /_next/data/98eJ4qW-QitTETEyYF6Wn/ai-seo.json | 1/5 | data-fed | block | needs-business-decision | pending | off-origin-data | which tier for the target host; consumer on the migrated pages? |  |
| 42 | a-first-party-api-get-next-data-98ej4qw-qitteteyyf6wn-reddit | A | first-party API GET /_next/data/98eJ4qW-QitTETEyYF6Wn/reddit-marketing.json | 1/5 | data-fed | block | needs-business-decision | pending | off-origin-data | which tier for the target host; consumer on the migrated pages? |  |
| 43 | a-first-party-api-get-next-data-98ej4qw-qitteteyyf6wn-blog-a | A | first-party API GET /_next/data/98eJ4qW-QitTETEyYF6Wn/blog/authors/leigh-mckenzie/page/2.json | 1/5 | decided-out | — | needs-backend | pending | decided-out | none (session-bound off-origin) |  |
| 44 | a-first-party-api-get-next-data-98ej4qw-qitteteyyf6wn-answer | A | first-party API GET /_next/data/98eJ4qW-QitTETEyYF6Wn/answer-engine-optimization-aeo.json | 1/5 | data-fed | block | needs-business-decision | pending | off-origin-data | which tier for the target host; consumer on the migrated pages? |  |
| 45 | a-first-party-api-get-next-data-98ej4qw-qitteteyyf6wn-tools- | A | first-party API GET /_next/data/98eJ4qW-QitTETEyYF6Wn/tools.json | 1/5 | data-fed | block | needs-business-decision | pending | off-origin-data | which tier for the target host; consumer on the migrated pages? |  |
| 46 | cr-client-framework-next | CR | client framework next | 5/5 | static-snapshot | content | self | pending | settled-dom-snapshot | inspect the consumer |  |
| 47 | f-form-text-no-action-js-wired-1-fields | F | form "text:" → no action (JS-wired) (1 fields) | 5/5 | rebuild-native | block | needs-backend | pending | forms | production endpoint; interim capture ships now |  |
| 48 | f-form-ranking-modal-form-third-party-www-semrush-com-1-fiel | F | form "ranking-modal-form" → third-party www.semrush.com (1 fields) | 5/5 | rebuild-native | block | needs-backend | pending | forms | production endpoint; interim capture ships now |  |
| 49 | f-form-email-email-third-party-www-aweber-com-1-fields | F | form "email:email" → third-party www.aweber.com (1 fields) | 1/5 | rebuild-native | block | needs-backend | pending | forms | production endpoint; interim capture ships now |  |
| 50 | f-form-protection-captcha-antibot | F | form protection: captcha / antibot | 1/5 | rebuild-native | block | needs-backend | pending | forms | production backend (vendor form id + field mapping) |  |
| 51 | f-form-css-wz9qt-no-action-js-wired-1-fields | F | form "css-wz9qt" → no action (JS-wired) (1 fields) | 1/5 | rebuild-native | block | needs-backend | pending | forms | production endpoint; interim capture ships now |  |
| 52 | i18n-locale-variants-us-us-gb-lp-en | I18N | locale variants us,us,gb,lp,en | 1/5 | rebuild-native | runtime | needs-business-decision | pending | locale-tree | scope of the locale trees |  |
| 53 | i18n-locale-variants-lp | I18N | locale variants lp | 1/5 | rebuild-native | runtime | needs-business-decision | pending | locale-tree | scope of the locale trees |  |
| 54 | l-listing-candidate-ul-15-cards | L | listing candidate ul (15 cards) | 1/5 | index-backed | block | needs-business-decision | pending | listing-index-backed | index-driven or editorially curated? |  |
| 55 | m-modal-trigger-aria-haspopup-button-content | M | modal trigger aria-haspopup → button:content | 5/5 | rebuild-native | runtime | self | pending | modal-loader | none |  |
| 56 | s-first-party-api-get-next-data-98ej4qw-qitteteyyf6wn-ai-sea | S | first-party API GET /_next/data/98eJ4qW-QitTETEyYF6Wn/ai-search-strategy.json | 5/5 | data-fed | block | needs-business-decision | pending | off-origin-data | datasource ownership / same-origin routing on production |  |
| 57 | t-tag-manager-google-tag-manager | T | tag manager: Google Tag Manager | 5/5 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 58 | t-unknown-third-party-host-rum-static-pingdom-net | T | unknown third-party host rum-static.pingdom.net | 5/5 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 59 | t-marketing-ad-retargeting-pixel | T | marketing: ad / retargeting pixel | 5/5 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 60 | t-unknown-third-party-host-script-sparkloop-app | T | unknown third-party host script.sparkloop.app | 5/5 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 61 | t-analytics-google-analytics-ads | T | analytics: Google Analytics / Ads | 5/5 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 62 | t-unknown-third-party-host-dash-sparkloop-app | T | unknown third-party host dash.sparkloop.app | 5/5 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 63 | t-unknown-third-party-host-static-semrush-com | T | unknown third-party host static.semrush.com | 1/5 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 64 | t-third-party-mount-div-data-consent-tag-manager-injected-wi | T | third-party mount <div data-consent> (tag-manager-injected widget) | 1/5 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | CMP domain script reuse on the new host |  |
| 65 | v-iframe-without-src-runtime-injected-embed | V | iframe without src (runtime-injected embed) | 5/5 | embed-passthrough | embed | needs-human-capture | pending | embed-passthrough | resolve the runtime src from a rendered capture |  |
| 66 | v-video-youtube | V | video: YouTube | 1/5 | embed-passthrough | content | self | pending | media-as-url | none (player ids are public) |  |
| 67 | x-sign-in-account-links | X | sign-in / account links | 4/5 | decided-out | — | needs-backend | pending | decided-out | auth / commerce on the new host? |  |
| 68 | x-commerce-signals-cart-false-prices-14 | X | commerce signals (cart: false, prices: 14) | 1/5 | decided-out | — | needs-backend | pending | decided-out | auth / commerce on the new host? |  |
| 69 | x-commerce-signals-cart-false-prices-9 | X | commerce signals (cart: false, prices: 9) | 1/5 | decided-out | — | needs-backend | pending | decided-out | auth / commerce on the new host? |  |

## Triage

- **Ships autonomously (reproducibility `self`):** 5 row(s) — read-settings, settled-dom-snapshot, modal-loader, media-as-url.
- **One owner decision batch:** 57 row(s) — inspect the XHR, add a vendor row · which tier for the target host; consumer on the migrated pages? · production endpoint; interim capture ships now · production backend (vendor form id + field mapping) · scope of the locale trees · index-driven or editorially curated?.
- **Already delivered by the capture pipeline:** 0 row(s) — no work.
- **Host-bound on the target:** 0 of 0 probed API paths — the off-origin data work.

## Phases

- **off-origin data** — 32
- **detect** — 10
- **tags** — 8
- **register** — 7
- **forms** — 5
- **locale wave** — 2
- **capture** — 1
- **listings** — 1
- **interactive** — 1
- **embeds** — 1
- **media** — 1
