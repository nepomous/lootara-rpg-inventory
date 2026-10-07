# Workflow: Feature

Artifacts live in `.ai/runs/<id>/` (gitignored). Templates are in `.ai/system/templates/`.

## Running a role (v0.1 isolation)

Each role runs in a **new chat session**. Provide only the inputs allowed by that role's context matrix (`agents/<role>.md`). In v0.1 isolation is by instruction and by what the human feeds each session; if a role notices it received a forbidden artifact, it says so in its report and does not use it.

## Steps

1. **Triage** → `brief.md` (tier, policies, Architect yes/no).
2. **Architect** (T2 always; T1 if triggered) → `plan.md`. **T2: the human approves the plan before step 3.**
3. **Developer** → implements, runs Gate A, writes `dev-report.md`. Opens no PR yet if QA/Review are pending.
4. **QA** (T1, T2) → `qa-report.md`. Findings go back to the Developer as a findings list only.
5. **Reviewer** (T1, T2) → `review-report.md` (T2 includes the security lens). Findings go back the same way.
6. **PR**: Developer opens it with `templates/pull-request.md`. The description does **not** include QA/Reviewer conclusions.
7. **GitHub Reviewer** runs on the PR independently.
8. **Human** compares the local review and the GitHub review, decides, approves, merges.
9. **Retro**: if any agent erred or rework happened, write a retro (`templates/retro.md`).

## Stop conditions

- Correction loop > 2 iterations → escalate.
- Developer needs to deviate materially from the plan → stop and return to the Architect.
- Tier rises mid-task → re-triage.
