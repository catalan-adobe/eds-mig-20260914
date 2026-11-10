# WKND Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Serve all 65 pages of https://wknd.site from Edge Delivery Services under `/f52-1011-01/`.

**Architecture:** A Node importer maps each AEM Core Component to a block and writes one
HTML file per page. A second script uploads the files to DA and triggers preview. Blocks
and global styles in this repo render that content to match the source.

**Tech Stack:** Vanilla JS and CSS (no build), Node 24 `node:test`, `linkedom@0.18.15`,
`playwright-cli` for screenshots, `curl`-style `fetch` against DA and the admin API.

**Spec:** `docs/superpowers/specs/2026-11-10-wknd-migration-design.md`

## Global Constraints

- Never edit `scripts/aem.js`.
- Never write to DA outside `/f52-1011-01/`. Never change site config. Preview only.
- Never hardcode `/f52-1011-01` in `blocks/`, `scripts/` or `styles/`.
- Never print or commit the token in `~/.aem/da-token.json`.
- Scope block CSS to `.blockname`. `npm run lint` must be clean before each commit.
- Breakpoints from the source CSS: mobile `max-width: 767px`, tablet `max-width: 1024px`.
- Content width `1164px` (source: `873pt`), side padding `14px`.
- Colours: `#ffea00` brand, `#202020` text and dark, `#ebebeb` light grey, `#f7f7f7`,
  `#696969` muted text, `#0045ff` links.
- Fonts: `Asar` (serif headings), `Source Sans Pro` (text, 18px, line-height 1.5).
- The source CSS is saved at `/tmp/wknd-recon/site.css`. Read values from it, do not guess.
- Internal links in content: `/f52-1011-01/<source path without .html>`.

## Review Focus

1. An author leaves out a cell (card without image, slide without link): the block must
   still render and not throw.
2. A page outside any locale folder (for example `/f52-1011-01/`): header and footer must
   fail quietly, not break the page.
3. A source page has a component the importer does not know. The importer must fail
   loudly with the page and class name. It must not drop content.
4. A carousel with one slide: no controls, no auto-play.
5. Keyboard use: tabs, accordion, carousel controls, mobile menu and language dropdown
   must work without a mouse.

## File Structure

| Path | Responsibility |
|------|----------------|
| `tools/import/pages.txt` | The 65 source paths, one per line |
| `tools/import/html.js` | `block()`, `section()`, `pageHtml()`, `rewriteLink()`, `absUrl()` |
| `tools/import/components.js` | One mapper per source component |
| `tools/import/page.js` | `convertPage()`, `convertNav()`, `convertFooter()` |
| `tools/import/run.js` | Fetch every page, write `f52-1011-01/**.html` |
| `tools/import/upload.js` | Upload to DA, trigger preview |
| `tools/import/check.js` | Content parity and link check |
| `tools/import/*.test.js`, `tools/import/fixtures/` | Tests and saved source snippets |
| `f52-1011-01/` | Generated content. In `.gitignore` and `.hlxignore` |
| `blocks/{carousel,columns,cards,tabs,accordion,facts,header,footer}/` | Blocks |
| `scripts/scripts.js` | Locale root, `lang`, breadcrumb, aside layout |
| `styles/`, `fonts/`, `icons/` | Tokens, fonts, SVG icons |

## Content contract

This table is the plan as first written. The final content model is in `README.md`.

Every block is a `div` with the block class. Each row is a child `div`. Each cell is a
`div` inside the row.

| Block | Row cells |
|-------|-----------|
| `carousel` | image, then content (`h2`, text, button link). Content cell is optional |
| `columns featured` | image, then content (pretitle `p`, `h2`, text, button link) |
| `cards` | image, then body (`p > strong > a` title, `p` description) |
| `cards filter` | as `cards`, plus a third cell with comma-separated categories |
| `cards people` | image, then body (`h3` name, `p` roles, `p` with icon links) |
| `cards list` | body only (`p > a` title, `p` date) |
| `cards locked` | image, then body (`h2`, `p`, `p` label) |
| `tabs` | label, then panel content |
| `accordion` | question, then answer |
| `facts` | label, then value |
| `metadata` | `Title`, `Description`, `Image`, `Template` (`adventure`, `article` or absent) |
| `section-metadata` | `Style`: `divider`, `aside`, `aside-left` |

Buttons: `<p><strong><a>` is the yellow primary button. Icon links use `:name:` text.
`nav` page sections: brand, links, tools (Sign In, search link, language list).
`footer` page sections: brand and links and social, then legal text.

---

### Task 1: Spike the content path

Settle the three unknowns before writing the importer. Throwaway content, kept results.

**Files:** Create `tools/import/upload.js`. Modify `.gitignore`, `.hlxignore`, `package.json`.

**Interfaces:**
- Produces: `node tools/import/upload.js [path-prefix]`. It uploads every
  `f52-1011-01/**/*.html` whose web path starts with the prefix, then previews it.
  It refuses any path that does not start with `/f52-1011-01/`.
  It prints one line per page with the status of both calls and exits non-zero on failure.

