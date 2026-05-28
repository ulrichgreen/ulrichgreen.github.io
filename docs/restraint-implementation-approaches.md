# Restraint Implementation Approaches

This document expands seven alternative approaches for making the site simpler, more restrained, and more elegant without changing its center of gravity: authored text files, static output, inspectable HTML, and a small amount of intentional tooling.

These are not roadmap commitments. They are implementation outlines for ideas that could replace current machinery if they prove clearer than what exists today.

## Selection Criteria

Move an approach forward only when it would do all of the following:

- make the authored source easier to understand
- remove at least as much machinery as it adds
- keep the static-first architecture intact
- keep content closer to documents than applications
- make future changes easier to review and explain

## 1. Content Archetypes Instead of Scaffolding Logic

### Intent

Replace command-driven content creation with visible, copyable source templates. The authoring model should feel like working with documents, not operating a local content management CLI.

### Current Shape

The repository currently exposes creation commands through `package.json`:

- `create-article`
- `create-page`

Those commands call `src/build/tools/create-content.ts`, which:

- converts a title into a slug
- writes frontmatter
- inserts the current date for articles
- optionally accepts series metadata
- prevents overwriting an existing file

### Proposed Approach

Create a small `docs/archetypes/` folder with plain `.mdx` examples:

- `article.mdx`
- `page.mdx`
- `series-article.mdx`

Each archetype should show the smallest complete source file for that content type. Keep placeholders obvious and human-readable.

The writing guide can then point authors to the archetypes instead of documenting CLI behavior.

### Implementation Outline

1. Add archetype files that mirror the valid frontmatter contract.
2. Keep the examples intentionally minimal.
3. Update `docs/writing-guide.md` to describe copying an archetype as the preferred starting point.
4. After authors have moved to archetypes, apply the implementation removals listed below.
5. Keep validation in the build pipeline as the safety net for malformed frontmatter, duplicate slugs, and invalid series ordering.

### What This Can Remove

Implementation:

- `src/build/tools/create-content.ts`
- `create-article` script from `package.json`
- `create-page` script from `package.json`

Docs:

- Any future explanation of command syntax for creating content
- Any CLI-specific authoring guidance that duplicates the frontmatter documentation

### Trade-Offs

- Authors must manually name files and set dates.
- Duplicate-file protection moves from creation time to ordinary filesystem behavior plus build validation.
- Slug generation becomes a human convention instead of executable logic.

Those trade-offs fit this site if the archive remains small and personal.

## 2. Dead Selector Detection

### Intent

Keep the global CSS approach disciplined by detecting selectors that no longer match generated output. The goal is not to introduce a style framework; it is to keep the existing global stylesheet honest.

### Current Shape

The CSS system is intentionally global and layered:

- `src/styles/style.css` controls layer order
- `src/styles/tokens.css` defines the design language
- `src/styles/base.css` styles semantic elements
- `src/styles/components.css` contains named component class families
- `src/styles/MAPPING.md` records typography class mapping

Because styles are global, unused component selectors can survive after markup changes.

### Proposed Approach

Add a lightweight verification script that compares generated HTML in `dist/` against class selectors in the source CSS. Start with class selectors only; avoid parsing the entire CSS language.

The first version can be report-only if strict enforcement creates noise. It should become a failing test only once the false-positive list is small and intentional.

### Implementation Outline

1. Build the site before checking selectors.
2. Read generated `.html` files from `dist/`.
3. Collect class names used in rendered markup.
4. Read source CSS files under `src/styles/`.
5. Extract class selectors such as `.hero`, `.article-list__item`, and `.series-nav--compact`.
6. Ignore known dynamic classes and state classes, such as `is-open`, `is-visible`, or classes only added by client enhancement.
7. Report selectors that have no matching generated class.
8. Add the check to `test/run-tests.ts` only after the report is stable.

### What This Can Remove

Implementation:

