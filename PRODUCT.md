---
_provenance:
  writtenBy: stardust:replica
  mode: bounded-single
  writtenAt: 2026-09-25T18:44:35Z
  synthesizedFrom:
    - stardust/current/pages/index.json
    - stardust/replica/capture/tokens.json
---

# WKND Adventures — product (descriptive, bounded-single)

Target spec = captured current state of https://wknd-adventures.com/ (home page only). Nothing here is a design decision; every line traces to the capture.

- **Title:** WKND Adventures — Bold Stories. Real Life. Wild Places.
- **Description:** Bold Stories. Real Life. Wild Places. WKND Adventures documents the people, routes, and moments that make the outdoors worth protecting.
- **Purpose (from content):** outdoor adventure magazine — routes, expeditions, destinations, gear guides, field notes; reader submissions.
- **Home page structure (captured section order):** sticky navbar (logo, 3 megamenus: Explore / Stories / Info, Subscribe button, mobile toggle) → full hero (image + overlay, tag, h1, lead, 2 CTAs) → featured article (image + tag/h2/lead/CTA) → "Browse by Activity" tabs (4 tabs × 3 article cards) → ticker strip (10 activity words, looped twice) → "Not sure where to start?" inverse narrow section → "Quick Answers" FAQ (3 items) → "How We Work" editorial index (3 numbered items) → "In the Field" gallery (3 + 1 wide) → accent CTA section → footer (logo/tagline + 3 link columns, bottom bar).
- **Behaviors (site.js):** tab switching, FAQ toggle, mobile nav toggle, megamenu open on hover (>1024) / click (≤1024), ticker CSS animation.
