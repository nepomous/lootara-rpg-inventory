# TypeScript rules

### TS-001 — Strict mode

- RULE: TypeScript `strict` stays enabled.
- REASON: Catches null/undefined and implicit-type bugs at compile time.
- VALIDATION: `tsconfig` unchanged on `strict`; typecheck passes.
- ENFORCEMENT: deterministic · SEVERITY: blocker · ORIGIN: legacy "TypeScript strict"

### TS-002 — No implicit `any`; explicit `any` needs a reason

- RULE: No implicit `any`. An explicit `any` requires an adjacent comment with the reason; prefer `unknown` + narrowing.
- REASON: `any` disables the type system exactly where bugs hide.
- VALIDATION: Search the diff for `: any`, `as any`, `<any>`; each has a reason or is removed.
- ENFORCEMENT: deterministic (lint/grep) + agent · SEVERITY: major · ORIGIN: legacy "sem any implícito" (explicit-any nuance is new)

### TS-003 — Single source of truth for types

- RULE: Derive types from the schema/validation schema that owns the data; do not redeclare equivalent types by hand.
- REASON: Hand-copied types drift from the real data shape.
- VALIDATION: Inspect new types for duplication of existing schema types.
- ENFORCEMENT: agent · SEVERITY: major · ORIGIN: legacy "schema.ts é a fonte de verdade dos tipos" (generalized)

### TS-004 — Validate untrusted input at the boundary

- RULE: Data from outside the app (imported files, deep-link params, storage reads, network) is validated with a runtime schema before use. The validation library is defined by the project.
- REASON: TypeScript types do not exist at runtime.
- VALIDATION: Each boundary in the diff has validation; invalid input has a defined failure path.
- ENFORCEMENT: agent · SEVERITY: major · ORIGIN: legacy backup rule (import validated with a schema), generalized

### TS-005 — Suppressions need a reason

- RULE: `@ts-ignore`, `@ts-expect-error`, `eslint-disable` and non-null `!` assertions require an adjacent reason comment.
- REASON: Silent suppressions hide real defects.
- VALIDATION: Search the diff for these tokens.
- ENFORCEMENT: deterministic · SEVERITY: minor · ORIGIN: new

### TS-006 — Naming and language conventions come from the project

- RULE: Follow the conventions declared in `.ai/project/context.md` > Parameters (language of identifiers, comment language, file naming).
- REASON: Consistency is project-specific.
- VALIDATION: Reviewer compares new names to the declared convention.
- ENFORCEMENT: agent · SEVERITY: minor · ORIGIN: legacy "Nomes ... em inglês" (parameterized)
