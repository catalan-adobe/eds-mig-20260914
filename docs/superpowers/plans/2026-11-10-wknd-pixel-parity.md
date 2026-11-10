# WKND Pixel Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make all 65 migrated pages match their originals at 1440 px and 390 px, to the measured bar.

**Architecture:** A measuring tool scores every page and explains each difference.
Tasks then fix one group of pages at a time, simplest group first.
Each task ends when its group passes the tool and no earlier group fails.

**Tech Stack:** Vanilla JS and CSS, Node 24 `node:test`, `playwright-cli`, ImageMagick `magick`.

**Spec:** `docs/superpowers/specs/2026-11-10-wknd-pixel-parity-design.md`

## Global Constraints

- The bar: same page height, and at most 0.5% of pixels differ at `-fuzz 6%`.
- Widths: 1440 and 390. Viewport height 900. Scale factor 1. No device emulation.
- The original wins, quirks included. Never hide a difference from the tool.
- No original stylesheet, structure or class names in this repo.
- No CSS that targets one page by its path.
- Keep names, keyboard use and semantic elements.
- Never edit `scripts/aem.js`. Never write to DA outside `/f52-1011-01/`. Never change site config.
- `npm run lint` and `npm test` are clean before each commit.
- Read values from the original with `playwright-cli eval` and `getComputedStyle`. Do not guess.
- Keep tool output short. Open a screenshot only when the element report cannot explain a gap.
- Original page: `https://wknd.site{path}.html`. Migrated page: `{base}/f52-1011-01{path}`.
- Local base: `http://localhost:3000`, served by `npx -y @adobe/aem-cli up --no-open`.
- Preview base: `https://f52-1011-01--eds-mig-20260914--catalan-adobe.aem.page`.
- If content must change, change the importer with a test first.
  Then run `node tools/import/run.js && node tools/import/upload.js`.

## Review Focus

1. A mobile fix breaks desktop. Tasks 7 to 10 run the desktop gates again after each fix.
2. An author leaves out a cell. Every block must still load, with disabled or new controls too.
3. Keyboard use. Tab must skip disabled carousel buttons. Tabs, accordion and menus must still work.
4. A stale or early capture of the original gives a false result. Two captures must be identical.
5. Lighthouse performance drops below 100 on the preview after layout changes.

## Page groups

The tool knows these groups. Together they hold all 65 pages.

| Group | Pages | Count |
|---|---|---|
| `stub` | Locale roots other than `/us/en` and `/ca/en` | 9 |
| `search` | `/us/en/ai-powered-search` | 1 |
| `about` | `*/about-us` | 2 |
| `faqs` | `*/faqs` | 2 |
| `members` | `/ca/en/magazine/members-only` | 1 |
| `home` | `/us/en`, `/ca/en` | 2 |
| `adventures` | `*/adventures` | 2 |
| `magazine` | `*/magazine` | 2 |
| `adventure` | `*/adventures/*` | 32 |
| `article` | `*/magazine/*` other than the `members` page | 12 |

The design orders work by layer. Groups keep that order and give each task a pass or fail gate.
The simplest groups come first, so they force the shared layer.

## File Structure

| Path | Responsibility |
|---|---|
| `tools/compare/groups.js` | `groupOf(path)`, `pagesIn(groups)` from `tools/import/pages.txt` |
| `tools/compare/capture.js` | Drive `playwright-cli`: screenshot and element list of one URL |
| `tools/compare/extract.js` | The function that runs in the page and lists elements |
| `tools/compare/score.js` | Height gap, share of pixels that differ, pass or fail |
| `tools/compare/match.js` | Pair elements of both pages and compute box gaps |
| `tools/compare/run.js` | Score many pages. Print a table. Exit 1 when a page fails |
| `tools/compare/explain.js` | Explain one page at one width |
| `tools/compare/report.js` | Write `docs/pixel-parity-report.md` |
| `tools/compare/baseline.json` | Committed scores of the first run |
| `tools/compare/*.test.js` | Tests |
| `.compare/` | Captures and `report.json`. In `.gitignore` |

