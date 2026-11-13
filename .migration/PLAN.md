# Plan: synopsys.com to Edge Delivery Services

Durable checkpoint. Read `BRIEF.md` for the facts, the rules and the tools.

## Request

- Migrate https://www.synopsys.com fully to EDS, 1:1 with the source.
- Content goes to DA under `/f52-synopsys-1211-02`.
- Do not flood the source site.
- Use earlier work, and evaluate the `web` plugin of adobe/skills.
- Work autonomously, with workflows. The result matters more than cost.

## What the site is (measured 2026-11-12)

- 7,159 URLs in the sitemaps: 7,007 HTML pages and 152 PDFs. Five languages.
- AEM Sites, server-rendered. About 25 templates and 60 components, named in the HTML.
- No bot block at one request every 1.5 seconds. Cloudflare sits in front.

## Approaches considered

| Approach | Verdict |
| --- | --- |
| Page by page with the `page-import` or `stardust` skills | No. 7,007 pages are 25 templates: the work is per component, not per page. |
| Byte-for-byte overlay (`snowflake`) | No. It keeps the source DOM and its CSS, and the content is not authorable. |
| One transformer driven by the source components, plus one EDS block per component family | Chosen. It is what the Hirslanden run and the Synopsys census both point to. |

## Decisions

1. **One gateway to the source.** Every request to `*.synopsys.com` goes through a local cache
   (`web cache serve`). A missing file is fetched once, one at a time for all agents, paced.
   A bot check writes `source/FETCH-STOP` and stops every tool.
2. **Structure from the server HTML, not from screenshots.** The AEM component classes give the
   exact tree. `census.mjs` and `component.mjs` read it offline.
3. **Vertical ownership.** A group owns a component family end to end. That is the transform
   of the source component, the authored model, and the block. Nothing is handed over between
   an importer and a block author.
4. **One checkout, owned files.** No git worktrees: the last run lost an hour to them.
5. **Measure first, then send an agent.** A deterministic sweep compares 113 representative
   pages at three widths. It says which owner has which bands to fix. No reviewer agents.
6. **Done means three things.**
   - Every representative page is within 1 % per band at 1440, 768 and 375.
   - A stratified sample of other pages passes the same check.
   - Every page's text matches the source at word level.

## Not migrated, on purpose

- The consent banner, the chat widget, analytics and tag managers.
- The 152 PDFs. Pages link to them at the source.
- The Font Awesome kit. Its icons are copied as SVG files.

## The `web` plugin of adobe/skills: evaluation

Pinned clone in `vendor/adobe-skills` (commit `ae781eb`). The `web` on PATH is older and has no
`header` command.

| Command | Used | Finding |
| --- | --- | --- |
| `site scan` | yes | 7,159 URLs from six sitemaps in seconds. |
| `probe`, `page overlays --save-recipe` | yes | Plain headless Chromium loads the site. OneTrust rules saved in `recipe.json`. |
| `cache serve` | yes, central | The gateway. Offline replay equals the live page: 8 of 7 million pixels differ. |
| `cache record`, `cache proxy` (HAR) | tested, not used | Replay missed 121 requests: a HAR holds one viewport's image URLs. |
| `header capture` | partly | Found both header bands, the breakpoint and the mobile menu. Found no desktop menu: they open on hover of a `<span>`. |
| `header check` | offered to the header owner | Accepts the offline cache as its source URL. |
| `page tree`, `bands`, `reduce` | no | The source names its components in the HTML, which is exact. A visual tree is a guess here. |

## State

- [x] Recon, gateway, DA pipeline check, toolkit, brief
- [x] Workflow `synopsys_eds_migration` (script: `workflow.js`): contract, foundation, blocks,
      visual QA rounds, rollout of all pages, wrap-up with report and pull request
- [x] Final import of all 6,811 pages: 3,042 previewed and answering 200, 3,769 not previewed.
- [ ] 3,769 pages and 10 fragments wait for images. `source/FETCH-STOP` exists since
      2026-11-12 23:19 UTC (403 bot check). Clear it, then run `import.mjs --all` again.
- [ ] Done criteria are not met: the median page diff is 4.67 % at 1440 on the representative
      pages. Remaining differences and open requests are in `REPORT.md`.
