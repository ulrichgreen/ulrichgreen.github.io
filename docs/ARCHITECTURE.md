# Architecture

This site is a static build with a React-rendered content path and explicit client-side islands.

## Build Path

`make build` generates everything in `dist/`.

For prose pages, the path is:

`content/*.mdx` -> `src/build/frontmatter.ts` -> `src/build/build-content.ts` -> `src/build/compile-mdx.ts` -> `src/build/render-react-page.tsx` -> `dist/*.html`

`src/build/page.ts` is the CLI entry that loads one content file, builds the writing index, and renders the final page.

`frontmatter.ts` reads YAML frontmatter and emits JSON.

`build-content.ts` resolves metadata, strips duplicate article titles when needed, and prepares the MDX source.

`compile-mdx.ts` evaluates MDX into a React component.

`render-react-page.tsx` picks the right template and renders the final page with `renderToStaticMarkup`.

## Rendering Model

Templates live in `src/templates/` and shared pieces live in `src/components/`.

The TSX files are standard React components.

Content also renders through React. Approved MDX components are exposed through `src/content-components.tsx`, which is the only authoring surface for embedded components.

`section: writing` routes a page through the article template.

Interactive islands use the `Island` wrapper in `src/islands/island.tsx`. Each island is server-rendered for its own root and then hydrated with `hydrateRoot` from `src/client/islands.ts`.

The rest of the document remains static HTML.

## Content Model

MDX in `content/` is the source of truth for pages.

`section: writing` routes a page through the article template.

`content/index.mdx` is the authored home page.

`content/writing/*.mdx` holds the article pages themselves.

Articles should prefer explicit `description` frontmatter. Automatic fallback still exists, but only as a safety net.

TypeScript interfaces in `src/types/content.ts` define the shapes that flow through the pipeline: `PageMeta`, `FrontmatterPayload`, `HtmlPayload`, `WritingIndexEntry`, and the layout props.

## CSS And Client JS

`src/build/css.ts` bundles the stylesheet partials in `src/styles/` into `dist/style.css` using `lightningcss`. The partials are organized into CSS layers: reset, tokens, base, layout, components, utilities, motion, and print.

`src/build/client.ts` bundles two browser entry points using `esbuild`: `src/client/site.ts` into `dist/site.js` for progressive enhancement, and `src/client/islands.ts` into `dist/islands.js` for island hydration. Both are single IIFEs.

Both target recent browsers (Chrome 120+, Firefox 121+, Safari 17+).

## Client Code

The browser code is split in two:

`src/client/site.ts` boots document-level progressive enhancement.

`src/client/islands.ts` hydrates explicit islands.

The progressive enhancement layer still handles:

running header updates,

scroll-linked weight shift,

footnote reveals,

page arrival fade.

The page should still work without it.

## Dev Server

`make watch` starts a dev server on port 3000 through `src/build/dev.ts`. It serves `dist/`, watches `content/` and `src/` with `chokidar`, rebuilds on change, and pushes a reload over WebSocket.

## What Not To Change Casually

Do not reintroduce arbitrary MDX imports.

Do not hydrate the full page when only a small component needs state.

Do not let the global progressive enhancement code mutate island-owned DOM.

Do not change output paths casually. The site still depends on stable static URLs.
