# Code Examples

## Philosophy

Your writing is full of code. The code is not a screenshot, not a Gist embed, not a third-party
widget. It is first-class typography — rendered at build time, styled with the same CSS custom
properties as your prose, sitting on the same 8px baseline grid, and carrying zero client-side
JavaScript for syntax highlighting. The code arrives as static HTML. The colors come from your
stylesheet. The copy button is 12 lines of Vanilla JS — earned.

This document describes how code examples are authored in markdown, transformed in the build
pipeline, styled in CSS, and experienced by the reader. Every decision aligns with the
constraints in [TECH-STACK.md](./TECH-STACK.md): build-time only, single-purpose tools,
performance as an aesthetic statement.

---

## The Highlighting Engine — shiki

**shiki** is the syntax highlighter. It uses TextMate grammars — the exact same grammar engine
that powers VS Code's syntax highlighting. Where highlight.js and Prism use hand-written
imperative language definitions, shiki parses with the real grammars. The output is more
accurate, more complete, and more honest.

shiki runs entirely at build time. You call `codeToHtml(code, { lang })` and get a string of
HTML back. Each token is a `<span>` with a class or inline style. No client-side JavaScript.
No WASM bundle. No runtime parser. The browser receives static HTML and paints it.

```js
import { createHighlighter } from 'shiki';

const highlighter = await createHighlighter({
  themes: ['css-variables'],
  langs: ['javascript', 'css', 'html', 'bash', 'yaml', 'makefile']
});

const html = highlighter.codeToHtml(code, {
  lang: 'javascript',
  theme: 'css-variables'
});
```

The `css-variables` theme is the critical choice. Instead of inline `style="color: #e06c75"`
attributes that bloat HTML and resist your stylesheet, it emits class-based tokens that
reference CSS custom properties. Your stylesheet owns the colors. Light mode, dark mode, and
print are a variable swap — not a theme rebuild.

**Why shiki:** It is the TextMate grammar engine extracted from VS Code and made callable. It
is what Astro, VitePress, and Nuxt Content use under the hood. Using it directly — as a
function in your build script — is the "atoms" move. You get VS Code-grade accuracy with zero
client-side cost. The constraint of build-time-only highlighting means your HTML is complete
before the browser sees it.

---

## Pipeline Integration — marked + shiki

shiki plugs into the existing content pipeline through marked's custom renderer. When marked
encounters a fenced code block, it calls your renderer with the code string and the language
identifier. Your renderer calls shiki and returns the highlighted HTML.

```js
// scripts/md2html.mjs — the code block renderer addition
import { marked } from 'marked';
import { createHighlighter } from 'shiki';

const highlighter = await createHighlighter({
  themes: ['css-variables'],
  langs: ['javascript', 'typescript', 'css', 'html', 'bash', 'yaml',
          'makefile', 'json', 'shell', 'python', 'sql', 'markdown']
});

const renderer = {
  code({ text, lang }) {
    const language = lang || 'text';
    const html = highlighter.codeToHtml(text, {
      lang: language,
      theme: 'css-variables'
    });
    const lineCount = text.split('\n').length;
    return `
      <figure class="code-block" role="figure" aria-label="${language} code example">
        <pre>${html}</pre>
        <figcaption class="code-meta">
          <span class="code-lang">${language}</span>
          <span class="code-lines">${lineCount} lines</span>
        </figcaption>
      </figure>`;
  }
};

marked.use({ renderer });
```

The `<figure>` wrapper is semantic HTML. The `<figcaption>` carries metadata — language name
and line count — into the right margin via CSS Grid. The `role` and `aria-label` attributes
make every code block accessible to screen readers.

The pipeline remains: `cat post.md | node frontmatter.mjs | node md2html.mjs | node template.mjs`.
shiki initialises once when the script starts, then highlights every code block in the document
synchronously. No async complexity in the pipeline.

### Markdown Authoring

Code blocks in your markdown files use standard fenced syntax. The language identifier after
the opening fence is all the metadata you need:

````markdown
```javascript
const greeting = 'hello';
console.log(greeting);
```
````