---

### Task 1: The measuring tool

**Files:** Create everything under `tools/compare/`. Modify `.gitignore` and `package.json`.

**Interfaces:**

- `groupOf(path: string): string` and `pagesIn(groups: string[]): string[]`.
- `capture(url, width, pngPath, session): Promise<{ height: number, items: Item[] }>`.
  `Item` is `{ kind: 'text' | 'img', text: string, x, y, w, h }`, in page coordinates, rounded.
- `extract` lists each visible element that has its own text, and each visible `img`.
  For an image, `text` is its `alt`.
- `score(sourcePng, migratedPng, width): { heightSource, heightMigrated, diffPercent, pass }`.
- `match(source: Item[], migrated: Item[]): Row[]`.
  `Row` is `{ kind, text, source, migrated, dx, dy, dw, dh }`. `migrated` is `null` when no pair exists.
  It pairs items of one kind by equal text, in order. Rows keep the order of the original.
- `node tools/compare/run.js [--base <url>] [--width <px>] [--group <a,b>] [--only <path-prefix>]
  [--refresh-source] [--save-baseline] [--all]`.
  Without `--width` it runs 1440 and 390. It prints the 15 worst rows, or every row with `--all`.
  Its last line is `<n>/<total> pass`.
- `node tools/compare/explain.js <path> --width <px> [--base <url>]`.
  It prints the first 15 rows whose box differs. It writes `.compare/explain.png`, both pages side by side.
- `node tools/compare/report.js` reads `baseline.json` and `.compare/report.json`.

Capture recipe, the same for both sides:

1. `playwright-cli -s=<session> open about:blank`, then `resize <width> 900`.
2. `goto <url>`. Wait for `document.fonts.ready`.
3. Scroll down in steps of 450 px with 100 ms between steps. Scroll to the top. Wait 800 ms.
4. Wait for `document.fonts.ready` again. Run `extract`.
5. `screenshot --filename=<png> --full-page`.

`playwright-cli eval` prints a `### Result` line and then the JSON value.
Keep captures of the original in `.compare/source/<width>/`. Use four sessions at once.

Score: `magick compare -metric AE -fuzz 6% <a> <b> null:` prints the count on stderr.
It exits with 1 when the images differ. That is not an error.
If the heights differ, crop both to the common height first.

- [ ] Step 1: Add `.compare/*` to `.gitignore`. Change the test script to
  `node --test "tools/**/*.test.js"`.
- [ ] Step 2: Write failing tests.
  - `groupOf('/fr/fr')` is `stub`. `groupOf('/ca/en/magazine/members-only')` is `members`.
    `groupOf('/ca/en/magazine/members-only/alaskan-adventure')` is `article`.
  - `pagesIn` of all 10 groups has 65 paths. The counts match the table above.
  - `score` of an image with itself: `diffPercent` is 0 and `pass` is true.
  - `score` with a copy shifted down by 1 px: `pass` is false.
  - `score` with a copy that is 1 px taller: `pass` is false.
  - `match` of a list with itself: every gap is 0.
  - `match` when one item moves down 5 px: that row has `dy` 5.
  - `match` when the migrated list lacks an item: that row has `migrated` null.
  - `match` with the same text twice: the pairs follow the order.
  Tests build their images with `magick` in a temp folder.
- [ ] Step 3: Run `npm test`. Expect failures for the new tests.
- [ ] Step 4: Implement. Run `npm test`. Expect all to pass.
- [ ] Step 5: Capture `/us/en` of the original twice at 1440. Score one against the other.
  Expected: `diffPercent` 0. This guards Review Focus 4.
- [ ] Step 6: Start the local server. Run `node tools/compare/run.js --save-baseline`.
  Expected: last lines `0/65 pass` for 1440 and for 390, and exit code 1.
- [ ] Step 7: Run `node tools/compare/report.js`. Lint. Commit the tool, the baseline and the report.

