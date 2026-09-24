## C-deliver unit `landing` — hero-carousel + teaser-featured blocks, 2 pages (2026-09-24, local unit; stopped before PUT)

**Pages:** `content/us/en.html` (archetype `us-en-html`), `content/ca/en.html` (sibling; the migrated
`<main>` differs only in the locale prefix of its hrefs and image source URLs). Page list:
`stardust/rollout/units/landing.paths`. ENCODE: `stardust/.work/rollout/landing/probes/author-landing.mjs`
(DOM read of `stardust/migrated/<locale>.html`, text moved verbatim). Sections, in page order:
hero-carousel (full-bleed) · teaser-featured · h2 `title-underline` + image-list (4 recent articles) ·
`<p><strong><a>` All Articles · empty `style: separator` · h2 `title-underline` Next Adventures ·
teaser-hero `imagebottom` (full-bleed) · h3 + image-list (4 adventures) · All Trips · `separator` ·
metadata (Title + Description verbatim from `_meta.json`).

**Blocks authored (2) and decode tiers** (schema `stardust/eds-schema/us-en-html.json`, qa-gate view
`.blocks.json` = the 5 image-bearing block sections; `probes/schema-view.mjs`):
- `hero-carousel` — reconstructive (one row per slide, authors add/remove slides), each slide
  template-slotted: cells classified by content (the picture cell = image, the other = content:
  heading → `.teaser-content`, `<p><a>` → `.teaser-actions`, other `<p>` → `.teaser-description`).
  Generated prev/next glyph buttons (wknd-icon-font `\e90f`/`\e90e`) + indicator dots, canon.js
  interaction (wrap, indicator select). Container shape.
- `teaser-featured` — template-slotted (one row, `content | image`; the paragraph BEFORE the heading
  is the source `.cmp-teaser__pretitle`). Simple shape.
- **Reused:** `image-list` (C6, as is — flat list, no label rows), `teaser-hero` (C2) with a targeted
  extension: CTA paragraphs move into `.teaser-actions` (EW3) and variant class `imagebottom`
  (`object-position: bottom`) — appended, nothing rewritten.

**Named assumptions (hands-off):**
- A-L-1 The source landing has NO `<h1>` (every teaser title is an h2). delivery-lint's `h1` rule is
  P0 at 0, so the first carousel slide's title (" WKND Adventures") is authored as `<h1>` and sized as
  the live h2 (`--heading-xl`) in the block CSS — the same technique as C2's teaser-hero. Boxes Δ 0.
- A-L-2 Images: no DA org/repo/token, so the 13 editorial images are the captured SOURCE URLs
  (`https://wknd.site/…/_jcr_content/…`, anonymous 200 → media-reconcile `keep`); rehost via
  `da-media-upload.mjs --scope landing` when the target exists.
- A-L-3 Carousel indicators: Core Components render the slide title as hidden indicator text
  (`font-size: 0; text-indent: -3000px`) beside `aria-label="Slide N"`; the block generates the dots
  with the same `aria-label` and no text (mini-carousel precedent) — block-roundtrip reports the 3
  hidden titles as 🟡 MISSING BODY (advisory, not structural). No autoplay: the source markup carries
  `data-cmp-delay` but no `data-cmp-autoplay`, and the gated canon.js has none.
- A-L-4 The two `.cmp-button--primary` CTAs are default content `<p><strong><a>` → `a.button.primary`
  (accent) via the foundation's decorateButtons; the source `aria-label` is authored as `title`
  (kept by `a.title = a.title || a.textContent`).
- A-L-5 Teaser descriptions: slides 1–2 and the featured teaser are bare-text divs (left-aligned),
  slide 3 a `<p>` (justified by the global rule); all authored as `<p>` with `text-align: left`.
- A-L-6 Section title + image-list share one section (C6's shape); block-roundtrip's 🟠 EXTRA heading
  on `image-list[n]` is the default-content h2/h3 in the same section, not a decode defect.
- A-L-7 The empty `style: separator` sections would be hidden by the frozen `main > .section:empty`
  rule (queued by locale-landing in foundation-requests.md, not re-queued); hero-carousel.css ships
  the scoped override `main:has(> .section.hero-carousel-container) > .section.separator` (display
  flow-root, `::before` margin 4rem 0 = the live collapsed 64px). No new foundation request.

**Local asserts (harness http://localhost:3000/stardust/.work/harness/landing/{us-en,ca-en}.html and the
aem-cli render http://localhost:3000/us/en):** delivery-lint 0/0/0 · media-reconcile 13 keep (both) ·
davids-model-lint 0 🔴 0 🟡 · sanitise 3 chars · qa-gate PASS 25/25 (both pages; units 3 slides, 4 + 4
cards; full-bleed hero-carousel + teaser-hero 1440/1440) · block-roundtrip `--ew` all 5 block
instances closed, 0 structural 🔴, EW 34/34 editable, dead 0, duplicated 0 (both pages) · measure.mjs
vs prototype at 1440 / 1164 / 1024 / 768 / 767 / 360: every `main img`, `main a`, h1/h2/h3, indicator
li, control button box Δ 0 px, root scrollHeight Δ 0 (ca/en footer Δh +29/+44 = the harness
resolving the US chrome from its pathname) · carousel drive (`probes/carousel-drive.mjs`, 1440 + 360):
next ×3 wraps, prev wraps, indicator click — 5/5 steps with the active slide's heading/img/CTA boxes
equal to the prototype's, 0 page errors · `npm run lint` clean · `foundation-freeze.mjs check`
unchanged. Publish decision unchanged (A-C0-8): preview-only until the DA target exists.
Not run (needs the DA target): PUT / preview / `.plain.html` checks, published-origin pixel + crop
gates, `update-coverage.mjs` rows.
