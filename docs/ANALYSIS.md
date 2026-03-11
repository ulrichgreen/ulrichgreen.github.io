# Codebase Analysis

A thorough audit of drift, bugs, inconsistencies, and opportunities across the build pipeline, templates, types, client code, styles, content, tests, docs, CI, dependencies, and security posture.

Baseline state: typecheck passes, `pnpm test` passes, `pnpm build` succeeds (10 HTML pages, CSS, two JS bundles, feed, sitemap, robots, headers, OG image), `check-links` passes, `verify-feed` passes.

---

## Build Pipeline

### Dead code in description extraction

`src/build/build-content.ts` lines 61–70 — every heading is unconditionally skipped. The inner condition that checks whether a heading matches the title can never change the outcome because the outer `continue` on line 69 always fires regardless.

```typescript
if (trimmed.startsWith("#")) {
    if (normalizedTitle && normalizeTitle(candidate) === normalizedTitle) {
        continue;   // redundant — line 69 does the same thing
    }
    continue;       // always reached for any heading
}
```

The likely intent was to skip _only_ title-matching headings and allow other headings to fall through to the description check. As written, no heading text can ever become a description.

### `buildCss()` is not awaited

`src/build/build.ts` line 7 — `buildCss()` is synchronous today, but is called without `await` alongside the async `buildClient()`. If CSS output ever becomes async (e.g. adding PostCSS), `generateAssetManifest()` on line 9 will try to hash a file that hasn't been written yet. Either await it or run both in `Promise.all` to make the contract explicit.

### No file-existence guard in `contentHash`

`src/build/asset-manifest.ts` line 15 — `readFileSync` is called on `dist/style.css`, `dist/site.js`, and `dist/islands.js` with no existence check. If any upstream build step silently fails, this throws a raw ENOENT instead of a clear message.

### `applyHashedFilenames` has no guard either

Same file, `renameSync` at line 24 will throw if the original file is missing and will silently overwrite if the hashed name already exists (e.g. two builds without a clean step).

### Unbounded queue in dev server

`src/build/dev.ts` — the debounced rebuild calls `void runBuild()` recursively on line 85 if a build was queued while the previous one was running. Under rapid file-save bursts this can stack indefinitely. A while-loop with the same flag logic would cap depth at one.

### WebSocket `send` in dev server ignores errors

`src/build/dev.ts` line 75 — `client.send("reload")` can throw if the connection is closing. A try/catch per-client would prevent one stale connection from breaking the reload broadcast.

### Hardcoded site URL in three files

`src/build/feed.ts`, `src/build/robots.ts`, `src/build/sitemap.ts` each define `SITE_URL = "https://ulrich.green"` independently. A single constant in a shared config module would keep them in sync.

### Browser targets duplicated

`src/build/css.ts` uses `chrome: 120 << 16` etc. and `src/build/client.ts` uses `["chrome120", "firefox121", "safari17"]`. Same intent, different format, no shared source of truth. Easy to update one and forget the other.

---

## Types and Templates

### `ComponentType<any>` in two places

`src/types/content.ts` line 25 and `src/islands/registry.ts` line 6 both use `ComponentType<any>`, which disables prop checking for content components and islands. A per-component props map (or at least `ComponentType<Record<string, unknown>>`) would be safer.

### Unsafe `as` casts in client island hydration

`src/client/islands.ts` line 8 casts `dataset.island` to a registry key with no runtime check. Line 13 casts the result of `JSON.parse` without a try/catch. Malformed `data-island-props` would crash hydration.

### `PageMeta` fields not covered by layout props

`src/types/content.ts` — `PageMeta` declares `words`, `readingTime`, `note`, `summary`, and `print`, but `BaseLayoutProps` and `ArticleLayoutProps` only forward `published` and `revised` from that group. The extra fields are used internally by `build-content.ts` and `article-header.tsx`, but the gap makes it unclear which fields are "for the template" vs. "for the build."

### `--unit` custom property defined but unused

`src/styles/tokens.css` line 3 defines `--unit: 8px` alongside `--u: 8px`. Only `--u` is referenced elsewhere. `--unit` is dead.