### Tasks 2 to 10: one group of pages at one width

Each of these tasks follows the same loop.

- [ ] Step 1: Run the gate command. Expect failures. This is the red run.
- [ ] Step 2: Run `explain.js` on the worst page. Take the first row.
- [ ] Step 3: Read the original's values for that element. Fix the block, template or global style.
- [ ] Step 4: Run the gate again. Repeat from step 2 until it passes.
- [ ] Step 5: Run every earlier gate. Each must still exit with 0.
- [ ] Step 6: Lint and test. Commit.

Stop rule: after three attempts at one difference with no gain, stop work on that difference.
Add the page, its numbers and the cause to "Open differences" in `docs/pixel-parity-report.md`.

| Task | Width | Groups | Gate command | Owns |
|---|---|---|---|---|
| 2 | 1440 | `stub`, `search` | `run.js --width 1440 --group stub,search` | Header, language toggle, footer, hero, divider, search |
| 3 | 1440 | `about`, `faqs`, `members` | `run.js --width 1440 --group about,faqs,members` | Titles, text metrics, people cards, accordion, side column |
| 4 | 1440 | `home`, `adventures`, `magazine` | `run.js --width 1440 --group home,adventures,magazine` | Carousel, featured columns, cards, filter, locked cards, buttons |
| 5 | 1440 | `adventure` | `run.js --width 1440 --group adventure` | Breadcrumb, one-slide carousel, facts, tabs, captions |
| 6 | 1440 | `article` | `run.js --width 1440 --group article` | Article template, related list, byline, quote, download |
| 7 | 390 | `stub`, `search`, `about`, `faqs`, `members` | `run.js --width 390 --group stub,search,about,faqs,members` | Mobile header, footer and the blocks of tasks 2 and 3 |
| 8 | 390 | `home`, `adventures`, `magazine` | `run.js --width 390 --group home,adventures,magazine` | The blocks of task 4 on mobile |
| 9 | 390 | `adventure` | `run.js --width 390 --group adventure` | Mobile facts, tabs and carousel |
| 10 | 390 | `article` | `run.js --width 390 --group article` | Mobile article text and side column |

Notes for single tasks:

- Task 2: the original shows no controls on a single hero teaser.
  It shows a dot and two arrows on a carousel with one slide.
  Both are one-row `carousel` blocks today.
  The importer must add the variant `static` to a block from a single teaser.
  Add a test for it. Record the variant in `README.md`.
- Task 2: the language toggle must sit where the original has it.
- Task 3 and task 4: restore the 14 px shifts of the original.
  Examples are the FAQ side column and the Adventures title.
- Task 4: the lock badge covers the start of the title, as in the original.
- Task 5: a carousel that is not `static` shows its dot and arrows with one slide.
  The arrows are `disabled`. Add nothing that Tab can reach.
- Tasks 7 to 10: after each fix, also run the 1440 gates of tasks 2 to 6.
- Tasks 9 and 10: adventure facts and article text follow the original's mobile layout.

### Task 11: Final run and report

- [ ] Step 1: Push the branch. Run `node tools/import/run.js && node tools/import/upload.js`.
- [ ] Step 2: Run `node tools/compare/run.js --base <preview base> --refresh-source`.
  Expected: `65/65 pass` at both widths, or every failing page is in "Open differences".
- [ ] Step 3: Run `node tools/import/check.js <preview base>`. Expected: `87/87 clean`.
- [ ] Step 4: Run Lighthouse on the home, Bali and Arctic Surfing preview pages.
  Expected: performance 100 on each. Fix what it reports.
- [ ] Step 5: Upload a test page that holds every block with cells left out.
  Expected: every block loads and the console has no error. Delete the page from DA and preview.
- [ ] Step 6: Check the keyboard: tabs, accordion, carousel, language menu, mobile menu.
- [ ] Step 7: Run `node tools/compare/report.js`. Update `README.md`. Lint, test, commit, push.
