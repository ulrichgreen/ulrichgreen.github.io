# MDX + React Islands Plan

This document outlines the implementation plan for migrating the site from the current custom markdown plus TSX runtime to a custom React + MDX architecture with selective hydration.

## Progress

- [x] Phase 1: Install React and MDX foundations
- [x] Phase 2: Introduce a React server rendering path
- [x] Phase 3: Replace markdown rendering with MDX rendering
- [x] Phase 4: Add `.mdx` support to the build graph
- [x] Phase 5: Introduce a content components registry
- [x] Phase 6: Build the islands runtime
- [x] Phase 7: Split client code between global enhancements and islands
- [x] Phase 8: Rework metadata extraction
- [x] Phase 9: Update tests and docs

Completed on 2026-03-09.

The target is:

- MDX-authored pages and articles
- React components embedded directly in content
- Stateful React components when needed
- Static-first output
- Hydration only for explicit interactive islands

## Goals

- Preserve the site's static-first character.
- Support `.mdx` authoring for home, pages, and writing.
- Allow embedded presentational React components in MDX.
- Allow embedded stateful React components in MDX when explicitly marked for hydration.
- Avoid hydrating the full page when only a small interactive component is needed.
- Keep the authoring model understandable and maintainable.

## Non-Goals

- Do not turn the site into a client-heavy SPA.
- Do not hydrate the entire document by default.
- Do not keep two rendering systems long-term if React SSR replaces the custom runtime.
- Do not allow content files to become an uncontrolled import surface.

## Why The Current Architecture Cannot Stretch To This Cleanly

The current content pipeline is:

`content/*.md` -> `frontmatter.ts` -> `md2html.ts` -> `template.ts` -> `dist/*.html`

That pipeline converts markdown into an HTML string before layout rendering. Once content becomes an HTML string, embedded components can no longer exist as live renderable nodes. That is why MDX and stateful React components require an architectural change.

The new pipeline needs to become:

`content/*.mdx` -> frontmatter parse -> MDX compile/evaluate -> React render tree -> server render -> optional island hydration

## Target Architecture

The end state should look like this:

1. Content is authored in `.mdx`.
2. Frontmatter is parsed separately and remains the source of metadata.
3. MDX compiles to React components at build time.
4. Layouts render React trees with `react-dom/server`.
5. Explicit interactive components render as islands and hydrate on the client.
6. Non-interactive content remains static HTML.

## High-Level Design Decisions

### 1. Use React As The Only Render Runtime

Once MDX and stateful React are part of the content model, React should become the rendering runtime for both templates and content.

Implication:

- Retire the custom runtime centered on `src/runtime/jsx-runtime.ts`, `src/runtime/render-html.ts`, and `src/runtime/load-jsx.ts` after migration is complete.

### 2. Use Islands Instead Of Full-Page Hydration

Interactive components should hydrate individually. The rest of the page should stay static.

Implication:

- A page may contain React-generated HTML, but only explicitly interactive roots call `hydrateRoot()` on the client.

### 3. Keep Frontmatter Separate From Content Compilation

Continue using frontmatter as the metadata contract instead of mixing metadata concerns into MDX exports.

Implication:

- Existing metadata concepts such as `title`, `description`, `section`, `published`, and `revised` can remain stable.

### 4. Prefer A Controlled MDX Import Surface

Do not let content files import arbitrary paths at first. Instead, expose approved content components through a shared module.

Implication:

- Content remains expressive without making build behavior unpredictable.

## Phased Implementation Plan

## Phase 1: Install React And MDX Foundations

Status: Completed on 2026-03-09.

Goal:

Introduce the libraries and build-time primitives needed for React SSR and MDX compilation.

Changes:

1. Add `react` and `react-dom`.
2. Add `@mdx-js/mdx`.
3. Add any small supporting packages needed for MDX compilation if required by the chosen implementation.
4. Keep the current site working while the new pipeline is developed in parallel.

Expected result:

- The repo can compile and server-render React content at build time.

## Phase 2: Introduce A React Server Rendering Path

Status: Completed on 2026-03-09.

Goal:

