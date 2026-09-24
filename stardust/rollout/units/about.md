
## C-deliver unit `about` — contributor block + 2 pages (2026-09-24, local unit; stopped before PUT)

**Pages:** `content/us/en/about-us.html` (archetype), `content/ca/en/about-us.html` (sibling; the
migrated `<main>` is byte-identical, so the delivered documents are too — locale chrome resolves
from the pathname). Sections: h1 · h2 `title-underline` · p `text-font-small` · contributor(4) ·
h2 `title-underline` · p `text-font-small` · contributor(3) · metadata (Title + Description verbatim).

**Block `contributor` — decode tier: reconstructive** (repeat group; schema
`stardust/eds-schema/us-en-about-us-html.json`). Container shape, one row per card:
`picture | h3 name, h5 role, one <p><a> per social link`. `decorate()` classifies by element type
(never `rows[N]`), moves every authored node into `contributor-card > contributor-body >
contributor-{image,name,role,links}` wrappers (EW1/EW2), keeps unrecognised cell content as
`contributor-text`, and is re-entrant (EW9). Grid: `repeat(4, 1fr)` ≥1025 / 2 cols 768–1024 /
1 col ≤767 (the source's `aem-GridColumn--default--3 / --tablet--6 / --phone--12` floats); the
block's `margin: 0 -14px` restores the source's padding-less `.cmp-layout-container--fixed` row
inside the 14px-padded section (no frozen-file edit).

**Named assumptions (hands-off):**
- A-about-1 Images: no DA org/repo/token, so the 7 portraits are authored as the source's live
  URLs (`https://wknd.site/content/experience-fragments/…/*.jpeg`, anonymous 200 → media-reconcile
  `keep`; the preview ingester rehosts them at PUT). Rehost via `da-media-upload.mjs` from
  `stardust/current/assets/media/` once the target exists.
- A-about-2 Social icon-only buttons follow the frozen footer's technique: authored label kept in
  the anchor (`font-size: 0`), glyph on `a::before` keyed on the network in the link text
  (`contributor-link-{facebook,twitter,instagram}`), source `aria-label` authored as the link
  `title` (survives html2md) and copied to `aria-label` in `decorate()`. content-diff's glyph
  detector needs an empty icon-class element, so it reports 21 `MISSING ICON` here exactly as it
  does for the footer's 3 — the published-origin pixel gate judges the glyphs.
- A-about-3 `.cmp-title--black` on Stacey Roswells' role is a no-op (#202020 = `--color-fg`, the
  default heading colour) — not carried as a variant.
- A-about-4 The schema generator saw ONE 12-unit section (the canon renders every grid cell as
  `<section class="col">`); the schema was re-sectioned to the ENCODE's page sections
  (`stardust/.work/rollout/about/probes/resection-schema.mjs`: 2 block sections 4 + 3 cards, 5
  `defaultContent` sections, same 40 items). `block-roundtrip.mjs` maps one prototype `<section>`
  per block instance and so reports "7 vs 2" with index-misaligned 🔴s — not a decode defect; the
  whole-page `content-diff.mjs` is the structural proof (below).
- A-about-5 `<i>` in the source lede paragraphs is authored as `<em>` (html2md's only italic).

**Local asserts (harness http://localhost:3000/stardust/.work/harness/about-us.html):**
delivery-lint 0/0/0 · media-reconcile 7 keep · davids-model-lint 0 🔴 · sanitise 1 char (ö) ·
qa-gate 16/16 (both pages; units 4 ≥ 4, 3 ≥ 3) · ew-editability-probe 40/40 editable, 0 dead,
0 duplicated, 0 edit drift · content-diff main 40=40 text nodes, 17=17 headings, 21=21 CTAs,
2=2 body, 7=7 img, 21=21 aria-labels · measure.mjs vs prototype @1440/@360: img/h3/h5/a boxes
Δ 0 px, scrollHeight Δ 0 · `npm run lint` clean · foundation-freeze check unchanged.
Publish decision unchanged (A-C0-8): preview-only until the DA target exists.
