# Inspiration

A wide field of ideas to pick from, refine, and — only when one earns it — promote
to `roadmap.md` or its own planning document. Nothing here is a commitment. This is
the orchard, not the harvest.

Every idea below was chosen to speak into the same direction the rest of the repo
points at: the web is mostly text files, writing is the product, source stays
legible, complexity has to defend itself, and there are zero external services at
runtime. If an idea here ever stops serving that north star, cut it.

This document is deliberately broad and slightly redundant — it is meant to be
grazed, not read end to end. When an item graduates, move it out so this file does
not turn into a second roadmap.

> Relationship to the other idea docs: `future-ideas.md` holds a small set of
> deferred-but-specific ideas; `roadmap.md` holds planned work. This file sits one
> step earlier — looser, larger, and meant for picking. Ideas already captured in
> those files (tags, related articles, the "Load Full Experience" cut, scroll-driven
> animations, SVG social cards, an authored 404, incremental rebuild caching, inline
> critical CSS) are intentionally not repeated here.

---

## How to Read This

Ideas are grouped by the part of the site they touch:

- **Content & Editorial** — the writing, the archive, and how readers move through it
- **Design & Typography** — the presentation layer and typographic craft
- **Architecture, Build & DX** — the pipeline, tooling, and authoring experience
- **Performance, Accessibility & Privacy** — making the platform do the work
- **Interactive & Personality** — demonstrative islands and earned strangeness

Each idea is a title, a short description, and a one-line note on why it fits. Treat
the notes as the real filter: an idea that cannot justify itself against the
manifesto does not belong on the roadmap, however clever it is.

---

## Content & Editorial

**Reading time, computed at build.**
Word count and an "N min read" estimate calculated during the build and shown in
`ArticleList` and article headers. — Static data, set once; respects the reader's
time without measuring the reader.

**Keyword / topic index.**
An optional `keywords` array in frontmatter that generates a simple grouped index of
articles by topic. — Discoverability as plain linked text, no faceted-search UI and
no tracking.

**Curated collections.**
An optional `collections` field plus generated collection pages, so the author can
gather pieces by theme independent of chronology or series. — Editorial curation by
hand, which is exactly the kind of judgment the site is meant to publish.

**A "now" page.**
A short, occasionally-updated `/now` page describing current writing and thinking. —
Humanizes the site and fits "publish to contribute" without metrics or a feed of
activity.

**Citation & footnote index.**
A generated page that gathers every footnote and citation across the archive with
links back to source articles. — Surfaces the depth of the research as a durable,
linkable artifact.

**Series progress and arcs.**
Build on `SeriesNav` to show "N of M read" context and optional links between related
series. — Helps readers commit to long-form work using infrastructure that already
exists.

**Richer revision notes.**
Let the `note`/revision fields carry short markdown context ("rewritten in 2025",
"written before X"). — Keeps the living nature of an essay transparent and in the
source.

**Date-range archive views.**
Optional `year` / date filters on `ArticleList` to generate per-year archive pages
without duplicating content. — Lightweight taxonomy; lets the archive age gracefully.

**Scholarly metadata in `<head>`.**
Emit JSON-LD article metadata (author, dates, description, keywords) for published
pieces. — Makes the "durable, linkable body of text" machine-readable at zero runtime
cost.

---

## Design & Typography

**Tasteful dark mode, tuned for ink density.**
Beyond inverting luminance: a few extra tokens so secondary text, borders, and code
backgrounds read with the same calm weight in both schemes. — Dark-mode readers are
not second-class; restraint applies to both palettes.

**Print stylesheet, treated as first-class.**
Widow/orphan control, page-break hints around figures, and leading tuned for paper. —
A site of essays should print beautifully; durability includes the page.

**A real margin-note / sidenote system.**
Footnotes as positioned asides on wide screens, inline on print, collapsed on mobile
— CSS and semantics only. — Scholarly typographic depth without a line of framework.

**Per-series accent micro-variations.**
A subtle, consistent hue shift per series on section markers, links, and callout
borders — still inside the warm/neutral family. — Quiet wayfinding that never tips
into rebranding.

**Finer fluid type tier.**
An extra step in the type scale, via `clamp()`, so subheadings and captions breathe
on tablet widths while staying on the 8px baseline. — Typography excellence in
service of legibility.

**Typographic detailing.**
Drop caps refined, optional Unicode section ornaments, blockquote accents, and
weight-based (not just color-based) code token hierarchy. — Print-craft sensibility;
ornament that is type, not images.

**Heading anchors as first-class links.**
More discoverable anchor glyphs, a clear `:focus-visible` state, and an easy
copy-link affordance. — Directly serves the "linkable body of text" north star.

**Distinct internal vs. external link treatment.**
A quiet visual difference (e.g. dotted vs. solid underline) between internal and
external links. — Navigation clarity through honest HTML semantics, CSS only.

---

## Architecture, Build & DX

**Build timeline instrumentation.**
Per-stage timing in the build summary so bottlenecks are visible without an external
profiler. — Keeps the build observable and "fits in your head."

