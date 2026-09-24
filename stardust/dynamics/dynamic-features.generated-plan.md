<!-- stardust provenance: skill=stardust:dynamics · phase=plan draft · 2026-09-24T10:07:34.006Z · input stardust/current/_dynamics.json (6 pages, 28 findings) · target probe https://replica-wknd--eds-mig-20260914--catalan-adobe.aem.page · reconciled against stardust/migrated -->
# Dynamic features — draft inventory (curate into `stardust/dynamic-features.md`)

One row per detected finding. Merge duplicates, drop noise, keep every axis honest. Columns: disposition = what we do · reproducibility = what it needs · status = where it stands (reference/triage.md).

| # | id | class | feature | pages | disposition | reproducibility | status | pattern | decision needed | notes |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | a-cms-app-settings-object-adobedatalayer | A | CMS / app settings object adobeDataLayer | 6/6 | static-snapshot | self | pending | read-settings | — (keys name endpoints, ids, vendors) |  |
| 2 | a-cms-app-settings-object-granite | A | CMS / app settings object Granite | 6/6 | static-snapshot | self | pending | read-settings | — (keys name endpoints, ids, vendors) |  |
| 3 | a-cms-app-settings-object-cq | A | CMS / app settings object CQ | 6/6 | static-snapshot | self | pending | read-settings | — (keys name endpoints, ids, vendors) |  |
| 4 | d-first-party-data-file-get-home-users-o-oa6pkcc2rneodh2ni0q | D | first-party data file GET /home/users/o/oa6PkCC2rneOdh2ni0qG.infinity.json | 6/6 (reach 26/26) | data-fed | self | pending | sheet-sync | none (sync from the source origin) | **dead on target (404)** |
| 5 | d-first-party-data-file-get-libs-granite-csrf-token-json | D | first-party data file GET /libs/granite/csrf/token.json | 6/6 (reach 26/26) | data-fed | self | pending | sheet-sync | none (sync from the source origin) | **dead on target (404)** |
| 6 | d-first-party-data-file-get-libs-granite-security-currentuse | D | first-party data file GET /libs/granite/security/currentuser.json | 6/6 (reach 26/26) | data-fed | self | pending | sheet-sync | none (sync from the source origin) | **dead on target (404)** |
| 7 | d-first-party-data-file-get-content-wknd-us-en-about-us-jcr- | D | first-party data file GET /content/wknd/us/en/about-us/_jcr_content/contexthub.pagedata.json | 1/6 (reach 1/26) | data-fed | self | pending | sheet-sync | none (sync from the source origin) | **dead on target (404)** |
| 8 | d-first-party-data-file-get-content-wknd-us-en-adventures-ba | D | first-party data file GET /content/wknd/us/en/adventures/bali-surf-camp/_jcr_content/contexthub.pagedata.json | 1/6 (reach 1/26) | data-fed | self | pending | sheet-sync | none (sync from the source origin) | **dead on target (404)** |
| 9 | d-first-party-data-file-get-content-wknd-us-en-adventures-jc | D | first-party data file GET /content/wknd/us/en/adventures/_jcr_content/contexthub.pagedata.json | 1/6 (reach 1/26) | data-fed | self | pending | sheet-sync | none (sync from the source origin) | **dead on target (404)** |
| 10 | d-first-party-data-file-get-content-wknd-us-en-faqs-jcr-cont | D | first-party data file GET /content/wknd/us/en/faqs/_jcr_content/contexthub.pagedata.json | 1/6 (reach 1/26) | data-fed | self | pending | sheet-sync | none (sync from the source origin) | **dead on target (404)** |
| 11 | d-first-party-data-file-get-content-wknd-us-en-jcr-content-c | D | first-party data file GET /content/wknd/us/en/_jcr_content/contexthub.pagedata.json | 1/6 (reach 1/26) | data-fed | self | pending | sheet-sync | none (sync from the source origin) | **dead on target (404)** |
| 12 | d-first-party-data-file-get-content-wknd-us-en-magazine-arct | D | first-party data file GET /content/wknd/us/en/magazine/arctic-surfing/_jcr_content/contexthub.pagedata.json | 1/6 (reach 1/26) | data-fed | self | pending | sheet-sync | none (sync from the source origin) | **dead on target (404)** |
| 13 | f-form-cmp-search-form-origin-content-wknd-us-en-about-us-se | F | form "cmp-search__form" → origin /content/wknd/us/en/about-us.searchresults.json/_jcr_content/root/container/container_1195249223/search (1 fields) | 1/6 | rebuild-native | needs-backend | pending | forms | production endpoint; interim capture ships now |  |
| 14 | f-form-cmp-search-form-origin-content-wknd-us-en-adventures- | F | form "cmp-search__form" → origin /content/wknd/us/en/adventures/bali-surf-camp.searchresults.json/_jcr_content/root/container/container_1195249223/search (1 fields) | 1/6 | rebuild-native | needs-backend | pending | forms | production endpoint; interim capture ships now |  |
| 15 | f-form-cmp-search-form-origin-content-wknd-us-en-adventures- | F | form "cmp-search__form" → origin /content/wknd/us/en/adventures.searchresults.json/_jcr_content/root/container/container_1195249223/search (1 fields) | 1/6 | rebuild-native | needs-backend | pending | forms | production endpoint; interim capture ships now |  |
| 16 | f-form-cmp-search-form-origin-content-wknd-us-en-faqs-search | F | form "cmp-search__form" → origin /content/wknd/us/en/faqs.searchresults.json/_jcr_content/root/container/container_1195249223/search (1 fields) | 1/6 | rebuild-native | needs-backend | pending | forms | production endpoint; interim capture ships now |  |
| 17 | f-form-cmp-search-form-origin-content-wknd-us-en-searchresul | F | form "cmp-search__form" → origin /content/wknd/us/en.searchresults.json/_jcr_content/root/container/container_1195249223/search (1 fields) | 1/6 | rebuild-native | needs-backend | pending | forms | production endpoint; interim capture ships now |  |
| 18 | f-form-cmp-search-form-origin-content-wknd-us-en-magazine-ar | F | form "cmp-search__form" → origin /content/wknd/us/en/magazine/arctic-surfing.searchresults.json/_jcr_content/root/container/container_1195249223/search (1 fields) | 1/6 | rebuild-native | needs-backend | pending | forms | production endpoint; interim capture ships now |  |
| 19 | i18n-locale-variants-ca-ca-ch-ch-ch | I18N | locale variants ca,ca,ch,ch,ch | 6/6 | rebuild-native | needs-business-decision | pending | locale-tree | scope of the locale trees |  |
| 20 | l-listing-candidate-cmp-image-list-16-cards | L | listing candidate cmp-image-list (16 cards) | 1/6 | index-backed | needs-business-decision | pending | listing-index-backed | index-driven or editorially curated? |  |
| 21 | l-listing-candidate-cmp-image-list-6-cards | L | listing candidate cmp-image-list (6 cards) | 1/6 | index-backed | needs-business-decision | pending | listing-index-backed | index-driven or editorially curated? |  |
| 22 | l-listing-candidate-cmp-list-4-cards | L | listing candidate cmp-list (4 cards) | 1/6 | index-backed | needs-business-decision | pending | listing-index-backed | index-driven or editorially curated? |  |
| 23 | m-modal-trigger-data-modal-url-chrome-only-target-outside-do | M | modal trigger data-modal-url (chrome only) → target outside DOM at capture | 6/6 (reach 52/26) | rebuild-native | self | pending | chrome-interaction | none (motion-observe evidence) |  |
| 24 | t-tag-manager-adobe-launch | T | tag manager: Adobe Launch | 6/6 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 25 | t-analytics-adobe-analytics-experience-cloud-id | T | analytics: Adobe Analytics / Experience Cloud ID | 6/6 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 26 | t-marketing-ad-retargeting-pixel | T | marketing: ad / retargeting pixel | 6/6 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 27 | t-unknown-third-party-host-wkndsitewknd887971p-112-2o7-net | T | unknown third-party host wkndsitewknd887971p.112.2o7.net | 6/6 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 28 | x-sign-in-account-links | X | sign-in / account links | 6/6 | decided-out | needs-backend | pending | decided-out | auth / commerce on the new host? |  |

## Triage

- **Ships autonomously (reproducibility `self`):** 13 row(s) — read-settings, sheet-sync, chrome-interaction.
- **One owner decision batch:** 14 row(s) — production endpoint; interim capture ships now · scope of the locale trees · index-driven or editorially curated? · which tags run on the new host; property ids.
- **Already delivered by the capture pipeline:** 0 row(s) — no work.
- **Host-bound on the target:** 9 of 9 probed API paths — the off-origin data work.

## Phases

- **data** — 9
- **forms** — 6
- **tags** — 4
- **detect** — 3
- **listings** — 3
- **locale wave** — 1
- **interactive** — 1
- **register** — 1
