# POL-DEPS — Dependencies & SDK

- **TRIGGER:** Add, update or remove a dependency; SDK upgrade; code that uses framework APIs whose behavior depends on the version.
- **WHY:** Dependencies are attack surface and upgrade burden; SDK upgrades change APIs.
- **VERIFY:**
  1. Documentation for the exact installed/target version was read (EXPO-001).
  2. The need is justified: why not existing dependencies or platform APIs? Check maintenance activity, license compatibility with the project's obligations, size, and whether it adds a native module.
  3. Expo-managed packages installed via `npx expo install` (EXPO-002).
  4. A new native module means a new native build/dev client: flag it, and treat under POL-NATIVE.
  5. Lockfile updated; a single package manager.
  6. Major-version bumps and SDK upgrades are T2: read the changelog/migration guide, write a plan, run all gates.
  7. No second library for a purpose already served.
- **EVIDENCE:** Dependency diff + one-line justification per new dependency.
- **OWNER:** Architect (T2) · Developer · Reviewer.
- **ORIGIN:** legacy AGENTS.md "Expo HAS CHANGED" (generalized).
