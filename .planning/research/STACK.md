# Technology Stack

**Project:** La Pape — POS Polish & Feature Completion Milestone
**Researched:** 2026-03-03
**Note:** WebSearch and WebFetch tools unavailable during this session. All findings drawn from codebase inspection (HIGH confidence) and training-data knowledge (confidence noted per item). Expo SDK 54 / React Native 0.81 specifics flagged where training data may lag.

---

## Existing Stack (Do Not Change)

These are already in production use. The milestone builds on top of them, not instead.

| Technology            | Version (installed) | Role                                                               |
| --------------------- | ------------------- | ------------------------------------------------------------------ |
| Expo SDK              | ~54.0.30            | Runtime, build toolchain                                           |
| Expo Router           | ~6.0.21             | File-based routing                                                 |
| React Native          | 0.81.5              | Core framework                                                     |
| React                 | 19.1.0              | UI layer                                                           |
| NativeWind            | ^5.0.0-preview.2    | Tailwind via className — **already in use, do not add StyleSheet** |
| Zustand               | ^5.0.9              | State management                                                   |
| Firebase JS SDK       | ^12.7.0             | Firestore + Auth backend                                           |
| React Hook Form       | ^7.70.0             | Forms                                                              |
| Zod                   | ^4.3.5              | Schema validation                                                  |
| Reanimated            | ~4.1.1              | Animations (New Architecture)                                      |
| React Native Worklets | 0.5.1               | Shared values / worklet threads                                    |
| New Architecture      | enabled             | `newArchEnabled: true` in app.json                                 |
| React Compiler        | enabled             | `reactCompiler: true` in experiments                               |

**Critical constraint:** New Architecture (`newArchEnabled: true`) and React Compiler are both active. Any new library must support the New Architecture (no legacy bridge, no `ActivityIndicator` hacks, no `async_storage` v1).

---

## Recommended Stack — New Additions

### Testing — Unit & Integration

| Technology                      | Version                       | Purpose                                       | Why                                                                                                                                                                                                                                                                                                                                                        |
| ------------------------------- | ----------------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `jest-expo`                     | `^52` (pin to Expo SDK major) | Jest preset for Expo projects                 | Official Expo-maintained preset; handles Metro transforms, Reanimated mocks, and platform-specific extensions automatically. Do not configure Jest from scratch — `jest-expo` is the only sane entry point. Confidence: HIGH (it is in jest-environment-node@29.7.0 already in node_modules as a transitive dep, confirming Jest 29 infrastructure exists) |
| `@testing-library/react-native` | `^12`                         | Component rendering + interaction tests       | The standard for React Native component tests. Provides `render`, `fireEvent`, `waitFor`, and `screen` queries. Works with jest-expo preset. Confidence: HIGH                                                                                                                                                                                              |
| `@testing-library/jest-native`  | `^5`                          | Custom matchers (`toBeVisible`, `toHaveText`) | Extends RNTL with semantic assertions. Required for meaningful component tests. Confidence: HIGH                                                                                                                                                                                                                                                           |
| `react-test-renderer`           | Match React 19                | Peer dep of RNTL                              | Must match React version exactly (19.1.0). Confidence: HIGH                                                                                                                                                                                                                                                                                                |

**What to mock:**

- Firebase: use `@firebase/rules-unit-testing` for Firestore service tests, or manual mocks in `__mocks__/firebase.ts`. Do NOT mock at the module level for integration tests — mock individual service functions.
- Reanimated: `jest-expo` preset includes the Reanimated mock. Add `@/node_modules/react-native-reanimated/mock` to `setupFiles` if it does not auto-apply.
- `expo-haptics`: mock entirely (no platform in test env).
- Zustand: use `act()` from React testing utilities to wrap store mutations; do NOT mock Zustand itself.

**What NOT to test with RNTL:**

- Firestore transaction logic (`completeVentaFlow`, `refundVentaFlow`) — these are pure async service functions, test them with plain Jest + Firebase emulator or mocked Firestore, not component tests.
- Navigation — test navigation outcomes (store state, rendered content) not `navigate()` calls.

**Confidence:** HIGH for the library choices. MEDIUM for version pinning — `jest-expo` version must align with installed Expo SDK 54; verify via `npx expo install jest-expo` which selects the correct version automatically.

---

### Testing — End-to-End

| Technology | Version             | Purpose          | Why                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ---------- | ------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Maestro    | `^1.x` (latest CLI) | E2E flow testing | **Strongly preferred over Detox for this project.** Maestro uses YAML flow files, runs against the dev build without native test code embedded, works on both Android and iOS simulators, and has first-class Expo support. Detox requires EAS build integration and native configuration that is painful to maintain on a New Architecture app. Maestro flows are readable by non-engineers and can be run in CI with `maestro cloud`. Confidence: MEDIUM (Maestro 1.x is the 2024-2025 standard; verify current version at mobile.dev) |

**What to cover with Maestro (MVP):**

1. Full checkout flow: scan product → add to cart → complete sale → receipt shown
2. Refund flow: open history → select venta → issue refund → stock restored
3. Auth flow: login → session persists on reload

