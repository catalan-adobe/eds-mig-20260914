<!-- stardust provenance: skill=stardust:replica (dynamics Phase 3) · 2026-09-21 · curated from stardust/dynamics/dynamic-features.generated-plan.md (1 page, 50 findings → 12 rows) -->
# Dynamic features — www.synopsys.com (home archetype, bounded-single run)

## Listings contract
none — the home page has no listing block fed by an index. The "What's New" carousel is three
authored cards (captured verbatim); a site-scope run must revisit it as a news listing.

## Features
| # | id | feature | class | reach | disposition | reproducibility | status | pattern | decision / owner | evidence |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | v-video-brightcove (+ v-player-element-*, cr-vjs-* ×10) | hero background video (Brightcove / video.js) with pause control | V/CR | 1/1 | embed-passthrough | self | pending | media-as-url | none — prototype replicates the settled state: poster frame + native `<video>` pointing at the source mp4/poster; video.js control DOM (rows 10–19 of the draft) is NOT rebuilt | `_dynamics.json` media ×6 |
| 2 | v-video-youtube, v-iframe-without-src | YouTube embed, runtime-injected iframe (consent-gated) | V | 1/1 | embed-passthrough | needs-human-capture | pending | embed-passthrough | owner: confirm which embed; no visible surface in the settled 1440 capture | `_dynamics.json` |
| 3 | m-modal-trigger-aria-haspopup | header mega-nav dropdowns (chrome only) | M | 1/1 | rebuild-native | self | pending | chrome-interaction | none — implement only behaviours motion-observe saw fire (Phase 4 interaction parity) | `stardust/replica/motion/index.json` |
| 4 | s-search-hosted-search-service | header search (hosted search service → results page) | S | 1/1 | index-backed | self | pending | search-index-backed | search box replicated as chrome; a results page is out of scope for a single-page pilot → deferred to site scope | header `button[aria-label*=Search]` |
| 5 | ask-bar (not auto-detected; visible in capture) | floating "Ask a question to get instant answers…" AI prompt bar | A/CR | 1/1 | static-snapshot | needs-business-decision | pending | off-origin-data | owner: the assistant backend (bzr.openai.com / bzrcdn.openai.com hosts) is not portable; prototype ships the bar as captured, non-functional | screenshot rows ~800–860 |
| 6 | d-first-party-data-file-get-bin-cs-info-json | GET /bin/cs-info.json | D | 1/1 | data-fed | self | pending | sheet-sync | none — sync from source at rollout; consumer not visible on the home page | `_dynamics.json` |
| 7 | a-first-party-api-post-ee-or2-v1-* (privacy/set-consent, interact) | Adobe Experience Edge (consent + personalisation) | A | 1/1 | embed-passthrough | needs-business-decision | pending | off-origin-data | owner: Edge datastream id on the new host (belongs with row 9) | `_dynamics.json` |
| 8 | a-cms-app-settings-object-* (digitalData, dataLayer, adobeDataLayer) | data-layer objects | A | 1/1 | static-snapshot | self | pending | read-settings | none — analytics payload only; not rendered | `_dynamics.json` |
| 9 | t-* (Adobe Launch, Adobe Analytics/ECID, GTM, GA/Ads, Marketo Munchkin, LinkedIn pixel, Cloudflare Insights, Maze, bttrack, d41, newscred, intentsify, stackadapt, usbrowserspeed, openai bzr) | tag manager + analytics/marketing tags (consent-gated) | T | 1/1 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | owner: which tags run on the new host; property ids | `_dynamics.json` 3rd-party hosts ×44 |
| 10 | t-consent-onetrust | OneTrust CMP ("Before you continue to Synopsys.com") | T | 1/1 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | owner: CMP domain-script reuse; prototype renders no banner (gate runs `--dismiss`) | `#onetrust-banner-sdk` in `pages/index.html` |
| 11 | i18n-locale-variants | hreflang de-de, en-us, zh-tw, ko-kr, zh-cn, ja-jp, x-default; header language switcher | I18N | 1/1 | rebuild-native | needs-business-decision | pending | locale-tree | owner: scope of locale trees; pilot ships en-us only, switcher replicated as chrome | `<link rel=alternate>` in `pages/index.html` |
| 12 | a-unknown-third-party-host-www-google-com | www.google.com XHR (reCAPTCHA / Ads) | A | 1/1 | static-snapshot | needs-human-capture | pending | inspect | owner: inspect at rollout | `_dynamics.json` |

## Decision batch
One message to the site owner, needed before rollout (nothing here blocks the static recreation):
- **Tags & consent (rows 7, 9, 10):** which Adobe Launch property / Edge datastream / GTM container
  / Marketo / pixels run on the new host; OneTrust domain-script id.
- **Assistant (row 5):** is the "Ask" bar (OpenAI-backed) to be re-wired or removed on the new platform?
- **Embeds (row 2, 12):** confirm the consent-gated YouTube iframe and the google.com XHR consumers.
- **Locale (row 11):** which of the 6 locale trees migrate.

## Register (decided-out)
| feature | reason | production statement |
|---|---|---|
| video.js control chrome (draft rows 10–19) | player UI is vendor-generated DOM, not content | the hero video ships as a native `<video autoplay muted loop playsinline>` with the captured poster and a pause toggle |
