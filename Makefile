# ============================================================
# personal-site — build orchestration
# Usage:
#   make          — build everything
#   make clean    — remove dist/
#   make watch    — start dev server with live reload
# ============================================================

SHELL := /bin/bash

CONTENT_PAGES := $(wildcard content/*.md)
WRITING_PAGES := $(wildcard content/writing/*.md)

DIST_PAGES    := $(CONTENT_PAGES:content/%.md=dist/%.html)
DIST_WRITING  := $(WRITING_PAGES:content/writing/%.md=dist/writing/%.html)

.PHONY: build clean watch

# Default target
build: dist/style.css dist/site.js $(DIST_PAGES) $(DIST_WRITING) dist/index.html

# CSS — process src/style.css through lightningcss
dist/style.css: src/style.css
	@mkdir -p dist
	node scripts/css.mjs

# Client JS — copy verbatim
dist/site.js: src/site.js
	@mkdir -p dist
	cp src/site.js dist/site.js

# Prose pages — content/*.md (not index.md, which is generated separately)
dist/%.html: content/%.md scripts/frontmatter.mjs scripts/md2html.mjs scripts/template.mjs templates/base.mjs templates/article.mjs
	@mkdir -p $(@D)
	cat $< | node scripts/frontmatter.mjs | node scripts/md2html.mjs | node scripts/template.mjs > $@

# Writing articles — content/writing/*.md
dist/writing/%.html: content/writing/%.md scripts/frontmatter.mjs scripts/md2html.mjs scripts/template.mjs templates/article.mjs
	@mkdir -p $(@D)
	cat $< | node scripts/frontmatter.mjs | node scripts/md2html.mjs | node scripts/template.mjs > $@

# Index — generated from all writing front matter
dist/index.html: $(WRITING_PAGES) content/index.md scripts/index.mjs templates/base.mjs
	@mkdir -p dist
	node scripts/index.mjs > $@

# Dev server
watch:
	node scripts/dev.mjs

# Remove output
clean:
	rm -rf dist
