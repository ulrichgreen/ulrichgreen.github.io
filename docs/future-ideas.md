# Future Ideas

Ideas that are worth remembering but not worth building yet. If something here earns its place, it moves to the roadmap or gets its own planning document.

---

## Content Features

### Tags

An optional `tags` array in article frontmatter for topic-based classification. Becomes useful as the archive grows. The lightest version is a `tag` filter prop on `ArticleList`; generated tag index pages are a natural follow-on.

### Related Articles

An optional `related` frontmatter field — an array of article slugs rendered as a "Read next" section at the end of an article. Build-time slug resolution prevents dead links.

### Article Cross-Reference Component

An `ArticleLink` content component that resolves an article by slug and renders a validated internal link. Worth considering alongside a more general broken-link checker that would catch non-article links too.

### Content Audit Report

A `pnpm audit-content` command that prints archive diagnostics: word counts, missing descriptions, stale articles, series gaps, draft status. Read-only, maintenance-useful. Not needed while the archive is small.

---

## Build

### Incremental Rebuild Caching

Skip MDX compilation for unchanged articles by caching content hashes. Not needed while the full build stays fast. If build time becomes a friction point, revisit this — the asset pipeline's fingerprinting approach is a natural starting point.

---

## Design and Presentation

### Load Full Experience

A hidden footer trigger that temporarily transforms the site into an overbuilt, expressive alternate cut — motion, color, weight. A love letter to the era when personal sites were loud and strange.

Rules:

- Page structure stays intact, writing stays readable
- Only the presentation layer changes
- Respects `prefers-reduced-motion`
- Clean exit: "Return to reality"
- Must never make the calm version harder to maintain

The point is proving the restraint is a choice, not a limitation.

### SVG Social Cards

Build-time generated SVG social cards so every shared link gets a bespoke card instead of a generic fallback.

### A 404 Page That Feels Authored

The current 404 is functional but generic. The idea: make it a small piece of authored content — something that makes getting lost feel intentional rather than apologetic.

Possible approaches:

- **A short, rotating essay fragment** — pull a random quote or paragraph from the article archive, rendered fresh at build time. The page changes with each deploy.
- **A "you might have been looking for" section** — a curated short list of the site's best or most-linked pieces, so the dead end becomes a starting point.
- **An authored voice** — write the 404 as a brief standalone piece in the same tone as the essays. Not "page not found", but something like "Nothing here yet" or "You've gone past the edge of the map."
- **Visual distinction** — use the existing typography system but with a different rhythm or weight. A single large heading, generous whitespace, maybe a subtle color shift. It should feel deliberate.

The simplest version: rewrite `content/404.mdx` as a short, opinionated piece of writing with a few useful links. No new infrastructure needed.

### Scroll-Driven Animations

CSS-only scroll-driven animations using `animation-timeline: scroll()`. Subtle reveals and parallax-lite effects — no JS, no library, just the platform.

Design considerations:

- Must stay subtle to match the site's calm tone. Think gentle opacity fades and small vertical translations on section entries, not dramatic swoops.
- Respect `prefers-reduced-motion` — disable entirely or reduce to opacity-only.
- **Overlap with existing features:** The reading progress indicator already uses scroll position, and the header uses scroll-direction-based reveal/hide. Scroll-driven animations should target _content_ elements (article sections, figures, blockquotes) rather than chrome, to avoid conflicting with those existing behaviors.

Candidates:

- Article body sections fade in gently as they scroll into view
- Blockquotes or `<figure>` elements translate up slightly on entry
- The hero area on the index page has a subtle parallax depth shift

Implementation: pure CSS with `animation-timeline: view()` on content elements. Progressive enhancement — if the browser doesn't support it, elements are simply visible immediately.
