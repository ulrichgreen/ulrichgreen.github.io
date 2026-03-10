# ============================================================
# personal-site — build orchestration
# Usage:
#   make          — build everything
#   make clean    — remove dist/
#   make watch    — start dev server with live reload
# ============================================================

SHELL := /bin/bash
TSX := pnpm exec tsx

CONTENT_PAGES := $(wildcard content/*.mdx)
WRITING_PAGES := $(wildcard content/writing/*.mdx)

DIST_PAGES    := $(CONTENT_PAGES:content/%.mdx=dist/%.html)
DIST_WRITING  := $(WRITING_PAGES:content/writing/%.mdx=dist/writing/%.html)

PAGE_BUILD_DEPS := src/build/page.ts src/build/frontmatter.ts src/build/compile-mdx.ts src/build/build-content.ts src/build/render-context.tsx src/build/render-react-page.tsx src/build/writing-index.ts src/content-components.tsx src/templates/base.tsx src/templates/article.tsx src/components/site-head.tsx src/components/running-header.tsx src/components/article-header.tsx src/components/article-list.tsx src/islands/island.tsx src/islands/demo-widget.tsx src/islands/registry.ts src/types/content.ts src/types/islands.ts tsconfig.json
SITE_BUILD_DEPS := $(PAGE_BUILD_DEPS) src/build/site.ts src/build/layouts.tsx package.json pnpm-lock.yaml
SITE_CONTENT := $(CONTENT_PAGES) $(WRITING_PAGES)

.PHONY: build clean watch

# Default target
build: dist/style.css dist/site.js dist/islands.js dist/.pages-built

# CSS — process src/style.css through lightningcss
dist/style.css: src/styles/style.css src/styles/reset.css src/styles/tokens.css src/styles/base.css src/styles/layout.css src/styles/components.css src/styles/utilities.css src/styles/motion.css src/styles/print.css src/build/css.ts
	@mkdir -p dist
	$(TSX) src/build/css.ts

# Client JS — bundle the browser entries
dist/site.js dist/islands.js: src/client/site.ts src/client/enhancements.ts src/client/islands.ts src/build/client.ts src/islands/registry.ts src/islands/demo-widget.tsx
	@mkdir -p dist
	$(TSX) src/build/client.ts

dist/.pages-built: $(SITE_CONTENT) $(SITE_BUILD_DEPS)
	@mkdir -p dist
	$(TSX) src/build/site.ts
	@touch $@

# Dev server
watch:
	$(TSX) src/build/dev.ts

# Remove output
clean:
	rm -rf dist
