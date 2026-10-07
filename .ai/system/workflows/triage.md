# Workflow: Triage

Triage is a **procedure**, not an agent. Run it at the start of a task and again whenever the diff grows into a new area.

## Inputs

The task description and `.ai/project/risk-map.md`.

## Steps

1. Write `brief.md` from `templates/brief.md`: task, acceptance criteria (draft them if missing), out of scope.
2. Classify the tier: match the files expected to change **and** content patterns against the risk map and the category definitions below. Take the **highest** tier matched. In doubt, take the higher one.
3. Architect trigger: T2 → always. T1 → only if ≥3 modules are touched, a new abstraction/dependency/data-model change is needed, or the brief is ambiguous. T0 → never.
4. List triggered policies (AGENTS.md table + risk-map).
5. Record tier, reason, policies and any human override in `brief.md`.

## Tier definitions

| Tier            | Meaning                                                                                                                                                                                                       |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **T0 Trivial**  | Docs, typos, comments, visual-only tweaks with no logic, local renames; no T1/T2 pattern matched                                                                                                              |
| **T1 Normal**   | Features, bug fixes, refactors that do not touch T2 patterns                                                                                                                                                  |
| **T2 Critical** | Auth, payments/entitlements, database (schema/migration/data layer), sensitive data, permissions, deep links/routes, native code/config, build/release config, major dependency or SDK upgrades, CI/workflows |

## Rules

- The tier **only goes up** during execution. If the Developer's diff touches a higher-tier pattern: stop, re-run triage, follow the higher pipeline.
- The human may override up or down; the override is recorded in the brief.

## Pipelines

```text
T0:  Developer → Gate A → PR → GitHub Reviewer → Human
T1:  [Architect*] → Developer → Gate A → QA → Reviewer → PR → GitHub Reviewer → Human
T2:  Architect → (human approves plan) → Developer → Gate A → QA → Reviewer (+ security lens)
     → PR → GitHub Reviewer → Human
```

`*` only when the Architect trigger in step 3 applies.
