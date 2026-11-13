# Group listing

Blocks `listing` and `blog-nav`. Transforms: `search`, `blogsDev`. Index: `M/import/index.mjs`.

## Authored model as built

`blog-nav` (the `blog-sub-navigation` fragment, 1,038 pages): `search` writes row 1, the
`browseByTags` blogsDev writes row 2; both are item rows, so they merge into one block.

```html
<div class="blog-nav">
  <div><div><a href="/f52-synopsys-1211-02/blogs/chip-design">Silicon to Systems Blog</a></div></div>
  <div><div><h2>Browse by Tags</h2><p>Use these tags …</p><ul><li><a href="…/category?tag=5g-wireless">5G Wireless</a></li></ul></div></div>
</div>
```

`listing`: key rows. Variants:

| Variant | Rows | From |
| --- | --- | --- |
| `faceted` | `sheet`, `title` (optional: draws the search box), `facets` (`Label=column, …`), `sort`, `page-size` | `search` result pages (7) |
| `author` | `sheet` = `posts` | blogsDev `mostRecentArticles` (456 author pages, 21 of them empty) |
| `category` | `sheet` (`blogs` or `articles`) | blogsDev `categoryPage` (2) |

Facet columns: `product` (first level of `searchProductCategory`), `solution`, `series` and
`region` (filter tags), `type`, `year` and `availability` (both from `date`, in the block).

Page tags of a post (blogsDev without type, ~1,650): page metadata `tags` and a `<ul>` of links.

## Index (`node M/import/index.mjs [--dry | --cached]`)

One workbook per language at `<lang root>/data/index.json`. Sheets `blogs`, `articles`,
`webinars`, `events`, `success-stories`, `resources`, `news`, `authors` and `posts`. Rows come from
the fetched pages (search metas, blogBanner, page tags) and from the post lists that the server
renders on the author pages. `image` is `/media/<name>` under the site root: the thumbnail is
copied into DA and previewed as a file (a name with `--` is uploaded again with one hyphen: the
web path collapses hyphens). `--cached` uses only thumbnails already in DA.

## Differences from the contract, and why

- Author pages show 10 posts per page with the choice 10 / 25 / 50, not 5: the source script
  ignores `data-content-pagesize` and uses `pagesize` from the URL, default 10 (measured).
- `author` reads sheet `posts` and the `posts` column of sheet `authors` (the server's list and
  order). Built from `authors` alone, the list differed from the source (one author page omits
  a webinar the index credits to the author). Also lists glossary entries, as the source does.
- `blog-nav` is not sticky: the source's sub navigation scrolls away (measured at 1440 and 375).
- The source's English category page `/blogs/chip-design/category.html` answers 301; its
  tag pages `category.<tag>.html` are not in the fetch. Every blog tag link points to
  `/blogs/chip-design/category?tag=`, so a document was written by hand (DA
  `/blogs/chip-design/category.html`): the `blog-sub-navigation` fragment, then `listing
  category` with sheet `blogs`, metadata as the zh-cn category page.
- Search Enter goes to the blog landing page with `?q=` (contract); the source goes to
  `/blogs/blog-search.html#q=`, a page that is not migrated.
- Sort: Date and Relevance (more query words in the title first; without a query the sheet
  order). The default is the source's first sort expression (`relevance` on articles,
  resources and success stories).
- Result cards follow each page's Coveo template: badge field, date beside the badge or under
  the picture (blogs), authors on blogs, articles and resources; tags are the first level of
  the products, then the solutions, three shown and "N more...". Facet values are cleared from
  the breadbox ("Clear"), as on the source, which hides the facets' own clear button.

## Behaviour (from the source's blogsDev script)

- A page change scrolls the post list to its top minus `#topNav`'s height (80 px from 1130,
  70 px below): `scroll-margin-top: var(--nav-height)` on `.listing-posts`.
- The Topics panel closes on Escape (keyup) and on a click outside `.blog-nav`.

## Known gaps

- The thumbnail copy hit the source's bot check (`FETCH-STOP`, 403 on images.synopsys.com at
  23:19 UTC); everything after it came from the cache. 100 of 1,542 `posts` rows (en) and 123
  of 333 (zh-cn) have no image; rerun `node M/import/index.mjs` once the stop is lifted.

- Coveo does not run from the cache: the source shows its loading skeleton in the result
  pages, so the result bands of `faceted` cannot be compared pixel for pixel. The block follows
  the source's result template and its CSS overrides; facet counts, Coveo's default texts and
  the mobile "Sort & Filter" panel are approximations.
- `news` holds the 13 English news pages of the site; the live newsroom lists the press
  releases of news.synopsys.com, which are not in the fetch.
- No-results texts are Coveo's defaults, not the per-page messages (they are i18n keys).
- Category pages with `?tag=` cannot be compared: the source's tag pages are not fetched.
