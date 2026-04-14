---
description: Run a test-driven workflow for new behavior or bug fixes.
---

Use the `.github/skills/test-driven-development` skill.

For new features:
1. Write tests that describe the expected behavior and fail first when practical
2. Implement the code to make them pass
3. Refactor while keeping tests green

For bug fixes:
1. Write a test that reproduces the bug
2. Confirm the test fails
3. Implement the fix
4. Confirm the test passes
5. Run the broader repository test suite for regressions

For browser-related issues, also use the `.github/skills/browser-testing-with-devtools` skill.
