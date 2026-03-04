# Domain Pitfalls

**Domain:** Expo + Firebase POS — brownfield hardening (refunds, discounts, split payments, tests)
**Project:** La Pape
**Researched:** 2026-03-03
**Confidence:** HIGH — derived from direct codebase analysis, not speculation

---

## Critical Pitfalls

Mistakes that cause data corruption, financial inaccuracies, or rewrites.

---

### Pitfall 1: Refund Reads Sale Details Outside the Transaction (TOCTOU)

**What goes wrong:**
`refundVentaFlow` in `lib/services/ventas/refund-venta.ts` calls `getDetallesByVenta(ventaId)` **before** entering `runTransaction`. The items returned by that query are then used inside the transaction to update stock. If a partial refund is ever added (refunding specific line items), or if a concurrent process modifies `ventas_detalle` between the pre-read and the transaction commit, the stock adjustment will be based on stale data.

**Why it happens:**
`getDetallesByVenta` uses `getDocs` (outside transaction), then the results are consumed inside `runTransaction`. Firestore transactions guarantee serializability only for documents read **through the transaction handle** (`transaction.get()`).

**Consequences:**

- Partial refund phase could restore incorrect quantities if items are modified concurrently
- Full refund is currently safe by accident (estado check prevents double-refund), but partial refund built on this pattern will corrupt stock
- Extends an architectural flaw that becomes a rewrite target once partial refunds are needed

**Warning signs:**

- `getDetallesByVenta` is called on line 34 of `refund-venta.ts` before `runTransaction` begins on line 39
- The returned `detalles` array is used on line 52 inside the transaction without re-reading from Firestore

**Prevention:**
Read `ventas_detalle` documents using `transaction.get()` inside the `runTransaction` callback. Because `ventas_detalle` has no query support inside transactions (Firestore transactions only support `transaction.get(docRef)`, not queries), the venta document should store a denormalized list of `detalle_ids`, OR a separate pre-fetch of IDs (not data) outside the transaction can be used with `transaction.get()` calls for each doc inside.

**Phase:** Refund phase — fix before adding partial refund logic.

---

### Pitfall 2: Split Payment Breaks the Existing Transaction Shape

**What goes wrong:**
`completeVentaFlow` hardcodes `metodo_pago: 'EFECTIVO'` and writes exactly one `ventas_pagos` document per sale. Adding split payment (e.g., cash + card) requires writing multiple payment rows. The current `CompleteVentaParams` interface has no payment method field, so any split payment implementation that does not touch `completeVentaFlow` will leave `ventas_pagos` atomicity broken — two payment rows written outside the main transaction means a failure between writes leaves the sale in an inconsistent state (total charged but payment record incomplete).

**Why it happens:**
The initial implementation treated payment method as a constant. The interface on line 11–18 of `complete-venta.ts` has no `payments` field, and `CompleteVentaResult` does not expose payment IDs.

**Consequences:**

- If split payment writes are done as separate `addDoc` calls after the transaction, a network failure between them leaves orphaned payment records
- Reporting on payment method breakdown (dashboard KPI) will be wrong
- Cannot be fixed with a feature flag — requires changing the `CompleteVentaParams` interface and the transaction body

**Warning signs:**

- Line 118–124 of `complete-venta.ts`: single `pagoRef` with hardcoded `'EFECTIVO'`
- `createVentaPago` in `lib/services/ventas-pagos/index.ts` uses standalone `addDoc`, not a transaction write

**Prevention:**
Extend `CompleteVentaParams` with a `pagos: Array<{ metodo: MetodoPago; monto: number; referencia?: string }>` field. Inside `runTransaction`, iterate and create each payment document atomically. Validate that `pagos.reduce((s, p) => s + p.monto, 0) === total` before entering the transaction. Design the interface change before writing any UI.

**Phase:** Split payment phase — interface redesign must precede UI work.

---

### Pitfall 3: Discount Math Precision on CLP Integer Currency

**What goes wrong:**
CLP (Chilean peso) has no decimal places — all amounts are whole integers. The existing `descuento` field is typed as `float` in the interface and Firestore. Percentage-based discounts (`precio_venta * discountPct / 100`) will produce floating-point results (e.g., `$13.333...`). If these are not explicitly `Math.round()`-ed at the point of calculation before being written to Firestore, the stored totals will silently drift from what the cashier sees, causing receipt/report mismatches.

**Why it happens:**
JavaScript floating-point arithmetic on integers still produces floats. The `formatCurrency` utility formats correctly for display, but display formatting does not affect stored values. The `checkout-store.ts` `VentaCompletada` interface has `descuento: number` with no rounding contract.

**Consequences:**

