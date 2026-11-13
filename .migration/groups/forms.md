# Group forms: form

Owner of `blocks/form/`, the transforms `marketoFormsContainer.mjs`, `mktoForm.mjs`,
`subscriptionForm.mjs`, the icons `circle-exclamation.svg` and `select-caret.svg`, and the DA
sheet `/f52-synopsys-1211-02/data/form-domains.json`.

## Authored model

Key rows: cell 1 is the key, cell 2 the value. The first row is the intro when its first cell is
not a key. Unknown rows and extra cells are ignored.

```html
<div class="form landing purple two-column">
  <div><div><h1>SRAM PUF: A Revolutionary Approach</h1><p>Discover why …</p></div></div>
  <div><div>date</div><div><strong>Date:</strong> Aug 18, 2025 | 9 AM PDT</div><div>-7</div></div>
  <div><div>title</div><div>Download SRAM PUF White Paper</div></div>
  <div><div>form</div><div>6087</div></div>
  <div><div>known-visitor-form</div><div>7792</div></div>
  <div><div>asset-type</div><div>White Paper</div></div>
  <div><div>campaign</div><div>WP | SRAM PUF: A Revolutionary Approach</div></div>
  <div><div>content-url</div><div>www.synopsys.com/content/dam/synopsys/x.pdf</div></div>
  <div><div>success</div><div><a href="/f52-synopsys-1211-02/x/thankyou">…</a></div></div>
  <div><div>blocked-domains</div><div>dmb-list-pubdomainlist, dmb-list-BIS, cadence.com</div></div>
  <div><div>domain-error</div><div>Please register using a different email address.</div></div>
</div>
```

```html
<div class="form subscribe">
  <div><div>title</div><div>Subscribe to Our Blog</div></div>
  <div><div>form</div><div>8479</div></div>
  <div><div>submit</div><div>Subscribe</div></div>
  <div><div>success</div><div>Thanks for subscribing to the blog! …</div></div>
</div>
```

| Row | Meaning |
| --- | --- |
| intro | `h1`, text, a last paragraph with only an image. Landing only |
| `date` | webinar date line. Cell 3: UTC offset in hours. Hidden once the day is over there |
| `title` | title above the fields |
| `form` | Marketo form id (16 ids in use; 6087 on 752 forms) |
| `known-visitor-form` | short form for a known visitor. Left out when prefill is off (68) |
| `asset-type`, `campaign`, `content-url` | fields `assetType`, `campaign_asset`, `contentURL` |
| `success` | a link: page to go to 1.5 s after a submit. Text: message shown instead of the form |
| `blocked-domains` | ids of lists in the sheet, and domains. Left out for `noDomainBlocking` (22) |
| `domain-error` | message under the e-mail field for a blocked domain |
| `submit` | label of the button (`subscribe`) |

Variants, counted on the 834 pages with a form (all build, recall 1):

| Variant | Source | Count |
| --- | --- | ---: |
| `landing purple` | `marketoFormsContainer`, `purpleGradientBackground` | 556 |
| `landing white` | `whiteBackground` | 185 |
| `landing dark` | `darkGreyGradientBackground` | 6 |
| no variant | `mktoForm` in a `column` (section grid, `span-4`) | 87 |
| `two-column` | `form.two-column` | 61 |
| `image-pad-sm`, `-md`, `-lg` | `svg-padding-*` of the intro image (only `lg` occurs) | 8 |
| `subscribe` | `subscriptionForm`, always in the fragment `blog-subscription-form` | 843 pages |

## Domain lists

`/f52-synopsys-1211-02/data/form-domains.json` is a DA sheet (`id`, `title`, `values`) with the
source's three files as they are: the 28 lists of `Forms-Domains-List.json`, and the rows
`personal-email` and `block-list`. The block reads it from `siteRoot()`, once per page.

- `personal-email`: on typing, "Please register with a valid work email.", submit disabled.
- lists and domains of `blocked-domains`: on submit, the `domain-error` message.
- `block-list`: on submit, "Your Form Has Been Submitted!" in green, and nothing is sent.
- `dmb-list-BIS` holds one empty entry. It is kept: the source matches it against an empty
  e-mail, so an empty submit shows the `domain-error` message instead of Marketo's own.
- A sheet that cannot be read: no message, submit stays enabled, the checks run without the
  lists (own domains only). The source's "Error while loading form!" never shows: its script
  calls the misspelt `form.submitable(false)` first, which throws.
- Subscribe form in a rail with contents: the first class Marketo adds to `#Email` (its check
  on a first focus) is removed once, as the source's `fixMarketoFormInitialValidation`.

