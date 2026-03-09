---
title: Colophon
description: How this site was built — tools, decisions, and constraints.
section: colophon
---

# Colophon

This site is a collection of static files. No framework, no build pipeline that requires a runtime, no node_modules folder checked into version control. Just a Makefile, a handful of Node scripts, and the conviction that the web works fine when you let it.

## Planning

The site began as a set of planning documents. TECH-STACK.md captured the tool decisions early — marked for Markdown processing, gray-matter for frontmatter parsing, Make as the build orchestrator. SITE-PLANNING.md laid out the page structure, the URL scheme, and the rough content plan before a single template was written. CODE-EXAMPLES.md served as a scratchpad for snippet patterns — how to wire up a template function, how to walk the content directory, how to pass frontmatter data into layout partials. SURPRISE-IDEAS.md collected the ideas that arrived uninvited: small interactions, typographic experiments, things worth trying without committing to them.

Working from documents before code kept the scope honest.

## Build

`make` drives the whole thing. Source Markdown files in `content/` are processed by a Node script that uses gray-matter to extract frontmatter and marked to render the body to HTML. The output lands in `docs/` as plain HTML files. A second pass copies `static/` assets — fonts, CSS, images — into `docs/static/`. Running `make clean && make` rebuilds everything from scratch in under two seconds.

There is no watch mode. Rebuilding is fast enough that it doesn't matter.

## Design

The visual design is raw CSS — no preprocessor, no utility framework, no CSS-in-JS. A single stylesheet with an 8px baseline grid keeps vertical rhythm consistent across type sizes. Custom properties handle the colour tokens and spacing scale. The type is set in a system font stack that resolves to something sensible on every platform.

There is a small Vanilla JS file for four progressive enhancements: updating the fixed running header as you scroll through sections, shifting the body font weight subtly as you scroll down, revealing footnotes into the right margin (or inline on narrow screens), and a one-time page-arrival fade on first visit. Everything works without JavaScript — these are additions, not requirements.

## Principles

This site has zero external dependencies at runtime. No CDN fonts, no analytics script, no third-party anything. Every byte served is a byte I wrote or explicitly chose to include. The tradeoff is manual work when something needs updating. The benefit is a site that loads instantly, works offline once cached, and will still render correctly in ten years.

Constraints, as it turns out, are generative. The absence of a framework forced considered decisions. The absence of external dependencies forced self-sufficiency. The result is a site I understand completely — which means I can fix it, extend it, and trust it.
