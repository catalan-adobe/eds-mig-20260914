# Rollout plan — wknd.site → AEM EDS (replica, hands-off, all 64 pages)

Machine plan: `plan.json` (representative-first, per page `convert` / `reuse`), ledgers under
`coverage/`. This file records the decisions the scripts do not carry.

## Delivery constraint — no DA target (named assumption)

`rollout.json.site.da.{org,site,ref}` and `site.liveHost` are **null**: no DA org/repo, no
`DA_TOKEN`, no `fstab`/config anywhere in the project or the environment (checked
`stardust/state.json.site`, `direction.md`, `journal.md`, env `DA_*`). The code remote is
`github.com/catalan-adobe/eds-mig-20260914` — a candidate `{branch}--eds-mig-20260914--catalan-adobe.aem.page`
host, NOT confirmed, not written into `rollout.json`.

**C-deliver therefore runs its LOCAL units only**: author blocks + content → `delivery-lint.mjs` +
boilerplate lint → `media-reconcile.mjs` (decisions only, no upload) → `davids-model-lint.mjs` →
`sanitise.js` → local structural asserts (`qa-gate.mjs`, `block-roundtrip.mjs --ew`) — and **stops
before PUT**. No preview, no published-origin pixel gate, no `deployed` coverage rows; pages stay
`pending` with blocks `converted`. Phases D–I are blocked on the DA target.

## Inventory (A)

- 64 pages, 9 templates, 0 content-pending (every page individually migrated → `inventory.mjs`
  WITHOUT `--state`; `--state` is archetypes-only mode and split the tree into 64 singleton templates).
- 21 distinct modules → 4 default content (`title`, `text`, `image`, `button`; deploy D1) + 17 blocks.
- 306 module instances → 17 conversions.

## Foundation (C0) — outside blocks.json by design

Sidecar `modules[]` carries body modules only; header/footer live in `canonShas`. The foundation
unit owns: `styles/` (canon.css lifted), fonts, favicon, `head.html`, `blocks/header`, `blocks/footer`,
`/nav` + `/footer` documents — one per locale where the source has per-locale nav
(`us/en`, `ca/en`, `us/es`, `ca/fr`, `ch/de`, `ch/fr`, `ch/it`, `de/de`, `es/es`, `fr/fr`, `it/it`),
`stardust/runtime-contract.json`. Freeze with `foundation-freeze.mjs freeze` before any cluster spawns.

## Template clusters (C1…C9) — one unit each, blocks converted once site-wide

| # | Cluster | Archetype (template id) | Pages | Converts | Reuses (from) |
|---|---|---|---|---|---|
| C1 | program | us-en-adventures-riverside-camping-australia-html | 32 | breadcrumb, mini-carousel, content-fragment-elements, tabs | — |
| C2 | locale-landing | us-es-html | 9 | teaser-hero | — |
| C3 | about | us-en-about-us-html | 2 | contributor | — |
| C4 | faqs | us-en-faqs-html | 2 | accordion | — |
| C5 | article | us-en-magazine-western-australia-html | 12 | content-fragment, text-quote, byline, sharing, download, list-upnext | breadcrumb (C1) |
| C6 | listing | us-en-adventures-html | 2 | image-list | tabs (C1), teaser-hero (C2) |
| C7 | landing | us-en-html | 2 | hero-carousel, teaser-featured | image-list (C6), teaser-hero (C2) |
| C8 | magazine-hub | us-en-magazine-html | 2 | teaser-list | teaser-featured (C7), image-list (C6) |
| C9 | members-only | ca-en-magazine-members-only-html | 1 | — (default content) | image-list (C6) |

Waves (a wave waits only on a real block dependency): **W1** C1 C2 C3 C4 concurrently ·
**W2** C5 C6 · **W3** C7 · **W4** C8 C9. With ≥4 clusters in flight use `--concurrency 1`.

## Tier bias per block (replica: template-slotted for fixed composition, reconstructive for repeat groups)

- **template-slotted** (fixed slots, author fills cells): breadcrumb, content-fragment-elements
  (6 fixed facts), content-fragment (article body), byline, sharing, download, text-quote,
  teaser-hero, teaser-featured.
- **reconstructive** (repeat groups, one row per item): mini-carousel (slides), tabs (3 panels),
  hero-carousel (3 slides), image-list (up to 32 cards), list-upnext (cards), teaser-list (listing),
  contributor (7 repeated cards), accordion (7 items).
- **default content**: title, text, image, button — no block; D1 mapping recorded in `blocks.json`.

Boilerplate blocks present and unused by the plan (`cards`, `columns`, `hero`, `widget`): the
cluster that would reach for one reuses the plan name instead — no second name for the same module.
