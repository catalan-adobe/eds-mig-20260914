# WKND to Edge Delivery: migration report

Branch `f52-1011-02`, measured at commit `bbf644afbce770a3bf0649ce26f4d235f327a475`.
Source: https://wknd.site. Target: https://f52-1011-02--eds-mig-20260914--catalan-adobe.aem.page/f52-1011-02/us/en

## What was migrated

- 65 pages, all under the DA folder `/f52-1011-02` (org `catalan-adobe`, repo
  `eds-mig-20260914`). By source template: 15 landing, 6 content, 32 adventure, 12 article.
- All 65 pages answer HTTP 200 on the branch preview.
- Content is produced by the importer in `.migration/import/` and is previewed only, not
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
| `cards` | Image lists and teaser grids, including the `secure` members-only variant |
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

Tool: `.migration/tools/compare.mjs --all`, full-page screenshots, fuzz 6%, source against the
branch preview. Widths 1440 and 375. Width 768 was not measured in this final run.
No page failed to capture.

| Width | Median | Mean | Max | Pages at or below 1% |
|---|---:|---:|---:|---:|
| 1440 | 0.03% | 0.12% | 3.34% | 64 of 65 |
| 375 | 0.92% | 1.22% | 5.35% | 38 of 65 |

| Page | 1440 diff % | 1440 height src/tgt | 375 diff % | 375 height src/tgt |
|---|---:|---|---:|---|
| /ca/en.html | 0.05 | 3758/3758 | 0.92 | 5766/5765 |
| /ca/en/about-us.html | 0.03 | 1632/1632 | 0.01 | 3724/3723 |
| /ca/en/adventures.html | 0.21 | 2798/2798 | 1.8 | 6534/6533 |
| /ca/en/adventures/bali-surf-camp.html | 0.03 | 2006/2006 | 0.99 | 2685/2685 |
| /ca/en/adventures/beervana-portland.html | 0.04 | 2455/2455 | 0.05 | 3090/3089 |
| /ca/en/adventures/climbing-new-zealand.html | 0.15 | 3058/3058 | 1.79 | 3796/3796 |
| /ca/en/adventures/colorado-rock-climbing.html | 0.08 | 1993/1993 | 0.55 | 2777/2776 |
| /ca/en/adventures/cycling-southern-utah.html | 0.05 | 1966/1966 | 0.92 | 2770/2770 |
| /ca/en/adventures/cycling-tuscany.html | 0.07 | 2087/2087 | 0.5 | 2685/2684 |
| /ca/en/adventures/downhill-skiing-wyoming.html | 0.03 | 2142/2142 | 0.23 | 2907/2906 |
| /ca/en/adventures/gastronomic-marais-tour.html | 0.07 | 1966/1966 | 1.64 | 2680/2680 |
| /ca/en/adventures/napa-wine-tasting.html | 0.02 | 2042/2042 | 0.41 | 2757/2756 |
| /ca/en/adventures/riverside-camping-australia.html | 0.06 | 1993/1993 | 1.43 | 2536/2536 |
| /ca/en/adventures/ski-touring-mont-blanc.html | 0.21 | 2622/2622 | 1.03 | 2920/2920 |
| /ca/en/adventures/surf-camp-costa-rica.html | 0.06 | 2027/2027 | 0.06 | 2811/2810 |
| /ca/en/adventures/tahoe-skiing.html | 0.02 | 2011/2011 | 1.39 | 2734/2734 |
| /ca/en/adventures/west-coast-cycling.html | 0.22 | 1948/1948 | 1.16 | 2688/2688 |
| /ca/en/adventures/whistler-mountain-biking.html | 0.4 | 2717/2718 | 1.93 | 3077/3078 |
| /ca/en/adventures/yosemite-backpacking.html | 0.05 | 2056/2056 | 0.33 | 2991/2990 |
| /ca/en/faqs.html | 0 | 1701/1701 | 0.45 | 2052/2051 |
| /ca/en/magazine.html | 3.34 | 2563/2535 | 5.35 | 4424/4381 |
| /ca/en/magazine/arctic-surfing.html | 0 | 6271/6271 | 3.68 | 8893/8894 |
| /ca/en/magazine/guide-la-skateparks.html | 0 | 4836/4836 | 2.7 | 6849/6850 |
| /ca/en/magazine/members-only.html | 0.01 | 940/940 | 0.04 | 1507/1506 |
| /ca/en/magazine/members-only/alaskan-adventure.html | 0 | 6291/6291 | 2.88 | 8074/8075 |
| /ca/en/magazine/members-only/fly-fishing-the-amazon.html | 0 | 6577/6577 | 2.09 | 9723/9723 |
| /ca/en/magazine/san-diego-surf.html | 0.19 | 5552/5553 | 2.79 | 6198/6199 |
| /ca/en/magazine/ski-touring.html | 0 | 5913/5913 | 3.52 | 7306/7307 |
| /ca/en/magazine/western-australia.html | 0.01 | 6565/6565 | 2.83 | 9637/9638 |
| /ca/fr.html | 0.02 | 1278/1278 | 0.13 | 1157/1156 |
| /ch/de.html | 0.02 | 1278/1278 | 0.13 | 1157/1156 |
| /ch/fr.html | 0.02 | 1278/1278 | 0.13 | 1157/1156 |
| /ch/it.html | 0.02 | 1278/1278 | 0.13 | 1157/1156 |
| /de/de.html | 0.02 | 1278/1278 | 0.13 | 1157/1156 |
| /es/es.html | 0.02 | 1278/1278 | 0.13 | 1157/1156 |
| /fr/fr.html | 0.02 | 1278/1278 | 0.13 | 1157/1156 |
| /it/it.html | 0.02 | 1278/1278 | 0.13 | 1157/1156 |
| /us/en.html | 0.05 | 3729/3729 | 1.11 | 5722/5722 |
| /us/en/about-us.html | 0.03 | 1604/1604 | 0.01 | 3680/3679 |
| /us/en/adventures.html | 0.11 | 2769/2769 | 1.97 | 6490/6490 |
| /us/en/adventures/bali-surf-camp.html | 0.03 | 1978/1978 | 0.47 | 2642/2641 |
| /us/en/adventures/beervana-portland.html | 0.04 | 2426/2426 | 0.05 | 3047/3046 |
| /us/en/adventures/climbing-new-zealand.html | 0.15 | 3030/3030 | 1.71 | 3752/3752 |
| /us/en/adventures/colorado-rock-climbing.html | 0.08 | 1965/1965 | 0.94 | 2733/2733 |
| /us/en/adventures/cycling-southern-utah.html | 0.05 | 1937/1937 | 0.41 | 2727/2726 |
| /us/en/adventures/cycling-tuscany.html | 0.07 | 2059/2059 | 0.9 | 2641/2641 |
| /us/en/adventures/downhill-skiing-wyoming.html | 0.03 | 2113/2113 | 0.61 | 2863/2863 |
| /us/en/adventures/gastronomic-marais-tour.html | 0.08 | 1937/1937 | 1.13 | 2637/2636 |
| /us/en/adventures/napa-wine-tasting.html | 0.02 | 2014/2014 | 0.81 | 2713/2713 |
| /us/en/adventures/riverside-camping-australia.html | 0.06 | 1964/1964 | 0.89 | 2493/2492 |
| /us/en/adventures/ski-touring-mont-blanc.html | 0.34 | 2593/2594 | 0.92 | 2876/2876 |
| /us/en/adventures/surf-camp-costa-rica.html | 0.07 | 1998/1998 | 0.06 | 2768/2767 |
| /us/en/adventures/tahoe-skiing.html | 0.02 | 1982/1982 | 0.89 | 2691/2690 |
| /us/en/adventures/west-coast-cycling.html | 0.4 | 1919/1920 | 0.65 | 2645/2644 |
| /us/en/adventures/whistler-mountain-biking.html | 0.24 | 2689/2689 | 1.69 | 3034/3034 |
| /us/en/adventures/yosemite-backpacking.html | 0.05 | 2027/2027 | 0.7 | 2947/2947 |
| /us/en/ai-powered-search.html | 0 | 900/900 | 0 | 900/900 |
| /us/en/faqs.html | 0 | 1672/1672 | 0.98 | 2008/2008 |
| /us/en/magazine.html | 0.27 | 2506/2506 | 2.32 | 4325/4337 |
| /us/en/magazine/arctic-surfing.html | 0 | 6242/6242 | 3.66 | 8849/8850 |
| /us/en/magazine/guide-la-skateparks.html | 0 | 4807/4807 | 2.66 | 6806/6807 |
| /us/en/magazine/san-diego-surf.html | 0.11 | 5524/5524 | 2.74 | 6155/6156 |
| /us/en/magazine/ski-touring.html | 0 | 5884/5884 | 3.53 | 7262/7264 |
| /us/en/magazine/western-australia.html | 0.01 | 6537/6537 | 2.8 | 9594/9595 |
| /us/es.html | 0.02 | 1278/1278 | 0.13 | 1157/1156 |

