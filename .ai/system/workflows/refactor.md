# Workflow: Refactor

Goal: change structure, **not behavior**. Default tier T1; T2 if the refactor touches a T2 pattern.

## Steps

1. **Triage** → `brief.md`. State the invariants: what must not change.
2. Architect if triggered (≥3 modules or new abstraction).
3. **Safety net first**: if the area lacks tests, add characterization tests before refactoring.
4. Refactor in small steps; Gate A must stay green at each step. Do not mix features or bug fixes in the same change.
5. `dev-report.md` states how behavior preservation was verified.
6. **QA** verifies preserved behavior: regression suite + manual scenarios for UI flows.
7. **Reviewer** checks that abstractions are justified (not speculative), duplication decreased, and no accidental behavior changes exist. An unreviewably large diff may be BLOCKed with a request to split.
8. PR, GitHub Reviewer, Human as in `feature.md`.