Render layouts and content with React server rendering instead of the custom JSX runtime.

Changes:

1. Convert `src/templates/base.tsx` to a standard React component.
2. Convert `src/templates/article.tsx` to a standard React component.
3. Convert shared layout components under `src/components/` to standard React components.
4. Add a new build step that renders React elements to HTML through `react-dom/server`.
5. Keep output markup compatible with existing CSS where possible.

Expected result:

- Existing page structures can be rendered through React SSR without yet introducing MDX.

## Phase 3: Replace Markdown Rendering With MDX Rendering

Status: Completed on 2026-03-09.

Goal:

Make content files renderable as MDX instead of as pre-rendered HTML strings.

Changes:

1. Replace the role currently played by `src/build/md2html.ts`.
2. Build a new content stage that:
    - parses frontmatter
    - compiles or evaluates MDX
    - returns a renderable React content component
3. Update `src/build/template.ts` so it renders content as React children instead of injecting a trusted HTML string.
4. Update `src/build/index.ts` so the home page also follows the MDX path.

Expected result:

- A `.mdx` page can render static React-based content at build time.

## Phase 4: Add `.mdx` Support To The Build Graph

Status: Completed on 2026-03-09.

Goal:

Teach the build system to handle `.mdx` pages and articles.

Changes:

1. Update the `Makefile` to recognize `.mdx` files in `content/` and `content/writing/`.
2. Decide whether migration will be:
    - MDX-only, or
    - hybrid `.md` and `.mdx` during transition
3. Update any helper scripts or assumptions that currently look only for `.md`.
4. Preserve existing output paths so URLs do not change.

Recommended approach:

- Support both `.md` and `.mdx` during migration, then remove `.md` support once the repo is fully moved.

Expected result:

- Pages and articles can be authored as MDX without breaking the rest of the site.

## Phase 5: Introduce A Content Components Registry

Status: Completed on 2026-03-09.

Goal:

Create a stable, controlled way for MDX content to use approved React components.

Changes:

1. Add a module such as `src/content-components.ts`.
2. Export approved components intended for use inside MDX.
3. Start with components such as:
    - `ArticleList`
    - future presentational helpers
    - future interactive islands
4. Resolve MDX components against this shared registry.

Recommended convention:

- Treat this file as the authoring surface for content.
- Do not initially allow arbitrary imports from content files.

Expected result:

- You can write components in content without making the content layer depend on deep source paths.

## Phase 6: Build The Islands Runtime

Status: Completed on 2026-03-09.

Goal:

Allow individual stateful React components to hydrate on the client without hydrating the whole page.

Changes:

1. Define an island contract.
2. Render each interactive island on the server as HTML plus enough metadata to hydrate it on the client.
3. Serialize props safely into the output.
4. Build a client entrypoint that scans for island roots and hydrates them with `hydrateRoot()`.
5. Add a registry that maps island identifiers to React components.
6. Keep island ownership scoped so React only manages its own DOM subtree.

Expected result:

- A component such as `DemoWidget` can be authored inside an article and become interactive after hydration.

## Phase 7: Split Client Code Between Global Enhancements And Islands

Status: Completed on 2026-03-09.

Goal:

Prevent collisions between the existing document-level script and React-managed islands.

Changes:

1. Refactor `src/client/site.ts` into two concerns:
    - site-wide progressive enhancement
    - islands hydration bootstrap
2. Keep existing global behaviors such as:
    - running header updates
    - scroll-linked weight shift
    - footnote reveals
    - page arrival fade
3. Ensure those behaviors do not mutate DOM owned by hydrated React islands.

Expected result:

- Existing enhancements continue to work, and interactive React components do not fight imperative DOM code.

## Phase 8: Rework Metadata Extraction

Status: Completed on 2026-03-09.

Goal:

Keep metadata quality stable after switching to MDX.

Changes:

1. Keep the `<meta name="description">` path in the head component.
2. Rework description fallback logic so it is MDX-aware instead of relying on plain markdown-only assumptions.
3. Prefer explicit `description` frontmatter for articles.
4. Use automatic fallback only when safe and predictable.

Recommended rule:

