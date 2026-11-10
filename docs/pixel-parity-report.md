# Pixel parity report

The bar: same page height, and at most 0.5% of pixels differ at `-fuzz 6%`.
Gap is the migrated height minus the original height, in pixels.

## Groups

### 1440 px

| Group | Baseline (pass, median height gap) | Now (pass, median height gap) |
|---|---|---|
| stub | 0/9, gap 4 | 9/9, gap 0 |
| search | 0/1, gap 0 | 1/1, gap 0 |
| about | 0/2, gap 3 | 2/2, gap 0 |
| faqs | 0/2, gap 7.5 | 2/2, gap 0 |
| members | 0/1, gap 4 | 1/1, gap 0 |
| home | 0/2, gap 28 | 2/2, gap 0 |
| adventures | 0/2, gap 18 | 2/2, gap 0 |
| magazine | 0/2, gap 57 | 2/2, gap 0 |
| adventure | 0/32, gap 14 | 32/32, gap 0 |
| article | 0/12, gap 37.5 | 12/12, gap 0 |
| **all** | 0/65, gap 14 | 65/65, gap 0 |

### 390 px

| Group | Baseline (pass, median height gap) | Now (pass, median height gap) |
|---|---|---|
| stub | 0/9, gap 28 | 9/9, gap 0 |
| search | 0/1, gap 0 | 1/1, gap 0 |
| about | 0/2, gap 80 | 2/2, gap 0 |
| faqs | 0/2, gap 26 | 2/2, gap 0 |
| members | 0/1, gap 76 | 1/1, gap 0 |
| home | 0/2, gap 93.5 | 2/2, gap 0 |
| adventures | 0/2, gap 59.5 | 2/2, gap 0 |
| magazine | 0/2, gap 1 | 2/2, gap 0 |
| adventure | 0/32, gap 258 | 32/32, gap 0 |
| article | 0/12, gap 141.5 | 9/12, gap 0 |
| **all** | 0/65, gap 134 | 62/65, gap 0 |

## Pages

