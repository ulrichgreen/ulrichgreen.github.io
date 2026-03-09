# Improvements

A comprehensive list of things that could make this site better. Some are small. Some are large. All of them are aligned with the manifesto: the site should be fast, authored, understandable, and calm.

Items are grouped by effort and ordered roughly by impact within each group.

## Quick Wins

### Speculation Rules For Instant Navigation

The Speculation Rules API lets the browser prefetch or prerender pages the reader is likely to visit next. For a small static site with stable URLs this is almost free performance.

Add a single script block to the base template:

```html
<script type="speculationrules">
{
  "prerender": [{ "where": { "href_matches": "/*" }, "eagerness": "moderate" }]
}
</script>
```

The browser prerenders internal links on hover. Navigation feels instant. No JavaScript framework involved. Falls back silently in browsers that do not support it.

### View Transitions API

Cross-document view transitions are now supported in all major browsers. A single CSS rule and a meta tag give the site smooth page-to-page fades without any JavaScript.

```css
@view-transition { navigation: auto; }
```

This fits the manifesto perfectly. It is a browser primitive, it respects `prefers-reduced-motion`, and it makes the site feel considered without adding a dependency. Named transitions on elements like article titles could animate between the writing index and the article page.

### Social And Open Graph Meta Tags

`site-head.tsx` currently emits only `<title>` and `<meta name="description">`. Adding `og:title`, `og:description`, `og:type`, `og:url`, and `twitter:card` makes shared links look intentional instead of generic. The data already exists in frontmatter.

### Canonical URLs

Each page should include `<link rel="canonical">` using the final deployed URL. This is already on the roadmap. It requires knowing the site base URL, which could live in a small config file or a frontmatter default.

### Favicon And Touch Icon

There is no favicon reference in the templates. Even a minimal SVG favicon in an inline `data:` URI would prevent the 404 request browsers make by default.

### Dev Server Rebuild Debouncing

`dev.ts` triggers a full `make build` on every file change event. Rapid saves can queue multiple overlapping builds. A small debounce of 100 to 200 milliseconds would collapse rapid changes into a single rebuild.

### Make Parallel Builds

The Makefile already expresses page builds as independent targets. Running `make -j` would let Make build pages in parallel. For a site with more than a handful of articles, this noticeably reduces build time. The `-j` flag could be the default in the `watch` target.

### Archive The Completed Migration Plan

`MDX-REACT-ISLANDS-PLAN.md` is fully completed. It served its purpose well. It could be moved to a `docs/archive/` folder or consolidated into a short retrospective note, keeping `docs/` focused on living documents.

## Medium Effort

### Frontmatter Validation

The build currently accepts any shape of frontmatter. A validation step using a small schema (zod or a hand-written check) could catch missing `title`, `section`, or `published` fields at build time with clear, file-specific error messages. This is already on the roadmap.

### Lazy Island Hydration

Islands currently hydrate immediately on `DOMContentLoaded`. For islands below the fold or only used after interaction, hydration could be deferred using `IntersectionObserver` (hydrate when visible) or event listeners (hydrate on first interaction). This reduces Time to Interactive and aligns with the manifesto's stance that every byte of JavaScript should earn its place.

The island contract already supports this. The `data-island` root could carry an optional `data-hydrate` attribute with values like `visible`, `idle`, or `interaction`, and `islands.ts` could read it before calling `hydrateRoot`.

### Remark And Rehype Plugins For MDX

The MDX compilation step in `compile-mdx.ts` currently runs with no plugins. Adding a small set would improve the authoring experience:

`remark-gfm` adds tables, strikethrough, and task lists. These are common prose needs.

`rehype-autolink-headings` adds anchor links to headings, making deep links shareable.

`rehype-pretty-code` with `shiki` adds build-time syntax highlighting with CSS custom properties for theme switching. This matches the existing design system approach of using custom properties for light and dark mode.

These are all build-time only. No runtime cost.

### Sitemap Generation

Generate `dist/sitemap.xml` from the writing index and the list of top-level content files. This is already on the roadmap. A small build step that runs after all pages are built would be enough.

### Full-Text RSS Feed

