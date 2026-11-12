export const meta = {
  name: 'synopsys_eds_migration',
  description: 'Migrate synopsys.com to Edge Delivery Services: contract from the component census, importer core and foundation, one owner per component family, measured fix rounds, rollout of all pages, report and pull request',
  phases: [
    { title: 'Contract' },
    { title: 'Foundation' },
    { title: 'Blocks' },
    { title: 'Visual QA' },
    { title: 'Behaviour' },
    { title: 'Rollout' },
    { title: 'Wrap-up' },
  ],
};

const FABLE = 'azure-anthropic/claude-fable-5-2';
const OPUS = 'azure-anthropic/claude-opus-5-5';
const SONNET = 'azure-anthropic/claude-sonnet-5-5';
const MAIN = '/Users/catalan/repos/ai/migration-tests/from-scratch-mig/f52-synopsys-1211-02';
const M = `${MAIN}/.migration`;
const BRANCH = 'f52-synopsys-1211-02';
const PREFIX = '/f52-synopsys-1211-02';
const LOCAL = 'http://localhost:3520';
const BRANCH_ORIGIN = 'https://f52-synopsys-1211-02--eds-mig-20260914--catalan-adobe.aem.page';
const MAX_GROUPS = 18;
const MAX_ROUNDS = 4;
const MAX_TAIL_ROUNDS = 2;
const FIXED_GROUPS = ['header', 'footer', 'global'];

const COMMON = `You are one of several agents migrating https://www.synopsys.com to Adobe Edge Delivery Services, 1:1 with the source. FIRST read ${M}/BRIEF.md in full: it holds the facts, the one hard rule about the source site, the tools, and the rules for working in the shared checkout. Then read ${M}/CONTRACT.md when it exists. Everyone builds against the contract.`;

const run = (prompt, opts) => agent(`${COMMON}\n\n${prompt}`, { thinking: 'high', ...opts });
const soft = (label, call) => call.catch((e) => {
  log(`${label} threw: ${e.message}`);
  return null;
});
const strings = { type: 'array', items: { type: 'string' } };
const ledger = [];
const record = (id, stage, result) => {
  ledger.push({ id, stage, status: result === null ? 'missing' : 'done' });
  return result;
};

const contractSchema = {
  type: 'object',
  properties: {
    commit: { type: 'string' },
    groups: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          summary: { type: 'string' },
          blocks: strings,
          components: strings,
          samplePages: strings,
          states: { type: 'string' },
        },
        required: ['id', 'summary', 'blocks', 'components', 'samplePages', 'states'],
      },
    },
    notMigrated: strings,
    notes: { type: 'string' },
  },
  required: ['commit', 'groups', 'notMigrated', 'notes'],
};
const buildSchema = {
  type: 'object',
  properties: {
    commit: { type: 'string' },
    status: { type: 'string', enum: ['done', 'partial', 'failed'] },
    summary: { type: 'string' },
    requests: strings,
    remaining: strings,
  },
  required: ['commit', 'status', 'summary', 'requests', 'remaining'],
};
const widthStats = {
  type: 'object',
  properties: {
    width: { type: 'number' },
    pages: { type: 'number' },
    failed: { type: 'number' },
    median: { type: 'number' },
    p90: { type: 'number' },
    max: { type: 'number' },
    over1: { type: 'number' },
  },
  required: ['width', 'pages', 'failed', 'median', 'p90', 'max', 'over1'],
};
const measureSchema = {
  type: 'object',
  properties: {
    summaryPath: { type: 'string' },
    stats: { type: 'array', items: widthStats },
    bandsPerOwner: {
      type: 'array',
      items: {
        type: 'object',
        properties: { owner: { type: 'string' }, bands: { type: 'number' }, firstBands: { type: 'number' } },
        required: ['owner', 'bands', 'firstBands'],
      },
    },
    importFailed: strings,
    problems: strings,
  },
  required: ['summaryPath', 'stats', 'bandsPerOwner', 'importFailed', 'problems'],
};
const fixSchema = {
  type: 'object',
  properties: {
    commit: { type: 'string' },
    fixed: strings,
    wontfix: {
      type: 'array',
      items: {
        type: 'object',
        properties: { item: { type: 'string' }, reason: { type: 'string' } },
        required: ['item', 'reason'],
      },
    },
    requests: strings,
    notes: { type: 'string' },
  },
  required: ['commit', 'fixed', 'wontfix', 'requests', 'notes'],
};
const auditSchema = {
  type: 'object',
  properties: {
    checked: strings,
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          owner: { type: 'string' },
          page: { type: 'string' },
          viewport: { type: 'string' },
          description: { type: 'string' },
        },
        required: ['owner', 'page', 'viewport', 'description'],
      },
    },
  },
  required: ['checked', 'findings'],
};
const rolloutSchema = {
  type: 'object',
  properties: {
    pagesTotal: { type: 'number' },
    pagesPreviewed: { type: 'number' },
    pagesFailed: { type: 'number' },
    contentCheckFailed: { type: 'number' },
    ownersFile: { type: 'string' },
    owners: {
      type: 'array',
      items: {
        type: 'object',
        properties: { owner: { type: 'string' }, pages: { type: 'number' } },
        required: ['owner', 'pages'],
      },
    },
    newComponents: strings,
    sourceStopped: { type: 'boolean' },
    notes: { type: 'string' },
  },
  required: ['pagesTotal', 'pagesPreviewed', 'pagesFailed', 'contentCheckFailed', 'ownersFile', 'owners', 'newComponents', 'sourceStopped', 'notes'],
};
const wrapSchema = {
  type: 'object',
  properties: {
    prUrl: { type: 'string' },
    head: { type: 'string' },
    pagesPreviewed: { type: 'number' },
    summary: { type: 'string' },
    gaps: strings,
  },
  required: ['prUrl', 'head', 'pagesPreviewed', 'summary', 'gaps'],
};

