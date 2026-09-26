# Header block

Rewrote `blocks/header/header.js` + `header.css` (boilerplate nav-fragment scaffolding replaced
entirely). Content is authored in the nav doc (`spm-ft-0001/nav.html`, also saved at
`migration/sections/nav.html`) and loaded via `getMetadata('nav') || '/nav'` + `loadFragment`,
same mechanism as boilerplate but with a custom DOM/decorate step (`header.js` parses the fragment's
5 sections instead of the classic brand/sections/tools 3-column nav).

## What was built
- **Utility bar** (>=1130px, `#171917` bg, 53px): Synopsys + Ansys inline SVG logo links, divider,
  language pill (globe icon, opens a dropdown: English/日本語/简体中文/繁體中文/한국어), "Ask" pill
  with sparkle icon + conic-gradient border (matches site's `--inner-bg` padding-box/border-box trick).
- **Main nav**: white SYNOPSYS wordmark (inline SVG, `fill:currentColor`), 5 top items with CSS
  caret, search icon (toggles a simple search panel -> `search.html?q=`), Contact Sales button,
  hamburger (mobile). Transparent/absolute at `top:53px` over the hero at scroll 0 (desktop) /
  `top:0` (mobile, no utility bar); switches to `position:fixed;top:0`, white/blurred
  `rgba(255,255,255,.8)` bg, purple logo/Contact-Sales, dark text once `window.scrollY > 80`
  (exact threshold reverse-engineered from `synopsys-headlibs...js`:
  `window.onscroll = () => scrollTop>80 ? add('overlapping') : remove(...)`).
- **Mega menus**: hover-open on desktop (150ms close delay, mirrors the site's dwell/mouseleave
  timers), built from `<h3>` (top item) / `<h4>` (column heading, optionally linked) / `<ul>`
  (links) / `<p><img></p>` (promo tile) parsed out of the nav doc's flat default-content section.
  2/3/5-column variants auto-detected from column count. All 5 menus' real content (Why Synopsys,
  Solutions, Products, Support & Training, Resources) transcribed from the live site.
- **Mobile (<1130px)**: 70px bar (logo + hamburger only, search hidden here to match reference),
  full-screen drill-down menu (list -> tap -> sub-panel with a "← back" header), search field at
  top of the menu, Contact Sales button + Ansys promo card at the bottom.
- **Chat bar**: fixed, centered, 808px gradient-border pill, sparkle icon, placeholder from the nav
  doc's chat section, send button navigates to `synopsys.com/?q=<text>`, close (×) hides it
  (`.bc-hidden`). Mobile: round floating sparkle button bottom-right (site's exact 768px breakpoint
  for the swap, taken from `brand_concierge_style.css`); tapping it toggles a compact version of the
  bar (site's actual behavior opens a full separate `#chat-modal` widget — out of scope, noted below).

## Content model (nav doc sections, in order)
| # | purpose | shape |
|---|---|---|
| 1 | utility bar | `<p><a>` Synopsys, `<p><a>` Ansys, `<ul><li><a>` languages, `<p><a>` Ask |
| 2 | brand | `<p><a>` logo link |
| 3 | menus | repeating `<h3><a>` (item) → `<h4>[<a>]` (col heading) → `<ul><li><a>>` or `<p><img>`+`<p>` (promo) |
| 4 | tools | `<p><strong><a>` Contact Sales, `<p><a>` Ansys, `<p>` promo text (mobile card) |
| 5 | chat | `<p>` placeholder text |

No `<div>` used anywhere in the doc, so `decorateBlocks` never mistakes any of this for a block
(only `div.section > div > div` with a class becomes a block) — everything stays default content
and `header.js` walks it directly.

## Evidence (crops vs `$MAIN/migration/evidence/ref`, images under
`$MAIN/migration/evidence/blocks/header/`)
Tested against a synthetic draft (`spm-ft-0001/drafts/header.html`, metadata `nav=/spm-ft-0001/nav`
+ a tall placeholder section reusing the real hero image URL) since the real hero block belongs to
another agent.

