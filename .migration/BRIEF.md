# Agent brief: synopsys.com to Edge Delivery Services

## HOLD: read this before anything else

Check your label. These eight agents ignore this section and keep working:
`group-hero`, `group-cards`, `group-teasers`, `group-columns`, `group-accordion-quote`,
`group-carousel`, `group-media`, `group-forms`.

Every other agent: the operator is changing how this run is set up. Do no work now, and do not
return an answer. Wait.

1. Read nothing else. Write nothing. Open no browser.
2. Run this one command. It waits, and it uses no tokens while it waits:
   `while [ -e /Users/catalan/repos/ai/migration-tests/from-scratch-mig/f52-synopsys-1211-02/.migration/HOLD ]; do sleep 20; done`
3. Run it again each time it stops or times out while the file still exists.
4. When the file is gone, read this brief again from the top and start your task.

Read this file in full before you start. `M` below is this folder: `.migration/` in the main
checkout.

## Goal

Migrate https://www.synopsys.com (7,007 HTML pages, 5 languages) to Adobe Edge Delivery Services
(EDS). The migrated site must match the source 1:1: same pixels at 1440, 768 and 375 px wide, same
content, same links, same interactions. Content must stay authorable in DA (da.live) as normal
EDS documents: default content, blocks, section metadata, page metadata.

## Facts

- Main checkout: `/Users/catalan/repos/ai/migration-tests/from-scratch-mig/f52-synopsys-1211-02`,
  git branch `f52-synopsys-1211-02`, GitHub `catalan-adobe/eds-mig-20260914`. Every agent works in
  this one checkout. Never commit to `main`, never push `main`.
- DA: org `catalan-adobe`, repo `eds-mig-20260914`. ALL content lives under the DA folder
  `/f52-synopsys-1211-02`. Never write or delete anything in DA outside it. Preview only, never
  publish to live.
- Path mapping: source `/a/b.html` is DA `/f52-synopsys-1211-02/a/b.html` and web path
  `/f52-synopsys-1211-02/a/b`. The home page `/` is DA `/f52-synopsys-1211-02/index.html`, web
  path `/f52-synopsys-1211-02/`. `/ja-jp.html`, `/zh-cn.html`, `/zh-tw.html` and `/ko-kr.html` are
  the language home pages.
- Dev server, shared by everyone, already running: http://localhost:3520 serves the code of this
  checkout with the previewed DA content. Use it for all checks. A hand-written test page
  `M/drafts/<your label>/x.plain.html` is served at `/f52-synopsys-1211-02/drafts/<your label>/x`.
- The branch preview shows pushed code:
  https://f52-synopsys-1211-02--eds-mig-20260914--catalan-adobe.aem.page/f52-synopsys-1211-02/
- Run `M/bin/services` when a port is down. It starts only what is missing.
- Never stop a server. Never use `pkill` or `killall`.

## The source site is fragile: the one hard rule

**Never request anything from `*.synopsys.com` yourself.** No `curl`, no `fetch`, no
`playwright-cli open https://www.synopsys.com/...`, no web search tool on its pages. A burst of
requests triggers Cloudflare's bot check and ends the migration for everyone. Use only:

| Need | Use |
| --- | --- |
| Server HTML of a page | `M/source/pages/<path>` (home page: `index.html`). Fetched already or soon. |
| Any other file (image, SVG, script, font) | `node M/tools/source.mjs <url> [file]`, or `import { getSource }` from it |
| A page in a browser | `node M/tools/pw.mjs <session> <file.js>`, `compare.mjs`, `trace.mjs` |

These read a local cache. A missing file is fetched from the site once. All agents share one
queue: one request at a time, with a pause.

A tool that says `FETCH-STOP` means the site showed a bot check. Then stop loading the source,
finish what you can from the cache, and say so in your result. Never work around bot protection.

`M/source/pages.jsonl` lists the pages fetched so far (`url`, `status`, `template`). The fetch of
all 7,007 pages runs in the background and ends when `M/source/fetch.log` says `FETCH DONE`.
Its order is round-robin over URL groups, so the pages present are already a fair sample.

## Tools (all in `M/tools/`, each has a usage comment at its top)

- `census.mjs`: templates and AEM components over the fetched pages. Rerun it to refresh
  `M/source/census.json` after more pages arrived.
- `component.mjs html|children|variants|pages <name>` and `component.mjs tree <page>`: the real
  markup of a source component, what it contains, its variant classes, the pages using it.
  The tree prints `name.extraClass`: the name is the part before the first dot.
- `css-rules.mjs '<selector regex>'`: the source's own CSS rules, de-minified, with their
  `@media`. `--breakpoints` gives the histogram. Build from these exact rules, not from values
  read off a screenshot.
- `reps.mjs`: `M/source/reps.json`, the pages that together show every template, component and
  variant. `--only <component>` lists the pages that cover one component's variants.
- `pw.mjs <session> <file.js>`: run `async (page, { still, shot }) => value` in your browser
  session. `still(url, width)` loads a page held still (overlays hidden, lazy content loaded,
  rotations stopped). `shot(path, selector?)` takes a screenshot. Source URLs are written as the
  real `https://www.synopsys.com/...` and are served from the cache.