// ---------------------------------------------------------------- Contract
phase('Contract');
const contractPrompt = (label) => `YOUR ROLE: architect (label: ${label}). You write the contract everyone builds against: ${M}/CONTRACT.md and ${M}/owners.json. No other agent runs now.

Work from measurements, offline. The server HTML of several thousand pages is in ${M}/source/pages and names every component.
1. Run node ${M}/tools/census.mjs. For every component it lists, look at what it really is: component.mjs children, variants and html (2 or 3 instances), and component.mjs tree on 2 or 3 pages of each template. Read ${M}/prior/content-pipeline/mapping.md and ${M}/prior/spm-ft-0001/sections/ (earlier attempts: a head start, not the truth).
2. Give EVERY component of the census exactly one treatment: default content, a block (name and variant), a section style, a fragment, page metadata, or not migrated (with the reason).
   Content model rules:
   - Default content first. A block only where structure or behaviour needs one. Few blocks with variants, not one block per source component.
   - EDS has no nested blocks: flatten. A container of like items (a column of cards, of key benefits, of box links) is ONE block with one row per item. Mixed text and image side by side is a columns block. Tabs, accordions and carousels are one block with a row per panel.
   - Background, width and spacing of a container are a section style (section-metadata), not a block.
   - Shared bands (experiencefragment inside pages) are fragments under ${PREFIX}/fragments/. Nav and footer are documents per language: <language root>/nav and <language root>/footer, plus the footer variants the source has.
   - A page's AEM template becomes the page metadata key template, which sets a body class.
   - Block names: lowercase, single hyphens. Cells hold only what DA keeps (read the da-content skill named in the brief).
3. htmlTextOnly holds hand-written HTML, CSS and scripts on most pages, and banners carry a per-instance style element. Measure with a small script over all fetched pages: how many distinct rule sets, what they target, what the scripts do (JSON-LD, tracking, embeds, forms). Then decide per class: a variant or section style for a frequent pattern, page metadata for JSON-LD, not migrated for tracking. Say which pages keep a visible difference.
4. Dynamic content: lists drawn by a query (blogsDev, dynamicCards, pageList, pressRelease, search), Marketo forms, Brightcove video, maps. Decide what the block does so the page looks and behaves like the source. For lists, prefer an index the importer builds from the source pages (a JSON sheet in DA under ${PREFIX}) that the block renders in the source's order, with its paging and filters. Third-party services stay as the source uses them when they work from another domain.
5. Design tokens: names for colours, type scale, spacing, container widths and breakpoints, with the values from the source CSS (css-rules.mjs).
6. Ownership. Split the blocks into at most ${MAX_GROUPS} groups, plus the three fixed groups header, footer and global. A group is 1 to 4 related blocks that one developer can finish 1:1, states included, in one to two hours. A group owns blocks/<name>/ for its blocks AND ${M}/import/components/<component>.mjs for the source components that feed them. Every block is in exactly one group, every migrated component in exactly one group. global owns default content, sections, section styles and the generic components (text, image, column, title, anchor and the like). For each group give 3 to 6 sample pages that together show its variants: take them from node ${M}/tools/reps.mjs --only <component> and prefer pages in ${M}/source/reps.txt.
   owners.json: {"groups": {"<id>": {"blocks": ["..."], "components": ["..."]}}}. It must hold header, footer and global. The sweep tool reads it.

CONTRACT.md, exact and short (a contract, not an essay):
 a) page model: sections, the section styles, templates, metadata keys
 b) table: every source component and its treatment
 c) block catalogue: per block its purpose, variants, the authored DA markup as an HTML example (rows and cells), the source components that feed it, its states and behaviour
 d) fragments, nav and footer documents
 e) dynamic data
 f) design tokens
 g) ownership table
 h) decisions made, each with its reason
Check that every HTML example is valid DA markup. Commit CONTRACT.md and owners.json.

Return JSON: commit (full SHA), groups (every group except header, footer and global: id in kebab-case, summary, blocks, components, samplePages as source paths like /ai.html, states: the states and interactions its blocks have), notMigrated (component: reason), notes.`;

let contract = record('contract', 'contract', await soft('contract', run(contractPrompt('contract'), { label: 'contract', model: FABLE, schema: contractSchema })));
if (contract === null) {
  contract = record('contract-retry', 'contract', await soft('contract-retry', run(`${contractPrompt('contract-retry')}\n\nA previous attempt stopped midway. Look at what ${M}/CONTRACT.md and ${M}/owners.json already hold and continue from there.`, { label: 'contract-retry', model: FABLE, schema: contractSchema })));
}
if (contract === null) return { complete: false, stage: 'contract', reason: 'the architect failed twice', ledger };

