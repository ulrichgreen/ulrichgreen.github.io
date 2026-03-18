# Component Pattern

This document captures the component structure established by `Hero` and turns it into a repeatable recipe.

Use it in two situations:

- to convert an existing standalone component into the new colocated structure
- to create new standalone components that should follow the same conventions from the start

The goal is not just folder tidiness. The goal is to make each standalone component legible as a small unit with a clear public entry point, a local style surface, and minimal coupling to the rest of the site.

## When To Use This Pattern

Use this pattern for a component when most of the following are true:

- it is a named, reusable UI unit rather than incidental markup inside one template
- it has enough component-specific styling that keeping those rules in `src/styles/components.css` makes the global stylesheet harder to scan
- it may grow a few adjacent implementation files over time
- its public API can be expressed as one exported TSX component

Do not force this pattern onto every file.

Keep a component as a single `.tsx` file when it is still trivial and has little or no component-specific styling.

## Target Shape

For a component named `Hero`, the target structure is:

```text
src/components/
  hero/
    hero.tsx
    hero.module.css
```

The same pattern generalizes to other standalone components:

```text
src/components/
  callout/
    callout.tsx
    callout.module.css

  figure/
    figure.tsx
    figure.module.css
```

The folder name should be lowercase and match the component file name.

## Responsibilities

### `component.tsx`

This is the component's public entry point.

It should:

- export the component itself
- define or import the component props
- import its local CSS module with native CSS-module semantics
- compose local classes with existing shared utility or structural classes when needed

It should not:

- know how CSS-module compilation works
- reach into global styling infrastructure beyond normal shared classes and tokens
- contain unrelated helper code that belongs at a broader layer

In practice, the component file should feel like the clearest possible statement of the component's markup and API.

### `component.module.css`

This file holds styles that are specific to the component.

It should contain:

- the component's private class names
- component-local states or variants
- component-local animation hookups
- selectors that only make sense in the context of that component

It should not become a second global stylesheet.

If a selector is shared across multiple components, move it to the appropriate global stylesheet instead of duplicating it into multiple modules.

## Shared vs Local Styling

This is the most important judgment call in the pattern.

Keep styles global when they are part of the site's shared language:

- shared layout wrappers such as `.section`
- shared typographic helpers such as `.label`, `.lede`, or `.heading-display`
- shared editorial header primitives that more than one component uses
- design tokens, keyframes, or rules that are intentionally site-wide

Keep styles local when they are specific to one component's structure:

- internal wrappers such as portrait containers, local body rows, or metadata dots
- component-specific spacing and arrangement
- component-specific interaction states
- animation timing applied only to that component's elements

The pattern is not "everything local". The pattern is "local by default, shared when the class is genuinely part of the common system."

## The Hero Example

`Hero` is the reference implementation.

Its current shape demonstrates the intended split:

- the component entry lives in [src/components/hero/hero.tsx](/Users/uhg/Personal/personal-site/src/components/hero/hero.tsx)
- the component-local styles live in [src/components/hero/hero.module.css](/Users/uhg/Personal/personal-site/src/components/hero/hero.module.css)
- shared editorial header primitives still live in the global stylesheets

That means the Hero markup composes both local and shared classes.

Examples:

- the root section keeps shared structural classes like `section` and `header`, then adds the local Hero root class
- the kicker keeps shared typography and header layout classes, then adds the local Hero kicker class
- the rule and metadata row still compose with shared `header__rule` and `header__meta` classes while adding local behavior and spacing

That composition is intentional. A CSS module should isolate the component's private surface, not block reuse of the site's shared design primitives.

## Recipe For Converting An Existing Component

### 1. Create the component folder

Move the component from:

```text
src/components/example.tsx
```

to:

```text
src/components/example/example.tsx
src/components/example/example.module.css
```

Do this even if the module CSS file starts nearly empty. The point is to establish the shape once.

### 2. Move imports to the new location

Update any imports that referenced the old file path.

If the component is exposed to MDX through `src/content-components.tsx`, update that file as part of the same change.

### 3. Add a native CSS-module import

Inside the component file, import the module directly:

```tsx
import styles from "./example.module.css";
```

Use `styles.foo` for local classes.

Do not add component-specific CSS resolution helpers inside the TSX file.

### 4. Separate local selectors from shared selectors

Audit the existing global CSS and split it deliberately.

Move into the CSS module:

- selectors prefixed or scoped to only this component
- local modifiers and internal wrappers
- local animation bindings

Leave in global CSS:

- shared primitives used by other components
- utility classes
- site-wide tokens, keyframes, and layered structure

If a selector looks shared but is actually only used once, prefer moving it local unless there is a clear reason to keep it as part of the shared system.

### 5. Preserve composition at the markup level

When a component relies on shared global classes, keep composing them in the JSX rather than copying their behavior into the module.

That usually means class strings like:

```tsx
<p className={`${styles.meta} header__meta label`}>
```

This is the right pattern when the element needs both the shared baseline behavior and component-specific refinement.

### 6. Keep the public API small

As you move the component, take the chance to trim accidental complexity.

Prefer:

- one exported component
- one local CSS module
- small, explicit props

Avoid introducing extra wrapper files, barrels, or variant systems unless the component actually needs them.

### 7. Verify the three layers

After conversion, verify:

- TypeScript still accepts the component and its CSS import
- the CSS bundle still contains the component's compiled styles
- the rendered HTML still composes the expected shared and local classes

In this repository, the usual checks are:

- `pnpm run typecheck`
- `pnpm build`
- `pnpm test`

## Recipe For New Components

When building a new standalone component, start with the target shape immediately.

### Start with the folder

Create the folder and both files first:

```text
src/components/new-component/
  new-component.tsx
  new-component.module.css
```

### Write the TSX around the public API

Define the props first, then write the minimal markup the component actually needs.

Import the local CSS module from the start.

### Keep the CSS local until it proves otherwise

Begin with local classes in the module.

Only move a rule into global CSS when one of these becomes true:

- another component needs the same selector-level behavior
- the rule is clearly part of the site's shared typographic or layout language
- keeping it local would duplicate design-system logic that already exists globally

### Prefer explicit composition over hidden abstraction

If a component needs shared structure plus local refinement, write both classes in the markup.

Do not invent a new abstraction layer just to avoid a two- or three-class `className`.

## Naming Guidance

Use predictable names.

- folder: lowercase, usually kebab-case if the component name has multiple words
- file: match the folder name
- exported component: PascalCase
- local CSS classes: short semantic names such as `.root`, `.body`, `.title`, `.meta`, `.media`, `.actions`

There is no need to preserve old BEM-style names inside a module if simpler local names are clearer.

Inside a CSS module, class names are already scoped. Take advantage of that.

## What Not To Do

Avoid these failure modes:

- moving files into folders without moving the component-specific CSS with them
- turning CSS modules into a dumping ground for rules that should stay shared
- duplicating shared global styles inside a local module just to reduce class composition in TSX
- adding barrels, `index.ts`, or extra indirection for a component that only needs one entry point
- creating separate pattern exceptions for each component instead of treating this as a default recipe

## Decision Rule

When unsure whether a rule or a file belongs inside the component folder, ask:

"Does this primarily exist to express this component, or does it primarily exist to express the site's shared language?"

If it expresses the component, keep it local.

If it expresses the shared language, keep it global.