# Roadmap: La Pape — Production Polish Milestone

## Overview

This milestone takes La Pape from a working core POS to a production-ready system. The existing foundation is solid — auth, catalog, checkout, history, and analytics all work. The work here fills four concrete feature gaps (discounts, refund hardening, advanced reports, UI polish) while establishing the platform that makes them safe to ship: hardened Firestore security rules, a test infrastructure that currently does not exist, and error monitoring. Phases execute in strict dependency order: foundations first, then discount math, then payment integration, then refunds, then reports — because each phase produces data that the next phase consumes or validates against.

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundations** - Security rules, test infrastructure, error monitoring, and bottom sheet compatibility
- [ ] **Phase 2: Checkout Discounts** - Percentage and fixed-amount discounts applied at checkout and persisted to Firestore
- [ ] **Phase 3: Refund Hardening** - TOCTOU fix, full refund UX polish, and partial line-item refunds
- [ ] **Phase 4: Advanced Reports and Export** - Revenue chart, CSV export, and period-scoped queries
- [ ] **Phase 5: UI Polish** - Consistent design tokens, error boundaries on all screens, and loading skeletons

## Phase Details

### Phase 1: Foundations

**Goal**: The platform is safe and observable — security rules isolate tenants, tests can catch regressions, and crashes surface in Sentry instead of silently failing users
**Depends on**: Nothing (first phase)
**Requirements**: FOUND-01, FOUND-02, FOUND-03, FOUND-04
**Success Criteria** (what must be TRUE):

1. A user authenticated to negocio A cannot read or write any document belonging to negocio B — rejected at the Firestore rules layer with a permission-denied error
2. Running `npx jest` produces at least one passing smoke test without manual configuration workarounds
3. When an unhandled JavaScript error occurs anywhere in the app, the screen shows a recovery message rather than going blank, and the exception appears in the Sentry dashboard
4. The bottom sheet library (@gorhom/bottom-sheet) renders without errors on both iOS/Android New Architecture and web
   **Plans**: TBD

### Phase 2: Checkout Discounts

**Goal**: A cashier can apply a percentage or fixed-amount discount to the cart total before completing a sale, and the discount is stored correctly in Firestore with no float drift
**Depends on**: Phase 1
**Requirements**: DISC-01, DISC-02, DISC-03, DISC-04, DISC-05
**Success Criteria** (what must be TRUE):

1. Cashier can open a discount panel at checkout, enter a percentage (e.g. 10%), and see the cart total update to the discounted amount before confirming the sale
2. Cashier can enter a fixed CLP amount discount (e.g. $500) and see the discounted subtotal and savings amount displayed in the cart
3. Cashier can apply a discount to a single product line in the cart independently of any cart-level discount
4. Completed sale records in Firestore store the discounted total as an integer — no float values appear in the descuento or total fields
5. The receipt displayed after a sale shows subtotal, discount amount, and final total as three distinct lines
   **Plans**: TBD

### Phase 3: Refund Hardening

**Goal**: A cashier can issue a full or partial refund on any completed sale with confidence that the operation is atomic, stock is restored correctly, and the TOCTOU race condition cannot corrupt refund data
**Depends on**: Phase 1
**Requirements**: REFN-01, REFN-02, REFN-03, REFN-04
**Success Criteria** (what must be TRUE):

1. Attempting to refund a sale that has already been refunded by another session simultaneously does not produce a corrupted state — one refund succeeds, the other is rejected cleanly
2. Cashier can tap a completed sale in history, confirm a full refund, and see the sale marked as refunded with a clear success state — the button is disabled after refund to prevent double-refund
3. Cashier can open a past sale, select specific line items and quantities to partially refund, and confirm — only the selected items are refunded
4. After a partial refund, a ventas_reembolsos document exists in Firestore with the refunded items, and product stock is restored only for the refunded quantities
   **Plans**: TBD

### Phase 4: Advanced Reports and Export

**Goal**: A business owner can view revenue trends over time and export sales data for the selected period — with queries scoped by date range so performance does not degrade as transaction history grows
**Depends on**: Phase 2, Phase 3
**Requirements**: REPT-01, REPT-02
**Success Criteria** (what must be TRUE):

1. The resumen screen shows a revenue-over-time chart that the user can toggle between daily, weekly, and monthly views — the chart data matches the selected period filter
2. User can tap an export button on the history or resumen screen and receive a CSV file via the device share sheet containing the sales data for the selected period
3. Querying sales history for a large negocio does not load unbounded data — queries are scoped to the selected period via the (negocio_id, fecha) Firestore index
   **Plans**: TBD

### Phase 5: UI Polish

**Goal**: Every screen in the app presents a consistent visual experience — no one-off spacing values, no blank crash screens, and no raw data shown during load — so the app feels production-ready to any new user
**Depends on**: Phase 1
**Requirements**: UIPOL-01, UIPOL-02, UIPOL-03
**Success Criteria** (what must be TRUE):

1. Opening any screen in the app shows consistent spacing, typography weight, and color usage — no screen has different padding values or font sizes than adjacent screens
2. Forcing an error on any screen (e.g. bad network) shows a recovery message with a retry action, not a blank screen or uncaught exception
3. Navigating to any data-loading screen (products list, history, resumen) while Firestore is loading shows a skeleton or spinner — no flash of empty content
   **Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase                          | Plans Complete | Status      | Completed |
| ------------------------------ | -------------- | ----------- | --------- |
| 1. Foundations                 | 0/TBD          | Not started | -         |
| 2. Checkout Discounts          | 0/TBD          | Not started | -         |
| 3. Refund Hardening            | 0/TBD          | Not started | -         |
| 4. Advanced Reports and Export | 0/TBD          | Not started | -         |
| 5. UI Polish                   | 0/TBD          | Not started | -         |