const groupMap = new Map();
for (const g of contract.groups) {
  const id = String(g.id).trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
  if (id && !FIXED_GROUPS.includes(id) && !groupMap.has(id)) groupMap.set(id, { ...g, id });
}
const groups = [...groupMap.values()].slice(0, MAX_GROUPS);
const droppedGroups = [...groupMap.keys()].slice(MAX_GROUPS);
const ownerIds = [...groups.map((g) => g.id), ...FIXED_GROUPS];
log(`contract: ${groups.length} groups (${groups.map((g) => g.id).join(', ')})`);
if (droppedGroups.length) log(`groups over the cap, not built: ${droppedGroups.join(', ')}`);
if (groups.length === 0) return { complete: false, stage: 'contract', reason: 'the contract has no group', contract, ledger };

const ownedFiles = (id) => {
  if (id === 'global') return `styles/, scripts/ (never scripts/aem.js), head.html, 404.html, and in ${M}/import/ the core and the transforms of the global group`;
  if (id === 'header') return `blocks/header/, ${M}/import/chrome/header.mjs, new files in icons/, and the nav documents in DA`;
  if (id === 'footer') return `blocks/footer/, ${M}/import/chrome/footer.mjs, new files in icons/, and the footer documents in DA`;
  const g = groupMap.get(id);
  return `${g.blocks.map((b) => `blocks/${b}/`).join(', ')}, ${g.components.map((c) => `${M}/import/components/${c}.mjs`).join(', ')}, new files in icons/, and ${M}/groups/${id}.md`;
};

// -------------------------------------------------------------- Foundation
phase('Foundation');
const importCorePrompt = `YOUR ROLE: importer core (label: import-core). You own ${M}/import/, except components/<name>.mjs of groups other than global, and chrome/ (header and footer owners). Three other agents work in parallel on styles, header and footer.

Build the importer that turns the fetched source HTML into DA documents. One transform per source component, so each group can add its own later.
1. CLI: node ${M}/import/import.mjs with --page <source path>, --pages <file>, --all (every page of pages.jsonl with status 200), and --dry (build and check only), --media (only make sure the media of the selected pages is in DA), --force. Node 24 ESM, cheerio from ${M}/package.json, no other dependency.
2. Per page: read ${M}/source/pages/<path>, drop the chrome (header, footer and chatbot experience fragments), walk the AEM component tree in DOM order, hand each component to components/<name>.mjs, assemble sections, section metadata and the metadata block as CONTRACT.md defines them, write ${M}/out/<path>.html. Upload and preview a document only when its content changed since its last successful upload (keep a manifest in ${M}/out/).
3. The transform interface: design it small and write it down in ${M}/import/README.md with one worked example. A transform gets the component element and a context that offers: rendering of child components, a media helper, a link rewriter, a block builder (name, variants, rows of cells), a warning hook, and the page's path, language and template. A component without a transform falls back to default content (its text, images and links in order) with a warning in the report: nothing is lost silently.
4. Links: an internal page link becomes the ${PREFIX} path without .html, in the right language tree. External links stay. PDFs and other files link to the absolute source URL. Anchors stay.
5. Media helper: every image is copied from the source exactly once (getSource from ${M}/tools/source.mjs), uploaded into DA under ${PREFIX}/media/ with a stable name, and referenced by its content.da.live URL. Keep the manifest in ${M}/source/media-manifest.json so it survives. For Dynamic Media images pick one rendition and say which in the README. Report an SVG over 40 KB. Prove on ONE page first that preview ingests the image (an img with a ./media_ path in the .plain.html, not about:error).
6. Self-check after every build, failing loudly per page: a block name the contract does not have, an internal link still on synopsys.com or ending in .html, an empty main, a script or style element or style attribute, an image not on content.da.live, an alt text the source had and the output lacks. Content check: the words of the source's main content against the words of the output (recall of at least 0.98, with the missing words), and the image count. Write ${M}/out/report.json: per page its status, recall, warnings, components and blocks.
7. Preview through ${M}/tools/da.mjs, 4 admin calls at a time. For --all, look up the bulk preview job of admin.hlx.page and use it if it is simpler and kinder to the API. Check each page answers 200 as .plain.html.
8. Write the transforms of the global group per the contract.
9. Tests with node --test: link rewriting, section assembly, the self-check. Break the code once to see a test fail.
10. Run the importer for every page of ${M}/source/reps.txt. Every one must preview, even if most components still fall back to default content: the other owners replace the fallbacks next.
Commit ${M}/import/.

Return JSON: commit (full SHA), status, summary (how many representative pages preview, the interface in two lines), requests (what you need from others), remaining.`;

const foundationPrompt = `YOUR ROLE: foundation developer (label: foundation). You own styles/, scripts/ (never scripts/aem.js; scripts/site.js exists, extend it only if needed), head.html, 404.html and favicon.ico. Three other agents work in parallel on the importer, header and footer.

Build the global layer exactly as CONTRACT.md defines it:
1. styles/styles.css: the design tokens as custom properties, base typography, links, buttons, lists, tables, default content, sections and every section style, the template body classes. Take every value from the source CSS with css-rules.mjs, at every breakpoint. Copy the rendering globals too (font smoothing, box sizing). Global defaults with zero specificity (:where). styles/fonts.css and fonts/ already hold the source's Roboto: keep them, and fix the font variables in styles.css.
2. scripts/scripts.js: html lang from getLanguage(), the template body class, button and default-content decoration as the source renders them, the auto-blocks the contract asks for. Keep the trusted-types policy and the loading phases of the boilerplate.
3. head.html: keep the CSP meta and the script tags. Add only what the contract needs.
4. favicon.ico from the source. 404.html in the source's look.
5. Delete a boilerplate block only when no group of the contract owns a block of that name.
6. Write ${M}/FOUNDATION.md, short: the token names, the helpers and the conventions block developers must use.
7. Test with hand-written pages in ${M}/drafts/foundation/, and with the representative pages as soon as the importer previewed them (poll ${LOCAL}${PREFIX}/ai.plain.html). Compare default-content regions with the source: headings, text, lists, buttons, section spacing, at 1440, 768 and 375.
Lint your files, commit.

Return JSON: commit (full SHA), status, summary, requests (changes you need in the importer or elsewhere, exact), remaining.`;