- `total` stored in Firestore diverges from displayed total by a few pesos
- Cumulative drift across many sales makes revenue reports inaccurate
- Tax-related reporting (future SII integration) will fail validation if amounts aren't integers

**Warning signs:**

- No `Math.round()` or `Math.floor()` call exists anywhere in the discount calculation path (no discount logic exists yet — this is the trap to avoid when building it)
- `completeVentaFlow` accepts `total` and `subtotal` as `number` with no server-side validation that they are integers

**Prevention:**
Establish a single canonical discount calculation function in `lib/utils/format.ts` that always returns `Math.round()`. Use it everywhere — in the store, in the service, in Zod schemas. Add a Zod `.int()` refinement to price and discount fields in the checkout schema. The Firestore rule already validates `total >= 0` but not `total === Math.round(total)`.

**Phase:** Discount phase — define rounding utility before any discount UI is built.

---

### Pitfall 4: Testing Expo + Firebase with No Existing Test Infrastructure

**What goes wrong:**
There is zero test configuration in this project — no `jest.config.js`, no `__tests__` directories, no `@testing-library/react-native`, nothing in `package.json` devDependencies. Setting up Jest for Expo + Firebase from scratch has several non-obvious blockers:

1. `firebase/firestore` uses ESM-only internals that crash Jest's CommonJS transformer
2. `react-native-reanimated` requires a Babel plugin and a Jest setup file (`@react-native-reanimated/mock`) or all animated components crash during test render
3. `nativewind` v5 class resolution does not work in Jest's jsdom environment without a custom CSS variable mock
4. Expo Router v6's typed routes require a generated `.expo/types` file that does not exist in CI environments without running `expo start` first

**Why it happens:**
Each of these libraries solves a different problem and their Jest compatibility requirements do not compose cleanly. Community guides exist but are fragmented across library versions. The project uses bleeding-edge versions (React 19, NativeWind v5 preview, Expo 54, RN 0.81, Reanimated 4.x) that may have incomplete testing guides as of 2026.

**Consequences:**

- First test attempt will fail with opaque transform errors, discouraging the team from continuing
- Mocking Firebase incorrectly (e.g., mocking the wrong module path) means tests pass locally but test the mock, not the code
- Testing Zustand stores in isolation from React components requires understanding `act()` + `renderHook` from `@testing-library/react-native`, which is different from the web pattern

**Warning signs:**

- `package.json` has no `jest`, `@jest/globals`, `@testing-library/react-native`, or `babel-jest` in devDependencies
- No `babel.config.js` defines the `react-native-reanimated/plugin` for test environments

**Prevention:**
Treat test setup as its own phase deliverable. In order:

1. Install and configure Jest with `jest-expo` preset (this handles most Expo/RN transform issues)
2. Add `@testing-library/react-native` and `@testing-library/jest-native`
3. Add `jest.setup.js` that mocks `react-native-reanimated` and `firebase`
4. Write one passing smoke test before adding more coverage
5. Mock Firebase using `jest.mock('firebase/firestore', ...)` with factory functions that return predictable data
6. Test services (pure functions + transaction logic) with unit tests, not integration tests against real Firestore

**Phase:** Test infrastructure phase — must be its own milestone deliverable, not assumed to "just work."

---

### Pitfall 5: Firestore Security Rules Do Not Enforce Business Logic

**What goes wrong:**
The current `firestore.rules` allows any authenticated user to update any product's stock (`allow update: if isAuthenticated()`), write any sale, and create any payment record with any amount. There is no tenant isolation — a user authenticated against Negocio A could write a `ventas` document with `negocio_id` of Negocio B. The `allow create` rule for ventas only checks `total >= 0`, not that `negocio_id` matches the user's actual negocio.

**Why it happens:**
Rules were written with `// Ajustar según roles` comments as explicit TODOs, indicating they were written for development speed and intended to be tightened. Adding refunds, discounts, and split payments on top of permissive rules means new attack surface is added without any server-side constraint.

**Consequences:**

- A malicious authenticated user can issue refunds on other businesses' sales
- A malicious user can set `total: 0` and `descuento: 10000` to record fraudulent discounts
- Multi-tenant data isolation is entirely dependent on client-side code never making incorrect queries

**Warning signs:**

- `firestore.rules` lines 29, 30, 63: `allow update/delete: if isAuthenticated()` with no field-level constraints
- `match /ventas/{ventaId}` has no check that `request.resource.data.negocio_id` matches the authenticated user's negocio

**Prevention:**
Before adding refunds or discounts (which require `update` access to ventas), tighten rules:

- Add a helper that looks up the user's `negocio_id` from `usuarios-negocios` and validates `request.resource.data.negocio_id` matches
- For refunds (state transitions), constrain `allow update` to only allow `estado` field changes, not amount changes
- For discount writes, validate `descuento >= 0` and `total == subtotal - descuento` at the rules level

**Phase:** Before refund and discount phases — rules must be tightened before new financial operations are exposed.

---

## Moderate Pitfalls

### Pitfall 1: Zustand Cart State Survives Across Sales if clearCart() Is Not Called on Every Success Path

**What goes wrong:**
`useVentasStore.clearCart()` must be called after a successful sale AND after a cancelled checkout. If the success overlay is dismissed without calling `clearCart()`, or if navigation away from the ventas tab resets the screen without clearing state, the cart accumulates items across multiple transactions.

**Why it happens:**
Zustand stores persist for the lifetime of the JS runtime. Unlike component state, they survive navigation. The `closeSuccess` action in `checkout-store.ts` sets `successVenta: null` but does not call `clearCart()` on the ventas store — these are two separate stores that must both be reset.

**Warning signs:**

- `checkout-store.ts`: `closeSuccess: () => set({ successVenta: null })` — does not clear ventas-store
- If the user backs out of the checkout confirm dialog, the cart remains loaded (correct behavior), but the state wires must be explicit

**Prevention:**
Wherever the success overlay closes, sequence: `clearCart()` → `closeSuccess()`. Use a single `resetCheckout()` action in a parent store or utility that coordinates both stores. Document this contract in a comment.

**Phase:** Checkout polish phase — audit all dismissal paths.

---

### Pitfall 2: Partial Refund Amounts Not Validated Against Original Line Item Totals

**What goes wrong:**
When partial refunds are added, the refund amount input must be bounded by the original `total_linea` per item, and the sum of partial refund amounts must not exceed `venta.total`. Without validation at both the service layer and UI layer, a cashier could issue a refund larger than the original sale.

**Why it happens:**
The current `RefundVentaParams` interface has no `amount` field — it refunds 100% always. Extending it for partial amounts without adding validation boundaries is easy to overlook.

**Warning signs:**

- `refund-venta.ts` line 12–15: `RefundVentaParams` has no `lineas` or `monto_parcial` field
- If a future developer adds `montoReembolso?: number` without a validation guard, it silently allows over-refunding

**Prevention:**
When building partial refund: validate `refundItems.every(r => r.cantidad <= detalle.cantidad && r.monto <= detalle.total_linea)` in the service before entering the transaction. Validate total refund amount in Zod schema at the form layer. Write a unit test that asserts refund of more than original amount throws.

**Phase:** Partial refund feature — validation layer before transaction layer.

---

### Pitfall 3: Real-Time Listener in onVentasByNegocio Fetches All Sales with No Pagination

**What goes wrong:**
`onVentasByNegocio` in `lib/services/ventas/index.ts` attaches a listener with no `limit()` clause. As the business grows, this listener will download the entire sales history on every connection and on every incremental change. At 10,000+ sales, the initial download and re-sort on every snapshot will cause perceptible lag on mobile.

**Why it happens:**
Real-time listeners for small datasets feel instant. The problem is invisible until the dataset grows, and by then it's woven into the resumen store's data model.

**Warning signs:**

- `onVentasByNegocio` query has `where('negocio_id', '==', negocio_id)` but no `.limit()`
- `sortByFechaDesc` runs a full in-memory sort on every snapshot update

**Prevention:**
Add `.orderBy('fecha', 'desc').limit(500)` to the query for the history view. For the resumen dashboard, scope listeners to the current filter period using `.where('fecha', '>=', startTimestamp)`. This requires a Firestore composite index on `(negocio_id, fecha)`.

**Phase:** Advanced reports phase — before building export/analytics features that rely on this listener.

---

### Pitfall 4: Agent Orchestration — Agents Writing to Same Files Concurrently

**What goes wrong:**
When multiple Claude agents (design, test, debug) run in parallel per feature phase, they may both attempt to write to the same component file. The last write wins and silently overwrites the other agent's changes. This is especially likely when a design agent refactors a component's structure while a test agent generates tests that import the original structure.

**Why it happens:**
File-based parallelism without coordination. Agents have no locking mechanism.

**Warning signs:**

- Design agent and test agent both touching `components/ventas/CartPanel.tsx` in the same phase
- Test agent imports component API that design agent has already changed

**Prevention:**
Define strict file ownership per agent per phase. Design agent owns component files. Test agent owns `__tests__` files and service-layer unit tests only. Debug agent owns service files. No agent writes to another agent's owned files. The PM agent coordinates handoff order: design agent completes and commits before test agent begins.

**Phase:** Every phase with parallel agents — establish the ownership contract in the phase plan.

---

