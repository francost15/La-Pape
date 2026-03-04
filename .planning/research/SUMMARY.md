# Project Research Summary

**Project:** La Pape — POS Polish & Feature Completion Milestone
**Domain:** Multi-tenant Point-of-Sale (Firebase + Expo, Chilean SME market)
**Researched:** 2026-03-03
**Confidence:** HIGH

## Executive Summary

La Pape is a production Expo + Firebase POS application with a strong existing foundation: real-time Firestore listeners, a clean Zustand store architecture, and NativeWind-styled components. The milestone is not a greenfield build — it is a feature completion sprint that fills four concrete gaps: discounts at checkout, split payment methods, partial refunds, and advanced reports with CSV export. Critically, the data model already supports all of these (the `descuento` field exists on `ventas`, `ventas_pagos` already supports multiple rows per sale, and `ventas_detalle` is already the source of truth for line items). The work is almost entirely service-layer extension and UI addition, not data model redesign.

The recommended approach follows the existing patterns without exception: all financial writes inside `runTransaction` (reads before writes), discount math exclusively in the service layer using integer-rounded CLP amounts, and client-side aggregation via pure selector functions for reports. Three new additions to the stack are justified: `@gorhom/bottom-sheet` for the discount panel and payment split UI, `jest-expo` + `@testing-library/react-native` for a test infrastructure that currently does not exist at all, and `@sentry/react-native` for production error monitoring. No other new libraries should be added.

The primary risks are not architectural — the architecture is sound. The risks are implementation traps: the existing `refundVentaFlow` reads `ventas_detalle` outside the transaction (a TOCTOU flaw that must be fixed before partial refunds are added), Firestore security rules are permissive placeholders that must be tightened before new financial operations are exposed, and CLP discount math will silently produce float drift unless a single `Math.round()` utility is established first. Test infrastructure setup must be treated as its own phase deliverable rather than assumed to work out of the box — the combination of React 19, NativeWind v5 preview, Reanimated 4, and Expo 54 creates a non-trivial Jest configuration challenge.

## Key Findings

### Recommended Stack

The existing stack (Expo SDK 54, React Native 0.81, NativeWind v5, Zustand v5, Firebase JS SDK v12, Reanimated 4, New Architecture enabled, React Compiler enabled) is locked and must not change. All new libraries must support the New Architecture — the caret on NativeWind's preview version should be pinned to prevent silent breaking upgrades.

Three targeted additions are warranted. `@gorhom/bottom-sheet` v5 is the correct primitive for the discount entry panel and payment split UI — it keeps the POS context visible while the operator configures payment, which a full modal screen does not. `jest-expo` + `@testing-library/react-native` establishes the test foundation; `jest-expo` is the only sane entry point because it handles Metro transforms, Reanimated mocks, and platform extensions automatically. `@sentry/react-native` provides crash reporting and ties into the already-defined `lib/errors.ts` error types — it should initialize only in production to avoid DSN noise.

**Core technologies (additions only):**

- `@gorhom/bottom-sheet` v5: sliding panels for discount/payment UIs — New Architecture compatible, keeps POS context visible
- `jest-expo` + RNTL v12 + `@testing-library/jest-native`: unit/component testing — the only tested path for Expo + Firebase + Reanimated
- `@sentry/react-native`: production error monitoring — class-based `GlobalErrorBoundary` wrapping `<Stack>` in `_layout.tsx`
- Maestro (CLI): E2E flows — preferred over Detox due to no native build requirements on New Architecture
- `expo-sharing` + `expo-print` (already installed): CSV/PDF export — no additional library needed

### Expected Features

The feature gaps are all UI + service extensions on an already-correct data model. The FEATURES research identified a clear dependency chain that determines build order.

**Must have (table stakes) — this milestone:**

