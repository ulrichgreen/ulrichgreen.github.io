---
description: Break an approved spec or change request into small, verifiable tasks.
---

Use the `.github/skills/planning-and-task-breakdown` skill.

Read the existing spec (if there is one) and the relevant codebase sections. Then:
1. Enter plan mode — read only, no code changes
2. Identify the dependency graph between components
3. Slice work vertically (one complete path per task, not horizontal layers)
4. Write tasks with acceptance criteria and verification steps
5. Add checkpoints between phases
6. Present the plan for human review

For this repository, return the plan in chat by default. Only create plan files when the user explicitly asks for them.