| Page | 1440 baseline | 1440 now | 390 baseline | 390 now |
|---|---|---|---|---|
| /ca/en | +28 px, 6.40% | 0 px, 0.10% PASS | -94 px, 12.23% | 0 px, 0.18% PASS |
| /ca/en/about-us | +3 px, 0.93% | 0 px, 0.18% PASS | -80 px, 3.38% | 0 px, 0.26% PASS |
| /ca/en/adventures | +18 px, 6.20% | 0 px, 0.24% PASS | -59 px, 11.29% | 0 px, 0.28% PASS |
| /ca/en/adventures/bali-surf-camp | -11 px, 4.99% | 0 px, 0.05% PASS | -345 px, 18.34% | 0 px, 0.17% PASS |
| /ca/en/adventures/beervana-portland | +21 px, 6.14% | 0 px, 0.02% PASS | -277 px, 20.49% | 0 px, 0.21% PASS |
| /ca/en/adventures/climbing-new-zealand | +14 px, 5.84% | 0 px, 0.02% PASS | -134 px, 13.82% | 0 px, 0.13% PASS |
| /ca/en/adventures/colorado-rock-climbing | -11 px, 5.26% | 0 px, 0.04% PASS | -239 px, 13.16% | 0 px, 0.21% PASS |
| /ca/en/adventures/cycling-southern-utah | -5 px, 3.87% | 0 px, 0.04% PASS | -338 px, 14.44% | 0 px, 0.30% PASS |
| /ca/en/adventures/cycling-tuscany | +22 px, 6.84% | 0 px, 0.03% PASS | -100 px, 11.96% | 0 px, 0.17% PASS |
| /ca/en/adventures/downhill-skiing-wyoming | +21 px, 5.99% | 0 px, 0.03% PASS | -154 px, 13.19% | 0 px, 0.14% PASS |
| /ca/en/adventures/gastronomic-marais-tour | -5 px, 4.91% | 0 px, 0.10% PASS | -338 px, 23.67% | 0 px, 0.42% PASS |
| /ca/en/adventures/napa-wine-tasting | +29 px, 6.35% | 0 px, 0.03% PASS | -363 px, 23.28% | 0 px, 0.21% PASS |
| /ca/en/adventures/riverside-camping-australia | +39 px, 7.64% | 0 px, 0.03% PASS | -81 px, 9.30% | 0 px, 0.17% PASS |
| /ca/en/adventures/ski-touring-mont-blanc | +32 px, 6.80% | 0 px, 0.02% PASS | -116 px, 13.10% | 0 px, 0.17% PASS |
| /ca/en/adventures/surf-camp-costa-rica | +21 px, 6.29% | 0 px, 0.11% PASS | -149 px, 12.29% | 0 px, 0.21% PASS |
| /ca/en/adventures/tahoe-skiing | -5 px, 4.05% | 0 px, 0.04% PASS | -338 px, 21.02% | 0 px, 0.19% PASS |
| /ca/en/adventures/west-coast-cycling | -12 px, 3.69% | 0 px, 0.04% PASS | -451 px, 23.52% | 0 px, 0.14% PASS |
| /ca/en/adventures/whistler-mountain-biking | +14 px, 6.14% | 0 px, 0.02% PASS | -187 px, 19.71% | 0 px, 0.18% PASS |
| /ca/en/adventures/yosemite-backpacking | -5 px, 3.95% | 0 px, 0.07% PASS | -445 px, 23.12% | 0 px, 0.14% PASS |
| /ca/en/faqs | -8 px, 2.87% | 0 px, 0.06% PASS | +26 px, 15.81% | 0 px, 0.24% PASS |
| /ca/en/magazine | +56 px, 4.26% | 0 px, 0.09% PASS | -2 px, 10.86% | 0 px, 0.19% PASS |
| /ca/en/magazine/arctic-surfing | -51 px, 5.82% | 0 px, 0.01% PASS | +313 px, 18.52% | 0 px, 0.24% PASS |
| /ca/en/magazine/guide-la-skateparks | -31 px, 4.73% | 0 px, 0.08% PASS | +142 px, 14.49% | 0 px, 0.48% PASS |
| /ca/en/magazine/members-only | +4 px, 2.58% | 0 px, 0.09% PASS | -76 px, 9.01% | 0 px, 0.20% PASS |
| /ca/en/magazine/members-only/alaskan-adventure | -45 px, 5.97% | 0 px, 0.01% PASS | +140 px, 15.40% | 0 px, 0.26% PASS |
| /ca/en/magazine/members-only/fly-fishing-the-amazon | -37 px, 6.25% | 0 px, 0.02% PASS | +416 px, 19.57% | -45 px, 4.81% |
| /ca/en/magazine/san-diego-surf | +16 px, 3.09% | 0 px, 0.01% PASS | +81 px, 14.60% | -1 px, 1.00% |
| /ca/en/magazine/ski-touring | -45 px, 5.51% | 0 px, 0.01% PASS | +95 px, 17.69% | 0 px, 0.29% PASS |
| /ca/en/magazine/western-australia | -37 px, 5.72% | 0 px, 0.06% PASS | +289 px, 18.50% | 0 px, 0.31% PASS |
| /ca/fr | +4 px, 0.69% | 0 px, 0.06% PASS | -28 px, 6.05% | 0 px, 0.32% PASS |
| /ch/de | +4 px, 0.68% | 0 px, 0.06% PASS | -28 px, 6.04% | 0 px, 0.32% PASS |
| /ch/fr | +4 px, 0.69% | 0 px, 0.06% PASS | -28 px, 6.04% | 0 px, 0.32% PASS |
| /ch/it | +4 px, 0.69% | 0 px, 0.06% PASS | -28 px, 6.04% | 0 px, 0.32% PASS |
| /de/de | +4 px, 0.69% | 0 px, 0.06% PASS | -28 px, 6.04% | 0 px, 0.32% PASS |
| /es/es | +4 px, 0.69% | 0 px, 0.06% PASS | -28 px, 6.05% | 0 px, 0.34% PASS |
| /fr/fr | +4 px, 0.69% | 0 px, 0.06% PASS | -28 px, 6.05% | 0 px, 0.32% PASS |
| /it/it | +4 px, 0.70% | 0 px, 0.06% PASS | -28 px, 6.05% | 0 px, 0.32% PASS |
| /us/en | +28 px, 6.39% | 0 px, 0.11% PASS | -93 px, 12.19% | 0 px, 0.19% PASS |
| /us/en/about-us | +3 px, 0.86% | 0 px, 0.18% PASS | -80 px, 3.28% | 0 px, 0.26% PASS |
| /us/en/adventures | +18 px, 6.18% | 0 px, 0.24% PASS | -60 px, 11.24% | 0 px, 0.28% PASS |
| /us/en/adventures/bali-surf-camp | -12 px, 4.93% | 0 px, 0.05% PASS | -345 px, 18.37% | 0 px, 0.18% PASS |
| /us/en/adventures/beervana-portland | +22 px, 6.13% | 0 px, 0.02% PASS | -277 px, 20.67% | 0 px, 0.21% PASS |
| /us/en/adventures/climbing-new-zealand | +14 px, 5.83% | 0 px, 0.02% PASS | -133 px, 13.76% | 0 px, 0.13% PASS |
| /us/en/adventures/colorado-rock-climbing | -12 px, 5.22% | 0 px, 0.04% PASS | -238 px, 13.17% | 0 px, 0.21% PASS |
| /us/en/adventures/cycling-southern-utah | -4 px, 3.82% | 0 px, 0.04% PASS | -338 px, 14.35% | 0 px, 0.31% PASS |
| /us/en/adventures/cycling-tuscany | +21 px, 6.83% | 0 px, 0.03% PASS | -99 px, 11.98% | 0 px, 0.17% PASS |
| /us/en/adventures/downhill-skiing-wyoming | +22 px, 5.98% | 0 px, 0.03% PASS | -153 px, 13.09% | 0 px, 0.14% PASS |
| /us/en/adventures/gastronomic-marais-tour | -4 px, 4.87% | 0 px, 0.10% PASS | -338 px, 23.74% | 0 px, 0.43% PASS |
| /us/en/adventures/napa-wine-tasting | +28 px, 6.34% | 0 px, 0.03% PASS | -363 px, 23.52% | 0 px, 0.22% PASS |
| /us/en/adventures/riverside-camping-australia | +40 px, 7.64% | 0 px, 0.03% PASS | -82 px, 9.36% | 0 px, 0.17% PASS |
| /us/en/adventures/ski-touring-mont-blanc | +32 px, 6.80% | 0 px, 0.02% PASS | -115 px, 13.14% | 0 px, 0.17% PASS |
| /us/en/adventures/surf-camp-costa-rica | +22 px, 6.28% | 0 px, 0.11% PASS | -148 px, 12.24% | 0 px, 0.21% PASS |
| /us/en/adventures/tahoe-skiing | -4 px, 4.01% | 0 px, 0.04% PASS | -338 px, 21.05% | 0 px, 0.19% PASS |
| /us/en/adventures/west-coast-cycling | -11 px, 3.65% | 0 px, 0.04% PASS | -452 px, 23.55% | 0 px, 0.14% PASS |
| /us/en/adventures/whistler-mountain-biking | +14 px, 6.13% | 0 px, 0.02% PASS | -187 px, 19.74% | 0 px, 0.18% PASS |
| /us/en/adventures/yosemite-backpacking | -4 px, 3.91% | 0 px, 0.06% PASS | -444 px, 23.18% | 0 px, 0.15% PASS |
| /us/en/ai-powered-search | 0 px, 1.48% | 0 px, 0.06% PASS | 0 px, 13.92% | 0 px, 0.32% PASS |
| /us/en/faqs | -7 px, 2.78% | 0 px, 0.06% PASS | +26 px, 15.81% | 0 px, 0.24% PASS |
| /us/en/magazine | +58 px, 4.22% | 0 px, 0.09% PASS | 0 px, 10.84% | 0 px, 0.20% PASS |
| /us/en/magazine/arctic-surfing | -51 px, 5.81% | 0 px, 0.01% PASS | +312 px, 18.53% | 0 px, 0.24% PASS |
| /us/en/magazine/guide-la-skateparks | -30 px, 4.72% | 0 px, 0.08% PASS | +141 px, 14.49% | 0 px, 0.49% PASS |
| /us/en/magazine/san-diego-surf | +15 px, 3.06% | 0 px, 0.02% PASS | +82 px, 14.59% | -1 px, 0.95% |
| /us/en/magazine/ski-touring | -44 px, 5.49% | 0 px, 0.01% PASS | +95 px, 17.65% | 0 px, 0.29% PASS |
| /us/en/magazine/western-australia | -38 px, 5.71% | 0 px, 0.07% PASS | +290 px, 18.46% | 0 px, 0.31% PASS |
| /us/es | +4 px, 0.69% | 0 px, 0.06% PASS | -28 px, 6.06% | 0 px, 0.31% PASS |

## Open differences

## 390 px: article image rows that the page data cannot give

Three article pages stay above the bar at 390 px. Both causes sit in the source data, not in our CSS.

- `/us/en/magazine/san-diego-surf`: 6105 px against 6106 px (-1 px), 0.95% of pixels differ.
  `/ca/en/magazine/san-diego-surf`: 6149 px against 6150 px (-1 px), 1.00% differ.
  The cause is the same on both. The last body image, "beach and sea", is a 3056x2024 file on the
  original page, which serves it as a 400x265 rendition. We hold it as 1600x1059, so our ratio
  rounds down to 400x264. A formula that gives 265 here gives 267 for the 1280x853 images,
  which the original serves as 400x266.
- `/ca/en/magazine/members-only/fly-fishing-the-amazon`: 9447 px against 9492 px (-45 px), 4.82%
  differ. Two causes:
  - The original lead image is one row taller (248 rows against our 247). That shifts every row
    below it by -1 px.
  - One paragraph ends in a non-breaking space that wraps to a line of its own in the original
    (-45 px, one 45 px line). The pipeline between DA and the page trims a trailing non-breaking
    space, so the line is missing. The last text row sits at -46 px. A +1 px gap further down brings
    the net to -45 px.
