# Testing rules

### TEST-001 — Tests proportional to risk

- RULE: T1: new or changed logic has tests unless a justification is recorded. T2: every changed behavior has tests.
- REASON: Higher risk needs stronger regression protection.
- VALIDATION: Test files in the diff map to acceptance criteria.
- ENFORCEMENT: agent · SEVERITY: major · ORIGIN: new

### TEST-002 — Bug fixes start from a reproduction

- RULE: A bug fix starts with a failing test or a documented reproduction, and ends with a regression test when feasible.
- REASON: Proves the bug existed and stays fixed.
- VALIDATION: Test fails before the fix, passes after (evidence).
- ENFORCEMENT: agent · SEVERITY: major · ORIGIN: new

### TEST-003 — Test behavior, not implementation

- RULE: Tests assert observable behavior. Avoid asserting internal calls or structure unless that is the behavior.
- REASON: Implementation-coupled tests break on harmless refactors.
- VALIDATION: Reviewer inspects new tests.
- ENFORCEMENT: agent · SEVERITY: minor · ORIGIN: new

### TEST-004 — Deterministic tests

- RULE: No arbitrary sleeps, real clocks, random data or network in tests without control.
- REASON: Flaky tests destroy trust in the gate.
- VALIDATION: Inspect new tests; run twice if suspicious.
- ENFORCEMENT: agent · SEVERITY: major · ORIGIN: new

### TEST-005 — Never weaken a test to pass

- RULE: Do not delete, skip or loosen an existing test to make it pass. If a test is wrong, say so in the report and let the human decide.
- REASON: It converts a signal into noise.
- VALIDATION: Diff shows no removed/skipped tests without an explicit note.
- ENFORCEMENT: deterministic (grep `.skip|xit|xdescribe`) + agent · SEVERITY: blocker · ORIGIN: new

### TEST-006 — QA writes tests, not production code

- RULE: The QA role may add test files and fixtures. It never edits production code; bugs are reported with reproduction steps.
- REASON: A tester who fixes what they test stops being independent.
- VALIDATION: QA diff touches only test files.
- ENFORCEMENT: deterministic · SEVERITY: blocker · ORIGIN: new
