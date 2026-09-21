<!-- stardust provenance: skill=stardust:dynamics · phase=plan draft · 2026-09-21T12:10:40.375Z · input stardust/current/_dynamics.json (1 pages, 50 findings) -->
# Dynamic features — draft inventory (curate into `stardust/dynamic-features.md`)

One row per detected finding. Merge duplicates, drop noise, keep every axis honest. Columns: disposition = what we do · reproducibility = what it needs · status = where it stands (reference/triage.md).

| # | id | class | feature | pages | disposition | reproducibility | status | pattern | decision needed | notes |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | a-unknown-third-party-host-px-ads-linkedin-com | A | unknown third-party host px.ads.linkedin.com | 1/1 | static-snapshot | needs-human-capture | pending | inspect | inspect the XHR, add a vendor row |  |
| 2 | a-unknown-third-party-host-bttrack-com | A | unknown third-party host bttrack.com | 1/1 | static-snapshot | needs-human-capture | pending | inspect | inspect the XHR, add a vendor row |  |
| 3 | a-unknown-third-party-host-paapi3112-d41-co | A | unknown third-party host paapi3112.d41.co | 1/1 | static-snapshot | needs-human-capture | pending | inspect | inspect the XHR, add a vendor row |  |
| 4 | a-unknown-third-party-host-www-google-com | A | unknown third-party host www.google.com | 1/1 | static-snapshot | needs-human-capture | pending | inspect | inspect the XHR, add a vendor row |  |
| 5 | a-first-party-api-post-ee-or2-v1-privacy-set-consent | A | first-party API POST /ee/or2/v1/privacy/set-consent | 1/1 | data-fed | needs-business-decision | pending | off-origin-data | which tier for the target host; consumer on the migrated pages? |  |
| 6 | a-first-party-api-post-ee-or2-v1-interact | A | first-party API POST /ee/or2/v1/interact | 1/1 | data-fed | needs-business-decision | pending | off-origin-data | which tier for the target host; consumer on the migrated pages? |  |
| 7 | a-cms-app-settings-object-digitaldata | A | CMS / app settings object digitalData | 1/1 | static-snapshot | self | pending | read-settings | — (keys name endpoints, ids, vendors) |  |
| 8 | a-cms-app-settings-object-datalayer | A | CMS / app settings object dataLayer | 1/1 | static-snapshot | self | pending | read-settings | — (keys name endpoints, ids, vendors) |  |
| 9 | a-cms-app-settings-object-adobedatalayer | A | CMS / app settings object adobeDataLayer | 1/1 | static-snapshot | self | pending | read-settings | — (keys name endpoints, ids, vendors) |  |
| 10 | cr-client-rendered-slot-embed-responsive-item-video-js-vjs-p | CR | client-rendered slot embed-responsive-item video-js vjs-play-button-shape-rectangle | 1/1 | static-snapshot | self | pending | settled-dom-snapshot | inspect the consumer |  |
| 11 | cr-client-rendered-slot-vjs-dock-text | CR | client-rendered slot vjs-dock-text | 1/1 | static-snapshot | self | pending | settled-dom-snapshot | inspect the consumer |  |
| 12 | cr-client-rendered-slot-vjs-loading-spinner | CR | client-rendered slot vjs-loading-spinner | 1/1 | static-snapshot | self | pending | settled-dom-snapshot | inspect the consumer |  |
| 13 | cr-client-rendered-slot-vjs-control-bar | CR | client-rendered slot vjs-control-bar | 1/1 | static-snapshot | self | pending | settled-dom-snapshot | inspect the consumer |  |
| 14 | cr-client-rendered-slot-vjs-seek-to-live-control-vjs-control | CR | client-rendered slot vjs-seek-to-live-control vjs-control | 1/1 | static-snapshot | self | pending | settled-dom-snapshot | inspect the consumer |  |
| 15 | cr-client-rendered-slot-vjs-descriptions-button-vjs-menu-but | CR | client-rendered slot vjs-descriptions-button vjs-menu-button vjs-menu-button-popup | 1/1 | static-snapshot | self | pending | settled-dom-snapshot | inspect the consumer |  |
| 16 | cr-client-rendered-slot-vjs-menu | CR | client-rendered slot vjs-menu | 1/1 | static-snapshot | self | pending | settled-dom-snapshot | inspect the consumer |  |
| 17 | cr-client-rendered-slot-vjs-menu-content | CR | client-rendered slot vjs-menu-content | 1/1 | static-snapshot | self | pending | settled-dom-snapshot | inspect the consumer |  |
| 18 | cr-client-rendered-slot-vjs-menu-item-vjs-selected | CR | client-rendered slot vjs-menu-item vjs-selected | 1/1 | static-snapshot | self | pending | settled-dom-snapshot | inspect the consumer |  |
| 19 | cr-client-rendered-slot-vjs-subs-caps-button-vjs-menu-button | CR | client-rendered slot vjs-subs-caps-button vjs-menu-button vjs-menu-button-popup | 1/1 | static-snapshot | self | pending | settled-dom-snapshot | inspect the consumer |  |
| 20 | d-first-party-data-file-get-bin-cs-info-json | D | first-party data file GET /bin/cs-info.json | 1/1 (reach 1/1) | data-fed | self | pending | sheet-sync | none (sync from the source origin) |  |
| 21 | i18n-locale-variants-de-de-en-us-zh-tw-ko-kr-zh-cn-ja-jp-x-d | I18N | locale variants de-de,en-us,zh-tw,ko-kr,zh-cn,ja-jp,x-default | 1/1 | rebuild-native | needs-business-decision | pending | locale-tree | scope of the locale trees |  |
| 22 | m-modal-trigger-aria-haspopup-chrome-only-button-content | M | modal trigger aria-haspopup (chrome only) → button:content | 1/1 (reach 1/1) | rebuild-native | self | pending | chrome-interaction | none (motion-observe evidence) |  |
| 23 | s-search-hosted-search-service | S | search: hosted search service | 1/1 | index-backed | self | pending | search-index-backed | replace the hosted search service? |  |
| 24 | t-unknown-third-party-host-static-cloudflareinsights-com | T | unknown third-party host static.cloudflareinsights.com | 1/1 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 25 | t-tag-manager-adobe-launch | T | tag manager: Adobe Launch | 1/1 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 26 | t-unknown-third-party-host-experience-adobe-net | T | unknown third-party host experience.adobe.net | 1/1 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 27 | t-consent-onetrust | T | consent: OneTrust | 1/1 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | CMP domain script reuse on the new host |  |
| 28 | t-unknown-third-party-host-vjs-zencdn-net | T | unknown third-party host vjs.zencdn.net | 1/1 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 29 | t-analytics-adobe-analytics-experience-cloud-id | T | analytics: Adobe Analytics / Experience Cloud ID | 1/1 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 30 | t-unknown-third-party-host-analytics-newscred-com | T | unknown third-party host analytics.newscred.com | 1/1 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 31 | t-marketing-ad-retargeting-pixel | T | marketing: ad / retargeting pixel | 1/1 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 32 | t-marketing-marketo-munchkin | T | marketing: Marketo Munchkin | 1/1 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 33 | t-tag-manager-google-tag-manager | T | tag manager: Google Tag Manager | 1/1 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 34 | t-unknown-third-party-host-cdn-bttrack-com | T | unknown third-party host cdn.bttrack.com | 1/1 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 35 | t-unknown-third-party-host-snippet-maze-co | T | unknown third-party host snippet.maze.co | 1/1 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 36 | t-unknown-third-party-host-v2-d41-co | T | unknown third-party host v2.d41.co | 1/1 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 37 | t-unknown-third-party-host-www-google-ch | T | unknown third-party host www.google.ch | 1/1 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 38 | t-unknown-third-party-host-tracking-intentsify-io | T | unknown third-party host tracking.intentsify.io | 1/1 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 39 | t-analytics-adobe-analytics-experience-cloud-id-first-party- | T | analytics: Adobe Analytics / Experience Cloud ID (first-party subdomain — needs a CNAME on the new host) | 1/1 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 40 | t-unknown-third-party-host-tags-srv-stackadapt-com | T | unknown third-party host tags.srv.stackadapt.com | 1/1 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 41 | t-unknown-third-party-host-prompts-maze-co | T | unknown third-party host prompts.maze.co | 1/1 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 42 | t-unknown-third-party-host-bzrcdn-openai-com | T | unknown third-party host bzrcdn.openai.com | 1/1 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 43 | t-unknown-third-party-host-a-usbrowserspeed-com | T | unknown third-party host a.usbrowserspeed.com | 1/1 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 44 | t-analytics-google-analytics-ads | T | analytics: Google Analytics / Ads | 1/1 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 45 | t-unknown-third-party-host-bzr-openai-com | T | unknown third-party host bzr.openai.com | 1/1 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 46 | v-video-brightcove | V | video: Brightcove | 1/1 | embed-passthrough | self | pending | media-as-url | none (player ids are public) |  |
| 47 | v-video-youtube | V | video: YouTube | 1/1 | embed-passthrough | self | pending | media-as-url | none (player ids are public) |  |
| 48 | v-player-element-div | V | player element <div> | 1/1 | embed-passthrough | self | pending | media-as-url | none (player ids are public) |  |
| 49 | v-player-element-video | V | player element <video> | 1/1 | embed-passthrough | self | pending | media-as-url | none (player ids are public) |  |
| 50 | v-iframe-without-src-runtime-injected-embed | V | iframe without src (runtime-injected embed) | 1/1 | embed-passthrough | needs-human-capture | pending | embed-passthrough | resolve the runtime src from a rendered capture |  |

## Triage

- **Ships autonomously (reproducibility `self`):** 20 row(s) — read-settings, settled-dom-snapshot, sheet-sync, chrome-interaction, search-index-backed, media-as-url.
- **One owner decision batch:** 30 row(s) — inspect the XHR, add a vendor row · which tier for the target host; consumer on the migrated pages? · scope of the locale trees · which tags run on the new host; property ids · CMP domain script reuse on the new host · resolve the runtime src from a rendered capture.
- **Already delivered by the capture pipeline:** 0 row(s) — no work.
- **Host-bound on the target:** 0 of 0 probed API paths — the off-origin data work.

## Phases

- **tags** — 22
- **capture** — 10
- **detect** — 7
- **media** — 4
- **off-origin data** — 2
- **data** — 1
- **locale wave** — 1
- **interactive** — 1
- **search** — 1
- **embeds** — 1
