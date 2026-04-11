---
phase: 1
slug: foundations
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-11
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property               | Value                                 |
| ---------------------- | ------------------------------------- |
| **Framework**          | jest-expo (migrating from Vitest)     |
| **Config file**        | `jest.config.js` — Wave 0 installs    |
| **Quick run command**  | `npx jest --testPathPattern=src/test` |
| **Full suite command** | `npx jest --coverage`                 |
| **Estimated runtime**  | ~30 seconds                           |

---

## Sampling Rate

- **After every task commit:** Run `npx jest --testPathPattern=src/test`
- **After every plan wave:** Run `npx jest --coverage`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type   | Automated Command          | File Exists | Status     |
| ------- | ---- | ---- | ----------- | ----------- | -------------------------- | ----------- | ---------- |
| 1-01-01 | 01   | 0    | FOUND-03    | setup       | `npx jest --listTests`     | ❌ W0       | ⬜ pending |
| 1-01-02 | 01   | 1    | FOUND-01    | integration | `npx jest firestore-rules` | ❌ W0       | ⬜ pending |
| 1-02-01 | 02   | 1    | FOUND-01    | unit        | `npx jest session-store`   | ✅          | ⬜ pending |
| 1-02-02 | 02   | 1    | FOUND-01    | unit        | `npx jest role-guard`      | ❌ W0       | ⬜ pending |
| 1-03-01 | 03   | 1    | FOUND-03    | setup       | `npx jest --listTests`     | ❌ W0       | ⬜ pending |
| 1-04-01 | 04   | 2    | FOUND-02    | unit        | `npx jest error-boundary`  | ❌ W0       | ⬜ pending |
| 1-05-01 | 05   | 2    | FOUND-04    | manual      | `expo start --web`         | N/A         | ⬜ pending |

_Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky_

---

## Wave 0 Requirements

- [ ] `jest.config.js` — jest-expo config with transformIgnorePatterns for nativewind/zustand
- [ ] `jest.setup.ts` — replace `vi.*` with `jest.*`, add react-native setup
- [ ] `src/test/firestore-rules.test.ts` — stubs for Firestore tenant isolation cases
- [ ] `src/test/role-guard.test.tsx` — stubs for SinPermiso and role guard rendering
- [ ] `src/test/error-boundary.test.tsx` — stub for Sentry ErrorBoundary capture

---

## Manual-Only Verifications

| Behavior                                  | Requirement | Why Manual                      | Test Instructions                                                      |
| ----------------------------------------- | ----------- | ------------------------------- | ---------------------------------------------------------------------- |
| Cajero sees "Sin permiso" on Resumen tab  | FOUND-01    | Requires real auth + navigation | Log in as cajero, tap Resumen tab, verify wall screen appears          |
| Sentry catches real crash in dev          | FOUND-02    | Requires live Sentry dashboard  | Enable Sentry DSN in dev, throw test error, check Sentry project       |
| @gorhom/bottom-sheet on Android New Arch  | FOUND-04    | Requires Android emulator       | Run `expo run:android`, open any bottom sheet, confirm no native crash |
| AddProductsSheet still works post-install | FOUND-04    | Visual regression               | Navigate to Ventas, tap "Agregar productos", verify sheet opens/closes |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