The sheet was written once from the cache (`util/marketo-forms/*.json`) with `tools/da.mjs put`
and `preview`. The importer does not write it.

## Transforms

- Everything comes from the hidden inputs and the inline script of the instance.
- 219 of 747 intros use empty paragraphs or line breaks at the start or doubled at the end of
  a paragraph as spacing. The pipeline drops all of them, so each blank line is written as a
  zero-width space. This differs from CONTRACT a) ("drop empty paragraphs").
- The intro image is asked for as `fmt=png-alpha`: the markup does not say which assets are
  PNGs, and a transparent picture gets a white box otherwise.
- `/ai/ai-chip-development.html` hides its form with a style element: no block, with
  `ctx.drop`.
- Components inside a container (2 pages, a `text`) follow the block as their own sections.

## Block

- `landing`: `.form-row > .form-intro + .form-side > .form-panel`. Inline: `.form-panel`.
  `subscribe`: `.form-body`. Marketo fills `form#mktoForm_<id>`, on view.
- The fields are Marketo's markup and its stylesheet loads last. Each ported rule keeps the
  source's exact weight: `.form-panel` for `.snps-aem-mktoForm`, `.form.subscribe` for the two
  classes of the subscription form, `:where()` for rules the source wrote without a scope.
- No rule starts at a bare `.form`: the template `form` puts that class on `body`.
- Three rules reach outside the block, each for what the source does when a form is there:
  `.section-col:has(.form.subscribe)` (rail 33 px narrower), `.section-row:has(…form.mktoForm)`
  (form first below 730), `.toc … .form-toc-link` (the "Subscribe" link the source's script
  adds to the contents list below 731, where the form moves to the end of the page).

## Measured, forms loaded (region against region, 1440 / 768 / 375)

| Variant, page | Diff |
| --- | --- |
| `landing purple two-column`, `/resources/sram-puf-cryptographic-key-protection` | 0.00 % each |
| `landing purple two-column`, `/contact-sales` | 0.00 % each |
| `landing white` with date, `/webinars/automotive-margin` | 0.17 / 0.10 / 0.33 % |
| `landing dark`, `/converge/executive-forum-2025` | 0.00 % each |
| inline, `/verification/vc-formal-services` | 0.00 % each, same place on the page |
| `subscribe`, blog article | 111 elements with equal boxes and styles at each width |
| image, `image-pad-lg`, no `h1`, zh-cn | 0.00 to 0.01 % |

States, each run on both sites with one script, facts equal and 0.00 % at 1440, 768, 375:
focus, empty submit, personal e-mail, blocked domain (own list and sheet list), dropped domain,
loading error, known visitor (cookie and lead service mocked), submit and redirect, subscribe
and message, webinar date shown (clock moved back), no form delivered.

## Differs from the source

- Loading states are not reproduced: the grey bars before Marketo's library is there, and the
  empty panel the source shows for up to 3.2 s (it hides the title until the button exists,
  and switches a two-column form from 7 | 4 to 6 | 5 at that moment). The block shows the
  title and the final layout at once. The settled states are equal.
- Analytics events (`form-view`, `formSuccess`, …) and the `mkto_lead_id` cookie: not migrated.
- `blogProductTags` of the subscription comes from `meta[property="article:tag"]`: empty
  until the page metadata `tags` holds the tag labels.
- A leading `&nbsp;` of a paragraph is lost in the pipeline (the 0.1 to 0.3 % above).

## Known gaps

- The 835 thank-you pages (`…/thankyou.html`) are not in the sitemap and not migrated: the
  redirect after a submit ends on the 404 page.
- In the shared tools no form loads: Marketo asks for its descriptor with a random callback
  name, which never hits the cache. `compare.mjs --page` then compares the block's settled
  state with a kept source shot taken during the source's 3.2 s (bands 1.5 to 21 %). The fix
  is in `tools/lib/page.mjs` (see the requests of this group): serve
  `…/form/getForm?…&form=<id>&url=https%3A%2F%2Fwww.synopsys.com%2F&callback=cb` and rename
  `cb(`. Six descriptors are cached that way (6087, 7792, 6090, 6484, 7687, 8479).
- On `http://localhost` a submit does not finish: Marketo frames its submit page with the
  page's protocol and the CSP allows `https:` frames only. On https this does not happen.
- The lead service (`api.synopsys.com/api/v1/lead`) was not called from another origin: when
  it refuses, the visitor gets the full form, as in the source on any error.
