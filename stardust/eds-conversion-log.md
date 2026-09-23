<!-- stardust:provenance writtenBy=stardust:deploy (replica Phase 5) writtenAt=2026-09-23 read=stardust/prototypes/canon.css,stardust/current/pages/*.html -->
# EDS conversion log — WKND Adventures

Code branch `stardust/replica-migration` → https://stardust-replica-migration--eds-mig-20260914--catalan-adobe.aem.page
Content: DA `catalan-adobe/eds-mig-20260914` (21 pages + /nav + /footer), media under `media/site/images/**` (78 files).

## Content model

| Source module | EDS | Decode tier |
|---|---|---|
| section bg (secondary / inverse / accent), narrow container, centered, muted copy, heading + text link, article body | section-metadata `style`: `secondary`, `inverse`, `accent`, `narrow`, `center`, `muted`, `heading-link`, `article` | — |
| `.tag` eyebrow | default content: a paragraph that is only `<strong>`, directly before a heading (no such paragraph exists elsewhere in the source) | — |
| buttons ink / ghost / amber | `**link**` / `_link_` / `**_link_**` (EDS primary / secondary / accent); adjacent button paragraphs grouped in `div.button-group` by scripts.js | — |
| hero (full / article with byline) | `hero` (`full` variant) | template-slotted |
| featured article | `featured` | template-slotted |
| activity tabs / team tabs | `tabs` / `tabs (team)` | reconstructive |
| article cards grid | `cards` | reconstructive |
| ticker marquee | `ticker` | template-slotted |
| numbered editorial index | `editorial-index` | reconstructive |
| FAQ | `accordion` | reconstructive |
| gallery (3-up + wide) | `gallery` | template-slotted |
| bordered text cards | `panels` (`promo` variant: 2-up) | reconstructive |
| gear list + pull quote | `article-aside` | template-slotted |
| text + image 2-col (about) | `columns` | template-slotted |
| figure + caption (article) | default content: image paragraph + em-only caption paragraph (no em-only paragraph exists elsewhere in articles) | — |

## davids-model 🟡 justifications

- D1 hero / ticker / panels / cards "prose-only" — each is a bespoke layout (bg image + scrim, marquee, bordered grid, card-as-link grid) that default content cannot express.
- D3 gallery rows 3 / 1 cells — the source composition is a 3-up row plus one wide image; rows map 1:1.

## Decisions

- Publish: preview-only (`--no-publish`) until the owner decides to publish.
- Two `featured` image links dropped (destinations, sustainability) — they repeat the Read button href (`contentDeviations`).
- Accordion question and tab label are not `<button>`s (EW7): `role=button` / `role=tab` divs with keyboard handling.
- `.hlxignore`: `stardust/`, `content/`, `DESIGN.json` (and `*.md` via boilerplate).
- Lint: stylelint `no-descending-specificity` disabled file-level on 4 files — rule order mirrors the source stylesheet; outcomes are decided by specificity.