- Payment method picker at checkout — hardcoded `EFECTIVO` makes tarjeta/transferencia transactions impossible
- Percentage and fixed-amount discount on cart total — `descuento` field exists but is hardcoded to 0
- Discount visible on receipt — `reciboData.descuento` already flows to the receipt template
- Split payment UI (cash + card in one transaction) — `ventas_pagos` schema already supports multiple rows
- Full refund UX polish — `refundVentaFlow` exists but needs reliable error handling and disabled-state-after-refund
- Partial refund (item-level) — new service + UI; most complex feature in the milestone
- CSV export from history/resumen screens — no export mechanism exists

**Should have (differentiators) — this milestone where effort allows:**

- Change calculation display (vuelto) — pure UI, zero backend, high cashier value
- Discount reason/note field — audit trail for discounts; adds `nota_descuento` to `ventas`
- Discount summary in reports — summing existing `descuento` field once it's populated
- Payment method breakdown in reports — requires joining `ventas_pagos` into resumen store

**Defer to v2+:**

- Per-item discount — complex cart state, low urgency vs other gaps
- Trend comparison (period-over-period) — useful but not blocking operations
- Top-loss products report — nice-to-have analytics
- Coupon/promo code system — requires a separate domain; manual discount covers the need
- Customer loyalty points — premature schema commitment
- SII / boleta electrónica integration — regulated domain, separate product

### Architecture Approach

All four feature areas extend the existing architecture without replacing any of it. The pattern is: new store fields → extended service signatures → new UI components consuming those stores. The service layer (`lib/services/`) is the single source of truth for all financial calculations; no discount math or payment validation happens in components. All financial writes go through `runTransaction` with reads-before-writes ordering enforced as in the existing `completeVentaFlow`.

The one new Firestore collection is `ventas_reembolsos` for partial refund records. Refund items are embedded in the document (not a subcollection) because they are always read together and never updated independently. `ventas_detalle` is immutable — partial refunds are recorded in `ventas_reembolsos`, not by modifying the original sale's line items. Reports remain client-side `useMemo` selectors; no Cloud Functions until a negocio exceeds 5,000 ventas in a single query window.

**Major components:**

1. `DiscountPanel` (new) — bottom sheet for % or fixed discount entry; writes to `useVentasStore`
2. `PaymentSplitSheet` (new) — bottom sheet for multi-method payment; writes to `useCheckoutStore.paymentSplits[]`
3. `completeVentaFlow` (extended) — atomic transaction accepting `descuento` and `pagos[]` array
4. `PartialRefundSheet` (new) — item picker + quantity stepper; calls extended `refundVentaFlow`
5. `refundVentaFlow` (extended) — writes to `ventas_reembolsos` + updates `ventas.estado` + restores stock
6. `ventas_reembolsos` (new collection) — immutable audit records with embedded refund items
7. `selectRevenueSeries` / `selectPaymentMethodBreakdown` (new selectors) — pure functions alongside existing selectors
8. `lib/services/reports/export.ts` (new) — CSV/PDF generation using `expo-sharing`

### Critical Pitfalls

1. **TOCTOU in `refundVentaFlow`** — `getDetallesByVenta` is called outside the transaction, then results are consumed inside it. Fix before adding partial refund: pre-fetch only document IDs outside the transaction, then read each doc via `transaction.get(docRef)` inside.

2. **Split payment breaks transaction atomicity** — `completeVentaFlow` hardcodes a single EFECTIVO payment via standalone `addDoc`. Adding split rows outside the transaction leaves partial writes on network failure. Fix: redesign `CompleteVentaParams` to accept `pagos: PaymentSplit[]` and loop inside `runTransaction` before writing any UI.

3. **CLP float precision loss in discount math** — `descuento: number` is a float. Percentage discounts produce non-integer results. Fix: establish a single `calculateDiscount()` utility in `lib/utils/format.ts` that always returns `Math.round()`. Add Zod `.int()` refinement to all price/discount fields. Do this before building any discount UI.

4. **Permissive Firestore security rules** — current rules allow any authenticated user to update any negocio's data with no tenant isolation. Fix: tighten before refund/discount phases. Add `negocio_id` ownership check and constrain `ventas` updates to only allow `estado` field changes.

