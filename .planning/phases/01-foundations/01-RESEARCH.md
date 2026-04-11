# Phase 1: Foundations — Research

**Date:** 2026-04-11
**Status:** Complete

---

## 1. Firestore Security Rules

### Current State

`firestore.rules` exists but has **zero tenant isolation**: every authenticated user can read/write any document across all negocios. The rules only check `request.auth != null`.

### Multi-Tenant Isolation Strategy

**Approach: `get()` calls against `usuarios_negocios` — no Firebase Functions needed.**

Since there are no Firebase Functions available, custom claims cannot be set. The alternative is using `get()` inside rules to read membership from `usuarios_negocios`. This has a cost implication (1 read per rule check) but is the only viable approach without Functions.

**Key design facts from the codebase:**

- Collection name is `usuarios_negocios` (underscores, not hyphens — confirmed in `lib/services/usuarios-negocios/index.ts`)
- `UsuarioNegocio` document has fields: `usuario_id`, `negocio_id`, `activo`
- `UserRole` lives in `usuarios` collection (`rol: 'ADMIN' | 'VENDEDOR' | 'CAJERO'`), NOT in `usuarios_negocios`
- `UsuarioNegocio` interface is missing `rol` field — this must be added as part of Phase 1

### Rule Helper Functions

```javascript
// Check user belongs to a negocio
function isMemberOf(negocioId) {
  return isAuthenticated() &&
    exists(/databases/$(database)/documents/usuarios_negocios/$(request.auth.uid + '_' + negocioId)) ||
    // fallback: query-style check (more reliable given current doc IDs are auto-generated)
    get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.activo == true;
}
```

**IMPORTANT:** Current `usuarios_negocios` documents use auto-generated Firestore IDs (via `addDoc`), not deterministic composite IDs. The `get()` approach requires a deterministic document ID, or the rules must use `exists()` with a known path. Since IDs are auto-generated, the approach must be:

1. **Option A (recommended):** Denormalize — store `negocio_id` array on the `usuarios` document during `hydrate()`. Then rules do a single `get()` on `usuarios/{uid}` and check the array.
2. **Option B:** Change `createUsuarioNegocio` to use `setDoc` with a deterministic ID like `{uid}_{negocioId}`, enabling direct `get()` in rules.

Option B is cleaner for rules but requires a data migration. Option A requires no migration but adds denormalization.

**Recommendation: Option B** — change the ID scheme for new documents and add the `rol` field to `usuarios_negocios`. This avoids cross-collection reads in rules and keeps rule complexity low.

### Target Rules Structure

```javascript
function isAuthenticated() {
  return request.auth != null;
}

function memberDoc(negocioId) {
  return /databases/$(database)/documents/usuarios_negocios/$(request.auth.uid + '_' + negocioId);
}

function isMember(negocioId) {
  return isAuthenticated() && exists(memberDoc(negocioId));
}

function isAdmin(negocioId) {
  return isMember(negocioId) &&
    get(memberDoc(negocioId)).data.rol == 'ADMIN';
}

// productos — tenant-isolated
match /productos/{productId} {
  allow read: if isMember(resource.data.negocio_id);
  allow create: if isMember(request.resource.data.negocio_id) && isAdmin(request.resource.data.negocio_id);
  allow update, delete: if isAdmin(resource.data.negocio_id);
}
```

Collections requiring `negocio_id` isolation: `productos`, `categorias`, `ventas`, `ventas_detalle`, `ventas_pagos`, `inventario_movimientos`.

### Role Field Addition

`UsuarioNegocio` interface needs `rol` field added:

```ts
// interface/usuarios-negocios/index.ts
export type NegocioRole = "ADMIN" | "CAJERO";

export interface UsuarioNegocio {
  id: string;
  negocio_id: string;
  usuario_id: string;
  rol: NegocioRole; // ADD THIS
  activo: boolean;
  createdAt?: Date;
}
```

`useSessionStore` needs a `rol` field populated during `hydrate()`.

---

## 2. Role Guards in Expo Router

### Current Auth Guard

`app/(tabs)/_layout.tsx` already has an `onAuthStateChanged` check that redirects to `/` when unauthenticated. It uses local state (`checkingAuth`) and renders a spinner.

### Role Guard Approach

**Pattern: `_layout.tsx` guard per restricted tab, with a `SinPermiso` screen component.**

The cleanest Expo Router approach is to check the role inside each restricted tab's `_layout.tsx` (or in the tabs `_layout.tsx` using conditional `Tabs.Screen` options). Since cajeros need to see the Ventas and Productos (read-only) tabs but not Resumen, Historial, or Configuracion:

```
Cajero access:
  - ventas/     ✓ full access
  - productos/  ✓ read-only (no create/edit/delete)
  - history/    ✗ SinPermiso
  - resumen/    ✗ SinPermiso
  - configuracion ✗ SinPermiso
```

