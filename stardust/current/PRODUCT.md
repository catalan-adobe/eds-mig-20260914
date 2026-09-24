<!-- stardust:provenance
writtenBy: stardust:extract
writtenAt: 2026-09-24T07:12:00Z
readArtifacts: stardust/current/pages/us-en-html.json, stardust/current/pages/us-en-faqs-html.json, stardust/current/pages/us-en-adventures-html.json, stardust/current/pages/us-en-about-us-html.json, stardust/current/_brand-extraction.json, stardust/current/_crawl-log.json
synthesizedInputs: none
flow: replica (same-design) — descriptive snapshot of the live site
-->
# Product
<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Travellers and outdoor enthusiasts browsing guided trips and reading travel stories. The
site addresses them directly in its own copy: "a collective of outdoors, music, crafts,
adventure sports, and travel enthusiasts" (meta description, `pages/us-en-html.json`);
"like-minded adventure seekers" (`pages/us-en-faqs-html.json#body[0]`). Ten locales are
offered in the header language nav (en-US, es-US, en-CA, fr-CA, de-CH, fr-CH, it-CH,
de-DE, fr-FR, es-ES, it-IT); this capture covers `/us/en` only.

## Product Purpose

Present WKND's catalogue of 16 guided adventures (`/us/en/adventures/*` — surf camps,
climbing, cycling, skiing, food tours) with itinerary, price and "what to bring", and
publish a travel magazine of 5 long-form stories (`/us/en/magazine/*`). Site copy:
"With WKND Adventures, you don't just see the world -- you experience its cultures,
flavors and wonders." (`pages/us-en-adventures-html.json#body[0]`); "Our objective is
create a community to help like-minded adventure seekers find fun, engaging, and
responsible ways to to enjoy life and create lasting memories."
(`pages/us-en-faqs-html.json#body[0]`, verbatim including the source's typos).

_provenance: inferred — the footer states the site is Adobe's fictitious reference
site built to demonstrate AEM Core Components (`pages/us-en-html.html` footer text);
"success" for this migration is fidelity to the source, not conversions.

## Positioning

A photo-led adventure-travel brand: full-bleed 1440×810 hero photography, a serif
(Asar) headline voice over a plain sans body, and a single yellow accent. Voice samples
(`_brand-extraction.json § voice`): hero "WKND Adventures"; CTAs "View Trips",
"See Trip", "Full Article", "All Articles", "Read More"; section heads "Recent Articles",
"Next Adventures", "Where do you want to go?".

## Capabilities and Constraints

- Header search on every page (`.cmp-search` → `<page>.searchresults.json?fulltext=`,
  `_crawl-log.json#dynamicSurface.formTargets`, 26/26 pages).
- Sign In / Sign Out links (`#sign-in`, `#sign-out`) and a language navigation
  (10 locales) in the header utility bar (26/26).
- Adventures listing groups trips under `.cmp-tabs`; adventure detail pages render a
  content fragment (facts + Overview / Itinerary / What to Bring tabs) with a mini
  carousel gallery and Previous/Next controls (16 pages).
- Magazine articles carry a byline, a contributor fragment and a "SHARE THIS STORY"
  aside with related dated teasers (5 pages).
- FAQs use an accordion; About Us lists 7 contributor cards with social buttons.
- Runtime dependencies observed: AEM ContextHub (`/conf/wknd/settings/wcm/segments.seg.js`,
  `_jcr_content/contexthub.pagedata.json`), Granite CSRF/currentuser JSON, Adobe Launch
  (`assets.adobedtm.com`), Adobe Audience Manager (`dpm.demdex.net/id`, 4 pages).
- No forms other than search; no video, no iframes captured on any page.

## Brand Commitments

- Register: **brand** (marketing landing pages with photo heroes, teasers and CTAs).
- Observed personality: outdoorsy, editorial, unhurried — serif headlines, generous
  photography, uppercase small labels, one bright yellow accent on white and near-black.
- Observed anti-references (what the source never does): gradients, card shadows,
  rounded buttons, more than one accent colour.

## Evidence on Hand

- `stardust/current/pages/<slug>.json` + `.html` — 26 live Playwright renders (medium wait, 2500 ms, HTTP 200 each) with `_provenance`, headings, body, CTAs, media, `dynamic`, typed `slots`.
- `stardust/current/assets/screenshots/<slug>.png` — 26 full-page captures at 1440 px.
- `stardust/current/_computed-styles.json` — style census, 26 pages × {1440, 360}.
- `stardust/current/_brand-extraction.json` — palette, type, motifs, system components, icon font, voice.
- `stardust/current/assets/` — `logo.svg`, `logo-light.svg`, `favicon.png`, `css/clientlib-{site,base}.min.css`, `fonts/` (Asar, Source Sans Pro, wknd-icon-font).
- `stardust/current/_crawl-log.json` — discovery (26, headless, concurrency 4), consent `auto`, `captureGaps` (none), `dynamicSurface` (31 endpoints), `visionCheck` (26 ok).

## Product Principles

_provenance: inferred — derived from the captured copy and layout, not from an interview.

- Photograph first: every template opens on a large image (hero carousel, lead image, gallery).
- Show the trip, then the facts: adventure pages put the gallery and title above a compact facts column.
- One accent, used sparingly: yellow marks the active nav item, primary CTAs and title underlines only.

## Accessibility & Inclusion

Observed on the source: `alt` text on every captured `<img>` (26/26 pages, e.g. "Female
sitting on a large rock relaxing in afternoon sun"); `role="navigation"`, `role="search"`,
`role="combobox"`/`listbox` on the search; `aria-label` on icon-only buttons ("Clear",
"Toggle Language en-US"). No WCAG statement is published on the site.
