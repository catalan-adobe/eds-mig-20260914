# EDS Developer Digest — building one page with DA-authored custom blocks

Sources: aem.live/llms.txt-linked docs, github.com/adobe/aem-boilerplate + aem-block-collection
(read `scripts.js`/`aem.js`/block `.js`; several block-collection pages redirect to a sidekick
UI, not static docs), admin.hlx.page + admin.da.live OpenAPI specs, verified live against
org=`catalan-adobe` site=`eds-mig-20260914`.

## 1. DOM contract (markup-sections-blocks)

- Authored doc → three concepts: **default content** (headings/text/lists/images, mapped
  1:1 from Word/Google Doc/DA), **sections** (split by `---` / DA table breaks), **blocks**
  (a table whose first row/header cell is the block name). Blocks never nest.
- `aem.js` augments server markup into the dev DOM: `decorateSections` makes each direct
  child `div` of `<main>` a `.section`, wraps non-block runs into `.default-content-wrapper`,
  sets `data-section-status=initialized`, `display:none` until loaded. `decorateBlocks`/
  `decorateBlock` add classes `blockname block`, `data-block-name`, `data-block-status` to
  the block, `blockname-wrapper` to its parent `div`, `blockname-container` to its section.
  `loadBlock` dynamically imports `/blocks/<name>/<name>.js` (ESM default `decorate(block)`)
  + `<name>.css`.
- **Block options** — `Columns (wide)` → `<div class="columns wide">`; multi-word options
  hyphenate (`(super wide)` → `super-wide`); comma-separated options become separate classes.
- **Section Metadata** (table titled `Section Metadata`, key/value rows) → `data-*` attributes
  on the containing `.section`. `Style` → CSS `class` (not `data-style`); `Id` → element `id`
  (must be unique per doc). Handled by core, no project JS needed.
- **Buttons** (`decorateButtons`): a `<p>` with exactly one link becomes `p.button-wrapper >
  a.button`; `**link**` (strong) → `.primary`; `*link*` (em) → `.secondary`; `***link***`
  (strong+em) → `.button.accent` (high-impact CTA). Plain URL-as-text and image links skipped.
- **Images** render as `<picture>` (`createOptimizedPicture`): webp `<source>` per breakpoint
  (default `600px`→2000w, mobile→750w) + fallback same-format `<source>`/`<img>`, each URL
  `?width=N&format=webply|<ext>&optimize=medium`. `eager` param → `loading="eager"` for the
  LCP candidate, else `"lazy"`.
- **Auto blocking** (`buildAutoBlocks`, runs before block loading): any
  `a[href*="/fragments/"]` not already in `.fragment` → fragment block; any
  `a[href*="/widgets/"]` → `widget` block via `buildBlock('widget', {elems:[link]})`. Project
  auto-blocking (e.g. article-header from `<h1>`+first image+metadata) lives in the same fn.
- `readBlockConfig(block)`: turns a 2-col block's rows into `{key: value}` (link→href,
  img→src, else textContent) — standard way block JS reads config-style blocks (Hero, Metadata).

## 2. Anatomy of a project

- Buildless, runs off GitHub. Branch previews: `https://<branch>--<repo>--<owner>.aem.page/`;
  published: `https://<branch>--<repo>--<owner>.aem.live/`. `<branch>--<repo>--<owner>` ≤ 63
  chars total, none of the 3 parts may contain `--`. Every repo file served at matching path.
- `head.html` injected server-side into `<head>`; keep unchanged except base-URL rewrites;
  never add 3rd-party/martech tags or inline scripts here. `404.html` in repo root replaces the
  404 body. `.hlxignore` (like `.gitignore`) hides files from being served.
- Config (content source, code source, indexing, sitemap, robots.txt) lives in the **Admin API
  Configuration Service**, UI at tools.aem.live — not file-based (`fstab.yaml`/`helix-query.yaml`
  retired/legacy).
- Conventional folders: `/scripts` (`scripts.js`, `aem.js`, `styles.css` load synchronously —
  keep tiny), `/styles` (`styles.css` + `lazy-styles.css` for below-the-fold/fonts),
  `/blocks/<name>/<name>.{js,css}`, `/widgets/<name>/` (self-contained app-like features
  dropped in via a link, not a table — `decorate(el)` in `.js`, own `.html`/optional `.json`),
  `/icons/*.svg` (`:iconname:`, inlined into DOM).

