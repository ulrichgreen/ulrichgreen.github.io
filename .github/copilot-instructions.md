# Project Guidelines

## Architecture

- This repository is a static site built with GNU Make plus small TypeScript modules under `src/`. Treat `src/`, `content/`, and `test/` as the source of truth when docs and implementation diverge.
- Content source lives in `content/` and `content/writing/` as `.mdx` files. Generated output lives in `dist/`; do not edit generated files directly.
- The prose build pipeline is: `src/build/frontmatter.ts` parses YAML frontmatter, `src/build/compile-mdx.ts` evaluates MDX into a React component, `src/build/build-content.ts` resolves metadata, and `src/build/render-react-page.tsx` renders the final page with `renderToStaticMarkup`. The CLI entry is `src/build/page.ts`.
- TSX templates in `src/templates/*.tsx` are standard React components rendered at build time through `react-dom/server`. Do not hydrate the full page; only explicit islands get client-side React.
- TypeScript interfaces in `src/types/content.ts` define the content model and layout props that flow through the pipeline. Keep those types in sync with the templates and build scripts.
- `section: writing` routes content through `src/templates/article.tsx`; other pages use `src/templates/base.tsx`. `src/build/writing-index.ts` scans `content/writing/*.mdx` for the article index.
- Only components registered in `src/content-components.tsx` are available inside MDX content. Do not allow arbitrary imports from MDX files.
- Interactive islands live in `src/islands/` and hydrate on the client via `src/client/islands.ts`. The island wrapper is `src/islands/island.tsx`.

## Build And Test

- Install dependencies with `pnpm install`.
- Run `make build` to generate the site into `dist/`. This runs the MDX pipeline, bundles CSS with `lightningcss` via `src/build/css.ts`, and bundles client JS with `esbuild` via `src/build/client.ts`.
- Run `make watch` to start the local dev server with rebuilds and live reload.
- Run `npm test` after changes to templates, render scripts, planning docs, or typography/content files covered by the verifier scripts.
- Run `npm run typecheck` after changing TypeScript build, runtime, template, or test files.
- Prefer targeted verification when possible: renderer behavior is guarded by `test/verify-jsx-rendering.ts`, and docs/content expectations are guarded by the small TypeScript scripts in `test/`.

## Conventions

- Keep the site dependency-light and static-first. Prefer raw CSS, vanilla JS, and small TypeScript modules over new tooling.
- Do not reintroduce arbitrary MDX imports. All content components must go through `src/content-components.tsx`.
- Do not hydrate the full page. Only explicit islands should pay the hydration cost.
- Do not let the global progressive enhancement code in `src/client/enhancements.ts` mutate island-owned DOM.
- Writing articles should keep valid YAML frontmatter and include the metadata the templates depend on, especially `title`, `section`, and `published` for dated essays.
- `src/styles/` and `typography.html` establish the typography system, including the 8px baseline rhythm and token naming. Preserve that direction unless the task is explicitly a redesign.
- Docs in `docs/` are short project documents with tests attached. Align changes to those docs with the implemented system, and update the docs when implementation changes.