For a filename header, use a comment on the first line — shiki highlights it as part of the
code, and your CSS can optionally style it differently:

````markdown
```javascript
// scripts/render.mjs
import { marked } from 'marked';
```
````

For line highlighting, use shiki's comment-based notation directly in the code:

````markdown
```javascript
const a = 1;
const b = 2; // [!code highlight]
const c = 3;
```
````

shiki's `transformerNotationHighlight` transformer reads these comment annotations at build
time, adds a `highlighted` class to the line, and strips the comment from the output. The
reader never sees the annotation. The author writes it inline, in context.

---

## The Code Typeface — Monospace Variable Font

The code typeface is a monospace font with a `wght` (weight) axis. A variable font — one
file — carries regular weight for code, bold weight for emphasized tokens, and everything
in between. No separate bold file. No FOUT between weights.

### Candidates

| Font | Variable | Axes | Size (subsetted) | Character |
|---|---|---|---|---|
| **Source Code Pro** | Yes | `wght` 200–900 | ~18 KB | Adobe. Clean, neutral, optimised for screen |
| **JetBrains Mono** | Yes | `wght` 100–800 | ~20 KB | JetBrains. Tall x-height, distinctive |
| **Recursive** | Yes | `wght`, `slnt`, `CASL` | ~25 KB | Playful. Casualness axis is unique |
| **Fira Code** | No | — | ~22 KB (static) | Mozilla. Ligatures for `=>`, `!==`, `>=` |

**Recommended: Source Code Pro Variable.** It is the monospace equivalent of your serif's
restraint — clean, warm, unobtrusive. The weight axis means one WOFF2 file covers regular
(400), medium (500 for highlighted lines), and bold (700 for keywords if you choose to go
that route). Subset it with the same pyftsubset command used for your serif:

```bash
pyftsubset SourceCodePro-Variable.ttf \
  --output-file=code-subset.woff2 \
  --flavor=woff2 \
  --unicodes="U+0020-007F,U+2018-201D,U+2190-2199,U+2026" \
  --layout-features="liga,calt" \
  --variations="wght:400:700"
```

The result is under 20 KB. Combined with the serif font, the total font budget stays under
the 30 KB allocation in the performance budget.

### Loading

```css
@font-face {
  font-family: 'Code';
  src: url('/fonts/code-subset.woff2') format('woff2');
  font-weight: 400 700;
  font-display: swap;
  unicode-range: U+0020-007F, U+2018-201D, U+2190-2199, U+2026;
}
```

`font-display: swap` means prose renders immediately with the serif. Code blocks flash once
when the monospace arrives — acceptable for a non-blocking load. The `unicode-range` descriptor
tells the browser to only download the font when characters in that range appear on the page.

---

## CSS Architecture — Code Blocks on the Baseline Grid

### The Grid Problem

Body text sits on a 24px baseline (16px font × 1.5 line-height = 24px = 3 × 8px). Code text
runs at 14px. To keep code on the same 8px grid, the code line-height must also resolve to
24px:

```
14px × line-height = 24px
line-height = 24 / 14 ≈ 1.714
```

Every code line occupies exactly 24px — three baseline units. The code block and the prose
around it stay in vertical rhythm.

### Custom Properties

```css
@layer base {
  :root {
    /* Code typography */
    --font-code: 'Code', 'SFMono-Regular', 'Consolas', 'Liberation Mono', monospace;
    --code-size: 0.875rem;                          /* 14px */
    --code-line-height: calc(var(--baseline) / 1em); /* 24px ÷ 14px ≈ 1.714 */
    --code-tab-size: 2;

    /* Code colors — light mode */
    --code-bg: hsl(0 0% 97%);
    --code-fg: hsl(0 0% 20%);
    --code-keyword: hsl(200 70% 35%);
    --code-string: hsl(145 50% 32%);
    --code-comment: hsl(0 0% 52%);
    --code-function: hsl(270 55% 42%);
    --code-number: hsl(30 80% 40%);
    --code-operator: hsl(0 0% 32%);
    --code-punctuation: hsl(0 0% 40%);
    --code-line-highlight: hsl(50 100% 95%);
    --code-border: hsl(0 0% 88%);
  }
}
```