- [ ] Step 1: Add `f52-1011-01/` to `.gitignore` and `.hlxignore`. Add `tools/` and `docs/`
  to `.hlxignore`. Add `linkedom@0.18.15` as an exact dev dependency. Add the script
  `"test": "node --test tools/import/"`.
- [ ] Step 2: Hand-write `f52-1011-01/spike.html`.
  It has one `carousel` row with an absolute `https://wknd.site/...` image.
  It also has a `blockquote`, an `:facebook:` icon link and a `metadata` block.
- [ ] Step 3: Write `upload.js`. `PUT` multipart field `data` to
  `https://admin.da.live/source/catalan-adobe/eds-mig-20260914{path}.html`, then `POST`
  `https://admin.hlx.page/preview/catalan-adobe/eds-mig-20260914/main{path}`.
- [ ] Step 4: Run it for `/f52-1011-01/spike`. Fetch the preview `.plain.html`.
  Record in this plan: are images rewritten to `./media_…`? Does `blockquote` survive?
  Does the icon become `span.icon`?
- [ ] Step 5: Run `npx -y @adobe/aem-cli up --html-folder f52-1011-01` and confirm
  `http://localhost:3000/f52-1011-01/spike` renders the local file.
- [ ] Step 6: Commit. If preview did not ingest the images, first extend `upload.js`.
  It then uploads each image to DA beside the page and rewrites the `src`.

### Task 2: Importer core

**Files:** Create `tools/import/html.js`, `components.js`, `page.js`, tests, fixtures.

**Interfaces:**
- `block(name: string, rows: string[][]): string`
- `section(parts: string[], style?: string): string`
- `rewriteLink(href: string, prefix: string): string`. `/us/en/faqs.html` becomes
  `{prefix}/us/en/faqs`. `#x`, `mailto:`, `tel:` and external links are unchanged.
  `/content/dam/...` and other non-page paths become absolute `https://wknd.site/...`.
- `convertPage(html: string, path: string, prefix: string): string`. Returns a full HTML document.
- `convertNav(html, prefix): string`, `convertFooter(html, prefix): string`
- Mappers in `components.js` have the shape `(el: Element, ctx) => string[]`.
  A table maps each source class to its mapper. The classes are below.
  - `carousel`, `teaser`, `title`, `text`, `image`, `button`, `separator`, `tabs`
  - `accordion`, `image-list`, `list`, `contentfragment`, `byline`, `experiencefragment`
  - `download`, `contentaisearch`
  - `breadcrumb` and `sharing` map to nothing.

- [ ] Step 1: Save fixtures from `/tmp/wknd-recon/p_*.html`: home, adventures list, Bali,
  magazine, Arctic Surfing, FAQs, About Us, search, `fr/fr`, `ca/en` members-only.
- [ ] Step 2: Write failing tests. Write one per row of the content contract.
  Each asserts the block class and the cell contents for a named fixture. Plus:
  - `rewriteLink` cases above.
  - Home: 3 carousel rows, 1 `columns featured`, 3 `cards` blocks, 2 `divider` sections.
  - Adventures list: one `cards filter` with 16 rows, Bali row category `Surfing`.
  - Bali: `facts` has 6 rows, `Price` value `5000.0`. `tabs` has 3 rows. Facts section style `aside-left`.
  - Arctic Surfing: `h1` text, one `blockquote`, 3 `h2`, `cards list` with 4 rows in an
    `aside` section, `cards people` with 1 row. Metadata `Template` is `article`.
  - FAQs: `accordion` with 7 rows.
  - Unknown component class: `convertPage` throws an error naming the class and the path.
  - Every `img` `src` in the output is absolute.
- [ ] Step 3: Run `npm test`. Expect failures.
- [ ] Step 4: Implement. Walk the body in document order. Descend through wrappers
  (`container`, `cmp-container`, `main`, unclassed `div`). Skip the header and footer
  fragments. A `separator` ends the section with style `divider`. An `aside`, or the
  container holding `cmp-contentfragment--elements`, becomes its own section.
- [ ] Step 5: Run `npm test`. Expect all to pass. Run `npm run lint`. Commit.

### Task 3: Import all pages locally

**Files:** Create `tools/import/pages.txt`, `tools/import/run.js`.

**Interfaces:**
- Produces: `node tools/import/run.js`. Writes `f52-1011-01/{path}.html` for 65 pages, plus
  `nav.html` and `footer.html` in each of the 11 locale roots. Exits non-zero on any error.

- [ ] Step 1: Write `pages.txt` from `/tmp/wknd-recon/pages.json`.
- [ ] Step 2: Write `run.js`. Run it. Expect 65 pages and 22 fragments, zero errors.
  Fix mappers and add a test for each new case found.
- [ ] Step 3: Commit.

### Task 4: Global styles, fonts, icons, page scaffolding

**Files:** Modify `styles/styles.css`, `styles/fonts.css`, `scripts/scripts.js`.
Create `fonts/*.woff2`, `icons/*.svg`. Delete `blocks/hero/`.