const chromePrompt = (part) => `YOUR ROLE: ${part} owner (label: ${part}). You own ${ownedFiles(part)}. Three other agents work in parallel on the importer core, the global styles and the ${part === 'header' ? 'footer' : 'header'}.

Rebuild the source's ${part} 1:1 as the EDS ${part} block, for all five languages${part === 'footer' ? ' and for the second footer variant that English and Chinese pages have' : ''}.
1. The source ${part} is the experience fragment .cmp-experiencefragment--${part === 'header' ? 'topnav' : 'footer'} in every fetched page (one per language${part === 'footer' ? ', two variants in some languages: find which pages use which' : ''}). Start from ${M}/prior/spm-ft-0001/blocks/${part}/ and ${M}/prior/spm-ft-0001/sections/${part === 'header' ? 'nav' : 'footer'}.html (the home page ${part} migrated in September, about 1 % off) and ${part === 'header' ? `${M}/prior/migrate-header-skill/ (the migrate-header skill: block template, nav document model, check ladder) and ${M}/source/header/ (a capture of the two header bands)` : 'the source CSS'}. Check everything against the source of today.
2. Write ${M}/import/chrome/${part}.mjs: it builds the ${part === 'header' ? 'nav' : 'footer'} document of each language from the source HTML, as authorable EDS content (headings, lists, links, images; no HTML or JSON in cells), copies its images into DA (${M}/tools/source.mjs, then ${M}/tools/da.mjs), uploads the documents to <language root>/${part === 'header' ? 'nav' : 'footer'} under ${PREFIX} and previews them. The importer core is being written in parallel: do not depend on it. Internal links go to the ${PREFIX} paths without .html.
3. blocks/${part}/: load the document of the page's language (languageRoot() from scripts/site.js${part === 'footer' ? ', and the footer metadata of a page when it names another variant' : ''}) and render it as the source does at every width.
${part === 'header' ? `4. States, each compared with the source: closed at 1440, 1130, 992, 768 and 375; the utility bar; every mega-menu open (they open on hover of li.has-dropdown on the source); the language selector; the search layer; the mobile menu and each of its levels; sticky behaviour while scrolling (transparent over a hero at the top, white when scrolled); keyboard use. The search itself uses Coveo on the source: follow the contract.
5. Test on a draft page of your own (${M}/drafts/header/) and on the home page once it is previewed. Use compare.mjs with --src-sel and --tgt-sel for the closed header, and pw.mjs scripts of your own for the states (the same script on both sites, a screenshot of the same region, then magick compare).` : `4. States: every width from 1440 to 375, link hover and focus, the language selector, the social icons, any accordion the source shows on mobile.
5. Test on a draft page of your own (${M}/drafts/footer/) and on the home page once it is previewed. Use compare.mjs with --src-sel and --tgt-sel.`}
6. Lint your files, commit.

Return JSON: commit (full SHA), status, summary (each state and its measured difference), requests (changes you need outside your files, exact), remaining.`;

const foundationJobs = [
  { id: 'import-core', prompt: importCorePrompt },
  { id: 'foundation', prompt: foundationPrompt },
  { id: 'header', prompt: chromePrompt('header') },
  { id: 'footer', prompt: chromePrompt('footer') },
];
const foundationResults = await parallel(foundationJobs.map((job) => () => soft(job.id, run(job.prompt, { label: job.id, model: FABLE, schema: buildSchema }))));
foundationResults.forEach((r, i) => record(foundationJobs[i].id, 'foundation', r));
for (const i of [0, 1]) {
  if (foundationResults[i] === null || foundationResults[i].status === 'failed') {
    const job = foundationJobs[i];
    log(`${job.id} failed, retrying once`);
    foundationResults[i] = record(`${job.id}-retry`, 'foundation', await soft(`${job.id}-retry`, run(`${job.prompt}\n\nA previous attempt stopped midway (your label is now ${job.id}-retry). Look at what is already in your files and continue from there.`, { label: `${job.id}-retry`, model: FABLE, schema: buildSchema })));
  }
}
if (foundationResults[0] === null) return { complete: false, stage: 'foundation', reason: 'the importer core failed twice', contract, ledger };
let pendingRequests = [];
foundationResults.forEach((r, i) => {
  if (r !== null) r.requests.forEach((q) => pendingRequests.push(`${foundationJobs[i].id}: ${q}`));
});

