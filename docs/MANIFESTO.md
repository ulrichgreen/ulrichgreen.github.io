# Manifesto

This is a personal site built around writing. Not a portfolio, not a product, not an engagement machine. The writing is the center of gravity and everything else is in service of it.

The site should feel authored. Taste shows through typography, spacing, and structure — not decoration. Reading should be the easiest thing it does.

## What It Optimizes For

Reading first. The page should render meaning before the browser runs any JavaScript.

Legibility end-to-end. The build should remain understandable by one person in one sitting. If a layer can't be explained plainly, it hasn't earned its place.

Authored HTML. `view source` should still mean something. The output should be clean enough that a person can read it.

Small surface. Every dependency carries a cost. Every file, every interaction, every abstraction must justify itself. Prefer removing over adding.

## What It Refuses

No full-page hydration. React renders the document at build time. Interactive behavior lives in explicit islands only.

No arbitrary MDX imports. Content components are approved through `src/content-components.tsx`. MDX is a content format, not an application surface.

No analytics creep, tracking pixels, or third-party widgets.

No client-side routing. Pages are static HTML. Navigation is a link.

No fake complexity added to look modern.

No planning docs detached from the code. The docs folder is a set of constraints on the codebase, not aspirational literature.

## What The Code Must Keep True

The build pipeline runs: content → frontmatter → MDX → React SSR → HTML. That sequence must remain readable.

TypeScript covers the risky parts — the content model, the rendering path, the template contracts. It is not there to turn this into an app.

The progressive enhancement layer handles document-level behavior. It must not touch island-owned DOM.

CSS is layered, custom, and designed. No CSS framework.

The test suite verifies docs as well as code. Both must stay in sync.

## What Success Looks Like

The writing is clearly the center.

The site loads quickly and works without JavaScript.

A new reader of the source can understand the whole project: where content lives, how the build works, what the browser receives.

The code still reads like one person's considered project, not a pile of default decisions accumulated without intention.
