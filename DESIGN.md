---
_provenance:
  writtenBy: stardust:replica
  mode: bounded-single
  writtenAt: 2026-09-25T18:44:35Z
  synthesizedFrom:
    - stardust/current/pages/index.json
    - stardust/replica/capture/tokens.json
---

# WKND Adventures — design (descriptive, bounded-single)

Values lifted from `css/styles.css`; the full table is `stardust/replica/capture/tokens.json`.

- **Palette:** white #fff · black #0f1a14 · amber #e8651a · cream #f5f0e8 · gray 100/200/300/500/700 = #f0ece4 / #ddd8cf / #c8c2b8 / #7a8a80 / #3d4f45.
- **Type:** headings Syncopate 700, lh 1.1 (h1 3.5rem ls −.02em, h2 2.5rem, h3 2rem, h4 1.5rem, h6 .875rem ls .05em); body Instrument Sans 400–700, 1rem / 1.6. Mobile ≤768: h1 2rem, h2 1.75rem, h3 1.375rem. Antialiased smoothing.
- **Spacing scale:** .25 / .5 / .75 / 1 / 1.5 / 2 / 3 / 4 / 5 rem. Section padding-block 4rem (2rem ≤768).
- **Container:** max 1200px, narrow 48rem, padding-inline 1.5rem (1rem ≤768), border-box everywhere.
- **Radii:** .5rem / 1rem / card 1.25rem / pill.
- **Buttons:** pill, 2px border, Syncopate .875rem 700 ls .07em, padding .75rem 2rem, hard offset shadow 3px 3px 0 (amber on black, black on amber/ghost-hero, white in accent section); hover 5px + translate(−2px,−2px). Full-width ≤768.
- **Section variants:** default white · secondary gray100 · inverse black/white · accent amber.
- **Chrome:** sticky white navbar, 1px gray200 bottom border; footer black with 4px amber top border, links #999.
- **Breakpoints (source):** 768 (layout collapse), 1024 (nav collapse). Cap model: `DESIGN.json → extensions.breakpoints` (containerMaxWidth 1200px, probeWidth 2560).
