# Tech Stack

## Philosophy

Use the atoms, not the molecules. Every tool here is either a dependency of something famous or a
standalone primitive the industry has buried under abstraction. Nothing in this stack has a logo.
Nothing has a conference. Most of these tools are already on your machine or one `npm install` away
from doing exactly one thing, well.

The entire build is a dependency graph expressed in Make, a content pipeline expressed in UNIX
pipes, and a handful of Node scripts that read stdin and write stdout. The site itself is static
HTML, raw CSS, and a few lines of Vanilla JS — earned, not imported.

---

## The Stack

### Build Orchestration — GNU Make

The original dependency graph engine, shipping since 1976. Make sees your source files, knows
your output files, and rebuilds only what changed. It parallelises with `-j4`. It is
self-documenting: the Makefile *is* the build specification.

Most web developers reach for npm scripts, gulp, or a framework CLI. These are wrappers around
the problem Make already solved. For a static site with well-defined inputs and outputs — markdown
in, HTML out — Make is not retro. It is precisely correct.

```makefile
CONTENT  := $(wildcard content/*.md)
PAGES    := $(CONTENT:content/%.md=dist/%.html)

dist/%.html: content/%.md scripts/render.mjs templates/base.mjs
	@mkdir -p $(@D)
	cat $< | node scripts/frontmatter.mjs | node scripts/md2html.mjs | node scripts/template.mjs > $@

build: $(PAGES)
clean:
	rm -rf dist
```

Each rule is a UNIX pipeline. Each script does one thing. Make handles the rest.

**Why Make:** Incremental builds. Explicit dependency graph. Zero configuration files.
Runs everywhere. The constraint of declarative rules forces clean architecture.

---

### Content Pipeline — marked + gray-matter

**marked** is the markdown parser. 35,000+ GitHub stars. The function, not the framework — you
call `marked.parse(string)` and get HTML back. It powers VS Code's markdown preview. Its custom
renderer API lets you intercept every token: headings, blockquotes, horizontal rules, links.
This is how section breaks become typographic events and footnote markers become spatial anchors.

**gray-matter** is the front matter extractor. It separates YAML metadata from markdown content
in a single function call. It powers every static site generator — Astro, Eleventy, Gatsby,
Hugo's Node tooling — but is never credited. For this site, front matter carries the data model:

```yaml
---
title: On Constraints
published: 2025-01-15
revised: 2025-03-02
words: 1400
note: I rewrote the third section four times.
---
```

The `revised` field and `note` field are first-class. Reading time is a word count, not a
lie. The pipeline reads front matter, then transforms markdown, then injects both into a
template — three discrete steps, each a separate script connected by pipes.

**Why these two:** Single-purpose. Zero opinions about your content model. Composable via
stdin/stdout. marked's custom renderer is the only extension point you need for typography-aware
HTML output.

---

### Templating — Tagged Template Literals

No template engine. No new syntax. No partials, no helpers, no compilation step.

Templates are ES module files that export a single tagged template literal function. The build
script imports them and calls them with data. This is JavaScript's native string interpolation
elevated to a design pattern:

```js
// templates/base.mjs
export default (data, content) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${data.title}</title>
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <header class="running-header">
    <span>ULRICH</span> / <span>${data.section}</span> / <span>${data.title}</span>
  </header>
  <main>${content}</main>
</body>
</html>`;
```

Your IDE understands it. Prettier formats it. There is no abstraction to learn, maintain,
or debug. The template *is* the output, with holes.

**Why template literals:** Zero dependencies. Full JavaScript expression power inside `${}`.
No compilation. No runtime. The constraint of no logic-in-templates forces your data to be
perfectly shaped before it arrives.

---

### CSS — Raw Modern CSS + lightningcss

The stylesheet is written in raw, modern CSS. Custom properties for the 8px baseline grid.
`@layer` for cascade control. Native nesting. `clamp()` for fluid type. `font-variation-settings`
for the variable font's weight and optical size axes. `font-feature-settings` for discretionary
ligatures, historical forms, and contextual alternates. `@media print` for the CV. Grid for the
main column and right margin layout. All of it lands in a single file.

**lightningcss** is the only CSS tool in the chain. Built by the Parcel team, written in Rust,
it replaces PostCSS + autoprefixer + cssnano in a single pass. It parses your CSS into an AST,
applies vendor prefixes for your browser targets, minifies, and writes the output. It is
10–100× faster than the JavaScript equivalents. For a site that writes real CSS, this is the only
processing you need:

```js
import { transform } from 'lightningcss';