5. **Test infrastructure from zero** — no Jest config, no RNTL, no mocks. Firebase ESM, Reanimated, NativeWind v5, and Expo Router typed routes each have non-obvious Jest blockers. Fix: treat as a standalone deliverable. Use `jest-expo` preset, write one passing smoke test before adding coverage, mock Firebase at the module level per `lib/services/` boundary.

## Implications for Roadmap

Based on the combined research, the forced dependency chain is: Discounts → Multi-Payment → Partial Refunds → Advanced Reports. This ordering is not arbitrary — it is enforced by data correctness (reports aggregate discounts and payment methods that must be recorded before they can be counted) and by the architectural dependency (split payment total validation requires a correct post-discount total). Test infrastructure is a prerequisite that must be ready before any feature phase to enable regression prevention.

### Phase 1: Foundations — Security, Constants, Tests, Error Monitoring

**Rationale:** Three critical pitfalls (permissive rules, zero test infrastructure, no error monitoring) all block every subsequent phase. These are not features — they are the platform that makes features safe to ship. Doing them first means every subsequent phase can add tests and rely on Firestore rules enforcement.

**Delivers:** Jest configured with `jest-expo` + RNTL, one smoke test passing; Firestore rules tightened with tenant isolation and field-level constraints; `lib/constants/collections.ts` centralizing all collection name strings; `@sentry/react-native` initialized in `app/_layout.tsx` with `GlobalErrorBoundary`; NativeWind v5 pinned to exact preview version.

**Addresses:** Pitfalls 4 (test infra), 5 (Firestore rules), Minor 1 (NativeWind version), Minor 3 (collection name typos).

**Research flag:** Standard patterns — `jest-expo` setup is well-documented. Skip deeper research-phase; follow STACK.md configuration exactly.

### Phase 2: Checkout Discounts

**Rationale:** Discounts must be the first business feature because every downstream feature (split payment total validation, reports aggregation, receipt display) reads `ventas.descuento`. Shipping multi-payment before discounts means payment splits validate against wrong subtotals. The data model is ready; the service and UI are not.

**Delivers:** `DiscountPanel` bottom sheet (% and fixed modes); `useVentasStore` extended with `discountAmount`, `discountType`, `discountNote`; `completeVentaFlow` extended to accept and persist `descuento`, `descuento_tipo`, `descuento_nota`; receipt updated to show subtotal/descuento/total as three lines; `calculateDiscount()` utility with `Math.round()` enforced; unit tests for discount calculation edge cases (zero, cap at subtotal, float inputs).

**Addresses:** FEATURES.md Priority 1 items 2–3; Pitfall 3 (CLP float precision).

**Avoids:** Discount math in UI components; `Math.floor()` vs `Math.round()` ambiguity; discount stacking (one discount per sale, documented as policy).

**Research flag:** Standard patterns — Firestore field addition is non-breaking; bottom sheet integration is documented.

### Phase 3: Payment Method Picker and Split Payment

**Rationale:** Depends on Phase 2 because split payment validates `sum(pagos.monto) === total` — which is only meaningful after discounts are correctly applied and stored. The `CompleteVentaParams` interface must be redesigned before any UI work begins.

**Delivers:** Payment method picker in checkout flow; `PaymentSplitSheet` bottom sheet for multi-method splits; `useCheckoutStore` extended with `paymentSplits[]`; `completeVentaFlow` extended to loop `pagos[]` inside `runTransaction` (replaces hardcoded EFECTIVO); `PaymentSplitError` added to `lib/errors.ts`; change calculation (vuelto) display for cash payments; unit tests asserting payment sum validation.

**Addresses:** FEATURES.md Priority 1 item 1, Priority 2 item 5; Pitfall 2 (transaction atomicity).

**Avoids:** Writing any `ventas_pagos` document outside the main transaction; adding payment rows via standalone `addDoc`.

**Research flag:** Standard patterns — `runTransaction` loop pattern is established in ARCHITECTURE.md.

### Phase 4: Refund Hardening and Partial Refunds

