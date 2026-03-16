# Architecture

This site is built around a static-first pipeline:

- content is authored as files
- the build turns that content into complete HTML documents
- CSS and a small amount of JavaScript are emitted alongside the pages
- the browser gets a usable document before any script runs

The implementation details will evolve, but the architecture is meant to stay legible: a small content system, a small render layer, and a small client runtime.

## Overview

There are two main kinds of source material:

- authored pages in `content/`
- site code in `src/`

`pnpm build` reads the content tree, compiles pages, renders layouts, bundles assets, and writes the finished site to `dist/`.

The output is plain HTML, CSS, fonts, images, and a couple of focused browser bundles. The site does not depend on client-side routing or full-page hydration to exist.

## Build Pipeline

The build is organized as a few clear stages.

### 1. Discover source pages

Source pages are discovered from:

- top-level `.mdx` files in `content/`
- articles in `content/articles/`

That keeps the authored content model simple: standalone pages at the top level, and articles collected under `articles/`.

### 2. Parse and validate frontmatter

Each page is expected to provide YAML frontmatter and an MDX body.

Frontmatter is validated before a page moves further through the pipeline. The build treats metadata as a contract rather than a suggestion, so invalid content fails early.

Some metadata is authored directly, while some is derived during the build:

- `description` can come from explicit frontmatter, a summary field, or the first usable prose paragraph in the body
- heading-only blocks and other non-content blocks are skipped when that description is derived
- `section` can be inferred from the content path when it is not set explicitly
- word count and reading-time metadata are computed from the body

### 3. Compile content

MDX is compiled into component trees at build time.

Content is intentionally constrained:

- arbitrary MDX imports and exports are not part of the authoring model
- content can only use the components exposed through `src/content-components.tsx`
- prose stays the default, with components used sparingly and intentionally

The content compiler also applies the site’s markdown and code-block transforms so that headings, links, tables, and fenced code are rendered consistently.

### 4. Render full pages

Compiled content is rendered into full HTML documents through shared templates.

The render layer is responsible for:

- choosing the correct page layout
- composing the page shell and metadata
- passing shared render context into templates and content components
- serializing island placeholders when a page includes interactive components

Pages are rendered at build time, not on request.

### 5. Build assets

The asset build runs alongside page compilation.

It produces:

- a single site stylesheet from the files under `src/styles/`
- one browser bundle for document-level enhancements
- one browser bundle for islands
- copied font assets
- optimised image variants (AVIF, WebP, and resized versions) from source images in `src/images/`

In production, emitted CSS and JavaScript filenames are fingerprinted so rendered pages can reference cache-friendly assets through a generated manifest.

### 6. Generate ancillary artifacts

After the pages are written, the build generates the supporting files that belong to the site as a whole:

- Atom feed
- sitemap
- robots rules
- hosting headers
- default Open Graph image

These artifacts are derived from the same content metadata as the pages rather than being maintained by hand.

### 7. Enforce output budgets

The final `dist/` output is measured against size budgets for major asset classes.

That keeps the architecture honest. Static-first only matters if the shipped site actually stays small.

## Rendering Model

The render layer uses TSX components for both templates and approved content components.

The important architectural point is not the specific UI library, but the split of responsibilities:

- templates define the document shell
- shared components handle reusable presentational pieces
- content components are the small approved bridge between prose and UI
- interactive islands are isolated from the rest of the page

There are two primary layouts:

- `base` for general pages
- `article` for articles

The article layout adds the additional structure expected for articles: publication metadata, article framing, and optional series navigation.

Render context also carries shared information that templates and components need at build time, such as the article index and the current asset manifest.

## Client Runtime

The browser code is intentionally split by responsibility.

### Document-level enhancements

`site.js` enhances already-rendered pages. It is responsible for page-wide behaviors such as:

- reading progress
- heading reveal effects
- footnote interactions

These behaviors decorate existing markup. They do not create the page or own the whole document.

### Islands

`islands.js` hydrates only explicit island roots.

Each island is:

- rendered on the server into static HTML
- marked up with its serialized props and hydration strategy
- hydrated later by the browser only when needed

The current island system supports multiple hydration timings, including immediate, visible, idle, and interaction-driven hydration.

This keeps interactivity opt-in and local. A page with no islands remains a static page with no island runtime cost.

## Content Model

MDX is the authoring format, but the model is closer to “documents with structured metadata” than to “components all the way down.”

The important content fields are:

- identity and description fields such as `title`, `description`, and `summary`
- layout and grouping fields such as `layout`, `section`, and optional series metadata
- article metadata such as `published`, `revised`, and `note`

Not every field is required for every page type. In particular, article-style content is expected to include publication metadata.

The article index is built from the `content/articles/` directory and then reused across the site for article lists, feed generation, and series navigation.

Series support is opt-in. When an article declares a series name and order, the build groups related entries and the article template can render next/previous context automatically.

## Content Boundaries

One of the most important architectural boundaries in the repository is the line between authored prose and application code.

That boundary is enforced in two ways:

- MDX does not get free-form module imports
- content only sees the components exported through `src/content-components.tsx`

Today that approved surface includes `ArticleList`, `Code`, `Hero`, and `DemoWidget`, with `src/content-components.tsx` as the source of truth. The exact list may change, but the architectural rule should stay the same: content authors use a curated surface, not the whole codebase.

## Project Structure

The repository is organized by responsibility.

- `content/` — authored pages and articles
- `src/build/` — the build pipeline, split into content, render, asset, and artifact concerns
- `src/templates/` — page-level templates
- `src/components/` — shared UI components used by templates and content
- `src/client/` — browser-side enhancement and hydration entry points
- `src/islands/` — interactive island components and registry
- `src/styles/` — the site stylesheet layers and component styles
- `src/context/` — render-time shared context
- `src/types/` — shared contracts for content and islands
- `test/` plus co-located `*.test.ts` files — verification scripts and unit tests
- `dist/` — generated output only

`site.config.ts` is the shared configuration boundary for site URL, browser targets, and performance budgets.

## Tooling Posture

The implementation uses a small set of libraries and build tools, but the architecture is not tied to any specific tool choice.

The durable decisions are:

- static output over runtime page generation
- a typed build pipeline over ad hoc scripts
- constrained MDX over arbitrary content imports
- progressive enhancement and islands over full-page hydration
- explicit performance budgets over unchecked asset growth

Specific dependencies can change over time as long as they continue to support those constraints.

For the current tool choices and the reasoning behind them, see `tooling.md`.

## Verification

The repository verifies the system in layers:

- `pnpm run typecheck` checks the TypeScript contracts
- `pnpm run build` exercises the full static build and budget enforcement
- `pnpm run test` runs both unit tests and rendered-output verifiers
- `pnpm run verify` runs the full validation sequence in order

The tests cover both implementation details and emitted artifacts. That includes:

- frontmatter and content-pipeline unit tests
- performance-budget tests
- render verification
- accessibility checks
- internal link checks
- feed validation
- generated SEO artifact validation

CI follows the same basic shape: typecheck, build, then test.

That is the architecture: files in, static site out, with a deliberately small runtime and a few explicit guardrails to keep the system understandable over time.
