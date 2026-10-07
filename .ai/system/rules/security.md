# Security rules

### SEC-001 — No secrets in the repository

- RULE: API keys, tokens, certificates, keystores and credentials are never committed. Only placeholder examples (e.g., `.env.example`).
- REASON: Git history is permanent and widely copied.
- VALIDATION: POL-SECRETS + Gate A secrets scan.
- ENFORCEMENT: deterministic · SEVERITY: blocker · ORIGIN: legacy "Não commitar chaves de API" + security checklist

### SEC-002 — Sensitive values only in secure storage

- RULE: Sensitive values at rest live only in the platform's secure storage, never in plain storage, logs or analytics.
- REASON: Plain storage is readable on rooted/backed-up devices.
- VALIDATION: Inspect storage writes in the diff.
- ENFORCEMENT: agent · SEVERITY: major · ORIGIN: new (generalized from the project's secure-storage usage)

### SEC-003 — No sensitive data in logs

- RULE: Do not log tokens, credentials, purchase receipts or personal data.
- REASON: Logs and crash reports leave the device.
- VALIDATION: Search the diff for new `console.*`/logging calls and inspect payloads.
- ENFORCEMENT: agent · SEVERITY: major · ORIGIN: new

### SEC-004 — Untrusted input is validated at boundaries

- RULE: Deep-link parameters, imported files and other external input are validated before use (see TS-004).
- REASON: They are attacker- or corruption-controlled.
- VALIDATION: Each boundary has validation and a failure path.
- ENFORCEMENT: agent · SEVERITY: major · ORIGIN: new

### SEC-005 — Least privilege for permissions

- RULE: Request only the permissions needed, at the moment needed, with truthful usage descriptions.
- REASON: Over-permissioning raises risk and store-review friction.
- VALIDATION: Permission changes in config are justified in the plan/report (POL-NATIVE).
- ENFORCEMENT: agent · SEVERITY: major · ORIGIN: new