## Differences that remain

### Seen in the final measurement

1. `/ca/en/magazine` (3.34% at 1440, 5.35% at 375; page 28px and 43px shorter). The two
   "Read More" links in the Members Only section (`cards secure`) are unstyled. The source
   shows a yellow 141x49 button in a grey 169x63 container; the target shows a grey 97x35 box.
   The links themselves are authored. `blocks/cards/cards.css` has no rule for
   `.cards.secure .cards-card-action a`. Not fixed.
2. `/us/en/magazine` at 375 (2.32%, page 12px taller). In the band at 3200px the "Read More"
   box of a card sits 13px lower on the target than on the source; everything below is
   shifted by that amount. Cause not investigated.
3. Article pages at 375 (2.09% to 3.68%, 12 pages). Text and images are the same, but the
   content sits 1px lower on the target from the first band on, so justified body text
   differs along glyph edges for the whole page. Page height differs by 0 to 2px.
   Cause not investigated. At 1440 the same pages are at 0% to 0.19%.
4. Adventure pages, home and adventures landing at 375 (0.05% to 1.97%). On
   `/us/en/adventures` the card list sits 1px lower on the target. Other pages of this
   group were not inspected band by band.
5. `/us/en/ai-powered-search` reads 0% with height 900/900 because both sides show only the
   empty search form. The compare tool does not run a query.