**Rationale:** Full refund UX polish should precede partial refunds — partial refunds build on the same UI flow and share the same extended `refundVentaFlow`. The TOCTOU fix (Pitfall 1) is a prerequisite for partial refund correctness and must land in this phase before the partial refund service is written.

**Delivers:** TOCTOU fix in `refundVentaFlow` (pre-fetch IDs outside transaction, re-read data inside); `REEMBOLSO_PARCIAL` added to `VentaEstado` union; `ventas_reembolsos` collection created with Firestore rules; `PartialRefundSheet` item picker + quantity stepper; extended `refundVentaFlow` accepting `RefundVentaParams` with `tipo: 'TOTAL' | 'PARCIAL'` and `items[]`; partial amount validation (quantity bounds + total cap) in service before transaction; optimistic `useProductosStore` update after partial refund; unit tests asserting over-refund throws.

**Addresses:** FEATURES.md Priority 3 items 6–7; Pitfalls 1 (TOCTOU), Moderate 2 (refund amount validation).

**Avoids:** Modifying `ventas_detalle` on refund; storing refund items in a subcollection; mutating the original `ventas` document beyond `estado` and `updatedAt`.

**Research flag:** Partial — the `ventas_reembolsos` schema and transaction flow are fully specified in ARCHITECTURE.md (HIGH confidence). No additional research needed.

### Phase 5: Advanced Reports and Export

**Rationale:** Reports should come last because they aggregate data from all prior phases — discount amounts, payment method breakdowns, and partial refund quantities. Building reports before the data is being recorded correctly requires rework. The unbounded real-time listener (Moderate Pitfall 3) must be addressed here before export features amplify its cost.

**Delivers:** Period-scoped `onVentasByNegocio` query with composite Firestore index on `(negocio_id, fecha)`; `pagosMap` loading in `useResumenStore.subscribe()` mirroring `detallesMap` pattern; `selectRevenueSeries` and `selectPaymentMethodBreakdown` pure selector functions; discount summary in existing KPI grid; payment method breakdown visualization; `lib/services/reports/export.ts` with `exportVentasCSV()` and `exportVentasPDF()`; `ExportButton` component on history and resumen screens using `expo-sharing`.

**Addresses:** FEATURES.md Priority 4 items 8–10; Moderate Pitfall 3 (unbounded listener).

**Avoids:** Cloud Functions for aggregation; server-side rendering; adding charting libraries beyond existing `react-native-svg`.

**Research flag:** Standard patterns — selector pattern and `detallesMap` mirror are fully specified in ARCHITECTURE.md. Export follows the existing `generateAndShareRecibo` pattern.

### Phase Ordering Rationale

- Phase 1 (Foundations) is non-negotiable first because two of five critical pitfalls (rules, test infra) would otherwise corrupt every subsequent phase with unfixable technical debt.
- Phase 2 (Discounts) before Phase 3 (Payments) because payment split total validation depends on correct post-discount totals being passed from the service layer.
- Phase 3 (Payments) before Phase 5 (Reports) because `selectPaymentMethodBreakdown` requires real `ventas_pagos` data from split transactions.
- Phase 4 (Refunds) before Phase 5 (Reports) because report product-performance metrics must exclude refunded quantities; if reports ship first, selectors need rework when `ventas_reembolsos` lands.
- Partial refunds (Phase 4) are independent of discounts and payments architecturally, but benefit from the audited totals that Phase 2 establishes (refund amounts calculate correctly off the post-discount total).

### Research Flags

Phases needing deeper research during planning:

- **None of the 5 phases require additional research-phase.** All four research files provide HIGH-confidence, implementation-ready specifications grounded in direct codebase analysis. ARCHITECTURE.md specifies exact TypeScript interfaces, PITFALLS.md identifies exact line numbers, and FEATURES.md defines exact behavior expectations. The roadmapper can proceed directly to phase plans.

Phases with standard patterns (confirmed safe to skip research-phase):

- **All phases** — the research was derived from the actual codebase, not training data inference. Interface changes, collection schemas, and transaction patterns are all specified to implementation level.

