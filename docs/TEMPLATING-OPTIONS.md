# Templating Options

## Philosophy

The current tagged-template-literal approach is correct in one important sense: it ships zero
JavaScript to the browser by default, keeps the build legible, and does not ask you to adopt a
framework just to emit HTML. But it is also fair to admit the downside: writing large documents as
interpolated strings gets visually noisy fast. Closing tags disappear into backticks. Conditionals
turn into punctuation puzzles. The source starts to feel like escaped HTML rather than authored
markup.

So the question is not "should this site become React." The question is: **what authoring model gets
you React-like composability while preserving the site's zero-runtime, build-time-only discipline?**

The non-negotiables:

- static HTML output
- zero JavaScript in the browser by default
- islands only when explicitly requested
- components can be plain functions
- layouts stay easy to read in source
- no giant framework decision hiding inside the templating choice

That narrows the field nicely.

---

## What Good Looks Like for This Site

The right templating system for this site should optimize for five things:

1. **Readable source** — prose-heavy layouts should look like markup, not string assembly.
2. **Build-time rendering** — every page should render to HTML before the browser sees it.
3. **Composable layouts** — wrappers, partials, footnotes, figures, pull quotes, and metadata blocks
   should all be reusable without inventing a mini DSL every time.
4. **View-source honesty** — the output should stay boring, semantic, and inspectable.
5. **Optional islands** — if you later want a tiny interactive component, you should opt into a
   script tag for that island alone rather than smuggling a runtime onto every page.

Any option that compromises those should be treated as suspicious, no matter how nice the syntax is.

---

## Option 1 — Build Your Own Tiny JSX SSG

This is the most "I miss React, but I still respect static HTML" path.

The idea is simple: write components in JSX, but do **not** ship React to the browser. Instead,
compile JSX into function calls that build HTML strings at build time.

```jsx
export function EssayLayout({ title, section, children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <title>{title}</title>
      </head>
      <body>
        <header class="running-header">
          <span>ULRICH</span> / <span>{section}</span> / <span>{title}</span>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
```

At build time, a compiler turns that into calls like `h('header', props, child1, child2)`. Your
own renderer turns that tree into escaped HTML. The browser receives plain HTML. No hydration. No
client runtime. No virtual DOM on the client. React is reduced to its most useful idea: components
as functions.

### What It Would Take

To make your own little React-flavored SSG library, you need only a few moving parts:

1. **A JSX transform** — use `esbuild`, `Babel`, or TypeScript in `jsx: preserve` / custom factory
   mode so `.jsx` files compile to your `h()` function.
2. **A tiny element factory** — `h(tag, props, ...children)` returns a plain object like
   `{ tag, props, children }`.
3. **A `Fragment` implementation** — for sibling groups without wrapper elements.
4. **A `renderToString()` function** — recursively renders elements, escapes text and attributes,
   handles void tags, and flattens arrays.
5. **A small escaping layer** — this is the security-critical bit: text nodes and attribute values
   must be HTML-escaped by default.
6. **A component convention** — components are just functions that receive props and return nodes.
7. **A page entry contract** — each page exports a function returning a fully rendered document or a
   body fragment to place inside a base layout.
8. **An explicit island hook** — a component can request a script only if it opts in with metadata
   like `Component.browser = '/assets/toggle.js'`.

That is not a framework. That is a weekend.

### The Architectural Shape

The stack could stay almost identical:

- markdown and front matter still produce structured data
- layout components move from template literals to JSX
- `render.mjs` imports a page component and calls `renderToString()`
- Make still orchestrates everything
- the browser still gets static HTML and CSS unless a page opts into an island

### Islands Without Betraying the Default

The important rule: **interactive code is attached to the HTML after server rendering, not required
to produce it**.

That means:

- render the full component to HTML at build time
- emit a `data-island` marker only for components that ask for one
- include a tiny island loader only on pages that contain opted-in islands
- mount behavior onto existing DOM nodes instead of hydrating the whole document

The page stays fully readable without JavaScript. JavaScript becomes enhancement, not dependency.

### Why This Fits

This option gives you the React mental model you miss:

- components
- props
- composition
- conditional rendering that reads like JavaScript, not punctuation
- nested layouts that look like markup

But it preserves the site's deeper values:

- static output
- zero browser JS by default
- inspectable HTML
- no framework lock-in

**Recommendation:** if you want the ergonomics of React without inheriting React-the-platform, this
is the best fit.

---

## Option 2 — HTML ASTs with hastscript / unified

This is the "I want to manipulate document structure the way a compiler would" option.

Instead of writing strings or JSX, you build HTML syntax trees directly:

```js
import { h } from 'hastscript';

const page = h('main', [
  h('h1', 'On Constraints'),
  h('p', 'The page is assembled as a syntax tree, not a string.')
]);
```

This is nerdy in the good way. It aligns with the site's content-pipeline nature because markdown is
already an AST transformation problem. If you are already using parsers, renderers, and build
steps, moving templating into explicit trees is conceptually clean.

