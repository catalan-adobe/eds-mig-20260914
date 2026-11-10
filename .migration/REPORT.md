# WKND to Edge Delivery: migration report

Branch `f52-1011-02`, measured at commit `2d8f39e3a6c48cfaaeff74ee9995372f9a139d4d`.
Source: https://wknd.site. Target: https://f52-1011-02--eds-mig-20260914--catalan-adobe.aem.page/f52-1011-02/us/en

## What was migrated

- 65 pages, all under the DA folder `/f52-1011-02` (org `catalan-adobe`, repo
  `eds-mig-20260914`). By source template: 15 landing, 6 content, 32 adventure, 12 article.
- All 65 pages answer HTTP 200 on the branch preview.
- The importer in `.migration/import/` produces the content. It is previewed only, not
  published to live.
- Global styles, self-hosted fonts and icons ported from the source `clientlib-site.min.css`.
- The content model, design tokens and decided gaps are in `.migration/CONTRACT.md`.

## Blocks

| Block | Purpose |
|---|---|
| `header` | Top bar with sign-in dialog, language switcher, logo, navigation, search field |
| `footer` | Logo, navigation, social links, legal text |
| `hero` | Hero teaser, also the home page carousel |
| `teaser` | Image with title, text and call to action |
| `cards` | Image lists, teaser grids and the `secure` members-only variant |
| `tabs` | Tabbed content on adventure pages and the adventures filter |
| `accordion` | FAQ items |
| `quote` | Pull quote on articles |
| `adventure-details` | Adventure facts list |
| `contributor` | Author and contributor cards, article byline |
| `download` | File download with properties |
| `up-next` | "Up next" article links |
| `search` | AI-powered search page, backed by a local index |
| `columns` | Side-by-side content |
| `separator` | Horizontal rule |
| `fragment` | Boilerplate fragment loader, unchanged |

## Final measurement

Tool: `.migration/tools/compare.mjs --all`, full-page screenshots, fuzz 6%. It compares the
source with the branch preview at widths 1440, 768 and 375. Measured at commit
`2d8f39e3a6c48cfaaeff74ee9995372f9a139d4d`. No page failed to capture.

The three widths ran at the same time. Two values did not repeat in a single run, and the
table holds the single-run value. They are `/ca/en` at 375 (6.93% in the shared run) and
`/us/en/adventures` at 1440 (0.33% in the shared run).

| Width | Median | Mean | Max | Pages at or below 0.5% | Pages at or below 1% |
|---|---:|---:|---:|---:|---:|
| 1440 | 0.03% | 0.07% | 0.4% | 65 of 65 | 65 of 65 |
| 768 | 0.19% | 0.42% | 2.49% | 47 of 65 | 59 of 65 |
| 375 | 0.89% | 1.10% | 3.68% | 26 of 65 | 40 of 65 |