- Make `description` required for writing content once MDX is in place.

Expected result:

- Search and social metadata remain intentional instead of incidental.

## Phase 9: Update Tests And Docs

Status: Completed on 2026-03-09.

Goal:

Preserve confidence during and after the migration.

Changes:

1. Replace the current JSX runtime rendering tests with React SSR and MDX rendering tests.
2. Add tests for:
    - MDX page rendering
    - MDX article rendering
    - metadata propagation
    - island serialization
    - island hydration bootstrap behavior
3. Update `docs/ARCHITECTURE.md` once the new path is real.
4. Add authoring guidance for MDX content and interactive components.

Expected result:

- The new architecture is documented and verifiable.

## Proposed File-Level Migration Targets

These are the likely hot spots.

Files likely to be replaced or fundamentally rewritten:

- `src/build/md2html.ts`
- `src/build/template.ts`
- `src/build/index.ts`
- `src/runtime/jsx-runtime.ts`
- `src/runtime/render-html.ts`
- `src/runtime/load-jsx.ts`

Files likely to be adapted rather than replaced:

- `src/build/frontmatter.ts`
- `src/templates/base.tsx`
- `src/templates/article.tsx`
- `src/components/site-head.tsx`
- `src/components/running-header.tsx`
- `src/components/article-header.tsx`
- `src/client/site.ts`
- `src/types/content.ts`
- `Makefile`

New files likely to be introduced:

- React SSR build/render helper
- MDX compile/evaluate helper
- content components registry
- islands registry
- islands client bootstrap
- authoring guidance doc

## Recommended Directory Shape

One workable target shape is:

```text
src/
  build/
    frontmatter.ts
    render-react-page.ts
    compile-mdx.ts
    build-content.ts
  client/
    site.ts
    islands.ts
  components/
    ...shared presentational components
  islands/
    ...interactive hydratable components
  templates/
    base.tsx
    article.tsx
  content-components.ts
```

This keeps a clean distinction between shared server-rendered UI and explicitly interactive components.

## Suggested Authoring Model

For content authorship, the model should be:

1. Frontmatter stays at the top.
2. Body is MDX.
3. Approved content components are available in MDX.
4. Interactive components are allowed, but should be used deliberately.

Examples of intended usage:

- Home page can include `ArticleList`.
- Essays can include a stateful `DemoWidget`.
- Most prose stays plain text and markdown-like syntax.

## Suggested Execution Order

Implement in this order:

1. Add React and MDX dependencies.
2. Get one existing layout rendering via React SSR.
3. Get one non-interactive MDX page rendering through the new pipeline.
4. Add `.mdx` support to the build.
5. Add a content components registry and support `ArticleList`.
6. Add the islands runtime and hydrate one sample interactive component.
7. Migrate article pages to MDX.
8. Remove the old custom runtime once parity is reached.
9. Update tests and docs last as the architecture settles.

This order gives a working vertical slice early and avoids a risky all-at-once rewrite.

## Risks And Tradeoffs

### Main Risk

The hard part is not MDX compilation. The hard part is defining a clean hydration boundary so interactive islands remain predictable and lightweight.

### Key Tradeoff

This approach buys long-term authoring flexibility, but it gives up some of the conceptual minimalism of the current custom runtime.

### Maintenance Tradeoff

Owning a custom React + MDX islands stack means more maintenance than the current site, but less than hydrating an entire React app for every page.

## Recommended Rules Once Implemented

1. Hydrate only explicit islands.
2. Require explicit `description` frontmatter for articles.
3. Keep content imports constrained to approved modules.
4. Avoid putting purely presentational prose into interactive components.
5. Keep document-level imperative scripts away from island-owned DOM.

## Definition Of Done

This migration is complete when:

1. The home page can be authored as MDX.
2. Articles can be authored as MDX.
3. A component like `ArticleList` can be dropped into MDX content.
4. A stateful React component can be dropped into MDX content and hydrated as an island.
5. The rest of the page still ships as static HTML.
6. Metadata still renders correctly.
7. The old custom runtime is no longer needed.
8. The new architecture is documented and tested.