## 3. Keeping it 100 — E-L-D loading

- **Eager**: body hidden (`display:none`) until decorated; decorate DOM; display body; load
  full first section prioritizing the LCP image; once loaded, show section, load fonts async.
  Target: <100kb before LCP, single origin only (no second-origin connections before LCP).
- **Lazy**: remaining sections/blocks, `loading="lazy"` images, non-blocking scripts — same
  origin preferred.
- **Delayed**: `loadDelayed()` imports `consent-check.js` (declines consent by default, only
  imports `consented.js` — the 3rd-party/martech catch-all — after consent). No hard-coded
  timer anymore; add your own ≥3s delay in `consent-check.js`/`consented.js` if needed.
- Anti-patterns confirmed harmful for PSI: `<link rel=preload>`, `fetchpriority=high`, early
  hints/h2-push/pre-connect, path redirects, CDN-injected scripts, minification (no measurable
  gain — don't bother).
- Fonts load right after LCP (preloading hurts LCP); boilerplate uses font-fallback for CLS.
  Header/footer load async via their own blocks, not in the critical LCP path.

## 4. Block content models (from public boilerplate/collection source)

| Block | Content model (DA table rows) | Decorate behavior |
|---|---|---|
| **Hero** | 1 row: image cell + text cell (h1/eyebrow/cta) | Boilerplate hero ships no JS — pure CSS; often built via auto-blocking from `<h1>`+first image instead of an authored table |
| **Cards** | 1 row per card: [image][title/body/link] | wraps rows into `<ul><li>`; cell w/ only a `<picture>` → `.cards-card-image`, else `.cards-card-body`; re-optimizes images to 750w |
| **Columns** | 1 row = N columns (N = col count for that row) | adds `columns-N-cols`; a column containing only a picture gets `columns-img-col` |
| **Carousel** | 1 row per slide: [image][content...] | row → `<li class="carousel-slide">`; col 0 → `carousel-slide-image`, rest → `-content`; builds indicators/prev/next, IntersectionObserver-driven active slide |
| **Tabs** | 1 row per tab: [label][panel content] | first cell → tab button (`role=tab`), row → `role=tabpanel`, id'd via `toClassName(label)` |
| **Fragment** | 1 cell: link to another DA page (or bare path) | fetches `{path}.plain.html`, rebases `./media_*` URLs, runs `decorateMain`+`loadSections`, splices children in (boilerplate variant replaces/flattens the whole section if it's the only sibling) |
| **Embed** | 1 cell: a link/URL (YouTube/Vimeo/social) | matches host, builds responsive 16:9 iframe wrapper, lazy-loads oEmbed/social scripts |
| **Video** | 1 cell: link to mp4/YouTube/Vimeo, optional poster row | detects source type; autoplay/background respect `prefers-reduced-motion` |
| **Header** | not authored — auto-loaded (`loadHeader`) into `<header>`; content from a **fragment** (default `/nav` doc): branding, nested-`<ul>` nav, tools |
| **Footer** | not authored — auto-loaded (`loadFooter`) into `<footer>`; content from a `/footer` doc |
| **Section Metadata** | key/value rows (see §1) | consumed by boilerplate core, no block JS |
| **Metadata** | key/value rows in the page's own metadata block, or a bulk-metadata sheet | mapped to `<meta>` tags, read via `getMetadata(name)` |

Widgets (form, search, calculator) are **not** blocks — no content table; author drops a link
to `/widgets/<name>`, auto-blocked (see §1/§2).

## 5. Dev collaboration & good practices (key rules)

- Never push to `main` directly; PRs include a preview branch URL, stay scoped, get 1 approval;
  talk to maintainers before content-model changes; only the PR author merges. Code Sync
  auto-deploys `main` → production. PSI/Lighthouse must be green (~100 mobile+desktop);
  `eslint`(airbnb-base)+`stylelint` must pass — don't change lint config for preference.
- CSS: scope every selector to the block; mobile-first; breakpoints `600/900/1200px`
  `min-width` only; no `!important`; no pre/post-processors without team buy-in; prefer ARIA
  states over inventing classes.
- JS: no frameworks/build tools without buy-in (`aem.js` needs dynamic `import()`); load
  3rd-party libs inside the block via `loadScript()`, never in `<head>`/`head.html`; don't
  minify (no perf gain here, adds complexity).
- Content-first: build sample content in Word/Google Doc/DA before coding; use
  `/drafts/<name>/` for in-progress content-model changes; keep new blocks backwards-compatible
  with existing content; never commit binaries/HTML as "static resources".

## 6. `aem` CLI (`npm install -g @adobe/aem-cli`)

- `aem up [--url <origin>] [--port 3000] [--open /path] [--livereload|--no-livereload]
  [--html-folder <dir> --html-mount /path --prefer-plain-html] [--site-token <t>] [--cookies]
  [--allow-insecure] [--print-index] [--forward-browser-logs]`. `--html-folder` serves local
  `.html`/`.plain.html` without extensions — for previewing content edits without authoring
  access (useful for AI-agent workflows).
- `aem import [--port 3001] [--ui-repo <git-url>#<branch>] [--skip-ui] [--headers-file <json>]`
- `aem content clone --path /some/da/folder [--org O --site S] [--force] [--yes]` → checks out
  da.live sources into `./content/` (git-like local repo); `content status|diff|add|commit -m
  "..."|merge|push [--path P] [--dry-run] [--force]`. When `content/` exists, `aem up` serves
  matching paths from it automatically.
- `content` auth: interactive IMS browser login on first use (token cached in `.hlx/`), or
  `--token <IMS token>` for CI.

## 7. AEM Admin API (`https://admin.hlx.page`) — verified

- Auth: `authorization: Bearer <IMS token>` worked directly against `admin.hlx.page/status/...`
  (401 without it, 200 with it) — simpler than the doc's `authorization: token $API_KEY`
  (separate admin-service API key via `Create Site API key`); the IMS bearer/cookie flow from
  `/login` also works as a plain header.
- `GET /status/{org}/{site}/{ref}/{path}` — overall status; `preview`/`live`/`edit`/`code`
  sub-objects each with `status`, `url`, `contentBusId`, `permissions`, plus `links`.
- `POST /preview/{org}/{site}/{ref}/{path}` — fetches latest from content source into the
  `preview` bus partition; `GET`=status, `DELETE`=remove; `POST .../*` + JSON
  `{paths, forceUpdate, delete}` bulk-previews (folders via trailing `/*`), async, returns a
  `job`. `POST /live/{org}/{site}/{ref}/{path}` = publish (same shape).
- `GET/POST/DELETE /code/{org}/{site}/{ref}/{path}` — code-bus status per file, keyed by
  `codeBusId=helix-code-bus/{org}/{site}/{ref}/{path}`; `sourceLocation` = GitHub raw URL.
  Verified: `scripts/scripts.js` → 200 with `contentType`/`contentLength`/`lastModified`.
- 429 responses carry `X-Error`; see `/docs/limits`. Content `resourcePath` is `path + .md`
  (admin normalizes to `.md` internally even though DA stores/serves HTML).

## 8. DA Admin API (`https://admin.da.live`) — verified

- Auth: `security: bearer` on every op → `Authorization: Bearer <IMS token>`. Verified 200 on
  `list`/`source` (get) with the same token as §7.
- `GET /list/{org}/{repo}/{path}` — children as `[{path, name, ext?, lastModified?}]` (folders
  omit `ext`/`lastModified`); paginate via `da-continuation-token` header.
- `GET /source/{org}/{repo}/{path}` — raw content; `path` must include extension for files;
  `Content-Type` matches stored type (`text/html`, `application/json`, `image/png`, ...).
- `PUT /source/{org}/{repo}/{path}` — create/replace: `multipart/form-data` with `data` field
  + optional `guid` (UUID; mismatch on existing doc → 409), or raw body for `text/html`/
  `application/json` → 201 `{source:{editUrl,contentUrl,props}, aem:{previewUrl,liveUrl}}`.
  `POST` = create (same body); `DELETE` → 204.
- `POST /copy/{org}/{repo}/{path}` / `POST /move/{org}/{repo}/{path}` — `multipart/form-data`
  with `destination` field (e.g. `'/aemsites/geometrixx/path/to/file.html'`); folders omit ext.
- `GET/POST /versionsource/...`, `GET /versionlist/...` — version history.
  `GET/POST /config/{org}/{repo}/{path}` — sheet-formatted config for org/site/dir/doc/sheet.
- Images in DA HTML (`<img src="https://content.da.live/{org}/{repo}/media/...">`) are served
  from DA's media store; on preview, `admin.hlx.page` fetches the DA HTML and rewrites/ingests
  referenced media into the AEM **media bus** (`main--{site}--{org}.aem.page/media_<hash>.<ext>`)
  — what `createOptimizedPicture` URLs resolve to once live.

## 9. DA document HTML shape (verified from live `index.html`, `nav.html`)

```html
<body>
  <header></header>
  <main>
    <div><div class="metadata">                 <!-- Metadata block: key/value rows -->
      <div><div>Title</div><div>Page Title</div></div>
      <div><div>og:image</div><div><img src="..."></div></div>
    </div></div>
    <div><div class="hero-section">              <!-- section w/ Style="hero-section" -->
      <div><div><p><img src="..."></p></div></div>            <!-- block, row, cell -->
      <div><div><h1>Headline</h1></div></div>
    </div></div>
    <div><div><p>...</p></div></div>                <!-- plain section, default content -->
  </main>
  <footer></footer>
</body>
```
- `main` > direct `div` children = **sections**; each section's direct `div` children are
  either a **block** (first grandchild carries the block's identifying class, e.g.
  `hero-section`, `tabs`, `accordion`) or default content (bare `p`/`h*`/`img` wrapped one
  level in a `div`). Table rows/cells become nested `div`s two levels deep (`block > row >
  cell`), matching `buildBlock()`'s output exactly — DA authoring produces the *already
  block-ified* markup, no table-to-div translation step needed server-side.
- `<header>`/`<footer>` are always present but empty in the DA source — populated client-side
  by `loadHeader`/`loadFooter`, not authored per page.
- Page `metadata` block is just another block (`class="metadata"`) placed anywhere in `main`;
  becomes `<meta name="..." content="...">` tags via `getMetadata`.

## 10. Page metadata & per-page header/footer override

- Standard keys: `Title`, `Description`, `Image`/`og:image`, `Template` (adds a class to
  `<body>` via `decorateTemplateAndTheme`, e.g. `guides`), `Theme` (same, for CSS themes),
  `Nav` (fragment doc path for header nav, e.g. `/new-nav`), `Footer` (fragment doc path for
  footer content, e.g. `/new-footer`) — override header/footer per page/section without code
  changes; every source doc used in this digest carries its own `Nav`/`Footer` metadata.
- Other keys (`Category`, etc.) are project-defined; unconsumed keys just become extra `<meta>` tags, harmless to add.

## Gotchas (verified)

- macOS system `curl` **cannot decode Brotli** (no `brotli` feature); aem.live serves
  `content-encoding: br` regardless of `Accept-Encoding: identity` sometimes — pipe through
  `brotli -d` / `gunzip -c` on the raw response.
- Several `/developer/block-collection/{hero,cards,columns,carousel,tabs,fragment,embed,video}`
  URLs **301-redirect** to an interactive sidekick-library viewer, not a static doc — only
  `header`, `footer`, `metadata`, `section-metadata` still resolve as plain pages. Content
  models for the redirecting ones were reverse-engineered from block `.js` source in
  `adobe/aem-block-collection` / `adobe/aem-boilerplate`.
- The IMS bearer token in `.hlx/.da-token.json` worked as a plain `Authorization: Bearer`
  header against **both** `admin.hlx.page` and `admin.da.live` — no separate site API key or
  cookie exchange needed for read calls, despite the Admin API doc's primary example
  describing a browser-login cookie (`auth_token`) or `authorization: token $API_KEY`.
- `GET /status/.../index` returned `code.status: 404` even though the site is live — code-bus
  status is per-path (`codeBusId=.../main/index`, no extension), distinct from
  `/code/.../scripts/scripts.js` which returned 200; one `code` check doesn't cover the site.
- DA-authored HTML already matches the AEM-block DOM shape 1:1 (`div.blockname > div (row) >
  div (cell)`) — no separate "table" markup to translate; DA stores blocks as nested `div`s
  directly, not `<table>`.
