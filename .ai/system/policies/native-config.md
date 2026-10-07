# POL-NATIVE — Native & configuration

- **TRIGGER:** App config, build config (e.g., EAS), config plugins, permissions, URL schemes/deep links, route file creation/rename/deletion, native folders, release identifiers. Always T2.
- **WHY:** These changes affect store review, security surface and how the app is built and shipped.
- **VERIFY:**
  1. Permissions: least privilege (SEC-005), justified, usage descriptions present and truthful.
  2. Store policy impact considered (Apple/Google guidelines) for anything touching payments, external links, data use.
  3. Deep links / URL schemes / routes: every parameter treated as untrusted (SEC-004); direct entry to each affected route works and enforces its preconditions (RN-008).
  4. Config plugin used instead of manual native edits (EXPO-004).
  5. State whether the change is OTA-deliverable or needs a new native build.
  6. Both platforms covered, or one explicitly marked NOT EXECUTED.
  7. Environment separation (dev/preview/prod identifiers and keys); no secrets (SEC-001).
  8. Version/build identifiers change only in release tasks.
- **EVIDENCE:** Config diff with justification per change; list of affected routes and params.
- **OWNER:** Architect plans · Developer · QA (direct entry, both platforms) · Reviewer (security lens).
- **ORIGIN:** new (derived from the T2 categories: permissions, deep links, native code, release).
