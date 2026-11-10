# WKND pixel parity: design

Date: 2026-11-10. Run: `f52-1011-01`.
This design extends `2026-11-10-wknd-migration-design.md`. That design still holds where this one is silent.

## Intent

Make every migrated page render the same as its original on https://wknd.site, pixel for pixel.
The first iteration was close by eye. This iteration uses a measured bar.
The user runs this as an exercise in how far an agent can take a migration.

## The bar

The user set the bar.

- Pages: all 65 pages in `tools/import/pages.txt`.
- Widths: 1440 px and 390 px. The viewport is 900 px high. The device scale factor is 1.
- Browser: the headless Chromium that `playwright-cli` drives. Only the viewport size changes.
  There is no device or touch emulation.
- State: the resting state of each page after load, at the top of the page.
- Height: the full page has the same height as the original, to the pixel.
- Pixels: at most 0.5% of pixels differ, at a colour tolerance of 6%.

A page passes when it meets the height rule and the pixel rule at both widths.

## Baseline

Measured on 2026-11-10 at commit `84574cb`, against the branch preview.

| Width | Pages passing | Same height | Median height gap | Largest gap | Median pixels differing |
|---|---|---|---|---|---|
| 1440 px | 0 | 1 | 14 px | 58 px | 5.0% |
| 390 px | 0 | 2 | 134 px | 452 px | 13.9% |

- The original is stable. Two captures one hour apart were identical on 7 pages.
- Image encoding is not a blocker. The home hero photo differs on 0.05% of pixels.
- Closest at 1440 px: the language stubs and About Us, under 1% of pixels.
- Furthest at 390 px: adventure pages are a median 258 px short. Articles are a median 142 px long.

## Goals

- All 65 pages pass the bar at both widths.
- One command measures every page at both widths. It exits with an error when a page fails.
- The gains of the first iteration stay.
  - `npm run lint` and `npm test` are clean.
  - `tools/import/check.js` is clean.
  - Lighthouse performance is 100 on the home, Bali and Arctic Surfing pages.
- The authoring model in `README.md` stays. If a rule changes, `README.md` records it.

## Non-goals

- Tablet widths.
- Other states: hover, focus, open menus, other carousel slides, other tabs, open accordion items.
- Sign-in and search. They stay without a backend.
- A publish to `.aem.live`, or a pull request into `main`.

## Anti-goals

- The original stylesheet, or the original HTML structure and class names, in this repo.
- A difference hidden from the tool: a mask, a page left out, a looser tolerance.
- CSS that targets one page by its path. A fix belongs to a block, a template or a section style.
- A write in DA outside `/f52-1011-01/`. A change to site config. An edit to `scripts/aem.js`.
- Lost accessibility. Names, keyboard use and semantic elements stay, even where the original has none.

## Approaches

1. **Tune our own code with a measuring tool.** The user chose this one.
   The tool reports how far each element is from its original. Fixes go in layers.
   It keeps lean CSS (31 KB today), the authoring model and the Lighthouse scores.
   Cost: a long tail. The original's mobile layout uses floats and quirks that the code must imitate.
2. **Reuse the original stylesheet.** Blocks output the original's structure and class names.
   It is the fastest route to the bar, and it covers tablet widths too.
   Cost: 174 KB of CSS, AEM class names in every block, and code that no EDS developer accepts.
3. **Serve captured pages.** Rejected in the first design. Authors cannot edit the result.

## Design

### The original wins

Where the first iteration chose to differ from the original, this iteration follows the original.

- Left edge: restore the 14 px shifts, for example the Adventures title and the FAQ side column.
- Language menu: the toggle sits where the original has it. The open menu follows the original too.
- One-slide carousels: they show the original's dot and arrows. The buttons are disabled.
- Locked cards: the lock badge covers the start of the title, as in the original.
- Mobile: adventure facts and article text follow the original layout.

### The measuring tool

- It lives in `tools/compare/`. `.hlxignore` already excludes `tools/`.
- It writes to `.compare/`. Add `.compare/*` to `.gitignore`.
- It captures pages with `playwright-cli`, in several sessions at once.

One command runs it: `node tools/compare/run.js [--base <url>] [--width <px>] [--only <path-prefix>]`.

1. It captures each original page once and keeps the capture. `--refresh-source` captures again.
2. It captures each migrated page from the base URL. The default is `http://localhost:3000`.
3. It scores each page: the height gap and the share of pixels that differ.
4. It prints a table, worst page first, and writes `.compare/report.json`.
5. It exits with an error when a page fails the bar.

The capture recipe is the same on both sides.
Load the page and wait for the fonts. Scroll down in steps to load lazy images.
Scroll back to the top, wait, and take a full-page screenshot.

The pixel score uses ImageMagick `compare -metric AE -fuzz 6%`.
If the heights are equal, it covers the full page. If they differ, it covers the common height.

A second command explains one page: `node tools/compare/explain.js <path> --width <px>`.
It matches headings, paragraphs, list items, images and buttons between the two pages, by text and order.
It prints the elements whose box differs, top to bottom, with the gap in x, y, width and height.
The first row is the place to fix. It also writes a side-by-side image.

Tests:

- Unit tests cover the scoring and the element matching, with small fixtures.
- A capture compared with itself scores 0 and passes.
- A capture compared with a copy shifted by 1 px fails.

### Order of work

1. Build the tool. Commit the baseline report.
2. Shared layer: header, footer, text metrics, section spacing, buttons. Desktop first, then mobile.
3. Blocks, by reach: carousel, cards, tabs, facts, featured columns, accordion, quote, search.
4. Templates: adventure, then article with its side column. Then the leftovers of single pages.
5. Final run against the branch preview. Write the report.

Run the full tool after each layer. A layer must not make a passing page fail.

### Where work runs

- `npx -y @adobe/aem-cli up` serves local code with previewed content. The tool uses it by default.
- The final run uses `https://f52-1011-01--eds-mig-20260914--catalan-adobe.aem.page`.
- Content changes go through the importer and `tools/import/upload.js`.

### Stop rule

The long tail is the risk.
If three targeted attempts at one difference bring no gain, stop work on it and record the cause.
The final report lists every page that fails, with its numbers and the cause.

### Deliverables

- `tools/compare/` with tests.
- CSS and block changes.
- `docs/pixel-parity-report.md`: the baseline and the final score of each page at each width.
- `README.md`, if an authoring rule changes.

## Decided by the user

- The bar: 1440 px and 390 px, all 65 pages, same height, at most 0.5% of pixels.
- Approach 1.

## Calls made by the agent

- The original wins, quirks included. The list is in "The original wins".
- Disabled buttons on one-slide carousels: they look the same and cannot mislead a keyboard user.
- No masks and no page left out. A page that cannot pass is reported as a failure.
- The tool reads the local dev server by default. The final run reads the branch preview.
- The stop rule.

## Left to the builder

- The matching method, the report format and the number of browser sessions.
- How to imitate each quirk of the original in CSS.
- Icons. They stay SVG. If an icon keeps a page above the bar, the builder picks the fix.
- How to run the work at low cost. The plan puts that choice to the user.
