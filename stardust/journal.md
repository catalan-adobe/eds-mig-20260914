# Journal — WKND Adventures same-design migration

Chronological log of every prompt execution. Most recent at the bottom.
See `skills/stardust/reference/journal-format.md` for entry format.

---

## 2026-09-23T11:16:23Z — replica phases 1–4: extract, preserve, 4 archetypes gated

**Prompt:** Migrate https://wknd-adventures.com/ to EDS, keeping the same design.

**Decisions:**
- Flow: replica (keep design), stamped via the keep-vs-redesign question.
- Crawl by explicit 21-path list (sitemap host is wkndadventures.com, a different origin).
- Page types: landing 1 (index) · article 10 (blog) · listing 7 · static 3; archetypes index,
  blog-patagonia-trek-html, adventures-html, about-html.
- Inconsistency register empty — pure replica. Dynamics: 5 UI behaviours, all reproducibility self.
- Canon CSS values lifted from the source stylesheet; OFL fonts self-hosted (same files).
- All archetypes 0.00–0.01% pixel diff, Δh 0 at 1440 and 360.

**Open questions:**
- Archetype approval (not hands-off).
- DA_TOKEN needed in .env for Phase 5 delivery.

**Artifacts touched:**
- stardust/current/** — created (extract)
- PRODUCT.md, DESIGN.md, DESIGN.json — promoted verbatim
- stardust/direction.md, stardust/replica/inconsistency-register.md, stardust/dynamic-features*.md — created
- stardust/prototypes/{canon.css,canon.js,compose.py,article.py,assemble.py,*-proposed.html} — created
- stardust/replica/progress.json, gates/, motion/ — created

## 2026-09-23T12:39:36Z — replica Phase 5: EDS delivery of all 21 pages (preview)

**Prompt:** Approve archetypes; capture DA token; continue the migration.

**Decisions:**
- DA token captured from a headed da.live session (adobeIMS) into .env; never printed.
- Siblings composed from the same module templates; 34 sibling rounds ≤0.28%.
- EDS content model: 11 blocks + 10 section styles; importer stardust/eds/import.py.
- Push via the repo owner's gh token per call (active gh account lacks write access).
- Published-origin gate: 21 pages × 2 widths, worst 1.92%, |Δh| ≤1px; header/footer bands ≤0.12%.
- Preview-only; publish (.aem.live) and merge to main left to the owner.

**Open questions:**
- Publish to live + merge PR? Sitemap config in tools.aem.live?

**Artifacts touched:**
- blocks/*, styles/*, scripts/scripts.js, scripts/article-card.js, fonts/, icons/, head.html — created/updated
- content/*.html (23 DA docs), stardust/redirects.tsv, DA /redirects.json — created
- stardust/rollout/**, stardust/eds-conversion-log.md, stardust/deploy/*.json — created
