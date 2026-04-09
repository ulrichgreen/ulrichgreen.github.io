# Homepage Animation Design

Animation and interaction specification for the redesigned homepage centered on the "text files" manifesto.

---

## The Text

The homepage is built around three beats:

1. **Opening** — "It's just text files."
2. **Body** — The manifesto paragraph
3. **Close** — "Just some very well considered text files."

The animations should feel like the text _chose_ when to appear. Not a performance — a considered arrival.

---

## Design Decisions

### 1. Progressive reveal, by section

The text appears in three stages matching its three rhetorical beats. Not word-by-word (too theatrical), not all-at-once (wastes the structure). Section-by-section, with the middle paragraph revealing as a single unit. The reader gets a beat of silence between the opening line and the body — that pause _is_ the design.

### 2. Granularity: three blocks, one rule

| Element         | Role        | Animation      | Delay   | Duration |
|-----------------|-------------|----------------|---------|----------|
| Opening line    | The hook    | `fade-up`      | 0.1s    | 0.8s     |
| Horizontal rule | Structural  | `expand-x`     | 0.6s    | 0.9s     |
| Body paragraph  | The case    | `fade-up`      | 1.0s    | 0.8s     |
| Closing line    | The payoff  | `fade-up`      | 1.7s    | 0.9s     |

The rule acts as a breath. It expands between the hook and the argument, giving the opening line time to land before the body arrives. The closing line arrives last, with enough separation (0.7s after the body starts) that it reads as a resolution, not a continuation.

Total entrance sequence: ~2.6s. Long enough to feel intentional, short enough that it never feels like waiting.

### 3. Easing: the existing curve, plus one new one

The site's existing easing — `cubic-bezier(0.25, 0.46, 0.45, 0.94)` — is the right default. It's a gentle ease-out: things arrive and settle. No bounce, no overshoot.

For the closing line only, a slower ease-out that decelerates more gradually:

```
--easing-settle: cubic-bezier(0.23, 0.60, 0.35, 1.0);
```

This curve spends more time in the final 20% of the animation — it _settles_ rather than stops. The closing line should feel like it's placing itself down carefully. The difference is subtle but felt.

### 4. Interaction: almost none

**No hover animations on the manifesto text.** The text is the experience. Hover states on prose imply interactivity where there is none.

**Cursor stays default.** No pointer, no effects. This is text to read, not UI to operate.

**One exception — anchor links.** If the name "Ulrich Green" links to an about section or the article index, it gets the existing link treatment (underline thickens on hover, `0.3s` transition). Nothing custom.

**No scroll-based reveals for the manifesto.** The text should be visible when you arrive. Scroll-driven animation is appropriate for content _below_ the fold (the article list), not for the opening statement. The manifesto earns its animation on page load; making the reader scroll to unlock it would undercut the authority of the opening.

### 5. The opening: "It's just text files."

This line should arrive first and alone. It needs a beat of silence before anything else follows — the reader should sit with just this sentence.

**Treatment:**

- `fade-up` with a 0.1s delay — it doesn't start _instantly_ (which feels accidental) but nearly so.
- 0.8s duration — slightly longer than the current hero elements' 0.7s. The extra 100ms gives it weight.
- `translateY(1rem)` start position — the existing `fade-up` distance. This is already calibrated to the type scale and feels right.
- Display-size type (the existing `--type-size-display` or `--type-size-display-sm`) to give it presence.

After this line lands, nothing happens for ~0.5s. The rule then begins expanding. That gap is the point — it turns a line of text into a statement.

### 6. The closing: "Just some very well considered text files."

The payoff. This line needs to arrive with a different quality than the others — not bigger or louder, but more _settled_.

**Treatment:**

- `fade-up` but with the alternate easing (`--easing-settle`) — slower deceleration.
- 0.9s duration — the longest text animation. It takes its time arriving.
- 1.7s delay — arrives 0.7s after the body paragraph _starts_ animating, which means the body is mid-reveal when the reader's eye is drawn down to the closing. This creates a sense of the argument leading into its conclusion.
- Slightly smaller type than the opening (the opening is the display headline; the closing is a coda, not a second headline). `--type-size-fluid-lg` or similar.

The closing line should feel like the last thing placed on a page before it was published. Deliberate. Final.

### 7. Transition to content below

Below the manifesto there will likely be an article list or similar secondary content. The transition needs to:

- **Not compete.** The manifesto is the hero; the content below is navigation.
- **Signal a shift.** The reader should feel they've crossed from the statement into the archive.

**Treatment:**

- A horizontal rule (the existing `header__rule` pattern) between the manifesto section and the article list, using `expand-x` with a longer delay (~2.4s) so it appears after the manifesto sequence completes.
- The article list uses the existing `fade-up` with `animation-delay: 2.6s` — it waits for the manifesto to finish, then quietly arrives. Single animation, no stagger on individual list items. The manifesto got the choreography; the list just shows up.
- `scroll-margin-top` on the articles heading so anchor links clear the sticky header.

