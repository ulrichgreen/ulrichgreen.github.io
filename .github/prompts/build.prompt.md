---
description: Implement the next task incrementally with tests and repository verification.
---

Use the `.github/skills/incremental-implementation` and `.github/skills/test-driven-development` skills.

Pick the next pending task. For each task:
1. Read the task's acceptance criteria
2. Load relevant context (existing code, patterns, types, content model)
3. Write or update a test for the expected behavior when practical
4. Implement the minimum change needed
5. Run the repository verification steps (`corepack pnpm run typecheck`, `corepack pnpm run build`, `corepack pnpm run test`, or `corepack pnpm run verify`)
6. Summarize what changed and any remaining follow-up

If any step fails, follow the `.github/skills/debugging-and-error-recovery` skill.
