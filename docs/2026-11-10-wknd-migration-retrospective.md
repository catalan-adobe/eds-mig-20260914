# WKND to Edge Delivery Services: retrospective of agent run f52-1011-01

Date: 2026-11-10. One agent session migrated all 65 pages of https://wknd.site from scratch.
The agent was `claude-fable-5-2` in pi, with the superpowers and ponytail skills active.

Every number comes from the session log, from git, or from a command run for this note.
Costs are estimates from the price table in pi, not provider invoices. Times are UTC.
The retrospective itself is not included.

- Preview: https://f52-1011-01--eds-mig-20260914--catalan-adobe.aem.page/f52-1011-01/us/en
- Code: branch `f52-1011-01` of `catalan-adobe/eds-mig-20260914`
- Content: DA folder `/f52-1011-01/`

## Headline

| Measure | Value |
|---|---|
| Wall clock, first prompt to final report | 80 min (10:50 to 12:10) |
| Agent working time | 71 min (48.8 LLM, 22.2 tools) |
| Time waiting for the user | 9 min across two replies |
| Model calls | 188 |
| Estimated cost | $57.62, about $0.89 per migrated page |
| Output tokens | 233,177, of which 92,111 reasoning |
| Peak context | 491,526 tokens, never compacted |
| Result | 85 files changed, 11 commits, 3 pushes |

## Timeline

| Phase | Wall min | LLM | Tools | Calls | Context at end | Cost |
|---|---|---|---|---|---|---|
| 1. Recon and first question | 3.2 | 1.4 | 1.1 | 9 | 57k | $0.97 |
| 2. More recon and design doc | 12.8 (8.1 waiting) | 4.2 | 0.5 | 14 | 118k | $2.42 |
| 3. Plan and setup | 4.3 | 4.1 | 0.1 | 18 | 177k | $3.46 |
| 4. Spike: DA, preview, local server | 2.5 | 2.0 | 0.6 | 11 | 189k | $2.08 |
| 5. Importer and first upload | 9.3 | 7.9 | 1.3 | 25 | 249k | $6.84 |
| 6. Styles, blocks, visual loop | 32.8 | 21.8 | 10.9 | 82 | 443k | $29.23 |
| 7. Checks, Lighthouse, cleanup | 20.1 (5 waiting) | 7.4 | 7.7 | 29 | 492k | $12.63 |

Phase 6 was half the time and half the money.

## Where the money went

| Cost part | Amount | Share |
|---|---|---|
| Reading the cached context again on every call | $43.51 | 75% |
| Output tokens | $9.33 | 16% |
| Writing to the cache | $4.79 | 8% |

The cost driver was context size times call count.
The whole run lived in one context that only grew.
By the end, each call cost about $0.39 before it produced anything.

What filled the context (approximate):

| Source | Tokens | Share |
|---|---|---|
| The agent's own output, thinking and tool arguments | 231,800 | 50% |
| Shell output, 153 commands | 136,048 | 30% |
| Screenshots, 30 images | 64,455 | 14% |
| Skill files | 14,119 | 3% |
| Other tools | 13,058 | 3% |

Tool time was almost all shell: 1,326 s.
The slow calls were full import-and-upload runs and screenshot scripts, at 60 to 104 s each.

Activity counts:

| Activity | Count |
|---|---|
| `npm test` runs | 33 |
| `npm run lint` runs | 30 |
| Full import runs | 13 |
| Document writes and previews logged in DA | 354 |
| Side-by-side screenshot runs | 16 |
| Computed-style probes of the source | 8 |
| Lighthouse commands | 4 |

## What went well

- **Recon before writing.** The first three minutes found the shared content store and an
  earlier attempt. The one question to the user was the one that mattered.
  All 354 logged document writes stayed under the prefix.
- **Spike first.** In 2.5 minutes and $2 it settled the content path.
  Preview ingests remote images. Blockquotes and icons survive.
  The local HTML folder mode of `aem up` does not render a real page.
- **Component-mapper importer.** The agent wrote and tested it in about 9 minutes.
  The first full run imported 63 of 65 pages and the second 65 of 65.
  The one miss was an empty download component.
- **Measuring, not guessing.** The agent read computed styles from the source.
  The first side-by-side of the home page was already close.
- **Checks that can fail.** The content check was clean on its first run.
  A mutated copy reported 65 differences, so the check works.
  A test page with missing cells found a real bug: the quote block had no script.
- **Autonomy.** The 64-minute build ran in one turn with no interruption.

## Struggles

- **Context cost.** The agent never split the work or compacted it.
  Subagents need the user's opt-in. This is the main thing to fix.
- **The visual loop was manual.** There were 16 side-by-side runs and 30 screenshots read by eye.
  There was no pixel-diff score. The agent compared 9 page types on desktop and 3 on mobile,
  not all 65 pages, and no tablet widths.
- **Two styling shortcuts backfired.** Italic-paragraph rules for captions and small print
  broke real italic text on the LA Skateparks article. The agent replaced them.
  It also found the margin-collapse differences with the source late.
- **The plan was wrong in places.**
  - It assumed that the local HTML folder mode works.
  - It assumed the block-collection carousel was usable.
  - It miscounted the home page blocks.
  - Its content model changed six times in the build. `README.md` now holds the real one.
- **Test discipline slipped.**
  - Once a test and its code changed together, so the agent never saw the test fail.
  - One failing test was a wrong guess of the quote attribution text.
  - Tasks 4 to 7 were marked done before the missing-cell and keyboard checks ran.
    The checks ran afterwards.
- **Tooling friction.**
  - The commit gate blocked two commands. The second only held the words "git commit"
    inside a regular expression.
  - The prose linter took three rounds on each planning doc.
  - DA rejected Python's HTTP client with Cloudflare error 1010. `curl` and Node `fetch` work.
  - `linkedom` has no indexed access on `classList`. That failed 21 tests for under a minute.
  - 31 lines over 100 characters slipped past eslint. The agent wrapped them at the end.
- **Small slips.**
  - A full upload sent a leftover spike file again. The agent had to delete it twice.
  - The first message had the page split wrong (29, 28, 9 for 27, 29, 9).
  - The first Lighthouse run on the home page was a cold 99. Three warm runs gave 100.

## What to change next time

1. **Break the context.** Start the visual phase fresh from the design doc and `README.md`.
   Or allow one subagent per page type. Phase 6 started at 249k tokens.
   A small start cuts most of its $29.
2. **Score before looking.** Add a pixel-diff or box-position score per page.
   Open a screenshot only when the score is bad.
3. **Store source measurements in a file.** Do not print long style dumps into the conversation.
4. **Lighter planning docs.** The plan cost $3.46 and parts were stale within 20 minutes.
5. **Fix the commit gate** so it matches commands, not text.

## Sources

- Session log: `~/.pi/agent/sessions/--Users-catalan-repos-ai-migration-tests-from-scratch-mig-f52-1011-01-f52-1011-01--/2026-11-10T10-48-32-132Z_01a1c512-e484-7444-af60-10ce2cc1a87e.json` (tokens, costs, durations, tool calls)
- `git log` and `git diff --shortstat main...HEAD` on branch `f52-1011-01` (commits, files changed)
- Design: `docs/superpowers/specs/2026-11-10-wknd-migration-design.md`
- Plan: `docs/superpowers/plans/2026-11-10-wknd-migration.md`
- Source site: https://wknd.site
