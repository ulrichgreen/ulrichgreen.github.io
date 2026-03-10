# Structure

This repo has a simple split.

## Where Things Live

`content/`

The MDX source for pages and essays.

`src/`

All code that produces the site.

`src/build/` contains command-line build steps and render helpers.

`src/content-components.tsx` is the approved component surface for MDX authors.

`src/templates/` contains page-level templates.

`src/components/` contains reusable TSX pieces.

`src/client/` contains browser-only code.

`src/islands/` contains explicitly hydratable React components and the island wrapper.

`src/styles/` contains the stylesheet partials.

`src/types/` contains TypeScript interfaces for the content model and layout props.

`docs/`

Short project documents. Each file should answer one question and stop.

`test/`

Small verifiers for rendering, docs, typography, and content expectations.

`dist/`

Generated output. Never edit it by hand.

## Typical Changes

Adding an essay means editing `content/writing/` and using `.mdx`.

Changing the page chrome usually means `src/templates/` or `src/components/`.

Changing the build means `src/build/`.

Changing the look means `src/styles/`.

Changing a progressive enhancement means `src/client/`.

Adding a new content-safe component means editing `src/content-components.tsx`.

Adding a new interactive island means editing `src/islands/` and `src/client/islands.ts`.

Changing the content model or layout interfaces means `src/types/content.ts`.

## Why It Is Shaped This Way

The repo now looks closer to a normal React project because MDX and islands are easiest to express that way. The difference is that the output is still static HTML and only explicit islands pay the hydration cost.

That is the trade: a more capable authoring model without turning the site into a client-heavy app.