const { code } = transform({
  filename: 'style.css',
  code: Buffer.from(css),
  minify: true,
  targets: { chrome: 120, firefox: 121, safari: 17 }
});
```

**Why raw CSS + lightningcss:** Modern CSS needs no preprocessor. Custom properties replace
variables. Native nesting replaces SASS nesting. `@layer` replaces specificity hacks.
lightningcss handles the last-mile transforms — vendor prefixes and minification — without
an ecosystem of plugins. One tool, one pass, done.

---

### Typography — Self-Hosted Variable Font + pyftsubset

The typeface is a variable serif with `wght` (weight) and `opsz` (optical size) axes. It ships
as a single `.woff2` file, subsetted to the exact Unicode ranges the site uses.

**pyftsubset** from the fonttools library is the industry standard for font subsetting. It is
what Google Fonts uses. It preserves variable font axes — critical for the scroll-linked weight
shift and optical size storytelling. It retains OpenType layout features: ligatures, contextual
alternates, historical forms.

```bash
pyftsubset MySerif.ttf \
  --output-file=MySerif-subset.woff2 \
  --flavor=woff2 \
  --unicodes="U+0020-007F,U+2018-201D,U+2013-2014,U+2026" \
  --layout-features="liga,dlig,calt,hlig" \
  --variations="wght:300:700,opsz:8:48"