- Orphaned class rules in `src/styles/components.css`
- Stale mapping entries in `src/styles/MAPPING.md`
- Component-specific CSS left behind after component deletion or markup simplification

Docs:

- Manual reminders to clean up CSS after component changes
- Some of the burden carried by `src/styles/MAPPING.md` if the generated report becomes the primary source of truth for selector usage

### Trade-Offs

- A simple selector extractor will miss complex CSS edge cases.
- Dynamic classes need an allowlist.
- The check should not discourage semantic classes that appear only on rare pages if those pages are generated in test output.

The check should stay humble: useful enough to catch residue, not ambitious enough to become a CSS analyzer.

## 3. Generated Project Maps Instead of More Hand-Maintained Docs

### Intent

Let the repository self-report its important surfaces so docs can stay short. This is a way to reduce doc drift without adding heavier documentation process.

### Current Shape

Several docs describe implementation surfaces that can drift:

- `docs/architecture.md` lists approved content components and major folders.
- `docs/writing-guide.md` lists approved content components.
- `docs/tooling.md` describes current dependencies.
- `src/styles/MAPPING.md` manually records which shared typography classes are applied to component elements.

These docs are useful, but repeated implementation inventories become stale unless maintained carefully.

### Proposed Approach

Generate small read-only maps from source code and package metadata. The maps should be compact console output or generated markdown that is explicitly derived, not hand-authored.

Candidate maps:

- approved MDX content components from `src/content-components.tsx`
- island registry entries from `src/islands/registry.ts`
- build artifact generators from `src/build/artifacts/`
- style source files and layer order from `src/styles/style.css`
- package scripts from `package.json`
- dependency list grouped by role

### Implementation Outline

1. Add a script such as `pnpm run map-project`.
2. Generate maps from source files and configuration.
3. Prefer console output first; only write markdown if the generated file has a clear home.
4. Link to the command from docs that currently duplicate implementation inventories.
5. Keep explanatory docs focused on why these surfaces exist, not exhaustive lists.

### What This Can Remove

Implementation:

- No production implementation should be removed for this item alone.
- If maps cover style usage well, some manual CSS mapping maintenance could be reduced.

Docs:

- Repeated lists of approved content components across `docs/architecture.md` and `docs/writing-guide.md`
- Repeated lists of generated artifacts if a generated map covers them
- Some manual inventory detail in `docs/tooling.md`
- Future hand-maintained tables that only restate source structure

### Trade-Offs

- Generated maps are only valuable if they are easier to trust than hand-written lists.
- A map script is still tooling, so it must replace enough documentation burden to justify itself.
- Explanatory docs remain necessary; generated maps should not become architecture prose.

The best outcome is shorter docs with fresher facts.

## 4. A Single Build-Time Site Graph

### Intent

Unify derived site data into one immutable build artifact that flows forward through rendering and artifact generation. This should simplify data ownership without turning the build into a framework.

### Current Shape

The build currently derives related facts in several places:

- content discovery finds source files
- content compilation creates `BuiltContent`
- article index generation filters and sorts articles
- series index generation groups article entries
- rendering derives page paths and island usage
- ancillary artifact generation consumes article and page metadata
- validation checks content contracts

This is legible, but future changes can require tracing the same concept through multiple stages.

### Proposed Approach

Create one build-time site graph after content compilation and validation. The graph should be a plain object, not a service or class hierarchy.

It could contain:

- all pages
- articles
- routes
- article index entries
- series groups
- headings
- image references
- draft/public inclusion state
- artifact inputs
- island usage after rendering, if collected later

Build stages would then consume the graph instead of repeatedly deriving overlapping indexes.

### Implementation Outline

1. Define a narrow `SiteGraph` type in `src/types/` or `src/build/content/`.
2. Build the graph immediately after compiling content.
3. Move article filtering, route derivation, and series grouping into the graph builder.
4. Update validation to operate on the graph.
5. Update page rendering and ancillary artifact generation to consume graph slices.
6. Keep the graph immutable after construction, except for clearly separate render output summaries if needed.
7. Remove older helper functions only after each consumer has moved to the graph, using the removal candidates below as the checklist.