The one area requiring validation during execution (not planning): `jest-expo` version alignment with Expo SDK 54. Use `npx expo install jest-expo` rather than a hardcoded version — it selects the correct peer dependency automatically.

## Confidence Assessment

| Area         | Confidence | Notes                                                                                                                                                                                               |
| ------------ | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Stack        | HIGH       | Existing stack from direct `package.json` inspection. New additions (`@gorhom/bottom-sheet`, `jest-expo`, Sentry) are MEDIUM on exact version numbers — use `npx expo install` for correct versions |
| Features     | HIGH       | Current state gaps derived from direct codebase analysis of `completeVentaFlow`, `refundVentaFlow`, and Zustand stores. Behavior expectations match Chilean SME POS conventions                     |
| Architecture | HIGH       | All schemas, interfaces, and transaction patterns derived from actual source files. `ventas_reembolsos` schema and `CompleteVentaParams` extension are fully specified                              |
| Pitfalls     | HIGH       | Critical pitfalls include exact file paths and line numbers from the codebase. No speculative risks — all grounded in actual code                                                                   |

**Overall confidence:** HIGH

### Gaps to Address

- **`jest-expo` version pinning:** Do not hardcode a version. Run `npx expo install jest-expo` and check the jest-expo README for the current `setupFilesAfterFramework` key name — it may have changed between SDK versions.
- **Maestro version:** Verify Maestro is still actively maintained at mobile.dev before committing to it for E2E. If support has lapsed, evaluate Detox with New Architecture patches.
- **`@gorhom/bottom-sheet` Reanimated 4 compatibility:** Verify v5 explicitly supports Reanimated 4.x before installing. The training data confidence is MEDIUM here — confirm via the library's README.
- **Android `expo-print` permissions:** Test receipt generation on a physical Android device before the checkout polish phase ships — silent failure is the risk pattern.
- **Firestore composite index deployment:** The `(negocio_id, fecha)` index for Phase 5 must be deployed via `firestore.indexes.json` before the period-scoped query lands in production.

## Sources

### Primary (HIGH confidence — direct codebase analysis)

- `lib/services/ventas/complete-venta.ts` — transaction pattern, hardcoded EFECTIVO, `CompleteVentaParams` interface
- `lib/services/ventas/refund-venta.ts` — TOCTOU pattern (lines 34–39), `RefundVentaParams` interface
- `lib/services/ventas/index.ts` — unbounded `onVentasByNegocio` listener
- `interface/ventas/index.ts` — `descuento: number`, `VentaEstado` union, `Venta` shape
- `interface/ventas-pagos/index.ts` — `MetodoPago` type, `VentaPago` shape
- `store/resumen-store.ts` — `detallesMap` pattern, selector functions, `useMemo` aggregation
- `store/ventas-store.ts` — cart state, `clearCart()` lifecycle
- `store/checkout-store.ts` — `closeSuccess` does not clear cart
- `app/(tabs)/history/index.tsx` — refund UI, optimistic stock update pattern
- `firestore.rules` — permissive update rules, `// Ajustar según roles` TODOs
- `package.json` — exact installed versions, absence of test devDependencies

### Secondary (MEDIUM confidence — training data aligned with codebase patterns)

- `@gorhom/bottom-sheet` v5 New Architecture support — widely documented in 2024-2025 React Native community
- Maestro vs Detox recommendation — Detox New Architecture friction documented; Maestro DX advantage for Expo projects
- `@sentry/react-native` Expo plugin pattern — stable pattern; exact version number (v6) may be higher as of 2026
- Firebase transaction reads-before-writes constraint — official Firebase documentation, consistent with observed codebase pattern

### Tertiary (requires validation during execution)

- `jest-expo` exact version for SDK 54 — use `npx expo install` to resolve
- Maestro current maintenance status — verify at mobile.dev before committing
- NativeWind v5 preview changelog between preview.2 and any later preview — pin exact version to prevent silent breaks

---

_Research completed: 2026-03-03_
_Ready for roadmap: yes_