// ------------------------------------------------------------------ Blocks
phase('Blocks');
const groupPrompt = (g) => `YOUR ROLE: owner of the group "${g.id}" (label: group-${g.id}). ${g.summary}
You own, end to end: ${ownedFiles(g.id)}. Other owners build their groups in parallel in the same checkout.

Source components: ${g.components.join(', ')}. Blocks: ${g.blocks.join(', ')}. Sample pages: ${g.samplePages.join(', ')}. States and interactions to match: ${g.states}

1. Read ${M}/import/README.md (how to write a transform) and ${M}/FOUNDATION.md (tokens, helpers). Look at the real source markup and its variants: component.mjs html, children and variants for each of your components, and its CSS with css-rules.mjs.
2. Write the transform of each of your components, so the importer emits the authored markup CONTRACT.md gives for your blocks. Keep every text, link, image and alt text. Cover every variant the census shows, not only the sample pages.
3. Write blocks/<name>/<name>.js and .css from the source's own CSS rules, at every breakpoint. Decorate defensively.
4. Import your sample pages: node ${M}/import/import.mjs --pages <file with your pages>. Read the .plain.html and check your blocks get the cells you expect.
5. Compare with the source at 1440, 768 and 375:
   - each variant of each block as a region: compare.mjs --src <source url> --tgt <target url> --src-sel <css> --tgt-sel <css>
   - each state and interaction, with one pw.mjs script run on both sites
   - the whole sample pages (compare.mjs --page), and trace.mjs where heights differ. Your bands must be within 1 %.
   A difference caused by another owner's files (global spacing, default content, header) is not yours to fix: report it as a request.
6. Write ${M}/groups/${g.id}.md, short: the authored model as built, the variants, what differs from the contract and why, known gaps.
7. Lint your files, commit your paths.

Return JSON: commit (full SHA), status, summary (each block and variant with its measured difference at the three widths), requests (exact changes you need outside your files), remaining (what is not 1:1 yet, with the page).`;

const mediaPrompt = `YOUR ROLE: media operator (label: media). A mechanical job: do not change code.
The importer can copy every image of the fetched pages into DA ahead of the page rollout. Read ${M}/import/README.md, then start: ${M}/bin/detach /tmp/f52s/media/run.log node ${M}/import/import.mjs --all --media (create /tmp/f52s/media first). Poll the log every few minutes with sleep 240 between polls until it ends; it can take over an hour. If the log shows FETCH-STOP or bot protection, stop polling and report it. If the command fails for another reason, report the error text; do not fix the importer.
Return JSON: commit (empty string), status, summary (images copied, already present, failed), requests (errors the importer owner must fix, exact), remaining.`;

// the operator moved block work to Opus (medium) mid-run: these groups had not completed yet
const OPUS_GROUPS = ['listing', 'html', 'rail', 'tiles'];
const blockJobs = [
  ...groups.map((g) => ({
    id: `group-${g.id}`,
    prompt: groupPrompt(g),
    ...(OPUS_GROUPS.includes(g.id) ? { model: OPUS, thinking: 'medium' } : { model: FABLE }),
  })),
  { id: 'media', prompt: mediaPrompt, model: SONNET },
];
const blockResults = await parallel(blockJobs.map((job) => () => soft(job.id, run(job.prompt, {
  label: job.id, model: job.model, schema: buildSchema, ...(job.thinking ? { thinking: job.thinking } : {}),
}))));
blockResults.forEach((r, i) => {
  record(blockJobs[i].id, 'blocks', r);
  if (r !== null) r.requests.forEach((q) => pendingRequests.push(`${blockJobs[i].id}: ${q}`));
});
const groupsMissing = blockJobs.filter((job, i) => blockResults[i] === null || blockResults[i].status === 'failed').map((job) => job.id);

const integration = record('integrate', 'blocks', await soft('integrate', run(`YOUR ROLE: integrator (label: integrate). No other agent runs now. You own ${ownedFiles('global')}, and you may make a small fix in any file when it is needed for the pieces to work together.

Every group built its blocks and transforms in parallel, each tested on its own pages. Make them work together:
1. Requests from the owners for changes outside their files. Apply each one that is correct and consistent with CONTRACT.md; reject the rest with a reason:
${JSON.stringify(pendingRequests, null, 1)}
2. Owners that returned nothing or failed (list them under remaining, do not build their blocks): ${JSON.stringify(groupsMissing)}
3. Run the importer for every page of ${M}/source/reps.txt. Fix what fails in the core.
4. With one script, load every representative page on ${LOCAL} and collect: console errors, failed requests for block files, exceptions in a decorate function, images that are about:error or have naturalWidth 0, blocks that stay undecorated. Fix the causes.
5. npm run lint clean for the whole repository.
6. Commit, then git push -u origin ${BRANCH} (this branch only). Wait until ${BRANCH_ORIGIN}/styles/styles.css equals the local file (code sync takes a few minutes; give up after 6 minutes and say so).

Return JSON: commit (full SHA of the branch head), status, summary (requests applied and rejected, what you fixed, whether the branch preview is in sync), requests (leave empty), remaining.`, { label: 'integrate', model: FABLE, schema: buildSchema })));
pendingRequests = [];

// --------------------------------------------------------------- Visual QA
const measurePrompt = (label, name, pagesFile, reimport) => `YOUR ROLE: measurer (label: ${label}). A mechanical job: do not change code and do not judge the results.
1. ${reimport ? `Re-import the pages so they carry the current transforms: node ${M}/import/import.mjs --pages ${pagesFile} (it uploads only what changed). Note the pages that fail.` : 'Skip the import.'}
2. Start the sweep: mkdir -p /tmp/f52s/${label} ; ${M}/bin/detach /tmp/f52s/${label}/sweep.log node ${M}/tools/sweep.mjs --name ${name} --pages ${pagesFile} --base ${LOCAL}
3. Poll the log with sleep 240 between polls until it prints SWEEP DONE (15 to 40 minutes). If it shows FETCH-STOP, report it under problems and stop.
4. Read ${M}/shots/sweep-${name}/summary.json with jq and return JSON: summaryPath, stats (one entry per width: width, pages, failed as a count, median, p90, max, over1), bandsPerOwner (per owner in .owners: owner, bands = its entries, firstBands = its entries with first true), importFailed (pages), problems (failed pages with their error, and anything that went wrong).`;

