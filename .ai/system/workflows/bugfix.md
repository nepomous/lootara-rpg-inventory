# Workflow: Bugfix

Default tier T1 (T0 only if trivial and obviously safe; T2 if the root cause or fix touches a T2 pattern).

## Steps

1. **Triage** → `brief.md`. Acceptance criteria = "bug no longer reproduces" + "no regression in neighbors".
2. **Reproduce** the bug (steps or a failing test). If it cannot be reproduced, say so and ask the human before changing code.
3. **Root cause** with evidence (`file:line`). Distinguish cause from symptom. If the root cause sits in a T2 area, re-triage.
4. **Failing test first** when feasible (TEST-002).
5. **Minimal fix**: smallest change that removes the root cause (CORE-005).
6. **Regression test**, then Gate A.
7. `dev-report.md` states: root cause, why this fix, what else could share the cause.
8. **QA** focuses on the repro, the neighbors of the root cause, and callers of the changed code.
9. **Reviewer**, PR, GitHub Reviewer, Human as in `feature.md`.
