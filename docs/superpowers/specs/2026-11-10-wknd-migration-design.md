# WKND migration to Edge Delivery Services: design

Date: 2026-11-10. Run: `f52-1011-01`.

## Intent

Move every public page of https://wknd.site into this project, from scratch.
The result must look like the original and be easy for an author to edit.
Earlier migration attempts are not read or reused.

## What exists today

**Source site.** 65 pages, rendered on the server with AEM Core Components.
There is no sitemap. The list comes from a crawl.

| Area | Pages | Notes |
|------|-------|-------|
| `/us/en` | 27 | Home, adventures list, 16 adventures, magazine list, 5 articles, FAQs, About Us, AI search |
| `/ca/en` | 29 | Near copy of `/us/en`. 8 pages differ slightly. Adds 2 members-only articles and their list page. No search page |
| Language home pages | 9 | `/us/es`, `/ca/fr`, `/ch/de`, `/ch/fr`, `/ch/it`, `/de/de`, `/es/es`, `/fr/fr`, `/it/it`: "Coming Soon" stubs |

Fonts are Asar (headings) and Source Sans Pro (text). Icons come from an icon font.

**This repo.** Unchanged boilerplate: `cards`, `columns`, `footer`, `fragment`, `header`,
`hero`, `widget`.

**Content store.** DA at `catalan-adobe/eds-mig-20260914`. It is shared.
The root holds another site and `/us/en` holds an earlier attempt.
`/f52-1011-01/` is empty. The local DA token can read and write.

## Goals

- All 65 pages live under `/f52-1011-01/`, with the same paths below it, without `.html`.
- Each page matches the original at 1440 px and 390 px wide.
  This covers layout, type, colour and space between parts.
- Content is plain blocks an author can edit in DA.
- Lint is clean. Lighthouse performance is 100 on the home, one adventure and one article page.

## Non-goals

- Sign-in. It needs a backend. "Sign In" stays as a link that does nothing.
- AI search. It needs a backend. The page is migrated with its search box, which is not wired up.
- Lists built from an index. Authors write card lists by hand. Code does not query them.
- Publishing to `.aem.live`. Preview only.
- A pull request into `main`. `main` serves another site's content.

## Anti-goals

- Touching anything in the content store outside `/f52-1011-01/`.
- Changing site config (index, redirects, headers). It is shared with other runs.
- Pasting the original HTML and CSS into blocks. That copies the look and loses authoring.
- Editing `scripts/aem.js`.

## Approaches

1. **Component mapper script (chosen).** The source uses about 15 regular components.
   A script walks each page and maps each component to a block. One mapper per component
   covers all 65 pages. It is repeatable and consistent. Cost: the script must be written
   and checked before any page exists.
2. **Hand-author each page.** Good fidelity on the first pages. Slow and uneven across 65,
   and a fix to one block layout means editing every page again.
3. **Replay the rendered page.** Capture the DOM and CSS and serve them. Fast and
   pixel-close, but authors cannot edit the result. Rejected by the anti-goals.

The agent chose approach 1. The user asked for best judgement on the build.

## Design

### Where things live

- Code: branch `f52-1011-01`, pushed to `origin`. Other runs use the same pattern.
- Content: DA folder `/f52-1011-01/`.
- Preview: `https://f52-1011-01--eds-mig-20260914--catalan-adobe.aem.page/f52-1011-01/us/en`
- Local: `npx -y @adobe/aem-cli up` serves local code with previewed content.

### Access

- The token is in `~/.aem/da-token.json`. Run `da-auth-helper token` to refresh it.
  Never print it or commit it.
- DA: `https://admin.da.live/{list|source}/catalan-adobe/eds-mig-20260914/f52-1011-01/...`
- Preview: `POST https://admin.hlx.page/preview/catalan-adobe/eds-mig-20260914/main/{path}`
- Use `curl` or Node `fetch`. DA blocks Python's default client with error 1010.

### Component to block map

