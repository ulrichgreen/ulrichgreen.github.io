# Roadmap

What's worth building next, in order of effort and payoff. The top items are small moves that punch above their weight. The bottom is the "not happening" list — useful for saying no quickly.

## Next

Nothing right now. Enjoy the quiet.

## Later

Inline critical CSS — inline above-the-fold styles in `<head>`, async-load the rest. Worth doing once the design settles.

Add build caching — asset hashing is in place; the next step is skipping unchanged pages on incremental rebuilds.

## Done

Year-based archives for articles — articles are now grouped by year in the article list.

Article summaries on the home page — descriptions are now shown below each article title in the listing.

Revision notes for articles that change meaningfully — articles can declare a `revisions` array with date + note pairs, rendered as a revision history.

Image pipeline — source raster images are processed at build time into optimized AVIF and WebP variants with resized versions for large images.

Tightened frontmatter types — `PageMeta` is a discriminated union on `layout`, so article-only fields (note, series, seriesOrder, revisions) stay explicit at compile time.

Aligned naming to "pages" and "articles" — the codebase consistently uses "articles" instead of the former mix of "writing", "essay", and "post".

## Keep An Eye On

Whether the current build-enforced budgets for HTML, CSS, JS, and fonts still fit as the site grows.

Whether the fixed page header and margin-note behavior still earns its place or becomes a distraction.

Whether these docs stay in step with the implementation. The tests catch output regressions, but attention still matters.

Whether container queries become useful as the number of islands grows.

Whether `remark-gfm` table styling needs dedicated CSS as content starts using tables and task lists.

## Not The Goal

Turning this into an app. It's a document.

Adding features faster than the writing can absorb them.

Building infrastructure for ideas that still fit better as a line in this file.

A CMS. The authoring model is a text editor and `git push`.

Client-side search. The site is small. Use Ctrl+F.

A comment system. Email exists.

A CSS framework. The design system is the CSS.

Server-side rendering at request time. The site is static because static is better for this.