### Why It Fits

- structural transforms are easy
- sanitization and escaping are less error-prone
- integrating markdown ASTs and HTML ASTs feels natural
- plugins can manipulate headings, footnotes, figures, and metadata with precision

### Why It Might Be Too Much

The source is less pleasant to author than JSX. Great for compiler brains; less great for leisurely
page layout work. If the main complaint about template literals is readability, raw AST authoring may
solve the wrong problem.

---

## Option 3 — Hiccup-Style Arrays in JavaScript

This is the "extremely small, extremely legible once you buy in" option.

Instead of angle brackets, a node is an array:

```js
['main',
  ['h1', 'On Constraints'],
  ['p', 'Small tuples all the way down.']
]
```

It is halfway between JSX and AST authoring. The representation is compact, serializable, and easy
to manipulate. It also looks satisfyingly austere — a nice match for a site built from low-level
primitives.

### Why It Fits

- trivial to render to HTML
- trivial to transform programmatically
- no compiler required
- easy to keep zero-runtime in the browser

### Why It Might Annoy You

If you are used to React, this does not scratch the same ergonomic itch. It is elegant, but not
visually close to HTML. It makes you look like a nerd in the precise, home-built, "I can explain my
tuple renderer at dinner" sense.

---

## Option 4 — XML Authoring + XSLT

This is the "make the site feel like a private research project from 2004" option.

Author pages or content fragments as well-formed XML. Transform them into HTML with XSLT at build
time. Keep CSS and the browser output totally normal.

This is wildly unfashionable, which is part of the appeal. It is also deeply aligned with a
document-heavy, semantic, mostly static site.

### Why It Fits

- ideal for structured documents
- excellent for repeated semantic transforms
- zero browser runtime required
- makes content and presentation separation brutally explicit

### Why It Is Dangerous

XSLT is incredibly powerful, but it absolutely changes the personality of the project. You stop
building a site and start building a publishing system. That may be a delightful kind of overkill,
but it is still overkill.

**Verdict:** gloriously nerdy, maybe too much machinery unless the site becomes much more archival or
book-like.

---

## Option 5 — Tagged Templates, but with an HTML Builder Layer

This is the conservative option: keep template literals, but stop writing raw giant strings.

Instead of:

```js
return `<article><h1>${title}</h1><p>${body}</p></article>`;
```

you use a tiny helper:

```js
html.article(
  html.h1(title),
  html.p(body)
);
```

or:

```js
html`
  <article>
    <h1>${title}</h1>
    <p>${body}</p>
  </article>
`;
```

with better escaping, indentation helpers, and component wrappers.

### Why It Fits

- minimal migration from the current stack
- preserves zero client-side JavaScript
- no big conceptual shift

### Why It Probably Does Not Solve the Real Complaint

If template literals already feel cumbersome, polishing them may not change the underlying fact that
you are still editing big string-shaped documents. This is the smallest change, not the most
meaningful one.

---

## The Deliberately Nerdy Shortlist

If the goal is to pick something aligned with the site's nature while also signaling taste, these
are the strongest candidates:

1. **Custom JSX-to-string renderer** — the best balance of ergonomics and restraint.
2. **hastscript / unified HTML AST pipeline** — the most architecturally pure.
3. **Hiccup-style arrays** — tiny, elegant, severe, and very ownable.
4. **XML + XSLT** — the most gloriously uncompromising document-engine answer.

Notably absent on purpose:

- Nunjucks
- Handlebars
- Mustache
- Pug
- EJS

Those are normal templating libraries. They solve the basic problem, but they do not feel especially
true to this site's "small primitives, no framework personality, static by default" character.

---

## Recommended Direction

If you want the most future-proof path, build a **tiny JSX-based static renderer** and stop there.

That gives you:

- React-like authoring
- zero JavaScript shipped by default
- opt-in islands only
- a tiny amount of code you fully understand
- an upgrade path if you later want partial hydration for a footnote widget, theme toggle, or some
  hidden "full experience" mode

The implementation can stay extremely small:

- `jsx-runtime.mjs` — `h`, `Fragment`
- `render-html.mjs` — `renderToString`, `escapeHtml`
- `templates/` or `components/` — layout functions in JSX
- `scripts/render.mjs` — page loading and final document render
- optional `islands-manifest.mjs` — maps explicit browser components to script files

This keeps the site's deepest promise intact: the browser gets HTML first. JavaScript is a conscious
extra, never the price of admission.

---

## Practical Migration Path

If you want to test the idea without rewriting the whole project:

1. keep the current markdown + front matter pipeline
2. replace only the outer layout template with JSX
3. render one page type through the new renderer
4. prove that the output HTML is unchanged or better
5. add one opt-in island as a test case, if you actually need one

If that feels better to write, continue. If not, you can back out with almost no sunk cost.

That is the nicest part of this direction: it is not a framework bet. It is just a better authoring
surface for the same static site.