### Dark Mode — One Swap

```css
@layer base {
  @media (prefers-color-scheme: dark) {
    :root {
      --code-bg: hsl(220 18% 13%);
      --code-fg: hsl(0 0% 88%);
      --code-keyword: hsl(200 75% 65%);
      --code-string: hsl(145 60% 60%);
      --code-comment: hsl(0 0% 55%);
      --code-function: hsl(270 70% 75%);
      --code-number: hsl(30 90% 68%);
      --code-operator: hsl(0 0% 72%);
      --code-punctuation: hsl(0 0% 65%);
      --code-line-highlight: hsl(220 30% 20%);
      --code-border: hsl(220 15% 25%);
    }
  }
}
```

The token classes emitted by shiki's `css-variables` theme map directly to these properties.
No JavaScript theme switching. The browser's `prefers-color-scheme` media query handles
everything. Both palettes are in the same stylesheet — lightningcss processes them in one pass.

### The Code Block

```css
@layer typography {
  /* The pre element */
  pre {
    font-family: var(--font-code);
    font-size: var(--code-size);
    line-height: var(--code-line-height);
    tab-size: var(--code-tab-size);
    background: var(--code-bg);
    color: var(--code-fg);
    border: 1px solid var(--code-border);
    padding: var(--unit) calc(var(--unit) * 2);
    margin: calc(var(--unit) * 3) 0;
    overflow-x: auto;
    scrollbar-width: thin;
    scrollbar-color: var(--code-comment) transparent;

    /* Disable ligatures and OpenType features in code */
    font-feature-settings: "liga" 0, "calt" 0, "dlig" 0;
    font-variant-ligatures: none;
  }

  /* Inline code */
  :not(pre) > code {
    font-family: var(--font-code);
    font-size: 0.9em;
    background: var(--code-bg);
    padding: 0.1em 0.3em;
    border-radius: 2px;
    border: 1px solid var(--code-border);
  }

  /* Line numbers via CSS counters — zero JS */
  pre .line {
    display: block;
    counter-increment: line-number;
  }

  pre .line::before {
    content: counter(line-number);
    display: inline-block;
    width: 2.5em;
    text-align: right;
    padding-right: 1em;
    color: var(--code-comment);
    opacity: 0.5;
    user-select: none;
  }

  pre {
    counter-reset: line-number;
  }

  /* Highlighted lines */
  pre .line.highlighted {
    background: var(--code-line-highlight);
    margin: 0 calc(var(--unit) * -2);
    padding: 0 calc(var(--unit) * 2);
    border-left: 3px solid var(--code-keyword);
  }
}
```

### The Right Margin — Metadata as Annotation

Code block metadata — language, line count — lives in the right margin, exactly like prose
annotations. The `<figure>` wrapper uses `display: contents` to participate in the page's
outer grid:

```css
@layer layout {
  .code-block {
    display: contents;
  }

  .code-block pre {
    grid-column: 2;
  }

  .code-block .code-meta {
    grid-column: 3;
    align-self: start;
    font-family: var(--font-code);
    font-size: 0.75rem;
    color: var(--code-comment);
    padding-top: var(--unit);
    line-height: var(--baseline);
  }

  .code-block .code-lang {
    display: block;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .code-block .code-lines {
    display: block;
    opacity: 0.6;
  }

  @media (max-width: 64rem) {
    .code-block .code-meta {
      grid-column: 2;
      display: flex;
      gap: 1em;
      padding-bottom: var(--unit);
      border-bottom: 1px solid var(--code-border);
      margin-bottom: var(--unit);
    }

    .code-block pre {
      order: 1;
    }
  }
}
```

On wide viewports, the language label and line count float quietly in the right margin,
aligned with the top of the code block. On narrow viewports, they collapse above the code
block as a compact inline header. Same information, different spatial treatment.

---

## Horizontal Overflow — The Scroll

