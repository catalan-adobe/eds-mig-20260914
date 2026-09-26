# Jev / TypeSafe "System One" — research notes

## 1. What it is

Jev is the flagship model of **TypeSafe AI** (typesafe.ai), the first of a class they call
**"System One" models** — named after Kahneman's System 1 (fast, intuitive judgment) vs
System 2 (slow, deliberate reasoning). It is explicitly *not* a text-generation LLM: it
takes a `state` (the content to judge) plus one or more typed `questions`, and returns
**typed, calibrated answers** (a choice, a score, or a 0–1 probability) with no free text
and no parsing step. Marketed for "fast, cheap, structured decisions inside software",
not for chat/generation.
Sources: https://docs.typesafe.ai/introduction , https://docs.typesafe.ai/concepts/system-one ,
https://www.forbes.com/sites/josipamajic/2026/09/19/jev-cuts-ai-decision-costs-100x-and-vercel-cloudflare-rushed-to-add-it/
(coverage of adoption by Vercel AI Gateway and Cloudflare Workers AI),
https://github.com/jkudish/jev-browser (independent tool using Jev to drive a browser, good
real-world usage description).

Direct API: `POST https://api.typesafe.ai/v1/systemone`. We access it instead via
**Cloudflare Workers AI**, model id `typesafe/jev` — a third-party/BYOK-style model
proxied by Cloudflare, billed separately from normal Workers AI neurons (see §3).

## 2. Verified API contract

Request: `{"model":"typesafe/jev","input":{"state": <string|object|array>, "questions": {<id>: Question}}}`.

Question types — **exact lowercase `type` values confirmed against the live payload and
the official docs (`jev.md`'s "noul" is correct, not a typo for "bool")**:

| type | purpose | required fields | answer fields |
|---|---|---|---|
| `noul` | yes/no, returns probability of "yes" | `instructions`, optional `criteria.true`/`false` | `noul` (0–1) |
| `choice` | pick one of ≤255 labeled options | `instructions`, `criteria` (map, ≤255 keys) | `choice`, `probabilities` (map, sums to 1), `confidence` |
| `score` | rate against an ordered rubric | `instructions`, `criteria` (array, 2–10 levels) | `score` (interpolated), `legend`, `probabilities`, `confidence` |

All questions in one call see the **same state**, are evaluated **in parallel/independently**
(no shared context, "adding questions barely changes response time"), and every answer is
returned under the same key as the question. Response also includes `usage.input_tokens` /
`usage.output_tokens`. `instructions` and `criteria` can themselves be strings, objects, or
arrays for structured reference data.
Source: https://docs.typesafe.ai/api

## 3. Limits, pricing, latency (as documented / observed)

| Dimension | Value | Source |
|---|---|---|
| Context length | 64k tokens total (state + all questions); 32k for state + single longest question | docs.typesafe.ai/models |
| Choice options | max 255 per question | docs.typesafe.ai/api |
| Score levels | 2–10 per question | docs.typesafe.ai/api |
| Input modality | text only (string/JSON object/array); no image/audio/video | docs.typesafe.ai/models |
| Rate limit | 250k tokens/sec, 1,200 req/min (direct API, "adjusting dynamically") | docs.typesafe.ai/models |
| Direct API price | **$42/Btok input** ($0.042/Mtok); **output tokens free** | docs.typesafe.ai/models |
| Cloudflare Workers AI price | **Not published in docs** — separate "gateway" balance from standard Workers AI neurons, "pricing is listed in the Cloudflare dashboard" (per jev-browser README) | github.com/jkudish/jev-browser#readme |

**Live test result on the provided CF credentials:** every call to
`POST /accounts/$CF_ACCOUNT_ID/ai/run` with `model: typesafe/jev` returned HTTP 402,
`{"success":false,"errors":[{"code":2021,"message":"Insufficient balance; add money to
your gateway or use BYOK"}]}` — **8/8 calls failed identically** (small sample request and
a larger ~6.5 KB HTML state with 6 questions). Standard Workers AI models on the *same*
account/token (e.g. `@cf/meta/llama-3.1-8b-instruct`) work fine and report `neurons` usage,
confirming `typesafe/jev` is billed through a **separate marketplace/BYOK balance** that is
currently at $0 for this account, not a request-shape problem (the request was accepted and
routed to the billing check, not rejected as malformed). This blocks any empirical
answer-quality testing here; see §4 for what we could still measure and what comes from
vendor docs instead.

**Round-trip latency measured on the 8 failed calls** (Cloudflare auth + routing overhead,
*not* model inference time, since the request never reached the model):

| Percentile | Latency |
|---|---|
| p50 | 354 ms |
| p95 | 461 ms |
| min–max | 218–461 ms |

Vendor-documented behavior (not independently verified here): responses are fast because
inference is a single forward pass with no autoregressive generation; the "parallel
questions" cookbook reports a 13-question batch as 10x faster and 12x cheaper than one
question per call, i.e. per-request latency stays roughly flat as questions are added.
Source: https://docs.typesafe.ai/cookbooks/parallel_questions

## 4. Observed / documented answer quality

No live answers could be obtained (see §3). From TypeSafe's own docs (illustrative
examples, not audited by us):
- Calibrated probabilities, not just top-1 label — e.g. `choice` returns a full
  distribution plus a derived `confidence`; `noul` returns a single 0–1 probability.