### Accepted in QA

6. Hero description alignment on `/us/en/adventures` and `/ca/en/adventures`: justified on
   the source, left-aligned on the target. The source justifies a hero description only when
   the author wrapped it in `<p>` (4 of 10 hero teasers). The EDS content delivers every
   description as `<p>`, so the block cannot tell them apart. Justifying all of them makes
   the home page worse than it makes the adventures page better. A fix needs a marker in the
   content model.
7. AI-powered search. The source search endpoints answer 204 without CORS headers to any
   origin except localhost, so the block uses `/f52-1011-02/search-index.json`. Result:
   no generative answer card, keyword order instead of semantic order, a query without a
   match shows nothing, and the "Show AI-generated summary" toggle has no effect.
   Checked on the branch preview with the query "surf": 8 results, no request to wknd.site,
   no console error.
8. Sign-in dialog submit (every page). The source posts to
   `/system/sling/login/j_security_check` and lands on `/us/en/errors/sign-in.html`. That
   page is not among the 65 inventory pages and is 404 on the target. The target sends
   nothing, keeps the dialog open and marks the inputs as errors, as CONTRACT.md specifies.
   The sentence in CONTRACT.md that the source "answers 401" is wrong.

### Not verified in this final run

- Width 768.
- Interactions (carousel, tabs, accordion, menu, language switcher, adventure filter). They
  were reviewed in the QA rounds, not re-run here.
- Links and metadata were not re-audited here.