**Interfaces:**
- Produces in `scripts/scripts.js`: `export function getLocaleRoot(pathname?: string): string | null`.
  `/f52-1011-01/us/en/faqs` gives `/f52-1011-01/us/en`. `/us/en` gives `/us/en`. `/` gives `null`.
  The locale is the first pair of two-letter segments.
- `main` gets class `with-aside` when a section has style `aside` or `aside-left`.
- Templates `adventure` and `article` get a breadcrumb `nav`.
  It is the first child of the first section.
  It holds the parent path segments as links, then `document.title`.
- `html[lang]` is the second locale segment.
- CSS custom properties for every value in Global Constraints.

- [ ] Step 1: Download Asar 400 and Source Sans Pro 300, 400, 600 and 400 italic as `woff2`.
  Define fallback faces with `size-adjust`.
- [ ] Step 2: Draw or export SVG icons: `search`, `facebook`, `twitter`, `instagram`,
  `chevron-down`, `arrow-left`, `arrow-right`, `lock`.
  Save `wknd-logo-dk.svg` and `wknd-logo-light.svg` from the source.
- [ ] Step 3: Write tokens, headings, links, buttons, sections, `divider`, underline
  titles, aside grid and breadcrumb styles.
- [ ] Step 4: Add `getLocaleRoot` with an assert-based self-check run under `node --test`
  in `tools/import/locale.test.js`. Wire lang, aside class and breadcrumb.
- [ ] Step 5: View `http://localhost:3000/f52-1011-01/us/en/magazine/arctic-surfing` beside
  the source at 1440 px. Text, headings and breadcrumb match. Lint. Commit.

### Task 5: Header and footer

**Files:** Modify `blocks/header/*`, `blocks/footer/*`.

**Interfaces:** Consumes `getLocaleRoot`. Loads `{root}/nav` and `{root}/footer`.
When the root is `null` or the fetch fails, the block stays empty and logs nothing fatal.

- [ ] Step 1: Header. A dark utility bar holds Sign In and the language dropdown.
  The dropdown shows the current locale. Below it sit the logo, the links and the search
  icon link. The active page link is yellow. Below 1025 px there is a hamburger menu. Escape closes menus. Language dropdown is a `button` with `aria-expanded`.
- [ ] Step 2: Footer. A dark band holds the light logo and the links.
  The active link is underlined. "Follow Us" has three icon buttons. Legal text is below.
- [ ] Step 3: Compare with the source at 1440 px and 390 px. Lint. Commit.

### Task 6: Carousel, columns, cards

**Files:** `blocks/carousel/*`, `blocks/columns/*`, `blocks/cards/*`.

- [ ] Step 1: `carousel`: start from `/tmp/wknd-recon/aem-block-collection/blocks/carousel`.
  Full-bleed image, white content card overlapping the bottom, dots, arrows at the right.
  One slide: no dots, no arrows. Image-only slides are supported. First image is eager.
- [ ] Step 2: `columns featured`: image left, `#ebebeb` panel right, stacked on mobile.
- [ ] Step 3: `cards` and variants. `filter` builds a `tablist` with "All" first, then
  categories in first-seen order. `people` has round images and dark icon buttons.
  `list` has a left rule and muted dates. `locked` shows the lock corner and no link.
- [ ] Step 4: Compare home, adventures list, magazine and About Us with the source at both
  widths. Check each block with a missing cell in a local test page. Lint. Commit.

### Task 7: Tabs, accordion, facts

**Files:** `blocks/tabs/*`, `blocks/accordion/*`, `blocks/facts/*` (CSS, and JS only if needed).

- [ ] Step 1: `tabs` from the block collection. Active tab is dark with white text.
- [ ] Step 2: `accordion` from the block collection (`details`/`summary`), plus-icon at right.
- [ ] Step 3: `facts`: left rule, muted uppercase label, bold uppercase value.
- [ ] Step 4: Compare Bali and FAQs with the source at both widths. Keyboard check. Lint. Commit.

### Task 8: Upload, preview and verify everything

**Files:** Create `tools/import/check.js`.

**Interfaces:**
- `node tools/import/check.js <base-url>`. It compares source and migrated for all 65 pages.
  It compares `h1` to `h3` text in order, and the image count.
  It checks that every internal link returns 200 and starts with `/f52-1011-01/`.
  It prints a table and exits non-zero on a difference
  that is not in its documented allow-list.

- [ ] Step 1: Push branch `f52-1011-01` to `origin`.
- [ ] Step 2: `node tools/import/run.js && node tools/import/upload.js /f52-1011-01/`.
  Delete the spike page from DA and preview.
- [ ] Step 3: Write and run `check.js` against the preview URL. Fix until clean.
- [ ] Step 4: Screenshot the 9 page types at 1440 px and 390 px, source and preview.
  Compare each pair. Fix differences.
- [ ] Step 5: Run Lighthouse on home, Bali and Arctic Surfing on the preview URL.
  Performance must be 100. Fix what it reports.
- [ ] Step 6: `npm run lint && npm test`. Commit and push.
- [ ] Step 7: Report: preview links, check results, known gaps.
