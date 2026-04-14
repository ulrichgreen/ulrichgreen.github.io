---
description: Simplify code without changing behavior.
---

Use the `.github/skills/code-simplification` skill.

Simplify the target scope while preserving exact behavior:
1. Read `AGENTS.md`, `.github/copilot-instructions.md`, and any relevant path-specific instructions
2. Understand the code's purpose, callers, edge cases, and test coverage before touching it
3. Look for simplification opportunities such as guard clauses, clearer names, smaller functions, and dead-code removal
4. Apply each simplification incrementally
5. Re-run the relevant repository verification steps after each meaningful change
6. If a simplification introduces risk or breaks tests, revert it and choose a simpler alternative

Use `.github/skills/code-review-and-quality` to review the result.
