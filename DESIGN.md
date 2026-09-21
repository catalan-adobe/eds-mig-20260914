---
_provenance:
  writtenBy: stardust:replica
  writtenAt: 2026-09-21T13:14:06Z
  mode: bounded-single
  synthesizedFrom:
    - stardust/current/pages/index.json
    - stardust/current/_computed-styles.json
    - stardust/replica/capture/pagelibs.css (synopsys-pagelibs.min.c75662aa8a81ccd74e2e6cc1b7fe1590.css)
---

# Design — captured current state of www.synopsys.com (home)

Every value below is lifted from the live stylesheet or a computed-style measurement; see DESIGN.json for the machine form.

## Type
- Family: **Roboto** (self-hosted TTF 300/400/500/700 from /etc.clientlibs/…/fonts/Roboto/), fallback Arial, sans-serif. Body 300.
- Body: 15px/1.6 (<730), 14px (≥730), 18px (≥1200). Section titles (`.component-textcomp .title`): 24px/1.1 mobile, 32px/1.1 desktop, weight 300, #111c24.
- Hero title 48px/1.4 (≥1400), 32px (730–1399), 20px mobile; `<b>` 700. Hero sub-title 20px/1.6 desktop, 16px mobile.
- Card heading (asset card) 20px/23px 400; key-benefit title 20px/28px 300; description 16px/25.6px 300; footer links 14px/14px 300; footer h3 18px/1.1 400 (16px mobile).

## Palette
- Ink #111c24 · purple #7e45af · deep purple #5a2a82 (logo, headings default) · link #316aca · grey text #555 · grey surface #f7f7fa · rule #c1c2c1 · utility/ask bar #171917 · footer #111c24 · body canvas #e6eaed, site wrapper #fff.
- Gradients: dark-purple `linear-gradient(107.7deg,#2d1541 0,#5a2a82 50%,#7e45af 100%)`; black `linear-gradient(107.7deg,#000 0,#191c20 35%,#646e81 100%)`; Ask ring `conic-gradient(#fdb71a, #ab714e 25%, #5a2a82 50%, #ab714e 75%, #fdb71a)`.

## Container model
- Bootstrap-3 grid: `.container` 15px gutters; 970px ≥992, 1170px ≥1200; nested containers collapse. Breakpoints 730 / 992 / 1200 / 1400; nav collapses <1130.
- Section rhythm via `.background-component`: top margins xs/sm/md = 15/30/60 desktop, all 40 mobile; bottom paddings sm/md = 30/60.

## Buttons
- `.component-button`: 40px min-height, padding 0 24, 2px border, radius 5, 16px/400. primary.dark = white fill, ink text; secondary.dark = transparent, white border + text. Mobile hero buttons 260px wide.
- Text CTA (`.cta-link`): 16px/400 ink + 7.5×12 chevron, 8px gap. Nav CTA: white pill 5px radius over hero, purple (#7e45af) once scrolled (`.overlapping`, threshold 80px).

## Chrome
- Utility bar 53px #171917 (≥1130). Top nav: sticky h0 wrapper + absolute 80px bar (70 mobile), transparent over the hero, rgba(255,255,255,.8) + blur(4px) + shadow when `.overlapping`. Logo 34px (24 mobile).
- Footer: #111c24, 5 × 20% columns, h3 margin 67/22, list gap 16, social 16px icons, copyright 14px. Mobile: accordion headers 32/16 padding with #c1c2c1 rules.
- Ask bar: fixed 808px pill, bottom 32px, 4px conic-gradient ring (desktop); 54px floating icon at ≤1129.

## Motifs
- Radius 5px (cards, buttons), 3px (labels), 9999px (pills). Card shadow `0 4px 4px rgba(0,0,0,.25)` (solution) / `0 1px 7px rgba(0,0,0,.15)` (asset). Solution-card overlay `linear-gradient(transparent, rgba(0,0,0,.5) 28%, #000)`, text-shadow 0 0 6px #474747.
