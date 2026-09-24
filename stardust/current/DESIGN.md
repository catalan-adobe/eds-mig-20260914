<!-- stardust:provenance
  writtenBy: stardust:extract
  writtenAt: 2026-09-24T07:32:29Z
  readArtifacts: [stardust/current/_computed-styles.json, stardust/current/assets/css/clientlib-site.min.css, stardust/current/_brand-extraction.json]
  synthesizedInputs: []
  stardustVersion: 0.10.0
  mode: descriptive (current state, replica flow — preserved as-is)
-->
---
name: WKND (current state)
description: Descriptive capture of wknd.site — photography-led adventure & travel site on AEM Core Components
colors:
  body-background: "#ffffff"
  text: "#202020"
  brand-secondary: "#202020"
  brand-third: "#ebebeb"
  text-inverse: "#ebebeb"
  brand-primary: "#ffea00"
  link: "#0045ff"
  text-muted: "#696969"
  overlay: "#000000cc"
typography:
  display:
    fontFamily: "Asar, Georgia, 'Times New Roman', Times, serif"
    fontSize: "40px"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "normal"
  heading:
    fontFamily: "Asar, Georgia, 'Times New Roman', Times, serif"
    fontSize: "36px"
    fontWeight: 400
    lineHeight: 1.2
  subheading:
    fontFamily: "Asar, Georgia, 'Times New Roman', Times, serif"
    fontSize: "24px"
    fontWeight: 400
    lineHeight: 1.3
  label:
    fontFamily: "'Source Sans Pro', 'Helvetica Neue', Helvetica, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.5
  label-md:
    fontFamily: "'Source Sans Pro', 'Helvetica Neue', Helvetica, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.5
  body:
    fontFamily: "'Source Sans Pro', 'Helvetica Neue', Helvetica, Arial, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.5
  paragraph:
    fontFamily: "'Source Sans Pro', 'Helvetica Neue', Helvetica, Arial, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 2.5
  caption:
    fontFamily: "'Source Sans Pro', 'Helvetica Neue', Helvetica, Arial, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  none: "0px"
  input: "0 2px 2px 0"
  pill: "50%"
  toggle: "30px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "32px"
  xl: "48px"
  utility-nav: "25px"
  header-mobile: "130px"
  header: "200px"
  list-item: "120px"
components:
  button:
    backgroundColor: "{colors.brand-third}"
    textColor: "{colors.text}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "16px 32px"
  button-hover:
    backgroundColor: "{colors.brand-primary}"
    textColor: "{colors.text}"
  button-primary:
    backgroundColor: "{colors.brand-primary}"
    textColor: "{colors.text}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "16px 32px"
  button-secondary:
    backgroundColor: "{colors.brand-secondary}"
    textColor: "{colors.text-inverse}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "16px 32px"
  nav-item:
    textColor: "{colors.text}"
    typography: "{typography.label}"
    padding: "8px 16px"
  nav-item-active:
    backgroundColor: "{colors.brand-primary}"
    textColor: "{colors.text}"
  utility-bar:
    backgroundColor: "{colors.brand-secondary}"
    textColor: "{colors.text-inverse}"
    height: "25px"
  footer:
    backgroundColor: "{colors.brand-secondary}"
    textColor: "{colors.text-inverse}"
  tab:
    textColor: "{colors.text}"
    typography: "{typography.label}"
    padding: "8px 16px"
  tab-active:
    backgroundColor: "{colors.brand-secondary}"
    textColor: "{colors.text-inverse}"
  search-input:
    rounded: "{rounded.input}"
    height: "32px"
  avatar:
    rounded: "{rounded.pill}"
    size: "120px"
---

# WKND — current-state design system

## Overview
Descriptive snapshot of https://wknd.site as captured on 2026-09-24T07:32:29Z (64 pages, style census at 1440 and 360). This is the **preserved** design of a same-design (replica) migration: every value below is a measured token from the live site, not a proposal. Source of truth for names: the site stylesheet's CSS custom properties (`--brandPrimary`, `--brandSecondary`, `--brandThird`, `--linkColor`, `--textColor`, `--textColorInverse`, `--fontFamilySerif`, `--fontFamilySansSerif`, `--fontSize*`, `--headerHeight` …; full list in `DESIGN.json#extensions.cssCustomProperties`). Layout: a 12-column AEM grid, fixed-width content container (`.cmp-layout-container--fixed`) with full-bleed hero carousels; the header is 200px tall on desktop (25px dark utility bar + logo/nav row), 130px on mobile with an off-canvas nav.

