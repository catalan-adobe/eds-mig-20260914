# Inconsistency register — wknd.site /us/en replica

No entries — pure replica. Everything not listed here is frozen; any design
delta found by the gate is a defect, not an improvement.

<!--
Entry schema (reference/preserve-direction.md § Entry schema) — append-only during recreation;
a new inconsistency found mid-recreation gets an entry (usually `deferred`), never a silent fix:

## R-<nn> — <one-line title>

- **Evidence:** <screenshot path / measured values / audit finding ID>
- **Finding:** <internal inconsistency or defect, in the site's own terms — never a preference>
- **Minimal change:** <the smallest change that resolves it and nothing else>
- **Status:** applied | deferred
- **Where:** <page types / sections affected>
-->

## R-01 — Home page has no `<h1>`

- **Evidence:** `curl -s https://wknd.site/us/en.html | grep -c '<h1'` → 0; `delivery-lint.mjs --file stardust/migrated/us/en.html` → `P0 h1 expected exactly one <h1>, found 0`. Every other page type carries one `<h1>`.
- **Finding:** the live landing page's hero carousel titles are `<h2>` and the page has no `<h1>` — an internal inconsistency with the rest of the site and a P0 for the EDS delivery contract.
- **Minimal change:** the FIRST carousel slide title ("WKND Adventures") becomes `<h1 class="teaser__title">`, rendered at the `<h2>` size (`.carousel h1.teaser__title { font-size: var(--heading-xl); }`). No other markup or style changes; pixel gate must return to the gated 0.00 %.
- **Status:** applied (user decision 2026-09-24, option 1)
- **Where:** landing (`us-en-html`) only