| Page | 1440 diff % | 1440 height src/tgt | 768 diff % | 768 height src/tgt | 375 diff % | 375 height src/tgt |
|---|---:|---|---:|---|---:|---|
| /ca/en.html | 0.05 | 3758/3758 | 0.11 | 4633/4633 | 0.92 | 5766/5766 |
| /ca/en/about-us.html | 0.03 | 1632/1632 | 0.03 | 2530/2530 | 0.01 | 3724/3724 |
| /ca/en/adventures.html | 0.11 | 2798/2798 | 0.17 | 4079/4079 | 1.8 | 6534/6534 |
| /ca/en/adventures/bali-surf-camp.html | 0.03 | 2006/2006 | 0.3 | 2359/2359 | 0.99 | 2685/2686 |
| /ca/en/adventures/beervana-portland.html | 0.04 | 2455/2455 | 0.07 | 2796/2796 | 0.05 | 3090/3090 |
| /ca/en/adventures/climbing-new-zealand.html | 0.15 | 3058/3058 | 0.33 | 3310/3310 | 1.79 | 3796/3797 |
| /ca/en/adventures/colorado-rock-climbing.html | 0.08 | 1993/1993 | 0.63 | 2346/2346 | 0.55 | 2777/2777 |
| /ca/en/adventures/cycling-southern-utah.html | 0.05 | 1966/1966 | 0.7 | 2363/2364 | 0.92 | 2770/2771 |
| /ca/en/adventures/cycling-tuscany.html | 0.07 | 2087/2087 | 0.29 | 2428/2428 | 0.5 | 2685/2685 |
| /ca/en/adventures/downhill-skiing-wyoming.html | 0.03 | 2142/2142 | 0.19 | 2482/2482 | 0.24 | 2907/2907 |
| /ca/en/adventures/gastronomic-marais-tour.html | 0.07 | 1966/1966 | 0.92 | 2318/2319 | 1.62 | 2680/2681 |
| /ca/en/adventures/napa-wine-tasting.html | 0.02 | 2042/2042 | 0.3 | 2440/2440 | 0.41 | 2757/2757 |
| /ca/en/adventures/riverside-camping-australia.html | 0.06 | 1993/1993 | 0.05 | 2333/2333 | 1.43 | 2536/2537 |
| /ca/en/adventures/ski-touring-mont-blanc.html | 0.21 | 2622/2622 | 0.3 | 2874/2874 | 1.03 | 2920/2921 |
| /ca/en/adventures/surf-camp-costa-rica.html | 0.07 | 2027/2027 | 0.07 | 2381/2381 | 0.06 | 2811/2811 |
| /ca/en/adventures/tahoe-skiing.html | 0.02 | 2011/2011 | 0.85 | 2363/2364 | 1.39 | 2734/2735 |
| /ca/en/adventures/west-coast-cycling.html | 0.22 | 1948/1948 | 0.07 | 2301/2301 | 1.16 | 2688/2689 |
| /ca/en/adventures/whistler-mountain-biking.html | 0.4 | 2717/2718 | 1.46 | 2923/2924 | 1.93 | 3077/3079 |
| /ca/en/adventures/yosemite-backpacking.html | 0.05 | 2056/2056 | 1 | 2408/2409 | 0.34 | 2991/2991 |
| /ca/en/faqs.html | 0 | 1701/1701 | 0.01 | 2002/2002 | 0.45 | 2052/2052 |
| /ca/en/magazine.html | 0.04 | 2563/2563 | 0.04 | 3192/3192 | 0.08 | 4424/4424 |
| /ca/en/magazine/arctic-surfing.html | 0 | 6271/6271 | 2.49 | 7012/7014 | 3.68 | 8893/8895 |
| /ca/en/magazine/guide-la-skateparks.html | 0 | 4836/4836 | 0.03 | 5748/5748 | 2.7 | 6849/6851 |
| /ca/en/magazine/members-only.html | 0.01 | 940/940 | 0 | 1114/1114 | 0.04 | 1507/1507 |
| /ca/en/magazine/members-only/alaskan-adventure.html | 0 | 6291/6291 | 0.58 | 6984/6984 | 2.88 | 8074/8076 |
| /ca/en/magazine/members-only/fly-fishing-the-amazon.html | 0 | 6577/6577 | 0.26 | 7276/7276 | 2.09 | 9723/9724 |
| /ca/en/magazine/san-diego-surf.html | 0.19 | 5552/5553 | 1.73 | 6434/6436 | 2.79 | 6198/6200 |
| /ca/en/magazine/ski-touring.html | 0 | 5913/5913 | 0.44 | 6586/6587 | 3.52 | 7306/7308 |
| /ca/en/magazine/western-australia.html | 0.01 | 6565/6565 | 0.26 | 7411/7412 | 2.83 | 9637/9639 |
| /ca/fr.html | 0.02 | 1278/1278 | 0.09 | 1171/1171 | 0.13 | 1157/1157 |
| /ch/de.html | 0.02 | 1278/1278 | 0.09 | 1171/1171 | 0.13 | 1157/1157 |
| /ch/fr.html | 0.02 | 1278/1278 | 0.09 | 1171/1171 | 0.13 | 1157/1157 |
| /ch/it.html | 0.02 | 1278/1278 | 0.09 | 1171/1171 | 0.13 | 1157/1157 |
| /de/de.html | 0.02 | 1278/1278 | 0.09 | 1171/1171 | 0.13 | 1157/1157 |
| /es/es.html | 0.02 | 1278/1278 | 0.09 | 1171/1171 | 0.13 | 1157/1157 |
| /fr/fr.html | 0.02 | 1278/1278 | 0.09 | 1171/1171 | 0.13 | 1157/1157 |
| /it/it.html | 0.02 | 1278/1278 | 0.09 | 1171/1171 | 0.13 | 1157/1157 |
| /us/en.html | 0.05 | 3729/3729 | 0.11 | 4604/4604 | 1.11 | 5722/5723 |
| /us/en/about-us.html | 0.03 | 1604/1604 | 0.03 | 2502/2502 | 0.01 | 3680/3680 |
| /us/en/adventures.html | 0.11 | 2769/2769 | 0.18 | 4050/4050 | 1.97 | 6490/6491 |
| /us/en/adventures/bali-surf-camp.html | 0.03 | 1978/1978 | 0.57 | 2331/2330 | 0.48 | 2642/2642 |
| /us/en/adventures/beervana-portland.html | 0.04 | 2426/2426 | 0.07 | 2767/2767 | 0.05 | 3047/3047 |
| /us/en/adventures/climbing-new-zealand.html | 0.15 | 3030/3030 | 0.33 | 3282/3282 | 1.71 | 3752/3753 |
| /us/en/adventures/colorado-rock-climbing.html | 0.08 | 1965/1965 | 0.88 | 2317/2318 | 0.94 | 2733/2734 |
| /us/en/adventures/cycling-southern-utah.html | 0.05 | 1937/1937 | 0.39 | 2335/2335 | 0.41 | 2727/2727 |
| /us/en/adventures/cycling-tuscany.html | 0.07 | 2059/2059 | 0.3 | 2399/2399 | 0.9 | 2641/2642 |
| /us/en/adventures/downhill-skiing-wyoming.html | 0.03 | 2113/2113 | 0.42 | 2453/2454 | 0.61 | 2863/2864 |
| /us/en/adventures/gastronomic-marais-tour.html | 0.07 | 1937/1937 | 0.61 | 2290/2290 | 1.13 | 2637/2637 |
| /us/en/adventures/napa-wine-tasting.html | 0.02 | 2014/2014 | 0.53 | 2411/2412 | 0.81 | 2713/2714 |
| /us/en/adventures/riverside-camping-australia.html | 0.06 | 1964/1964 | 0.05 | 2305/2305 | 0.89 | 2493/2493 |
| /us/en/adventures/ski-touring-mont-blanc.html | 0.35 | 2593/2594 | 0.5 | 2845/2846 | 0.92 | 2876/2877 |
| /us/en/adventures/surf-camp-costa-rica.html | 0.07 | 1998/1998 | 0.09 | 2352/2352 | 0.06 | 2768/2768 |
| /us/en/adventures/tahoe-skiing.html | 0.02 | 1982/1982 | 0.55 | 2335/2335 | 0.89 | 2691/2691 |
| /us/en/adventures/west-coast-cycling.html | 0.4 | 1919/1920 | 0.07 | 2272/2272 | 0.65 | 2645/2645 |
| /us/en/adventures/whistler-mountain-biking.html | 0.24 | 2689/2689 | 1.42 | 2895/2896 | 1.68 | 3034/3035 |
| /us/en/adventures/yosemite-backpacking.html | 0.05 | 2027/2027 | 0.69 | 2380/2380 | 0.7 | 2947/2948 |
| /us/en/ai-powered-search.html | 0 | 900/900 | 0 | 900/900 | 0 | 900/900 |
| /us/en/faqs.html | 0 | 1672/1672 | 0.01 | 1973/1973 | 0.98 | 2008/2009 |
| /us/en/magazine.html | 0.04 | 2506/2506 | 0.04 | 3135/3135 | 0.08 | 4325/4325 |
| /us/en/magazine/arctic-surfing.html | 0 | 6242/6242 | 2.47 | 6984/6986 | 3.66 | 8849/8851 |
| /us/en/magazine/guide-la-skateparks.html | 0 | 4807/4807 | 0.03 | 5720/5720 | 2.66 | 6806/6808 |
| /us/en/magazine/san-diego-surf.html | 0.11 | 5524/5524 | 1.71 | 6405/6407 | 2.74 | 6155/6157 |
| /us/en/magazine/ski-touring.html | 0 | 5884/5884 | 0.41 | 6557/6558 | 3.53 | 7262/7265 |
| /us/en/magazine/western-australia.html | 0.01 | 6537/6537 | 0.17 | 7383/7383 | 2.8 | 9594/9596 |
| /us/es.html | 0.02 | 1278/1278 | 0.09 | 1171/1171 | 0.13 | 1157/1157 |

