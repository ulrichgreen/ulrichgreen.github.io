---
description: Run the pre-launch checklist before shipping a change.
---

Use the `.github/skills/shipping-and-launch` skill.

Run through the pre-launch checklist:
1. Code quality — typecheck, build, and tests pass
2. Security — no secrets, validated inputs, and safe dependency choices
3. Performance — generated assets stay within budget and no unnecessary client work is introduced
4. Accessibility — keyboard navigation, semantics, and contrast still hold
5. Documentation — relevant docs and instructions stay current
6. Rollback — identify how to back out the change safely

Report any failing checks and help resolve them before the change is shipped.
