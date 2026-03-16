# Content Writing Improvements

What follows is a set of concrete improvements to the content writing experience. Each suggestion is assessed against the same constraints that shape the rest of the site: static-first, text-editor-centric, no unnecessary complexity.

These are organized roughly by impact on the writing loop, from tools that accelerate daily work to longer-horizon structural additions. None requires a CMS, a new framework, or a departure from the existing authoring model.

---

## 1. Article Scaffolding Tool

**What**: A `pnpm new-article` command that generates a new `.mdx` file in `content/articles/` with correctly structured frontmatter.

**Why**: Authoring a new article currently requires recalling the frontmatter schema by hand or copying an existing file and editing it. Invalid frontmatter is not caught until the next build run. A scaffolding tool turns that into a moment of structured intent rather than a transcription exercise.

**How**:
- A script at `src/build/tools/new-article.ts`, invoked via `pnpm exec tsx src/build/tools/new-article.ts`
- Accepts `--title`, `--series`, and `--series-order` as command-line arguments
- Derives a kebab-case filename from the title
- Writes a valid frontmatter block with today's date as `published`, `layout: article`, and a placeholder `description`
- Fails if the derived filename already exists

```
tsx src/build/tools/new-article.ts --title "On Abstraction"
tsx src/build/tools/new-article.ts --title "On Trade-offs" --series "The Web Trilogy" --series-order 4
```

**Architecture fit**: Reuses the same directory constants and layout names the build already defines. No new dependencies. Same script pattern as `src/build/clean.ts`.

---

## 2. Draft Article Support

**What**: A `draft: true` frontmatter field that excludes an article from the article index, feed, and sitemap while still building the page in the development server.

**Why**: Writing is iterative. Articles being worked on should not appear in the public index, but they need to be viewable locally to be written and reviewed. There is currently no sanctioned way to hold an article in-progress without it appearing publicly.

**How**:
- Add `draft: z.boolean().optional()` to the schema in `src/build/content/frontmatter.ts`
- In `src/build/content/article-index.ts`, filter out articles where `draft === true`
- The page still builds and is reachable in development; it simply does not appear in the article list, the Atom feed, or the sitemap

An alternative layout: place drafts in `content/drafts/` and exclude that directory from discovery entirely in production. Either approach works; the frontmatter flag is lower friction.

**Architecture fit**: A single optional boolean in the metadata contract. Consistent with how other optional fields (`series`, `note`, `revisions`) behave — present when needed, absent when not.

---

## 3. Content Validation Script

**What**: A fast standalone script — `pnpm validate-content` — that parses and validates all frontmatter without triggering a full build.

**Why**: Full builds take time. Before starting a writing session or before a `git push`, a writer benefits from a targeted check that all frontmatter is valid. The schema already exists; this is just a faster path to the feedback.

**How**:
- A script at `src/build/tools/validate-content.ts` that calls `parseFrontmatter` on every `.mdx` file in `content/` and `content/articles/`
- Reports any validation errors with file path and field name
- Exits with a non-zero code if any errors are found
- Prints a clean summary when all files pass

**Architecture fit**: Reuses `parseFrontmatter` from `src/build/content/frontmatter.ts` unchanged. Skips MDX compilation, asset building, and rendering — making it significantly faster than `pnpm build`. Follows the same standalone-script pattern as `test/verify-links.ts`.

---

## 4. Writing Guide

**What**: A new `docs/writing-guide.md` document that records the authoring format, full frontmatter field reference, available content components, and practical conventions for writing articles.

**Why**: There is currently no single reference for how to write and publish an article on this site. A returning author — or this site's owner after a few months away — has to reconstruct the conventions from existing articles, the Zod schema, and the build code. A reference document removes that overhead and acts as the stable specification for the content contract.

**Contents**:

- How to create a new article file and what directory it belongs in
- Full frontmatter field reference with types, constraints, valid values, and examples for every field: `title`, `description`, `summary`, `layout`, `section`, `published`, `revised`, `note`, `series`, `seriesOrder`, `revisions`, `draft`
- When each optional field is appropriate
- A quick-start frontmatter template
- Available content components and how to use them: `ArticleList`, `Code`, `Hero`, `DemoWidget`
- How images work: placing source images in `src/images/`, the generated variants the build produces, and how to reference them in content
- Series authoring: how to declare a series, how ordering works, what appears in the rendered article footer
- Revision history: when and how to add a `revisions` entry when substantively updating an article
- Footnote conventions: standard Markdown footnote syntax (`[^1]` / `[^1]: text`) and what the client enhancement layer does with it

**Architecture fit**: A documentation file only, in the `docs/` directory alongside `architecture.md` and `tooling.md`.

---

## 5. Series Ordering Validation

