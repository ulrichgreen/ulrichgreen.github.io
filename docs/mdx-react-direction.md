# MDX + React Direction

The site is already close to the right shape: MDX for authored content, React for build-time rendering, and islands for the few places that need state. The next step is not a bigger framework. It is a tighter center of gravity.

The goal is a more focused MDX and React DX while staying static-first. Pages and articles should feel like the same thing built from the same parts, with fewer custom seams and clearer extension points.

## The Thesis

Treat every content file as a typed content module:

- MDX body
- validated frontmatter
- one selected layout
- computed fields added at build time

That moves the architecture away from "special cases for pages and articles" and toward "one content model with a few deliberate variants."

## What To Simplify

### 1. Collapse the build around one content graph

Today `make build` shells out to `src/build/page.ts` once per file. It works, but it keeps page creation spread across Make, `writing-index.ts`, and per-page rendering.

The simpler shape is a single-process build entry in TypeScript:

- Make stays as the thin shell
- one `src/build/site.ts` process reads all MDX files
- the writing index is computed once
- pages and articles are rendered in one pass

That keeps the current static output while reducing startup overhead and making the build easier to extend.

### 2. Replace ad hoc frontmatter handling with a typed schema

`frontmatter.ts`, `build-content.ts`, and `src/types/content.ts` currently split responsibility for validation, defaults, and inferred fields.

Add `zod` at the front of the pipeline so frontmatter parsing also becomes frontmatter validation:

- fail early with file-specific errors
- encode which fields belong to which layout
- support defaults in one place
- keep computed fields distinct from authored fields

That would let `layout`, `published`, `description`, and future fields like `draft` or `canonical` become explicit instead of loosely shaped.

### 3. Replace template branching with a layout registry

Right now the architecture knows about `article` versus "everything else" in several places.

A layout registry would make the system easier to read:

- `base`
- `article`
- future variants like `note`, `project`, or `link`

Each layout should declare:

- which React template renders it
- which frontmatter fields it requires
- which computed fields it receives

That makes new page types cheaper without creating new pipelines.

### 4. Move MDX authoring features into a deliberate plugin preset

The current MDX pipeline is intentionally bare. That keeps the build small, but it also means authoring ergonomics depend on custom code and restraint.

A focused plugin preset would be a better center:

- `remark-gfm` for tables, task lists, and standard GitHub-flavored markdown
- `remark-directive` for callouts, asides, and other authored blocks without JSX noise
- `rehype-slug` plus `rehype-autolink-headings` for deep-linkable headings
- `rehype-pretty-code` with `shiki` for build-time syntax highlighting

These keep the output static, improve the MDX DX, and reduce pressure to invent custom syntax in local code.

## Pages And Articles Should Be The Same Primitive

The most important simplification is conceptual:

- a page is an MDX file with typed frontmatter and a layout
- an article is an MDX file with typed frontmatter and a layout

The difference should live in layout rules and collection queries, not in separate authoring models.

That unlocks more flexibility:

- article-like project pages
- notes that share article metadata but use a lighter template
- landing pages that can query article metadata without hand wiring
- richer indexes driven by one content manifest

The current `writing-index.ts` is already pointing in this direction. The next step is to make the content manifest the center, then let pages and articles read from it.

## Synergies From A Few Carefully Chosen Tools

The right additions are small tools that replace custom seams:

### `zod`

Use it for frontmatter validation and layout-specific schemas. This replaces loose string-based checks with one executable contract.

### `remark-gfm` and `remark-directive`

Use them to make authoring richer without pushing writers into JSX for simple layout semantics.

### `rehype-slug` and `rehype-autolink-headings`

Use them to make headings addressable without hand-authored IDs.

### `rehype-pretty-code` and `shiki`

Use them only for build-time syntax highlighting. That keeps code blocks expressive without adding client runtime cost.

## What Should Stay Exactly The Same

The simplification target is the architecture, not the philosophy:

- static-first output
- React only where React improves the authoring or island story
- `renderToStaticMarkup` for page HTML
- `content-components.tsx` as the MDX component gate
- `hydrateRoot` only for explicit islands
- No full-page hydration
- raw CSS and a small browser layer

This should become more focused, not more abstract.

## Recommended Direction

If the goal is a razor-focused MDX and React architecture, the best path is:

1. keep the static-first pipeline
2. add `zod` for schema validation
3. add a small MDX plugin preset
4. introduce a layout registry
5. move the build to one TypeScript entry that owns the content graph

That gives the project more flexibility for creating pages and articles while also removing custom logic from the places where it currently leaks through.

## Migration Order

1. Add schema validation with `zod` in `frontmatter.ts`
2. Introduce a layout registry so templates and metadata rules live together
3. Replace the per-page build orchestration with a single-process build entry
4. Add the MDX plugin preset: `remark-gfm`, `remark-directive`, `rehype-slug`, `rehype-autolink-headings`
5. Add `rehype-pretty-code` with `shiki` only when syntax highlighting is needed

That sequence preserves the current site, improves the DX incrementally, and keeps the architecture easy to explain.