- `compare.mjs`: screenshots a source page and its migrated twin. It prints the diff per 800 px
  band, names what sits in each band, and writes side-by-side band images.
  `--src-sel/--tgt-sel` compares one region. Source against source gives 0 %.
  - The result is also in `<out>/result.json`. Do not pipe the output through `tail`.
  - `compare.mjs`, `trace.mjs` and `sweep.mjs` open and close their session themselves. Only
    `pw.mjs` needs `open` first and `close` at the end.
- `sweep.mjs --name <n>`: `compare.mjs` over the representative pages at three widths, with
  the bands grouped by owner. It takes 15 to 30 minutes: start it with `M/bin/detach`.
- `bin/detach <log> <command>`: runs a long command so that it survives your tool call.
- `trace.mjs <page> <width>`: pairs the texts of both pages and prints where the vertical offset
  changes. Use it first when heights differ: the first line where `dy` changes names the cause.
- `da.mjs put|preview|rm`: DA upload, preview and delete, locked to the folder. Also a module
  (`upload`, `preview`, `remove`, `request`). 4 admin calls at a time, backoff on 429 and 5xx.

Browser rules:

- Name every session with your label (`pw.mjs <label> open` first, `close` when done). Never run
  `playwright-cli close-all` or `kill-all`.
- Read a screenshot with the read tool in the turn AFTER the command that creates it.
- Never use `page.clock`: it hangs on EDS pages. Rotations are already stopped by `pw.mjs`.
- Hidden on both sides and not migrated: the OneTrust consent banner, the chat widget
  (`#chat-bar`, `#floating-icon`), analytics and tag managers.

## What the source is

- AEM Sites, server-rendered. Every page declares its template on `<body data-template>`.
- A page is a tree of components. A component is an AEM grid column, and its first class is the
  component name.
- About 25 templates. `content-page-template` is two thirds of the pages (home, product and
  solution pages, press releases, most language pages). The rest are blog posts, authors,
  resources with a form, webinars, glossary, articles, success stories, events, IP product pages.
- About 60 components. `node M/tools/census.mjs` lists them by page count. The frequent ones:
  - `text`, `column`, `banner`, `image`, `cards`, `anchor`, `tableOfContents`, `pageTitle`
  - `boxLink`, `richTextEditor`, `imageTextCta`, `floatingTabs`, `carousel`, `keyBenefits`
  - `blogsDev`, `dynamicCards`, `blogBanner`, `marketoFormsContainer`, `callToAction`
  - `video`, `quote`, `faq`
- `htmlTextOnly` holds hand-written HTML, CSS and scripts. Classify what each one does before
  you decide how to migrate it.
- `experiencefragment` is shared content: header (`--topnav`), footer (`--footer`), chatbot, and
  reusable bands inside pages. The header and footer exist once per language, with a second
  footer variant for English and Chinese.
- Layout: a Bootstrap 3 grid with containers of 1170 px, 970 px and fluid, and 30 px gutters.
- Scripts: jQuery, slick carousels, a Font Awesome 6 Pro kit that draws inline SVG icons.
- Services: VideoJS and Brightcove video, Coveo search, Marketo forms.
- Breakpoints in the source CSS, by use: 730 (dominant), 1200, 992, 1130, 1400, 480.
- Type: Roboto 300 for text. `html` is 10 px. The body colour is `#111c24`.
- The four Roboto TTF files are in the cache. Convert them to woff2 with `fonttools`.
- Sticky header: transparent over a hero at the top, white when scrolled. Utility bar from 1130.

## Earlier work you may use: `M/prior/`

Use it as a head start, then check everything against the source. It is not the truth.

- `prior/spm-ft-0001/`: the source HOME PAGE, migrated on 2026-09-26 at about 1 % diff. The
  site changed since then, so compare before you trust a value. It holds:
  - `blocks/`: header with mega-menus and mobile menu, footer, hero-carousel, cards, columns,
    logo-carousel, news-carousel
  - `styles/`, `scripts/`, `fonts/` (Roboto woff2), `icons/`
  - `sections/*.html`: its DA documents, nav and footer included
  - `notes/learnings.md` and `notes/recipe.md`
- `prior/content-pipeline/`: an earlier component-to-block mapping of 48 pages (`mapping.md`,
  `elements.md`, `chrome.md`).
- `prior/migrate-header-skill/`: the `migrate-header` skill of adobe/skills. It has a header
  block template (`assets/`) and the nav document model (`references/eds-header.md`). It also
  describes panel kinds and the check ladder.

Lessons from those runs that apply here:

- Fix heights before pixels. Most mismatch is vertical drift: margins, gaps, line heights.
- Copy the source's rendering globals: `-webkit-font-smoothing`, `box-sizing`, `html` font size.
- Breakpoints and gutters are the source's (730, not 900). Check 768 and 375 as well as 1440.
- Global defaults need zero specificity (`:where(...)`), or they beat single-class block rules.
- A block is done with its states: hover, focus, open menu, active tab, carousel step.
- Measure the integrated page. A number measured on an isolated draft does not count.