### What This Can Remove

Implementation:

- Duplicate article index derivation paths in `src/build/content/article-index.ts`
- Separate series map orchestration in page writing if series data lives in the graph
- Local page-path derivation in render code if routes live in the graph
- Repeated filtering of drafts and invalid article entries
- Some parameter passing between build, render, and artifact stages

Docs:

- Some detailed build-pipeline explanation in `docs/architecture.md` could shrink once the graph becomes the named data boundary.
- Future docs can describe the graph as the central build artifact instead of listing several separate derived indexes.

### Trade-Offs

- A graph can become a dumping ground if every future need is added casually.
- The type must stay boring and serializable.
- The graph should not hide the build pipeline; it should make the pipeline easier to follow.

This is worth doing only if it removes more scattered derivation than it centralizes.

## 5. Minimum Viable Browser Statement

### Intent

State what the site expects from browsers, what degrades gracefully, and what will not be polyfilled. This protects restraint by preventing accidental compatibility work from becoming hidden complexity.

### Current Shape

Browser targets live in `site.config.ts` and are converted for esbuild and Lightning CSS. The architecture and tooling docs describe modern static output, but there is no explicit compatibility philosophy.

### Proposed Approach

Add a short browser support statement to `docs/tooling.md` or a focused section in `docs/architecture.md`.

It should cover:

- target browsers for CSS and JavaScript compilation
- features allowed as progressive enhancement
- features that must have static fallbacks
- features that will not be polyfilled
- expectations for no-JavaScript browsing

### Implementation Outline

1. Use `site.config.ts` as the source of truth for browser targets.
2. Document that static HTML is the baseline experience.
3. Classify browser features into:
   - required baseline
   - progressive enhancement
   - unsupported without fallback
4. Add guidance for future implementation choices:
   - prefer no polyfill
   - prefer feature detection
   - prefer graceful absence
   - avoid compatibility packages unless a core reading path breaks
5. Optionally add a test that fails if a polyfill dependency is introduced without documentation.

### What This Can Remove

Implementation:

- Future polyfills that exist only to support decorative behavior
- Compatibility branches for non-essential enhancements
- Dependencies added solely to normalize browser behavior for small UI effects

Docs:

- Repeated browser-support caveats in individual feature docs
- Ambiguous explanations of why the site uses modern CSS or selective JavaScript

### Trade-Offs

- Some users on older browsers may get a plainer experience.
- Feature choices need discipline: graceful absence must be acceptable before using newer platform capabilities.

This fits the site if the guaranteed baseline remains readable documents and working links.

## 6. Authored Navigation Over Generated Taxonomy

### Intent

Prefer curated editorial paths over database-like content classification until the archive is large enough to need generated taxonomy.

### Current Shape

The repository already has future ideas for tags, related articles, and article cross-reference components. The current article index is generated, and series support provides structured article sequencing.

### Proposed Approach

Use authored navigation surfaces before adding taxonomy:

- curated “start here” sections
- essay-style index pages
- hand-picked article trails
- small thematic pages written as prose
- series only when order matters

If tags or related articles are later added, they should solve a demonstrated navigation problem, not merely make the archive feel more like a publication platform.

### Implementation Outline

1. Add a short principle to `docs/writing-guide.md`: prefer authored navigation until generated taxonomy earns its place.
2. Create one or two authored index pages in `content/` only when there is a real editorial need.
3. Keep `ArticleList` as the broad archive view.
4. Defer tags, generated topic pages, and related-article metadata until manual curation becomes repetitive.
5. If taxonomy is eventually added, require it to replace one or more manual navigation surfaces.

### What This Can Remove

Implementation:

