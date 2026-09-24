## C-deliver unit `magazine-hub` — teaser-list block + 2 pages (2026-09-24, local unit; stopped before PUT)

**Pages:** `content/us/en/magazine.html` (archetype), `content/ca/en/magazine.html` (sibling; same
text, locale hrefs + image URLs from its own capture; its members-only teasers carry the linked
`Read More` CTA the capture has — the `teaser-list--linked-cta` content variant, no CSS fork).
Sections mirror the prototype's nine: h1 · teaser-featured (pretitle + h2 + description + CTA |
image) · h2 `title-underline` · image-list (5 flat card rows, no tab labels) · h2 `title-underline` ·
p (`<strong>Sign in&nbsp;</strong>…`) · empty `separator-space-medium` · teaser-list `secure` (2 rows)
· metadata (Title + Description verbatim). Encoder:
`stardust/.work/rollout/magazine-hub/probes/encode-magazine.mjs <locale>` (lifts every node from the
migrated main by structure; image `src` = the page's live source from `stardust/current/pages/`).

**Block `teaser-list` — decode tier: reconstructive** (repeat group; schema
`stardust/eds-schema/us-en-magazine-html.json § alaskan-adventure / fly-fishing-the-amazon`, qa-gate
view `.blocks.json` by `probes/blocks-view.mjs`: default-content sections removed, the two source
`.col--4` teaser sections folded into the one block they are authored as). Container shape, one row
per teaser, cells classified by CONTENT never index: the cell with a picture/img is the image; the
cell with a heading is the content (heading + description paragraphs; a link-only paragraph in it is
an action, EW3); any other cell holds the action(s) — `<p><a>` (linked) or a plain `<p>` label (the
source's signed-out "Read More" text). `decorate()` MOVES every node (EW1) into `.teaser-item >
.teaser > .teaser-content (h2, .teaser-description, .teaser-actions) + .teaser-image > .image`
(wrappers carry the classes, EW2); re-entrant (EW9). Variant `secure` = the source
`body.anonymous .cmp-teaser--secure` state (lock glyph `\e98f` badge with the accent diagonal,
`.teaser` opacity .65, grey `#ebebeb` action label). CSS = the prototype's `.col--4` /
`.teaser--list` / secure rules re-scoped; the block spans the section gutters
(`margin: 0 -14px`) so each `.teaser-item` is a border-box 1/3 column with 14px gutters (50 %
768–1024, 100 % ≤ 767) — the source grid cell.

**Reuse (no edits):** `teaser-featured` (locale-landing), `image-list` (listing) — authored in their
documented shapes; both round-trip closed on this page.

**Named assumptions (hands-off):**
- A-mag-1 Two source `.col--4` teaser sections = ONE `teaser-list` block with two rows (siblings in
  a floated grid, not stacked sections); qa-gate view folds them accordingly.
- A-mag-2 No sign-in exists in the replica, so `secure` renders the anonymous state unconditionally
  (`body.anonymous` is not modelled).
- A-mag-3 Images: no DA org/repo/token — authored as the page's live URLs (media-reconcile 8/8
  `optimize`). Rehost via `da-media-upload.mjs` once the target exists.
- A-mag-4 Section style `separator-space-medium` (2em margins) shipped as a scoped override in
  `blocks/teaser-list/teaser-list.css` (+ `display: flow-root` to escape the foundation's `:empty`
  hide); queued in `foundation-requests.md` (lands late on the published origin → CLS until moved).
- A-mag-5 CANDIDATE INCONSISTENCY-REGISTER ENTRY (main agent decides): the source's two members-only
  descriptions differ in markup — Alaskan is rich text (`<p>`, 13.5px bottom margin), Fly Fishing is
  bare text (no margin). The block models the description as a paragraph, so Fly Fishing's action
  label + image sit 13.5px lower than live (its own column only at ≥ 768; page −14px at 360 stacks).
  measure.mjs harness vs prototype: every other box Δ 0 at 1440/1024/768/360.
- A-mag-6 The featured teaser's CTA `Read More` (a `.teaser__action` link in the source) is a plain
  `<p><a>` (no strong/em → not buttonized); `teaser-featured`'s own CSS styles it as the accent pill.

**Local asserts (harness http://localhost:3000/stardust/.work/harness/magazine.html, magazine-ca.html):**
delivery-lint 0/0/0 both · davids-model-lint 0 🔴 0 🟡 both · media-reconcile 8 optimize both ·
sanitise 4 chars each · qa-gate 18/18 both (units: image-list 5 ≥ 5, teaser-list 2 ≥ 2) ·
block-roundtrip `--blocks teaser-list --ew` closed both (us: 6=6 text nodes — 2 headings, 4 eyebrows;
ca: 2 headings, 2 eyebrows, 2 CTAs; EW 6/6, 0 dead / dropped / duplicated; proto mapped to a
`.teaser-list-group` wrapper around the two source sections in `schema-src/*/magazine-rt.html`) ·
whole-page run closed both (teaser-featured 4/4, image-list 10/10, teaser-list 6/6; EW 20/20) ·
measure.mjs vs prototype @1440/1024/768/360: h1, 5×h2, 8×img, footer Δ 0 except the A-mag-5 image
(Δy −13/−14); ca `main a` (accent CTAs) Δ 0; crop-compare teaser band @1440: Alaskan column identical
(badge, label, image), Fly Fishing column = the 13px shift · `npm run lint` clean ·
`foundation-freeze.mjs check` unchanged (66 files). Pixel/crop gates deferred to the published
origin. Publish decision unchanged: preview-only until the DA target exists.
Not run (needs the DA target): PUT / preview / `.plain.html` checks, published-origin pixel + crop
gates, `update-coverage.mjs` rows.
