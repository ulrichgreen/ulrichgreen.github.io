# Project Guidelines

## Architecture

- This repository is a static site built with GNU Make plus small TypeScript modules under `src/`. Treat `src/`, `content/`, and `test/` as the source of truth when docs and implementation diverge.
- Content source lives in `content/` and `content/writing/`. Generated output lives in `dist/`; do not edit generated files directly.
- The prose build pipeline is fixed: `src/build/frontmatter.ts` parses YAML frontmatter, `src/build/md2html.ts` turns markdown into HTML, and `src/build/template.ts` selects the TSX layout and renders the final page.
- TSX templates in `src/templates/*.tsx` are rendered at build time through the custom runtime in `src/runtime/jsx-runtime.ts`, `src/runtime/load-jsx.ts`, and `src/runtime/render-html.ts`. Preserve that architecture; do not introduce React, client-side hydration, or a heavier framework unless explicitly requested.
- TypeScript interfaces in `src/types/content.ts` define the content model and layout props that flow through the pipeline. Keep those types in sync with the templates and build scripts.
- `section: writing` routes content through `src/templates/article.tsx`; other pages use `src/templates/base.tsx`. `src/build/index.ts` builds the home page from `content/writing/*.md` files with valid `published` dates.

## Build And Test

- Install dependencies with `pnpm install`.
- Run `make build` to generate the site into `dist/`. This runs the prose pipeline, bundles CSS with `lightningcss` via `src/build/css.ts`, and bundles client JS with `esbuild` via `src/build/client.ts`.
- Run `make watch` to start the local dev server with rebuilds and live reload.
- Run `npm test` after changes to templates, render scripts, planning docs, or typography/content files covered by the verifier scripts.
- Run `npm run typecheck` after changing TypeScript build, runtime, template, or test files.
- Prefer targeted verification when possible: renderer behavior is guarded by `test/verify-jsx-rendering.ts`, and docs/content expectations are guarded by the small TypeScript scripts in `test/`.

## Conventions

- Keep the site dependency-light and static-first. Prefer raw CSS, vanilla JS, and small TypeScript modules over new tooling.
- Preserve the stdin/stdout contract between build stages. The pipeline passes JSON between scripts; changing one stage's output shape requires coordinated changes downstream.
- Escaping is a hard rule: plain JSX strings must remain escaped. Only pass trusted HTML through the explicit `html(...)` wrapper used by the custom runtime.
- Writing articles should keep valid YAML frontmatter and include the metadata the templates depend on, especially `title`, `section`, and `published` for dated essays.
- `src/styles/` and `typography.html` establish the typography system, including the 8px baseline rhythm and token naming. Preserve that direction unless the task is explicitly a redesign.
- Docs in `docs/` are short project documents with tests attached. Align changes to those docs with the implemented system, and update the docs when implementation changes.
