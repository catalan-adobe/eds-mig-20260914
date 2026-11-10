# Open differences

## 390 px: article image rows that the page data cannot give

Three article pages stay above the bar at 390 px. Both causes sit in the source data, not in our CSS.

- `/us/en/magazine/san-diego-surf` and `/ca/en/magazine/san-diego-surf`: 6105 px against 6106 px
  (-1 px), 0.95% of pixels differ. The last body image, "beach and sea", is a 3056x2024 file on the
  original page, which serves it as a 400x265 rendition. We hold it as 1600x1059, so our ratio
  rounds down to 400x264. A formula that gives 265 here gives 267 for the 1280x853 images,
  which the original serves as 400x266.
- `/ca/en/magazine/members-only/fly-fishing-the-amazon`: 9447 px against 9492 px (-45 px), 4.82%
  differ. The original lead image is one row taller (248 rows against our 247). One paragraph ends
  in a non-breaking space that wraps to a line of its own in the original. The pipeline between
  DA and the page trims a trailing non-breaking space, so the line is missing.