## adobe/skills: `M/vendor/adobe-skills/plugins/`

- `web/`: the `web` CLI. Run it as `M/bin/web`. `M/bin/web doc header` explains its checks.
  - `M/source/header/` holds the `web header capture` output for the home page.
  - The capture found the two header bands, the breakpoint and the mobile menu.
  - It found no desktop menu. Menus open on hover of `li.has-dropdown`. Check them with your
    own `pw.mjs` states.
  - Never point `web` at `https://www.synopsys.com`. As the source URL of a `web header check`
    command, use the offline cache:
    `http://127.0.0.1:3541/<path>?_origin=https://www.synopsys.com`
- `aem/edge-delivery-services/skills/`: read what fits your task. `da-content` (DA HTML rules,
  the 11 silent failures, media), `content-modeling`, `building-blocks`, `block-collection-and-party`,
  `migrate-header`, `page-import`.

## EDS and DA rules

- `scripts/aem.js` is vendored: never edit it. No build step, no runtime dependencies.
- `scripts/site.js` exports `siteRoot()`, `getLanguage()` and `languageRoot()`. Build every
  internal URL from them, so the site also works when it moves out of its folder.
- Scope block CSS to `.blockname`. `-wrapper` and `-container` are section classes. A block
  imports only from `/scripts/` (`blocks/fragment/fragment.js` is the one allowed cross-block
  import). Look at the real markup first: `curl http://localhost:3520/<path>.plain.html`.
- Authors omit and add cells: decorate defensively.
- DA HTML is a body fragment:
  `<body><header></header><main><div>…</div></main><footer></footer></body>`
  - One `<div>` in `<main>` per section.
  - A block is `<div class="name variant">`, with one `<div>` per row and one `<div>` per cell.
  - No `<script>`, no `<style>`, no `style=`.
  - Page metadata is a block named `metadata`. Section metadata is a block named
    `section-metadata`. An icon is `:name:` in text.
- Inside block cells the pipeline strips `<span>` and rewrites `<b>`, `<i>` to `<strong>`, `<em>`.
- Every image is copied from the source exactly once.
  - Read it with `source.mjs` and upload it into DA with `da.mjs`.
  - Reference it as
    `https://content.da.live/catalan-adobe/eds-mig-20260914/f52-synopsys-1211-02/...`
  - The importer's media helper does this and keeps a manifest.
  - Never put a `synopsys.com` host in an `<img src>`. Each preview fetches such an image from
    the source again.
- An SVG over 40 KB fails preview. An unreachable image becomes `about:error`: check for it.
- PDFs and other downloads are not migrated: link to them at `https://www.synopsys.com/...`.
- Icons: the source draws Font Awesome Pro icons as inline SVG, from a kit locked to its own
  domain. Do not load the kit. Read the rendered `svg.svg-inline--fa` from the source page with
  `pw.mjs` and save it as `icons/<name>.svg`. Add new icon files only, never change one.

## The importer: `M/import/`

`M/import/README.md` describes it. It exists once the Foundation phase is over.

- `node M/import/import.mjs` turns the fetched source HTML into DA documents, uploads the ones
  that changed and previews them. It can run for one page, for a list, or for every page.
- Each source component has a transform in `M/import/components/<component>.mjs`. The group that
  owns a block owns the transforms of its components too: both ends of the content model.
- A component without a transform falls back to default content, with a warning.

## Working in a shared checkout

- You own only the files your task names. Do not edit, format or delete anyone else's files. If
  you need a change elsewhere, return it as a request.
- Lint your own files only: `npx eslint <your files>` and `npx stylelint <your css>`. Both clean.
- Commit only your own paths: `git add <paths>` then `git commit -m "<subject>" -- <paths>`. If
  git says `index.lock` exists, wait two seconds and retry. Never `git add -A`, `git stash`,
  `git reset`, `git checkout <file>` or `git clean`. Do not push unless your task says so.
- A commit-gate hook rejects `git commit` until your session reads this file:
  `/Users/catalan/.pi/agent/git/github.com/obra/superpowers/skills/verification-before-completion/SKILL.md`
  Read it, verify with fresh evidence, then commit.
- Imperative commit subject of at most 72 characters. Never `rm -rf` (use `trash`).
- Code: functions of at most 100 lines and lines of at most 100 characters. No commented-out
  code. Comment only a why the code cannot show. Write the smallest code that does the job.
- Write scratch files under `/tmp/f52s/<your label>/`, never in the repository.

## Work that is already there

This run was paused once and then resumed. Your own paths can hold files that your session did
not write: changed files, new block folders, transform files, notes. They are the earlier work
of your own role.

- Run `git status --short` on your paths first.
- Read what is there, check it against the source, and continue from it.
- Do not start over and do not delete it. Commit it together with your own work.
- Files in other owners' paths are theirs. Leave them alone.

## Reporting

State what you verified and what you did not. A number you report comes from a tool run in your
session against the integrated page on http://localhost:3520. Your final answer must match the
requested JSON shape.