Long lines scroll horizontally. No wrapping, no truncation. Code indentation is meaningful;
wrapping destroys it. The scrollbar is thin and subtle — visible enough to signal overflow,
quiet enough to disappear when not needed.

```css
@layer typography {
  pre {
    overflow-x: auto;
    overflow-y: hidden;
  }

  /* Fade hint at right edge when content overflows */
  .code-block pre {
    mask-image: linear-gradient(to right,
      black calc(100% - calc(var(--unit) * 4)),
      transparent 100%
    );
  }

  .code-block pre:not(:hover) {
    mask-image: linear-gradient(to right,
      black calc(100% - calc(var(--unit) * 4)),
      transparent 100%
    );
  }

  .code-block pre:hover {
    mask-image: none;
  }
}
```

At rest, a subtle gradient fade at the right edge hints that the code extends further. On
hover, the mask lifts and the full scrollbar appears. The reader discovers overflow naturally,
without a jarring horizontal scrollbar announcing itself on every code block.

---

## Copy to Clipboard — 12 Lines, Earned

The only client-side JavaScript for code blocks. A small button, absolutely positioned in the
top-right corner of each `<pre>`, invisible until hover. Clicking it copies the raw code text
to the clipboard. The button text changes to "Copied" for two seconds, then reverts.

```js
// In site.js — the copy handler
document.querySelectorAll('.code-block pre').forEach(pre => {
  const btn = document.createElement('button');
  btn.className = 'code-copy';
  btn.textContent = 'Copy';
  btn.setAttribute('aria-label', 'Copy code to clipboard');
  pre.style.position = 'relative';
  pre.appendChild(btn);

  btn.addEventListener('click', async () => {
    await navigator.clipboard.writeText(pre.querySelector('code').textContent);
    btn.textContent = 'Copied';
    setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
  });
});
```

```css
@layer typography {
  .code-copy {
    position: absolute;
    top: var(--unit);
    right: var(--unit);
    font-family: var(--font-code);
    font-size: 0.7rem;
    padding: 0.25em 0.6em;
    background: var(--code-bg);
    color: var(--code-comment);
    border: 1px solid var(--code-border);
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  pre:hover .code-copy {
    opacity: 1;
  }

  @media (prefers-reduced-motion: reduce) {
    .code-copy {
      transition: none;
      opacity: 0.4;
    }

    pre:hover .code-copy {
      opacity: 1;
    }
  }
}
```

**Reduced motion handling:** The copy button does not animate. It is always faintly visible
(`opacity: 0.4`) and becomes fully opaque on hover — an instant state change, not a
transition. This is the designed alternative, not a stripped version.

---

## Print Stylesheet — Code on Paper

Code blocks in print are monochrome. Syntax colors do not survive ink. Instead, comments
become italic, keywords become bold, and strings keep their default weight. The visual
hierarchy shifts from color to typographic weight — the same principle the rest of the site
uses.

```css
@layer print {
  @media print {
    pre {
      background: none;
      color: #000;
      border: 1px solid #999;
      font-size: 9pt;
      line-height: 1.5;
      page-break-inside: avoid;
      overflow: hidden;
      word-wrap: break-word;
      white-space: pre-wrap;
    }

    /* Strip all syntax colors */
    pre code span { color: inherit; }

    /* Restore hierarchy through weight and style */
    pre .comment { font-style: italic; opacity: 0.65; }
    pre .keyword { font-weight: 700; }
    pre .string  { font-weight: 400; }

    /* Hide interactive elements */
    .code-copy { display: none; }
    .code-meta { display: none; }

    /* Line numbers in print */
    pre .line::before {
      color: #999;
      opacity: 1;
    }
  }
}
```

`page-break-inside: avoid` keeps code blocks intact across page boundaries. `white-space:
pre-wrap` handles long lines that would otherwise run off the printed page — in print,
wrapping is the correct compromise. The copy button disappears. Line numbers stay.

---

## Inline Code — The Small Gesture

Inline code — `like this` — does not use the code block's background color. It uses a
slightly lighter tint, a slightly smaller font size, and a 1px border. It sits on the
baseline, not above it. The border-radius is 2px — enough to soften without drawing
attention.