**What**: A build-time check that detects conflicting `seriesOrder` values within the same series.

**Why**: If two articles both declare `series: "The Web Trilogy"` and `seriesOrder: 1`, the series navigation renders incorrectly — one article silently shadows the other. The build does not currently detect this. The failure is quiet and the result is malformed navigation.

**How**:
- In `src/build/content/series-index.ts`, after building the series map, verify that no two articles in the same series share the same `seriesOrder` value
- If a conflict is found, throw a descriptive error naming both files and the conflicting order number
- Add a corresponding test to `src/build/content/series-index.test.ts`

**Architecture fit**: The series-building logic already lives in `series-index.ts`. This is a validation step added to an existing function, consistent with the "fail early" philosophy already applied to frontmatter parsing.

---

## 6. Tags Support

**What**: An optional `tags` array in article frontmatter for topic-based classification.

**Why**: With a small archive, navigation by date and series is sufficient. As the archive grows, topic-based grouping adds useful structure. Tags are the lightest addition — an optional metadata field that enables filtering without requiring a full taxonomy system.

**How**:
- Add `tags: z.array(z.string().trim().min(1)).optional()` to the frontmatter schema
- Add `tags?: string[]` to `ArticlePageMeta` and `ArticleIndexEntry`
- Update `ArticleList` to accept an optional `tag` prop that limits which articles are rendered

The filtered `ArticleList` is the minimal path. A generated `tags/` index — one page per tag — is a natural follow-on once a few distinct tags exist.

**Architecture fit**: Opt-in metadata, consistent with how `series` and `seriesOrder` work. `ArticleList` already accepts an `items` override; a `tag` filter follows the same pattern. The tags array is reflected in the article index and feed, so it remains consistent across all generated artifacts.

---

## 7. Related Articles Field

**What**: An optional `related` frontmatter field: an array of article slugs that the template renders as a "Read next" section at the end of the article.

**Why**: Series navigation handles sequential content. Many articles benefit from pointing toward thematically connected pieces that are not part of the same series. This gives authors explicit control over the reading path without requiring a recommendation system.

**How**:
- Add `related: z.array(z.string().trim().min(1)).optional()` to the frontmatter schema
- At build time, resolve each slug to its `ArticleIndexEntry`; fail the build if any slug does not exist
- Pass the resolved entries to the article template
- Render a "Related" section below the article body, similar in structure and style to the series navigation

**Architecture fit**: Build-time resolution prevents dead links. The pattern mirrors how series navigation resolves entries — look up slugs in the article index, fail early if not found.

---

## 8. Article Cross-Reference Component

**What**: An `ArticleLink` content component that renders a validated internal link to another article by slug.

**Why**: Authors currently write raw Markdown links to other articles:

```
[On Simplicity](/articles/on-simplicity.html)
```

These links are not validated at build time — they can silently reference articles that do not exist. They break if a slug changes. They also carry no structured metadata, so the link text is whatever the author typed rather than the article's canonical title.

**How**:
- Add `src/components/article-link.tsx`
- Register it in `src/content-components.tsx`
- The component accepts a `slug` prop and resolves it against the article index from render context
- If the slug does not resolve, the build fails with a clear error
- The rendered output is an `<a>` tag using the article's own title as link text
- An optional `children` prop overrides the link text when needed

**Architecture fit**: Fits squarely within the curated content-component architecture. The article index is already in render context, so no new data plumbing is required.

---

## 9. Table of Contents Component

**What**: A `TableOfContents` content component that renders the headings of the current article as an in-page navigation list.

**Why**: Long-form articles benefit from a structural overview. A table of contents helps readers orient before committing to a full read, and lets them navigate directly to a section of interest. `rehype-slug` already assigns stable IDs to every heading — the infrastructure for this exists.

**How**:
- During MDX compilation in `src/build/content/compile-mdx.ts`, extract H2 and H3 headings using a custom `rehype` plugin and store them alongside the compiled component tree
- Pass the heading list through render context
- Add `TableOfContents` to `src/content-components.tsx`; the component reads the heading list from context and renders a `<nav>` with `<a href="#slug">` links
- Authors opt in by placing `<TableOfContents />` anywhere in their MDX content

**Architecture fit**: `rehype-slug` is already wired into the compile step; the heading extraction is an additive plugin in the same chain. The component reads from render context rather than accepting props directly, keeping the authoring interface clean.

---

## 10. Callout Component and Code Copy Enhancement

**What**: A `Callout` content component for annotated asides — notes, warnings, and tips — and clipboard copy for code blocks as a progressive enhancement.

**Why for Callout**: Technical articles often need to call out critical warnings or tips in a visually distinct way. The existing component set has no mechanism for this short of blockquotes, which carry different semantic weight. A `Callout` component fills that gap with explicit type signaling.

