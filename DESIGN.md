<!-- stardust:provenance
writtenBy: stardust:extract
writtenAt: 2026-09-24T07:10:00Z
readArtifacts: stardust/current/_brand-extraction.json, stardust/current/_computed-styles.json, stardust/current/assets/css/clientlib-site.min.css, stardust/current/pages/*.json (26)
synthesizedInputs: none
flow: replica (same-design) — descriptive snapshot of the live site, not a target
-->
---
name: WKND Adventures and Travel
description: WKND is a collective of outdoors, music, crafts, adventure sports, and travel enthusiasts that want to share our experiences, connections, and expertise with the world.
colors:
  bg-white: "#ffffff"
  text-ink: "#202020"
  brand-yellow: "#ffea00"
  surface-light: "#ebebeb"
  link-blue: "#0045ff"
  text-dim: "#696969"
  overlay-dark: "#000000cc"
  border-muted: "#afafaf"
typography:
  display:
    fontFamily: "Asar, Georgia, 'Times New Roman', Times, serif"
    fontSize: "40px"
    fontWeight: 400
    lineHeight: 1.5
  heading:
    fontFamily: "Asar, Georgia, 'Times New Roman', Times, serif"
    fontSize: "36px"
    fontWeight: 400
    lineHeight: 1.5
  subheading:
    fontFamily: "Asar, Georgia, serif"
    fontSize: "24px"
    fontWeight: 400
  label:
    fontFamily: "'Source Sans Pro', 'Helvetica Neue', Helvetica, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 600
  body:
    fontFamily: "'Source Sans Pro', 'Helvetica Neue', Helvetica, Arial, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.5
  small:
    fontFamily: "'Source Sans Pro', sans-serif"
    fontSize: "14px"
    fontWeight: 600
    letterSpacing: "normal"
  caption:
    fontFamily: "'Source Sans Pro', sans-serif"
    fontSize: "12px"
    fontWeight: 400
rounded:
  none: "0px"
  input: "0px 2px 2px 0px"
  full: "50%"
spacing:
  gutter: "14px"
  headerY: "50px"
  footerTop: "3rem"
  underlineGap: "8px"
components:
  button:
    backgroundColor: "{colors.surface-light}"
    textColor: "{colors.text-ink}"
    rounded: "{rounded.none}"
    typography: "{typography.small}"
    height: "48px"
  button-primary:
    backgroundColor: "{colors.brand-yellow}"
    textColor: "{colors.text-ink}"
    rounded: "{rounded.none}"
    typography: "{typography.small}"
    height: "48px"
  button-secondary:
    backgroundColor: "{colors.text-ink}"
    textColor: "{colors.surface-light}"
    rounded: "{rounded.none}"
    typography: "{typography.small}"
    height: "48px"
  nav-link:
    textColor: "{colors.text-ink}"
    typography: "{typography.small}"
    padding: "15px 17px"
  nav-link-active:
    backgroundColor: "{colors.brand-yellow}"
  footer:
    backgroundColor: "{colors.text-ink}"
    textColor: "{colors.surface-light}"
    padding: "1rem 0 1.5rem"
  header:
    backgroundColor: "{colors.bg-white}"
    padding: "50px 0"
  portrait:
    rounded: "{rounded.full}"
---

# WKND — current design system (captured)

## Overview

Descriptive record of the live https://wknd.site/us/en design as measured on 2026-09-24
across all 26 `/us/en` pages at 1440 px and 360 px (`_computed-styles.json#aggregate`,
26 pages × 2 widths). The site is an AEM Sites build on Core Components (`cmp-*` classes,
`aem-Grid--12`) themed by CSS custom properties (`--brandPrimary`, `--textColor`,
`--fontFamilySerif`, …) in `assets/css/clientlib-site.min.css`. Register: **brand**
(travel-magazine marketing site — full-bleed photo heroes, teasers, CTAs).
The replica flow keeps every value below as-is; nothing here is a proposal.

## Colors

Source: `_brand-extraction.json § palette` (8 of 11 clustered census colors; dropped
`#ffffff0d` border, `#ebebeb8a` background, `#000000` text).

| Token | Value | Observed as | Evidence |
|---|---|---|---|
| bg-white | `#ffffff` | page background, header | `body{background-color:var(--bodyBackground,#fff)}` @2541; bgArea 156 M px |
| text-ink | `#202020` | body/heading text, footer background, secondary buttons | `body{color:var(--textColor,#202020)}`; `.cmp-experiencefragment--footer{background-color:#202020}` @117938 |
| brand-yellow | `#ffea00` | primary button bg, active nav item, 84 px title underline | `--brandPrimary,#ffea00` @110723, @152269; 33 button-background hits |
| surface-light | `#ebebeb` | default button bg, footer text, inverse titles | `--brandThird,#ebebeb`, `--textColorInverse,#ebebeb` |
| link-blue | `#0045ff` | inline body links | census `link` 82 hits (e.g. faqs aside `1-800-000-0000`, `info@wknd.com`) |
| text-dim | `#696969` | bylines, meta, `.cmp-title--gray` (dimgray) | census text 316 hits |
| overlay-dark | `#000000cc` | image overlays (carousel/teaser) | census background 34 hits |
| border-muted | `#afafaf` | separators | census background 36 hits |

No gradients on any page (`aggregate.motifs.gradients: []`).

## Typography

Source: `_brand-extraction.json § type`; loader is a Google Fonts `<link>`
(`css2?family=Asar&family=Source+Sans+Pro:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&display=swap`).

- **Headings — Asar 400** (`--fontFamilySerif,"Asar",Georgia,…`): 160 heading hits, never used for text or buttons. h1 40 px, h2 36 px, h3 24 px (all weight 400).
- **Body / UI — Source Sans Pro** (`--fontFamilySansSerif`): body 18 px / 1.5 (`body` @2541), weights 400 and 600. h4 16 px/600 and h5 14 px/600 are Source Sans Pro (captions, "Follow Us", "Share this Adventure"). Nav links and buttons: 14 px / 600 / uppercase (`.cmp-navigation__item-link` @131698, `.cmp-button` @110382). Meta 12 px.
- **Arial 14 hits** at 13.33 px = unstyled `<button>` in the search component (`cmp-search__clear`).
- **wknd-icon-font** (`@font-face` @115, `clientlib-site/resources/fonts/wknd-icon-font.ttf|woff`): social icons U+E901–E903, menu U+E916, breadcrumb chevron U+EA1C, carousel arrows U+E90F — table in `DESIGN.json#extensions.iconFont.glyphs`.
- Scale audit: **ad-hoc** (40 / 36 / 24 / 18 / 16 / 14 / 12 px — ratios 1.11, 1.5, 1.33, 1.125, 1.14).
- Files captured self-hostable under `assets/fonts/` (Asar 400; Source Sans Pro 300/400/600 + italics, latin subsets; wknd-icon-font ttf+woff). Asar and Source Sans Pro are SIL OFL 1.1; the icon font ships in the open-source WKND clientlib.

## Elevation

Source: `_brand-extraction.json § motifs.shadows`. Flat surfaces everywhere; two shadows only:

- `rgba(0,0,0,.35) -3px 0 5px 0 inset` — 26 hits (one per page; the language-nav / search edge).
- `0 8px 20px 0 rgba(0,0,0,.26)` on `.scrolly .cmp-layoutcontainer--header` @122769 — the header gains a shadow and shrinks its 50 px padding once the page scrolls.

Radii: buttons square (`--buttonBorderRadius,0`); `50%` for contributor portraits and carousel indicators (84 hits, largest area); `0 2px 2px 0` on the search input (cross-page mode, 26 hits); `30px` (10 hits) on carousel indicator dots.

## Components

Source: `_brand-extraction.json § componentStyle` and `§ systemComponents`; instances in `DESIGN.json#extensions.modules[]` (14 candidates, `status: candidate`).

- **Header** (26/26): white, 50 px vertical padding; utility bar with Sign In / Sign Out and the 10-locale language nav (`en-US` toggle); WKND dark logo (`assets/logo.svg`, 300×112 img); nav Magazine · Adventures · FAQs · About Us in 14 px uppercase, active item on `#ffea00`; `.cmp-search` combobox posting `<page>.searchresults.json?fulltext=`.
- **Footer** (26/26): `#202020` band, `#ebebeb` text, WKND light logo (`assets/logo-light.svg`), Home · Magazine · Adventures · FAQs · About Us, "Follow Us" with icon-font social buttons, © 2019 WKND Site, Adobe disclaimer paragraph, Adobe Stock note.
- **Section title with underline** — `.cmp-title--underline .cmp-title__text:after`: 84 px × 2 px `#ffea00` rule, 8 px above (@152269).
- **Hero carousel** (home) — `.cmp-carousel--hero` of `.cmp-teaser--hero` slides: 1440×810 image, Asar title, description, primary CTA ("View Trips").
- **Featured teaser** — `.cmp-teaser--featured` (home, magazine): eyebrow "Featured Article", image left, title/description/CTA on light panel with yellow edge.
- **Article teaser list** — `.cmp-teaser--list` (home "Recent Articles", magazine "All Articles", article asides with date).
- **Adventure image list** — home "Next Adventures", adventures listing under `.cmp-tabs`.
- **Adventure detail** (16) — breadcrumb, `.cmp-carousel--mini` gallery with Previous/Next, Asar title, facts column from `.cmp-contentfragment--elements`, tabs Overview / Itinerary / What to Bring, "Share this Adventure".
- **Article** (5) — lead image, breadcrumb, Asar headline, `.cmp-byline`, body copy, aside "SHARE THIS STORY" icon-only buttons + related list, contributor experience fragment.
- **Contributor card** (about-us ×7) — circular portrait, name, role in uppercase, three `.cmp-button--icononly` social buttons.
- **FAQ accordion** (faqs) — `.cmp-accordion`, uppercase 14 px questions with `+` glyph, aside "Need more help?".
- **Buttons** — `.cmp-button`: 48 px tall, min-width 48 px, square, 14 px/600 uppercase; primary `#ffea00`, secondary `#202020` on `#ebebeb`; measured hover on list links: transparent → `#ffea00` background.
- Breakpoints in the stylesheet: `max-width:1024px` (13 rules), `max-width:767px` (8), `min-width:1025px`, `min-width:1165px`, `min-width:1201px`.

## Do's and Don'ts

Replica flow: these describe what the live site does, so the rebuild matches it.

- Do keep Asar for every h1–h3 and Source Sans Pro for everything else; never swap in the fallbacks.
- Do keep the 84 px yellow underline under section titles and the yellow active-nav state — they are the only brand-colour moments besides primary buttons.
- Do keep buttons square and uppercase at 48 px; no radius, no shadow.
- Do keep the dark `#202020` footer with `#ebebeb` text and the light logo variant.
- Don't introduce gradients, card shadows or rounded corners — none exist on the source.
- Don't reflow the 12-column AEM grid gutters (14 px container padding) or the 50 px header padding.
