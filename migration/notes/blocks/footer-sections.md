# footer-sections — intro banner, connect-with-us banner, footer

## What was built

1. **Intro banner** (default content, no block) — `<h2>` + `<p>` centered, section style
   `intro-section`. Text matches the reference exactly including the `&nbsp; &bull;&nbsp;`
   bullet-separator spacing pattern (`Supercharge Productivity&nbsp; •&nbsp; Conquer
   Complexity&nbsp; •&nbsp; Accelerate Time-to-Market`).
2. **Connect-with-us banner** (default content) — `<h2>Connect with Us</h2>` + an
   `*em*`-wrapped link so the vendored `decorateButtons` turns it into `a.button.secondary`;
   section style `purple-gradient, connect-section` (reuses the existing shared
   `purple-gradient` section style, adds a local `connect-section` hook for typography).
   `connect-section` overrides `.secondary` to render as a solid white pill (matches
   reference) instead of the global outlined-white secondary look.
3. **Footer** (`blocks/footer/*`, rewritten) — loads `getMetadata('footer') || '/footer'` as a
   fragment (unchanged contract). The fragment doc (`spm-ft-0001/footer.html`) has 3 sections,
   each tagged via **Section Metadata** style so `footer.js` can pick them up after
   `loadFragment` decorates/loads them:
   - `footer-nav`: four `h3`+`ul` pairs (Company/Resources/Trending/Learn) → JS groups them
     into columns, wraps each heading in a real `<button>` (keeps `<h3>` for landmark
     semantics) that toggles an `aria-expanded`/`.is-expanded` accordion on mobile; CSS makes
     all columns always-open at `>=992px` and disables the button's `pointer-events`.
   - `footer-tools`: one `<img>` (Synopsys logo) + two `<ul>` (first = language links,
     current language is the first `<li>`; second = social links, text = platform name).
     JS builds a custom language `<button>` (globe icon + current label + caret) with a
     dropdown menu of the other languages, closing on outside click; social `<a>` text is
     replaced with a brand icon matched by `href` hostname (`x.com`→x-twitter,
     `linkedin.com`, `facebook.com`, `youtube.com`, `instagram.com`). The single authored
     `<picture>`/`<img>` logo is cloned into both a mobile-top and a desktop-bottom slot
     (mirrors the reference's own `.logo-top`/`.logo-bottom` duplicate-and-toggle pattern).
   - `footer-legal`: one `<p>` with the copyright + legal links, literal ` | ` separators as
     authored plain text (matches reference markup exactly); the `Cookie Settings` link is
     `href="#"` with a `preventDefault` click handler (does nothing, as instructed).
4. New icons (unique names, `currentColor` fills so they inherit link color):
   `icons/globe.svg`, `icons/x-twitter.svg`, `icons/linkedin.svg`, `icons/facebook.svg`,
   `icons/youtube.svg`, `icons/instagram.svg` — paths lifted from the reference's own inline
   FontAwesome-Free SVGs (already used on the live site, permissively licensed).
5. `styles/styles.css` delimited block (end of file, footer-sections agent) adds: `intro-section`
   and `connect-section` section styles (padding, centering, heading/paragraph sizing —
   desktop sizes already matched the pre-existing global `h2`/`p` rules almost exactly, so
   only spacing/max-width/centering needed adding) and one generic default-content rule
   (`h1/h2/h3 + p` spacing).

## Content model

| Doc | Section (Style) | Shape |
|---|---|---|
| `migration/sections/intro-connect.html` (part 1, before `<!-- connect -->`) | `intro-section` | `h2` + `p` |
| `migration/sections/intro-connect.html` (part 2, after `<!-- connect -->`) | `purple-gradient, connect-section` | `h2` + `p><em><a>` (secondary button) |
| `migration/sections/footer.html` (= DA `spm-ft-0001/footer.html`) section 1 | `footer-nav` | 4× (`h3` + `ul>li>a`) |
| … section 2 | `footer-tools` | `img` (logo) + `ul` (languages) + `ul` (socials) |
| … section 3 | `footer-legal` | `p` (copyright + `a` legal links, `\|` separators) |

All links are absolute (`https://www.synopsys.com/...` or the original external host).
Language target URLs are inferred (`/ja-jp.html`, `/zh-cn.html`, `/zh-tw.html`, `/ko-kr.html`)
since the reference used internal AEM authoring paths (`/content/synopsys/ja-jp.html`) that
aren't public — flagged as a gap below.

## Evidence (mismatch %, `tools/compare.sh`, fuzz 10%)

Images: `$MAIN/migration/evidence/blocks/footer-sections/` (`final-*-sbs.png` / `-diff.png`
are the last round; `cmp-*` are the round-2 intermediates kept for the delta story).

| section | viewport | crop (ref / eds) | mismatch |
|---|---|---|---|
| intro | desktop | 1440x211+0+753 / 1440x211+0+53 | 3.24% |
| connect | desktop | 1440x285+0+4017 / 1440x278+0+264 | 2.97% |
| footer | desktop | 1440x574+0+4302 / 1440x575+0+542 | 4.31% |
| intro | mobile | 390x280+0+560 / 390x280+0+0 | 8.74% |
| connect | mobile | 390x285+0+6357 / 390x287+0+280 | 6.43% |
| footer | mobile | 390x676+0+6642 / 390x684+0+567 | 6.68% |

Crops are anchored on each section's own top (via `getBoundingClientRect()`), not the
reference's absolute page Y, because the header/hero above these sections belong to other
agents and were still placeholder/demo content in this worktree's shared preview — comparing
section-to-section content instead of full-page-Y keeps the number about *my* work.

3 capture/compare rounds: (1) first pass surfaced the intro heading wrapping to 2 lines (a
stray `max-width: 900px` I'd guessed) and short section heights (~30-40px per section); (2)
fixed the max-width and tuned desktop paddings from the inventory JSON's exact box
coordinates (footer landed within 0.02px of the reference); (3) mobile-only padding pass (the
mobile paddings needed to be considerably larger relative to content than desktop, since
the reference's mobile accordion/legal rows are roomier) plus a real interaction bug fix (see
below) and a final re-capture confirming both viewports.

Interaction states verified via `playwright-cli` clicks + screenshots:
- Mobile footer accordion: clicking "Company" flips the caret and reveals `About Us` … list
  (found + fixed a bug: the accordion `ul` is a *sibling of the column*, not of the toggle
  `<button>` nested inside the `<h3>`, so a `~` sibling-combinator on the button never
  matched — switched to a `.footer-nav-col.is-expanded ul` class toggled by JS).
- Mobile language selector: clicking "English" opens the dropdown with the other 4 languages.
- Desktop: nav headings are non-interactive labels (`pointer-events: none`), columns are
  always expanded, matching the reference (no accordion on desktop).
- No CSS transitions/animations in the reference for these 3 elements beyond the button
  hover/focus states already covered by the shared global button/link CSS; caret rotation
  uses a `0.2s` CSS transition (no reference timing to match — no JS-driven animation here).

## Remaining gaps

- Mobile mismatch % (6.4-8.7%) is higher than desktop; visually the `-sbs.png`s show only
  sub-pixel text-reflow "ghosting" (my footer is 684px vs ref 676px, 8px over — good enough,
  didn't chase further to stay within time budget).
- Language target URLs for non-English locales are inferred from the site's own URL
  conventions (not verified against a real published page — the source markup used internal
  CMS authoring paths that don't resolve publicly).
- The floating circular "AI assistant" launcher visible near the top of the mobile
  full-page reference screenshot (around the intro slot) is a fixed-position, page-global
  widget, not part of any of the 3 sections I own — left alone (brief only asks to hide
  `#chat-bar`, this is a different widget with its own id and not something I found
  documented; may need proactive handling by whichever agent handles global fixed elements).
- Footer JS assumes exactly 2 `<ul>` in the `footer-tools` default-content-wrapper
  (language, then social) and 1 `<img>` (logo) — reasonably defensive (guards on
  missing elements) but relies on authors keeping that fixed order; documented above and in
  the code comments.

## Learnings — GENERIC (hypotheses, may transfer to other EDS migrations)

- A vendored `aem.js` copy can be a **stripped-down boilerplate variant**: this repo's
  `decorateButtons` only turns a lone `p > a` into `a.button` when it's wrapped in `<strong>`
  or `<em>` — a plain unformatted link-in-paragraph stays plain text (no `.button` class at
  all). Don't assume every "button convention" described in secondary docs/digests applies to
  every vendored copy; grep the actual `aem.js` in the repo before relying on a documented
  behavior.
- **Section Metadata is a server-side (Helix pipeline) feature, not a client `aem.js`
  feature** in at least this vendored copy: `decorateSections`/`decorateBlocks` in the local
  `aem.js` have zero code referencing `section-metadata`, yet `.plain.html` on the real
  preview server comes back with the `Style` value already applied as a class directly on the
  section `<div>` and the metadata block itself stripped from the output. Verify this by
  fetching `.plain.html` after a `da.sh preview`, not by reading the client JS.
- DA source docs for **fragments** (footer/nav) still need the full `<body><header></header>
  <main>…</main><footer></footer></body>` envelope for the content pipeline to block-ify
  correctly — pushing bare section `<div>`s (no `<body>/<main>`) silently produces an empty
  `.plain.html`. `loadFragment()` strips the envelope back out at runtime, so the doc-on-disk
  and the fetched fragment shape don't need to match.
- Authored `<img src="https://.../original-cdn-url">` in DA HTML *does* get converted into a
  fully responsive `<picture>` (webp sources, multiple widths) by the preview pipeline for
  plain default-content images, not just for block-model images — confirmed by inspecting
  `.plain.html` after preview, no client-side `createOptimizedPicture()` call needed for
  default content.
- A third-party image CDN (Scene7/Dynamic Media style `?qlt=&$responsive$&...`) can **403 an
  unwidthed request** — dropping the `wid` parameter for "highest quality" isn't always safe;
  probe the URL with `curl -o /dev/null -w '%{http_code}'` both with and without the
  parameter before deciding which to keep.
- When measuring "my section" fidelity inside a shared multi-agent page, anchor screenshot
  crops on `getBoundingClientRect()` of my own section class rather than the reference's
  absolute page Y — the true page assembly (other agents' header/hero heights) isn't
  observable from inside a single block's worktree/preview.
- Extremely long git-worktree branch names (from an orchestration system) can exceed the AEM
  CLI's 63-char DNS-label limit for the code-preview origin, and `aem up --url` does **not**
  bypass that check (it only sets the *content* origin, not the code-preview origin derived
  from the branch name). Workaround: temporarily `git checkout -b <short-name>` in the same
  worktree to run the dev server (uncommitted changes carry over safely since there's no
  divergence), then `git checkout <original-branch>` before committing.

## Learnings — SYNOPSYS-SPECIFIC

- Bullet-separator paragraph in the intro banner uses `&nbsp;` immediately before *and* a
  literal space after each `&nbsp;`+`•` (i.e. `Word&nbsp; •&nbsp; Word`, not `Word &nbsp;•
  &nbsp;Word` or a plain ` • `) — copied verbatim from the rendered DOM text node, easy to
  get subtly wrong by "cleaning up" the whitespace.
- Footer's `Connect with Us` visible heading in the source site is `font-weight: 800` (not a
  generic bold 700) at `38.4px` desktop / `19.2px` mobile — an unusual size progression
  (not a round factor), taken directly from the inventory JSON's computed style rather than
  eyeballing the screenshot.
- The site's mobile footer breakpoint is `max-width: 992px` (not the more common 730px used
  elsewhere on this same page for typography) — confirmed from the raw site CSS, so the
  footer's own `min-width: 992px` query is intentionally different from the
  `intro`/`connect` sections' `730px` breakpoint.
- Social/brand SVG icons and the globe icon were extracted directly from the reference's own
  inline FontAwesome-Free SVG markup (`viewBox`/`path` data) in `desktop.dom.html` — exact
  pixel-perfect shapes with zero guessing.

## Global change requests

None — no changes needed to `scripts/aem.js`, `scripts/scripts.js`, or `head.html`. The
default-content spacing/section-style rules are fully contained in my delimited block at the
end of `styles/styles.css`.

## Time spent

~70 minutes (research/evidence reading, content modeling, block JS/CSS, icon extraction, 3
capture/compare rounds including 1 real bug fix, notes).