const fixPrompt = (label, owner, source, accepted, requests) => `YOUR ROLE: owner of "${owner}" fixing measured differences (label: ${label}). You own: ${ownedFiles(owner)}. Other owners fix their groups in parallel.

${source}

How to work:
1. Start with the entries marked first: a band below the first differing band of a page may only be shifted by it. Open the side-by-side image of a band (read tool) and run trace.mjs on the page: the first line where dy changes names the cause.
2. Find the cause in the source's own CSS (css-rules.mjs) and markup (component.mjs), not by nudging values to a screenshot. Fix it once, in the shared place: the transform when the authored content is wrong, the block when the rendering is wrong.
3. After a transform change, re-import the affected pages (node ${M}/import/import.mjs --pages <file>). Check the other pages and widths that use the same code, so you do not trade one difference for another.
4. Verify every fix with compare.mjs numbers before and after, at the width of the entry.
5. A cause outside your files goes to requests, exact (file, selector, value). A difference that cannot be matched goes to wontfix with the reason.
${accepted.length ? `Judged not fixable in an earlier round (do not retry unless you see a new way): ${JSON.stringify(accepted)}` : ''}
${requests.length ? `Requests from other owners for changes in YOUR files. Apply each one that is correct and consistent with the contract; put the others under wontfix with the reason: ${JSON.stringify(requests, null, 1)}` : ''}
Lint your files, commit your paths.

Return JSON: commit (full SHA, empty string when nothing changed), fixed (page, width and what was fixed, with the number before and after), wontfix, requests, notes.`;

const accepted = new Map();
const acceptedFor = (owner) => accepted.get(owner) ?? [];
const requestsFor = new Map();
const rounds = [];

async function fixRound(tag, work) {
  const owners = [...work.keys()];
  const results = await parallel(owners.map((owner) => () => {
    const label = `fix-${tag}-${owner}`;
    const requests = owner === 'global' ? [...(requestsFor.get('global') ?? []), ...pendingRequests] : (requestsFor.get(owner) ?? []);
    return soft(label, run(fixPrompt(label, owner, work.get(owner), acceptedFor(owner), requests), { label, model: OPUS, thinking: 'medium', schema: fixSchema }));
  }));
  requestsFor.clear();
  pendingRequests = [];
  const outcome = [];
  results.forEach((r, i) => {
    const owner = owners[i];
    record(`fix-${tag}-${owner}`, tag, r);
    outcome.push({ owner, status: r === null ? 'missing' : 'done', fixed: r === null ? 0 : r.fixed.length, wontfix: r === null ? [] : r.wontfix });
    if (r === null) return;
    if (r.wontfix.length) accepted.set(owner, [...acceptedFor(owner), ...r.wontfix]);
    // a request names no owner the script can trust: the global owner triages them
    r.requests.forEach((q) => pendingRequests.push(`${owner}: ${q}`));
  });
  return outcome;
}

const sweepWork = (measured) => {
  const work = new Map();
  for (const entry of measured.bandsPerOwner) {
    if (entry.bands === 0) continue;
    const owner = ownerIds.includes(entry.owner) ? entry.owner : 'global';
    const where = `A sweep compared pages with the source at 1440, 768 and 375 px. Your work list is the entry of "${entry.owner}" in the summary: jq '.owners["${entry.owner}"]' ${measured.summaryPath} (${entry.bands} bands over 1 %, ${entry.firstBands} of them the first differing band of their page; each has the page, the width, y, the percent, the side-by-side image, and the source components and target blocks in the band).`;
    work.set(owner, work.has(owner) ? `${work.get(owner)}\nAlso: ${where}` : where);
  }
  if (pendingRequests.length && !work.has('global')) work.set('global', 'No band of the sweep is yours this round. Handle the requests below.');
  return work;
};
const totalBands = (measured) => measured.bandsPerOwner.reduce((sum, e) => sum + e.bands, 0);

phase('Visual QA');
let qaTermination = 'max-rounds';
let lastReps = null;
let previousTotal = null;
for (let round = 1; round <= MAX_ROUNDS; round += 1) {
  const label = `measure-r${round}`;
  const measured = record(label, 'visual-qa', await soft(label, run(measurePrompt(label, `r${round}`, `${M}/source/reps.txt`, true), { label, model: SONNET, thinking: 'medium', schema: measureSchema })));
  if (measured === null) {
    qaTermination = 'measure-failed';
    break;
  }
  lastReps = measured;
  const total = totalBands(measured);
  const entry = { round, stats: measured.stats, bands: total, bandsPerOwner: measured.bandsPerOwner, problems: measured.problems, fixes: [] };
  rounds.push(entry);
  log(`QA round ${round}: ${total} bands over 1 % across ${measured.bandsPerOwner.filter((e) => e.bands > 0).length} owners`);
  if (total === 0 && pendingRequests.length === 0) {
    qaTermination = 'clean';
    break;
  }
  if (previousTotal !== null && total > previousTotal * 0.9) {
    qaTermination = 'no-progress';
    break;
  }
  previousTotal = total;
  if (round === MAX_ROUNDS) break;
  entry.fixes = await fixRound(`r${round}`, sweepWork(measured));
}