## Differences that remain

### Seen in the final measurement

1. Pages with pictures in the text flow differ below desktop.
   - The 12 article pages: 2.09% to 3.68% at 375, 0.03% to 2.49% at 768.
   - The 32 adventure pages: up to 1.93% at 375, up to 1.46% at 768.
   - Text, sizes and margins are the same on both sides. The cause is the height of each
     picture.
   - At 375 the source loads a 400x266 rendition, shown 230.75px tall. AEM rounded its
     height down.
   - The target loads a 750x500 rendition, shown 231.33px tall.
   - Each picture adds about 0.6px. The text below sits 1 to 3px lower, and justified text
     differs along glyph edges.
   - The trace covers `/us/en/magazine/arctic-surfing` at 375 only. The other pages show the
     same height pattern.
   - Not fixed. A match means copying the rounding of the AEM renditions in code.
2. Page height differs by 1 to 3px on 32 of 65 pages at 375. At 768 it differs on 18 of 65.
   The reason is in item 1. At 1440 it differs by 1px on 4 pages.
3. `/us/en/ai-powered-search` reads 0% with height 900/900 because both sides show only the
   empty search form. The compare tool does not run a query.

### Accepted in QA

4. Hero description alignment on `/us/en/adventures` and `/ca/en/adventures`: justified on
   the source, left-aligned on the target. The source justifies a hero description only when
   the author wrapped it in `<p>` (4 of 10 hero teasers). The EDS content delivers every
   description as `<p>`, so the block cannot tell them apart. Justifying all of them makes
   the home page worse than it makes the adventures page better. A fix needs a marker in the
   content model.
5. AI-powered search. The source search endpoints answer 204 without CORS headers to any
   origin except localhost. The block uses `/f52-1011-02/search-index.json` instead. Result:
   no generative answer card, and keyword order instead of semantic order. A query without a
   match shows nothing, and the "Show AI-generated summary" toggle has no effect.
   Checked on the branch preview with the query "surf": 8 results, no request to wknd.site,
   no console error.
6. Sign-in dialog submit (every page). The source posts to
   `/system/sling/login/j_security_check` and lands on `/us/en/errors/sign-in.html`. That
   page exists on the source, also under `/ca/en`. No page links to it, so the crawl did not
   find it. It is not among the 65 inventory pages and is 404 on the target. The target sends
   nothing, keeps the dialog open and marks the inputs as errors, as CONTRACT.md specifies.
   The sentence in CONTRACT.md that the source "answers 401" is wrong.

### Not verified in this final run

- Interactions (carousel, tabs, accordion, menu, language switcher, adventure filter). They
  were reviewed in the QA rounds, not re-run here.
- Links and metadata were not re-audited here.