- Known weaknesses ("jaggedness", jev-1.13): literal reading of wording (no inferred
  intent), bad at counting/arithmetic/date math, degrades with irrelevant context
  ("context rot" — filter state before sending), no built-in resistance to adversarial
  state content, structural invariants aren't guaranteed (e.g. `noul` vs. equivalent
  `choice` on the same question can disagree), not for text generation.
  Source: https://docs.typesafe.ai/model-jaggedness/jev-1.13

## 5. Recommended uses in a page-migration workflow

**Good fit** — narrow, atomic, closed-answer judgments over a bounded chunk of markup/text:
- `block_type` classification per DOM section (`choice` over the fixed EDS block palette).
- `authorable` vs. decorative content flags (`noul`) to decide what goes in a DA doc vs.
  stays hardcoded in a block's CSS/JS.
- Fast triage scores (`score`) for things like expected visual-diff risk, or "how confident
  are we this section maps 1:1 to an existing block" before spending build time on it.
- Batch several such questions about the *same* section in one call (fan-out pattern) —
  cheap and near-flat latency vs. one call per question.
- Regression triage across many pages: cheap enough to run per-section on every page in a
  large site migration, unlike a full LLM pass per page.

**Poor fit / do not use for:**
- Anything requiring generated text (copy rewriting, code generation, alt-text drafting) —
  Jev never generates text, only picks/scores/answers yes-no.
- Pixel-level or numeric comparisons (exact color/spacing deltas, counting elements) — the
  model is documented as weak at arithmetic/counting; keep that in code (e.g. compare via
  Playwright/pixel-diff tooling, not Jev).
- Judgments needing multi-hop reasoning across a whole page or repo (e.g. "is this the
  right block given the overall site's block taxonomy *and* the CMS's DA authoring
  constraints *and* prior team conventions") — docs flag "indirection" as a known failure
  mode; decompose into atomic questions instead.
- Any call where the CF Workers AI route is used unless/until the marketplace balance is
  funded (or BYOK is configured); today it hard-fails 100% of the time on this account.

## 6. Caveats

- We could not validate answer quality, latency-under-load, or true CF pricing empirically
  here — CF billing for `typesafe/jev` needs a top-up or BYOK before any answers can be
  produced through this project's Cloudflare account. Recommend confirming funding/BYOK
  with whoever owns the Cloudflare account before depending on this path for the migration.
- If direct TypeSafe API access becomes available (`TYPESAFE_API_KEY`), the harness in
  `migration/tools/jev.mjs` targets Cloudflare specifically; hitting `api.typesafe.ai`
  directly would need a small endpoint/auth-header change (same request/response shape
  otherwise, plus a documented, transparent per-token price).
- State should exclude irrelevant page content (nav/footer boilerplate) per section to
  avoid the documented "context rot" accuracy loss — filter before building the `state`.

## Files produced
- `migration/tools/jev.mjs` — CLI harness (loads creds from env or `.env.jev`, never prints
  the token, prints `{answers, latencyMs, usage, httpStatus}` or a clear error; `--raw` adds
  the raw API response; `--runs N` batches N calls).
- `migration/tools/jev-sample.json` — sample migration-flavored request (`block_type`,
  `authorable`, `visual_diff_severity`).
