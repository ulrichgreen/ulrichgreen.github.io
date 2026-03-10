# Roadmap

This is the short list of work that still feels worth doing. Items are grouped by urgency and ordered roughly by impact.

## Quick Wins

Add a Speculation Rules script block to the base template. The browser prerenders internal links on hover, navigation feels instant, no JavaScript framework involved, falls back silently in browsers that do not support it.

Add View Transitions with a single CSS rule (`@view-transition { navigation: auto; }`) and a meta tag. Cross-document fades without any JavaScript. Respects `prefers-reduced-motion`. Named transitions on article titles could animate between the writing index and the article page.

Add Open Graph and social meta tags. `site-head.tsx` currently emits only `<title>` and `<meta name="description">`. Adding `og:title`, `og:description`, `og:type`, `og:url`, and `twitter:card` makes shared links look intentional. The data already exists in frontmatter.

Add canonical URLs using the final deployed URL. Requires knowing the site base URL, which could live in a small config file or a frontmatter default.

Add a favicon reference to the templates. Even a minimal SVG favicon in an inline `data:` URI prevents the 404 request browsers make by default.

Debounce rebuilds in `dev.ts`. Rapid saves currently queue overlapping builds. A small debounce of 100 to 200 milliseconds would collapse rapid changes into a single rebuild.

Enable parallel page builds in the Makefile. Pages are independent targets. Running `make -j` would let Make build them in parallel.

Archive `MDX-REACT-ISLANDS-PLAN.md`. It is fully completed. It could move to `docs/archive/` or be consolidated into a short retrospective note.

## Next

Generate a `sitemap.xml` from the writing index and the list of top-level content files.

Add frontmatter validation with clear build errors. A small schema check could catch missing `title`, `section`, or `published` fields at build time with file-specific error messages.

Generate a full-text feed at `dist/feed.xml` with full article content.

Add a broken-link check. A post-build step that scans all `dist/*.html` files for internal `href` values and verifies that the targets exist.

Add lazy island hydration. Islands currently hydrate immediately on `DOMContentLoaded`. The `data-island` root could carry an optional `data-hydrate` attribute with values like `visible`, `idle`, or `interaction`, and `islands.ts` could defer `hydrateRoot` accordingly. This reduces Time to Interactive.

Add remark and rehype plugins for MDX. `compile-mdx.ts` currently runs with no plugins. `remark-gfm` adds tables and task lists. `rehype-autolink-headings` adds shareable deep links. `rehype-pretty-code` with `shiki` adds build-time syntax highlighting with CSS custom properties. All build-time only, no runtime cost.

Add content-hashed filenames for CSS and JS. Both esbuild and lightningcss support this natively. The template would receive hashed filenames from a small manifest written during the asset build. Enables aggressive `Cache-Control: immutable` headers.

Add structured data for articles. A JSON-LD block with `Article` schema using `title`, `published`, `revised`, and `description` from frontmatter. A small addition to `site-head.tsx`.

Add a custom 404 page. Author `content/404.mdx` and configure the hosting platform to serve it.

Add reading time to articles. Compute automatically from the MDX body at build time instead of requiring manual word counts in frontmatter.

## Later

Year-based archives for the writing.

Article summaries on the home page.

Revision notes for essays that change meaningfully over time.

Consolidate the build into a single process. Currently Make spawns a separate `tsx` process for each page. A single Node process that reads all content files, builds the writing index once, compiles all MDX in parallel, and writes all output would eliminate per-page startup cost.

Add performance budget enforcement. A post-build check that measures total HTML, CSS, JS size and fails the build or warns if any metric exceeds a defined budget.

Add an image pipeline. A build step to optimize images, generate multiple sizes, convert to AVIF and WebP, and produce `<picture>` elements.

Add type-safe frontmatter. Replace the `[key: string]: unknown` escape hatch in `PageMeta` with a discriminated union based on `section`. Writing pages would require `published` and `description`, other pages would not.

Inline critical CSS. The CSS needed for above-the-fold rendering could be inlined into `<head>` as a `<style>` block. The rest would load asynchronously. Worth doing once the design stabilizes.

Add build caching for incremental rebuilds. A manifest file that stores file hashes and frontmatter would let the build skip unchanged files.

## Keep An Eye On

Performance budgets for generated HTML, CSS, JS, and fonts.

Whether the running header and margin-note behavior still earns its place.

Whether the docs stay in step with the implementation.

Whether CSS `@layer` would make the cascade more predictable. The migration would be mechanical and all target browsers support it.

Whether container queries would help island layout as the number of islands grows.

## Not The Goal

Turning the site into an app.

Adding more features than the writing can support.

Building infrastructure for ideas that still fit better as a note in this file.

Adding a CMS. The authoring model is a text editor and a file system.

Adding client-side search. A static site this small does not need it.

Adding a comment system. If engagement matters, email works.

Adding a CSS framework. The design system is intentional.

Adding server-side rendering at request time. The site is static on purpose.