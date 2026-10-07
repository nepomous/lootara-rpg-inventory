# POL-UI — UI flow & reuse

- **TRIGGER:** The task changes any user-facing screen, form, component or navigation.
- **WHY:** A past incident: an agent edited a component that was never used instead of the screen the router actually opened. Result: duplicated code and a feature that did not work.
- **VERIFY** (before touching any file):
  1. Trace the real navigation flow: entry point → trigger (button/FAB/link) → `router.push()`/link → real screen file → component actually rendered. Confirm which file is **really** opened.
  2. Reference search for each component to modify (example: `grep -r "ComponentName" app/ components/ hooks/`). Zero references outside its own file = dead code: do not edit; report it; consider deletion proposal.
  3. Confirm the target file is the right one, not just the one with the most similar name.
  4. Search for an existing component with the same purpose before creating a new one (CORE-003).
  5. Visible strings follow POL-I18N.
  6. Accessibility basics: labels on interactive elements, adequate touch targets, readable contrast, screen-reader order.
  7. Loading, empty and error states exist for data-driven UI.
  8. If the screen is a route: apply RN-008 and EXPO-005 (direct entry, params).
- **EVIDENCE:** Navigation path written out; reference-search commands and results; list of translation keys touched.
- **OWNER:** Developer executes · QA exercises direct entry and states · Reviewer confirms.
- **ORIGIN:** legacy "Checklist pré-implementação de UI" + "O que o Agente NÃO deve fazer" (items 9–11).