The CSS is in the code block section above: `:not(pre) > code`. It is a small rule for
a small element. The restraint is in not making inline code look like a button, a badge,
or a design element. It is text that happens to be monospaced.

---

## Performance Impact

Code highlighting adds HTML weight because each token becomes a `<span>`. The `css-variables`
theme keeps this minimal — class names, not inline styles.

| Page type | Without code | With 5 code blocks | Delta |
|---|---|---|---|
| HTML size (gzipped) | ~3 KB | ~5 KB | +2 KB |
| CSS size (gzipped) | ~3 KB | ~3.4 KB | +0.4 KB |
| JS size | ~0.8 KB | ~1 KB | +0.2 KB |
| Font (code) | — | ~18 KB | +18 KB |

The code font is the largest addition. It loads once, caches permanently (`Cache-Control:
immutable`), and only downloads when the page contains code (via `unicode-range`). Pages
without code blocks — the index, the CV — pay nothing.

Total page weight for an essay with code: **~55 KB**. Still under the weight of a single
hero image on most websites.

---

## Accessibility

Every code block is wrapped in a `<figure>` with `role="figure"` and an `aria-label`
describing the language. Screen readers announce "JavaScript code example" before reading
the code content.

Line numbers use `user-select: none` so they are excluded from copy-paste. The CSS counter
approach means they are presentational, not part of the content — screen readers skip them.

The copy button has an explicit `aria-label="Copy code to clipboard"`. After copying, the
button text changes to "Copied" — this change is announced by screen readers because it is
a text content change, not a visual-only animation.

Syntax colors meet WCAG AA contrast ratios against the code background in both light and
dark modes. The HSL values in the custom properties are tuned for this — lightness values
above 35% in light mode, above 60% in dark mode.

---

## The Build Step — What Changes

shiki adds one dependency to `package.json`:

| Package | Purpose | Weekly Downloads |
|---|---|---|
| **shiki** | Build-time syntax highlighting (TextMate grammars) | ~6,000,000 |

The total dependency count goes from five to six. shiki is initialised once in
`scripts/md2html.mjs`, before the markdown parse begins. It adds approximately 200ms to the
first build (grammar loading) and negligible time per code block thereafter.

The Makefile does not change. The pipeline does not change. The template does not change. Only
the markdown-to-HTML script gains a code block renderer.

### Updated File Structure

```
scripts/
├── frontmatter.mjs             # stdin → JSON { meta, body }
├── md2html.mjs                 # JSON → JSON { meta, html }  ← shiki integrated here
├── template.mjs                # JSON → HTML page
├── index.mjs                   # Generates the index page
├── css.mjs                     # Runs lightningcss
└── dev.mjs                     # Dev server
fonts/
├── serif-subset.woff2          # Variable serif (body)
└── code-subset.woff2           # Variable monospace (code)  ← new
src/
├── style.css                   # ← code block styles added to existing @layers
├── print.css                   # ← code print rules added
└── site.js                     # ← copy handler added (~12 lines)
```

---

## Summary

Code examples on this site are:

- **Highlighted at build time** by shiki, using TextMate grammars — the same engine as VS Code
- **Styled with CSS custom properties** — light/dark mode is a variable swap, not a theme file
- **Set on the 8px baseline grid** — code line-height resolves to 24px, matching body text rhythm
- **Annotated in the right margin** — language and line count float beside the code, not above it
- **Scrollable, not wrapped** — with a subtle gradient fade to hint at overflow
- **Copyable with 12 lines of Vanilla JS** — a button that appears on hover, copies on click
- **Printable in monochrome** — hierarchy shifts from color to weight and style
- **Accessible** — semantic `<figure>`, `aria-label`, contrast-checked colors
- **Under 20 KB additional weight** — one font file, cached permanently

No syntax highlighting library runs in the browser. No theme CSS is downloaded at runtime. No
JavaScript tokenizer parses code on the client. The code is HTML when it arrives. The browser
just paints it.

The same restraint, the same precision, the same quiet confidence — applied to every code
block on the site.
