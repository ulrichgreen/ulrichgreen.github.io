# Codebase Analysis

Build pipeline audit from five perspectives — performance, architecture, minimalism, reliability, and developer experience. Findings are split into two sections: changes already applied, and remaining observations for future consideration.

Baseline state: typecheck passes, `pnpm test` passes (JSX rendering, accessibility, links, feed), `pnpm build` succeeds (10 HTML pages, CSS, two JS bundles, feed, sitemap, robots, headers, OG image).

---

## Changes Applied

### Performance

**Eliminate duplicate MDX compilation in feed generation.** `buildFeed()` was re-reading and re-compiling all 6 writing MDX files that were already compiled in the main page loop. The site build now collects compiled writing pages and passes them directly to `buildFeed()`. Zero re-reads, zero re-compilations.

**Parallelize page MDX compilation.** Replaced the sequential `for` loop in `site.ts` with `Promise.allSettled()` over all source files. Pages with heavy syntax highlighting (shiki) can now overlap.

**Hoist `@mdx-js/mdx` dynamic import.** Moved the `import("@mdx-js/mdx")` from inside `compileMdx()` to a module-level constant. The promise resolves once on first use; all subsequent calls get the cached module.

**Parallelize CSS and client JS builds.** `buildCss()` and `buildClient()` are independent — they now run concurrently via `Promise.all()`.

### Architecture

**Centralize directory paths.** `distDirectory`, `contentDirectory`, and `writingDirectory` were independently defined (via `fileURLToPath(new URL("../../dist", import.meta.url))`) in 10 files with 3 different variable names. Now a single `src/build/paths.ts` is the source of truth.

**Extract `writeDistFile()`.** Five files repeated `mkdirSync(distDir, { recursive: true }); writeFileSync(join(distDir, name), content)`. Now `writeDistFile("feed.xml", xml)` handles mkdir internally via `src/build/dist-fs.ts`.

**Decouple feed from render internals.** `feed.ts` duplicated 15 lines of render context wiring (createElement, RenderContext.Provider, registerIsland stub, inline defaultAssetManifest). Now it calls `renderContentBody()` — a function exported from `render-react-page.tsx` that shares the same private `createRenderContext()` factory.

**Consolidate `defaultAssetManifest`.** Three identical copies collapsed to one export in `render-context.tsx`.

### Reliability

**Guard `buildAll()` against import-time execution.** Added `import.meta.url` guard so importing `build.ts` from `dev.ts` doesn't trigger a redundant build.

**Per-file error handling.** `Promise.allSettled` in `site.ts` reports which specific pages failed instead of crashing the entire build on the first bad MDX file.

**Warn on silently filtered writing entries.** `writing-index.ts` now logs to stderr when entries are skipped due to missing or invalid title/published date.

**Guard post-build tests.** `verify-links.ts` and `verify-feed.ts` now exit with an actionable message when `dist/` doesn't exist, instead of crashing with raw ENOENT errors.

**Preserve stack traces in dev server.** `dev.ts` now logs `error.stack` instead of `String(error)`.

**Escape CDATA in feed.** `feed.ts` now handles `]]>` sequences in HTML content that would break the Atom XML.

### Developer Experience

**Build summary.** The build now reports `build: 10 pages in 0.79s` — page count and wall-clock time.

**Fix `verify` script.** Reordered to `typecheck → build → test` so post-build verifiers always run against fresh output. Removed duplicate invocations of `check-links` and `verify-feed`.

**Dev server logs changed files.** The chokidar watcher now prints which file triggered each rebuild.

**Rename `INJECT` → `LIVE_RELOAD_SCRIPT`.** Self-documenting name in `dev.ts`.

---

## Remaining Findings

### Types and Templates

`PageMeta` declares `words`, `readingTime`, `note`, `summary`, and `print`, but layout prop types only forward a subset. The `summary` frontmatter field is accepted by the schema but no content file uses it. The `print` field is set by `cv.mdx` but not consumed by any template or build logic. These are harmless but add noise.

### Client Code

Footnote enhancement (`enhancements.ts`) creates margin notes and inline footnotes entirely in JavaScript. Without JS, footnote reference links don't reveal content — a minor progressive-enhancement gap.

The four hydration strategies (`load`, `visible`, `idle`, `interaction`) in `islands.ts` serve one widget that uses the default `load`. The other three strategies are shipped but never executed. Worth simplifying when the architecture stabilizes.

### Dead Code

`page.ts` is a standalone CLI for building a single page. It's referenced in documentation but not in any script or CI workflow. `frontmatter.ts` has a `main()` function for stdin/stdout usage that's similarly unreferenced. `stripDuplicateArticleTitle()` in `build-content.ts` handles a pattern that no current article exhibits.

### Tests

No tests exist for SEO artifacts (`robots.txt`, `sitemap.xml`, `_headers`, `og-image.svg`), client-side behavior (`enhancements.ts`, `islands.ts`), or the CSS build and asset manifest pipeline.

### Security

`dangerouslySetInnerHTML` in `src/islands/island.tsx` injects `renderToString` output. Safe today because props come from static MDX at build time and `renderToString` escapes React output. Fragile if a component ever renders unescaped user content.

All 13 production dependencies are actively imported. Dev dependencies are correctly classified. No hardcoded secrets. `.gitignore` is correct.

---

## Summary

| Area | Change | Status |
|------|--------|--------|
| Perf | Eliminate duplicate feed compilation | ✅ Applied |
| Perf | Parallelize page MDX compilation | ✅ Applied |
| Perf | Hoist `@mdx-js/mdx` import | ✅ Applied |
| Perf | Parallelize CSS + JS builds | ✅ Applied |
| Arch | Centralize directory paths | ✅ Applied |
| Arch | Extract `writeDistFile()` | ✅ Applied |
| Arch | Decouple feed from render internals | ✅ Applied |
| Arch | Consolidate `defaultAssetManifest` | ✅ Applied |
| Rel | Import guard on `buildAll()` | ✅ Applied |
| Rel | Per-file error handling in page build | ✅ Applied |
| Rel | Warn on silently filtered entries | ✅ Applied |
| Rel | Guard post-build tests | ✅ Applied |
| Rel | CDATA escaping in feed | ✅ Applied |
| DX | Build summary output | ✅ Applied |
| DX | Fix `verify` script ordering | ✅ Applied |
| DX | Dev server change logging | ✅ Applied |
| Types | Unused `summary`/`print` fields | Noted |
| Client | Unused hydration strategies | Noted |
| Client | Footnote enhancement requires JS | Noted |
| Tests | Missing SEO artifact tests | Noted |
| Dead | `page.ts` CLI, `frontmatter.ts` stdin | Noted |
