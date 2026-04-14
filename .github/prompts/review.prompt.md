---
description: Conduct a five-axis review across correctness, readability, architecture, security, and performance.
---

Use the `.github/skills/code-review-and-quality` skill.

Review the current change across all five axes:
1. Correctness — Does it match the request? Are edge cases handled? Are tests adequate?
2. Readability — Clear names, straightforward logic, and repository-consistent structure?
3. Architecture — Follows existing static-site patterns and keeps boundaries clean?
4. Security — Input validated, secrets safe, dependencies safe? Use `.github/skills/security-and-hardening` when needed.
5. Performance — Build output, bundle size, and rendering costs remain reasonable? Use `.github/skills/performance-optimization` when needed.

Categorize findings as Critical, Important, or Suggestion, and include specific file references with concrete recommendations.