**Draft / preview flag.**
An optional `draft: true` that hides a page from production builds and feeds but shows
it (banner included) in dev. — Work-in-progress authoring with no runtime gating.

**Richer content audit output.**
Extend `audit-content` with per-field compliance, archive metrics, and an optional
JSON or HTML report. — Build-time diagnostics that keep a growing archive honest.

**Generated content-component reference.**
Auto-generate a doc of the components exported through `content-components.tsx`, with
props and examples. — Makes the curated authoring surface legible without guesswork.

**Dead-CSS audit.**
Use the existing lightningcss/AST tooling to flag selectors that match nothing in the
built output. — Keeps stylesheets legible as components churn, with no new dependency.

**Redirect manifest.**
Treat redirects as data in config and emit the platform-specific file at build. —
Redirects as inspectable source, not server-side magic.

**Cross-reference index.**
A build-time JSON index of internal links, footnote targets, and section references. —
Foundation for related-articles and orphan detection without re-parsing later.

**Smarter link checking.**
Cache internal link targets and re-validate only changed files. — Keeps verification
fast as the archive grows; still zero external services.

**Performance-budget trend tracking.**
Record budget results over builds so CSS/JS/HTML size creep is visible. — Keeps the
existing budget system observational and honest.

**Scaffolding commands.**
`pnpm new:component` / `pnpm new:article` prompts that emit boilerplate following the
component pattern and content model. — Encodes the architecture as guidance, lowering
onboarding friction.

---

## Performance, Accessibility & Privacy

**Speculation rules for instant navigation.**
A small `speculationrules` script prefetching predictable static pages at idle. —
Instant, calm navigation using the platform; no islands, no tracking.

**`content-visibility` for off-screen sections.**
Apply `content-visibility: auto` to below-the-fold regions (footnotes, related, margin
notes). — Native rendering optimization for free; calmer scrolling.

**Explicit loading hints.**
`fetchpriority` on the hero image and fonts, audited `loading="lazy"` with enforced
dimensions to kill layout shift. — Direct, inspectable performance signals that honor
the budgets.

**A minimal Content-Security-Policy and permissions policy.**
Tighten the emitted headers to `default-src 'self'` with hashed scripts, and disable
unused browser features. — An explicit, readable security posture; zero external
runtime already makes a strict CSP cheap.

**Reduced-data awareness.**
Honor `Save-Data` by serving lighter image variants and trimming optional chrome. —
Respects user agency through consent, not surveillance.

**Optional offline reading.**
A tiny service worker that caches HTML, CSS, and fonts and serves stale pages offline —
no push, no analytics. — "Works without drama," even without a network; privacy-first.

**Accessibility passes as build checks.**
Validate landmarks, skip-link behavior, `:focus-visible` outlines, and ARIA labelling
in the build. — Bakes accessibility into the pipeline as legible, inspectable
structure.

**Signed feeds.**
An optional integrity digest in the Atom feed using Node's crypto. — Publishing with
verifiable provenance, no external service.

---

## Interactive & Personality

These hydrate only as explicit islands under `src/islands/`, stay light, respect
`prefers-reduced-motion`, and exist to demonstrate the essays — not to decorate them.

**Live before/after CSS toggle.**
A code block that flips between two implementations of the same component (flexbox vs.
grid, with/without container queries). — Lets readers explore architectural choices
inside the CSS essays.

**Progressive-enhancement simulator.**
Stacked "HTML → +CSS → +JS" panes the reader can toggle layer by layer. — Makes the
scripting essay's core argument tangible.

**Semantic-markup inspector.**
Paste a fragment and see the accessibility tree / landmark outline beside the visual
render. — Makes the invisible structure from the markup essay visible.

**Selector specificity playground.**
Pit two selectors against each other and see which wins, with the specificity math
shown. — Demystifies the "global by default" trap the architecture essay describes.

**Design-token playground.**
Sliders for color, spacing, measure, and type scale that re-theme the article live,
with the generated `:root` shown. — Demonstrates how a good token system absorbs
design decisions.

**Reduced-motion comparison.**
A side-by-side of a transition with and without reduced motion. — Accessible restraint,
shown rather than asserted.

**Article structure overlay.**
A toggle that overlays the heading skeleton of the current article, opacity only. —
Reveals the structure-first mindset behind the writing.

**Generative CSS-grid piece.**
A pure CSS Grid + custom-properties layout that reshuffles on click, code always
visible. — Proof that the calm version is a choice: the web can be strange on purpose.

**Earned easter egg.**
A quiet, discoverable touch — a console note, a momentary typographic "glitch" that
snaps back — triggered only deliberately. — Personality hiding in plain sight, never
at the expense of the calm default.

---

## Using This Document

Pick something that genuinely fits the direction, sketch it until it is concrete
enough to plan, and only then move it to `roadmap.md` or a dedicated planning doc.
Most of these will, and should, stay here. The value is in having a wide field to
choose from — and in every choice being one the manifesto would approve.