| state | viewport | crop | mismatch | notes |
|---|---|---|---|---|
| top, utility bar only | desktop 1440x900 | `1440x53+0+0` | **1.6%** | `cmp-utility-*` |
| top, utility+nav | desktop | `1440x133+0+0` | 15.1% | `cmp-desktop-top-*`/`cmp-final-*` — inflated by the placeholder hero not being full-bleed like the real hero block (white gutters at the sides at this y-range); the utility-bar-only crop above isolates real header fidelity |
| sticky/scrolled nav (live site, scroll 200) | desktop | manual pw screenshot vs `ref-sticky-200.png` | visual match (logo/text/CTA colors, blur, shadow) | `desktop-scroll200-top.png`; reference `full.png`/`top.png` evidence can't show the scrolled state (both are captured at scroll 0), so this was checked directly against the live site |
| mobile top | iPhone 13 | `390x70+0+0` | 15.7% | `cmp-mobile-top-*` — same placeholder-hero caveat |
| mega menu (Products, 5-col) | desktop | — | visual only, `desktop-mega-products.png` | matches real column headings/links/icon-free layout |
| language dropdown | desktop | — | visual only, `desktop-lang.png` | matches pill/menu chrome |
| mobile menu + drill-down | iPhone 13 | — | visual only, `mobile-menu-open.png`/`mobile-menu-drill.png` | Contact Sales + Ansys card match; two long list items in the drill-down render a stray `›`-like glyph — not fully root-caused, see gaps |
| chat bar / floating icon | both | — | visual only (desktop screenshot), `mobile-chat.png` | close/minimize verified via `classList.contains('bc-hidden')` |

3 iterative capture/compare rounds were run (initial build → utility-bar icon-clipping +
Contact-Sales color-inversion fixes → nav positioning/centering rewrite from `fixed` to
`absolute→fixed` two-state layout), each re-verified with fresh screenshots.

## Interactions/animations checked
- Sticky threshold: 80px scroll (site source), implemented via a `scroll` listener toggling
  `.is-sticky` (`transition: background-color .25s, box-shadow .25s` — CSS matches
  `.component-nav-top{transition:all .25s}`).
- Desktop mega-menu open: `mouseenter`/`focus` on the nav item, close on `mouseleave` from the nav
  bar or the panel with a 150ms delay (site: `setTimeout(r,150)`), `Escape` closes.
- Mobile: click-to-open (not hover), tap item → drill-down panel, "← back" returns to the list.
- Language pill: click toggles `aria-expanded` + a hidden menu; closes on outside click.
- Chat bar: Enter or send-button submits to `/?q=`; × hides it; floating icon (mobile, <768px)
  toggles a compact version of the bar.

## Remaining gaps
- Draft/test hero is a plain `<p><img></p>`, not full-bleed like the real hero block, so header-vs-hero
  overlap crops carry placeholder artifacts (utility-bar-only crop is the trustworthy fidelity number).
- Real "Ask"/chat-bar submit opens a full `#chat-modal` widget (Brightcove-style AI chat, 3rd-party
  `experience-platform-brand-concierge-web-agent` script) — out of scope; implemented the
  visual bar + `?q=` redirect fallback per the task brief.
- "Why Synopsys" mega-menu promo tile: the real site's video (Brightcove modal) poster image isn't in
  the static HTML (JS-driven); used a real Synopsys brand image as a static poster+link, per brief.
- Two long mobile drill-down list items show a small stray glyph next to the text; not reproduced with
  a minimal repro in the time available — CSS/DOM looks correct on inspection, may be a whitespace/entity
  artifact from the transcribed copy.
- Resources mega-menu's real "light-grey" 3rd column (Synopsys Converge) is approximated the same
  way as an image-promo column (background tint via presence-of-image heuristic) even though it has
  no image — cosmetic only, content/links are exact.
- Language switcher links are inert (`href="#"`) — real localized URLs would need locale-specific
  content models. Not needed for this migration (nav.html targets en-us only).