### Missing CSS for rendered class names

`article-body` (used in `src/templates/article.tsx` line 39), `.reading-time`, `.revised`, and `.word-count` (used in `src/components/article-header.tsx`) have no matching rules in any stylesheet. They inherit parent styles but have no specific styling — likely an oversight or planned-but-unfinished work.

### Unused CSS rules

The following selectors are defined in stylesheets but never referenced from any template, component, or content file:

- `.cv-entry`, `.cv-entry__title`, `.cv-entry__org`, `.cv-entry__date`, `.cv-entry__desc` — `src/styles/components.css` lines 152–191 and `src/styles/print.css` line 70. No JSX or MDX ever emits these classes.
- `.full-bleed`, `.margin-bleed` — `src/styles/layout.css` lines 14–21.
- All utility classes in `src/styles/utilities.css`: `.sr-only`, `.text-xs`, `.text-sm`, `.text-base`, `.text-muted`, `.text-accent`, `.font-mono`, `.font-ui`, `.small-caps`, `.mt-0` through `.mt-8`, `.tag`. None are applied in the rendered output.

Note: `.fn-ref`, `.fn-inline`, `.margin-note` (components.css) _are_ used — they're applied dynamically by `src/client/enhancements.ts` at runtime.

---

## Docs vs. Implementation

### Roadmap lists CSS `@layer` as speculative — it shipped

`docs/roadmap.md` line 37: "Whether CSS `@layer` would clean up the cascade." All eight stylesheets already use `@layer`, and the cascade order is declared in `src/styles/style.css` line 1. This item is done but not acknowledged.

### Roadmap lists asset hashing as future — it shipped

`docs/roadmap.md` line 25 mentions build caching via "a manifest of file hashes." `src/build/asset-manifest.ts` already generates content hashes and renames output files. The caching aspect (skip unchanged pages) is still open, but the hashing is complete.

### Architecture doc lists `summary` field but frontmatter schema has it unlisted

`docs/architecture.md` line 27 enumerates frontmatter fields and omits `summary` and `section`, which both exist in the Zod schema at `src/build/frontmatter.ts`.

### Island hydration strategies are undocumented

`src/islands/island.tsx` supports four hydration strategies — `load`, `visible`, `idle`, and `interaction` — with corresponding scheduling logic in `src/client/islands.ts`. Neither `docs/architecture.md` nor the manifesto mentions them.

### Dual client bundles undocumented

The architecture doc does not mention that the browser receives two separate scripts (`site.js` for progressive enhancement, `islands.js` for React hydration) or when each loads.

---

## Client Code and Performance

### `islands.js` is 1.9 MB, loaded on every page

`dist/islands.868d9dfd.js` is 1,929,000 bytes (uncompressed) because it bundles the full React 19 + ReactDOM runtime. It loads via `<script defer>` on all 10 HTML pages, but only `writing/on-tools.html` actually contains an island (`DemoWidget`). The other 9 pages pay the download cost for nothing.

Options: conditionally include the script tag only when islands are present, lazy-load it when `[data-island]` elements are detected, or replace the single island with vanilla JS.

### Footnote enhancement requires JavaScript

`src/client/enhancements.ts` — margin notes and inline footnotes are created entirely in JS. Without JavaScript, footnote reference links are present in the HTML but do not reveal their content. This is a minor progressive-enhancement gap in a site whose manifesto promises "the words still land" without JS.

---

## Tests and CI

### CI runs `pnpm build` but skips all tests

`.github/workflows/deploy.yml` — the build job installs dependencies and runs `pnpm build`, then uploads `dist/`. It does not run `pnpm test`, `pnpm run typecheck`, `pnpm run check-links`, or `pnpm exec tsx test/verify-feed.ts`. A broken accessibility check, invalid feed, or busted internal link would deploy without warning.

### Two test files are not in the `test` script

