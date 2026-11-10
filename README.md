# WKND on Edge Delivery Services

A migration of https://wknd.site to Edge Delivery Services.
Content lives in DA under `/f52-1011-01/`. Code lives on the branch `f52-1011-01`.

## Environments

- Preview: https://f52-1011-01--eds-mig-20260914--catalan-adobe.aem.page/f52-1011-01/us/en
- Local: `npx -y @adobe/aem-cli up`, then http://localhost:3000/f52-1011-01/us/en

## Checks

```sh
npm i
npm run lint
npm test
```

## Content model

A page is a list of sections. A section holds default content and blocks.
Each locale folder, such as `/us/en`, has its own `nav` and `footer` page.

| Block | Rows |
|-------|------|
| `carousel` | One row per slide: image, then title, text and a button. One slide shows no controls |
| `columns (featured)` | Image, then a small title, a heading, text and a button |
| `cards` | Image, then a linked title and a description |
| `cards (filter)` | As `cards`, plus a last cell with categories, split by commas |
| `cards (people)` | Portrait, then name (heading 3), roles and icon links |
| `cards (byline)` | As `cards (people)`, for the author under an article |
| `cards (list)` | A linked title, then a date |
| `cards (locked)` | Image, then title (heading 2), text and a label |
| `tabs` | Label, then the panel content |
| `accordion` | Question, then answer |
| `facts` | Label, then value |
| `quote` | The quotation, then who said it |
| `search` | The placeholder text, then the label of the switch. It has no backend |

Rules for default content:

- A bold link is a yellow button. An italic link is a dark button.
  Card titles are plain links for that reason.
- Italic text after an image, in the same paragraph, is its caption.
- Icons are written as `:name:`. The files are in `/icons`.
- Every heading 2 has a yellow underline.

Section styles, set in `Section Metadata`:

| Style | Effect |
|-------|--------|
| `divider` | A rule below the section |
| `underline` | The heading 1 has a yellow underline |
| `small-text` | Paragraphs are small |
| `aside` | A right column. It sits beside the section before it |
| `aside-left` | A left column. It sits beside the section after it |

Page metadata `Template` is `adventure` or `article`. Both add a breadcrumb built from the URL.

## Import

The importer reads the pages listed in `tools/import/pages.txt` from the source site.

```sh
node tools/import/run.js                 # write the pages to .import/
node tools/import/upload.js              # upload to DA and preview, only under /f52-1011-01/
node tools/import/check.js <base-url>    # compare headings, images and links with the source
```

`upload.js` reads the DA token from `~/.aem/da-token.json`. Run `da-auth-helper token` to refresh it.