- Future need for `tags` frontmatter if curated pages solve topic discovery
- Future generated tag index pages
- Future `related` frontmatter
- Future `ArticleLink` component if ordinary validated links and link checking are enough

Docs:

- The tag, related article, and article cross-reference ideas in `docs/future-ideas.md` if authored navigation becomes the accepted direction
- Future taxonomy guidance that would otherwise expand the writing guide

### Trade-Offs

- Manual curation requires editorial attention.
- Reader discovery is less automatic.
- Some cross-linking consistency relies on the author.

That trade-off matches a personal site where voice and selection are part of the value.

## 7. Markup House Style

### Intent

Define a small house style for generated HTML so the site remains pleasant to inspect and easy to reason about. This is not a component design system; it is a source-view discipline.

### Current Shape

The architecture already favors complete HTML documents, semantic templates, and constrained content components. Verification covers accessibility, links, feed, and SEO artifacts. There is not yet a focused description of the preferred generated markup shape.

### Proposed Approach

Document a concise markup style covering:

- landmark order
- heading progression
- when to use `article`, `section`, `nav`, `aside`, and `div`
- metadata block conventions
- component root class naming
- when wrappers are acceptable
- how island roots should appear in source

Then add selective output tests for the rules that matter most.

### Implementation Outline

1. Add a “Generated Markup House Style” section to `docs/component-pattern.md` or create a short dedicated doc.
2. Review templates and content components against the style.
3. Add output verification for stable invariants:
   - one `main` landmark
   - expected header/main/footer order
   - no empty wrapper-only component roots
   - no island root on pages without islands
   - article pages use `article` for the primary prose body
4. Keep subjective rules in docs, not tests.
5. Use failures as prompts to simplify markup rather than to add exceptions.

### What This Can Remove

Implementation:

- Redundant wrapper elements in templates and components
- Generic class names that do not express a component or shared site concept
- Island wrapper markup if future island simplification makes it unnecessary
- Component structure that exists only to satisfy styling rather than document meaning

Docs:

- Some component-pattern guidance that currently explains structure case by case
- Repeated markup expectations in future feature docs

### Trade-Offs

- Too many markup rules could become a local framework.
- Tests should enforce only durable structure, not incidental formatting.
- The style must preserve authoring flexibility for prose.

The goal is generated HTML that looks intentionally written, not merely emitted.

## Combined Removal Map

If all seven approaches are implemented well, the repository could remove or avoid:

### Existing Implementation

- `src/build/tools/create-content.ts`
- `create-article` and `create-page` package scripts
- stale component CSS selectors
- stale entries in `src/styles/MAPPING.md`
- duplicate article index derivation paths
- repeated route and series derivation outside a future site graph
- compatibility code for non-essential browser enhancements
- redundant component/template wrapper markup

### Existing Documentation

- CLI-specific content creation guidance
- repeated lists of approved content components
- repeated inventories of generated artifacts or implementation surfaces
- some hand-maintained style mapping detail
- future taxonomy ideas if authored navigation becomes the accepted direction
- scattered browser compatibility caveats
- case-by-case markup explanations that a house style can replace

### Future Implementation That May No Longer Be Needed

- tags frontmatter
- generated tag index pages
- related-article metadata
- `ArticleLink` content component
- polyfill dependencies for decorative enhancements
- more hand-maintained architecture inventory docs

## Suggested Order

1. Add the minimum viable browser statement.
2. Add markup house style documentation.
3. Replace content creation scripts with archetypes.
4. Add generated project maps.
5. Add dead selector detection.
6. Prefer authored navigation and prune conflicting future taxonomy ideas.
7. Consider the site graph only after smaller derivation cleanups prove the need.

The site graph is warranted when article indexes, routes, series data, draft filtering, and artifact inputs still require repeated manual coordination across multiple build stages after simpler consolidation work.

That order starts with documentation and low-risk deletion before attempting larger build data-flow changes.
