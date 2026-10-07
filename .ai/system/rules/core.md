# Core rules

Rule format: `RULE` (what) · `REASON` (why) · `VALIDATION` (how to check) · `ENFORCEMENT` (deterministic | agent | human) · `SEVERITY` · `ORIGIN` (where it came from; `new` = proposed in v0.1, validate in use).

### CORE-001 — Evidence over assertion

- RULE: Any claim of "works / passes / done" must come with evidence: command output or `file:line`.
- REASON: Unverifiable claims hide failures; reviewers cannot audit them.
- VALIDATION: Reports contain command + output excerpt or references. Claims without evidence are discarded.
- ENFORCEMENT: agent · SEVERITY: major · ORIGIN: new

### CORE-002 — No placeholders in files on disk

- RULE: Never leave placeholders (`// ...`, `// rest of code`, `TODO: implement`) or elided code in a file written to disk.
- REASON: Elided code silently deletes or breaks logic when applied.
- VALIDATION: Search the diff for placeholder patterns (Gate A check 6).
- ENFORCEMENT: deterministic · SEVERITY: blocker · ORIGIN: legacy "não omitir partes do código com `// ...`" (adapted: the "always show the whole file in chat" part was dropped; agents edit files directly)

### CORE-003 — Search before creating

- RULE: Before creating a file, component, hook or util, search the repo by name and by purpose for an existing one that serves the same need.
- REASON: Duplicates drift apart and cause fixes to land in the wrong place.
- VALIDATION: The report lists what was searched and found.
- ENFORCEMENT: agent · SEVERITY: major · ORIGIN: legacy "Não criar um novo componente/arquivo sem verificar..."

### CORE-004 — Confirm the target is live before editing

- RULE: Before modifying a component or module, confirm by reference search that it is actually used. Zero references outside its own file = dead code: report it, do not edit it. Never assume a file is in use because it exists.
- REASON: Evolving codebases accumulate dead code; editing it wastes the task and creates duplicates.
- VALIDATION: Report includes the reference search (command + result).
- ENFORCEMENT: agent · SEVERITY: blocker · ORIGIN: legacy "Não editar um componente sem confirmar que é importado" + "Não assumir que um arquivo em components/ está em uso"

### CORE-005 — Scope discipline

- RULE: Change only what the task requires. Unrelated problems are reported, not fixed.
- REASON: Mixed diffs are harder to review and to revert.
- VALIDATION: Every changed file maps to the brief/plan (Gate A check 7).
- ENFORCEMENT: agent · SEVERITY: major · ORIGIN: new

### CORE-006 — Rules are not yours to bend

- RULE: No agent edits rules, policies, gates, agent definitions or risk-map to make a task pass. Propose the change as a retro.
- REASON: Self-modifying guardrails stop being guardrails.
- VALIDATION: Diff contains no changes under `.ai/**`, `AGENTS.md`, `CLAUDE.md` unless the human asked.
- ENFORCEMENT: deterministic · SEVERITY: blocker · ORIGIN: new

### CORE-007 — Irreversible actions belong to the human

- RULE: Force-push, history rewrite, branch deletion, data deletion, credential rotation and release/publish actions are performed only by the human. The agent reports and proposes.
- REASON: Cannot be undone; high blast radius.
- VALIDATION: No such command appears in agent logs/reports as executed.
- ENFORCEMENT: human · SEVERITY: blocker · ORIGIN: legacy security checklist (`git filter-repo` + force-push step)

### CORE-008 — State what you did not verify

- RULE: Every QA and Review report, and the dev-report, ends with "What I did not verify".
- REASON: Honest boundaries let the human decide where to look.
- VALIDATION: Section present and non-empty (write "nothing" only if truly nothing).
- ENFORCEMENT: agent · SEVERITY: major · ORIGIN: new

### CORE-009 — Project constraints win

- RULE: Constraints declared in `.ai/project/context.md` (e.g., "no backend") override agent preferences and common practice.
- REASON: The project owner has context the agent lacks.
- VALIDATION: Plan and diff contain nothing that contradicts a declared constraint.
- ENFORCEMENT: agent · SEVERITY: blocker · ORIGIN: legacy "O que o Agente NÃO deve fazer" (generalized)

### CORE-010 — Ask when ambiguity changes the outcome

- RULE: If the brief is ambiguous in a way that would change the design or behavior, ask before building (T1/T2). Otherwise state the assumption in the report.
- REASON: Building the wrong thing costs more than one question.
- VALIDATION: Assumptions are listed in plan/dev-report.
- ENFORCEMENT: agent · SEVERITY: minor · ORIGIN: new

### CORE-011 — Done means gates passed

- RULE: A task is complete only when the gates required by its tier have passed with evidence (`gates.md`).
- REASON: "Done" must be checkable.
- VALIDATION: Gate A table in dev-report; later gates in their reports.
- ENFORCEMENT: agent + deterministic · SEVERITY: blocker · ORIGIN: legacy "ao final de cada prompt, executar tsc..." (generalized into Gate A)