`test/verify-links.ts` and `test/verify-feed.ts` only run through the `verify` and `check-links` scripts. They are not part of `pnpm test`, which runs only `verify-jsx-rendering` and `verify-accessibility`. The `verify` script runs everything, but CI doesn't invoke it.

### No tests for SEO artifacts

`robots.txt`, `sitemap.xml`, `_headers`, and `og-image.svg` are generated by dedicated build modules but have no verification tests. A broken sitemap or missing headers file would go unnoticed.

### No tests for client-side behavior

`src/client/enhancements.ts` (66 lines) and `src/client/islands.ts` (86 lines) are completely untested. There's no unit or integration test for footnote reveals, island hydration scheduling, or the four hydration strategies.

### No tests for CSS build or asset manifest

The CSS bundling step (`src/build/css.ts`), font copying, and content-hash renaming (`src/build/asset-manifest.ts`) have no dedicated tests.

### Ghost tests from prior iterations

Repository memories reference `verify-manifesto.ts`, `verify-structure.ts`, `verify-stack.ts`, `verify-roadmap.ts`, `verify-experiments.ts`, `verify-typography.ts`, and `verify-colophon.ts`. None of these files exist. The docs they validated (`manifesto.md`, `roadmap.md`, `experiments.md`) are present but unverified by the current test suite.

---

## Security and Dependencies

### All 13 production dependencies are actively imported — none unused

`@mdx-js/mdx`, `chokidar`, `esbuild`, `gray-matter`, `lightningcss`, `react`, `react-dom`, `rehype-autolink-headings`, `rehype-pretty-code`, `rehype-slug`, `remark-gfm`, `shiki`, `ws`, and `zod` are all imported in build or client code. No phantom dependencies.

### Dev dependencies correctly classified

`@types/node`, `@types/react`, `@types/react-dom`, `@types/ws`, `tsx`, and `typescript` are all in `devDependencies`. No misclassifications.

### No hardcoded secrets

No API keys, tokens, passwords, or `.env` files found. The only repeated literal is the site URL.

### `dangerouslySetInnerHTML` in island rendering

`src/islands/island.tsx` line 35 injects `renderToString` output via `dangerouslySetInnerHTML`. Currently safe because props come from static MDX at build time and `renderToString` escapes React output. The risk is low but the pattern is fragile — if a component ever renders unescaped user content, this becomes an XSS vector.

### `.gitignore` is correct

`node_modules/`, `dist/`, `package-lock.json`, `.DS_Store` are all ignored. No build artifacts committed, no source files excluded.

---

## Summary

| Area | Finding | Severity |
|------|---------|----------|
| Build | Dead code in description extraction (line 69 always skips headings) | Medium |
| Build | `buildCss()` not awaited in `buildAll()` | Low |
| Build | No file-existence guard in `contentHash` / `applyHashedFilenames` | Low |
| Build | Hardcoded `SITE_URL` in three files | Low |
| Build | Browser targets duplicated between CSS and JS configs | Low |
| Build | Dev server unbounded rebuild recursion | Low |
| Types | `ComponentType<any>` in content component map and island registry | Low |
| Types | Unsafe `as` casts and missing try/catch in client island hydration | Medium |
| CSS | `.article-body`, `.reading-time`, `.revised`, `.word-count` used but unstyled | Low |
| CSS | `--unit` defined but never used (only `--u` referenced) | Low |
| CSS | ~20 utility/component classes defined but never rendered | Low |
| Docs | Roadmap lists `@layer` as speculative — already shipped | Low |
| Docs | Roadmap lists asset hashing as future — already shipped | Low |
| Docs | Island hydration strategies and dual bundles undocumented | Medium |
| Perf | `islands.js` (1.9 MB) loaded on all pages, used on one | High |
| Tests | CI skips all tests — only runs `pnpm build` | High |
| Tests | `verify-links` and `verify-feed` not in `pnpm test` | Medium |
| Tests | No tests for SEO artifacts, client behavior, CSS build, or asset manifest | Medium |
| Tests | Seven ghost test files referenced in memories but deleted | Info |
| Security | `dangerouslySetInnerHTML` in island SSR — safe today, fragile pattern | Low |
