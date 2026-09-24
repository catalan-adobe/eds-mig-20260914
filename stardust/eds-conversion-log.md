# EDS conversion log — replica wknd.site/us/en → replica-wknd--eds-mig-20260914--catalan-adobe

Written by the rollout prepare step (Phase 5 handoff, 2026-09-24). Cluster and foundation
subagents append their per-section decode tiers and lint residues below their own heading.

## Target

- DA: org `catalan-adobe`, repo `eds-mig-20260914`, code branch `replica-wknd`.
- Preview `https://replica-wknd--eds-mig-20260914--catalan-adobe.aem.page`,
  live `https://replica-wknd--eds-mig-20260914--catalan-adobe.aem.live`.
- Runtime contract: `stardust/runtime-contract.json` (vanilla EDS, `formatted-only`
  buttonization in `p.button-wrapper`, Trusted Types default policy installed by `scripts.js`,
  `/nav` + `/footer` chrome documents, `emptySectionCollapse: true`).

## Publish decision — PUBLISH (POST /live per page)

Decided hands-off at prepare time, once, for the whole rollout: every page, `/nav` and
`/footer` go PUT → preview → **live**. Rationale: rollout Phase D verifies the LIVE origin
(`assemble.mjs --verify-origin …aem.live`, the root `/` check, the served sitemap) and the
header/footer blocks build from the `/nav` and `/footer` documents on the live tree; the
final source-fidelity gate is judged on the published origin. Staying preview-only would
leave D-site with nothing to verify. `deploy-batch.mjs` therefore runs WITHOUT
`--no-publish`.

**Pre-existing DA content (assumption A-RO-1, direction.md).** The DA repo already holds
documents from an earlier, unrelated deploy in this repo (root-level `/about.html`,
`/footer.html`, …). Our page tree lives under `/us/en/…`; the chrome documents are `/nav`
and `/footer` at the root. Overwriting the root `/nav` and `/footer` is accepted; the other
foreign root documents are left untouched (they are not in coverage and are not published
by us). D-site's sitemap verification compares against coverage rows, so a foreign
document still published from the earlier deploy shows up there as an "extra path" — the
D-site agent lists and unpublishes (or `noindex`es) such rows, never our pages.

## Locked block names (Phase B, deploy § 2) — LOCKED, do not rename

| sidecar module id | edsBlockName | kind | collection pattern (D11) | converted by | reused by |
|---|---|---|---|---|---|
| hero-carousel | `hero-carousel` | block | carousel content model (1 row per slide: image \| text with h1/h2 + p + CTA) | landing (us-en-html) | — |
| featured-teaser | `featured-teaser` | block | none — WKND teaser (1 row: image \| text) | landing | listing (magazine) |
| hero-teaser | `hero-teaser` | block; variant `image-bottom` on landing | none — full-bleed teaser | landing | listing (adventures) |
| image-list | `cards` | block (overwrites the stock `blocks/cards/`) | cards (1 row per card: image \| link title + description) | landing | listing (adventures tabs panels, magazine) |
| list-teaser | `list-teaser` | block | none — 3-col secure teasers | listing (magazine) | — |
| tabs | `tabs` | block; variant `cards` for panels that hold a card list | tabs (1 row per tab: title \| content) | program (climbing-new-zealand) | listing (adventures) |
| mini-carousel | `mini-carousel` | block | carousel content model, image-only slides | program | — |
| trip-facts | `trip-facts` | block | none — 1 row per fact: label \| value | program | — |
| sharing | `default-content` (omitted) | not a block | empty `fb-share-button` + empty Pinterest anchor; no CSS, zero rendered pixels in the gated prototypes (A-RO-4) | — | — |
| content-fragment | `article-body` | block | none — article prose stream (h1, h4 byline, h3, captioned images, h2/p) | article (san-diego-surf) | article siblings |
| contributor-byline | `contributor-byline` | block | none — byline image + name + occupations + social buttons | article | article siblings |
| upnext-list | `upnext-list` | block | none — sidebar list of article links + dates | article | article siblings |
| download | `download` | block | none — PDF title link + description + `dl` properties; the PDF is served root-relative from the code origin (never `content.da.live`) | article (guide-la-skateparks) | — |
| contributor-card | `contributor-card` | block | none — about-us contributor rows | static (about-us) | — |
| accordion | `accordion` | block | accordion (1 row per item: title \| panel) | unique (faqs) | — |