**What NOT to do:** Do not write Detox tests. The New Architecture support in Detox required significant migration effort as of late 2024 and Maestro's DX is dramatically better for a small team.

**Confidence:** MEDIUM — Detox vs Maestro preference is a real tradeoff; the recommendation favors Maestro because of lower setup friction for Expo managed/bare workflow with New Architecture.

---

### Error Monitoring

| Technology             | Version | Purpose                                      | Why                                                                                                                                                                                                                                                                                                                                                                                 |
| ---------------------- | ------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@sentry/react-native` | `^6`    | Crash reporting, error tracking, performance | Industry standard for React Native. Captures unhandled JS exceptions, native crashes, Firestore error breadcrumbs, and slow renders. Has an Expo plugin (`@sentry/react-native/expo`) that hooks into the build process to upload source maps automatically. Confidence: MEDIUM (Sentry v6 is the 2024-era major; confirm current version — it may have advanced to a higher minor) |

**Integration pattern:**

```typescript
// app/_layout.tsx — wrap at root
import * as Sentry from "@sentry/react-native";

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  // Only send in production — don't pollute DSN with dev noise
  enabled: process.env.NODE_ENV === "production",
  tracesSampleRate: 0.2, // 20% of transactions for performance monitoring
});
```

Add `@sentry/react-native/expo` to `plugins` in `app.json` for automatic source map upload on EAS build.

**Error boundary layer:**
The project already has `AppError`, `VentaError`, etc. in `lib/errors.ts`. The missing layer is a React Error Boundary component that:

1. Catches rendering crashes (Sentry captures these automatically once initialized)
2. Shows a user-friendly fallback UI instead of a blank screen
3. Offers a "Reintentar" button that calls `reset()` from the error boundary

Build a `<GlobalErrorBoundary>` wrapping `<Stack>` in `app/_layout.tsx`. Use class component (error boundaries cannot be function components in React 19). Confidence: HIGH (React error boundary pattern is stable).

**What NOT to use:**

- `react-native-exception-handler` — redundant with Sentry, adds native code for no benefit over Sentry's native crash handler.
- Custom crash logging to Firestore — Firestore writes can fail during a crash; Sentry has its own envelope buffering.

**Confidence:** HIGH for Sentry recommendation. MEDIUM for specific version number.

---

### UI Polish — Missing Components

The app has a solid custom component foundation (NativeToaster, AnimatedScreen, ConfirmAlert, NativeWind). The gaps are specific interactive primitives.

| Technology                     | Version | Purpose                                                      | Why                                                                                                                                                                                                                                                                                               |
| ------------------------------ | ------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@gorhom/bottom-sheet`         | `^5`    | Discount panel, payment method selector, refund confirmation | The de-facto standard bottom sheet for React Native. Fully compatible with Reanimated 4 and New Architecture. The payment split flow and discount entry UI both need a sheet that slides up over the POS, not a full modal screen. Confidence: HIGH                                               |
| `react-native-skia` (optional) | `^1`    | Advanced chart rendering for reports                         | Only add if `react-native-svg` (already installed: 15.12.1) proves insufficient for the advanced reports phase. SVG is already present and sufficient for donut charts. Skip Skia for now — it adds ~4MB to the bundle and requires native rebuilds. Confidence: HIGH for the skip recommendation |

**What NOT to add:**

- `react-native-paper` or `rn-ui` component libraries — the project is already on NativeWind with a custom design system. Importing a second component library creates styling conflicts and doubled bundle size. Every new component must be NativeWind-first.
- `lottie-react-native` — the existing Reanimated animations are sufficient. Lottie adds a native dependency for a cosmetic improvement.
- `react-navigation/stack` (modal stack) — Expo Router already handles modals via `(modal)` route groups. Do not add a parallel navigation system.
- `react-native-modal` — the existing `ConfirmAlert.tsx` uses React Native's built-in `Modal`. That is fine. Do not add a third-party modal library.

**Confidence:** HIGH for the "do not add" list. HIGH for bottom-sheet recommendation.

---

### Skeleton / Loading States

| Technology                         | Version | Purpose                              | Why                                                                                                                                                                                                                                                                                                                                                     |
| ---------------------------------- | ------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Build with NativeWind + Reanimated | N/A     | Skeleton loading for lists and cards | Do NOT add `react-native-skeleton-placeholder` or similar. The correct approach for this project is a `<SkeletonBox>` component using `Reanimated`'s `withRepeat(withTiming(...))` on an opacity or shimmer. This keeps the animation on the UI thread (Worklets), avoids a new dependency, and matches the existing animation system. Confidence: HIGH |

---

### Data Export (Advanced Reports)

| Technology               | Version                     | Purpose                       | Why                                                                                                                                                                                                        |
| ------------------------ | --------------------------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `expo-sharing`           | ~14.0.8 (already installed) | Share generated files         | Already in the project                                                                                                                                                                                     |
| `expo-print`             | ~15.0.8 (already installed) | Generate PDF receipts/reports | Already in the project — extend for report PDFs                                                                                                                                                            |
| Custom CSV serialization | N/A                         | CSV export for sales data     | Do NOT add `react-native-csv` or similar. CSV is a string format — serialize data manually with `Array.join(',')` and write via `expo-file-system`. Zero dependencies for a trivial task. Confidence: HIGH |

