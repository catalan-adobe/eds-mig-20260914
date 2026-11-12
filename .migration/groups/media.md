# Group media: video, embed

Owner of `blocks/video/`, `blocks/embed/` and the transforms `video.mjs`, `googleMap.mjs`.
No new icon: the play button uses `icons/play.svg` as a mask.

Source: `video` (510 on 301 pages, 7 of them empty), `googleMap` (23 on 20 pages). The
`html` group's transform writes these blocks too: 20 Brightcove playlists and 6 iframes in
`htmlTextOnly`.

## video

One row, one cell: an optional thumbnail image, then the link to the player.

```html
<div class="video modal">
  <div><div>
    <p><img src="…/media/poster.jpg" alt=""></p>
    <p><a href="https://players.brightcove.net/1/rka4xWwYG_default/index.html?videoId=2">…</a></p>
  </div></div>
</div>
```

| Variant | Source | Instances |
| --- | --- | ---: |
| default | `data-mode="inline"`: a click plays it in place | 95 |
| `modal` | `data-mode="modal"`: a click opens `scripts/modal.js` | 408 |
| `playlist` | playlist embed that fills its column, 16:9, white player | 14 |
| `playlist narrow` | playlist embed of 768 px at 100:57, row of 768 px | 6 |
| `center` | with `narrow`: the source's `<center>` | 5 of the 6 |

- Link: the Brightcove player page (`videoId`, or `playlistId` for a playlist), or a YouTube
  watch link (34). The player of an account is the one of the source's script
  (`rka4xWwYG`, `k9ROJJb3q`, `jj9Z5xaG4z`), or `data-player-id` (1).
- Thumbnail: the authored one (105, alt kept). Without it the source shows its player under
  the button. The block shows the Brightcove poster as a background, read from the playback
  API with the player's policy key when the block comes into view. For YouTube it shows the
  YouTube embed, as the source.
- States: play button 64 px, 68 px on hover. Click: an iframe of the player with autoplay, in
  place or in the modal. Modal: close button, Escape, click outside. 16:9 everywhere.
- `playlist` is the in-page Brightcove player, as the source (`loadScript` of the player's
  `index.min.js` on view): an iframe would scale the row of videos.
- The block renames its class `modal` to `opens-modal`: `.modal` is the dialog's class in
  `styles/lazy-styles.css`.
- `tabs` loads this block for a video in a panel. `cardContainer` keeps it as a block.

## embed

Row 1: the link. Row 2, optional: `width x height`, pixels or per cent.

```html
<div class="embed map">
  <div><div><a href="https://www.google.com/maps/embed/v1/place?q=35.61,139.62">…</a></div></div>
  <div><div>350 x 350</div></div>
</div>
```

- `map`: the 20 px padding of the source's `.googleMap`. Plain `embed` has none, as an
  iframe in `htmlTextOnly`.
- `googleMap` sizes: 350 x 350 (2), 330 x 300 (3), height 200 only (16, written `300 x 200`),
  none (2, the browser's 300 x 150). The component's own spacing is the section's.
- The iframe has `loading="lazy"`. A YouTube watch link becomes its embed URL. A Spotify
  iframe gets the 12 px radius of its embed code.

## Differs from the contract

- `embed map` is new: the contract has one `embed` for the map and for plain iframes, but
  only the map has the padding.
- `video playlist narrow` and `center` are new: the source has two playlist embed codes.
- A single video plays in an iframe of the Brightcove player page, not in the in-page player
  the source builds. Same player, and the same as `hero` and `cards` do in the modal.

## Measured (region against the source, after scrolling to it), 1440 / 768 / 375

| Variant | Page | Diff % |
| --- | --- | --- |
| inline, no thumbnail | `…/test-automation/synopsys-ip-sms` | 0.01 / 0.00 / 0.02 |
| inline, thumbnail | `/videos/seagate-custom-compiler` | 0.02 / 0.58 / 0.78 |
| modal, no thumbnail | `/videos/security-ip` | 0.00 / 0.00 / 0.02 |
| modal, thumbnail | `/videos/clock-net-inducatance-5nm` | 0.01 / 0.40 / 0.50 |
| YouTube inline | `/videos/pcie-vip-debug` | 0.01 / 0.00 / 0.02 |
| YouTube modal | `/glossary/what-are-atomistic-simulations` | 0.00 / 0.00 / 0.02 |
| YouTube modal, thumbnail | `…/materials-modeling/battery-simulation` | 0.93 / 0.20 / 1.28 |
| in tabs | `/ai/agentic-ai` | 0.00 / 0.02 / 0.02 |
| in an article | `/blogs/chip-design/architecting-ai-factories-series` | 0.00 / 0.01 / 2.84 |
| playlist | `…/pci-express/pci-express-4`, draft | 0.00 / 0.00 / 0.00 |
| playlist narrow center | `…/ethernet/56g-ethernet-phy`, draft | 0.07 / 1.25 / 1.52 |
| playlist narrow | `…/usb/usb-c-31-displayport`, draft | 0.00 / 0.21 / 0.00 |
| map, no size | `/events/signoff-sig` | 0.00 / 0.03 / 1.69 |
| map 330 x 300 | `…/office-locations/armenia` | 0.04 / 0.00 / 0.06 |
| map 350 x 350 | `/ja-jp/japan/company/company-profile` | 0.02 at 375, see gaps |
| map, height 200 | `/company/executive-briefing-center/ebc-map` | 0.00 at 375, see gaps |
| Spotify, Podbean, YouTube, Maps iframe | four pages, draft, at 375 | 3.01, 0.18, 0.13, 0.25 |

"Draft": the source page has no `htmlTextOnly` transform yet, so its region is compared
with the same block on `/drafts/group-media/da-media` (in DA).

Every box has the source's size at the three widths. The values above 1 % are pixels of
pictures: a thumbnail that the pipeline delivers in another rendition, a poster that lies on
another fraction of a pixel, map labels and a scrolling title that Google and Spotify draw.
States, measured with one script on both sites: play button and hover, inline click, modal
open, Escape, close button, playlist item click.

## Known gaps

- Modal: the source's 16:9 box is 906 x 510 at 1440 (15 px `.modal-body` padding), the shared
  modal's is 936 x 527. Global's file.
- Playing video: the iframe player keeps its share button in the title bar and its own font.
  The source moves the button into the control bar and has Roboto from a `*` rule.
- A map in a 6 | 6 row inside a 9 | 3 row (`/ja-jp/japan/company/company-profile`,
  `/company/executive-briefing-center/ebc-map`): the importer stacks the cells, so the map is
  under the text and not beside it from 730.
- The 16 maps on `/support/training/locations/locations_*` are not previewed: the preview
  answers 404 for a path with an underscore.
- A video in a carousel slide (10 on 3 pages) is a plain link: the carousel's transform.
- Lazy loading and the tools: `still()` scrolls the page before the lazy sections exist, so
  a full-page shot can show an empty map or a video without poster. A region shot after
  `scrollIntoViewIfNeeded` shows them.
- A local draft (`.plain.html`) is served without a doctype. In quirks mode the playlist row
  is as high as the window: test playlists on a DA draft.
