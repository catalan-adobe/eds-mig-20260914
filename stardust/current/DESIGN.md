---
_provenance:
  writtenBy: stardust:extract
  mode: prep
  writtenAt: 2026-10-26T15:51:19Z
  readArtifacts:
    - stardust/current/pages/*.json (79 pages)
    - stardust/current/DESIGN.json
---

# Backlinko — design (descriptive, site scope)

Captured from 79 pages of https://backlinko.com/ (roster cap 100/20 of 571 in the sitemaps).
Same global stylesheet on every template (Next.js + emotion, Bootstrap-style grid).

- **Type:** Inter (self-hosted variable font) everywhere. Body 16px / 1.8; page wrap 18px;
  headings 800 / 1.4. Home hero h1 40px desktop / 34px mobile; section h2 38px / 32px.
- **Palette:** white canvas, brand green `#00bc98`, navy footer `#1d2b35`, tint bands
  `#f8f9fe` / `#eef0f7`, muted `#646568`, rust links `#bb4a03`; hub topic colours cyan
  `#2ec4d8`, coral `#f15e4a`, amber `#f7aa04`, violet `#8256c5`; promo orange `#ff642d`.
- **Layout:** container 540 / 720 / 960 / 1140 at 540 / 768 / 992 / 1200; header row 1320.
  Articles use a 1320 shell with a 740 content column; hub pages a 1140 shell.
- **Chrome:** fixed promo bar (62 / 111px), fixed 80 / 60px header with headroom pin/unpin,
  Articles + Tools mega menus, mobile drop; dark three-column footer — identical on all templates.
- **Modules:** promo bar, header, footer (all pages); hub row (8), hub topic list (13),
  tool card (home, /tools), post cards and section heading (home, /blog).