Default content (not blocks, D1): page titles (`h1.page-title`), section titles with the
accent underline (h2 + section style `underline`), breadcrumbs (`ol` of links + section style
`breadcrumb`), separators (`<hr>`), body text (`text--font-small` → section style
`font-small`), button lists (`strong`/`em` links → `p.button-wrapper` buttons; icon buttons
carry `span.icon.icon-<name>`). Their CSS is FOUNDATION scope (`styles/styles.css`).

Two triage questions per section (D1 block-or-not, D11 collection pattern) are answered
in the table above; the decode tier per section (template-slotted / reconstructive) is
recorded by each cluster below.

## Foundation (C0) — appended by the foundation subagent

## Landing cluster — appended by its subagent

Page `us-en-html` → `/us/en` (archetype, template us-en-html). Schema
`stardust/eds-schema/us-en-html.json` (10 sections). Media: 13 editorial images rehosted to
`media/wknd/` (`da-media-upload.mjs --manifest`, source fetch 200, plain technique).

| section (schema) | authored as | block | decode tier |
|---|---|---|---|
| hero | 3 rows: image \| h1/h2 + p + `<strong><a>` (section style `flush`) | `hero-carousel` | reconstructive (one slide per row; heading-boundary fallback) |
| featured-article | 1 row: image \| `<p><strong>` eyebrow + h2 + p + CTA | `featured-teaser` | template-slotted |
| recent-articles-title / destinations-title | default content h2 (`underline`) / h3 | — (D1) | — |
| recent-articles / destinations | 4 rows: image \| `<p><a>` title + p | `cards` (stock block replaced) | reconstructive (one card per row; media-boundary fallback) |
| all-articles-cta / all-trips-cta | default content `<p><strong><a>` → foundation button | — (D1) | — |
| separators | empty section, style `separator` | — (D1) | — |
| next-adventures-title + next-adventure | ONE section: default-content h2 + block, styles `flush, underline` | `hero-teaser` (variant `image-bottom`) | template-slotted |

