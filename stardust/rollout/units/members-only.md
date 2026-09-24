## C-deliver unit `members-only` — image-list reuse + 1 page (2026-09-24, local unit; stopped before PUT)

**Page:** `content/ca/en/magazine/members-only.html` (archetype, unique template; the only page of the
cluster). Sections mirror the migrated `<main>`: h1 (`container-flush`) · image-list(2 cards,
`container-flush`) · metadata (Title verbatim; the source has no meta description, so no
Description row). Authored by `stardust/.work/rollout/members-only/probes/author-members-only.mjs`
from `stardust/migrated/ca/en/magazine/members-only.html` — every node lifted by structure, no
retyped text.

**Block `image-list` — REUSED from the listing cluster, no edit** (decode tier: reconstructive,
schema `stardust/eds-schema/ca-en-magazine-members-only-html.json`). The page authors card rows only
(`picture | title link | description`) and no label row, so `decorate()` takes its flat-list branch
(one `ul.items`, no tab strip) — the shape the source `.cmp-image-list` without `.cmp-tabs` renders.
No variant class needed: the block's own CSS is the prototype's `.image-list*` rules already.

**Named assumptions (hands-off):**
- A-MO-1 Images: no DA org/repo/token — editorial `<img src>` are the captured SOURCE URLs
  (`https://wknd.site/ca/en/magazine/members-only/<slug>/_jcr_content/…coreimg.jpeg/…`, anonymous
  200 → media-reconcile 2 optimize). `da-media-upload.mjs --scope members-only` + src rewrite at PUT.
- A-MO-2 Card hrefs authored root-relative extensionless (`/ca/en/magazine/members-only/<slug>`), as
  every other cluster does; `localize-links.mjs --check` at E2.
- A-MO-3 Both sections carry `container-flush`: the migrated `<section>`s have no `.col` (no 14px
  gutter) inside `.container-fixed`. The rule lives in `blocks/image-list/image-list.css` (listing's
  scoped override); one line appended to `foundation-requests.md` naming this template as affected.
- A-MO-4 The schema generator read the prototype's `.container-fixed` as ONE section (h1 + list);
  kept as generated — qa-gate matched block 0 (image-list) to it and its repeat count (2) to the
  2 rendered cards. block-roundtrip is mapped to the list section only
  (`--map 'image-list=main section:has(> .image-list)'`), the h1 being default content.

**Local asserts:** delivery-lint 0/0/0 · media-reconcile 2 optimize · davids-model-lint 0 🔴 0 🟡 ·
sanitise unchanged (ASCII) · build-harness 2 section-metadata folded · qa-gate PASS 13/13 (units 2 ≥ 2,
0 pageerror, 0 broken img) · block-roundtrip `--ew` image-list closed, EW 4/4 editable, dead 0,
duplicated 0, 0 structural 🔴 (per-block and whole-page) · measure.mjs harness vs migrated @1440/@360:
h1, both card imgs, both title links Δx/Δy/Δw/Δh 0, root scrollWidth Δ 0 (footer Δh +29/+44 = the
harness resolving chrome, as every ca/en unit records) · `foundation-freeze.mjs check` unchanged.
Not run (needs the DA target): PUT / preview / `.plain.html` checks, published-origin pixel + crop
gates, `update-coverage.mjs` rows.
