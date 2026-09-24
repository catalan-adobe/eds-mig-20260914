
## C-deliver unit `faqs` — accordion block + 2 pages (2026-09-24, local unit; stopped before PUT)

**Pages:** `content/us/en/faqs.html` (archetype), `content/ca/en/faqs.html` (sibling; the migrated
`<main>` is byte-identical, so the documents differ only in the lead image's per-locale source URL).
Sections mirror the prototype's five: h1 `title-underline` · picture `faq-image` · p `faq-intro` ·
accordion(7) · h3 + p `text-font-small, faq-aside` · metadata (Title + Description verbatim).
Encoder: `stardust/.work/rollout/faqs/probes/encode-faqs.mjs <locale>` (lifts every node from the
migrated main by structure — no retyped text).

**Block `accordion` — decode tier: reconstructive** (repeat group; schema
`stardust/eds-schema/us-en-faqs-html.json § faq-main`). Block-collection `accordion` model, one row
per item: `question | answer`. `decorate()` moves the question into `accordion-header >
accordion-title` (EW7: the toggle `<button>` is glyph-only, `aria-labelledby` the title, the whole
header row takes the click), the answer nodes into `accordion-panel[role=region]` (hidden at rest via
the `hidden` attribute), a single-cell row into `accordion-head`; items expand independently like the
source (`stardust/migrated/assets/us-en-faqs-html.js`); re-entrant (EW9). CSS is the prototype's
`.accordion__*` rules re-scoped: 13.333px header padding + 2px `--color-third` rule (dropped when
expanded), uppercase 16px/600 title, `\e911`/`\e910` wknd-icon-font glyphs, `.5em` panel padding
with the 0.5s fade-in, 14px/1.75 panel paragraphs.

**Named assumptions (hands-off):**
- A-faq-1 Images: no DA org/repo/token, so the lead image is authored as each page's live URL
  (`https://wknd.site/{us,ca}/en/faqs/_jcr_content/…/adobestock-277768563.jpeg`, anonymous 200,
  media-reconcile `optimize`). Rehost via `da-media-upload.mjs` once the target exists.
- A-faq-2 Page layout: the source's 8-col main + offset-1 3-col aside is a CSS grid on
  `main:has(> .section.faq-aside)` (12 tracks of `--max-width / 12` between two flexible gutters;
  main-column sections `2 / span 8`, aside `11 / span 3`, `grid-row: 1 / span 8` over
  `repeat(7, auto) minmax(0, 1fr)` so the aside never stretches a content row). Shipped inside
  `blocks/accordion/accordion.css` (fan-out rule), queued in `foundation-requests.md` to move into
  `styles/styles.css` — the accordion is the 4th section, so on the published origin the layout
  applies when its CSS loads, after first paint.
- A-faq-3 Questions are authored as `<p>` (the block-collection accordion label model), not `<h3>`:
  the prototype's question text lives in a `<span>` and block-roundtrip classifies it `eyebrow`;
  an `<h3>` renders `heading` and reports 7 ROLE SWAP 🔴 (round-trip not closed). Text verbatim;
  the source's h3 outline for the questions is not carried — reversible by authoring `<h3>` and
  accepting the tool's 🔴.
- A-faq-4 The aside's hidden separator (`separator--hidden separator--space-small`, no rule) is
  spacing only: `padding: 1em 0 0` on the `faq-aside` section (h3 at +45px like the source).
  The aside is flush (no 14px section padding) at every width, as the prototype renders it.
- A-faq-5 The contact paragraph's inline `style="text-align: left"` (not carried by DA) is the
  `faq-aside` section rule `.default-content-wrapper p { text-align: left }`; its `<br>`s are the
  source's own line breaks and stay. `<b>` → `<strong>` (html2md's only bold). The source's empty
  `<h3>&nbsp;</h3>` inside answer 2 is kept verbatim in the answer cell.
- A-faq-6 `faq-image` / `faq-intro` sections take `width: 66.6667%; margin: 0` below 1025px
  (image) and 768–1024 (intro) — the source's 2/3 grid cells.

**Local asserts (harness http://localhost:3000/stardust/.work/harness/faqs.html, faqs-ca.html):**
delivery-lint 0/0/0 both pages · media-reconcile 1 optimize · davids-model-lint 0 🔴 0 🟡 ·
sanitise 2 chars (’) · qa-gate 13/13 both pages (units 7 ≥ 4) · block-roundtrip `--blocks accordion
--ew` closed: 16=16 text nodes (7 eyebrows, 9 body), EW editable 14/14, 0 dead, 0 duplicated ·
whole-page run closed (0 structural 🔴) · measure.mjs vs prototype @1440/1024/768/360: h1, img,
intro, accordion, aside h3/p, footer Δ 0, scrollHeight Δ 0; item header 152/1023 748×49, title
165/1037, toggle glyph right edge 887 (= 900 − 13.33) · toggle probe (items 1, 2@360, 7): panel
80.5/168/105 px tall at identical tops, aria-expanded true, header border 0, second click hides;
expanded item 1 + 7: item 2 top 565.97, main 1372.4, footer top 1022.4 on both · `npx eslint
blocks/accordion` + stylelint clean (`npm run lint` shows one max-len in another cluster's
`blocks/content-fragment/content-fragment.js:36`, untouched) · foundation-freeze check unchanged
(66 files). Pixel/crop gates deferred to the published origin. Publish decision unchanged:
preview-only until the DA target exists.