| Source component | Becomes |
|------------------|---------|
| Header fragment: utility bar, logo, navigation, search button | `header`, from a `nav` page per locale |
| Footer fragment | `footer`, from a `footer` page per locale |
| Carousel of hero teasers | `carousel`: one row per slide (image, then title, text, link) |
| Single hero teaser | `carousel` with one slide. Controls are hidden when there is one slide |
| Featured teaser (image beside a grey panel) | `columns (featured)` |
| Image list | `cards` |
| Tabs holding image lists (adventures list) | `cards (filter)`: each card has a category, tabs are built from them |
| Tabs holding text (adventure page) | `tabs` |
| Accordion | `accordion` |
| Adventure facts (activity, length, price, …) | `facts`: two columns, label and value |
| Contributor (round photo, name, roles, social links) | `cards (people)` |
| Related article list with dates | `cards (list)` |
| Breadcrumb | Built in code from the URL path. Not authored |
| Title, text, image, button, download | Default content. Buttons use bold or italic links |
| Separator | Section break with a section style |
| Language switcher | A list in the `nav` page, shown as a dropdown |

`carousel`, `tabs` and `accordion` start from Adobe's public block collection
(https://github.com/adobe/aem-block-collection) and are restyled. That code is tested and
accessible. It is not prior migration work.

### Page templates

The `template` metadata value selects the layout:

- `adventure`: breadcrumb, carousel, title, then facts on the left and tabs on the right.
- `article`: hero image, breadcrumb, body on the left, share and related list on the right.
- none: sections stacked top to bottom.

### Prefix handling

Code never hardcodes `/f52-1011-01`. The header and footer find the locale root from the
page path. The locale root is the `/us/en` part and everything before it. They load `nav`
and `footer` from there.

The importer rewrites every internal link to the prefixed path.
Code sets `lang` on `<html>` from the locale. Today it is fixed to `en`.

### Styles

- Global tokens in `styles/styles.css`: colours (yellow `#ffea00`, near-black, greys), type
  scale, spacing, 1200 px content width. Values are measured from the source.
- Fonts are self-hosted `woff2` in `/fonts`, with fallback faces sized to avoid layout
  shift. Both fonts are under the Open Font License.
- Icons are SVG files in `/icons`. The icon font is dropped.

### Importer

- Lives in `tools/import/` and is listed in `.hlxignore` so it is not served.
- A Node script with one dev dependency for parsing HTML.
- Steps per page: fetch, map components, rewrite links, add metadata.
  Metadata is title, description, image and template.
- Each page is written as an HTML file to a local folder that git ignores.
- A second script uploads the files to DA and triggers preview for each one.
- Images: first try leaving source image URLs in the HTML and letting preview ingest them.
  If that fails, upload them to DA beside the page.

### Checks

- Importer: tests for each component mapper against saved source snippets.
- Content parity, for all 65 pages, between source and preview.
  Compare heading text and the counts of headings, paragraphs, images and links.
  List and explain each difference.
- Links: every internal link on every migrated page returns 200 and stays inside the prefix.
- Visual: side-by-side screenshots at 1440 px and 390 px.
  Pages: home, adventures list, one adventure, magazine list, one article, FAQs,
  About Us, search, one language stub.
- Lint and Lighthouse as in the goals.

## Decided by the user

- From scratch. No reuse of earlier attempts.
- All 65 pages.
- Content goes to a new folder, `/f52-1011-01/`.

## Calls made by the agent

- Approach 1.
- Push branch `f52-1011-01` to `origin`. Preview cannot serve the code without it.
- Preview only, no publish, no pull request.
- Block collection as the starting point for three blocks.
- Hide carousel controls on a single slide. The source shows one dot and two dead arrows.
- Delete the unused boilerplate `hero` block.
- Sign-in and search are not functional.

## Left to the builder

- Exact block cell layouts and variant names, as long as authors can read them.
- Which HTML parsing library to use. Pin the current stable version.
- How "Share this story" renders. The source shows the heading and no buttons.
- Breakpoints, measured from the source CSS.
