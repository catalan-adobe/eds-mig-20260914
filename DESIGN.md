---
name: WKND Adventures
description: Bold Stories. Real Life. Wild Places. — outdoor adventure editorial
colors:
  ink: "#0f1a14"
  white: "#ffffff"
  amber: "#e8651a"
  cream: "#f5f0e8"
  gray-100: "#f0ece4"
  gray-200: "#ddd8cf"
  gray-300: "#c8c2b8"
  gray-500: "#7a8a80"
  gray-700: "#3d4f45"
typography:
  display:
    fontFamily: "Syncopate, sans-serif"
    fontSize: "3.5rem"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  h2:
    fontFamily: "Syncopate, sans-serif"
    fontSize: "2.5rem"
    fontWeight: 700
    lineHeight: 1.1
  h3:
    fontFamily: "Syncopate, sans-serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1.1
  h4:
    fontFamily: "Syncopate, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.1
  body:
    fontFamily: "Instrument Sans, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Syncopate, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 700
    letterSpacing: "0.07em"
rounded:
  md: "0.5rem"
  lg: "1rem"
  card: "1.25rem"
  full: "9999px"
spacing:
  xxs: "0.25rem"
  xs: "0.5rem"
  sm: "0.75rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
  2xl: "3rem"
  3xl: "4rem"
  4xl: "5rem"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "0.75rem 2rem"
  button-accent:
    backgroundColor: "{colors.amber}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "0.75rem 2rem"
  tag:
    backgroundColor: "{colors.amber}"
    textColor: "{colors.white}"
    rounded: "{rounded.full}"
    padding: "0.25rem 0.5rem"
  card:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.card}"
---
<!-- stardust:provenance writtenBy=stardust:extract (replica Phase 1) writtenAt=2026-09-23 input=https://wknd-adventures.com/ synthesized=descriptive-from-capture read=stardust/current/source-css/styles.css,stardust/current/_computed-styles.json -->

# Design — WKND Adventures (current state)

## Overview

Editorial outdoor-adventure magazine. Full-bleed photographic heroes with a
dark scrim, wide-tracked all-caps Syncopate display type, warm cream/stone
neutrals, a single hot amber accent and a deep forest-ink. Container 1200px
(narrow 48rem for long-form), 24px gutter (16px ≤768px). Sections alternate
white / `gray-100` (secondary) / ink (inverse) / amber (accent). Breakpoints:
768px (type ramp + single column), 1024px (mobile nav).

## Colors

- **Ink `#0f1a14`** — text, primary button fill, inverse sections, footer.
- **Amber `#e8651a`** — tags, hard offset button shadows, accent section,
  numbered editorial index, ticker rules, footer top border (4px).
- **Cream `#f5f0e8`** — card hover fill. **Gray-100 `#f0ece4`** — secondary
  section background. Gray-200/300 — borders; gray-500 — secondary text;
  gray-700 — FAQ answer text, footer divider.

## Typography

Syncopate 400/700 (headings, labels, buttons, tags — renders uppercase-like
small-caps glyphs) over Instrument Sans 400–700 (body). Ramp (rem):
h1 3.5 / h2 2.5 / h3 2 / h4 1.5 / h5 1.25 / h6 .875; ≤768px h1 2, h2 1.75,
h3 1.375. Line-height 1.1 headings, 1.6 body (1.7 in article body).

## Elevation

Flat surfaces. Buttons carry a hard offset shadow `3px 3px 0 0` (amber on
dark buttons, black on amber buttons, white on accent-section buttons) that
grows to 5px with a −2px translate on hover. Cards: 1px gray-200 border,
hover `0 4px 20px rgba(0,0,0,.08)` + cream fill. Megamenu `0 8px 32px
rgba(0,0,0,.08)`.

## Components

Sticky white navbar with three megamenus (Explore / Stories / Info) and a
Subscribe button; hero (55vh / 65vh full) with overlay gradient; featured
article (2-col image + text); tabbed "Browse by Activity" card grid;
article cards (16:10 image, tag, title, meta); ticker strip (40s marquee);
numbered editorial index; FAQ accordion (+ rotates 45°); pull quote;
gallery images; CTA band (accent); inverse footer with 4 columns.

## Do's and Don'ts

- Do keep the hard offset shadow and pill radius on every button.
- Do keep amber as the sole accent; never introduce a second hue.
- Don't soften heroes — the scrim gradient is part of the look.
- Don't set body copy in Syncopate.
