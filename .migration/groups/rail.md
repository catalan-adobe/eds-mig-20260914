# Group rail: `rail-card`, `dw-products`

## rail-card (source `rightRailItem`, 4,085 cards: 318 components, 3,582 in inherited rails)

Authored model, one block per card, one section per card (no item merge):

```html
<div class="rail-card">
  <div><div><a href="/f52-synopsys-1211-02/support/training">Training</a></div></div>
  <div><div><ul><li><a href="…"><strong>NEW</strong> Self-Paced Learning</a></li></ul></div></div>
</div>
```

- Row 1, the flag: a link (3,862), or plain text (212, source `span.text`).
- Row 2, the links: a `ul`. Missing on the 37 cards that have only a flag. The block finds the
  list row by its `ul` and the flag row by elimination, so the order and missing rows do not matter.
- `NEW` is the source's `span.label-new`, written as `<strong>` at the start of the link.
- Variant `video` (17 cards, not in the contract): the source card has an empty
  `.video-wrapper`, so the gap under the flag is 10 px instead of 5 px from 730 px.
- Empty cards (11) are dropped. The flag colour is always `#5A2A82` (4,074 of 4,074), so it is
  not authored.

The CSS is the source's `.component-railCard` rules: flag 15 px, uppercase, `calc(100% - 8px)`
with an 8 px triangle; links 25 px apart in `--color-grey-text`, hover `#21252b` and underline;
bottom margin `30px - .45em` of the body font; 10 px top padding up to 480 px.

## dw-products (source `dwProductsDownloads`, 174)

```html
<div class="dw-products">
  <div><div><h2>Product Details</h2></div></div>
  <div><div>dwc_lpddr65_controller_afp</div><div>51391</div></div>
</div>
```

- Optional first row: the title (5 instances, all centred). This is not in the contract,
  which has only name | id rows. The source shows the title only when the API answers, so it
  belongs to the block and not to a `text` section.
- Then one row per product: name, id (either may be empty). 4 instances have no products: the
  transform drops them (the source renders nothing).
- The block does what the source script does: `POST https://www.synopsys.com/dw/api/v1/component`
  with `{ids}` and `{components}`, keeps the authored order, builds the Products table and one
  Downloads & Documentation table per product. It has two tabs from 730 px and an accordion below
  (first panel open, a click on an open header closes it). It has Show Documents / Hide Documents
  and opens `#dd` from the URL hash. With no data or an error it stays hidden.

## Measured (localhost:3520, integrated pages)

- rail-card: the width × height of every card is equal to the source at 1440, 768 and 375 on
  /videos/security-ip, /support, management-team, ja-jp 2017-releases, ja-jp 3dic-design and
  office-locations. Region diff of a card on /support: 0.03 / 0.02 / 0.10 %. Whole /support
  page: 0.03 / 0.11 / 0.13 %. The hover colours and underlines are equal.
- dw-products: tested with a fixture of the API response, served by `page.route` on both
  sites. Region diff at 768 and 375: 0 % in every state (initial, second tab or panel, documents
  shown, hidden, accordion closed). At 1440: 0 / 0.08 / 0.11 / 0.13 %. The
  synopsys-ip-sms page with the fixture: equal height, all bands ≤ 0.6 %.

## Known gaps

- The API was not tested from another origin, because no request to synopsys.com is allowed.
  If it refuses CORS on aem.page and aem.live, the 170 product tables do not show.
- `tools/lib/page.mjs` sends non-GET requests to `*.synopsys.com` to the network. So a
  `compare.mjs` or `sweep.mjs` run on a page with `dw-products` POSTs to the real API, on both
  sites. My checks routed it to a fixture.