**Implementation strategy:**

1. Add `rol: NegocioRole | null` to `useSessionStore`
2. Create `components/ui/SinPermiso.tsx` — simple NativeWind component
3. In `app/(tabs)/history/_layout.tsx`, `app/(tabs)/resumen/_layout.tsx`: check `rol === 'CAJERO'` and render `<SinPermiso />` instead of `<Stack />`
4. In `app/configuracion.tsx`: same guard at the top of the component
5. For productos write actions (create/edit/delete buttons): hide via `rol === 'CAJERO'` check in the component, not a separate screen

**SinPermiso component:**

```tsx
// components/ui/SinPermiso.tsx
export function SinPermiso() {
  return (
    <View className="flex-1 items-center justify-center bg-[#FAFAF9] p-8 dark:bg-[#0C0F14]">
      <IconSymbol name="lock.fill" size={40} color="#9CA3AF" />
      <Text className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">Sin permiso</Text>
      <Text className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
        No tienes acceso a esta sección.
      </Text>
    </View>
  );
}
```

**Why not redirect?** The context decision explicitly states "mostrar pantalla con mensaje 'Sin permiso' (no redirect silencioso)". A visible wall is better UX for cajeros so they understand why they can't proceed.

**Loading state:** The tabs `_layout.tsx` already waits for Firebase auth. Add a secondary wait for `useSessionStore.ready` before rendering role guards to prevent flash-of-restricted-content.

---

## 3. jest-expo Migration

### Current Test Setup

- Runner: **Vitest** v4.1.1
- Config: `vitest.config.ts` — `environment: "node"`, custom alias `@` → root
- Tests: ~20 files in `src/test/` — all Zustand store tests + utility tests
- Setup: `src/test/setup.ts` — mocks for expo-image, reanimated, gesture-handler, expo-router
- Dev deps already include: `@testing-library/react-native`, `@testing-library/jest-native`, `@types/jest`
- **No jest-expo installed yet**

### Migration Plan

**Install:**

```bash
npx expo install jest-expo
# jest-expo brings jest, @jest/globals, babel-jest automatically
```

**jest.config.js** (root):

```js
module.exports = {
  preset: "jest-expo",
  testPathPattern: ["src/test/**/*.test.[jt]s?(x)"],
  setupFilesAfterFramework: ["<rootDir>/src/test/setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|nativewind|zustand)",
  ],
};
```

**Key migration changes in `src/test/setup.ts`:**

- Replace `vi` imports with `jest`: `import { jest } from '@jest/globals'` or use globals
- Replace `vi.mock(...)` → `jest.mock(...)`
- Replace `vi.fn()` → `jest.fn()`
- The existing mocks for reanimated, gesture-handler, expo-router are directly portable

**NativeWind in tests:** jest-expo + `transformIgnorePatterns` including `nativewind` handles className props. No additional config needed since tests are store/utility tests (no component rendering that exercises NativeWind).

**Zustand v5 in tests:** Zustand v5's `useStore.setState()` works identically in Jest and Vitest. Existing pattern (`useSessionStore.setState({...})` in `beforeEach`) requires no changes.

**package.json scripts update:**

```json
"test": "jest",
"test:watch": "jest --watch",
"test:coverage": "jest --coverage"
```

Remove `vitest`, `@vitejs/plugin-react`, `@vitest/coverage-v8` from devDependencies after migration is verified.

---

## 4. @sentry/react-native

### Expo Managed Workflow Integration

La Pape uses Expo SDK 54 with `newArchEnabled: true` (New Architecture). `@sentry/react-native` v6+ supports New Architecture.

**Install:**

```bash
npx expo install @sentry/react-native
```

This runs `sentry-expo`'s postinstall which patches `metro.config.js` (or `metro.config.ts`) and `app.json`/`app.config.js`.

**DSN Strategy — env vars via `app.config.js`:**

The project uses `EXPO_PUBLIC_*` env vars for Firebase (confirmed in `lib/firebase.ts`). Follow the same pattern:

```bash
# .env
EXPO_PUBLIC_SENTRY_DSN=https://xxx@oyyy.ingest.sentry.io/zzz
```

```js
// app.config.js (rename app.json → app.config.js)
export default ({ config }) => ({
  ...config,
  hooks: {
    postPublish: [
      {
        file: "sentry-expo/upload-sourcemaps",
        config: {
          organization: "your-org",
          project: "la-pape",
        },
      },
    ],
  },
  plugins: [["@sentry/react-native/expo", { organization: "your-org", project: "la-pape" }]],
});
```

**Sentry init in `app/_layout.tsx`:**

```tsx
import * as Sentry from "@sentry/react-native";

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  environment: __DEV__ ? "development" : "production",
  // Reduce noise in dev
  enabled: !__DEV__,
  tracesSampleRate: 0.2,
});
```

**ErrorBoundary Integration:**

