# Architecture

Static-first, one person's build. Content in as MDX, out as HTML. React renders at build time. The browser gets clean documents with a thin progressive enhancement layer and a handful of interactive islands where they've earned it.

## How It Builds

`pnpm build` produces everything in `dist/`. One TypeScript build entry reads the full content graph, validates YAML frontmatter, compiles MDX into React components, then renders every page with `renderToStaticMarkup`. The output is plain HTML — no client framework needed to read a page.

Templates and shared components are standard React TSX. MDX content renders through the same tree, but only components exposed through `src/content-components.tsx` are available to authors. That boundary is deliberate.

`layout: article` in frontmatter routes a page through the article template by way of a small layout registry. Everything else gets the base layout. The `section` field is purely presentational — it controls the header breadcrumb and is inferred from the content directory path when not set explicitly. Islands — the only parts that hydrate — use `hydrateRoot` through a dedicated client entry. The rest of the page stays static.

The browser receives two separate scripts. `site.js` handles progressive enhancement — scroll effects, footnote reveals, and other document-level behavior. `islands.js` bundles React and hydrates interactive islands; it loads only on pages that contain islands. Islands support four hydration strategies — `load` (immediate), `visible` (IntersectionObserver), `idle` (requestIdleCallback), and `interaction` (on first user event) — configured via the `hydrate` prop in the island wrapper.

`pnpm build` ends with a small performance budget report for total HTML, CSS, JS, and font weight in `dist/`, warning as the site nears the thresholds and failing once it crosses them. `pnpm test` runs two layers of checks: co-located unit tests for the content pipeline and standalone verifiers for the rendered output. The current verifier set checks JSX rendering, accessibility, internal links, the Atom feed, and the generated SEO artifacts (`robots.txt`, `sitemap.xml`, `_headers`, `og-image.svg`). CI runs `typecheck → build → test` on pull requests and before deployment.

## The Stack

Every tool was chosen on purpose. Package scripts provide the command surface. TypeScript guards the seams — the content model, the rendering path, the template contracts. React and `react-dom/server` render everything at build time. MDX with `gray-matter` keeps content expressive without runtime compilation. `lightningcss` bundles the CSS. `esbuild` bundles the browser code. `chokidar` and `ws` power the dev server. That's it.

No full-page hydration. No client-side routing. No CSS framework. No tool added because it's popular.

## Where Things Live

`content/` holds MDX source — pages, essays, everything the reader sees. `src/` holds all code that builds the site: build steps in `src/build/`, templates in `src/templates/`, shared pieces in `src/components/`, browser code in `src/client/`, islands in `src/islands/`, styles in `src/styles/`, shared React context in `src/context/`, and type definitions in `src/types/`. `docs/` is these files. `dist/` is generated output — never edited by hand.

The component gate for MDX authors is `src/content-components.tsx`. Only what's exposed there is available in content. No `import` or `export` inside MDX files.

## Authoring Content

MDX is the content format. Frontmatter stays YAML, but it now passes through a typed validation step before the page enters the rest of the pipeline. The current author-facing frontmatter fields are `title`, `description`, `layout`, `section`, `published`, `revised`, `note`, `summary`, `series`, and `seriesOrder`. Set `layout: article` for essay-style pages; the default is the base layout, and article pages must include `published`.

Some metadata is computed during the build rather than authored by hand. `words` and `readingTime` are derived from the body content and fed into the article layout. `summary` is optional frontmatter that authors can provide; when `description` is absent, the build promotes `summary` into the page description. `section` remains presentational — it controls the header breadcrumb and is inferred from the content directory path when not set explicitly.

Series are opt-in. `series` names the sequence and `seriesOrder` gives the article's order inside it. When a page belongs to a series, the article footer renders the series navigation automatically.

Only approved components from `src/content-components.tsx` are available inside MDX: `ArticleList`, `Code`, `Hero`, and `DemoWidget`. `DemoWidget` is an island; the rest are static build-time components. Most prose should stay prose — components in content earn their place by being genuinely necessary.

Progressive enhancement handles document-level behavior such as scroll effects and footnote reveals. The fixed header itself stays static. Islands handle interactive state. The two stay separate.

## Direction

The CSS is handwritten, layered, and designed. The output HTML should be clean enough to read in `view source`. The build should stay small enough that one person can hold the whole pipeline in their head. If a layer can't be explained plainly, it hasn't earned its place.
