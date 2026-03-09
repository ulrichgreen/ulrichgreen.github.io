# Alternatives

This document explores alternative approaches to the current architecture. Not because the current architecture is broken, but because understanding the trade-offs sharpens the decisions already made and points toward directions worth considering.

## The Question Behind Every Alternative

The manifesto says the build is part of the project. That means the architecture is not an implementation detail. It is a design decision. Every alternative should be measured against the same question: does this make the site more authored, more understandable, and more honest about what it is doing?

## Astro Instead Of Custom React SSR

Astro is the most natural alternative to consider because it was built for exactly this use case.

### What It Would Change

Astro handles MDX natively. It renders to static HTML by default. It has islands architecture built in with `client:visible`, `client:idle`, and `client:load` directives. It generates zero client JavaScript unless you ask for it. It supports React components for islands. It handles CSS scoping, image optimization, content collections with typed frontmatter, sitemap generation, and RSS feeds through official integrations.

The Makefile, the custom build pipeline, the `compile-mdx.ts` step, the `render-react-page.tsx` orchestration, the manual island hydration bootstrap, and most of `src/build/` would be replaced by Astro's built-in machinery.

### What You Would Gain

Less custom code to maintain. Built-in lazy hydration strategies for islands. Typed content collections that replace the manual frontmatter parsing and index building. A mature dev server with hot module replacement. Image optimization without building a pipeline. View transitions built into the framework.

### What You Would Lose

The build would no longer be something you can explain in a conversation. Astro is well-designed, but it is still a framework with its own abstractions, its own routing conventions, and its own plugin system. When something breaks, you debug Astro's internals instead of your own code.

The manifesto says the build should be readable. A custom pipeline with Make, a few TypeScript scripts, and explicit React rendering achieves that. Astro hides the same operations behind a framework boundary.

### Verdict

Astro is the right choice for someone who wants the same output characteristics but does not want to own the build. For this site, the build is part of the statement. The current approach is harder to maintain but more honest. Worth revisiting if the maintenance cost grows faster than the value of understanding.

## Eleventy Plus WebC

Eleventy is the other obvious alternative. It has been the default recommendation for hand-authored static sites for years.

### What It Would Change

Eleventy uses template languages (Nunjucks, Liquid, or WebC) instead of React for layouts. WebC is its native component model: single-file components that compile to HTML with scoped CSS and optional client JavaScript. MDX support exists through plugins but is not as seamless as Astro's.

The React dependency would be removed entirely. Templates would become WebC files. Islands would use WebC's `webc:keep` and `<script webc:bucket>` patterns instead of React hydration.

### What You Would Gain

No React in the dependency tree at all. Smaller node_modules. WebC components are closer to raw HTML than JSX. The output is even more transparent. Eleventy's data cascade is powerful for content-driven sites.

### What You Would Lose

MDX authoring. Eleventy's content model is markdown with frontmatter, but embedded components in content require shortcodes or paired shortcodes rather than JSX syntax. The authoring experience is less fluid than writing `<ArticleList />` directly in MDX.

React familiarity. If you write React in your day job, maintaining a WebC-based site requires a context switch. If the goal is to use the site as a design laboratory for React patterns, Eleventy does not serve that.

### Verdict

Eleventy plus WebC is a better fit if the manifesto's stance on framework refusal is absolute. It is a worse fit if you value MDX authoring and want to experiment with React patterns in a controlled environment. The current architecture occupies a middle ground that the manifesto does not fully resolve.

## Native ES Modules Instead Of Bundled Client Code

The current client code is bundled by esbuild into IIFE format. Modern browsers support ES modules natively.

### What It Would Change

Replace the esbuild bundle step with direct `<script type="module">` tags. Ship `site.ts` and `islands.ts` as individual modules. Use `import` statements in the browser.

### What You Would Gain

Simpler debugging. The browser runs the same code the author wrote. Source maps become unnecessary for development. The build step for client code becomes optional or disappears entirely.

### What You Would Lose

Older browser support, though the current targets (Chrome 120+, Firefox 121+, Safari 17+) all support ES modules. Tree shaking and minification, though the client code is already small enough that the savings are negligible. The React dependency for islands still needs bundling because React does not ship as an ES module.

### Verdict