## Colors
Source: `_computed-styles.json#aggregate.colors` (64 pages × 2 widths), names from `clientlib-site.min.css`.
- **body-background #ffffff** — every page surface; the dominant background area.
- **text / brand-secondary #202020** — body text, headings, utility bar, footer, active tab, secondary button.
- **brand-third / text-inverse #ebebeb** — default button fill, footer and utility-bar text, borders.
- **brand-primary #ffea00** — WKND yellow. Used only as a marker: active nav item fill, primary button, 2px title underline, button hover fill. Never a large surface.
- **link #0045ff** — inline links and focused tab border.
- **text-muted #696969** — captions, bylines, small meta.
- **overlay #000000cc** — mobile nav backdrop; **#ebebeb8a** carousel indicators.
No gradients anywhere (census: 0).

## Typography
Source: `_computed-styles.json#aggregate.type`, Google Fonts (files under `assets/fonts/`).
- **Asar 400** (serif) — all headings: h1 40px, h2 36px, h3 24px; title-case, normal tracking, line-height ≈1.2. Counted on 352 heading elements, 0 body.
- **Source Sans Pro** — body 18px/1.5 (400); paragraphs in `.cmp-text` are 18px with line-height 2.5 and `text-align: justify`; uppercase labels 14px/600 (nav, buttons, tabs, breadcrumb, card pretitles) and 16px/600 (h4-level card titles); captions 12px; weights 300/400/600 with italics loaded.
- **wknd-icon-font** — social icons, menu, carousel arrows, accordion chevron, breadcrumb separator (glyph table in `DESIGN.json#extensions.iconFont`).
- Scale audit: **ad-hoc** — fixed px tokens 12 / 14 / 16 / 18 / 24 / 36 / 40, no constant ratio.

## Elevation
Flat. Zero drop shadows across all pages; the single shadow in the census is an inset `rgba(0,0,0,.35) -3px 0 5px` on the off-canvas mobile nav edge. Depth comes from photography and the dark #202020 bands (utility bar, footer, active tab), not from shadow. Border radius is 0 by token (`--buttonBorderRadius: 0`); the only round shapes are 50% avatars/carousel dots, the 0 2px 2px 0 search input corner and the 30px mobile nav toggle.

## Components
Source: `_brand-extraction.json#componentStyle`, `#systemComponents`, `clientlib-site.min.css`.
- **Buttons** — square, uppercase 14px/600 Source Sans Pro, padding 1rem 2rem; default #ebebeb, primary #ffea00, secondary #202020/#ebebeb; hover turns any button #ffea00 with a #202020 border. Icon-only social buttons are square dark tiles with icon-font glyphs.
- **Header** — 25px dark utility bar (Welcome / Sign In / Sign Out + language dropdown), then white row: logo (max-width 8rem; 6rem ≤1024px) left, uppercase nav (Magazine, Adventures, FAQs, About Us; active item filled yellow) and search input right; mobile: hamburger + off-canvas.
- **Footer** — #202020 band: light logo, uppercase nav (Home, Magazine, Adventures, FAQs, About Us), "Follow Us" + three social tiles, ©2019 line and two disclaimer paragraphs in #ebebeb.
- **Hero carousel** — full-bleed image slides, dot indicators, prev/next icon arrows below-right; caption/teaser text overlaid on home.
- **Teaser** — image + small uppercase pretitle + serif title + description + button ("Read More", "View Trips").
- **Image list (cards)** — 3–5 column grid of image, uppercase pretitle, serif title, short description; flat, no border.
- **Title with underline** — serif heading followed by a short 2px #ffea00 rule (`.cmp-title--underline`).
- **Tabs** — uppercase labels, active tab #202020 with #ebebeb text; used for Overview / Itinerary / What to Bring on adventures and for the adventures index.
- **Adventure facts** — content-fragment key/value list (Activity, Adventure Type, Trip Length, Group Size, Difficulty, Price) in small uppercase labels + bold values.
- **Breadcrumb**, **byline** (round author image + name + occupation), **accordion** (FAQ), **contributor card** (120px circular avatar, name, role, three social tiles).

## Do's and Don'ts
- Do keep #ffea00 as a marker (active state, underline, primary CTA); don't use it as a section background.
- Do set every heading in Asar 400 and every label/button in uppercase Source Sans Pro 600; don't introduce a third face or bold serif.
- Do keep corners square and surfaces flat; don't add shadows, gradients or rounded buttons.
- Do preserve the 200px/130px header and the dark utility bar; don't collapse the utility bar into the nav row.
- Do keep justified 18px/2.5 paragraphs in article bodies (source quirk, preserved in replica); any change goes through the inconsistency register.
