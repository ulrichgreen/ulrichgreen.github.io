# Stack

These are the tools that matter.

## Make

Make is the top-level build graph. It is still the clearest way to say what produces what.

## TypeScript

TypeScript now covers the build, templates, client code, and tests.

The reason is simple: the risky parts of this repo are the content model, the rendering path, and the file boundaries. Types help there.

## React And react-dom/server

React is the single rendering runtime for templates, MDX content, and explicit interactive islands.

`react-dom/server` renders the static document at build time.

## MDX And gray-matter

`gray-matter` parses frontmatter.

`@mdx-js/mdx` turns MDX into React components at build time.

That keeps content authoring expressive without moving layout concerns into string manipulation.

## lightningcss And esbuild

`lightningcss` bundles and minifies the stylesheet.

`esbuild` handles the browser bundles for progressive enhancement and island hydration.

That keeps the toolchain short.

## chokidar And ws

The dev server watches files, rebuilds, and reloads the browser. Nothing more.

## What This Stack Avoids

No full-page hydration.

No client-side routing.

No arbitrary imports from MDX content.

No CSS framework.

No tool added just because other projects use it.
