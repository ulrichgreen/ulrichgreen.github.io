# Architecture

This site is built on a simple idea: author content as files, run them through a small build pipeline, and ship plain HTML.

The implementation uses a few modern tools, but the goal is not modernity for its own sake. The goal is to keep the system understandable, maintainable, and close to the shape of the web itself.

## Overview

Content lives in `content/` as MDX files with YAML frontmatter.

The build reads that content, validates the frontmatter, compiles the MDX into React components, renders the pages to static HTML, and writes the final site to `dist/`.

The browser gets documents first. JavaScript is used for progressive enhancement and a small number of interactive islands, not for making basic pages exist in the first place.

## Build Pipeline

`pnpm build` produces the site in `dist/`.

At a high level, the build does this:

1. read the content graph from `content/`
2. parse and validate frontmatter
3. compile MDX into React component trees
4. render those trees to static HTML with `react-dom/server`
5. bundle CSS and browser JavaScript
6. write additional generated artifacts such as feeds and SEO files
7. check performance budgets for the final output

The end result is plain HTML, plus CSS, plus a small amount of JavaScript where it has actually earned a job.

## Layout and Rendering

Templates and shared UI are standard React TSX components.

MDX content renders through the same tree, but content authors only get access to components exposed through `src/content-components.tsx`. That boundary is intentional. It keeps content authoring controlled and prevents MDX from turning into an ungoverned import party.

`layout: article` routes a page through the article template. Everything else uses the base layout.

The `section` field is presentational. It controls the header breadcrumb and can be inferred from the content directory path when it is not set explicitly.

## Client-Side Code

The site ships two browser entry points.

`site.js` handles document-level progressive enhancement such as scroll effects and footnote reveals.

`islands.js` hydrates interactive islands and is only loaded on pages that actually contain islands.

Islands use `hydrateRoot` and support four hydration strategies:

- `load` — hydrate immediately
- `visible` — hydrate when the island enters the viewport
- `idle` — hydrate when the browser is idle
- `interaction` — hydrate on first user interaction

The default posture is simple: if something can stay static, it stays static.

## Content Model

MDX is the content format.

Frontmatter is YAML and is validated before the page moves further through the pipeline.

The current author-facing fields are:

- `title`
- `description`
- `layout`
- `section`
- `published`
- `revised`
- `note`
- `summary`
- `series`
- `seriesOrder`

Article pages use `layout: article` and must include `published`.

Some metadata is derived during the build instead of being authored manually:

- `words`
- `readingTime`

`summary` is optional. If `description` is absent, the build uses `summary` as the page description.

Series support is opt-in. `series` names the sequence and `seriesOrder` determines order within it. When present, the article footer renders series navigation automatically.

## Approved MDX Components

MDX content can only use the components exposed through `src/content-components.tsx`.

At the moment those are:

- `ArticleList`
- `Code`
- `Hero`
- `DemoWidget`

`DemoWidget` is an island. The others are rendered at build time.

This is deliberate. Most prose should stay prose. Components in content should solve a real problem, not serve as an excuse to smuggle application behavior into documents.

## Project Structure

The main directories are:

- `content/` — MDX source content
- `src/build/` — build pipeline code
- `src/templates/` — page templates
- `src/components/` — shared React components
- `src/client/` — browser-side scripts
- `src/islands/` — interactive islands
- `src/styles/` — site styles
- `src/context/` — shared React context
- `src/types/` — type definitions
- `docs/` — project documentation
- `dist/` — generated output

`dist/` is build output. It is not edited by hand.

## Tooling

The stack is intentionally small.

- TypeScript for the build and contracts
- React and `react-dom/server` for render-time composition
- MDX and `gray-matter` for content authoring
- `lightningcss` for CSS bundling
- `esbuild` for browser bundles
- `chokidar` and `ws` for the dev server

No full-page hydration. No client-side routing. No CSS framework. No extra machinery added just to keep up appearances.

## Verification

`pnpm test` runs two kinds of checks:

- co-located unit tests for the content pipeline
- standalone verifiers for rendered output

The current verifier set checks:

- JSX rendering
- accessibility
- internal links
- Atom feed output
- generated SEO artifacts:
  - `robots.txt`
  - `sitemap.xml`
  - `_headers`
  - `og-image.svg`

`site.config.ts` holds shared site and build configuration, including the canonical site URL, browser targets, and performance budgets.

During `pnpm build`, the final output is checked against budgets for total HTML, CSS, JavaScript, and font weight. The build warns as the site approaches the limits and fails if it crosses them.

CI runs:

`typecheck → build → test`

That is the system. Small enough to reason about, strict enough to catch drift, and boring in the ways that matter.