---

## Testing Configuration

The Jest 29 infrastructure is already present as a transitive dependency. What needs to be installed and configured:

```bash
# Install test dependencies
npx expo install jest-expo @testing-library/react-native @testing-library/jest-native react-test-renderer

# jest-expo adds the correct jest version automatically via peer deps
```

**`package.json` additions:**

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "jest": {
    "preset": "jest-expo",
    "setupFilesAfterFramework": ["@testing-library/jest-native/extend-expect"],
    "transformIgnorePatterns": [
      "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)"
    ]
  }
}
```

**Test file structure:**

```
__tests__/
├── services/
│   ├── complete-venta.test.ts     ← Service logic, mocked Firebase
│   ├── refund-venta.test.ts
│   └── discount.test.ts           ← New discount logic
├── components/
│   ├── ventas/CartItem.test.tsx
│   └── resumen/KpiGrid.test.tsx
└── stores/
    └── ventas-store.test.ts
```

**Confidence:** MEDIUM — `jest-expo` preset's exact configuration syntax may have minor changes between SDK versions. Use `npx expo install` to get the right version, then check the jest-expo README for the current `setupFilesAfterFramework` key name.

---

## Alternatives Considered

| Category         | Recommended                   | Alternative                    | Why Not                                                                                                                        |
| ---------------- | ----------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| Unit testing     | `jest-expo` + RNTL            | Vitest                         | Vitest has no React Native support; Metro bundler incompatibility                                                              |
| Unit testing     | `jest-expo` + RNTL            | `@testing-library/react` (web) | Web testing misses native-specific behavior (gesture, layout)                                                                  |
| E2E              | Maestro                       | Detox                          | Detox requires significant native configuration, New Architecture support is unstable; Maestro is YAML-based and Expo-friendly |
| E2E              | Maestro                       | Appium                         | Appium is enterprise-grade complexity for a small app; no Expo-specific tooling                                                |
| Error monitoring | Sentry                        | Bugsnag                        | Sentry has better React Native + Expo source map integration and a generous free tier                                          |
| Error monitoring | Sentry                        | Firebase Crashlytics           | Crashlytics only captures native crashes, not JS errors; no Expo plugin for JS source maps                                     |
| Bottom sheet     | `@gorhom/bottom-sheet`        | `react-native-modal`           | Modal locks navigation; bottom sheet keeps context visible                                                                     |
| Bottom sheet     | `@gorhom/bottom-sheet`        | Expo's built-in sheet          | No built-in sheet API in Expo Router v6                                                                                        |
| Charts           | `react-native-svg` (existing) | Victory Native / Recharts      | SVG already installed; adding a chart library for donut + bar charts is unnecessary overhead                                   |

---

## Installation Commands

```bash
# Testing (unit + integration)
npx expo install jest-expo @testing-library/react-native @testing-library/jest-native react-test-renderer

# Error monitoring
npx expo install @sentry/react-native

# Bottom sheet (for discount panel + payment selector UI)
npx expo install @gorhom/bottom-sheet

# No additional chart library needed — react-native-svg@15.12.1 already installed

# E2E — install Maestro CLI globally (not npm)
curl -Ls "https://get.maestro.mobile.dev" | bash
```

---

## Sources and Confidence Assessment

| Area                         | Confidence | Source                                                                                       | Notes                                                                                 |
| ---------------------------- | ---------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Existing stack inventory     | HIGH       | Direct package.json inspection                                                               | Exact versions confirmed                                                              |
| Jest 29 / jest-expo approach | HIGH       | Jest 29 transitive dep confirmed in node_modules; jest-expo is the official Expo test preset | Version number for jest-expo requires `npx expo install` to confirm — do not hardcode |
| RNTL v12                     | MEDIUM     | Training data; peer dep hints seen in package-lock                                           | Verify with `npx expo install @testing-library/react-native`                          |
| Maestro over Detox           | MEDIUM     | Training data (2024 ecosystem knowledge); New Architecture Detox issues widely documented    | Confirm Maestro still maintained at mobile.dev                                        |
| Sentry v6                    | MEDIUM     | Training data; version may be higher in 2026                                                 | Use `npx expo install @sentry/react-native` for correct version                       |
| @gorhom/bottom-sheet v5      | MEDIUM     | Training data; v5 was the New Architecture compatible release                                | Verify current version supports Reanimated 4                                          |
| No additional UI library     | HIGH       | Codebase inspection — NativeWind + custom components already established                     |                                                                                       |
| Skip Skia / Lottie           | HIGH       | Bundle cost reasoning; SVG already installed and used                                        | Stable recommendation regardless of version changes                                   |
| Firebase mock strategy       | HIGH       | Standard Jest mocking patterns + Firebase emulator SDK                                       | Emulator SDK is stable                                                                |
| React Error Boundary         | HIGH       | React 19 docs — class-based error boundaries are unchanged                                   | Stable API                                                                            |