For `site.ts` and the progressive enhancement layer, native modules would work well and simplify the build. For `islands.ts`, the React dependency makes bundling necessary. A hybrid approach could work: ship the enhancement code as native modules and bundle only the island hydration code.

## CSS Layers For Cascade Control

CSS `@layer` gives explicit control over cascade priority without specificity hacks.

### What It Would Change

Wrap each CSS partial in a named layer: `@layer reset, tokens, base, layout, components, utilities`. Override order is determined by layer declaration, not by selector specificity or source order.

### What You Would Gain

Utilities can always override component styles without `!important` or artificially high specificity. The cascade becomes predictable and documented. Adding new style categories does not risk breaking existing ones.

### What You Would Lose

Nothing meaningful. All target browsers support `@layer`. The migration is mechanical.

### Verdict

This is a clean improvement with no downside. The current CSS is well-organized, but layers would make the organization enforceable by the browser.

## Container Queries For Island Layout

Islands are currently styled with global CSS. Container queries would let island styles respond to their container's size rather than the viewport.

### What It Would Change

Each `.island-root` could define a container context. Island CSS could use `@container` rules to adapt layout based on the available space rather than the viewport width.

### What You Would Gain

Islands that are portable. An island placed in a narrow sidebar and the same island placed in a full-width article body would adapt automatically without media query overrides.

### What You Would Lose

Nothing. Container queries are supported in all target browsers.

### Verdict

Worth adopting as the number of islands grows. For a single `DemoWidget`, the benefit is marginal. For a richer set of interactive components, it becomes important.

## Zod For Frontmatter Schema Validation

Currently, frontmatter is parsed by `gray-matter` and typed as a loose `PageMeta` with an index signature. Zod could enforce schemas at build time.

### What It Would Change

Define a Zod schema for each content type. Parse frontmatter through the schema in `build-content.ts`. Get specific error messages when a field is missing or malformed.

### What You Would Gain

Build-time validation that catches errors before they become invisible bugs in the output. Narrower types that eliminate the `[key: string]: unknown` escape hatch. Better editor autocompletion for frontmatter fields.

### What You Would Lose

A new dependency. Zod is well-maintained and small, but it is another thing in the tree. Alternatively, a hand-written validation function could achieve the same result with zero dependencies, which may be more aligned with the manifesto.

### Verdict

The validation is clearly needed. Whether to use Zod or a hand-written function depends on how much you value the manifesto's dependency austerity versus Zod's ergonomics. Either way, frontmatter validation is a high-value improvement.

## MDX Component Authoring With Hot Boundaries

The current dev experience requires a full page rebuild and browser reload on every change. A more sophisticated approach would use esbuild's incremental compilation or a persistent MDX compilation process to deliver sub-second updates.

### What It Would Change

Instead of spawning a new `tsx` process per page on every file save, a persistent build process would keep the MDX compiler warm and only recompile changed files. The dev server could inject the updated HTML fragment without a full reload.

### What You Would Gain

Faster feedback during writing. The time between saving an MDX file and seeing the result in the browser would drop from seconds to milliseconds.

### What You Would Lose

Build simplicity. The current model is: file changes, Make rebuilds, browser reloads. The hot boundary model requires state management in the build process and a protocol between the build and the browser. It is more complex even if it is faster.

### Verdict

The single-process build improvement described in IMPROVEMENTS.md is the better first step. Hot boundaries could follow once the build is consolidated into a single process.

## Summary

The alternatives reveal a spectrum. At one end, Astro and Eleventy offer more capability with less custom code but less visibility into how the build works. At the other end, native modules and CSS layers offer small improvements that deepen the current approach without adding abstraction.

The current architecture sits in an interesting middle ground: it uses React and MDX for expressive authoring, but it owns the build pipeline and keeps the output simple. The most productive direction is probably not to replace the architecture but to deepen it: add the browser primitives (View Transitions, Speculation Rules), improve the build (single process, content hashing, validation), and invest in the authoring experience (remark/rehype plugins, lazy hydration, reading time) while keeping the pipeline transparent.

The manifesto asks whether every dependency earns its place. The same question applies to every architectural alternative. Use the ones that make the site more honest about what it is doing. Skip the ones that only make it more capable.
