# Architecture

Static-first, one person's build. Content in as MDX, out as HTML. React renders at build time. The browser gets clean documents with a thin progressive enhancement layer and a handful of interactive islands where they've earned it.

## How It Builds

`make build` produces everything in `dist/`. One TypeScript build entry reads the full content graph, validates YAML frontmatter, compiles MDX into React components, then renders every page with `renderToStaticMarkup`. The output is plain HTML — no client framework needed to read a page.

Templates and shared components are standard React TSX. MDX content renders through the same tree, but only components exposed through `src/content-components.tsx` are available to authors. That boundary is deliberate.

`layout: article` in frontmatter routes a page through the article template by way of a small layout registry. Everything else gets the base layout. The `section` field is purely presentational — it controls the running header breadcrumb and is inferred from the content directory path when not set explicitly. Islands — the only parts that hydrate — use `hydrateRoot` through a dedicated client entry. The rest of the page stays static.

## The Stack

Every tool was chosen on purpose. Make runs the build graph. TypeScript guards the seams — the content model, the rendering path, the template contracts. React and `react-dom/server` render everything at build time. MDX with `gray-matter` keeps content expressive without runtime compilation. `lightningcss` bundles the CSS. `esbuild` bundles the browser code. `chokidar` and `ws` power the dev server. That's it.

No full-page hydration. No client-side routing. No CSS framework. No tool added because it's popular.

## Where Things Live

`content/` holds MDX source — pages, essays, everything the reader sees. `src/` holds all code that builds the site: build steps in `src/build/`, templates in `src/templates/`, shared pieces in `src/components/`, browser code in `src/client/`, islands in `src/islands/`, styles in `src/styles/`, and type definitions in `src/types/`. `docs/` is these files. `dist/` is generated output — never edited by hand.

The component gate for MDX authors is `src/content-components.tsx`. Only what's exposed there is available in content. No `import` or `export` inside MDX files.

## Authoring Content

MDX is the content format. Frontmatter stays YAML, but it now passes through a typed validation step before the page enters the rest of the pipeline. Every page shares the same frontmatter schema — `title`, `description`, `layout`, `published`, `revised`, `words`, `note`, `print`. Set `layout: article` for essay-style pages; the default is the base layout. Files and folders dictate URLs. Most prose should stay prose — components in content earn their place by being genuinely necessary.

Progressive enhancement handles document-level behavior: running headers, scroll effects, footnote reveals. Islands handle interactive state. The two stay separate.

## Direction

The CSS is handwritten, layered, and designed. The output HTML should be clean enough to read in `view source`. The build should stay small enough that one person can hold the whole pipeline in their head. If a layer can't be explained plainly, it hasn't earned its place.
