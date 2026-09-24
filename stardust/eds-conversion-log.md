# EDS conversion log

## C0 — foundation (2026-09-24, local unit; no DA target, stopped before PUT)

**Decode tier:** header and footer are template-slotted (fixed compositions): the canon chrome DOM
is built as empty slot containers and every authored node of the locale's `/nav` + `/footer`
document is moved in by role (EW1). The off-canvas panel carries a stripped clone of the nav
list (EW4). Search labels (nav section 3) are attribute text — declared `@ew-exempt`.

**Authoring contract:** `content/<country>/<lang>/nav.html` (brand · nav tree · search labels ·
account · language) and `…/footer.html` (brand · nav tree · Follow Us · social list · one section
per text component), 11 locales, each with a `Robots | noindex` metadata row. The blocks resolve
`/<country>/<lang>/nav|footer` from the pathname (`nav`/`footer` metadata still override; `/us/en`
is the fallback outside a locale prefix), so pages need no chrome metadata.

**Named assumptions (hands-off):**
- A-C0-1 No DA org/repo/token: logos ship from the code origin through the `:icon:` convention
  (`icons/wknd-logo-dk.svg`, `icons/wknd-logo-light.svg`, alt from the link title) instead of a
  `content.da.live` media URL; flags are decorative CSS backgrounds (`blocks/header/flags/`).
- A-C0-2 Box model follows the gated canon (content-box default, border-box per column class) —
  the deploy skill's global `border-box` reset (#106) is deliberately NOT applied: the lifted
  values (`.search-input width: calc(100% - 4rem)` + padding, column widths) were measured under
  content-box. `img { max-width: 100%; height: auto }` is kept for the pipeline's width/height
  attributes.
- A-C0-3 `--nav-height` = the live `.root` padding-top (200px ≥ 1025px, 130px below); the fixed
  header renders 194px / 117px inside it exactly as the live lift (stardust/replica/lifts/
  us-en-html-live.json). Header + footer boxes match the lift at 1440 and 360 (footer 260 / 593).
- A-C0-4 BEM class names of the canon are flattened to kebab-case (stylelint-config-standard
  `selector-class-pattern`): `nav__link` → styled through `.nav a`, `utility-bar__inner` →
  `.utility-bar-inner`, etc. Cluster agents lifting prototype CSS face the same rename.
- A-C0-5 `.eslintignore` gains `stardust` — the pipeline artifacts (prototype/migrated JS) are
  not runtime files and are already `.hlxignore`d; runtime files stay linted.
- A-C0-6 Search ships as the UI shell (field, clear button, empty results list) per
  dynamic-features-plan P1; P4 (`/query-index.json`-backed results) needs the target host.
- A-C0-7 Section styles for default content (closed set): `title-underline`, `title-right`,
  `title-white`, `text-font-small`, `separator`, `separator-space-small`, `full-bleed` (plus the
  planned full-bleed containers hero-carousel, mini-carousel, breadcrumb, teaser-hero).
- A-C0-8 Publish decision: none yet — no PUT happened; preview-only (`--no-publish`) until the
  DA target exists.

**Fonts:** Asar 400 + Source Sans Pro 300/400/600 (normal + italic), every Google-Fonts subset
self-hosted under `fonts/` (SIL OFL) + the clientlib `wknd-icon-font`; metric fallbacks computed
from the woff2 (source-sans-pro-fallback 96.46% / asar-fallback 101.54%).

**Lint:** `npm run lint` clean (stylelint `no-descending-specificity` disabled per chrome file with
justification — rules grouped by region). Token-completeness gate: only the unused boilerplate
`cards`/`hero` blocks reference `--background-color` (not added; blocks unused by the plan).

**Local asserts (harness http://localhost:3000/stardust/.work/harness/page.html):** qa-gate 10/10;
chrome EW survival 14/14 editable, 3 exempt, 0 dead/duplicated; interaction drive 15/15 (language
menu, scrolly morph, off-canvas panel + Escape, search clear) at 1440 and 360; 0 page errors.
Pixel/crop gates deferred to the published origin.