Decisions (hands-off, recorded in direction.md): carousel controls carry aria-labels and
icon-font glyphs, no DOM words (#100) — the live "Previous"/"Next"/indicator texts are
`display:none`/`font-size:0`, so 0 rendered pixels (round-trip 🟡 MISSING BODY ×5 accepted);
the "Next Adventures" title shares the hero-teaser section so its 27px top margin cannot
collapse into the separator's 4rem (live `.column` floats are BFCs) — block CSS scopes
`main .section.hero-teaser-container .default-content-wrapper` (flow-root, container width)
and cancels the `underline` ::after on the block's own heading; foundation request filed
(`main .section.separator { display: flow-root }` or padding) for every other template.
Every block is `display: flow-root` for the same reason. R-01 applied in hero-carousel CSS
(h1 at `--heading-xl`).

Gates (harness, structural): `davids-model-lint` 0 🔴 / 0 🟡; `delivery-lint` 0 P0 · 0 P1 · 4 P2
(cross-origin-optimize advisories — this cards block does not call createOptimizedPicture);
`media-reconcile` 13 hosted; `block-roundtrip --ew` (maps: `section.carousel--hero`,
`section.teaser--featured`, `section:has(> .card-list)`, `section.teaser--hero`) 0 🔴,
EW 33/33 editable, 0 dead, 0 duplicated; `qa-gate` 20 ok / 3 warn / 2 fail — both fails
explained: the 2 "broken images" are the frozen header/footer logos on `preview.da.live`
(auth-gated for the anonymous harness, fine on the preview origin) and the schema→block
order heuristic paired `recent-articles` with `hero-teaser` (round-trip proves 4/4 cards in
both cards instances). Lint: eslint 0, stylelint 0 on the four blocks.

Published-origin gate (preview URL, `gate.sh --full`, live capture cached, 4 rounds):
pub1 1440 10.23 % Δh −54 / 360 19.87 % Δh −95 → three lifts the harness could not show —
(1) live images are inline `<img>` inside a block `div.image`, so every image line box carries
a 7px baseline descender (cards 4×7, hero + featured + hero-teaser at 360): `<picture>` now
plays the block box and the `<img>` stays inline; (2) `main`'s last section margin collapsed
into `footer .footer { margin-top: 3rem }` (−48px; live `.page-main`/`.site-footer` are floats):
`main:has(> .section.hero-carousel-container) { display: flow-root }` in hero-carousel.css +
foundation request; (3) the carousel controls: the UA-font buttons (13.333px/normal, 1px 6px)
and the inner `.hero-carousel-inner { margin-bottom: 4em }` box so the floated controls hang
below it as on live (+10px). pub3 found the desktop hero image at its intrinsic 810px: live
L367 sizes the INNER `.image` box to 640px too — a definite height the img's `height: 100%`
can resolve against (flex-basis 0 % leaves the flex item indefinite) — restored on `picture`.
**pub4: 1440 2.00 % Δh 2px, 360 2.41 % Δh 3px, 0 overflow → PASS**; crop bands 1440 header
0.09 % / footer 0.02 %, 360 header 0.48 % / footer 0.89 % (bar 2 %); chrome-parity 25 = the
foundation's justified set (A-C0-8: "Sign In" colour queued, icon-link names) + footer Δy −2px
(= the two 1px separators, request filed); content-diff 13 🔴 — 9 in chrome (foundation set),
4 in main: "San Diego Surf Spots" ROLE SWAP / MISSING CTA (the dropped hidden indicator text,
A-C1-1 — the card link is present, extensionless) and the two `aria-label`s on the All
Articles / All Trips buttons ("read our articles", "explore our adventures") — DA strips
`aria-*` from authored anchors; the visible text stays descriptive — accepted residual.
Computed-style guard 1440 + 360: 12 sections, 5 blocks flex, 16 visible images loaded,
0 pageerror. Carousel driven on the preview: next/prev/dot move the active slide, 1 visible.
`.plain.html`: 200, 1 h1, 0 about:error, 0 /img/, 13 `<picture>`/alt. `ai-readability`
strict 100 % / code 100 %. Published (POST /live 200, aem.live 200).

## Program cluster — appended by its subagent

## Article cluster — appended by its subagent

## Listing cluster — appended by its subagent

## Static cluster — appended by its subagent

## Unique cluster — appended by its subagent

## Lint environment (prepare finding, 2026-09-24)

- `npm run lint:css` passes on the stock tree. `npm run lint:js` (`eslint .`) could not load
  `@babel/core` — the peer of `@babel/eslint-parser` is in `package-lock.json` (7.24.7) but
  absent from `node_modules/`, and `npm install` is forbidden in this run (it prunes the
  `--no-save` gate deps). Workaround in place for every agent, machine-local and gitignored:
  `NODE_PATH="$PWD/stardust/.work/lint-babel/node_modules" npm run lint:js`
  (`@babel/core@7.24.7` installed under that separate prefix; the project `node_modules/` was
  not touched).
- With the parser loading, `eslint .` reports 92 errors / 51 warnings — ALL under `stardust/`
  (`prototypes/*.js`, `migrated/assets/*.js`, `scripts/deploy/sanitise.js`), 0 in
  `blocks/`, `scripts/`, `styles/`. `stardust/` is already in `.hlxignore` (never served) and
  is frozen design evidence, not runtime code: the FOUNDATION unit (the only unit allowed to
  touch project-root files) adds `stardust/` to `.eslintignore` — this is not the forbidden
  "ignore for runtime files". Until then, clusters lint their own files by path:
  `npx eslint blocks/<name>` + `npx stylelint "blocks/<name>/*.css"`.

## C0 foundation — decode tiers and foundation vocabulary (2026-09-24)

- header, footer: template-slotted (chrome). Authored documents `/nav` (brand / sections / tools)
  and `/footer` (logo / nav / heading / social list / text), both `Robots | noindex`, published.
- Fonts: Asar 400 (headings), Source Sans Pro 300/400/600 normal+italic (body), wknd-icon-font
  (block) — all self-hosted under `fonts/`, declared in `styles/fonts.css`; fallbacks
  `asar-fallback` (Georgia 95.56%) and `source-sans-pro-fallback` (Helvetica Neue 93.5%) in
  `styles/styles.css`. Licences: SIL OFL 1.1 (Google Fonts) + the site's own icon font.
- Section styles (D1 closed set): `flush`, `underline`, `font-small`, `dark`, `separator`, `spacer`,
  `breadcrumb`, `article-layout`, `program-layout`. Template body classes: `landing`, `article`,
  `program`, `static`, `unique`, `listing` (metadata `template`).
- Lint: `npm run lint` (with the `.work/lint-babel` NODE_PATH) 0 hits; `stardust/` ignored.