If the content below is fully below the fold, consider deferring its animation to scroll-entry using the existing `IntersectionObserver` pattern from `enhancements.ts` rather than a fixed delay. This avoids animating content the reader hasn't scrolled to yet.

---

## Keyframes

No new keyframes needed. The existing three are sufficient:

```css
/* Already defined in motion.css — reuse as-is */
@keyframes fade-up {
    from { opacity: 0; transform: translateY(1rem); }
    to   { opacity: 1; transform: translateY(0); }
}

@keyframes fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
}

@keyframes expand-x {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
}
```

The restraint of reusing three keyframes for the entire site — including this new section — _is_ the design. New content, same materials.

---

## New Token

One addition to `tokens.css`:

```css
--easing-settle: cubic-bezier(0.23, 0.60, 0.35, 1.0);
```

Used only for the closing line. The curve visualized:

```
  1.0 ┤                          ╭────────── (long, gentle settle)
      │                     ╭────╯
      │                ╭────╯
      │           ╭────╯
      │      ╭────╯
  0.0 ┤──────╯
      0.0                              1.0
```

Compared to `--easing-default`:

```
  1.0 ┤                     ╭──────────── (quicker arrival, shorter settle)
      │                ╭────╯
      │           ╭────╯
      │      ╭────╯
      │  ╭───╯
  0.0 ┤──╯
      0.0                              1.0
```

The difference: `--easing-settle` spends more time decelerating. It feels considered.

---

## CSS Implementation

For the manifesto module (e.g., `manifesto.module.css` or within the hero rework):

```css
@media (prefers-reduced-motion: no-preference) {
    .opening {
        animation: fade-up 0.8s var(--easing-default) 0.1s both;
    }

    .rule {
        animation: expand-x 0.9s var(--easing-default) 0.6s both;
        transform-origin: left center;
    }

    .body {
        animation: fade-up 0.8s var(--easing-default) 1.0s both;
    }

    .closing {
        animation: fade-up 0.9s var(--easing-settle) 1.7s both;
    }
}
```

Everything scoped inside `prefers-reduced-motion: no-preference`. When motion is reduced, the existing blanket override in `motion.css` collapses all durations to `0.01ms` — no additional work needed.

---

## Timing Diagram

```
Time (s)  0.0   0.2   0.4   0.6   0.8   1.0   1.2   1.4   1.6   1.8   2.0   2.2   2.4   2.6
          │     │     │     │     │     │     │     │     │     │     │     │     │     │
Opening   ·─────▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░│     │     │     │     │     │     │     │     │
          │     │     │     │     │     │     │     │     │     │     │     │     │     │
          │     │     │  [silence]│     │     │     │     │     │     │     │     │     │
          │     │     │     │     │     │     │     │     │     │     │     │     │     │
Rule      │     │     │     ·─────▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░│     │     │     │     │     │
          │     │     │     │     │     │     │     │     │     │     │     │     │     │
Body      │     │     │     │     │     ·─────▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░│     │     │     │
          │     │     │     │     │     │     │     │     │     │     │     │     │     │
Closing   │     │     │     │     │     │     │     │     │  ·──▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░
          │     │     │     │     │     │     │     │     │     │     │     │     │     │

· = delay (invisible)   ▓ = active animation   ░ = settling (final 20% of easing)
```

The overlaps are intentional. The body is still arriving when the closing begins — this creates a sense of flow rather than stop-start. But the _start_ of each phase is distinct.

---

## What This Avoids

- **No typewriter effects.** Character-by-character reveal is showy and implies the page is composing in real-time. The text was composed long ago. It arrived complete.
- **No parallax.** Depth effects serve illustration, not prose.
- **No blur transitions.** Blurring text to "focus" it is a cliché that fights readability.
- **No scale animations.** Text doesn't grow or shrink. It's set at the right size from the start.
- **No stagger on individual sentences.** The body paragraph is one thought. Revealing it sentence-by-sentence would fragment the argument and slow the reader down.
- **No infinite or looping animations.** Everything plays once. The page settles and stays settled.

---

## Reduced Motion Fallback

The existing `prefers-reduced-motion: reduce` block in `motion.css` handles this globally:

```css
@media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}
```

All manifesto elements appear instantly. The text is the experience regardless of motion capability. No separate reduced-motion design is needed — the text stands on its own.

---

## Summary

Four elements. Three keyframes. One new easing curve. 2.6 seconds of entrance choreography that mirrors the rhetoric of the text: statement, pause, argument, resolution.

The animations don't decorate the text. They _are_ the text's pacing — the same careful placement applied to time instead of space.
