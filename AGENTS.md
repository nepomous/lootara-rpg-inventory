# AGENTS.md

This repository uses the **AI Engineering System v0.1**. This file is the single entry point for every AI agent (Copilot, Claude, others).
Do not load everything. Load by role and by trigger.

## 1. Always read first

1. `.ai/system/rules/core.md`
2. `.ai/project/context.md`

## 2. Your role

Your role is given by the prompt: **Architect**, **Developer**, **QA**, **Reviewer** or **GitHub Reviewer**.
Read `.ai/system/agents/<role>.md` and obey its **context matrix**: do not read what your role must not see.
No role given → act as **Developer** and start with triage.

## 3. Route the task

1. Triage: `.ai/system/workflows/triage.md` (uses `.ai/project/risk-map.md`) → tier T0 / T1 / T2.
2. Workflow: `.ai/system/workflows/feature.md`, `bugfix.md` or `refactor.md`.
3. Done = gates in `.ai/system/gates.md` + `.ai/project/gates.local.md`.

## 4. Load stack rules only when the task touches the area

| Area         | File                               |
| ------------ | ---------------------------------- |
| TypeScript   | `.ai/system/rules/typescript.md`   |
| React Native | `.ai/system/rules/react-native.md` |
| Expo         | `.ai/system/rules/expo.md`         |
| Tests        | `.ai/system/rules/testing.md`      |
| Security     | `.ai/system/rules/security.md`     |

## 5. Load policies only when triggered

| Policy      | Trigger                                                                | File                                      |
| ----------- | ---------------------------------------------------------------------- | ----------------------------------------- |
| POL-UI      | Any user-facing screen / component / navigation change                 | `.ai/system/policies/ui-flow-reuse.md`    |
| POL-I18N    | Any user-visible text added or changed                                 | `.ai/system/policies/i18n.md`             |
| POL-DB      | Schema, migrations, queries, data layer                                | `.ai/system/policies/database.md`         |
| POL-SECRETS | Every commit / PR; env or config changes                               | `.ai/system/policies/secrets.md`          |
| POL-DEPS    | Add / update / remove a dependency; SDK upgrade; framework API usage   | `.ai/system/policies/dependencies-sdk.md` |
| POL-NATIVE  | App config, eas.json, plugins, permissions, deep links, native folders | `.ai/system/policies/native-config.md`    |
| POL-MON     | Premium, entitlements, ads, purchases, donation                        | `.ai/project/policies/monetization.md`    |
| POL-FREE    | Character limit / free-plan gating                                     | `.ai/project/policies/freemium-limits.md` |
| POL-BAK     | Backup export / import                                                 | `.ai/project/policies/backup.md`          |

Project business rules: `.ai/project/business-rules.md` (load when the task touches product behavior).
Product spec: `SPEC.md` (if present; load when the task touches product behavior).

## 6. Hard limits (all roles)

- Never edit `.ai/**`, `AGENTS.md` or `CLAUDE.md` unless the human explicitly asked for that change. Propose rule changes as a retro (`.ai/project/retros/`).
- Never claim "done" or "passes" without evidence (command output or `file:line`).
- Never perform irreversible actions (force-push, history rewrite, credential rotation, release). Report to the human.