## Global change requests
- `migration/tools/capture.sh`: `s.replace("__URL__", url)` only replaces the **first** occurrence.
  `capture.tpl.js` now contains `__URL__` twice (`useClock` check + `page.goto`), so the second
  occurrence stays literal and `page.goto('__URL__')` throws `Cannot navigate to invalid URL`. Fix:
  ```js
  s = s.replace(/__URL__/g, url).replace(/__OUT__/g, out).replace("__W__", w).replace("__H__", h)
  ```
  (found and fixed locally in my worktree to unblock captures, but reverted before committing since
  `migration/tools` isn't in this task's ownership — needs a real fix upstream so every block agent
  isn't hit by it.)
- `aem up` fails immediately for long worker-branch names (`{branch}--{repo}--{owner}` > 63 chars,
  which is basically guaranteed for `pi/wf/...-uuid` branch names) even when `--url` is passed,
  because `up.cmd.js` always calls `GitUtils.getOriginURL`/`initUrl` first and only falls back to
  `--url` if that git call itself throws. Workaround used: `git branch -m <short-name>` for the
  duration of `aem up` + captures, then `git branch -m <original-long-name>` back before committing.
  Worth documenting in the agent-brief/tools so every block agent doesn't have to rediscover this.

## Learnings — GENERIC (may transfer to other blocks/projects)
- Global boilerplate CSS `.icon{width:24px;height:24px}` silently clips any custom `<span class="icon ...">`
  wrapper reused for a differently-sized inline SVG (the wrapper's fixed box wins the flex-item
  sizing even though the SVG inside overflows it, so it looks "gone", not just resized) — never reuse
  the bare `icon` class name for anything that isn't a boilerplate 16px icon; use a block-scoped class.
- `a:any-link{color:inherit}` from the global stylesheet has HIGHER specificity than most block class
  selectors on an anchor (`(0,1,1)` vs `(0,1,0)`) because it counts the `a` element itself; any block
  CSS that sets `color` directly on an `<a>` needs an `a.my-class` selector (or `!important`-free
  higher specificity) or the color rule silently loses to the global reset regardless of source order.
- For a "transparent-over-hero, sticky-on-scroll" header with a non-scrolling utility bar above it:
  make the header's flow height equal to the utility bar only, and give the nav row
  `position:absolute;top:<utility-height>` by default, switching to `position:fixed;top:0` past the
  scroll threshold — don't try to keep the whole header `position:fixed` from the start, or the
  utility bar (which should scroll away) gets stuck too.
- CSS auto-margin centering on an absolutely-positioned element only kicks in when *both* `left` and
  `right` (or `top`/`bottom`) are set; `left:0; width:100%` with `margin:0 auto` and a `max-width`
  does **not** center — it just clips to `max-width` flush against `left:0`. Use `left:0;right:0;
  width:auto` instead.
- `aem up` inside a worktree derives the DNS-label branch name straight from the worktree's own
  `.git/worktrees/<x>/HEAD` file; a short-lived `git branch -m <short>` / `git branch -m <original>`
  round-trip around `aem up` + captures is a safe, purely-local workaround for the 63-char DNS limit
  that doesn't touch any commits.

## Learnings — SYNOPSYS-SPECIFIC
- Sticky threshold is exactly `scrollY > 80` (not the `~200`/`1500` capture states mentioned in the
  brief — both are simply "past the threshold", any value > 80 looks identical).
- Mega-menu open is hover-driven only >= 1130px (`1129>$(window).width()` is the site's own mobile/
  desktop split for nav behavior, matching the 1130 breakpoint used elsewhere on the site); below
  that it's click/tap with a full `#morph-dropdown-wrapper` slide-in panel.
- Real utility-bar "Ask" pill and chat bar both use the same conic-gradient border technique
  (`#fdb71a → #ab714e → #5a2a82`) reused verbatim from `synopsys-pagelibs...css` /
  `brand_concierge_style.css`.
- Chat-bar/floating-icon swap breakpoint is 768px (from `brand_concierge_style.css`), independent of
  the 1130px nav breakpoint.

## Time spent
~85 minutes (research/content-extraction heavy: mega-menu content, utility bar, sticky-nav JS/CSS,
chat bar all had to be reverse-engineered from live CSS/JS since the block-collection docs for this
don't exist as authored content).
