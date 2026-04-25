# Tooling

This document covers the current tools and dependencies that make the site work.

It is intentionally more specific than `architecture.md`. The architecture document describes the durable shape of the system. This one explains the current tool choices, why they were made, and how each choice supports that shape.

The short version is simple: the tooling exists to keep the site static-first, typed, and understandable.

## Core Posture

Before the package list, a few constraints explain most of the choices:

- build to static files rather than render pages at request time
- keep the authoring model close to plain documents
- use typed build code instead of opaque configuration stacks
- ship only a small amount of JavaScript to the browser
- prefer focused tools over large frameworks

If a dependency stops serving those constraints, it is replaceable.

## Platform and Workflow

### Node.js

- **Why it was chosen:** it is a practical runtime for a small custom build pipeline, with good file-system access and a large ecosystem for content and build tooling.
- **How it fits the architecture:** the site build, dev server, validation scripts, and asset pipeline all run as straightforward Node programs instead of being hidden behind a framework CLI.

### pnpm

- **Why it was chosen:** it keeps dependency management and project scripts simple without adding another layer of build abstraction.
- **How it fits the architecture:** `pnpm` is the entry point for the build, dev, typecheck, test, and verify workflows, so the whole toolchain stays discoverable from `package.json`.

### TypeScript

- **Why it was chosen:** the build pipeline and render layer benefit from explicit contracts, especially around frontmatter, content metadata, render context, and generated artifacts.
- **How it fits the architecture:** TypeScript is the language for the custom build system, template layer, client entry points, and tests, which keeps the content pipeline legible as it grows.

### tsx

- **Why it was chosen:** it lets the repository run TypeScript files directly during development and CI without adding a separate compile step for build scripts.
- **How it fits the architecture:** the build, dev server, tests, and verification scripts stay as small executable TypeScript programs rather than being split between source files and generated script wrappers.

## Rendering and UI

### preact

- **Why it was chosen:** it provides a small component model for shared templates and interactive islands without pulling the site toward full-app complexity.
- **How it fits the architecture:** Preact powers the shared TSX layer used by page templates, content components, and explicit client islands while preserving the site’s static-first posture.

### preact-render-to-string

- **Why it was chosen:** the site needs server-side rendering at build time, but only for generating static markup.
- **How it fits the architecture:** it renders templates and MDX content into final HTML during the build, which keeps page generation server-side and avoids runtime page rendering.

## Content Authoring and Transformation

### @mdx-js/mdx

- **Why it was chosen:** MDX allows prose to stay the default while still permitting a small, curated component surface when a document genuinely needs one.
- **How it fits the architecture:** it turns `.mdx` source files into build-time component trees that can be rendered through the same template system as the rest of the site.

### gray-matter

- **Why it was chosen:** frontmatter needs to stay easy to author and easy to parse.
- **How it fits the architecture:** it separates YAML metadata from the MDX body so the build can validate metadata early and treat content files as structured documents.

### zod

- **Why it was chosen:** the frontmatter contract should fail clearly when content is malformed.
- **How it fits the architecture:** it validates content metadata before compilation, which keeps the content model explicit and prevents invalid pages from moving deeper into the pipeline.

### remark-gfm

- **Why it was chosen:** articles benefit from familiar GitHub-flavored markdown features such as tables, task lists, and strikethrough.
- **How it fits the architecture:** it expands the prose authoring surface without changing the core document-first model.

### rehype-slug

- **Why it was chosen:** headings need stable IDs for linking and navigation.
- **How it fits the architecture:** it adds predictable heading anchors during content compilation so rendered pages can support direct links and heading enhancements.

### rehype-autolink-headings

- **Why it was chosen:** linked headings are useful on article pages without requiring authors to hand-maintain anchor markup.
- **How it fits the architecture:** it keeps heading-link behavior in the build pipeline instead of pushing it onto content authors or client-side scripts.

### rehype-pretty-code

- **Why it was chosen:** code blocks need a consistent, readable presentation at build time.
- **How it fits the architecture:** it turns fenced code blocks into styled static HTML, so syntax highlighting is part of the generated page rather than a browser-time feature.

### shiki

- **Why it was chosen:** syntax highlighting should be accurate and themeable while still happening during the build.
- **How it fits the architecture:** it provides the syntax-highlighting engine used by the MDX pipeline, which keeps code presentation in the static output.

## Asset Pipeline

### lightningcss

- **Why it was chosen:** the site wants one compiled stylesheet with modern CSS processing and minimal ceremony.
- **How it fits the architecture:** it bundles and minifies the layered CSS source in `src/styles/` into the single stylesheet the built site ships.

CSS modules use the same toolchain. Component files import `*.module.css` directly; `src/build/register-css-modules.ts` hooks Node's module resolver during build-time execution and points those imports at tiny generated modules in the system temp directory. The final stylesheet still comes from `src/styles/css-modules.ts`, which compiles all component CSS modules and appends their CSS to the site stylesheet.

That split is intentionally narrow: TSX gets normal CSS-module class maps, while the browser still receives one static CSS file. If this can become simpler with platform or tooling support later, it should.

### esbuild

- **Why it was chosen:** browser bundles should be fast to build and easy to understand.
- **How it fits the architecture:** it produces the two small client entry points: one for document-level enhancement and one for islands.

### sharp

- **Why it was chosen:** source images need to be converted to modern formats (AVIF, WebP) and resized at build time to avoid shipping oversized assets.
- **How it fits the architecture:** it processes raster images in `src/images/` into optimised variants that the `<Picture>` component can reference, keeping image optimisation in the static build rather than relying on a CDN or manual conversion.

## Development Server

### chokidar

- **Why it was chosen:** the custom dev server needs reliable file watching without handing the whole project over to a larger framework.
- **How it fits the architecture:** it watches `content/` and `src/`, then triggers targeted rebuilds for content, styles, client code, or the full site.

### ws

- **Why it was chosen:** local development benefits from automatic reloads, but the implementation should stay small.
- **How it fits the architecture:** it provides the WebSocket connection used by the dev server to trigger page reloads after rebuilds.

## Type Support

### @types/node

- **Why it was chosen:** the repository uses Node APIs heavily in the build and test pipeline.
- **How it fits the architecture:** it gives TypeScript accurate types for the custom Node-based tooling that drives the site.

### @types/ws

- **Why it was chosen:** the dev server uses `ws`, and the TypeScript code should be typed all the way through.
- **How it fits the architecture:** it keeps the live-reload server code explicit and type-safe.

## How the Pieces Fit Together

At a high level, the toolchain breaks down like this:

- **authoring:** MDX + YAML frontmatter
- **validation:** Zod + TypeScript
- **rendering:** Preact + build-time string rendering
- **content transforms:** remark/rehype plugins + Shiki
- **assets:** Lightning CSS + esbuild + sharp
- **local development:** chokidar + ws
- **execution:** Node.js + pnpm + tsx
- **maintenance diagnostics:** `pnpm run audit-content`

That combination supports the same architectural direction described in `architecture.md`: files in, static site out, with selective interactivity and explicit build-time guardrails.
