# Project Guidelines

## Architecture

- This repository is a static site built with small TypeScript modules under `src/`, MDX content under `content/`, and verification scripts under `test/`.
- The build pipeline starts at `src/build/build.ts` and coordinates content discovery, MDX compilation, static rendering, asset generation, and ancillary artifacts.
- `section: writing` content routes through `src/templates/article.tsx`; other pages use `src/templates/base.tsx`.
- Only components registered in `src/content-components.tsx` may be used from MDX.
- Interactive client code belongs in `src/islands/` and `src/client/`; do not hydrate the full page.
- Generated output lives in `dist/`; never edit generated files directly.

## Build And Test

- Install dependencies with `corepack pnpm install --frozen-lockfile`.
- Use `corepack pnpm run typecheck` after changing TypeScript files.
- Use `corepack pnpm run build` to regenerate the site into `dist/`.
- Use `corepack pnpm run test` after changing templates, rendering, build scripts, docs covered by tests, or typography/content expectations.
- Use `corepack pnpm run verify` for the full validation pass before finishing a non-trivial change.

## Conventions

- Keep the site dependency-light and static-first. Prefer raw CSS, vanilla JS, and small TypeScript modules over additional tooling.
- Preserve the typography and token system in `src/styles/` unless the task is explicitly a redesign.
- Keep valid YAML frontmatter in content files, especially `title`, `section`, and `published` for dated articles.
- Align docs in `docs/` with the implemented system when behavior changes.

## Copilot Workflow

- Start by consulting `AGENTS.md` and the relevant skill under `.github/skills/` for structured workflows.
- Use the reusable prompts under `.github/prompts/` for spec, plan, build, test, review, simplify, and ship flows.
- The imported `agent-skills` references are mirrored in `.github/copilot-references/` and vendored into the skill directories that cite them so the skills stay self-contained.
- The source repository's Claude session hook is adapted here as repository instructions plus `AGENTS.md`; do not expect repo-local Copilot hooks to run automatically.