Generate `dist/feed.xml` with full article content. This is on the roadmap. The writing index already collects the metadata. The body could come from the rendered HTML or from the MDX source.

### Content Hash Filenames

`dist/style.css`, `dist/site.js`, and `dist/islands.js` use fixed filenames. Content-hashed filenames like `style.a1b2c3.css` allow aggressive `Cache-Control: immutable` headers. Both esbuild and lightningcss support content hashing natively. The template would need to receive the hashed filenames, which could be written to a small manifest file during the asset build.

### Broken Link Checker

A post-build step that scans all `dist/*.html` files for internal `href` values and verifies that the targets exist. This is on the roadmap and would catch dead links before deployment.

### Structured Data For Articles

Add a JSON-LD block to article pages with `Article` schema. The frontmatter already has `title`, `published`, `revised`, and `description`. A small component in `site-head.tsx` could emit the structured data when the section is `writing`.

### Custom 404 Page

Author `content/404.mdx` and configure the hosting platform to serve it. A 404 page that feels authored instead of generic is already in the experiments file. It could double as a small creative statement.

### Reading Time From Word Count

Frontmatter already supports a `words` field. Displaying an estimated reading time (`~5 min read`) in the article header is a simple derived calculation. Alternatively, compute it automatically from the MDX body at build time so the author does not have to count.

## Larger Changes

### Single-Process Build

Currently, Make spawns a separate `tsx` process for each page. Each process pays the Node startup cost, the TypeScript transpilation cost, and the MDX dependency loading cost. For a site with many articles this becomes slow.

An alternative is a single orchestrated build step: one Node process that reads all content files, builds the shared writing index once, compiles all MDX in parallel using `Promise.all`, and writes all output files. Make would invoke this single step instead of individual page builds.

The Makefile could still own the top-level graph (CSS, JS, content), but the content stage would be a single invocation instead of one per file.

### Performance Budget Enforcement

Add a post-build check that measures total HTML size, CSS size, JS size, and the number of external requests. Fail the build or emit a warning if any metric exceeds a defined budget. This turns the manifesto's stance on restraint into a measurable constraint.

### Image Pipeline

There is currently no image handling. A small build step could optimize images in a `content/images/` directory: generate multiple sizes, convert to modern formats like AVIF and WebP, and produce `<picture>` elements. This matters once the site has visual essays or a portfolio section.

### Type-Safe Frontmatter

The `PageMeta` interface in `types/content.ts` currently uses `[key: string]: unknown` as an escape hatch. Replacing this with a discriminated union based on `section` would let TypeScript catch missing fields at build time. For example, writing pages would require `published` and `description`, while other pages would not.

### Inline Critical CSS

For the fastest possible first paint, the CSS needed for above-the-fold rendering could be inlined into the `<head>` as a `<style>` block. The rest of the stylesheet would load asynchronously. This requires splitting the CSS partials into critical and non-critical sets, which is worth doing once the design stabilizes.

### Build Caching For Incremental Rebuilds

The writing index (`writing-index.ts`) currently reads every file in `content/writing/` on every page build, even if only one article changed. A manifest file that stores file hashes and frontmatter would let the build skip unchanged files. Make already tracks file modification times for the page targets, but the index recalculation is the bottleneck.

## Testing And Verification

### Expand Rendering Tests

The current `verify-jsx-rendering.ts` test covers two pages. As more features land (social meta, canonical URLs, structured data, sitemap), each should get a targeted assertion in the rendering test or its own small verifier.

### Visual Regression Testing

A screenshot-based test that renders key pages and compares them to baselines would catch unintended visual changes. Tools like Playwright or Puppeteer can do this without adding a runtime dependency.

### Accessibility Audit

A post-build accessibility check using `axe-core` or `pa11y` on the generated HTML would catch missing landmarks, contrast issues, or heading hierarchy problems. This could run as part of `npm test`.

## What Not To Add

Improvements that seem useful but conflict with the manifesto:

Do not add a CMS. The authoring model is a text editor and a file system.

Do not add client-side search. A static site this small does not need it. Browser find works.

Do not add a comment system. If engagement matters, email works.

Do not add a CSS framework. The design system is intentional.

Do not add server-side rendering at request time. The site is static on purpose.
