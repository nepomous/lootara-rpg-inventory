# Expo rules

### EXPO-001 — Read the docs for the exact SDK version

- RULE: Before writing code that uses Expo or `expo-*` APIs, read the documentation for the exact SDK version in `.ai/project/context.md` > Parameters (`https://docs.expo.dev/versions/v<SDK>.0.0/`).
- REASON: Expo changes between SDK versions; model memory may describe an older API.
- VALIDATION: dev-report cites the docs page consulted; Reviewer checks API usage against that version.
- ENFORCEMENT: agent · SEVERITY: major · ORIGIN: legacy AGENTS.md "Expo HAS CHANGED"

### EXPO-002 — Install Expo-managed packages with `npx expo install`

- RULE: Add Expo-managed packages with `npx expo install`, not plain `npm install`.
- REASON: It selects versions compatible with the SDK.
- VALIDATION: Dependency diff versions match the SDK-compatible ones.
- ENFORCEMENT: agent · SEVERITY: minor · ORIGIN: new

### EXPO-003 — Configuration through env; nothing secret in the client

- RULE: Config values come from app config + environment variables; `.env` is gitignored. `EXPO_PUBLIC_*` values are embedded in the client bundle and are public: never put real secrets there.
- REASON: Anything shipped in the app can be extracted.
- VALIDATION: Inspect config diffs; run POL-SECRETS.
- ENFORCEMENT: agent + deterministic · SEVERITY: blocker · ORIGIN: legacy "Não commitar chaves de API — use app.config.ts com process.env" (public-bundle nuance is new)

### EXPO-004 — Prefer config plugins; flag native changes

- RULE: Prefer config plugins over hand-editing native folders. Any change that needs a new native build (not OTA-deliverable) is flagged in the report.
- REASON: Manual native edits are lost on regeneration; builds vs OTA affect release.
- VALIDATION: Diff contains no manual native edits without justification; report states OTA-safe or not.
- ENFORCEMENT: agent · SEVERITY: major · ORIGIN: new

### EXPO-005 — Every route file is a URL

- RULE: Every file under the Expo Router app directory is a URL-addressable route. Creating, renaming or deleting route files changes the deep-link surface and is treated under POL-NATIVE.
- REASON: Routes are reachable outside the normal UI path.
- VALIDATION: Route file changes are listed with their params and preconditions (see RN-008).
- ENFORCEMENT: agent · SEVERITY: major · ORIGIN: new