**Why for Code copy**: Copying code from an article is a common reader action. The current code blocks provide no affordance for it. Adding a copy button as a progressive enhancement follows the existing pattern in `enhancements.ts` and adds real value to code-heavy writing.

**How for Callout**:
- Add `src/components/callout.tsx` with a `type` prop: `"note"`, `"warning"`, `"tip"`
- Register it in `src/content-components.tsx`
- Styled with the existing CSS token system

**How for Code copy**:
- The `Code` component already renders a `<figure class="code-block">`
- Add a copy button as a progressive enhancement in `src/client/enhancements.ts`: find all `.code-block` figures, inject a copy button, attach the clipboard interaction on click
- The button is only present when JavaScript is available; the code block renders normally without it

**Architecture fit**: `Callout` follows the exact component pattern already in use. Code copy follows the progressive-enhancement model of `enhancements.ts` — it enhances already-rendered markup rather than requiring server-side rendering of the feature.

---

## 11. Content Audit Report

**What**: A `pnpm audit-content` command that prints a summary of the article archive.

**Why**: As the archive grows, it becomes harder to maintain a clear picture of its state. Which articles have no description? Which have not been revised in over a year? Which series are incomplete? This is maintenance-useful information that does not belong in the build output but is worth surfacing on demand.

**How**:
- A script at `src/build/tools/audit-content.ts` that reads all article index entries and prints:
  - Total article count and total word count across all articles
  - Per-article word count and reading time
  - Articles without an explicit `description` (relying on auto-derivation)
  - Articles without a `revised` date
  - Series status: series name, declared article count, total words across the series, gaps in `seriesOrder`
  - Any articles marked `draft: true`

**Architecture fit**: Reuses the article index logic already in `article-index.ts`. A read-only diagnostic script following the same `src/build/` convention.

---

## 12. Image Workflow Documentation and `Figure` Component

**What**: Documentation of the image pipeline for content authors, plus an `Figure` content component that wraps `<Picture>` with a caption.

**Why**: The image pipeline — Sharp, AVIF, WebP, half-size variants — is fully functional, but there is no documented workflow for using it in an article. An author who wants to add an image has to read `src/build/assets/images.ts`, the `<Picture>` component, and the `src/images/` directory structure to figure it out. That friction discourages using images in content.

**How for documentation**:
- Cover the image workflow in `docs/writing-guide.md`:
  - Place source images in `src/images/`
  - The build generates AVIF, WebP, and a half-size variant for each raster image
  - Standard Markdown image syntax `![alt](path)` works for basic use
  - Use the `<Figure>` component when a caption is needed

**How for `Figure`**:
- Add `src/components/figure.tsx` accepting `src`, `alt`, `caption`, and optional `width`/`height` props
- Internally renders `<Picture>` with a `<figcaption>`
- Register in `src/content-components.tsx`

**How for validation**:
- After the image build step, check that every image path referenced in content files exists in `dist/images/`
- Report missing images as build errors alongside broken-link detection

**Architecture fit**: `<Picture>` is already in `src/components/picture.tsx`. The `Figure` component is a thin, typed wrapper. The validation step follows the same "fail early" philosophy as frontmatter parsing.

---

## 13. Incremental Rebuild Caching

**What**: Skip MDX compilation for articles whose source content has not changed since the last build.

**Why**: Already on the roadmap, but worth making the authoring case explicit: a full rebuild currently touches every article even when only one has been edited. With six articles this is fast. With sixty, a slow inner loop adds real friction to writing and revising.

**How**:
- After a successful build, write a manifest to `.build-cache/` (excluded from `dist/`) recording each source path and its content hash
- On the next build, hash each source file and compare to the cached value
- Skip MDX compilation for unchanged articles; reuse the cached compiled component
- Always recompute the article index, series index, feed, and sitemap from the full set of (possibly cached) entries
- Invalidate the entire cache on changes to `src/content-components.tsx` or the compile pipeline itself

**Architecture fit**: Matches the approach the asset pipeline already uses for fingerprinted filenames. The cache is a build artifact, not public output. The build remains fully correct — it just skips known-unchanged work.

---

## What to Build First

If the goal is to improve the writing loop as quickly as possible, the order of impact is roughly:

1. **Writing guide** — documentation only; immediate reference value with no code change
2. **Article scaffolding tool** — eliminates friction when starting a new article
3. **Draft support** — enables work-in-progress without accidental publication
4. **Content validation script** — fast frontmatter feedback without a full build
5. **Series ordering validation** — catches a currently-silent error class at build time

The remaining improvements — tags, related articles, `ArticleLink`, table of contents, `Callout`, code copy, audit report, image workflow, and caching — add more value as the archive grows and the authoring surface deepens.