## Minor Pitfalls

### Pitfall 1: NativeWind v5 Preview — Breaking Changes Between Preview Versions

**What goes wrong:**
`nativewind: "^5.0.0-preview.2"` is an unstable version. Running `npm update` during development may silently upgrade to a later preview with breaking className syntax changes. Dark mode variants behave differently between v4 and v5 APIs.

**Prevention:**
Pin the exact preview version in `package.json` using `"5.0.0-preview.2"` (no caret). Only upgrade intentionally. Check the NativeWind CHANGELOG before any upgrade.

**Phase:** UI polish phase — pin before starting extensive className work.

---

### Pitfall 2: expo-print Receipt Generation Fails on Android Without Explicit Permissions

**What goes wrong:**
`expo-print` is in dependencies. On Android, generating and sharing a PDF receipt requires write permissions on older Android versions. The receipt flow (via `VentaExitosaModal`) may work on web/iOS but fail silently on Android if the permissions plugin is not configured in `app.json`.

**Prevention:**
Test receipt generation on a physical Android device early. Add `expo-print` plugin configuration to `app.json` if needed. Guard the share button with a try/catch that surfaces a user-visible error.

**Phase:** Checkout success flow polish — test on Android explicitly.

---

### Pitfall 3: `ventas_detalle` Uses Underscore Naming But `ventas-detalle` Collection Name

**What goes wrong:**
The Firestore collection name is `ventas_detalle` (underscore, per `complete-venta.ts` line 107) but `getDetallesByVenta` in `lib/services/ventas-detalle/index.ts` also queries `ventas_detalle`. However the `negocios`, `sucursales`, `usuarios-negocios` collections use hyphens. The inconsistency means collection name strings are scattered and not centralized — a typo in a new service file will silently query an empty collection.

**Prevention:**
Create a `lib/constants/collections.ts` that exports all collection name strings as constants. All service files import from it. A typo becomes a compile-time error.

**Phase:** Test infrastructure phase or first new feature phase — set up the constant before adding new services.

---

## Phase-Specific Warnings

| Phase Topic      | Likely Pitfall                                                                    | Mitigation                                                    |
| ---------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Refund feature   | TOCTOU: detalles read outside transaction (Pitfall 1 Critical)                    | Read detalles inside transaction via pre-fetched IDs          |
| Partial refund   | No amount validation bounds (Pitfall 2 Moderate)                                  | Zod schema + service-layer guard before transaction           |
| Split payment    | Transaction shape broken by current hardcoded single payment (Pitfall 2 Critical) | Redesign `CompleteVentaParams` interface first                |
| Discount logic   | CLP float precision loss (Pitfall 3 Critical)                                     | `Math.round()` utility before any discount math               |
| Test setup       | Zero test infrastructure, ESM/Firebase/Reanimated conflicts (Pitfall 4 Critical)  | Treat as standalone phase deliverable with `jest-expo` preset |
| Firestore rules  | Permissive rules before new financial operations (Pitfall 5 Critical)             | Tighten rules before refund/discount phases                   |
| Advanced reports | Unbounded real-time listener (Pitfall 3 Moderate)                                 | Add period-scoped query with composite index                  |
| Parallel agents  | File ownership conflicts (Pitfall 4 Moderate)                                     | Define ownership contract in each phase plan                  |
| UI polish        | NativeWind v5 preview instability (Pitfall 1 Minor)                               | Pin exact preview version before polish phase                 |
| Receipt flow     | Android print permissions (Pitfall 2 Minor)                                       | Test on physical Android device before shipping               |
| New services     | Collection name typo risk (Pitfall 3 Minor)                                       | Centralize collection names as constants                      |

---

## Sources

All findings derived from direct codebase analysis (HIGH confidence):

- `lib/services/ventas/refund-venta.ts` — TOCTOU pattern, lines 34–39
- `lib/services/ventas/complete-venta.ts` — hardcoded payment method, lines 118–124
- `interface/ventas/index.ts` — `descuento: number` (float, not int)
- `interface/ventas-pagos/index.ts` — `MetodoPago` type definition
- `store/ventas-store.ts` — cart state lifecycle
- `store/checkout-store.ts` — `closeSuccess` does not clear cart
- `firestore.rules` — permissive update rules, lines 29–30
- `lib/services/ventas/index.ts` — unbounded `onVentasByNegocio` listener
- `package.json` — no test devDependencies, `nativewind: "^5.0.0-preview.2"`

Firestore transaction constraints (HIGH confidence from training data, consistent with official Firebase documentation patterns):

- Transactions only support `transaction.get(docRef)` — queries inside transactions are not supported
- 500 document write limit per transaction (applies when a sale has many line items)
