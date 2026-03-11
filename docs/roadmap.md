# Roadmap

What's worth building next, in order of effort and payoff. The top items are small moves that punch above their weight. The bottom is the "not happening" list — useful for saying no quickly.

## Next

Style the heading autolink anchors. `rehype-autolink-headings` now appends `<a>` elements after each heading; they need a subtle visual treatment (e.g. a `#` glyph on hover) so deep links are discoverable without cluttering the reading flow.

Add `Cache-Control: immutable` headers for content-hashed assets. The hashed filenames are in place; the remaining step is the hosting configuration — a `_headers` file for GitHub Pages or equivalent.

Add `woff2` MIME type to the dev server. `dev.ts` currently maps only `.html`, `.css`, and `.js`; font and XML requests fall back to `text/plain`.

Generate a `robots.txt` at build time pointing to `sitemap.xml`. Trivial complement to the sitemap, helps crawlers find it without a search-console submission.

Remove the manual `words` field from article frontmatter. Reading time is now computed automatically from the MDX body at build time; the six articles still carry a hand-written `words` value that the build overrides. Clean up the redundancy.

Add `og:image` meta tags. A default sharing image (or per-article generated card) would improve link previews on social platforms. The `site-head.tsx` component already emits `og:title` and `og:description`; `og:image` is the remaining gap.

Validate the Atom feed as a post-build check. Ensure `feed.xml` is well-formed XML with the required Atom elements (`<feed>`, `<title>`, `<id>`, `<updated>`, `<entry>`). Catches structural regressions before they reach readers.

## Later

Year-based archives for the writing — once there's enough to group.

Article summaries on the home page — pull descriptions and dates into a richer landing.

Revision notes for essays that change meaningfully. Show the thinking, not just the result.

Add performance budget enforcement — a post-build check measuring total HTML, CSS, JS size. Warn or fail if anything crosses a defined threshold.

Add an image pipeline. Optimize, resize, convert to AVIF/WebP, generate `<picture>` elements. Worth it once image content grows.

Tighten frontmatter types further. The build already validates frontmatter with `zod`; the next step is a stronger TypeScript model, likely a discriminated union on `layout`, so article-only fields stay explicit at compile time too.

Inline critical CSS — inline above-the-fold styles in `<head>`, async-load the rest. Worth doing once the design settles.

Add build caching — a manifest of file hashes and frontmatter to skip unchanged pages on incremental rebuilds.

Parallelize page rendering inside the TypeScript build entry. The site build now runs in one process; the next speed win would be parallel work in `site.ts` rather than shell-level target fanout.

## Keep An Eye On

Performance budgets for HTML, CSS, JS, and fonts as the site grows.

Whether the fixed page header and margin-note behavior still earns its place or becomes a distraction.

Whether these docs stay in step with the implementation. (The tests enforce this, but attention still matters.)

Whether CSS `@layer` would clean up the cascade. Migration would be mechanical and every target browser supports it.

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