// --------------------------------------------------------------- Behaviour
phase('Behaviour');
const auditTargets = [
  ...groups.map((g) => ({ id: g.id, blocks: g.blocks, pages: g.samplePages, states: g.states })),
  { id: 'header', blocks: ['header'], pages: ['/', '/ja-jp.html', '/blogs/chip-design.html'], states: 'every mega-menu, language selector, search layer, mobile menu levels, sticky behaviour while scrolling, keyboard use' },
  { id: 'footer', blocks: ['footer'], pages: ['/', '/zh-cn.html'], states: 'links, language selector, mobile layout' },
];
const AUDITORS = 4;
const auditChunks = Array.from({ length: AUDITORS }, (unused, i) => auditTargets.filter((t, n) => n % AUDITORS === i)).filter((c) => c.length);
const audits = await parallel(auditChunks.map((chunk, i) => () => {
  const label = `audit-${i + 1}`;
  return soft(label, run(`YOUR ROLE: behaviour auditor (label: ${label}). Read-only: write only under /tmp/f52s/${label}/. Pixels at rest were measured elsewhere. You check that the migrated blocks BEHAVE like the source.

Your blocks, with pages that show them and the states to exercise:
${JSON.stringify(chunk, null, 1)}

For each block, on the source page and on its migrated twin (${LOCAL}${PREFIX}/<path without .html>), at 1440 and at 375, run the same pw.mjs script on both sites and compare what happens: hover and focus styles, click and keyboard (Tab, Enter, Escape, arrows), open and close, carousel next, previous, dots and its timing, tabs, accordions, video and modal layers, table of contents and anchor scrolling, sticky elements while scrolling, paging and filters of lists, form fields and validation messages (never submit a form), link targets, console errors. Take a screenshot of each state on both sites and compare the two.
Report only differences in behaviour or in a state's look, each with the owner (the id of the group above), the page, the viewport, and an exact description: what the source does, what the target does, and the selectors on both sides. One finding per cause. Do not fix anything.

Return JSON: checked (block: the states you exercised), findings.`, { label, model: OPUS, schema: auditSchema }));
}));
const auditWork = new Map();
const auditFindings = [];
audits.forEach((a, i) => {
  record(`audit-${i + 1}`, 'behaviour', a);
  if (a === null) return;
  for (const f of a.findings) {
    const owner = ownerIds.includes(f.owner) ? f.owner : 'global';
    auditFindings.push({ ...f, owner });
  }
});
for (const owner of new Set(auditFindings.map((f) => f.owner))) {
  auditWork.set(owner, `A behaviour audit ran the same interactions on the source and on the migrated pages. These differences are yours. Reproduce each one first with a pw.mjs script on both sites, then fix it:\n${JSON.stringify(auditFindings.filter((f) => f.owner === owner), null, 1)}`);
}
if (pendingRequests.length && !auditWork.has('global')) auditWork.set('global', 'No audit finding is yours. Handle the requests below.');
const behaviourFixes = auditWork.size ? await fixRound('behaviour', auditWork) : [];

// ----------------------------------------------------------------- Rollout
phase('Rollout');
const rollout = record('rollout', 'rollout', await soft('rollout', run(`YOUR ROLE: rollout operator (label: rollout). No other agent runs now. Do not change block code or transforms: your job is to roll out every page and to report exactly what is wrong, by owner.

1. Wait for the page fetch: ${M}/source/fetch.log must end with FETCH DONE (poll with sleep 240). If ${M}/source/FETCH-STOP exists, do not wait: work with the pages that are there and set sourceStopped true. Then run node ${M}/tools/seed-cache.mjs and node ${M}/tools/census.mjs.
2. Compare the components of the full census with CONTRACT.md: list every component the contract does not treat (newComponents, with its page count and one example page).
3. Run the importer for every page: ${M}/bin/detach /tmp/f52s/rollout/run.log node ${M}/import/import.mjs --all (create the folder first), and poll the log with sleep 240 until it ends. It may take two hours. Then check ${M}/out/report.json.
4. Count: pages built, pages previewed (they answer 200 as .plain.html), pages failed, pages that fail the content check (word recall under 0.98, missing images, about:error images, self-check failures, components that fell back to default content).
5. Write ${M}/out/rollout-owners.json: {"<owner id>": [{"page": "...", "problem": "..."}]}, the problems grouped by the owner of the component or block at fault (${M}/owners.json; use global when no owner fits, and for importer core failures). At most 40 entries per owner, the most frequent problems first, with the total per problem.
6. Also write ${M}/source/sample.txt: node ${M}/tools/sample.mjs 150 > ${M}/source/sample.txt (pages outside the representative set, for the next measurement).

Return JSON: pagesTotal, pagesPreviewed, pagesFailed, contentCheckFailed, ownersFile (the path of rollout-owners.json), owners (owner and the number of its pages with a problem), newComponents, sourceStopped, notes.`, { label: 'rollout', model: OPUS, schema: rolloutSchema })));

