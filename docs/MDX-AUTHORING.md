# MDX Authoring

This site now treats MDX as the default content format.

## Rules

Frontmatter stays separate from the body.

Writing pages should include `title`, `section`, `published`, and `description`.

Pages and essays should use `.mdx` under `content/`.

Do not use `import` or `export` inside MDX files.

Only approved components exposed through `src/content-components.tsx` are available in content.

## Approved Components

`<ArticleList />` renders the current writing index.

`<DemoWidget />` is a hydratable example island.

## Guidance

Use components sparingly. Most prose should stay prose.

Hydrate only when the component needs real client-side state.

Prefer explicit `description` frontmatter for articles instead of relying on automatic fallback.
