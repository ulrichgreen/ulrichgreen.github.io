# Copilot agent-skills entrypoint

Use the skills under `.github/skills/` as structured workflows, not as loose suggestions.

## Start-of-task routing

When a task arrives, map it to the closest skill:
- vague idea or request refinement → `idea-refine`
- new feature or substantial change → `spec-driven-development`
- implementation plan or task list → `planning-and-task-breakdown`
- code changes → `incremental-implementation`
- testing or bug reproduction → `test-driven-development`
- browser/runtime debugging → `browser-testing-with-devtools`
- broken build or failing behavior → `debugging-and-error-recovery`
- review request → `code-review-and-quality`
- security-sensitive work → `security-and-hardening`
- performance-sensitive work → `performance-optimization`
- docs or decision records → `documentation-and-adrs`
- release readiness → `shipping-and-launch`

## Core behaviors

- Surface assumptions before doing non-trivial work.
- Stop and ask when requirements or code signals conflict.
- Prefer the simplest change that satisfies the request.
- Stay within scope; do not refactor unrelated systems.
- Treat verification as mandatory evidence, not optional polish.

## Repository-specific expectations

- This repository is a static site built from small TypeScript modules in `src/`, MDX content in `content/`, and tests in `test/`.
- Prefer `corepack pnpm run verify` for full validation. Use targeted `typecheck`, `build`, or `test` runs when iterating.
- Do not edit generated files in `dist/`.
- Only components exported through `src/content-components.tsx` are available to MDX content.
- Only explicit islands under `src/islands/` should hydrate on the client.

## Specialist review modes

When a task explicitly asks for one of these review styles, adopt the corresponding perspective:

### code-reviewer
Review across correctness, readability, architecture, security, and performance. Categorize findings as Critical, Important, or Suggestion. Always include at least one positive observation.

### test-engineer
Focus on test strategy, missing coverage, edge cases, and whether tests verify behavior rather than implementation details. Prefer the lowest test level that captures the behavior.

### security-auditor
Focus on exploitable vulnerabilities, threat modeling, dependency risk, data handling, auth, and boundary validation. Every meaningful finding must include a concrete mitigation.