const tailRounds = [];
let lastSample = null;
if (rollout !== null) {
  for (let round = 1; round <= MAX_TAIL_ROUNDS + 1; round += 1) {
    const label = `measure-sample-${round}`;
    const measured = record(label, 'rollout', await soft(label, run(measurePrompt(label, `sample${round}`, `${M}/source/sample.txt`, round > 1), { label, model: SONNET, thinking: 'medium', schema: measureSchema })));
    if (measured === null) break;
    lastSample = measured;
    const entry = { round, stats: measured.stats, bands: totalBands(measured), bandsPerOwner: measured.bandsPerOwner, problems: measured.problems, fixes: [] };
    tailRounds.push(entry);
    if (round > MAX_TAIL_ROUNDS) break;
    const work = sweepWork(measured);
    if (round === 1) {
      for (const o of rollout.owners) {
        if (o.pages === 0) continue;
        const owner = ownerIds.includes(o.owner) ? o.owner : 'global';
        const where = `Every page of the site was imported. ${o.pages} pages have a content problem in your components: jq '.["${o.owner}"]' ${rollout.ownersFile} (lost text, missing images, a variant your transform does not handle, a component that fell back to default content). Fix the transform, re-import those pages, and check ${M}/out/report.json for them.`;
        work.set(owner, work.has(owner) ? `${work.get(owner)}\nAlso: ${where}` : where);
      }
      if (rollout.newComponents.length) {
        const where = `Components the contract does not treat were found on the full site: ${JSON.stringify(rollout.newComponents)}. Decide each one's treatment, add it to CONTRACT.md and owners.json, and write its transform.`;
        work.set('global', work.has('global') ? `${work.get('global')}\nAlso: ${where}` : where);
      }
    }
    if (work.size === 0) break;
    entry.fixes = await fixRound(`tail${round}`, work);
  }
}

// ----------------------------------------------------------------- Wrap-up
phase('Wrap-up');
const finalLabel = 'measure-final';
const finalReps = record(finalLabel, 'wrap-up', await soft(finalLabel, run(measurePrompt(finalLabel, 'final', `${M}/source/reps.txt`, true), { label: finalLabel, model: SONNET, thinking: 'medium', schema: measureSchema })));

const facts = {
  qaTermination,
  qaRounds: rounds.map((r) => ({ round: r.round, stats: r.stats, bands: r.bands })),
  representativeFinal: finalReps === null ? lastReps : finalReps,
  sampleFinal: lastSample,
  rollout,
  behaviourFindings: auditFindings.length,
  behaviourFixes,
  accepted: [...accepted.entries()].map(([owner, items]) => ({ owner, items })),
  openRequests: pendingRequests,
  groupsMissing,
  droppedGroups,
  notMigrated: contract.notMigrated,
};
const wrap = record('wrap-up', 'wrap-up', await soft('wrap-up', run(`YOUR ROLE: release engineer (label: wrap-up). No other agent runs now. You may fix lint errors in any file; change nothing else in the code.

Facts gathered by the run (measurements, rollout counts, accepted differences, open requests):
${JSON.stringify(facts, null, 1)}

1. Re-import every page once more so the whole site carries the final transforms: ${M}/bin/detach /tmp/f52s/wrap/run.log node ${M}/import/import.mjs --all (create the folder first; it uploads only what changed), and poll with sleep 240 until it ends. Count the pages that answer 200.
2. npm run lint clean. git status clean (commit what owners left uncommitted in their own paths, in one commit per owner path; report it).
3. Write ${M}/REPORT.md, facts only: what was migrated (pages, languages, templates), the block list with its owners, the measurements (representative pages and the sample, per width: median, p90, max, pages over 1 %), the rollout counts and the content check, the behaviour audit, the differences that remain with their reason, what is not migrated and why, and what was not verified. Update the State section of ${M}/PLAN.md. Use short plain sentences.
4. Commit, git push origin ${BRANCH}, and wait until ${BRANCH_ORIGIN}/styles/styles.css equals the local file.
5. Open a pull request against main with gh pr create (do not merge). Follow .github/pull_request_template.md. Describe what the code does now. Include the preview links ${BRANCH_ORIGIN}${PREFIX}/ and one link per page template (take one representative page per template from ${M}/source/reps.json). Plain, factual language.

Return JSON: prUrl, head (full SHA), pagesPreviewed, summary (five lines at most), gaps (what remains different or unverified).`, { label: 'wrap-up', model: OPUS, schema: wrapSchema })));

return {
  complete: wrap !== null && rollout !== null,
  branch: BRANCH,
  preview: `${BRANCH_ORIGIN}${PREFIX}/`,
  prUrl: wrap === null ? null : wrap.prUrl,
  head: wrap === null ? null : wrap.head,
  contract: { commit: contract.commit, groups: groups.map((g) => ({ id: g.id, blocks: g.blocks, components: g.components })), droppedGroups, notMigrated: contract.notMigrated },
  foundation: foundationJobs.map((job, i) => ({ id: job.id, status: foundationResults[i] === null ? 'missing' : foundationResults[i].status, remaining: foundationResults[i] === null ? [] : foundationResults[i].remaining })),
  blocks: blockJobs.map((job, i) => ({ id: job.id, status: blockResults[i] === null ? 'missing' : blockResults[i].status, remaining: blockResults[i] === null ? [] : blockResults[i].remaining })),
  integration,
  qa: { termination: qaTermination, rounds },
  behaviour: { findings: auditFindings, fixes: behaviourFixes },
  rollout,
  tailRounds,
  final: { representative: finalReps, sample: lastSample },
  accepted: facts.accepted,
  openRequests: pendingRequests,
  wrap,
  ledger,
};
