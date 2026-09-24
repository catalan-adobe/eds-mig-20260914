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
