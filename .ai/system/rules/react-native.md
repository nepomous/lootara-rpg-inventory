# React Native rules

### RN-001 — Functional components and hooks only

- RULE: Components are functional and use hooks. No class components.
- REASON: One consistent model; hooks are the supported path.
- VALIDATION: Search the diff for `extends Component|React.Component`.
- ENFORCEMENT: deterministic · SEVERITY: major · ORIGIN: legacy "Funcionais com hooks. Zero class components"

### RN-002 — Component size limit

- RULE: A component must not exceed `component_max_lines` (see project Parameters). Split into sub-components when it does.
- REASON: Large components mix concerns and resist review and testing.
- VALIDATION: Line count of changed component files.
- ENFORCEMENT: deterministic · SEVERITY: minor · ORIGIN: legacy "Máximo 200 linhas por componente" (value moved to project Parameters)

### RN-003 — UI does not touch persistence or network directly

- RULE: Components never access the database, storage or network directly. They go through hooks or the project's service layer.
- REASON: Keeps UI testable and data access in one place.
- VALIDATION: Inspect changed components for direct data-layer imports.
- ENFORCEMENT: agent · SEVERITY: major · ORIGIN: legacy "Nunca faça acesso ao banco diretamente dentro de um componente"

### RN-004 — Right home for each kind of state

- RULE: Async, persisted and server data goes through the project's async-state library. The global store holds only truly global state (session, UI preferences). Domain data is not copied into the global store.
- REASON: Duplicated state goes stale and creates two sources of truth.
- VALIDATION: Inspect new state: where does it live, who owns it?
- ENFORCEMENT: agent · SEVERITY: major · ORIGIN: legacy "Zustand apenas para estado verdadeiramente global" (generalized; libraries are in project Parameters)

### RN-005 — Use the project's styling system

- RULE: Layout and styling use the system declared by the project. Style objects are used only where that system cannot express the need (e.g., animations).
- REASON: Mixed styling approaches fragment the UI code.
- VALIDATION: Inspect new styles in the diff.
- ENFORCEMENT: agent · SEVERITY: minor · ORIGIN: legacy "NativeWind para layout; StyleSheet.create só para animações" (generalized)

### RN-006 — Platform-specific behavior is intentional

- RULE: Behavior that branches on platform must have a documented reason (code comment or business rule) and be verified on both iOS and Android.
- REASON: Platform branches often encode store-policy or OS constraints that are easy to break.
- VALIDATION: Each platform branch has a reason; QA covers both platforms (or marks one NOT EXECUTED).
- ENFORCEMENT: agent · SEVERITY: major · ORIGIN: legacy donation-only-on-Android rule (generalized)

### RN-007 — Virtualized lists for growing data

- RULE: Lists that can grow unbounded use virtualized list components, not `.map` inside a scroll view.
- REASON: Performance and memory degrade with size.
- VALIDATION: Inspect list rendering in the diff.
- ENFORCEMENT: agent · SEVERITY: minor · ORIGIN: new (proposed)

### RN-008 — Enforce critical preconditions at the action point

- RULE: A screen must not assume that a precondition was enforced by the screen that normally leads to it. Routes can be entered directly (deep link, restored state). Critical preconditions are enforced where the action happens.
- REASON: A gate placed only at the entry button is bypassed by any other way into the flow.
- VALIDATION: For each gated flow, list every entry point and confirm the check at the submit/action point.
- ENFORCEMENT: agent · SEVERITY: major · ORIGIN: legacy free-limit gating "defesa em profundidade no onSubmit (cobre deep-link)" (generalized)
