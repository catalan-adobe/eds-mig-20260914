<!-- stardust provenance: skill=stardust:dynamics · phase=plan draft · 2026-09-24T07:38:30.828Z · input stardust/current/_dynamics.json (9 pages, 34 findings) -->
# Dynamic features — draft inventory (curate into `stardust/dynamic-features.md`)

One row per detected finding. Merge duplicates, drop noise, keep every axis honest. Columns: disposition = what we do · reproducibility = what it needs · status = where it stands (reference/triage.md).

| # | id | class | feature | pages | disposition | reproducibility | status | pattern | decision needed | notes |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | a-cms-app-settings-object-adobedatalayer | A | CMS / app settings object adobeDataLayer | 9/9 | static-snapshot | self | pending | read-settings | — (keys name endpoints, ids, vendors) |  |
| 2 | a-cms-app-settings-object-granite | A | CMS / app settings object Granite | 9/9 | static-snapshot | self | pending | read-settings | — (keys name endpoints, ids, vendors) |  |
| 3 | a-cms-app-settings-object-cq | A | CMS / app settings object CQ | 9/9 | static-snapshot | self | pending | read-settings | — (keys name endpoints, ids, vendors) |  |
| 4 | d-first-party-data-file-get-home-users-o-oa6pkcc2rneodh2ni0q | D | first-party data file GET /home/users/o/oa6PkCC2rneOdh2ni0qG.infinity.json | 9/9 (reach 64/64) | data-fed | self | pending | sheet-sync | none (sync from the source origin) |  |
| 5 | d-first-party-data-file-get-libs-granite-csrf-token-json | D | first-party data file GET /libs/granite/csrf/token.json | 9/9 (reach 64/64) | data-fed | self | pending | sheet-sync | none (sync from the source origin) |  |
| 6 | d-first-party-data-file-get-libs-granite-security-currentuse | D | first-party data file GET /libs/granite/security/currentuser.json | 9/9 (reach 64/64) | data-fed | self | pending | sheet-sync | none (sync from the source origin) |  |
| 7 | d-first-party-data-file-get-content-wknd-ca-en-about-us-jcr- | D | first-party data file GET /content/wknd/ca/en/about-us/_jcr_content/contexthub.pagedata.json | 1/9 (reach 1/64) | data-fed | self | pending | sheet-sync | none (sync from the source origin) |  |
| 8 | d-first-party-data-file-get-content-wknd-ca-en-adventures-ba | D | first-party data file GET /content/wknd/ca/en/adventures/bali-surf-camp/_jcr_content/contexthub.pagedata.json | 1/9 (reach 1/64) | data-fed | self | pending | sheet-sync | none (sync from the source origin) |  |
| 9 | d-first-party-data-file-get-content-wknd-ca-en-adventures-jc | D | first-party data file GET /content/wknd/ca/en/adventures/_jcr_content/contexthub.pagedata.json | 1/9 (reach 1/64) | data-fed | self | pending | sheet-sync | none (sync from the source origin) |  |
| 10 | d-first-party-data-file-get-content-wknd-ca-en-faqs-jcr-cont | D | first-party data file GET /content/wknd/ca/en/faqs/_jcr_content/contexthub.pagedata.json | 1/9 (reach 1/64) | data-fed | self | pending | sheet-sync | none (sync from the source origin) |  |
| 11 | d-first-party-data-file-get-content-wknd-ca-en-jcr-content-c | D | first-party data file GET /content/wknd/ca/en/_jcr_content/contexthub.pagedata.json | 1/9 (reach 1/64) | data-fed | self | pending | sheet-sync | none (sync from the source origin) |  |
| 12 | d-first-party-data-file-get-content-wknd-ca-en-magazine-arct | D | first-party data file GET /content/wknd/ca/en/magazine/arctic-surfing/_jcr_content/contexthub.pagedata.json | 1/9 (reach 1/64) | data-fed | self | pending | sheet-sync | none (sync from the source origin) |  |
| 13 | d-first-party-data-file-get-content-wknd-ca-en-magazine-jcr- | D | first-party data file GET /content/wknd/ca/en/magazine/_jcr_content/contexthub.pagedata.json | 1/9 (reach 1/64) | data-fed | self | pending | sheet-sync | none (sync from the source origin) |  |
| 14 | d-first-party-data-file-get-content-wknd-ca-en-magazine-memb | D | first-party data file GET /content/wknd/ca/en/magazine/members-only/_jcr_content/contexthub.pagedata.json | 1/9 (reach 1/64) | data-fed | self | pending | sheet-sync | none (sync from the source origin) |  |
| 15 | d-first-party-data-file-get-content-wknd-ca-fr-jcr-content-c | D | first-party data file GET /content/wknd/ca/fr/_jcr_content/contexthub.pagedata.json | 1/9 (reach 1/64) | data-fed | self | pending | sheet-sync | none (sync from the source origin) |  |
| 16 | f-form-cmp-search-form-origin-content-wknd-ca-en-about-us-se | F | form "cmp-search__form" → origin /content/wknd/ca/en/about-us.searchresults.json/_jcr_content/root/container/container_1195249223/search (1 fields) | 1/9 | rebuild-native | needs-backend | pending | forms | production endpoint; interim capture ships now |  |
| 17 | f-form-cmp-search-form-origin-content-wknd-ca-en-adventures- | F | form "cmp-search__form" → origin /content/wknd/ca/en/adventures/bali-surf-camp.searchresults.json/_jcr_content/root/container/container_1195249223/search (1 fields) | 1/9 | rebuild-native | needs-backend | pending | forms | production endpoint; interim capture ships now |  |
| 18 | f-form-cmp-search-form-origin-content-wknd-ca-en-adventures- | F | form "cmp-search__form" → origin /content/wknd/ca/en/adventures.searchresults.json/_jcr_content/root/container/container_1195249223/search (1 fields) | 1/9 | rebuild-native | needs-backend | pending | forms | production endpoint; interim capture ships now |  |
| 19 | f-form-cmp-search-form-origin-content-wknd-ca-en-faqs-search | F | form "cmp-search__form" → origin /content/wknd/ca/en/faqs.searchresults.json/_jcr_content/root/container/container_1195249223/search (1 fields) | 1/9 | rebuild-native | needs-backend | pending | forms | production endpoint; interim capture ships now |  |
| 20 | f-form-cmp-search-form-origin-content-wknd-ca-en-searchresul | F | form "cmp-search__form" → origin /content/wknd/ca/en.searchresults.json/_jcr_content/root/container/container_1195249223/search (1 fields) | 1/9 | rebuild-native | needs-backend | pending | forms | production endpoint; interim capture ships now |  |
| 21 | f-form-cmp-search-form-origin-content-wknd-ca-en-magazine-ar | F | form "cmp-search__form" → origin /content/wknd/ca/en/magazine/arctic-surfing.searchresults.json/_jcr_content/root/container/container_1195249223/search (1 fields) | 1/9 | rebuild-native | needs-backend | pending | forms | production endpoint; interim capture ships now |  |
| 22 | f-form-cmp-search-form-origin-content-wknd-ca-en-magazine-se | F | form "cmp-search__form" → origin /content/wknd/ca/en/magazine.searchresults.json/_jcr_content/root/container/container_1195249223/search (1 fields) | 1/9 | rebuild-native | needs-backend | pending | forms | production endpoint; interim capture ships now |  |
| 23 | f-form-cmp-search-form-origin-content-wknd-ca-en-magazine-me | F | form "cmp-search__form" → origin /content/wknd/ca/en/magazine/members-only.searchresults.json/_jcr_content/root/container/container_1195249223/search (1 fields) | 1/9 | rebuild-native | needs-backend | pending | forms | production endpoint; interim capture ships now |  |
| 24 | f-form-cmp-search-form-origin-content-wknd-ca-fr-searchresul | F | form "cmp-search__form" → origin /content/wknd/ca/fr.searchresults.json/_jcr_content/root/container/container_1195249223/search (1 fields) | 1/9 | rebuild-native | needs-backend | pending | forms | production endpoint; interim capture ships now |  |
| 25 | i18n-locale-variants-us-us-ch-ch-ch | I18N | locale variants us,us,ch,ch,ch | 9/9 | rebuild-native | needs-business-decision | pending | locale-tree | scope of the locale trees |  |
| 26 | l-listing-candidate-cmp-image-list-16-cards | L | listing candidate cmp-image-list (16 cards) | 1/9 | index-backed | needs-business-decision | pending | listing-index-backed | index-driven or editorially curated? |  |
| 27 | l-listing-candidate-cmp-image-list-6-cards | L | listing candidate cmp-image-list (6 cards) | 1/9 | index-backed | needs-business-decision | pending | listing-index-backed | index-driven or editorially curated? |  |
| 28 | l-listing-candidate-cmp-list-4-cards | L | listing candidate cmp-list (4 cards) | 1/9 | index-backed | needs-business-decision | pending | listing-index-backed | index-driven or editorially curated? |  |
| 29 | m-modal-trigger-data-modal-url-chrome-only-target-outside-do | M | modal trigger data-modal-url (chrome only) → target outside DOM at capture | 9/9 (reach 128/64) | rebuild-native | self | pending | chrome-interaction | none (motion-observe evidence) |  |
| 30 | t-tag-manager-adobe-launch | T | tag manager: Adobe Launch | 9/9 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 31 | t-analytics-adobe-analytics-experience-cloud-id | T | analytics: Adobe Analytics / Experience Cloud ID | 9/9 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 32 | t-marketing-ad-retargeting-pixel | T | marketing: ad / retargeting pixel | 9/9 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 33 | t-unknown-third-party-host-wkndsitewknd887971p-112-2o7-net | T | unknown third-party host wkndsitewknd887971p.112.2o7.net | 9/9 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 34 | x-sign-in-account-links | X | sign-in / account links | 9/9 | decided-out | needs-backend | pending | decided-out | auth / commerce on the new host? |  |

## Triage

- **Ships autonomously (reproducibility `self`):** 16 row(s) — read-settings, sheet-sync, chrome-interaction.
- **One owner decision batch:** 17 row(s) — production endpoint; interim capture ships now · scope of the locale trees · index-driven or editorially curated? · which tags run on the new host; property ids.
- **Already delivered by the capture pipeline:** 0 row(s) — no work.
- **Host-bound on the target:** 0 of 0 probed API paths — the off-origin data work.

## Phases

- **data** — 12
- **forms** — 9
- **tags** — 4
- **detect** — 3
- **listings** — 3
- **locale wave** — 1
- **interactive** — 1
- **register** — 1