```

The result is a font file under 30KB that carries the full weight and optical size range, all the
ligatures and alternates, and nothing else. Performance as an aesthetic statement.

**Why pyftsubset:** Surgical control over axes, features, and glyph ranges. Produces the smallest
variable font files. The Python dependency is worth it — this runs once, at font-selection time,
not on every build.

---

### Development — chokidar + http + ws

The development server is a single Node script. It uses three primitives:

**chokidar** watches the filesystem. It is the most depended-upon file watcher in the npm
ecosystem — the engine inside webpack, Vite, and every build tool you have used. Using it
directly is the point. You see every event. You control every response.

**Node's `http` module** serves static files from `dist/`. No Express. No middleware.
A request handler that reads a file and writes a response.

**ws** is the WebSocket library. 22,000+ GitHub stars. The WebSocket server behind Socket.io
and countless production systems. Here it does one thing: when a file changes, it sends a
`reload` message to the browser. A three-line client script listens and calls
`location.reload()`.

The entire dev server — file serving, WebSocket upgrade, file watching, live reload injection —
is under 40 lines of code. No hot module replacement. Full page reload. Honest.

```js
chokidar.watch('src').on('change', () => {
  clients.forEach(ws => ws.send('reload'));
});
```

**Why these three:** They are the primitives that every dev server is built from. Using them
directly means there is nothing between you and your development loop. When something breaks,
you read 40 lines, not 40,000.

---

### Deployment — rsync

```bash
rsync -avz --delete dist/ deploy@server:/var/www/site/
```

One command. Differential transfer — only changed bytes cross the wire. Atomic from the
filesystem's perspective. Works over SSH, which you already have. No CI pipeline, no vendor
dashboard, no build minutes, no environment variables.

**Why rsync:** The deployment tool that predates CI/CD by decades. For a static site where the
build runs locally and the output is a directory of files, rsync is not a shortcut. It is the
correct tool. The absence of a deployment platform is itself a choice — your site depends on
SSH and a filesystem, both of which will outlast every PaaS.

---

### Client-Side JavaScript — Vanilla, Earned

The site carries no framework, no library, no polyfill. The JavaScript is a single file,
under 1KB, handling four interactions:

1. **Running header** — an `IntersectionObserver` that updates the fixed header text as
   sections scroll past.
2. **Scroll-linked weight shift** — a `requestAnimationFrame` loop that maps `scrollY` to
   `--wght`, easing from 300 to 400 over the first 1000px.
3. **Footnote reveal** — a click handler that calculates the footnote's vertical position
   and interpolates it into the right margin.
4. **Page arrival** — a `sessionStorage` check that triggers a single 800ms opacity fade
   on first visit.

Each interaction is 5–15 lines. No build step. No bundler. The `<script>` tag has a `defer`
attribute and that is the entire loading strategy.

**Why Vanilla JS:** The browser *is* the runtime. `IntersectionObserver`,
`requestAnimationFrame`, `font-variation-settings` via CSS custom properties — these are not
workarounds. They are the platform. Using them directly is the most maintainable choice because
there is nothing to maintain.

---

## The Absence List

What this stack does not use, and why.

| Absent Tool | Reason |
|---|---|
| **React / Vue / Svelte** | A static site has no state to manage. Runtime JS for rendering text is an architectural error. |
| **Next.js / Nuxt / Astro** | Frameworks for building frameworks. The abstraction serves the framework's needs, not yours. |
| **Tailwind** | Utility classes in HTML are a second stylesheet with worse syntax. Raw CSS is shorter at this scale. |
| **webpack / Vite / Parcel** | Bundlers solve the problem of shipping JavaScript. This site ships almost none. |
| **TypeScript** | Type safety for 40 lines of DOM scripting is ceremony without benefit. JSDoc covers IDE hints. |
| **SASS / LESS** | Solved by native CSS custom properties, nesting, and `@layer`. The preprocessor is now the browser. |
| **PostCSS** | Replaced by lightningcss. One Rust binary beats an ecosystem of JavaScript plugins. |
| **npm scripts** | Hidden in `package.json`, non-composable, no dependency graph. Make is the explicit alternative. |
| **Babel** | Modern Node and modern browsers need no transpilation. ES modules are the standard. |
| **ESLint / Prettier** | For 200 lines of build scripts, linting is overhead. Read the code. It is short enough to read. |

---

## Performance Budget

The site targets a 100 Lighthouse score and a sub-50ms load on a warm connection. The budget:

| Asset | Budget |
|---|---|
| **HTML** | < 8 KB gzipped |
| **CSS** | < 4 KB gzipped |
| **Font** | < 30 KB (WOFF2, subsetted variable) |
| **JS** | < 1 KB |
| **Total** | < 43 KB |

No images on text pages. No third-party requests. No analytics script. The speed is the design.

---

## File Structure

```
personal-site/
├── Makefile                        # Build orchestration
├── package.json                    # Dependencies: marked, gray-matter, chokidar, ws, lightningcss
├── content/
│   ├── index.md                    # The sparse index — essay titles and dates
│   ├── colophon.md                 # How the site was built, barely linked
│   ├── cv.md                       # The single unbroken sentence
│   └── writing/
│       └── on-constraints.md       # Essays with frontmatter
├── templates/
│   └── base.mjs                    # Tagged template literal — the only template
├── src/
│   ├── style.css                   # Single stylesheet, @layer organised
│   ├── print.css                   # CV print stylesheet — a deliverable
│   └── site.js                     # Under 1KB — four interactions, earned
├── scripts/
│   ├── frontmatter.mjs             # stdin → JSON { meta, body }
│   ├── md2html.mjs                 # JSON → JSON { meta, html }
│   ├── template.mjs                # JSON → HTML page
│   ├── index.mjs                   # Generates the index page from all posts
│   ├── css.mjs                     # Runs lightningcss on the stylesheet
│   └── dev.mjs                     # Dev server: http + ws + chokidar
├── fonts/
│   └── serif-subset.woff2          # Variable font, subsetted with pyftsubset
└── dist/                           # Output — git-ignored, rsynced to production
```

---

## Dependencies

Exactly five npm packages. Zero transitive surprises.

| Package | Purpose | Weekly Downloads |
|---|---|---|
| **marked** | Markdown → HTML | ~8,000,000 |
| **gray-matter** | YAML front matter extraction | ~5,000,000 |
| **chokidar** | Filesystem watching | ~30,000,000 |
| **ws** | WebSocket server | ~50,000,000 |
| **lightningcss** | CSS minification + autoprefixing | ~5,000,000 |

Plus **pyftsubset** (Python, fonttools) for one-time font subsetting. Not in `package.json`
because it runs once, not on every build.

---

## How Each Design Principle Maps to the Stack

| # | Principle | Implemented With |
|---|---|---|
| 1 | Baseline grid | CSS custom properties (`--unit: 8px`), debug overlay toggled by `B` key |
| 2 | Optical size axis | `font-variation-settings: "opsz" var(--opsz)` in CSS |
| 3 | Running header | `IntersectionObserver` in `site.js`, `<header>` in `base.mjs` |
| 4 | OpenType features | `font-feature-settings: "liga" 1, "dlig" 1, "hlig" 1, "calt" 1` in CSS |
| 5 | Margin as second voice | CSS Grid: `grid-template-columns: 1fr min(65ch, 90%) minmax(12rem, 1fr)` |
| 6 | Section breaks | marked custom renderer — `***` becomes a typographic gesture, not `<hr>` |
| 7 | The fold | Design discipline + `100vh` first section in `base.mjs` template |
| 8 | Fluid type | `clamp()` values tuned per element, 60–75ch measure enforced |
| 9 | Scroll-linked weight | `requestAnimationFrame` + `--wght` custom property, 300 → 400 |
| 10 | Hidden links | CSS `transition: text-decoration-thickness 1.2s ease-in` on `a` |
| 11 | Page arrival | `sessionStorage` + CSS `opacity` transition, 800ms, once per session |
| 12 | Footnote reveal | Vanilla JS: calculate vertical offset, interpolate into right margin |
| 13 | Index as homepage | `scripts/index.mjs` generates a sparse, typeset list from front matter |
| 14 | Reading time | `words` field in front matter + `note` field for personal disclosure |
| 15 | CV as sentence | `content/cv.md` — content, not tooling |
| 16 | Revised date | `revised` field in gray-matter front matter |
| 17 | Colophon | `content/colophon.md` — barely linked, fully honest |
| 18 | Reduced motion | `@media (prefers-reduced-motion: reduce)` with designed static alternatives |
| 19 | Print stylesheet | `src/print.css` — a separate, refined deliverable |
| 20 | Performance | The stack itself: 43KB total, zero frameworks, 100 Lighthouse |

---

## The Connective Tissue

Every tool in this stack was chosen because it does one thing and exposes its internals. Make
shows you the dependency graph. marked shows you the token stream. gray-matter shows you the
parse boundary. lightningcss shows you the AST. chokidar shows you the filesystem events.
ws shows you the WebSocket frames.

There is nothing to configure because there is nothing hidden. The build is a pipeline you can
read in a single `Makefile`. The site is HTML, CSS, and a few lines of JS you can read in a
single sitting.

The restraint is the point. The simplicity is the flex.
