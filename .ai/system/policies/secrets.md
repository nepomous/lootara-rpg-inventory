# POL-SECRETS — Secrets & sensitive files

- **TRIGGER:** Every commit/PR. Also any change to env or config files.
- **WHY:** Git history is permanent; leaked credentials must be treated as compromised.
- **VERIFY:**
  1. Scan staged files for sensitive names (deterministic):
     ```bash
     git diff --cached --name-only | grep -E "\.env$|\.env\.|google-services\.json|GoogleService-Info\.plist|\.p12$|\.jks$|\.key$|\.mobileprovision$|secrets|credentials"
     ```
     Any hit (other than `.env.example`) = FAIL.
  2. Periodically scan history (deterministic):
     ```bash
     git log --all --diff-filter=A --name-only --format="" | grep -E "google-services|GoogleService|\.env|\.plist|\.p12|\.jks|\.key|secrets|credentials" | sort -u
     ```
  3. Never-commit list: `.env`, `.env.*` (except `.env.example` with placeholders), `google-services.json`, `GoogleService-Info.plist`, `*.p12`, `*.jks`, `*.key`, `*.mobileprovision`, `keystore.properties` with real values (the repo version holds only placeholders).
- **IF A HIT OCCURS — agent actions (allowed):**
  1. Do not push.
  2. Unstage: `git reset HEAD <file>`.
  3. Stop and report to the human.
- **IF A HIT OCCURS — human runbook (CORE-007: human only):**
  1. Revoke the exposed credentials immediately in the relevant consoles (listed in `.ai/project/context.md` > Credential consoles).
  2. Add the file to `.gitignore` before any new commit.
  3. If it was already committed, remove it from history (`git filter-repo --path <file> --invert-paths`) and force-push.
- **EVIDENCE:** Command output (empty = pass).
- **OWNER:** Developer runs (Gate A) · Reviewer confirms · Human executes the runbook.
- **ORIGIN:** legacy "Checklist de segurança".
