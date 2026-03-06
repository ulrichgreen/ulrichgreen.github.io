# Handcrafted Personal Site Tech Stack

## Decision

Build the site as a static document system, not an app.

## Recommended stack

- **Content:** Markdown for essays and notes, with a few hand-written HTML pages for the homepage, CV, and colophon.
- **Build:** [Pandoc](https://pandoc.org/) called from a tiny `Makefile`.
- **Templates:** One Pandoc HTML template plus a small set of includes for the running header, metadata line, and margin notes.
- **Styling:** One hand-written `styles.css` built around CSS custom properties, `clamp()`, `@font-face`, and a print stylesheet.
- **Interaction:** One very small `site.js` file in plain JavaScript for the running header, footnote reveal, debug grid toggle, and restrained motion.
- **Hosting:** A static host such as GitHub Pages or Cloudflare Pages, with fonts and assets self-hosted.
- **Local preview:** `python -m http.server` or another trivial static file server.

## Why this is the right fit

This stack stays close to the grain of the web. It keeps the site hand-built, legible, and easy to maintain years from now.

It also matches the tone of the site:

- **Swiss discipline:** plain HTML and plain CSS make the grid, spacing, and typography the main event.
- **Editorial warmth:** Markdown keeps writing at the center while Pandoc gives you dependable footnotes, metadata, and clean HTML output.
- **Quiet confidence:** Vanilla JavaScript is enough for the few interactive touches you want, without turning the site into a software project.
- **Performance as aesthetics:** no framework runtime, no hydration, no client router, no bundler complexity.

## How the tools map to the feel of the site

| Goal | Tool choice |
| --- | --- |
| Baseline grid, fluid type, generous margins, print styling | Plain CSS with custom properties and `clamp()` |
| Optical size, ligatures, subtle weight changes | Self-hosted variable font with OpenType features in CSS |
| Running header and scroll-aware UI | Tiny Vanilla JavaScript with `IntersectionObserver` |
| Footnotes that move into the margin | Pandoc footnotes plus a few lines of custom JavaScript |
| Colophon and revision dates | Markdown front matter rendered through a Pandoc template |
| Fast, durable build process | `make build` running Pandoc over markdown sources |

## What to avoid

To protect the handcrafted quality, avoid tools that add abstraction without helping the reading experience:

- React, Next.js, Astro, or other application-style frameworks
- Tailwind or utility-first CSS that obscures the typographic system
- A CMS before the site actually needs one
- Client-side routing
- A JavaScript bundler unless the site grows beyond a single small script

## Suggested structure

```text
content/
  writing/
  notes/
pages/
  index.html
  cv.html
  colophon.html
templates/
  page.html
assets/
  css/styles.css
  js/site.js
  fonts/
Makefile
```

## Build philosophy

Keep the whole build understandable in one sitting:

1. Write in Markdown.
2. Render content pages with Pandoc.
3. Keep a few key pages hand-written in HTML.
4. Serve the output as plain static files.

If a future tool choice makes the site feel more convenient but less authored, it is the wrong choice.