The existing `components/ui/ErrorBoundary.tsx` uses `componentDidCatch` with `this.props.onError?.(error, errorInfo)`. The integration point is already there — pass a Sentry capture call as `onError`:

```tsx
// app/_layout.tsx — root boundary already calls logger.error
// Add Sentry capture alongside the existing logger:
<ErrorBoundary
  onError={(error, info) => {
    logger.error("Layout error", { error: error.message, stack: info.componentStack });
    Sentry.captureException(error, { extra: { componentStack: info.componentStack } });
  }}
>
```

**Granular tab boundaries** (per context decisions): wrap each tab's root view in `<ErrorBoundary onError={(e) => Sentry.captureException(e)}>`. Place in each `app/(tabs)/<tab>/_layout.tsx`.

**Do NOT replace** the existing `ErrorBoundary` class component with `Sentry.ErrorBoundary` — the existing UI (Spanish text, "Reintentar" button, `IconSymbol`) is already project-standard.

---

## 5. @gorhom/bottom-sheet

### Compatibility Assessment

**React Native New Architecture:** `newArchEnabled: true` in `app.json`. `@gorhom/bottom-sheet` v5+ supports New Architecture. v4 does not.

**Web compatibility:** `@gorhom/bottom-sheet` has limited web support and requires platform-specific handling. The existing `AddProductsSheet` already returns `null` on desktop (`width >= DESKTOP_MIN_WIDTH`) — the same pattern would apply.

**Reanimated version:** Project uses `react-native-reanimated` v4.1.1 (confirmed `package.json`). `@gorhom/bottom-sheet` v5 requires Reanimated v3+. Compatible.

**Gesture Handler:** Project uses `react-native-gesture-handler` v2.28.0. Compatible with bottom-sheet v5.

### Coexistence Decision

The existing `AddProductsSheet` is a **custom implementation** using `Reanimated + GestureDetector` directly. It works well and follows project conventions.

**Recommendation: Coexistence, not migration.**

- `AddProductsSheet` stays as-is — it's purpose-built, performant, and follows project patterns
- `@gorhom/bottom-sheet` can be installed for **future use cases** that need snap points, multiple snap positions, or backdrop handling that would be complex to build from scratch
- No forced migration of existing sheet

**Install for New Architecture:**

```bash
npx expo install @gorhom/bottom-sheet
```

**Web guard pattern** (same as AddProductsSheet):

```tsx
import { Platform } from "react-native";
// In web, @gorhom/bottom-sheet renders but may have layout issues
// Use the same null-return pattern for desktop views
```

**Potential issue:** `@gorhom/bottom-sheet` v5 uses `react-native-worklets` for worklet-based animations. Project already has `react-native-worklets: 0.5.1` in `package.json` — no additional install needed.

---

## Validation Architecture

### Area 1: Firestore Security Rules

- **Tool:** Firebase Emulator Suite (`firebase emulators:start --only firestore`)
- **Test file:** `src/test/firestore-rules.test.ts` using `@firebase/rules-unit-testing`
- **Cases:**
  - User A cannot read `productos` belonging to negocio B
  - Cajero can create `ventas` but not create `productos`
  - Unauthenticated user gets permission-denied on all reads
  - Admin can create/update/delete `productos` in their negocio

### Area 2: Role Guards

- **Tool:** Jest + `@testing-library/react-native`
- **Cases:**
  - `SinPermiso` component renders with correct text
  - Tab layout renders `SinPermiso` when `rol === 'CAJERO'` and navigating to `resumen`
  - Tab layout renders content when `rol === 'ADMIN'`
  - Loading state renders spinner while `ready === false`
- **Manual UAT:** Log in with a cajero-role account, attempt to navigate to Resumen tab — should see "Sin permiso" wall, not a crash or silent redirect

### Area 3: jest-expo Migration

- **Validation:** Run `jest --testPathPattern=src/test` and confirm all ~20 existing tests pass
- **Key risk:** `vi.fn()` → `jest.fn()` replacements in `setup.ts` and individual test files
- **Coverage baseline:** Run `jest --coverage` and record baseline numbers before Phase 2

### Area 4: Sentry

- **DSN validation:** In dev, temporarily set `enabled: true` and throw a test error — verify it appears in Sentry dashboard
- **ErrorBoundary test:** Render a component that throws, confirm Sentry.captureException is called (mock Sentry in jest test)
- **Build validation:** `expo export` should complete without sourcemap upload errors (sourcemaps only matter in production builds)

### Area 5: @gorhom/bottom-sheet

- **Install validation:** `npx expo start --web` — confirm no import errors
- **New Architecture:** Run on Android emulator with New Architecture enabled, confirm no native module crash
- **Coexistence:** `AddProductsSheet` must continue to open/close correctly after installing bottom-sheet (no namespace collisions in Reanimated worklets)

---

## RESEARCH COMPLETE
