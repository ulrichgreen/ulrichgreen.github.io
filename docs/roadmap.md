# Roadmap

Planned work, in rough priority order.

---

## Content Scaffolding

`pnpm create-article "Title"` and `pnpm create-page "Title"` — generate `.mdx` files with valid frontmatter.

- A script at `src/build/tools/create-content.ts`
- `pnpm create-article "On Abstraction"` → creates `content/articles/on-abstraction.mdx` with `layout: article`, today's date as `published`, and placeholder fields
- `pnpm create-page "Colophon"` → creates `content/colophon.mdx` with `layout: base`
- Derives a kebab-case filename from the title
- Accepts optional `--series "Name" --series-order N` flags for articles
- Fails if the derived filename already exists

---

## Inline Critical CSS

Inline above-the-fold styles in `<head>`, async-load the rest. Worth doing once the design settles.
