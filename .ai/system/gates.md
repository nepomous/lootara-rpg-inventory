# Gates

Commands come from `.ai/project/context.md` > Commands and `.ai/project/gates.local.md`. If a command does not exist, the result is `NOT AVAILABLE` — which is **not** a pass.

## Gate A — Completion (deterministic) · all tiers

| #   | Check                                          | Pass criterion                                                                                           |
| --- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| 1   | Typecheck                                      | exit code 0                                                                                              |
| 2   | Lint                                           | exit code 0                                                                                              |
| 3   | Tests                                          | exit code 0, or NOT AVAILABLE (reported)                                                                 |
| 4   | Secrets scan (staged files)                    | no hits (POL-SECRETS)                                                                                    |
| 5   | i18n key parity (only if visible text changed) | no missing keys in any locale                                                                            |
| 6   | No placeholders in changed files               | no `// ...`, `TODO: implement` (CORE-002)                                                                |
| 7   | Diff scope                                     | every changed file is explained by the brief/plan (CORE-005); no changes under `.ai/**` unless requested |

Output format: table `check | PASS/FAIL/NOT AVAILABLE | evidence (command + last lines)`.
Fix failures before reporting. Never edit a rule or gate to make it pass (CORE-006).

## Gate B — QA · T1, T2

QA verdict is PASS or PASS_WITH_NOTES; every acceptance criterion has evidence; no open blocker/major finding.

## Gate C — Review · T1, T2

Reviewer verdict is not BLOCK; no open blocker; every major is resolved or justified. T2 additionally requires the **security lens** to be present and the **plan approved by the human**.

## Gate D — PR / CI · all tiers

CI checks are green; the GitHub Reviewer ran; its blocker/major findings are handled or explicitly waived by the human.

## Gate E — Human · all tiers

Human approval and merge. Only the human.

## Loop limit

Developer ↔ QA/Reviewer: at most **2** correction iterations. If still failing, stop and escalate to the human with a summary of the impasse. QA vs Reviewer disagreements are not resolved between them: both findings go to the human.
